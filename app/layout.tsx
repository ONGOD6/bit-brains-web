import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

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
      <body style={{ margin: 0 }}>
        {/* ===== GLOBAL HEADER / NAV (ALWAYS ON TOP) ===== */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 9999,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            background: "rgba(0,0,0,0.45)",
            borderBottom: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <nav
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <Link
              href="/"
              style={{
                fontWeight: 800,
                letterSpacing: "0.4px",
                textDecoration: "none",
                color: "#fff",
              }}
            >
              Bit Brains
            </Link>

            <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
              <Link
                href="/proof-of-care"
                style={{ textDecoration: "none", color: "rgba(255,255,255,0.9)" }}
              >
                Proof of Care
              </Link>
              <Link
                href="/protocol-standards"
                style={{ textDecoration: "none", color: "rgba(255,255,255,0.9)" }}
              >
                Protocol Standards
              </Link>
            </div>
          </nav>
        </header>

        {/* ===== PAGE CONTENT ===== */}
        {children}
      </body>
    </html>
  );
}
