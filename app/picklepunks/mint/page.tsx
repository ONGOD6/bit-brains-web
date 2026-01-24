"use client";

import React, { useEffect, useMemo, useState } from "react";

/**
 * Pickle Punks — Clean One-Page Mint (Repository-Ready)
 *
 * ✅ Banner uses /public/IMG_2082.jpeg (your repo already has it)
 * ✅ 3 steps only: Connect → Mint Description (calldata proof) → Mint NFT (placeholder until ABI known)
 * ✅ “Mental Logic” included on page
 * ✅ Etherscan proof links for Description + NFT tx
 *
 * Build fix included:
 * - utf8ToHex() uses index loop (NOT for..of) to satisfy Vercel/TS target
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

// Put your real Pickle Punks ERC-721 contract here when deployed:
const PICKLEPUNKS_NFT_CONTRACT = "TBD"; // e.g. "0xabc...123"

// Your NFT mint wiring depends on your contract ABI.
// Keep as TBD until you provide the mint() signature/ABI.
const NFT_MINT_PRICE_ETH = "0"; // if payable mint, set like "0.01"

/* =========================
   DESCRIPTION / ETHSCRIPTION SETTINGS
   ========================= */
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const GAS_LIMIT_DESCRIPTION = "0x186A0"; // 100k

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
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
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
  if (!eth || eth === "0") return "0x0";
  const [whole, frac = ""] = eth.split(".");
  const fracPadded = (frac + "000000000000000000").slice(0, 18);
  const weiStr = BigInt(whole || "0") * 10n ** 18n + BigInt(fracPadded || "0");
  return "0x" + weiStr.toString(16);
}

function buildDescriptionDataUrl(opts: {
  name: string;
  description: string;
  imageUrl: string;
  externalUrl?: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
  parentContract?: string;
}) {
  const metadata = {
    name: opts.name,
    description: opts.description,
    image: opts.imageUrl,
    external_url: opts.externalUrl || "",
    attributes: opts.attributes || [],
    linkage: {
      collection: "Pickle Punks",
      nft_contract: opts.parentContract || "TBD",
    },
    proof: {
      type: "PicklePunks-Description",
      method: "calldata",
      verifier: "Etherscan → Input Data",
    },
  };

  const json = JSON.stringify(metadata);
  return `data:application/json,${json}`;
}

/* =========================
   UI
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

  // Description metadata
  const [name, setName] = useState("Pickle Punks — Genesis Description");
  const [description, setDescription] = useState(
    "Immutable Pickle Punks description artifact. This calldata inscription is permanent proof on Ethereum."
  );
  const [imageUrl, setImageUrl] = useState("/IMG_2082.jpeg");
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

  // Tx state
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

  const parsedAttrs = useMemo(() => safeJsonParse<any>(attributesJson), [attributesJson]);
  const attrsOk = parsedAttrs.ok && Array.isArray(parsedAttrs.value);

  const descriptionPayload = useMemo(() => {
    const attrs = attrsOk ? (parsedAttrs.value as Array<{ trait_type: string; value: any }>) : [];
    return buildDescriptionDataUrl({
      name: name.trim() || "Pickle Punks — Description",
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      externalUrl: externalUrl.trim(),
      attributes: attrs,
      parentContract: PICKLEPUNKS_NFT_CONTRACT,
    });
  }, [name, description, imageUrl, externalUrl, attrsOk, parsedAttrs, attributesJson]);

  // 3-step gating
  const step = useMemo(() => {
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

      // Placeholder until contract mint ABI/signature is provided.
      if (PICKLEPUNKS_NFT_CONTRACT === "TBD") {
        throw new Error("NFT contract address is TBD. Set PICKLEPUNKS_NFT_CONTRACT when deployed.");
      }

      setSendingNft(true);

      // We keep this intentionally explicit so the page ships cleanly without guessing your ABI.
      throw new Error(
        "NFT mint not wired yet. Provide your mint() ABI/signature and I will encode the calldata for a real contract call."
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

      <div style={{ display: "grid", gap: 14 }}>
        <Card title="Mental Logic — NFT + Description (Immutable Proof)">
          <div style={{ opacity: 0.88, lineHeight: 1.45 }}>
            <div style={{ marginBottom: 10 }}>
              <strong>NFT (ERC-721)</strong> is the tradable token marketplaces recognize.
            </div>
            <div style={{ marginBottom: 10 }}>
              <strong>Description (calldata inscription)</strong> is an immutable artifact: the metadata is permanently
              stored inside the transaction’s <strong>Input Data</strong>.
            </div>
            <div style={{ marginBottom: 10 }}>
              Once you mint the Description, it can always be proven on <strong>Etherscan</strong> by opening the tx and
              viewing <strong>Input Data</strong>. Even if websites change, the proof stays.
            </div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              This page is intentionally a single clean flow: Step 2 (Description) → Step 3 (NFT). No extra steps.
            </div>
          </div>
        </Card>

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
                      {parsedAttrs.ok ? "Not an array" : parsedAttrs.error}
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
                    Preview (this exact string is stored forever in tx Input Data)
                  </div>
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
                This will mint the tradable NFT. It is gated by the immutable Description proof (Step 2).
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
                  Mint the Description first (Step 2). That tx is your permanent proof on Etherscan.
                </div>
              )}

              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                NFT Mint Price (if applicable):{" "}
                <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                  {NFT_MINT_PRICE_ETH} ETH
                </span>
              </div>
            </div>
          </div>
        </Card>

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
