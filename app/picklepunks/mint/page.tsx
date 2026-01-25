"use client";

import React, { useMemo, useState } from "react";

/**
 * Pickle Punks — Ethscriptions Image Mint + Decode/Download (SINGLE FILE)
 *
 * ✅ Upload image (PNG/JPG/WebP)
 * ✅ Enforce MAX upload size (KB)
 * ✅ Convert to base64 Data URI automatically
 * ✅ Mint: 0 ETH tx with calldata = hex(utf8(dataUri))
 *
 * ✅ Decode/Download:
 * - Paste a TX hash
 * - This page calls Ethereum RPC directly:
 *   eth_getTransactionByHash -> tx.input (hex) -> hex->utf8 -> parse base64 -> bytes -> download
 *
 * IMPORTANT:
 * - Requires a PUBLIC RPC env var:
 *   NEXT_PUBLIC_ETH_RPC_URL = https://... (Alchemy/Infura/QuickNode mainnet)
 *
 * DESTINATION:
 * - TEST_MODE: to = bitbrains.eth
 * - PROD later: to = sender (account)
 */

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] | object }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}

/* ===================== FLAGS ===================== */
const ETHSCRIPTIONS_TESTING_ENABLED = true;
const TEST_MODE = true;

/* ===================== DESTINATION ===================== */
const TEST_TO_ENS = "bitbrains.eth";

/* ===================== LIMITS ===================== */
const MAX_FILE_KB = 128; // <-- your max upload in KB
const MAX_FILE_BYTES = MAX_FILE_KB * 1024;

/* ===================== CONSTANTS ===================== */
const BANNER_IMAGE = "/IMG_2082.jpeg";
const GAS_LIMIT_ETHSCRIPTION = "0x30D40"; // 200,000 (safe for image calldata)

/* ===================== RPC (PUBLIC) ===================== */
const PUBLIC_RPC_URL = process.env.NEXT_PUBLIC_ETH_RPC_URL || "";

