"use client";

import React, { useState } from "react";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] | object }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}

/**
 * Pickle Punks — ETHSCRIPTIONS TEST MODE (ERC-721 DISABLED)
 *
 * ✅ Banner on top: /public/IMG_2082.jpeg
 * ✅ Wallet connect
 * ✅ Mint Ethscription (single tx)
 * ✅ No burn address warning (self-send: to = account)
 * ✅ Payload is readable on Etherscan Input Data
 * ✅ Payload includes ENS anchors (bitbrains.eth + picklepunks.eth)
 *
 * ERC-721 mint stays locked OFF until HashLips JSON metadata is ready.
 */

/* ================= CONFIG ================= */
const ETHSCRIPTIONS_ENABLED = true;
const ERC721_ENABLED = false;

// Gas limit for inscription tx (hex string)
const GAS_LIMIT_ETHSCRIPTION_HEX = "0x186A0"; // 100,000 (adjust if needed)

/* ================= HELPERS ================= */
function shorten(addr: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

function utf8ToHex(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let hex = "0x";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

/**
 * Build a VALID data URI. We embed "roots" by including ENS anchors
 * inside the JSON itself (not by sending to an ENS recipient).
 *
 * Readable on Etherscan -> Input Data
 */
function buildEthscriptionTestDataUri() {
  const payload = {
    type: "bitbrains.ethscriptions.test",
    version: "1.0",
    message: "testing bitbrains",
    anchors: {
      protocol_ens: "bitbrains.eth",
      collection_ens: "picklepunks.eth",
      site: "https://bitbrains.us",
    },
    timestamp: new Date().toISOString(),
  };

  // ✅ MUST be percent-encoded to remain a valid data URI
  const encoded = encodeURIComponent(JSON.stringify(payload));
  return `data:application/json,${encoded}`;
}

/* ================= UI ================= */
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
        padding: "10px 16px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.2)",
        background: "rgba(255,255,255,0.08)",
        color: "white",
        fontWeight: 800,
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.5 : 1,
      }}
    >
      {props.children}
    </button>
  );
}

export default function PicklePunksMintPage() {
  const [account, setAccount] = useState("");
  const [ethscriptionTxHash, setEthscriptionTxHash] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function connect() {
    try {
      setError("");
      if (!window.ethereum) {
        setError("No wallet found. Install MetaMask.");
        return;
      }
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (accounts?.[0]) setAccount(accounts[0]);
    } catch (e: any) {
      setError(e?.message || "Wallet connection failed");
    }
  }

  async function mintEthscription() {
    try {
      setSending(true);
      setError("");
      setEthscriptionTxHash("");

      if (!window.ethereum) throw new Error("No wallet found.");
      if (!account) throw new Error("Connect your wallet first.");
      if (!ETHSCRIPTIONS_ENABLED) throw new Error("Ethscriptions minting is disabled.");

      const dataUri = buildEthscriptionTestDataUri();

      // ✅ Self-send avoids MetaMask burn address warning
      const tx = (await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: account,
            value: "0x0",
            gas: GAS_LIMIT_ETHSCRIPTION_HEX,
            data: utf8ToHex(dataUri),
          },
        ],
      })) as string;

      setEthscriptionTxHash(tx);
    } catch (e: any) {
      setError(e?.message || "Ethscription mint failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 28, color: "white" }}>
      {/* ✅ TOP BANNER */}
      <img
        src="/IMG_2082.jpeg"
        alt="Pickle Punks Banner"
        style={{
          width: "100%",
          borderRadius: 18,
          border: "3px solid rgba(202,162,74,0.9)",
          marginBottom: 18,
        }}
      />

      <div style={{ textAlign: "center", fontWeight: 900, letterSpacing: 2 }}>
        PICKLE PUNKS — ETHSCRIPTIONS TEST MODE
      </div>

      <p style={{ marginTop: 12, opacity: 0.8 }}>
        ERC-721 mint is locked <b>OFF</b> until HashLips JSON metadata is finished.
      </p>

      <h3 style={{ marginTop: 18 }}>Step 1 — Connect Wallet</h3>
      {account ? (
        <p>Connected: {shorten(account)}</p>
      ) : (
        <Button onClick={connect}>Connect Wallet</Button>
      )}

      <h3 style={{ marginTop: 22 }}>Step 2 — Mint Pickle Punk (ERC-721)</h3>
      <p style={{ opacity: 0.75, marginTop: 6 }}>
        Coming soon — disabled until metadata JSON is ready.
      </p>
      <Button disabled={!ERC721_ENABLED}>Mint ERC-721 (Disabled)</Button>

      <h3 style={{ marginTop: 22 }}>Step 3 — Mint Ethscription (Test)</h3>
      <p style={{ opacity: 0.8, marginTop: 6 }}>
        This sends a transaction whose <b>Input Data</b> is a JSON data URI containing:
        <br />
        <code>testing bitbrains</code> + ENS anchors (<code>bitbrains.eth</code>,{" "}
        <code>picklepunks.eth</code>)
      </p>

      <Button disabled={!account || sending || !ETHSCRIPTIONS_ENABLED} onClick={mintEthscription}>
        {sending ? "Minting…" : "Mint Ethscription"}
      </Button>

      {ethscriptionTxHash && (
        <p style={{ marginTop: 12 }}>
          Ethscription TX:{" "}
          <a
            href={`https://etherscan.io/tx/${ethscriptionTxHash}`}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "underline" }}
          >
            View on Etherscan
          </a>
        </p>
      )}

      {error && <p style={{ color: "#ff8080", marginTop: 14 }}>{error}</p>}

      <p style={{ marginTop: 22, opacity: 0.75 }}>
        After minting, open the tx on Etherscan → find <b>Input Data</b>. You should see a{" "}
        <code>data:application/json</code> payload with the message and ENS anchors.
      </p>
    </main>
  );
}
