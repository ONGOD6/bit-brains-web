"use client";

import React, { useMemo, useState } from "react";

/**
 * Pickle Punks — Mint Page (LOCKED / PARKED)
 *
 * STATUS:
 * - Minting scheduled: March 1
 * - ERC-721 mint: DISABLED
 * - Ethscriptions mint: DISABLED (logic preserved & tested)
 *
 * PURPOSE:
 * - Keep full mint logic in place
 * - Prevent any transactions until launch window
 * - Avoid breaking tested Ethscriptions calldata flow
 */

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] | object }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}

/* ===================== LAUNCH FLAGS ===================== */
const MINTING_LIVE = false; // 🔒 flip to true when ready
const ERC721_ENABLED = false;
const ETHSCRIPTIONS_ENABLED = false;

/* ===================== CONSTANTS ===================== */
const BANNER_IMAGE = "/IMG_2082.jpeg";

/**
 * External EOA used previously for successful Ethscriptions indexing.
 * Kept here to preserve exact working logic.
 */
const ETHSCRIPTION_TO_ADDRESS =
  "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"; // Vitalik

const GAS_LIMIT_ETHSCRIPTION = "0x186A0"; // 100,000

/* ===================== HELPERS ===================== */
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

/* ===================== UI ===================== */
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
        padding: "12px 18px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.25)",
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

/* ===================== PAGE ===================== */
export default function PicklePunksMintPage() {
  const [account, setAccount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  /* ---------- LOCKED ETHSCRIPTION PAYLOAD (TESTED) ---------- */
  const payloadObject = useMemo(
    () => ({
      type: "bitbrains.ethscriptions.test",
      version: "1.0",
      message: "testing bitbrains",
      anchors: {
        protocol_ens: "bitbrains.eth",
        collection_ens: "picklepunks.eth",
        site: "https://bitbrains.us",
      },
      timestamp: new Date().toISOString(),
    }),
    []
  );

  const ethscriptionPayload = useMemo(() => {
    const encoded = encodeURIComponent(JSON.stringify(payloadObject));
    return `data:application/json,${encoded}`;
  }, [payloadObject]);

  /* ===================== ACTIONS ===================== */
  async function connectWallet() {
    try {
      setError("");
      if (!window.ethereum) {
        setError("Wallet not found.");
        return;
      }
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      if (accounts?.[0]) setAccount(accounts[0]);
    } catch (e: any) {
      setError(e?.message || "Failed to connect wallet.");
    }
  }

  async function mintEthscription() {
    // 🔒 HARD STOP — parked until launch
    setError("Minting is disabled until March 1.");
    return;

    /*
    // --- PRESERVED, TESTED LOGIC (DO NOT DELETE) ---
    const tx = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: account,
          to: ETHSCRIPTION_TO_ADDRESS,
          value: "0x0",
          gas: GAS_LIMIT_ETHSCRIPTION,
          data: utf8ToHex(ethscriptionPayload),
        },
      ],
    });
    setTxHash(tx as string);
    */
  }

  /* ===================== RENDER ===================== */
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "white",
        padding: 28,
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* ===== Banner ===== */}
        <img
          src={BANNER_IMAGE}
          alt="Pickle Punks"
          style={{
            width: "100%",
            borderRadius: 18,
            border: "3px solid rgba(202,162,74,0.9)",
            marginBottom: 18,
          }}
        />

        {/* ===== Status ===== */}
        <div
          style={{
            textAlign: "center",
            fontWeight: 900,
            fontSize: 22,
            letterSpacing: 2,
            marginBottom: 6,
          }}
        >
          MINTING MARCH 1
        </div>

        <p style={{ textAlign: "center", opacity: 0.8 }}>
          Minting is temporarily disabled while final ERC-721 metadata is completed.
        </p>

        {/* ===== Wallet ===== */}
        <h3 style={{ marginTop: 28 }}>Step 1 — Connect Wallet</h3>
        {account ? (
          <p>Connected: {shorten(account)}</p>
        ) : (
          <Button onClick={connectWallet} disabled={!MINTING_LIVE}>
            Connect Wallet
          </Button>
        )}

        {/* ===== ERC-721 ===== */}
        <h3 style={{ marginTop: 24 }}>Step 2 — Mint Pickle Punk (ERC-721)</h3>
        <p style={{ opacity: 0.7 }}>
          ERC-721 minting will open on March 1.
        </p>
        <Button disabled>Mint ERC-721 (Disabled)</Button>

        {/* ===== Ethscriptions ===== */}
        <h3 style={{ marginTop: 24 }}>Step 3 — Mint Ethscription</h3>
        <p style={{ opacity: 0.7 }}>
          Ethscriptions logic is tested and locked. Minting opens March 1.
        </p>
        <Button disabled onClick={mintEthscription}>
          Mint Ethscription (Disabled)
        </Button>

        {/* ===== Debug / Status ===== */}
        {txHash && (
          <p style={{ marginTop: 16 }}>
            TX:{" "}
            <a
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {txHash}
            </a>
          </p>
        )}

        {error && (
          <p style={{ marginTop: 16, color: "#ff8080" }}>{error}</p>
        )}

        <p style={{ marginTop: 32, opacity: 0.6 }}>
          This page is intentionally locked to prevent accidental mints before launch.
        </p>
      </div>
    </main>
  );
}
