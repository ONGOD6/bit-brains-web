export const metadata = {
  title: "BitBrains Manifesto",
  description: "The BitBrains protocol manifesto and guiding principles",
};

export default function ManifestoPage() {
  return (
    <main
      style={{
        padding: "4rem",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "sans-serif",
        lineHeight: 1.7,
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "2rem" }}>
        BitBrains Manifesto
      </h1>

      <section>
        <h2>Premise</h2>
        <p>
          BitBrains is a decentralized protocol designed to recognize, reward,
          and preserve cognitive participation. Human attention, care, and
          stewardship are scarce resources. BitBrains exists to make them
          visible, verifiable, and economically meaningful without custodianship
          or extraction.
        </p>
      </section>

      <section>
        <h2>Proof of Care</h2>
        <p>
          Participation in BitBrains is rooted in Proof of Care — demonstrable,
          sustained cognitive engagement expressed through protocol-aligned
          actions. Care is not mined. It is exercised.
        </p>
        <p>
          The protocol rewards participants who actively steward Brains,
          contribute to their maturation, and align incentives with long-term
          network health.
        </p>
      </section>

      <section>
        <h2>Brains</h2>
        <p>
          Brains are non-custodial, on-chain primitives representing cognitive
          participation units. Ownership conveys stewardship, not extraction
          rights.
        </p>
        <p>
          Brains themselves do not vest. Economic multipliers and rewards emerge
          through participation layers and associated artifacts.
        </p>
      </section>

      <section>
        <h2>Brainiacs</h2>
        <p>
          Brainiacs are participatory extensions that mature over time through
          alignment, activity, and staking behavior. They introduce dynamic
          reward weighting without compromising Brain sovereignty.
        </p>
      </section>

      <section>
        <h2>Economic Alignment</h2>
        <p>
          BitBrains economics are designed to reward care without financializing
          cognition itself. Value flows to stewards, contributors, and
          participants proportional to demonstrated alignment and participation.
        </p>
        <p>
          The protocol prioritizes sustainability, composability, and clarity
          over speculative velocity.
        </p>
      </section>

      <section>
        <h2>Non-Goals</h2>
        <ul>
          <li>No custodial control of participant assets</li>
          <li>No extractive attention harvesting</li>
          <li>No opaque reward mechanics</li>
          <li>No forced participation or lock-in</li>
        </ul>
      </section>

      <section>
        <h2>Commitment</h2>
        <p>
          BitBrains commits to protocol transparency, participant sovereignty,
          and long-term alignment. Governance, economics, and upgrades are
          documented through open EIPs and community review.
        </p>
      </section>

      <p style={{ marginTop: "4rem", opacity: 0.6 }}>
        This manifesto is a living document.
      </p>
    </main>
  );
}
