"use client";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "4rem 1.5rem",
      }}
    >
      {/* Brain */}
      <img
        src="/brain-evolution.gif"
        alt="Proof of Care Brain"
        style={{
          maxWidth: "300px",
          marginBottom: "2.5rem",
          animation: "spin 28s linear infinite",
          opacity: 0.95,
        }}
      />

      {/* Animation */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {/* Title */}
      <h1 style={{ fontSize: "2.25rem", marginBottom: "1rem" }}>Proof of Care</h1>

      {/* Core Message */}
      <p
        style={{
          maxWidth: "720px",
          fontSize: "1.15rem",
          lineHeight: 1.6,
          opacity: 0.9,
          marginBottom: "2rem",
        }}
      >
        A new protocol standard for intelligence, stewardship,
        <br />
        and value rooted in verifiable care.
        <br />
        <br />
        <strong>Everything else emerges from it.</strong>
      </p>

      {/* CTA */}
      <a
        href="/proof-of-care"
        style={{
          textDecoration: "none",
          padding: "0.75rem 1.5rem",
          border: "1px solid currentColor",
          borderRadius: "999px",
          fontSize: "0.95rem",
          opacity: 0.85,
        }}
      >
        Explore Proof of Care →
      </a>
    </main>
  );
}
