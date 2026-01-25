"use client";

import React, { useMemo, useState } from "react";

/**
 * Pickle Punks — Ethscriptions Image Mint + Decode/Download (SINGLE FILE)
 *
 * ✅ Upload image (PNG/JPG/WebP)
 * ✅ Max upload: 128 KB (configurable)
 * ✅ Build data URI: data:image/...;base64,...
 * ✅ Mint via calldata: tx.data = hex(utf8(dataUri))
 *
 * ✅ Decode + Download from TX Hash:
 * - Fetch tx via public RPC: eth_getTransactionByHash
 * - Decode: hex -> utf8 -> parse data URI -> base64 -> bytes
 * - Download reconstructed file
 *
 * IMPORTANT:
 * - This file intentionally DOES NOT declare global Window.ethereum types
 *   because your repo already has an ethereum type declared elsewhere,
 *   and TypeScript throws “Subsequent property declarations…” if we redeclare it.
 *
 * Vercel Env Var required for decode:
 * - NEXT_PUBLIC_ETH_RPC_URL = Mainnet RPC endpoint (Alchemy/Infura/QuickNode)
 */

const TEST_MODE = true;
const TEST_TO_ENS = "bitbrains.eth";

// Upload limit
const MAX_FILE_KB = 128;
const MAX_FILE_BYTES = MAX_FILE_KB * 1024;

// Safer gas for calldata
const GAS_LIMIT = "0x30D40"; // 200,000

// Public RPC for decoding
const RPC_URL = process.env.NEXT_PUBLIC_ETH_RPC_URL || "";

/* ===================== Helpers ===================== */

