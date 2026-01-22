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

/** ---------- helpers ---------- **/

function utf8ToHex(str: string): string {
  const enc = new TextEncoder();
  const bytes = enc.encode(str);
  let hex = "0x";
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
  return hex;
}

function isProbablyDataUri(s: string): boolean {
  return s.startsWith("data:");
}

/**
 * Build a Pickle Punk Ethscription payload.
 *
 * OPTION A (recommended): inscribe JSON metadata
 *   data:application/json;rule=esip6,{...}
 *
 * OPTION B: inscribe an image (base64 png)
 *   data:image/png;base64,....
 */
function buildPicklePunkDataUri(opts: {
  useEsip6: boolean;
  kind: "json" | "image";
  name: string;
  description: string;
  imageDataUri?: string; // only needed for kind="json" if you want to embed or reference
  attributes?: Array<{ trait_type: string; value: string | number }>;
}): string {
  const { useEsip6, kind, name, description, imageDataUri, attributes } = opts;

  if (kind === "image") {
    if (!imageDataUri?.startsWith("data:image/")) {
      throw new Error("Image mode requires imageDataUri like data:image/png;base64,...");
    }
    // ESIP-6 doesn't usually apply to images unless you expect duplicates; you can still append rule param if needed.
    // If you want to opt-in duplicates for images, the rule parameter belongs in the mime/params section.
    if (useEsip6 && imageDataUri.startsWith("data:image/") && !imageDataUri.includes(";rule=esip6")) {
      // insert ;rule=esip6 after mime type
      return imageDataUri.replace(/^data:(image\/[^;]+)(;?)/, "data:$1;rule=esip6$2");
    }
    return imageDataUri;
  }

  // JSON inscription (great for “descriptions” / metadata)
  const payload = {
    name,
    description,
    image: imageDataUri ?? undefined,
    attributes: attributes ?? [],
    // You can add any extra fields you want here
    // e.g. "collection": "Pickle Punks", "edition": 1, etc.
  };

  // Important: this must become UTF-8 text inside the data URI
  const json = JSON.stringify(payload);

  // ESIP-6: opt in to possible duplicates by adding a "magic" parameter in the data URI  [oai_citation:2‡Ethscriptions](https://docs.ethscriptions.com/esips/accepted-esips/esip-6-opt-in-ethscription-non-uniqueness?utm_source=chatgpt.com)
  const rule = useEsip6 ? ";rule=esip6" : "";

  // Comma form is valid for data URIs; keep it simple and UTF-8
  return `data:application/json${rule},${json}`;
}

/** ---------- component ---------- **/

