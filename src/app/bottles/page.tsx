import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { deriveKey, decryptField } from '@/lib/crypto';

export const revalidate = 60;

// ── Demo bottle that's always pinned at the top ──────────────────────────────
const DEMO_BOTTLE = {
  view_id: null, // no link — it's decorative
  sender_name: 'a hopeless romantic',
  description:
    "I made this for someone I love more than I know how to say. There are four letters inside — written on four different nights. Some nights I was so full of happiness I couldn't sleep. Other nights I just missed them, quietly, like a song you can't get out of your head. I don't know if they'll ever find this. But I hope you feel something reading it. Whoever you are. 🤍",
  created_at: new Date().toISOString(),
  isPinned: true,
};

export default async function BottlesOcean() {
  const { data: collections } = await supabase
    .from('collections')
    .select('view_id, id, description, sender_name, created_at')
    .eq('bottle_mode', true)
    .is('access_pin', null)
    .order('created_at', { ascending: false })
    .limit(30);

  const bottles = (collections ?? []).map(col => {
    try {
      const key = deriveKey(col.id);
      return {
        ...col,
        sender_name: decryptField(col.sender_name, key),
        description: decryptField(col.description, key),
        isPinned: false,
      };
    } catch {
      return null;
    }
  }).filter(Boolean);

  const allBottles = [DEMO_BOTTLE, ...bottles];

  return (
    <main style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #1a0a1e 0%, #0a0812 40%, #06090f 100%)',
      color: '#e8d9b8',
      position: 'relative',
      overflowX: 'hidden',
    }}>

      {/* Starfield */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {[...Array(60)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: i % 7 === 0 ? '2px' : '1px',
            height: i % 7 === 0 ? '2px' : '1px',
            background: `rgba(255,255,255,${0.2 + (i % 5) * 0.12})`,
            borderRadius: '50%',
            top: `${(i * 137.5) % 100}%`,
            left: `${(i * 91.3) % 100}%`,
            animation: `twinkle ${2 + (i % 4)}s ease-in-out infinite`,
            animationDelay: `${(i * 0.3) % 4}s`,
          }} />
        ))}
      </div>

      {/* Glow orbs */}
      <div style={{ position: 'fixed', top: '-10%', left: '20%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(180,100,220,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-5%', right: '10%', width: '30vw', height: '30vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,160,255,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(1deg); }
          50% { transform: translateY(-14px) rotate(-1.5deg); }
        }
        .bottle-card {
          animation: float 5s ease-in-out infinite;
          transition: box-shadow 0.4s ease, transform 0.4s ease;
        }
        .bottle-card:nth-child(even) { animation-name: floatB; animation-duration: 6s; }
        .bottle-card:hover {
          box-shadow: 0 24px 60px rgba(180,120,255,0.18), 0 0 0 1px rgba(255,220,180,0.15) !important;
          transform: translateY(-6px) scale(1.02) !important;
          animation-play-state: paused;
        }
        .bottle-card-pinned {
          animation: float 7s ease-in-out infinite;
          transition: box-shadow 0.4s ease;
        }
        .bottle-card-pinned:hover {
          box-shadow: 0 32px 80px rgba(255,180,100,0.2), 0 0 0 1px rgba(255,210,150,0.3) !important;
          animation-play-state: paused;
        }
      `}</style>

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.2rem 3rem',
        background: 'rgba(10,8,18,0.8)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(232,217,184,0.06)',
      }}>
        <Link href="/" style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.4)', textDecoration: 'none' }}>
          ← Home
        </Link>
        <Link href="/" style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', fontStyle: 'italic', color: '#e8d9b8', textDecoration: 'none' }}>
          unbound
        </Link>
        <div style={{ width: '80px' }} />
      </nav>

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '9rem 2rem 4rem' }}>
        <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(232,217,184,0.3)', marginBottom: '1.5rem' }}>
          ∿ the public ocean ∿
        </div>
        <h1 style={{
          fontFamily: 'var(--font-playfair)', fontWeight: 400,
          fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 0.95,
          color: '#e8d9b8', marginBottom: '1.5rem',
        }}>
          Messages in<br /><em style={{ color: '#c8902a' }}>a Bottle</em>
        </h1>
        <p style={{
          fontFamily: 'var(--font-instrument)', fontStyle: 'italic',
          fontSize: '1.2rem', color: 'rgba(232,217,184,0.5)',
          maxWidth: '480px', margin: '0 auto', lineHeight: 1.7,
        }}>
          Anonymous libraries left for anyone to find. Someone loved someone, and left proof here.
        </p>
      </div>

      {/* Bottles grid */}
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: '1200px', margin: '0 auto',
        padding: '2rem 2rem 8rem',
        display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center',
      }}>
        {allBottles.map((bottle, i) => {
          const isPinned = bottle!.isPinned;
          const card = (
            <div
              key={bottle!.view_id ?? 'demo'}
              className={isPinned ? 'bottle-card-pinned' : 'bottle-card'}
              style={{
                width: isPinned ? '100%' : '280px',
                maxWidth: isPinned ? '640px' : '280px',
                background: isPinned
                  ? 'linear-gradient(135deg, rgba(200,144,42,0.08) 0%, rgba(180,100,60,0.05) 100%)'
                  : `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)`,
                border: `1px solid ${isPinned ? 'rgba(200,144,42,0.25)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '20px',
                padding: isPinned ? '2.5rem' : '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: isPinned
                  ? '0 20px 60px rgba(200,144,42,0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
                  : '0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
                cursor: isPinned ? 'default' : 'pointer',
                position: 'relative',
                animationDelay: `${i * 0.4}s`,
              }}
            >
              {isPinned && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(90deg, #c8902a, #e8b86d)',
                  color: '#0c0a08', fontFamily: 'var(--font-geist-mono)',
                  fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase',
                  padding: '0.3rem 1rem', borderRadius: '20px', fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}>
                  ✦ Recently drifted in
                </div>
              )}

              {/* Emoji */}
              <div style={{ fontSize: isPinned ? '3rem' : '2.5rem', marginBottom: '1.25rem', filter: 'drop-shadow(0 4px 16px rgba(255,200,100,0.3))' }}>
                {['🫙', '💌', '🕯️', '🌊', '📜', '🌙', '🍃', '✉️'][i % 8]}
              </div>

              {/* Description */}
              <p style={{
                fontFamily: 'var(--font-instrument)', fontStyle: 'italic',
                fontSize: isPinned ? '1.15rem' : '1rem',
                color: 'rgba(232,217,184,0.9)',
                lineHeight: 1.75, marginBottom: '1.5rem',
                display: isPinned ? 'block' : '-webkit-box',
                WebkitLineClamp: isPinned ? undefined : 4,
                WebkitBoxOrient: 'vertical',
                overflow: isPinned ? 'visible' : 'hidden',
              }}>
                &ldquo;{bottle!.description}&rdquo;
              </p>

              {/* Meta */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  fontFamily: 'var(--font-geist-mono)', fontSize: '9px',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: isPinned ? 'rgba(200,144,42,0.6)' : 'rgba(232,217,184,0.3)',
                }}>
                  — {bottle!.sender_name}
                </div>
                {!isPinned && (
                  <div style={{
                    fontFamily: 'var(--font-geist-mono)', fontSize: '8px',
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: 'rgba(232,217,184,0.2)',
                  }}>
                    {new Date(bottle!.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </div>
                )}
              </div>

              {!isPinned && (
                <div style={{
                  marginTop: '1.5rem',
                  fontFamily: 'var(--font-geist-mono)', fontSize: '9px',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: 'rgba(232,217,184,0.25)',
                }}>
                  open library →
                </div>
              )}
            </div>
          );

          return isPinned ? card : (
            <Link key={bottle!.view_id} href={`/gift/${bottle!.view_id}`} style={{ textDecoration: 'none' }}>
              {card}
            </Link>
          );
        })}

        {allBottles.length === 1 && (
          <div style={{ width: '100%', textAlign: 'center', padding: '3rem', fontFamily: 'var(--font-instrument)', fontStyle: 'italic', color: 'rgba(232,217,184,0.25)', fontSize: '1.1rem' }}>
            The ocean is quiet. Cast the first real bottle.
          </div>
        )}
      </div>
    </main>
  );
}
