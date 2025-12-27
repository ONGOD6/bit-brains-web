'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

/**
 * BIT BRAINS — Homepage (app/page.tsx)
 * GitHub-ready single-file page with:
 * - True circular inner field (no oval mask)
 * - Reduced to 2 primary layers (outer ring + inner field)
 * - Brain scaled up ~18%
 * - iPad/iOS-friendly audio start (requires user gesture)
 *
 * ✅ IMPORTANT PATHS (edit if needed):
 *   - Brain GIF: /brain-10813_256.gif
 *   - Audio file: /audio/ambience.mp3   (put in /public/audio/ambience.mp3)
 */

export default function Page() {
  // ----- CONFIG (edit these if your filenames differ) -----
  const brainGifSrc = '/brain-10813_256.gif';
  const ambienceSrc = '/audio/ambience.mp3';

  // ----- AUDIO STATE -----
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);

  // optional: keep volume subtle for ritual ambience
  const ambienceVolume = useMemo(() => 0.25, []);

  // Create the audio element once on client
  useEffect(() => {
    // Create on mount (but don't autoplay)
    const a = new Audio(ambienceSrc);
    a.loop = true;
    a.preload = 'auto';
    a.crossOrigin = 'anonymous';
    a.volume = ambienceVolume;
    a.muted = true; // start muted until user explicitly unmutes
    audioRef.current = a;

    const onError = () => setAudioError('Audio failed to load. Check the file path in /public.');
    a.addEventListener('error', onError);

    return () => {
      a.removeEventListener('error', onError);
      try {
        a.pause();
      } catch {}
      audioRef.current = null;
    };
  }, [ambienceSrc, ambienceVolume]);

  // Core iOS-safe start: must be called from a user gesture (tap/click)
  const startAmbience = async () => {
    setAudioError(null);
    const a = audioRef.current;
    if (!a) {
      setAudioError('Audio not initialized.');
      return;
    }

    // Ensure we mark "started" after a successful play attempt
    try {
      // iOS often requires muted play first, then unmute on another gesture
      a.muted = true;
      await a.play();
      setHasStarted(true);

      // Keep it muted until user hits Unmute
      setIsMuted(true);
      a.muted = true;
    } catch (err) {
      // If play fails, iOS likely blocked it or file missing
      setHasStarted(false);
      setAudioError(
        'iPad/iOS blocked audio or the file is missing. Confirm /public/audio/ambience.mp3 exists and tap the button again.'
      );
    }
  };

  const toggleMute = async () => {
    setAudioError(null);
    const a = audioRef.current;
    if (!a) {
      setAudioError('Audio not initialized.');
      return;
    }

    // If user hits unmute before starting, start first
    if (!hasStarted) {
      await startAmbience();
      // If start failed, bail
      if (!audioRef.current) return;
    }

    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    try {
      // Changing muted state must be triggered by a user gesture on iOS — this handler is
      a.muted = nextMuted;
      if (!nextMuted) {
        // some browsers pause silently; ensure play continues
        await a.play();
      }
    } catch {
      setAudioError('Audio could not be toggled. Tap once on the page, then try again.');
    }
  };

  // Optional: one-tap anywhere to help iOS users
  const onPageTap = async () => {
    // If user taps the page (not a button) and audio hasn't started, attempt start.
    if (!hasStarted) {
      await startAmbience();
    }
  };

  return (
    <main className="page" onPointerDown={onPageTap}>
      {/* Top Nav */}
      <header className="topNav">
        <nav className="navLinks">
          <Link className="navLink" href="/">
            Home
          </Link>
          <Link className="navLink" href="/manifesto">
            Manifesto
          </Link>
          <Link className="navLink" href="/mint">
            Mint
          </Link>
          <Link className="navLink" href="/music">
            Music
          </Link>
          <Link className="navLink" href="/stake">
            Stake
          </Link>
          <Link className="navLink" href="/proof-of-care">
            Proof of Care
          </Link>
          <Link className="navLink" href="/ens">
            ENS
          </Link>
        </nav>
      </header>

      {/* Hero / Ritual Frame */}
      <section className="heroWrap" aria-label="Bit Brains hero">
        <div className="heroCard">
          <div className="heroTitle">BIT BRAINS</div>

          <p className="heroSubtitle">
            Proof of Care (PoC) is the genesis signal. Brains evolve through continuity, verification, and time—anchored by
            ENS identity and secured by zero-knowledge proof systems—until autonomous, intelligent technology emerges.
          </p>

          {/* Ceremonial Field */}
          <div className="fieldWrap">
            {/* Outer ring (layer 1) */}
            <div className="outerRing" aria-hidden="true" />

            {/* Inner field (layer 2) — TRUE CIRCLE */}
            <div className="innerField">
              <img className="brainGif" src={brainGifSrc} alt="Rotating brain" draggable={false} />
              <div className="fieldGlow" aria-hidden="true" />
            </div>
          </div>

          {/* Controls */}
          <div className="controlsRow">
            <button className="pillBtn" onClick={startAmbience} type="button">
              Tap to Start Ambience
            </button>

            <button className="pillBtn pillBtnAlt" onClick={toggleMute} type="button">
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>

          <div className="helperText">
            iPad/iOS requires a user tap to begin audio. If you don&apos;t hear it, tap once on the page.
          </div>

          {audioError ? <div className="errorText">{audioError}</div> : null}
        </div>
      </section>

      {/* Background layers */}
      <div className="bgGlowA" aria-hidden="true" />
      <div className="bgGlowB" aria-hidden="true" />

      <style jsx>{`
        /* -------------------------
           PAGE / BACKGROUND
        ------------------------- */
        .page {
          min-height: 100vh;
          background: radial-gradient(1200px 800px at 50% 20%, rgba(58, 108, 255, 0.18), rgba(0, 0, 0, 0) 60%),
            radial-gradient(900px 600px at 20% 40%, rgba(124, 58, 237, 0.12), rgba(0, 0, 0, 0) 60%),
            linear-gradient(180deg, #050712 0%, #03040c 45%, #02030a 100%);
          color: rgba(255, 255, 255, 0.92);
          position: relative;
          overflow-x: hidden;
        }

        /* Decorative glows (subtle, behind everything) */
        .bgGlowA {
          position: absolute;
          inset: -200px -200px auto -200px;
          height: 520px;
          background: radial-gradient(closest-side, rgba(66, 153, 225, 0.18), rgba(0, 0, 0, 0));
          filter: blur(18px);
          pointer-events: none;
          z-index: 0;
        }
        .bgGlowB {
          position: absolute;
          inset: auto -200px -260px -200px;
          height: 560px;
          background: radial-gradient(closest-side, rgba(147, 51, 234, 0.14), rgba(0, 0, 0, 0));
          filter: blur(20px);
          pointer-events: none;
          z-index: 0;
        }

        /* -------------------------
           TOP NAV
        ------------------------- */
        .topNav {
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(10px);
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.25));
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .navLinks {
          max-width: 1100px;
          margin: 0 auto;
          padding: 14px 18px;
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
        }

        .navLink {
          text-decoration: none;
          font-size: 15px;
          letter-spacing: 0.2px;
          color: rgba(160, 130, 255, 0.95);
          transition: opacity 120ms ease, transform 120ms ease;
        }
        .navLink:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        /* -------------------------
           HERO CARD
        ------------------------- */
        .heroWrap {
          position: relative;
          z-index: 5;
          display: flex;
          justify-content: center;
          padding: 36px 18px 64px;
        }

        .heroCard {
          width: min(980px, 100%);
          border-radius: 28px;
          background: radial-gradient(700px 360px at 50% 20%, rgba(72, 111, 255, 0.22), rgba(0, 0, 0, 0) 65%),
            linear-gradient(180deg, rgba(10, 18, 40, 0.72), rgba(6, 10, 22, 0.78));
          border: 1px solid rgba(255, 255, 255, 0.07);
          box-shadow: 0 24px 90px rgba(0, 0, 0, 0.55);
          padding: 34px 22px 28px;
          position: relative;
        }

        .heroTitle {
          text-align: center;
          font-weight: 800;
          letter-spacing: 3px;
          font-size: clamp(28px, 3.2vw, 44px);
          margin-top: 4px;
          margin-bottom: 10px;
        }

        .heroSubtitle {
          text-align: center;
          max-width: 860px;
          margin: 0 auto;
          font-size: 16px;
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.84);
          padding: 0 6px;
        }

        /* -------------------------
           CEREMONIAL FIELD
           Fixes:
           - True circle inner field (no oval clipping)
           - Only 2 layers: outer ring + inner field
        ------------------------- */
        .fieldWrap {
          margin: 22px auto 16px;
          width: min(620px, 92vw);
          aspect-ratio: 1 / 1;
          position: relative;
          display: grid;
          place-items: center;
        }

        /* Outer ring: subtle and clean */
        .outerRing {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(closest-side, rgba(120, 160, 255, 0.12), rgba(0, 0, 0, 0) 62%),
            radial-gradient(closest-side, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.55));
          border: 1px solid rgba(255, 255, 255, 0.07);
          box-shadow: 0 0 0 10px rgba(0, 0, 0, 0.22) inset;
          filter: drop-shadow(0 18px 50px rgba(0, 0, 0, 0.55));
        }

        /* Inner field: TRUE circle */
        .innerField {
          width: 72%;
          aspect-ratio: 1 / 1;
          border-radius: 50%;
          position: relative;
          display: grid;
          place-items: center;
          overflow: hidden; /* keeps everything circular */
          background: radial-gradient(closest-side, rgba(54, 98, 255, 0.18), rgba(0, 0, 0, 0) 65%),
            radial-gradient(closest-side, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.6));
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 14px rgba(0, 0, 0, 0.22) inset, 0 22px 80px rgba(0, 0, 0, 0.55);
        }

        /* Brain: scale up ~18% so it commands the space */
        .brainGif {
          width: 78%;
          height: 78%;
          object-fit: contain;
          image-rendering: auto;
          user-select: none;
          pointer-events: none;
          transform: translateZ(0) scale(1.18);
          filter: drop-shadow(0 10px 30px rgba(125, 85, 255, 0.35));
        }

        /* Subtle inner glow, not another “ring” */
        .fieldGlow {
          position: absolute;
          inset: -30%;
          background: radial-gradient(closest-side, rgba(130, 170, 255, 0.16), rgba(0, 0, 0, 0) 62%);
          filter: blur(16px);
          pointer-events: none;
        }

        /* -------------------------
           CONTROLS
        ------------------------- */
        .controlsRow {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 10px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }

        .pillBtn {
          appearance: none;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.9);
          border-radius: 999px;
          padding: 10px 16px;
          font-size: 14px;
          letter-spacing: 0.3px;
          cursor: pointer;
          transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;
        }
        .pillBtn:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.18);
        }
        .pillBtn:active {
          transform: translateY(0px);
        }

        .pillBtnAlt {
          background: rgba(120, 160, 255, 0.10);
          border-color: rgba(120, 160, 255, 0.24);
        }

        .helperText {
          text-align: center;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.62);
          margin-top: 6px;
        }

        .errorText {
          text-align: center;
          margin-top: 10px;
          font-size: 13px;
          color: rgba(255, 120, 120, 0.95);
        }

        /* -------------------------
           RESPONSIVE TUNING
        ------------------------- */
        @media (max-width: 520px) {
          .heroCard {
            padding: 26px 16px 22px;
            border-radius: 22px;
          }
          .navLinks {
            gap: 12px;
          }
          .navLink {
            font-size: 14px;
          }
          .heroSubtitle {
            font-size: 15px;
          }
          .innerField {
            width: 78%;
          }
          .brainGif {
            width: 80%;
            height: 80%;
          }
        }
      `}</style>
    </main>
  );
}
