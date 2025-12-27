'use client';
import Link from "next/link";

export default function HomePage() {
  const brainGifSrc = "/images/brain-10813_256.gif";

  return (
    <main className="page">
      {/* Top Nav */}
      <header className="topNav">
        <nav className="navLinks">
          <Link className="navLink" href="/">
            Home
          </Link>
          <Link className="navLink" href="/manifesto">
            Manifesto
          </Link>
          <Link className="navLink" href="/mint">
            Mint
          </Link>
          <Link className="navLink" href="/music">
            Music
          </Link>
          <Link className="navLink" href="/stake">
            Stake
          </Link>
          <Link className="navLink" href="/proof-of-care">
            Proof of Care
          </Link>
          <Link className="navLink" href="/ens">
            ENS
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="heroWrap" aria-label="Bit Brains hero">
        <div className="heroCard">
          <div className="heroTitle">BIT BRAINS</div>

          <p className="heroSubtitle">
            Proof of Care (PoC) is the genesis signal. Brains evolve through continuity,
            verification, and time—anchored by ENS identity and secured by zero-knowledge
            proof systems—until autonomous, intelligent technology emerges.
          </p>

          {/* Brain Field */}
          <div className="fieldWrap">
            <div className="outerRing" aria-hidden="true" />
            <div className="innerField">
              <div className="brainCenter">
                <img
                  className="brainGif"
                  src={brainGifSrc}
                  alt="Rotating brain"
                  draggable={false}
                />
              </div>
              <div className="fieldGlow" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      {/* Background layers */}
      <div className="bgGlowA" aria-hidden="true" />
      <div className="bgGlowB" aria-hidden="true" />

      <style jsx>{`
        /* ----------------------------
           PAGE / BACKGROUND
        ---------------------------- */
        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;

          /* background */
          background: radial-gradient(1200px 800px at 50% 20%, rgba(58, 108, 255, 0.18), rgba(0, 0, 0, 0)),
            radial-gradient(900px 600px at 20% 40%, rgba(124, 58, 237, 0.12), rgba(0, 0, 0, 0)),
            linear-gradient(180deg, #050712 0%, #03040c 45%, #02030a 100%);
          color: rgba(255, 255, 255, 0.92);
        }

        /* Decorative glows (behind everything) */
        .bgGlowA {
          position: absolute;
          inset: -200px -200px auto -200px;
          height: 520px;
          background: radial-gradient(closest-side, rgba(66, 153, 225, 0.18), rgba(0, 0, 0, 0));
          filter: blur(18px);
          pointer-events: none;
          z-index: 0;
        }

        .bgGlowB {
          position: absolute;
          inset: auto -200px -260px -200px;
          height: 560px;
          background: radial-gradient(closest-side, rgba(147, 51, 234, 0.14), rgba(0, 0, 0, 0));
          filter: blur(20px);
          pointer-events: none;
          z-index: 0;
        }

        /* ----------------------------
           TOP NAV
        ---------------------------- */
        .topNav {
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(10px);
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.25));
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .navLinks {
          max-width: 1200px;
          margin: 0 auto;
          padding: 14px 18px;
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          align-items: center;
        }

        .navLink {
          color: rgba(255, 255, 255, 0.78);
          text-decoration: none;
          font-size: 14px;
          letter-spacing: 0.2px;
        }

        .navLink:hover {
          color: rgba(255, 255, 255, 0.95);
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        /* ----------------------------
           HERO LAYOUT
        ---------------------------- */
        .heroWrap {
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 38px 18px 60px;
          position: relative;
          z-index: 1; /* above bg glows */
        }

        .heroCard {
          width: min(1200px, 100%);
          border-radius: 22px;
          padding: 34px 26px 30px;
          background: rgba(8, 12, 28, 0.62);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 18px 60px rgba(0, 0, 0, 0.42);
          backdrop-filter: blur(10px);

          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 14px;
        }

        .heroTitle {
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 800;
          letter-spacing: 6px;
          line-height: 1.1;
          margin-top: 2px;
        }

        .heroSubtitle {
          max-width: 920px;
          margin: 0;
          font-size: 16px;
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.82);
        }

        /* ----------------------------
           BRAIN FIELD (NO OVERLAP)
        ---------------------------- */
        .fieldWrap {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 10px;
          position: relative;
        }

        .outerRing {
          position: absolute;
          width: min(760px, 92vw);
          height: min(420px, 55vw);
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
          background: radial-gradient(closest-side, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0));
          filter: blur(0px);
        }

        .innerField {
          width: min(760px, 92vw);
          height: min(420px, 55vw);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          background: rgba(0, 0, 0, 0.22);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .brainCenter {
          width: min(520px, 72vw);
          aspect-ratio: 16 / 9;
          border-radius: 14px;
          background: rgba(0, 0, 0, 0.28);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          z-index: 2;
        }

        .brainGif {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .fieldGlow {
          position: absolute;
          inset: -40%;
          background: radial-gradient(circle at 50% 45%, rgba(96, 165, 250, 0.22), rgba(0, 0, 0, 0) 55%);
          filter: blur(22px);
          z-index: 1;
          pointer-events: none;
        }

        /* Mobile tweaks */
        @media (max-width: 640px) {
          .heroCard {
            padding: 26px 16px 22px;
          }
          .navLinks {
            gap: 12px;
          }
        }
      `}</style>
    </main>
  );
}
