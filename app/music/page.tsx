"use client";

export default function MusicPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1>Community Music — Digibeats</h1>

      <p style={{ opacity: 0.85, lineHeight: 1.6 }}>
        Digibeats tracks are curated from the GetHype community.
        <br />
        Music playback and drops are coming soon.
      </p>

      <a
        href="https://gethype.digital"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          marginTop: "1.5rem",
          color: "#60a5fa",
          textDecoration: "underline",
        }}
      >
        Visit Digibeats on GetHype →
      </a>
    </div>
  );
}
