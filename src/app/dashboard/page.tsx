'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Library { editId: string; name: string; ts: number; viewId?: string; bookCount?: number; }

export default function CreatorDashboard() {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored: Library[] = JSON.parse(localStorage.getItem('unbound-libraries') || '[]');
    if (stored.length === 0) { setLoading(false); return; }

    // Enrich with live data
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
    <main className="page-wrapper relative">
      <header className="header">
        <Link href="/" className="logo font-serif-italic">unbound</Link>
        <Link href="/create" className="btn-primary" style={{ fontSize: '14px', padding: '0.6rem 1.5rem' }}>
          + NEW LIBRARY
        </Link>
      </header>

      <div className="container" style={{ marginTop: '2rem', maxWidth: '900px' }}>
        <h1 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
          My Libraries
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
          Tracked in this browser. Keep your edit links — they&apos;re your only key.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem' }}>Loading…</div>
        ) : libraries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>No libraries found in this browser.</p>
            <Link href="/create" className="btn-primary">Create your first library →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {libraries.map(lib => (
              <div key={lib.editId} className="page-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 className="font-heading" style={{ fontSize: '1.3rem', lineHeight: 1.2 }}>{lib.name}</h3>
                  {lib.bookCount !== undefined && (
                    <span className="label" style={{ background: 'var(--accent)', color: '#fff', padding: '2px 8px', borderRadius: '10px' }}>
                      {lib.bookCount} book{lib.bookCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="label" style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Created {new Date(lib.ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link href={`/e/${lib.editId}`} className="btn-secondary" style={{ flex: 1, textAlign: 'center', fontSize: '11px', padding: '0.5rem' }}>
                    EDIT
                  </Link>
                  {lib.viewId && (
                    <Link href={`/v/${lib.viewId}`} className="btn-secondary" style={{ flex: 1, textAlign: 'center', fontSize: '11px', padding: '0.5rem' }}>
                      VIEW
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
