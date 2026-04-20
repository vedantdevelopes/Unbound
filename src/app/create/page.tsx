'use client';

import { createCollection } from '../actions';
import Link from 'next/link';
import { useState } from 'react';

export default function CreateBook() {
  const [desc, setDesc] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [bottleMode, setBottleMode] = useState(false);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);

  return (
    <main className="page-wrapper relative">
      <header className="header">
        <Link href="/dashboard" className="font-mono" style={{ fontSize: '11px', textDecoration: 'none', color: 'var(--text-secondary)' }}>← MY LIBRARIES</Link>
        <Link href="/" className="logo font-serif-italic">unbound</Link>
        <div style={{ width: '120px' }} />
      </header>

      <div className="form-container">
        <h1 className="form-header font-heading">new library</h1>

        <form action={createCollection} className="flex flex-col">

          <input type="hidden" name="bottle_mode" value={bottleMode.toString()} />

          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="recipient_name">To:</label>
              <input type="text" id="recipient_name" name="recipient_name" placeholder="recipient's name" required value={bottleMode ? 'The World' : undefined} readOnly={bottleMode} style={{ opacity: bottleMode ? 0.6 : 1 }} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="sender_name">From:</label>
              <input type="text" id="sender_name" name="sender_name" placeholder="your name (or leave a pseudonym)" required />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="label" htmlFor="description">Description</label>
              <span className="label" style={{ color: desc.length === 65 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{desc.length}/65</span>
            </div>
            <input
              type="text" id="description" name="description"
              placeholder="e.g., for all the times I can't be there"
              maxLength={65} value={desc} onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          {/* Theme Selection */}
          <div style={{ margin: '2rem 0 1rem' }}>
            <label className="label" style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>READER ENVIRONMENT</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {[
                { value: 'wood',   label: 'Mahogany', bg: '#3d2b1f', color: '#fff',    pattern: 'wood-pattern.png' },
                { value: 'marble', label: 'Marble',   bg: '#e2dfd8', color: '#2a2626', pattern: 'white-marble.png' },
                { value: 'cafe',   label: 'Dark Café', bg: '#2b2725', color: '#fff',   pattern: 'dark-matter.png' },
              ].map(({ value, label, bg, color, pattern }) => (
                <label key={value} style={{ flex: 1, position: 'relative', cursor: 'pointer', minWidth: '120px' }}>
                  <input type="radio" name="theme" value={value} defaultChecked={value === 'wood'} style={{ position: 'absolute', opacity: 0 }} />
                  <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: bg, color, borderRadius: '8px', border: '2px solid transparent', backgroundImage: `url("https://www.transparenttextures.com/patterns/${pattern}")`, transition: 'all 0.2s' }}>
                    <span className="font-mono">{label}</span>
                  </div>
                </label>
              ))}
            </div>
            <style dangerouslySetInnerHTML={{__html: `input[type="radio"]:checked + div { border-color: var(--accent) !important; transform: scale(1.05); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }`}} />
          </div>

          {/* Advanced Options */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.2em', textAlign: 'left', padding: '0.5rem 0', marginBottom: '0.5rem' }}
          >
            {showAdvanced ? '▲' : '▼'} ADVANCED OPTIONS
          </button>

          {showAdvanced && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '1rem' }}>

              {/* Time Capsule */}
              <div>
                <label className="label" htmlFor="unlock_at" style={{ color: 'var(--accent)' }}>⏳ TIME CAPSULE — Unlock On (optional)</label>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  Library stays locked until this date. Visitors see a live countdown clock.
                </p>
                <input type="datetime-local" id="unlock_at" name="unlock_at" min={minDate} style={{ width: '100%' }} />
              </div>

              {/* Access PIN */}
              <div>
                <label className="label" htmlFor="access_pin" style={{ color: 'var(--accent)' }}>🔒 ACCESS PIN (optional, 4 digits)</label>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  Visitors must enter this PIN before reading. Stored as a one-way hash — not recoverable.
                </p>
                <input type="password" id="access_pin" name="access_pin" placeholder="e.g., 1234" maxLength={4} pattern="[0-9]{4}" inputMode="numeric" style={{ maxWidth: '150px' }} disabled={bottleMode} />
              </div>

              {/* Message in a Bottle */}
              <div style={{ padding: '1rem', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '6px' }}>
                <label className="label" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={bottleMode} onChange={(e) => setBottleMode(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                  🌊 MESSAGE IN A BOTTLE (PUBLIC OCEAN)
                </label>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  Cast this library into the public ocean. Anyone visiting the site might find and read it. PIN lock is disabled in this mode.
                </p>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ alignSelf: 'center', marginTop: '1rem', padding: '1.25rem 3rem', fontSize: '18px', width: '100%' }}>
            CREATE LIBRARY &rarr;
          </button>
        </form>
      </div>
    </main>
  );
}
