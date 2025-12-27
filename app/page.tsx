"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

export default function Page() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const startAudio = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;

    try {
      el.volume = 0.5;
      el.loop = true;
      el.muted = false;
      await el.play();
      setAudioEnabled(true);
    } catch {
      setAudioEnabled(false);
    }
  }, []);

  const stopAudio = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    try {
      el.pause();
      el.currentTime = 0;
    } catch {}
    setAudioEnabled(false);
  }, []);

  const toggleAudio = useCallback(async () => {
    if (audioEnabled) stopAudio();
    else await startAudio();
  }, [audioEnabled, startAudio, stopAudio]);

  return (
    <main className="page">
      {/* iOS-safe audio element */}
      <audio
        ref={audioRef}
        src="/audio/ambient.mp3"
        preload="auto"
        playsInline
      />

      <section className="hero">
        <div className="heroInner">
          <h1 className="title">Proof of Care comes first.</h1>

          <p className="subtitle">
            Bit Brains is a protocol for NFT + ENS-based identity,
            zk-verified eligibility, and autonomous intelligence —
            beginning on Ethereum.
          </p>

          <div className="actions">
            <Link className="btn primary" href="/proof-of-care">
              Enter Proof of Care
            </Link>

            <button
              className="btn ghost"
              type="button"
              onClick={toggleAudio}
            >
              {audioEnabled ? "Mute Sound" : "Begin Sound"}
            </button>
          </div>

          {/* SINGLE brain container — no nested boxes */}
          <button
            type="button"
            className="brainContainer"
            onClick={startAudio}
            aria-label="Tap to begin ambient sound"
          >
            <Image
              src="/images/brain.gif"
              alt="Genesis Brain"
              fill
              priority
              unoptimized
            />
          </button>

          <p className="hint">
            iPad note: sound starts only after a tap. Tap the brain or press
            “Begin Sound”.
          </p>
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100svh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 18px;
          background:
            radial-gradient(circle at 50% 20%, rgba(90, 140, 255, 0.15), transparent 60%),
            radial-gradient(circle at 50% 80%, rgba(160, 90, 255, 0.12), transparent 60%),
            #05060a;
          color: rgba(255, 255, 255, 0.92);
        }

        .hero {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .heroInner {
          width: min(980px, 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 14px;
        }

        .title {
          margin: 0;
          font-size: clamp(28px, 5vw, 52px);
          line-height: 1.05;
        }

        .subtitle {
          max-width: 720px;
          font-size: 16px;
          opacity: 0.9;
        }

        .actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn {
          padding: 10px 16px;
          border-radius: 999px;
          font-size: 14px;
          cursor: pointer;
          text-decoration: none;
        }

        .btn.primary {
          background: #5b7cff;
          color: #fff;
        }

        .btn.ghost {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
        }

        /* 🔑 THIS IS THE FIX */
        .brainContainer {
          margin-top: 24px;
          width: min(320px, 80vw);
          aspect-ratio: 1 / 1;
          position: relative;
          border-radius: 50%;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.02);
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.08),
            0 0 60px rgba(120, 140, 255, 0.35);
          cursor: pointer;
          padding: 0;
          border: none;
        }

        .brainContainer :global(img) {
          object-fit: cover;
        }

        .hint {
          font-size: 12px;
          opacity: 0.6;
        }
      `}</style>
    </main>
  );
}
