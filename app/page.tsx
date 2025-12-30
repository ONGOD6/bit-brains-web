// app/page.tsx
import Link from "next/link";
import GenesisExampleCard from "./components/GenesisExampleCard";

export default function HomePage() {
  return (
    <main
      className="page-shell"
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <section
        className="content-shell"
        style={{
          width: "100%",
          maxWidth: 1200,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2.5rem",
        }}
      >
        {/* TEXT BLOCK */}
        <div style={{ textAlign: "center", maxWidth: 640 }}>
          <h1 className="page-title">Proof of Care comes first.</h1>

          <p className="page-subtitle">
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

          <div style={{ marginTop: "2rem", opacity: 0.65 }}>
            <div style={{ fontWeight: 700 }}>Website & GitHub</div>
            <div style={{ fontWeight: 700 }}>Under Construction</div>
            <div style={{ fontWeight: 700 }}>Launching Soon</div>
          </div>
        </div>

        {/* ✅ CENTERED CARD */}
        <GenesisExampleCard
          frontSrc="/images/IMG_1090.jpeg"
          rotateFront
        />
      </section>
    </main>
  );
}
