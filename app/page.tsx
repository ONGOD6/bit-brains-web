// app/page.tsx
import Link from "next/link";
import GenesisExampleCard from "./components/GenesisExampleCard";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="content-shell">
        {/* HERO BLOCK */}
        <div
          style={{
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            gap: "1.25rem",
          }}
        >
          {/* BIT LOCKUP */}
          <div
            style={{
              display: "grid",
              placeItems: "center",
              marginBottom: "0.25rem",
            }}
          >
            {/* BIT (centered over INTELLIGENCE) */}
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "0.22em",
                marginLeft: "0.22em", // optical centering over INTELLIGENCE
                color: "rgba(255,255,255,0.95)",
              }}
            >
              BIT
            </div>

            {/* BRAIN INTELLIGENCE TOKEN (single line) */}
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.75)",
              }}
            >
              Brain Intelligence Token
            </div>
          </div>

          {/* HERO TEXT */}
          <h1 className="page-title">Proof of Care comes first.</h1>

          <p className="page-subtitle" style={{ maxWidth: 820 }}>
            Bit Brains is a protocol for NFTs, ENS-based Identity,
            Zero-Knowledge Proof Eligibility, and Real-World Asset Integration —
            beginning on Ethereum.
          </p>

          <Link
            href="/proof-of-care"
            style={{
              marginTop: "0.25rem",
              color: "rgba(255,255,255,0.9)",
              textDecoration: "underline",
              fontWeight: 600,
            }}
          >
            Enter Proof of Care →
          </Link>

          <div
            style={{
              marginTop: "0.75rem",
              opacity: 0.65,
              fontWeight: 600,
            }}
          >
            Website & GitHub
            <br />
            Under Construction
            <br />
            Launching Soon
          </div>

          {/* CARD CENTERPIECE */}
          <div style={{ marginTop: "2.25rem" }}>
            <GenesisExampleCard
              frontSrc="/images/IMG_1090.jpeg"
              rotateFront
              rotateSeconds={26}
              accentColor="rgba(120,185,255,0.95)"
            />
          </div>

          {/* EXPLICIT DISCLAIMER */}
          <div
            style={{
              marginTop: "1.25rem",
              maxWidth: 520,
              fontSize: 13,
              lineHeight: 1.5,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            <strong>EXAMPLE NFT ONLY.</strong>
            <br />
            This card is a visual prototype for demonstration purposes. Final
            production Genesis NFTs may differ in appearance, traits, and
            structure.
          </div>
        </div>
      </section>
    </main>
  );
}
