"use client";

import { useState } from "react";

/**
 * Pickle Punks — Stable Ethscriptions Mint (Sink Contract)
 * Mobile MetaMask Safe
 */

declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: any[];
      }) => Promise<any>;
    };
  }
}

/* ================= CONFIG ================= */

// 🔴 REPLACE ONLY IF YOU WANT A DIFFERENT SINK
const CALLDATA_SINK_CONTRACT =
  "0xd0ecb1ac38b4551c03abf030676f030e8df49e71327585ddac73aed808d73d39";

/* ================= PAGE ================= */

export default function PicklePunksMintPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  /* ================= WALLET ================= */

  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask not detected");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setAccount(accounts[0]);
  }

  /* ================= FILE ================= */

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setImagePreview(URL.createObjectURL(f));
  }

  /* ================= MINT ================= */

  async function mintEthscription() {
    if (!window.ethereum || !account || !file) {
      alert("Missing wallet or image");
      return;
    }

    setStatus("Preparing payload...");

    const base64 = await fileToBase64(file);

    const payload = {
      protocol: "ethscriptions",
      version: "1.0",
      mime: file.type,
      image: base64,
      name: "Pickle Punk",
      collection: "Pickle Punks",
    };

    const json = JSON.stringify(payload);
    const encoded = encodeURIComponent(json);
    const data = "data:application/json," + encoded;

    setStatus("Sending transaction…");

    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: account,
          to: CALLDATA_SINK_CONTRACT,
          value: "0x0",
          data: stringToHex(data),
        },
      ],
    });

    setStatus("Transaction submitted. Check wallet activity.");
  }

  /* ================= UI ================= */

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: 420, width: "100%" }}>
        {/* Banner */}
        <img
          src="/IMG_2082.jpeg"
          alt="Pickle Punks"
          style={{
            width: "100%",
            borderRadius: 12,
            marginBottom: "1.5rem",
          }}
        />

        {/* Step 1 */}
        <h3>Step 1 — Connect Wallet</h3>
        {account ? (
          <p>Connected: {account.slice(0, 6)}…{account.slice(-4)}</p>
        ) : (
          <button onClick={connectWallet}>Connect MetaMask</button>
        )}

        {/* Step 2 */}
        <h3 style={{ marginTop: "1.5rem" }}>Step 2 — Upload Image</h3>
        <input type="file" accept="image/*" onChange={handleFile} />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            style={{
              marginTop: "1rem",
              width: "100%",
              borderRadius: 12,
            }}
          />
        )}

        {/* Step 3 */}
        <h3 style={{ marginTop: "1.5rem" }}>Step 3 — Mint</h3>
        <button
          onClick={mintEthscription}
          disabled={!account || !file}
          style={{
            width: "100%",
            padding: "1rem",
            fontSize: "1rem",
            marginTop: "0.5rem",
          }}
        >
          Mint Ethscription
        </button>

        {status && (
          <p style={{ marginTop: "1rem", opacity: 0.8 }}>{status}</p>
        )}
      </div>
    </main>
  );
}

/* ================= HELPERS ================= */

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function stringToHex(str: string): string {
  return (
    "0x" +
    Array.from(new TextEncoder().encode(str))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}
