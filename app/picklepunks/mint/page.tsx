"use client";

import { useState } from "react";

const MAX_BYTES = 128 * 1024; // 128 KB
const DESTINATION_ADDRESS = "0xdae49f6644b0f064f6d469f21afb9bb1321d9f67";

export default function PicklePunksImageMint() {
  const [account, setAccount] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  async function connectWallet() {
    if (!(window as any).ethereum) {
      alert("MetaMask not found");
      return;
    }

    const accounts = await (window as any).ethereum.request({
      method: "eth_requestAccounts",
    });

    setAccount(accounts[0]);
  }

  function handleFile(file: File) {
    if (file.size > MAX_BYTES) {
      alert("File exceeds 128 KB limit");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFile(file);
      setDataUri(result);
    };
    reader.readAsDataURL(file);
  }

  function utf8ToHex(str: string): string {
    const enc = new TextEncoder().encode(str);
    let hex = "0x";
    for (let i = 0; i < enc.length; i++) {
      hex += enc[i].toString(16).padStart(2, "0");
    }
    return hex;
  }

  async function mintEthscription() {
    if (!account || !dataUri) return;

    setStatus("Sending transaction… confirm in MetaMask.");

    const payload = {
      type: "bitbrains.ethscriptions.image",
      version: "1.0",
      image: dataUri,
      site: "https://bitbrains.us",
      timestamp: new Date().toISOString(),
    };

    const calldata = utf8ToHex(
      `data:application/json,${JSON.stringify(payload)}`
    );

    try {
      await (window as any).ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: DESTINATION_ADDRESS,
            data: calldata,
            value: "0x0",
          },
        ],
      });

      setStatus("Transaction sent.");
    } catch (err: any) {
      setStatus(err?.message || "Transaction failed");
    }
  }

  function downloadOriginal() {
    if (!file) return;

    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h2>Step 1 — Connect Wallet</h2>
      {account ? (
        <p>Connected: {account.slice(0, 6)}…{account.slice(-4)}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}

      <h2 style={{ marginTop: 32 }}>Step 2 — Upload Image</h2>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
      />

      {file && (
        <>
          <p>
            Loaded: <strong>{file.name}</strong> ({file.size} bytes)
          </p>
          <img
            src={dataUri || ""}
            alt="preview"
            style={{ maxWidth: "100%", borderRadius: 8 }}
          />
        </>
      )}

      <h2 style={{ marginTop: 32 }}>Step 3 — Mint</h2>
      <button disabled={!account || !dataUri} onClick={mintEthscription}>
        Mint Ethscription (Calldata)
      </button>

      {file && (
        <div style={{ marginTop: 12 }}>
          <button onClick={downloadOriginal}>
            Download Image (Original)
          </button>
        </div>
      )}

      {status && <p style={{ marginTop: 16 }}>{status}</p>}
    </main>
  );
}
