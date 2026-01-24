"use client";

import React, { useMemo, useState } from "react";

/**
 * Pickle Punks — Ethscriptions Mint Page
 *
 * Key rule: Ethscription exists if tx input data (UTF-8) is a VALID data: URI.
 * Ownership attribution is to the tx "from" (the connected wallet).
 */

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] | object }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}

/* ================= CONFIG ================= */
const MINTING_ENABLED = false;

/**
 * "to" can be almost anything. Many people use a "dead" address.
 * If you run into odd edge cases, swap between DEAD_ADDRESS and ZERO_ADDRESS.
 */
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";

/** Keep as hex string for MetaMask compatibility */
const GAS_LIMIT_HEX = "0x186A0"; // 100,000

/* ================= HELPERS ================= */
function shorten(addr: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

/**
 * Convert UTF-8 string to 0x-prefixed hex for eth_sendTransaction "data".
 * No BigInt, no for..of — Vercel/Next-safe.
 */
function utf8ToHex(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let hex = "0x";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

/**
 * IMPORTANT: Make the content a VALID data URI.
 * Use encodeURIComponent on the JSON string. This is the big fix.
 */
function buildEthscriptionPayload(opts: {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
}) {
  const obj = {
    name: opts.name,
    description: opts.description,
    image: opts.image,
    external_url: opts.external_url,
    attributes: opts.attributes,
    ethscriptions: {
      type: "metadata",
      storage: "ethereum-calldata",
      verification: "etherscan-input-data",
    },
  };

  // ✅ percent-encode JSON to be a valid RFC2397-style data URI
  const encoded = encodeURIComponent(JSON.stringify(obj));
  return `data:application/json,${encoded}`;
}

/* ================= UI BUTTON ================= */
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
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const [attributesJson] = useState(
    JSON.stringify(
      [
        { trait_type: "Collection", value: "Pickle Punks" },
        { trait_type: "Artifact", value: "Ethscription" },
        { trait_type: "Storage", value: "Ethereum Calldata" },
      ],
      null,
      2
    )
  );

  const parsedAttributes = useMemo(() => {
    try {
      const val = JSON.parse(attributesJson);
      return Array.isArray(val) ? val : [];
    } catch {
      return [];
    }
  }, [attributesJson]);

  const payload = useMemo(() => {
    return buildEthscriptionPayload({
      name: "Pickle Punks — Genesis Ethscription",
      description:
        "Immutable Pickle Punks metadata stored as an Ethscription. Permanently verifiable via Etherscan Input Data.",
      image: "/IMG_2082.jpeg",
      external_url: "https://bitbrains.us",
      attributes: parsedAttributes,
    });
  }, [parsedAttributes]);

  async function connect() {
    try {
      setError("");
      setTxHash("");

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
      setTxHash("");

      if (!window.ethereum) {
        setError("No wallet found.");
        return;
      }
      if (!account) {
        setError("Connect your wallet first.");
        return;
      }

      // 🔁 Try DEAD_ADDRESS first; if you suspect weird behavior, swap to ZERO_ADDRESS.
      const toAddress = DEAD_ADDRESS;

      const tx = (await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: toAddress,
            value: "0x0",
            gas: GAS_LIMIT_HEX,
            data: utf8ToHex(payload),
          },
        ],
      })) as string;

      setTxHash(tx);
    } catch (e: any) {
      setError(e?.message || "Transaction failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 28, color: "white" }}>
      <img
        src="/IMG_2082.jpeg"
        alt="Pickle Punks"
        style={{
          width: "100%",
          borderRadius: 18,
          border: "3px solid rgba(202,162,74,0.9)",
          marginBottom: 18,
        }}
      />

      <div style={{ textAlign: "center", fontWeight: 900, letterSpacing: 2 }}>
        MINTING SOON
      </div>

      <h3 style={{ marginTop: 28 }}>Step 1 — Connect Wallet</h3>
      {account ? (
        <p>Connected: {shorten(account)}</p>
      ) : (
        <Button onClick={connect}>Connect Wallet</Button>
      )}

      <h3 style={{ marginTop: 24 }}>Step 2 — Mint Ethscription (Immutable)</h3>
      <Button disabled={!account || sending || !MINTING_ENABLED} onClick={mintEthscription}>
        {MINTING_ENABLED ? (sending ? "Minting…" : "Mint Ethscription") : "Minting Disabled"}
      </Button>

      {txHash && (
        <p style={{ marginTop: 16 }}>
          Ethscription TX:{" "}
          <a
            href={`https://etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "underline" }}
          >
            View on Etherscan
          </a>
        </p>
      )}

      {error && <p style={{ color: "#ff8080" }}>{error}</p>}

      <p style={{ marginTop: 28, opacity: 0.75 }}>
        This Ethscription is stored permanently in Ethereum calldata and can always be verified via
        Etherscan Input Data.
      </p>
    </main>
  );
}
