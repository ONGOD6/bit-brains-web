"use client";

import React, { useEffect, useMemo, useState } from "react";

/**
 * Pickle Punks — Ethscriptions Mint (Option A)
 * ✅ Next.js 14 / Vercel build-safe (NO global Window.ethereum redeclare)
 * ✅ Mobile MetaMask friendly
 * ✅ Mints DIRECT data URLs so ethscriptions.com renders + shows in wallet profile
 *
 * IMPORTANT:
 * - For images, we send payload = data:image/*;base64,...
 * - For text, we send payload = data:text/plain;charset=utf-8,...
 */

type EthereumProvider = {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
};

/* ================= CONFIG ================= */
const MINTING_ENABLED = true;

// ⚠️ Best practice: use a NORMAL-LOOKING EOA sink (not 0xdead / not 0x000..001)
// Put any real address here (ideally one you control).
const SINK_TO_ADDRESS = "0x0000000000000000000000000000000000000001";

// Safety cap (calldata). Keep conservative for mobile.
const MAX_DATA_BYTES = 110_000;

// Banner image in /public
const BANNER_SRC = "/IMG_2082.jpeg";

/* ================= HELPERS ================= */
function getEthereum(): EthereumProvider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as any).ethereum as EthereumProvider | undefined;
}

function shorten(addr: string): string {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function bytesLengthFromDataUrl(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  if (comma === -1) return 0;
  const b64 = dataUrl.slice(comma + 1);
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - padding;
}

function toHexData(utf8: string): string {
  const enc = new TextEncoder();
  const bytes = enc.encode(utf8);
  let hex = "0x";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

// Build payload that Ethscriptions actually renders
function buildPayloadImage(dataUrl: string): string {
  return dataUrl;
}

function buildPayloadText(text: string): string {
  return "data:text/plain;charset=utf-8," + encodeURIComponent(text);
}

export default function PicklePunksMintPage() {
  const [account, setAccount] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [mode, setMode] = useState<"image" | "text">("image");

  const [fileName, setFileName] = useState<string>("");
  const [dataUrl, setDataUrl] = useState<string>("");
  const [dataBytes, setDataBytes] = useState<number>(0);

  const [text, setText] = useState<string>("");

  const payload = useMemo(() => {
    if (mode === "image") {
      if (!dataUrl) return "";
      return buildPayloadImage(dataUrl);
    }
    if (!text.trim()) return "";
    return buildPayloadText(text.trim());
  }, [mode, dataUrl, text]);

  const payloadHex = useMemo(() => {
    if (!payload) return "";
    return toHexData(payload);
  }, [payload]);

  useEffect(() => {
    const eth = getEthereum();
    if (!eth?.on) return;

    const onAccountsChanged = (accs: any) => {
      const a = Array.isArray(accs) && accs.length ? String(accs[0]) : "";
      setAccount(a);
    };

    eth.on("accountsChanged", onAccountsChanged);
    return () => {
      eth.removeListener?.("accountsChanged", onAccountsChanged);
    };
  }, []);

  async function connectWallet() {
    setError("");
    setStatus("");

    const eth = getEthereum();
    if (!eth) {
      setError("MetaMask not detected. Open this page inside MetaMask browser.");
      return;
    }

    try {
      const accs = (await eth.request({ method: "eth_requestAccounts" })) as any[];
      const a = Array.isArray(accs) && accs.length ? String(accs[0]) : "";
      setAccount(a);
      setStatus("Wallet connected.");
    } catch (e: any) {
      setError(e?.message || "Wallet connect failed.");
    }
  }

  async function onChooseFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    setStatus("");
    setDataUrl("");
    setFileName("");
    setDataBytes(0);

    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setDataUrl(result);

      if (!result.startsWith("data:image/")) {
        setError("File must be an image (png/jpg/webp).");
        return;
      }

      const bytes = bytesLengthFromDataUrl(result);
      setDataBytes(bytes);

      if (bytes > MAX_DATA_BYTES) {
        setError(
          `Image too large for reliable calldata minting on mobile (~${bytes.toLocaleString()} bytes). Try compressing or smaller size (target < ${MAX_DATA_BYTES.toLocaleString()} bytes).`
        );
        return;
      }

      setStatus("Image loaded (ready to mint).");
    };
    reader.onerror = () => setError("Failed reading file.");
    reader.readAsDataURL(file);
  }

  async function mintOptionA() {
    setError("");
    setStatus("");

    if (!MINTING_ENABLED) {
      setError("Minting is currently disabled.");
      return;
    }

    const eth = getEthereum();
    if (!eth) {
      setError("MetaMask not detected. Open inside MetaMask browser.");
      return;
    }
    if (!account) {
      setError("Connect your wallet first.");
      return;
    }
    if (!payload || !payloadHex) {
      setError(mode === "image" ? "Upload an image first." : "Enter text first.");
      return;
    }

    if (mode === "image") {
      if (!dataUrl.startsWith("data:image/")) {
        setError("Invalid image data URL.");
        return;
      }
      if (dataBytes > MAX_DATA_BYTES) {
        setError("Image too large for mobile calldata minting.");
        return;
      }
    }

    setBusy(true);
    setStatus("Opening MetaMask… confirm the transaction.");
    try {
      const txHash = await eth.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: SINK_TO_ADDRESS,
            value: "0x0",
            data: payloadHex,
          },
        ],
      });

      setStatus(`Submitted: ${String(txHash)}`);
    } catch (e: any) {
      setError(e?.message || "Transaction failed.");
      setStatus("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#070707",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        padding: "24px 14px 60px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 520 }}>
        {/* Banner */}
        <div
          style={{
            width: "100%",
            borderRadius: 18,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset",
            marginBottom: 18,
          }}
        >
          <img
            src={BANNER_SRC}
            alt="Pickle Punks"
            style={{ width: "100%", display: "block" }}
          />
        </div>

        <div
          style={{
            textAlign: "center",
            fontWeight: 900,
            fontSize: 22,
            letterSpacing: 2,
            marginBottom: 10,
          }}
        >
          MINTING MARCH 1
        </div>

        <div
          style={{
            marginBottom: 14,
            padding: "14px 16px",
            borderRadius: 14,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.12)",
            lineHeight: 1.55,
            fontSize: "0.95rem",
          }}
        >
          <strong>🧪 Open Community Test</strong>
          <br />
          This Ethscriptions mint is open for public testing until{" "}
          <strong>one week before the Pickle Punks mint (March 1)</strong>.
          <br />
          <br />
          • Only <strong>one Ethscription</strong> can be minted per transaction
          <br />
          • All Ethscriptions are <strong>immutable</strong> and{" "}
          <strong>indexed & viewable on ethscriptions.com</strong>
          <br />
          • Test responsibly — on-chain data is permanent
        </div>

        <section
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 18,
            padding: 18,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 24, letterSpacing: 0.2 }}>
            Pickle Punks — Ethscriptions Mint
          </h1>

          <p style={{ marginTop: 8, marginBottom: 14, opacity: 0.8, lineHeight: 1.4 }}>
            Mint an Ethscription via calldata (Option A). This version mints <b>direct</b> data URLs so
            ethscriptions.com renders and shows it in your profile.
          </p>

          {/* ===== WHAT YOU ARE MINTING ===== */}
          <div style={{ marginBottom: 18, opacity: 0.88, lineHeight: 1.65 }}>
            <strong>What you are minting</strong>
            <br /><br />

            <b>Pickle Punks</b> is a <b>5,000</b> supply collection designed as a
            <b> hybrid dual-rail mint</b>.
            <br /><br />

            • <b>ERC-721 Pickle Punk NFT</b> — the primary collectible held in your wallet
            <br />
            • <b>Image-mirrored Ethscription</b> — the <em>same artwork</em> is recorded immutably
            as calldata (<code>data:image/*;base64</code>) and indexed by ethscriptions.com
            <br /><br />

            <b>ENS identity rail:</b> Pickle Punks integrate ENS as a canonical identity layer,
            enabling verifiable routing, attribution, and continuity across future protocol phases.
            <br /><br />

            <span style={{ opacity: 0.75 }}>
              This section describes mint structure only. No guarantees of future utility,
              rewards, or outcomes are expressed or implied.
            </span>
          </div>

          {/* ===== MINT PHASES ===== */}
