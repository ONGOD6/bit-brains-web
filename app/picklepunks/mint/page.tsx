"use client";

import React, { useMemo, useState } from "react";

/* ---------- types ---------- */
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] | object }) => Promise<any>;
      on?: (event: string, cb: (...args: any[]) => void) => void;
      removeListener?: (event: string, cb: (...args: any[]) => void) => void;
      isCoinbaseWallet?: boolean;
      isMetaMask?: boolean;
    };
  }
}

/* ============================================================
   CONFIG
   ============================================================ */
const ETHS_API_BASE = "https://api.ethscriptions.com/v2";
const MAX_BYTES_DEFAULT = 128 * 1024; // 128 KB

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

function shortAddr(addr: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

async function sha256HexUtf8(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ============================================================
   PAGE
   ============================================================ */
export default function EthscriptionsMintPage() {
  const [account, setAccount] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [maxBytes, setMaxBytes] = useState<number>(MAX_BYTES_DEFAULT);

  const [dataUrl, setDataUrl] = useState<string>("");
  const [hexData, setHexData] = useState<string>("");
  const [payloadSha, setPayloadSha] = useState<string>("");

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
        "No wallet detected. On desktop: install MetaMask/Rabby/Brave Wallet. On mobile: open this site inside your wallet’s in-app browser."
      );
      return;
    }

    // Coinbase Wallet blocks calldata patterns frequently — warn early.
    if (window.ethereum?.isCoinbaseWallet) {
      setStatus("Coinbase Wallet is not supported for Ethscriptions. Use MetaMask / Rabby / Brave Wallet.");
      return;
    }

    try {
      const accounts: string[] = await window.ethereum!.request({ method: "eth_requestAccounts" });
      setAccount(accounts?.[0] ?? "");

      const cid: string = await window.ethereum!.request({ method: "eth_chainId" });
      setChainId(cid ?? "");

      console.log("[ethscriptions] connected", { account: accounts?.[0], chainId: cid });
      setStatus("Wallet connected.");
    } catch (e: any) {
      console.log("[ethscriptions] connect error", e);
      setStatus(e?.message || "Wallet connection failed.");
    }
  }

  /* ---------- build payload (your existing logic, kept) ---------- */
  async function buildPayload() {
    setStatus("");
    setTxHash("");
    setDownloaded(false);
    setPayloadSha("");

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

      // enforce actual encoded payload size (this is the real size that matters)
      if (bytes.length > maxBytes) {
        setHexData("");
        setStatus(
          `Payload too large after encoding: ${formatBytes(bytes.length)} (max ${formatBytes(maxBytes)}). Compress the image and try again.`
        );
        return;
      }

      const hex = bytesToHex(bytes);
      setHexData(hex);

      const sha = await sha256HexUtf8(uri);
      setPayloadSha(sha);

      console.log("[ethscriptions] payload built", {
        fileName: file.name,
        fileBytes: file.size,
        encodedBytes: bytes.length,
        sha256: sha,
      });

      // Optional duplicate check via Ethscriptions API (best-effort)
      try {
        const r = await fetch(`${ETHS_API_BASE}/ethscriptions/exists/${sha}`);
        const j = await r.json();
        console.log("[ethscriptions] exists check", j);

        const exists =
          typeof j?.exists === "boolean"
            ? j.exists
            : typeof j?.result === "boolean"
            ? j.result
            : false;

        if (exists) {
          setStatus("⚠️ Duplicate detected: this exact content already exists as an Ethscription. Choose a different file/content.");
          return;
        }
      } catch (apiErr) {
        console.log("[ethscriptions] exists check skipped/failed", apiErr);
      }

      setStatus("Payload ready. Step 3: (optional) download payload. Step 4: send inscription transaction.");
    } catch (e: any) {
      console.log("[ethscriptions] build error", e);
      setStatus(e?.message || "Failed to build payload.");
    }
  }

  /* ---------- optional download payload ---------- */
  function downloadPayload() {
    setStatus("");

    if (!file || !dataUrl) {
      setStatus("Build the payload first (Step 2).");
      return;
    }

    const safe = file.name.replace(/\s+/g, "_").replace(/[^\w.\-]/g, "");
    downloadTextFile(`${safe}.ethscription-payload.txt`, dataUrl);

    setDownloaded(true);
    setStatus("Payload downloaded. Final step: send the inscription transaction.");
  }

  /* ============================================================
     ✅ FIXED SEND TX (MetaMask-safe + NOT contract deploy)
     - MUST include `to`
     - self-send makes recipient (to) = user wallet
     ============================================================ */
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

    try {
      const txParams: any = {
        from: account,
        to: account, // ✅ IMPORTANT: include `to` so MetaMask doesn't treat it as contract deploy
        value: "0x0",
        data: hexData,
      };

      console.log("[ethscriptions] sending self-send tx", txParams);

      const hash: string = await window.ethereum!.request({
        method: "eth_sendTransaction",
        params: [txParams],
      });

      setTxHash(hash);
      setStatus("Transaction submitted. Once mined, the Ethscription should index under your wallet on ethscriptions.com.");

      console.log("[ethscriptions] tx submitted", { hash });

      // Best-effort: poll the API for indexing by tx hash
      (async () => {
        try {
          for (let i = 0; i < 20; i++) {
            await new Promise((r) => setTimeout(r, 2500));
            const r0 = await fetch(`${ETHS_API_BASE}/ethscriptions/${hash}`);
            if (!r0.ok) continue;
            const j = await r0.json();
            console.log("[ethscriptions] indexed", j);
            setStatus("✅ Indexed on Ethscriptions. Check your wallet view on ethscriptions.com.");
            break;
          }
        } catch (e) {
          console.log("[ethscriptions] poll error", e);
        }
      })();
    } catch (e: any) {
      console.log("[ethscriptions] tx error", e);
      setStatus(e?.message || "Transaction failed.");
    }
  }

  return (
    <main className="page-shell">
      <section className="content-shell">
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          {/* ===================== PICKLE PUNKS HEADER (TOP) ===================== */}
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

          {/* ---------- Intro copy ---------- */}
          <p style={{ opacity: 0.85, marginTop: "1rem", lineHeight: 1.65 }}>
            <strong>Ethscriptions mint is open for community use.</strong>
            <br />
            Files are encoded into a <strong>Data URI</strong>, then inscribed as <strong>Ethereum calldata</strong>.
            <br />
            <strong>No protocol fee</strong> — gas only.
          </p>

          {/* ---------- Wallet panel ---------- */}
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
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {account ? "Wallet Connected" : "Connect Wallet"}
            </button>

            <div style={{ opacity: 0.9, fontSize: 13 }}>
              {account ? (
                <>
                  <div>
                    <strong>Wallet:</strong> {account} ({shortAddr(account)})
                  </div>
                  <div>
                    <strong>Chain:</strong> {chainId || "--"}{" "}
                    <span style={{ opacity: 0.75 }}>(Ethereum mainnet is recommended)</span>
                  </div>
                </>
              ) : (
                <div>{hasProvider ? "No wallet connected." : "No wallet detected."}</div>
              )}
            </div>
          </div>

          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>
            Mobile tip: open this page inside your wallet’s in-app browser (MetaMask → Browser, Rabby → Dapps).
          </div>

          {/* ---------- Important notice ---------- */}
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
            ⚠️ This creates a live Ethereum transaction. Data is permanently inscribed to calldata. Gas fees apply. Transactions cannot be reversed.
          </div>

          {/* ---------- File + actions card ---------- */}
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
              <label style={{ fontWeight: 800, opacity: 0.95 }}>1) Choose file (image recommended)</label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setStatus("");
                  setTxHash("");
                  setDataUrl("");
                  setHexData("");
                  setPayloadSha("");
                  setDownloaded(false);
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
                <div style={{ fontWeight: 800, opacity: fileSizeOk ? 0.95 : 0.7 }}>
                  {fileSizeOk ? "✅ Size OK" : "⚠️ Too large (must be ≤ max bytes)"}
                </div>
              )}

              {payloadSha && (
                <div style={{ fontSize: 12, opacity: 0.85 }}>
                  <strong>Payload SHA-256:</strong> {payloadSha}
                </div>
              )}

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
                <button
                  onClick={buildPayload}
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
                  2) Build Payload (Data URI → Hex)
                </button>

                <button
                  onClick={downloadPayload}
                  disabled={!payloadReady}
                  style={{
                    padding: "0.65rem 0.95rem",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.22)",
                    background: payloadReady ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                    color: payloadReady ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.45)",
                    fontWeight: 800,
                    cursor: payloadReady ? "pointer" : "not-allowed",
                  }}
                >
                  3) Download Payload File (Optional)
                </button>

                <button
                  onClick={submitInscriptionTx}
                  disabled={!account || !payloadReady}
                  style={{
                    padding: "0.65rem 0.95rem",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.22)",
                    background: !account || !payloadReady ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
                    color: !account || !payloadReady ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.92)",
                    fontWeight: 800,
                    cursor: !account || !payloadReady ? "not-allowed" : "pointer",
                  }}
                >
                  4) Send Inscription Transaction (Self-Send)
                </button>
              </div>

              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8, lineHeight: 1.45 }}>
                <strong>Recipient (to):</strong> {account || "--"}
                <br />
                <span style={{ opacity: 0.85 }}>
                  This uses a self-send so MetaMask treats it as a normal transaction (not contract deployment).
                </span>
              </div>
            </div>
          </div>

          {/* ---------- Status output ---------- */}
          {status && (
            <div
              style={{
                marginTop: 12,
                padding: "0.75rem 0.9rem",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.86)",
                fontSize: 13,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
              }}
            >
              {status}
            </div>
          )}

          {txHash && (
            <div style={{ marginTop: 12, fontSize: 13, opacity: 0.9 }}>
              <strong>Tx Hash:</strong> {txHash}
            </div>
          )}

          <div
            style={{
              marginTop: "3rem",
              marginBottom: "2rem",
              width: "60%",
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
