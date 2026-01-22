export const dynamic = "force-dynamic";
export const revalidate = 0;

"use client";

import React, { useMemo, useState } from "react";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] | object }) => Promise<any>;
    };
  }
}

/* ---------- helpers ---------- */

function utf8ToHex(str: string): string {
  const enc = new TextEncoder();
  const bytes = enc.encode(str);
  let hex = "0x";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

function hasEthereum() {
  return typeof window !== "undefined" && !!window.ethereum;
}

function buildPicklePunkDataUri(opts: {
  useEsip6: boolean;
  name: string;
  description: string;
}) {
  const payload = {
    name: opts.name,
    description: opts.description,
    collection: "Pickle Punks",
    artifact: "Ethscription",
  };

  const json = JSON.stringify(payload);
  const rule = opts.useEsip6 ? ";rule=esip6" : "";

  return `data:application/json${rule},${json}`;
}

/* ---------- component ---------- */

export default function EthscriptionsPicklePunksMintPage() {
  const [account, setAccount] = useState("");
  const [status, setStatus] = useState("");
  const [txHash, setTxHash] = useState("");

  const [useEsip6, setUseEsip6] = useState(true);
  const [name, setName] = useState("Pickle Punk");
  const [description, setDescription] = useState(
    "Pickle Punks — Ethscription artifact."
  );

  const isReady = useMemo(() => {
    if (!hasEthereum()) return false;
    if (!account) return false;
    return true;
  }, [account]);

  async function connect() {
    try {
      if (!hasEthereum()) throw new Error("MetaMask not detected");
      const accounts = await window.ethereum!.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } catch (e: any) {
      setStatus(e.message);
    }
  }

  async function mint() {
    try {
      if (!hasEthereum()) throw new Error("MetaMask not detected");
      if (!account) throw new Error("Connect wallet first");

      const dataUri = buildPicklePunkDataUri({
        useEsip6,
        name,
        description,
      });

      const tx = {
        from: account,
        to: account, // 🔑 critical: owner = tx.to
        value: "0x0",
        data: utf8ToHex(dataUri),
      };

      setStatus("Submitting transaction…");
      const hash = await window.ethereum!.request({
        method: "eth_sendTransaction",
        params: [tx],
      });

      setTxHash(hash);
      setStatus("Mint submitted. Await indexing.");
    } catch (e: any) {
      setStatus(e.message);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0b0b0b", color: "#fff" }}>
      {/* 🔥 Pickle Punks Banner */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1rem" }}>
        <img
          src="/IMG_2082.jpeg"
          alt="Pickle Punks"
          style={{
            width: "100%",
            borderRadius: 18,
            border: "2px solid #222",
          }}
        />

        <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>
            Pickle Punks
          </h1>
          <p style={{ opacity: 0.7, letterSpacing: "0.15em" }}>
            MINTING SOON
          </p>
        </div>
      </div>

      {/* Mint Section */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "1rem 1.25rem" }}>
        {!account ? (
          <button
            onClick={connect}
            style={{
              width: "100%",
              padding: "0.9rem",
              borderRadius: 12,
              background: "#111",
              border: "1px solid #333",
              color: "#fff",
            }}
          >
            Connect MetaMask
          </button>
        ) : (
          <div style={{ opacity: 0.8, marginBottom: "1rem" }}>
            Connected: {account}
          </div>
        )}

        <div
          style={{
            background: "#0f0f0f",
            border: "1px solid #222",
            borderRadius: 14,
            padding: "1rem",
          }}
        >
          <label>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              marginTop: 6,
              marginBottom: 12,
              padding: "0.6rem",
              background: "#111",
              border: "1px solid #333",
              color: "#fff",
            }}
          />

          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              marginTop: 6,
              padding: "0.6rem",
              background: "#111",
              border: "1px solid #333",
              color: "#fff",
            }}
          />

          <label style={{ display: "block", marginTop: 10 }}>
            <input
              type="checkbox"
              checked={useEsip6}
              onChange={(e) => setUseEsip6(e.target.checked)}
            />{" "}
            Allow duplicates (ESIP-6)
          </label>

          <button
            disabled={!isReady}
            onClick={mint}
            style={{
              marginTop: "1rem",
              width: "100%",
              padding: "0.85rem",
              borderRadius: 12,
              background: isReady ? "#151515" : "#0a0a0a",
              border: "1px solid #333",
              color: "#fff",
              opacity: isReady ? 1 : 0.5,
            }}
          >
            Mint Pickle Punk Ethscription
          </button>
        </div>

        {status && (
          <div style={{ marginTop: "1rem", opacity: 0.8 }}>{status}</div>
        )}
        {txHash && (
          <div style={{ marginTop: "0.5rem", fontSize: 13 }}>
            Tx: {txHash}
          </div>
        )}
      </div>
    </main>
  );
}
