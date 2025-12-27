'use client';

/**
 * Author: OnGod
 * File: app/page.tsx
 * Project: bit-brains-web
 *
 * Notes:
 * - GIF must exist at: /public/brain-evolution.gif
 * - Audio must exist at: /public/Audio/Ambient.mp3  (case-sensitive)
 * - iOS/iPad requires user gesture to start audio. We attach click/touch listeners.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';

export default function Page() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Simple random "neural spark" dots (visual polish; no extra assets needed)
  const sparks = useMemo(() => {
    const arr = Array.from({ length: 18 }).map((_, i) => {
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const size = 6 + Math.random() * 10;
      const blur = 6 + Math.random() * 12;
      const opacity = 0.12 + Math.random() * 0.25;
      const duration = 2.8 + Math.random() * 3.2;
      const delay = Math.random() * 2.5;
      return { key: `spark-${i}`, top, left, size, blur, opacity, duration, delay };
    });
    return arr;
  }, []);

  const safePlay = async () => {
    try {
      setAudioError(null);
      if (!audioRef.current) return;

      // Keep muted state consistent
      audioRef.current.muted = isMuted;
      audioRef.current.volume = 0.85;

      // Attempt playback
      await audioRef.current.play();
      setHasStarted(true);
    } catch (e: any) {
      // iOS will throw until there is a valid gesture; we'll keep listeners
      setAudioError('Audio blocked until tap/click (iPad/iOS policy). Tap once anywhere.');
    }
  };

  // Start audio on first user interaction (iOS safe)
  useEffect(() => {
    const onGesture = () => {
      // try to play; if it works we can remove listeners
      safePlay().finally(() => {
        // If it started, remove listeners. If not, keep them (user may need another tap).
        if (audioRef.current && !audioRef.current.paused) {
          window.removeEventListener('click', onGesture);
          window.removeEventListener('touchstart', onGesture);
          window.removeEventListener('pointerdown', onGesture);
        }
      });
    };

    window.addEventListener('click', onGesture, { passive: true });
    window.addEventListener('touchstart', onGesture, { passive: true });
    window.addEventListener('pointerdown', onGesture, { passive: true });

    return () => {
      window.removeEventListener('click', onGesture);
      window.removeEventListener('touchstart', onGesture);
      window.removeEventListener('pointerdown', onGesture);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMuted]);

  // Keep element muted in sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted((m) => !m);
    // If user unmutes and audio never started, try again (gesture still valid)
    if (!hasStarted) safePlay();
  };

  const manualStart = () => {
    // A visible button also counts as a user gesture
    safePlay();
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '28px 18px',
        background:
          'radial-gradient(circle at 50% 35%, rgba(85,120,255,0.22) 0%, rgba(10,12,22,1) 48%, rgba(0,0,0,1) 100%)',
        color: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* Ambient audio (must be initiated by user gesture on iOS) */}
      <audio ref={audioRef} loop preload="auto">
        <source src="/Audio/Ambient.mp3" type="audio/mpeg" />
      </audio>

      {/* Floating neural sparks */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {sparks.map((s) => (
          <span
            key={s.key}
            style={{
              position: 'absolute',
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              borderRadius: 999,
              background: 'rgba(170, 220, 255, 1)',
              filter: `blur(${s.blur}px)`,
              opacity: s.opacity,
              animation: `pulse ${s.duration}s ease-in-out ${s.delay}s infinite`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      {/* OUTER container */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          width: 'min(920px, 100%)',
          borderRadius: 28,
          padding: 18,
          background:
            'linear-gradient(145deg, rgba(120,160,255,0.20), rgba(130,255,220,0.08))',
          boxShadow: '0 0 90px rgba(120,160,255,0.28)',
        }}
      >
        {/* INNER container (flush, no overlap) */}
        <div
          style={{
            width: '100%',
            borderRadius: 22,
            padding: '28px 20px',
            background: 'rgba(6, 10, 18, 0.86)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
            textAlign: 'center',
          }}
        >
          {/* Top text (above brain, per your request) */}
          <div style={{ marginBottom: 18 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(28px, 4.2vw, 44px)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Bit Brains
            </h1>

            <p
              style={{
                margin: '12px auto 0',
                maxWidth: 760,
                lineHeight: 1.65,
                opacity: 0.9,
                fontSize: 'clamp(14px, 1.7vw, 16px)',
              }}
            >
              Proof of Care (PoC) is the genesis signal. Brains evolve through continuity, verification,
              and time—anchored by ENS identity and secured by zero-knowledge proof systems—until
              autonomous, intelligent technology emerges.
            </p>
          </div>

          {/* Brain ring stage */}
          <div
            style={{
              display: 'grid',
              placeItems: 'center',
              margin: '18px auto 18px',
            }}
          >
            {/* Outer ring */}
            <div
              style={{
                width: 'min(420px, 78vw)',
                aspectRatio: '1 / 1',
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                background:
                  'radial-gradient(circle at 50% 50%, rgba(120,160,255,0.25) 0%, rgba(120,160,255,0.08) 45%, rgba(0,0,0,0) 70%)',
                boxShadow: '0 0 80px rgba(140,180,255,0.28)',
                padding: 18,
              }}
            >
              {/* Inner ring (flush) */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  background:
                    'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.0) 0%, rgba(110,255,220,0.08) 52%, rgba(0,0,0,0) 78%)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
                }}
              >
                {/* The GIF */}
                <img
                  src="/brain-evolution.gif"
                  alt="Brain Evolution"
                  style={{
                    width: 'min(280px, 60vw)',
                    height: 'auto',
                    borderRadius: '50%',
                    boxShadow: '0 0 60px rgba(140,180,255,0.45)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: 12,
            }}
          >
            <button
              type="button"
              onClick={manualStart}
              style={{
                borderRadius: 999,
                padding: '10px 16px',
                border: '1px solid rgba(255,255,255,0.16)',
                background: 'rgba(120,160,255,0.18)',
                color: '#fff',
                fontWeight: 600,
                letterSpacing: '0.04em',
              }}
            >
              Tap to Start Ambience
            </button>

            <button
              type="button"
              onClick={toggleMute}
              style={{
                borderRadius: 999,
                padding: '10px 16px',
                border: '1px solid rgba(255,255,255,0.16)',
                background: 'rgba(110,255,220,0.12)',
                color: '#fff',
                fontWeight: 600,
                letterSpacing: '0.04em',
              }}
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>

          {/* iOS note */}
          <div style={{ marginTop: 12, opacity: 0.78, fontSize: 13 }}>
            {audioError ? (
              <span>{audioError}</span>
            ) : (
              <span>
                iPad/iOS requires a user tap to begin audio. If you don’t hear it, tap once on the page.
              </span>
            )}
          </div>
        </div>

        {/* Keyframes */}
        <style jsx global>{`
          @keyframes pulse {
            0% {
              transform: translate(-50%, -50%) scale(0.9);
              opacity: 0.08;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.15);
              opacity: 0.32;
            }
            100% {
              transform: translate(-50%, -50%) scale(0.9);
              opacity: 0.08;
            }
          }
        `}</style>
      </section>
    </main>
  );
}
