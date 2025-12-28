export default function StakePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "2.5rem 1.25rem",
        maxWidth: "960px",
        margin: "0 auto",
        lineHeight: 1.65,
      }}
    >
      <h1 style={{ fontSize: "2.4rem", marginBottom: "0.75rem" }}>Stake Bit Brains</h1>

      <p style={{ opacity: 0.9, fontSize: "1.1rem", marginBottom: "1.75rem" }}>
        Stake your Bit Brains NFTs to participate in Proof of Care and earn protocol rewards.
      </p>

      <section
        style={{
          padding: "1.25rem",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "14px",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>Your Status</h2>
        <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
          <li>Connected wallet: Not connected</li>
          <li>Brains staked: 0</li>
          <li>Reward multiplier: 1.0×</li>
        </ul>
      </section>

      <button
        disabled
        style={{
          padding: "0.9rem 1.2rem",
          fontSize: "1rem",
          borderRadius: "999px",
          opacity: 0.7,
        }}
      >
        Stake (Coming Soon)
      </button>
    </main>
  );
}
