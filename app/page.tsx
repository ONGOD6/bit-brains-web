"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function HomePage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);

  const startAudio = async () => {
    const a = audioRef.current;
    if (!a) return;

    try {
      a.loop = true;
      a.volume = 0.25;
      a.muted = true;
      await a.play();
      a.muted = false;
      setStarted(true);
    } catch {}
  };

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
  };

  useEffect(() => {
    let frame = 0;
    const start = performance.now();

    const animate = (now: number) => {
      const t = (now - start) * 0.001;
      const pulse = (Math.sin(t * Math.PI * 2) + 1) / 2;
      const glowSize = 80 + pulse * 60;
      const glowStrength = 0.18 + pulse * 0.25;

      if (glowRef.current) {
        glowRef.current.style.boxShadow = `
          0 30px 90px rgba(0,0,0,0.7),
          0 0 ${glowSize}px rgba(140,160,255,${glowStrength})
        `;
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const particles = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => {
      const angle = (i / 16) * Math.PI * 2;
      const r = 140;
      return {
        id: i,
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        d: 4,
        delay: i * 0.2,
      };
    });
  }, []);

  return (
    <main style={styles.page}>
      <audio ref={audioRef} preload="auto" playsInline src="/Audio/Ambient.mp3" />

      <section style={styles.hero}>
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

        <div ref={glowRef} style={styles.brainBox}>
          <div style={styles.brainInner}>
            <div style={styles.neuralLayer} />
            <div style={styles.neuralLayer2} />

            <div style={styles.particles}>
              {particles.map((p) => (
                <span
                  key={p.id}
                  style={{
                    ...styles.particle,
                    width: p.d,
                    height: p.d,
                    animationDelay: `${p.delay}s`,
                    ["--x" as any]: `${p.x}px`,
                    ["--y" as any]: `${p.y}px`,
                  }}
                />
              ))}
            </div>

            <div style={styles.brainMedia}>
              <Image
                src="/brain-10813_256.gif"
                alt="Bit Brains — Genesis Brain"
                fill
                priority
                unoptimized
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      </section>

      <style>{keyframes}</style>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "radial-gradient(circle at 50% 30%, #0b1022 0%, #05060a 55%, #000 100%)",
    padding: "24px 16px",
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
    height: 380,
    position: "relative",
    borderRadius: 24,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.38)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 30px 90px rgba(0,0,0,0.7)",
  },

  brainInner: {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
  },

  brainMedia: {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    overflow: "hidden",
  },

  neuralLayer: {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    background:
      "radial-gradient(circle at 30% 40%, rgba(120,170,255,0.18), transparent 55%), radial-gradient(circle at 70% 60%, rgba(200,140,255,0.12), transparent 55%)",
    filter: "blur(10px)",
    animation: "neuralDrift 6s ease-in-out infinite",
    pointerEvents: "none",
  },

  neuralLayer2: {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    background:
      "conic-gradient(from 90deg, rgba(140,160,255,0.12), transparent, rgba(120,255,220,0.1), transparent)",
    filter: "blur(14px)",
    animation: "neuralSpin 12s linear infinite",
    pointerEvents: "none",
  },

  particles: {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    pointerEvents: "none",
  },

  particle: {
    position: "absolute",
    left: "50%",
    top: "50%",
    borderRadius: "50%",
    background: "rgba(170,190,255,1)",
    boxShadow: "0 0 14px rgba(140,160,255,0.5)",
    animation: "sparkOrbit 4s ease-in-out infinite",
  },

  textBlock: {
    maxWidth: 900,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    alignItems: "center",
  },

  h1: {
    fontSize: 46,
    margin: 0,
    lineHeight: 1.05,
    letterSpacing: "-0.02em",
  },

  p: {
    fontSize: 18,
    lineHeight: 1.55,
    margin: 0,
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
  0% { opacity: 0.6; transform: translate(-6px,-4px); }
  50% { opacity: 0.9; transform: translate(6px,4px); }
  100% { opacity: 0.6; transform: translate(-6px,-4px); }
}

@keyframes neuralSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes sparkOrbit {
  0% { transform: translate(var(--x), var(--y)) scale(0.8); opacity: 0.15; }
  50% { transform: translate(var(--x), var(--y)) scale(1.2); opacity: 0.35; }
  100% { transform: translate(var(--x), var(--y)) scale(0.8); opacity: 0.15; }
}
`;
