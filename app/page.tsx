"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function HomePage() {
  /* ================= AUDIO ================= */
  const audioRef = useRef<HTMLAudioElement>(null);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);

  const startAudio = async () => {
    const a = audioRef.current;
    if (!a) return;

    try {
      a.loop = true;
      a.muted = false;
      a.volume = 0.25;
      a.load();
      await a.play();
      setStarted(true);
    } catch {
      // iOS sometimes blocks first attempt — user can tap again
    }
  };

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
  };

  /* ================= PULSE GLOW (NO ROTATION) ================= */
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame: number;
    const start = performance.now();

    const animate = (now: number) => {
      const t = (now - start) * 0.001; // speed
      const pulse = (Math.sin(t * Math.PI * 2) + 1) / 2; // 0 → 1

      const glowStrength = 0.25 + pulse * 0.35;
      const glowSize = 70 + pulse * 60;

      if (glowRef.current) {
        glowRef.current.style.boxShadow = `
          0 30px 90px rgba(0,0,0,0.65),
          0 0 ${glowSize}px rgba(140,160,255,${glowStrength})
        `;
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <main style={styles.page}>
      {/* AUDIO */}
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        src="/Audio/Ambient.mp3"
      />

      <section style={styles.hero}>
        {/* COSMIC BOX WITH PULSE GLOW */}
        <div ref={glowRef} style={styles.brainBox}>
          <div style={styles.brainInner}>
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

        {/* TEXT */}
        <div style={styles.textBlock}>
          <h1 style={styles.h1}>Proof of Care comes first.</h1>

          <p style={styles.p}>
            Bit Brains is a protocol for NFTs, ENS-based identity, zero-knowledge
            eligibility, and real-world asset integration — beginning on Ethereum.
          </p>

          <div style={styles.buttons}>
            <a href="/proof-of-care" style={styles.cta}>
              Enter Proof of Care →
            </a>

            {!started ? (
              <button style={styles.audioBtn} onClick={startAudio}>
                Begin Sound
              </button>
            ) : (
              <button style={styles.audioBtn} onClick={toggleMute}>
                {muted ? "Unmute" : "Mute"}
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ================= STYLES ================= */

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    background:
      "radial-gradient(circle at 50% 30%, #0b1022 0%, #05060a 55%, #000 100%)",
    color: "white",
  },

  hero: {
    width: "min(1100px, 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 22,
    textAlign: "center",
  },

  brainBox: {
    width: "min(820px, 92vw)",
    height: 340,
    display: "grid",
    placeItems: "center",
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.38)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 30px 90px rgba(0,0,0,0.65)",
    overflow: "hidden",
    transition: "box-shadow 0.1s linear",
  },

  brainInner: {
    width: "100%",
    height: "100%",
    display: "grid",
    placeItems: "center",
    background:
      "radial-gradient(circle at 50% 45%, rgba(140,160,255,0.12) 0%, rgba(0,0,0,0.0) 38%, rgba(0,0,0,0.55) 100%)",
  },

  textBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    maxWidth: 900,
  },

  h1: {
    fontSize: 46,
    lineHeight: 1.05,
    margin: 0,
    letterSpacing: "-0.02em",
  },

  p: {
    fontSize: 18,
    lineHeight: 1.55,
    margin: 0,
    maxWidth: 820,
    opacity: 0.9,
  },

  buttons: {
    display: "flex",
    gap: 12,
    marginTop: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },

  cta: {
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    textDecoration: "none",
    fontSize: 16,
  },

  audioBtn: {
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    fontSize: 16,
    cursor: "pointer",
  },
};
