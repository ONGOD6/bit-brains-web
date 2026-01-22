"use client";

import React, { useMemo, useState } from "react";

/* ---------- types ---------- */
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] | object }) => Promise<any>;
      on?: (event: string, cb: (...args: any[]) => void) => void;
      removeListener?: (event: string, cb: (...args: any[]) => void) => void;
    };
  }
}

/* ---------- helpers ---------- */
function bytesToHex(bytes: Uint8Array): string {
  let hex = "0x";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

function shortAddr(addr: string): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

/* ---------- page ---------- */
export default function EthscriptionsMintPage() {
  // Keep your defaults
  const MAX_BYTES_DEFAULT = 128 * 1024; // 131072 bytes (128 kB)

  /**
   * IMPORTANT:
   * Ethscriptions "ownership" is derived from the SENDING WALLET (the `from` field).
   * The `to` address is just a calldata sink (a neutral receiver). Users still own it via `from`.
   *
   * If MetaMask flags some sink addresses, you can swap this to another sink easily.
   * Your earlier version used Vitalik's well-known address:
   * 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
   */
  const DEFAULT_CALLDATA_SINK = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

  // UI assets (you asked for this at top)
  // Put image at: /public/images/pickle-punks-collage.jpeg
  // Then this path works:
  const PICKLE_PUNKS_COLLAGE_SRC = "/images/pickle-punks-collage.jpeg";

  const [account, setAccount] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [maxBytes, setMaxBytes] = useState<number>(MAX_BYTES_DEFAULT);

  const [dataUrl, setDataUrl] = useState<string>("");
  const [hexData, setHexData] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  const [calldataSink, setCalldataSink] = useState<string>(DEFAULT_CALLDATA_SINK);

  const hasProvider = typeof window !== "undefined" && !!window.ethereum;

  const fileSizeOk = useMemo(() => {
    if (!file) return false;
    return file.size <= maxBytes;
  }, [file, maxBytes]);

  const isMainnet = chainId?.toLowerCase() === "0x1";

  /* ---------- wallet ---------- */
  async function connectWallet() {
    setStatus("");
    setTxHash("");

    if (!hasProvider) {
      setStatus("No wallet detected. Use MetaMask / Rabby / Coinbase Wallet in-app browser.");
      return;
    }

    try {
      const accounts: string[] = await window.ethereum!.request({
        method: "eth_requestAccounts",
      });
      const acct = accounts?.[0] ?? "";
      setAccount(acct);

      const cid: string = await window.ethereum!.request({
        method: "eth_chainId",
      });
      setChainId(cid ?? "");

      setStatus("Wallet connected.");
    } catch (e: any) {
      setStatus(e?.message || "Wallet connection failed.");
    }
  }

  /* ---------- build payload ---------- */
  async function buildPayload() {
    setStatus("");
    setTxHash("");

    if (!file) {
      setStatus("Choose an image/file first.");
      return;
    }

    if (file.size > maxBytes) {
      setStatus(`File too large: ${formatBytes(file.size)} (max ${formatBytes(maxBytes)})`);
      return;
    }

    try {
      const uri = await fileToDataUrl(file);
      setDataUrl(uri);

      const enc = new TextEncoder();
      const bytes = enc.encode(uri);
      const hex = bytesToHex(bytes);

      setHexData(hex);
      setStatus("Payload ready. Next: send 0 ETH inscription transaction.");
    } catch (e: any) {
      setStatus(e?.message || "Failed to build payload.");
    }
  }

  /* ---------- send tx ---------- */
  async function submitInscriptionTx() {
    setStatus("");
    setTxHash("");

    if (!hasProvider) {
      setStatus("No wallet provider found.");
      return;
    }

    if (!account) {
      setStatus("Connect your wallet first.");
      return;
    }

    if (!hexData || !dataUrl) {
      setStatus("Build the payload first.");
      return;
    }

    // Safety: warn if not mainnet (Ethscriptions indexing most commonly expected on mainnet)
    if (chainId && !isMainnet) {
      setStatus(
        `Wrong network: chainId=${chainId}. Switch to Ethereum Mainnet (0x1) and try again.`
      );
      return;
    }

    try {
      const hash: string = await window.ethereum!.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: calldataSink,
            value: "0x0",
            data: hexData,
          },
        ],
      });

      setTxHash(hash);
      setStatus(
        "Transaction submitted. Once mined, the Ethscription should index.\n\nNote: Ownership is derived from the SENDING wallet (from address)."
      );
    } catch (e: any) {
      setStatus(e?.message || "Transaction failed.");
    }
  }

  return (
    <main className="page-shell">
      <section className="content-shell">
        <div style={{ maxWidth: 860 }}>
          {/* ===== Pickle Punks Collage Header (TOP OF PAGE) ===== */}
          <div
            style={{
              marginTop: "0.75rem",
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(0,0,0,0.25)",
            }}
          >
            <img
              src={PICKLE_PUNKS_COLLAGE_SRC}
              alt="Pickle Punks Collage"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>

          <div style={{ textAlign: "center", marginTop: "1rem", marginBottom: "1.25rem" }}>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "0.02em" }}>
              Pickle Punks
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.22em",
                opacity: 0.9,
              }}
            >
              MINTING SOON
            </div>
          </div>

          {/* Title row: Ethscriptions Mint + badge */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <h1 className="page-title" style={{ margin: 0 }}>
              Ethscriptions Mint
            </h1>

            {/* badge NEXT to title */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.2rem 0.55rem",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.06)",
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontSize: 12,
                opacity: 0.9,
              }}
            >
              Community Mint Open
            </span>
          </div>

          <p className="page-subtitle" style={{ maxWidth: 820 }}>
            Ethscriptions Mint — Community Open
          </p>

          {/* ---------- COPY ---------- */}
          <p style={{ opacity: 0.85, marginTop: "1rem", lineHeight: 1.65 }}>
            <strong>Ethscriptions mint is now open for community use.</strong>
            <br />
            Assets are inscribed directly to <strong>Ethereum calldata</strong> and indexed as
            Ethscriptions.
            <br />
            Minting is performed directly from your wallet.
            <br />
            <strong>No protocol fee</strong> — gas only.
          </p>

          {/* ---------- WALLET ---------- */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              marginTop: "1.25rem",
              alignItems: "center",
            }}
          >
            <button
              onClick={connectWallet}
              style={{
                padding: "0.65rem 0.95rem",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.22)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.92)",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {account ? "Wallet Connected" : "Connect Wallet"}
            </button>

            <div style={{ opacity: 0.8, fontSize: 13 }}>
              {account ? (
                <>
                  <div>
                    <strong>Account:</strong> {account}
                  </div>
                  <div>
                    <strong>Chain:</strong> {chainId || "--"}{" "}
                    {chainId ? (isMainnet ? "(Mainnet)" : "(Not Mainnet)") : ""}
                  </div>
                </>
              ) : (
                <div>{hasProvider ? "No wallet connected." : "No wallet detected."}</div>
              )}
            </div>
          </div>

          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
            On mobile, open this site inside your wallet’s in-app browser (e.g. MetaMask → Browser).
          </div>

          {/* ---------- Compatible wallets ---------- */}
          <div
            style={{
              marginTop: "1rem",
              padding: "0.85rem 1rem",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.04)",
              fontSize: 13,
              lineHeight: 1.6,
              opacity: 0.95,
            }}
          >
            <strong>Compatible Wallets</strong>
            <div style={{ marginTop: 6, opacity: 0.9 }}>
              • MetaMask (mobile & desktop)
              <br />
              • Rabby Wallet
              <br />
              • Coinbase Wallet (in-app browser)
              <br />
              • Brave Wallet
              <br />
              • Other EVM wallets with injected providers
            </div>
          </div>

          {/* IMPORTANT NOTICE */}
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem 0.9rem",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.04)",
              fontSize: 13,
              opacity: 0.92,
              lineHeight: 1.5,
            }}
          >
            ⚠️ This creates a live Ethereum transaction. Files are permanently inscribed to calldata.
            Gas fees apply. Transactions cannot be reversed.
          </div>

          {/* ---------- LOGIC MINT EXPLAINER ---------- */}
          <div
            style={{
              marginTop: "1.25rem",
              padding: "0.85rem 1rem",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.04)",
              fontSize: 13,
              lineHeight: 1.6,
              opacity: 0.95,
            }}
          >
            <strong>Mint Process (Logic Mint)</strong>
            <br />
            Ethscriptions are minted through a direct Ethereum transaction.
            <br />
            There is no smart contract — the calldata transaction itself is the mint.
            <br />
            Follow steps <strong>1 → 2 → 3</strong> in order below.
            <br />
            <em>
              Note: This mint sends calldata to a neutral sink address (gas only). Ownership is derived
              from the sending wallet (the <strong>from</strong> address).
            </em>
          </div>

          {/* ---------- MetaMask Review Alert explanation ---------- */}
          <div
            style={{
              marginTop: "1rem",
              padding: "0.85rem 1rem",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(0,0,0,0.25)",
              fontSize: 13,
              lineHeight: 1.6,
              opacity: 0.95,
            }}
          >
            <strong>MetaMask “Review Alert” / “High Risk” (Expected)</strong>
            <br />
            MetaMask may warn because this transaction includes a large <strong>data</strong> field.
            That’s normal for Ethscriptions (the data is the artwork/file).
            <br />
            Before confirming, verify:
            <br />
            • <strong>Value:</strong> 0 ETH
            <br />
            • <strong>From:</strong> your connected wallet
            <br />
            • <strong>To:</strong> the calldata sink address shown below
            <br />
            • <strong>Data:</strong> present (this is the inscription)
          </div>

          {/* ---------- FILE + SINK ---------- */}
          <div
            style={{
              marginTop: "0.75rem",
              padding: "1rem",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(0,0,0,0.25)",
            }}
          >
            {/* Sink address row */}
            <div style={{ display: "grid", gap: "0.6rem", marginBottom: "0.85rem" }}>
              <label style={{ fontWeight: 800, opacity: 0.9 }}>Calldata Sink Address</label>
              <input
                value={calldataSink}
                onChange={(e) => setCalldataSink(e.target.value)}
                spellCheck={false}
                style={{
                  width: "100%",
                  padding: "0.55rem 0.65rem",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.92)",
                  fontSize: 13,
                }}
              />
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                This address is a neutral receiver. Your Ethscription ownership is derived from the
                sending wallet (<strong>from</strong>): {account ? shortAddr(account) : "—"}.
              </div>
            </div>

            <div style={{ display: "grid", gap: "0.6rem" }}>
              <label style={{ fontWeight: 700, opacity: 0.9 }}>
                1) Choose file (image recommended)
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setStatus("");
                  setTxHash("");
                  setDataUrl("");
                  setHexData("");
                  const f = e.target.files?.[0] ?? null;
                  setFile(f);
                }}
              />

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <strong>Selected:</strong>{" "}
                  {file ? `${file.name} (${formatBytes(file.size)})` : "--"}
                </div>

                <div>
                  <strong>Max size:</strong>{" "}
                  <input
                    type="number"
                    value={maxBytes}
                    min={1024}
                    step={1024}
                    onChange={(e) => setMaxBytes(Number(e.target.value || MAX_BYTES_DEFAULT))}
                    style={{
                      width: 120,
                      marginLeft: 8,
                      padding: "0.25rem 0.4rem",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.18)",
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.92)",
                    }}
                  />{" "}
                  <span style={{ opacity: 0.75 }}>bytes</span>
                </div>
              </div>

              {file && (
                <div style={{ fontWeight: 700, opacity: fileSizeOk ? 0.9 : 0.6 }}>
                  {fileSizeOk ? "✅ Size OK" : "⚠️ Too large"}
                </div>
              )}

              {/* ---------- ACTIONS ---------- */}
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                  marginTop: "1rem",
                }}
              >
                <button
                  onClick={buildPayload}
                  style={{
                    padding: "0.65rem 0.95rem",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.22)",
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.92)",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  2) Build Data URI → Hex Calldata
                </button>

                <button
                  onClick={submitInscriptionTx}
                  disabled={!account || !hexData}
                  style={{
                    padding: "0.65rem 0.95rem",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.22)",
                    background:
                      !account || !hexData ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
                    color:
                      !account || !hexData ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.92)",
                    fontWeight: 700,
                    cursor: !account || !hexData ? "not-allowed" : "pointer",
                  }}
                >
                  3) Send 0 ETH Inscription Tx
                </button>
              </div>
            </div>
          </div>

          {/* ---------- STATUS ---------- */}
          {status && (
            <div
              style={{
                marginTop: 10,
                padding: "0.75rem 0.9rem",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.82)",
                fontSize: 13,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
              }}
            >
              {status}
            </div>
          )}

          {txHash && (
            <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>
              <strong>Tx Hash:</strong> {txHash}

              {/* ===== Brain Evolution Footer ===== */}
              <div
                style={{
                  marginTop: "4rem",
                  marginBottom: "2rem",
                  width: "50%",
                  maxWidth: "720px",
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
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
