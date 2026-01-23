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

function shortAddr(addr: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function chainName(chainIdHex: string) {
  // minimal mapping, safe fallback
  const map: Record<string, string> = {
    "0x1": "Ethereum Mainnet",
    "0xaa36a7": "Sepolia",
    "0x5": "Goerli",
    "0x89": "Polygon",
    "0xa": "Optimism",
    "0xa4b1": "Arbitrum One",
    "0x2105": "Base",
  };
  return map[chainIdHex] || chainIdHex || "--";
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: "100vh",
    padding: "2.25rem 1.1rem 3rem",
    background:
      "radial-gradient(1200px 700px at 50% -10%, rgba(120,120,255,0.18), rgba(0,0,0,0) 60%), linear-gradient(180deg, #070814 0%, #060610 45%, #05050d 100%)",
    color: "rgba(255,255,255,0.92)",
  },
  container: {
    maxWidth: 980,
    margin: "0 auto",
  },
  card: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.04)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  },
  inner: {
    padding: "1.1rem 1.1rem",
  },
  titleRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "0.75rem",
    marginTop: "1.2rem",
  },
  h1: {
    fontSize: 44,
    lineHeight: 1.05,
    margin: 0,
    fontWeight: 900,
    letterSpacing: "-0.02em",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
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
  },
  subtitle: {
    marginTop: 10,
    opacity: 0.85,
    fontSize: 16,
    lineHeight: 1.6,
    maxWidth: 860,
  },
  sectionTitle: {
    margin: 0,
    fontWeight: 900,
    fontSize: 18,
    letterSpacing: "-0.01em",
  },
  muted: { opacity: 0.75 },
  row: { display: "flex", gap: "0.9rem", flexWrap: "wrap", alignItems: "center" },
  button: {
    padding: "0.85rem 1.05rem",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 900,
    cursor: "pointer",
  },
  buttonPrimary: {
    padding: "0.9rem 1.1rem",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(140,140,255,0.18)",
    color: "rgba(255,255,255,0.95)",
    fontWeight: 900,
    cursor: "pointer",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  pill: {
    borderRadius: 999,
    padding: "0.3rem 0.6rem",
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.05)",
    fontSize: 12,
    fontWeight: 800,
    opacity: 0.9,
  },
  block: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.20)",
    padding: "1rem 1rem",
  },
  hr: { height: 1, background: "rgba(255,255,255,0.10)", border: 0, margin: "1.15rem 0" },
  code: {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: 12,
    opacity: 0.9,
    overflowWrap: "anywhere",
  },
};

