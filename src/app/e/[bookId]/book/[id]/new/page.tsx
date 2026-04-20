'use client';

import { addPage } from '@/app/actions';
import Link from 'next/link';
import { use, useState } from 'react';
import RichTextEditor from '@/components/RichTextEditor';
import PageTemplates from '@/components/PageTemplates';

export default function NewPageEditor({ params }: { params: Promise<{ bookId: string, id: string }> | { bookId: string, id: string } }) {
  const unwrappedParams = params instanceof Promise ? use(params) : params;
  const editId = unwrappedParams.bookId;
  const trueBookId = unwrappedParams.id;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [polaroidPreview, setPolaroidPreview] = useState('');

  // We bind the editId and trueBookId to the server action
  const formAction = addPage.bind(null, editId, trueBookId);

  return (
    <main className="page-wrapper relative">
      <header className="header">
        <Link href={`/e/${editId}/book/${trueBookId}`} className="font-mono" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>&larr; BACK TO BOOK</Link>
        <Link href="/" className="logo font-serif-italic">unbound</Link>
        <div style={{ width: '130px' }}></div> 
      </header>

      <div className="form-container" style={{ maxWidth: '800px' }}>
        <h1 className="form-header font-heading" style={{ marginBottom: '1.5rem' }}>write a new page</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Take your time. This will instantly be added to your book.
        </p>

        <form action={formAction} className="flex flex-col">

          <PageTemplates onSelect={(tmplTitle, tmplHtml) => { setTitle(tmplTitle); setContent(tmplHtml); }} />

          <div className="page-card" style={{ padding: '3rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="label" htmlFor="title" style={{ color: 'var(--accent)' }}>PAGE TITLE</label>
                <span className="label" style={{ color: title.length === 65 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{title.length}/65</span>
              </div>
              <input 
                type="text" 
                id="title"
                name="title" 
                placeholder="e.g., the day we met"
                required
                maxLength={65}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, padding: '1rem 0', boxShadow: 'none' }}
              />
            </div>

            <div style={{ marginTop: '2rem' }}>
               <label className="label" style={{ color: 'var(--accent)' }}>CONTENT</label>
               {/* Minimalist TipTap Editor */}
               <RichTextEditor 
                  content={content} 
                  onChange={(html) => setContent(html)} 
               />
               <input type="hidden" name="content" value={content} />
            </div>

            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
              <label className="label" style={{ color: 'var(--accent)', display: 'block', marginBottom: '1rem' }}>ATTACH POLAROID (OPTIONAL)</label>
              
              <div style={{ padding: '1rem', border: '1px dashed var(--border)', borderRadius: '8px', textAlign: 'center' }}>
                <input 
                  type="file" 
                  name="polaroid_file" 
                  accept="image/*"
                  id="polaroid_file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPolaroidPreview(URL.createObjectURL(file));
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <label htmlFor="polaroid_file" className="btn-secondary" style={{ display: 'inline-block', cursor: 'pointer' }}>
                  CHOOSE PHOTO
                </label>
              </div>
              
              {polaroidPreview && (
                  <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ 
                        padding: '10px 10px 30px 10px', 
                        background: 'white', 
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
                        transform: 'rotate(-2deg)',
                        width: 'fit-content'
                    }}>
                        <img src={polaroidPreview} alt="Polaroid Preview" style={{ width: '250px', height: '250px', objectFit: 'cover' }} />
                    </div>
                  </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
            <button type="submit" name="action" value="draft" className="btn-secondary" style={{ padding: '1rem 3rem', fontSize: '16px' }}>
              SAVE AS DRAFT
            </button>
            <button type="submit" name="action" value="publish" className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '16px' }}>
              PUBLISH PAGE &rarr;
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
