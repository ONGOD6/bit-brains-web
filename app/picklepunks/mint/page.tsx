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
 * Pickle Punks — Ethscriptions ONLY (Testing Mode)
 *
 * ✅ Wallet connect
 * ✅ Mint Ethscription (single tx)
 * ✅ Payload is readable on Etherscan Input Data
 *
 * ERC-721 mint is DISABLED until JSON/HashLips metadata is ready.
 */

/* ================= CONFIG ================= */
const ETHSCRIPTIONS_ENABLED = true;
const ERC721_ENABLED = false;

// Common “dead address” recipient for ethscription txs
const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";

// Gas limit for inscription tx (hex string)
const GAS_LIMIT_ETHSCRIPTION_HEX = "0x186A0"; // 100,000

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
 * Minimal readable Ethscription test payload.
 * Shows up in Etherscan -> Input Data as a data URI.
 */
function buildTestEthscriptionDataUri(): string {
  return "data:text/plain," + encodeURIComponent("testing bitbrains");
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

      const dataUri = buildTestEthscriptionDataUri();

      const tx = (await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: DEAD_ADDRESS,
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
        This sends a transaction whose <b>Input Data</b> is a data URI:{" "}
        <code>testing bitbrains</code>
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
        After minting, open the tx on Etherscan → find <b>Input Data</b>. You should see a
        <code>data:text/plain</code> payload containing <code>testing bitbrains</code>.
      </p>
    </main>
  );
}
