import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ShareButton from '@/components/ShareButton';
import { deriveKey, decryptField } from '@/lib/crypto';
import LocalStorageSaver from '@/components/LocalStorageSaver';

export default async function EditDashboard({ params }: { params: Promise<{ bookId: string }> | { bookId: string } }) {
  const unwrappedParams = params instanceof Promise ? await params : params;
  const editId = unwrappedParams.bookId;

  const { data: collection, error } = await supabase
    .from('collections')
    .select('*, books(id, title, description, cover_image_url, spine_color, created_at, pages(content, is_published))')
    .eq('edit_id', editId)
    .single();

  if (error || !collection) {
    notFound();
  }

  // ─── Decrypt ──────────────────────────────────────────────────────────────
  const key = deriveKey(collection.id);
  const recipientName = decryptField(collection.recipient_name, key);
  const senderName    = decryptField(collection.sender_name, key);
  const description   = decryptField(collection.description, key);
  const replyContent  = collection.reply_content ? decryptField(collection.reply_content, key) : null;

  const books = (collection.books ?? [])
    .sort((a: { created_at: string }, b: { created_at: string }) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    .map((book: { id: string; title: string; description: string; cover_image_url: string; spine_color: string; created_at: string; pages: { content: string; is_published: boolean }[] }) => ({
      ...book,
      title:       decryptField(book.title, key),
      description: decryptField(book.description, key),
    }));

  // Stats
  const totalPages = books.reduce((s: number, b: { pages?: unknown[] }) => s + (b.pages?.length ?? 0), 0);
  const totalWords = books.reduce((s: number, b: { pages?: { content: string; is_published: boolean }[] }) =>
    s + (b.pages ?? []).reduce((ps, p) => ps + (p.content?.replace(/<[^>]*>/g,'').trim().split(/\s+/).filter(Boolean).length ?? 0), 0), 0);
  const totalReadMin = Math.max(1, Math.round(totalWords / 200));
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <main className="page-wrapper relative">
      <LocalStorageSaver editId={editId} name={`${recipientName}'s Library`} />
      <div className="banner">
        COPY LINK — THIS IS THE ONLY WAY TO ACCESS YOUR LIBRARY.
      </div>

      <header className="header">
        <Link href="/dashboard" className="font-mono" style={{ fontSize: '11px', textDecoration: 'none', color: 'var(--text-secondary)' }}>← MY LIBRARIES</Link>
        <Link href="/" className="logo font-serif-italic">unbound</Link>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href={`/e/${editId}/new`} className="btn-secondary">+ NEW BOOK</Link>
          <ShareButton viewId={collection.view_id} />
        </div>
      </header>

      <div className="container" style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h1 className="font-heading" style={{ fontSize: '3rem', marginBottom: '0.25rem' }}>
          {recipientName}&apos;s Library
        </h1>
        {collection.unlock_at && new Date(collection.unlock_at) > new Date() && (
          <div className="label" style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>
            🔒 Time Capsule · Unlocks {new Date(collection.unlock_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        )}
        {collection.access_pin && (
          <div className="label" style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>🔑 PIN protected</div>
        )}
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{description}</p>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', margin: '1.5rem 0 3rem' }}>
          {[{ v: books.length, l: 'books' }, { v: totalPages, l: 'pages' }, { v: totalWords.toLocaleString(), l: 'words' }, { v: `~${totalReadMin} min`, l: 'read time' }].map(({ v, l }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div className="font-heading" style={{ fontSize: '1.8rem', color: 'var(--accent)' }}>{v}</div>
              <div className="label" style={{ color: 'var(--text-secondary)' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Recipient Reply */}
        {replyContent && (
          <div style={{ maxWidth: '600px', margin: '0 auto 3rem', background: 'rgba(200,144,42,0.08)', border: '1px solid rgba(200,144,42,0.25)', borderRadius: '8px', padding: '1.5rem', textAlign: 'left' }}>
            <div className="label" style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>💌 REPLY FROM {recipientName.toUpperCase()}</div>
            <p style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.15rem', lineHeight: 1.8, fontStyle: 'italic', color: 'var(--text-primary)' }}>{replyContent}</p>
            {collection.reply_created_at && (
              <p className="label" style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', textAlign: 'right' }}>
                {new Date(collection.reply_created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        )}

        <div style={{ marginTop: '4rem' }}>
          {books.length === 0 ? (
            <div>
              <p className="font-mono" style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                NO BOOKS YET. CREATE YOUR FIRST MEMORY!
              </p>
              <Link href={`/e/${editId}/new`} className="btn-primary">
                + ADD BOOK
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'center' }}>
              {books.map((book: { id: string; title: string; cover_image_url: string }) => (
                <Link key={book.id} href={`/e/${editId}/book/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="book-spine" style={{
                    width: '220px', height: '320px',
                    cursor: 'pointer',
                    boxShadow: '20px 20px 40px rgba(0,0,0,0.1), inset 5px 0 10px rgba(0,0,0,0.1)',
                    borderRadius: '4px 12px 12px 4px',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: book.cover_image_url ? 'var(--accent)' : '#2a2626',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    backgroundImage: book.cover_image_url
                      ? `linear-gradient(to right, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 10%, rgba(0,0,0,0) 100%), url(${book.cover_image_url})`
                      : 'linear-gradient(to right, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 8%, rgba(0,0,0,0.2) 90%, rgba(0,0,0,0.3) 100%), url("https://www.transparenttextures.com/patterns/black-linen.png")',
                    backgroundSize: book.cover_image_url ? 'cover' : 'auto',
                    backgroundPosition: 'center',
                    transition: 'transform 0.3s ease'
                  }}>
                    {!book.cover_image_url && (
                      <div style={{ padding: '1rem', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '10%', left: 0, right: 0, height: '6px', borderTop: '1px solid rgba(212,175,55,0.6)', borderBottom: '1px solid rgba(212,175,55,0.6)', opacity: 0.5 }} />
                        <div style={{ position: 'absolute', bottom: '10%', left: 0, right: 0, height: '6px', borderTop: '1px solid rgba(212,175,55,0.6)', borderBottom: '1px solid rgba(212,175,55,0.6)', opacity: 0.5 }} />
                        <h3 className="font-heading" style={{
                          fontSize: 'clamp(1.5rem, 2vw, 2rem)',
                          color: '#d4af37',
                          textShadow: '1px 2px 2px rgba(0,0,0,0.8), -1px -1px 0px rgba(255,255,255,0.1)',
                          lineHeight: 1.1,
                          padding: '0 1rem'
                        }}>
                          {book.title}
                        </h3>
                      </div>
                    )}
                  </div>
                  <h4 className="font-ui" style={{ marginTop: '1.5rem', letterSpacing: '0.1em', maxWidth: '220px', textAlign: 'center', wordBreak: 'break-word', lineHeight: 1.4 }}>{book.title}</h4>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
