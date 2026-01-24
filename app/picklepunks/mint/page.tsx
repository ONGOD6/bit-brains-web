"use client";

import React, { useEffect, useMemo, useState } from "react";

/* ======================================================
   CONFIG FLAGS
   ====================================================== */
const MINTING_ENABLED = false; // 🔒 flip to true when live

/* ======================================================
   GLOBAL TYPES
   ====================================================== */
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

/* ======================================================
   CONSTANTS
   ====================================================== */
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const GAS_LIMIT_HEX = "0x186A0";

/* ======================================================
   HELPERS
   ====================================================== */
function shorten(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function utf8ToHex(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let hex = "0x";
  bytes.forEach(b => (hex += b.toString(16).padStart(2, "0")));
  return hex;
}

/* ======================================================
   PAGE
   ====================================================== */
export default function EthscriptionsMintPage() {
  const [account, setAccount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  /* ---------- wallet ---------- */
  async function connect() {
    try {
      const accs = await window.ethereum!.request({
        method: "eth_requestAccounts",
      });
      setAccount(accs[0]);
    } catch (e: any) {
      setError(e.message);
    }
  }

  /* ---------- mint ---------- */
  async function mint() {
    if (!MINTING_ENABLED) return;

    try {
      setSending(true);
      setError("");

      const payload = `data:application/json,{"name":"Bit Brains Ethscription","status":"genesis"}`;
      const dataHex = utf8ToHex(payload);

      const tx = await window.ethereum!.request({
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
      });

      setTxHash(tx);
    } catch (e: any) {
      setError(e.message || "Transaction failed");
    } finally {
      setSending(false);
    }
  }

  /* ---------- step logic (3 steps ONLY) ---------- */
  const step = useMemo(() => {
    if (!account) return 1;
    if (!txHash) return 2;
    return 3;
  }, [account, txHash]);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24, color: "#fff" }}>
      
      {/* ================= BANNER ================= */}
      <div
        style={{
          marginBottom: 24,
          padding: "14px 18px",
          borderRadius: 14,
          background: "linear-gradient(135deg,#2b2b2b,#111)",
          border: "1px solid rgba(255,255,255,0.15)",
          textAlign: "center",
          fontWeight: 800,
          letterSpacing: 1,
        }}
      >
        🧠 MINTING SOON
      </div>

      <h1 style={{ marginBottom: 8 }}>Ethscriptions Mint</h1>
      <p style={{ opacity: 0.7, marginBottom: 20 }}>
        3-step flow · ENS-routed · Immutable calldata artifact
      </p>

      {/* ================= STEP 1 ================= */}
      <section style={{ marginBottom: 18 }}>
        <h3>Step 1 — Connect Wallet</h3>
        {account ? (
          <p>Connected: <strong>{shorten(account)}</strong></p>
        ) : (
          <button onClick={connect}>Connect Wallet</button>
        )}
      </section>

      {/* ================= STEP 2 ================= */}
      <section style={{ marginBottom: 18 }}>
        <h3>Step 2 — Create Ethscription</h3>
        <button
          disabled={!account || sending || !MINTING_ENABLED}
          onClick={mint}
        >
          {MINTING_ENABLED
            ? sending
              ? "Minting…"
              : "Mint Ethscription"
            : "Minting Disabled"}
        </button>
      </section>

      {/* ================= STEP 3 ================= */}
      <section>
        <h3>Step 3 — Receipt</h3>
        {txHash ? (
          <>
            <code style={{ wordBreak: "break-all" }}>{txHash}</code>
            <div style={{ marginTop: 8 }}>
              <a href={`https://etherscan.io/tx/${txHash}`} target="_blank">
                View on Etherscan
              </a>
            </div>
          </>
        ) : (
          <p>Transaction hash will appear here.</p>
        )}
      </section>

      {error && (
        <div style={{ marginTop: 20, color: "#ff8080" }}>
          {error}
        </div>
      )}
    </main>
  );
}