export default function EthscriptionsPicklePunksMintPage() {
  const [account, setAccount] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  // basic form controls
  const [useEsip6, setUseEsip6] = useState<boolean>(true);
  const [kind, setKind] = useState<"json" | "image">("json");
  const [name, setName] = useState<string>("Pickle Punk #0001");
  const [description, setDescription] = useState<string>("Pickle Punks — Ethscription artifact.");
  const [imageDataUri, setImageDataUri] = useState<string>(""); // optional for JSON; required for Image mode

  const isReady = useMemo(() => {
    if (!window.ethereum) return false;
    if (!account) return false;
    if (kind === "image" && !imageDataUri) return false;
    return true;
  }, [account, kind, imageDataUri]);

  async function connect() {
    try {
      setStatus("");
      setTxHash("");
      if (!window.ethereum) throw new Error("MetaMask not detected.");

      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const cid: string = await window.ethereum.request({ method: "eth_chainId" });
      setChainId(cid);
      setAccount(accounts?.[0] ?? "");
    } catch (e: any) {
      setStatus(e?.message ?? "Failed to connect.");
    }
  }

  async function mintEthscription() {
    try {
      setStatus("");
      setTxHash("");

      if (!window.ethereum) throw new Error("MetaMask not detected.");
      if (!account) throw new Error("Connect wallet first.");

      // Build data URI (must start with "data:" to be treated as calldata inscription)  [oai_citation:3‡Ethscriptions](https://docs.ethscriptions.com/overview/quick-start?utm_source=chatgpt.com)
      const dataUri = buildPicklePunkDataUri({
        useEsip6,
        kind,
        name,
        description,
        imageDataUri: imageDataUri || undefined,
        attributes: [
          { trait_type: "Collection", value: "Pickle Punks" },
          { trait_type: "Artifact", value: "Ethscription" },
        ],
      });

      if (!isProbablyDataUri(dataUri)) {
        throw new Error("Payload must be a valid data URI starting with 'data:'.");
      }

      // Ethscriptions ownership rule: initial owner is tx.recipient (“to” address)  [oai_citation:4‡Ethscriptions](https://docs.ethscriptions.com/overview/protocol-specification?utm_source=chatgpt.com)
      // To ensure it “lands in the connected wallet”, we set `to` = connected account.
      const txParams = {
        from: account,
        to: account, // <-- critical: initial owner
        value: "0x0",
        data: utf8ToHex(dataUri),
      };

      setStatus("Submitting transaction…");
      const hash: string = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [txParams],
      });

      setTxHash(hash);
      setStatus("Submitted. Waiting for confirmations / indexer…");
    } catch (e: any) {
      setStatus(e?.message ?? "Mint failed.");
    }
  }

  return (
    <main style={{ minHeight: "100vh", padding: "2rem", background: "#0b0b0b", color: "#fff" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "0.25rem" }}>Pickle Punks — Ethscriptions Mint</h1>
        <p style={{ opacity: 0.75, marginTop: 0 }}>
          Creates an Ethscription by sending a 0 ETH transaction with a data URI in calldata.
        </p>

        {!account ? (
          <button
            onClick={connect}
            style={{ padding: "0.8rem 1rem", borderRadius: 10, border: "1px solid #333", background: "#111", color: "#fff" }}
          >
            Connect MetaMask
          </button>
        ) : (
          <div style={{ marginBottom: "1rem", opacity: 0.9 }}>
            <div><strong>Connected:</strong> {account}</div>
            <div><strong>Chain:</strong> {chainId}</div>
          </div>
        )}

        <div style={{ marginTop: "1.25rem", padding: "1rem", border: "1px solid #222", borderRadius: 12, background: "#0f0f0f" }}>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span>Mode</span>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as any)}
                style={{ padding: "0.4rem", borderRadius: 8, background: "#111", color: "#fff", border: "1px solid #333" }}
              >
                <option value="json">JSON (recommended)</option>
                <option value="image">Image (data:image/...)</option>
              </select>
            </label>

            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input type="checkbox" checked={useEsip6} onChange={(e) => setUseEsip6(e.target.checked)} />
              <span>Allow duplicates (ESIP-6)</span>
            </label>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <label style={{ display: "block", marginBottom: 6, opacity: 0.85 }}>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: "0.7rem", borderRadius: 10, border: "1px solid #333", background: "#111", color: "#fff" }}
            />
          </div>

          <div style={{ marginTop: "1rem" }}>
            <label style={{ display: "block", marginBottom: 6, opacity: 0.85 }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ width: "100%", padding: "0.7rem", borderRadius: 10, border: "1px solid #333", background: "#111", color: "#fff" }}
            />
          </div>

          <div style={{ marginTop: "1rem" }}>
            <label style={{ display: "block", marginBottom: 6, opacity: 0.85 }}>
              Image Data URI {kind === "image" ? "(required)" : "(optional)"}
            </label>
            <textarea
              value={imageDataUri}
              onChange={(e) => setImageDataUri(e.target.value)}
              rows={4}
              placeholder='data:image/png;base64,iVBORw0K...'
              style={{ width: "100%", padding: "0.7rem", borderRadius: 10, border: "1px solid #333", background: "#111", color: "#fff" }}
            />
            <div style={{ opacity: 0.65, marginTop: 6, fontSize: 13 }}>
              Tip: If you’re seeing “minted but not visible”, duplicates are a common cause → keep ESIP-6 on if content can repeat.  [oai_citation:5‡Ethscriptions](https://docs.ethscriptions.com/esips/accepted-esips/esip-6-opt-in-ethscription-non-uniqueness?utm_source=chatgpt.com)
            </div>
          </div>

          <button
            disabled={!isReady}
            onClick={mintEthscription}
            style={{
              marginTop: "1rem",
              padding: "0.85rem 1rem",
              borderRadius: 10,
              border: "1px solid #333",
              background: isReady ? "#151515" : "#0f0f0f",
              color: "#fff",
              opacity: isReady ? 1 : 0.5,
              cursor: isReady ? "pointer" : "not-allowed",
              width: "100%",
            }}
          >
            Mint Ethscription (Pickle Punk)
          </button>
        </div>

        {status && (
          <div style={{ marginTop: "1rem", padding: "0.85rem", borderRadius: 12, border: "1px solid #222", background: "#0f0f0f" }}>
            {status}
          </div>
        )}

        {txHash && (
          <div style={{ marginTop: "1rem", padding: "0.85rem", borderRadius: 12, border: "1px solid #222", background: "#0f0f0f" }}>
            <div><strong>Tx Hash:</strong> {txHash}</div>
            <div style={{ opacity: 0.75, marginTop: 6, fontSize: 13 }}>
              If it still doesn’t show in the wallet view, check the tx “To:” field — it must equal the intended owner (connected address).  [oai_citation:6‡Ethscriptions](https://docs.ethscriptions.com/overview/protocol-specification?utm_source=chatgpt.com)
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
