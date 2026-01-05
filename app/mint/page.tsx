// /mint/page.tsx

export default function MintPage() {
  return (
    <main className="page-shell">
      <section className="content-shell">
        <div
          style={{
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            gap: "1.15rem",
          }}
        >
          <h1 className="page-title">Genesis Mint</h1>

          <p className="page-subtitle" style={{ maxWidth: 820 }}>
            Welcome to the Bit Brains Genesis mint interface.
          </p>

          <p className="page-subtitle" style={{ maxWidth: 820, opacity: 0.9 }}>
            Minting will be available soon.
          </p>

          <div style={{ marginTop: "0.75rem" }}>
            <button className="btn-disabled" disabled>
              Mint (Coming Soon)
            </button>
          </div>

          {/* BRAIN IMAGE PREVIEW (replaces card) */}
          <div
            style={{
              marginTop: "2.25rem",
              width: "100%",
              maxWidth: 520,
              opacity: 0.95,
            }}
          >
            <img
              src="/brain-evolution.gif"
              alt="Brain evolution"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                borderRadius: 18,
              }}
            />
          </div>

          {/* EXPLICIT DISCLAIMER */}
          <div
            style={{
              marginTop: "0.25rem",
              maxWidth: 560,
              fontSize: 13,
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.60)",
            }}
          >
            <strong style={{ color: "rgba(255,255,255,0.82)" }}>
              EXAMPLE IMAGE ONLY — NOT FINAL PRODUCTION.
            </strong>
            <br />
            This preview is a visual prototype for demonstration purposes. Final
            production Genesis NFTs may differ in appearance, traits, and
            structure.
          </div>
        </div>
      </section>
    </main>
  );
}
