"use client";

import React, { useMemo, useState } from "react";

/**
 * Pickle Punks — Mint Page (LOCKED / PARKED) + Ethscriptions Test Mode
 *
 * ✅ TEST MODE (now):
 * - Sends a 0 ETH transaction with raw calldata (hex of UTF-8 data: URI)
 * - `to` = bitbrains.eth (ENS)  ✅ (no client-side ENS resolver needed)
 *
 * ✅ PROD MODE (later):
 * - `to` = connected wallet address (sender)
 *
 * NOTE:
 * - This is a calldata-indexing test harness. It does not affect ERC-721 mint.
 */

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] | object }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}

/* ===================== FLAGS ===================== */
const MINTING_LIVE = false; // March 1 switch (site-wide)
const ERC721_ENABLED = false;

// ✅ Allow Ethscriptions *testing* even while parked
const ETHSCRIPTIONS_TESTING_ENABLED = true;

/* ===================== DESTINATION MODE ===================== */
const TEST_MODE = true;

// TEST: send to your ENS
const TEST_TO_ENS = "bitbrains.eth";

/* ===================== CONSTANTS ===================== */
const BANNER_IMAGE = "/IMG_2082.jpeg";
const GAS_LIMIT_ETHSCRIPTION = "0x186A0"; // 100,000
const MAX_DATA_URI_BYTES = 90_000;

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

