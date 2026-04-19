"use client";

import React, { useState, useEffect, useRef } from "react";
// @ts-ignore
import HTMLFlipBook from "react-pageflip";

const PAPER_TEXTURE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E")`;

// ─── Subcomponents ────────────────────────────────────────────────────────────

const Page = React.forwardRef((props: any, ref: any) => {
  return (
    <div
      className="page"
      ref={ref}
      data-density="soft"
      style={{
        backgroundColor: "#FDFBF9",
        boxShadow: "inset 0 0 20px rgba(0,0,0,0.03)",
        position: "relative",
        height: "100%",
      }}
    >
      {/* Background paper texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: PAPER_TEXTURE_SVG,
          opacity: 0.15,
          pointerEvents: "none",
        }}
      />

      {/* The Magic Fix: Content is individually scrollable within the DOM node bounding box to completely eliminate pageflip overflow errors! */}
      <div
        className="hide-scroll"
        style={{
          height: "100%",
          overflowY: "auto",
          padding: props.padding || "2.5rem 3rem",
          position: "relative",
          zIndex: 10,
        }}
      >
        {props.children}
      </div>
    </div>
  );
});
Page.displayName = "Page";

const BookCover = React.forwardRef((props: any, ref: any) => {
  return (
    <div
      className="page page-cover"
      ref={ref}
      data-density="hard"
      style={{
        backgroundColor: "#38322e",
        position: "relative",
        height: "100%",
        // Hardcover texture
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E")`,
        boxShadow:
          "inset 0 0 30px rgba(0,0,0,0.8), inset 4px 0 10px rgba(0,0,0,0.6)", // deep spine shadow
      }}
    >
      <div
        style={{
          padding: "3rem",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#e8dccc",
        }}
      >
        {props.children}
      </div>
    </div>
  );
});
BookCover.displayName = "BookCover";

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BookReader({
  collection,
  pages: rawPages, // Expecting { id, title, content, is_published, media_urls }[]
  bookTitle,
  editId,
  trueBookId,
}: {
  collection?: any;
  pages: any[];
  bookTitle: string;
  editId?: string | null;
  trueBookId?: string | null;
}) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const bookRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const checkMedia = () => setIsMobile(window.innerWidth <= 768);
    checkMedia();
    window.addEventListener("resize", checkMedia);
    return () => window.removeEventListener("resize", checkMedia);
  }, []);

  if (!mounted) return null;

  const validPages = (rawPages || []).filter((p) => p.content?.trim() !== "");

  // ─── Assemble Array of Pages ───
  const pagesArray = [];

  // Front Cover
  pagesArray.push(
    <BookCover key="cover-front">
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "3.5rem",
          textAlign: "center",
          marginBottom: "2.5rem",
          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
        }}
      >
        {bookTitle}
      </h1>
      <div
        style={{
          width: "50px",
          height: "2px",
          background: "rgba(255,255,255,0.2)",
          marginBottom: "2rem",
        }}
      />
      <p
        style={{
          fontFamily: "var(--font-instrument)",
          fontSize: "1.5rem",
          fontStyle: "italic",
          opacity: 0.8,
        }}
      >
        By {collection?.sender_name || "Anonymous"}
      </p>
    </BookCover>,
  );

  // Inside Front Cover
  if (!isMobile) {
    pagesArray.push(
      <Page key="cover-inside-front" padding="0">
        {/* Blank */}
      </Page>,
    );
  }

  // Dedication
  pagesArray.push(
    <Page key="dedication">
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-instrument)",
            fontSize: "2rem",
            fontStyle: "italic",
            color: "#4a3d35",
          }}
        >
          For {collection?.recipient_name || "You"},<br />
          with love
        </p>
        <div style={{ marginTop: "2.5rem", fontSize: "1.5rem", opacity: 0.3 }}>
          ❧
        </div>
      </div>
    </Page>,
  );

  // TOC
  pagesArray.push(
    <Page key="toc">
      <h2
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "2.5rem",
          marginBottom: "4rem",
          textAlign: "center",
          color: "#2a2626",
        }}
      >
        Contents
      </h2>
      <div style={{ padding: "0 1rem" }}>
        {validPages.map((p, i) => (
          <div
            key={p.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1.2rem",
              borderBottom: "1px dotted rgba(0,0,0,0.15)",
              paddingBottom: "0.3rem",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-inter)",
                color: "#3a3431",
                fontWeight: 500,
                letterSpacing: "0.05em",
              }}
            >
              {i + 1}. {p.title}
            </span>
          </div>
        ))}
      </div>
    </Page>,
  );

  // Chapters
  validPages.forEach((page, i) => {
    if (!isMobile) {
      // Desktop: Dedicated Title Page on Left
      pagesArray.push(
        <Page key={`${page.id}-title`}>
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-ui)",
                opacity: 0.4,
                letterSpacing: "0.25em",
                fontSize: "0.85rem",
                marginBottom: "2rem",
              }}
            >
              CHAPTER {i + 1}
            </span>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "3rem",
                textAlign: "center",
                color: "#2a2626",
                padding: "0 2rem",
                lineHeight: 1.2,
              }}
            >
              {page.title}
            </h2>
          </div>
        </Page>,
      );
    }

    // Content page (scrollable internal overflow to completely squash text bleeding bugs)
    pagesArray.push(
      <Page key={`${page.id}-content`}>
        {isMobile && (
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "2.2rem",
              marginBottom: "2.5rem",
              color: "#2a2626",
              textAlign: "center",
            }}
          >
            {page.title}
          </h2>
        )}
        <div
          className="tiptap-body drop-cap-enabled custom-scroll"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
        <div
          style={{
            marginTop: "3rem",
            textAlign: "center",
            fontSize: "1.5rem",
            opacity: 0.2,
          }}
        >
          ❧
        </div>
      </Page>,
    );
  });

  // Ensure Even Pages for Desktop Back Cover
  if (!isMobile && pagesArray.length % 2 !== 0) {
    pagesArray.push(<Page key="blank-padding" />);
  }

  // Back Cover
  pagesArray.push(
    <BookCover key="cover-back">
      <div style={{ fontSize: "3rem", opacity: 0.5, letterSpacing: "0.5em" }}>
        ✦ ✦ ✦
      </div>
    </BookCover>,
  );

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
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
          font-size: 5.5rem;
          line-height: 0.8;
          padding-top: 0.3rem;
          padding-right: 0.7rem;
          margin-bottom: -0.3rem;
          color: #a33327;
        }
        
        .tiptap-body {
          font-family: var(--font-inter);
          font-size: 1.05rem;
          line-height: 1.8;
          color: #3a3431;
          text-align: justify;
          hyphens: auto;
        }
        .tiptap-body p { margin-bottom: 1.3em; }
        .tiptap-body p:last-child { margin-bottom: 0; }
        .tiptap-body blockquote {
          border-left: 2px solid #a33327;
          padding-left: 1.2rem;
          margin: 2.5rem 0;
          font-style: italic;
          color: #6a5f57;
          background: rgba(0,0,0,0.02);
          padding: 1.5rem;
          border-radius: 0 4px 4px 0;
        }
        .tiptap-body h3 {
          font-family: var(--font-heading);
          font-size: 1.6rem;
          margin-top: 2.5rem;
          margin-bottom: 1.2rem;
          color: #2a2626;
        }
        .tiptap-body hr {
          border: none;
          text-align: center;
          color: #b0a89a;
          margin: 2.5rem 0;
        }
        .tiptap-body hr::after { content: '✦ ✦ ✦'; font-size: 0.7rem; letter-spacing: 0.5em; }
        .tiptap-body strong { color: #2a2626; }
      `,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          minHeight: "80vh",
          padding: isMobile ? "1rem" : "2rem",
        }}
      >
        {/* Enclosure to look like physical casing and act as bounding box */}
        <div
          style={{
            padding: isMobile ? "4px" : "10px 15px",
            backgroundColor: "#38322e",
            borderRadius: isMobile ? "6px 12px 12px 6px" : "12px",
            boxShadow:
              "0 30px 80px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.4)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              mixBlendMode: "overlay",
              opacity: 0.3,
              pointerEvents: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Premium Ribbon Bookmark */}
          <div
            style={{
              position: "absolute",
              top: "-8px",
              right: "25px",
              width: "32px",
              height: "140px",
              background:
                "linear-gradient(to right, #8a291f 0%, #a33327 20%, #bf4030 50%, #a33327 80%, #8a291f 100%)",
              clipPath:
                "polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - 15px), 0 100%)",
              filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.5))",
              zIndex: 100,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "0 4px",
                borderLeft: "1px dashed rgba(255,255,255,0.2)",
                borderRight: "1px dashed rgba(255,255,255,0.2)",
              }}
            />
          </div>

          <HTMLFlipBook
            width={isMobile ? 360 : 450}
            height={isMobile ? 550 : 650}
            size="stretch"
            minWidth={300}
            maxWidth={isMobile ? 1000 : 550}
            minHeight={400}
            maxHeight={1000}
            maxShadowOpacity={0.6}
            showCover={true}
            mobileScrollSupport={true}
            className="flip-book"
            ref={bookRef}
            style={{ margin: "0 auto" }}
          >
            {pagesArray}
          </HTMLFlipBook>
        </div>

        {/* Global Controls - Optional, PageFlip has corner dragging by default! */}
        <div
          style={{
            marginTop: "2.5rem",
            display: "flex",
            gap: "2rem",
            fontFamily: "var(--font-ui)",
            fontSize: "12px",
            letterSpacing: "0.15em",
            color: "var(--text-secondary)",
            opacity: 0.8,
          }}
        >
          <button
            onClick={() => {
              if (bookRef.current)
                (bookRef.current as any).pageFlip().flipPrev();
            }}
            className="hover-glow"
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              padding: "1rem",
            }}
          >
            &larr; FLIP PREV
          </button>
          <button
            onClick={() => {
              if (bookRef.current)
                (bookRef.current as any).pageFlip().flipNext();
            }}
            className="hover-glow"
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              padding: "1rem",
            }}
          >
            FLIP NEXT &rarr;
          </button>
        </div>
      </div>
    </>
  );
}
