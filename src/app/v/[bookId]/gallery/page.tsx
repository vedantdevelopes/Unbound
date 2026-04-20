import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deriveKey, decryptField } from '@/lib/crypto';

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId: viewId } = await params;

  const { data: collection, error } = await supabase
    .from('collections')
    .select('id, recipient_name, books(title, pages(id, title, media_urls, is_published))')
    .eq('view_id', viewId)
    .single();

  if (error || !collection) notFound();

  const key = deriveKey(collection.id);
  const recipientName = decryptField(collection.recipient_name, key);

  // Collect all polaroids
  const polaroids: { id: string; title: string; url: string; bookTitle: string }[] = [];
  for (const book of collection.books ?? []) {
    for (const page of book.pages ?? []) {
      if (!page.is_published) continue;
      for (const url of page.media_urls ?? []) {
        polaroids.push({
          id: page.id + url,
          title: decryptField(page.title, key),
          url,
          bookTitle: decryptField(book.title, key),
        });
      }
    }
  }

  const ROTATIONS = [-2, 1.5, -1, 2.5, -1.5, 1, -2.5, 2];

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
      <header className="header" style={{ marginBottom: '3rem' }}>
        <Link href={`/v/${viewId}`} className="font-mono" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontSize: '12px' }}>
          ← LIBRARY
        </Link>
        <div className="logo font-serif-italic">unbound</div>
        <div style={{ width: '80px' }} />
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
          {recipientName}&apos;s Gallery Wall
        </h1>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '4rem' }}>
          {polaroids.length > 0 ? `${polaroids.length} memories, pinned.` : 'No photos yet.'}
        </p>

        {polaroids.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
            <p>No polaroids have been attached to any pages yet.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '2.5rem',
            padding: '1rem',
          }}>
            {polaroids.map((p, i) => (
              <div key={p.id} style={{
                transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg)`,
                transition: 'transform 0.2s ease',
              }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'rotate(0deg) scale(1.04)')}
                onMouseLeave={e => (e.currentTarget.style.transform = `rotate(${ROTATIONS[i % ROTATIONS.length]}deg)`)}
              >
                <div style={{
                  background: '#fff',
                  padding: '10px 10px 36px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                }}>
                  <img src={p.url} alt={p.title} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                  <div style={{
                    fontFamily: 'var(--font-instrument)', fontSize: '0.85rem', color: '#4a3d35',
                    textAlign: 'center', marginTop: '0.5rem', lineHeight: 1.3,
                  }}>
                    {p.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
