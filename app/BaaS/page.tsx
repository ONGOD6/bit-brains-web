import Link from "next/link";

export default function BaasPage() {
  return (
    <main className="page-shell">
      <section className="content-shell">
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "3rem 1.25rem" }}>
          <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                opacity: 0.75,
              }}
            >
              Brains As A Service
            </div>

            <div
              style={{
                fontSize: 44,
                fontWeight: 900,
                letterSpacing: "0.12em",
                marginTop: "0.35rem",
              }}
            >
              BaaS
            </div>
          </div>

          <p style={{ opacity: 0.9, lineHeight: 1.7, fontSize: 16 }}>
            Brains as a Service (BaaS) is a fee-based entry path into the Bit Brains Protocol.
            Participants stake <strong>$20 in Ethereum</strong> to fund the BITY Nodes treasury.
            After <strong>3 months</strong> of consecutive Proof of Care, continuity, and cross-chain NFT
            state verification via <strong>zero-knowledge proofs</strong>, the participant becomes eligible
            to mint a <strong>node verifier</strong> identity inside the BITY Nodes protocol.
          </p>

          <div style={{ marginTop: "1.5rem", opacity: 0.85, lineHeight: 1.7 }}>
            <ul style={{ paddingLeft: "1.1rem" }}>
              <li>Chain-agnostic NFT entry (any chain)</li>
              <li>Non-custodial proofs (no asset transfer)</li>
              <li>ENS-first identity + claim-time wallet resolution</li>
              <li>Eligibility accrues via continuity, not hype</li>
            </ul>
          </div>

          <div style={{ marginTop: "2rem", textAlign: "center", opacity: 0.9 }}>
            Please visit the node website at{" "}
            <a href="https://bitynodes.us" target="_blank" rel="noopener noreferrer">
              bitynodes.us
            </a>
            .
            <div style={{ marginTop: "0.75rem" }}>
              <Link href="/" style={{ textDecoration: "underline" }}>
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
