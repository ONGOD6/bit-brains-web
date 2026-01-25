"use client";

import React, { useEffect, useMemo, useState } from "react";

/**
 * Pickle Punks — Ethscriptions Image Mint (Simple / Option A)
 *
 * ✅ Banner on top
 * ✅ No payload preview
 * ✅ No “download image” button (not needed for minting)
 * ✅ Build-safe: no window usage during prerender, no for..of on Uint8Array
 * ✅ Sends a 0 ETH tx with calldata to a configurable destination (default burn/sink)
 *
 * File: /app/picklepunkss/mint/page.tsx
 */

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any }) => Promise<any>;
      on?: (event: string, cb: (...args: any[]) => void) => void;
      removeListener?: (event: string, cb: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

/* ================= CONFIG ================= */
const DEFAULT_SINK = "0x000000000000000000000000000000000000dEaD"; // burn/sink address

/* ================= HELPERS ================= */
function isAddress(addr: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr.trim());
}

// Build-safe: no for..of on Uint8Array
function utf8ToHex(str: string) {
  const enc = new TextEncoder().encode(str);
  let hex = "0x";
  for (let i = 0; i < enc.length; i++) {
    const h = enc[i].toString(16).padStart(2, "0");
    hex += h;
  }
  return hex;
}

// Canonical Ethscriptions payload:
// data:application/json,<urlencoded JSON>
function makeEthscriptionsDataURI(jsonObj: any) {
  const json = JSON.stringify(jsonObj);
  return `data:application/json,${encodeURIComponent(json)}`;
}

