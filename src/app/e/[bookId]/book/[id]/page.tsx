import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function BookPagesDashboard({ params }: { params: Promise<{ bookId: string, id: string }> | { bookId: string, id: string } }) {
  const unwrappedParams = params instanceof Promise ? await params : params;
  const editId = unwrappedParams.bookId;
  const trueBookId = unwrappedParams.id;

  // Verify the book belongs to the collection specified by editId
  const { data: collection, error: colError } = await supabase
    .from('collections')
    .select('id, recipient_name')
    .eq('edit_id', editId)
    .single();

  if (colError || !collection) {
    notFound();
  }

  const { data: book, error } = await supabase
    .from('books')
    .select('*, pages(*)')
    .eq('id', trueBookId)
    .eq('collection_id', collection.id)
    .single();

  if (error || !book) {
    notFound();
  }

  // Sort pages
  const pages = book.pages?.sort((a: any, b: any) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  ) || [];

  return (
    <main className="page-wrapper relative">
      <header className="header" style={{ borderBottom: '1px solid var(--border)' }}>
        <Link href={`/e/${editId}`} className="font-mono" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>&larr; LIBRARY</Link>
        <Link href="/" className="logo font-serif-italic">unbound</Link>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href={`/e/${editId}/book/${trueBookId}/new`} className="btn-secondary">
             WRITE PAGE
          </Link>
        </div>
      </header>

      <div className="container" style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h1 className="font-heading" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          {book.title}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>{pages.length} pages in this book</p>
        
        <div style={{ marginTop: '4rem' }}>
          {pages.length === 0 ? (
            <div>
              <p className="font-mono" style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                THE PAGES ARE BLANK. START WRITING!
              </p>
              <Link href={`/e/${editId}/book/${trueBookId}/new`} className="btn-primary">
                + WRITE FIRST PAGE
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
              {pages.map((page: any, index: number) => (
                <div key={page.id} className="page-card" style={{ 
                  width: '300px', 
                  height: '400px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  flexDirection: 'column',
                  opacity: page.is_published ? 1 : 0.7,
                  border: page.is_published ? 'auto' : '1px dashed var(--border)',
                  position: 'relative'
                }}>
                  {!page.is_published && (
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--accent)', color: 'white', padding: '0.2rem 0.6rem', fontSize: '10px', borderRadius: '4px', letterSpacing: '0.1em' }} className="font-ui">
                      DRAFT
                    </div>
                  )}
                  <h3 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '1rem', paddingRight: !page.is_published ? '3rem' : '0' }}>
                    {page.title}
                  </h3>
                  <div style={{ flex: 1, overflow: 'hidden', color: 'var(--text-secondary)', textAlign: 'left', WebkitMaskImage: 'linear-gradient(180deg, #000 60%, transparent)' }}>
                    {page.content}
                  </div>
                  <div className="label" style={{ marginTop: '1rem', textAlign: 'right' }}>Page {index + 1}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
