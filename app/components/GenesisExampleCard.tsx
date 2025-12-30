"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  frontSrc: string; // "/images/IMG_1090.jpeg"
  width?: number; // desktop width
  flipBackHoldMs?: number; // hold after typing completes
  typingMsPerChar?: number; // typing speed
  lineDelayMs?: number; // delay between lines
  accentColor?: string; // text accent (match canister glow)
  autoReturnToFront?: boolean; // auto flip back after hold

  // optional slow rotation on the FRONT image (illusion)
  rotateFront?: boolean;
  rotateSeconds?: number;
};

export default function GenesisExampleCard({
  frontSrc,
  width = 380,
  flipBackHoldMs = 10_000,
  typingMsPerChar = 50,
  lineDelayMs = 350,
  accentColor = "rgba(120,185,255,0.95)",
  autoReturnToFront = true,

  rotateFront = false,
  rotateSeconds = 26,
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

    if (reduceMotion) {
      // If reduced motion, show text instantly (no typing)
      setRenderedLines(backTextLines);
      setIsTyping(false);

      // still auto-return after hold if enabled
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
      if (!flipped) return;

      const currentLine = backTextLines[lineIndex] ?? "";

      setRenderedLines((prev) => {
        const next = [...prev];
        while (next.length < lineIndex) next.push("");
        if (next.length === lineIndex) next.push("");
        next[lineIndex] = currentLine.slice(0, charIndex);
        return next;
      });

      if (charIndex < currentLine.length) {
        charIndex += 1;
        const t = window.setTimeout(typeNext, typingMsPerChar);
        timersRef.current.push(t);
        return;
      }

      lineIndex += 1;
      charIndex = 0;

      if (lineIndex >= backTextLines.length) {
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

  // Keep spacing consistent so the column fills the canister even while typing.
  const linesForLayout = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < backTextLines.length; i++) {
      out.push(renderedLines[i] ?? "");
    }
    return out;
  }, [renderedLines, backTextLines]);

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
                  "0 24px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08) inset",
              }}
            >
              <img
                src={frontSrc}
                alt="Genesis Brain example card (front)"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  animation:
                    rotateFront && !reduceMotion
                      ? `frontRotate ${rotateSeconds}s linear infinite`
                      : undefined,
                  transformOrigin: "50% 55%",
                  willChange: rotateFront ? "transform" : undefined,
                }}
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
                // Reduced “fog” + clearer overall back
                background:
                  "radial-gradient(120% 120% at 50% 0%, rgba(120,185,255,0.10), rgba(0,0,0,0.90))",
                boxShadow:
                  "0 24px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08) inset",
              }}
            >
              {/* Backplate image (reduced haze). Keeps the canister context without washing text. */}
              <img
                src={frontSrc}
                alt=""
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.16, // ✅ reduced foggy wash
                  filter: "saturate(1.05) contrast(1.08)",
                  transform: "scale(1.03)",
                }}
              />

              {/* subtle glass vignette (NOT gray panel; just helps keep edges cinematic) */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(90% 85% at 50% 45%, rgba(255,255,255,0.04), rgba(0,0,0,0.55))",
                  opacity: 0.55,
                }}
              />

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
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  fontSize: 11,
                  letterSpacing: 0.7,
                  color: "rgba(255,255,255,0.50)",
                  textShadow: "0 2px 10px rgba(0,0,0,0.65)",
                }}
              >
                <span>BACK OF CARD</span>
                <span style={{ color: accentColor }}>TAP TO RETURN</span>
              </div>

              {/* ✅ CANISTER WINDOW: keep text ONLY inside this interior zone */}
              <div
                style={{
                  position: "absolute",
                  // Tuned to sit inside the visible canister area
                  top: "16%",
                  bottom: "18%",
                  left: "16%",
                  right: "16%",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "stretch",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 0,
                    paddingTop: 6,
                    paddingBottom: 6,
                    // ✅ larger type that fills the canister interior
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    fontSize: "clamp(16px, 2.4vw, 22px)",
                    lineHeight: 1.15,
                    letterSpacing: 1.2,

                    // ✅ black text for legibility (as requested)
                    color: "rgba(0,0,0,0.88)",
                    textShadow:
                      "0 1px 0 rgba(255,255,255,0.25), 0 6px 18px rgba(0,0,0,0.10)",

                    // ✅ subtle “in/out” breathing while typing, stays inside canister
                    animation:
                      !reduceMotion && flipped
                        ? `canisterBreathe 2.8s ease-in-out infinite`
                        : undefined,
                    transformOrigin: "50% 50%",
                  }}
                >
                  {linesForLayout.map((line, idx) => {
                    const isBlank = backTextLines[idx] === "";
                    return (
                      <div
                        key={idx}
                        style={{
                          flex: 1,
                          minHeight: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          opacity: isBlank ? 0.25 : 1,
                          // Slightly tighter for header line
                          fontWeight: idx === 0 ? 900 : 800,
                          textTransform: "uppercase",
                        }}
                      >
                        {line}
                      </div>
                    );
                  })}

                  {/* caret stays inside canister too */}
                  {caretVisible ? (
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        bottom: 6,
                        transform: "translateX(-50%)",
                        fontSize: 18,
                        fontWeight: 900,
                        color: accentColor,
                        opacity: 0.9,
                        animation: "blink 1.1s steps(2, start) infinite",
                        pointerEvents: "none",
                      }}
                    >
                      |
                    </div>
                  ) : null}
                </div>
              </div>

              {/* footer hint (outside canister) */}
              <div
                style={{
                  position: "absolute",
                  left: 18,
                  right: 18,
                  bottom: 12,
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  fontSize: 11,
                  letterSpacing: 0.7,
                  color: "rgba(255,255,255,0.40)",
                  textAlign: "center",
                  textShadow: "0 2px 10px rgba(0,0,0,0.75)",
                }}
              >
                Example shown for visual reference only.
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

        {/* keyframes */}
        <style>{`
          @keyframes blink {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
          }

          /* slow “in-canister” rotation illusion */
          @keyframes frontRotate {
            0%   { transform: rotateY(0deg) rotateZ(0deg) scale(1.01); }
            50%  { transform: rotateY(10deg) rotateZ(-0.35deg) scale(1.01); }
            100% { transform: rotateY(0deg) rotateZ(0deg) scale(1.01); }
          }

          /* ✅ subtle in/out breathing (kept inside canister window) */
          @keyframes canisterBreathe {
            0%   { transform: scale(1.00); }
            50%  { transform: scale(1.03); }
            100% { transform: scale(1.00); }
          }
        `}</style>
      </button>
    </div>
  );
}
