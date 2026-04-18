'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';

export default function ShareButton({ viewId }: { viewId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/v/${viewId}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #library-ticket, #library-ticket * {
            visibility: visible;
          }
          #library-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            border: none !important;
            box-shadow: none !important;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: none !important;
          }
        }
      `}} />
      <button className="btn-primary" onClick={() => setIsOpen(true)}>
        GET TICKET
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{ maxWidth: '500px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div id="library-ticket" style={{ 
              background: '#f4f1ec url("https://www.transparenttextures.com/patterns/cream-paper.png")',
              padding: '3rem 2rem', 
              borderRadius: '16px', 
              border: '2px dashed var(--accent)',
              position: 'relative',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: 'white', padding: '0.2rem 1rem', fontSize: '12px', letterSpacing: '0.2em' }} className="font-mono">
                    ADMIT ONE
                </div>
                
                <h2 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Library Access</h2>
                <p className="font-serif-italic" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>scan to unlock your private collection</p>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '4px', display: 'inline-block', marginBottom: '2rem', border: '12px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  <QRCode value={shareLink} size={180} fgColor="var(--text-primary)" level="H" />
                </div>
                
                <p className="font-mono" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>POWERED BY UNBOUND</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', background: 'white', padding: '1rem', borderRadius: '8px' }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => window.print()}>
                  🖨️ PRINT
                </button>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={handleCopy}>
                  {copied ? 'COPIED!' : '🔗 COPY LINK'}
                </button>
            </div>

            <button className="btn-secondary" style={{ border: 'none', color: 'white', alignSelf: 'center' }} onClick={() => setIsOpen(false)}>
              CLOSE
            </button>
          </div>
        </div>
      )}
    </>
  );
}
