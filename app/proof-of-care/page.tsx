"use client";

import Image from "next/image";

export default function ProofOfCarePage() {
  return (
    <main
      style={{
        padding: "2.5rem",
        maxWidth: "960px",
        margin: "0 auto",
        lineHeight: 1.6,
      }}
    >
      {/* ============================ */}
      {/* Header */}
      {/* ============================ */}
      <header>
        <h1>Proof of Care</h1>

        <p>
          Proof of Care (PoC) is the core consensus primitive of Bit Brains. It
          replaces extractive incentive models with demonstrated stewardship.
        </p>

        <p>
          Care is not claimed — it is observed, attributable, and verifiable.
          Actions that preserve, improve, or responsibly guide intelligent
          systems are recognized as first-class economic signals.
        </p>

        <p>
          Proof of Care aligns intelligence, ownership, and responsibility into a
          single accountable system.
        </p>
      </header>

      {/* ============================ */}
      {/* Proof of Care Visual (Motion) */}
      {/* ============================ */}
      <section style={{ marginTop: "3.5rem", textAlign: "center" }}>
        <div className="nerveWrap">
          <div className="glowRing" aria-hidden="true" />
          <Image
            src="/images/IMG_0617.jpg"
            alt="Proof of Care"
            width={960}
            height={540}
            priority
            className="nerveImg"
          />
        </div>

        <p style={{ marginTop: "1.25rem", opacity: 0.85 }}>
          Care practices signal responsibility. Responsibility forms stewardship.
          Proof enables access, governance, and yield.
        </p>
      </section>

      {/* ============================ */}
      {/* Cerebrals */}
      {/* ============================ */}
      <section style={{ marginTop: "3rem" }}>
        <h2>Cerebrals</h2>

        <p>
          <strong>Cerebrals</strong> are the internal cognitive state layers of a
          Brain. They encode memory, context, intent, and learned behavior over
          time.
        </p>

        <p>
          Care does not directly mutate a Brain as a static artifact. Instead,
          verified care signals condition Cerebrals — shaping how intelligence
          responds, adapts, and evolves.
        </p>
      </section>

      {/* ============================ */}
      {/* The Care Loop */}
      {/* ============================ */}
      <section style={{ marginTop: "3rem" }}>
        <h2>The Care Loop</h2>

        <p>
          Proof of Care operates as a continuous feedback system rather than a
          one-time validation.
        </p>

        <p>
          Care is expressed through action, observed through verifiable signals,
          and reflected back into the system as influence.
        </p>

        <p>
          Care → Signal → Verification → Weight → Influence → Feedback → Care
        </p>
      </section>

      {/* Motion + glow (safe + subtle) */}
      <style jsx>{`
        .nerveWrap {
          position: relative;
          display: inline-block;
          width: min(960px, 100%);
          border-radius: 14px;
          overflow: hidden;
          transform: translateZ(0);
        }

        .nerveImg {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 14px;
          animation: nerveFloat 10s ease-in-out infinite;
          will-change: transform, filter;
        }

        /* Soft living glow behind image */
        .glowRing {
          position: absolute;
          inset: -18%;
          background: radial-gradient(
            circle at 50% 45%,
            rgba(120, 170, 255, 0.22),
            rgba(255, 170, 120, 0.16),
            transparent 60%
          );
          filter: blur(22px);
          opacity: 0.8;
          animation: glowPulse 8.5s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes nerveFloat {
          0% {
            transform: translateY(0px) scale(1);
            filter: saturate(1) brightness(1);
          }
          50% {
            transform: translateY(-6px) scale(1.01);
            filter: saturate(1.05) brightness(1.03);
          }
          100% {
            transform: translateY(0px) scale(1);
            filter: saturate(1) brightness(1);
          }
        }

        @keyframes glowPulse {
          0% {
            transform: scale(1);
            opacity: 0.68;
          }
          50% {
            transform: scale(1.04);
            opacity: 0.95;
          }
          100% {
            transform: scale(1);
            opacity: 0.68;
          }
        }

        /* Respect accessibility settings */
        @media (prefers-reduced-motion: reduce) {
          .nerveImg,
          .glowRing {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}
