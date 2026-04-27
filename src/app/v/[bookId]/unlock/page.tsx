import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { verifyPin } from '@/app/actions';

export default async function UnlockPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { bookId: viewId } = await params;
  const { error: hasError } = await searchParams;

  const { data: collection } = await supabase
    .from('collections')
    .select('access_pin')
    .eq('view_id', viewId)
    .single();

  if (!collection?.access_pin) notFound();

  const boundAction = verifyPin.bind(null, viewId);

  return (
    <main style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 60%, #1a1208 0%, #0a0705 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        width: '100%', maxWidth: '340px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🔒</div>
        <h1 className="font-heading" style={{ fontSize: '2rem', color: '#e8d9b8', marginBottom: '0.5rem' }}>
          Private Library
        </h1>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.9rem', color: '#8a7050', marginBottom: '3rem' }}>
          This library is protected. Enter the access code to continue.
        </p>

        {hasError && (
          <div style={{
            background: 'rgba(139,28,28,0.2)', border: '1px solid rgba(139,28,28,0.4)',
            borderRadius: '6px', padding: '0.75rem', marginBottom: '1.5rem',
            fontFamily: 'var(--font-ui)', fontSize: '11px', color: '#e06060', letterSpacing: '0.1em',
          }}>
            {hasError === 'rate'
              ? 'Too many attempts — please wait 15 minutes before trying again.'
              : 'Incorrect code — try again.'}
          </div>
        )}

        <form action={boundAction}>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem' }}>
            {[0, 1, 2, 3].map(i => (
              <input
                key={i}
                type="password"
                name={`digit-${i}`}
                maxLength={1}
                inputMode="numeric"
                pattern="[0-9]"
                required
                autoFocus={i === 0}
                style={{
                  width: '60px', height: '70px',
                  textAlign: 'center', fontSize: '1.8rem', fontFamily: 'var(--font-heading)',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,160,80,0.3)',
                  borderRadius: '8px', color: '#e8d9b8', outline: 'none',
                  caretColor: 'transparent',
                }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  if (el.value.length === 1) {
                    const next = el.parentElement?.children[i + 1] as HTMLInputElement;
                    if (next) next.focus();
                  }
                }}
              />
            ))}
          </div>

          {/* Combine digits into hidden field */}
          <div style={{ display: 'none' }}>
            <input type="text" name="pin" id="hidden-pin" />
          </div>

          <button
            type="submit"
            onClick={(e) => {
              const form = (e.currentTarget as HTMLButtonElement).closest('form')!;
              const digits = [0,1,2,3].map(i => (form.querySelector(`[name="digit-${i}"]`) as HTMLInputElement)?.value ?? '').join('');
              (form.querySelector('#hidden-pin') as HTMLInputElement).value = digits;
            }}
            style={{
              width: '100%', padding: '1rem',
              background: 'rgba(200,160,80,0.15)', border: '1px solid rgba(200,160,80,0.4)',
              borderRadius: '8px', color: '#e8d9b8',
              fontFamily: 'var(--font-ui)', fontSize: '12px', letterSpacing: '0.3em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}
          >
            Unlock Library →
          </button>
        </form>
      </div>
    </main>
  );
}
