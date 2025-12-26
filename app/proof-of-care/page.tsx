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
          Proof of Care aligns intelligence, ownership, and responsibility into
          a single accountable system.
        </p>
      </header>

      {/* PoC Visual (smaller + faster motion) */}
      <section style={{ marginTop: "2rem" }}>
        <div className="pocWrap">
          <div className="pocFloat">
            <Image
              src="/images/IMG_0617.jpg"
              alt="Proof of Care — Nerve Autonomy"
              width={1400}
              height={800}
              priority
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "14px",
                boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
                display: "block",
              }}
            />
          </div>
        </div>

        <p style={{ opacity: 0.85, marginTop: "0.9rem" }}>
          Care practices signal responsibility. Responsibility forms stewardship.
          Proof enables access, governance, and yield.
        </p>
      </section>

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
          <strong>
            Care → Signal → Verification → Weight → Influence → Feedback → Care
          </strong>
        </p>
      </section>

      <style jsx>{`
        /* Make the picture smaller and centered */
        .pocWrap {
          max-width: 620px; /* smaller image size */
          margin: 0 auto;
        }

        /* Faster motion */
        .pocFloat {
          animation: floaty 3.6s ease-in-out infinite; /* faster */
          transform-origin: center;
          will-change: transform, filter;
        }

        @keyframes floaty {
          0% {
            transform: translateY(0px) scale(1);
            filter: drop-shadow(0 0 0 rgba(120, 180, 255, 0));
          }
          50% {
            transform: translateY(-12px) scale(1.01);
            filter: drop-shadow(0 0 18px rgba(120, 180, 255, 0.18));
          }
          100% {
            transform: translateY(0px) scale(1);
            filter: drop-shadow(0 0 0 rgba(120, 180, 255, 0));
          }
        }

        /* Mobile safety */
        @media (max-width: 480px) {
          .pocWrap {
            max-width: 92vw;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pocFloat {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}
