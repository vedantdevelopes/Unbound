'use client';

import { createBook } from '@/app/actions';
import Link from 'next/link';
import { use, useState } from 'react';

export default function NewBookEditor({ params }: { params: Promise<{ bookId: string }> | { bookId: string } }) {
  const unwrappedParams = params instanceof Promise ? use(params) : params;
  const editId = unwrappedParams.bookId; // using bookId because the folder path is still [bookId]
  
  const [title, setTitle] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // We bind the editId and coverUrl to the server action
  const formAction = createBook.bind(null, editId, coverUrl);

  return (
    <main className="page-wrapper relative">
      <header className="header">
        <Link href={`/e/${editId}`} className="font-mono" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>&larr; BACK</Link>
        <Link href="/" className="logo font-serif-italic">unbound</Link>
        <div style={{ width: '60px' }}></div>
      </header>

      <div className="form-container" style={{ maxWidth: '600px' }}>
        <h1 className="form-header font-heading" style={{ marginBottom: '1.5rem' }}>add a new book</h1>
        
        <form action={formAction} className="flex flex-col">
          
          <div className="page-card" style={{ padding: '3rem', marginBottom: '2rem' }}>
            <div>
              <label className="label" style={{ color: 'var(--accent)' }}>BOOK TITLE</label>
              <input 
                type="text" 
                name="title" 
                placeholder="e.g., 2024 Memories"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, padding: '1rem 0', boxShadow: 'none' }}
              />
            </div>

            <div style={{ marginTop: '2rem' }}>
              <label className="label" style={{ color: 'var(--accent)' }}>DESCRIPTION (OPTIONAL)</label>
              <input 
                type="text" 
                name="description" 
                placeholder="A short tagline for the spine..."
                style={{ border: 'none', borderBottom: '1px solid transparent', fontSize: '1.1rem' }}
                onFocus={(e) => e.target.style.borderBottom = '1px solid var(--accent)'}
                onBlur={(e) => e.target.style.borderBottom = '1px solid transparent'}
              />
            </div>

            <div style={{ marginTop: '2rem' }}>
              <label className="label" style={{ color: 'var(--accent)' }}>COVER IMAGE</label>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Upload a picture from your device, OR paste a direct image URL.
              </p>

              {/* File Upload Variant */}
              <div style={{ padding: '1rem', border: '1px dashed var(--border)', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
                <input 
                  type="file" 
                  name="cover_file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCoverUrl(URL.createObjectURL(file));
                    }
                  }}
                  id="cover_file"
                  style={{ display: 'none' }}
                />
                <label htmlFor="cover_file" className="btn-secondary" style={{ display: 'inline-block', cursor: 'pointer' }}>
                  CHOOSE FILE
                </label>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <span className="label" style={{ fontSize: '10px' }}>— OR PASTE URL —</span>
              </div>

              <input 
                type="url" 
                placeholder="https://..."
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                style={{ border: 'none', borderBottom: '1px solid transparent', fontSize: '0.9rem', width: '100%' }}
                onFocus={(e) => e.target.style.borderBottom = '1px solid var(--accent)'}
                onBlur={(e) => e.target.style.borderBottom = '1px solid transparent'}
              />
              
              {/* Image Preview */}
              {coverUrl && (
                  <div style={{ marginTop: '1.5rem', height: '250px', width: '100%', borderRadius: '8px', backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)' }}></div>
              )}
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ alignSelf: 'center', padding: '1rem 3rem', fontSize: '16px' }}>
            CREATE BOOK &rarr;
          </button>
        </form>
      </div>
    </main>
  );
}
