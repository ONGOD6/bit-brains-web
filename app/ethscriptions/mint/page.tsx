"use client";

import React, { useMemo, useState } from "react";

/* ---------- types ---------- */
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] | object }) => Promise<any>;
    };
  }
}

/* ---------- constants (YOU EDIT THESE) ---------- */

// 1) Your NFT mint contract:
const NFT_CONTRACT = "0x0000000000000000000000000000000000000000"; // <-- TODO: put your ERC-721 mint contract

// 2) 4-byte selector for your mint function.
// Common examples (NOT guaranteed for your contract):
// - mint() => selector unknown
// - mint(uint256) => selector unknown
// - mint(address,uint256) => selector unknown
// You must paste the selector from your contract/ABI tooling.
const NFT_MINT_SELECTOR = "0x00000000"; // <-- TODO: paste 4-byte selector (0x........)

// 3) If your mint is payable (~$10 in ETH), set mint price in wei hex.
// Example: 0.003 ETH = 3000000000000000 wei = 0x0aa87bee538000
// If your mint is FREE, set "0x0".
const NFT_MINT_VALUE_WEI_HEX = "0x0"; // <-- TODO: set price in wei as hex (or 0x0)

// If your mint needs a quantity, set default here:
const DEFAULT_MINT_QTY = 1;

// Ethscriptions “sink” (MetaMask mobile friendly):
const INSCRIPTION_SINK = "0x0000000000000000000000000000000000000000";

// Max payload bytes (encoded Data URI bytes):
const MAX_BYTES_DEFAULT = 128 * 1024;

/* ---------- helpers ---------- */
function isHexAddress(s: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(s);
}

function shortAddr(addr: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

function bytesToHex(bytes: Uint8Array): string {
  let hex = "0x";
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
  return hex;
}

// ABI encoding helpers (no ethers)
// We can encode address + uint256 + uint256 etc. once we already have the selector.
function pad32(hexNo0x: string) {
  return hexNo0x.padStart(64, "0");
}

function strip0x(hex: string) {
  return hex.startsWith("0x") ? hex.slice(2) : hex;
}

function encodeAddress(addr: string) {
  // address is 20 bytes -> left pad to 32 bytes
  const clean = strip0x(addr).toLowerCase();
  return pad32(clean);
}

function encodeUint256(n: number) {
  // safe for small ints like qty; for huge values you’d pass hex string instead
  const hex = n.toString(16);
  return pad32(hex);
}

// Build calldata for: mint(uint256 qty)
// data = selector + qty
function buildMintCalldata_mintUint256(selector4: string, qty: number) {
  const sel = strip0x(selector4);
  return "0x" + sel + encodeUint256(qty);
}

// Build calldata for: mint(address to, uint256 qty)
// data = selector + to + qty
function buildMintCalldata_mintAddressUint256(selector4: string, to: string, qty: number) {
  const sel = strip0x(selector4);
  return "0x" + sel + encodeAddress(to) + encodeUint256(qty);
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

/* ---------- UI styles (kept simple but “full page”) ---------- */
const cardStyle: React.CSSProperties = {
  borderRadius: 18,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.04)",
};

const blockStyle: React.CSSProperties = {
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.22)",
  padding: "1rem",
};

const buttonStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.20)",
  background: "rgba(255,255,255,0.06)",
  color: "rgba(255,255,255,0.92)",
  fontWeight: 900,
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "rgba(140,140,255,0.20)",
  border: "1px solid rgba(255,255,255,0.24)",
};

