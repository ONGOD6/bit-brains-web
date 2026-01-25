"use client";

import React, { useMemo, useState } from "react";

/**
 * Pickle Punks — Ethscriptions Image Mint (MetaMask-safe)
 *
 * ✅ Upload image (PNG/JPG/WebP)
 * ✅ Max upload: 128 KB
 * ✅ Encode uploaded image to base64 data URI (client-side)
 * ✅ Wrap as JSON, then encode to data:application/json,<urlencoded-json>
 * ✅ Send as calldata in eth_sendTransaction
 *
 * IMPORTANT (MetaMask):
 * - MetaMask blocks EOA -> EOA transactions with calldata ("internal accounts cannot include data")
 * - Standard Ethscriptions pattern is to send calldata to a sink address (dead)
 * - Ethscriptions ownership is derived from tx.from (sender), NOT tx.to
 */

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] | object }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}

/* ===================== CONFIG ===================== */
const BANNER_IMAGE = "/IMG_2082.jpeg";
const MAX_KB = 128;
const MAX_BYTES = MAX_KB * 1024;

// Standard calldata sink used by many ethscription minters
const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";

// Gas (can be raised if needed)
const GAS_LIMIT = "0x186A0"; // 100,000

/* ===================== HELPERS ===================== */
function shorten(addr: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

// Build-safe UTF-8 -> hex (no for..of on Uint8Array)
function utf8ToHex(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let hex = "0x";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

/* ===================== PAGE ===================== */
export default function PicklePunksMintPage() {
  const [account, setAccount] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileBytes, setFileBytes] = useState<number>(0);
  const [imageDataUri, setImageDataUri] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const payloadDataUri = useMemo(() => {
    if (!imageDataUri) return "";

    // Keep it small, deterministic, indexer-friendly
    const payload = {
      type: "bitbrains.ethscriptions.image",
      version: "1.0",
      image: imageDataUri, // data:image/png;base64,...
      anchors: {
        protocol_ens: "bitbrains.eth",
        site: "https://bitbrains.us",
      },
      timestamp: new Date().toISOString(),
    };

    // Ethscriptions commonly use: data:application/json,<urlencoded-json>
    const json = JSON.stringify(payload);
    const encoded = encodeURIComponent(json);
    return `data:application/json,${encoded}`;
  }, [imageDataUri]);

  async function connectWallet() {
    try {
      setError("");
      setStatus("");

      if (!window.ethereum) {
        setError("MetaMask wallet not found.");
        return;
      }

      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (accounts?.[0]) setAccount(accounts[0]);
    } catch (e: any) {
      setError(e?.message || "Failed to connect wallet.");
    }
  }

  function onPickFile(f: File) {
    setError("");
    setStatus("");
    setTxHash("");

    if (!f) return;

    if (f.size > MAX_BYTES) {
      setError(`File too large. Max is ${MAX_KB} KB.`);
      return;
    }

    // Read as Data URL (base64) — simplest and most reliable
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFileName(f.name);
      setFileBytes(f.size);
      setImageDataUri(result); // data:image/...;base64,....
    };
    reader.onerror = () => {
      setError("Failed to read file.");
    };
    reader.readAsDataURL(f);
  }

  async function mintEthscription() {
    try {
      setError("");
      setStatus("");
      setTxHash("");

      if (!account) {
        setError("Connect your wallet first.");
        return;
      }
      if (!payloadDataUri) {
        setError("Upload an image first.");
        return;
      }

      setStatus("Sending transaction… confirm in MetaMask.");

      const tx = await window.ethereum?.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: DEAD_ADDRESS,
            value: "0x0",
            gas: GAS_LIMIT,
            data: utf8ToHex(payloadDataUri),
          },
        ],
      });

      setTxHash(String(tx || ""));
      setStatus("Transaction sent. Waiting for confirmation / indexing.");
    } catch (e: any) {
      setStatus("");
      setError(e?.message || "Transaction failed.");
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
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Banner */}
        <img
          src={BANNER_IMAGE}
          alt="Pickle Punks"
          style={{
            width: "100%",
            borderRadius: 18,
            border: "2px solid rgba(255,255,255,0.15)",
            marginBottom: 18,
          }}
        />

        {/* Step 1 */}
        <h2 style={{ fontSize: 28, margin: "18px 0 10px" }}>
          Step 1 — Connect Wallet
        </h2>
        {account ? (
          <p style={{ opacity: 0.9 }}>Connected: {shorten(account)}</p>
        ) : (
          <button
            onClick={connectWallet}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.08)",
              color: "white",
              fontWeight: 800,
            }}
          >
            Connect MetaMask
          </button>
        )}

        {/* Step 2 */}
        <h2 style={{ fontSize: 28, margin: "26px 0 10px" }}>
          Step 2 — Upload Image
        </h2>
        <p style={{ opacity: 0.7, marginTop: 0 }}>
          PNG / JPG / WebP — Max {MAX_KB} KB
        </p>

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPickFile(f);
          }}
          style={{
            display: "block",
            margin: "10px 0 14px",
          }}
        />

        {imageDataUri && (
          <div style={{ marginTop: 10 }}>
            <p style={{ opacity: 0.85, marginBottom: 10 }}>
              Loaded: <strong>{fileName}</strong> ({fileBytes} bytes)
            </p>
            <img
              src={imageDataUri}
              alt="Preview"
              style={{
                width: 220,
                height: 220,
                objectFit: "cover",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
          </div>
        )}

        {/* Step 3 */}
        <h2 style={{ fontSize: 28, margin: "26px 0 10px" }}>
          Step 3 — Mint
        </h2>

        <button
          onClick={mintEthscription}
          disabled={!account || !imageDataUri}
          style={{
            padding: "14px 18px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.25)",
            background: !account || !imageDataUri ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.10)",
            color: "white",
            fontWeight: 900,
            cursor: !account || !imageDataUri ? "not-allowed" : "pointer",
            opacity: !account || !imageDataUri ? 0.6 : 1,
            marginTop: 6,
          }}
        >
          Mint Ethscription (Calldata)
        </button>

        {txHash && (
          <p style={{ marginTop: 14 }}>
            TX:{" "}
            <a
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#7dd3fc" }}
            >
              View on Etherscan
            </a>
          </p>
        )}

        {status && <p style={{ marginTop: 14, opacity: 0.85 }}>{status}</p>}
        {error && <p style={{ marginTop: 14, color: "#ff8080" }}>{error}</p>}

        <p style={{ marginTop: 22, opacity: 0.55, fontSize: 13, lineHeight: 1.4 }}>
          Note: We send calldata to a sink address to satisfy MetaMask rules.
          Ethscription ownership is derived from the sender (your wallet).
        </p>
      </div>
    </main>
  );
}