/* ===================== HELPERS ===================== */
function shorten(addr: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
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

function bytesToKB(n: number) {
  return (n / 1024).toFixed(1);
}

function base64ToBytesBrowser(b64: string): Uint8Array {
  // Browser-safe base64 decoder
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function safeExtFromMime(mime: string) {
  const m = (mime || "").toLowerCase();
  if (m.includes("png")) return "png";
  if (m.includes("jpeg") || m.includes("jpg")) return "jpg";
  if (m.includes("webp")) return "webp";
  return "bin";
}

function downloadBytes(bytes: Uint8Array, mime: string, filename: string) {
  const blob = new Blob([bytes], { type: mime || "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function assertMainnetWallet() {
  if (!window.ethereum) throw new Error("Wallet not found.");
  const chainId = (await window.ethereum.request({ method: "eth_chainId" })) as string;
  if (chainId !== "0x1") throw new Error("Wrong network. Switch MetaMask to Ethereum Mainnet.");
}

async function rpcPublic(method: string, params: any[]) {
  if (!PUBLIC_RPC_URL) {
    throw new Error(
      "Missing NEXT_PUBLIC_ETH_RPC_URL. Add it in Vercel Env Vars, then redeploy."
    );
  }

  const res = await fetch(PUBLIC_RPC_URL, {
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
        padding: "12px 18px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.25)",
        background: "rgba(255,255,255,0.08)",
        color: "white",
        fontWeight: 800,
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

/* ===================== PAGE ===================== */
export default function PicklePunksMintPage() {
  const [account, setAccount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  // Upload state
  const [fileName, setFileName] = useState("");
  const [fileBytes, setFileBytes] = useState(0);
  const [dataUri, setDataUri] = useState(""); // this is what we mint
  const [previewUrl, setPreviewUrl] = useState(""); // object url preview

  // Decode/download state
  const [decodeTx, setDecodeTx] = useState("");
  const [decodeStatus, setDecodeStatus] = useState("");
  const [decodeError, setDecodeError] = useState("");

  const toAddress = useMemo(() => (TEST_MODE ? TEST_TO_ENS : account), [account]);

  async function connectWallet() {
    try {
      setError("");
      setStatus("");
      if (!window.ethereum) {
        setError("Wallet not found. Please install MetaMask.");
        return;
      }

      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (accounts?.[0]) {
        setAccount(accounts[0]);
        setStatus("Wallet connected.");
      } else {
        setError("No account returned from wallet.");
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

      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > MAX_FILE_BYTES) {
        setError(`File too large: ${bytesToKB(file.size)} KB. Max is ${MAX_FILE_KB} KB.`);
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file (PNG/JPG/WebP).");
        return;
      }

      setFileName(file.name);
      setFileBytes(file.size);

      // Preview URL
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

  async function mintImageEthscription() {
    try {
      setError("");
      setStatus("");
      setTxHash("");

      if (!ETHSCRIPTIONS_TESTING_ENABLED) {
        setError("Minting is disabled.");
        return;
      }

      if (!window.ethereum) {
        setError("Wallet not found. Please install MetaMask.");
        return;
      }

      if (!account) {
        setError("Connect your wallet first.");
        return;
      }

      await assertMainnetWallet();

      if (!dataUri) {
        setError("Upload an image first.");
        return;
      }

      const dataHex = utf8ToHex(dataUri);

      setStatus("Sending transaction… confirm in MetaMask.");

      const tx = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: toAddress,
            value: "0x0",
            gas: GAS_LIMIT_ETHSCRIPTION,
            data: dataHex,
          },
        ],
      });

      setTxHash(tx as string);
      setStatus("Transaction submitted. Copy the TX hash to decode/download.");
    } catch (e: any) {
      setError(e?.message || "Mint failed.");
    }
  }

  async function decodeAndDownload() {
    try {
      setDecodeError("");
      setDecodeStatus("");

      const hash = decodeTx.trim();
      if (!hash || !hash.startsWith("0x") || hash.length < 20) {
        setDecodeError("Paste a valid transaction hash (starts with 0x…).");
        return;
      }

      setDecodeStatus("Fetching transaction from RPC…");

      const tx = await rpcPublic("eth_getTransactionByHash", [hash]);
      if (!tx) {
        setDecodeError("Transaction not found.");
        setDecodeStatus("");
        return;
      }

      const inputHex: string = tx.input || "0x";
      if (inputHex === "0x" || inputHex.length < 4) {
        setDecodeError("No input data on tx.");
        setDecodeStatus("");
        return;
      }

      setDecodeStatus("Decoding hex → UTF-8 data URI…");
      const utf8 = hexToUtf8(inputHex);

      if (!utf8.startsWith("data:")) {
        setDecodeError("Tx input is not a data: URI.");
        setDecodeStatus("");
        return;
      }

      if (!utf8.includes(";base64,")) {
        setDecodeError("This TX is not a base64 image data URI (might be JSON).");
        setDecodeStatus("");
        return;
      }

      const headerEnd = utf8.indexOf(";base64,");
      const mime = utf8.slice(5, headerEnd) || "application/octet-stream";
      const b64 = utf8.slice(headerEnd + ";base64,".length);

      setDecodeStatus("Decoding base64 → bytes…");
      const bytes = base64ToBytesBrowser(b64);

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
        padding: 28,
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Banner */}
        <img
          src={BANNER_IMAGE}
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
          <br />
          Decoder uses: <b>NEXT_PUBLIC_ETH_RPC_URL</b>
        </p>

        {/* Wallet */}
        <h3 style={{ marginTop: 26 }}>Step 1 — Connect Wallet</h3>
        {account ? (
          <p>
            Connected: <b>{shorten(account)}</b>
          </p>
        ) : (
          <Button onClick={connectWallet}>Connect Wallet</Button>
        )}

        {/* Upload */}
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

          <div style={{ marginTop: 12, fontWeight: 800 }}>Payload Preview (what gets minted)</div>
          <div style={{ opacity: 0.8, fontSize: 12, wordBreak: "break-word", marginTop: 6 }}>
            {dataUri ? dataUri : "(no image loaded yet)"}
          </div>
        </div>

        {/* Mint */}
        <h3 style={{ marginTop: 22 }}>Step 3 — Mint Ethscription</h3>
        <Button onClick={mintImageEthscription} disabled={!account || !dataUri}>
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

        {/* Decode/Download */}
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
            Paste a TX hash minted via calldata. This tool fetches tx.input, decodes it, and downloads
            the original image.
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

          {!PUBLIC_RPC_URL && (
            <p style={{ marginTop: 12, color: "#ffcf70" }}>
              Missing NEXT_PUBLIC_ETH_RPC_URL. Add it in Vercel Env Vars and redeploy.
            </p>
          )}
        </div>

        <p style={{ marginTop: 28, opacity: 0.6 }}>
          Note: This is a test harness inside the Pickle Punks mint page. Later you can move it to a
          dedicated /ethscriptions/mint page.
        </p>

        <p style={{ marginTop: 10, opacity: 0.6 }}>
          Commit message: <b>feat: add image upload ethscription mint + tx decode/download tool</b>
        </p>
      </div>
    </main>
  );
}
