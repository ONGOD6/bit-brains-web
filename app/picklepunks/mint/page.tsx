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
 *
 * FIXES INCLUDED:
 * ✅ Text payload byte counting + size cap (like images)
 * ✅ Normalizes text for mobile stability (optional but recommended)
 * ✅ Hard-guards against empty calldata (prevents "0 ETH transfer" w/ no data)
 * ✅ Estimates gas and includes gas field (MetaMask mobile reliability boost)
 */

type EthereumProvider = {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
};

/* ================= CONFIG ================= */
const MINTING_ENABLED = true;

// Ethscriptions destination (standard)
const SINK_TO_ADDRESS = "0x0000000000000000000000000000000000000001";

// Safety cap (calldata). Keep conservative for mobile.
const MAX_DATA_BYTES = 110_000;

// Optional smaller cap for text (recommended for MetaMask mobile)
const MAX_TEXT_BYTES = 8_000;

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

function bytesLengthUtf8(s: string): number {
  const enc = new TextEncoder();
  return enc.encode(s).length;
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

/**
 * Text payload must be a valid data: URI.
 * IMPORTANT: We URL-encode the text content portion (safe + deterministic).
 * Mobile stability: we normalize newlines to spaces (optional).
 */
function normalizeTextForMint(raw: string): string {
  // Keeps meaning, reduces odd whitespace/newline issues in mobile wallets
  return raw.replace(/\r?\n+/g, " ").replace(/\s+/g, " ").trim();
}

function buildPayloadText(text: string): string {
  // Normalize for stability (recommended)
  const normalized = normalizeTextForMint(text);
  return "data:text/plain;charset=utf-8," + encodeURIComponent(normalized);
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
  const [textBytes, setTextBytes] = useState<number>(0);

  const payload = useMemo(() => {
    if (mode === "image") {
      if (!dataUrl) return "";
      return buildPayloadImage(dataUrl);
    }
    if (!text.trim()) return "";
    return buildPayloadText(text);
  }, [mode, dataUrl, text]);

  const payloadHex = useMemo(() => {
    if (!payload) return "";
    return toHexData(payload);
  }, [payload]);

  // Track text byte size (for guards + UX)
  useEffect(() => {
    if (mode !== "text") {
      setTextBytes(0);
      return;
    }
    if (!text.trim()) {
      setTextBytes(0);
      return;
    }
    const p = buildPayloadText(text);
    setTextBytes(bytesLengthUtf8(p));
  }, [mode, text]);

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

    // Validate payload presence
    if (!payload || !payloadHex) {
      setError(mode === "image" ? "Upload an image first." : "Enter text first.");
      return;
    }

    // HARD GUARD: prevent accidental empty calldata
    if (payloadHex === "0x") {
      setError("Missing calldata (tx.data). Ethscriptions require non-empty tx.data.");
      return;
    }

    // Enforce size caps
    if (mode === "image") {
      if (!dataUrl.startsWith("data:image/")) {
        setError("Invalid image data URL.");
        return;
      }
      if (dataBytes > MAX_DATA_BYTES) {
        setError("Image too large for mobile calldata minting.");
        return;
      }
    } else {
      // Text mode cap (stability)
      if (textBytes > MAX_TEXT_BYTES) {
        setError(
          `Text payload too large for reliable mobile minting (~${textBytes.toLocaleString()} bytes). Keep it shorter (target < ${MAX_TEXT_BYTES.toLocaleString()} bytes).`
        );
        return;
      }
    }

    setBusy(true);
    setStatus("Opening MetaMask… confirm the transaction.");
    try {
      const baseTx: any = {
        from: account,
        to: SINK_TO_ADDRESS,
        value: "0x0",
        data: payloadHex,
      };

      // Estimate gas (improves MetaMask mobile reliability)
      let gas: string | undefined;
      try {
        const est = await eth.request({
          method: "eth_estimateGas",
          params: [baseTx],
        });
        if (est) gas = String(est);
      } catch {
        // If estimation fails, we still try without explicit gas.
      }

      const txParams = gas ? [{ ...baseTx, gas }] : [baseTx];

      const txHash = await eth.request({
        method: "eth_sendTransaction",
        params: txParams,
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

          {/* Mode Toggle */}
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
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
                  Payload bytes: <b>{textBytes.toLocaleString()}</b> (target &lt;{" "}
                  {MAX_TEXT_BYTES.toLocaleString()})
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
              To: <span style={{ fontFamily: "monospace" }}>{SINK_TO_ADDRESS}</span>
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
