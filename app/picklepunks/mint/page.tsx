"use client";

/**
 * Pickle Punks — Ethscriptions Image Mint (Single File, Vercel Safe)
 *
 * ✅ Upload image (PNG/JPG/WebP) with max size (default 128 KB)
 * ✅ Builds a canonical data:application/json,<urlencoded-json> payload
 * ✅ Mints via eth_sendTransaction with calldata (tx.data)
 * ✅ Uses a sink "to" address by default (avoids MetaMask "internal accounts cannot include data")
 * ✅ Hides payload preview (no giant text on screen)
 * ✅ Optional Advanced: Decode from TX hash -> reconstruct image + download
 *
 * COMMIT (use in GitHub): fix: vercel-safe image ethscription mint + tx decode (no payload preview)
 */

import React, { useCallback, useMemo, useState } from "react";

/* ================= CONFIG ================= */
const SITE_URL = "https://bitbrains.us";
const DEFAULT_MAX_KB = 128;

// Default sink address (safe for calldata tx; avoids MetaMask internal-account warning)
const DEFAULT_SINK_TO = "0x000000000000000000000000000000000000dEaD";

// Public RPC (client-side) for decoding tx input by hash
const DEFAULT_PUBLIC_RPC = "https://cloudflare-eth.com";

/* ================= HELPERS ================= */
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isHexAddress(v: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(v.trim());
}

function utf8ToHex(str: string): string {
  const enc = new TextEncoder().encode(str);
  let hex = "0x";
  // IMPORTANT: avoid for..of to keep TS build safe in some configs
  for (let i = 0; i < enc.length; i++) {
    const b = enc[i]!;
    hex += b.toString(16).padStart(2, "0");
  }
  return hex;
}

function hexToUtf8(hex: string): string {
  const h = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (h.length % 2 !== 0) return "";
  const bytes = new Uint8Array(h.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  }
  return new TextDecoder().decode(bytes);
}

function safeBytesOfHexData(hexData: string): number {
  if (!hexData || !hexData.startsWith("0x")) return 0;
  return Math.max(0, (hexData.length - 2) / 2);
}

function buildEthscriptionJsonDataUrl(imageDataUrl: string): string {
  // Canonical ethscriptions payload style (what you were seeing in "Payload Preview")
  // data:application/json,<URL-ENCODED JSON>
  const obj = {
    type: "bitbrains.ethscriptions.image",
    version: "1.0",
    image: imageDataUrl,
    site: SITE_URL,
    createdAt: new Date().toISOString(),
  };
  const json = JSON.stringify(obj);
  return `data:application/json,${encodeURIComponent(json)}`;
}

function extractImageDataUrlFromPayload(payloadDataUrl: string): string | null {
  // payloadDataUrl is expected:
  // data:application/json,<urlencoded-json>
  if (!payloadDataUrl.startsWith("data:application/json,")) return null;
  const encoded = payloadDataUrl.slice("data:application/json,".length);
  try {
    const jsonStr = decodeURIComponent(encoded);
    const parsed = JSON.parse(jsonStr);
    if (typeof parsed?.image === "string" && parsed.image.startsWith("data:image/")) {
      return parsed.image;
    }
    return null;
  } catch {
    return null;
  }
}

