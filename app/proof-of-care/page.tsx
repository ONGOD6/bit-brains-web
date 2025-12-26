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
      {/* ================= Header ================= */}
      <header>
        <h1>Proof of Care</h1>

        <p>
          Proof of Care (PoC) is the core consensus primitive of Bit Brains.
          It replaces extractive incentive models with demonstrated stewardship.
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

      {/* ================= Brain Image ================= */}
      <section style={{ marginTop: "3rem", textAlign: "center" }}>
        <Image
          src="/images/IMG_0617.jpg"
          alt="Proof of Care Brain"
          width={480}
          height={480}
          style={{ maxWidth: "100%", height: "auto", opacity: 0.95 }}
        />
      </section>

      {/* ================= Cerebrals ================= */}
      <section style={{ marginTop: "3rem" }}>
        <h2>Cerebrals</h2>

        <p>
          <strong>Cerebrals</strong> are the internal cognitive state layers of a
          Brain. They encode memory, context, intent, and learned behavior over time.
        </p>

        <p>
          Care does not directly mutate a Brain as a static artifact. Instead,
          verified care signals condition Cerebrals — shaping how intelligence
          responds, adapts, and evolves.
        </p>
      </section>

      {/* ================= Care Loop ================= */}
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
    </main>
  );
}


  
