import Link from "next/link";

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
          {/* BRAND LOCKUP */}
          <div
            style={{
              display: "grid",
              placeItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: "0.22em",
                marginLeft: "0.22em",
                color: "rgba(255,255,255,0.95)",
              }}
            >
              BIT BRAINS
            </div>

            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)",
                marginTop: 6,
              }}
            >
              Brain Intelligence Technology
            </div>
          </div>

          {/* HERO TITLE */}
          <h1 className="page-title">
            Genesis begins.
          </h1>

          {/* MINT ANNOUNCEMENT */}
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "0.05em",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            Pickle Punks Genesis Mint begins March 1, 2026.
            <br />
            Brains Genesis Mint — Date TBD.
          </div>

          {/* CTA */}
          <Link
            href="/picklepunks/mint"
            style={{
              marginTop: "0.75rem",
              padding: "12px 24px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#ffffff",
              fontWeight: 600,
              textDecoration: "none",
              transition: "0.2s ease",
            }}
          >
            Enter Genesis Mint →
          </Link>

          {/* SITE STATUS */}
          <div
            style={{
              marginTop: "1.25rem",
              opacity: 0.55,
              fontSize: 14,
            }}
          >
            Website & GitHub under active development.
          </div>

          {/* BRAIN IMAGE */}
          <div
            style={{
              marginTop: "2.5rem",
              width: "100%",
              maxWidth: 520,
              opacity: 0.95,
            }}
          >
            <img
              src="/brain-evolution.gif"
              alt="Genesis brain evolution"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                borderRadius: 18,
              }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
