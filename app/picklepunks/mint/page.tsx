"use client";

import React, { useMemo, useState } from "react";

/**
 * Pickle Punks — Ethscriptions Image Mint (Single File, Vercel Safe)
 *
 * ✅ Upload image (PNG/JPG/WebP)
 * ✅ Max upload: 128 KB (configurable)
 * ✅ Build-safe (NO declare global, NO for..of Uint8Array)
 * ✅ Mint via calldata: tx.data = hex(utf8(dataURI/json))
 * ✅ Owner is ALWAYS tx.from (sender), regardless of tx.to sink address
 * ✅ No payload preview (clean UI)
 */

/* ===================== CONFIG ===================== */
const BANNER_IMAGE = "/IMG_2082.jpeg";

// Max image size for upload (Ethscriptions limit is much higher, but we cap UX here)
const MAX_KB = 128;
const MAX_BYTES = MAX_KB * 1024;

// Default sink address (safe to include calldata; avoids “internal accounts cannot include data”)
const DEFAULT_SINK = "0x000000000000000000000000000000000000dEaD";

// Gas limit (tweak if needed)
const GAS_LIMIT = "0x186A0"; // 100,000

/* ===================== SMALL HELPERS ===================== */
function shorten(addr: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

function isHexAddress(addr: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

// UTF-8 -> 0x hex (NO for..of to avoid TS downlevel iteration issues)
function utf8ToHex(str: string): string {
  const enc = new TextEncoder().encode(str);
  let hex = "0x";
  for (let i = 0; i < enc.length; i++) {
    hex += enc[i].toString(16).padStart(2, "0");
  }
  return hex;
}

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
        width: "100%",
        padding: "14px 16px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.22)",
        background: props.disabled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.10)",
        color: "white",
        fontWeight: 900,
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.55 : 1,
      }}
    >
      {props.children}
    </button>
  );
}

