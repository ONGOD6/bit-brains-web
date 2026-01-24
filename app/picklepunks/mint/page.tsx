"use client";

import React, { useMemo, useState } from "react";

/**
 * Pickle Punks — Clean One-Page Mint (Vercel Safe)
 *
 * ✅ Banner: /public/IMG_2082.jpeg
 * ✅ 3 steps only
 * ✅ Ethscription Metadata Artifact = calldata (Etherscan Input Data)
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
const MINTING_ENABLED = false; // flip true when ready
const PICKLEPUNKS_NFT_CONTRACT = "TBD";

/* ================= CONSTANTS ================= */
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const GAS_LIMIT_ETHSCRIPTION = "0x186A0"; // ~100k

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

function buildEthscriptionDataUrl(opts: {
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
    ethscriptions: {
      type: "PicklePunks-MetadataArtifact",
      storage: "Ethereum calldata",
      verification: "Etherscan → Input Data",
    },
  };

  return `data:application/json,${JSON.stringify(metadata)}`;
}

/* ================= UI ================= */
type BtnProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

function Btn({ children, onClick, disabled }: BtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 14px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(255,255,255,0.10)",
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
  const [ethscriptionTx, setEthscriptionTx] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const hasWallet = typeof window !== "undefined" && Boolean(window.ethereum);

  const [name, setName] = useState("Pickle Punks — Ethscription Metadata Artifact");
  const [description, setDescription] = useState(
    "Immutable Pickle Punks metadata artifact. Stored on Ethereum as calldata and verifiable forever via transaction Input Data."
  );

  const [attributesJson, setAttributesJson] = useState(
    JSON.stringify(
      [
        { trait_type: "Collection", value: "Pickle Punks" },
        { trait_type: "Artifact", value: "Ethscription Metadata" },
        { trait_type: "Proof", value: "Calldata (Etherscan Input Data)" },
      ],
      null,
      2
    )
  );

  const parsedAttrs = useMemo(() => safeJsonParse<any>(attributesJson), [attributesJson]);
  const attrsOk = parsedAttrs.ok && Array.isArray(parsedAttrs.value);

  const payload = useMemo(
    () =>
      buildEthscriptionDataUrl({
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
      setError("");
      if (!window.ethereum) throw new Error("No wallet detected. Use MetaMask or a wallet browser.");

      const accs = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      setAccount(accs?.[0] || "");

      const cid = (await window.ethereum.request({ method: "eth_chainId" })) as string;
      setChainId(cid || "");
    } catch (e: any) {
      setError(e?.message || "Failed to connect wallet");
    }
  }

  async function mintEthscriptionArtifact() {
    try {
      setSending(true);
      setError("");

      if (!window.ethereum) throw new Error("No wallet detected.");
      if (!account) throw new Error("Connect your wallet first.");
      if (!attrsOk) throw new Error("Attributes JSON must be a valid array.");

      // Ethscriptions-style artifact: calldata payload in tx data
      const tx = (await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: ZERO_ADDRESS,
            value: "0x0",
            gas: GAS_LIMIT_ETHSCRIPTION,
            data: utf8ToHex(payload),
          },
        ],
      })) as string;

      setEthscriptionTx(tx || "");
    } catch (e: any) {
      setError(e?.message || "Transaction failed");
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
      {!hasWallet ? (
        <p style={{ color: "#ff8080" }}>No wallet detected. Use MetaMask or a wallet browser.</p>
      ) : account ? (
        <p>
          Connected: <strong>{shorten(account)}</strong>{" "}
          <span style={{ opacity: 0.7, fontSize: 12 }}>({chainId || "unknown chain"})</span>
        </p>
      ) : (
        <Btn onClick={connect}>Connect Wallet</Btn>
      )}

      <h3 style={{ marginTop: 20 }}>Step 2 — Mint Ethscription Metadata Artifact</h3>
      <p style={{ opacity: 0.78, marginTop: 6 }}>
        This creates an immutable on-chain artifact stored in Ethereum calldata. Anyone can verify it on Etherscan by
        opening the transaction and viewing <strong>Input Data</strong>.
      </p>

      <div style={{ display: "grid", gap: 10, marginTop: 10, maxWidth: 760 }}>
        <label style={{ fontSize: 12, opacity: 0.8 }}>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(255,255,255,0.06)",
            color: "white",
            outline: "none",
          }}
        />

        <label style={{ fontSize: 12, opacity: 0.8 }}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(255,255,255,0.06)",
            color: "white",
            outline: "none",
            minHeight: 90,
          }}
        />

        <label style={{ fontSize: 12, opacity: 0.8 }}>Attributes (JSON array)</label>
        <textarea
          value={attributesJson}
          onChange={(e) => setAttributesJson(e.target.value)}
          spellCheck={false}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(255,255,255,0.06)",
            color: "white",
            outline: "none",
            minHeight: 120,
          }}
        />

        {!attrsOk && (
          <p style={{ color: "#ff8080", margin: 0 }}>
            Attributes JSON must be a valid array.{" "}
            {parsedAttrs.ok ? "Currently it is not an array." : `Error: ${parsedAttrs.error}`}
          </p>
        )}

        <Btn disabled={!account || sending || !attrsOk || !MINTING_ENABLED} onClick={mintEthscriptionArtifact}>
          {MINTING_ENABLED ? (sending ? "Minting…" : "Mint Ethscription") : "Minting Disabled"}
        </Btn>

        {ethscriptionTx && (
          <p style={{ marginTop: 8 }}>
            Ethscription TX:{" "}
            <a href={`https://etherscan.io/tx/${ethscriptionTx}`} target="_blank" rel="noreferrer">
              View on Etherscan
            </a>
          </p>
        )}

        {error && <p style={{ color: "#ff8080", marginTop: 6 }}>{error}</p>}
      </div>

      <h3 style={{ marginTop: 26 }}>Step 3 — Mint NFT (Coming Soon)</h3>
      <p style={{ opacity: 0.78 }}>
        The tradable ERC-721 mint will go here once the contract and mint function ABI/signature are finalized.
      </p>

      <div style={{ marginTop: 16, fontSize: 12, opacity: 0.65 }}>
        Contract: <strong>{PICKLEPUNKS_NFT_CONTRACT}</strong>
      </div>

      <p style={{ marginTop: 24, opacity: 0.7 }}>
        This Ethscription metadata artifact is stored forever in Ethereum calldata and can always be verified via
        Etherscan Input Data.
      </p>
    </main>
  );
}
