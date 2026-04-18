'use client';

import { createCollection } from '../actions';
import Link from 'next/link';
import { useState } from 'react';

export default function CreateBook() {
  const [desc, setDesc] = useState('');

  return (
    <main className="page-wrapper relative">
      <header className="header">
        <Link href="/" className="logo font-serif-italic">unbound</Link>
      </header>

      <div className="form-container">
        <h1 className="form-header font-heading">new library</h1>

        <form action={createCollection} className="flex flex-col">
          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="recipient_name">To:</label>
              <input 
                type="text" 
                id="recipient_name"
                name="recipient_name" 
                placeholder="recipient's name"
                required 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="sender_name">From:</label>
              <input 
                type="text" 
                id="sender_name"
                name="sender_name" 
                placeholder="your name"
                required 
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="label" htmlFor="description">Description</label>
              <span className="label" style={{ color: desc.length === 65 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{desc.length}/65</span>
            </div>
            <input 
              type="text" 
              id="description"
              name="description" 
              placeholder="e.g., for all the times I can't be there"
              maxLength={65}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          {/* --- THEME SELECTION --- */}
          <div style={{ padding: '0', margin: '2rem 0' }}>
            <label className="label" style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>READER ENVIRONMENT</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <label style={{ flex: 1, position: 'relative', cursor: 'pointer', minWidth: '120px' }}>
                <input type="radio" name="theme" value="wood" defaultChecked style={{ position: 'absolute', opacity: 0 }} />
                <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: '#3d2b1f', color: '#fff', borderRadius: '8px', border: '2px solid transparent', backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")', transition: 'all 0.2s', height: '100%' }}>
                  <span className="font-mono">Mahogany</span>
                </div>
              </label>
              
              <label style={{ flex: 1, position: 'relative', cursor: 'pointer', minWidth: '120px' }}>
                <input type="radio" name="theme" value="marble" style={{ position: 'absolute', opacity: 0 }} />
                <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: '#e2dfd8', color: '#2a2626', borderRadius: '8px', border: '2px solid transparent', backgroundImage: 'url("https://www.transparenttextures.com/patterns/white-marble.png")', transition: 'all 0.2s', height: '100%' }}>
                  <span className="font-mono">Marble</span>
                </div>
              </label>

              <label style={{ flex: 1, position: 'relative', cursor: 'pointer', minWidth: '120px' }}>
                <input type="radio" name="theme" value="cafe" style={{ position: 'absolute', opacity: 0 }} />
                <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: '#2b2725', color: '#fff', borderRadius: '8px', border: '2px solid transparent', backgroundImage: 'url("https://www.transparenttextures.com/patterns/dark-matter.png")', transition: 'all 0.2s', height: '100%' }}>
                  <span className="font-mono">Dark Café</span>
                </div>
              </label>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
              input[type="radio"]:checked + div {
                border-color: var(--accent) !important;
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                z-index: 2;
              }
            `}} />
          </div>

          <button type="submit" className="btn-primary" style={{ alignSelf: 'center', marginTop: '1rem', padding: '1.25rem 3rem', fontSize: '18px', width: '100%' }}>
            CREATE LIBRARY &rarr;
          </button>
        </form>
      </div>
    </main>
  );
}
