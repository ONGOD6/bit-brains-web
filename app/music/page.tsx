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

      {/* External link MUST be <a> for off-site routing */}
      <a
        href="https://gethype.digital"
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: "1.05rem", textDecoration: "underline" }}
      >
        Visit Digibeats on GetHype →
      </a>

      <div style={{ height: "2rem" }} />

      {/* LANTERN FRAME STAGE */}
      <section
        style={{
          position: "relative",
          width: "100%",
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.10)",
          backgroundImage: 'url("/music-frame.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: 520,
          boxShadow: "0 16px 44px rgba(0,0,0,0.35)",
        }}
      >
        {/* Soft dark glass overlay so content is readable */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 40%, rgba(0,0,0,0.15), rgba(0,0,0,0.65) 70%)",
          }}
        />

        {/* Content card */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: "1.25rem",
            display: "grid",
            gap: "1rem",
            justifyItems: "center",
          }}
        >
          {/* Optional cover art */}
          <img
            src="/music-cover.jpg"
            alt="Digibeats Cover"
            style={{
              width: "min(680px, 92vw)",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 10px 28px rgba(0,0,0,0.25)",
            }}
          />

          {/* YouTube embed */}
          <div
            style={{
              width: "min(680px, 92vw)",
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
              borderRadius: 14,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 10px 28px rgba(0,0,0,0.25)",
              background: "rgba(0,0,0,0.25)",
            }}
          >
            <iframe
              src="https://www.youtube.com/embed/4ROrW727q_s"
              title="Digibeats — Community Track"
              frameBorder="0"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
              }}
            />
          </div>

          {/* Local Ambient player (iPad-safe: user taps play) */}
          <div
            style={{
              width: "min(680px, 92vw)",
              padding: "0.85rem 0.9rem",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(0,0,0,0.30)",
              boxShadow: "0 10px 28px rgba(0,0,0,0.20)",
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
        </div>
      </section>

      <p style={{ marginTop: "1.25rem", opacity: 0.85 }}>
        Tip: if the cover image doesn’t exist yet, it will show a broken image.
        Upload <code>/public/music-cover.jpg</code> or tell me and I’ll make it optional.
      </p>
    </main>
  );
}
