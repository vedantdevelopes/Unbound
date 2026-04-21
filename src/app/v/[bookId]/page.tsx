import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { deriveKey, decryptField } from '@/lib/crypto';
import { cookies } from 'next/headers';
import EnvelopeUnwrap from '@/components/EnvelopeUnwrap';
import CountdownClock from '@/components/CountdownClock';
import TimeAwareLighting from '@/components/TimeAwareLighting';

export async function generateMetadata({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId: viewId } = await params;
  const { data: collection } = await supabase
    .from('collections')
    .select('id, recipient_name, sender_name, description')
    .eq('view_id', viewId)
    .single();

  if (!collection) return { title: 'Unbound' };
  const key = deriveKey(collection.id);
  const recipient   = decryptField(collection.recipient_name, key);
  const sender      = decryptField(collection.sender_name, key);
  const description = decryptField(collection.description, key);

  const ogUrl = `/api/og?r=${encodeURIComponent(recipient)}&s=${encodeURIComponent(sender)}&d=${encodeURIComponent(description ?? '')}`;
  return {
    title: `${recipient}'s Library — Unbound`,
    description: description || `A personal library curated by ${sender}`,
    openGraph: {
      title: `${recipient}'s Library`, description, images: [ogUrl],
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: `${recipient}'s Library`, images: [ogUrl] },
  };
}