function downloadDataUrl(dataUrl: string, filename: string) {
  // Avoid Blob typing issues; data URLs can be downloaded directly.
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* ================= PAGE ================= */
export default function PicklePunksMintPage() {
  const [account, setAccount] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  // Upload
  const [maxKB, setMaxKB] = useState<number>(DEFAULT_MAX_KB);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [imageDataUrl, setImageDataUrl] = useState<string>("");

  // Destination
  const [useSinkTo, setUseSinkTo] = useState<boolean>(true);
  const [customTo, setCustomTo] = useState<string>("");

  // Advanced decode
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [rpcUrl, setRpcUrl] = useState<string>(DEFAULT_PUBLIC_RPC);
  const [txHash, setTxHash] = useState<string>("");
  const [decodedImageDataUrl, setDecodedImageDataUrl] = useState<string>("");

  const canUseEthereum = useMemo(() => {
    if (!isBrowser()) return false;
    return Boolean((window as any)?.ethereum?.request);
  }, []);

  const destinationTo = useMemo(() => {
    if (useSinkTo) return DEFAULT_SINK_TO;
    const v = customTo.trim();
    return isHexAddress(v) ? v : "";
  }, [useSinkTo, customTo]);

  const payloadDataUrl = useMemo(() => {
    if (!imageDataUrl) return "";
    return buildEthscriptionJsonDataUrl(imageDataUrl);
  }, [imageDataUrl]);

  const txDataHex = useMemo(() => {
    if (!payloadDataUrl) return "";
    return utf8ToHex(payloadDataUrl);
  }, [payloadDataUrl]);

  const txDataBytes = useMemo(() => safeBytesOfHexData(txDataHex), [txDataHex]);

  const connectWallet = useCallback(async () => {
    setStatus("");
    setAccount("");
    try {
      if (!canUseEthereum) {
        setStatus("MetaMask / injected wallet not detected in this browser.");
        return;
      }
      const eth = (window as any).ethereum;
      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
      const a = accounts?.[0] || "";
      if (!a) {
        setStatus("No account returned.");
        return;
      }
      setAccount(a);
      setStatus("Wallet connected.");
    } catch (e: any) {
      setStatus(e?.message || "Failed to connect wallet.");
    }
  }, [canUseEthereum]);

  const onChooseFile = useCallback(
    async (file: File | null) => {
      setStatus("");
      setFileName("");
      setFileSize(0);
      setImageDataUrl("");
      if (!file) return;

      const maxBytes = Math.max(1, Math.floor((maxKB || DEFAULT_MAX_KB) * 1024));
      if (file.size > maxBytes) {
        setStatus(`File too large. Max ${maxKB} KB. Your file is ${(file.size / 1024).toFixed(1)} KB.`);
        return;
      }

      if (!file.type.startsWith("image/")) {
        setStatus("Please upload an image file (PNG/JPG/WebP).");
        return;
      }

      setFileName(file.name);
      setFileSize(file.size);

      // Read as data URL (already base64 under the hood)
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        if (!result.startsWith("data:image/")) {
          setStatus("Unexpected image encoding. Try a PNG/JPG/WebP.");
          return;
        }
        setImageDataUrl(result);
        setStatus("Image loaded.");
      };
      reader.onerror = () => setStatus("Failed to read file.");
      reader.readAsDataURL(file);
    },
    [maxKB]
  );

  const mintEthscription = useCallback(async () => {
    setStatus("");
    try {
      if (!canUseEthereum) {
        setStatus("MetaMask / injected wallet not detected in this browser.");
        return;
      }
      if (!account) {
        setStatus("Connect wallet first.");
        return;
      }
      if (!imageDataUrl) {
        setStatus("Upload an image first.");
        return;
      }
      if (!txDataHex) {
        setStatus("Missing tx data.");
        return;
      }
      if (!destinationTo) {
        setStatus("Invalid destination address. Use sink or enter a valid 0x address.");
        return;
      }

      // NOTE:
      // Ethscriptions attribution is based on `from` + `data`.
      // We use a sink `to` address to avoid MetaMask blocking calldata transfers to "internal accounts".
      setStatus("Opening MetaMask confirmation…");

      const eth = (window as any).ethereum;

      const txParams = {
        from: account,
        to: destinationTo,
        value: "0x0",
        data: txDataHex,
      };

      const txid: string = await eth.request({
        method: "eth_sendTransaction",
        params: [txParams],
      });

      setStatus(`Submitted: ${txid}`);
      setTxHash(txid);
    } catch (e: any) {
      setStatus(e?.message || "Mint failed.");
    }
  }, [account, canUseEthereum, destinationTo, imageDataUrl, txDataHex]);

  const decodeFromTxHash = useCallback(async () => {
    setStatus("");
    setDecodedImageDataUrl("");

    const h = txHash.trim();
    if (!/^0x[a-fA-F0-9]{64}$/.test(h)) {
      setStatus("Paste a valid transaction hash (0x… 64 hex chars).");
      return;
    }

    try {
      setStatus("Fetching transaction input…");
      const body = {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getTransactionByHash",
        params: [h],
      };

      const res = await fetch(rpcUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      const input = json?.result?.input;

      if (typeof input !== "string" || !input.startsWith("0x")) {
        setStatus("No tx input found (or RPC blocked it). Try another RPC.");
        return;
      }

      const payload = hexToUtf8(input);
      const img = extractImageDataUrlFromPayload(payload);

      if (!img) {
        setStatus("Could not parse an image from tx input. (Maybe it wasn’t an image payload.)");
        return;
      }

      setDecodedImageDataUrl(img);
      setStatus("Decoded image from tx input.");
    } catch (e: any) {
      setStatus(e?.message || "Decode failed (RPC/network).");
    }
  }, [rpcUrl, txHash]);

  const downloadOriginal = useCallback(() => {
    if (!imageDataUrl) return;
    const name = fileName ? fileName.replace(/\s+/g, "_") : "ethscription_image.png";
    downloadDataUrl(imageDataUrl, name);
  }, [imageDataUrl, fileName]);

  const downloadDecoded = useCallback(() => {
    if (!decodedImageDataUrl) return;
    downloadDataUrl(decodedImageDataUrl, "decoded_from_tx.png");
  }, [decodedImageDataUrl]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "#fff",
        padding: "2rem 1.25rem",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 720 }}>
        <h1 style={{ margin: 0, fontSize: 34, letterSpacing: 0.5 }}>Pickle Punks — Ethscriptions Mint</h1>
        <p style={{ opacity: 0.8, marginTop: 10, lineHeight: 1.4 }}>
          Upload an image (≤ {maxKB} KB), then mint via calldata. <br />
          <span style={{ opacity: 0.75 }}>
            Note: The “to” address is a sink; attribution comes from the sender + tx input.
          </span>
        </p>

        {/* STEP 1 */}
        <section style={{ marginTop: 26 }}>
          <h2 style={{ margin: "0 0 10px 0", fontSize: 26 }}>Step 1 — Connect Wallet</h2>
          <button
            onClick={connectWallet}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            {account ? "Connected" : "Connect MetaMask"}
          </button>
          {account ? (
            <div style={{ marginTop: 10, opacity: 0.85 }}>Connected: {account.slice(0, 6)}…{account.slice(-4)}</div>
          ) : null}
        </section>

        {/* STEP 2 */}
        <section style={{ marginTop: 28 }}>
          <h2 style={{ margin: "0 0 10px 0", fontSize: 26 }}>Step 2 — Upload Image</h2>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <label
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.06)",
                cursor: "pointer",
              }}
            >
              Choose File
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                style={{ display: "none" }}
                onChange={(e) => onChooseFile(e.target.files?.[0] || null)}
              />
            </label>

            <div style={{ opacity: 0.85 }}>
              Max:
              <input
                type="number"
                value={maxKB}
                min={1}
                step={1}
                onChange={(e) => setMaxKB(Number(e.target.value || DEFAULT_MAX_KB))}
                style={{
                  marginLeft: 8,
                  width: 90,
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                }}
              />{" "}
              KB
            </div>
          </div>

          {fileName ? (
            <div style={{ marginTop: 12, opacity: 0.9 }}>
              Loaded: <b>{fileName}</b> ({fileSize} bytes)
            </div>
          ) : null}

          {imageDataUrl ? (
            <div style={{ marginTop: 14 }}>
              <img
                src={imageDataUrl}
                alt="Preview"
                style={{
                  width: 220,
                  height: 220,
                  objectFit: "contain",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.03)",
                }}
              />
            </div>
          ) : null}
        </section>

        {/* STEP 3 */}
        <section style={{ marginTop: 28 }}>
          <h2 style={{ margin: "0 0 10px 0", fontSize: 26 }}>Step 3 — Mint</h2>

          <div style={{ marginBottom: 10, opacity: 0.85 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={useSinkTo}
                onChange={(e) => setUseSinkTo(e.target.checked)}
              />
              Use sink address (recommended)
            </label>

            {!useSinkTo ? (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>Custom “to” address (0x…)</div>
                <input
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  placeholder="0x..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.06)",
                    color: "#fff",
                  }}
                />
              </div>
            ) : (
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>
                Destination (sink): {DEFAULT_SINK_TO}
              </div>
            )}

            {txDataHex ? (
              <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>
                Calldata size: <b>{txDataBytes}</b> bytes (Ethscriptions max is ~90,000 bytes)
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={mintEthscription}
              disabled={!account || !imageDataUrl}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.15)",
                background: !account || !imageDataUrl ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.08)",
                color: "#fff",
                fontSize: 16,
                cursor: !account || !imageDataUrl ? "not-allowed" : "pointer",
              }}
            >
              Mint Ethscription (Calldata)
            </button>

            <button
              onClick={downloadOriginal}
              disabled={!imageDataUrl}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.15)",
                background: !imageDataUrl ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.08)",
                color: "#fff",
                fontSize: 16,
                cursor: !imageDataUrl ? "not-allowed" : "pointer",
              }}
            >
              Download Image (Original)
            </button>
          </div>

          {status ? (
            <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}>
              {status}
            </div>
          ) : null}
        </section>

        {/* ADVANCED */}
        <section style={{ marginTop: 28 }}>
          <button
            onClick={() => setShowAdvanced((v) => !v)}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            {showAdvanced ? "Hide" : "Show"} Advanced: Decode from TX Hash
          </button>

          {showAdvanced ? (
            <div style={{ marginTop: 12, padding: "14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>Public RPC (for reading tx input)</div>
              <input
                value={rpcUrl}
                onChange={(e) => setRpcUrl(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                }}
              />

              <div style={{ marginTop: 12, fontSize: 13, opacity: 0.75, marginBottom: 6 }}>Transaction Hash</div>
              <input
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="0x..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                }}
              />

              <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={decodeFromTxHash}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    fontSize: 15,
                    cursor: "pointer",
                  }}
                >
                  Decode TX Input
                </button>

                <button
                  onClick={downloadDecoded}
                  disabled={!decodedImageDataUrl}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: !decodedImageDataUrl ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.08)",
                    color: "#fff",
                    fontSize: 15,
                    cursor: !decodedImageDataUrl ? "not-allowed" : "pointer",
                  }}
                >
                  Download Decoded Image
                </button>
              </div>

              {decodedImageDataUrl ? (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 8 }}>Decoded Preview</div>
                  <img
                    src={decodedImageDataUrl}
                    alt="Decoded"
                    style={{
                      width: 220,
                      height: 220,
                      objectFit: "contain",
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        <div style={{ marginTop: 28, fontSize: 12, opacity: 0.6 }}>
          Tip: If MetaMask “doesn’t pop” on iOS, make sure you’re opening the site inside MetaMask’s in-app browser (not Safari),
          and you’re on Ethereum mainnet.
        </div>
      </div>
    </main>
  );
}
