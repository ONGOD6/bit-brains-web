"use client";

import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #111827 0%, #020617 70%)",
        color: "#ffffff",
      }}
    >
      {/* ===== HEADER / NAV (TOP) ===== */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 9999,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          background: "rgba(2,6,23,0.70)",
          borderBottom: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <nav
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <Link
            href="/"
            style={{
              fontWeight: 800,
              letterSpacing: "0.4px",
              textDecoration: "none",
              color: "#fff",
            }}
          >
            Bit Brains
          </Link>

          <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
            <Link
              href="/proof-of-care"
              style={{
                textDecoration: "none",
                color: "rgba(255,255,255,0.92)",
              }}
            >
              Proof of Care
            </Link>
            <Link
              href="/protocol-standards"
              style={{
                textDecoration: "none",
                color: "rgba(255,255,255,0.92)",
              }}
            >
              Protocol Standards
            </Link>
          </div>
        </nav>
      </header>

      {/* ===== HERO ===== */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "64px 20px 36px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
            fontWeight: 700,
            marginBottom: "16px",
          }}
        >
          Proof of Care comes first.
        </h1>

        <p
          style={{
            maxWidth: "720px",
            margin: "0 auto 28px",
            fontSize: "1.05rem",
            lineHeight: 1.6,
            opacity: 0.9,
          }}
        >
          Bit Brains is a protocol for NFTs, ENS-based identity, zero-knowledge
          eligibility, and real-world asset integration — beginning on Ethereum.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/proof-of-care"
            style={{
              padding: "12px 20px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            Enter Proof of Care →
          </Link>
        </div>
      </section>

      {/* ===== BRAIN VISUAL (CENTERED) ===== */}
      <section
        style={{
          display: "flex",
          justifyContent: "center",
          paddingBottom: "80px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "720px",
            aspectRatio: "1 / 1",
            borderRadius: "28px",
            background:
              "radial-gradient(circle at center, rgba(168,85,247,0.25), rgba(2,6,23,0.9))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Image
            src="/images/brain-10813_256.gif"
            alt="Rotating neural brain"
            width={420}
            height={420}
            priority
          />
        </div>
      </section>
    </main>
  );
}
