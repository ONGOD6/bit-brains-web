"use client";

import React, { useMemo, useState } from "react";

const BANNER_SRC = "/IMG_2082.jpeg"; // Pickle Punks banner in /public
const MAX_FILE_BYTES = 350_000; // keep test files small while debugging
const CHAIN_ID_HEX = "0x1"; // Ethereum mainnet

type TxState =
  | "idle"
  | "connecting"
  | "connected"
  | "file_loaded"
  | "signing"
  | "submitted"
  | "error";

function shortAddr(a: string) {
  if (!a || a.length < 10) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function bytesToHex(bytes: Uint8Array): string {
  // no for..of (mobile + build-safety)
  let hex = "0x";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

function buildEthscriptionsPayloadDataURL(base64DataUrl: string) {
  // Ethscriptions-style JSON payload that contains a canonical data URL
  // Important: We later UTF-8 encode this JSON and send it as hex calldata.
  const payload = {
    p: "ethscriptions",
    op: "mint",
    // keep it simple and canonical
    content: base64DataUrl, // e.g. data:image/png;base64,AAAA...
    // optional metadata hooks if you want later:
    // collection: "Pickle Punks",
    // ts: new Date().toISOString(),
  };
  return JSON.stringify(payload);
}

async function ensureChain(ethereum: any) {
  const current = (await ethereum.request({ method: "eth_chainId" })) as string;
  if (current?.toLowerCase() !== CHAIN_ID_HEX) {
    // try switch (won't always work on mobile if chain not added—mainnet is always there)
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_ID_HEX }],
    });
  }
}

