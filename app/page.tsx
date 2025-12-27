"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function HomePage() {
  // Detect iPad/mobile width so we can center properly without CSS files
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const set = () => setIsNarrow(mq.matches);
    set();
    mq.addEventListener?.("change", set);
    return () => mq.removeEventListener?.("change", set);
  }, []);

  // Brain rotation (ONLY brain rotates)
  const brainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let angle = 0;
    let frame: number;

    const rotate = () => {
      angle += 0.02; // SLOWER (was 0.05)
      if (brainRef.current) {
        brainRef.current.style.transform = `rotate(${angle}deg)`;
      }
      frame = requestAnimationFrame(rotate);
    };

    frame = requestAnimationFrame(rotate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Audio
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
      // if iOS blocks, user can tap again
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

      {/* Tap anywhere to start audio (no autoplay) */}
      <div onPointerDown={startAudio} style={styles.tapLayer}>
        <section
          style={{
            ...styles.hero,
            flexDirection: isNarrow ? "column" : "row",
            alignItems: "center",
            justifyContent: "center",
            textAlign: isNarrow ? "center" : "left",
          }}
        >
          {/* STATIC BOX (never rotates) */}
          <div style={{ ...styles.brainBox, margin: isNarrow ? "0 auto" : 0 }}>
            {/* ONLY THIS WRAPPER ROTATES */}
            <div ref={brainRef} style={styles.brainSpin}>
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

          <div style={{ ...styles.textBlock, alignItems: isNarrow ? "center" : "flex-start" }}>
            <h1 style={styles.h1}>Proof of Care comes first.</h1>

            <p style={styles.p}>
              Bit Brains is a protocol for NFTs, ENS-based identity, zero-knowledge
              eligibility, and real-world asset integration — beginning on Ethereum.
            </p>

            <a href="/proof-of-care" style={styles.cta}>
              Enter Proof of Care →
            </a>

            {/* Small mute toggle (shows after audio starts) */}
            {started && (
              <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} style={styles.muteBtn}>
                {muted ? "Unmute" : "Mute"}
              </button>
            )}

            {!started && (
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
    alignItems: "center",       // ✅ vertically centered
    justifyContent: "center",   // ✅ horizontally centered
    padding: "24px 16px",
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
    display: "flex",            // ✅ better centering than grid for iPad
    gap: 28,
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
    maxWidth: 680,
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
