import Link from "next/link";

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
          {/* BIT BRAINS LOCKUP (PROTOCOL BRAND — NOT TOKEN) */}
          <div
            style={{
              display: "grid",
              placeItems: "center",
              marginBottom: "0.25rem",
              gap: "0.35rem",
            }}
          >
            {/* BIT BRAINS */}
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "0.22em",
                marginLeft: "0.22em",
                color: "rgba(255,255,255,0.95)",
              }}
            >
              BIT BRAINS
            </div>

            {/* BRAIN INTELLIGENCE TECHNOLOGY (PROTOCOL ACRONYM LANGUAGE) */}
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.75)",
              }}
            >
              Brain Intelligence Technology
            </div>

            {/* TOKEN IDENTITY (SUBTLE, NON-PROMISSORY) */}
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.55)",
                textTransform: "uppercase",
              }}
            >
              Native token: BITS (Brain Intelligence Technology Services) — launches
              at DAO activation (Mar 1, 2027)
            </div>
          </div>

          {/* HERO TEXT */}
          <h1 className="page-title">Proof of Care comes first.</h1>

          <p className="page-subtitle" style={{ maxWidth: 820 }}>
            Bit Brains is a protocol for NFTs, ENS-based Identity,
            Zero-Knowledge Proof Eligibility, Autonomous Intelligence Node
            Protocol, and Real-World Asset Integration — beginning on Ethereum.
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

          {/* SITE STATUS */}
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

          {/* BITY NODES NOTICE (UNCHANGED) */}
          <div
            style={{
              marginTop: "2rem",
              opacity: 0.75,
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            <strong>BITY Nodes Protocol</strong> — Under Construction
            <br />
            <Link
              href="https://github.com/ONGOD6"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "0.85rem",
                textDecoration: "underline",
                opacity: 0.85,
              }}
            >
              View GitHub →
            </Link>
          </div>

          {/* ✅ NEW: SINGLE SENTENCE + LINK (ONLY ADDITION) */}
          <div
            style={{
              marginTop: "0.75rem",
              fontSize: "0.85rem",
              opacity: 0.7,
              textAlign: "center",
            }}
          >
            Please visit the node website at{" "}
            <Link
              href="https://bitynodes.us"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "underline" }}
            >
              bitynodes.us
            </Link>{" "}
            to learn more about autonomous intelligence nodes and verification.
          </div>

          {/* BRAIN IMAGE CENTERPIECE */}
          <div
            style={{
              marginTop: "2.25rem",
              width: "100%",
              maxWidth: 520,
              opacity: 0.95,
            }}
          >
            <img
              src="/brain-evolution.gif"
              alt="Brain evolution"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                borderRadius: 18,
              }}
            />
          </div>

          {/* DISCLAIMER */}
          <div
            style={{
              marginTop: "1.25rem",
              maxWidth: 520,
              fontSize: 13,
              lineHeight: 1.5,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            <strong>EXAMPLE IMAGE ONLY.</strong>
            <br />
            This image is a visual prototype for demonstration purposes. Final
            production Genesis NFTs may differ in appearance, traits, and
            structure.
          </div>
        </div>
      </section>
    </main>
  );
}
