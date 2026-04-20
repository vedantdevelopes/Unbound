import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deriveKey, decryptField } from '@/lib/crypto';

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId: viewId } = await params;

  const { data: collection, error } = await supabase
    .from('collections')
    .select('id, recipient_name, sender_name, books(id, title, pages(id, title, content, created_at, is_published))')
    .eq('view_id', viewId)
    .single();

  if (error || !collection) notFound();

  const key = deriveKey(collection.id);
  const recipientName = decryptField(collection.recipient_name, key);

  // Flatten all published pages, decrypt, and sort chronologically
  const allPages = (collection.books ?? []).flatMap((book: {
    id: string; title: string;
    pages: { id: string; title: string; content: string; created_at: string; is_published: boolean }[];
  }) =>
    (book.pages ?? [])
      .filter(p => p.is_published)
      .map(p => ({
        ...p,
        title:       decryptField(p.title, key),
        content:     decryptField(p.content, key),
        bookTitle:   decryptField(book.title, key),
        bookId:      book.id,
      }))
  ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
      <header className="header" style={{ marginBottom: '3rem' }}>
        <Link href={`/v/${viewId}`} className="font-mono" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontSize: '12px' }}>
          ← LIBRARY
        </Link>
        <div className="logo font-serif-italic">unbound</div>
        <div style={{ width: '80px' }} />
      </header>

      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <h1 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{recipientName}&apos;s Timeline</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '4rem' }}>All memories, in the order they were written.</p>

        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: '20px', top: 0, bottom: 0, width: '1px', background: 'var(--border)' }} />

          {allPages.map((page, i) => (
            <div key={page.id} style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', position: 'relative' }}>
              {/* Dot */}
              <div style={{
                width: '40px', height: '40px', flexShrink: 0,
                borderRadius: '50%', background: 'var(--bg-primary)',
                border: '2px solid var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-instrument)', fontSize: '0.8rem', color: 'var(--accent)',
                zIndex: 1,
              }}>
                {i + 1}
              </div>

              {/* Card */}
              <div className="page-card" style={{ flex: 1, padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="label" style={{ color: 'var(--accent)' }}>{page.bookTitle}</span>
                  <span className="label">{new Date(page.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <h3 className="font-heading" style={{ fontSize: '1.3rem', marginBottom: '0.8rem' }}>{page.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {page.content.replace(/<[^>]*>/g, ' ').trim()}
                </p>
                <Link href={`/v/${viewId}/book/${page.bookId}`} style={{ display: 'inline-block', marginTop: '1rem', fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--accent)', textDecoration: 'none' }}>
                  READ IN BOOK →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
