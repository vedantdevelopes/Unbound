import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BookReader from '@/components/BookReader';
import { deriveKey, decryptField } from '@/lib/crypto';
import AmbientSound from '@/components/AmbientSound';

export default async function ViewPublicBook({ params }: { params: Promise<{ bookId: string, id: string }> | { bookId: string, id: string } }) {
  const unwrappedParams = params instanceof Promise ? await params : params;
  const viewId = unwrappedParams.bookId;
  const trueBookId = unwrappedParams.id;

  // Fetch collection to verify ownership and get the encryption key root
  const { data: collection, error: colError } = await supabase
    .from('collections')
    .select('id, theme, recipient_name, sender_name')
    .eq('view_id', viewId)
    .single();

  if (colError || !collection) notFound();

  const { data: book, error } = await supabase
    .from('books')
    .select('*, pages(*)')
    .eq('id', trueBookId)
    .eq('collection_id', collection.id)
    .single();

  if (error || !book) notFound();

  // ─── Decrypt ──────────────────────────────────────────────────────────────
  const key = deriveKey(collection.id);

  // Decrypt collection fields (used in the Dedication Page)
  const decryptedCollection = {
    ...collection,
    recipient_name: decryptField(collection.recipient_name, key),
    sender_name:    decryptField(collection.sender_name, key),
  };

  // Decrypt book title
  const bookTitle = decryptField(book.title, key);

  // Decrypt pages — filter out drafts, sort chronologically
  const pages = (book.pages ?? [])
    .filter((p: { is_published: boolean }) => p.is_published === true)
    .sort((a: { created_at: string }, b: { created_at: string }) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    .map((page: { id: string; title: string; content: string; is_published: boolean; media_urls: string[]; created_at: string }) => ({
      ...page,
      title:   decryptField(page.title, key),
      content: decryptField(page.content, key),
    }));
  // ─────────────────────────────────────────────────────────────────────────

  const themeBackgrounds: Record<string, string> = {
    wood:   'url("https://www.transparenttextures.com/patterns/wood-pattern.png"), linear-gradient(135deg, #4A3525, #2B1D14)',
    marble: 'url("https://www.transparenttextures.com/patterns/white-marble.png"), linear-gradient(135deg, #F5F5F5, #E0E0E0)',
    cafe:   'url("https://www.transparenttextures.com/patterns/dark-matter.png"), linear-gradient(135deg, #1A1A1A, #0D0D0D)',
  };
  const activeBackground = themeBackgrounds[collection.theme ?? 'wood'] ?? themeBackgrounds.wood;
  const headerColor = collection.theme === 'marble' ? '#222' : '#fff';

  return (
    <main className="page-wrapper relative" style={{ overflow: 'hidden', background: activeBackground, minHeight: '100vh' }}>
      <header className="header" style={{ justifyContent: 'space-between', position: 'relative', zIndex: 100 }}>
        <Link href={`/v/${viewId}`} className="font-mono hover-glow" style={{ textDecoration: 'none', color: headerColor, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          &larr; BACK TO SHELF
        </Link>
        <Link href="/" className="logo font-serif-italic hover-glow" style={{ textDecoration: 'none', color: headerColor, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>unbound</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AmbientSound theme={collection.theme ?? 'wood'} />
          {book.soundtrack_url && (
            <a href={book.soundtrack_url} target="_blank" rel="noopener noreferrer" title="Listen while you read" style={{ fontSize: '16px', textDecoration: 'none' }}>🎵</a>
          )}
        </div>
      </header>

      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <BookReader
          pages={pages}
          bookTitle={bookTitle}
          collection={decryptedCollection}
          coverImageUrl={book.cover_image_url}
          spineColor={book.spine_color}
        />
      </div>

      <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
        <Link href={`/v/${viewId}/reply`} style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.2em', color: headerColor, textDecoration: 'none', textTransform: 'uppercase' }}>
          ✉️ Write back →
        </Link>
      </div>
    </main>
  );
}
