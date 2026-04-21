import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ShareButton from '@/components/ShareButton';
import { deriveKey, decryptField } from '@/lib/crypto';
import LocalStorageSaver from '@/components/LocalStorageSaver';
import CollectionSettings from '@/components/CollectionSettings';
import BookPublishToggle from '@/components/BookPublishToggle';

export default async function EditDashboard({ params }: { params: Promise<{ bookId: string }> | { bookId: string } }) {
  const unwrappedParams = params instanceof Promise ? await params : params;
  const editId = unwrappedParams.bookId;

  const { data: collection, error } = await supabase
    .from('collections')
    .select('*, books(*, pages(content, is_published))')
    .eq('edit_id', editId)
    .single();

  if (error || !collection) notFound();

  const key = deriveKey(collection.id);
  const recipientName = decryptField(collection.recipient_name, key);
  const description   = decryptField(collection.description, key);
  const replyContent  = collection.reply_content ? decryptField(collection.reply_content, key) : null;

  type RawBook = {
    id: string; title: string; description: string | null;
    cover_image_url: string | null; spine_color: string | null;
    created_at: string; is_published: boolean | null;
    pages: { content: string; is_published: boolean }[] | null;
  };
  const rawBooks: RawBook[] = Array.isArray(collection.books) ? collection.books : [];
  const books = rawBooks
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(book => ({
      ...book,
      title:       book.title ? decryptField(book.title, key) : '',
      description: book.description ? decryptField(book.description, key) : '',
    }));

  const totalPages    = books.reduce((s, b) => s + (b.pages?.length ?? 0), 0);
  const totalWords    = books.reduce((s, b) => s + (b.pages ?? []).reduce((ps, p) => ps + (p.content?.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length ?? 0), 0), 0);
  const totalReadMin  = Math.max(1, Math.round(totalWords / 200));
  const publishedBooks = books.filter(b => b.is_published !== false).length;

  return (
    <main style={{ background: '#0c0a08', color: '#e8d9b8', minHeight: '100vh', paddingBottom: '6rem' }}>
      <LocalStorageSaver editId={editId} name={`${recipientName}'s Library`} />

      {/* Grain */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '128px 128px', opacity: 0.6 }} />
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '50vh', background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(200,144,42,0.07), transparent)', zIndex: 0, pointerEvents: 'none' }} />

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 3rem', background: 'rgba(12,10,8,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(232,217,184,0.06)' }}>
        <Link href="/dashboard" style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.4)', textDecoration: 'none' }}>
          ← Libraries
        </Link>
        <Link href="/" style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.5rem', fontStyle: 'italic', color: '#e8d9b8', textDecoration: 'none' }}>unbound</Link>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link href={`/e/${editId}/new`} style={{
            fontFamily: 'var(--font-geist-mono)', fontSize: '11px', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: 'rgba(232,217,184,0.6)', textDecoration: 'none',
            padding: '0.55rem 1.2rem', borderRadius: '6px', border: '1px solid rgba(232,217,184,0.15)',
          }}>
            + New Book
          </Link>
          <ShareButton viewId={collection.view_id} />
        </div>
      </nav>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '8rem 2rem 0' }}>

        {/* Copy link banner */}
        <div style={{ background: 'rgba(200,144,42,0.08)', border: '1px solid rgba(200,144,42,0.2)', borderRadius: '8px', padding: '0.75rem 1.2rem', marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1rem' }}>🔗</span>
          <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c8902a' }}>
            Copy the share link — it&apos;s the only way your recipient can access this library.
          </span>
        </div>

        {/* Page header */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.3)', marginBottom: '1rem' }}>
            Library Editor
          </div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontWeight: 400, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 0.95, color: '#e8d9b8', marginBottom: '0.75rem' }}>
            {recipientName}&apos;s<br /><em style={{ color: '#c8902a' }}>Library</em>
          </h1>
          <p style={{ fontFamily: 'var(--font-inter)', color: 'rgba(232,217,184,0.45)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '500px' }}>
            {description}
          </p>

          {/* Badges */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {collection.unlock_at && new Date(collection.unlock_at) > new Date() && (
              <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c8902a', border: '1px solid rgba(200,144,42,0.3)', borderRadius: '20px', padding: '0.3rem 0.75rem' }}>
                ⏳ Time Capsule · Unlocks {new Date(collection.unlock_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
            {collection.access_pin && (
              <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.5)', border: '1px solid rgba(232,217,184,0.15)', borderRadius: '20px', padding: '0.3rem 0.75rem' }}>
                🔒 PIN protected
              </span>
            )}
            {collection.bottle_mode && (
              <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#5a9e8a', border: '1px solid rgba(90,158,138,0.3)', borderRadius: '20px', padding: '0.3rem 0.75rem' }}>
                🌊 In the ocean
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '2.5rem', marginBottom: '3rem', paddingBottom: '2.5rem', borderBottom: '1px solid rgba(232,217,184,0.07)', flexWrap: 'wrap' }}>
          {[
            { v: books.length, l: 'Total books' },
            { v: `${publishedBooks}/${books.length}`, l: 'Published' },
            { v: totalPages, l: 'Pages' },
            { v: totalWords.toLocaleString(), l: 'Words' },
            { v: `~${totalReadMin}m`, l: 'Read time' },
          ].map(({ v, l }) => (
            <div key={l}>
              <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', color: '#c8902a', lineHeight: 1 }}>{v}</div>
              <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.3)', marginTop: '0.3rem' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* ─── Settings Panel ─── */}
        <div style={{ marginBottom: '4rem' }}>
          <CollectionSettings
            editId={editId}
            currentDescription={description ?? ''}
            currentUnlockAt={collection.unlock_at ?? null}
            currentHasPin={!!collection.access_pin}
            currentBottleMode={!!collection.bottle_mode}
          />
        </div>

        {/* ─── Reply ─── */}
        {replyContent && (
          <div style={{ maxWidth: '640px', marginBottom: '4rem', background: 'rgba(200,144,42,0.06)', border: '1px solid rgba(200,144,42,0.2)', borderRadius: '12px', padding: '1.75rem' }}>
            <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#c8902a', marginBottom: '1rem' }}>
              💌 Reply from {recipientName}
            </div>
            <p style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.15rem', lineHeight: 1.8, fontStyle: 'italic', color: '#e8d9b8' }}>{replyContent}</p>
            {collection.reply_created_at && (
              <p style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(232,217,184,0.3)', marginTop: '1rem', textTransform: 'uppercase' }}>
                {new Date(collection.reply_created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        )}

        {/* ─── Books Section ─── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontWeight: 400, fontSize: '2rem', color: '#e8d9b8' }}>
              Books
            </h2>
            <p style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.3)' }}>
              Toggle LIVE/HIDDEN per book
            </p>
          </div>

          {books.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '6rem 2rem', border: '1px dashed rgba(232,217,184,0.1)', borderRadius: '12px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }}>📚</div>
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', color: '#e8d9b8', marginBottom: '0.75rem' }}>No books yet.</p>
              <p style={{ fontFamily: 'var(--font-inter)', color: 'rgba(232,217,184,0.35)', fontSize: '0.9rem', marginBottom: '2rem' }}>Start writing your first memory.</p>
              <Link href={`/e/${editId}/new`} style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                background: '#c8902a', color: '#0c0a08',
                fontFamily: 'var(--font-geist-mono)', fontSize: '12px', letterSpacing: '0.15em',
                textTransform: 'uppercase', textDecoration: 'none',
                padding: '1rem 2.2rem', borderRadius: '8px', fontWeight: 700,
              }}>
                + Create first book →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
              {books.map((book) => (
                <div key={book.id} style={{ position: 'relative' }}>
                  {/* ● LIVE / ○ HIDDEN toggle */}
                  <BookPublishToggle
                    editId={editId}
                    bookId={book.id}
                    isPublished={book.is_published !== false}
                  />

                  <Link href={`/e/${editId}/book/${book.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                    {/* Book spine */}
                    <div style={{
                      width: '200px', height: '300px', cursor: 'pointer',
                      borderRadius: '4px 12px 12px 4px', position: 'relative', overflow: 'hidden',
                      backgroundColor: book.cover_image_url ? 'transparent' : (book.spine_color || '#2a2626'),
                      backgroundImage: book.cover_image_url
                        ? `linear-gradient(to right,rgba(0,0,0,0.4) 0%,rgba(0,0,0,0) 10%),url(${book.cover_image_url})`
                        : 'linear-gradient(to right,rgba(255,255,255,0.12) 0%,rgba(255,255,255,0) 8%,rgba(0,0,0,0.2) 90%,rgba(0,0,0,0.3) 100%),url("https://www.transparenttextures.com/patterns/black-linen.png")',
                      backgroundSize: book.cover_image_url ? 'cover' : 'auto',
                      backgroundPosition: 'center',
                      boxShadow: book.is_published !== false
                        ? '0 20px 40px rgba(0,0,0,0.4), inset 5px 0 10px rgba(0,0,0,0.15)'
                        : '0 12px 24px rgba(0,0,0,0.2), inset 5px 0 10px rgba(0,0,0,0.1)',
                      opacity: book.is_published !== false ? 1 : 0.45,
                      transition: 'opacity 0.3s, transform 0.3s, box-shadow 0.3s',
                      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    }}>
                      {!book.cover_image_url && (
                        <div style={{ padding: '1rem', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                          <div style={{ position: 'absolute', top: '10%', left: 0, right: 0, height: '5px', borderTop: '1px solid rgba(212,175,55,0.5)', borderBottom: '1px solid rgba(212,175,55,0.5)', opacity: 0.4 }} />
                          <div style={{ position: 'absolute', bottom: '10%', left: 0, right: 0, height: '5px', borderTop: '1px solid rgba(212,175,55,0.5)', borderBottom: '1px solid rgba(212,175,55,0.5)', opacity: 0.4 }} />
                          <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.2rem,2vw,1.6rem)', color: '#d4af37', textShadow: '1px 2px 2px rgba(0,0,0,0.8)', lineHeight: 1.15, padding: '0 1rem', textAlign: 'center' }}>
                            {book.title}
                          </h3>
                        </div>
                      )}
                    </div>

                    {/* Label below */}
                    <div style={{ marginTop: '1rem', maxWidth: '200px' }}>
                      <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', color: book.is_published !== false ? '#e8d9b8' : 'rgba(232,217,184,0.35)', lineHeight: 1.3, wordBreak: 'break-word', marginBottom: '0.25rem' }}>
                        {book.title}
                      </p>
                      <p style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: book.is_published !== false ? 'rgba(16,185,129,0.7)' : 'rgba(232,217,184,0.25)' }}>
                        {book.is_published !== false ? '● Live' : '○ Hidden'}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}

              {/* Add book ghost card */}
              <div>
                <Link href={`/e/${editId}/new`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{
                    width: '200px', height: '300px', cursor: 'pointer',
                    borderRadius: '4px 12px 12px 4px',
                    border: '1px dashed rgba(232,217,184,0.12)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '0.75rem',
                  }}>
                    <div style={{ fontSize: '2rem', opacity: 0.25 }}>+</div>
                    <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.25)' }}>
                      New Book
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