function byteLengthUtf8(str: string) {
  return new TextEncoder().encode(str).length;
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
  const [status, setStatus] = useState("");

  /* ---------- ETHSCRIPTION PAYLOAD (JSON -> data:application/json,...) ---------- */
  const payloadObject = useMemo(
    () => ({
      type: "bitbrains.ethscriptions.test",
      version: "1.0",
      message: "calldata indexing test",
      anchors: {
        protocol_ens: "bitbrains.eth",
        site: "https://bitbrains.us",
      },
      // NOTE: timestamp helps uniqueness if you mint again later
      timestamp: new Date().toISOString(),
    }),
    []
  );

  const ethscriptionPayload = useMemo(() => {
    const encoded = encodeURIComponent(JSON.stringify(payloadObject));
    return `data:application/json,${encoded}`;
  }, [payloadObject]);

  const payloadBytes = useMemo(() => byteLengthUtf8(ethscriptionPayload), [ethscriptionPayload]);

  /* ===================== ACTIONS ===================== */
  async function connectWallet() {
    try {
      setError("");
      setStatus("");
      if (!window.ethereum) {
        setError("Wallet not found. Please install MetaMask.");
        return;
      }

      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (accounts?.[0]) {
        setAccount(accounts[0]);
        setStatus("Wallet connected.");
      } else {
        setError("No account returned from wallet.");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to connect wallet.");
    }
  }

  async function assertMainnet() {
    if (!window.ethereum) throw new Error("Wallet not found.");
    const chainId = (await window.ethereum.request({ method: "eth_chainId" })) as string;
    if (chainId !== "0x1") {
      throw new Error("Wrong network. Switch MetaMask to Ethereum Mainnet and try again.");
    }
  }

  async function mintEthscription() {
    try {
      setError("");
      setStatus("");
      setTxHash("");

      if (!ETHSCRIPTIONS_TESTING_ENABLED) {
        setError("Ethscriptions testing is disabled.");
        return;
      }

      if (!window.ethereum) {
        setError("Wallet not found. Please install MetaMask.");
        return;
      }

      if (!account) {
        setError("Connect your wallet first.");
        return;
      }

      await assertMainnet();

      if (payloadBytes > MAX_DATA_URI_BYTES) {
        setError(`Payload too large (${payloadBytes} bytes). Max is ${MAX_DATA_URI_BYTES} bytes.`);
        return;
      }

      // ✅ Destination logic:
      // TEST: send to bitbrains.eth
      // PROD: send to the connected wallet (sender)
      const toAddress = TEST_MODE ? TEST_TO_ENS : account;

      // ✅ Critical: raw calldata = hex(utf8("data:..."))
      const dataHex = utf8ToHex(ethscriptionPayload);

      setStatus("Sending transaction… confirm in MetaMask.");

      const tx = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: toAddress,
            value: "0x0",
            gas: GAS_LIMIT_ETHSCRIPTION,
            data: dataHex,
          },
        ],
      });

      setTxHash(tx as string);
      setStatus("Transaction submitted. Open Etherscan to view Input Data.");
    } catch (e: any) {
      setError(e?.message || "Mint failed.");
    }
  }

  /* ===================== RENDER ===================== */
  const connectDisabled = !ETHSCRIPTIONS_TESTING_ENABLED && !MINTING_LIVE;

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
          ERC-721 minting remains disabled while metadata is finalized.
          <br />
          Ethscriptions testing is {ETHSCRIPTIONS_TESTING_ENABLED ? "ENABLED" : "DISABLED"}.
        </p>

        {/* ===== Wallet ===== */}
        <h3 style={{ marginTop: 28 }}>Step 1 — Connect Wallet</h3>
        {account ? (
          <p>Connected: {shorten(account)}</p>
        ) : (
          <Button onClick={connectWallet} disabled={connectDisabled}>
            Connect Wallet
          </Button>
        )}

        {/* ===== ERC-721 ===== */}
        <h3 style={{ marginTop: 24 }}>Step 2 — Mint Pickle Punk (ERC-721)</h3>
        <p style={{ opacity: 0.7 }}>ERC-721 minting will open on March 1.</p>
        <Button disabled={!ERC721_ENABLED}>Mint ERC-721 (Disabled)</Button>

        {/* ===== Ethscriptions ===== */}
        <h3 style={{ marginTop: 24 }}>Step 3 — Mint Ethscription (Calldata)</h3>

        <div
          style={{
            padding: 14,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.04)",
            marginBottom: 12,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Destination</div>
          <div style={{ opacity: 0.85, fontSize: 14 }}>
            Mode: <b>{TEST_MODE ? "TEST" : "PROD"}</b>
            <br />
            To: <b>{TEST_MODE ? TEST_TO_ENS : account || "(connect wallet)"}</b>
          </div>

          <div style={{ fontWeight: 800, marginTop: 12, marginBottom: 6 }}>Payload Preview</div>
          <div style={{ opacity: 0.85, fontSize: 13, wordBreak: "break-word" }}>
            {ethscriptionPayload}
          </div>

          <div style={{ marginTop: 10, opacity: 0.7, fontSize: 13 }}>
            Size: {payloadBytes.toLocaleString()} bytes (max {MAX_DATA_URI_BYTES.toLocaleString()}).
          </div>
        </div>

        <Button onClick={mintEthscription} disabled={!account || !ETHSCRIPTIONS_TESTING_ENABLED}>
          Mint Ethscription (Test)
        </Button>

        {/* ===== Debug / Status ===== */}
        {status && <p style={{ marginTop: 14, opacity: 0.85 }}>{status}</p>}

        {txHash && (
          <p style={{ marginTop: 12 }}>
            TX:{" "}
            <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">
              {txHash}
            </a>
            <br />
            <span style={{ opacity: 0.7 }}>
              On Etherscan: open <b>Input Data</b> → <b>View Input As</b> → <b>UTF-8</b>.
            </span>
          </p>
        )}

        {error && <p style={{ marginTop: 16, color: "#ff8080" }}>{error}</p>}

        <p style={{ marginTop: 32, opacity: 0.6 }}>
          Note: ERC-721 mint remains parked. This button only tests calldata-based Ethscriptions style
          transactions.
        </p>
      </div>
    </main>
  );
}

/**
 * COMMIT MESSAGE:
 * feat: enable calldata ethscription test mint to bitbrains.eth (no ENS resolver)
 */
