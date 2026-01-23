"use client";

import React, { useMemo, useState } from "react";

/* ---------- wallet types ---------- */
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] | object }) => Promise<any>;
    };
  }
}

/* ---------- helpers ---------- */
function assertEthereum() {
  if (!window.ethereum) {
    throw new Error("No wallet detected. Open this site inside a wallet browser (MetaMask, Coinbase, etc).");
  }
}

function bytesToHex(bytes: Uint8Array): string {
  let hex = "0x";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex;
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(2)} KB`;
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("File read failed"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

/* ---------- Ethscription mint ---------- */
async function mintEthscription({ from, payload }: { from: string; payload: string }) {
  assertEthereum();

  const tx = {
    from,
    to: from, // 🔑 CRITICAL: ownership = tx.to (minter receives inscription)
    value: "0x0",
    data: bytesToHex(new TextEncoder().encode(payload)),
  };

  return (await window.ethereum!.request({
    method: "eth_sendTransaction",
    params: [tx],
  })) as string;
}

/* ---------- page ---------- */
export default function EthscriptionsMintPage() {
  const [account, setAccount] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [payload, setPayload] = useState<string>("");
  const [payloadSize, setPayloadSize] = useState<number>(0);
  const [downloaded, setDownloaded] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const connected = useMemo(() => !!account, [account]);
  const MAX_BYTES = 128 * 1024;

  async function connectWallet() {
    try {
      assertEthereum();
      const accounts = (await window.ethereum!.request({
        method: "eth_requestAccounts",
      })) as string[];
      setAccount(accounts[0]);
      setStatus("✅ Wallet connected");
    } catch (e: any) {
      setStatus(e.message);
    }
  }

  async function buildPayload() {
    try {
      if (!file) throw new Error("Select a file first");
      setBusy(true);

      const dataUrl = await fileToDataURL(file);
      const size = new TextEncoder().encode(dataUrl).length;

      setPayload(dataUrl);
      setPayloadSize(size);
      setDownloaded(false);
      setTxHash("");

      if (size > MAX_BYTES) {
        setStatus(`❌ Payload too large (${formatBytes(size)}). Max is 128 KB.`);
        return;
      }

      setStatus(`✅ Payload built (${formatBytes(size)})`);
    } catch (e: any) {
      setStatus(e.message);
    } finally {
      setBusy(false);
    }
  }

  function downloadPayload() {
    downloadTextFile(`${file?.name || "ethscription"}.payload.txt`, payload);
    setDownloaded(true);
    setStatus("✅ Payload downloaded");
  }

  async function mint() {
    try {
      if (!connected) throw new Error("Connect wallet first");
      if (!payload) throw new Error("Build payload first");
      if (!downloaded) throw new Error("Download payload first");

      setBusy(true);
      setStatus("Confirm transaction in wallet…");

      const hash = await mintEthscription({ from: account, payload });
      setTxHash(hash);
      setStatus("✅ Ethscription minted to your wallet");
    } catch (e: any) {
      setStatus(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
      {/* 🔴 TOP BANNER */}
      <div style={{ marginBottom: 24, borderRadius: 18, overflow: "hidden" }}>
        <img
          src="/IMG_2082.jpeg"
          alt="Pickle Punks Ethscriptions"
          style={{ width: "100%", display: "block" }}
        />
      </div>

      <h1 style={{ fontSize: 34, marginBottom: 8 }}>Ethscriptions Mint</h1>
      <p style={{ opacity: 0.85 }}>
        Community mint. Assets are inscribed directly to Ethereum calldata and indexed as Ethscriptions.
      </p>

      {/* STEP 1 */}
      <section style={{ marginTop: 24 }}>
        <h2>Step 1 — Connect Wallet</h2>
        {!connected ? (
          <button onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <code>{account}</code>
        )}
      </section>

      {/* STEP 2 */}
      <section style={{ marginTop: 24 }}>
        <h2>Step 2 — Build Payload (≤ 128 KB)</h2>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <br />
        <button disabled={!file || busy} onClick={buildPayload}>
          Build Payload
        </button>
        {payloadSize > 0 && <div>Size: {formatBytes(payloadSize)}</div>}
      </section>

      {/* STEP 3 */}
      <section style={{ marginTop: 24 }}>
        <h2>Step 3 — Download & Mint</h2>
        <button disabled={!payload || busy} onClick={downloadPayload}>
          Download Payload
        </button>
        <br />
        <button disabled={!downloaded || busy} onClick={mint}>
          Mint Ethscription
        </button>
        {txHash && <div>Tx: {txHash}</div>}
      </section>

      <p style={{ marginTop: 24 }}>{status}</p>

      <section style={{ marginTop: 32, opacity: 0.85 }}>
        <h3>Wallet compatibility</h3>
        <ul>
          <li><b>Desktop:</b> MetaMask, Rabby, Coinbase Wallet</li>
          <li><b>Mobile:</b> Use the wallet’s built-in browser</li>
          <li>Safari / Chrome alone will NOT inject a wallet</li>
        </ul>
      </section>
    </main>
  );
}
