'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Page() {
  const AUDIO_SRC = '/audio/initiation-tone.mp3';

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  const startAudio = async () => {
    const a = audioRef.current;
    if (!a) return;

    try {
      a.load();
      a.currentTime = 0;
      await a.play();
      setIsPlaying(true);
      setAudioReady(true);
    } catch {
      setIsPlaying(false);
      setAudioReady(false);
    }
  };

  const toggleAudio = async () => {
    const a = audioRef.current;
    if (!a) return;

    try {
      if (isPlaying) {
        a.pause();
        setIsPlaying(false);
      } else {
        await a.play();
        setIsPlaying(true);
        setAudioReady(true);
      }
    } catch {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const unlock = async () => {
      if (audioReady) return;
      const a = audioRef.current;
      if (!a) return;
      try {
        await a.play();
        a.pause();
        a.currentTime = 0;
        setAudioReady(true);
      } catch {}
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, [audioReady]);

  return (
    <main className="page">
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        preload="auto"
        playsInline
        loop
      />

      <section className="hero">
        <h1 className="title">Proof of Care comes first.</h1>

        <p className="subtitle">
          Bit Brains is a protocol for NFTs, ENS-based identity, zero-knowledge
          eligibility, and real-world asset integration — beginning on Ethereum.
        </p>

        <div className="ctaRow">
          <Link href="/proof-of-care" className="btn">
            Enter Proof of Care →
          </Link>

          <button
            className="btn btnGhost"
            onClick={audioReady ? toggleAudio : startAudio}
          >
            {isPlaying ? 'Mute Sound' : 'Begin Sound'}
          </button>
        </div>

        <div className="card">
          <div className="brainRow">
            <button
              className="brainTap"
              onClick={audioReady ? toggleAudio : startAudio}
              aria-label="Toggle sound"
            >
              <div className="brainWrapper">
                <Image
                  src="/images/brain-10813_256.gif"
                  alt="Rotating brain"
                  fill
                  priority
                  unoptimized
                  className="brainImage"
                />
              </div>
            </button>
          </div>

          <p className="hint">
            Tip: on iPad, tap “Begin Sound” or the brain to start ambience.
          </p>
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 44px 18px 64px;
          display: flex;
          justify-content: center;
          background:
            radial-gradient(1200px 700px at 50% 10%, rgba(130,170,255,.22), transparent 60%),
            radial-gradient(900px 600px at 50% 100%, rgba(185,120,255,.18), transparent 60%),
            #05060a;
          color: #fff;
        }

        .hero {
          width: min(980px, 100%);
          text-align: center;
        }

        .title {
          font-size: clamp(40px, 6vw, 64px);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 14px;
        }

        .subtitle {
          max-width: 900px;
          margin: 0 auto 18px;
          font-size: clamp(14px, 2.3vw, 18px);
          line-height: 1.55;
          color: rgba(255,255,255,.75);
        }

        .ctaRow {
          display: flex;
          justify-content: center;
          gap: 14px;
          margin: 18px 0 22px;
          flex-wrap: wrap;
        }

        .btn {
          padding: 12px 18px;
          border-radius: 12px;
          font-weight: 700;
          border: 1px solid rgba(255,255,255,.16);
          background: rgba(255,255,255,.08);
          color: #fff;
          text-decoration: none;
          transition: all .15s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,.12);
        }

        .btnGhost {
          background: rgba(255,255,255,.06);
        }

        .card {
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.04);
          box-shadow: 0 30px 90px rgba(0,0,0,.55);
          padding: 22px 16px 14px;
        }

        .brainRow {
          display: flex;
          justify-content: center;
        }

        .brainTap {
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
        }

        /* ✅ ONE TRUE CIRCLE — NO DOUBLE FRAME */
        .brainWrapper {
          position: relative;
          width: min(360px, 78vw);
          aspect-ratio: 1 / 1;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.12);
        }

        .brainWrapper::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          filter: blur(28px);
          background: radial-gradient(
            circle,
            rgba(130,170,255,.45),
            transparent 70%
          );
          z-index: 0;
        }

        .brainImage {
          object-fit: contain;
          border-radius: 50%;
          z-index: 1;
        }

        .hint {
          margin-top: 10px;
          font-size: 12px;
          color: rgba(255,255,255,.6);
        }
      `}</style>
    </main>
  );
}
