"use client";

import React, { useMemo, useState } from "react";

/**
 * Pickle Punks — Ethscriptions Mint Page
 *
 * - Ethscription = immutable calldata artifact
 * - Verifiable forever via Etherscan → Input Data
 * - Vercel / Next.js 14 safe
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

/* ================= CONSTANTS ================= */
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const GAS_LIMIT = "0x186A0";

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

function safeJsonParse(s: string):
  | { ok: true; value: unknown }
  | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(s) };
  } catch {
    return { ok: false };
  }
}

function buildEthscriptionPayload(opts: {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
}) {
  return `data:application/json,${JSON.stringify({
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
  })}`;
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

/* ================= PAGE ================= */
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

  const parsed = useMemo(() => safeJsonParse(attributesJson), [attributesJson]);
  const attributes =
    parsed.ok && Array.isArray(parsed.value)
      ? parsed.value
      : [];

  const payload = useMemo(
    () =>
      buildEthscriptionPayload({
        name: "Pickle Punks — Genesis Ethscription",
        description:
          "Immutable Pickle Punks metadata stored as an Ethscription. Permanently verifiable on Ethereum.",
        image: "/IMG_2082.jpeg",
        external_url: "https://bitbrains.us",
        attributes,
      }),
    [attributes]
  );

  async function connect() {
    try {
      const accounts = (await window.ethereum?.request({
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

      const tx = (await window.ethereum?.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: ZERO_ADDRESS,
            value: "0x0",
            gas: GAS_LIMIT,
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

      <h3 style={{ marginTop: 24 }}>
        Step 2 — Mint Ethscription (Immutable)
      </h3>
      <Button
        disabled={!account || sending || !MINTING_ENABLED}
        onClick={mintEthscription}
      >
        {MINTING_ENABLED ? "Mint Ethscription" : "Minting Disabled"}
      </Button>

      {txHash && (
        <p style={{ marginTop: 16 }}>
          Ethscription TX:{" "}
          <a
            href={`https://etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
          >
            View on Etherscan
          </a>
        </p>
      )}

      {error && <p style={{ color: "#ff8080" }}>{error}</p>}

      <p style={{ marginTop: 28, opacity: 0.75 }}>
        This Ethscription is stored permanently in Ethereum calldata and can
        always be verified via Etherscan Input Data.
      </p>
    </main>
  );
}
