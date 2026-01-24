"use client";

import React, { useEffect, useMemo, useState } from "react";

/**
 * Pickle Punks — Clean One-Page Mint (Vercel Safe)
 *
 * ✅ Banner: /public/IMG_2082.jpeg
 * ✅ 3 steps only
 * ✅ Immutable Description = calldata (Etherscan Input Data)
 * ✅ NO BigInt
 * ✅ NO for..of Uint8Array
 * ✅ Passes Next.js 14 + Vercel TS build
 */

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] | object }) => Promise<any>;
      on?: (event: string, cb: (...args: any[]) => void) => void;
      removeListener?: (event: string, cb: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

/* ================= CONFIG ================= */
const MINTING_ENABLED = false;
const PICKLEPUNKS_NFT_CONTRACT = "TBD";

/* ================= CONSTANTS ================= */
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const GAS_LIMIT_DESCRIPTION = "0x186A0";

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

function safeJsonParse<T>(s: string): { ok: true; value: T } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(s) as T };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Invalid JSON" };
  }
}

function buildDescriptionDataUrl(opts: {
  name: string;
  description: string;
  imageUrl: string;
  externalUrl?: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}) {
  const metadata = {
    name: opts.name,
    description: opts.description,
    image: opts.imageUrl,
    external_url: opts.externalUrl || "",
    attributes: opts.attributes || [],
    proof: {
      type: "PicklePunks-Description",
      storage: "Ethereum calldata",
      verification: "Etherscan → Input Data",
    },
  };

  return `data:application/json,${JSON.stringify(metadata)}`;
}

/* ================= UI ================= */
function Btn({ children, onClick, disabled }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 14px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(255,255,255,0.1)",
        color: "white",
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}

/* ================= PAGE ================= */
export default function PicklePunksMintPage() {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [descTx, setDescTx] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const [name, setName] = useState("Pickle Punks — Genesis Description");
  const [description, setDescription] = useState(
    "Immutable Pickle Punks description artifact. Permanently verifiable on Ethereum via calldata."
  );
  const [attributesJson, setAttributesJson] = useState(
    JSON.stringify(
      [
        { trait_type: "Collection", value: "Pickle Punks" },
        { trait_type: "Proof", value: "Calldata (Etherscan)" },
      ],
      null,
      2
    )
  );

  const parsedAttrs = useMemo(() => safeJsonParse<any>(attributesJson), [attributesJson]);
  const attrsOk = parsedAttrs.ok && Array.isArray(parsedAttrs.value);

  const payload = useMemo(
    () =>
      buildDescriptionDataUrl({
        name,
        description,
        imageUrl: "/IMG_2082.jpeg",
        externalUrl: "https://bitbrains.us",
        attributes: attrsOk ? parsedAttrs.value : [],
      }),
    [name, description, attrsOk, parsedAttrs]
  );

  async function connect() {
    try {
      const accs = (await window.ethereum!.request({ method: "eth_requestAccounts" })) as string[];
      setAccount(accs[0]);
      const cid = (await window.ethereum!.request({ method: "eth_chainId" })) as string;
      setChainId(cid);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function mintDescription() {
    try {
      setSending(true);
      setError("");

      const tx = (await window.ethereum!.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: ZERO_ADDRESS,
            value: "0x0",
            gas: GAS_LIMIT_DESCRIPTION,
            data: utf8ToHex(payload),
          },
        ],
      })) as string;

      setDescTx(tx);
    } catch (e: any) {
      setError(e.message || "Transaction failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24, color: "white" }}>
      <img
        src="/IMG_2082.jpeg"
        alt="Pickle Punks"
        style={{
          width: "100%",
          maxWidth: 880,
          borderRadius: 18,
          border: "3px solid rgba(202,162,74,0.95)",
          display: "block",
          margin: "0 auto 16px",
        }}
      />

      <div style={{ textAlign: "center", fontWeight: 900, letterSpacing: 2, marginBottom: 24 }}>
        MINTING SOON
      </div>

      <h3>Step 1 — Connect Wallet</h3>
      {account ? <p>Connected: {shorten(account)}</p> : <Btn onClick={connect}>Connect Wallet</Btn>}

      <h3 style={{ marginTop: 20 }}>Step 2 — Mint Description (Immutable Proof)</h3>
      <Btn disabled={!account || sending || !attrsOk || !MINTING_ENABLED} onClick={mintDescription}>
        {MINTING_ENABLED ? "Mint Description" : "Minting Disabled"}
      </Btn>

      {descTx && (
        <p>
          Description TX:{" "}
          <a href={`https://etherscan.io/tx/${descTx}`} target="_blank">
            View on Etherscan
          </a>
        </p>
      )}

      {error && <p style={{ color: "#ff8080" }}>{error}</p>}

      <p style={{ marginTop: 24, opacity: 0.7 }}>
        Description is stored forever in Ethereum calldata and can always be verified via Etherscan Input Data.
      </p>
    </main>
  );
}
