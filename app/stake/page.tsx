export default function StakePage() {
  return (
    <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Stake Bit Brains</h1>

      <p>
        Stake your Bit Brains NFTs to participate in Proof of Care
        and earn protocol rewards.
      </p>

      <section style={{ marginTop: "2rem" }}>
        <h2>Your Status</h2>
        <ul>
          <li>Connected wallet: Not connected</li>
          <li>Brains staked: 0</li>
          <li>Reward multiplier: 1.0×</li>
        </ul>
      </section>

      <div style={{ marginTop: "2rem" }}>
        <button disabled style={{ padding: "1rem", fontSize: "1rem" }}>
          Stake (Coming Soon)
        </button>
      </div>
    </main>
  );
}
