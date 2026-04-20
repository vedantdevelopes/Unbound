import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const recipient    = searchParams.get('r') || 'Someone Special';
  const sender       = searchParams.get('s') || '...';
  const description  = searchParams.get('d') || 'A personal library, curated with love.';

  return new ImageResponse(
    (
      <div style={{
        width: '1200px', height: '630px',
        background: 'linear-gradient(135deg, #0d0a07 0%, #1a1208 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'serif', position: 'relative', overflow: 'hidden',
      }}>
        {/* Background texture scrim */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 40%, rgba(200,160,80,0.08) 0%, transparent 70%)',
        }} />

        {/* Top rule */}
        <div style={{ position: 'absolute', top: '60px', left: '80px', right: '80px', height: '1px', background: 'rgba(200,160,80,0.25)', display: 'flex' }} />

        {/* Logo */}
        <div style={{ fontSize: '18px', letterSpacing: '0.5em', color: 'rgba(200,160,80,0.6)', textTransform: 'uppercase', marginBottom: '40px', display: 'flex' }}>
          unbound
        </div>

        {/* For label */}
        <div style={{ fontSize: '16px', letterSpacing: '0.4em', color: 'rgba(200,160,80,0.5)', textTransform: 'uppercase', marginBottom: '16px', display: 'flex' }}>
          A library for
        </div>

        {/* Recipient name */}
        <div style={{ fontSize: '72px', color: '#f0e8d0', lineHeight: 1.1, textAlign: 'center', maxWidth: '900px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {recipient}
        </div>

        {/* Description */}
        <div style={{ fontSize: '22px', color: 'rgba(200,160,80,0.55)', marginTop: '24px', maxWidth: '700px', textAlign: 'center', fontStyle: 'italic', lineHeight: 1.5, display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {description}
        </div>

        {/* From */}
        <div style={{ marginTop: '40px', fontSize: '16px', color: 'rgba(200,160,80,0.4)', letterSpacing: '0.2em', display: 'flex' }}>
          from {sender} · Open to read →
        </div>

        {/* Bottom rule */}
        <div style={{ position: 'absolute', bottom: '60px', left: '80px', right: '80px', height: '1px', background: 'rgba(200,160,80,0.25)', display: 'flex' }} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
