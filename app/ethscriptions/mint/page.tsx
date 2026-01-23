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
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
  return hex;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ---------- page ---------- */
export default function EthscriptionsMintPage() {
  const MAX_BYTES_DEFAULT = 128 * 1024; // 128 kB

  const [account, setAccount] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [maxBytes, setMaxBytes] = useState<number>(MAX_BYTES_DEFAULT);

  const [dataUrl, setDataUrl] = useState<string>("");
  const [hexData, setHexData] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  const [downloaded, setDownloaded] = useState<boolean>(false);

  const hasProvider = typeof window !== "undefined" && !!window.ethereum;

  const fileSizeOk = useMemo(() => {
    if (!file) return false;
    return file.size <= maxBytes;
  }, [file, maxBytes]);

  const payloadReady = useMemo(() => !!dataUrl && !!hexData, [dataUrl, hexData]);

  /* ---------- wallet ---------- */
  async function connectWallet() {
    setStatus("");
    setTxHash("");

    if (!hasProvider) {
      setStatus(
        "No wallet detected. Use MetaMask/Rabby/Brave Wallet (desktop) or open this page inside your wallet’s in-app browser (mobile)."
      );
      return;
    }

    try {
      const accounts: string[] = await window.ethereum!.request({ method: "eth_requestAccounts" });
      setAccount(accounts?.[0] ?? "");

      const cid: string = await window.ethereum!.request({ method: "eth_chainId" });
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
    setDownloaded(false);

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
      const enc = new TextEncoder();
      const bytes = enc.encode(uri);

      // IMPORTANT: enforce limit on ACTUAL encoded bytes (what becomes calldata)
      if (bytes.length > maxBytes) {
        setDataUrl("");
        setHexData("");
        setStatus(
          `Payload too large after encoding: ${formatBytes(bytes.length)} (max ${formatBytes(maxBytes)}). Use a smaller/compressed image.`
        );
        return;
      }

      setDataUrl(uri);
      setHexData(bytesToHex(bytes));

      setStatus("Payload ready. Next: download the payload file (Step 3), then send the inscription tx (Step 4).");
    } catch (e: any) {
      setStatus(e?.message || "Failed to build payload.");
    }
  }

  /* ---------- download payload ---------- */
  function downloadPayload() {
    setStatus("");

    if (!file || !dataUrl) {
      setStatus("Build the payload first.");
      return;
    }

    const safe = file.name.replace(/\s+/g, "_");
    downloadTextFile(`${safe}.ethscription-payload.txt`, dataUrl);
    setDownloaded(true);
    setStatus("Payload downloaded. Final step: send the inscription transaction.");
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
    if (!payloadReady) {
      setStatus("Build the payload first.");
      return;
    }
    if (!downloaded) {
      setStatus("Download the payload file first (Step 3).");
      return;
    }

    try {
      // ✅ IMPORTANT:
      // Set `to` = the connected wallet so the Ethscription indexes under the holder.
      // If `to` is vitalik.eth (or anything else), it will index there.
      const hash: string = await window.ethereum!.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: account, // ✅ recipient = holder
            value: "0x0",
            data: hexData,
          },
        ],
      });

      setTxHash(hash);
      setStatus("Transaction submitted. Once mined, it should index under your connected wallet on ethscriptions.com.");
    } catch (e: any) {
      // MetaMask warning is normal for large calldata / unusual tx patterns.
      setStatus(e?.message || "Transaction failed.");
    }
  }

  return (
    <main className="page-shell">
      <section className="content-shell">
        <div style={{ maxWidth: 860 }}>
          {/* ===================== BANNER HEADER (TOP) ===================== */}
          <div style={{ marginTop: "0.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
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
                alt="Pickle Punks Banner"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>

            <div style={{ marginTop: "0.9rem" }}>
              <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.1 }}>Pickle Punks</div>
              <div style={{ marginTop: 6, fontSize: 12, fontWeight: 800, letterSpacing: "0.22em", opacity: 0.9 }}>
                MINTING SOON
              </div>
            </div>
          </div>

          {/* Title row */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", flexWrap: "wrap" }}>
            <h1 className="page-title" style={{ margin: 0 }}>
              Ethscriptions Mint
            </h1>

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

          <p style={{ opacity: 0.85, marginTop: "1rem", lineHeight: 1.65 }}>
            <strong>Ethscriptions mint is open for community use.</strong>
            <br />
            Files are encoded into <strong>Ethereum calldata</strong> and indexed as Ethscriptions.
            <br />
            <strong>No protocol fee</strong> — gas only.
          </p>

          {/* ---------- WALLET ---------- */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1.5rem", alignItems: "center" }}>
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
                    <strong>Chain:</strong> {chainId || "--"}
                  </div>
                </>
              ) : (
                <div>{hasProvider ? "No wallet connected." : "No wallet detected."}</div>
              )}
            </div>
          </div>

          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
            Mobile: open this site inside your wallet’s in-app browser (MetaMask → Browser, Coinbase Wallet → Browser).
          </div>

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
            <div style={{ marginTop: 8 }}>
              • MetaMask (desktop & mobile)
              <br />• Rabby (desktop)
              <br />• Brave Wallet (desktop)
              <br />• Coinbase Wallet (use in-app browser)
              <br />• Any EVM wallet with an injected provider (window.ethereum)
            </div>
          </div>

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
            ⚠️ This creates a live Ethereum transaction. Data is permanent. Gas fees apply. Transactions cannot be reversed.
            <br />
            <strong>Important:</strong> This mint sets the recipient (<code>to</code>) to your connected wallet so the Ethscription indexes to you.
          </div>

          {/* ---------- STEPS ---------- */}
          <div
            style={{
              marginTop: "0.75rem",
              padding: "1rem",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "grid", gap: "0.6rem" }}>
              <label style={{ fontWeight: 700, opacity: 0.9 }}>1) Choose file (image recommended)</label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setStatus("");
                  setTxHash("");
                  setDataUrl("");
                  setHexData("");
                  setDownloaded(false);
                  setFile(e.target.files?.[0] ?? null);
                }}
              />

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <strong>Selected:</strong> {file ? `${file.name} (${formatBytes(file.size)})` : "--"}
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

              {file && <div style={{ fontWeight: 700, opacity: fileSizeOk ? 0.9 : 0.6 }}>{fileSizeOk ? "✅ Size OK" : "⚠️ Too large"}</div>}

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
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
                  2) Build Payload (Data URI → Hex)
                </button>

                <button
                  onClick={downloadPayload}
                  disabled={!payloadReady}
                  style={{
                    padding: "0.65rem 0.95rem",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.22)",
                    background: !payloadReady ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
                    color: !payloadReady ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.92)",
                    fontWeight: 700,
                    cursor: !payloadReady ? "not-allowed" : "pointer",
                  }}
                >
                  3) Download Payload File
                </button>

                <button
                  onClick={submitInscriptionTx}
                  disabled={!account || !payloadReady || !downloaded}
                  style={{
                    padding: "0.65rem 0.95rem",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.22)",
                    background: !account || !payloadReady || !downloaded ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
                    color: !account || !payloadReady || !downloaded ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.92)",
                    fontWeight: 700,
                    cursor: !account || !payloadReady || !downloaded ? "not-allowed" : "pointer",
                  }}
                >
                  4) Send Inscription Transaction
                </button>
              </div>

              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
                Recipient (to): <span style={{ opacity: 0.95 }}>{account || "-- connect wallet --"}</span>
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
            </div>
          )}

          {/* Footer gif (always visible) */}
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
            <img src="/brain-evolution.gif" alt="Brain evolution" style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
        </div>
      </section>
    </main>
  );
}
