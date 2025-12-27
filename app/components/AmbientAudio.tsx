"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  src?: string;          // e.g. "/music/ambient.mp3"
  volume?: number;       // 0.0 - 1.0
  loop?: boolean;
};

function isIOSLike(): boolean {
  if (typeof navigator === "undefined" || typeof window === "undefined") return false;

  const ua = navigator.userAgent || "";
  const platform = (navigator as any).platform || "";
  const maxTouchPoints = (navigator as any).maxTouchPoints || 0;

  // iPhone/iPad/iPod (classic UA)
  const iOSUA = /iPad|iPhone|iPod/.test(ua);

  // iPadOS 13+ can report as "MacIntel" but has touch points
  const iPadOS = platform === "MacIntel" && maxTouchPoints > 1;

  return iOSUA || iPadOS;
}

export default function AmbientAudio({
  src = "/music/ambient.mp3",
  volume = 0.35,
  loop = true,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  const isiOS = useMemo(() => isIOSLike(), []);

  // Create audio element once
  useEffect(() => {
    const a = new Audio(src);
    a.loop = loop;
    a.preload = "auto";
    a.playsInline = true; // important for iOS Safari
    a.volume = volume;

    audioRef.current = a;
    setReady(true);

    return () => {
      try {
        a.pause();
        // Release
        audioRef.current = null;
      } catch {}
    };
  }, [src, loop, volume]);

  async function startAudio() {
    const a = audioRef.current;
    if (!a) return;

    try {
      // Ensure volume is correct (in case you later fade)
      a.volume = volume;

      const p = a.play();
      if (p && typeof (p as Promise<void>).then === "function") {
        await p;
      }

      setPlaying(true);
      // console.log("[audio] started");
    } catch (err) {
      // This is where iOS will throw NotAllowedError if not a user gesture
      console.log("[audio] play blocked:", err);
      setPlaying(false);
    }
  }

  // Desktop: try autoplay once (will still be blocked in some browsers)
  useEffect(() => {
    if (!ready) return;
    if (isiOS) return; // iOS: NEVER attempt autoplay
    // attempt autoplay on desktop
    startAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, isiOS]);

  // Universal fallback: start on first user gesture (works for iPad)
  useEffect(() => {
    if (!ready) return;
    if (playing) return;

    const handler = () => {
      startAudio();
    };

    // pointerdown covers mouse + touch on modern browsers
    window.addEventListener("pointerdown", handler, { passive: true });
    // extra iOS safety
    window.addEventListener("touchstart", handler, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("touchstart", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, playing]);

  // Optional: simple mute toggle UI (can remove if you want)
  return (
    <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 50 }}>
      <button
        onClick={() => {
          const a = audioRef.current;
          if (!a) return;

          if (playing) {
            a.pause();
            setPlaying(false);
          } else {
            startAudio();
          }
        }}
        style={{
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.25)",
          background: "rgba(0,0,0,0.45)",
          color: "white",
          fontSize: 14,
        }}
      >
        {playing ? "Sound: On" : "Tap for Sound"}
      </button>
    </div>
  );
}
