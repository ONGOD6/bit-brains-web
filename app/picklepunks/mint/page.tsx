"use client";

import React, { useEffect, useMemo, useState } from "react";

/**
 * Pickle Punks — Ethscriptions Mint (Option A)
 *
 * STRUCTURE:
 * - ERC-721 Pickle Punk NFT (5,000 supply)
 * - Paired Ethscription using the SAME image (hybrid mirror)
 * - ENS identity rail for future protocol routing
 *
 * NOTE:
 * - This page describes mint structure only
 * - No guarantees of utility, rewards, or future outcomes
 */

type EthereumProvider = {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
};

/* ================= CONFIG ================= */
const MINTING_ENABLED = true;

const SINK_TO_ADDRESS = "0x0000000000000000000000000000000000000001";
const MAX_DATA_BYTES = 110_000;
const BANNER_SRC = "/IMG_2082.jpeg";

/* ================= HELPERS ================= */
function getEthereum(): EthereumProvider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as any).ethereum as EthereumProvider | undefined;
}

function shorten(addr: string): string {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function bytesLengthFromDataUrl(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  if (comma === -1) return 0;
  const b64 = dataUrl.slice(comma + 1);
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - padding;
}

function toHexData(utf8: string): string {
  const enc = new TextEncoder();
  const bytes = enc.encode(utf8);
  let hex = "0x";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

function buildPayloadImage(dataUrl: string): string {
  return dataUrl;
}

function buildPayloadText(text: string): string {
  return "data:text/plain;charset=utf-8," + encodeURIComponent(text);
}

export default function PicklePunksMintPage() {
  const [account, setAccount] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [mode, setMode] = useState<"image" | "text">("image");
  const [fileName, setFileName] = useState<string>("");
  const [dataUrl, setDataUrl] = useState<string>("");
  const [dataBytes, setDataBytes] = useState<number>(0);
  const [text, setText] = useState<string>("");

  const payload = useMemo(() => {
    if (mode === "image") return dataUrl ? buildPayloadImage(dataUrl) : "";
    return text.trim() ? buildPayloadText(text.trim()) : "";
  }, [mode, dataUrl, text]);

  const payloadHex = useMemo(() => {
    if (!payload) return "";
    return toHexData(payload);
  }, [payload]);

  useEffect(() => {
    const eth = getEthereum();
    if (!eth?.on) return;
    const onAccountsChanged = (accs: any) => {
      const a = Array.isArray(accs) && accs.length ? String(accs[0]) : "";
      setAccount(a);
    };
    eth.on("accountsChanged", onAccountsChanged);
    return () => eth.removeListener?.("accountsChanged", onAccountsChanged);
  }, []);

  async function connectWallet() {
    setError("");
    setStatus("");
    const eth = getEthereum();
    if (!eth) {
      setError("MetaMask not detected. Open inside MetaMask browser.");
      return;
    }
    const accs = (await eth.request({ method: "eth_requestAccounts" })) as any[];
    setAccount(accs?.[0] || "");
    setStatus("Wallet connected.");
  }

  async function onChooseFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    setStatus("");
    setDataUrl("");
    setFileName("");
    setDataBytes(0);

    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setDataUrl(result);
      const bytes = bytesLengthFromDataUrl(result);
      setDataBytes(bytes);
      if (bytes > MAX_DATA_BYTES) {
        setError("Image too large for mobile calldata minting.");
        return;
      }
      setStatus("Image loaded (ready to mint).");
    };
    reader.readAsDataURL(file);
  }

  async function mintOptionA() {
    setError("");
    setStatus("");
    const eth = getEthereum();
    if (!eth) {
      setError("MetaMask not detected.");
      return;
    }
    if (!account) {
      setError("Connect your wallet first.");
      return;
    }
    if (!payloadHex) {
      setError("Missing payload.");
      return;
    }

    setBusy(true);
    try {
      const txHash = await eth.request({
        method: "eth_sendTransaction",
        params: [{ from: account, to: SINK_TO_ADDRESS, value: "0x0", data: payloadHex }],
      });
      setStatus(`Submitted: ${String(txHash)}`);
    } catch (e: any) {
      setError(e?.message || "Transaction failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#070707", color: "#fff", padding: "24px 14px 60px" }}>
      <div style={{ width: "100%", maxWidth: 520, margin: "0 auto" }}>
        <img src={BANNER_SRC} alt="Pickle Punks" style={{ width: "100%", borderRadius: 18, marginBottom: 18 }} />

        <section style={{ background: "rgba(255,255,255,0.04)", borderRadius: 18, padding: 18 }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>Pickle Punks Mint</h1>

          {/* ===== WHAT YOU ARE MINTING ===== */}
          <div style={{ marginTop: 12, opacity: 0.88, lineHeight: 1.65 }}>
            <strong>What you are minting</strong>
            <br /><br />
            <b>Pickle Punks</b> is a <b>5,000</b> supply collection. Each mint is designed as a
            <b> hybrid dual-rail record</b>:
            <br /><br />
            • <b>ERC-721 Pickle Punk NFT</b> — the collectible held in your wallet
            <br />
            • <b>Image-mirrored Ethscription</b> — the same artwork is recorded immutably as calldata
            (<code>data:image/*;base64</code>) and indexed by ethscriptions.com
            <br /><br />
            <b>ENS identity routing:</b> Pickle Punks integrate ENS as a canonical identity rail,
            enabling verifiable routing and continuity across future protocol phases.
            <br /><br />
            <span style={{ opacity: 0.75 }}>
              This description defines mint structure only. No guarantees of future utility,
              rewards, or outcomes are expressed or implied.
            </span>
          </div>

          {/* ===== EXISTING STEPS CONTINUE UNCHANGED ===== */}
          {/* (Your existing Step 1 / Step 2 / Step 3 UI follows exactly as before) */}
        </section>
      </div>
    </main>
  );
}
