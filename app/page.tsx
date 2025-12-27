"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";

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
      // iOS can block first attempt — user can tap again
    }
  };

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
  };

  /* ================= PULSE GLOW ================= */
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();

    const animate = (now: number) => {
      const t = (now - start) * 0.001; // seconds
      const pulse = (Math.sin(t * Math.PI * 2) + 1) / 2; // 0..1

      const glowStrength = 0.22 + pulse * 0.35;
      const glowSize = 70 + pulse * 70;

      if (glowRef.current) {
        glowRef.current.style.boxShadow = `
          0 30px 90px rgba(0,0,0,0.70),
          0 0 ${glowSize}px rgba(140,160,255,${glowStrength})
        `;
        glowRef.current.style.borderColor = `rgba(255,255,255,${0.10 + pulse * 0.10})`;
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  /* ================= PARTICLES (LIGHTWEIGHT) ================= */
  const particles = useMemo(() => {
    // deterministic-ish for stable look
    const arr = [];
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const r = 120 + (i % 6) * 14; // orbit radius
      arr.push({
        id: i,
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        d: 4 + (i % 5) * 0.6, // size
        delay: (i % 9) * 0.25,
        dur: 3.5 + (i % 7) * 0.35,
        alpha: 0.18 + (i % 6) * 0.03,
      });
    }
    return arr;
  }, []);

  return (
    <main style={styles.page}>
      {/* AUDIO */}
      <audio ref={audioRef} preload="auto" playsInline src="/Audio/Ambient.mp3" />

      <section style={styles.hero}>
        {/* TEXT */}
        <div style={styles.textBlock}>
          <h1 style={styles.h1}>Proof of Care comes first.</h1>

          <p style={styles.p}>
            Bit Brains is a protocol for NFTs, ENS-based identity, zero-knowledge eligibility, and
            real-world asset integration — beginning on Ethereum.
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

        {/* BRAIN BOX */}
        <div ref={glowRef} style={styles.brainBox}>
          <div style={styles.brainInner}>
            {/* Neural shimmer overlay */}
            <div style={styles.neuralLayer} aria-hidden="true" />
            <div style={styles.neuralLayer2} aria-hidden="true" />

            {/* Orbital particles */}
            <div style={styles.particles} aria-hidden="true">
              {particles.map((p) => (
                <span
                  key={p.id}
                  style={{
                    ...styles.particle,
                    width: p.d,
                    height: p.d,
                    opacity: p.alpha,
                    transform: `translate(${p.x}px, ${p.y}px)`,
                    animationDelay: `${p.delay}s`,
                    animationDuration: `${p.dur}s`,
                  }}
                />
              ))}
            </div>

            {/* CENTER BRAIN GIF (DO NOT ROTATE — GIF ROTATES ITSELF) */}
            <Image
              src="/brain-10813_256.gif"
              alt="Bit Brains — Genesis Brain"
              width={256}
              height={256}
              priority
              unoptimized
              className="select-none"
            />
          </div>
        </div>
      </section>

      {/* Keyframes (scoped) */}
      <style>{keyframes}</style>
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
    padding: "28px 16px",
    background:
      "radial-gradient(circle at 50% 30%, #0b1022 0%, #05060a 55%, #000 100%)",
    color: "white",
    overflow: "hidden",
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
    height: 360,
    display: "grid",
    placeItems: "center",
    borderRadius: 24,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.38)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 30px 90px rgba(0,0,0,0.70)",
    overflow: "hidden",
    position: "relative",
    transition: "box-shadow 0.1s linear, border-color 0.1s linear",
  },

  brainInner: {
    width: "100%",
    height: "100%",
    display: "grid",
    placeItems: "center",
    position: "relative",
    background:
      "radial-gradient(circle at 50% 45%, rgba(140,160,255,0.12) 0%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.55) 100%)",
  },

  // Neural activity layers (animated shimmer)
  neuralLayer: {
    position: "absolute",
    inset: -80,
    background:
      "radial-gradient(circle at 30% 40%, rgba(120,170,255,0.18) 0%, rgba(0,0,0,0) 45%)," +
      "radial-gradient(circle at 70% 55%, rgba(200,140,255,0.12) 0%, rgba(0,0,0,0) 45%)," +
      "radial-gradient(circle at 50% 55%, rgba(120,255,220,0.10) 0%, rgba(0,0,0,0) 40%)",
    filter: "blur(10px)",
    opacity: 0.9,
    animation: "neuralDrift 6s ease-in-out infinite",
    pointerEvents: "none",
  },

  neuralLayer2: {
    position: "absolute",
    inset: -120,
    background:
      "conic-gradient(from 90deg at 50% 50%, rgba(120,170,255,0.0), rgba(120,170,255,0.12), rgba(120,170,255,0.0), rgba(120,255,220,0.10), rgba(120,170,255,0.0))",
    mixBlendMode: "screen",
    filter: "blur(14px)",
    opacity: 0.55,
    animation: "neuralSpin 10s linear infinite",
    pointerEvents: "none",
  },

  particles: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    pointerEvents: "none",
  },

  particle: {
    position: "absolute",
    borderRadius: 999,
    background: "rgba(170,190,255,1)",
    boxShadow: "0 0 18px rgba(140,160,255,0.55)",
    animationName: "sparkOrbit",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
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

const keyframes = `
@keyframes neuralDrift {
  0%   { transform: translate3d(-8px, -6px, 0) scale(1.00); opacity: 0.75; }
  50%  { transform: translate3d(10px, 8px, 0) scale(1.03); opacity: 0.95; }
  100% { transform: translate3d(-8px, -6px, 0) scale(1.00); opacity: 0.75; }
}

@keyframes neuralSpin {
  0% { transform: rotate(0deg) scale(1.0); }
  50% { transform: rotate(180deg) scale(1.02); }
  100% { transform: rotate(360deg) scale(1.0); }
}

@keyframes sparkOrbit {
  0%   { filter: blur(0px); transform: translate(var(--tx, 0px), var(--ty, 0px)) scale(0.9); opacity: 0.12; }
  50%  { filter: blur(0.2px); transform: translate(var(--tx, 0px), var(--ty, 0px)) scale(1.15); opacity: 0.30; }
  100% { filter: blur(0px); transform: translate(var(--tx, 0px), var(--ty, 0px)) scale(0.9); opacity: 0.12; }
}
`;
