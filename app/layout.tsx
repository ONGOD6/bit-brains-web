import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Bit Brains",
  description:
    "Bit Brains Protocol — Proof of Care, ENS identity, ZK eligibility, and autonomous node infrastructure (BITY Nodes). Governed by END DAO. Powered by BITS.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="site">
        <nav className="nav">
          <Link href="/">Home</Link>
          <Link href="/proof-of-care">Proof of Care</Link>
          <Link href="/pocc">POCC</Link>

          {/* wording only: keep route the same */}
          <Link href="/manifesto">Protocol Standards</Link>
          <Link href="/end-dao">END DAO</Link>

          <Link href="/ens">ENS</Link>
          <Link href="/baas">BaaS</Link>

          <Link href="/genesis-docs">
            <span
              style={{
                display: "inline-block",
                lineHeight: 1.05,
                textAlign: "center",
              }}
            >
              Genesis
              <br />
              Docs
            </span>
          </Link>

          <Link href="/bitbrains/mint">
            <span
              style={{
                display: "inline-block",
                lineHeight: 1.05,
                textAlign: "center",
              }}
            >
              Bit Brains
              <br />
              Genesis Mint
            </span>
          </Link>

          <Link href="/picklepunks/mint">
            <span
              style={{
                display: "inline-block",
                lineHeight: 1.05,
                textAlign: "center",
              }}
            >
              Pickle Punks
              <br />
              Mint
            </span>
          </Link>

          <Link href="/stake">Stake</Link>
          <Link href="/music">Music</Link>
        </nav>

        {children}
      </body>
    </html>
  );
}
