'use client';

import { useState, useRef, useEffect } from 'react';

const THEMES: Record<string, { src: string; label: string }> = {
  wood:   { src: 'https://www.soundjay.com/nature/sounds/fire-crackling-1.mp3', label: '🔥 Fireplace' },
  marble: { src: 'https://www.soundjay.com/nature/sounds/rain-01.mp3',          label: '🌧️ Rain' },
  cafe:   { src: 'https://cdn.pixabay.com/audio/2022/10/30/audio_347d41f4d2.mp3', label: '☕ Café' },
};

export default function AmbientSound({ theme }: { theme: string }) {
  const [playing, setPlaying] = useState(false);
  const [fading, setFading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { src, label } = THEMES[theme] ?? THEMES.wood;

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.loop = true;
    audioRef.current.volume = 0;
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!playing) {
      audio.play().catch(() => {});
      setPlaying(true);
      setFading(false);
      // Fade in
      let vol = 0;
      const fadeIn = setInterval(() => {
        vol = Math.min(vol + 0.03, 0.35);
        if (audio) audio.volume = vol;
        if (vol >= 0.35) clearInterval(fadeIn);
      }, 80);
    } else {
      // Fade out then pause
      setFading(true);
      let vol = audio.volume;
      const fadeOut = setInterval(() => {
        vol = Math.max(vol - 0.03, 0);
        if (audio) audio.volume = vol;
        if (vol <= 0) {
          clearInterval(fadeOut);
          audio?.pause();
          setPlaying(false);
          setFading(false);
        }
      }, 80);
    }
  };

  return (
    <>
      <audio ref={audioRef} src={src} preload="none" />
      <button
        onClick={toggle}
        title={playing ? `Stop ${label}` : `Play ${label}`}
        style={{
          background: playing ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '20px',
          padding: '0.3rem 0.9rem',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
          fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.08em',
          color: playing ? '#e8d9b8' : '#8a8070',
          transition: 'all 0.25s ease',
          opacity: fading ? 0.6 : 1,
        }}
      >
        <span style={{ fontSize: '14px' }}>{playing ? '🔊' : '🔇'}</span>
        {playing ? 'Ambience on' : 'Play ambience'}
      </button>
    </>
  );
}
