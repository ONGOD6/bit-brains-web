"use client";

import Image from "next/image";
import pocImg from "./Proof of care img.jpg";

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
        <h1 style={{ marginTop: 0 }}>Proof of Care</h1>

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

      {/* ====== STATIC FRAME (box does NOT move) ====== */}
      <section style={{ margin: "2.25rem 0 2.5rem" }}>
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: "min(680px, 100%)", // smaller image frame
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.03)",
              boxShadow: "0 16px 50px rgba(0,0,0,0.55)",
              padding: "12px",
            }}
          >
            {/* motion applied ONLY to the image */}
            <div className="pocFloat">
              <Image
                src={pocImg}
                alt="Proof of Care — Care Signal → AIT → Verification → Value"
                priority
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "12px",
                  display: "block",
                  opacity: 0.98,
                }}
              />
            </div>
          </div>
        </div>

        <p style={{ marginTop: "1.1rem", opacity: 0.85 }}>
          Care practices signal responsibility. Responsibility forms stewardship.
          Proof enables access, governance, and yield.
        </p>
      </section>

      <section>
        <h2>Cerebrals</h2>
        <p>
          Cerebrals are the internal cognitive state layers of a Brain. They
          encode memory, context, intent, and learned behavior over time.
        </p>
        <p>
          Care does not directly mutate a Brain as a static artifact. Instead,
          verified care signals condition Cerebrals — shaping how intelligence
          responds, adapts, and evolves.
        </p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>The Care Loop</h2>
        <p>
          Proof of Care operates as a continuous feedback system rather than a
          one-time validation.
        </p>
      </section>

      <style jsx>{`
        .pocFloat {
          transform-origin: center;
          animation: pocFloat 3.2s ease-in-out infinite; /* a little faster */
        }

        @keyframes pocFloat {
          0% {
            transform: translateY(0px) scale(1) rotate(0deg);
          }
          50% {
            transform: translateY(-7px) scale(1.01) rotate(0.25deg);
          }
          100% {
            transform: translateY(0px) scale(1) rotate(0deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pocFloat {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