export default function PicklePunksMintPage() {
  const [mounted, setMounted] = useState(false);
  const [account, setAccount] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [sink, setSink] = useState<string>(DEFAULT_SINK);

  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [mime, setMime] = useState<string>("");
  const [imageDataUrl, setImageDataUrl] = useState<string>(""); // data:image/...;base64,...

  const [isMinting, setIsMinting] = useState(false);

  // Prevent Next prerender “window is not defined”
  useEffect(() => {
    setMounted(true);
  }, []);

  const hasEthereum = useMemo(() => {
    if (!mounted) return false;
    return typeof window !== "undefined" && !!window.ethereum;
  }, [mounted]);

  // Keep wallet state updated
  useEffect(() => {
    if (!hasEthereum) return;

    const eth = window.ethereum!;
    const refresh = async () => {
      try {
        const accounts = await eth.request({ method: "eth_accounts" });
        const acc = Array.isArray(accounts) && accounts.length ? accounts[0] : "";
        setAccount(acc || "");

        const cid = await eth.request({ method: "eth_chainId" });
        setChainId(typeof cid === "string" ? cid : "");
      } catch {
        // ignore
      }
    };

    refresh();

    const onAccountsChanged = (accs: string[]) => {
      setAccount(Array.isArray(accs) && accs.length ? accs[0] : "");
    };
    const onChainChanged = (cid: string) => {
      setChainId(cid);
    };

    eth.on?.("accountsChanged", onAccountsChanged);
    eth.on?.("chainChanged", onChainChanged);

    return () => {
      eth.removeListener?.("accountsChanged", onAccountsChanged);
      eth.removeListener?.("chainChanged", onChainChanged);
    };
  }, [hasEthereum]);

  const short = (addr: string) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "");

  async function connectWallet() {
    setError("");
    setStatus("");
    if (!hasEthereum) {
      setError("MetaMask not detected. Open this page inside the MetaMask browser.");
      return;
    }
    try {
      const eth = window.ethereum!;
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      const acc = Array.isArray(accounts) && accounts.length ? accounts[0] : "";
      setAccount(acc || "");

      const cid = await eth.request({ method: "eth_chainId" });
      setChainId(typeof cid === "string" ? cid : "");
    } catch (e: any) {
      setError(e?.message || "Wallet connection failed.");
    }
  }

  async function onPickFile(file: File | null) {
    setError("");
    setStatus("");

    if (!file) {
      setFileName("");
      setFileSize(0);
      setMime("");
      setImageDataUrl("");
      return;
    }

    setFileName(file.name || "image");
    setFileSize(file.size || 0);
    setMime(file.type || "image/png");

    // Use FileReader to safely produce a base64 data URL in-browser
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setImageDataUrl(result);
    };
    reader.onerror = () => {
      setError("Failed to read image. Try a smaller PNG.");
      setImageDataUrl("");
    };
    reader.readAsDataURL(file);
  }

  const canMint = !!account && !!imageDataUrl && isAddress(sink) && !isMinting;

  async function mintEthscription() {
    setError("");
    setStatus("");

    if (!hasEthereum) {
      setError("MetaMask not detected. Open inside MetaMask browser.");
      return;
    }
    if (!account) {
      setError("Connect your wallet first.");
      return;
    }
    if (!imageDataUrl) {
      setError("Upload an image first.");
      return;
    }
    if (!isAddress(sink)) {
      setError("Destination address is invalid. Must be a 0x… address (40 hex chars).");
      return;
    }

    try {
      setIsMinting(true);
      setStatus("Preparing calldata…");

      // ✅ Option A payload (simple & consistent)
      const payload = {
        type: "bitbrains.ethscriptions.image",
        version: "1.0",
        image: {
          mime: mime || "image/png",
          data: imageDataUrl, // already base64 data URL
          name: fileName || "picklepunks.png",
          size: fileSize || 0,
        },
        site: "https://bitbrains.us",
        timestamp: new Date().toISOString(),
      };

      const dataUri = makeEthscriptionsDataURI(payload);
      const txData = utf8ToHex(dataUri);

      setStatus("Sending transaction… confirm in MetaMask.");

      const eth = window.ethereum!;
      // Important: gas will be estimated by wallet; if it fails, user can try again.
      const txHash = await eth.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: sink,
            value: "0x0",
            data: txData,
          },
        ],
      });

      setStatus(`Sent! Tx: ${txHash}`);
    } catch (e: any) {
      const msg = e?.message || "Transaction failed.";
      setError(msg);
      setStatus("");
    } finally {
      setIsMinting(false);
    }
  }

  const networkLabel = useMemo(() => {
    if (!chainId) return "";
    // mainnet = 0x1
    if (chainId === "0x1") return "Ethereum Mainnet";
    return `Chain ${chainId}`;
  }, [chainId]);

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        {/* Banner */}
        <img
          src="/IMG_2082.jpeg"
          alt="Pickle Punks"
          style={styles.banner}
        />

        <div style={styles.header}>
          <h1 style={styles.h1}>Pickle Punks — Mint</h1>
          <p style={styles.sub}>
            Wallet connect → upload image → mint Ethscription (calldata).
          </p>
        </div>

        {/* Step 1 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>Step 1 — Connect Wallet</h2>

          {!hasEthereum ? (
            <p style={styles.muted}>
              Open this page inside the <b>MetaMask in-app browser</b> to mint.
            </p>
          ) : account ? (
            <div style={styles.row}>
              <div style={styles.pill}>
                Connected: <b>{short(account)}</b>
              </div>
              {networkLabel ? (
                <div style={styles.pillMuted}>{networkLabel}</div>
              ) : null}
            </div>
          ) : (
            <button style={styles.btn} onClick={connectWallet}>
              Connect MetaMask
            </button>
          )}
        </section>

        {/* Step 2 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>Step 2 — Upload Image</h2>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => onPickFile(e.target.files?.[0] || null)}
            style={styles.file}
          />

          {fileName ? (
            <p style={styles.muted}>
              Loaded: <b>{fileName}</b> ({fileSize} bytes)
            </p>
          ) : (
            <p style={styles.muted}>Choose a small PNG/JPG to test.</p>
          )}

          {imageDataUrl ? (
            <div style={styles.previewWrap}>
              <img src={imageDataUrl} alt="Preview" style={styles.previewImg} />
            </div>
          ) : null}
        </section>

        {/* Step 3 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>Step 3 — Mint</h2>

          <label style={styles.label}>Destination (sink)</label>
          <input
            value={sink}
            onChange={(e) => setSink(e.target.value)}
            placeholder={DEFAULT_SINK}
            style={styles.input}
            inputMode="text"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />

          <p style={styles.note}>
            Default is a burn/sink address so MetaMask is less likely to block “data”
            transfers to internal/self accounts. You can paste a different public address
            if you want to test (ex: Vitalik), but the standard Ethscriptions pattern is
            a sink-style tx that carries the calldata.
          </p>

          <button
            style={{
              ...styles.btnPrimary,
              opacity: canMint ? 1 : 0.5,
              cursor: canMint ? "pointer" : "not-allowed",
            }}
            onClick={mintEthscription}
            disabled={!canMint}
          >
            {isMinting ? "Minting…" : "Mint Ethscription (Calldata)"}
          </button>

          {status ? <p style={styles.status}>{status}</p> : null}
          {error ? <p style={styles.error}>{error}</p> : null}
        </section>

        <div style={styles.footer}>
          <div style={styles.footerRow}>
            <span style={styles.footerKey}>Commit message:</span>
            <span style={styles.footerVal}>
              feat: simplify picklepunks mint; remove payload preview; add sink address + build-safe calldata
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ================= STYLES ================= */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#07070a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    color: "#fff",
  },
  card: {
    width: "100%",
    maxWidth: 720,
    background: "rgba(20,20,26,0.85)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
  },
  banner: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  header: {
    padding: "18px 18px 0 18px",
  },
  h1: {
    margin: "0 0 6px 0",
    fontSize: 28,
    letterSpacing: 0.2,
  },
  sub: {
    margin: 0,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.35,
  },
  section: {
    padding: 18,
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  h2: {
    margin: "0 0 10px 0",
    fontSize: 20,
  },
  row: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  pill: {
    padding: "8px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.10)",
    fontSize: 14,
  },
  pillMuted: {
    padding: "8px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
  },
  muted: {
    margin: "10px 0 0 0",
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.35,
  },
  file: {
    width: "100%",
    marginTop: 6,
  },
  previewWrap: {
    marginTop: 12,
    display: "flex",
    justifyContent: "center",
  },
  previewImg: {
    width: 220,
    height: 220,
    objectFit: "contain",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.35)",
    padding: 10,
  },
  label: {
    display: "block",
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.35)",
    color: "#fff",
    outline: "none",
    fontSize: 14,
  },
  note: {
    margin: "10px 0 14px 0",
    color: "rgba(255,255,255,0.68)",
    lineHeight: 1.4,
    fontSize: 13,
  },
  btn: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: 15,
    cursor: "pointer",
    width: "100%",
    maxWidth: 320,
  },
  btnPrimary: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(120, 140, 255, 0.22)",
    color: "#fff",
    fontSize: 15,
    width: "100%",
  },
  status: {
    margin: "12px 0 0 0",
    color: "rgba(255,255,255,0.85)",
  },
  error: {
    margin: "12px 0 0 0",
    color: "#ff5a5a",
    whiteSpace: "pre-wrap",
  },
  footer: {
    padding: 14,
    borderTop: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.20)",
  },
  footerRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
    fontSize: 13,
  },
  footerKey: {
    color: "rgba(255,255,255,0.70)",
  },
  footerVal: {
    color: "rgba(255,255,255,0.92)",
  },
};
