'use client';

import { useState, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GiftBoxLanding({ params }: { params: Promise<{ viewId: string }> | { viewId: string } }) {
  const unwrappedParams = params instanceof Promise ? use(params) : params;
  const viewId = unwrappedParams.viewId;
  const [phase, setPhase] = useState<'idle' | 'unwrapping' | 'done'>('idle');

  const unwrap = () => {
    setPhase('unwrapping');
    setTimeout(() => {
      window.location.href = `/v/${viewId}`;
    }, 2200);
  };


  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <div style={{
          minHeight: '100vh',
          background: 'radial-gradient(ellipse at 50% 60%, #1a0d08 0%, #080503 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', overflow: 'hidden', position: 'relative',
        }} onClick={unwrap}>

          {/* Confetti-like particles on unwrap */}
          {phase === 'unwrapping' && [...Array(20)].map((_, i) => (
            <motion.div key={i}
              initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
              animate={{ y: -400 - Math.random() * 400, x: (Math.random() - 0.5) * 600, opacity: 0, scale: 0.3, rotate: Math.random() * 720 }}
              transition={{ duration: 1.5 + Math.random() * 0.5 }}
              style={{
                position: 'absolute', width: '12px', height: '12px',
                borderRadius: '2px',
                background: ['#c8902a', '#e8d9b8', '#8b2020', '#d4af37'][i % 4],
              }}
            />
          ))}

          {/* Gift Box */}
          <motion.div
            animate={phase === 'unwrapping' ? { scale: [1, 1.1, 0.8, 1.2, 0], opacity: [1, 1, 1, 1, 0] } : { scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            style={{ textAlign: 'center' }}
          >
            {/* Box */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {/* Ribbon vertical */}
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '24px', transform: 'translateX(-50%)', background: '#8b2020', zIndex: 2, borderRadius: '2px' }} />
              {/* Ribbon horizontal */}
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '24px', transform: 'translateY(-50%)', background: '#8b2020', zIndex: 2, borderRadius: '2px' }} />
              {/* Bow top-left */}
              <div style={{ position: 'absolute', top: '-30px', left: '30px', width: '60px', height: '40px', border: '8px solid #8b2020', borderRadius: '50% 50% 0 0', zIndex: 3, transform: 'rotate(-20deg)' }} />
              {/* Bow top-right */}
              <div style={{ position: 'absolute', top: '-30px', right: '30px', width: '60px', height: '40px', border: '8px solid #8b2020', borderRadius: '50% 50% 0 0', zIndex: 3, transform: 'rotate(20deg)' }} />

              {/* Box body */}
              <div style={{
                width: '200px', height: '180px',
                background: 'linear-gradient(160deg, #2a1a0a 0%, #1a0d05 100%)',
                border: '2px solid rgba(200,160,80,0.3)',
                borderRadius: '4px',
                boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
                position: 'relative', zIndex: 1,
              }} />

              {/* Lid */}
              <motion.div
                animate={phase === 'unwrapping' ? { y: -120, rotate: -15, opacity: 0 } : { y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                  position: 'absolute', top: '-30px', left: '-10px',
                  width: '220px', height: '50px',
                  background: 'linear-gradient(160deg, #3a2a12 0%, #2a1a08 100%)',
                  border: '2px solid rgba(200,160,80,0.4)',
                  borderRadius: '4px',
                  zIndex: 4,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
                }}
              />
            </div>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ marginTop: '3rem', textAlign: 'center' }}
            >
              <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.5rem', color: '#e8d9b8', marginBottom: '0.5rem' }}>
                Click to unwrap your gift
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.3em', color: '#6a5040', textTransform: 'uppercase' }}>
                A library, just for you
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
