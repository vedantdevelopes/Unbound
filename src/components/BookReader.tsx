'use client';

import { useState, useRef, forwardRef } from 'react';
import dynamic from 'next/dynamic';

const HTMLFlipBook = dynamic(() => import('react-pageflip').then(mod => mod.default as any), { ssr: false });

const Page = forwardRef<HTMLDivElement, { page: any; pageNum: number; maxPages: number; bookTitle: string }>((props, ref) => {
  return (
    <div 
      className="page-card" 
      ref={ref} 
      style={{ 
        padding: 'clamp(2rem, 4vw, 3rem)',
        backgroundColor: '#f6f3ee',
        backgroundImage: `
          linear-gradient(to ${props.pageNum % 2 === 0 ? 'right' : 'left'}, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0) 8%, rgba(0,0,0,0) 100%),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.06'/%3E%3C/svg%3E")
        `,
        borderLeft: props.pageNum % 2 === 0 ? 'none' : '1px solid rgba(0,0,0,0.1)',
        borderRight: props.pageNum % 2 === 0 ? '1px solid rgba(0,0,0,0.1)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <div className="font-ui" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>
        {props.bookTitle}
      </div>

      <h2 className="font-heading" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', marginBottom: '1rem', lineHeight: 1.1, color: '#2a2626' }}>
        {props.page.title}
      </h2>
      
      {/* Polaroid Render Logic */}
      {props.page.media_urls && props.page.media_urls.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ 
                padding: '10px 10px 30px 10px', 
                background: 'white', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
                transform: 'rotate(-2deg)',
                width: 'fit-content'
            }}>
                <img src={props.page.media_urls[0]} alt="Polaroid" style={{ width: '100%', maxWidth: '250px', height: '250px', objectFit: 'cover' }} />
            </div>
          </div>
      )}

      {/* Rich Text Render Logic */}
      <div 
        className={props.pageNum === 1 ? 'drop-cap-enabled tiptap-body' : 'tiptap-body'}
        style={{ 
          flex: 1, 
          overflowY: 'hidden', 
          fontFamily: 'var(--font-inter)', 
          fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
          lineHeight: '1.9',
          color: '#3a3431',
        }}
        dangerouslySetInnerHTML={{ __html: props.page.content }}
      />

      <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', justifyContent: props.pageNum % 2 === 0 ? 'flex-start' : 'flex-end', alignItems: 'center' }}>
        <div style={{ 
          fontFamily: 'var(--font-instrument)', 
          fontSize: '1.2rem', 
          color: 'var(--text-secondary)',
          borderTop: '1px solid rgba(0,0,0,0.1)',
          paddingTop: '0.5rem',
          width: '40px',
          textAlign: props.pageNum % 2 === 0 ? 'left' : 'right'
        }}>
          {props.pageNum}
        </div>
      </div>
    </div>
  );
});
Page.displayName = 'Page';


// Page 0: The Cursive Dedication
const DedicationPage = forwardRef<HTMLDivElement, { collection: any, bookTitle: string }>((props, ref) => {
    return (
      <div 
        className="page-card" 
        ref={ref} 
        style={{ 
          padding: 'clamp(2rem, 4vw, 3rem)',
          backgroundColor: '#f6f3ee',
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0) 8%, rgba(0,0,0,0) 100%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.06'/%3E%3C/svg%3E")
          `,
          borderRight: '1px solid rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden'
        }}
      >
        <div className="font-cursive" style={{ textAlign: 'center', color: 'var(--text-primary)', fontSize: '2.5rem', lineHeight: 1.5, opacity: 0.8, transform: 'rotate(-2deg)' }}>
            <p>For {props.collection.recipient_name},</p>
            <p style={{ fontSize: '1.5rem', marginTop: '1rem' }}>with love from {props.collection.sender_name}</p>
        </div>
      </div>
    );
  });
DedicationPage.displayName = 'DedicationPage';


export default function BookReader({ pages, bookTitle, collection }: { pages: any[], bookTitle: string, collection?: any }) {
  const flipAudioRef = useRef<HTMLAudioElement>(null);

  const onFlip = () => {
    if (flipAudioRef.current) {
        flipAudioRef.current.currentTime = 0;
        flipAudioRef.current.volume = 0.5;
        flipAudioRef.current.play().catch(e => console.log('Audio play blocked by browser policy:', e));
    }
  };

  if (pages.length === 0) {
    return (
      <div className="font-mono text-center flex justify-center h-full" style={{ color: 'var(--text-secondary)', marginTop: '20vh' }}>
        This book has blank pages.
      </div>
    );
  }

  return (
    <>
      {/* The Ambient Page Flip Audio Source */}
      <audio ref={flipAudioRef} src="https://www.soundjay.com/misc/sounds/page-flip-01a.mp3" preload="auto" />

      <style dangerouslySetInnerHTML={{__html: `
        .drop-cap-enabled::first-letter {
          font-family: var(--font-instrument);
          float: left;
          font-size: 4.5rem;
          line-height: 0.8;
          margin-right: 0.5rem;
          margin-bottom: -0.2rem;
          color: var(--accent);
          text-shadow: 1px 1px 0px rgba(0,0,0,0.1);
        }
        
        .tiptap-body blockquote {
            border-left: 3px solid var(--accent);
            padding-left: 1rem;
            margin-left: 0;
            font-style: italic;
            color: var(--text-secondary);
        }
        .tiptap-body h3 {
            font-family: var(--font-heading);
            font-size: 1.5rem;
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
        }
        .tiptap-body hr {
            border: none;
            border-top: 1px dotted var(--border);
            margin: 2rem 0;
        }
      `}} />
      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '2rem' }}>
        
        <div style={{
            boxShadow: '0px 30px 60px rgba(0,0,0,0.4), inset 0px 5px 15px rgba(255,255,255,0.1)',
            borderRadius: '6px 16px 16px 6px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#1a2228',
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-linen.png")',
            padding: '10px',
            position: 'relative'
        }}>
          
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            right: '80px',
            width: '25px',
            height: '60px',
            backgroundColor: '#a33327',
            boxShadow: '2px 5px 10px rgba(0,0,0,0.3)',
            zIndex: 0,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)'
          }}></div>

          <div style={{ zIndex: 1 }}>
            {/* @ts-ignore */}
            <HTMLFlipBook 
              width={450} 
              height={650} 
              size="stretch"
              minWidth={300}
              maxWidth={600}
              minHeight={400}
              maxHeight={800}
              maxShadowOpacity={0.6}
              showCover={false}
              mobileScrollSupport={true}
              onFlip={onFlip}
              style={{}}
            >
              {collection && <DedicationPage collection={collection} bookTitle={bookTitle} />}
              {pages.map((page, index) => (
                <Page key={page.id || index} page={page} pageNum={index + 1} maxPages={pages.length} bookTitle={bookTitle} />
              ))}
            </HTMLFlipBook>
          </div>

        </div>
      </div>
    </>
  );
}
