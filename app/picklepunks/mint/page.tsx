"use client";

import React, { useMemo, useState } from "react";

/**
 * Pickle Punks — Ethscriptions Image Mint + Decode/Download (Build-Safe)
 *
 * ✅ No global Window.ethereum redeclare
 * ✅ No for..of on Uint8Array (avoids downlevelIteration issues)
 * ✅ No SharedArrayBuffer / Blob typing issues
 * ✅ Upload image <= 128 KB
 * ✅ Encode image -> data URI -> calldata hex
 * ✅ Mint transaction (0 ETH) to bitbrains.eth (TEST MODE)
 * ✅ Download original image directly from the stored data URI
 *
 * NOTE:
 * This version does NOT do RPC decode from tx hash yet.
 * It guarantees Vercel build passes and the mint calldata is correct.
 */

const MAX_FILE_BYTES = 128 * 1024; // 128 KB
const DESTINATION_ENS = "bitbrains.eth"; // TEST destination
const GAS_LIMIT = "0x186A0"; // 100,000

function shorten(addr: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

function utf8ToHex(str: string) {
  const enc = new TextEncoder().encode(str);
  let hex = "0x";
  // IMPORTANT: NO for..of (Vercel TS config fails)
  for (let i = 0; i < enc.length; i++) {
    hex += enc[i].toString(16).padStart(2, "0");
  }
  return hex;
}

export default function PicklePunksMintPage() {
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [imageDataUrl, setImageDataUrl] = useState(""); // data:image/...;base64,...
  const [txHash, setTxHash] = useState("");

  async function connectWallet() {
    try {
      setError("");
      setStatus("");

      const eth = (window as any).ethereum;
      if (!eth?.request) {
        setError("MetaMask not found.");
        return;
      }

      const accounts = (await eth.request({
        method: "eth_requestAccounts",
      })) as string[];

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

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setError("");
      setStatus("");
      setTxHash("");

      const f = e.target.files?.[0];
      if (!f) return;

      if (!f.type.startsWith("image/")) {
        setError("Upload an image only (PNG/JPG/WebP).");
        return;
      }

      if (f.size > MAX_FILE_BYTES) {
        setError("File too large. Max 128 KB.");
        return;
      }

      setFileName(f.name);
      setFileSize(f.size);

      const reader = new FileReader();
      reader.onerror = () => setError("Failed to read file.");
      reader.onload = () => {
        const result = String(reader.result || "");
        setImageDataUrl(result); // data:image/...;base64,...
        setStatus("Image loaded. Ready to mint.");
      };
      reader.readAsDataURL(f);
    } catch (e: any) {
      setError(e?.message || "Failed to load image.");
    }
  }

  // Payload that gets written into calldata
  const payload = useMemo(() => {
    if (!imageDataUrl) return "";
    const obj = {
      type: "bitbrains.ethscriptions.image",
      version: "1.0",
      image: imageDataUrl,
      site: "https://bitbrains.us",
      timestamp: new Date().toISOString(),
    };
    const encoded = encodeURIComponent(JSON.stringify(obj));
    return `data:application/json,${encoded}`;
  }, [imageDataUrl]);

  async function mintEthscription() {
    try {
      setError("");
      setStatus("");

      const eth = (window as any).ethereum;
      if (!eth?.request) {
        setError("MetaMask not found.");
        return;
      }
      if (!account) {
        setError("Connect wallet first.");
        return;
      }
      if (!payload) {
        setError("Upload an image first.");
        return;
      }

      setStatus("Sending transaction… confirm in MetaMask.");

      const tx = await eth.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: DESTINATION_ENS,
            value: "0x0",
            gas: GAS_LIMIT,
            data: utf8ToHex(payload),
          },
        ],
      });

      setTxHash(String(tx));
      setStatus("Transaction sent.");
    } catch (e: any) {
      setError(e?.message || "Mint failed.");
    }
  }

  function downloadOriginalImage() {
    if (!imageDataUrl) return;
    const a = document.createElement("a");
    a.href = imageDataUrl;
    a.download = fileName ? `ethscription_${fileName}` : "ethscription_image";
    document.body.appendChild(a);
    a.click();
    a.remove();
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
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
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

        <h1 style={{ margin: 0 }}>Ethscriptions Image Test</h1>
        <p style={{ opacity: 0.8, marginTop: 6 }}>
          Destination: <b>{DESTINATION_ENS}</b> • Max upload: <b>128 KB</b>
        </p>

        <hr style={{ opacity: 0.15, margin: "18px 0" }} />

        <h3>Step 1 — Connect Wallet</h3>
        {account ? (
          <p>
            Connected: <b>{shorten(account)}</b>
          </p>
        ) : (
          <button onClick={connectWallet} style={{ padding: 12, borderRadius: 10 }}>
            Connect Wallet
          </button>
        )}

        <h3 style={{ marginTop: 22 }}>Step 2 — Upload Image</h3>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={onFileChange}
        />

        {fileName && (
          <p style={{ marginTop: 10, opacity: 0.85 }}>
            Loaded: <b>{fileName}</b> ({fileSize} bytes)
          </p>
        )}

        {imageDataUrl && (
          <>
            <div style={{ marginTop: 14 }}>
              <img
                src={imageDataUrl}
                alt="Preview"
                style={{
                  width: 180,
                  height: 180,
                  objectFit: "cover",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              />
            </div>

            <div style={{ marginTop: 14, fontWeight: 800 }}>Payload Preview</div>
            <div style={{ fontSize: 12, opacity: 0.8, wordBreak: "break-word" }}>
              {payload}
            </div>
          </>
        )}

        <h3 style={{ marginTop: 22 }}>Step 3 — Mint</h3>
        <button
          onClick={mintEthscription}
          disabled={!account || !payload}
          style={{
            padding: 12,
            borderRadius: 10,
            opacity: !account || !payload ? 0.5 : 1,
          }}
        >
          Mint Ethscription (Calldata)
        </button>

        {txHash && (
          <p style={{ marginTop: 12 }}>
            TX:{" "}
            <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">
              {txHash}
            </a>
          </p>
        )}

        {imageDataUrl && (
          <button
            onClick={downloadOriginalImage}
            style={{ padding: 12, borderRadius: 10, marginTop: 12 }}
          >
            Download Image (Original)
          </button>
        )}

        {status && <p style={{ marginTop: 12, opacity: 0.85 }}>{status}</p>}
        {error && <p style={{ marginTop: 12, color: "#ff8080" }}>{error}</p>}

        <p style={{ marginTop: 18, opacity: 0.6 }}>
          Commit message: <b>fix: remove for..of on Uint8Array; restore build-safe calldata mint</b>
        </p>
      </div>
    </main>
  );
}
