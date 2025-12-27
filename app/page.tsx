'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function Page() {
  // ====== AUDIO (iPad-safe: must start on user gesture) ======
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioStarted, setAudioStarted] = useState(false);
  const [muted, setMuted] = useState(false);

  // IMPORTANT: your repo shows /public/Audio/Ambient.mp3 (capital A)
  const AUDIO_SRC = '/Audio/Ambient.mp3';

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.55;
    audio.muted = false;
    audioRef.current = audio;

    return () => {
      try {
        audio.pause();
        audio.src = '';
      } catch {}
    };
  }, []);

  const startAudio = async () => {
    if (!audioRef.current) return;
    try {
      audioRef.current.muted = muted;
      await audioRef.current.play();
      setAudioStarted(true);
    } catch {
      // iOS sometimes needs a second tap—this stays quiet by design.
    }
  };

  const toggleMute = async () => {
    setMuted((m) => {
      const next = !m;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });

    // If user taps mute before first play, try starting audio on that tap too.
    if (!audioStarted) {
      await startAudio();
    }
  };

  // ====== CONTENT (keeps things structured without bloating lines) ======
  const navItems = useMemo(
    () => [
      { href: '/', label: 'Home' },
      { href: '/proof-of-care', label: 'Proof of Care' },
      { href: '/eips', label: 'EIPs' },
    ],
    []
  );

  return (
    <main className="min-h-screen flex flex-col">
      {/* ===================== NAV (YOU SAID NAV MUST BE HERE) ===================== */}
      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight">
            Bit Brains
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="opacity-80 hover:opacity-100 transition-opacity"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* ===================== HERO ===================== */}
      <section className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* -------- LEFT: TEXT -------- */}
            <div className="text-left">
              <p className="text-sm opacity-70 tracking-wide">
                Proof of Care (PoC) — Protocol Standard
              </p>

              <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
                Care begins the lineage.
                <br />
                <span className="opacity-80">ENS anchors identity</span> and{' '}
                <span className="opacity-80">ZK preserves privacy</span>.
              </h1>

              <p className="mt-5 text-base md:text-lg opacity-80 leading-relaxed">
                Proof of Care is the entry rule. Each Brain binds to an ENS subdomain that resolves
                to a wallet you control for rewards. Zero-knowledge proofs track eligibility and
                continuity as the Brain evolves toward autonomous, intelligent technology.
              </p>

              {/* CTA Row */}
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/proof-of-care"
                  className="inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold border border-white/20 hover:border-white/40 transition-colors"
                >
                  Enter Proof of Care
                </Link>

                <Link
                  href="/eips"
                  className="inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold opacity-80 hover:opacity-100 transition-opacity"
                >
                  Read EIPs →
                </Link>
              </div>

              {/* Evolution points (kept compact but complete) */}
              <div className="mt-8 border border-white/10 rounded-xl p-5">
                <p className="text-sm opacity-70">Evolution Path</p>
                <ul className="mt-3 list-disc pl-5 text-sm opacity-85 leading-6">
                  <li>
                    <span className="font-semibold">Genesis Brain</span> — Proof of Care begins.
                  </li>
                  <li>
                    <span className="font-semibold">ENS Binding</span> — deterministic reward routing.
                  </li>
                  <li>
                    <span className="font-semibold">ZK Eligibility</span> — private verification and accrual.
                  </li>
                  <li>
                    <span className="font-semibold">Evolution</span> — continuity into autonomous intelligence.
                  </li>
                </ul>
              </div>
            </div>

            {/* -------- RIGHT: BRAIN + AUDIO -------- */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                {/* Make the whole card tappable to start audio (best for iPad) */}
                <button
                  type="button"
                  onClick={startAudio}
                  className="w-full rounded-2xl border border-white/10 p-6 text-left"
                  style={{ background: 'transparent' }}
                  aria-label="Start ambience"
                >
                  <div className="w-full flex items-center justify-center">
                    <img
                      src="/brain-10813_256.gif"
                      alt="Rotating Brain"
                      className="block mx-auto h-auto w-[260px] sm:w-[320px] md:w-[380px]"
                      draggable={false}
                    />
                  </div>

                  {/* Controls row (quiet + minimal) */}
                  <div className="mt-5 flex items-center justify-between">
                    <p className="text-xs opacity-60">
                      {audioStarted ? 'Ambience active' : 'Tap brain to start ambience'}
                    </p>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // don’t trigger the whole-card tap twice
                        toggleMute();
                      }}
                      className="text-xs opacity-80 hover:opacity-100 transition-opacity border border-white/15 rounded-md px-3 py-1"
                      aria-label={muted ? 'Unmute ambience' : 'Mute ambience'}
                    >
                      {muted ? 'Unmute' : 'Mute'}
                    </button>
                  </div>
                </button>

                {/* Small note for path correctness (kept minimal) */}
                <p className="mt-3 text-xs opacity-50 text-center">
                  Audio source: <span className="opacity-70">{AUDIO_SRC}</span>
                </p>
              </div>
            </div>
          </div>

          {/* ===================== SECONDARY STRIP (optional but useful) ===================== */}
          <div className="mt-12 border-t border-white/10 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-white/10 rounded-xl p-5">
                <p className="text-sm font-semibold">ENS First</p>
                <p className="mt-2 text-sm opacity-75 leading-6">
                  Rewards route through ENS resolution to a wallet you control — clear, verifiable, and canonical.
                </p>
              </div>
              <div className="border border-white/10 rounded-xl p-5">
                <p className="text-sm font-semibold">ZK Integrity</p>
                <p className="mt-2 text-sm opacity-75 leading-6">
                  Eligibility and continuity can be proven without exposing sensitive data — privacy with auditability.
                </p>
              </div>
              <div className="border border-white/10 rounded-xl p-5">
                <p className="text-sm font-semibold">Evolution</p>
                <p className="mt-2 text-sm opacity-75 leading-6">
                  The Brain progresses through phases into autonomous intelligence — on-chain lineage, provable transitions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs opacity-60 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Bit Brains</p>
          <p>PoC-first • ENS anchored • ZK secured</p>
        </div>
      </footer>
    </main>
  );
}
