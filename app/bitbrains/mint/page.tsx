"use client";

import React from "react";

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

  return (
    <main className="page-shell">
      <section className="content-shell">
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          {/* Top hero (Brain visual) */}
          <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
            <div
              style={{
                borderRadius: 18,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <img
                src="/brain-evolution.gif"
                alt="Bit Brains"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>

            {/* Under construction announcement */}
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
                Please do <strong>NOT</strong> interact with this page or attempt to mint.
                <br />
                <br />
                BitBrains mint announcements will be made <strong>only</strong> through official channels once minting goes
                live.
              </div>
            </div>

            <div style={{ marginTop: "1.25rem" }}>
              <div style={{ fontSize: 40, fontWeight: 1000, lineHeight: 1.05 }}>Bit Brains</div>
              <div style={{ marginTop: 8, ...pill }}>Genesis Mint — Coming Soon</div>
            </div>
          </div>

          {/* Main card */}
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1.25rem 1.25rem 1.4rem",
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(0,0,0,0.28)",
            }}
          >
            <div style={{ fontSize: 34, fontWeight: 1000, marginBottom: 6 }}>
              Bit Brains Genesis Mint
            </div>

            <div style={{ opacity: 0.85, lineHeight: 1.65, maxWidth: 920 }}>
              This page will host the official Bit Brains Genesis mint.
              <br />
              Each mint will produce:
              <br />• A Genesis Brain NFT (ERC-721)
              <br />• A paired Ethscriptions artifact (immutable lineage / provenance)
              <br />
              <br />
              Final mint flow will bind lineage via transaction hash + ENS routing (wallet-controlled resolution).
            </div>

            {/* Placeholder buttons (disabled until live) */}
            <div style={{ marginTop: "1.2rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                style={{
                  padding: "0.65rem 0.95rem",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.03)",
                  color: "rgba(255,255,255,0.45)",
                  fontWeight: 900,
                  cursor: "not-allowed",
                }}
                disabled
              >
                Connect Wallet (Disabled)
              </button>

              <button
                style={{
                  padding: "0.65rem 0.95rem",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.03)",
                  color: "rgba(255,255,255,0.45)",
                  fontWeight: 900,
                  cursor: "not-allowed",
                }}
                disabled
              >
                Mint Genesis Brain (Disabled)
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
