"use client";

import { useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [soundStarted, setSoundStarted] = useState(false);

  const startSound = () => {
    setSoundStarted(true);
    const audio = document.getElementById("ambient-audio") as HTMLAudioElement;
    if (audio) {
      audio.volume = 0.4;
      audio.play().catch(() => {});
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#020617] via-[#020617] to-[#030712] text-white px-6">
      
      {/* AUDIO */}
      <audio
        id="ambient-audio"
        src="/audio/ambient.mp3"
        loop
        preload="auto"
      />

      {/* HERO TEXT */}
      <h1 className="text-4xl md:text-5xl font-semibold text-center mb-4">
        Proof of Care comes first.
      </h1>

      <p className="text-center text-gray-300 max-w-xl mb-6">
        Bit Brains is a protocol for NFT + ENS-based identity,
        zk-verified eligibility, and autonomous intelligence —
        beginning on Ethereum.
      </p>

      {/* CTA */}
      <div className="flex gap-4 mb-10">
        <Link href="/proof-of-care" className="text-blue-400 hover:underline">
          Enter Proof of Care
        </Link>

        <button
          onClick={startSound}
          className="px-4 py-2 rounded-full border border-gray-500 hover:border-gray-300 transition"
        >
          Begin Sound
        </button>
      </div>

      {/* BRAIN CIRCLE */}
      <div
        onClick={startSound}
        className="relative w-[280px] h-[280px] md:w-[360px] md:h-[360px] rounded-full flex items-center justify-center cursor-pointer"
      >
        {/* GLOW */}
        <div className="absolute inset-0 rounded-full blur-2xl bg-blue-500/30" />

        {/* IMAGE */}
        <img
          src="/images/brain.png"
          alt="Bit Brain"
          className="relative w-full h-full rounded-full object-cover"
          draggable={false}
        />
      </div>

      {/* iPad NOTE */}
      <p className="text-xs text-gray-500 mt-6 text-center">
        iPad note: sound starts only after a tap. Tap the brain or press “Begin Sound”.
      </p>
    </main>
  );
}
