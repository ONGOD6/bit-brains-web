export default function Home() {
  return (
    <main
      style={{
        padding: "2.5rem",
        maxWidth: "960px",
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <header>
        <h1>Bit Brains Protocol</h1>
        <p>A Proof of Care powered autonomous intelligence protocol.</p>
      </header>

      <section style={{ marginTop: "2.5rem" }}>
        <h2>What is Bit Brains?</h2>
        <p>
          Bit Brains is a decentralized protocol that recognizes, measures,
          and rewards cognitive care, stewardship, and intelligence
          contribution. Participants earn protocol-native value by
          demonstrating proof of care toward autonomous intelligence
          artifacts known as Brains.
        </p>
      </section>

      <section style={{ marginTop: "2.5rem" }}>
        <h2>Proof of Care</h2>
        <p>
          Proof of Care is the core consensus primitive of Bit Brains. It
          replaces extractive incentives with demonstrated stewardship.
          Care actions are observable, attributable, and economically
          recognized by the protocol.
        </p>
      </section>

      <section style={{ marginTop: "2.5rem" }}>
        <h2>Brains & Brainiacs</h2>
        <p>
          Brains are autonomous intelligence artifacts owned by stewards.
          Brainiacs are maturation layers attached to Brains that enhance
          reward multipliers and long-term participation incentives through
          epoch-based progression.
        </p>
      </section>

      <section style={{ marginTop: "2.5rem" }}>
        <h2>Participation</h2>
        <p>
          Participants may contribute by staking, caring for Brains, or
          stewarding Brainiacs. Rewards are distributed according to
          canonical protocol rules and epoch-based evaluation.
        </p>
      </section>

      <footer style={{ marginTop: "3rem", opacity: 0.7 }}>
        <p>Status: Website under active development.</p>
      </footer>
    </main>
  );
}
