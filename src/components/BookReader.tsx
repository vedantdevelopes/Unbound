'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Convert integer to Roman numeral. */
function toRoman(n: number): string {
  const vals = [10, 9, 5, 4, 1];
  const syms = ['X', 'IX', 'V', 'IV', 'I'];
  let r = '';
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { r += syms[i]; n -= vals[i]; }
  }
  return r;
}

// ─── Shared Components ────────────────────────────────────────────────────────

const PageContainer = ({
  children,
  isMobile,
}: {
  children: React.ReactNode;
  isMobile: boolean;
}) => {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#FCFAF8',
        padding: isMobile ? '2.5rem 2rem' : '4rem 4rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Subtle paper grain texture */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.25,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Inner scrollable area for content */}
      <div style={{ flex: 1, zIndex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden' }} className="hide-scroll">
        {children}
      </div>
    </div>
  );
};

// ─── Flip Pages Definitions ───────────────────────────────────────────────────

interface FlipPageDef {
  type: 'dedication' | 'toc' | 'chapter' | 'end';
  pageNum: number;
  chapterNum?: number;
  chapterTitle?: string;
  html?: string;
  mediaUrls?: string[];
  chapters?: { title: string; pageNum: number }[];
}

interface BookReaderProps {
  pages: { id: string; title: string; content: string; media_urls?: string[] }[];
  bookTitle: string;
  collection?: { recipient_name: string; sender_name: string; theme?: string };
}

export default function BookReader({ pages, bookTitle, collection }: BookReaderProps) {
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prepare pages (no chunking, just a single scrollable page per entry)
  const { flipPages } = useMemo(() => {
    const flip: FlipPageDef[] = [];
    let visual = 0;

    flip.push({ type: 'dedication', pageNum: ++visual });

    const tocIndex = flip.length;
    flip.push({ type: 'toc', pageNum: ++visual });

    const toc: { title: string; pageNum: number }[] = [];

    // Filter valid pages
    const validPages = pages.filter(p => p.content && p.content.trim() !== '');

    for (let ci = 0; ci < validPages.length; ci++) {
      const page = validPages[ci];
      const pageNum = ++visual;
      
      toc.push({ title: page.title, pageNum: pageNum });

      flip.push({
        type: 'chapter',
        pageNum: pageNum,
        chapterNum: ci + 1,
        chapterTitle: page.title,
        html: page.content,
        mediaUrls: page.media_urls,
      });
    }

    flip.push({ type: 'end', pageNum: ++visual });
    flip[tocIndex].chapters = toc;

    return { flipPages: flip };
  }, [pages]);

  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Pagination logic (Single page step)
  const maxIndex = Math.max(0, flipPages.length - 1);

  const goNext = () => {
    if (currentIndex < maxIndex) {
      setDirection(1);
      setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => Math.max(prev - 1, 0));
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, maxIndex]);

  if (pages.length === 0) {
    return (
      <div style={{ color: '#fff', textAlign: 'center', marginTop: '10vh', fontFamily: 'var(--font-mono)' }}>
        This book has no pages yet.
      </div>
    );
  }

  const activePage = flipPages[currentIndex];

  const renderPageContent = (fp: FlipPageDef) => {
    if (!fp) return null;

    if (fp.type === 'dedication') {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', color: '#4a3d35' }}>
            <div style={{ fontFamily: 'var(--font-instrument)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.4, opacity: 0.85, transform: 'rotate(-2deg)' }}>
              <p>For {collection?.recipient_name ?? 'You'},</p>
              <p style={{ fontSize: '0.6em', marginTop: '1rem', opacity: 0.8 }}>with love</p>
              <p style={{ fontSize: '0.5em', opacity: 0.7 }}>from {collection?.sender_name ?? 'Me'}</p>
            </div>
            <div style={{ marginTop: '4rem', fontSize: '1.5rem', opacity: 0.3 }}>❧</div>
          </div>
        </div>
      );
    }

    if (fp.type === 'toc') {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#b0a89a', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '0.6rem', marginBottom: '2.5rem' }}>
            Contents
          </div>
          <div style={{ textAlign: 'center', marginBottom: '3rem', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: '#2a2626' }}>Contents</div>
            <div style={{ marginTop: '0.5rem', fontSize: '1.2rem', opacity: 0.3 }}>❧</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', paddingBottom: '2rem' }}>
            {(fp.chapters || []).map((ch, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: '#b0a89a', minWidth: '36px', letterSpacing: '0.05em' }}>
                  {toRoman(i + 1)}.
                </span>
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '1.05rem', color: '#3a3431', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ch.title}
                </span>
                <span style={{ flex: 0, borderBottom: '1px dotted rgba(0,0,0,0.2)', flexGrow: 1, marginBottom: '5px', minWidth: '20px' }} />
                <span style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.1rem', color: '#b0a89a' }}>
                  {ch.pageNum}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (fp.type === 'chapter') {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-ui)',
            fontSize: '10px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#b0a89a',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            paddingBottom: '0.6rem',
            marginBottom: '3.5rem',
            flexShrink: 0,
          }}>
            <span>{bookTitle}</span>
            <span>Chapter {toRoman(fp.chapterNum!)}</span>
          </div>

          <div style={{ textAlign: 'center', color: '#4a3d35', marginBottom: '3.5rem', flexShrink: 0 }}>
            <div style={{ fontSize: '1.5rem', opacity: 0.25, marginBottom: '1.5rem' }}>✦</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.2, color: '#2a2626', maxWidth: '400px', margin: '0 auto' }}>
              {fp.chapterTitle}
            </div>
            <div style={{ margin: '2.5rem auto 0 auto', width: '80px', height: '1px', backgroundColor: 'rgba(0,0,0,0.2)' }} />
          </div>

          {fp.mediaUrls && fp.mediaUrls.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3.5rem', flexShrink: 0 }}>
              <div style={{
                padding: '12px 12px 36px 12px',
                background: 'white',
                boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                transform: 'rotate(-2deg)',
              }}>
                <img src={fp.mediaUrls[0]} alt="Memory" style={{ width: '260px', height: '260px', objectFit: 'cover', display: 'block' }} />
              </div>
            </div>
          )}

          <div
            className="drop-cap-enabled tiptap-body"
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
              lineHeight: '1.9',
              color: '#3a3431',
              textAlign: 'justify',
              hyphens: 'auto',
              paddingBottom: '2rem',
            }}
            dangerouslySetInnerHTML={{ __html: fp.html ?? '' }}
          />

          <div style={{
            marginTop: 'auto',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(0,0,0,0.07)',
            display: 'flex',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: 'var(--font-instrument)', fontSize: '1.1rem', color: '#c0b8af' }}>
              {fp.pageNum}
            </span>
          </div>
        </div>
      );
    }

    if (fp.type === 'end') {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', color: '#4a3d35' }}>
            <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '3.5rem', letterSpacing: '0.05em', color: '#2a2626' }}>
              — fin —
            </div>
            {collection?.sender_name && (
              <div style={{ marginTop: '2.5rem', fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b0a89a' }}>
                written with love by {collection.sender_name}
              </div>
            )}
            <div style={{ marginTop: '4rem', fontSize: '1.8rem', opacity: 0.2 }}>❧</div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
      scale: 0.98,
    }),
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .drop-cap-enabled > p:first-child::first-letter {
          font-family: var(--font-instrument);
          float: left;
          font-size: 5.5rem;
          line-height: 0.7;
          margin-right: 0.7rem;
          margin-bottom: -0.2rem;
          color: #a33327;
        }
        .tiptap-body p { margin-bottom: 1.2em; }
        .tiptap-body p:last-child { margin-bottom: 0; }
        .tiptap-body blockquote {
          border-left: 3px solid #a33327;
          padding-left: 1.5rem;
          margin: 2.5rem 0;
          font-style: italic;
          color: #6a5f57;
          background: rgba(0,0,0,0.02);
          padding: 1.5rem;
          border-radius: 0 6px 6px 0;
        }
        .tiptap-body h3 {
          font-family: var(--font-heading);
          font-size: 1.6rem;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          color: #2a2626;
        }
        .tiptap-body hr {
          border: none;
          text-align: center;
          color: #b0a89a;
          margin: 2.5rem 0;
        }
        .tiptap-body hr::after { content: '✦ ✦ ✦'; font-size: 0.8rem; letter-spacing: 0.5em; }
        .tiptap-body strong { color: #2a2626; }
      ` }} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: isMobile ? '1rem' : '2rem' }}>
        
        {/* Book Container - Single Portrait Manuscript View */}
        <div style={{
          display: 'flex',
          width: '100%',
          maxWidth: '680px',
          height: isMobile ? '75vh' : '82vh',
          backgroundColor: '#FDFBF9',
          borderRadius: '4px 16px 16px 4px',
          boxShadow: isMobile 
            ? '0 20px 40px rgba(0,0,0,0.3)'
            : '0 30px 60px rgba(0,0,0,0.4), 4px 4px 0px #e8e5df, 4px 4px 0px 1px rgba(0,0,0,0.05), 8px 8px 0px #dfdbd2, 8px 8px 0px 1px rgba(0,0,0,0.05), inset 0 0 30px rgba(0,0,0,0.02)',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'default',
        }}>
          
          {/* Subtle Binder Edge (leftside) */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '14px',
            background: 'linear-gradient(to right, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.03) 100%)',
            zIndex: 10,
            pointerEvents: 'none',
            borderRight: '1px solid rgba(0,0,0,0.04)'
          }} />

          {/* Touch navigation zones */}
          <div 
            onClick={goPrev}
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '20%', zIndex: 20, cursor: currentIndex > 0 ? 'w-resize' : 'default' }}
          />
          <div 
            onClick={goNext}
            style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '20%', zIndex: 20, cursor: currentIndex < maxIndex ? 'e-resize' : 'default' }}
          />

          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ ease: [0.25, 1, 0.5, 1], duration: 0.55 }}
              style={{
                display: 'flex',
                width: '100%',
                height: '100%',
              }}
            >
              <PageContainer isMobile={isMobile}>
                {renderPageContent(activePage)}
              </PageContainer>
            </motion.div>
          </AnimatePresence>

          {/* Ribbon Bookmark */}
          <div style={{
            position: 'absolute',
            bottom: -5,
            right: '12%',
            width: '36px',
            height: '75px',
            background: 'linear-gradient(to right, #8a291f 0%, #a33327 20%, #b83c2e 50%, #a33327 80%, #8a291f 100%)',
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 86%, 0 100%)',
            filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.4))',
            zIndex: 15,
          }}>
            {/* Thread detailing */}
            <div style={{ position: 'absolute', inset: '0 4px', borderLeft: '1px dashed rgba(255,255,255,0.2)', borderRight: '1px dashed rgba(255,255,255,0.2)' }} />
          </div>
        </div>

        {/* External Navigation Controls */}
        <div style={{ 
          marginTop: '2rem', 
          display: 'flex', 
          gap: '2rem', 
          alignItems: 'center',
          fontFamily: 'var(--font-ui)',
          fontSize: '12px',
          letterSpacing: '0.1em',
          color: '#fff',
          opacity: 0.8
        }}>
          <button 
            onClick={goPrev} 
            disabled={currentIndex === 0}
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: '1px solid rgba(255,255,255,0.2)', 
              color: '#fff', 
              padding: '0.6rem 1.2rem', 
              borderRadius: '20px',
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentIndex === 0 ? 0.4 : 1,
              transition: 'all 0.2s ease',
            }}>
            &larr; PREV
          </button>
          
          <span>
            {currentIndex + 1} / {flipPages.length}
          </span>
          
          <button 
            onClick={goNext} 
            disabled={currentIndex >= maxIndex}
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: '1px solid rgba(255,255,255,0.2)', 
              color: '#fff', 
              padding: '0.6rem 1.2rem', 
              borderRadius: '20px',
              cursor: currentIndex >= maxIndex ? 'not-allowed' : 'pointer',
              opacity: currentIndex >= maxIndex ? 0.4 : 1,
              transition: 'all 0.2s ease',
            }}>
            NEXT &rarr;
          </button>
        </div>
      </div>
    </>
  );
}
