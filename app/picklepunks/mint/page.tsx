"use client";

import React, { useState, useMemo } from "react";

/**
 * Pickle Punks — Ethscriptions Image Mint + Decode Tool
 *
 * - Upload image (PNG / JPG / WebP)
 * - Max size: 128 KB
 * - Encode to base64 data URI
 * - Mint via calldata (eth_sendTransaction)
 * - Download reconstructed image (no Uint8Array / no Blob typing issues)
 *
 * IMPORTANT:
 * - Client component only
 * - No global ethereum redeclare
 * - No SharedArrayBuffer usage
 */

const MAX_FILE_BYTES = 128 * 1024; // 128 KB
const DESTINATION_ENS = "bitbrains.eth";
const GAS_LIMIT = "0x186A0"; // 100,000

export default function PicklePunksMintPage() {
  const [account, setAccount] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [error, setError] = useState<string>("");

  /* ===================== WALLET ===================== */
  async function connectWallet() {
    try {
      setError("");
      const eth = (window as any).ethereum;
      if (!eth) throw new Error("MetaMask not found");

      const accounts = await eth.request({
        method: "eth_requestAccounts",
      });

      setAccount(accounts[0]);
    } catch (e: any) {
      setError(e.message || "Wallet connection failed");
    }
  }

  /* ===================== FILE LOAD ===================== */
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > MAX_FILE_BYTES) {
      setError("File exceeds 128 KB limit");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFile(f);
      setDataUrl(reader.result as string); // base64 data URI
    };
    reader.readAsDataURL(f);
  }

  /* ===================== PAYLOAD ===================== */
  const payload = useMemo(() => {
    if (!dataUrl) return "";
    return `data:application/json,${encodeURIComponent(
      JSON.stringify({
        type: "bitbrains.ethscriptions.image",
        version: "1.0",
        mime: file?.type,
        image: dataUrl,
        site: "https://bitbrains.us",
        timestamp: new Date().toISOString(),
      })
    )}`;
  }, [dataUrl, file]);

  function utf8ToHex(str: string) {
    const enc = new TextEncoder().encode(str);
    let hex = "0x";
    for (const b of enc) hex += b.toString(16).padStart(2, "0");
    return hex;
  }

  /* ===================== MINT ===================== */
  async function mintEthscription() {
    try {
      setError("");
      if (!account) throw new Error("Wallet not connected");
      if (!payload) throw new Error("No image loaded");

      const eth = (window as any).ethereum;

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

      setTxHash(tx);
    } catch (e: any) {
      setError(e.message || "Mint failed");
    }
  }

  /* ===================== DOWNLOAD ===================== */
  function downloadImage() {
    if (!dataUrl || !file) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `recovered-${file.name}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* ===================== UI ===================== */
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "#fff",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1>Pickle Punks — Image Ethscription Test</h1>

        {!account ? (
          <button onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <p>Connected: {account}</p>
        )}

        <hr />

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={onFileChange}
        />

        {file && (
          <p>
            Loaded: {file.name} ({file.size} bytes)
          </p>
        )}

        {dataUrl && (
          <>
            <img
              src={dataUrl}
              style={{ maxWidth: "100%", borderRadius: 12 }}
            />

            <p>Payload size: {payload.length} chars</p>

            <button onClick={mintEthscription}>
              Mint Ethscription (Calldata)
            </button>

            <button onClick={downloadImage}>
              Download Image
            </button>
          </>
        )}

        {txHash && (
          <p>
            TX:&nbsp;
            <a
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {txHash}
            </a>
          </p>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </main>
  );
}

/**
 * COMMIT MESSAGE:
 * feat: add single-file image ethscription mint + base64 decode tool
 */
