"use client";

export default function EthscriptionsMintPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "#ffffff",
        display: "flex",
        justifyContent: "center",
        padding: "2.5rem 1.25rem",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 960, width: "100%" }}>
        {/* ===================== BANNER ===================== */}
        <div
          style={{
            borderRadius: 18,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          {/* put your banner image in /public */}
          <img
            src="/IMG_2082.jpeg"
            alt="Pickle Punks Banner"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </div>

        {/* ===================== HEADLINE ===================== */}
        <div style={{ marginTop: "2.25rem" }}>
          <div
            style={{
              fontSize: "clamp(3rem, 8vw, 4.5rem)", // ~½–1 inch depending on screen
              fontWeight: 900,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            PICKLE PUNKS
          </div>

          <div
            style={{
              marginTop: "0.75rem",
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              fontWeight: 900,
              letterSpacing: "0.22em",
              opacity: 0.9,
            }}
          >
            MINTING SOON
          </div>
        </div>

        {/* ===================== UNDER CONSTRUCTION BOX ===================== */}
        <div
          style={{
            marginTop: "2.5rem",
            padding: "2rem 1.75rem",
            borderRadius: 18,
            border: "1px solid rgba(255,80,80,0.45)",
            background:
              "linear-gradient(180deg, rgba(120,20,20,0.35), rgba(60,10,10,0.25))",
          }}
        >
          <div
            style={{
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            🚧 Under Construction
          </div>

          <p
            style={{
              marginTop: "1.25rem",
              fontSize: "1.05rem",
              lineHeight: 1.7,
              opacity: 0.95,
              maxWidth: 640,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            The Pickle Punks mint page is currently offline while we complete
            final protocol checks, indexing verification, and launch preparation.
          </p>

          <p
            style={{
              marginTop: "1.25rem",
              fontSize: "0.95rem",
              opacity: 0.75,
            }}
          >
            ⚠️ Please do not attempt to mint until the official announcement.
            <br />
            Mint details will be shared through verified Bit Brains channels only.
          </p>
        </div>

        {/* ===================== FOOTER ===================== */}
        <div
          style={{
            marginTop: "3.5rem",
            fontSize: "0.8rem",
            letterSpacing: "0.18em",
            opacity: 0.55,
          }}
        >
          BIT BRAINS PROTOCOL
        </div>
      </div>
    </main>
  );
}
