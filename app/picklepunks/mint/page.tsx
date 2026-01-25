"use client";

import React, { useEffect, useMemo, useState } from "react";

/**
 * Pickle Punks — Ethscriptions Mint (Option A)
 * - ✅ Next.js 14 / Vercel build-safe (NO global Window.ethereum redeclare)
 * - ✅ Mobile MetaMask friendly
 * - ✅ Base64 JSON payload so Ethscriptions renders image correctly
 * - ✅ Clean UI with Pickle Punks banner
 */

type EthereumProvider = {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
};

/* ================= CONFIG ================= */
const MINTING_ENABLED = true;

// Option A sink (avoid 0x0…dEaD; MetaMask can flag as "internal account" on mobile)
const SINK_TO_ADDRESS = "0x0000000000000000000000000000000000000001";

// Safety cap: many wallets/providers refuse very large calldata
const MAX_DATA_BYTES = 110_000; // ~110 KB (image bytes, not whole JSON)

// Banner image (must exist in /public)
const BANNER_SRC = "/IMG_2082.jpeg";

/* ================= HELPERS ================= */
function getEthereum(): EthereumProvider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as any).ethereum as EthereumProvider | undefined;
}

function bytesLengthFromDataUrl(dataUrl: string): number {
  // data:image/png;base64,AAAA...
  const comma = dataUrl.indexOf(",");
  if (comma === -1) return 0;
  const b64 = dataUrl.slice(comma + 1);

  // Base64 -> bytes (approx): 3/4 of chars (minus padding)
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - padding;
}

// ✅ CRITICAL: base64-encode the JSON wrapper so Ethscriptions renders properly
function buildEthscriptionsPayload(dataUrl: string): string {
  const obj = {
    type: "picklepunks.ethscriptions.image",
    version: "1.0",
    image: dataUrl, // already data:image/*;base64,...
    createdAt: new Date().toISOString(),
    site: "https://www.bitbrains.us",
  };

  const json = JSON.stringify(obj);

  // UTF-8 safe base64
  const b64 =
    typeof window !== "undefined"
      ? btoa(unescape(encodeURIComponent(json)))
      : "";

  return "data:application/json;base64," + b64;
}

function toHexData(utf8: string): string {
  // Convert UTF-8 string to hex (0x...)
  const enc = new TextEncoder();
  const bytes = enc.encode(utf8);

  let hex = "0x";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

function shorten(addr: string): string {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

/* ================= PAGE ================= */
export default function PicklePunksMintPage() {
  const [account, setAccount] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  const [fileName, setFileName] = useState<string>("");
  const [dataUrl, setDataUrl] = useState<string>("");
  const [dataBytes, setDataBytes] = useState<number>(0);

  const payload = useMemo(() => {
    if (!dataUrl) return "";
    return buildEthscriptionsPayload(dataUrl);
  }, [dataUrl]);

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

    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setDataUrl(result);
      setDataBytes(bytesLengthFromDataUrl(result));

      if (!result.startsWith("data:image/")) {
        setError("File must be an image (png/jpg/webp).");
      } else {
        setStatus("Image loaded.");
      }
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
    if (!dataUrl || !payloadHex) {
      setError("Upload an image first.");
      return;
    }

    if (!dataUrl.startsWith("data:image/")) {
      setError("Invalid image data URL.");
      return;
    }

    if (dataBytes > MAX_DATA_BYTES) {
      setError(
        `Image too large for reliable calldata minting on mobile. Your image is ~${dataBytes.toLocaleString()} bytes. Try a smaller PNG (target < ${MAX_DATA_BYTES.toLocaleString()} bytes).`
      );
      return;
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

        {/* Card */}
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
            Upload an image to mint an Ethscription via calldata (Option A).
          </p>

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
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Step 2 — Upload Image</div>

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
              disabled={busy || !account || !dataUrl}
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
              Destination (sink):{" "}
              <span style={{ fontFamily: "monospace" }}>{SINK_TO_ADDRESS}</span>
              <br />
              Note: No payload preview is shown. We send a 0 ETH tx with calldata (your JSON payload),
              which is what Ethscriptions indexers read.
            </div>
          </div>

          {/* Status / Errors */}
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
