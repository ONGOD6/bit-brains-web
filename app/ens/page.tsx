"use client";

export default function ENSPage() {
  const ensAppName = "BitBrains";

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
      {/* Title */}
      <h1 style={{ fontSize: "2.4rem", marginBottom: "0.75rem" }}>
        ENS Wallet Resolution
      </h1>

      <p style={{ opacity: 0.9, fontSize: "1.1rem", marginBottom: "1.5rem" }}>
        To receive staking rewards, each Brain holder must resolve their ENS subdomain
        to a wallet they control. ENS resolution is the first required verification step.
      </p>

      {/* Requirements */}
      <section
        style={{
          padding: "1.25rem",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "14px",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem" }}>
          Requirements (Non-Negotiable)
        </h2>
        <ul style={{ opacity: 0.9, paddingLeft: "1.2rem", margin: 0 }}>
          <li>
            Your Brain subdomain (example: <strong>brain-###.bitbrains.eth</strong>) must
            resolve to a wallet you control.
          </li>
          <li>
            Rewards are paid to the <strong>resolved address</strong> for that ENS name.
          </li>
          <li>
            You pay ENS gas fees when updating records (the protocol does not pay these fees).
          </li>
          <li>
            ZK proofs can track eligibility/accounting separately, but ENS resolution is the
            payout destination.
          </li>
        </ul>
      </section>

      {/* Action buttons */}
      <section
        style={{
          display: "grid",
          gap: "0.9rem",
          marginBottom: "2rem",
        }}
      >
        <a
          href={`https://app.ens.domains/`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            textDecoration: "none",
            padding: "0.95rem 1.25rem",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.35)",
            textAlign: "center",
            fontSize: "1rem",
            opacity: 0.95,
          }}
        >
          Open ENS Manager (Set / Resolve My Subdomain) →
        </a>

        <a
          href={`/proof-of-care`}
          style={{
            display: "inline-block",
            textDecoration: "none",
            padding: "0.95rem 1.25rem",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.2)",
            textAlign: "center",
            fontSize: "1rem",
            opacity: 0.85,
          }}
        >
          Back to Proof of Care →
        </a>
      </section>

      {/* Claim rewards */}
      <section
        style={{
          padding: "1.25rem",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "14px",
        }}
      >
        <h2 style={{ fontSize: "1.4rem", marginBottom: "0.6rem" }}>
          Claim Rewards
        </h2>

        <p style={{ opacity: 0.9, marginBottom: "1rem" }}>
          Rewards accrue internally while your Brain remains staked. When you choose to claim,
          you will pay the gas for the redemption transaction. The protocol routes rewards to the
          resolved ENS address.
        </p>

        <div
          style={{
            padding: "0.9rem 1rem",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.06)",
            opacity: 0.9,
          }}
        >
          <strong>Status:</strong> Claim UI is coming next.
          <br />
          For now, resolve your ENS so you are eligible to receive rewards.
        </div>
      </section>

      <footer style={{ marginTop: "2.25rem", opacity: 0.65, fontSize: "0.95rem" }}>
        ENS App: <strong>{ensAppName}</strong> — Ethereum-only redemptions (v1).
      </footer>
    </main>
  );
}