export default function EthscriptionsMintPage() {
  const hasProvider = typeof window !== "undefined" && !!window.ethereum;

  const [account, setAccount] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");

  const [status, setStatus] = useState<string>("");
  const [nftTxHash, setNftTxHash] = useState<string>("");
  const [inscriptionTxHash, setInscriptionTxHash] = useState<string>("");

  const [mintQty, setMintQty] = useState<number>(DEFAULT_MINT_QTY);
  const [mintStepDone, setMintStepDone] = useState<boolean>(false);

  // Ethscription state
  const [file, setFile] = useState<File | null>(null);
  const [maxBytes, setMaxBytes] = useState<number>(MAX_BYTES_DEFAULT);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [hexData, setHexData] = useState<string>("");

  const fileSizeOk = useMemo(() => {
    if (!file) return false;
    return file.size <= maxBytes;
  }, [file, maxBytes]);

  const payloadReady = useMemo(() => !!dataUrl && !!hexData, [dataUrl, hexData]);

  async function connectWallet() {
    setStatus("");
    if (!hasProvider) {
      setStatus("No wallet detected. Use MetaMask / Rabby / Coinbase Wallet in-app browser.");
      return;
    }
    try {
      const accounts: string[] = await window.ethereum!.request({ method: "eth_requestAccounts" });
      const cid: string = await window.ethereum!.request({ method: "eth_chainId" });
      setAccount(accounts?.[0] ?? "");
      setChainId(cid ?? "");
      setStatus("Wallet connected.");
    } catch (e: any) {
      setStatus(e?.message || "Wallet connection failed.");
    }
  }

  /* =========================
     STEP 1: NFT MINT
  ========================== */
  async function mintNft() {
    setStatus("");
    setNftTxHash("");

    if (!hasProvider) return setStatus("No wallet provider found.");
    if (!account) return setStatus("Connect wallet first.");

    if (!isHexAddress(NFT_CONTRACT)) {
      return setStatus("NFT_CONTRACT is not set to a valid address yet.");
    }
    if (!/^0x[a-fA-F0-9]{8}$/.test(NFT_MINT_SELECTOR)) {
      return setStatus("NFT_MINT_SELECTOR must be a 4-byte selector like 0x12345678.");
    }
    if (mintQty < 1 || mintQty > 20) {
      return setStatus("Mint quantity must be between 1 and 20.");
    }

    try {
      // Pick ONE of these two calldata builders depending on your contract:
      // A) mint(uint256 qty)
      const calldataA = buildMintCalldata_mintUint256(NFT_MINT_SELECTOR, mintQty);

      // B) mint(address to, uint256 qty)
      const calldataB = buildMintCalldata_mintAddressUint256(NFT_MINT_SELECTOR, account, mintQty);

      // ✅ IMPORTANT:
      // Use the one that matches your contract. Start with A. If it reverts, switch to B.
      const USE_VARIANT: "A" | "B" = "A"; // <-- If your mint function is mint(address,uint256), set to "B"

      const data = USE_VARIANT === "A" ? calldataA : calldataB;

      const hash: string = await window.ethereum!.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: NFT_CONTRACT,
            value: NFT_MINT_VALUE_WEI_HEX, // price (or 0x0)
            data,
          },
        ],
      });

      setNftTxHash(hash);
      setMintStepDone(true); // unlock Step 2 immediately after tx submitted
      setStatus("NFT mint submitted. Step 2 unlocked: Mint Ethscription.");
    } catch (e: any) {
      setStatus(e?.message || "NFT mint failed.");
    }
  }

  /* =========================
     STEP 2: ETHSCRIPTION BUILD
  ========================== */
  async function buildPayload() {
    setStatus("");
    setInscriptionTxHash("");

    if (!mintStepDone) return setStatus("Mint the NFT first (Step 1).");
    if (!file) return setStatus("Choose an image/file first.");

    if (file.size > maxBytes) {
      return setStatus(`File too large: ${formatBytes(file.size)} (max ${formatBytes(maxBytes)})`);
    }

    try {
      const uri = await fileToDataUrl(file);
      const enc = new TextEncoder();
      const bytes = enc.encode(uri);

      if (bytes.length > maxBytes) {
        setDataUrl("");
        setHexData("");
        return setStatus(
          `Payload too large after encoding: ${formatBytes(bytes.length)} (max ${formatBytes(
            maxBytes
          )}). Compress the image.`
        );
      }

      setDataUrl(uri);
      setHexData(bytesToHex(bytes));
      setStatus("Payload ready. Now send the inscription transaction.");
    } catch (e: any) {
      setStatus(e?.message || "Failed to build payload.");
    }
  }

  /* =========================
     STEP 3: ETHSCRIPTION SEND
  ========================== */
  async function sendInscription() {
    setStatus("");
    setInscriptionTxHash("");

    if (!hasProvider) return setStatus("No wallet provider found.");
    if (!account) return setStatus("Connect wallet first.");
    if (!mintStepDone) return setStatus("Mint the NFT first (Step 1).");
    if (!payloadReady) return setStatus("Build payload first (Step 2).");

    try {
      // ✅ MetaMask Mobile-friendly sink (zero address), not 0x...dEaD
      const hash: string = await window.ethereum!.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: INSCRIPTION_SINK,
            value: "0x0",
            data: hexData,
          },
        ],
      });

      setInscriptionTxHash(hash);
      setStatus("Ethscription tx submitted. Once mined, it should index to your wallet on ethscriptions.com.");
    } catch (e: any) {
      setStatus(e?.message || "Inscription transaction failed.");
    }
  }

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
        {/* Banner */}
        <div style={cardStyle}>
          <img src="/IMG_2082.jpeg" alt="Pickle Punks Collage" style={{ width: "100%", display: "block" }} />
        </div>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <div style={{ fontSize: 34, fontWeight: 950, letterSpacing: "-0.02em" }}>Pickle Punks</div>
          <div style={{ marginTop: 6, fontSize: 12, fontWeight: 900, letterSpacing: "0.26em", opacity: 0.9 }}>
            MINTING SOON
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: "1.3rem" }}>
          <h1 style={{ margin: 0, fontSize: 44, lineHeight: 1.05, fontWeight: 950, letterSpacing: "-0.02em" }}>
            Mint NFT + Ethscription
          </h1>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.35rem 0.75rem",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontSize: 12,
              opacity: 0.92,
              whiteSpace: "nowrap",
            }}
          >
            Community Mint
          </span>
        </div>

        <p style={{ marginTop: 10, opacity: 0.85, fontSize: 16, lineHeight: 1.6, maxWidth: 860 }}>
          One page flow: <strong>Step 1</strong> mints the NFT (paid mint / proof-of-interaction on-chain).{" "}
          <strong>Step 2–3</strong> mints the Ethscription to the same wallet (calldata transaction; indexes to sender).
        </p>

        {/* Wallet Connect */}
        <div style={{ ...cardStyle, marginTop: "1.2rem" }}>
          <div style={{ padding: "1.1rem" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button style={primaryButtonStyle} onClick={connectWallet}>
                {account ? "Wallet Connected" : "Connect Wallet"}
              </button>

              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ opacity: 0.75, fontSize: 13 }}>
                  {hasProvider ? "Injected wallet detected." : "No injected wallet detected."}
                </div>
                {account ? (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ borderRadius: 999, padding: "0.3rem 0.6rem", border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.05)", fontSize: 12, fontWeight: 900 }}>
                      Account: {shortAddr(account)}
                    </span>
                    <span style={{ borderRadius: 999, padding: "0.3rem 0.6rem", border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.05)", fontSize: 12, fontWeight: 900 }}>
                      Chain: {chainId || "--"}
                    </span>
                  </div>
                ) : (
                  <div style={{ opacity: 0.75, fontSize: 13 }}>
                    Mobile: open this page inside MetaMask/Coinbase Wallet in-app browser.
                  </div>
                )}
              </div>
            </div>

            <div style={{ ...blockStyle, marginTop: 12, fontSize: 13, lineHeight: 1.65, opacity: 0.9 }}>
              ⚠️ This page will create blockchain transactions. Gas fees apply. Transactions cannot be reversed.
            </div>
          </div>
        </div>

        {/* Step 1: NFT */}
        <div style={{ ...cardStyle, marginTop: "1.2rem" }}>
          <div style={{ padding: "1.1rem" }}>
            <div style={{ fontWeight: 950, fontSize: 18 }}>Step 1 — Mint NFT (paid mint / proof-of-interaction)</div>
            <div style={{ marginTop: 8, opacity: 0.8, fontSize: 13, lineHeight: 1.65 }}>
              This calls your ERC-721 mint contract and (optionally) sends the mint price in ETH.
              <br />
              <strong>Contract:</strong> {NFT_CONTRACT}
            </div>

            <div style={{ ...blockStyle, marginTop: 12 }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ fontWeight: 900 }}>Quantity</div>
                <input
                  type="number"
                  value={mintQty}
                  min={1}
                  max={20}
                  onChange={(e) => setMintQty(Number(e.target.value || 1))}
                  style={{
                    width: 110,
                    padding: "0.5rem 0.65rem",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.92)",
                    fontWeight: 900,
                  }}
                />
                <button
                  style={{
                    ...primaryButtonStyle,
                    opacity: account ? 1 : 0.5,
                    cursor: account ? "pointer" : "not-allowed",
                  }}
                  disabled={!account}
                  onClick={mintNft}
                >
                  Mint NFT
                </button>
              </div>

              {nftTxHash && (
                <div style={{ marginTop: 10, fontSize: 13, opacity: 0.9 }}>
                  <strong>NFT Tx:</strong> {nftTxHash}
                </div>
              )}

              {mintStepDone && (
                <div style={{ marginTop: 10, fontSize: 13, opacity: 0.9 }}>
                  ✅ Step 1 submitted. Step 2 is unlocked.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2-3: Ethscription */}
        <div style={{ ...cardStyle, marginTop: "1.2rem" }}>
          <div style={{ padding: "1.1rem" }}>
            <div style={{ fontWeight: 950, fontSize: 18 }}>Step 2–3 — Mint Ethscription</div>
            <div style={{ marginTop: 8, opacity: 0.8, fontSize: 13, lineHeight: 1.65 }}>
              Ethscriptions are minted by a calldata transaction signed by your wallet.
              <br />
              Sink address (MetaMask mobile friendly): <strong>{INSCRIPTION_SINK}</strong>
              <br />
              Ownership/indexing derives from the <strong>sender (from)</strong> wallet.
            </div>

            <div style={{ ...blockStyle, marginTop: 12 }}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>2) Choose file (image recommended)</div>

              <input
                type="file"
                accept="image/*"
                disabled={!mintStepDone}
                onChange={(e) => {
                  setStatus("");
                  setInscriptionTxHash("");
                  setDataUrl("");
                  setHexData("");
                  const f = e.target.files?.[0] ?? null;
                  setFile(f);
                }}
              />

              <div style={{ marginTop: 10, display: "flex", gap: 14, flexWrap: "wrap", fontSize: 13, opacity: 0.85 }}>
                <div>
                  <strong>Selected:</strong> {file ? `${file.name} (${formatBytes(file.size)})` : "--"}
                </div>

                <div>
                  <strong>Max:</strong>{" "}
                  <input
                    type="number"
                    value={maxBytes}
                    min={8 * 1024}
                    step={1024}
                    onChange={(e) => setMaxBytes(Number(e.target.value || MAX_BYTES_DEFAULT))}
                    style={{
                      width: 140,
                      padding: "0.4rem 0.55rem",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.18)",
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.92)",
                      fontWeight: 900,
                    }}
                  />{" "}
                  <span style={{ opacity: 0.75 }}>bytes</span>
                </div>
              </div>

              {file && (
                <div style={{ marginTop: 8, fontWeight: 900, opacity: fileSizeOk ? 0.92 : 0.65, fontSize: 13 }}>
                  {fileSizeOk ? "✅ Size OK (raw file)" : "⚠️ Too large (raw file). Compress it."}
                </div>
              )}

              <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  style={{
                    ...buttonStyle,
                    opacity: mintStepDone && file ? 1 : 0.5,
                    cursor: mintStepDone && file ? "pointer" : "not-allowed",
                  }}
                  disabled={!mintStepDone || !file}
                  onClick={buildPayload}
                >
                  3) Build Payload
                </button>

                <button
                  style={{
                    ...primaryButtonStyle,
                    opacity: mintStepDone && payloadReady ? 1 : 0.5,
                    cursor: mintStepDone && payloadReady ? "pointer" : "not-allowed",
                  }}
                  disabled={!mintStepDone || !payloadReady}
                  onClick={sendInscription}
                >
                  4) Send Inscription Tx
                </button>
              </div>

              {inscriptionTxHash && (
                <div style={{ marginTop: 10, fontSize: 13, opacity: 0.9 }}>
                  <strong>Ethscription Tx:</strong> {inscriptionTxHash}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        {status && (
          <div style={{ ...blockStyle, marginTop: 14, fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {status}
          </div>
        )}

        {/* Footer GIF */}
        <div style={{ marginTop: "2.5rem", width: "55%", maxWidth: 760, marginLeft: "auto", marginRight: "auto", opacity: 0.92 }}>
          <img
            src="/brain-evolution.gif"
            alt="Brain evolution"
            style={{ width: "100%", height: "auto", display: "block", borderRadius: 14 }}
          />
        </div>
      </div>
    </main>
  );
}
