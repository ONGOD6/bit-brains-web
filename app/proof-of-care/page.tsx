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
      {/* Nerve / Autonomy Image (Animated) */}
      {/* ============================ */}
      <section style={{ marginTop: "2.5rem" }}>
        <div className="poc-image-wrap">
          <Image
            src="/images/IMG_0617.jpg"
            alt="Proof of Care — Care Signal to Autonomy"
            width={1400}
            height={800}
            priority
            className="poc-image"
          />
        </div>
        <p style={{ opacity: 0.85, marginTop: "0.9rem" }}>
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

      <style jsx>{`
        .poc-image-wrap {
          margin-top: 1.25rem;
          border-radius: 16px;
          overflow: hidden;
          will-change: transform, filter;
          animation: drift 7.5s ease-in-out infinite;
          filter: drop-shadow(0 10px 28px rgba(0, 0, 0, 0.35));
        }

        .poc-image {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 16px;
          animation: glow 6.5s ease-in-out infinite;
        }

        @keyframes drift {
          0% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-6px) scale(1.01);
          }
          100% {
            transform: translateY(0px) scale(1);
          }
        }

        @keyframes glow {
          0% {
            filter: brightness(1) contrast(1);
          }
          50% {
            filter: brightness(1.06) contrast(1.03);
          }
          100% {
            filter: brightness(1) contrast(1);
          }
        }
      `}</style>
    </main>
  );
}
