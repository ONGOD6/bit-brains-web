"use client";

import React, { useMemo, useState } from "react";

/**
 * Pickle Punks — Ethscriptions Image Mint + Decode/Download (SINGLE FILE)
 *
 * - Upload image (PNG/JPG/WebP)
 * - Max size: 128 KB
 * - Mint calldata: hex(utf8(data:image/...;base64,...))
 * - Decode from tx hash and download original image
 *
 * ENV REQUIRED (Vercel):
 * NEXT_PUBLIC_ETH_RPC_URL = Ethereum mainnet RPC (Alchemy / Infura / QuickNode)
 */

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] | object }) => Promise<any>;
    };
  }
}

/* ================= CONFIG ================= */

const TEST_MODE = true;
const TEST_TO_ENS = "bitbrains.eth";

const MAX_FILE_KB = 128;
const MAX_FILE_BYTES = MAX_FILE_KB * 1024;

const GAS_LIMIT = "0x30D40"; // 200,000
const RPC_URL = process.env.NEXT_PUBLIC_ETH_RPC_URL || "";

/* ================= HELPERS ================= */

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

function downloadBytes(bytes: Uint8Array, mime: string, filename: string) {
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  );

  const blob = new Blob([buffer], { type: mime });
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
  if (!RPC_URL) throw new Error("Missing NEXT_PUBLIC_ETH_RPC_URL");

  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });

  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

/* ================= PAGE ================= */

export default function Page() {
  const [account, setAccount] = useState("");
  const [dataUri, setDataUri] = useState("");
  const [fileInfo, setFileInfo] = useState("");
  const [txHash, setTxHash] = useState("");
  const [decodeTx, setDecodeTx] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const toAddress = useMemo(
    () => (TEST_MODE ? TEST_TO_ENS : account),
    [account]
  );

  async function connectWallet() {
    setError("");
    if (!window.ethereum) return setError("MetaMask not found");

    const accounts = (await window.ethereum.request({
      method: "eth_requestAccounts",
    })) as string[];

    setAccount(accounts[0]);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    setStatus("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/"))
      return setError("Image files only");

    if (file.size > MAX_FILE_BYTES)
      return setError(`Max ${MAX_FILE_KB} KB exceeded`);

    const reader = new FileReader();
    reader.onload = () => {
      setDataUri(String(reader.result));
      setFileInfo(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    };
    reader.readAsDataURL(file);
  }

  async function mint() {
    try {
      setError("");
      setStatus("Sending transaction…");

      if (!window.ethereum || !account || !dataUri)
        return setError("Missing wallet or image");

      const tx = await window.ethereum.request({
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

      setTxHash(tx as string);
      setStatus("Minted. Save tx hash.");
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function decodeAndDownload() {
    try {
      setError("");
      setStatus("Decoding…");

      const tx = await rpc("eth_getTransactionByHash", [decodeTx]);
      if (!tx?.input) return setError("No input data");

      const utf8 = hexToUtf8(tx.input);
      if (!utf8.startsWith("data:") || !utf8.includes(";base64,"))
        return setError("Not a base64 image ethscription");

      const headEnd = utf8.indexOf(";base64,");
      const mime = utf8.slice(5, headEnd);
      const b64 = utf8.slice(headEnd + 8);

      const bytes = base64ToBytes(b64);
      downloadBytes(bytes, mime, `ethscription_${decodeTx.slice(0, 10)}`);

      setStatus("Downloaded.");
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <main style={{ padding: 24, color: "white", background: "#0b0b0b" }}>
      <h2>Ethscriptions Image Test</h2>

      <button onClick={connectWallet}>Connect Wallet</button>
      {account && <p>Connected: {account}</p>}

      <hr />

      <h3>1. Upload Image (max {MAX_FILE_KB} KB)</h3>
      <input type="file" accept="image/*" onChange={onFile} />
      {fileInfo && <p>{fileInfo}</p>}

      <h3>2. Mint</h3>
      <button onClick={mint} disabled={!dataUri}>
        Mint Ethscription
      </button>

      {txHash && (
        <p>
          TX:{" "}
          <a href={`https://etherscan.io/tx/${txHash}`} target="_blank">
            {txHash}
          </a>
        </p>
      )}

      <hr />

      <h3>3. Decode & Download</h3>
      <input
        placeholder="0x..."
        value={decodeTx}
        onChange={(e) => setDecodeTx(e.target.value)}
      />
      <button onClick={decodeAndDownload}>Download</button>

      {status && <p>{status}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <p style={{ opacity: 0.6, marginTop: 24 }}>
        Commit message: <b>feat: single-file image ethscription mint + decode tool</b>
      </p>
    </main>
  );
}
