"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  frontSrc: string;
  width?: number;
  flipBackHoldMs?: number;
  typingMsPerChar?: number;
  lineDelayMs?: number;
  accentColor?: string;
  autoReturnToFront?: boolean;
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
  const [renderedLines, setRenderedLines] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const timersRef = useRef<number[]>([]);
  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

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

  useEffect(() => {
    clearTimers();

    if (!flipped) {
      setRenderedLines([]);
      setIsTyping(false);
      return;
    }

    if (reduceMotion) {
      setRenderedLines(backTextLines);
      setIsTyping(false);
      if (autoReturnToFront) {
        const t = window.setTimeout(() => setFlipped(false), flipBackHoldMs);
        timersRef.current.push(t);
      }
      return;
    }

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
        onClick={() => setFlipped((v) => !v)}
        style={{ all: "unset", cursor: "pointer", width, maxWidth: "92vw" }}
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
                  "0 24px 70px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.08)",
              }}
            >
              <img
                src={frontSrc}
                alt="Genesis Brain example card"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  animation:
                    rotateFront && !reduceMotion
                      ? `frontRotate ${rotateSeconds}s linear infinite`
                      : undefined,
                  transformOrigin: "50% 55%",
                }}
              />
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
                  "radial-gradient(120% 120% at 50% 0%, rgba(180,210,255,0.25), rgba(255,255,255,0.88))",
                boxShadow:
                  "0 24px 70px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(0,0,0,0.12)",
              }}
            >
              <div
                style={{
                  padding: 22,
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",

                  // ✅ KEY CHANGE: BACK TEXT COLOR → BLACK
                  color: "rgba(10,14,20,0.92)",

                  textShadow: "none",
                }}
              >
                {renderedLines.join("\n")}
                {caretVisible && (
                  <span
                    style={{
                      marginLeft: 2,
                      color: "rgba(10,14,20,0.9)",
                      animation: "blink 1.1s steps(2,start) infinite",
                    }}
                  >
                    |
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </button>

      <style>{`
        @keyframes blink {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes frontRotate {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(10deg); }
          100% { transform: rotateY(0deg); }
        }
      `}</style>
    </div>
  );
}
