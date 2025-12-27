"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export default function HomePage() {
  const brainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let angle = 0;
    let frame: number;

    const rotate = () => {
      angle += 0.05; // slower = smaller number
      if (brainRef.current) {
        brainRef.current.style.transform = `rotate(${angle}deg)`;
      }
      frame = requestAnimationFrame(rotate);
    };

    frame = requestAnimationFrame(rotate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        {/* STATIC CONTAINER */}
        <div style={styles.brainBox}>
          {/* ONLY THE BRAIN ROTATES */}
          <div ref={brainRef} style={styles.brainSpin}>
            <Image
              src="/brain-10813_256.gif"
              alt="Bit Brains — Genesis Brain"
              width={256}
              height={256}
              priority
              unoptimized
            />
          </div>
        </div>

        {/* TEXT BLOCK */}
        <div style={styles.textBlock}>
          <h1 style={styles.h1}>Proof of Care comes first.</h1>

          <p style={styles.p}>
            Bit Brains is a protocol for NFTs, ENS-based identity,
            zero-knowledge eligibility, and real-world asset integration —
            beginning on Ethereum.
          </p>

          <a href="/proof-of-care" style={styles.cta}>
            Enter Proof of Care →
          </a>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "40px 20px",
    display: "flex",
    justifyContent: "center",
    background:
      "radial-gradient(circle at 50% 30%, #0b1022 0%, #05060a 55%, #000 100%)",
    color: "white",
  },
  hero: {
    width: "min(1100px, 100%)",
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: "28px",
    alignItems: "center",
  },
  brainBox: {
    width: 320,
    height: 320,
    display: "grid",
    placeItems: "center",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(8px)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
    overflow: "hidden",
  },
  brainSpin: {
    display: "inline-block",
    transformOrigin: "center center",
    willChange: "transform",
  },
  textBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  h1: {
    fontSize: 46,
    lineHeight: 1.05,
    margin: 0,
    letterSpacing: "-0.02em",
  },
  p: {
    fontSize: 18,
    lineHeight: 1.5,
    margin: 0,
    maxWidth: 640,
    opacity: 0.9,
  },
  cta: {
    width: "fit-content",
    marginTop: 8,
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    textDecoration: "none",
    fontSize: 16,
  },
};
