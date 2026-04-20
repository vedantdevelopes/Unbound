'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [chars, setChars] = useState('404');

  useEffect(() => {
    const glyphs = '!@#$%^&*01';
    let iteration = 0;
    const original = '404';
    const interval = setInterval(() => {
      setChars(
        original.split('').map((_, i) =>
          i < iteration ? original[i] : glyphs[Math.floor(Math.random() * glyphs.length)]
        ).join('')
      );
      if (iteration >= original.length) clearInterval(interval);
      iteration += 0.4;
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <main style={{ background: '#0c0a08', color: '#e8d9b8', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>

      {/* Grain */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '128px 128px', opacity: 0.6 }} />

      {/* Radial */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(200,144,42,0.06), transparent 70%)' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Big glitchy number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontFamily: 'var(--font-playfair)', fontWeight: 400, fontSize: 'clamp(8rem, 22vw, 18rem)', lineHeight: 1, color: 'rgba(232,217,184,0.06)', letterSpacing: '-0.05em', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', userSelect: 'none', pointerEvents: 'none', zIndex: 0 }}
        >
          {chars}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.3)', marginBottom: '2rem' }}>
            error · {chars}
          </div>

          <h1 style={{ fontFamily: 'var(--font-playfair)', fontWeight: 400, fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: '#e8d9b8', lineHeight: 1.05, marginBottom: '1.5rem' }}>
            This page<br /><em style={{ color: '#c8902a' }}>doesn't exist.</em>
          </h1>

          <p style={{ fontFamily: 'var(--font-inter)', color: 'rgba(232,217,184,0.4)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '380px', margin: '0 auto 3rem' }}>
            The library you're looking for may have been removed, or the link is wrong.
            If you were given a private link, double-check it with the sender.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: '#c8902a', color: '#0c0a08',
              fontFamily: 'var(--font-geist-mono)', fontSize: '12px', letterSpacing: '0.15em',
              textTransform: 'uppercase', textDecoration: 'none',
              padding: '1rem 2.2rem', borderRadius: '8px', fontWeight: 700,
              transition: 'all 0.25s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#d4a040'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#c8902a'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              ← Go home
            </Link>
            <Link href="/dashboard" style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'transparent', color: '#e8d9b8',
              fontFamily: 'var(--font-geist-mono)', fontSize: '12px', letterSpacing: '0.15em',
              textTransform: 'uppercase', textDecoration: 'none',
              padding: '1rem 2.2rem', borderRadius: '8px', fontWeight: 500,
              border: '1px solid rgba(232,217,184,0.2)', transition: 'all 0.25s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,217,184,0.5)'; e.currentTarget.style.background = 'rgba(232,217,184,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(232,217,184,0.2)'; e.currentTarget.style.background = 'transparent'; }}
            >
              My libraries
            </Link>
          </div>
        </motion.div>
      </div>

    </main>
  );
}
