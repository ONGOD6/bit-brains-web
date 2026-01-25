"use client";

import { useEffect, useState } from "react";

export default function PicklePunksMintPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [base64Payload, setBase64Payload] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  // ---------- WALLET CONNECT ----------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const eth = (window as any).ethereum;
    if (!eth) return;

    eth.request({ method: "eth_accounts" }).then((accounts: string[]) => {
      if (accounts?.length) setAccount(accounts[0]);
    });
  }, []);

  const connectWallet = async () => {
    const eth = (window as any).ethereum;
    if (!eth) return alert("MetaMask not found");

    const accounts = await eth.request({
      method: "eth_requestAccounts",
    });

    setAccount(accounts[0]);
  };

  // ---------- IMAGE → BASE64 ----------
  const handleFile = async (f: File) => {
    setFile(f);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);

      // Canonical Ethscriptions payload
      const base64 = result.split(",")[1];
      setBase64Payload(`data:image/png;base64,${base64}`);
    };
    reader.readAsDataURL(f);
  };

  // ---------- SEND TRANSACTION ----------
  const mintEthscription = async () => {
    if (!account || !base64Payload) {
      alert("Missing wallet or image");
      return;
    }

    try {
      setStatus("Sending transaction…");

      const eth = (window as any).ethereum;

      const tx = {
        from: account,
        to: account, // OPTION A — self-send (MetaMask-safe)
        value: "0x0",
        data: "0x" + Buffer.from(base64Payload).toString("hex"),
      };

      const hash = await eth.request({
        method: "eth_sendTransaction",
        params: [tx],
      });

      setStatus(`Submitted: ${hash}`);
    } catch (err: any) {
      console.error(err);
      setStatus("Transaction failed");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        padding: "3rem 1rem",
      }}
    >
      <div style={{ maxWidth: 520, width: "100%" }}>
        {/* BANNER */}
        <img
          src="/IMG_2082.jpeg"
          alt="Pickle Punks"
          style={{
            width: "100%",
            borderRadius: 16,
            marginBottom: 24,
          }}
        />

        <h1 style={{ fontSize: 28, marginBottom: 12 }}>
          Pickle Punks — Ethscriptions Mint
        </h1>

        {!account ? (
          <button onClick={connectWallet} style={btn}>
            Connect Wallet
          </button>
        ) : (
          <p style={{ opacity: 0.8 }}>Connected: {account}</p>
        )}

        <hr style={hr} />

        {/* FILE UPLOAD */}
        <input
          type="file"
          accept="image/png"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />

        {preview && (
          <img
            src={preview}
            style={{
              marginTop: 16,
              width: 200,
              borderRadius: 12,
            }}
          />
        )}

        <hr style={hr} />

        <button onClick={mintEthscription} style={btn}>
          Mint Ethscription (Option A)
        </button>

        {status && <p style={{ marginTop: 12 }}>{status}</p>}
      </div>
    </main>
  );
}

const btn = {
  padding: "12px 20px",
  borderRadius: 10,
  background: "#1f2937",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  marginTop: 12,
};

const hr = {
  margin: "24px 0",
  borderColor: "#222",
};
