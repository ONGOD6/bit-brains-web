"use client";

import React, { useMemo, useState } from "react";

/* ======================================================
   CONFIG
   ====================================================== */
const MINTING_ENABLED = false;

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
export default function PicklePunksMintPage() {
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

      const payload = `data:application/json,{"collection":"Pickle Punks","status":"genesis"}`;
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

  /* ---------- steps (3 only) ---------- */
  const step = useMemo(() => {
    if (!account) return 1;
    if (!txHash) return 2;
    return 3;
  }, [account, txHash]);

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24, color: "#fff" }}>
      
      {/* ================= BANNER ================= */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <img
          src="/images/picklepunks-banner.jpg"
          alt="Pickle Punks"
          style={{
            width: "100%",
            maxWidth: 820,
            borderRadius: 16,
            border: "3px solid #caa24a",
          }}
        />
        <div
          style={{
            marginTop: 10,
            fontWeight: 900,
            letterSpacing: 2,
            opacity: 0.85,
          }}
        >
          MINTING SOON
        </div>
      </div>

      {/* ================= STEP 1 ================= */}
      <section style={{ marginBottom: 22 }}>
        <h3>Step 1 — Connect Wallet</h3>
        {account ? (
          <p>Connected: <strong>{shorten(account)}</strong></p>
        ) : (
          <button onClick={connect}>Connect Wallet</button>
        )}
      </section>

      {/* ================= STEP 2 ================= */}
      <section style={{ marginBottom: 22 }}>
        <h3>Step 2 — Create Ethscription</h3>
        <button
          disabled={!account || sending || !MINTING_ENABLED}
          onClick={mint}
        >
          {MINTING_ENABLED
            ? sending
              ? "Minting…"
              : "Mint Pickle Punk"
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
