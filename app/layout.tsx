// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bit Brains",
  description: "Proof of Care comes first.",
};

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/proof-of-care", label: "Proof of Care" },
  { href: "/protocol-standards", label: "Protocol Standards" },
  { href: "/about", label: "About" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/genesis", label: "Genesis" },
  { href: "/faq", label: "FAQ" },
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
