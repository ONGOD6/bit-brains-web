export default function MusicPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "2.5rem 1.25rem",
        maxWidth: "960px",
        margin: "0 auto",
        lineHeight: 1.65,
      }}
    >
      <h1 style={{ fontSize: "2.4rem", marginBottom: "0.75rem" }}>
        Community Music — Digibeats
      </h1>

      <p style={{ opacity: 0.9, fontSize: "1.1rem", marginBottom: "1.25rem" }}>
        Digibeats tracks are curated from the GetHype community. Music playback and drops are coming soon.
      </p>

      <a
        href="https://gethype.com"
        target="_blank"
        rel="noreferrer"
        style={{ fontSize: "1.05rem", textDecoration: "underline" }}
      >
        Visit Digibeats on GetHype →
      </a>
    </main>
  );
}
