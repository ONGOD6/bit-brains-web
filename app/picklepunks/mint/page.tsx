"use client";

import React, { useMemo, useState } from "react";

/**
 * Pickle Punks — Ethscriptions Image Mint (Canonical / Nakamigos-style)
 *
 * ✅ Upload image <= 128 KB
 * ✅ Payload written to calldata is ONLY a canonical image Data URI:
 *    data:image/<mime>;base64,<...>
 * ✅ Send tx to sink address (burn) to avoid MetaMask "internal account" issues
 * ✅ Verifier: paste a known tx hash (e.g., NakamiGos) -> fetch tx input -> decode -> validate
 *
 * IMPORTANT (iOS):
 * - Must run inside MetaMask in-app browser for reliable tx confirmations.
 */

const MAX_KB = 128;
const MAX_BYTES = MAX_KB * 1024;

const BURN_SINK = "0x000000000000000000000000000000000000dEaD";
const VITALIK = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"; // optional
const PUBLIC_RPC = "https://cloudflare-eth.com";

function isAddress(v: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(v);
}
function isTxHash(v: string) {
  return /^0x[a-fA-F0-9]{64}$/.test(v);
}
function isHexString(v: string) {
  return /^0x[a-fA-F0-9]*$/.test(v);
}
function shorten(addr: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

// Build-safe UTF-8 -> hex (NO for..of)
function utf8ToHex(str: string): string {
  const enc = new TextEncoder().encode(str);
  let hex = "0x";
  for (let i = 0; i < enc.length; i++) hex += enc[i].toString(16).padStart(2, "0");
  return hex;
}

// Hex -> UTF-8
function hexToUtf8(hex: string): string {
  if (!isHexString(hex)) throw new Error("Not hex");
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const len = Math.floor(clean.length / 2);
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return new TextDecoder().decode(bytes);
}

async function rpc(method: string, params: any[]) {
  const res = await fetch(PUBLIC_RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json?.error) throw new Error(json.error?.message || "RPC error");
  return json.result;
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

export default function PicklePunksMintPage() {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [dest, setDest] = useState(BURN_SINK);

  const [fileName, setFileName] = useState("");
  const [fileBytes, setFileBytes] = useState(0);
  const [imageDataUri, setImageDataUri] = useState(""); // data:image/...;base64,...
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  // Verifier
  const [verifyHash, setVerifyHash] = useState("");
  const [verifyOut, setVerifyOut] = useState("");

  const hasMetaMask = useMemo(() => {
    const eth = (window as any)?.ethereum;
    return Boolean(eth?.request);
  }, []);

  const canMint = useMemo(() => {
    return Boolean(account && imageDataUri && isAddress(dest));
  }, [account, imageDataUri, dest]);

  async function connectWallet() {
    try {
      setError("");
      setStatus("");
      const eth = (window as any)?.ethereum;
      if (!eth?.request) {
        setError(
          "MetaMask not detected. Open this page inside MetaMask Browser: https://metamask.app.link/dapp/bitbrains.us/picklepunks/mint"
        );
        return;
      }
      const accts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
      const cid = (await eth.request({ method: "eth_chainId" })) as string;
      setAccount(accts?.[0] || "");
      setChainId(cid || "");
      setStatus("Wallet connected.");
    } catch (e: any) {
      setError(e?.message || "Connect failed.");
    }
  }

  function onPickFile(file: File | null) {
    setError("");
    setStatus("");
    setFileName("");
    setFileBytes(0);
    setImageDataUri("");

    if (!file) return;

    if (file.size > MAX_BYTES) {
      setError(`File too large. Max is ${MAX_KB} KB.`);
      return;
    }

    const okTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!okTypes.includes(file.type)) {
      setError("Use PNG / JPG / WebP only.");
      return;
    }

    setFileName(file.name);
    setFileBytes(file.size);

    // ✅ Canonical: this produces data:image/<mime>;base64,<...>
    const reader = new FileReader();
    reader.onerror = () => setError("Failed to read file.");
    reader.onload = () => {
      const result = String(reader.result || "");
      if (!result.startsWith("data:image/") || !result.includes(";base64,")) {
        setError("Not a canonical image data URI.");
        return;
      }
      setImageDataUri(result);
      setStatus("Image loaded.");
    };
    reader.readAsDataURL(file);
  }

  async function mint() {
    try {
      setError("");
      setStatus("");

      const eth = (window as any)?.ethereum;
      if (!eth?.request) {
        setError(
          "MetaMask not detected. Open inside MetaMask Browser: https://metamask.app.link/dapp/bitbrains.us/picklepunks/mint"
        );
        return;
      }
      if (!account) throw new Error("Connect wallet first.");
      if (!imageDataUri) throw new Error("Upload an image first.");
      if (!isAddress(dest)) throw new Error("Destination address invalid.");

      // ✅ Mirror “Nakamigos style”: calldata is just the data:image/...;base64,... string
      const dataHex = utf8ToHex(imageDataUri);

      setStatus("Opening MetaMask confirmation…");
      const txHash = (await eth.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: dest,
            value: "0x0",
            data: dataHex,
          },
        ],
      })) as string;

      setStatus(`Sent: ${txHash}`);
    } catch (e: any) {
      setStatus("");
      setError(e?.message || "Mint failed.");
    }
  }

  async function verifyTx() {
    setVerifyOut("");
    const h = verifyHash.trim();
    if (!isTxHash(h)) {
      setVerifyOut("Enter a valid tx hash (0x + 64 hex).");
      return;
    }
    try {
      setVerifyOut("Fetching tx input…");
      const tx = await rpc("eth_getTransactionByHash", [h]);
      const input: string = tx?.input || tx?.data || "";
      if (!isHexString(input) || input.length < 10) {
        setVerifyOut("No input data found on that transaction.");
        return;
      }
      const decoded = hexToUtf8(input);
      const ok = decoded.startsWith("data:image/") && decoded.includes(";base64,");
      if (!ok) {
        setVerifyOut(
          `❌ Not canonical image data URI.\nFirst 120 chars:\n${decoded.slice(0, 120)}`
        );
        return;
      }
      setVerifyOut(
        `✅ Canonical data URI detected.\nStarts with:\n${decoded.slice(0, 64)}...\n\nThis is what we are now mirroring exactly.`
      );
    } catch (e: any) {
      setVerifyOut(`Verify failed: ${e?.message || "unknown error"}`);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0b0b0b", color: "white", padding: 22 }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <h1 style={{ margin: 0 }}>Pickle Punks — Ethscriptions Mint (Canonical)</h1>
        <p style={{ opacity: 0.8, marginTop: 8 }}>
          Payload is <b>data:image/&lt;mime&gt;;base64,...</b> only (no JSON wrapper).
        </p>

        {!hasMetaMask ? (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              lineHeight: 1.35,
            }}
          >
            <b>MetaMask not detected.</b>
            <div style={{ marginTop: 8 }}>
              Open inside MetaMask Browser using:
              <div style={{ marginTop: 6, wordBreak: "break-all", opacity: 0.9 }}>
                https://metamask.app.link/dapp/bitbrains.us/picklepunks/mint
              </div>
            </div>
          </div>
        ) : null}

        <section style={{ marginTop: 18, padding: 16, borderRadius: 14, border: "1px solid #222" }}>
          <h2 style={{ marginTop: 0 }}>Step 1 — Connect</h2>
          <Button onClick={connectWallet}>Connect MetaMask</Button>
          <div style={{ marginTop: 10, opacity: 0.85, fontSize: 14 }}>
            <div>Account: {account ? shorten(account) : "—"}</div>
            <div>Chain: {chainId || "—"}</div>
          </div>
        </section>

        <section style={{ marginTop: 14, padding: 16, borderRadius: 14, border: "1px solid #222" }}>
          <h2 style={{ marginTop: 0 }}>Step 2 — Upload Image</h2>
          <div style={{ opacity: 0.8, marginBottom: 10 }}>Max {MAX_KB} KB · PNG/JPG/WebP</div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => onPickFile(e.target.files?.[0] || null)}
          />

          {fileName ? (
            <div style={{ marginTop: 10, opacity: 0.85 }}>
              Loaded: <b>{fileName}</b> ({fileBytes} bytes)
            </div>
          ) : null}

          {imageDataUri ? (
            <div style={{ marginTop: 12 }}>
              <img
                src={imageDataUri}
                alt="preview"
                style={{
                  width: 200,
                  height: 200,
                  objectFit: "contain",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.04)",
                }}
              />
            </div>
          ) : null}
        </section>

        <section style={{ marginTop: 14, padding: 16, borderRadius: 14, border: "1px solid #222" }}>
          <h2 style={{ marginTop: 0 }}>Step 3 — Mint</h2>

          <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 10 }}>
            Destination (use burn sink for consistency):
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              value={dest}
              onChange={(e) => setDest(e.target.value.trim())}
              style={{
                flex: "1 1 420px",
                padding: 12,
                borderRadius: 12,
                border: "1px solid #333",
                background: "#0f0f0f",
                color: "white",
              }}
            />
            <button
              onClick={() => setDest(BURN_SINK)}
              style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #333", background: "#111", color: "#fff" }}
            >
              Burn
            </button>
            <button
              onClick={() => setDest(VITALIK)}
              style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #333", background: "#111", color: "#fff" }}
            >
              Vitalik
            </button>
          </div>

          {!isAddress(dest) ? (
            <div style={{ marginTop: 10, color: "#ff8080", fontWeight: 800 }}>
              Invalid destination address.
            </div>
          ) : null}

          <div style={{ marginTop: 12 }}>
            <Button onClick={mint} disabled={!canMint}>
              Mint Ethscription
            </Button>
          </div>

          {status ? <div style={{ marginTop: 12, color: "#a7f3d0" }}>{status}</div> : null}
          {error ? <div style={{ marginTop: 12, color: "#ff8080", fontWeight: 800 }}>{error}</div> : null}
        </section>

        <section style={{ marginTop: 14, padding: 16, borderRadius: 14, border: "1px solid #222" }}>
          <h2 style={{ marginTop: 0 }}>Verify NakamiGos TX Input</h2>
          <div style={{ opacity: 0.8, marginBottom: 10 }}>
            Paste tx hash (you gave me:{" "}
            <code style={{ opacity: 0.9 }}>0xd0ec…3d39</code>) and verify it decodes to canonical data URI.
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              value={verifyHash}
              onChange={(e) => setVerifyHash(e.target.value)}
              placeholder="0x... tx hash"
              style={{
                flex: "1 1 520px",
                padding: 12,
                borderRadius: 12,
                border: "1px solid #333",
                background: "#0f0f0f",
                color: "white",
              }}
            />
            <button
              onClick={verifyTx}
              style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #333", background: "#111", color: "#fff" }}
            >
              Verify
            </button>
          </div>

          {verifyOut ? (
            <pre
              style={{
                marginTop: 12,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                background: "#0f0f0f",
                border: "1px solid #333",
                borderRadius: 12,
                padding: 12,
                fontSize: 13,
                lineHeight: 1.35,
              }}
            >
              {verifyOut}
            </pre>
          ) : null}
        </section>
      </div>
    </main>
  );
}
