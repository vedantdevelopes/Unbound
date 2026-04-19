'use client';

import { updatePage } from '@/app/actions';
import Link from 'next/link';
import { use, useState } from 'react';
import RichTextEditor from '@/components/RichTextEditor';

interface Props {
  params: Promise<{ bookId: string; id: string; pageId: string }> | { bookId: string; id: string; pageId: string };
  initialTitle: string;
  initialContent: string;
  initialPublished: boolean;
}

export default function EditPageEditor({ params, initialTitle, initialContent, initialPublished }: Props) {
  const unwrappedParams = params instanceof Promise ? use(params) : params;
  const editId     = unwrappedParams.bookId;
  const trueBookId = unwrappedParams.id;
  const pageId     = unwrappedParams.pageId;

  const [title, setTitle]     = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  const formAction = updatePage.bind(null, editId, trueBookId, pageId);

  return (
    <main className="page-wrapper relative">
      <header className="header">
        <Link
          href={`/e/${editId}/book/${trueBookId}`}
          className="font-mono"
          style={{ textDecoration: 'none', color: 'var(--text-primary)' }}
        >
          &larr; BACK TO BOOK
        </Link>
        <Link href="/" className="logo font-serif-italic">unbound</Link>
        <div style={{ width: '130px' }} />
      </header>

      <div className="form-container" style={{ maxWidth: '800px' }}>
        <h1 className="form-header font-heading" style={{ marginBottom: '0.5rem' }}>edit this page</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
          Changes are saved immediately when you click below.&nbsp;
          {initialPublished
            ? 'This page is currently published and visible to readers.'
            : 'This page is currently a draft and hidden from readers.'}
        </p>

        <form action={formAction} className="flex flex-col">
          <div className="page-card" style={{ padding: '3rem', marginBottom: '2rem' }}>

            {/* Title */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="label" htmlFor="edit-title" style={{ color: 'var(--accent)' }}>PAGE TITLE</label>
                <span className="label" style={{ color: title.length === 65 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {title.length}/65
                </span>
              </div>
              <input
                type="text"
                id="edit-title"
                name="title"
                placeholder="e.g., the day we met"
                required
                maxLength={65}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  fontSize: '2rem',
                  fontFamily: 'var(--font-heading)',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  borderRadius: 0,
                  padding: '1rem 0',
                  boxShadow: 'none',
                  width: '100%',
                  background: 'transparent',
                  color: 'inherit',
                }}
              />
            </div>

            {/* Content */}
            <div style={{ marginTop: '2rem' }}>
              <label className="label" style={{ color: 'var(--accent)' }}>CONTENT</label>
              <RichTextEditor
                key={pageId}
                content={content}
                onChange={(html) => setContent(html)}
              />
              <input type="hidden" name="content" value={content} />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="submit"
              name="action"
              value="draft"
              className="btn-secondary"
              style={{ padding: '1rem 3rem', fontSize: '16px' }}
            >
              SAVE AS DRAFT
            </button>
            <button
              type="submit"
              name="action"
              value="publish"
              className="btn-primary"
              style={{ padding: '1rem 3rem', fontSize: '16px' }}
            >
              {initialPublished ? 'SAVE & REPUBLISH →' : 'PUBLISH PAGE →'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
