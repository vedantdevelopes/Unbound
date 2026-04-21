'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';

export default function ShareButton({ viewId }: { viewId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/v/${viewId}` : `https://unbound-book.vercel.app/v/${viewId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

      {isOpen && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setIsOpen(false); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
            overflowY: 'auto',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: '6rem 2rem 3rem',
          }}
        >
          <div style={{ maxWidth: '420px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Ticket */}
            <div id="library-ticket" style={{
              background: '#f5edd8',
              borderRadius: '12px',
              position: 'relative',
              textAlign: 'center',
              overflow: 'hidden',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
            }}>
              {/* Top bar */}
              <div style={{ background: '#2a1a0a', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.5)' }}>
                  unbound
                </span>
                <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c8902a' }}>
                  ADMIT ONE
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: '2.5rem 2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', fontWeight: 400, color: '#2a1a0a', marginBottom: '0.4rem' }}>
                  Library Access
                </h2>
                <p style={{ fontFamily: 'var(--font-instrument)', fontStyle: 'italic', fontSize: '1rem', color: '#8a6a50', marginBottom: '2rem' }}>
                  Scan to open your private collection
                </p>

                <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', display: 'inline-block', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', marginBottom: '2rem' }}>
                  <QRCode value={shareLink} size={160} fgColor="#2a1a0a" level="H" />
                </div>

                {/* Dashed perforated line */}
                <div style={{ borderTop: '2px dashed rgba(150,120,80,0.3)', margin: '0 -2rem 1.5rem', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-12px', top: '-10px', width: '20px', height: '20px', borderRadius: '50%', background: '#0c0a08' }} />
                  <div style={{ position: 'absolute', right: '-12px', top: '-10px', width: '20px', height: '20px', borderRadius: '50%', background: '#0c0a08' }} />
                </div>

                <p style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '9px', letterSpacing: '0.25em', color: 'rgba(101,77,60,0.5)', textTransform: 'uppercase' }}>
                  POWERED BY UNBOUND
                </p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => window.print()}
                style={{
                  flex: 1, padding: '0.9rem',
                  background: '#c8902a', color: '#0c0a08', border: 'none', borderRadius: '8px',
                  fontFamily: 'var(--font-geist-mono)', fontSize: '11px', letterSpacing: '0.15em',
                  textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer',
                }}
              >
                🖨️ Print
              </button>
              <button
                onClick={handleCopy}
                style={{
                  flex: 1, padding: '0.9rem',
                  background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(232,217,184,0.08)',
                  color: copied ? '#10b981' : '#e8d9b8',
                  border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(232,217,184,0.2)'}`,
                  borderRadius: '8px',
                  fontFamily: 'var(--font-geist-mono)', fontSize: '11px', letterSpacing: '0.15em',
                  textTransform: 'uppercase', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {copied ? '✓ Copied!' : '🔗 Copy Link'}
              </button>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none', border: 'none', color: 'rgba(232,217,184,0.4)',
                fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.2em',
                textTransform: 'uppercase', cursor: 'pointer', alignSelf: 'center', padding: '0.5rem',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
