export default function Home() {
  return (
    <main style={{ textAlign: "center", padding: "4rem 1rem" }}>
      <img
  src="/brain-evolution.gif"
  alt="Proof of Care Brain"
  style={{
    maxWidth: "320px",
    margin: "0 auto 2rem",
    animation: "spin 18s linear infinite"
  }}
/>
      
      <style jsx>{`
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`}</style>

      <h1>Proof of Care (PoC)</h1>

      <p style={{ maxWidth: "720px", margin: "1rem auto", fontSize: "1.1rem" }}>
        Everything starts with Proof of Care.
        <br />
        Care is measured. Care is verified. Care becomes value.
      </p>

      <p style={{ maxWidth: "720px", margin: "0 auto", opacity: 0.85 }}>
        BitBrains introduces a PoC-first protocol layer combining ENS identity,
        zero-knowledge verification, and real-world asset alignment.
      </p>
    </main>
  );
}
