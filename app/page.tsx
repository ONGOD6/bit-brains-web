export default function Home() {
  return (
    <div className="page-shell">
      <div className="home-hero">
        {/* =========================
            LEFT SIDE TEXT
        ========================= */}
        <div className="home-left">
          <h1 className="home-title">Proof of Care comes first.</h1>

          <p className="home-subtitle">
            Bit Brains is a protocol for NFTs, ENS-based identity,
            zero-knowledge eligibility, and real-world asset integration —
            beginning on Ethereum.
          </p>

          <a className="home-link" href="/proof-of-care">
            Enter Proof of Care →
          </a>

          {/* Under construction notice */}
          <div style={{ marginTop: "2.5rem", fontWeight: 600 }}>
            <div>Website & GitHub</div>
            <div>Under Construction</div>
            <div style={{ marginTop: "0.5rem" }}>Launching Soon</div>
          </div>
        </div>

        {/* =========================
            RIGHT SIDE — BRAIN
        ========================= */}
        <div className="home-right">
          <div className="brain-wrapper">
            {/* BIT — top right */}
            <div
              style={{
                position: "absolute",
                top: "-26px",
                right: "14px",
                fontSize: "28px",
                fontWeight: 900,
                letterSpacing: "2px",
                color: "#000",
                zIndex: 10,
                pointerEvents: "none",
              }}
            >
              BIT
            </div>

            {/* Brain image */}
            <img
              src="/images/brain.gif"   // 🔁 change ONLY if your filename differs
              alt="Brain Intelligence"
              className="brain-image"
            />

            {/* Brain Intelligence Token — bottom right */}
            <div
              style={{
                position: "absolute",
                right: "24px",
                bottom: "18px",
                fontSize: "36px",
                fontWeight: 900,
                textAlign: "right",
                color: "#ffffff",
                textShadow: "0 2px 14px rgba(0,0,0,0.75)",
                zIndex: 10,
                pointerEvents: "none",
              }}
            >
              Brain Intelligence Token
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
