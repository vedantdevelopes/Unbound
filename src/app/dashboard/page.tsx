'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface Library {
  editId: string;
  name: string;
  ts: number;
  viewId?: string;
  bookCount?: number;
}

function SkeletonCard() {
  return (
    <div style={{
      border: '1px solid rgba(232,217,184,0.08)',
      borderRadius: '12px',
      padding: '2rem',
      background: 'rgba(232,217,184,0.02)',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ height: '12px', width: '60%', background: 'rgba(232,217,184,0.07)', borderRadius: '6px', marginBottom: '1rem' }} />
      <div style={{ height: '10px', width: '40%', background: 'rgba(232,217,184,0.04)', borderRadius: '6px', marginBottom: '2rem' }} />
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div style={{ flex: 1, height: '36px', background: 'rgba(232,217,184,0.05)', borderRadius: '6px' }} />
        <div style={{ flex: 1, height: '36px', background: 'rgba(232,217,184,0.05)', borderRadius: '6px' }} />
      </div>
    </div>
  );
}

function LibraryCard({ lib, index }: { lib: Library; index: number }) {
  const age = Math.floor((Date.now() - lib.ts) / (1000 * 60 * 60 * 24));
  const ageStr = age === 0 ? 'today' : age === 1 ? 'yesterday' : `${age}d ago`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        border: '1px solid rgba(232,217,184,0.1)',
        borderRadius: '12px',
        padding: '2rem',
        background: 'rgba(232,217,184,0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        transition: 'background 0.25s, border-color 0.25s, transform 0.25s',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      whileHover={{ backgroundColor: 'rgba(232,217,184,0.05)', borderColor: 'rgba(232,217,184,0.2)', y: -2 }}
    >
      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 0, left: '2rem', right: '2rem', height: '1px', background: 'linear-gradient(to right, transparent, rgba(200,144,42,0.4), transparent)' }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <h3 style={{
          fontFamily: 'var(--font-playfair)', fontWeight: 400,
          fontSize: '1.4rem', lineHeight: 1.15,
          color: '#e8d9b8', flex: 1, paddingRight: '1rem',
        }}>{lib.name}</h3>
        {lib.bookCount !== undefined && (
          <span style={{
            fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: '#c8902a',
            border: '1px solid rgba(200,144,42,0.3)', borderRadius: '20px',
            padding: '0.25rem 0.75rem', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {lib.bookCount} {lib.bookCount === 1 ? 'book' : 'books'}
          </span>
        )}
      </div>

      {/* Meta */}
      <p style={{
        fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.15em',
        textTransform: 'uppercase', color: 'rgba(232,217,184,0.3)',
        marginBottom: '2rem',
      }}>
        Created {ageStr} · {new Date(lib.ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
        <Link
          href={`/e/${lib.editId}`}
          style={{
            flex: 1, textAlign: 'center',
            fontFamily: 'var(--font-geist-mono)', fontSize: '11px', letterSpacing: '0.15em',
            textTransform: 'uppercase', textDecoration: 'none',
            padding: '0.7rem 1rem', borderRadius: '6px',
            background: 'rgba(200,144,42,0.12)', color: '#c8902a',
            border: '1px solid rgba(200,144,42,0.2)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,144,42,0.22)'; e.currentTarget.style.borderColor = 'rgba(200,144,42,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,144,42,0.12)'; e.currentTarget.style.borderColor = 'rgba(200,144,42,0.2)'; }}
        >
          Edit →
        </Link>
        {lib.viewId && (
          <Link
            href={`/v/${lib.viewId}`}
            style={{
              flex: 1, textAlign: 'center',
              fontFamily: 'var(--font-geist-mono)', fontSize: '11px', letterSpacing: '0.15em',
              textTransform: 'uppercase', textDecoration: 'none',
              padding: '0.7rem 1rem', borderRadius: '6px',
              background: 'transparent', color: 'rgba(232,217,184,0.5)',
              border: '1px solid rgba(232,217,184,0.12)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,217,184,0.06)'; e.currentTarget.style.borderColor = 'rgba(232,217,184,0.25)'; e.currentTarget.style.color = '#e8d9b8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(232,217,184,0.12)'; e.currentTarget.style.color = 'rgba(232,217,184,0.5)'; }}
          >
            View
          </Link>
        )}
      </div>
    </motion.div>
  );
}

export default function CreatorDashboard() {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored: Library[] = JSON.parse(localStorage.getItem('unbound-libraries') || '[]');
    if (stored.length === 0) { setLoading(false); return; }

    Promise.all(stored.map(async (lib) => {
      const { data } = await supabase
        .from('collections')
        .select('view_id, books(id)')
        .eq('edit_id', lib.editId)
        .single();
      return {
        ...lib,
        viewId:    data?.view_id,
        bookCount: data?.books?.length ?? 0,
      };
    })).then(enriched => {
      setLibraries(enriched);
      setLoading(false);
    });
  }, []);

  return (
    <main style={{ background: '#0c0a08', color: '#e8d9b8', minHeight: '100vh' }}>

      {/* Grain */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat', backgroundSize: '128px 128px', opacity: 0.6,
      }} />

      {/* Radial glow */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '40vh', background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(200,144,42,0.07) 0%, transparent 100%)', zIndex: 0, pointerEvents: 'none' }} />

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.4rem 3rem',
        background: 'rgba(12,10,8,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(232,217,184,0.06)',
      }}>
        <Link href="/" style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.5rem', fontStyle: 'italic', color: '#e8d9b8', textDecoration: 'none' }}>
          unbound
        </Link>
        <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.3)' }}>
          My Libraries
        </span>
        <Link href="/create" style={{
          fontFamily: 'var(--font-geist-mono)', fontSize: '11px', letterSpacing: '0.15em',
          textTransform: 'uppercase', color: '#0c0a08', background: '#c8902a',
          textDecoration: 'none', padding: '0.6rem 1.4rem', borderRadius: '6px',
          fontWeight: 700, transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#d4a040'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#c8902a'; }}
        >
          + New Library
        </Link>
      </nav>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '10rem 2rem 6rem' }}>

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ marginBottom: '4rem' }}
        >
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.35)', marginBottom: '1.5rem' }}>
            Creator Dashboard
          </div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontWeight: 400, fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 1, color: '#e8d9b8', marginBottom: '1rem' }}>
            Your<br /><em style={{ color: '#c8902a' }}>libraries.</em>
          </h1>
          <p style={{ fontFamily: 'var(--font-inter)', color: 'rgba(232,217,184,0.4)', fontSize: '0.95rem', maxWidth: '440px', lineHeight: 1.7 }}>
            Tracked in this browser. Keep your edit links — they&apos;re your only key back in.
          </p>
        </motion.div>

        {/* Library count stat */}
        {!loading && libraries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ display: 'flex', gap: '3rem', marginBottom: '3rem', paddingBottom: '2.5rem', borderBottom: '1px solid rgba(232,217,184,0.07)' }}
          >
            {[
              { v: libraries.length, l: 'Libraries' },
              { v: libraries.reduce((s, l) => s + (l.bookCount ?? 0), 0), l: 'Books total' },
            ].map(({ v, l }) => (
              <div key={l}>
                <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '2.5rem', color: '#c8902a', lineHeight: 1 }}>{v}</div>
                <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.35)', marginTop: '0.4rem' }}>{l}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* States */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
              </div>
            </motion.div>
          ) : libraries.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '8rem 2rem' }}
            >
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.5 }}>📚</div>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontWeight: 400, fontSize: '2rem', color: '#e8d9b8', marginBottom: '1rem' }}>
                No libraries yet.
              </h2>
              <p style={{ fontFamily: 'var(--font-inter)', color: 'rgba(232,217,184,0.4)', marginBottom: '2.5rem', fontSize: '0.95rem', lineHeight: 1.7 }}>
                Everything you create in this browser will appear here.<br />Start with your first library.
              </p>
              <Link href="/create" style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                background: '#c8902a', color: '#0c0a08',
                fontFamily: 'var(--font-geist-mono)', fontSize: '12px', letterSpacing: '0.15em',
                textTransform: 'uppercase', textDecoration: 'none',
                padding: '1rem 2.4rem', borderRadius: '8px', fontWeight: 700,
              }}>
                Create first library →
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}
            >
              {libraries.map((lib, i) => (
                <LibraryCard key={lib.editId} lib={lib} index={i} />
              ))}
              {/* Create new card */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: libraries.length * 0.07 + 0.1, duration: 0.6 }}
              >
                <Link href="/create" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                  <div style={{
                    border: '1px dashed rgba(232,217,184,0.15)',
                    borderRadius: '12px',
                    padding: '2rem',
                    minHeight: '160px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '1rem',
                    transition: 'all 0.25s',
                    cursor: 'pointer',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,144,42,0.4)'; e.currentTarget.style.background = 'rgba(200,144,42,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(232,217,184,0.15)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ fontSize: '2rem', opacity: 0.4 }}>+</div>
                    <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.35)' }}>
                      New Library
                    </span>
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </main>
  );
}
