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
  const MAX_BYTES_DEFAULT = 90 * 1024;

  const [account, setAccount] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [maxBytes, setMaxBytes] = useState<number>(MAX_BYTES_DEFAULT);

  const [dataUrl, setDataUrl] = useState<string>("");
  const [hexData, setHexData] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  const hasProvider = typeof window !== "undefined" && !!window.ethereum;

  const fileSizeOk = useMemo(() => {
    if (!file) return false;
    return file.size <= maxBytes;
  }, [file, maxBytes]);

  /* ---------- wallet ---------- */
  async function connectWallet() {
    setStatus("");
    setTxHash("");

    if (!hasProvider) {
      setStatus("No wallet detected. Please install/use MetaMask.");
      return;
    }

    try {
      const accounts: string[] = await window.ethereum!.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts?.[0] ?? "");

      const cid: string = await window.ethereum!.request({
        method: "eth_chainId",
      });
      setChainId(cid ?? "");
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
      setStatus(
        `File too large: ${formatBytes(file.size)} (max ${formatBytes(maxBytes)})`
      );
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

    try {
      const hash: string = await window.ethereum!.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: account,
            value: "0x0",
            data: hexData,
          },
        ],
      });

      setTxHash(hash);
      setStatus("Transaction submitted. Once mined, the Ethscription should index.");
    } catch (e: any) {
      setStatus(e?.message || "Transaction failed.");
    }
  }

  return (
    <main className="page-shell">
      <section className="content-shell">
        <div style={{ maxWidth: 860 }}>
          <h1 className="page-title">Ethscriptions Mint</h1>

          <p className="page-subtitle" style={{ maxWidth: 820 }}>
            Free Ethscriptions for the community.
          </p>

          {/* ---------- PICKLE PREVIEWS ---------- */}
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              flexWrap: "wrap",
              marginTop: "1.5rem",
              alignItems: "flex-start",
            }}
          >
            {/* LEFT (blue) */}
            <div style={{ width: "100%", maxWidth: 320 }}>
              <img
                src="/images/IMG_6299.jpeg"
                alt="Pickle Punk Blue"
                style={{
                  width: "100%",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.15)",
                  display: "block",
                }}
              />
            </div>

            {/* RIGHT (green/yellow) with text ABOVE image (NOT overlay) */}
            <div style={{ width: "100%", maxWidth: 320 }}>
              <div
                style={{
                  textAlign: "center",
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#000",
                  background: "rgba(255,255,255,0.90)",
                  borderRadius: 10,
                  padding: "0.35rem 0.6rem",
                  marginBottom: "0.5rem",
                  border: "1px solid rgba(0,0,0,0.10)",
                }}
              >
                Pickle Punks
              </div>

              <img
                src="/images/IMG_6300.jpeg"
                alt="Pickle Punk Green"
                style={{
                  width: "100%",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.15)",
                  display: "block",
                }}
              />
            </div>
          </div>

          {/* ---------- COPY (fixed) ---------- */}
          <p style={{ opacity: 0.85, marginTop: "1rem" }}>
            • Free Ethscriptions are included with the purchase of a Brain mint
            <br />
            • Page under construction — mint coming soon
          </p>

          {/* ---------- WALLET ---------- */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              marginTop: "1.5rem",
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
                    <strong>Chain:</strong> {chainId || "--"}
                  </div>
                </>
              ) : (
                <div>{hasProvider ? "Wallet detected." : "No wallet detected."}</div>
              )}
            </div>
          </div>

          {/* ---------- FILE ---------- */}
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

                {file && (
                  <div style={{ fontWeight: 700, opacity: fileSizeOk ? 0.9 : 0.6 }}>
                    {fileSizeOk ? "✅ Size OK" : "⚠️ Too large"}
                  </div>
                )}
              </div>
            </div>
          </div>

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
                background: !account || !hexData ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
                color: !account || !hexData ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.92)",
                fontWeight: 700,
                cursor: !account || !hexData ? "not-allowed" : "pointer",
              }}
            >
              3) Send 0 ETH Inscription Tx
            </button>
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
        </div>
      </section>
    </main>
  );
}
