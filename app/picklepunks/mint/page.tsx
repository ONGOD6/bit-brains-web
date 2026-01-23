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

/* ---------- helpers ---------- */
function bytesToHex(bytes: Uint8Array): string {
  let hex = "0x";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
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

/* ---------- page ---------- */
export default function EthscriptionsMintPage() {
  const MAX_BYTES_DEFAULT = 128 * 1024; // 128 KB

  // Canonical calldata sink
  const CALLDATA_SINK = "0x000000000000000000000000000000000000dEaD";

  const [account, setAccount] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [maxBytes, setMaxBytes] = useState<number>(MAX_BYTES_DEFAULT);

  const [dataUrl, setDataUrl] = useState<string>("");
  const [hexData, setHexData] = useState<string>("");
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
      setStatus("No wallet detected.");
      return;
    }

    const accounts: string[] = await window.ethereum!.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts?.[0] ?? "");

    const cid: string = await window.ethereum!.request({
      method: "eth_chainId",
    });
    setChainId(cid ?? "");
  }

  /* ---------- build payload ---------- */
  async function buildPayload() {
    if (!file) return;

    const uri = await fileToDataUrl(file);
    setDataUrl(uri);

    const enc = new TextEncoder();
    const bytes = enc.encode(uri);

    if (bytes.length > maxBytes) {
      setStatus("Payload too large after encoding.");
      return;
    }

    setHexData(bytesToHex(bytes));
    setStatus("Payload ready.");
  }

  /* ---------- download payload ---------- */
  function downloadPayload() {
    if (!file || !dataUrl) return;

    const safe = file.name.replace(/\s+/g, "_").replace(/[^\w.\-]/g, "");
    downloadTextFile(`${safe}.ethscription-payload.txt`, dataUrl);

    setDownloaded(true);
  }

  /* ---------- send tx ---------- */
  async function submitInscriptionTx() {
    if (!account || !payloadReady || !downloaded) return;

    const hash: string = await window.ethereum!.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: account,
          to: CALLDATA_SINK,
          value: "0x0",
          data: hexData,
        },
      ],
    });

    setTxHash(hash);
    setStatus("Transaction submitted.");
  }

  return (
    <main>
      {/* UI intentionally unchanged */}
    </main>
  );
}
