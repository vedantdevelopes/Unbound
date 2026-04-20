'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EnvelopeUnwrap({
  viewId,
  recipientName,
  senderName,
}: {
  viewId: string;
  recipientName: string;
  senderName: string;
}) {
  const [phase, setPhase] = useState<'check' | 'show' | 'opening' | 'done'>('check');

  useEffect(() => {
    const key = `unbound-opened-${viewId}`;
    if (!localStorage.getItem(key)) {
      setPhase('show');
    } else {
      setPhase('done');
    }
  }, [viewId]);

  const handleOpen = () => {
    setPhase('opening');
    setTimeout(() => {
      localStorage.setItem(`unbound-opened-${viewId}`, '1');
      setPhase('done');
    }, 1800);
  };

  if (phase === 'check' || phase === 'done') return null;

  return (
    <AnimatePresence>
      <motion.div
        key="envelope-overlay"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.9 } }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'radial-gradient(ellipse at 50% 60%, #1a1208 0%, #0a0705 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          cursor: phase === 'show' ? 'pointer' : 'default',
        }}
        onClick={phase === 'show' ? handleOpen : undefined}
      >
        {/* Stars */}
        {[...Array(30)].map((_, i) => (
          <motion.div key={i}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 4 }}
            style={{
              position: 'absolute',
              width: Math.random() * 2 + 1 + 'px', height: Math.random() * 2 + 1 + 'px',
              background: '#fff', borderRadius: '50%',
              top: Math.random() * 100 + '%', left: Math.random() * 100 + '%',
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Envelope */}
        <motion.div
          animate={phase === 'opening' ? { y: [0, -8, 4, 0], scale: [1, 1.02, 0.98, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <div style={{
            width: 'clamp(300px, 50vw, 420px)',
            position: 'relative',
            filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.8))',
          }}>
            {/* Envelope body */}
            <div style={{
              background: 'linear-gradient(160deg, #f5edd8 0%, #e8d9b8 100%)',
              borderRadius: '4px 4px 6px 6px',
              padding: 'clamp(2.5rem, 6vw, 4rem) clamp(2rem, 5vw, 3.5rem)',
              textAlign: 'center',
              position: 'relative',
              border: '1px solid rgba(180,150,100,0.3)',
            }}>
              {/* Interior V-lines (envelope pattern) */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '4px 4px 6px 6px',
                background: `
                  linear-gradient(135deg, transparent 49%, rgba(180,150,100,0.12) 49%, rgba(180,150,100,0.12) 51%, transparent 51%),
                  linear-gradient(225deg, transparent 49%, rgba(180,150,100,0.12) 49%, rgba(180,150,100,0.12) 51%, transparent 51%)
                `,
                pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  fontFamily: 'var(--font-ui)', fontSize: '9px', letterSpacing: '0.4em',
                  textTransform: 'uppercase', color: '#9a8060', marginBottom: '1rem',
                }}>
                  Personal · Private · For
                </div>
                <div style={{
                  fontFamily: 'var(--font-instrument)', fontSize: 'clamp(2rem, 4vw, 3rem)',
                  color: '#2a1a0a', lineHeight: 1.2, marginBottom: '1.5rem',
                }}>
                  {recipientName}
                </div>
                <div style={{ width: '50px', height: '1px', background: 'rgba(150,120,80,0.4)', margin: '0 auto 1.5rem' }} />
                <div style={{
                  fontFamily: 'var(--font-inter)', fontSize: '0.85rem', color: '#8a7060',
                  letterSpacing: '0.05em',
                }}>
                  from {senderName}
                </div>
              </div>
            </div>

            {/* Top flap (triangle) */}
            <motion.div
              animate={phase === 'opening' ? { scaleY: -1, y: -2 } : { scaleY: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%',
                height: '50%',
                clipPath: 'polygon(0 0, 100% 0, 50% 78%)',
                background: 'linear-gradient(180deg, #e6d4a8 0%, #d8c490 100%)',
                transformOrigin: 'top center',
                borderRadius: '4px 4px 0 0',
              }}
            />

            {/* Wax seal */}
            <motion.div
              animate={phase === 'opening' ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '52px', height: '52px',
                background: 'radial-gradient(circle at 35% 35%, #b83030 0%, #6b1010 100%)',
                borderRadius: '50%', zIndex: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontFamily: 'var(--font-instrument)', fontSize: '1.4rem', color: '#f0c8a0',
              }}
            >
              U
            </motion.div>
          </div>
        </motion.div>

        {/* CTA */}
        {phase === 'show' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{ marginTop: '3.5rem', textAlign: 'center' }}
          >
            <div style={{
              fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.4em',
              textTransform: 'uppercase', color: '#8a7050', marginBottom: '0.8rem',
            }}>
              You have a letter
            </div>
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.6rem', color: '#e8d9b8' }}
            >
              Click to open your library →
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
