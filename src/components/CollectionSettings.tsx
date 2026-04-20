'use client';

import { useState, useRef } from 'react';
import { updateCollectionSettings } from '@/app/actions';

interface Props {
  editId: string;
  currentDescription: string;
  currentUnlockAt: string | null;
  currentHasPin: boolean;
  currentBottleMode: boolean;
}

export default function CollectionSettings({
  editId,
  currentDescription,
  currentUnlockAt,
  currentHasPin,
  currentBottleMode,
}: Props) {
  const [open, setOpen] = useState(false);
  const [clearUnlock, setClearUnlock] = useState(false);
  const [clearPin, setClearPin] = useState(false);
  const [bottleMode, setBottleMode] = useState(currentBottleMode);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const boundAction = updateCollectionSettings.bind(null, editId);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);

  const currentUnlockFormatted = currentUnlockAt
    ? new Date(currentUnlockAt).toISOString().slice(0, 16)
    : '';

  const isUnlockActive = currentUnlockAt && new Date(currentUnlockAt) > new Date();

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    // Add bottle_mode from state (checkbox isn't in FormData when unchecked)
    formData.set('bottle_mode', String(bottleMode));
    if (clearUnlock) formData.set('clear_unlock', '1');
    if (clearPin) formData.set('clear_pin', '1');
    await boundAction(formData);
    setSaving(false);
  }

  return (
    <div style={{ marginBottom: '3rem' }}>
      {/* Toggle */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'none', border: '1px solid rgba(232,217,184,0.12)',
          borderRadius: '8px', cursor: 'pointer',
          padding: '0.7rem 1.4rem',
          fontFamily: 'var(--font-geist-mono)', fontSize: '11px',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'rgba(232,217,184,0.55)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,144,42,0.4)'; e.currentTarget.style.color = '#c8902a'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(232,217,184,0.12)'; e.currentTarget.style.color = 'rgba(232,217,184,0.55)'; }}
      >
        <span style={{ fontSize: '1rem' }}>⚙️</span>
        Library Settings
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.6 }}>{open ? '▲' : '▼'}</span>
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          marginTop: '1rem',
          background: 'rgba(232,217,184,0.02)',
          border: '1px solid rgba(232,217,184,0.1)',
          borderRadius: '12px',
          padding: '2rem',
          display: 'flex', flexDirection: 'column', gap: '2rem',
        }}>
          <form ref={formRef} action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Description */}
            <div>
              <label style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.4)', display: 'block', marginBottom: '0.6rem' }}>
                Description
              </label>
              <input
                type="text"
                name="description"
                defaultValue={currentDescription}
                maxLength={65}
                style={{
                  width: '100%', background: 'rgba(232,217,184,0.04)', border: '1px solid rgba(232,217,184,0.12)',
                  borderRadius: '6px', padding: '0.8rem 1rem',
                  fontFamily: 'var(--font-inter)', fontSize: '0.95rem', color: '#e8d9b8',
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(200,144,42,0.4)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(232,217,184,0.12)'; }}
              />
            </div>

            {/* Time Capsule */}
            <div>
              <label style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: isUnlockActive ? '#c8902a' : 'rgba(232,217,184,0.4)', display: 'block', marginBottom: '0.5rem' }}>
                ⏳ Time Capsule — Unlock Date
                {isUnlockActive && (
                  <span style={{ marginLeft: '0.75rem', fontFamily: 'var(--font-inter)', fontSize: '10px', letterSpacing: '0', textTransform: 'none', color: '#c8902a', opacity: 0.8 }}>
                    · currently active
                  </span>
                )}
              </label>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', color: 'rgba(232,217,184,0.3)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                Visitors see a countdown until this date. Leave empty to remove the lock.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="datetime-local"
                  name="unlock_at"
                  defaultValue={clearUnlock ? '' : currentUnlockFormatted}
                  min={minDate}
                  disabled={clearUnlock}
                  style={{
                    flex: 1, minWidth: '200px',
                    background: 'rgba(232,217,184,0.04)', border: '1px solid rgba(232,217,184,0.12)',
                    borderRadius: '6px', padding: '0.8rem 1rem',
                    fontFamily: 'var(--font-inter)', fontSize: '0.9rem', color: '#e8d9b8',
                    outline: 'none', opacity: clearUnlock ? 0.3 : 1,
                    colorScheme: 'dark',
                  }}
                />
                {currentUnlockAt && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(232,217,184,0.4)', textTransform: 'uppercase' }}>
                    <input type="checkbox" checked={clearUnlock} onChange={e => setClearUnlock(e.target.checked)} style={{ accentColor: '#c8902a' }} />
                    Remove lock
                  </label>
                )}
              </div>
            </div>

            {/* PIN */}
            <div>
              <label style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: currentHasPin ? '#c8902a' : 'rgba(232,217,184,0.4)', display: 'block', marginBottom: '0.5rem' }}>
                🔒 Access PIN
                {currentHasPin && (
                  <span style={{ marginLeft: '0.75rem', fontFamily: 'var(--font-inter)', fontSize: '10px', letterSpacing: '0', textTransform: 'none', color: '#c8902a', opacity: 0.8 }}>
                    · currently set
                  </span>
                )}
              </label>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', color: 'rgba(232,217,184,0.3)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                Enter a new 4-digit PIN to change it. Stored as a one-way hash.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  type="password"
                  name="access_pin"
                  placeholder={currentHasPin ? '••••  (enter new to change)' : '1234'}
                  maxLength={4}
                  pattern="[0-9]{4}"
                  inputMode="numeric"
                  disabled={clearPin}
                  style={{
                    maxWidth: '200px',
                    background: 'rgba(232,217,184,0.04)', border: '1px solid rgba(232,217,184,0.12)',
                    borderRadius: '6px', padding: '0.8rem 1rem',
                    fontFamily: 'var(--font-inter)', fontSize: '0.9rem', color: '#e8d9b8',
                    outline: 'none', opacity: clearPin ? 0.3 : 1,
                  }}
                />
                {currentHasPin && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(232,217,184,0.4)', textTransform: 'uppercase' }}>
                    <input type="checkbox" checked={clearPin} onChange={e => setClearPin(e.target.checked)} style={{ accentColor: '#c8902a' }} />
                    Remove PIN
                  </label>
                )}
              </div>
            </div>

            {/* Bottle Mode */}
            <div style={{ padding: '1rem 1.25rem', background: bottleMode ? 'rgba(200,144,42,0.06)' : 'rgba(232,217,184,0.02)', border: `1px solid ${bottleMode ? 'rgba(200,144,42,0.25)' : 'rgba(232,217,184,0.08)'}`, borderRadius: '8px', transition: 'all 0.2s' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={bottleMode} onChange={e => setBottleMode(e.target.checked)} style={{ marginTop: '3px', accentColor: '#c8902a', width: '16px', height: '16px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: bottleMode ? '#c8902a' : 'rgba(232,217,184,0.5)', marginBottom: '0.3rem' }}>
                    🌊 Public Ocean (Bottle Mode)
                  </div>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', color: 'rgba(232,217,184,0.35)', lineHeight: 1.5 }}>
                    Make this library visible in the public ocean feed. PIN lock is ignored in bottle mode.
                  </p>
                </div>
              </label>
            </div>

            {/* Save */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: saving ? 'rgba(200,144,42,0.5)' : '#c8902a',
                  color: '#0c0a08', border: 'none', borderRadius: '6px',
                  padding: '0.8rem 2rem',
                  fontFamily: 'var(--font-geist-mono)', fontSize: '11px', letterSpacing: '0.15em',
                  textTransform: 'uppercase', fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {saving ? 'Saving…' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
