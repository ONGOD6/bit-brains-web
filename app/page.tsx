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
      // iOS requires this to happen inside a user gesture.
      el.volume = 0.5;
      el.loop = true;

      // Start audio
      await el.play();
      setAudioEnabled(true);
    } catch {
      // iOS/Safari will block if not triggered by a direct user tap/click.
      // We intentionally swallow the error to avoid noisy logs.
      setAudioEnabled(false);
    }
  }, []);

  const stopAudio = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;

    try {
      el.pause();
      el.currentTime = 0;
    } catch {
      // no-op
    }
    setAudioEnabled(false);
  }, []);

  const toggleAudio = useCallback(async () => {
    if (audioEnabled) stopAudio();
    else await startAudio();
  }, [audioEnabled, startAudio, stopAudio]);

  return (
    <main className="page">
      {/* Audio element: iOS will only play after a user gesture calling startAudio() */}
      <audio ref={audioRef} src="/audio/ambient.mp3" preload="auto" playsInline />

      <section className="hero">
        <div className="heroInner">
          <h1 className="title">Proof of Care comes first.</h1>

          <p className="subtitle">
            Bit Brains is a protocol for NFT + ENS-based identity, zk-verified eligibility, and real-world asset
            integration — beginning on Ethereum.
          </p>

          <div className="actions">
            <Link className="btn primary" href="/proof-of-care">
              Enter Proof of Care
            </Link>

            <button className="btn ghost" type="button" onClick={toggleAudio}>
              {audioEnabled ? "Mute Sound" : "Begin Sound"}
            </button>
          </div>

          <div className="brainRow">
            {/* Tap the brain also starts audio (iPad-safe because it's a user gesture) */}
            <button
              type="button"
              className="brainTap"
              onClick={startAudio}
              aria-label="Tap to begin ambient sound"
            >
              <div className="brain-wrapper">
                <Image
                  src="/images/brain.gif"
                  alt="Genesis Brain"
                  fill
                  priority
                  unoptimized
                  className="brain-image"
                />
              </div>
            </button>
          </div>

          <p className="hint">
            iPad note: sound only starts after a tap. Tap the brain or press “Begin Sound”.
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
          background: radial-gradient(circle at 50% 20%, rgba(90, 140, 255, 0.15), transparent 55%),
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
          letter-spacing: -0.02em;
        }

        .subtitle {
          margin: 0;
          max-width: 820px;
          font-size: clamp(14px, 2.2vw, 18px);
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.78);
        }

        .actions {
          margin-top: 10px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn {
          appearance: none;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.92);
          padding: 12px 14px;
          border-radius: 12px;
          text-decoration: none;
          font-size: 14px;
          line-height: 1;
          cursor: pointer;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .btn.primary {
          background: rgba(120, 170, 255, 0.18);
          border-color: rgba(120, 170, 255, 0.35);
        }

        .btn.ghost {
          background: rgba(255, 255, 255, 0.04);
        }

        .btn:active {
          transform: translateY(1px);
        }

        .brainRow {
          margin-top: 14px;
          display: flex;
          justify-content: center;
        }

        .brainTap {
          border: none;
          background: transparent;
          padding: 0;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }

        /* ✅ FLUSH FIX: one true circle, glow as pseudo-element so it never changes sizing */
        .brain-wrapper {
          position: relative;
          width: min(320px, 78vw);
          aspect-ratio: 1 / 1;
          border-radius: 50%;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .brain-wrapper::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          filter: blur(28px);
          background: radial-gradient(circle, rgba(130, 170, 255, 0.45), transparent 70%);
          z-index: -1;
        }

        .brain-image {
          object-fit: contain;
          border-radius: 50%;
          display: block;
        }

        .hint {
          margin: 6px 0 0;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }
      `}</style>
    </main>
  );
}
