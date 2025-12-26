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
      {/* ========================= */}
      {/* Brain (large, static) */}
      {/* ========================= */}
      <img
        src="/brain-evolution.gif"
        alt="Proof of Care Brain"
        style={{
          width: "100%",
          maxWidth: "600px", // large size stays
          marginBottom: "2.75rem",
          opacity: 0.96,
        }}
      />

      {/* ========================= */}
      {/* Title */}
      {/* ========================= */}
      <h1
        style={{
          fontSize: "2.5rem",
          marginBottom: "1.25rem",
          fontWeight: 600,
        }}
      >
        Proof of Care
      </h1>

      {/* ========================= */}
      {/* Core Message */}
      {/* ========================= */}
      <p
        style={{
          maxWidth: "720px",
          fontSize: "1.15rem",
          lineHeight: 1.6,
          opacity: 0.9,
          marginBottom: "2.25rem",
        }}
      >
        A new protocol standard for intelligence, stewardship,
        <br />
        and value rooted in verifiable care.
        <br />
        <br />
        <strong>Everything else emerges from it.</strong>
      </p>

      {/* ========================= */}
      {/* CTA */}
      {/* ========================= */}
      <a
        href="/proof-of-care"
        style={{
          textDecoration: "none",
          padding: "0.8rem 1.75rem",
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
