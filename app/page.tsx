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
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* LEFT COLUMN */}
          <div>
            <h1 className="page-title">Proof of Care comes first.</h1>

            <p className="page-subtitle" style={{ maxWidth: 520 }}>
              Bit Brains is a protocol for NFTs, ENS-based identity,
              zero-knowledge eligibility, and real-world asset integration —
              beginning on Ethereum.
            </p>

            <div style={{ marginTop: "1.25rem" }}>
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

            {/* Under construction block (kept left) */}
            <div style={{ marginTop: "2.25rem", opacity: 0.65 }}>
              <div style={{ fontWeight: 700 }}>Website &amp; GitHub</div>
              <div style={{ fontWeight: 700 }}>Under Construction</div>
              <div style={{ fontWeight: 700 }}>Launching Soon</div>
            </div>

            {/* Centered Genesis Preview (hero centerpiece) */}
            <div
              style={{
                marginTop: "2.25rem",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div style={{ width: "100%", maxWidth: 520 }}>
                <GenesisExampleCard
                  frontSrc="/images/IMG_1090.jpeg"
                  rotateFront={true}
                  rotateSeconds={26}
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "2.4rem",
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "0.02em",
              }}
            >
              <div>BIT</div>
              <div>Brain Intelligence</div>
              <div>Token</div>
            </div>

            {/* brain-evolution.gif removed from homepage as requested */}
          </div>
        </div>
      </section>
    </main>
  );
}
