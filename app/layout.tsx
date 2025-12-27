// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bit Brains",
  description: "Proof of Care comes first.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="siteHeader">
          <div className="siteHeaderInner">
            <div className="brand">Bit Brains</div>

            <nav className="siteNav" aria-label="Primary">
              <Link href="/proof-of-care" className="navLink">
                Proof of Care
              </Link>
              <Link href="/protocol-standards" className="navLink">
                Protocol Standards
              </Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
