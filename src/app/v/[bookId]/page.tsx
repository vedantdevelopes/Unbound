import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deriveKey, decryptField } from '@/lib/crypto';

export default async function ViewLibrary({ params }: { params: Promise<{ bookId: string }> | { bookId: string } }) {
  const unwrappedParams = params instanceof Promise ? await params : params;
  const viewId = unwrappedParams.bookId;

  const { data: collection, error } = await supabase
    .from('collections')
    .select('*, books(*)')
    .eq('view_id', viewId)
    .single();

  if (error || !collection) {
    notFound();
  }

  // ─── Decrypt ──────────────────────────────────────────────────────────────
  const key = deriveKey(collection.id);
  const recipientName = decryptField(collection.recipient_name, key);
  const senderName    = decryptField(collection.sender_name, key);
  const description   = decryptField(collection.description, key);

  const books = (collection.books ?? [])
    .sort((a: { created_at: string }, b: { created_at: string }) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    .map((book: { id: string; title: string; description: string; cover_image_url: string; created_at: string }) => ({
      ...book,
      title: decryptField(book.title, key),
    }));
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <main className="page-wrapper relative">
      <header className="header" style={{ justifyContent: 'center' }}>
        <div className="logo font-serif-italic">unbound</div>
      </header>

      <div className="container" style={{ textAlign: 'center', marginTop: '1rem' }}>
        <h1 className="font-heading" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
          {recipientName}&apos;s Library
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>{description}</p>

        <div style={{ marginTop: '4rem' }}>
          {books.length === 0 ? (
            <div>
              <p className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                THE SHELVES ARE EMPTY.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'center' }}>
              {books.map((book: { id: string; title: string; cover_image_url: string }) => (
                <Link key={book.id} href={`/v/${viewId}/book/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                  <h4 className="font-ui" style={{ marginTop: '1.5rem', letterSpacing: '0.1em' }}>{book.title}</h4>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer style={{ marginTop: 'auto', padding: '4rem', textAlign: 'right' }}>
        <p className="label">curated by,</p>
        <p className="font-heading" style={{ fontSize: '2rem' }}>{senderName}</p>
      </footer>
    </main>
  );
}
