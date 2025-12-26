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
      {/* ========================= */}
      {/* Header */}
      {/* ========================= */}
      <header>
        <h1 style={{ fontSize: "2.25rem", marginBottom: "1rem" }}>Proof of Care</h1>

        <p>
          Proof of Care (PoC) is the core consensus primitive of Bit Brains. It replaces
          extractive incentive models with demonstrated stewardship.
        </p>

        <p>
          Care is not claimed — it is observed, attributable, and verifiable. Actions that
          preserve, improve, or responsibly guide intelligent systems are recognized as
          first-class economic signals.
        </p>

        <p>
          Proof of Care aligns intelligence, ownership, and responsibility into a single
          accountable system.
        </p>
      </header>

      {/* ========================= */}
      {/* PoC Image (smaller + faster motion) */}
      {/* ========================= */}
      <section style={{ marginTop: "2rem" }}>
        <div className="pocWrap">
          <div className="pocFloat">
            <Image
              src="/images/IMG_0617.jpg"
              alt="Proof of Care — Signal to Verification to Influence"
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
          Care practices signal responsibility. Responsibility forms stewardship. Proof enables
          access, governance, and yield.
        </p>
      </section>

      {/* ========================= */}
      {/* Cerebrals */}
      {/* ========================= */}
      <section style={{ marginTop: "3rem" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>Cerebrals</h2>

        <p>
          <strong>Cerebrals</strong> are the internal cognitive state layers of a Brain. They
          encode memory, context, intent, and learned behavior over time.
        </p>

        <p>
          Care does not directly mutate a Brain as a static artifact. Instead, verified care
          signals condition Cerebrals — shaping how intelligence responds, adapts, and evolves.
        </p>
      </section>

      {/* ========================= */}
      {/* The Care Loop */}
      {/* ========================= */}
      <section style={{ marginTop: "3rem" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>The Care Loop</h2>

        <p>
          Proof of Care operates as a continuous feedback system rather than a one-time
          validation.
        </p>

        <p>
          Care is expressed through action, observed through verifiable signals, and reflected
          back into the system as influence.
        </p>

        <p>
          Care → Signal → Verification → Weight → Influence → Feedback → Care
        </p>
      </section>

      {/* ========================= */}
      {/* Styles */}
      {/* ========================= */}
      <style jsx>{`
        /* Hard cap the image size so it’s never huge */
        .pocWrap {
          max-width: 720px; /* <<< smaller target size */
          margin: 0 auto;
        }

        /* Faster + cleaner motion */
        .pocFloat {
          animation: floaty 6.5s ease-in-out infinite; /* <<< faster */
          transform-origin: center;
        }

        @keyframes floaty {
          0% {
            transform: translateY(0px) scale(1);
            filter: drop-shadow(0 0 0 rgba(255, 255, 255, 0));
          }
          50% {
            transform: translateY(-10px) scale(1.01);
            filter: drop-shadow(0 0 18px rgba(120, 180, 255, 0.18));
          }
          100% {
            transform: translateY(0px) scale(1);
            filter: drop-shadow(0 0 0 rgba(255, 255, 255, 0));
          }
        }

        /* On very small screens, give it a little more room */
        @media (max-width: 480px) {
          .pocWrap {
            max-width: 92vw;
          }
        }
      `}</style>
    </main>
  );
}
