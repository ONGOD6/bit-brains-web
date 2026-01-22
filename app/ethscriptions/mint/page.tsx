"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import React, { useMemo, useState } from "react";
import EthereumProvider from "@walletconnect/ethereum-provider";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
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

function isDataUri(s: string): boolean {
  return s.trim().startsWith("data:");
}

function buildJsonDataUri(jsonObj: any): string {
  // NO ESIP-6 here => duplicates NOT allowed by protocol/indexers
  const json = JSON.stringify(jsonObj);
  return `data:application/json,${json}`;
}

function shorten(addr: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/* ---------------- page ---------------- */

type ProviderKind = "walletconnect" | "injected" | "";

export default function EthscriptionsCommunityMintPage() {
  const [providerKind, setProviderKind] = useState<ProviderKind>("");
  const [wcProvider, setWcProvider] = useState<any>(null);
  const [ethersProvider, setEthersProvider] = useState<ethers.BrowserProvider | null>(null);

  const [account, setAccount] = useState<string>("");
  const [chainIdHex, setChainIdHex] = useState<string>("");

  const [status, setStatus] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  const [isConnecting, setIsConnecting] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  // UI mode
  const [mode, setMode] = useState<"paste" | "json">("paste");

  // Paste mode
  const [dataUri, setDataUri] = useState<string>("");

  // JSON mode
  const [name, setName] = useState<string>("Community Ethscription");
  const [description, setDescription] = useState<string>(
    "Minted via Bit Brains Community Ethscriptions tool."
  );
  const [image, setImage] = useState<string>(""); // optional (data:image/... or https://...)

  const injectedAvailable = useMemo(() => typeof window !== "undefined" && !!window.ethereum, []);
  const connected = useMemo(() => !!account && !!ethersProvider, [account, ethersProvider]);

  function resetConnectionState() {
    setProviderKind("");
    setWcProvider(null);
    setEthersProvider(null);
    setAccount("");
    setChainIdHex("");
  }

  async function connectInjected() {
    setStatus("");
    setTxHash("");

    if (!injectedAvailable) {
      setStatus("No injected wallet found. Use WalletConnect.");
      return;
    }

    try {
      setIsConnecting(true);

      const ep = new ethers.BrowserProvider(window.ethereum);
      const accounts = (await ep.send("eth_requestAccounts", [])) as string[];
      const net = await ep.getNetwork();

      setProviderKind("injected");
      setEthersProvider(ep);
      setAccount(accounts?.[0] ?? "");
      setChainIdHex("0x" + Number(net.chainId).toString(16));
      setStatus("Connected (Injected wallet).");
    } catch (e: any) {
      setStatus(e?.message ?? "Failed to connect injected wallet.");
    } finally {
      setIsConnecting(false);
    }
  }

  async function connectWalletConnect() {
    setStatus("");
    setTxHash("");

    // You MUST set this in Vercel Environment Variables
    // Key: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

    if (!projectId) {
      setStatus(
        "Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID. Add it in Vercel → Project → Settings → Environment Variables."
      );
      return;
    }

    try {
      setIsConnecting(true);

      const provider = await EthereumProvider.init({
        projectId,
        showQrModal: true,
        chains: [1], // mainnet
        optionalChains: [1],
        methods: ["eth_sendTransaction", "eth_requestAccounts", "eth_chainId", "personal_sign", "eth_signTypedData_v4"],
        events: ["accountsChanged", "chainChanged", "disconnect"],
      });

      // Connect (opens QR modal / deep link)
      await provider.connect();

      // Wrap into ethers BrowserProvider
      const ep = new ethers.BrowserProvider(provider as any);
      const signer = await ep.getSigner();
      const addr = await signer.getAddress();
      const net = await ep.getNetwork();

      // Wire events
      provider.on("accountsChanged", (accs: string[]) => {
        const next = accs?.[0] ?? "";
        setAccount(next);
      });
      provider.on("chainChanged", (cid: string) => {
        setChainIdHex(String(cid));
      });
      provider.on("disconnect", () => {
        resetConnectionState();
        setStatus("Disconnected.");
      });

      setProviderKind("walletconnect");
      setWcProvider(provider);
      setEthersProvider(ep);
      setAccount(addr);
      setChainIdHex("0x" + Number(net.chainId).toString(16));
      setStatus("Connected (WalletConnect).");
    } catch (e: any) {
      setStatus(e?.message ?? "Failed to connect WalletConnect.");
    } finally {
      setIsConnecting(false);
    }
  }

  async function disconnect() {
    setStatus("");
    setTxHash("");

    try {
      if (providerKind === "walletconnect" && wcProvider) {
        // WalletConnect provider has .disconnect()
        await wcProvider.disconnect();
      }
    } catch {
      // ignore
    } finally {
      resetConnectionState();
      setStatus("Disconnected.");
    }
  }

  function buildFinalDataUri(): string {
    if (mode === "paste") {
      const s = dataUri.trim();
      if (!s) throw new Error("Paste a data URI to mint.");
      if (!isDataUri(s)) throw new Error("Payload must start with data: (a valid data URI).");
      // No ESIP-6 added, duplicates NOT allowed
      return s;
    }

    // JSON mode
    const payload: any = {
      name: name.trim(),
      description: description.trim(),
      image: image.trim() || undefined,
      // optional metadata fields for community use
      minted_via: "Bit Brains Community Mint",
      standard: "Ethscriptions",
      timestamp: new Date().toISOString(),
    };

    if (!payload.name) throw new Error("Name is required.");
    if (!payload.description) throw new Error("Description is required.");

    return buildJsonDataUri(payload);
  }

  async function mintEthscription() {
    setStatus("");
    setTxHash("");

    if (!connected || !ethersProvider) {
      setStatus("Connect a wallet first.");
      return;
    }

    try {
      setIsMinting(true);

      const finalDataUri = buildFinalDataUri();

      // IMPORTANT:
      // Ethscriptions initial owner is tx.to. Setting tx.to = connected account makes it land in their wallet view.
      const txReq = {
        from: account,
        to: account,
        value: "0x0",
        data: utf8ToHex(finalDataUri),
      };

      setStatus("Submitting transaction…");
      const hash = (await ethersProvider.send("eth_sendTransaction", [txReq])) as string;

      setTxHash(hash);
      setStatus("Submitted. Wait for confirmations and indexing.");
    } catch (e: any) {
      setStatus(e?.message ?? "Mint failed.");
    } finally {
      setIsMinting(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0b0b0b", color: "#fff", padding: "2rem 1rem 3rem" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <header style={{ marginBottom: "1.25rem" }}>
          <h1 style={{ fontSize: "2.2rem", margin: 0 }}>Ethscriptions Mint</h1>
          <div style={{ marginTop: 8, opacity: 0.75, lineHeight: 1.5 }}>
            Community mint tool. Inscribes a <code>data:</code> URI into Ethereum calldata.
            <br />
            <strong>Duplicates are not allowed</strong> (no ESIP-6).
          </div>

          <div style={{ marginTop: 12 }}>
            <span
              style={{
                display: "inline-block",
                padding: "0.35rem 0.7rem",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(0,0,0,0.35)",
                fontSize: 12,
                letterSpacing: "0.08em",
              }}
            >
              COMMUNITY MINT OPEN
            </span>
          </div>
        </header>

        {/* Connection panel */}
        <section
          style={{
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.03)",
            padding: "1rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              onClick={connectWalletConnect}
              disabled={isConnecting}
              style={{
                flex: "1 1 240px",
                padding: "0.9rem 1rem",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                opacity: isConnecting ? 0.6 : 1,
                cursor: isConnecting ? "not-allowed" : "pointer",
              }}
            >
              {isConnecting ? "Connecting…" : "Connect (WalletConnect)"}
            </button>

            <button
              onClick={connectInjected}
              disabled={isConnecting || !injectedAvailable}
              style={{
                flex: "1 1 240px",
                padding: "0.9rem 1rem",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                background: injectedAvailable ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                color: "#fff",
                opacity: isConnecting || !injectedAvailable ? 0.6 : 1,
                cursor: isConnecting || !injectedAvailable ? "not-allowed" : "pointer",
              }}
            >
              Connect (MetaMask Desktop)
            </button>

            <button
              onClick={disconnect}
              disabled={!connected}
              style={{
                flex: "1 1 200px",
                padding: "0.9rem 1rem",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                background: connected ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                color: "#fff",
                opacity: connected ? 1 : 0.5,
                cursor: connected ? "pointer" : "not-allowed",
              }}
            >
              Disconnect
            </button>
          </div>

          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85, lineHeight: 1.6 }}>
            <div>
              <strong>Wallet:</strong>{" "}
              {connected ? `${shorten(account)} (${providerKind})` : "Not connected"}
            </div>
            {chainIdHex && (
              <div>
                <strong>Chain:</strong> {chainIdHex}
              </div>
            )}
          </div>
        </section>

        {/* Mint panel */}
        <section
          style={{
            marginTop: "1rem",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.03)",
            padding: "1rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Payload</div>
            <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setMode("paste")}
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: mode === "paste" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.25)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Paste Data URI
              </button>
              <button
                onClick={() => setMode("json")}
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: mode === "json" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.25)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Build JSON
              </button>
            </div>
          </div>

          {mode === "paste" ? (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
                Paste a full <code>data:</code> URI (example: <code>data:application/json,{"{"}"hello":"world"{"}"}</code>)
              </div>
              <textarea
                value={dataUri}
                onChange={(e) => setDataUri(e.target.value)}
                rows={6}
                placeholder="data:application/json,{...}"
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(0,0,0,0.35)",
                  color: "#fff",
                  outline: "none",
                  fontSize: 14,
                }}
              />
            </div>
          ) : (
            <div style={{ marginTop: 10, display: "grid", gap: "0.75rem" }}>
              <div>
                <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>Name</div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(0,0,0,0.35)",
                    color: "#fff",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>Description</div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(0,0,0,0.35)",
                    color: "#fff",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
                  Image (optional) — data:image/... or https://...
                </div>
                <input
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="data:image/png;base64,... or https://..."
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(0,0,0,0.35)",
                    color: "#fff",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.5 }}>
                This will mint a JSON Ethscription. If someone tries to mint the exact same content again,
                it should <strong>not index</strong> as a new Ethscription (duplicates not allowed).
              </div>
            </div>
          )}

          <button
            onClick={mintEthscription}
            disabled={!connected || isMinting}
            style={{
              marginTop: "1rem",
              width: "100%",
              padding: "0.95rem 1rem",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: connected ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
              color: "#fff",
              opacity: !connected || isMinting ? 0.6 : 1,
              cursor: !connected || isMinting ? "not-allowed" : "pointer",
              fontWeight: 800,
              letterSpacing: "0.02em",
            }}
          >
            {isMinting ? "Minting…" : "Mint Ethscription"}
          </button>

          {(status || txHash) && (
            <div
              style={{
                marginTop: "0.9rem",
                padding: "0.9rem",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(0,0,0,0.35)",
                fontSize: 13,
                lineHeight: 1.6,
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
        </section>
      </div>
    </main>
  );
}
