'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'isomorphic-dompurify';

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

const PAPER_TEXTURE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E")`;

// ─── Shared Components ────────────────────────────────────────────────────────

const PageContainer = ({
  children,
  isMobile,
  isLeftPage,
  isRightPage,
  scrollable = true,
}: {
  children: React.ReactNode;
  isMobile: boolean;
  isLeftPage?: boolean;
  isRightPage?: boolean;
  scrollable?: boolean;
}) => {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#FDFBF9',
        padding: isMobile ? '2.5rem 1.5rem' : '3.5rem 4rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
        // Optional subtle rounding on the inner paper corners
        borderRadius: isMobile 
          ? '4px' 
          : (isLeftPage ? '4px 0 0 4px' : (isRightPage ? '0 4px 4px 0' : '4px')),
        boxShadow: isLeftPage ? 'inset -10px 0 20px rgba(0,0,0,0.03)' : (isRightPage ? 'inset 10px 0 20px rgba(0,0,0,0.03)' : 'none')
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
          pointerEvents: 'none',
          backgroundImage: PAPER_TEXTURE_SVG,
        }}
      />
      {/* 3D Page Curve Shading */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none',
          background: isLeftPage 
            ? 'linear-gradient(to right, rgba(0,0,0,0) 80%, rgba(0,0,0,0.02) 92%, rgba(0,0,0,0.12) 100%)' 
            : (isRightPage ? 'linear-gradient(to right, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.02) 8%, rgba(0,0,0,0) 20%)' : 'none'),
          zIndex: 0,
        }}
      />
      {/* Inner wrapper for content */}
      <div 
        style={{ 
          flex: 1, 
          zIndex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          overflowY: scrollable ? 'auto' : 'hidden', 
          overflowX: 'hidden',
          paddingRight: '0', 
        }} 
        className={scrollable ? "hide-scroll" : ""}
      >
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

  // Prepare pages
  const { flipPages } = useMemo(() => {
    const flip: FlipPageDef[] = [];
    let visual = 0;

    flip.push({ type: 'dedication', pageNum: ++visual });

    const tocIndex = flip.length;
    flip.push({ type: 'toc', pageNum: ++visual });

    const toc: { title: string; pageNum: number }[] = [];

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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [flipping, setFlipping] = useState<'next' | 'prev' | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const maxIndex = Math.max(0, flipPages.length - 1);

  const goNext = () => {
    if (currentIndex < maxIndex && !flipping) {
      setFlipping('next');
      setTimeout(() => {
        setDirection(1);
        setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
      }, 550);
      setTimeout(() => setFlipping(null), 1100);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0 && !flipping) {
      setFlipping('prev');
      setTimeout(() => {
        setDirection(-1);
        setCurrentIndex(prev => Math.min(prev - 1, maxIndex));
      }, 550);
      setTimeout(() => setFlipping(null), 1100);
    }
  };

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

  const renderDedication = () => (
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

  const renderTOC = (fp: FlipPageDef) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#b0a89a', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '0.6rem', marginBottom: '2.5rem' }}>
        Contents
      </div>
      <div style={{ textAlign: 'center', marginBottom: '3rem', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#2a2626' }}>Index</div>
        <div style={{ marginTop: '0.5rem', fontSize: '1.2rem', opacity: 0.3 }}>❧</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', paddingBottom: '2rem' }}>
        {(fp.chapters || []).map((ch, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', cursor: 'pointer' }} onClick={() => { setDirection(i + 2 > currentIndex ? 1 : -1); setCurrentIndex(i + 2); }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: '#b0a89a', minWidth: '30px', letterSpacing: '0.05em' }}>
              {toRoman(i + 1)}.
            </span>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.95rem', color: '#3a3431', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

  const renderEnd = () => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', color: '#4a3d35' }}>
        <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '2.5rem', letterSpacing: '0.05em', color: '#2a2626' }}>
          — fin —
        </div>
        {collection?.sender_name && (
          <div style={{ marginTop: '2.5rem', fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b0a89a' }}>
            written with love by {collection.sender_name}
          </div>
        )}
        <div style={{ marginTop: '4rem', fontSize: '1.5rem', opacity: 0.2 }}>❧</div>
      </div>
    </div>
  );

  // Desktop Left Page Content (Title + Image)
  const renderChapterLeft = (fp: FlipPageDef) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#b0a89a',
        borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '0.6rem', marginBottom: '3.5rem', flexShrink: 0,
      }}>
        {bookTitle}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', color: '#4a3d35', marginBottom: '2.5rem', width: '100%' }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b0a89a', marginBottom: '2rem' }}>
            Chapter {toRoman(fp.chapterNum!)}
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 2.5rem)', lineHeight: 1.2, color: '#2a2626', maxWidth: '350px', margin: '0 auto', wordBreak: 'break-word', hyphens: 'auto' }}>
            {fp.chapterTitle}
          </div>
          <div style={{ margin: '2rem auto 0 auto', width: '60px', height: '1px', backgroundColor: 'rgba(0,0,0,0.2)' }} />
        </div>

        {fp.mediaUrls && fp.mediaUrls.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', transform: 'rotate(-1deg)' }}>
            <div style={{ padding: '10px 10px 30px 10px', background: 'white', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
              <img src={fp.mediaUrls[0]} alt="Memory" style={{ width: '220px', height: '220px', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.07)', display: 'flex', justifyContent: 'flex-start' }}>
        <span style={{ fontFamily: 'var(--font-instrument)', fontSize: '1rem', color: '#c0b8af' }}>
          {fp.pageNum}
        </span>
      </div>
    </div>
  );

  // Desktop Right Page Content (Text content inside a scroll container)
  const renderChapterRight = (fp: FlipPageDef) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#b0a89a', textAlign: 'right',
        borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '0.6rem', marginBottom: '2rem', flexShrink: 0,
      }}>
        Chapter {toRoman(fp.chapterNum!)}
      </div>

      <div
        className="drop-cap-enabled tiptap-body custom-scroll"
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: 'clamp(0.95rem, 1.2vw, 1.05rem)',
          lineHeight: '1.9',
          color: '#3a3431',
          textAlign: 'justify',
          hyphens: 'auto',
          paddingBottom: '2rem',
          flex: 1,
          overflowY: 'auto'
        }}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(fp.html ?? '') }}
      />
    </div>
  );

  // Mobile Page Content (Stacked Title + Image + Text)
  const renderChapterMobile = (fp: FlipPageDef) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-ui)', fontSize: '9px', letterSpacing: '0.1em',
        textTransform: 'uppercase', color: '#b0a89a', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '0.6rem', marginBottom: '2.5rem', flexShrink: 0,
      }}>
        <span>{bookTitle}</span>
        <span>Chap {toRoman(fp.chapterNum!)}</span>
      </div>

      <div style={{ textAlign: 'center', color: '#4a3d35', marginBottom: '2.5rem', flexShrink: 0 }}>
        <div style={{ fontSize: '1.2rem', opacity: 0.25, marginBottom: '1rem' }}>✦</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', lineHeight: 1.2, color: '#2a2626', wordBreak: 'break-word', hyphens: 'auto' }}>
          {fp.chapterTitle}
        </div>
        <div style={{ margin: '1.5rem auto 0 auto', width: '50px', height: '1px', backgroundColor: 'rgba(0,0,0,0.2)' }} />
      </div>

      {fp.mediaUrls && fp.mediaUrls.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem', flexShrink: 0 }}>
          <div style={{ padding: '8px 8px 24px 8px', background: 'white', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', transform: 'rotate(-2deg)' }}>
            <img src={fp.mediaUrls[0]} alt="Memory" style={{ width: '180px', height: '180px', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      )}

      <div
        className="drop-cap-enabled tiptap-body"
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '1.05rem',
          lineHeight: '1.8',
          color: '#3a3431',
          textAlign: 'justify',
          hyphens: 'auto',
          paddingBottom: '2rem',
        }}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(fp.html ?? '') }}
      />

      <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.07)', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-instrument)', fontSize: '1rem', color: '#c0b8af' }}>
          {fp.pageNum}
        </span>
      </div>
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        
        .drop-cap-enabled { position: relative; }
        .drop-cap-enabled > p:first-child { min-height: 4.5rem; }
        .drop-cap-enabled > p:first-child::first-letter {
          font-family: var(--font-instrument);
          float: left;
          font-size: 5rem;
          line-height: 0.8;
          padding-top: 0.3rem;
          padding-right: 0.7rem;
          margin-bottom: -0.3rem;
          color: #a33327;
        }
        
        .tiptap-body p { margin-bottom: 1.2em; }
        .tiptap-body p:last-child { margin-bottom: 0; }
        .tiptap-body blockquote {
          border-left: 2px solid #a33327;
          padding-left: 1.2rem;
          margin: 2rem 0;
          font-style: italic;
          color: #6a5f57;
          background: rgba(0,0,0,0.02);
          padding: 1.2rem;
        }
        .tiptap-body h3 {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #2a2626;
        }
        .tiptap-body hr {
          border: none;
          textAlign: center;
          color: #b0a89a;
          margin: 2rem 0;
        }
        .tiptap-body hr::after { content: '✦ ✦ ✦'; font-size: 0.7rem; letter-spacing: 0.5em; }
        .tiptap-body strong { color: #2a2626; }

        /* ── Page-flip keyframes ─────────────────────────────────────────── */
        @keyframes pageFlipNext {
          0%   { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); transform: scaleX(1)   skewY(0deg);  }
          15%  { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); transform: scaleX(0.92) skewY(-1.5deg); }
          50%  { clip-path: polygon(0% 0%, 50%  0%,  50% 100%, 0% 100%); transform: scaleX(0.5)  skewY(-3deg);  }
          85%  { clip-path: polygon(0% 0%, 5%   0%,  5%  100%, 0% 100%); transform: scaleX(0.08) skewY(-1deg);  }
          100% { clip-path: polygon(0% 0%, 0%   0%,  0%  100%, 0% 100%); transform: scaleX(0)    skewY(0deg);  }
        }
        @keyframes pageFlipNextShadow {
          0%   { opacity: 0;   transform: scaleX(1);    }
          20%  { opacity: 0.6; transform: scaleX(0.85); }
          50%  { opacity: 0.9; transform: scaleX(0.5);  }
          80%  { opacity: 0.4; transform: scaleX(0.15); }
          100% { opacity: 0;   transform: scaleX(0);    }
        }
        @keyframes pageFlipPrev {
          0%   { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); transform: scaleX(1)   skewY(0deg); }
          15%  { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); transform: scaleX(0.92) skewY(1.5deg); }
          50%  { clip-path: polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%); transform: scaleX(0.5) skewY(3deg);  }
          85%  { clip-path: polygon(95% 0%, 100% 0%, 100% 100%, 95% 100%); transform: scaleX(0.08) skewY(1deg); }
          100% { clip-path: polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%); transform: scaleX(0) skewY(0deg); }
        }
        @keyframes pageFlipPrevShadow {
          0%   { opacity: 0;   transform: scaleX(1);    }
          20%  { opacity: 0.6; transform: scaleX(0.85); }
          50%  { opacity: 0.9; transform: scaleX(0.5);  }
          80%  { opacity: 0.4; transform: scaleX(0.15); }
          100% { opacity: 0;   transform: scaleX(0);    }
        }
        @keyframes spineGlow {
          0%   { opacity: 0; }
          30%  { opacity: 1; }
          70%  { opacity: 1; }
          100% { opacity: 0; }
        }
        .flip-page-next {
          animation: pageFlipNext 1.1s cubic-bezier(0.645, 0.045, 0.355, 1.000) forwards;
          transform-origin: left center;
          position: absolute; right: 0; top: 0; bottom: 0; width: 50%;
          background-color: #FDFBF9;
          z-index: 60;
          pointer-events: none;
          box-shadow: -8px 0 25px rgba(0,0,0,0.25);
        }
        .flip-page-next-shadow {
          animation: pageFlipNextShadow 1.1s cubic-bezier(0.645, 0.045, 0.355, 1.000) forwards;
          transform-origin: right center;
          position: absolute; left: 0; top: 0; bottom: 0; width: 52%;
          background: linear-gradient(to right, transparent 60%, rgba(0,0,0,0.18) 100%);
          z-index: 50;
          pointer-events: none;
        }
        .flip-page-prev {
          animation: pageFlipPrev 1.1s cubic-bezier(0.645, 0.045, 0.355, 1.000) forwards;
          transform-origin: right center;
          position: absolute; left: 0; top: 0; bottom: 0; width: 50%;
          background-color: #FDFBF9;
          z-index: 60;
          pointer-events: none;
          box-shadow: 8px 0 25px rgba(0,0,0,0.25);
        }
        .flip-page-prev-shadow {
          animation: pageFlipPrevShadow 1.1s cubic-bezier(0.645, 0.045, 0.355, 1.000) forwards;
          transform-origin: left center;
          position: absolute; right: 0; top: 0; bottom: 0; width: 52%;
          background: linear-gradient(to left, transparent 60%, rgba(0,0,0,0.18) 100%);
          z-index: 50;
          pointer-events: none;
        }
        .spine-glow {
          animation: spineGlow 1.1s ease forwards;
          position: absolute; left: 50%; top: 0; bottom: 0; width: 3px;
          transform: translateX(-50%);
          background: rgba(255,255,255,0.4);
          z-index: 70;
          pointer-events: none;
          box-shadow: 0 0 12px 4px rgba(255,255,255,0.3);
        }
      ` }} />

      <motion.div 
        initial={{ opacity: 0, y: 40, rotateX: 10, scale: 0.95, perspective: 2000 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: isMobile ? '1rem' : '2rem' }}
      >
        
        {/* Book Hardcover Casing */}
        <div style={{
          display: 'flex',
          width: '100%',
          maxWidth: isMobile ? '480px' : '1080px',
          height: isMobile ? '78vh' : '82vh',
          backgroundColor: '#38322e', // Hardcover wrap color
          borderRadius: isMobile ? '6px 12px 12px 6px' : '8px',
          padding: isMobile ? '4px 10px 4px 4px' : '12px 16px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.4)',
          position: 'relative',
        }}>
          
          {/* Cover Texture */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit', mixBlendMode: 'overlay', opacity: 0.3, pointerEvents: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }} />

          {/* Hardcover Outer Spine Grooves */}
          {!isMobile && (
            <>
              <div style={{ position: 'absolute', left: '30px', top: 0, bottom: 0, width: '8px', background: 'rgba(0,0,0,0.15)', boxShadow: 'inset 2px 0 5px rgba(0,0,0,0.6), inset -1px 0 2px rgba(255,255,255,0.05)', zIndex: 1 }} />
              <div style={{ position: 'absolute', right: '30px', top: 0, bottom: 0, width: '8px', background: 'rgba(0,0,0,0.15)', boxShadow: 'inset 2px 0 5px rgba(0,0,0,0.6), inset -1px 0 2px rgba(255,255,255,0.05)', zIndex: 1 }} />
            </>
          )}

          {/* Premium Ribbon Bookmark (Tucked Underneath Paper Stack) */}
          <div style={{
            position: 'absolute',
            bottom: '-15px', // Hangs slightly over the bottom of the casing
            right: isMobile ? '30px' : '80px',
            width: '32px',
            height: '110px',
            background: 'linear-gradient(to right, #8a291f 0%, #a33327 20%, #bf4030 50%, #a33327 80%, #8a291f 100%)',
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - 15px), 0 100%)',
            filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.5))',
            zIndex: 5,
          }}>
            <div style={{ position: 'absolute', inset: '0 4px', borderLeft: '1px dashed rgba(255,255,255,0.25)', borderRight: '1px dashed rgba(255,255,255,0.25)' }} />
          </div>

          <div style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            position: 'relative',
            backgroundColor: '#FDFBF9',
            borderRadius: isMobile ? '2px 8px 8px 2px' : '4px',
            boxShadow: '0 0 10px rgba(0,0,0,0.8), 1px 1px 0px #FDFBF9, 2px 2px 0px #E5E0D5, 3px 3px 0px #FDFBF9, 4px 4px 0px #E5E0D5, 5px 5px 0px #FDFBF9, 6px 6px 0px #E5E0D5, 7px 7px 0px #FDFBF9, 8px 8px 0px #E5E0D5, 12px 12px 25px rgba(0,0,0,0.6), inset 0 0 20px rgba(0,0,0,0.03)',
            perspective: '2500px', // Crucial for 3D page flip effect
            zIndex: 10,
          }}>

            {/* Central Binding Crease (Desktop Only) */}
            {!isMobile && (
              <div style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: '80px',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.3) 48%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.3) 52%, rgba(0,0,0,0.05) 70%, rgba(255,255,255,0) 100%)',
                zIndex: 30, // Extremely deep shadow overlay above text!
                pointerEvents: 'none',
              }} />
            )}

            {/* Touch navigation zones */}
            <div 
              onClick={goPrev}
              style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '15%', zIndex: 60, cursor: currentIndex > 0 ? 'w-resize' : 'default' }}
            />
            <div 
              onClick={goNext}
              style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '15%', zIndex: 60, cursor: currentIndex < maxIndex ? 'e-resize' : 'default' }}
            />

            {/* CSS Clip-path Page Peel Flip Simulation */}
            {!isMobile && flipping === 'next' && (
              <>
                {/* The actual flipping page - uses CSS keyframes clip-path peel */}
                <div className="flip-page-next" style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.06) 0%, rgba(255,255,255,0.5) 8%, rgba(0,0,0,0) 20%), ${PAPER_TEXTURE_SVG}` }}>
                  {/* Highlight glint that sweeps across the page as it lifts */}
                  <motion.div
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: '-20%', opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.1, ease: [0.645, 0.045, 0.355, 1.0] }}
                    style={{ position: 'absolute', top: 0, bottom: 0, width: '40%', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.7), transparent)', pointerEvents: 'none' }}
                  />
                </div>
                {/* Moving cast shadow on the left page */}
                <div className="flip-page-next-shadow" />
                {/* Spine light flash at the moment of crossing */}
                <div className="spine-glow" />
              </>
            )}

            {!isMobile && flipping === 'prev' && (
              <>
                <div className="flip-page-prev" style={{ backgroundImage: `linear-gradient(to left, rgba(0,0,0,0.06) 0%, rgba(255,255,255,0.5) 8%, rgba(0,0,0,0) 20%), ${PAPER_TEXTURE_SVG}` }}>
                  <motion.div
                    initial={{ x: '-100%', opacity: 0 }}
                    animate={{ x: '20%', opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.1, ease: [0.645, 0.045, 0.355, 1.0] }}
                    style={{ position: 'absolute', top: 0, bottom: 0, width: '40%', background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.7), transparent)', pointerEvents: 'none' }}
                  />
                </div>
                <div className="flip-page-prev-shadow" />
                <div className="spine-glow" />
              </>
            )}

            <div
              style={{
                display: 'flex',
                width: '100%',
                height: '100%',
              }}
            >
                {isMobile ? (
                  // Mobile: Single View
                  <PageContainer isMobile={true}>
                    {activePage.type === 'chapter' ? renderChapterMobile(activePage) 
                      : activePage.type === 'dedication' ? renderDedication()
                      : activePage.type === 'toc' ? renderTOC(activePage)
                      : renderEnd()
                    }
                  </PageContainer>
                ) : (
                  // Desktop: Spread View. If chapter, Left is Title/Image, Right is Content. Else centered spanning view or spread.
                  activePage.type === 'chapter' ? (
                    <>
                      <PageContainer isMobile={false} isLeftPage={true} scrollable={false}>
                        {renderChapterLeft(activePage)}
                      </PageContainer>
                      <PageContainer isMobile={false} isRightPage={true} scrollable={true}>
                        {renderChapterRight(activePage)}
                      </PageContainer>
                    </>
                  ) : (
                    <>
                      <PageContainer isMobile={false} isLeftPage={true} scrollable={false}>
                        {activePage.type === 'toc' ? renderTOC(activePage) : activePage.type === 'dedication' ? renderDedication() : <div />}
                      </PageContainer>
                      <PageContainer isMobile={false} isRightPage={true} scrollable={false}>
                        {activePage.type === 'end' ? renderEnd() : <div />}
                      </PageContainer>
                    </>
                  )
                )}
            </div>

          </div>
        </div>

        {/* External Navigation Controls */}
        <div style={{ 
          marginTop: '2.5rem', 
          display: 'flex', 
          gap: '2rem', 
          alignItems: 'center',
          fontFamily: 'var(--font-ui)',
          fontSize: '12px',
          letterSpacing: '0.1em',
          color: '#fff',
          opacity: 0.9
        }}>
          <button 
            onClick={goPrev} 
            disabled={currentIndex === 0}
            style={{ 
              background: 'rgba(0,0,0,0.4)', 
              border: '1px solid rgba(255,255,255,0.2)', 
              color: '#fff', 
              padding: '0.6rem 1.2rem', 
              borderRadius: '20px',
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentIndex === 0 ? 0.3 : 1,
              transition: 'all 0.2s ease',
            }}>
            &larr; PREV
          </button>
          
          <span style={{ background: 'rgba(0,0,0,0.4)', padding: '0.4rem 1rem', borderRadius: '15px' }}>
            {currentIndex + 1} / {flipPages.length}
          </span>
          
          <button 
            onClick={goNext} 
            disabled={currentIndex >= maxIndex}
            style={{ 
              background: 'rgba(0,0,0,0.4)', 
              border: '1px solid rgba(255,255,255,0.2)', 
              color: '#fff', 
              padding: '0.6rem 1.2rem', 
              borderRadius: '20px',
              cursor: currentIndex >= maxIndex ? 'not-allowed' : 'pointer',
              opacity: currentIndex >= maxIndex ? 0.3 : 1,
              transition: 'all 0.2s ease',
            }}>
            NEXT &rarr;
          </button>
        </div>
      </motion.div>
    </>
  );
}
