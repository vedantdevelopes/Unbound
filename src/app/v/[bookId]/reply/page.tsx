import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deriveKey, decryptField } from '@/lib/crypto';
import { submitReply } from '@/app/actions';

export default async function ReplyPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookId: string }>;
  searchParams: Promise<{ sent?: string }>;
}) {
  const { bookId: viewId } = await params;
  const { sent } = await searchParams;

  const { data: collection, error } = await supabase
    .from('collections')
    .select('id, sender_name, recipient_name, reply_content, reply_created_at')
    .eq('view_id', viewId)
    .single();

  if (error || !collection) notFound();

  const key = deriveKey(collection.id);
  const senderName    = decryptField(collection.sender_name, key);
  const recipientName = decryptField(collection.recipient_name, key);
  const replyContent  = collection.reply_content
    ? decryptField(collection.reply_content, key)
    : null;

  const alreadyReplied = !!replyContent;
  const justSent = sent === '1';
  const boundAction = submitReply.bind(null, viewId);

  return (
    <main style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, #1a1208 0%, #0a0705 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <Link href={`/v/${viewId}`} style={{
        position: 'absolute', top: '2rem', left: '2rem',
        fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.2em', color: '#6a5040',
        textDecoration: 'none', textTransform: 'uppercase',
      }}>← Back to library</Link>

      <div style={{
        width: '100%', maxWidth: '560px',
        background: 'linear-gradient(160deg, #f5edd8 0%, #e8d9b8 100%)',
        borderRadius: '6px',
        padding: 'clamp(2rem, 5vw, 3.5rem)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        position: 'relative',
      }}>
        {/* Postcard header lines */}
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '40%', borderLeft: '1px solid rgba(150,120,80,0.2)', pointerEvents: 'none' }} />

        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '9px', letterSpacing: '0.4em', color: '#9a8060', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          — Reply Postcard —
        </div>

        {justSent || alreadyReplied ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{justSent ? '💌' : '📬'}</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: '#2a1a0a', marginBottom: '1rem' }}>
              {justSent ? 'Your letter is sent.' : 'You already replied.'}
            </h2>
            {replyContent && (
              <div style={{
                background: 'rgba(150,120,80,0.1)', borderRadius: '6px', padding: '1.5rem',
                fontFamily: 'var(--font-instrument)', fontSize: '1.1rem', color: '#3a2a1a',
                fontStyle: 'italic', textAlign: 'left', marginTop: '1.5rem',
                borderLeft: '3px solid rgba(150,120,80,0.4)',
              }}>
                {replyContent}
              </div>
            )}
            <p style={{ marginTop: '1.5rem', fontFamily: 'var(--font-ui)', fontSize: '11px', color: '#9a8060', letterSpacing: '0.1em' }}>
              {senderName} will see this the next time they open their editor.
            </p>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: '#2a1a0a', marginBottom: '0.5rem' }}>
              Write back to {senderName}
            </h2>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.9rem', color: '#7a6040', marginBottom: '2rem' }}>
              Leave a note, {recipientName}. Just one — make it count.
            </p>

            <form action={boundAction}>
              <textarea
                name="content"
                maxLength={600}
                required
                placeholder={`Dear ${senderName},\n\nThank you for...`}
                style={{
                  width: '100%', minHeight: '200px',
                  background: 'transparent', border: 'none',
                  borderBottom: '1px solid rgba(150,120,80,0.3)',
                  fontFamily: 'var(--font-instrument)', fontSize: '1.15rem',
                  color: '#2a1a0a', lineHeight: 1.8, resize: 'vertical',
                  outline: 'none', boxSizing: 'border-box',
                  padding: '0 0 1rem',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: '#9a8060', letterSpacing: '0.1em' }}>
                  max 600 characters · one reply only
                </span>
                <button type="submit" style={{
                  background: '#2a1a0a', color: '#e8d9b8',
                  border: 'none', borderRadius: '4px', padding: '0.8rem 2rem',
                  fontFamily: 'var(--font-ui)', fontSize: '12px', letterSpacing: '0.2em',
                  cursor: 'pointer', textTransform: 'uppercase',
                }}>
                  Send Letter →
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
