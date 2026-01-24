"use client";

import React, { useMemo, useState } from "react";

/* ======================================================
   CONFIG
   ====================================================== */
const MINTING_ENABLED = false;

// Put your real contract here when you deploy (ERC-721 contract, etc.)
const PICKLEPUNKS_CONTRACT = "TBD"; // e.g. "0x1234...abcd"

/* ======================================================
   GLOBAL TYPES
   ====================================================== */
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] | object }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}

/* ======================================================
   CONSTANTS
   ====================================================== */
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const GAS_LIMIT_HEX = "0x186A0";

/* ======================================================
   HELPERS
   ====================================================== */
function shorten(addr: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function utf8ToHex(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let hex = "0x";
  bytes.forEach((b) => (hex += b.toString(16).padStart(2, "0")));
  return hex;
}

/* ======================================================
   PAGE
   ====================================================== */
export default function PicklePunksMintPage() {
  const [account, setAccount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function connect() {
    try {
      setError("");
      const accs = (await window.ethereum!.request({
        method: "eth_requestAccounts",
      })) as string[];
      setAccount(accs?.[0] || "");
    } catch (e: any) {
      setError(e?.message || "Wallet connection failed");
    }
  }

  async function mint() {
    if (!MINTING_ENABLED) return;

    try {
      setSending(true);
      setError("");

      // placeholder ethscriptions payload (edit later)
      const payload = `data:application/json,{"collection":"Pickle Punks","status":"genesis"}`;
      const dataHex = utf8ToHex(payload);

      const tx = (await window.ethereum!.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: ZERO_ADDRESS,
            gas: GAS_LIMIT_HEX,
            value: "0x0",
            data: dataHex,
          },
        ],
      })) as string;

      setTxHash(tx || "");
    } catch (e: any) {
      setError(e?.message || "Transaction failed");
    } finally {
      setSending(false);
    }
  }

  // 3 steps only
  const step = useMemo(() => {
    if (!account) return 1;
    if (!txHash) return 2;
    return 3;
  }, [account, txHash]);

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24, color: "#fff" }}>
      {/* ================= BANNER (IMG_2082) ================= */}
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <img
          src="/IMG_2082.jpeg"
          alt="Pickle Punks"
          style={{
            width: "100%",
            maxWidth: 860,
            borderRadius: 18,
            border: "3px solid rgba(202,162,74,0.95)",
            display: "block",
            margin: "0 auto",
          }}
        />

        <div style={{ marginTop: 10, fontWeight: 900, letterSpacing: 2, opacity: 0.9 }}>
          MINTING SOON
        </div>

        {/* Contract line */}
        <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
          Contract:{" "}
          <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
            {PICKLEPUNKS_CONTRACT}
          </span>{" "}
          {PICKLEPUNKS_CONTRACT !== "TBD" && (
            <button
              onClick={() => navigator.clipboard.writeText(PICKLEPUNKS_CONTRACT)}
              style={{
                marginLeft: 10,
                padding: "6px 10px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.08)",
                color: "white",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              Copy
            </button>
          )}
        </div>
      </div>

      {/* ================= STEP 1 ================= */}
      <section style={{ marginBottom: 18 }}>
        <h3 style={{ marginBottom: 8 }}>Step 1 — Connect Wallet</h3>
        {account ? (
          <div>
            Connected: <strong>{shorten(account)}</strong>
          </div>
        ) : (
          <button
            onClick={connect}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.10)",
              color: "white",
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            Connect Wallet
          </button>
        )}
      </section>

      {/* ================= STEP 2 ================= */}
      <section style={{ marginBottom: 18 }}>
        <h3 style={{ marginBottom: 8 }}>Step 2 — Mint</h3>
        <button
          disabled={!account || sending || !MINTING_ENABLED}
          onClick={mint}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.18)",
            background: !MINTING_ENABLED ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)",
            color: "white",
            cursor: !account || sending || !MINTING_ENABLED ? "not-allowed" : "pointer",
            opacity: !account || sending || !MINTING_ENABLED ? 0.6 : 1,
            fontWeight: 900,
          }}
        >
          {MINTING_ENABLED ? (sending ? "Minting…" : "Mint Pickle Punk") : "Minting Disabled"}
        </button>
      </section>

      {/* ================= STEP 3 ================= */}
      <section>
        <h3 style={{ marginBottom: 8 }}>Step 3 — Receipt</h3>
        {txHash ? (
          <>
            <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", wordBreak: "break-all" }}>
              {txHash}
            </div>
            <div style={{ marginTop: 8 }}>
              <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">
                View on Etherscan
              </a>
            </div>
          </>
        ) : (
          <div style={{ opacity: 0.75 }}>Transaction hash will appear here.</div>
        )}
      </section>

      {error && (
        <div style={{ marginTop: 18, color: "#ff8080", whiteSpace: "pre-wrap" }}>
          {error}
        </div>
      )}
    </main>
  );
}
