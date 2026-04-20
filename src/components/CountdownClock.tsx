'use client';

import { useState, useEffect } from 'react';

export default function CountdownClock({
  unlockAt,
  recipientName,
  senderName,
  description,
}: {
  unlockAt: string;
  recipientName: string;
  senderName: string;
  description?: string;
}) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [unlocked, setUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const diff = new Date(unlockAt).getTime() - Date.now();
      if (diff <= 0) { setUnlocked(true); return; }
      setTime({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000)  / 60000),
        seconds: Math.floor((diff % 60000)    / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [unlockAt]);

  if (unlocked) {
    // Page will reload correctly since server will now pass the library
    if (typeof window !== 'undefined') window.location.reload();
    return null;
  }

  if (!mounted) {
    return (
      <main style={{ minHeight: '100vh', background: '#0d0a07', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#8a7050', fontFamily: 'var(--font-ui)', fontSize: '12px', letterSpacing: '0.2em' }}>LOADING…</div>
      </main>
    );
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 60%, #1a1208 0%, #07050200 100%), #0a0705',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      {/* Stars */}
      {[...Array(40)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: Math.random() * 2 + 1 + 'px', height: Math.random() * 2 + 1 + 'px',
          background: '#fff', borderRadius: '50%', opacity: 0.3 + Math.random() * 0.5,
          top: Math.random() * 100 + '%', left: Math.random() * 100 + '%',
        }} />
      ))}

      {/* Locked wax seal */}
      <div style={{
        width: '80px', height: '80px',
        background: 'radial-gradient(circle at 35% 35%, #b83030 0%, #6b1010 100%)',
        borderRadius: '50%', marginBottom: '2.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(107,16,16,0.5)',
        fontFamily: 'var(--font-instrument)', fontSize: '2rem', color: '#f0c8a0',
      }}>
        🔒
      </div>

      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.4em', color: '#6a5040', marginBottom: '1rem', textTransform: 'uppercase' }}>
        A library is waiting for you
      </div>

      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#e8d9b8', marginBottom: '0.5rem' }}>
        {recipientName}
      </h1>

      {description && (
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '1rem', color: '#8a7050', marginBottom: '3rem', maxWidth: '400px' }}>
          {description}
        </p>
      )}

      {/* Countdown */}
      <div style={{ display: 'flex', gap: 'clamp(1rem, 3vw, 3rem)', marginBottom: '3rem' }}>
        {[
          { v: time.days,    l: 'days' },
          { v: time.hours,   l: 'hours' },
          { v: time.minutes, l: 'min' },
          { v: time.seconds, l: 'sec' },
        ].map(({ v, l }) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-instrument)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              color: '#e8d9b8', lineHeight: 1,
              textShadow: '0 0 40px rgba(232,217,184,0.3)',
            }}>
              {String(v).padStart(2, '0')}
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '9px', letterSpacing: '0.3em', color: '#6a5040', marginTop: '0.4rem', textTransform: 'uppercase' }}>
              {l}
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.1rem', color: '#6a5040' }}>
        A gift from {senderName}
      </div>
    </main>
  );
}
