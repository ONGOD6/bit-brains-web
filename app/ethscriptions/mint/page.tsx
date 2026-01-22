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
  const MAX_BYTES_DEFAULT = 128 * 1024;

  /**
   * IMPORTANT:
   * - Ownership of an Ethscription is derived from the SENDER (`from`)
   * - `to` is only a calldata sink (0 ETH)
   */
  const DEFAULT_SINK_TO =
    "0x8ba1f109551bD432803012645Ac136ddd64DBA72"; // safe EOA-style sink

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

  /* ---------- sync wallet ---------- */
  useEffect(() => {
    if (!hasProvider) return;

    const handleAccountsChanged = (accounts: any) => {
      setAccount(accounts?.[0] ?? "");
      setTxHash("");
    };

    const handleChainChanged = (cid: any) => {
      setChainId(String(cid ?? ""));
      setTxHash("");
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
      setStatus("No wallet detected. Use MetaMask or another EVM wallet.");
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
      setStatus("Choose a file first.");
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
      setHexData(bytesToHex(bytes));

      setStatus("Payload ready. Next: send inscription transaction.");
    } catch (e: any) {
      setStatus(e?.message || "Failed to build payload.");
    }
  }

  /* ---------- send tx ---------- */
  async function submitInscriptionTx() {
    setStatus("");
    setTxHash("");

    if (!account) {
      setStatus("Connect your wallet first.");
      return;
    }

    if (!hexData || !dataUrl) {
      setStatus("Build the payload first.");
      return;
    }

    if (!sinkToOk) {
      setStatus("Invalid calldata sink address.");
      return;
    }

    if (sinkTo.toLowerCase() === account.toLowerCase()) {
      setStatus("Sink address cannot be the same as your wallet.");
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
        `Transaction submitted.\nOwner: ${account}\nCalldata sink: ${sinkTo}`
      );
    } catch (e: any) {
      setStatus(e?.message || "Transaction failed.");
    }
  }

  return (
    <main className="page-shell">
      <section className="content-shell">
        <div style={{ maxWidth: 860 }}>

          {/* ---------- PICKLE PUNKS HERO ---------- */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <img
              src="/IMG_2082.jpeg"
              alt="Pickle Punks"
              style={{
                width: "100%",
                maxWidth: 760,
                borderRadius: 16,
                border: "2px solid rgba(255,255,255,0.18)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.45)",
              }}
            />

            <div style={{ marginTop: "1rem" }}>
              <div style={{ fontSize: 26, fontWeight: 900 }}>
                Pickle Punks
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  opacity: 0.9,
                }}
              >
                Minting Soon
              </div>
            </div>
          </div>

          {/* ---------- ETHSCRIPTIONS HEADER ---------- */}
          <h1 className="page-title">Ethscriptions Mint</h1>
          <p className="page-subtitle">Community Open</p>

          <p style={{ opacity: 0.85, lineHeight: 1.6 }}>
            <strong>Ethscriptions mint is now open.</strong>
            <br />
            Assets are inscribed directly to Ethereum calldata.
            <br />
            No protocol fee — gas only.
          </p>

          {/* ---------- WALLET ---------- */}
          <button onClick={connectWallet}>
            {account ? "Wallet Connected" : "Connect Wallet"}
          </button>

          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
            On mobile, open inside your wallet’s in-app browser.
          </div>

          {/* ---------- COMPATIBLE WALLETS ---------- */}
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem 0.9rem",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.04)",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <div style={{ fontWeight: 800 }}>Compatible Wallets</div>
            <ul style={{ marginTop: 8 }}>
              <li>MetaMask (mobile & desktop)</li>
              <li>Rabby Wallet</li>
              <li>Coinbase Wallet (in-app browser)</li>
              <li>Brave Wallet</li>
              <li>Other EVM wallets with injected providers</li>
            </ul>
          </div>

          {/* ---------- SINK ---------- */}
          <div style={{ marginTop: "1rem" }}>
            <strong>Calldata Sink Address</strong>
            <input
              value={sinkTo}
              onChange={(e) => setSinkTo(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          {/* ---------- FILE ---------- */}
          <div style={{ marginTop: "1rem" }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />

            {file && (
              <div>
                {file.name} ({formatBytes(file.size)})
              </div>
            )}

            <button onClick={buildPayload}>
              Build Payload
            </button>

            <button
              onClick={submitInscriptionTx}
              disabled={!account || !hexData}
            >
              Send Inscription Tx
            </button>
          </div>

          {/* ---------- STATUS ---------- */}
          {status && <pre>{status}</pre>}
          {txHash && <div>Tx: {txHash}</div>}

        </div>
      </section>
    </main>
  );
}
