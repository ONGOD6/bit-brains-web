  export default function Home() {
  return (
    <div className="page-shell">
      <div className="home-hero">
        {/* ======================
            LEFT SIDE TEXT
        ====================== */}
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

          <div className="home-notice">
            <div>Website &amp; GitHub</div>
            <div>Under Construction</div>
            <div className="home-notice-sub">Launching Soon</div>
          </div>
        </div>

        {/* ======================
            RIGHT SIDE — BRAIN
        ====================== */}
        <div className="home-right">
          <div className="brain-header">
            <div className="bit-tag">BIT</div>
            <div className="bit-title">Brain Intelligence Token</div>
          </div>

          <div className="brain-wrapper">
            <img
              src="/brain-evolution.gif"
              alt="Brain Intelligence"
              className="brain-image"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