/* ===================== PAGE ===================== */
export default function PicklePunksMintPage() {
  const [account, setAccount] = useState<string>("");
  const [sink, setSink] = useState<string>(DEFAULT_SINK);

  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [imageDataUrl, setImageDataUrl] = useState<string>(""); // data:image/...;base64,...

  const [txHash, setTxHash] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const canMint = useMemo(() => {
    return !!account && !!imageDataUrl && isHexAddress(sink);
  }, [account, imageDataUrl, sink]);

  // Minimal JSON wrapper so indexers can recognize the payload type cleanly
  const ethscriptionDataUri = useMemo(() => {
    if (!imageDataUrl) return "";
    const payload = {
      type: "bitbrains.ethscriptions.image",
      version: "1.0",
      image: imageDataUrl, // the full data:image/...;base64,... string
      // owner resolves to tx.from (sender) on-chain; we include for convenience only
      owner: account || null,
      timestamp: new Date().toISOString(),
      site: "https://bitbrains.us",
    };
    const encoded = encodeURIComponent(JSON.stringify(payload));
    return `data:application/json,${encoded}`;
  }, [imageDataUrl, account]);

  async function connectWallet() {
    try {
      setError("");
      setStatus("");
      setTxHash("");

      const eth = (window as any)?.ethereum;
      if (!eth?.request) {
        setError("MetaMask not found. Open this page inside the MetaMask browser.");
        return;
      }

      const accounts = (await eth.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (accounts?.[0]) {
        setAccount(accounts[0]);
        setStatus("Wallet connected.");
      } else {
        setError("No wallet account returned.");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to connect wallet.");
    }
  }

  function onChooseFile(file: File | null) {
    setError("");
    setStatus("");
    setTxHash("");

    if (!file) return;

    if (!/image\/(png|jpeg|jpg|webp)/i.test(file.type)) {
      setError("Invalid file type. Use PNG, JPG, or WebP.");
      return;
    }

    if (file.size > MAX_BYTES) {
      setError(`File too large. Max is ${MAX_KB} KB.`);
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);

    const reader = new FileReader();
    reader.onerror = () => setError("Failed to read file.");
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string" || !result.startsWith("data:image/")) {
        setError("Could not create image data URI.");
        return;
      }
      setImageDataUrl(result);
      setStatus("Image loaded.");
    };
    reader.readAsDataURL(file);
  }

  async function mintEthscription() {
    try {
      setError("");
      setStatus("");
      setTxHash("");

      const eth = (window as any)?.ethereum;
      if (!eth?.request) {
        setError("MetaMask not found. Open this page inside the MetaMask browser.");
        return;
      }

      if (!account) {
        setError("Connect wallet first.");
        return;
      }

      if (!imageDataUrl) {
        setError("Upload an image first.");
        return;
      }

      if (!isHexAddress(sink)) {
        setError("Destination (sink) must be a valid 0x address.");
        return;
      }

      // IMPORTANT:
      // Ethscriptions ownership is determined by tx.from (sender).
      // tx.to can be ANY address; we default to a burn/sink to avoid MetaMask warnings about "internal accounts".
      const dataHex = utf8ToHex(ethscriptionDataUri);

      setStatus("Opening MetaMask confirmation…");

      const tx = await eth.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: sink,
            value: "0x0",
            gas: GAS_LIMIT,
            data: dataHex,
          },
        ],
      });

      setTxHash(String(tx));
      setStatus("Transaction submitted.");
    } catch (e: any) {
      const msg = e?.message || "Transaction failed.";
      setError(msg);
      setStatus("");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "white",
        padding: 22,
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
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

        <div style={{ textAlign: "center", fontWeight: 900, fontSize: 22, letterSpacing: 1.2 }}>
          Pickle Punks — Ethscriptions Image Mint
        </div>
        <p style={{ textAlign: "center", opacity: 0.75, marginTop: 8 }}>
          Upload a small image (≤ {MAX_KB} KB) and mint it via calldata. The owner is the sender wallet (
          <code style={{ opacity: 0.9 }}>tx.from</code>).
        </p>

        {/* Step 1 */}
        <h3 style={{ marginTop: 26, marginBottom: 10 }}>Step 1 — Connect Wallet</h3>
        {account ? (
          <div style={{ opacity: 0.9 }}>Connected: {shorten(account)}</div>
        ) : (
          <Button onClick={connectWallet}>Connect MetaMask</Button>
        )}

        {/* Step 2 */}
        <h3 style={{ marginTop: 24, marginBottom: 10 }}>Step 2 — Upload Image (Max {MAX_KB} KB)</h3>

        <div
          style={{
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 14,
            padding: 14,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => onChooseFile(e.target.files?.[0] || null)}
            style={{ width: "100%" }}
          />

          {fileName ? (
            <div style={{ marginTop: 10, opacity: 0.85 }}>
              Loaded: <b>{fileName}</b> ({fileSize} bytes)
            </div>
          ) : (
            <div style={{ marginTop: 10, opacity: 0.65 }}>
              Choose a PNG/JPG/WebP under {MAX_KB} KB.
            </div>
          )}

          {imageDataUrl ? (
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
                  background: "rgba(0,0,0,0.35)",
                }}
              />
            </div>
          ) : null}
        </div>

        {/* Step 3 */}
        <h3 style={{ marginTop: 24, marginBottom: 10 }}>Step 3 — Mint</h3>

        <div
          style={{
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 14,
            padding: 14,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>
            Destination (sink address):
          </div>

          <input
            value={sink}
            onChange={(e) => setSink(e.target.value.trim())}
            inputMode="text"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            style={{
              width: "100%",
              padding: "12px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(0,0,0,0.35)",
              color: "white",
              fontWeight: 700,
            }}
          />

          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.7, lineHeight: 1.35 }}>
            Note: Ethscriptions ownership is determined by <b>tx.from</b> (your connected wallet). We use a sink
            address for <b>tx.to</b> to reduce MetaMask issues when sending calldata to an address MetaMask
            considers an “internal account”.
          </div>

          <div style={{ marginTop: 12 }}>
            <Button onClick={mintEthscription} disabled={!canMint}>
              Mint Ethscription (Calldata)
            </Button>
          </div>

          {!isHexAddress(sink) ? (
            <div style={{ marginTop: 10, color: "#ff8080", fontWeight: 800 }}>
              Invalid sink address. Must be a 0x… address.
            </div>
          ) : null}
        </div>

        {/* Status / Errors */}
        {status ? <p style={{ marginTop: 14, opacity: 0.85 }}>{status}</p> : null}

        {txHash ? (
          <p style={{ marginTop: 10 }}>
            TX:{" "}
            <a
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#9ad0ff" }}
            >
              {txHash}
            </a>
          </p>
        ) : null}

        {error ? (
          <p style={{ marginTop: 14, color: "#ff8080", fontWeight: 800, whiteSpace: "pre-wrap" }}>
            {error}
          </p>
        ) : null}

        <div style={{ marginTop: 26, opacity: 0.55, fontSize: 12, lineHeight: 1.4 }}>
          Tip: Use the MetaMask in-app browser. If a confirmation doesn’t pop, force-close MetaMask and re-open
          the dapp, then reconnect.
        </div>
      </div>
    </main>
  );
}