export default function EthscriptionsMintPage() {
  const MAX_BYTES_DEFAULT = 128 * 1024; // 131072 bytes
  const CALLDATA_SINK = "0x000000000000000000000000000000000000dEaD";

  const hasProvider = typeof window !== "undefined" && !!window.ethereum;

  const [account, setAccount] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [maxBytes, setMaxBytes] = useState<number>(MAX_BYTES_DEFAULT);

  const [dataUrl, setDataUrl] = useState<string>("");
  const [hexData, setHexData] = useState<string>("");

  const fileSizeOk = useMemo(() => {
    if (!file) return false;
    return file.size <= maxBytes;
  }, [file, maxBytes]);

  const payloadReady = useMemo(() => !!dataUrl && !!hexData, [dataUrl, hexData]);

  function resetPayload() {
    setDataUrl("");
    setHexData("");
    setTxHash("");
  }

  /* ---------- wallet ---------- */
  async function connectWallet() {
    setStatus("");
    setTxHash("");

    if (!hasProvider) {
      setStatus(
        "No wallet detected. Use a compatible EVM wallet with an injected provider (MetaMask, Rabby, Coinbase Wallet in-app browser, Brave Wallet)."
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

    if (!file) {
      setStatus("Choose an image/file first.");
      return;
    }

    // NOTE: file.size is raw bytes, but the DATA URI grows. We enforce the *encoded* bytes too.
    if (file.size > maxBytes) {
      setStatus(`File too large: ${formatBytes(file.size)} (max ${formatBytes(maxBytes)})`);
      return;
    }

    try {
      const uri = await fileToDataUrl(file);
      const enc = new TextEncoder();
      const bytes = enc.encode(uri);

      if (bytes.length > maxBytes) {
        resetPayload();
        setStatus(
          `Payload too large after encoding: ${formatBytes(bytes.length)} (max ${formatBytes(
            maxBytes
          )}). Try a smaller/compressed image.`
        );
        return;
      }

      setDataUrl(uri);
      setHexData(bytesToHex(bytes));

      setStatus(
        "Payload built. Next: send the inscription transaction. (You’ll see a wallet warning sometimes — normal for calldata mints.)"
      );
    } catch (e: any) {
      resetPayload();
      setStatus(e?.message || "Failed to build payload.");
    }
  }

  /* ---------- send tx ---------- */
  async function sendInscription() {
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

    try {
      // ✅ Most compatible Ethscriptions flow:
      // - send 0 ETH
      // - TO is a sink address
      // - DATA contains the bytes of your content
      // Ethscriptions index to the SENDER (from address).
      const hash: string = await window.ethereum!.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: CALLDATA_SINK,
            value: "0x0",
            data: hexData,
          },
        ],
      });

      setTxHash(hash);
      setStatus(
        "Transaction submitted. Once mined, it should index on ethscriptions.com under your sending wallet (from address)."
      );
    } catch (e: any) {
      setStatus(e?.message || "Transaction failed.");
    }
  }

  return (
    <main style={styles.shell}>
      <div style={styles.container}>
        {/* ===================== TOP BANNER (Pickle Punks Collage) ===================== */}
        <div style={{ ...styles.card, overflow: "hidden" }}>
          <img
            src="/IMG_2082.jpeg"
            alt="Pickle Punks Collage"
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <div style={{ fontSize: 34, fontWeight: 950, letterSpacing: "-0.02em" }}>
            Pickle Punks
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.26em",
              opacity: 0.9,
            }}
          >
            MINTING SOON
          </div>
        </div>

        {/* ===================== ETHSCRIPTIONS HEADER ===================== */}
        <div style={styles.titleRow}>
          <h1 style={styles.h1}>Ethscriptions Mint</h1>
          <span style={styles.badge}>Community Mint Open</span>
        </div>

        <p style={styles.subtitle}>
          <strong>Ethscriptions mint is now open for community use.</strong>
          <br />
          Assets are inscribed directly to <strong>Ethereum calldata</strong> and indexed as
          Ethscriptions.
          <br />
          <strong>No protocol fee</strong> — gas only.
        </p>

        <hr style={styles.hr} />

        {/* ===================== WALLET CARD ===================== */}
        <div style={{ ...styles.card, ...styles.inner }}>
          <div style={styles.row}>
            <button style={styles.buttonPrimary} onClick={connectWallet}>
              {account ? "Wallet Connected" : "Connect Wallet"}
            </button>

            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ ...styles.muted, fontSize: 13 }}>
                {hasProvider ? "Injected wallet detected." : "No injected wallet detected."}
              </div>

              {account ? (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <span style={styles.pill}>
                    Account: <span style={styles.code}>{shortAddr(account)}</span>
                  </span>
                  <span style={styles.pill}>Chain: {chainName(chainId)}</span>
                </div>
              ) : (
                <div style={{ ...styles.muted, fontSize: 13 }}>
                  On mobile: open this site inside your wallet’s in-app browser (MetaMask → Browser,
                  Coinbase Wallet → Browser).
                </div>
              )}
            </div>
          </div>

          <hr style={styles.hr} />

          <div style={{ ...styles.block, fontSize: 13, lineHeight: 1.65 }}>
            <div style={styles.sectionTitle}>Compatible Wallets</div>
            <div style={{ marginTop: 10, ...styles.muted }}>
              • MetaMask (desktop + mobile in-app browser)
              <br />
              • Coinbase Wallet (mobile in-app browser)
              <br />
              • Rabby Wallet (desktop)
              <br />
              • Brave Wallet (desktop)
              <br />• Any EVM wallet that injects <span style={styles.code}>window.ethereum</span>
            </div>
          </div>

          <div style={{ ...styles.block, marginTop: 12, fontSize: 13, lineHeight: 1.65 }}>
            <div style={styles.sectionTitle}>Important</div>
            <div style={{ marginTop: 10, ...styles.muted }}>
              ⚠️ This creates a live Ethereum transaction. Data is permanently inscribed to calldata.
              Gas fees apply. Transactions cannot be reversed.
              <br />
              MetaMask warnings about “large data / unusual transaction” are normal for calldata
              mints.
            </div>
          </div>
        </div>

        {/* ===================== MINT FLOW CARD ===================== */}
        <div style={{ ...styles.card, marginTop: "1.25rem" }}>
          <div style={styles.inner}>
            <div style={styles.sectionTitle}>Mint Process</div>
            <div style={{ marginTop: 8, ...styles.muted, fontSize: 13, lineHeight: 1.7 }}>
              Follow steps <strong>1 → 2 → 3</strong> in order.
              <br />
              This uses a calldata <em>sink</em> transaction. The Ethscription indexes to the{" "}
              <strong>sending wallet (from address)</strong>. This is the most compatible flow
              across wallets (including Coinbase).
            </div>

            <hr style={styles.hr} />

            {/* STEP 1 */}
            <div style={{ ...styles.block }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 950, fontSize: 16 }}>1) Choose file (image recommended)</div>
                  <div style={{ ...styles.muted, marginTop: 6, fontSize: 13 }}>
                    Max payload size: <strong>{formatBytes(maxBytes)}</strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ ...styles.muted, fontSize: 12 }}>Max size (bytes)</span>
                  <input
                    type="number"
                    value={maxBytes}
                    min={8 * 1024}
                    step={1024}
                    onChange={(e) => setMaxBytes(Number(e.target.value || MAX_BYTES_DEFAULT))}
                    style={{
                      width: 140,
                      padding: "0.45rem 0.6rem",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.18)",
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.92)",
                      fontWeight: 800,
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setStatus("");
                    setTxHash("");
                    resetPayload();
                    const f = e.target.files?.[0] ?? null;
                    setFile(f);
                  }}
                />
              </div>

              <div style={{ marginTop: 10, ...styles.muted, fontSize: 13 }}>
                <strong>Selected:</strong>{" "}
                {file ? (
                  <>
                    {file.name} ({formatBytes(file.size)}){" "}
                    {fileSizeOk ? "✅" : "⚠️ (too large before encoding)"}
                  </>
                ) : (
                  "--"
                )}
              </div>
            </div>

            {/* STEP 2 */}
            <div style={{ ...styles.block, marginTop: 12 }}>
              <div style={{ fontWeight: 950, fontSize: 16 }}>2) Build Payload (Data URI → Hex)</div>
              <div style={{ ...styles.muted, marginTop: 8, fontSize: 13, lineHeight: 1.65 }}>
                We convert your image to a Data URI and then to hex bytes for calldata.
                <br />
                The 128 kB limit is enforced on the final encoded payload bytes.
              </div>

              <div style={{ marginTop: 12 }}>
                <button style={styles.button} onClick={buildPayload}>
                  Build Payload
                </button>
              </div>

              {payloadReady && (
                <div style={{ marginTop: 12, ...styles.muted, fontSize: 12 }}>
                  ✅ Payload ready ({formatBytes(new TextEncoder().encode(dataUrl).length)}).
                </div>
              )}
            </div>

            {/* STEP 3 */}
            <div style={{ ...styles.block, marginTop: 12 }}>
              <div style={{ fontWeight: 950, fontSize: 16 }}>3) Send Inscription Transaction</div>
              <div style={{ ...styles.muted, marginTop: 8, fontSize: 13, lineHeight: 1.65 }}>
                Recipient (to):{" "}
                <span style={{ ...styles.code, opacity: 0.95 }}>{CALLDATA_SINK}</span>
                <br />
                Using a sink address avoids wallet restrictions (Coinbase “internal accounts cannot include data”).
                <br />
                The Ethscription indexes to your <strong>from</strong> (sender) address.
              </div>

              <div style={{ marginTop: 12 }}>
                <button
                  onClick={sendInscription}
                  style={{
                    ...styles.buttonPrimary,
                    ...(account && payloadReady ? {} : styles.buttonDisabled),
                  }}
                  disabled={!account || !payloadReady}
                >
                  Send Inscription Transaction
                </button>
              </div>
            </div>

            {/* STATUS */}
            {(status || txHash) && (
              <div style={{ ...styles.block, marginTop: 14 }}>
                {status && (
                  <div style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.9, whiteSpace: "pre-wrap" }}>
                    {status}
                  </div>
                )}

                {txHash && (
                  <div style={{ marginTop: 10, fontSize: 13, opacity: 0.95 }}>
                    <strong>Tx Hash:</strong> <span style={styles.code}>{txHash}</span>
                    <div style={{ ...styles.muted, marginTop: 6, fontSize: 12 }}>
                      After it confirms, check ethscriptions.com → wallet view for{" "}
                      <span style={styles.code}>{account}</span>.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ===================== FOOTER GIF ===================== */}
        <div
          style={{
            marginTop: "2.5rem",
            width: "55%",
            maxWidth: 760,
            marginLeft: "auto",
            marginRight: "auto",
            opacity: 0.92,
          }}
        >
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
