 import type { ReactNode } from "react";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          backgroundColor: "#0b0b0f",
          color: "#e5e7eb",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <nav
          style={{
            padding: "1rem 2rem",
            borderBottom: "1px solid #222",
            display: "flex",
            gap: "1.5rem",
          }}
        >
          <Link href="/">Home</Link>
          <Link href="/manifesto">Manifesto</Link>
          <Link href="/mint">Mint</Link>
          <Link href="/music">Music</Link>
          <Link href="/stake">Stake</Link>
         <Link href="/proof-of-care">Proof of Care</Link>
        </nav>

        <div style={{ padding: "2rem" }}>{children}</div>
      </body>
    </html>
  );
}
