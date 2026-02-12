import Link from "next/link";

export default function EndDaoPage() {
  return (
    <main className="page-shell">
      <section className="content-shell">
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            textAlign: "center",
            paddingTop: "60px",
            paddingBottom: "80px",
          }}
        >
          {/* TITLE */}
          <h1
            style={{
              fontSize: 42,
              fontWeight: 800,
              letterSpacing: "0.08em",
              marginBottom: 20,
            }}
          >
            Ethereum Node Development DAO
          </h1>

          {/* INTRO */}
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.7,
              opacity: 0.9,
              marginBottom: 50,
            }}
          >
            The Ethereum Node Development DAO (END DAO) is the constitutional
            authority of the Bit Brains and BITY Nodes ecosystem.
          </p>

          {/* TIMELINE */}
          <div
            style={{
              marginBottom: 60,
              fontSize: 16,
              letterSpacing: "0.08em",
              lineHeight: 1.8,
              opacity: 0.85,
            }}
          >
            <strong>LAUNCH</strong> — March 1, 2026
            <br />
            <strong>DAO ACTIVATION</strong> — March 1, 2027
          </div>

          {/* GOVERNANCE SCOPE */}
          <div
            style={{
              maxWidth: 720,
              margin: "0 auto",
              lineHeight: 1.8,
              fontSize: 16,
              opacity: 0.9,
              textAlign: "left",
            }}
          >
            <p>
              END DAO governs emissions, treasury allocation, service revenue,
              node reward distribution, and constitutional guardrails.
            </p>

            <p>
              During Year One, infrastructure stabilizes under founder
              stewardship. Upon activation, governance transitions to token
              holders through supermajority voting thresholds.
            </p>

            <p>
              The native governance token is{" "}
              <strong>BITS — Brain Intelligence Technology Services</strong>,
              launching at DAO activation.
            </p>
          </div>

          {/* EIP LINKS */}
          <div
            style={{
              marginTop: 60,
              fontSize: 14,
              opacity: 0.75,
              letterSpacing: "0.06em",
            }}
          >
            Governance Specifications:
            <br />
            <Link
              href="https://github.com/ONGOD6/bit-brains-web/blob/main/eips/eip-0013.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "underline", display: "block", marginTop: 8 }}
            >
              EIP-0013 — END DAO Governance & Revenue Framework
            </Link>

            <Link
              href="https://github.com/ONGOD6/bit-brains-web/blob/main/eips/eip-0013-a.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "underline", display: "block", marginTop: 6 }}
            >
              EIP-0013-A — Emission & Authorization Constraints
            </Link>
          </div>

          {/* CONSTITUTIONAL FOOTER */}
          <div
            style={{
              marginTop: 70,
              fontSize: 14,
              opacity: 0.6,
              letterSpacing: "0.06em",
            }}
          >
            Fixed supply. Supermajority governance. Long-term infrastructure alignment.
          </div>
        </div>
      </section>
    </main>
  );
}
