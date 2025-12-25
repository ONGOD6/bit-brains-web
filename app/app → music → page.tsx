"use client";

import { useRef, useState } from "react";

const tracks = [
  {
    id: 1,
    title: "Digibeats Track 01",
    artist: "Digibeats Community",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: 2,
    title: "Digibeats Track 02",
    artist: "Digibeats Community",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: 3,
    title: "Digibeats Track 03",
    artist: "Digibeats Community",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];

export default function MusicPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);

  const playTrack = (trackId: number, url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play();
    setCurrentTrack(trackId);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1>Community Music — Digibeats</h1>

      <p style={{ opacity: 0.85, lineHeight: 1.6 }}>
        This music is curated from the Digibeats community on GetHype.
        <br />
        BitBrains does not mint or sell music NFTs and does not claim ownership
        of the featured works.
      </p>

      <a
        href="https://gethype.digital"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          marginBottom: "2rem",
          color: "#60a5fa",
          textDecoration: "underline",
        }}
      >
        Visit GetHype / Digibeats →
      </a>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tracks.map((track) => (
          <li
            key={track.id}
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              border: "1px solid #222",
              borderRadius: "6px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong>{track.title}</strong>
              <div style={{ fontSize: "0.9rem", opacity: 0.7 }}>
                {track.artist}
              </div>
            </div>

            <button
              onClick={() => playTrack(track.id, track.url)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor:
                  currentTrack === track.id ? "#22c55e" : "#1f2933",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {currentTrack === track.id ? "Playing" : "Play"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
