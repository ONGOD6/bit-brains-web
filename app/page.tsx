"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export default function HomePage() {
  // Audio (tap to start)
  const audioRef = useRef<HTMLAudioElement>(null);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);

  const startAudio = async () => {
    const a = audioRef.current;
    if (!a || started) return;

    try {
      setStarted(true);
      a.loop = true;
      a.volume = 0;
      a.muted = false;
      await a.play();

      // soft fade-in
      const target = 0.25;
      const step = 0.01;
      const timer = setInterval(() => {
        if (!audioRef.current) return clearInterval(timer);
        const v = audioRef.current.volume ?? 0;
        if (v >= target) {
          audioRef.current.volume = target;
          clearInterval(timer);
        } else {
          audioRef.current.volume = Math.min(target, v + step);
        }
      }, 60);
    } catch {
      setStarted(false);
    }
  };

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    const next = !muted;
    setMuted(next);
    a.muted = next;
  };

  return (
    <main style={styles.page}>
      <audio ref={audioRef} preload="auto" src="/Audio/Ambient.mp3" />

      {/* Tap anywhere (except buttons/links) to start audio */}
      <div
        onPointerDown={startAudio}
        style={styles.tapLayer}
      >
        <section style={styles.hero}>
          {/* BIGGER COSMIC BOX (STATIC) */}
          <div style={styles.brainBox}>
            <div style={styles.brainInner}>
              <Image
                src="/brain-10813_256.gif"
                alt="Bit Brains — Genesis Brain"
                width={256}
                height={256}
                priority
                unoptimized
                style={{ display: "block" }}
              />
            </div>
          </div>

          <div style={styles.textBlock}>
            <h1 style={styles.h1}>Proof of Care comes first.</h1>

            <p style={styles.p}>
              Bit Brains is a protocol for NFTs, ENS-based identity, zero-knowledge
              eligibility, and real-world asset integration — beginning on Ethereum.
            </p>

            <a
              href="/proof-of-care"
              style={styles.cta}
              onPointerDown={(e) => e.stopPropagation()}
            >
              Enter Proof of Care →
            </a>

            {started ? (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={toggleMute}
                style={styles.muteBtn}
              >
                {muted ? "Unmute" : "Mute"}
              </button>
            ) : (
              <p style={styles.hint}>Tap anywhere to begin the initiation tone.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "26px 16px",
    background:
      "radial-gradient(circle at 50% 30%, #0b1022 0%, #05060a 55%, #000 100%)",
    color: "white",
  },

  tapLayer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },

  hero: {
    width: "min(1100px, 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 22,
    textAlign: "center",
  },

  // ✅ BIG BOX: width like your headline span, height similar to before
  brainBox: {
    width: "min(820px, 92vw)",   // wider = more cosmic space
    height: 340,                // height stays similar
    display: "grid",
    placeItems: "center",
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.35)", // darker, more cosmic
    backdropFilter: "blur(10px)",
    boxShadow: "0 28px 90px rgba(0,0,0,0.65)",
    overflow: "hidden",
    position: "relative",
  },

  // ✅ Inner “cosmic” vignette so the empty space looks intentional
  brainInner: {
    width: "100%",
    height: "100%",
    display: "grid",
    placeItems: "center",
    background:
      "radial-gradient(circle at 50% 45%, rgba(120,140,255,0.10) 0%, rgba(0,0,0,0.0) 38%, rgba(0,0,0,0.55) 100%)",
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

  muteBtn: {
    marginTop: 10,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    fontSize: 14,
    cursor: "pointer",
  },

  hint: {
    marginTop: 10,
    fontSize: 13,
    opacity: 0.65,
  },
};
