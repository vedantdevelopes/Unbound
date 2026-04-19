'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Split HTML into page-sized chunks based on approximate character count. */
function paginateHtml(html: string, charsPerPage = 800): string[] {
  if (!html) return [''];
  const blocks: string[] = [];
  const blockRegex = /<(p|h3|h2|blockquote|ul|ol)[^>]*>[\s\S]*?<\/\1>|<hr[^>]*\/?>/gi;
  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(html)) !== null) {
    if (match[0]) blocks.push(match[0]);
  }
  if (blocks.length === 0) return [html];

  const pages: string[] = [];
  let current = '';
  let currentChars = 0;

  for (const block of blocks) {
    const textLen = block.replace(/<[^>]*>/g, '').length;
    if (currentChars + textLen > charsPerPage && current !== '') {
      pages.push(current);
      current = block;
      currentChars = textLen;
    } else {
      current += block;
      currentChars += textLen;
    }
  }
  if (current) pages.push(current);
  return pages.length > 0 ? pages : [html];
}

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
  isLeft,
  isMobile,
}: {
  children: React.ReactNode;
  isLeft: boolean;
  isMobile: boolean;
}) => {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#FCFAF8',
        padding: isMobile ? '2rem 1.5rem' : '3rem 4rem',
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
      {/* Inner scrollable area for content (prevents absolute overflow on small screens) */}
      <div style={{ flex: 1, zIndex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden' }} className="hide-scroll">
        {children}
      </div>
    </div>
  );
};

// ─── Flip Pages Definitions ───────────────────────────────────────────────────

interface FlipPageDef {
  type: 'dedication' | 'toc' | 'chapter-title' | 'content' | 'end';
  pageNum: number;
  chapterNum?: number;
  chapterTitle?: string;
  html?: string;
  isFirstContent?: boolean;
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

  // Prepare pages
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
      const chapterPageNum = ++visual;
      
      flip.push({ type: 'chapter-title', pageNum: chapterPageNum, chapterNum: ci + 1, chapterTitle: page.title });
      toc.push({ title: page.title, pageNum: chapterPageNum });

      const chunks = paginateHtml(page.content, isMobile ? 650 : 900);
      chunks.forEach((chunk, j) => {
        flip.push({
          type: 'content',
          pageNum: ++visual,
          chapterNum: ci + 1,
          chapterTitle: page.title,
          html: chunk,
          isFirstContent: j === 0,
          mediaUrls: j === 0 ? page.media_urls : [],
        });
      });
    }

    flip.push({ type: 'end', pageNum: ++visual });
    flip[tocIndex].chapters = toc;

    // Pad array to ensure even length for desktop spreads
    if (flip.length % 2 !== 0) {
      flip.push({ type: 'end', pageNum: ++visual }); // just a blank buffer effectively
    }

    return { flipPages: flip };
  }, [pages, isMobile]);

  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Pagination logic
  const step = isMobile ? 1 : 2;
  const maxIndex = Math.max(0, flipPages.length - (isMobile ? 1 : 2));

  const goNext = () => {
    if (currentIndex < maxIndex) {
      setDirection(1);
      setCurrentIndex(prev => Math.min(prev + step, maxIndex));
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => Math.max(prev - step, 0));
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
  }, [currentIndex, maxIndex, step]);

  if (pages.length === 0) {
    return (
      <div style={{ color: '#fff', textAlign: 'center', marginTop: '10vh', fontFamily: 'var(--font-mono)' }}>
        This book has no pages yet.
      </div>
    );
  }

  // Which pages are currently visible?
  const visiblePages = isMobile
    ? [flipPages[currentIndex]]
    : [flipPages[currentIndex], flipPages[currentIndex + 1]].filter(Boolean);

  const renderPageContent = (fp: FlipPageDef) => {
    if (!fp) return null;

    if (fp.type === 'dedication') {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', color: '#4a3d35' }}>
            <div style={{ fontFamily: 'var(--font-instrument)', fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.4, opacity: 0.85, transform: 'rotate(-2deg)' }}>
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
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#b0a89a', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '0.6rem', marginBottom: '2rem' }}>
            Contents
          </div>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#2a2626' }}>Contents</div>
            <div style={{ marginTop: '0.5rem', fontSize: '1.2rem', opacity: 0.3 }}>❧</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(fp.chapters || []).map((ch, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: '#b0a89a', minWidth: '32px', letterSpacing: '0.05em' }}>
                  {toRoman(i + 1)}.
                </span>
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.95rem', color: '#3a3431', flex: 1 }}>
                  {ch.title}
                </span>
                <span style={{ flex: 0, borderBottom: '1px dotted rgba(0,0,0,0.2)', flexGrow: 1, marginBottom: '5px', minWidth: '20px' }} />
                <span style={{ fontFamily: 'var(--font-instrument)', fontSize: '1rem', color: '#b0a89a' }}>
                  {ch.pageNum}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (fp.type === 'chapter-title') {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', color: '#4a3d35' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b0a89a', marginBottom: '2rem' }}>
              Chapter {toRoman(fp.chapterNum!)}
            </div>
            <div style={{ fontSize: '1.5rem', opacity: 0.25, marginBottom: '2rem' }}>✦</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.2, color: '#2a2626', maxWidth: '320px', margin: '0 auto' }}>
              {fp.chapterTitle}
            </div>
            <div style={{ margin: '2rem auto 0 auto', width: '60px', height: '1px', backgroundColor: 'rgba(0,0,0,0.2)' }} />
          </div>
          <div style={{ position: 'absolute', bottom: isMobile ? '1.5rem' : '2.5rem', width: '100%', left: 0, textAlign: 'center', fontFamily: 'var(--font-instrument)', fontSize: '1rem', color: '#c0b8af' }}>
            {fp.pageNum}
          </div>
        </div>
      );
    }

    if (fp.type === 'content') {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex',
            justifyContent: fp.pageNum % 2 === 0 ? 'flex-start' : 'flex-end',
            fontFamily: 'var(--font-ui)',
            fontSize: '9px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#b0a89a',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            paddingBottom: '0.6rem',
            marginBottom: '1.5rem',
          }}>
            {fp.pageNum % 2 === 0 ? bookTitle : fp.chapterTitle}
          </div>

          {fp.isFirstContent && fp.mediaUrls && fp.mediaUrls.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                padding: '8px 8px 24px 8px',
                background: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transform: 'rotate(-2deg)',
              }}>
                <img src={fp.mediaUrls[0]} alt="Memory" style={{ width: '180px', height: '180px', objectFit: 'cover', display: 'block' }} />
              </div>
            </div>
          )}

          <div
            className={fp.isFirstContent ? 'drop-cap-enabled tiptap-body' : 'tiptap-body'}
            style={{
              flex: 1,
              fontFamily: 'var(--font-inter)',
              fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)',
              lineHeight: '1.8',
              color: '#3a3431',
              textAlign: 'justify',
              hyphens: 'auto',
            }}
            dangerouslySetInnerHTML={{ __html: fp.html ?? '' }}
          />

          <div style={{
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(0,0,0,0.07)',
            display: 'flex',
            justifyContent: fp.pageNum % 2 === 0 ? 'flex-start' : 'flex-end',
          }}>
            <span style={{ fontFamily: 'var(--font-instrument)', fontSize: '1rem', color: '#c0b8af' }}>
              {fp.pageNum}
            </span>
          </div>
        </div>
      );
    }

    if (fp.type === 'end') {
      // Don't show "-- fin --" twice on a desktop spread if it's acting as a buffer
      if (!isMobile && visiblePages[1] === fp && visiblePages[0]?.type === 'end') {
        return <div style={{ flex: 1 }} />; // blank filler
      }

      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', color: '#4a3d35' }}>
            <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '3rem', letterSpacing: '0.05em', color: '#2a2626' }}>
              — fin —
            </div>
            {collection?.sender_name && (
              <div style={{ marginTop: '2.5rem', fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b0a89a' }}>
                written with love by {collection.sender_name}
              </div>
            )}
            <div style={{ marginTop: '3rem', fontSize: '1.5rem', opacity: 0.2 }}>❧</div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -50 : 50,
      opacity: 0,
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
          font-size: 4.8rem;
          line-height: 0.7;
          margin-right: 0.6rem;
          margin-bottom: -0.2rem;
          color: #a33327; /* Rich subtle red for drop cap */
        }
        .tiptap-body p { margin-bottom: 0.8em; }
        .tiptap-body p:last-child { margin-bottom: 0; }
        .tiptap-body blockquote {
          border-left: 2px solid #a33327;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6a5f57;
          background: rgba(0,0,0,0.02);
          padding: 1rem;
        }
        .tiptap-body h3 {
          font-family: var(--font-heading);
          font-size: 1.3rem;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          color: #2a2626;
        }
        .tiptap-body hr {
          border: none;
          text-align: center;
          color: #b0a89a;
          margin: 1.5rem 0;
        }
        .tiptap-body hr::after { content: '✦ ✦ ✦'; font-size: 0.8rem; letter-spacing: 0.5em; }
        .tiptap-body strong { color: #2a2626; }
      ` }} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: isMobile ? '1rem' : '2rem' }}>
        
        {/* Book Container */}
        <div style={{
          display: 'flex',
          width: '100%',
          maxWidth: isMobile ? '480px' : '1000px',
          height: isMobile ? '75vh' : '82vh',
          backgroundColor: '#FDFBF9',
          borderRadius: isMobile ? '4px 12px 12px 4px' : '2px 8px 8px 2px',
          boxShadow: isMobile 
            ? '0 25px 50px rgba(0,0,0,0.3), inset -2px 0 5px rgba(0,0,0,0.02)'
            : '0 25px 50px rgba(0,0,0,0.4), 3px 3px 0px #e8e5df, 3px 3px 0px 1px rgba(0,0,0,0.05), 6px 6px 0px #dfdbd2, 6px 6px 0px 1px rgba(0,0,0,0.05), inset 0 0 20px rgba(0,0,0,0.02)',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'default',
        }}>
          
          {/* Central Spine line (desktop only) */}
          {!isMobile && (
            <div style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: '80px',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(0,0,0,0.02) 40%, rgba(0,0,0,0.06) 48%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.06) 52%, rgba(0,0,0,0.02) 60%, rgba(255,255,255,0) 100%)',
              zIndex: 10,
              pointerEvents: 'none',
              boxShadow: 'inset 0 0 15px rgba(0,0,0,0.03)'
            }} />
          )}

          {/* Left / Right overlays for clicking to turn pages */}
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
              transition={{ ease: [0.25, 1, 0.5, 1], duration: 0.6 }}
              style={{
                display: 'flex',
                width: '100%',
                height: '100%',
              }}
            >
              {isMobile ? (
                // Mobile: Single Page
                <PageContainer isLeft={true} isMobile={true}>
                  {renderPageContent(visiblePages[0])}
                </PageContainer>
              ) : (
                // Desktop: Two Pages
                <>
                  <PageContainer isLeft={true} isMobile={false}>
                    {renderPageContent(visiblePages[0])}
                  </PageContainer>
                  <PageContainer isLeft={false} isMobile={false}>
                    {renderPageContent(visiblePages[1])}
                  </PageContainer>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Ribbon Bookmark */}
          <div style={{
            position: 'absolute',
            bottom: -5,
            right: isMobile ? '30px' : '12%',
            width: '32px',
            height: '60px',
            background: 'linear-gradient(to right, #8a291f 0%, #a33327 20%, #b83c2e 50%, #a33327 80%, #8a291f 100%)',
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))',
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
            {Math.min(currentIndex + 1, Math.ceil(flipPages.length / step))} / {Math.ceil(flipPages.length / step)}
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
