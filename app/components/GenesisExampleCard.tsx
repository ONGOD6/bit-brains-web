"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  frontSrc: string;            // "/images/genesis-brain-example-blue.png"
  width?: number;              // desktop width
  flipBackHoldMs?: number;     // hold after typing completes
  typingMsPerChar?: number;    // typing speed
  lineDelayMs?: number;        // delay between lines
  accentColor?: string;        // text accent (match canister glow)
  autoReturnToFront?: boolean; // auto flip back after hold
};

export default function GenesisExampleCard({
  frontSrc,
  width = 380,
  flipBackHoldMs = 10_000,
  typingMsPerChar = 50,   // 40–60ms sweet spot
  lineDelayMs = 350,      // 300–400ms sweet spot
  accentColor = "rgba(120,185,255,0.95)",
  autoReturnToFront = true,
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
      // if component flipped back early, stop
      if (!flipped) return;

      const currentLine = backTextLines[lineIndex] ?? "";

      // Ensure we have space in renderedLines
      setRenderedLines((prev) => {
        const next = [...prev];
        // pad with empty lines up to lineIndex
        while (next.length < lineIndex) next.push("");
        seen: {
          if (next.length === lineIndex) next.push("");
        }
        // update current line substring
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
                  "radial-gradient(120% 120% at 50% 0%, rgba(120,185,255,0.18), rgba(0,0,0,0.92))",
                boxShadow:
                  "0 24px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08) inset",
              }}
            >
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
                {/* subtle header strip */}
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
                        animation: "blink 1.1s steps(2, start) infinite",
                      }}
                    >
                      ▍
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

                {/* keyframes */}
                <style>{`
                  @keyframes blink {
                    0% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                  }
                `}</style>
              </div>
            </div>
          </div>
        </div>
      </button>

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
    </div>
  );
}
