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

/* ---------- config ---------- */
const ETHS_API_BASE = "https://api.ethscriptions.com/v2";

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

async function sha256HexUtf8(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ---------- page ---------- */
export default function EthscriptionsMintPage() {
  const MAX_BYTES_DEFAULT = 128 * 1024;

  const [account, setAccount] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [maxBytes, setMaxBytes] = useState<number>(MAX_BYTES_DEFAULT);

  const [dataUrl, setDataUrl] = useState<string>("");
  const [hexData, setHexData] = useState<string>("");
  const [payloadSha, setPayloadSha] = useState<string>("");

  const [txHash, setTxHash] = useState<string>("");
  const [ethscriptionOwner, setEthscriptionOwner] = useState<string>("");
  const [ethscriptionNumber, setEthscriptionNumber] = useState<string>("");

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
    setEthscriptionOwner("");
    setEthscriptionNumber("");

    if (!hasProvider) {
      setStatus("No wallet detected. Use MetaMask/Rabby/Brave (desktop) or wallet in-app browser (mobile).");
      return;
    }

    try {
      const accounts: string[] = await window.ethereum!.request({ method: "eth_requestAccounts" });
      const acct = accounts?.[0] ?? "";
      setAccount(acct);

      const cid: string = await window.ethereum!.request({ method: "eth_chainId" });
      setChainId(cid ?? "");

      console.log("[ethscriptions] connected", { acct, chainId: cid });
      setStatus("Wallet connected.");
    } catch (e: any) {
      console.log("[ethscriptions] connect error", e);
      setStatus(e?.message || "Wallet connection failed.");
    }
  }

  /* ---------- build payload + duplicate check ---------- */
  async function buildPayload() {
    setStatus("");
    setTxHash("");
    setEthscriptionOwner("");
    setEthscriptionNumber("");

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
      const bytes = new TextEncoder().encode(uri);

      if (bytes.length > maxBytes) {
        setDataUrl("");
        setHexData("");
        setPayloadSha("");
        setStatus(
          `Payload too large after encoding: ${formatBytes(bytes.length)} (max ${formatBytes(maxBytes)}). Compress and try again.`
        );
        return;
      }

      const hex = bytesToHex(bytes);
      const sha = await sha256HexUtf8(uri);

      setDataUrl(uri);
      setHexData(hex);
      setPayloadSha(sha);

      console.log("[ethscriptions] payload built", {
        file: { name: file.name, size: file.size, type: file.type },
        encodedBytes: bytes.length,
        sha256: sha,
      });

      // API duplicate check: /ethscriptions/exists/{sha}
      // (docs show "exists" endpoints under ethscriptions tag)
      const existsRes = await fetch(`${ETHS_API_BASE}/ethscriptions/exists/${sha}`);
      const existsJson = await existsRes.json();
      console.log("[ethscriptions] exists check", { sha, existsJson });

      const exists =
        typeof existsJson?.exists === "boolean"
          ? existsJson.exists
          : typeof existsJson?.result === "boolean"
          ? existsJson.result
          : false;

      if (exists) {
        setStatus("⚠️ This exact content already exists as an Ethscription (duplicate). Choose a different file/content.");
        return;
      }

      setStatus("Payload ready. Next: Send inscription transaction.");
    } catch (e: any) {
      console.log("[ethscriptions] build error", e);
      setStatus(e?.message || "Failed to build payload.");
    }
  }

  /* ---------- send tx (FIXED: self-send so user is OWNER) ---------- */
  async function submitInscriptionTx() {
    setStatus("");
    setTxHash("");
    setEthscriptionOwner("");
    setEthscriptionNumber("");

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
      // ✅ CRITICAL FIX:
      // Ethscriptions initial owner is the transaction RECIPIENT ("to").  [oai_citation:1‡Ethscriptions](https://ethscriptions.com/about?utm_source=chatgpt.com)
      // So we self-send (to = account) to make the user the owner.
      const tx = {
        from: account,
        to: account,
        value: "0x0",
        data: hexData,
      };

      console.log("[ethscriptions] sending tx", tx);

      const hash: string = await window.ethereum!.request({
        method: "eth_sendTransaction",
        params: [tx],
      });

      setTxHash(hash);
      console.log("[ethscriptions] tx submitted", { hash, payloadSha });

      setStatus("Transaction submitted. Waiting for Ethscriptions indexer…");

      // Poll API: GET /ethscriptions/{tx_hash} (ethscription id is tx hash)  [oai_citation:2‡Ethscriptions](https://ethscriptions.com/about?utm_source=chatgpt.com)
      for (let i = 0; i < 25; i++) {
        await new Promise((r) => setTimeout(r, 2500));

        try {
          const r0 = await fetch(`${ETHS_API_BASE}/ethscriptions/${hash}`);
          if (!r0.ok) {
            console.log("[ethscriptions] indexer not ready yet", { attempt: i + 1, status: r0.status });
            continue;
          }

          const j = await r0.json();
          console.log("[ethscriptions] indexed response", j);

          // Different deployments sometimes nest fields; handle both.
          const owner = j?.current_owner || j?.ethscription?.current_owner || "";
          const num =
            j?.ethscription_number?.toString?.() ||
            j?.ethscription?.ethscription_number?.toString?.() ||
            "";

          if (owner) setEthscriptionOwner(owner);
          if (num) setEthscriptionNumber(num);

          setStatus("✅ Minted and indexed. This Ethscription should now appear under your wallet on ethscriptions.com.");
          return;
        } catch (e) {
          console.log("[ethscriptions] poll error", e);
        }
      }

      setStatus("Tx sent, but indexer is slow. Check ethscriptions.com / or retry API lookup in a minute.");
    } catch (e: any) {
      console.log("[ethscriptions] tx error", e);
      setStatus(e?.message || "Transaction failed.");
    }
  }

  return (
    <main style={{ minHeight: "100vh", padding: "1.5rem 1rem" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ marginBottom: "1rem", textAlign: "center" }}>
          <img
            src="/IMG_2082.jpeg"
            alt="Pickle Punks Collage"
            style={{ width: "100%", height: "auto", display: "block", borderRadius: 16 }}
          />
          <div style={{ marginTop: 10, fontSize: 26, fontWeight: 900 }}>Pickle Punks</div>
          <div style={{ marginTop: 6, fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", opacity: 0.8 }}>
            ETHSCRIPTIONS MINT (TEST)
          </div>
        </div>

        <button onClick={connectWallet} style={{ padding: "10px 14px", fontWeight: 800 }}>
          {account ? "Wallet Connected" : "Connect Wallet"}
        </button>

        <div style={{ marginTop: 10, fontSize: 13, opacity: 0.9 }}>
          {account ? (
            <>
              <div>
                <strong>Wallet:</strong> {account} ({shortAddr(account)})
              </div>
              <div>
                <strong>Chain:</strong> {chainId || "--"}
              </div>
            </>
          ) : (
            <div>{hasProvider ? "No wallet connected." : "No wallet detected."}</div>
          )}
        </div>

        <div style={{ marginTop: 18, padding: 14, border: "1px solid rgba(0,0,0,0.15)", borderRadius: 12 }}>
          <label style={{ fontWeight: 800 }}>1) Choose file</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setStatus("");
              setTxHash("");
              setEthscriptionOwner("");
              setEthscriptionNumber("");
              setDataUrl("");
              setHexData("");
              setPayloadSha("");
              setFile(e.target.files?.[0] ?? null);
            }}
            style={{ display: "block", marginTop: 10 }}
          />

          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.9 }}>
            <div>
              <strong>Selected:</strong> {file ? `${file.name} (${formatBytes(file.size)})` : "--"}
            </div>
            <div style={{ marginTop: 6 }}>
              <strong>Max bytes:</strong>{" "}
              <input
                type="number"
                value={maxBytes}
                min={1024}
                step={1024}
                onChange={(e) => setMaxBytes(Number(e.target.value || MAX_BYTES_DEFAULT))}
                style={{ width: 120, marginLeft: 8 }}
              />
            </div>
            {file && <div style={{ marginTop: 6 }}>{fileSizeOk ? "✅ Size OK" : "⚠️ Too large"}</div>}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            <button onClick={buildPayload} style={{ padding: "10px 14px", fontWeight: 800 }}>
              2) Build Payload + Check Duplicate
            </button>

            <button
              onClick={submitInscriptionTx}
              disabled={!account || !payloadReady}
              style={{ padding: "10px 14px", fontWeight: 800, opacity: !account || !payloadReady ? 0.5 : 1 }}
            >
              3) Send Inscription Tx (Self-Send)
            </button>
          </div>

          {payloadSha && (
            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.85 }}>
              <strong>Payload SHA-256:</strong> {payloadSha}
            </div>
          )}
        </div>

        {status && (
          <div style={{ marginTop: 14, padding: 12, borderRadius: 12, border: "1px solid rgba(0,0,0,0.15)" }}>
            <strong>Status:</strong> {status}
          </div>
        )}

        {txHash && (
          <div style={{ marginTop: 10, fontSize: 13 }}>
            <strong>Tx Hash:</strong> {txHash}
          </div>
        )}

        {(ethscriptionOwner || ethscriptionNumber) && (
          <div style={{ marginTop: 10, fontSize: 13 }}>
            {ethscriptionNumber && (
              <div>
                <strong>Ethscription #:</strong> {ethscriptionNumber}
              </div>
            )}
            {ethscriptionOwner && (
              <div>
                <strong>Indexed Owner:</strong> {ethscriptionOwner}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
