import React from "react";
import RotatingCareDiagram from "@/components/RotatingCareDiagram";

export default function ProofOfCare() {
  return (
    <main
      style={{
        padding: "2.5rem",
        maxWidth: "960px",
        margin: "0 auto",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <h1>Proof of Care</h1>

      <p>
        Proof of Care (PoC) is the core consensus primitive of Bit Brains. It
        replaces extractive incentive models with demonstrated stewardship.
      </p>

      <p>
        Care is not claimed — it is observed, attributable, and verifiable.
        Actions that preserve, improve, or responsibly guide intelligent
        systems are recognized as first-class economic signals through
        verifiable computation and zero-knowledge proof technologies.
      </p>

      <p>
        Proof of Care aligns intelligence, ownership, and responsibility into
        a single accountable system.
      </p>
      <RotatingCareDiagram />

      {/* ========================= */}
      {/* What Is Bit Brains */}
      {/* ========================= */}
      <section style={{ marginTop: "2.5rem" }}>
        <h2>What Is Bit Brains</h2>

        <p>
          Bit Brains is a protocol for stewarded intelligence.
        </p>

        <p>
          It enables the creation, ownership, and evolution of autonomous
          intelligence artifacts (“Brains”) that are guided by human stewards
          rather than exploited as disposable compute. The system rewards
          long-term alignment, care, and participation instead of short-term
          extraction.
        </p>

        <p>
          Bit Brains is not a marketplace for intelligence — it is a framework
          for responsible intelligence stewardship.
        </p>
      </section>

      {/* ========================= */}
      {/* Brains & Brainiacs */}
      {/* ========================= */}
      <section style={{ marginTop: "2.5rem" }}>
        <h2>Brains &amp; Brainiacs</h2>

        <p>
          <strong>Brains</strong> are autonomous intelligence artifacts. They are
          owned, maintained, and evolved by stewards.
        </p>

        <p>
          <strong>Brainiacs</strong> are maturation layers applied to Brains.
          They represent growth, learning, and long-term participation.
        </p>
      </section>

      {/* ========================= */}
      {/* Cerebrals */}
      {/* ========================= */}
      <section style={{ marginTop: "2.5rem" }}>
        <h2>Cerebrals</h2>

        <p>
          <strong>Cerebrals</strong> are the internal cognitive state layers of a
          Brain. They encode memory, context, intent, and learned behavior over
          time.
        </p>

        <p>
          Care does not directly mutate a Brain as a static artifact. Instead,
          verified care signals condition Cerebrals, shaping how intelligence
          responds, adapts, and evolves.
        </p>
      </section>

      {/* ========================= */}
      {/* The Care Loop */}
      {/* ========================= */}
      <section style={{ marginTop: "2.5rem" }}>
        <h2>The Care Loop</h2>

        <p>
          Proof of Care operates as a continuous feedback system rather than a
          one-time validation. Care is expressed through action, observed
          through verifiable signals, and reflected back into the system as
          influence.
        </p>

        <p>
          Care → Signal → Verification → Weight → Influence → Feedback → Care
        </p>

        <p>
          This loop allows intelligence, identity, and value to mature
          responsibly over time.
        </p>
      </section>
    </main>
  );
}
