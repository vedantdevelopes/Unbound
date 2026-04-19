'use client';

import { useRef, forwardRef, useMemo } from 'react';
import dynamic from 'next/dynamic';

const HTMLFlipBook = dynamic(() => import('react-pageflip').then(mod => mod.default as any), { ssr: false });

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Split HTML into page-sized chunks based on approximate character count. */
function paginateHtml(html: string, charsPerPage = 720): string[] {
  if (!html) return [''];
  // Match <p>, <h3>, <blockquote>, <ul>, <ol>, <hr> blocks
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

/** Convert integer to Roman numeral (up to 39). */
function toRoman(n: number): string {
  const vals = [10, 9, 5, 4, 1];
  const syms = ['X', 'IX', 'V', 'IV', 'I'];
  let r = '';
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { r += syms[i]; n -= vals[i]; }
  }
  return r;
}

// ─── Page base shared style ───────────────────────────────────────────────────
function pageBase(isLeft: boolean): React.CSSProperties {
  return {
    backgroundColor: '#f6f3ee',
    backgroundImage: `
      linear-gradient(to ${isLeft ? 'right' : 'left'}, rgba(0,0,0,0.09) 0%, rgba(0,0,0,0) 9%, rgba(0,0,0,0) 100%),
      url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")
    `,
    borderLeft:  isLeft ? '1px solid rgba(0,0,0,0.08)' : 'none',
    borderRight: isLeft ? 'none' : '1px solid rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    height: '100%',
    boxSizing: 'border-box' as const,
    padding: '2rem 2.2rem',
  };
}

// ─── Dedication Page (Page 0) ─────────────────────────────────────────────────
const DedicationPage = forwardRef<HTMLDivElement, { collection: { recipient_name: string; sender_name: string }; bookTitle: string }>((props, ref) => (
  <div ref={ref} style={{ ...pageBase(false), justifyContent: 'center', alignItems: 'center' }}>
    <div style={{ textAlign: 'center', color: '#4a3d35' }}>
      <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '3rem', lineHeight: 1.4, opacity: 0.85, transform: 'rotate(-2deg)' }}>
        <p>For {props.collection.recipient_name},</p>
        <p style={{ fontSize: '1.8rem', marginTop: '1rem', opacity: 0.8 }}>with love</p>
        <p style={{ fontSize: '1.5rem', opacity: 0.7 }}>from {props.collection.sender_name}</p>
      </div>
      <div style={{ marginTop: '3rem', fontSize: '1.5rem', opacity: 0.3 }}>❧</div>
    </div>
  </div>
));
DedicationPage.displayName = 'DedicationPage';

// ─── TOC Page ────────────────────────────────────────────────────────────────
const TOCPage = forwardRef<HTMLDivElement, { chapters: { title: string; pageNum: number }[] }>((props, ref) => (
  <div ref={ref} style={{ ...pageBase(true) }}>
    {/* Running header */}
    <div style={{ fontFamily: 'var(--font-ui)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#b0a89a', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '0.6rem', marginBottom: '2rem' }}>
      Contents
    </div>

    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: '#2a2626' }}>Contents</div>
      <div style={{ marginTop: '0.5rem', fontSize: '1.2rem', opacity: 0.3 }}>❧</div>
    </div>

    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      {props.chapters.map((ch, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: '#b0a89a', minWidth: '28px', letterSpacing: '0.05em' }}>
            {toRoman(i + 1)}.
          </span>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.9rem', color: '#3a3431', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {ch.title}
          </span>
          {/* Dot leader */}
          <span style={{ flex: 0, borderBottom: '1px dotted rgba(0,0,0,0.2)', flexGrow: 1, marginBottom: '4px', minWidth: '20px' }} />
          <span style={{ fontFamily: 'var(--font-instrument)', fontSize: '0.9rem', color: '#b0a89a' }}>
            {ch.pageNum}
          </span>
        </div>
      ))}
    </div>

    <div style={{ marginTop: 'auto', textAlign: 'left', fontFamily: 'var(--font-instrument)', fontSize: '1rem', color: '#c0b8af', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '0.5rem' }}>
      ii
    </div>
  </div>
));
TOCPage.displayName = 'TOCPage';

