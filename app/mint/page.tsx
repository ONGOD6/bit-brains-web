// app/mint/page.tsx

export default function MintPage() {
  return (
    <main className="page-shell">
      <section className="content-shell">
        <h1 className="page-title">Genesis Mint</h1>

        <p className="page-subtitle">
          Welcome to the Bit Brains Genesis mint interface.
        </p>

        <p className="page-subtitle">
          Minting will be available on Ethereum and Solana.
        </p>

        <div style={{ marginTop: "1.5rem" }}>
          <button className="btn-disabled" disabled>
            Mint (Coming Soon)
          </button>
        </div>
      </section>
    </main>
  );
}
