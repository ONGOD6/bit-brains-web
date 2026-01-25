"use client";

import React, { useMemo, useState } from "react";

/**
 * Pickle Punks — Mint Page (LOCKED / PARKED) + Ethscriptions Test Mode
 *
 * TEST MODE:
 * - Sends to TEST_TO_ENS (bitbrains.eth) AFTER resolving ENS -> 0x address
 *
 * PROD MODE (later):
 * - Sends to connected wallet address (sender)
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
const MINTING_LIVE = false;
const ERC721_ENABLED = false;

// ✅ Allow Ethscriptions testing even while parked
const ETHSCRIPTIONS_TESTING_ENABLED = true;

/* ===================== DESTINATION MODE ===================== */
const TEST_MODE = true;
const TEST_TO_ENS = "bitbrains.eth"; // <-- your ENS for testing

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

/* ===================== ENS RESOLUTION (MAINNET) ===================== */
/**
 * We resolve ENS ourselves so the transaction `to` is a real 0x address.
 * Uses:
 * - ENS Registry: 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e
 * - registry.resolver(node)
 * - resolver.addr(node)
 *
 * No external libs.
 */
const ENS_REGISTRY = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";

// namehash implementation (ENS)
function namehash(name: string): string {
  let node =
    "0x" +
    "00".repeat(32);

  if (!name) return node;

  const labels = name.toLowerCase().split(".");
  for (let i = labels.length - 1; i >= 0; i--) {
    const labelSha = keccak256Utf8(labels[i]); // 32 bytes
    node = keccak256Hex(node + labelSha.slice(2)); // keccak(node + labelSha)
  }
  return node;
}

// Minimal keccak helpers via built-in crypto in browser is not available for keccak,
// so we use ethereum's JSON-RPC `web3_sha3` to hash.
// That keeps it dependency-free.
async function keccak256Hex(hexNo0x: string): Promise<string> {
  const hex = hexNo0x.startsWith("0x") ? hexNo0x : "0x" + hexNo0x;
  const out = (await window.ethereum!.request({
    method: "web3_sha3",
    params: [hex],
  })) as string;
  return out;
}

async function keccak256Utf8(text: string): Promise<string> {
  // Convert utf8 -> hex -> web3_sha3
  const bytes = new TextEncoder().encode(text);
  let hex = "0x";
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
  const out = (await window.ethereum!.request({
    method: "web3_sha3",
    params: [hex],
  })) as string;
  return out;
}

function pad32(hex: string) {
  const h = hex.startsWith("0x") ? hex.slice(2) : hex;
  return "0x" + h.padStart(64, "0");
}

function encodeCall(selector: string, args: string[]) {
  // selector: 4-byte hex string like '0x0178b8bf'
  // args: each must be 32-byte padded
  const sel = selector.startsWith("0x") ? selector.slice(2) : selector;
  const data = "0x" + sel + args.map((a) => (a.startsWith("0x") ? a.slice(2) : a)).join("");
  return data;
}

function decodeAddressFromReturn(data: string) {
  // returns 32-byte word; address is last 20 bytes
  const hex = data.startsWith("0x") ? data.slice(2) : data;
  if (hex.length < 64) return "";
  const last40 = hex.slice(64 - 40, 64);
  return "0x" + last40;
}

async function resolveEnsToAddress(ensName: string): Promise<string> {
  if (!window.ethereum) throw new Error("Wallet not found.");

  // 1) namehash
  // Note: namehash uses keccak, so we build it using web3_sha3
  let node = "0x" + "00".repeat(32);
  const labels = ensName.toLowerCase().split(".");
  for (let i = labels.length - 1; i >= 0; i--) {
    const labelSha = await keccak256Utf8(labels[i]);
    const combined = node + labelSha.slice(2); // concat (no 0x in second)
    node = await keccak256Hex(combined);
  }

  // 2) registry.resolver(bytes32) => address
  // resolver(bytes32) selector = 0x0178b8bf
  const resolverCallData = encodeCall("0x0178b8bf", [pad32(node)]);
  const resolverRet = (await window.ethereum.request({
    method: "eth_call",
    params: [
      {
        to: ENS_REGISTRY,
        data: resolverCallData,
      },
      "latest",
    ],
  })) as string;

  const resolverAddr = decodeAddressFromReturn(resolverRet);
  if (!resolverAddr || resolverAddr === "0x0000000000000000000000000000000000000000") {
    throw new Error(`No resolver set for ${ensName}`);
  }

  // 3) resolver.addr(bytes32) => address
  // addr(bytes32) selector = 0x3b3b57de
  const addrCallData = encodeCall("0x3b3b57de", [pad32(node)]);
  const addrRet = (await window.ethereum.request({
    method: "eth_call",
    params: [
      {
        to: resolverAddr,
        data: addrCallData,
      },
      "latest",
    ],
  })) as string;

  const finalAddr = decodeAddressFromReturn(addrRet);
  if (!finalAddr || finalAddr === "0x0000000000000000000000000000000000000000") {
    throw new Error(`ENS ${ensName} does not resolve to an address`);
  }

  return finalAddr;
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
  const [resolvedTo, setResolvedTo] = useState<string>("");

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

  const payloadBytes = useMemo(() => byteLengthUtf8(ethscriptionPayload), [ethscriptionPayload]);

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
      throw new Error("Wrong network. Please switch MetaMask to Ethereum Mainnet and try again.");
    }
  }

  async function mintEthscription() {
    try {
      setError("");
      setStatus("");
      setTxHash("");

      if (!ETHSCRIPTIONS_TESTING_ENABLED) {
        setError("Ethscriptions testing is currently disabled.");
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
        setError(
          `Payload too large (${payloadBytes} bytes). Max allowed is ${MAX_DATA_URI_BYTES} bytes.`
        );
        return;
      }

      let toAddress = "";
      if (TEST_MODE) {
        setStatus(`Resolving ${TEST_TO_ENS}…`);
        toAddress = await resolveEnsToAddress(TEST_TO_ENS);
        setResolvedTo(toAddress);
      } else {
        toAddress = account;
        setResolvedTo(account);
      }

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

        <h3 style={{ marginTop: 28 }}>Step 1 — Connect Wallet</h3>
        {account ? (
          <p>Connected: {shorten(account)}</p>
        ) : (
          <Button onClick={connectWallet} disabled={!ETHSCRIPTIONS_TESTING_ENABLED && !MINTING_LIVE}>
            Connect Wallet
          </Button>
        )}

        <h3 style={{ marginTop: 24 }}>Step 2 — Mint Pickle Punk (ERC-721)</h3>
        <p style={{ opacity: 0.7 }}>ERC-721 minting will open on March 1.</p>
        <Button disabled={!ERC721_ENABLED}>Mint ERC-721 (Disabled)</Button>

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
            To (ENS): <b>{TEST_MODE ? TEST_TO_ENS : "(sender wallet)"}</b>
            <br />
            To (resolved): <b>{resolvedTo ? resolvedTo : "(not resolved yet)"}</b>
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
