"use client";

import React, { useEffect, useMemo, useState } from "react";

/**
 * Pickle Punks — Clean Mint Page (1 page)
 *
 * ✅ Banner (IMG_2082.jpeg)
 * ✅ 3-step flow only: Connect → Mint Description (Ethscription) → Mint NFT (ERC-721)
 * ✅ “Mental Logic” panel explains: NFT is tradable token, Description is immutable calldata proof
 * ✅ Proof: Description tx is always verifiable on Etherscan (calldata) + indexers (optional)
 *
 * IMPORTANT:
 * - Put the Pickle Punks banner at: /public/IMG_2082.jpeg  (you already have it)
 * - Set PICKLEPUNKS_NFT_CONTRACT and PICKLEPUNKS_NFT_ABI when your NFT contract is ready
 * - Description mint uses a calldata tx to ZERO_ADDRESS (Ethscription-style). This is your immutable proof.
 */

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

/* =========================
   CONFIG (EDIT THESE)
   ========================= */
const MINTING_ENABLED = false; // flip true when live

// ERC-721 contract address for Pickle Punks (put real value when deployed)
const PICKLEPUNKS_NFT_CONTRACT = "TBD"; // e.g. "0xabc...123"

// ABI for your mint function (update to match your deployed contract)
const PICKLEPUNKS_NFT_ABI = [
  // Example mint() payable; change this to your real mint function
  // { "inputs": [], "name": "mint", "outputs": [], "stateMutability": "payable", "type": "function" }
];

// If your mint requires a price, set it here (in ETH). Otherwise set "0"
const NFT_MINT_PRICE_ETH = "0";

/* =========================
   ETHSCRIPTION / DESCRIPTION SETTINGS
   ========================= */
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const GAS_LIMIT_DESCRIPTION = "0x186A0"; // 100k, safe default

/* =========================
   HELPERS
   ========================= */
function shorten(addr: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function utf8ToHex(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let hex = "0x";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex;
}

function safeJsonParse<T>(s: string): { ok: true; value: T } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(s) as T };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Invalid JSON" };
  }
}

function toHexWeiFromEthString(eth: string): string {
  // Minimal safe converter for small strings: "0", "0.01", "0.1", "1"
  // For complex pricing use viem/ethers later. For now we keep it simple.
  if (!eth || eth === "0") return "0x0";
  const [whole, frac = ""] = eth.split(".");
  const fracPadded = (frac + "000000000000000000").slice(0, 18); // 18 decimals
  const weiStr = BigInt(whole || "0") * 10n ** 18n + BigInt(fracPadded || "0");
  return "0x" + weiStr.toString(16);
}

/* =========================
   BUILD IMMUTABLE DESCRIPTION PAYLOAD
   ========================= */
function buildDescriptionDataUrl(opts: {
  name: string;
  description: string;
  imageUrl: string;
  externalUrl?: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}) {
  const metadata = {
    name: opts.name,
    description: opts.description,
    image: opts.imageUrl,
    external_url: opts.externalUrl || "",
    attributes: opts.attributes || [],
    proof: {
      type: "PicklePunks-Description",
      method: "calldata",
      verifier: "Etherscan input data",
    },
  };

  const json = JSON.stringify(metadata);
  return `data:application/json,${json}`;
}

/* =========================
   SIMPLE UI COMPONENTS
   ========================= */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.16)",
        borderRadius: 16,
        padding: 16,
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <div style={{ fontWeight: 900, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function Btn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(255,255,255,0.10)",
        color: "white",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        fontWeight: 900,
      }}
    >
      {children}
    </button>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(255,255,255,0.06)",
        color: "white",
        outline: "none",
      }}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(255,255,255,0.06)",
        color: "white",
        outline: "none",
        minHeight: 90,
        resize: "vertical",
      }}
    />
  );
}

/* =========================
   PAGE
   ========================= */
