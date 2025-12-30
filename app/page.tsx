"use client";

// app/mint/page.tsx
import GenesisExampleCard from "../components/GenesisExampleCard";

export default function MintPage() {
  return (
    <main className="page-shell">
      <section className="content-shell" style={{ textAlign: "center" }}>
        <h1 className="page-title">Genesis Mint</h1>

        <p className="page-subtitle" style={{ maxWidth: 820, margin: "0 auto" }}>
          Welcome to the Bit Brains Genesis mint interface.
        </p>

        <p className="page-subtitle" style={{ maxWidth: 820, margin: "0.75rem auto 0" }}>
          Minting will be available on Ethereum and Solana.
        </p>

        <div style={{ marginTop: "1.5rem" }}>
          <button className="btn-disabled" disabled>
            Mint (Coming Soon)
          </button>
        </div>

        {/* Explicit disclaimer */}
        <div
          style={{
            marginTop: "1.25rem",
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.62)",
          }}
        >
          EXAMPLE NFT ONLY — NOT FINAL PRODUCTION
        </div>

        {/* Centered card */}
        <div style={{ marginTop: "1.25rem", display: "grid", placeItems: "center" }}>
          <GenesisExampleCard
            frontSrc="/images/IMG_1090.jpeg"
            rotateFront={true}
            rotateSeconds={26}
            accentColor="rgba(120,185,255,0.95)"
          />
        </div>
      </section>
    </main>
  );
}
