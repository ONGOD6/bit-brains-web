"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  frontSrc: string; // e.g. "/images/IMG_1090.jpeg"
  width?: number; // desktop width
  flipBackHoldMs?: number; // hold after typing completes
  typingMsPerChar?: number; // typing speed
  lineDelayMs?: number; // delay between lines
  accentColor?: string; // text accent (match canister glow)
  autoReturnToFront?: boolean; // auto flip back after hold

  // NEW: back hologram brain (defaults to your existing public gif)
  backBrainSrc?: string; // e.g. "/brain-10813_256.gif"
};

export default function GenesisExampleCard({
  frontSrc,
  width = 380,
  flipBackHoldMs = 10_000,
  typingMsPerChar = 50,
  lineDelayMs = 350,
  accentColor = "rgba(120,185,255,0.95)",
  autoReturnToFront = true,
  backBrainSrc = "/brain-10813_256.gif",
}: Props) {
  const [flipped, setFlipped] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // typing state
  const [renderedLines, setRenderedLines] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // cancel tokens for timers
  const timersRef = useRef<number[]>([]);
  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const backTextLines = useMemo(
    () => [
      "PHASE — GENESIS BRAIN",
      "",
      "BIT ID",
      "ENS",
      "",
      "TRAITS",
      "STATE",
      "AIT CAPACITY",
      "RWA",
    ],
    []
  );

  // typing routine (runs when flipped to back)
  useEffect(() => {
    clearTimers();

    if (!flipped) {
      // reset when returning to front
      setRenderedLines([]);
      setIsTyping(false);
      return;
    }

    // If reduced motion, show text instantly (no typing)
    if (reduceMotion) {
      setRenderedLines(backTextLines);
      setIsTyping(false);

      if (autoReturnToFront) {
        const t = window.setTimeout(() => setFlipped(false), flipBackHoldMs);
        timersRef.current.push(t);
      }
      return;
    }

    // Start typing
    setRenderedLines([]);
    setIsTyping(true);

    let lineIndex = 0;
    let charIndex = 0;

    const typeNext = () => {
      // if component flipped back early, stop
      if (!flipped) return;

      const currentLine = backTextLines[lineIndex] ?? "";

      // Ensure we have space in renderedLines
      setRenderedLines((prev) => {
        const next = [...prev];
        while (next.length < lineIndex) next.push("");
        if (next.length === lineIndex) next.push("");
        next[lineIndex] = currentLine.slice(0, charIndex);
        return next;
      });

      // advance char
      if (charIndex < currentLine.length) {
        charIndex += 1;
        const t = window.setTimeout(typeNext, typingMsPerChar);
        timersRef.current.push(t);
        return;
      }

      // finished this line
      lineIndex += 1;
      charIndex = 0;

      if (lineIndex >= backTextLines.length) {
        // done typing
        setIsTyping(false);

        if (autoReturnToFront) {
          const t = window.setTimeout(() => setFlipped(false), flipBackHoldMs);
          timersRef.current.push(t);
        }
        return;
      }

      const t = window.setTimeout(typeNext, lineDelayMs);
      timersRef.current.push(t);
    };

    // initial small delay so flip settles first
    const start = window.setTimeout(typeNext, 250);
    timersRef.current.push(start);

    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    flipped,
    reduceMotion,
    autoReturnToFront,
    flipBackHoldMs,
    typingMsPerChar,
    lineDelayMs,
    backTextLines,
  ]);

  const caretVisible = flipped && !reduceMotion && isTyping;

  // Motion toggles (typing-synced frame pulse)
  const backIsAlive = flipped && !reduceMotion;
  const backIsPulsing = flipped && !reduceMotion && isTyping;

  return (
    <div style={{ display: "grid", placeItems: "center" }}>
      <button
        type="button"
        aria-label={flipped ? "Show front of card" : "Show back of card"}
        onClick={() => setFlipped((v) => !v)}
        style={{
          all: "unset",
          cursor: "pointer",
          width,
          maxWidth: "92vw",
        }}
      >
        <div style={{ perspective: "1200px", width: "100%" }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "3 / 4",
              transformStyle: "preserve-3d",
              transition: reduceMotion ? "none" : "transform 650ms ease",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              borderRadius: 18,
            }}
          >
            {/* FRONT */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backfaceVisibility: "hidden",
                borderRadius: 18,
                overflow: "hidden",
                boxShadow:
                  "0 24px 70px rgba(0,0,0,0.55), 0 0 1px rgba(255,255,255,0.08) inset",
              }}
            >
              <img
                src={frontSrc}
                alt="Genesis Brain example card (front)"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  right: 14,
                  bottom: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  fontSize: 12,
                  letterSpacing: 0.6,
                  color: "rgba(255,255,255,0.72)",
                  textShadow: "0 2px 10px rgba(0,0,0,0.75)",
                  pointerEvents: "none",
                }}
              >
                <span>GENESIS BRAIN</span>
                <span style={{ color: accentColor }}>TAP TO FLIP</span>
              </div>
            </div>

            {/* BACK */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                borderRadius: 18,
                overflow: "hidden",
                background:
                  "radial-gradient(120% 120% at 50% 0%, rgba(120,185,255,0.18), rgba(0,0,0,0) 55%), linear-gradient(180deg, rgba(8,10,18,0.98), rgba(0,0,0,0.98))",
                boxShadow:
                  "0 24px 70px rgba(0,0,0,0.55), 0 0 1px rgba(255,255,255,0.08) inset",
              }}
            >
              {/* SILVER FOIL FRAME (shimmer) */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 18,
                  pointerEvents: "none",
                }}
              >
                {/* outer edge shimmer */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 18,
                    padding: 1,
                    background:
                      "conic-gradient(from 180deg at 50% 50%, rgba(255,255,255,0.06), rgba(255,255,255,0.22), rgba(255,255,255,0.06), rgba(255,255,255,0.18), rgba(255,255,255,0.06))",
                    opacity: backIsAlive ? 1 : 0,
                    animation:
                      backIsAlive && !reduceMotion
                        ? "bbFoilSpin 6.5s linear infinite"
                        : "none",
                    maskImage:
                      "radial-gradient(closest-side, transparent 86%, black 92%)",
                    WebkitMaskImage:
                      "radial-gradient(closest-side, transparent 86%, black 92%)",
                  }}
                />
                {/* typing pulse glow */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 18,
                    boxShadow: backIsPulsing
                      ? "0 0 0 1px rgba(255,255,255,0.12) inset, 0 0 40px rgba(120,185,255,0.22), 0 0 90px rgba(120,185,255,0.12)"
                      : "0 0 0 1px rgba(255,255,255,0.08) inset, 0 0 34px rgba(120,185,255,0.10)",
                    transition: "box-shadow 250ms ease",
                    animation:
                      backIsPulsing && !reduceMotion
                        ? "bbPulse 1.15s ease-in-out infinite"
                        : "none",
                  }}
                />
              </div>

              {/* BLUE BRAIN HOLOGRAM BEHIND TEXT */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  pointerEvents: "none",
                  opacity: backIsAlive ? 1 : 0,
                }}
              >
                <img
                  src={backBrainSrc}
                  alt=""
                  aria-hidden="true"
                  style={{
                    width: "58%",
                    maxWidth: 260,
                    opacity: 0.22,
                    filter:
                      // push it bluish + hologram-y
                      "hue-rotate(200deg) saturate(1.45) contrast(1.05) blur(0.2px)",
                    transformOrigin: "50% 50%",
                    animation:
                      backIsAlive && !reduceMotion
                        ? "bbHoloRotate 14s linear infinite"
                        : "none",
                    mixBlendMode: "screen",
                  }}
                />
                {/* soft vignette so text stays readable */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(70% 60% at 50% 55%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.82) 100%)",
                  }}
                />
              </div>

              {/* BACK CONTENT */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  padding: 22,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 10,
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  letterSpacing: 0.7,
                }}
              >
                {/* header strip */}
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    left: 18,
                    right: 18,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  <span>BACK OF CARD</span>
                  <span style={{ color: accentColor }}>TAP TO RETURN</span>
                </div>

                {/* typed text */}
                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: "rgba(255,255,255,0.78)",
                    textShadow: "0 2px 16px rgba(0,0,0,0.65)",
                  }}
                >
                  {renderedLines.join("\n")}
                  {caretVisible ? (
                    <span
                      style={{
                        display: "inline-block",
                        marginLeft: 2,
                        width: 10,
                        color: accentColor,
                        opacity: 0.9,
                        animation: "bbCaret 1.1s steps(2, start) infinite",
                      }}
                    >
                      |
                    </span>
                  ) : null}
                </div>

                {/* footer hint */}
                <div
                  style={{
                    marginTop: 18,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.40)",
                  }}
                >
                  Example shown for visual reference only.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Optional caption under the card */}
        <div
          style={{
            marginTop: 12,
            fontSize: 14,
            textAlign: "center",
            maxWidth: "92vw",
            color: "rgba(255,255,255,0.75)",
          }}
        >
          <div style={{ fontWeight: 600 }}>Genesis Brain — Example</div>
          <div style={{ marginTop: 6, color: "rgba(255,255,255,0.62)" }}>
            Tap the card to view the back inscription.
          </div>
        </div>

        {/* keyframes (safe: this file is a client component) */}
        <style>{`
          @keyframes bbCaret {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
          }
          @keyframes bbFoilSpin {
            0% { transform: rotate(0deg); opacity: 0.85; }
            50% { opacity: 1; }
            100% { transform: rotate(360deg); opacity: 0.85; }
          }
          @keyframes bbPulse {
            0% { filter: brightness(1); }
            50% { filter: brightness(1.15); }
            100% { filter: brightness(1); }
          }
          @keyframes bbHoloRotate {
            0% { transform: translateY(0px) rotate(0deg) scale(1); }
            50% { transform: translateY(-4px) rotate(180deg) scale(1.02); }
            100% { transform: translateY(0px) rotate(360deg) scale(1); }
          }
        `}</style>
      </button>
    </div>
  );
}
