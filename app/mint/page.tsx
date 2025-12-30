// app/mint/page.tsx

import GenesisExampleCard from "../components/GenesisExampleCard";

export default function MintPage() {
  return (
    <main className="page-shell">
      <section className="content-shell">
        <h1 className="page-title">Genesis Mint</h1>

        <p className="page-subtitle">
          Welcome to the Bit Brains Genesis mint interface.
        </p>

        <p className="page-subtitle">
          Minting will be available on Ethereum and Solana.
        </p>

        <div style={{ marginTop: "1.5rem" }}>
          <button className="btn-disabled" disabled>
            Mint (Coming Soon)
          </button>
        </div>

        {/* Genesis Brain — Example Card */}
        <div style={{ marginTop: "3.5rem" }}>
          <GenesisExampleCard frontSrc="/images/IMG_1090.jpeg" />
        </div>

        {/* Explanation Text */}
        <div style={{ marginTop: "1.75rem", maxWidth: 720 }}>
          <h2
            style={{
              fontSize: "1.05rem",
              letterSpacing: "0.02em",
              marginBottom: "0.75rem",
              color: "rgba(255,255,255,0.88)",
            }}
          >
            Genesis Brain — Example
          </h2>

          <p className="page-subtitle" style={{ marginBottom: "0.75rem" }}>
            Each Genesis Brain is an immutable origin artifact — minted once,
            fixed forever, and bound to a single identity.
          </p>

          <p className="page-subtitle" style={{ marginBottom: "0.75rem" }}>
            The card shown above is a visual reference of a Genesis Brain.
            Structural elements are fixed, while visual traits vary across the
            collection.
          </p>

          <p className="page-subtitle" style={{ opacity: 0.85 }}>
            Autonomy is not granted at birth — it is earned through Proof of
            Care.
          </p>

          <p className="page-subtitle" style={{ opacity: 0.55, marginTop: 12 }}>
            *Example shown for visual reference only.*
          </p>
        </div>
      </section>
    </main>
  );
}
