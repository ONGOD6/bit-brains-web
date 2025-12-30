import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Bit Brains",
  description: "Bit Brains protocol site",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <Link href="/">Home</Link>
          <Link href="/proof-of-care">Proof of Care</Link>
          <Link href="/pocc">POCC</Link>
          <Link href="/manifesto">Protocol Standards</Link>
          <Link href="/ens">ENS</Link>
          <Link href="/mint">Genesis</Link>

          {/* NEW */}
          <Link href="/ethscriptions/mint">Ethscriptions</Link>

          <Link href="/stake">Stake</Link>
          <Link href="/music">Music</Link>
        </nav>

        {children}
      </body>
    </html>
  );
}
