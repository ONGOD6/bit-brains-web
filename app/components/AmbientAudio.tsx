"use client";

import { useEffect, useRef, useState } from "react";

interface AmbientAudioProps {
  src: string;
  volume?: number;
  loop?: boolean;
}

export default function AmbientAudio({
  src,
  volume = 0.35,
  loop = true,
}: AmbientAudioProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (audioRef.current) return;

    const a = document.createElement("audio");
    a.src = src;
    a.loop = loop;
    a.preload = "auto";

    // ✅ iOS Safari inline playback (TypeScript-safe)
    (a as any).playsInline = true;

    a.volume = volume;
    audioRef.current = a;

    const unlockAudio = () => {
      if (!audioRef.current) return;

      audioRef.current
        .play()
        .then(() => {
          setUnlocked(true);
          document.removeEventListener("click", unlockAudio);
          document.removeEventListener("touchstart", unlockAudio);
        })
        .catch(() => {
          // iOS may silently fail until interaction is valid
        });
    };

    // First interaction unlock (iOS / mobile compliant)
    document.addEventListener("click", unlockAudio, { once: true });
    document.addEventListener("touchstart", unlockAudio, { once: true });

    return () => {
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [src, volume, loop]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        zIndex: 50,
        fontSize: "0.75rem",
        opacity: unlocked ? 0.6 : 0.85,
        pointerEvents: "none",
      }}
    >
      {unlocked
        ? "◉ Proof of Care — signal active"
        : "◯ Tap to initiate Proof of Care"}
    </div>
  );
}
