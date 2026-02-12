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
          {/* Title */}
          <h1
            style={{
              fontSize: 42,
              fontWeight: 800,
              letterSpacing: "0.08em",
              marginBottom: 12,
            }}
          >
            Ethereum Node Development DAO
          </h1>

          <div
            style={{
              fontSize: 14,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              opacity: 0.6,
              marginBottom: 40,
            }}
          >
            END DAO
          </div>

          {/* Intro */}
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.7,
              opacity: 0.85,
              marginBottom: 50,
            }}
          >
            END DAO is the constitutional governance body of the Bit Brains
            and BITY Nodes ecosystem.
          </p>

          {/* Timeline */}
          <div
            style={{
              marginBottom: 60,
              lineHeight: 1.8,
              opacity: 0.9,
            }}
          >
            <strong>Launch:</strong> March 1, 2026
            <br />
            <strong>DAO Activation:</strong> March 1, 2027
          </div>

          {/* Governance Summary */}
          <div
            style={{
              maxWidth: 720,
              margin: "0 auto",
              lineHeight: 1.8,
              fontSize: 16,
              opacity: 0.85,
            }}
          >
            <p>
              During Year One, infrastructure stabilizes under founder
              stewardship.
            </p>

            <p>
              Upon activation, governance transitions to token holders
              through supermajority voting thresholds.
            </p>

            <p>
              END DAO governs emissions, treasury allocation, service
              revenue, node reward distribution, and constitutional
              guardrails.
            </p>

            <p>
              The native governance token is{" "}
              <strong>
                BITS — Brain Intelligence Technology Services
              </strong>
              , launching at DAO activation.
            </p>
          </div>

          {/* EIP Links */}
          <div
            style={{
              marginTop: 70,
              fontSize: 15,
              opacity: 0.85,
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <Link
                href="https://github.com/ONGOD6/bit-brains-eip/blob/main/eips/eip-0013.md"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "underline" }}
              >
                View EIP-0013 — END DAO Governance Framework →
              </Link>
            </div>

            <div>
              <Link
                href="https://github.com/ONGOD6/bit-brains-eip/blob/main/eips/eip-0013-a.md"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "underline" }}
              >
                View EIP-0013-A — Controlled Maturation Framework →
              </Link>
            </div>
          </div>

          {/* Constitutional Tagline */}
          <div
            style={{
              marginTop: 60,
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

          