<div style={{ marginBottom: 18, opacity: 0.85, lineHeight: 1.65 }}>
  <strong>Pickle Punks Mint Phases</strong>
  <br /><br />

  The Pickle Punks collection is released across <b>three distinct mint phases</b>:
  <br /><br />

  <b>Phase 1 — Genesis (March 1)</b>
  <br />
  • 1,500 Pickle Punks — <b>Headshots</b>
  <br /><br />

  <b>Phase 2 — Expansion (August 1)</b>
  <br />
  • 1,500 Pickle Punks — <b>Full-body</b>
  <br /><br />

  <b>Phase 3 — Completion (November 1)</b>
  <br />
  • 2,000 Pickle Punks — <b>Full-body</b>
  <br /><br />

  <span style={{ opacity: 0.75 }}>
    Each phase represents a separate mint window. Supply is fixed per phase and
    does not roll over between phases.
  </span>
</div>
          
          
          {/* ===== EVERYTHING BELOW IS YOUR ORIGINAL PAGE, UNCHANGED ===== */}

          {/* Mode Toggle */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <button
              onClick={() => {
                setMode("image");
                setError("");
                setStatus("");
              }}
              disabled={busy}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.14)",
                background: mode === "image" ? "#17263a" : "#101822",
                color: "#fff",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Image
            </button>
            <button
              onClick={() => {
                setMode("text");
                setError("");
                setStatus("");
              }}
              disabled={busy}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.14)",
                background: mode === "text" ? "#17263a" : "#101822",
                color: "#fff",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Text
            </button>
          </div>

          {/* Step 1 */}
          <div
            style={{
              padding: "14px 14px 10px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(0,0,0,0.25)",
              marginBottom: 12,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Step 1 — Connect Wallet</div>

            <button
              onClick={connectWallet}
              disabled={busy}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "#101822",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {account ? `Connected: ${shorten(account)}` : "Connect MetaMask"}
            </button>
          </div>

          {/* Step 2 */}
          <div
            style={{
              padding: "14px 14px 10px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(0,0,0,0.25)",
              marginBottom: 12,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 10 }}>
              Step 2 — {mode === "image" ? "Upload Image" : "Enter Text"}
            </div>

            {mode === "image" ? (
              <>
                <label
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={onChooseFile}
                    disabled={busy}
                    style={{ color: "#fff" }}
                  />
                  {fileName ? (
                    <span style={{ opacity: 0.85, fontSize: 13 }}>
                      {fileName} ({dataBytes.toLocaleString()} bytes)
                    </span>
                  ) : (
                    <span style={{ opacity: 0.6, fontSize: 13 }}>PNG / JPG / WEBP</span>
                  )}
                </label>

                {dataUrl ? (
                  <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
                    <img
                      src={dataUrl}
                      alt="Preview"
                      style={{
                        width: 240,
                        height: 240,
                        objectFit: "cover",
                        borderRadius: 16,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.02)",
                      }}
                    />
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={busy}
                  placeholder="Enter the text you want to etchscribe..."
                  style={{
                    width: "100%",
                    minHeight: 120,
                    resize: "vertical",
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "#0b0f15",
                    color: "#fff",
                    outline: "none",
                    fontSize: 14,
                    lineHeight: 1.4,
                  }}
                />
                <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                  Tip: keep it short for mobile stability. This mints as <code>data:text/plain</code>.
                </div>
              </>
            )}
          </div>

          {/* Step 3 */}
          <div
            style={{
              padding: "14px 14px 10px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(0,0,0,0.25)",
              marginBottom: 6,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Step 3 — Mint</div>

            <button
              onClick={mintOptionA}
              disabled={busy || !account || (mode === "image" ? !dataUrl : !text.trim())}
              style={{
                width: "100%",
                padding: "14px 14px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.14)",
                background: busy ? "#1a1a1a" : "#17263a",
                color: "#fff",
                fontWeight: 800,
                cursor: busy ? "not-allowed" : "pointer",
              }}
            >
              {busy ? "Opening MetaMask…" : "Mint Ethscription (Option A)"}
            </button>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7, lineHeight: 1.35 }}>
              Sink: <span style={{ fontFamily: "monospace" }}>{SINK_TO_ADDRESS}</span>
              <br />
              Payload type: <b>{mode === "image" ? "data:image/*;base64" : "data:text/plain"}</b>
              <br />
              This is a 0 ETH tx with calldata (the payload). Ethscriptions indexers read the tx input.
            </div>
          </div>

          {status ? (
            <div
              style={{
                marginTop: 10,
                padding: 12,
                borderRadius: 12,
                background: "rgba(40,140,80,0.12)",
                border: "1px solid rgba(40,140,80,0.25)",
                color: "#d6ffe2",
                fontSize: 13,
                lineHeight: 1.4,
              }}
            >
              {status}
            </div>
          ) : null}

          {error ? (
            <div
              style={{
                marginTop: 10,
                padding: 12,
                borderRadius: 12,
                background: "rgba(180,40,40,0.12)",
                border: "1px solid rgba(180,40,40,0.25)",
                color: "#ffd6d6",
                fontSize: 13,
                lineHeight: 1.4,
              }}
            >
              {error}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
