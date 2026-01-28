 import Link from "next/link";

export const metadata = {
  title: "BITY Nodes — ENS Identity",
  description: "ENS identity and reward routing for BITY Nodes",
};

export default function ENSPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#06080d",
        color: "#ffffff",
        padding: "3rem 1.5rem",
      }}
    >
      {/* Inline animation styles (no globals.css) */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }

        @keyframes glow {
          0% { text-shadow: 0 0 12px rgba(80,160,255,0.25); }
          50% { text-shadow: 0 0 28px rgba(80,160,255,0.55); }
          100% { text-shadow: 0 0 12px rgba(80,160,255,0.25); }
        }
      `}</style>

      {/* HEADER */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto 3rem",
          padding: "2.25rem 2rem",
          borderRadius: 20,
          border: "1px solid rgba(80,160,255,0.35)",
          background:
            "linear-gradient(135deg, rgba(80,160,255,0.12), rgba(255,255,255,0.03))",
          boxShadow: "0 0 0 1px rgba(80,160,255,0.08) inset",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.75rem",
            textAlign: "center",
          }}
        >
          {[
            { name: "bitbrains.eth", role: "Genesis / Protocol Root" },
            { name: "bitynodes.eth", role: "BITY Nodes Root" },
            { name: "onodes.eth", role: "Operators" },
            { name: "vnodes.eth", role: "Verifiers" },
          ].map((ens) => (
            <div
              key={ens.name}
              style={{
                animation: "float 4.2s ease-in-out infinite",
              }}
            >
              <div
                style={{
                  fontSize: "2.2rem",
                  fontWeight: 900,
                  letterSpacing: "0.04em",
                  color: "rgba(210,230,255,1)",
                  animation: "glow 5s ease-in-out infinite",
                }}
              >
                {ens.name}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: "0.95rem",
                  opacity: 0.75,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {ens.role}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DESCRIPTION */}
      <section
        style={{
          maxWidth: 900,
          margin: "0 auto",
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.035)",
          padding: "1.75rem 1.75rem 1.9rem",
          lineHeight: 1.65,
          color: "rgba(255,255,255,0.88)",
        }}
      >
        <p style={{ marginTop: 0 }}>
          ENS is the canonical <strong>identity and reward routing layer</strong>{" "}
          for BITY Nodes.
        </p>

        <p>
          ENS names do <strong>not</strong> bind nodes, verify eligibility, or
          enforce protocol rules. All qualification logic, accounting, and
          verification occurs internally within the BITY Nodes protocol.
        </p>

        <p>
          ENS defines <strong>where rewards are delivered</strong> once eligibility
          has already been proven. Resolution occurs at claim time only.
        </p>

        <ul style={{ marginTop: "1.1rem", paddingLeft: "1.2rem", opacity: 0.9 }}>
          <li>ZK proofs determine <em>if</em> rewards can be claimed</li>
          <li>ENS resolution determines <em>where</em> rewards are sent</li>
          <li>ENS records are fully user-controlled</li>
          <li>ENS gas is paid by the user, not the protocol</li>
        </ul>

        <div style={{ marginTop: "1.5rem", fontSize: 14, opacity: 0.65 }}>
          ENS resolution is required only at claim time. Changing ENS records does
          not affect eligibility or accrued rewards.
        </div>

        <div style={{ marginTop: "1.75rem" }}>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: "rgba(180,210,255,0.9)",
              fontSize: 14,
            }}
          >
            ← Back to BITY Nodes
          </Link>
        </div>
      </section>
    </main>
  );
}