// ─── Chapter Title Page ───────────────────────────────────────────────────────
const ChapterTitlePage = forwardRef<HTMLDivElement, { chapterNum: number; chapterTitle: string; bookTitle: string; pageNum: number }>((props, ref) => {
  const isLeft = props.pageNum % 2 === 0;
  return (
    <div ref={ref} style={{ ...pageBase(isLeft), justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', color: '#4a3d35' }}>
        {/* Chapter label */}
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b0a89a', marginBottom: '1.5rem' }}>
          Chapter {toRoman(props.chapterNum)}
        </div>
        {/* Ornament */}
        <div style={{ fontSize: '1.2rem', opacity: 0.25, marginBottom: '1.5rem' }}>✦</div>
        {/* Chapter title */}
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 3vw, 2.8rem)', lineHeight: 1.15, color: '#2a2626', maxWidth: '320px', margin: '0 auto' }}>
          {props.chapterTitle}
        </div>
        {/* Rule */}
        <div style={{ margin: '1.5rem auto', width: '60px', height: '1px', backgroundColor: 'rgba(0,0,0,0.2)' }} />
      </div>
      {/* Page number */}
      <div style={{ position: 'absolute', bottom: '2rem', width: '100%', textAlign: 'center', fontFamily: 'var(--font-instrument)', fontSize: '0.9rem', color: '#c0b8af' }}>
        {props.pageNum}
      </div>
    </div>
  );
});
ChapterTitlePage.displayName = 'ChapterTitlePage';

// ─── Content Page ─────────────────────────────────────────────────────────────
const ContentPage = forwardRef<HTMLDivElement, {
  html: string;
  chapterTitle: string;
  bookTitle: string;
  pageNum: number;
  isFirstContent: boolean;
  mediaUrls?: string[];
}>((props, ref) => {
  const { pageNum, html, chapterTitle, bookTitle, isFirstContent, mediaUrls } = props;
  const isLeft = pageNum % 2 === 0;

  return (
    <div ref={ref} style={{ ...pageBase(isLeft) }}>
      {/* Running header */}
      <div style={{
        display: 'flex',
        justifyContent: isLeft ? 'flex-start' : 'flex-end',
        fontFamily: 'var(--font-ui)',
        fontSize: '9px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: '#b0a89a',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        paddingBottom: '0.6rem',
        marginBottom: '1.2rem',
      }}>
        {isLeft ? bookTitle : chapterTitle}
      </div>

      {/* Polaroid — only on first content page of each chapter */}
      {isFirstContent && mediaUrls && mediaUrls.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{
            padding: '8px 8px 24px 8px',
            background: 'white',
            boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
            transform: 'rotate(-1.5deg)',
          }}>
            <img src={mediaUrls[0]} alt="Memory" style={{ width: '160px', height: '160px', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      )}

      {/* Content */}
      <div
        className={isFirstContent ? 'drop-cap-enabled tiptap-body' : 'tiptap-body'}
        style={{
          flex: 1,
          overflow: 'hidden',
          fontFamily: 'var(--font-inter)',
          fontSize: 'clamp(0.85rem, 1.3vw, 0.98rem)',
          lineHeight: '1.85',
          color: '#3a3431',
          textAlign: 'justify',
          hyphens: 'auto',
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Footer: page number */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '0.8rem',
        borderTop: '1px solid rgba(0,0,0,0.07)',
        display: 'flex',
        justifyContent: isLeft ? 'flex-start' : 'flex-end',
      }}>
        <span style={{ fontFamily: 'var(--font-instrument)', fontSize: '0.9rem', color: '#c0b8af' }}>
          {pageNum}
        </span>
      </div>
    </div>
  );
});
ContentPage.displayName = 'ContentPage';

// ─── End Page ─────────────────────────────────────────────────────────────────
const EndPage = forwardRef<HTMLDivElement, { senderName?: string }>((props, ref) => (
  <div ref={ref} style={{ ...pageBase(true), justifyContent: 'center', alignItems: 'center' }}>
    <div style={{ textAlign: 'center', color: '#4a3d35' }}>
      <div style={{ fontFamily: 'var(--font-instrument)', fontSize: '2.5rem', letterSpacing: '0.05em', color: '#2a2626' }}>
        — fin —
      </div>
      {props.senderName && (
        <div style={{ marginTop: '2rem', fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b0a89a' }}>
          written with love by {props.senderName}
        </div>
      )}
      <div style={{ marginTop: '2.5rem', fontSize: '1.5rem', opacity: 0.2 }}>❧</div>
    </div>
  </div>
));
EndPage.displayName = 'EndPage';

// ─── BookReader ───────────────────────────────────────────────────────────────
interface PageData {
  id: string;
  title: string;
  content: string;
  media_urls?: string[];
}

export default function BookReader({
  pages,
  bookTitle,
  collection,
}: {
  pages: PageData[];
  bookTitle: string;
  collection?: { recipient_name: string; sender_name: string; theme?: string };
}) {
  const flipAudioRef = useRef<HTMLAudioElement>(null);

  const onFlip = () => {
    if (flipAudioRef.current) {
      flipAudioRef.current.currentTime = 0;
      flipAudioRef.current.volume = 0.4;
      flipAudioRef.current.play().catch(() => {});
    }
  };

  // ── Build the flat list of flip pages with running page numbers ──────────
  interface FlipPageDef {
    type: 'dedication' | 'toc' | 'chapter-title' | 'content' | 'end';
    pageNum: number;          // visual page number
    chapterNum?: number;
    chapterTitle?: string;
    html?: string;
    isFirstContent?: boolean;
    mediaUrls?: string[];
  }

  const { flipPages, tocChapters } = useMemo(() => {
    const flip: FlipPageDef[] = [];
    let visual = 0; // visual page number counter

    // 0: Dedication
    flip.push({ type: 'dedication', pageNum: ++visual });

    // 1: TOC (will fill in later with correct page numbers)
    const tocIndex = flip.length;
    flip.push({ type: 'toc', pageNum: ++visual });

    const toc: { title: string; pageNum: number }[] = [];

    for (let ci = 0; ci < pages.length; ci++) {
      const page = pages[ci];

      // Chapter title page
      const chapterPageNum = ++visual;
      flip.push({ type: 'chapter-title', pageNum: chapterPageNum, chapterNum: ci + 1, chapterTitle: page.title });
      toc.push({ title: page.title, pageNum: chapterPageNum });

      // Paginated content
      const chunks = paginateHtml(page.content);
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

    // End page
    flip.push({ type: 'end', pageNum: ++visual });

    // Patch TOC page with chapterMap
    (flip[tocIndex] as FlipPageDef & { chapters?: typeof toc }).chapters = toc;

    return { flipPages: flip, tocChapters: toc };
  }, [pages]);

  if (pages.length === 0) {
    return (
      <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '20vh', fontFamily: 'var(--font-mono)' }}>
        This book has no pages yet.
      </div>
    );
  }

  return (
    <>
      <audio ref={flipAudioRef} src="https://www.soundjay.com/misc/sounds/page-flip-01a.mp3" preload="auto" />

      <style dangerouslySetInnerHTML={{ __html: `
        .drop-cap-enabled > p:first-child::first-letter {
          font-family: var(--font-instrument);
          float: left;
          font-size: 4.2rem;
          line-height: 0.75;
          margin-right: 0.5rem;
          margin-bottom: -0.2rem;
          color: var(--accent);
        }
        .tiptap-body p { margin-bottom: 0.7em; }
        .tiptap-body p:last-child { margin-bottom: 0; }
        .tiptap-body blockquote {
          border-left: 2px solid var(--accent);
          padding-left: 0.8rem;
          margin-left: 0;
          font-style: italic;
          color: #6a5f57;
        }
        .tiptap-body h3 {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          margin-top: 1rem;
          margin-bottom: 0.4rem;
          color: #2a2626;
        }
        .tiptap-body hr {
          border: none;
          text-align: center;
          color: #b0a89a;
          margin: 1rem 0;
        }
        .tiptap-body hr::after { content: '✦ ✦ ✦'; font-size: 0.7rem; }
        .tiptap-body strong { color: #2a2626; }
      ` }} />

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '1rem' }}>
        {/* Outer book casing */}
        <div style={{
          boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.3)',
          borderRadius: '6px 18px 18px 6px',
          backgroundColor: '#1a2228',
          backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-linen.png")',
          padding: '10px',
          position: 'relative',
        }}>
          {/* Ribbon bookmark */}
          <div style={{
            position: 'absolute', bottom: '-28px', right: '70px',
            width: '22px', height: '56px',
            backgroundColor: '#a33327',
            boxShadow: '2px 4px 8px rgba(0,0,0,0.35)',
            zIndex: 0,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)',
          }} />

          <div style={{ zIndex: 1, position: 'relative' }}>
            {/* @ts-expect-error - react-pageflip lacks TypeScript types */}
            <HTMLFlipBook
              width={420}
              height={620}
              size="stretch"
              minWidth={280}
              maxWidth={560}
              minHeight={380}
              maxHeight={760}
              maxShadowOpacity={0.5}
              showCover={false}
              mobileScrollSupport={true}
              onFlip={onFlip}
            >
              {flipPages.map((fp, i) => {
                if (fp.type === 'dedication') {
                  return collection
                    ? <DedicationPage key={i} collection={collection} bookTitle={bookTitle} />
                    : <div key={i} />;
                }

                if (fp.type === 'toc') {
                  return <TOCPage key={i} chapters={(fp as FlipPageDef & { chapters: typeof tocChapters }).chapters ?? tocChapters} />;
                }

                if (fp.type === 'chapter-title') {
                  return (
                    <ChapterTitlePage
                      key={i}
                      chapterNum={fp.chapterNum!}
                      chapterTitle={fp.chapterTitle!}
                      bookTitle={bookTitle}
                      pageNum={fp.pageNum}
                    />
                  );
                }

                if (fp.type === 'content') {
                  return (
                    <ContentPage
                      key={i}
                      html={fp.html ?? ''}
                      chapterTitle={fp.chapterTitle ?? ''}
                      bookTitle={bookTitle}
                      pageNum={fp.pageNum}
                      isFirstContent={fp.isFirstContent ?? false}
                      mediaUrls={fp.mediaUrls}
                    />
                  );
                }

                if (fp.type === 'end') {
                  return <EndPage key={i} senderName={collection?.sender_name} />;
                }

                return <div key={i} />;
              })}
            </HTMLFlipBook>
          </div>
        </div>
      </div>
    </>
  );
}
