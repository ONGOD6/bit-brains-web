"use client";

import React, { useEffect, useMemo, useState } from "react";

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

function isHexAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr.trim());
}

/* ---------- page ---------- */
export default function EthscriptionsMintPage() {
  const MAX_BYTES_DEFAULT = 128 * 1024; // 131072 bytes (128 KB)

  /**
   * Ethscriptions ownership is derived from the SENDER ("from") address.
   * The "to" is simply a calldata sink (0 ETH).
   *
   * We keep this configurable because some wallets may flag certain sink addresses.
   */
  const DEFAULT_SINK_TO = "0x8ba1f109551bD432803012645Ac136ddd64DBA72";

  const [account, setAccount] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [maxBytes, setMaxBytes] = useState<number>(MAX_BYTES_DEFAULT);

  const [dataUrl, setDataUrl] = useState<string>("");
  const [hexData, setHexData] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  const [sinkTo, setSinkTo] = useState<string>(DEFAULT_SINK_TO);

  const hasProvider = typeof window !== "undefined" && !!window.ethereum;

  const fileSizeOk = useMemo(() => {
    if (!file) return false;
    return file.size <= maxBytes;
  }, [file, maxBytes]);

  const sinkToOk = useMemo(() => isHexAddress(sinkTo), [sinkTo]);

  /* ---------- provider listeners ---------- */
  useEffect(() => {
    if (!hasProvider) return;

    const handleAccountsChanged = (accounts: any) => {
      setAccount(accounts?.[0] ?? "");
      setTxHash("");
      setStatus("");
    };

    const handleChainChanged = (cid: any) => {
      setChainId(String(cid ?? ""));
      setTxHash("");
      setStatus("");
    };

    window.ethereum?.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum?.on?.("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [hasProvider]);

  /* ---------- wallet ---------- */
  async function connectWallet() {
    setStatus("");
    setTxHash("");

    if (!hasProvider) {
      setStatus("No wallet detected. Please use MetaMask or another EVM wallet.");
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
      setStatus(
        `File too large: ${formatBytes(file.size)} (max ${formatBytes(maxBytes)})`
      );
      return;
    }

    try {
      const uri = await fileToDataUrl(file);
      setDataUrl(uri);

      const bytes = new TextEncoder().encode(uri);
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

    if (!sinkToOk) {
      setStatus("Invalid calldata sink address. Must be a 0x…40 hex address.");
      return;
    }

    if (sinkTo.toLowerCase() === account.toLowerCase()) {
      setStatus("Calldata sink address cannot be the same as your wallet.");
      return;
    }

    try {
      const hash: string = await window.ethereum!.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: sinkTo,
            value: "0x0",
            data: hexData,
          },
        ],
      });

      setTxHash(hash);
      setStatus(
        "Transaction submitted. Once mined, the Ethscription should index.\n\n" +
          `Owner (from): ${account}\n` +
          `Calldata sink (to): ${sinkTo}`
      );
    } catch (e: any) {
      setStatus(e?.message || "Transaction failed.");
    }
  }

  return (
    <main className="page-shell">
      <section className="content-shell">
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          {/* ---------- PICKLE PUNKS HERO ---------- */}
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <img
              src="/IMG_2082.jpeg"
              alt="Pickle Punks collage"
              style={{
                width: "100%",
                maxWidth: 820,
                borderRadius: 18,
                border: "2px solid rgba(255,255,255,0.18)",
                background: "rgba(0,0,0,0.18)",
                boxShadow: "0 12px 50px rgba(0,0,0,0.55)",
              }}
            />
            <div style={{ marginTop: "1rem" }}>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "0.01em" }}>
                Pickle Punks
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  fontWeight: 900,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  opacity: 0.92,
                }}
              >
                Minting Soon
              </div>
            </div>
          </div>

          {/* ---------- Title row: Ethscriptions Mint + badge ---------- */}
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
            Assets are inscribed directly to <strong>Ethereum calldata</strong> and indexed
            as Ethscriptions.
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
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {account ? "Wallet Connected" : "Connect Wallet"}
            </button>

            <div style={{ opacity: 0.88, fontSize: 13 }}>
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

          <div style={{ fontSize: 12, opacity: 0.78, marginTop: 6 }}>
            On mobile, open this site inside your wallet’s in-app browser (e.g. MetaMask → Browser).
          </div>

          {/* ---------- COMPATIBLE WALLETS ---------- */}
          <div
            style={{
              marginTop: "1rem",
              padding: "0.85rem 1rem",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.04)",
              fontSize: 13,
              lineHeight: 1.55,
              opacity: 0.97,
            }}
          >
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Compatible Wallets</div>
            <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.92 }}>
              <li>MetaMask (mobile & desktop)</li>
              <li>Rabby Wallet</li>
              <li>Coinbase Wallet (in-app browser)</li>
              <li>Brave Wallet</li>
              <li>Other EVM wallets with injected providers</li>
            </ul>
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
            <strong>Mint Process (Logic Mint)</strong>
            <br />
            Ethscriptions are minted through a direct Ethereum transaction.
            <br />
            There is no smart contract — the calldata transaction itself is the mint.
            <br />
            Follow steps <strong>1 → 2 → 3</strong> in order below.
            <br />
            <em>
              Note: This mint sends calldata to a neutral address (gas only). Ownership is derived from the sending
              wallet (the <strong>&quot;from&quot;</strong> address).
            </em>
          </div>

          {/* ---------- ADVANCED: SINK ADDRESS ---------- */}
          <details
            style={{
              marginTop: "1rem",
              padding: "0.85rem 1rem",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(0,0,0,0.22)",
            }}
          >
            <summary style={{ cursor: "pointer", fontWeight: 900, opacity: 0.92 }}>
              Advanced: Calldata Sink Address
            </summary>

            <div style={{ marginTop: 10, fontSize: 13, opacity: 0.9 }}>
              The sink is where calldata is sent (0 ETH). Your wallet remains the owner via the{" "}
              <strong>&quot;from&quot;</strong> field.
            </div>

            <div style={{ marginTop: 10 }}>
              <input
                value={sinkTo}
                onChange={(e) => setSinkTo(e.target.value)}
                placeholder="0x..."
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
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                {sinkToOk ? "✅ Sink address format OK" : "⚠️ Invalid address format"}
              </div>
            </div>
          </details>

          {/* ---------- FILE ---------- */}
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "grid", gap: "0.6rem" }}>
              <label style={{ fontWeight: 900, opacity: 0.9 }}>
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
                <div style={{ fontWeight: 900, opacity: fileSizeOk ? 0.9 : 0.6 }}>
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
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  2) Build Data URI → Hex Calldata
                </button>

                <button
                  onClick={submitInscriptionTx}
                  disabled={!account || !hexData || !sinkToOk}
                  style={{
                    padding: "0.65rem 0.95rem",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.22)",
                    background:
                      !account || !hexData || !sinkToOk
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(255,255,255,0.06)",
                    color:
                      !account || !hexData || !sinkToOk
                        ? "rgba(255,255,255,0.45)"
                        : "rgba(255,255,255,0.92)",
                    fontWeight: 900,
                    cursor: !account || !hexData || !sinkToOk ? "not-allowed" : "pointer",
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
            <div style={{ marginTop: 10, fontSize: 13, opacity: 0.9 }}>
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
