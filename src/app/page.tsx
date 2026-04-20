'use client';

import Link from "next/link";
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="page-wrapper relative overflow-hidden">
      {/* Background illustration */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          opacity: 0.4,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
         <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 1.5, ease: "easeOut" }}
           style={{
             width: '800px',
             height: '800px',
             background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, rgba(220,229,240,0.2) 50%, rgba(255,255,255,0) 70%)',
             filter: 'blur(40px)'
           }}
         />
      </div>

      <motion.header 
        className="header z-[10] relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <Link href="/" className="logo font-serif-italic">unbound</Link>
        <Link href="/create" className="btn-secondary">
          CREATE A LIBRARY
        </Link>
      </motion.header>

      <div className="hero-main z-[10] relative">
        <motion.h1 
          className="hero-title font-heading"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          write stories <br/> for every moment
        </motion.h1>
        
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
           style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Link href="/create" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center' }}>
            CREATE A LIBRARY <span style={{ marginLeft: '10px' }}>&rarr;</span>
          </Link>
          <Link href="/bottles" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center' }}>
            BROWSE PUBLIC OCEAN 🌊
          </Link>
        </motion.div>
      </div>

      {/* Features Section */}
      <section style={{ padding: '8rem 2rem 6rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <h2 className="font-heading" style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '4rem', color: 'var(--text-primary)' }}>
          a sanctuary for your thoughts.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem' }}>
          
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <h3 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Time Capsules</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
              Write letters to the future. Lock your libraries with a precise countdown clock so they can only be opened when the time is right.
            </p>
          </div>

          <div>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒</div>
            <h3 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Absolute Privacy</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
              Your words are encrypted in the database. Add an optional 4-digit PIN lock to ensure only the intended recipient can read your books.
            </p>
          </div>

          <div>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📖</div>
            <h3 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Cinematic Atmosphere</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
              Curate the perfect reading environment with ambient soundscapes (crackling fires, rain), time-of-day lighting, and a real mechanical page-flip engine.
            </p>
          </div>

          <div>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🌊</div>
            <h3 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Message in a Bottle</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
              Not everything needs a destination. Cast anonymous libraries into our public ocean for strangers to find, read, and cherish.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '3rem', textAlign: 'center', position: 'relative', zIndex: 10, borderTop: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
          powered by unbound
        </div>
      </footer>

    </main>
  );
}
