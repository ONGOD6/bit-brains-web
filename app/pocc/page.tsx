export default function POCCPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "2.5rem 1.25rem",
        maxWidth: "960px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <h1 style={{ fontSize: "2.6rem", marginBottom: "0.75rem" }}>
        Brains — Proof of Care & Continuity
      </h1>

      <p
        style={{
          fontSize: "1.15rem",
          opacity: 0.9,
          maxWidth: "720px",
          marginBottom: "2rem",
        }}
      >
        This phase establishes cryptographic proof that a Brain remains active,
        accountable, and aligned with the Proof of Care protocol over time.
      </p>

      {/* CORE CONCEPT */}
      <section
        style={{
          padding: "1.5rem",
          border: "1px solid rgba(0,0,0,0.15)",
          borderRadius: "14px",
          marginBottom: "1.75rem",
        }}
      >
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          What You Are Signing
        </h2>

        <ul style={{ paddingLeft: "1.25rem", lineHeight: 1.7 }}>
          <li>Proof of ongoing participation (continuity)</li>
          <li>Commitment to protocol-aligned behavior</li>
          <li>Non-transferable accountability signal</li>
          <li>No wallet session required</li>
        </ul>
      </section>

      {/* ZK + ENS */}
      <section
        style={{
          padding: "1.5rem",
          border: "1px solid rgba(0,0,0,0.15)",
          borderRadius: "14px",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          ENS + Zero-Knowledge Verification
        </h2>

        <p style={{ lineHeight: 1.7, opacity: 0.9 }}>
          Proof of Care & Continuity is verified through ENS ownership and
          zero-knowledge proofs. No wallet connection, signatures, or persistent
          sessions are exposed. Eligibility is proven without revealing wallet
          balances, transactions, or identity.
        </p>
      </section>

      {/* ACTION */}
      <button
        disabled
        style={{
          padding: "0.9rem 1.5rem",
          fontSize: "1rem",
          borderRadius: "999px",
          opacity: 0.6,
          cursor: "not-allowed",
          alignSelf: "flex-start",
        }}
      >
        Sign Proof of Care & Continuity (Coming Soon)
      </button>

      {/* FOOTNOTE */}
      <p
        style={{
          marginTop: "1.25rem",
          fontSize: "0.95rem",
          opacity: 0.7,
          maxWidth: "640px",
        }}
      >
        This is Phase I — Brains. Future phases will introduce Cerebrals and
        autonomous AIT continuity verification.
      </p>
    </main>
  );
}