export default function PicklePunksMintPage() {
  const [state, setState] = useState<TxState>("idle");
  const [error, setError] = useState<string>("");
  const [account, setAccount] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileBytes, setFileBytes] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [base64DataUrl, setBase64DataUrl] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  const canMint = useMemo(() => {
    return !!account && !!base64DataUrl && state !== "signing";
  }, [account, base64DataUrl, state]);

  async function connectWallet() {
    try {
      setError("");
      setTxHash("");
      setState("connecting");

      const ethereum = (window as any)?.ethereum;
      if (!ethereum?.request) {
        throw new Error("MetaMask not detected. Open in MetaMask in-app browser.");
      }

      await ensureChain(ethereum);

      const accounts = (await ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      const a = accounts?.[0] || "";
      if (!a) throw new Error("No wallet account returned.");

      setAccount(a);
      setState("connected");
    } catch (e: any) {
      setState("error");
      setError(e?.message || "Failed to connect wallet.");
    }
  }

  function onChooseFile(file: File | null) {
    try {
      setError("");
      setTxHash("");

      if (!file) return;

      if (!file.type || !file.type.startsWith("image/")) {
        throw new Error("Please choose an image file (png/jpg/webp).");
      }

      if (file.size > MAX_FILE_BYTES) {
        throw new Error(
          `File too large for testing (${file.size} bytes). Use a smaller image under ${MAX_FILE_BYTES} bytes for now.`
        );
      }

      setFileName(file.name);
      setFileBytes(file.size);

      // preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // convert to base64 data URL
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (!result || !result.startsWith("data:image/")) {
          setState("error");
          setError("Failed to read image as data URL.");
          return;
        }
        setBase64DataUrl(result);
        setState("file_loaded");
      };
      reader.onerror = () => {
        setState("error");
        setError("Failed to read file.");
      };
      reader.readAsDataURL(file);
    } catch (e: any) {
      setState("error");
      setError(e?.message || "File error.");
    }
  }

  async function mintOptionA_SendToSelfHexCalldata() {
    try {
      setError("");
      setTxHash("");
      setState("signing");

      const ethereum = (window as any)?.ethereum;
      if (!ethereum?.request) throw new Error("MetaMask not detected.");

      await ensureChain(ethereum);

      const from = account;
      const to = account; // ✅ send-to-self avoids “internal account cannot include data” issues in many MM builds

      // Build JSON payload then UTF-8 -> hex calldata
      const payloadJson = buildEthscriptionsPayloadDataURL(base64DataUrl);

      const encoder = new TextEncoder();
      const bytes = encoder.encode(payloadJson);
      const dataHex = bytesToHex(bytes);

      // Construct tx
      const tx: any = {
        from,
        to,
        value: "0x0",
        data: dataHex,
      };

      // Try gas estimate first; if MetaMask can’t estimate, provide a safe fallback
      try {
        const est = (await ethereum.request({
          method: "eth_estimateGas",
          params: [tx],
        })) as string;
        tx.gas = est;
      } catch {
        // fallback gas: base + proportional to calldata length
        // calldata length in bytes = (hexLen-2)/2
        const calldataBytes = Math.max(0, (dataHex.length - 2) / 2);
        const fallback = 220000 + Math.floor(calldataBytes * 2); // conservative
        tx.gas = "0x" + fallback.toString(16);
      }

      // Send
      const hash = (await ethereum.request({
        method: "eth_sendTransaction",
        params: [tx],
      })) as string;

      setTxHash(hash || "");
      setState("submitted");
    } catch (e: any) {
      setState("error");
      setError(e?.message || "Transaction failed.");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        padding: "28px 18px 80px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 620 }}>
        {/* Banner */}
        <div
          style={{
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.10)",
            marginBottom: 18,
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <img
            src={BANNER_SRC}
            alt="Pickle Punks"
            style={{ width: "100%", display: "block" }}
          />
        </div>

        {/* Card */}
        <div
          style={{
            borderRadius: 18,
            padding: 18,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 24, letterSpacing: 0.2 }}>
            Pickle Punks — Ethscriptions Mint
          </h1>
          <p style={{ marginTop: 10, opacity: 0.85, lineHeight: 1.35 }}>
            Option A (Stable): we encode the payload as <b>UTF-8 JSON → hex calldata</b> and
            send the tx <b>to your own wallet</b>. This avoids the MetaMask “internal account”
            + calldata warning patterns.
          </p>

          {/* Step 1 */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Step 1 — Connect Wallet</div>

            {account ? (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                Connected: <b>{shortAddr(account)}</b>
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                  Destination (to): <b>{shortAddr(account)}</b> (send-to-self)
                </div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 14,
                  background: "#111",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.14)",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {state === "connecting" ? "Connecting…" : "Connect MetaMask"}
              </button>
            )}
          </div>

          {/* Step 2 */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Step 2 — Upload Image</div>

            <div
              style={{
                padding: 14,
                borderRadius: 14,
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onChooseFile(e.target.files?.[0] || null)}
              />
              {fileName ? (
                <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>
                  Loaded: <b>{fileName}</b> ({fileBytes} bytes)
                </div>
              ) : (
                <div style={{ marginTop: 10, fontSize: 13, opacity: 0.8 }}>
                  Tip: start with a small PNG while testing.
                </div>
              )}

              {previewUrl ? (
                <div style={{ marginTop: 14 }}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxWidth: 320,
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.10)",
                      display: "block",
                    }}
                  />
                </div>
              ) : null}
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Step 3 — Mint</div>

            <button
              onClick={mintOptionA_SendToSelfHexCalldata}
              disabled={!canMint}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 14,
                background: canMint ? "#1a2230" : "rgba(255,255,255,0.06)",
                color: canMint ? "#fff" : "rgba(255,255,255,0.55)",
                border: "1px solid rgba(255,255,255,0.14)",
                fontWeight: 800,
                cursor: canMint ? "pointer" : "not-allowed",
              }}
            >
              {state === "signing" ? "Sending to MetaMask…" : "Mint Ethscription (Option A)"}
            </button>

            {txHash ? (
              <div style={{ marginTop: 12, fontSize: 13, opacity: 0.9 }}>
                Submitted: <b>{txHash}</b>
              </div>
            ) : null}

            {error ? (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 14,
                  background: "rgba(255,0,0,0.08)",
                  border: "1px solid rgba(255,0,0,0.25)",
                  color: "rgba(255,255,255,0.95)",
                  fontSize: 13,
                  lineHeight: 1.35,
                }}
              >
                <b>Error:</b> {error}
              </div>
            ) : null}
          </div>

          <div style={{ marginTop: 16, fontSize: 12, opacity: 0.7, lineHeight: 1.35 }}>
            Note: This page intentionally does <b>not</b> show the payload preview (it’s noise + huge).
            Once the tx is reliably submitting, we can add a hidden “advanced” inspector.
          </div>
        </div>
      </div>
    </main>
  );
}
