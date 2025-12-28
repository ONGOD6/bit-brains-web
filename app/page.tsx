import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="home-hero">
        <div className="home-left">
          <h1 className="home-title">Proof of Care comes first.</h1>

          <p className="home-subtitle">
            Bit Brains is a protocol for NFTs, ENS-based identity,
            zero-knowledge eligibility, and real-world asset integration —
            beginning on Ethereum.
          </p>

          <Link className="home-link" href="/proof-of-care">
            Enter Proof of Care →
          </Link>
        </div>

        <div className="home-right">
          <div className="brain-wrapper">
            <div className="neuron-layer" />
            <div className="spark-layer" />

            <img
              className="brain-image"
              src="/brain-evolution.gif"
              alt="Bit Brains"
            />

            {/* UNDER CONSTRUCTION NOTICE */}
            <div className="construction-notice">
              <p><strong>Website & GitHub</strong></p>
              <p>Under Construction</p>
              <p>Launching Soon</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