export default function PicklePunksMintPage() {
  const [hasProvider, setHasProvider] = useState(false);
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");

  // Description metadata (ethscription payload)
  const [name, setName] = useState("Pickle Punks — Genesis Description");
  const [description, setDescription] = useState(
    "Immutable Pickle Punks description artifact. This calldata inscription is permanent proof on Ethereum."
  );
  const [imageUrl, setImageUrl] = useState("/IMG_2082.jpeg"); // you have this in /public
  const [externalUrl, setExternalUrl] = useState("https://bitbrains.us");

  const [attributesJson, setAttributesJson] = useState(
    JSON.stringify(
      [
        { trait_type: "Collection", value: "Pickle Punks" },
        { trait_type: "Artifact", value: "Description" },
        { trait_type: "Proof", value: "Calldata (Etherscan)" },
      ],
      null,
      2
    )
  );

  // Tx states
  const [descTxHash, setDescTxHash] = useState("");
  const [nftTxHash, setNftTxHash] = useState("");
  const [sendingDesc, setSendingDesc] = useState(false);
  const [sendingNft, setSendingNft] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setHasProvider(Boolean(window?.ethereum));
  }, []);

  useEffect(() => {
    if (!window?.ethereum) return;

    const onAccounts = (accs: string[]) => setAccount(accs?.[0] || "");
    const onChain = (cid: string) => setChainId(cid || "");

    window.ethereum.request({ method: "eth_accounts" }).then(onAccounts).catch(() => {});
    window.ethereum.request({ method: "eth_chainId" }).then(onChain).catch(() => {});

    window.ethereum.on?.("accountsChanged", onAccounts);
    window.ethereum.on?.("chainChanged", onChain);

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", onAccounts);
      window.ethereum?.removeListener?.("chainChanged", onChain);
    };
  }, []);

  const attributesParse = useMemo(() => safeJsonParse<any>(attributesJson), [attributesJson]);
  const attrsOk = attributesParse.ok && Array.isArray(attributesParse.value);

  const descriptionPayload = useMemo(() => {
    const attrs = attrsOk ? (attributesParse.value as Array<{ trait_type: string; value: any }>) : [];
    return buildDescriptionDataUrl({
      name: name.trim() || "Pickle Punks — Description",
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      externalUrl: externalUrl.trim(),
      attributes: attrs,
    });
  }, [name, description, imageUrl, externalUrl, attributesJson, attrsOk, attributesParse]);

  const step = useMemo(() => {
    // 3-step only, with gating:
    // 1) connect
    // 2) mint description
    // 3) mint nft
    if (!account) return 1;
    if (!descTxHash) return 2;
    return 3;
  }, [account, descTxHash]);

  async function connectWallet() {
    try {
      setErr("");
      if (!window?.ethereum) throw new Error("No wallet detected. Use MetaMask or a wallet browser.");
      const accs = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      setAccount(accs?.[0] || "");
      const cid = (await window.ethereum.request({ method: "eth_chainId" })) as string;
      setChainId(cid || "");
    } catch (e: any) {
      setErr(e?.message || "Failed to connect wallet.");
    }
  }

  async function mintDescription() {
    if (!MINTING_ENABLED) return;

    try {
      setErr("");
      if (!account) throw new Error("Connect wallet first.");
      if (!attrsOk) throw new Error("Fix Attributes JSON (must be an array).");

      setSendingDesc(true);

      // Encode the data:application/json,... payload into tx calldata
      const dataHex = utf8ToHex(descriptionPayload);

      const hash = (await window.ethereum!.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: ZERO_ADDRESS,
            value: "0x0",
            gas: GAS_LIMIT_DESCRIPTION,
            data: dataHex,
          },
        ],
      })) as string;

      setDescTxHash(hash || "");
    } catch (e: any) {
      setErr(e?.data?.message || e?.message || "Description transaction failed.");
    } finally {
      setSendingDesc(false);
    }
  }

  async function mintNft() {
    if (!MINTING_ENABLED) return;

    try {
      setErr("");
      if (!account) throw new Error("Connect wallet first.");
      if (!descTxHash) throw new Error("Mint the Description first (Step 2).");
      if (PICKLEPUNKS_NFT_CONTRACT === "TBD") {
        throw new Error("NFT contract is not set yet. Add your deployed contract address.");
      }

      setSendingNft(true);

      // Minimal contract call without bringing in ethers/viem:
      // We do it via eth_sendTransaction to the contract with encoded calldata.
      // But encoding ABI manually is annoying, so until ABI is finalized,
      // we keep NFT mint as a placeholder button with a clear message.
      //
      // ✅ You asked for “clean page” first; we’ll wire the ABI once the contract function is known.
      throw new Error(
        "NFT mint function not wired yet (needs ABI + mint function). Set PICKLEPUNKS_NFT_ABI + mint selector, then we encode calldata."
      );
    } catch (e: any) {
      setErr(e?.message || "NFT mint failed.");
    } finally {
      setSendingNft(false);
    }
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, color: "white" }}>
      {/* Banner */}
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <img
          src="/IMG_2082.jpeg"
          alt="Pickle Punks"
          style={{
            width: "100%",
            maxWidth: 880,
            borderRadius: 18,
            border: "3px solid rgba(202,162,74,0.95)",
            display: "block",
            margin: "0 auto",
          }}
        />
        <div style={{ marginTop: 10, fontWeight: 900, letterSpacing: 2, opacity: 0.9 }}>
          MINTING SOON
        </div>
        <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
          Contract:{" "}
          <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
            {PICKLEPUNKS_NFT_CONTRACT}
          </span>
        </div>
      </div>

      {/* One-page layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 14,
        }}
      >
        {/* Mental logic */}
        <Card title="Mental Logic — NFT + Description (Immutable Proof)">
          <div style={{ opacity: 0.88, lineHeight: 1.45 }}>
            <div style={{ marginBottom: 10 }}>
              <strong>NFT (ERC-721)</strong> is the tradable token marketplaces recognize.
            </div>
            <div style={{ marginBottom: 10 }}>
              <strong>Description (Ethscription-style calldata)</strong> is an immutable artifact minted as a transaction
              whose <strong>input data</strong> permanently contains your metadata.
            </div>
            <div style={{ marginBottom: 10 }}>
              Once you mint the Description, the proof can always be verified on <strong>Etherscan</strong> by opening
              the transaction and inspecting the <strong>Input Data</strong>. That means your Description is forever
              documented on-chain — even if websites/indexers change.
            </div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Flow on this page is intentionally simple: Step 2 (Description) → Step 3 (NFT). No extra steps.
            </div>
          </div>
        </Card>

        {/* Steps */}
        <Card title="Mint — 3 Steps (One Page)">
          <div style={{ display: "grid", gap: 14 }}>
            {/* Step 1 */}
            <div style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.14)" }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Step 1 — Connect Wallet</div>
              {!hasProvider ? (
                <div style={{ color: "#ffb4b4" }}>No wallet detected. Use MetaMask or a wallet browser.</div>
              ) : account ? (
                <div style={{ opacity: 0.9 }}>
                  Connected: <strong>{shorten(account)}</strong>{" "}
                  <span style={{ fontSize: 12, opacity: 0.7 }}>({chainId || "unknown chain"})</span>
                </div>
              ) : (
                <Btn onClick={connectWallet}>Connect Wallet</Btn>
              )}
            </div>

            {/* Step 2 */}
            <div style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.14)" }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Step 2 — Mint Description (Immutable Proof)</div>

              <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Name</div>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div>
                  <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Description</div>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Image URL</div>
                    <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>External URL</div>
                    <Input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} />
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Attributes (JSON array)</div>
                  <Textarea value={attributesJson} onChange={(e) => setAttributesJson(e.target.value)} spellCheck={false} />
                  {!attrsOk && (
                    <div style={{ marginTop: 6, color: "#ffb4b4", fontSize: 12 }}>
                      Attributes JSON must be a valid array. Current error:{" "}
                      {attributesParse.ok ? "Not an array" : attributesParse.error}
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Preview (this is what goes into calldata)</div>
                  <Textarea value={descriptionPayload} readOnly spellCheck={false} style={{ minHeight: 110 }} />
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <Btn
                    onClick={mintDescription}
                    disabled={!account || sendingDesc || !attrsOk || !MINTING_ENABLED || step !== 2}
                  >
                    {MINTING_ENABLED ? (sendingDesc ? "Minting Description…" : "Mint Description") : "Minting Disabled"}
                  </Btn>

                  {descTxHash && (
                    <>
                      <span style={{ fontSize: 12, opacity: 0.85 }}>
                        Description Tx:{" "}
                        <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                          {descTxHash}
                        </span>
                      </span>
                      <a href={`https://etherscan.io/tx/${descTxHash}`} target="_blank" rel="noreferrer">
                        View on Etherscan (Input Data Proof)
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.14)" }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Step 3 — Mint NFT (ERC-721)</div>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 10 }}>
                Requires Description proof first. Once the NFT mint is wired, this will call your contract.
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <Btn
                  onClick={mintNft}
                  disabled={!account || sendingNft || !MINTING_ENABLED || !descTxHash || step !== 3}
                >
                  {MINTING_ENABLED ? (sendingNft ? "Minting NFT…" : "Mint NFT") : "Minting Disabled"}
                </Btn>

                {nftTxHash && (
                  <a href={`https://etherscan.io/tx/${nftTxHash}`} target="_blank" rel="noreferrer">
                    View NFT Mint Tx on Etherscan
                  </a>
                )}
              </div>

              {!descTxHash && (
                <div style={{ marginTop: 10, fontSize: 12, color: "#ffd6a6" }}>
                  Mint the Description first (Step 2). That tx is your permanent, immutable proof on Etherscan.
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Errors */}
        {err && (
          <Card title="Error">
            <div style={{ color: "#ffb4b4", whiteSpace: "pre-wrap" }}>{err}</div>
          </Card>
        )}
      </div>

      <div style={{ marginTop: 14, fontSize: 12, opacity: 0.65 }}>
        Proof rule: Description = immutable calldata proof (Etherscan Input Data). NFT = tradable ownership token.
      </div>
    </main>
  );
}
