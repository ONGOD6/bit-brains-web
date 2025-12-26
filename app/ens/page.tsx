"use client";

export default function ENSLandingPage() {
  return (
    <main
      style={{
        padding: "2.5rem",
        maxWidth: "980px",
        margin: "0 auto",
        lineHeight: 1.65,
      }}
    >
      {/* ================= HEADER ================= */}
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2.3rem", marginBottom: "0.75rem" }}>
          ENS Wallet Verification
        </h1>

        <p style={{ opacity: 0.9, fontSize: "1.05rem" }}>
          Every Brain holder must resolve their assigned ENS subdomain
          (example: <code>brain-0421.bitbrains.eth</code>) to a wallet they control
          in order to receive and redeem rewards.
        </p>
      </header>

      {/* ================= HOW IT WORKS ================= */}
      <section
        style={{
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "14px",
          padding: "1.4rem",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ marginTop: 0 }}>How Rewards Work</h2>

        <ul style={{ opacity: 0.92 }}>
          <li>
            <strong>ENS routing:</strong> Your Brain ENS is the canonical payout
            address.
          </li>
          <li>
            <strong>ZK verification:</strong> Zero-knowledge proofs verify
            eligibility without revealing private data.
          </li>
          <li>
            <strong>Internal accrual:</strong> Rewards accrue internally while
            staked — no constant claiming required.
          </li>
          <li>
            <strong>Redemption:</strong> When you redeem, rewards are sent on
            Ethereum to your ENS-resolved wallet.
          </li>
          <li>
            <strong>Gas:</strong> Gas is paid only when you redeem rewards.
          </li>
        </ul>
      </section>

      {/* ================= USER ACTION ================= */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>What You Need To Do</h2>

        <ol style={{ opacity: 0.92 }}>
          <li>Locate your assigned Brain ENS subdomain.</li>
          <li>
            Set the ENS <strong>address record</strong> to a wallet you control.
          </li>
          <li>
            That wallet becomes your permanent reward destination.
          </li>
        </ol>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            marginTop: "1.25rem",
          }}
        >
          <a
            href="https://app.ens.domains/"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "0.8rem 1.2rem",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.25)",
              textDecoration: "none",
            }}
          >
            Open ENS Manager ↗
          </a>

          <a
            href="/ens/verify"
            style={{
              padding: "0.8rem 1.2rem",
              borderRadius: "12px",
              border: "1px solid currentColor",
              textDecoration: "none",
            }}
          >
            Verify ENS (Coming Next) →
          </a>
        </div>
      </section>

      {/* ================= RULES ================= */}
      <section
        style={{
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "14px",
          padding: "1.4rem",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Important Rules</h2>

        <p style={{ opacity: 0.9 }}>
          If your Brain ENS is not correctly resolved, rewards cannot be delivered.
          ENS defines the destination. ZK proofs define eligibility.
        </p>
      </section>

      {/* ================= FAQ ================= */}
      <section style={{ opacity: 0.92 }}>
        <h2>FAQ</h2>

        <p>
          <strong>Does the protocol pay ENS gas fees?</strong>
          <br />
          No. Each Brain holder resolves their own ENS.
        </p>

        <p>
          <strong>Do I need an exchange to redeem rewards?</strong>
          <br />
          No. Redemptions are protocol-native and sent directly to your ENS wallet.
        </p>

        <p>
          <strong>Will Solana payouts be supported?</strong>
          <br />
          Possibly later. Version one is Ethereum-only for clarity and security.
        </p>
      </section>
    </main>
  );
}
