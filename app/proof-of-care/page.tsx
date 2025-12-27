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
      {/* ===================== */}
      {/* Static Container */}
      {/* ===================== */}
      <div
        style={{
          width: "360px",
          height: "360px",
          margin: "3rem auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Rotating Brain ONLY */}
        <div
          style={{
            width: "100%",
            height: "100%",
            animation: "brainSpin 38s linear infinite", // ⬅️ SLOWED DOWN
          }}
        >
          <Image
            src="/images/brain.png" // confirm path
            alt="Proof of Care Brain"
            width={360}
            height={360}
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      </div>

      {/* ===================== */}
      {/* TEXT CONTENT */}
      {/* ===================== */}
      <h1>Proof of Care</h1>

      <p>
        Proof of Care (PoC) is the core consensus primitive of Bit Brains. It
        replaces extractive incentive models with demonstrated stewardship.
      </p>

      <p>
        Care is not claimed — it is observed, attributable, and verifiable.
        Actions that preserve, improve, or responsibly guide intelligent systems
        are recognized as first-class economic signals.
      </p>

      <p>
        Proof of Care aligns intelligence, ownership, and responsibility into a
        single accountable system.
      </p>

      {/* ===================== */}
      {/* Animation Keyframes */}
      {/* ===================== */}
      <style jsx>{`
        @keyframes brainSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