function shorten(addr: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function bytesToKB(n: number) {
  return (n / 1024).toFixed(1);
}

function utf8ToHex(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let hex = "0x";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

function hexToUtf8(hex: string): string {
  const h = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(h.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  }
  return new TextDecoder().decode(bytes);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function safeExtFromMime(mime: string) {
  const m = (mime || "").toLowerCase();
  if (m.includes("png")) return "png";
  if (m.includes("jpeg") || m.includes("jpg")) return "jpg";
  if (m.includes("webp")) return "webp";
  return "bin";
}

function downloadBytes(bytes: Uint8Array, mime: string, filename: string) {
  // Build-safe: convert Uint8Array to a real ArrayBuffer slice
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

  const blob = new Blob([buffer], { type: mime || "application/octet-stream" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

async function rpc(method: string, params: any[]) {
  if (!RPC_URL) throw new Error("Missing NEXT_PUBLIC_ETH_RPC_URL (add in Vercel env vars).");

  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });

  if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);

  const json = await res.json();
  if (json.error) throw new Error(json.error.message || "RPC error");
  return json.result;
}

/* ===================== UI ===================== */

function Button(props: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      style={{
        padding: "12px 16px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.22)",
        background: "rgba(255,255,255,0.08)",
        color: "white",
        fontWeight: 900,
        letterSpacing: 0.4,
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.5 : 1,
        width: "100%",
        maxWidth: 420,
      }}
    >
      {props.children}
    </button>
  );
}

/* ===================== Page ===================== */

export default function PicklePunksMintPage() {
  const [account, setAccount] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  // Upload
  const [fileName, setFileName] = useState("");
  const [fileBytes, setFileBytes] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dataUri, setDataUri] = useState("");

  // Mint result
  const [txHash, setTxHash] = useState("");

  // Decode
  const [decodeTx, setDecodeTx] = useState("");
  const [decodeStatus, setDecodeStatus] = useState("");
  const [decodeError, setDecodeError] = useState("");

  const toAddress = useMemo(() => (TEST_MODE ? TEST_TO_ENS : account), [account]);

  async function connectWallet() {
    try {
      setError("");
      setStatus("");

      const eth = (window as any).ethereum;
      if (!eth?.request) {
        setError("Wallet not found. Install MetaMask.");
        return;
      }

      const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
      if (accounts?.[0]) {
        setAccount(accounts[0]);
        setStatus("Wallet connected.");
      } else {
        setError("No account returned.");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to connect wallet.");
    }
  }

  async function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setError("");
      setStatus("");
      setTxHash("");
      setDecodeStatus("");
      setDecodeError("");

      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file (PNG/JPG/WebP).");
        return;
      }

      if (file.size > MAX_FILE_BYTES) {
        setError(`File too large: ${bytesToKB(file.size)} KB. Max is ${MAX_FILE_KB} KB.`);
        return;
      }

      setFileName(file.name);
      setFileBytes(file.size);

      const objUrl = URL.createObjectURL(file);
      setPreviewUrl(objUrl);

      // FileReader returns full data URI: data:image/...;base64,....
      const fullDataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.onload = () => resolve(String(reader.result || ""));
        reader.readAsDataURL(file);
      });

      setDataUri(fullDataUri);
      setStatus("Image loaded. Ready to mint.");
    } catch (e: any) {
      setError(e?.message || "Failed to load image.");
    }
  }

  async function mintEthscription() {
    try {
      setError("");
      setStatus("");
      setTxHash("");

      const eth = (window as any).ethereum;
      if (!eth?.request) {
        setError("Wallet not found.");
        return;
      }
      if (!account) {
        setError("Connect wallet first.");
        return;
      }
      if (!dataUri) {
        setError("Upload an image first.");
        return;
      }

      setStatus("Sending transaction… confirm in wallet.");

      const tx = await eth.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: toAddress,
            value: "0x0",
            gas: GAS_LIMIT,
            data: utf8ToHex(dataUri),
          },
        ],
      });

      setTxHash(String(tx));
      setStatus("Transaction submitted. Copy TX hash to decode/download.");
    } catch (e: any) {
      setError(e?.message || "Mint failed.");
    }
  }

  async function decodeAndDownload() {
    try {
      setDecodeError("");
      setDecodeStatus("");

      const hash = decodeTx.trim();
      if (!hash.startsWith("0x") || hash.length < 20) {
        setDecodeError("Paste a valid TX hash (starts with 0x…).");
        return;
      }

      setDecodeStatus("Fetching tx from RPC…");

      const tx = await rpc("eth_getTransactionByHash", [hash]);
      if (!tx?.input || tx.input === "0x") {
        setDecodeError("No input data on transaction.");
        setDecodeStatus("");
        return;
      }

      setDecodeStatus("Decoding hex → UTF-8…");

      const utf8 = hexToUtf8(String(tx.input));
      if (!utf8.startsWith("data:")) {
        setDecodeError("TX input is not a data: URI.");
        setDecodeStatus("");
        return;
      }

      if (!utf8.includes(";base64,")) {
        setDecodeError("This TX is not a base64 image (might be JSON text).");
        setDecodeStatus("");
        return;
      }

      const headerEnd = utf8.indexOf(";base64,");
      const mime = utf8.slice(5, headerEnd) || "application/octet-stream";
      const b64 = utf8.slice(headerEnd + ";base64,".length);

      setDecodeStatus("Decoding base64 → bytes…");

      const bytes = base64ToBytes(b64);
      const ext = safeExtFromMime(mime);
      const filename = `ethscription_${hash.slice(0, 10)}.${ext}`;

      downloadBytes(bytes, mime, filename);

      setDecodeStatus("Downloaded.");
    } catch (e: any) {
      setDecodeError(e?.message || "Decode/download failed.");
      setDecodeStatus("");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "white",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Banner */}
        <img
          src="/IMG_2082.jpeg"
          alt="Pickle Punks"
          style={{
            width: "100%",
            borderRadius: 18,
            border: "3px solid rgba(202,162,74,0.9)",
            marginBottom: 18,
          }}
        />

        <div style={{ textAlign: "center", fontWeight: 900, fontSize: 22, letterSpacing: 2 }}>
          ETHSCRIPTIONS IMAGE TEST (CALLDATA)
        </div>

        <p style={{ textAlign: "center", opacity: 0.8, marginTop: 8 }}>
          Max upload: <b>{MAX_FILE_KB} KB</b> • Destination:{" "}
          <b>{TEST_MODE ? TEST_TO_ENS : "sender wallet"}</b>
        </p>

        {!RPC_URL && (
          <p style={{ textAlign: "center", color: "#ffcf70", marginTop: 10 }}>
            Decoder requires Vercel env var: <b>NEXT_PUBLIC_ETH_RPC_URL</b>
          </p>
        )}

        {/* Step 1 */}
        <h3 style={{ marginTop: 26 }}>Step 1 — Connect Wallet</h3>
        {account ? (
          <p>
            Connected: <b>{shorten(account)}</b>
          </p>
        ) : (
          <Button onClick={connectWallet}>Connect Wallet</Button>
        )}

        {/* Step 2 */}
        <h3 style={{ marginTop: 22 }}>Step 2 — Upload Image</h3>
        <div
          style={{
            padding: 14,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 8 }}>
            Upload (PNG/JPG/WebP) — Max {MAX_FILE_KB} KB
          </div>

          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onSelectFile}
            style={{ width: "100%", marginBottom: 10 }}
          />

          {fileName && (
            <div style={{ opacity: 0.85, fontSize: 14 }}>
              File: <b>{fileName}</b> • Size: <b>{bytesToKB(fileBytes)} KB</b>
            </div>
          )}

          {previewUrl && (
            <div style={{ marginTop: 12 }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  width: 160,
                  height: 160,
                  objectFit: "cover",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              />
            </div>
          )}

          <div style={{ marginTop: 12, fontWeight: 800 }}>Payload Preview (data URI minted)</div>
          <div style={{ opacity: 0.8, fontSize: 12, wordBreak: "break-word", marginTop: 6 }}>
            {dataUri ? dataUri : "(no image loaded yet)"}
          </div>
        </div>

        {/* Step 3 */}
        <h3 style={{ marginTop: 22 }}>Step 3 — Mint Ethscription</h3>
        <Button onClick={mintEthscription} disabled={!account || !dataUri}>
          Mint Ethscription (Image)
        </Button>

        {txHash && (
          <p style={{ marginTop: 12 }}>
            TX:{" "}
            <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">
              {txHash}
            </a>
          </p>
        )}

        {status && <p style={{ marginTop: 12, opacity: 0.85 }}>{status}</p>}
        {error && <p style={{ marginTop: 12, color: "#ff8080" }}>{error}</p>}

        {/* Decode */}
        <h3 style={{ marginTop: 30 }}>Decode & Download From TX Hash</h3>
        <div
          style={{
            padding: 14,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <div style={{ opacity: 0.85, marginBottom: 10 }}>
            Paste a TX hash minted via calldata. This tool pulls tx.input, decodes it, and downloads
            the image.
          </div>

          <input
            value={decodeTx}
            onChange={(e) => setDecodeTx(e.target.value)}
            placeholder="0x..."
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(0,0,0,0.35)",
              color: "white",
              marginBottom: 12,
            }}
          />

          <Button onClick={decodeAndDownload} disabled={!decodeTx.trim()}>
            Download Decoded File
          </Button>

          {decodeStatus && <p style={{ marginTop: 12, opacity: 0.85 }}>{decodeStatus}</p>}
          {decodeError && <p style={{ marginTop: 12, color: "#ff8080" }}>{decodeError}</p>}
        </div>

        <p style={{ marginTop: 18, opacity: 0.6 }}>
          This page is your test harness: upload → mint → decode → download.
        </p>

        <p style={{ marginTop: 10, opacity: 0.65 }}>
          Commit message: <b>fix: remove ethereum global type redeclare; add image mint + decode tool</b>
        </p>
      </div>
    </main>
  );
}
