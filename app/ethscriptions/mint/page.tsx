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
function bytesToHex(bytes: Uint8Array): string {
  let hex = "0x";
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
  return hex;
}

function assertEthereum(): asserts window is Window & { ethereum: NonNullable<Window["ethereum"]> } {
  if (!window.ethereum) throw new Error("No wallet found. Install MetaMask or use a wallet-enabled browser.");
}

async function connectWallet(): Promise<string> {
  assertEthereum();
  const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
  if (!accounts?.[0]) throw new Error("No account selected.");
  return accounts[0];
}

async function getChainIdHex(): Promise<string> {
  assertEthereum();
  return (await window.ethereum.request({ method: "eth_chainId" })) as string;
}

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

/**
 * Ethscriptions: ownership is determined by TXN `to`.
 * To mint to the minter, set `to = from`.
 */
async function sendEthscriptionTx({
  from,
  dataUrlOrContentString,
}: {
  from: string;
  dataUrlOrContentString: string;
}): Promise<string> {
  assertEthereum();

  // IMPORTANT: make the recipient the MINTER so it shows in THEIR wallet on ethscriptions.com
  const to = from;

  const dataBytes = new TextEncoder().encode(dataUrlOrContentString);
  const data = bytesToHex(dataBytes);

  const tx = {
    from,
    to, // <-- do NOT hardcode vitalik / any other address here
    value: "0x0",
    data,
  };

  const txHash = (await window.ethereum.request({
    method: "eth_sendTransaction",
    params: [tx],
  })) as string;

  return txHash;
}

/**
 * OPTIONAL ERC-721 mint.
 * Replace `CONTRACT_ADDRESS` and `MINT_CALLDATA` with your real mint transaction.
 *
 * If you already have a working NFT mint page, copy its mint call into this function.
 */
async function mintErc721Optional({
  from,
}: {
  from: string;
}): Promise<string | null> {
  // --- TURN OFF if you don't want the NFT part yet ---
  const ENABLE_NFT_MINT = false;

  if (!ENABLE_NFT_MINT) return null;

  // TODO: replace with your real ERC-721 contract
  const CONTRACT_ADDRESS = "0xYourContractAddressHere";

  // TODO: replace with real calldata for mint() OR mint(address to) etc.
  // If your mint function mints to msg.sender, you can call mint() with no args.
  const MINT_CALLDATA = "0x"; // <-- put real calldata here

  assertEthereum();

  const tx = {
    from,
    to: CONTRACT_ADDRESS,
    value: "0x0",
    data: MINT_CALLDATA,
  };

  const txHash = (await window.ethereum.request({
    method: "eth_sendTransaction",
    params: [tx],
  })) as string;

  return txHash;
}

export default function EthscriptionsMintPage() {
  const [account, setAccount] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [nftTx, setNftTx] = useState<string>("");
  const [ethscriptionTx, setEthscriptionTx] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  const isConnected = useMemo(() => Boolean(account), [account]);

  async function onConnect() {
    try {
      setStatus("");
      const addr = await connectWallet();

      // Require mainnet (optional but recommended)
      const chainId = await getChainIdHex();
      if (chainId !== "0x1") {
        setStatus("⚠️ Wrong network. Please switch to Ethereum Mainnet.");
        // You can auto-switch if you want, but keeping it simple here.
      }

      setAccount(addr);
      setStatus(`Connected: ${addr}`);
    } catch (e: any) {
      setStatus(`Error: ${e?.message ?? String(e)}`);
    }
  }

  async function onMintBoth() {
    try {
      if (!isConnected) throw new Error("Connect your wallet first.");
      if (!file) throw new Error("Choose a file to inscribe first.");

      setBusy(true);
      setStatus("Preparing inscription…");
      setNftTx("");
      setEthscriptionTx("");

      // 1) OPTIONAL: NFT mint tx (turn on in mintErc721Optional)
      setStatus("Step 1/2: Minting ERC-721 (optional)…");
      const nftTxHash = await mintErc721Optional({ from: account });
      if (nftTxHash) setNftTx(nftTxHash);

      // 2) Ethscription mint tx (THIS is the important fix)
      setStatus("Step 2/2: Minting Ethscription to your wallet…");
      const dataUrl = await fileToDataURL(file);
      const ethTxHash = await sendEthscriptionTx({
        from: account,
        dataUrlOrContentString: dataUrl,
      });
      setEthscriptionTx(ethTxHash);

      setStatus("✅ Done. Both transactions submitted.");
    } catch (e: any) {
      setStatus(`Error: ${e?.message ?? String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 34, marginBottom: 8 }}>Ethscriptions Mint — Community</h1>
      <p style={{ opacity: 0.85, marginTop: 0 }}>
        This flow mints the Ethscription directly to the connected wallet by setting the transaction <b>To</b> address to the minter.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
        {!isConnected ? (
          <button
            onClick={onConnect}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              cursor: "pointer",
            }}
          >
            Connect Wallet
          </button>
        ) : (
          <div style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)" }}>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Connected</div>
            <div style={{ fontFamily: "monospace", fontSize: 14 }}>{account}</div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 22, padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)" }}>
        <h2 style={{ marginTop: 0 }}>1) Choose your file</h2>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          style={{ display: "block", marginTop: 10 }}
        />

        <div style={{ marginTop: 18 }}>
          <button
            disabled={!isConnected || !file || busy}
            onClick={onMintBoth}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.18)",
              background: busy ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.08)",
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "Minting…" : "Mint (ERC-721 + Ethscription)"}
          </button>
        </div>

        <div style={{ marginTop: 14, whiteSpace: "pre-wrap", opacity: 0.9 }}>{status}</div>

        {(nftTx || ethscriptionTx) && (
          <div style={{ marginTop: 14, fontFamily: "monospace", fontSize: 13 }}>
            {nftTx && (
              <div style={{ marginBottom: 8 }}>
                ERC-721 Tx: <span>{nftTx}</span>
              </div>
            )}
            {ethscriptionTx && (
              <div>
                Ethscription Tx: <span>{ethscriptionTx}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: 18, opacity: 0.8, fontSize: 13 }}>
        <p style={{ marginBottom: 6 }}>
          <b>Critical rule:</b> Ethscriptions ownership follows the transaction <b>To:</b> address.
        </p>
        <p style={{ marginTop: 0 }}>
          This page intentionally sends the Ethscription tx <b>to your own wallet</b>, so it appears under your address on ethscriptions.com.
        </p>
      </div>
    </main>
  );
}