export default async function ViewLibrary({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId: viewId } = await params;

  const { data: collection, error } = await supabase
    .from('collections')
    .select('*, books(*, pages(content, is_published))')
    .eq('view_id', viewId)
    .single();

  if (error || !collection) notFound();

  // ── Time Capsule check ─────────────────────────────────────────────────────
  if (collection.unlock_at && new Date(collection.unlock_at) > new Date()) {
    const key = deriveKey(collection.id);
    return (
      <CountdownClock
        unlockAt={collection.unlock_at}
        recipientName={decryptField(collection.recipient_name, key)}
        senderName={decryptField(collection.sender_name, key)}
        description={decryptField(collection.description, key)}
      />
    );
  }

  // ── PIN Lock check ─────────────────────────────────────────────────────────
  if (collection.access_pin) {
    const cookieStore = await cookies();
    const verified = cookieStore.get(`unbound-pin-${viewId}`);
    if (!verified) redirect(`/v/${viewId}/unlock`);
  }

  // ── Decrypt ────────────────────────────────────────────────────────────────
  const key = deriveKey(collection.id);
  const recipientName = decryptField(collection.recipient_name, key);
  const senderName    = decryptField(collection.sender_name, key);
  const description   = decryptField(collection.description, key);
  const hasReply      = !!collection.reply_content;

  const books = (collection.books ?? [])
    .filter((book: { is_published: boolean }) => book.is_published !== false)
    .sort((a: { created_at: string }, b: { created_at: string }) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    .map((book: { id: string; title: string; description: string; cover_image_url: string; spine_color: string; is_published: boolean; pages: { content: string; is_published: boolean }[] }) => {
      const wordCount = (book.pages ?? [])
        .filter(p => p.is_published)
        .reduce((acc, p) => acc + (p.content?.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length ?? 0), 0);
      const readMinutes = Math.max(1, Math.round(wordCount / 200));
      return {
        ...book,
        title:       decryptField(book.title, key),
        readMinutes,
      };
    });

  const totalMinutes = books.reduce((s: number, b: { readMinutes: number }) => s + b.readMinutes, 0);

  return (
    <main className="page-wrapper relative">
      <TimeAwareLighting />

      {/* First-visit envelope animation */}
      <EnvelopeUnwrap viewId={viewId} recipientName={recipientName} senderName={senderName} />

      <header className="header" style={{ justifyContent: 'space-between' }}>
        <div className="logo font-serif-italic">unbound</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href={`/v/${viewId}/timeline`} className="btn-secondary" style={{ fontSize: '11px', padding: '0.4rem 1rem' }}>
            TIMELINE
          </Link>
          <Link href={`/v/${viewId}/gallery`} className="btn-secondary" style={{ fontSize: '11px', padding: '0.4rem 1rem' }}>
            GALLERY
          </Link>
        </div>
      </header>

      <div className="container" style={{ textAlign: 'center', marginTop: '1rem' }}>
        <h1 className="font-heading" style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>
          {recipientName}&apos;s Library
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{description}</p>
        {totalMinutes > 0 && (
          <p className="label" style={{ color: 'var(--accent)' }}>~{totalMinutes} min total read</p>
        )}

        <div style={{ marginTop: '4rem' }}>
          {books.length === 0 ? (
            <p className="font-mono" style={{ color: 'var(--text-secondary)' }}>THE SHELVES ARE EMPTY.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'center' }}>
              {books.map((book: { id: string; title: string; cover_image_url: string; spine_color: string; readMinutes: number }) => (
                <Link key={book.id} href={`/v/${viewId}/book/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="book-spine" style={{
                    width: '220px', height: '320px', cursor: 'pointer',
                    boxShadow: '20px 20px 40px rgba(0,0,0,0.1), inset 5px 0 10px rgba(0,0,0,0.1)',
                    borderRadius: '4px 12px 12px 4px', position: 'relative', overflow: 'hidden',
                    backgroundColor: book.cover_image_url ? 'transparent' : (book.spine_color || '#2a2626'),
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    textAlign: 'center',
                    backgroundImage: book.cover_image_url
                      ? `linear-gradient(to right,rgba(0,0,0,0.4) 0%,rgba(0,0,0,0) 10%),url(${book.cover_image_url})`
                      : 'linear-gradient(to right,rgba(255,255,255,0.15) 0%,rgba(255,255,255,0) 8%,rgba(0,0,0,0.2) 90%,rgba(0,0,0,0.3) 100%),url("https://www.transparenttextures.com/patterns/black-linen.png")',
                    backgroundSize: book.cover_image_url ? 'cover' : 'auto',
                    backgroundPosition: 'center', transition: 'transform 0.3s ease',
                  }}>
                    {!book.cover_image_url && (
                      <div style={{ padding: '1rem', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '10%', left: 0, right: 0, height: '6px', borderTop: '1px solid rgba(212,175,55,0.6)', borderBottom: '1px solid rgba(212,175,55,0.6)', opacity: 0.5 }} />
                        <div style={{ position: 'absolute', bottom: '10%', left: 0, right: 0, height: '6px', borderTop: '1px solid rgba(212,175,55,0.6)', borderBottom: '1px solid rgba(212,175,55,0.6)', opacity: 0.5 }} />
                        <h3 className="font-heading" style={{ fontSize: 'clamp(1.5rem,2vw,2rem)', color: '#d4af37', textShadow: '1px 2px 2px rgba(0,0,0,0.8)', lineHeight: 1.1, padding: '0 1rem' }}>
                          {book.title}
                        </h3>
                      </div>
                    )}
                  </div>
                  <h4 className="font-ui" style={{ marginTop: '1rem', letterSpacing: '0.1em', maxWidth: '220px', textAlign: 'center', wordBreak: 'break-word', lineHeight: 1.4 }}>
                    {book.title}
                  </h4>
                  <p className="label" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>~{book.readMinutes} min</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ marginTop: '6rem', padding: '2rem 4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="label">curated by,</p>
          <p className="font-heading" style={{ fontSize: '2rem' }}>{senderName}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
          <Link href={`/v/${viewId}/reply`} style={{
            fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.2em',
            color: hasReply ? 'var(--text-secondary)' : 'var(--accent)',
            textDecoration: 'none', textTransform: 'uppercase',
            border: '1px solid', borderRadius: '4px', padding: '0.4rem 1rem',
          }}>
            {hasReply ? '💌 Reply sent' : '✉️ Write back to ' + senderName}
          </Link>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.2em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            powered by unbound
          </div>
        </div>
      </footer>
    </main>
  );
}
