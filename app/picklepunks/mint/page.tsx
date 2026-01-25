"use client";

import React, { useMemo, useState } from "react";

/**
 * Pickle Punks — Ethscriptions Image Mint (Single File)
 *
 * GOAL:
 * - Upload an image (PNG/JPG/WebP) up to 128 KB
 * - Convert to data URI (base64) in-browser (FileReader)
 * - Send as calldata (hex-encoded UTF-8 string) via eth_sendTransaction
 *
 * IMPORTANT:
 * - "to" SHOULD NOT be your own address. MetaMask may block data to "internal accounts".
 * - Use a sink/burn address. Indexers attribute the Ethscription to the *from* address anyway.
 *
 * COMMIT (use in GitHub):
 * fix: image upload -> base64 dataURI -> calldata mint (128kb cap, no payload preview)
 */

/* ===================== CONFIG ===================== */
const MAX_KB = 128;
const MAX_BYTES = MAX_KB * 1024;

// Burn / sink address (common pattern)
const TO_ADDRESS = "0x000000000000000000000000000000000000dEaD";

// Keep a safe gas limit for calldata
const GAS_LIMIT = "0x30D40"; // 200,000

/* ===================== HELPERS ===================== */
function shorten(addr: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

function isHexAddress(addr: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

/**
 * Build-safe UTF-8 -> hex
 * (No for..of on Uint8Array; avoids TS target iteration issues)
 */
function utf8ToHex(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const hexBody = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return "0x" + hexBody;
}

/* ===================== PAGE ===================== */
export default function PicklePunksMintPage() {
  const [account, setAccount] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [dataUri, setDataUri] = useState<string>(""); // data:image/...;base64,...
  const [previewUrl, setPreviewUrl] = useState<string>(""); // same as dataUri for <img>

  const canMint = useMemo(() => {
    return Boolean(account && dataUri && !error);
  }, [account, dataUri, error]);

  async function connectWallet() {
    try {
      setError("");
      setStatus("");
      setTxHash("");

      const eth = (window as any)?.ethereum;
      if (!eth?.request) {
        setError("MetaMask not found.");
        return;
      }

      const accounts = (await eth.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts?.[0]) {
        setError("No wallet account returned.");
        return;
      }

      setAccount(accounts[0]);
      setStatus("Wallet connected.");
    } catch (e: any) {
      setError(e?.message || "Failed to connect wallet.");
    }
  }

  function onFilePicked(file: File | null) {
    try {
      setError("");
      setStatus("");
      setTxHash("");
      setDataUri("");
      setPreviewUrl("");
      setFileName("");
      setFileSize(0);

      if (!file) return;

      const allowed = ["image/png", "image/jpeg", "image/webp"];
      if (!allowed.includes(file.type)) {
        setError("Only PNG, JPG, or WebP are allowed.");
        return;
      }

      if (file.size > MAX_BYTES) {
        setError(`File too large. Max is ${MAX_KB} KB.`);
        return;
      }

      setFileName(file.name);
      setFileSize(file.size);

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== "string") {
          setError("Failed to read file.");
          return;
        }
        // result is a data URI: data:image/png;base64,....
        setDataUri(result);
        setPreviewUrl(result);
        setStatus("Image loaded.");
      };
      reader.onerror = () => setError("Failed to read file.");
      reader.readAsDataURL(file);
    } catch (e: any) {
      setError(e?.message || "Failed to load file.");
    }
  }

  async function mintEthscription() {
    try {
      setError("");
      setStatus("");
      setTxHash("");

      if (!account) {
        setError("Connect wallet first.");
        return;
      }
      if (!dataUri) {
        setError("Upload an image first.");
        return;
      }
      if (!isHexAddress(TO_ADDRESS)) {
        setError("Internal config error: TO_ADDRESS is not a valid hex address.");
        return;
      }
      if (TO_ADDRESS.toLowerCase() === account.toLowerCase()) {
        setError("TO_ADDRESS must NOT equal your wallet address (MetaMask blocks data to internal accounts).");
        return;
      }

      const eth = (window as any)?.ethereum;
      if (!eth?.request) {
        setError("MetaMask not found.");
        return;
      }

      // The Ethscription content is the data URI itself.
      // Indexers read tx.input and attribute to `from`.
      const calldataHex = utf8ToHex(dataUri);

      setStatus("Sending transaction... confirm in MetaMask.");

      const tx = (await eth.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: TO_ADDRESS,
            value: "0x0",
            gas: GAS_LIMIT,
            data: calldataHex,
          },
        ],
      })) as string;

      setTxHash(tx);
      setStatus("Transaction sent. Waiting for confirmation/indexing.");
    } catch (e: any) {
      setError(e?.message || "Mint failed.");
      setStatus("");
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
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, marginBottom: 10 }}>Pickle Punks — Ethscriptions Image Mint</h1>

        <p style={{ opacity: 0.75, marginTop: 0 }}>
          Upload an image (max <b>{MAX_KB} KB</b>) → Mint as calldata (Ethscription-style).
        </p>

        {/* STEP 1 */}
        <h2 style={{ marginTop: 26, marginBottom: 10 }}>Step 1 — Connect Wallet</h2>
        {account ? (
          <div style={{ opacity: 0.9 }}>Connected: <b>{shorten(account)}</b></div>
        ) : (
          <button
            onClick={connectWallet}
            style={{
              padding: "12px 16px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.08)",
              color: "white",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Connect MetaMask
          </button>
        )}

        {/* STEP 2 */}
        <h2 style={{ marginTop: 28, marginBottom: 10 }}>Step 2 — Upload Image</h2>
        <div style={{ opacity: 0.8, marginBottom: 10 }}>
          Allowed: PNG / JPG / WebP · Max size: {MAX_KB} KB
        </div>

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => onFilePicked(e.target.files?.[0] || null)}
        />

        {fileName && (
          <div style={{ marginTop: 10, opacity: 0.9 }}>
            Loaded: <b>{fileName}</b> ({fileSize} bytes)
          </div>
        )}

        {previewUrl && (
          <div style={{ marginTop: 14 }}>
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                width: 220,
                height: 220,
                objectFit: "contain",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.04)",
              }}
            />
          </div>
        )}

        {/* STEP 3 */}
        <h2 style={{ marginTop: 30, marginBottom: 10 }}>Step 3 — Mint</h2>

        <div style={{ opacity: 0.75, marginBottom: 10 }}>
          Destination (sink): <b>{TO_ADDRESS}</b>
          <div style={{ marginTop: 6 }}>
            Note: We send to a burn address so MetaMask doesn’t block calldata transfers to “internal accounts”.
          </div>
        </div>

        <button
          onClick={mintEthscription}
          disabled={!canMint}
          style={{
            padding: "12px 16px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.25)",
            background: canMint ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.05)",
            color: "white",
            fontWeight: 900,
            cursor: canMint ? "pointer" : "not-allowed",
            opacity: canMint ? 1 : 0.6,
          }}
        >
          Mint Ethscription (Calldata)
        </button>

        {/* STATUS */}
        {status && (
          <div style={{ marginTop: 14, opacity: 0.85 }}>{status}</div>
        )}

        {error && (
          <div style={{ marginTop: 14, color: "#ff8080", fontWeight: 700 }}>{error}</div>
        )}

        {txHash && (
          <div style={{ marginTop: 14 }}>
            TX:{" "}
            <a
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#8ab4ff", wordBreak: "break-all" }}
            >
              {txHash}
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
