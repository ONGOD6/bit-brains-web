"use client";

import React, { useMemo, useState } from "react";

/* ============================================================================
  Ethscriptions Mint — Community Open
  - 3-step UX (no payload download step)
  - Uses calldata "sink" address by default for maximum wallet compatibility
  - Optional: contract mode via NEXT_PUBLIC_ETHSCRIPTIONS_CONTRACT
    (if you later learn the exact contract used by another project)
============================================================================ */

/* ---------- types ---------- */
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] | object }) => Promise<any>;
      on?: (event: string, cb: (...args: any[]) => void) => void;
      removeListener?: (event: string, cb: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

/* ---------- constants ---------- */
const MAX_BYTES_DEFAULT = 128 * 1024; // 131072 bytes (128 kB)
const CALLDATA_SINK = "0x000000000000000000000000000000000000dEaD";

// OPTIONAL: If you later find an Ethscriptions “intents/inscribe” contract
// used by other mint sites, you can set it in Vercel env vars and redeploy:
// NEXT_PUBLIC_ETHSCRIPTIONS_CONTRACT=0x...
//
// This file will automatically switch to “contract mode” if it’s set.
const ETHSCRIPTIONS_CONTRACT =
  (process.env.NEXT_PUBLIC_ETHSCRIPTIONS_CONTRACT || "").trim() || "";

// Selector for inscribe(bytes) = 0x449b2cf6 (keccak256("inscribe(bytes)")[:4])
const INSCRIBE_SELECTOR = "0x449b2cf6";

/* ---------- helpers ---------- */
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function isHexAddress(s: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(s);
}

function shortAddr(addr: string) {
  if (!addr) return "";
  if (addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
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

function bytesToHex(bytes: Uint8Array): string {
  let hex = "0x";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) throw new Error("Invalid hex length");
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function pad32(bytes: Uint8Array): Uint8Array {
  const rem = bytes.length % 32;
  if (rem === 0) return bytes;
  const padded = new Uint8Array(bytes.length + (32 - rem));
  padded.set(bytes, 0);
  return padded;
}

function u256(n: number): Uint8Array {
  // simple u256 encoder for small numbers
  const out = new Uint8Array(32);
  let x = n;
  for (let i = 31; i >= 0; i--) {
    out[i] = x & 0xff;
    x = Math.floor(x / 256);
  }
  return out;
}

/**
 * ABI-encode a call to inscribe(bytes data).
 * calldata = selector (4) + offset (32) + len (32) + bytes (padded)
 */
function encodeInscribeBytes(bytes: Uint8Array): string {
  const selectorBytes = hexToBytes(INSCRIBE_SELECTOR); // 4 bytes
  const headOffset = u256(32); // first dynamic arg starts after the head (32 bytes)
  const len = u256(bytes.length);
  const body = pad32(bytes);

  const total = new Uint8Array(
    selectorBytes.length + headOffset.length + len.length + body.length
  );
  let o = 0;
  total.set(selectorBytes, o);
  o += selectorBytes.length;
  total.set(headOffset, o);
  o += headOffset.length;
  total.set(len, o);
  o += len.length;
  total.set(body, o);

  return bytesToHex(total);
}

/* ---------- page ---------- */
export default function EthscriptionsMintPage() {
  const [account, setAccount] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [maxBytes, setMaxBytes] = useState<number>(MAX_BYTES_DEFAULT);

  const [dataUrl, setDataUrl] = useState<string>("");
  const [hexData, setHexData] = useState<string>("");

  const [txHash, setTxHash] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);

  // Default: sink mode (best compatibility). Optional: contract mode if env var set.
  const mintMode: "sink" | "contract" = ETHSCRIPTIONS_CONTRACT ? "contract" : "sink";

  const hasProvider = typeof window !== "undefined" && !!window.ethereum;

  const fileSizeOk = useMemo(() => {
    if (!file) return false;
    return file.size <= maxBytes;
  }, [file, maxBytes]);

  const payloadReady = useMemo(() => !!dataUrl && !!hexData, [dataUrl, hexData]);

  const recipientToShow = useMemo(() => {
    if (mintMode === "contract") return ETHSCRIPTIONS_CONTRACT;
    return CALLDATA_SINK;
  }, [mintMode]);

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
      const accounts: string[] = await window.ethereum!.request({
        method: "eth_requestAccounts",
      });

      const cid: string = await window.ethereum!.request({
        method: "eth_chainId",
      });

      setAccount(accounts?.[0] ?? "");
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
    setHexData("");
    setDataUrl("");

    if (!file) {
      setStatus("Choose an image/file first.");
      return;
    }

    // This is the user-facing “file size” check
    if (file.size > maxBytes) {
      setStatus(
        `File too large: ${formatBytes(file.size)} (max ${formatBytes(maxBytes)}). Try compressing the image.`
      );
      return;
    }

    try {
      const uri = await fileToDataUrl(file);

      const enc = new TextEncoder();
      const bytes = enc.encode(uri);

      // This is the REAL on-chain bytes size check (data URI -> bytes)
      if (bytes.length > maxBytes) {
        setStatus(
          `Payload too large after encoding: ${formatBytes(bytes.length)} (max ${formatBytes(
            maxBytes
          )}). Use a smaller image, more compression, or lower resolution.`
        );
        return;
      }

      // SINK MODE:
      // For eth_sendTransaction, data is the raw bytes (as hex) to put in calldata.
      // Ownership/indexing derives from the SENDER (from address) in common Ethscriptions flows.
      // CONTRACT MODE:
      // If you later set a contract address, we encode inscribe(bytes) calldata.
      const hex =
        mintMode === "contract" ? encodeInscribeBytes(bytes) : bytesToHex(bytes);

      setDataUrl(uri);
      setHexData(hex);

      setStatus(
        `Payload ready (${formatBytes(bytes.length)}). Next: Send inscription transaction.`
      );
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

    if (!payloadReady) {
      setStatus("Build the payload first (Step 2).");
      return;
    }

    // sanity
    if (mintMode === "contract") {
      if (!isHexAddress(ETHSCRIPTIONS_CONTRACT)) {
        setStatus(
          "Contract mode is enabled, but NEXT_PUBLIC_ETHSCRIPTIONS_CONTRACT is not a valid address."
        );
        return;
      }
    }

    try {
      setIsSending(true);

      // Optional: ask wallet for gas estimate to reduce “stuck” confirmations
      let gas: string | undefined = undefined;
      try {
        const estimate: string = await window.ethereum!.request({
          method: "eth_estimateGas",
          params: [
            {
              from: account,
              to: recipientToShow,
              value: "0x0",
              data: hexData,
            },
          ],
        });
        // add ~20% buffer (hex math)
        const g = BigInt(estimate);
        const buffered = (g * 120n) / 100n;
        gas = "0x" + buffered.toString(16);
      } catch {
        // ignore estimate failures (some wallets refuse large-data estimates)
      }

      const params: any = {
        from: account,
        to: recipientToShow,
        value: "0x0",
        data: hexData,
      };
      if (gas) params.gas = gas;

      const hash: string = await window.ethereum!.request({
        method: "eth_sendTransaction",
        params: [params],
      });

      setTxHash(hash);

      if (mintMode === "contract") {
        setStatus(
          "Transaction submitted (contract mode). Once mined, it should index under your wallet address."
        );
      } else {
        setStatus(
          "Transaction submitted (sink mode). Once mined, it should index under your sending wallet (from address) on ethscriptions.com."
        );
      }
    } catch (e: any) {
      setStatus(e?.message || "Transaction failed.");
    } finally {
      setIsSending(false);
    }
  }

  /* ---------- UI bits ---------- */
  const Card = ({ children }: { children: React.ReactNode }) => (
    <div
      style={{
        marginTop: "1rem",
        padding: "1rem",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(0,0,0,0.25)",
      }}
    >
      {children}
    </div>
  );

  const Pill = ({ children }: { children: React.ReactNode }) => (
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
      {children}
    </span>
  );

  const Button = ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={!!disabled}
      style={{
        padding: "0.65rem 0.95rem",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.22)",
        background: disabled ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
        color: disabled ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.92)",
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );

  return (
    <main className="page-shell">
      <section className="content-shell">
        <div style={{ maxWidth: 860 }}>
          {/* ===================== PICKLE PUNKS BANNER (TOP) ===================== */}
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
                alt="Pickle Punks Collage"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>

            <div style={{ marginTop: "0.9rem" }}>
              <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.1 }}>Pickle Punks</div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.22em",
                  opacity: 0.9,
                }}
              >
                MINTING SOON
              </div>
            </div>
          </div>

          {/* ===================== TITLE ===================== */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", flexWrap: "wrap" }}>
            <h1 className="page-title" style={{ margin: 0 }}>
              Ethscriptions Mint
            </h1>
            <Pill>Community Mint Open</Pill>
          </div>

          <p className="page-subtitle" style={{ maxWidth: 820 }}>
            Ethscriptions Mint — Community Open
          </p>

          <p style={{ opacity: 0.85, marginTop: "1rem", lineHeight: 1.65 }}>
            <strong>Ethscriptions mint is open for community use.</strong>
            <br />
            Files are inscribed directly to <strong>Ethereum calldata</strong> and indexed as Ethscriptions.
            <br />
            Minting is performed directly from your connected wallet.
            <br />
            <strong>No protocol fee</strong> — gas only.
          </p>

          {/* ===================== WALLET CONNECT ===================== */}
          <Card>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <Button onClick={connectWallet}>{account ? "Wallet Connected" : "Connect Wallet"}</Button>

              <div style={{ opacity: 0.85, fontSize: 13 }}>
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

            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 10 }}>
              Mobile: open this page inside your wallet’s in-app browser (MetaMask → Browser / Coinbase Wallet → Browser).
            </div>
          </Card>

          {/* ===================== COMPATIBILITY ===================== */}
          <Card>
            <strong>Compatible Wallets</strong>
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, opacity: 0.95 }}>
              • MetaMask (desktop + mobile in-app browser)
              <br />
              • Coinbase Wallet (mobile in-app browser)
              <br />
              • Rabby Wallet (desktop)
              <br />
              • Brave Wallet (desktop)
              <br />
              • Any EVM wallet that injects <code>window.ethereum</code>
            </div>

            <div
              style={{
                marginTop: 12,
                padding: "0.75rem 0.9rem",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.04)",
                fontSize: 13,
                opacity: 0.92,
                lineHeight: 1.55,
              }}
            >
              ⚠️ This creates a live Ethereum transaction. Data is permanently inscribed to calldata. Gas fees apply. Transactions cannot be reversed.
              <br />
              MetaMask warnings like <em>“large data / unusual transaction”</em> are normal for calldata mints.
            </div>
          </Card>

          {/* ===================== MINT PROCESS ===================== */}
          <Card>
            <strong>Mint Process</strong>
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.65, opacity: 0.95 }}>
              Follow steps <strong>1 → 2 → 3</strong> in order.
              <br />
              <em>
                Mode:{" "}
                <strong>{mintMode === "contract" ? "Contract mode" : "Sink mode (recommended)"}</strong>
              </em>
              <br />
              Recipient (to): <strong>{recipientToShow}</strong>
              <br />
              {mintMode === "sink" ? (
                <>
                  Using a sink address avoids Coinbase “internal accounts cannot include data” errors.
                  The Ethscription indexes to your <strong>from</strong> (sender) address.
                </>
              ) : (
                <>
                  Contract mode is enabled because NEXT_PUBLIC_ETHSCRIPTIONS_CONTRACT is set.
                  The call is encoded as <code>inscribe(bytes)</code>.
                </>
              )}
            </div>
          </Card>

          {/* ===================== STEP 1: FILE ===================== */}
          <Card>
            <div style={{ display: "grid", gap: "0.6rem" }}>
              <label style={{ fontWeight: 900, opacity: 0.92 }}>1) Choose file (image recommended)</label>

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

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: 13, opacity: 0.9 }}>
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
                    onChange={(e) => setMaxBytes(clamp(Number(e.target.value || MAX_BYTES_DEFAULT), 1024, 512 * 1024))}
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
                <div style={{ fontWeight: 900, opacity: fileSizeOk ? 0.92 : 0.65, fontSize: 13 }}>
                  {fileSizeOk ? "✅ Size OK" : "⚠️ Too large (compress the image)"}
                </div>
              )}
            </div>
          </Card>

          {/* ===================== STEP 2 + 3 ACTIONS ===================== */}
          <Card>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Button onClick={buildPayload} disabled={!file}>
                2) Build Payload (Data URI → Calldata)
              </Button>

              <Button onClick={submitInscriptionTx} disabled={!account || !payloadReady || isSending}>
                3) Send Inscription Transaction
              </Button>
            </div>

            <div style={{ marginTop: 12, fontSize: 12, opacity: 0.78, lineHeight: 1.55 }}>
              If MetaMask hangs on “Review alert”, try:
              <br />• Use a smaller file (aim under ~80–100KB). Data URI grows vs the original image.
              <br />• Tap “Speed / Advanced” and confirm gas (we try to estimate gas automatically).
              <br />• If you’re in a wallet browser, refresh and reconnect wallet, then rebuild payload.
            </div>
          </Card>

          {/* ===================== STATUS ===================== */}
          {status && (
            <div
              style={{
                marginTop: 12,
                padding: "0.85rem 0.9rem",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.82)",
                fontSize: 13,
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
              }}
            >
              {status}
            </div>
          )}

          {txHash && (
            <div style={{ marginTop: 12, fontSize: 13, opacity: 0.88 }}>
              <strong>Tx Hash:</strong> {txHash}
            </div>
          )}

          {/* ===== Footer GIF ===== */}
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
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
