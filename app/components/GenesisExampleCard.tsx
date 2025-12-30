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
        timersRef.current.push(
          window.setTimeout(() => setFlipped(false), flipBackHoldMs)
        );
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
        timersRef.current.push(
          window.setTimeout(typeNext, typingMsPerChar)
        );
        return;
      }

      lineIndex += 1;
      charIndex = 0;

      if (lineIndex >= backTextLines.length) {
        setIsTyping(false);
        if (autoReturnToFront) {
          timersRef.current.push(
            window.setTimeout(() => setFlipped(false), flipBackHoldMs)
          );
        }
        return;
      }

      timersRef.current.push(
        window.setTimeout(typeNext, lineDelayMs)
      );
    };

    timersRef.current.push(window.setTimeout(typeNext, 250));
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
                  fontSize: 12,
                  letterSpacing: 0.6,
                  color: "rgba(255,255,255,0.72)",
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
                background:
                  "radial-gradient(120% 120% at 50% 0%, rgba(120,185,255,0.16), rgba(0,0,0,0.92))",
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
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  letterSpacing: 0.7,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    left: 18,
                    right: 18,
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  <span>BACK OF CARD</span>
                  <span style={{ color: accentColor }}>TAP TO RETURN</span>
                </div>

                {/* 🔵 DARKER BLUE BACK TEXT */}
                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: "rgba(90,150,235,0.9)",
                    textShadow: "0 2px 18px rgba(0,0,0,0.75)",
                  }}
                >
                  {renderedLines.join("\n")}
                  {caretVisible && (
                    <span
                      style={{
                        marginLeft: 2,
                        color: accentColor,
                        animation: "blink 1.1s steps(2,start) infinite",
                      }}
                    >
                      |
                    </span>
                  )}
                </div>

                <div
                  style={{
                    marginTop: 18,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Example shown for visual reference only.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            fontSize: 14,
            textAlign: "center",
            color: "rgba(255,255,255,0.75)",
          }}
        >
          <div style={{ fontWeight: 600 }}>Genesis Brain — Example</div>
          <div style={{ marginTop: 6, opacity: 0.75 }}>
            Tap the card to view the back inscription.
          </div>
        </div>

        <style>{`
          @keyframes blink {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
          }
          @keyframes frontRotate {
            0% { transform: rotateY(0deg) scale(1.01); }
            50% { transform: rotateY(10deg) scale(1.01); }
            100% { transform: rotateY(0deg) scale(1.01); }
          }
        `}</style>
      </button>
    </div>
  );
}
