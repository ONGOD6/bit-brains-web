// app/page.tsx

import Link from "next/link";
import GenesisExampleCard from "./components/GenesisExampleCard";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="content-shell">
        {/* Top headline + right-side BIT block is assumed to be handled by your existing CSS */}
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

            {/* ✅ Bottom-left Genesis Preview Card */}
            <div style={{ marginTop: "2.25rem", maxWidth: 420 }}>
              <GenesisExampleCard frontSrc="/images/IMG_1090.jpeg" />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ textAlign: "right" }}>
            {/* Keep your BIT stacked text look */}
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

            {/* If you already have a brain GIF/image here, KEEP IT.
                This placeholder is only here so the layout doesn't break if nothing exists. */}
            <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "flex-end" }}>
              {/* Replace this block with your existing brain GIF/image block if you already have it */}
              <div style={{ width: 360, maxWidth: "100%" }} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
