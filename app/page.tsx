import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="home-hero">
        <div className="home-left">
          <h1 className="home-title">Proof of Care comes first.</h1>

          <p className="home-subtitle">
            Bit Brains is a protocol for NFTs, ENS-based identity, zero-knowledge
            eligibility, and real-world asset integration — beginning on Ethereum.
          </p>

          <Link className="home-link" href="/proof-of-care">
            Enter Proof of Care →
          </Link>
        </div>

        <div className="home-right">
          {/* Construction Notice */}
          <div className="construction-notice">
            <p><strong>Website &amp; GitHub</strong></p>
            <p>Under Construction</p>
            <p>Launching Soon</p>
          </div>

          {/* Brain Container */}
          <div className="brain-wrapper">
            {/* TOP-RIGHT BIT */}
            <div className="bit-label">
              BIT
            </div>

            <div className="neuron-layer" />
            <div className="spark-layer" />

            <img
              className="brain-image"
              src="/brain-evolution.gif"
              alt="Bit Brains"
            />

            {/* BOTTOM-RIGHT TEXT */}
            <div className="brain-text">
              <div>BRAIN</div>
              <div>INTELLIGENCE</div>
              <div>TOKEN</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
