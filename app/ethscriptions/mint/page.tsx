"use client";

import React, { useMemo, useState } from "react";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] | object }) => Promise<any>;
      on?: (event: string, cb: (...args: any[]) => void) => void;
      removeListener?: (event: string, cb: (...args: any[]) => void) => void;
    };
  }
}

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
    reader.readAsDataURL(file); // produces: data:<mime>;base64,<...>
  });
}

export default function EthscriptionsMintPage() {
  // Ethscriptions Quick Start suggests ~90KB max for images.  [oai_citation:0‡Ethscriptions](https://docs.ethscriptions.com/overview/quick-start)
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

  async function connectWallet() {
    setStatus("");
    setTxHash("");

    if (!hasProvider) {
      setStatus("No wallet detected. Please install/use a browser wallet (e.g., MetaMask).");
      return;
    }

    try {
      const accounts: string[] = await window.ethereum!.request({
        method: "eth_requestAccounts",
      });
      const acct = accounts?.[0] ?? "";
      setAccount(acct);

      const cid: string = await window.ethereum!.request({ method: "eth_chainId" });
      setChainId(cid ?? "");
    } catch (e: any) {
      setStatus(e?.message || "Wallet connection failed.");
    }
  }

  async function buildPayload() {
    setStatus("");
    setTxHash("");

    if (!file) {
      setStatus("Choose an image/file first.");
      return;
    }
    if (!account) {
      setStatus("Connect your wallet first.");
      return;
    }
    if (file.size > maxBytes) {
      setStatus(
        `File is too large: ${formatBytes(file.size)}. Max allowed is ${formatBytes(maxBytes)}.`
      );
      return;
    }

    try {
      // Step 1: Data URI (data:image/png;base64,...)
      const uri = await fileToDataUrl(file);
      setDataUrl(uri);

      // Step 2: Convert data URI string to bytes -> hex for tx "data"
      const enc = new TextEncoder();
      const bytes = enc.encode(uri);
      const hex = bytesToHex(bytes);
      setHexData(hex);

      setStatus(
        `Payload ready. Next: send a 0 ETH tx with this hex as calldata (the protocol ignores duplicates).`
      );
    } catch (e: any) {
      setStatus(e?.message || "Failed to build payload.");
    }
  }

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

    // Ethscriptions Quick Start: “Send a 0 ETH transaction … with the hex data in the Hex data field.”  [oai_citation:1‡Ethscriptions](https://docs.ethscriptions.com/overview/quick-start)
    // Safe default: send to yourself (you will own the Ethscription).
    const to = account;

    try {
      const hash: string = await window.ethereum!.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to,
            value: "0x0",
            data: hexData,
          },
        ],
      });

      setTxHash(hash);
      setStatus("Transaction submitted. Once mined, the Ethscription should appear in indexers.");
    } catch (e: any) {
      setStatus(e?.message || "Transaction failed.");
    }
  }

  return (
    <main className="page-shell">
      <section className="content-shell">
        <div style={{ maxWidth: 860 }}>
          <h1 className="page-title" style={{ marginBottom: "0.5rem" }}>
            Ethscriptions Mint
          </h1>

          <p className="page-subtitle" style={{ maxWidth: 820 }}>
            Create an on-chain calldata inscription by sending a <strong>0 ETH</strong> transaction
            whose <strong>calldata</strong> is a <strong>data URI</strong> (commonly an image under
            ~90KB).  [oai_citation:2‡Ethscriptions](https://docs.ethscriptions.com/overview/quick-start)
          </p>

          <div style={{ display: "grid", gap: "0.75rem", marginTop: "1.25rem" }}>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "center",
                flexWrap: "wrap",
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
                      <strong>Chain:</strong> {chainId || "—"}
                    </div>
                  </>
                ) : (
                  <div>{hasProvider ? "Wallet detected." : "No wallet detected."}</div>
                )}
              </div>
            </div>

            <div
              style={{
                marginTop: "0.5rem",
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

                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: 13 }}>
                  <div>
                    <strong>Selected:</strong> {file ? `${file.name} (${formatBytes(file.size)})` : "—"}
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
                  {file ? (
                    <div style={{ fontWeight: 700, opacity: fileSizeOk ? 0.9 : 0.6 }}>
                      {fileSizeOk ? "✅ Size OK" : "⚠️ Too large"}
                    </div>
                  ) : null}
                </div>

                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: 8 }}>
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

                {status ? (
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
                ) : null}

                {txHash ? (
                  <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>
                    <strong>Tx Hash:</strong> {txHash}
                  </div>
                ) : null}
              </div>
            </div>

            {(dataUrl || hexData) && (
              <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
                <div style={{ fontSize: 13, opacity: 0.8 }}>
                  <strong>Preview:</strong> data URI length {dataUrl ? dataUrl.length : 0} chars • hex
                  length {hexData ? hexData.length : 0} chars
                </div>

                {dataUrl ? (
                  <details>
                    <summary style={{ cursor: "pointer", opacity: 0.85, fontWeight: 700 }}>
                      View Data URI (truncated)
                    </summary>
                    <div
                      style={{
                        marginTop: 8,
                        padding: "0.75rem",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(0,0,0,0.25)",
                        fontSize: 12,
                        lineHeight: 1.5,
                        wordBreak: "break-all",
                        maxHeight: 180,
                        overflow: "auto",
                      }}
                    >
                      {dataUrl.slice(0, 1400)}
                      {dataUrl.length > 1400 ? "…(truncated)" : ""}
                    </div>
                  </details>
                ) : null}

                {hexData ? (
                  <details>
                    <summary style={{ cursor: "pointer", opacity: 0.85, fontWeight: 700 }}>
                      View Hex Calldata (truncated)
                    </summary>
                    <div
                      style={{
                        marginTop: 8,
                        padding: "0.75rem",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(0,0,0,0.25)",
                        fontSize: 12,
                        lineHeight: 1.5,
                        wordBreak: "break-all",
                        maxHeight: 180,
                        overflow: "auto",
                      }}
                    >
                      {hexData.slice(0, 1400)}
                      {hexData.length > 1400 ? "…(truncated)" : ""}
                    </div>
                  </details>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
