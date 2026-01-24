"use client";

import React from "react";

export default function ENSPage() {
  const ensRoot = "bitbrains.eth";

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "2.25rem 1.25rem 3rem",
        maxWidth: 980,
        margin: "0 auto",
        lineHeight: 1.65,
      }}
    >
      <style>{`
        :root{
          --g1: rgba(40, 255, 170, 0.95);
          --g2: rgba(40, 255, 170, 0.35);
          --g3: rgba(40, 255, 170, 0.18);
          --card: rgba(255,255,255,0.03);
          --line: rgba(255,255,255,0.14);
        }

        @keyframes breathe {
          0%   { transform: translateY(0px); filter: drop-shadow(0 0 0px rgba(40,255,170,0.0)); opacity: .96; }
          50%  { transform: translateY(-5px); filter: drop-shadow(0 0 18px rgba(40,255,170,0.38)); opacity: 1; }
          100% { transform: translateY(0px); filter: drop-shadow(0 0 0px rgba(40,255,170,0.0)); opacity: .96; }
        }

        @keyframes scan {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* FULL-WIDTH GREEN BANNER */}
      <section
        style={{
          border: "1px solid rgba(40,255,170,0.35)",
          background:
            "linear-gradient(135deg, rgba(40,255,170,0.10), rgba(255,255,255,0.02), rgba(40,255,170,0.08))",
          borderRadius: 18,
          padding: "1.25rem",
          marginBottom: "1.25rem",
          boxShadow: "0 0 0 1px rgba(40,255,170,0.08) inset",
        }}
      >
        <div
          style={{
            textAlign: "center",
            display: "grid",
            gap: 10,
            justifyItems: "center",
          }}
        >
          {/* Big full-width header */}
          <div
            style={{
              width: "100%",
              borderRadius: 16,
              border: "1px solid rgba(40,255,170,0.28)",
              background:
                "linear-gradient(90deg, rgba(40,255,170,0.14), rgba(255,255,255,0.03), rgba(40,255,170,0.14))",
              backgroundSize: "200% 200%",
              animation: "scan 7s ease-in-out infinite",
              padding: "0.85rem 1rem",
            }}
          >
            <div
              style={{
                fontSize: "3.2rem",
                fontWeight: 950,
                lineHeight: 1.05,
                letterSpacing: "0.04em",
                textTransform: "lowercase",
                animation: "breathe 3.4s ease-in-out infinite",
                color: "rgba(235,255,245,1)",
                textShadow:
                  "0 0 14px rgba(40,255,170,0.20), 0 0 30px rgba(40,255,170,0.10)",
                wordBreak: "break-word",
              }}
            >
              {ensRoot}
            </div>
          </div>

          <div style={{ opacity: 0.82, fontSize: "1.05rem" }}>
            ENS is the canonical reward destination for BitBrains.
          </div>

          <div
            style={{
              marginTop: 2,
              fontWeight: 900,
              letterSpacing: 3,
              color: "rgba(40,255,170,0.95)",
              textShadow: "0 0 14px rgba(40,255,170,0.22)",
            }}
          >
            MINTING SOON
          </div>
        </div>
      </section>

      {/* ENS + ZK EXPLANATION */}
      <section
        style={{
          border: "1px solid rgba(40,255,170,0.18)",
          background: "rgba(255,255,255,0.03)",
          borderRadius: 18,
          padding: "1.25rem",
          marginBottom: "1.25rem",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", margin: "0 0 0.65rem 0" }}>
          ENS Wallet Resolution
        </h1>

        <p style={{ opacity: 0.9, marginTop: 0 }}>
          To receive staking rewards, each Brain holder must resolve their ENS subdomain to a wallet they control.
          ENS resolution is the <strong>first required verification step</strong>.
        </p>

        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            borderRadius: 14,
            border: "1px solid rgba(40,255,170,0.16)",
            background: "rgba(0,0,0,0.18)",
          }}
        >
          <h2 style={{ fontSize: "1.2rem", margin: "0 0 0.6rem 0" }}>
            How ENS + ZK Proofs Work Together
          </h2>

          <ul style={{ opacity: 0.92, paddingLeft: "1.2rem", margin: 0 }}>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: "rgba(40,255,170,0.92)" }}>ENS is the payout destination.</strong>{" "}
              Rewards route to the <strong>resolved address</strong> of your ENS name.
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: "rgba(40,255,170,0.92)" }}>ZK proofs handle eligibility privately.</strong>{" "}
              Proofs can verify claim eligibility (staking history, epochs, PoC checkpoints) without exposing everything publicly.
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: "rgba(40,255,170,0.92)" }}>Separation of concerns:</strong>{" "}
              ZK = “you qualify”; ENS = “where the funds go”.
            </li>
            <li>
              <strong style={{ color: "rgba(40,255,170,0.92)" }}>You control the destination</strong>{" "}
              by updating ENS records (you pay ENS gas when updating).
            </li>
          </ul>
        </div>
      </section>

      {/* REQUIREMENTS */}
      <section
        style={{
          border: "1px solid rgba(40,255,170,0.14)",
          background: "rgba(255,255,255,0.03)",
          borderRadius: 18,
          padding: "1.25rem",
          marginBottom: "1.25rem",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", margin: "0 0 0.65rem 0" }}>
          Requirements (Non-Negotiable)
        </h2>
        <ul style={{ opacity: 0.92, paddingLeft: "1.2rem", margin: 0 }}>
          <li style={{ marginBottom: 8 }}>
            Your Brain subdomain (example: <strong>brain-###.bitbrains.eth</strong>) must resolve to a wallet you control.
          </li>
          <li style={{ marginBottom: 8 }}>
            Rewards are paid to the <strong>resolved address</strong> for that ENS name.
          </li>
          <li style={{ marginBottom: 8 }}>
            You pay ENS gas fees when updating records (the protocol does not pay these fees).
          </li>
          <li>
            ZK proofs can track eligibility/accounting separately, but ENS resolution is the payout destination.
          </li>
        </ul>
      </section>

      {/* ACTIONS */}
      <section style={{ display: "grid", gap: "0.9rem", marginBottom: "1.25rem" }}>
        <a
          href="https://app.ens.domains/"
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            textDecoration: "none",
            padding: "0.95rem 1.25rem",
            borderRadius: "999px",
            border: "1px solid rgba(40,255,170,0.30)",
            textAlign: "center",
            fontSize: "1rem",
            opacity: 0.98,
            boxShadow: "0 0 18px rgba(40,255,170,0.08)",
          }}
        >
          Open ENS Manager (Set / Resolve My Subdomain) →
        </a>

        <a
          href="/proof-of-care"
          style={{
            display: "inline-block",
            textDecoration: "none",
            padding: "0.95rem 1.25rem",
            borderRadius: "999px",
            border: "1px solid rgba(40,255,170,0.18)",
            textAlign: "center",
            fontSize: "1rem",
            opacity: 0.9,
          }}
        >
          Back to Proof of Care →
        </a>
      </section>

      {/* CLAIM */}
      <section
        style={{
          border: "1px solid rgba(40,255,170,0.14)",
          background: "rgba(255,255,255,0.03)",
          borderRadius: 18,
          padding: "1.25rem",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", margin: "0 0 0.6rem 0" }}>Claim Rewards</h2>
        <p style={{ opacity: 0.9, marginTop: 0 }}>
          Rewards accrue internally while your Brain remains staked. When you choose to claim, you pay the gas for the
          redemption transaction. The protocol routes rewards to the resolved ENS address.
        </p>

        <div
          style={{
            marginTop: "0.85rem",
            padding: "0.9rem 1rem",
            borderRadius: "12px",
            background: "rgba(40,255,170,0.06)",
            border: "1px solid rgba(40,255,170,0.14)",
            opacity: 0.95,
          }}
        >
          <strong style={{ color: "rgba(40,255,170,0.92)" }}>Status:</strong> Claim UI is coming next.
          <br />
          For now, resolve your ENS so you are eligible to receive rewards.
        </div>

        <div style={{ marginTop: "1rem", fontSize: 12, opacity: 0.65 }}>
          ENS App: <strong>BitBrains</strong> — Ethereum-only redemptions (v1).
        </div>
      </section>
    </main>
  );
}
