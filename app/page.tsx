// app/page.tsx
import Link from "next/link";
import GenesisExampleCard from "./components/GenesisExampleCard";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="content-shell">
        <div
          style={{
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            gap: "1.25rem",
          }}
        >
          <h1 className="page-title">Proof of Care comes first.</h1>

          <p className="page-subtitle" style={{ maxWidth: 820 }}>
            Bit Brains is a protocol for NFTs, ENS-based identity, zero-knowledge
            eligibility, and real-world asset integration — beginning on Ethereum.
          </p>

          <div style={{ marginTop: "0.35rem" }}>
            <Link
              href="/proof-of-care"
              style={{
                color: "rgba(255,255,255,0.9)",
                textDecoration: "underline",
                fontWeight: 600,
              }}
            >
              Enter Proof of Care →
            </Link>
          </div>

          {/* Under construction block */}
          <div style={{ marginTop: "1.25rem", opacity: 0.65, fontWeight: 700 }}>
            <div>Website &amp; GitHub</div>
            <div>Under Construction</div>
            <div>Launching Soon</div>
          </div>

          {/* Centerpiece Genesis Preview Card */}
          <div style={{ marginTop: "1.25rem", width: "100%" }}>
            <GenesisExampleCard frontSrc="/images/IMG_1090.jpeg" />

            {/* ✅ Explicit disclaimer (NEW) */}
            <div
              style={{
                marginTop: 10,
                fontSize: 12,
                letterSpacing: 0.3,
                color: "rgba(255,255,255,0.58)",
                textAlign: "center",
              }}
            >
              Example NFT for Visual Reference Only — Not Final Production.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
