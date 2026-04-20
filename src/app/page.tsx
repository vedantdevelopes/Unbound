'use client';

import Link from "next/link";
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const features = [
  {
    icon: '⏳',
    title: 'Time Capsules',
    desc: 'Lock your library until an exact date. Viewers see a live countdown — the library reveals itself when the moment arrives.',
    color: '#c8902a',
  },
  {
    icon: '🔒',
    title: 'PIN Protected',
    desc: 'Add a 4-digit code. Every word is AES-256 encrypted at rest. Only the person with the code can open it.',
    color: '#5a7a9e',
  },
  {
    icon: '📖',
    title: 'Real Book Feel',
    desc: 'Mechanical page-flip physics. Ambient soundscapes. Time-of-day lighting. It reads like a physical object.',
    color: '#7a9e5a',
  },
  {
    icon: '💌',
    title: 'They Can Write Back',
    desc: 'After finishing a book, the recipient can leave one reply — a postcard, returned. You\'ll see it in your editor.',
    color: '#9e5a7a',
  },
  {
    icon: '🌊',
    title: 'Public Ocean',
    desc: 'Float anonymous libraries into a public feed. Strangers drift in, read, drift out. Like PostSecret, but a whole book.',
    color: '#5a9e8a',
  },
  {
    icon: '🎁',
    title: 'Gift Unwrapping',
    desc: 'Share a gift link instead of the plain URL. Recipients tap to lift a bow, pull a ribbon, and watch the library emerge.',
    color: '#9e7a5a',
  },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <main style={{ background: '#0c0a08', color: '#e8d9b8', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Grain overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat', backgroundSize: '128px 128px', opacity: 0.6,
      }} />

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.5rem 3rem',
          background: 'linear-gradient(to bottom, rgba(12,10,8,0.9) 0%, transparent 100%)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Link href="/" style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.6rem', fontStyle: 'italic', color: '#e8d9b8', textDecoration: 'none', letterSpacing: '-0.01em' }}>
          unbound
        </Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/bottles" style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.5)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e8d9b8')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(232,217,184,0.5)')}
          >
            Public Ocean
          </Link>
          <Link href="/dashboard" style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.5)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e8d9b8')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(232,217,184,0.5)')}
          >
            Dashboard
          </Link>
          <Link href="/create" style={{
            fontFamily: 'var(--font-geist-mono)', fontSize: '11px', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: '#0c0a08', background: '#e8d9b8',
            textDecoration: 'none', padding: '0.6rem 1.4rem', borderRadius: '6px',
            fontWeight: 600, transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#e8d9b8'; }}
          >
            Create →
          </Link>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <div ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 2rem', textAlign: 'center', overflow: 'hidden' }}>

        {/* Radial glow */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 60% at 50% 60%, rgba(200,144,42,0.12) 0%, transparent 70%)',
        }} />

        {/* Horizontal rule line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'absolute', top: '50%', left: '5%', right: '5%', height: '1px', background: 'rgba(232,217,184,0.07)', zIndex: 0 }}
        />

        <motion.div style={{ y: heroY, opacity: heroOpacity, position: 'relative', zIndex: 1 }}>

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.45)', marginBottom: '2.5rem' }}
          >
            A digital bookshelf for the things that matter
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: 'var(--font-playfair)', fontWeight: 400,
              fontSize: 'clamp(4rem, 10vw, 9rem)',
              lineHeight: 0.95, letterSpacing: '-0.02em',
              color: '#e8d9b8', marginBottom: '3rem',
            }}
          >
            write stories<br />
            <em style={{ fontStyle: 'italic', color: '#c8902a' }}>for every</em><br />
            moment
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.9 }}
            style={{ fontFamily: 'var(--font-inter)', fontSize: '1.1rem', color: 'rgba(232,217,184,0.55)', maxWidth: '480px', margin: '0 auto 4rem', lineHeight: 1.7 }}
          >
            Build encrypted personal libraries. Gift them with one link.
            Your words, exactly as you wrote them — private forever or shared with the world.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link href="/create" style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: '#c8902a', color: '#0c0a08',
              fontFamily: 'var(--font-geist-mono)', fontSize: '12px', letterSpacing: '0.15em',
              textTransform: 'uppercase', textDecoration: 'none',
              padding: '1.1rem 2.4rem', borderRadius: '8px', fontWeight: 700,
              transition: 'all 0.25s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#d4a040'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(200,144,42,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#c8902a'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              Begin writing →
            </Link>
            <Link href="/bottles" style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'transparent', color: '#e8d9b8',
              fontFamily: 'var(--font-geist-mono)', fontSize: '12px', letterSpacing: '0.15em',
              textTransform: 'uppercase', textDecoration: 'none',
              padding: '1.1rem 2.4rem', borderRadius: '8px', fontWeight: 500,
              border: '1px solid rgba(232,217,184,0.2)', transition: 'all 0.25s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,217,184,0.5)'; e.currentTarget.style.background = 'rgba(232,217,184,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(232,217,184,0.2)'; e.currentTarget.style.background = 'transparent'; }}
            >
              🌊 Public ocean
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll nudge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1 }}
        >
          <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.3)' }}>scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, rgba(232,217,184,0.3), transparent)' }}
          />
        </motion.div>
      </div>

      {/* ── Marquee divider ── */}
      <div style={{ overflow: 'hidden', borderTop: '1px solid rgba(232,217,184,0.08)', borderBottom: '1px solid rgba(232,217,184,0.08)', padding: '1.2rem 0', position: 'relative', zIndex: 1 }}>
        <motion.div
          animate={{ x: [0, -800] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
          style={{ display: 'flex', gap: '4rem', whiteSpace: 'nowrap', width: 'max-content' }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} style={{ fontFamily: 'var(--font-instrument)', fontStyle: 'italic', fontSize: '1.1rem', color: 'rgba(232,217,184,0.2)', letterSpacing: '0.05em' }}>
              encrypted · private · encrypted · timeless · encrypted · yours ·
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── Features ── */}
      <section style={{ padding: '10rem 2rem', maxWidth: '1300px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '5rem', flexWrap: 'wrap', gap: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontWeight: 400, fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.05, color: '#e8d9b8' }}>
            Built for<br />
            <em style={{ color: '#c8902a' }}>real emotion.</em>
          </h2>
          <p style={{ fontFamily: 'var(--font-inter)', color: 'rgba(232,217,184,0.45)', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: '380px' }}>
            Every feature exists to deepen the connection between writer and reader.
            Nothing superfluous. Everything intentional.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5px', border: '1px solid rgba(232,217,184,0.08)', overflow: 'hidden', borderRadius: '16px' }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: (i % 3) * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{
                padding: '2.5rem',
                background: 'rgba(232,217,184,0.02)',
                borderRight: '1px solid rgba(232,217,184,0.07)',
                borderBottom: '1px solid rgba(232,217,184,0.07)',
                transition: 'background 0.3s',
                cursor: 'default',
              }}
              whileHover={{ backgroundColor: 'rgba(232,217,184,0.04)' }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontWeight: 400, fontSize: '1.5rem', color: '#e8d9b8', marginBottom: '0.75rem' }}>{f.title}</h3>
              <p style={{ fontFamily: 'var(--font-inter)', color: 'rgba(232,217,184,0.5)', fontSize: '0.9rem', lineHeight: 1.75 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{
        padding: '12rem 2rem',
        textAlign: 'center',
        position: 'relative', zIndex: 1,
        background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(200,144,42,0.1) 0%, transparent 70%)',
        borderTop: '1px solid rgba(232,217,184,0.06)',
      }}>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontFamily: 'var(--font-playfair)', fontWeight: 400, fontSize: 'clamp(3rem, 7vw, 6rem)', color: '#e8d9b8', lineHeight: 1, marginBottom: '2.5rem' }}
        >
          someone is waiting<br />
          <em style={{ color: '#c8902a' }}>to read your words.</em>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{ color: 'rgba(232,217,184,0.45)', fontFamily: 'var(--font-inter)', fontSize: '1rem', marginBottom: '3rem' }}
        >
          Create a library in under two minutes. Free, forever.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          <Link href="/create" style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            background: '#c8902a', color: '#0c0a08',
            fontFamily: 'var(--font-geist-mono)', fontSize: '13px', letterSpacing: '0.15em',
            textTransform: 'uppercase', textDecoration: 'none',
            padding: '1.3rem 3rem', borderRadius: '8px', fontWeight: 700,
            transition: 'all 0.25s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#d4a040'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(200,144,42,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#c8902a'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Start writing →
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '3rem', textAlign: 'center', borderTop: '1px solid rgba(232,217,184,0.06)', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', maxWidth: '1300px', margin: '0 auto' }}>
          <span style={{ fontFamily: 'var(--font-instrument)', fontStyle: 'italic', fontSize: '1.3rem', color: 'rgba(232,217,184,0.4)' }}>unbound</span>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <Link href="/create" style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.3)', textDecoration: 'none' }}>Create</Link>
            <Link href="/bottles" style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.3)', textDecoration: 'none' }}>Ocean</Link>
            <Link href="/dashboard" style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.3)', textDecoration: 'none' }}>Dashboard</Link>
          </div>
          <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(232,217,184,0.2)', textTransform: 'uppercase' }}>encrypted · private · yours</span>
        </div>
      </footer>

    </main>
  );
}
