// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bit Brains",
  description: "Proof of Care comes first.",
};

<header className="siteHeader">
  <div className="siteHeaderInner">
    <div className="brand">Bit Brains</div>

    <nav className="nav">
      <span className="navItem">Home</span>
      <span className="navItem">Proof of Care</span>
      <span className="navItem">Protocol Standards</span>
      <span className="navItem">About</span>
      <span className="navItem">Roadmap</span>
      <span className="navItem">Genesis</span>
      <span className="navItem">FAQ</span>
    </nav>
  </div>
</header>
];

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
            <div className="brand">
              <Link href="/" className="brandLink">
                Bit Brains
              </Link>
            </div>

            <nav className="siteNav" aria-label="Primary">
              {NAV_LINKS.map((item) => (
                <Link key={item.href} href={item.href} className="navLink">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
