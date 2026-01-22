export default function EthscriptionsMintPage() {
  return (
    <main
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: 600 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>
          Ethscriptions Mint
        </h1>

        <p style={{ marginTop: 16, fontSize: 18, opacity: 0.85 }}>
          This page is temporarily offline.
        </p>

        <p style={{ marginTop: 12, fontSize: 14, opacity: 0.7 }}>
          We’re performing maintenance and validation.
          <br />
          Please check back soon.
        </p>
      </div>
    </main>
  );
}
