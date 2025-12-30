// app/ethscriptions/mint/page.tsx

export default function EthscriptionsMintPage() {
  return (
    <main className="page-shell">
      <section className="content-shell">
        <h1 className="page-title">Ethscriptions Mint</h1>

        <p className="page-subtitle" style={{ maxWidth: 820 }}>
          Claim a free Ethscription drop (on-chain calldata inscription). This page
          is a placeholder while we wire up the minting flow.
        </p>

        <div style={{ marginTop: "1.75rem" }}>
          <button className="btn-disabled" disabled>
            Mint (Coming Soon)
          </button>
        </div>

        <div style={{ marginTop: "1.25rem", maxWidth: 820 }}>
          <p className="page-subtitle" style={{ opacity: 0.85 }}>
            Next: connect wallet, validate eligibility, upload/attach art payload,
            and submit the inscription transaction.
          </p>
        </div>
      </section>
    </main>
  );
}
