export default function StakePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "2.5rem 1.25rem",
        maxWidth: "960px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* TOP CONTENT */}
      <div>
        <h1 style={{ fontSize: "2.4rem", marginBottom: "0.75rem" }}>
          Stake Bit Brains
        </h1>

        <p
          style={{
            opacity: 0.9,
            fontSize: "1.1rem",
            marginBottom: "1.75rem",
          }}
        >
          Stake your Bit Brains NFTs to participate in Proof of Care and earn
          protocol rewards.
        </p>

        <section
          style={{
            padding: "1.25rem",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "14px",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
            Your Status
          </h2>

          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            <li>Connected wallet: Not connected</li>
            <li>Brains staked: 0</li>
            <li>Reward multiplier: 1.0×</li>
          </ul>
        </section>

        <button
          disabled
          style={{
            padding: "0.9rem 1.25rem",
            fontSize: "1rem",
            borderRadius: "999px",
            opacity: 0.7,
            cursor: "not-allowed",
          }}
        >
          Stake (Coming Soon)
        </button>
      </div>

      {/* PUSH IMAGE TO BOTTOM */}
      <div style={{ flexGrow: 1 }} />

      {/* STAKING BRAIN IMAGE (NEW CANONICAL FILE) */}
      <div
        style={{
          marginTop: "2.5rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "min(960px, 96vw)",
            position: "relative",
            overflow: "hidden",
            borderRadius: "18px",
          }}
        >
          <img
            src="/stake-brain-vertical.jpg"
            alt="Bit Brains — Staking"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              filter: "drop-shadow(0 0 36px rgba(160,120,255,0.45))",
            }}
          />
        </div>
      </div>
    </main>
  );
}
