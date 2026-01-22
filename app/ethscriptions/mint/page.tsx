"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import React, { useEffect, useMemo, useState } from "react";

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

/* ---------------- helpers ---------------- */

function utf8ToHex(str: string): string {
  const enc = new TextEncoder();
  const bytes = enc.encode(str);
  let hex = "0x";
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
  return hex;
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1);
}

function hasEthereum(): boolean {
  return typeof window !== "undefined" && !!window.ethereum;
}

// If user is on iOS Safari, MetaMask is not injected. Best UX: prompt to open in MetaMask app browser.
function metamaskDeepLink(currentUrl: string): string {
  // MetaMask uses: https://metamask.app.link/dapp/<domain>/<path>
  // Keep it simple: pass full URL after /dapp/
  const cleaned = currentUrl.replace(/^https?:\/\//, "");
  return `https://metamask.app.link/dapp/${cleaned}`;
}

function buildPicklePunkDataUri(opts: {
  useEsip6: boolean;
  name: string;
  description: string;
  extra?: Record<string, any>;
}): string {
  const payload = {
    name: opts.name,
    description: opts.description,
    collection: "Pickle Punks",
    artifact: "Ethscription",
    ...opts.extra,
  };

  const json = JSON.stringify(payload);
  const rule = opts.useEsip6 ? ";rule=esip6" : "";
  return `data:application/json${rule},${json}`;
}

/* ---------------- page ---------------- */

export default function EthscriptionsMintPage() {
  const [account, setAccount] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);

  // Form
  const [useEsip6, setUseEsip6] = useState<boolean>(true);
  const [name, setName] = useState<string>("Pickle Punk");
  const [description, setDescription] = useState<string>("Pickle Punks — Ethscription artifact.");

  const ios = useMemo(() => isIOS(), []);
  const injected = useMemo(() => hasEthereum(), [account, chainId, status, txHash]); // recompute on changes

  // Keep account in sync if user changes it in wallet
  useEffect(() => {
    if (!hasEthereum()) return;

    const handleAccounts = (accs: any) => {
      const next = Array.isArray(accs) && accs[0] ? String(accs[0]) : "";
      setAccount(next);
    };
    const handleChain = (cid: any) => {
      setChainId(String(cid ?? ""));
    };

    try {
      window.ethereum?.on?.("accountsChanged", handleAccounts);
      window.ethereum?.on?.("chainChanged", handleChain);
    } catch {}

    return () => {
      try {
        window.ethereum?.removeListener?.("accountsChanged", handleAccounts);
        window.ethereum?.removeListener?.("chainChanged", handleChain);
      } catch {}
    };
  }, []);

  const canMint = useMemo(() => {
    if (!hasEthereum()) return false;
    if (!account) return false;
    if (!name.trim()) return false;
    if (!description.trim()) return false;
    return true;
  }, [account, name, description]);

  async function connectWallet() {
    setStatus("");
    setTxHash("");

    if (!hasEthereum()) {
      // iOS Safari fix: deep link to MetaMask app browser
      if (ios && typeof window !== "undefined") {
        setStatus("MetaMask isn’t injected in iOS Safari. Open this page inside the MetaMask app browser.");
        return;
      }
      setStatus("No injected wallet found. Please use MetaMask (desktop) or open in MetaMask app browser.");
      return;
    }

    try {
      setIsConnecting(true);

      const accounts = (await window.ethereum!.request({
        method: "eth_requestAccounts",
      })) as string[];

      const cid = (await window.ethereum!.request({ method: "eth_chainId" })) as string;

      setAccount(accounts?.[0] ?? "");
      setChainId(cid ?? "");
      setStatus("");
    } catch (e: any) {
      setStatus(e?.message ?? "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  }

  async function mintEthscription() {
    setStatus("");
    setTxHash("");

    if (!hasEthereum()) {
      setStatus("Wallet not detected. Please open in MetaMask app browser or use desktop MetaMask.");
      return;
    }
    if (!account) {
      setStatus("Connect your wallet first.");
      return;
    }

    try {
      setIsMinting(true);

      const dataUri = buildPicklePunkDataUri({
        useEsip6,
        name: name.trim(),
        description: description.trim(),
        extra: {
          // You can extend later (edition, traits, etc.)
          timestamp: new Date().toISOString(),
        },
      });

      const txParams = {
        from: account,
        to: account, // 🔑 Ethscriptions initial owner = tx.to
        value: "0x0",
        data: utf8ToHex(dataUri),
      };

      setStatus("Submitting transaction…");
      const hash = (await window.ethereum!.request({
        method: "eth_sendTransaction",
        params: [txParams],
      })) as string;

      setTxHash(hash);
      setStatus("Submitted. If it doesn’t show instantly, wait for confirmations + indexing.");
    } catch (e: any) {
      setStatus(e?.message ?? "Mint failed.");
    } finally {
      setIsMinting(false);
    }
  }

  const openInMetamaskUrl =
    typeof window !== "undefined" ? metamaskDeepLink(window.location.href) : "";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "#fff",
        paddingBottom: "3rem",
      }}
    >
      {/* Banner Header */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1rem 1rem" }}>
        <img
          src="/IMG_2082.jpeg"
          alt="Pickle Punks"
          style={{
            width: "100%",
            borderRadius: 18,
            border: "2px solid #222",
            display: "block",
          }}
        />

        <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
          <div style={{ fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Pickle Punks
          </div>
          <div style={{ opacity: 0.7, letterSpacing: "0.22em", marginTop: 6 }}>MINTING SOON</div>
        </div>
      </section>

      {/* Main Panel */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 1rem" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 18,
            padding: "1.25rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>Ethscriptions Mint</div>
              <div style={{ opacity: 0.75, marginTop: 6, lineHeight: 1.5 }}>
                This mints a <strong>Pickle Punks Ethscription artifact</strong> by inscribing a <code>data:</code> URI
                directly into Ethereum calldata.
              </div>
            </div>

            <div style={{ alignSelf: "center" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "0.45rem 0.75rem",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(0,0,0,0.35)",
                  fontSize: 12,
                  letterSpacing: "0.08em",
                  opacity: 0.9,
                }}
              >
                COMMUNITY MINT OPEN
              </span>
            </div>
          </div>

          {/* Wallet box */}
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              borderRadius: 14,
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                style={{
                  flex: "1 1 220px",
                  padding: "0.85rem 1rem",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#fff",
                  cursor: isConnecting ? "not-allowed" : "pointer",
                  opacity: isConnecting ? 0.6 : 1,
                }}
              >
                {account ? "Wallet Connected" : isConnecting ? "Connecting…" : "Connect MetaMask"}
              </button>

              {/* iOS helper */}
              {!injected && ios && (
                <a
                  href={openInMetamaskUrl}
                  style={{
                    flex: "1 1 220px",
                    textDecoration: "none",
                    textAlign: "center",
                    padding: "0.85rem 1rem",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.06)",
                    color: "#fff",
                    display: "block",
                  }}
                >
                  Open in MetaMask App
                </a>
              )}
            </div>

            <div style={{ marginTop: 10, opacity: 0.8, fontSize: 13, lineHeight: 1.5 }}>
              <div>
                <strong>Status:</strong>{" "}
                {account ? "Wallet connected" : injected ? "Wallet detected" : "No injected wallet detected"}
              </div>
              {account && (
                <div>
                  <strong>Account:</strong> {account}
                </div>
              )}
              {chainId && (
                <div>
                  <strong>Chain:</strong> {chainId}
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <div style={{ marginTop: "1rem" }}>
            <div style={{ display: "grid", gap: "0.9rem" }}>
              <div>
                <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>Name</div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(0,0,0,0.35)",
                    color: "#fff",
                    outline: "none",
                    fontSize: 15,
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>Description</div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(0,0,0,0.35)",
                    color: "#fff",
                    outline: "none",
                    fontSize: 15,
                    resize: "vertical",
                  }}
                />
              </div>

              <label style={{ display: "flex", gap: 10, alignItems: "center", opacity: 0.9 }}>
                <input
                  type="checkbox"
                  checked={useEsip6}
                  onChange={(e) => setUseEsip6(e.target.checked)}
                  style={{ transform: "scale(1.15)" }}
                />
                <span>
                  Allow duplicates (ESIP-6){" "}
                  <span style={{ opacity: 0.7 }}>
                    — keep ON if any content might repeat
                  </span>
                </span>
              </label>

              <button
                onClick={mintEthscription}
                disabled={!canMint || isMinting}
                style={{
                  width: "100%",
                  padding: "0.95rem 1rem",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: canMint ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                  color: "#fff",
                  cursor: !canMint || isMinting ? "not-allowed" : "pointer",
                  opacity: !canMint || isMinting ? 0.55 : 1,
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                }}
              >
                {isMinting ? "Minting…" : "Mint Pickle Punk Ethscription"}
              </button>

              {/* Output */}
              {(status || txHash) && (
                <div
                  style={{
                    marginTop: 6,
                    padding: "0.9rem",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(0,0,0,0.35)",
                    fontSize: 13,
                    lineHeight: 1.55,
                    opacity: 0.95,
                  }}
                >
                  {status && <div style={{ marginBottom: txHash ? 8 : 0 }}>{status}</div>}
                  {txHash && (
                    <div>
                      <strong>Tx Hash:</strong> {txHash}
                    </div>
                  )}
                </div>
              )}

              {/* iOS guidance */}
              {!injected && ios && (
                <div style={{ marginTop: 4, fontSize: 13, opacity: 0.75, lineHeight: 1.5 }}>
                  You’re on iOS Safari. MetaMask does not inject <code>window.ethereum</code> here.
                  Tap <strong>Open in MetaMask App</strong> above to mint.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
