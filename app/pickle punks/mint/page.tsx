"use client";

import React, { useState } from "react";

/* ---------- types ---------- */
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] | object }) => Promise<any>;
    };
  }
}

/* ============================================================
   CONFIG
   ============================================================ */

const MINT_DISABLED = true; // 🔒 Flip to false when mint goes live

/* ============================================================
   PAGE
   ============================================================ */

export default function EthscriptionsMintPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "2.25rem 1.1rem 3rem",
        background:
          "radial-gradient(1200px 700px at 50% -10%, rgba(120,120,255,0.18), rgba(0,0,0,0) 60%), linear-gradient(180deg, #070814 0%, #060610 45%, #05050d 100%)",
        color: "rgba(255,255,255,0.92)",
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        {/* ======================================================
            PICKLE PUNKS BANNER
           ====================================================== */}
        <div
          style={{
            borderRadius: 18,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <img
            src="/IMG_2082.jpeg"
            alt="Pickle Punks Collage"
            style={{ width: "100%", display: "block" }}
          />
        </div>

        {/* ======================================================
            UNDER CONSTRUCTION NOTICE
           ====================================================== */}
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem 1.25rem",
            borderRadius: 14,
            border: "1px solid rgba(255,80,80,0.45)",
            background:
              "linear-gradient(180deg, rgba(120,20,20,0.35), rgba(60,10,10,0.25))",
            color: "rgba(255,235,235,0.95)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            🚧 Page Under Construction
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 14,
              lineHeight: 1.6,
              opacity: 0.95,
            }}
          >
            This mint page is currently <strong>NOT LIVE</strong>.
            <br />
            Please do <strong>NOT</strong> interact with this page or attempt to mint.
            <br />
            <br />
            Pickle Punks & BitBrains mint announcements will be made
            <strong> only </strong>
            through official channels once minting goes live.
          </div>
        </div>

        {/* ======================================================
            HEADERS
           ====================================================== */}
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <div
            style={{
              fontSize: 34,
              fontWeight: 950,
              letterSpacing: "-0.02em",
            }}
          >
            Pickle Punks
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.26em",
              opacity: 0.9,
            }}
          >
            COMMUNITY MINT — COMING SOON
          </div>
        </div>

        <div
          style={{
            marginTop: "2rem",
            padding: "1.25rem",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(0,0,0,0.25)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 950,
            }}
          >
            NFT + Ethscription Mint
          </h1>

          <p
            style={{
              marginTop: 10,
              fontSize: 15,
              lineHeight: 1.6,
              opacity: 0.85,
            }}
          >
            This page will host the official Pickle Punks mint.
            <br />
            Each mint will create:
            <br />
            • A Pickle Punks NFT (paid mint, proof-of-interaction)
            <br />
            • An Ethscription attached on-chain as a lineage artifact
            <br />
            <br />
            The NFT mint transaction hash and Ethscription calldata will serve
            as permanent proof on Ethereum and can be verified via ENS.
          </p>

          {/* ======================================================
              DISABLED ACTIONS (VISUAL ONLY)
             ====================================================== */}
          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <button
              disabled={MINT_DISABLED}
              style={{
                padding: "0.75rem 1.2rem",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.6)",
                fontWeight: 900,
                cursor: "not-allowed",
              }}
            >
              Connect Wallet
            </button>

            <button
              disabled={MINT_DISABLED}
              style={{
                padding: "0.75rem 1.2rem",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.6)",
                fontWeight: 900,
                cursor: "not-allowed",
              }}
            >
              Mint NFT
            </button>

            <button
              disabled={MINT_DISABLED}
              style={{
                padding: "0.75rem 1.2rem",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.6)",
                fontWeight: 900,
                cursor: "not-allowed",
              }}
            >
              Mint Ethscription
            </button>
          </div>
        </div>

        {/* ======================================================
            FOOTER
           ====================================================== */}
        <div
          style={{
            marginTop: "3rem",
            width: "55%",
            maxWidth: 760,
            marginLeft: "auto",
            marginRight: "auto",
            opacity: 0.9,
          }}
        >
          <img
            src="/brain-evolution.gif"
            alt="Brain evolution"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              borderRadius: 14,
            }}
          />
        </div>
      </div>
    </main>
  );
}
