export default function ProofOfCareContinuityPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "2.5rem 1.25rem",
        maxWidth: "980px",
        margin: "0 auto",
      }}
    >
      {/* Title */}
      <header style={{ marginBottom: "2rem" }}>
        <div
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.75,
            marginBottom: "0.75rem",
          }}
        >
          Phase I — Brains
        </div>

        <h1 style={{ fontSize: "2.6rem", margin: 0 }}>
          Proof of Care &amp; Continuity
        </h1>

        <p
          style={{
            marginTop: "0.85rem",
            fontSize: "1.1rem",
            lineHeight: 1.6,
            opacity: 0.9,
            maxWidth: "760px",
          }}
        >
          This page establishes the foundation of the protocol for{" "}
          <strong>Brains</strong>. Proof of Care and Continuity verify identity
          and persistence across epochs using <strong>ENS</strong> and{" "}
          <strong>zero-knowledge proofs</strong>.
        </p>
      </header>

      {/* Info Cards */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: "14px",
            padding: "1.25rem",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "0.6rem" }}>
            What is Proof of Care?
          </h2>
          <p style={{ margin: 0, lineHeight: 1.6, opacity: 0.9 }}>
            Proof of Care is a cryptographic commitment that a Brain holder
            maintains responsibility, alignment, and participation over time.
            Care is not mined or traded — it is proven.
          </p>
        </div>

        <div
          style={{
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: "14px",
            padding: "1.25rem",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "0.6rem" }}>
            What is Continuity?
          </h2>
          <p style={{ margin: 0, lineHeight: 1.6, opacity: 0.9 }}>
            Continuity confirms that the same Brain identity persists across
            epochs. It verifies consistent control of an ENS identity through
            zero-knowledge proofs without exposing private wallet data.
          </p>
        </div>

        <div
          style={{
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: "14px",
            padding: "1.25rem",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "0.6rem" }}>
            No Wallet Connection Required
          </h2>
          <p style={{ margin: 0, lineHeight: 1.6, opacity: 0.9 }}>
            Proof of Care &amp; Continuity do not require persistent wallet
            connection. Verification is performed through ENS-based identity and
            zero-knowledge commitments — without custody or permissions.
          </p>
        </div>
      </section>

      {/* Phase description */}
      <section
        style={{
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: "14px",
          padding: "1.25rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "0.75rem" }}>
          Phase I (Brains) — What Happens Here
        </h2>

        <ul style={{ margin: 0, paddingLeft: "1.25rem", lineHeight: 1.8 }}>
          <li>
            Brains establish a Proof of Care commitment tied to a canonical ENS
            identity.
          </li>
          <li>
            Brains demonstrate continuity across epochs using zero-knowledge
            proofs.
          </li>
          <li>No autonomous behavior is enabled in this phase.</li>
          <li>No compute or mining is performed in this phase.</li>
        </ul>

        <p style={{ marginTop: "0.9rem", lineHeight: 1.6, opacity: 0.9 }}>
          This phase exists to build a trusted identity and continuity layer
          before any advanced capabilities are introduced.
        </p>
      </section>

      {/* Status / Coming soon actions */}
      <section
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "center",
          justifyContent: "space-between",
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: "14px",
          padding: "1.25rem",
        }}
      >
        <div style={{ maxWidth: "680px" }}>
          <div style={{ fontWeight: 800, marginBottom: "0.25rem" }}>
            Status
          </div>
          <div style={{ opacity: 0.9, lineHeight: 1.6 }}>
            Proof of Care &amp; Continuity is defined for{" "}
            <strong>Phase I — Brains</strong>. Additional phases will be
            introduced through separate pages as the protocol evolves.
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <button
            disabled
            style={{
              padding: "0.85rem 1.1rem",
              borderRadius: "999px",
              border: "1px solid rgba(0,0,0,0.15)",
              background: "#f3f3f3",
              opacity: 0.7,
              cursor: "not-allowed",
              fontWeight: 700,
            }}
          >
            Verify Proof of Care (Coming Soon)
          </button>

          <button
            disabled
            style={{
              padding: "0.85rem 1.1rem",
              borderRadius: "999px",
              border: "1px solid rgba(0,0,0,0.15)",
              background: "#f3f3f3",
              opacity: 0.7,
              cursor: "not-allowed",
              fontWeight: 700,
            }}
          >
            Submit Continuity Proof (Coming Soon)
          </button>
        </div>
      </section>
    </main>
  );
}
