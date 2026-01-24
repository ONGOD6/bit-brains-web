"use client";

import React from "react";

/**
 * Bit Brains — Genesis Mint (Parked)
 *
 * ✅ Same “parked mint” UX pattern as Pickle Punks
 * ✅ Brains banner on top
 * ✅ Minting Soon (date TBD)
 * ✅ All actions disabled until launch window
 *
 * NOTE: This page intentionally contains NO wallet logic and NO tx logic.
 * We will re-enable step-by-step when:
 *  - Genesis Brains art + JSON is finalized
 *  - ERC-721 contract + mint flow is ready
 *  - Paired Ethscriptions artifact mint is ready to ship
 */

export default function BitBrainsGenesisMintPage() {
  const pill: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.2rem 0.55rem",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    fontWeight: 900,
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    fontSize: 12,
    opacity: 0.95,
  };

  const disabledBtn: React.CSSProperties = {
    padding: "0.85rem 1.05rem",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.03)",
    color: "rgba(255,255,255,0.45)",
    fontWeight: 900,
    cursor: "not-allowed",
    width: "100%",
    maxWidth: 340,
  };

  const card: React.CSSProperties = {
    marginTop: "1.15rem",
    padding: "1.35rem 1.25rem 1.45rem",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.28)",
  };

  const subtle: React.CSSProperties = {
    opacity: 0.86,
    lineHeight: 1.65,
    fontSize: 15.5,
  };

  return (
    <main className="page-shell">
      <section className="content-shell">
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          {/* Top hero (Brains banner) */}
          <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
            <div
              style={{
                borderRadius: 18,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              {/* Use your existing Brain banner asset */}
              <img
                src="/brain-evolution.gif"
                alt="Bit Brains"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          </div>

          {/* Under construction notice */}
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem 1.1rem",
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(150,0,0,0.14)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: 1000, letterSpacing: "0.12em", opacity: 0.95 }}>
              🚧 PAGE UNDER CONSTRUCTION
            </div>
            <div style={{ marginTop: 10, opacity: 0.9, lineHeight: 1.55 }}>
              This mint page is currently <strong>NOT LIVE</strong>.
              <br />
              Please do <strong>NOT</strong> attempt to mint.
              <br />
              <br />
              Official launch announcements will be made <strong>only</strong> through official channels.
            </div>
          </div>

          {/* Title */}
          <div style={{ marginTop: "1.25rem" }}>
            <div style={{ fontSize: 40, fontWeight: 1000, lineHeight: 1.05 }}>
              Bit Brains
              <br />
              Genesis Mint
            </div>
            <div style={{ marginTop: 10 }}>
              <span style={pill}>Minting Soon</span>
            </div>
          </div>

          {/* Main card */}
          <div style={card}>
            <div style={subtle}>
              This page will host the official <strong>Bit Brains Genesis</strong> mint.
              <br />
              <br />
              Each Genesis mint will ultimately produce:
              <br />• A Genesis Brain NFT (<strong>ERC-721</strong>)
              <br />• A paired <strong>Ethscriptions</strong> artifact (immutable lineage / provenance)
              <br />
              <br />
              Final mint flow will bind lineage via <strong>transaction hash</strong> + <strong>ENS routing</strong>.
            </div>

            {/* Steps */}
            <div style={{ marginTop: "1.25rem" }}>
              <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 10 }}>
                Step 1 — Connect Wallet
              </div>
              <button style={disabledBtn} disabled>
                Connect Wallet (Disabled)
              </button>

              <div style={{ height: 18 }} />

              <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 10 }}>
                Step 2 — Mint Genesis Brain (ERC-721)
              </div>
              <button style={disabledBtn} disabled>
                Mint Genesis Brain (Disabled)
              </button>

              <div style={{ height: 18 }} />

              <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 10 }}>
                Step 3 — Mint Ethscriptions Artifact (Immutable)
              </div>
              <button style={disabledBtn} disabled>
                Mint Ethscription (Disabled)
              </button>

              <div style={{ marginTop: 14, opacity: 0.7, lineHeight: 1.55 }}>
                When enabled, the Ethscriptions step will publish an on-chain calldata payload that can be
                verified via Etherscan <strong>Input Data</strong>, and indexed by ethscriptions.com for long-term
                provenance.
              </div>
            </div>
          </div>

          <div style={{ marginTop: "1.15rem", opacity: 0.55, fontSize: 13.5, lineHeight: 1.5 }}>
            Version: Parked / Safe Mode — actions disabled until launch.
          </div>
        </div>
      </section>
    </main>
  );
}
