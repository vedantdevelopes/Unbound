'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'react-qr-code';

export default function ShareButton({ viewId }: { viewId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const shareLink = typeof window !== 'undefined'
    ? `${window.location.origin}/v/${viewId}`
    : `https://unbound-book.vercel.app/v/${viewId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const modal = isOpen && (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 99999,
      display: 'grid', placeItems: 'center',
      padding: '1.5rem',
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    }}
      onClick={e => { if (e.target === e.currentTarget) setIsOpen(false); }}
    >
      {/* Content box — grid centering never clips */}
      <div style={{
        width: '100%', maxWidth: '400px',
        display: 'flex', flexDirection: 'column', gap: '1rem',
      }}>

        {/* Ticket */}
        <div id="library-ticket" style={{
          background: '#f5edd8',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
        }}>
          {/* Header */}
          <div style={{
            background: '#1c1007',
            padding: '0.8rem 1.5rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.45)' }}>
              unbound
            </span>
            <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#c8902a' }}>
              ADMIT ONE
            </span>
          </div>

          {/* Body */}
          <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)', fontWeight: 400,
              fontSize: '1.8rem', color: '#2a1a0a', marginBottom: '0.3rem',
            }}>
              Library Access
            </h2>
            <p style={{
              fontFamily: 'var(--font-instrument)', fontStyle: 'italic',
              fontSize: '0.95rem', color: '#8a6a50', marginBottom: '1.5rem',
            }}>
              Scan to open the private collection
            </p>

            {/* QR */}
            <div style={{
              background: '#fff', padding: '14px', borderRadius: '8px',
              display: 'inline-block', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              marginBottom: '1.5rem',
            }}>
              <QRCode value={shareLink} size={140} fgColor="#1c1007" level="H" />
            </div>

            {/* Perforated divider */}
            <div style={{ position: 'relative', margin: '0 -1.5rem 1.2rem' }}>
              <div style={{ borderTop: '2px dashed rgba(140,110,70,0.25)' }} />
              <div style={{ position: 'absolute', left: -8, top: -9, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.85)' }} />
              <div style={{ position: 'absolute', right: -8, top: -9, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.85)' }} />
            </div>

            <p style={{
              fontFamily: 'var(--font-geist-mono)', fontSize: '8px',
              letterSpacing: '0.3em', color: 'rgba(101,77,60,0.4)',
              textTransform: 'uppercase',
            }}>
              POWERED BY UNBOUND
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => window.print()} style={{
            flex: 1, padding: '0.85rem',
            background: '#c8902a', color: '#0c0a08',
            border: 'none', borderRadius: '8px',
            fontFamily: 'var(--font-geist-mono)', fontSize: '11px',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            fontWeight: 700, cursor: 'pointer',
          }}>
            🖨️ Print
          </button>
          <button onClick={handleCopy} style={{
            flex: 1, padding: '0.85rem',
            background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(232,217,184,0.06)',
            color: copied ? '#10b981' : 'rgba(232,217,184,0.8)',
            border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'rgba(232,217,184,0.15)'}`,
            borderRadius: '8px',
            fontFamily: 'var(--font-geist-mono)', fontSize: '11px',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {copied ? '✓ Copied!' : '🔗 Copy Link'}
          </button>
        </div>

        {/* Close */}
        <button onClick={() => setIsOpen(false)} style={{
          background: 'none', border: 'none',
          color: 'rgba(232,217,184,0.35)',
          fontFamily: 'var(--font-geist-mono)', fontSize: '10px',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          cursor: 'pointer', alignSelf: 'center', padding: '0.5rem',
        }}>
          Close
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #library-ticket, #library-ticket * { visibility: visible; }
          #library-ticket {
            position: fixed; inset: 0;
            display: flex; flex-direction: column;
            justify-content: center; align-items: center;
            background: white !important;
            border: none !important; box-shadow: none !important;
          }
        }
      `}} />

      <button
        onClick={() => setIsOpen(true)}
        style={{
          fontFamily: 'var(--font-geist-mono)', fontSize: '11px', letterSpacing: '0.15em',
          textTransform: 'uppercase', color: '#0c0a08', background: '#c8902a',
          border: 'none', borderRadius: '6px', padding: '0.55rem 1.2rem',
          cursor: 'pointer', fontWeight: 700,
        }}
      >
        Get Ticket
      </button>

      {/* Render portal into document.body to escape all stacking contexts */}
      {mounted && createPortal(modal, document.body)}
    </>
  );
}
