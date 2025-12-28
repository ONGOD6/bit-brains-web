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
        Lantern sessions — soft ambience, community sound, and future drops.
      </p>

      <a
        href="https://gethype.digital"
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: "1.05rem", textDecoration: "underline" }}
      >
        Visit Digibeats on GetHype →
      </a>

      <div style={{ height: "2rem" }} />

      {/* YOUTUBE EMBED (Lanterns) */}
      <div
        style={{
          width: "min(720px, 95vw)",
          margin: "0 auto",
          position: "relative",
          paddingBottom: "56.25%", // 16:9
          height: 0,
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.10)",
          boxShadow: "0 10px 28px rgba(0,0,0,0.12)",
          background: "rgba(0,0,0,0.04)",
        }}
      >
        <iframe
          src="https://www.youtube.com/embed/4ROrW727q_s"
          title="Floating Lanterns — Ambient"
          frameBorder="0"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      <div style={{ height: "1rem" }} />

      {/* LOCAL AUDIO PLAYER */}
      <div
        style={{
          width: "min(720px, 95vw)",
          margin: "0 auto",
          padding: "0.85rem 0.9rem",
          borderRadius: 14,
          border: "1px solid rgba(0,0,0,0.10)",
          background: "rgba(0,0,0,0.04)",
          boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ marginBottom: "0.5rem", opacity: 0.9 }}>
          Soft Ambient (Local)
        </div>

        <audio controls style={{ width: "100%" }}>
          <source src="/Audio/Ambient.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
    </main>
  );
}
