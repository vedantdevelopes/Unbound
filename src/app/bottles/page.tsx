import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { deriveKey, decryptField } from '@/lib/crypto';
import TimeAwareLighting from '@/components/TimeAwareLighting';

export const revalidate = 60; // Revalidate every minute

export default async function BottlesOcean() {
  // Fetch collections where bottle_mode is true
  const { data: collections, error } = await supabase
    .from('collections')
    .select('view_id, id, description, sender_name, created_at, theme')
    .eq('bottle_mode', true)
    .is('access_pin', null)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching bottles:', error);
  }

  const bottles = (collections ?? []).map(col => {
    try {
      const key = deriveKey(col.id);
      return {
        ...col,
        sender_name: decryptField(col.sender_name, key),
        description: decryptField(col.description, key),
      };
    } catch {
      return null;
    }
  }).filter(Boolean);

  return (
    <main className="page-wrapper relative" style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 100%, #1a1525 0%, #050a12 100%)', color: '#fff' }}>
      <TimeAwareLighting />

      <header className="header" style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Link href="/" className="font-mono hover-glow" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>&larr; HOME</Link>
        <Link href="/" className="logo font-serif-italic hover-glow" style={{ color: '#fff' }}>unbound</Link>
        <div style={{ width: '80px' }} />
      </header>

      <div style={{ textAlign: 'center', margin: '4rem 0', position: 'relative', zIndex: 10 }}>
        <h1 className="font-heading" style={{ fontSize: '3rem', marginBottom: '0.5rem', color: '#e8d9b8' }}>
          the public ocean
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-inter)', maxWidth: '500px', margin: '0 auto' }}>
          Messages left for anyone to find. Drift through the anonymous libraries of strangers.
        </p>
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        {bottles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>
            THE OCEAN IS EMPTY. CAST THE FIRST BOTTLE.
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'center', paddingBottom: '6rem' }}>
            {bottles.map((bottle) => (
              <Link key={bottle!.view_id} href={`/gift/${bottle!.view_id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  width: '240px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '2rem',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  transition: 'transform 0.3s ease, background 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40px', background: `linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, transparent 100%)` }} />
                  
                  <div style={{ fontSize: '3rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 4px 12px rgba(255,255,255,0.2))' }}>
                    🍾
                  </div>

                  <p style={{
                    fontFamily: 'var(--font-instrument)', fontSize: '1.2rem', fontStyle: 'italic',
                    color: '#e8d9b8', textAlign: 'center', marginBottom: '1.5rem', lineHeight: 1.4,
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' // Truncate long descriptions
                  }}>
                    "{bottle!.description}"
                  </p>

                  <div style={{ marginTop: 'auto', fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', textAlign: 'center' }}>
                    from {bottle!.sender_name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </main>
  );
}
