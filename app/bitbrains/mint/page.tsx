"use client";

import React, { useMemo, useState } from "react";

/**
 * Bit Brains — Genesis Mint Page (LOCKED / PARKED)
 *
 * STATUS:
 * - Minting: SOON (date TBD)
 * - ERC-721 mint: DISABLED (waiting on final JSON/metadata + art)
 * - Ethscriptions mint: DISABLED (logic preserved & previously tested)
 *
 * PURPOSE:
 * - Keep the final UX + flow in place
 * - Prevent accidental txs before launch
 * - Preserve working Ethscriptions calldata pattern for later re-enable
 */

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] | object }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}

/* ================= LAUNCH FLAGS ================= */
const MINTING_LIVE = false;
const ERC721_ENABLED = false;
const ETHSCRIPTIONS_ENABLED = false;

/* ================= CONSTANTS ================= */
const BANNER_IMAGE = "/brain-evolution.gif";
const ETHSCRIPTIONS_TO_ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
const GAS_LIMIT_ETHSCRIPTION = "0x186A0";

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

/* ================= UI: BUTTON ================= */
function Button(props: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
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
        width: "100%",
        maxWidth: 520,
      }}
    >
      {props.children}
    </button>
  );
}

/* ================= PAGE ================= */
export default function BitBrainsGenesisMintPage() {
  const [account, setAccount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  /* ---------------- LOCKED ETHSCRIPTION PAYLOAD ---------------- */
  const payloadObject = useMemo(
    () => ({
      type: "bitbrains.genesis.ethscription.provenance",
      version: "1.0",
      message: "bitbrains genesis — parked until launch",
      anchors: {
        protocol_ens: "bitbrains.eth",
        collection_ens: "bitbrains.eth",
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

  /* ---------------- ACTIONS ---------------- */
  async function connectWallet() {
    setError("");
    setTxHash("");
    setError("Minting is currently disabled (parked).");
    return;
  }

  async function mintERC721() {
    setError("");
    setError("ERC-721 minting is disabled until final Genesis JSON + contract are ready.");
    return;
  }

  async function mintEthscription() {
    setError("");
    setTxHash("");
    setError("Ethscriptions minting is disabled (logic is preserved & tested).");
    return;
  }

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
          alt="Bit Brains"
          style={{
            width: "100%",
            borderRadius: 18,
            border: "3px solid rgba(120,160,255,0.65)",
            marginBottom: 18,
            display: "block",
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
          MINTING SOON
        </div>

        <p style={{ textAlign: "center", opacity: 0.8, marginTop: 0 }}>
          This page is intentionally locked to prevent accidental mints while Genesis art + ERC-721 JSON metadata are finalized.
        </p>

        {/* ===== MINT PHASES ===== */}
<div style={{ marginBottom: 18, opacity: 0.85, lineHeight: 1.65 }}>
  <strong>Bit Brains Mint Phases</strong>
  <br /><br />

  The Bit Brains collection is released across <b>three distinct mint phases</b>:
  <br /><br />

  <b>Phase 1 — Genesis (Date TBD)</b>
  <br />
  • 1,500 Bit Brains
  <br /><br />

  <b>Phase 2 — Expansion (August 1)</b>
  <br />
  • 1,500 Bit Brains
  <br /><br />

  <b>Phase 3 — Completion (November 1)</b>
  <br />
  • 2,000 Bit Brains
  <br /><br />

  <span style={{ opacity: 0.75 }}>
    Each phase represents a separate mint window. Supply is fixed per phase and
    does not roll over between phases.
  </span>
</div>

        {/* ===== Mint Card ===== */}
        <div
          style={{
            marginTop: 18,
            padding: 22,
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(0,0,0,0.28)",
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 1000, marginBottom: 12 }}>
            Bit Brains Genesis Mint
          </div>

          {/* ===== WHAT YOU ARE MINTING ===== */}
          <div style={{ opacity: 0.88, lineHeight: 1.75, marginBottom: 26 }}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>
              What you are minting
            </div>

            <div>
              <b>Bit Brains Genesis</b> is a <b>5,000</b> supply collection. Each Genesis mint is designed
              to produce a paired, two-rail on-chain record:
            </div>

            <div style={{ marginTop: 12 }}>
              • <b>Genesis Brain NFT (ERC-721)</b> — the collectible held in your wallet.
              <br />
              • <b>Provenance Ethscription (no image)</b> — an immutable on-chain artifact recorded as
              <code> data:application/json</code>, indexed by ethscriptions.com, and intended to function
              as a permanent lineage / “birth certificate” for the ERC-721 mint.
            </div>

            <div style={{ marginTop: 14 }}>
              <b>ENS identity routing:</b> Genesis is built around ENS as the canonical identity rail.
              Lineage may be referenced using transaction hash + ENS resolution to support verifiable
              routing and continuity across future protocol phases.
            </div>

            <div style={{ marginTop: 14, opacity: 0.75 }}>
              This description defines mint structure and provenance only. It does not guarantee
              future utility, rewards, or outcomes.
            </div>
          </div>

          {/* ===== STEPS ===== */}
          <h3>Step 1 — Connect Wallet</h3>
          {account ? (
            <p style={{ opacity: 0.85 }}>Connected: {shorten(account)}</p>
          ) : (
            <Button onClick={connectWallet} disabled={!MINTING_LIVE}>
              Connect Wallet (Disabled)
            </Button>
          )}

          <h3 style={{ marginTop: 24 }}>Step 2 — Mint Genesis Brain (ERC-721)</h3>
          <p style={{ opacity: 0.7 }}>
            ERC-721 minting will open once Genesis JSON metadata + contract are finalized.
          </p>
          <Button onClick={mintERC721} disabled>
            Mint ERC-721 (Disabled)
          </Button>

          <h3 style={{ marginTop: 24 }}>
            Step 3 — Mint Ethscriptions Artifact (Immutable)
          </h3>
          <p style={{ opacity: 0.7 }}>
            Ethscriptions calldata logic is preserved & tested, but disabled until the public mint window opens.
          </p>
          <Button onClick={mintEthscription} disabled>
            Mint Ethscription (Disabled)
          </Button>

          {txHash ? (
            <p style={{ marginTop: 16 }}>
              TX:{" "}
              <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">
                {txHash}
              </a>
            </p>
          ) : null}

          {error ? <p style={{ marginTop: 16, color: "#ff8080" }}>{error}</p> : null}

          <p style={{ marginTop: 28, opacity: 0.6 }}>
            When enabled, the Ethscriptions step publishes a
            <code> data:application/json</code> payload into Etherscan input data and is indexed
            for long-term provenance.
          </p>
        </div>
      </div>
    </main>
  );
}
