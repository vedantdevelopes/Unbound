import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BookReader from '@/components/BookReader';

export default async function ViewPublicBook({ params }: { params: Promise<{ bookId: string, id: string }> | { bookId: string, id: string } }) {
  const unwrappedParams = params instanceof Promise ? await params : params;
  const viewId = unwrappedParams.bookId;
  const trueBookId = unwrappedParams.id;

  // Verify the book belongs to the collection specified by viewId
  const { data: collection, error: colError } = await supabase
    .from('collections')
    .select('id, theme, recipient_name, sender_name')
    .eq('view_id', viewId)
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

  // Securely filter out drafts and sort remainder
  const pages = book.pages
    ?.filter((p: any) => p.is_published === true)
    .sort((a: any, b: any) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ) || [];

  const themeBackgrounds: any = {
      wood: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png"), linear-gradient(135deg, #4A3525, #2B1D14)',
      marble: 'url("https://www.transparenttextures.com/patterns/white-marble.png"), linear-gradient(135deg, #F5F5F5, #E0E0E0)',
      cafe: 'url("https://www.transparenttextures.com/patterns/dark-matter.png"), linear-gradient(135deg, #1A1A1A, #0D0D0D)'
  };
  const activeBackground = themeBackgrounds[collection.theme || 'wood'];

  return (
    <main className="page-wrapper relative" style={{ overflow: 'hidden', background: activeBackground, minHeight: '100vh', transition: 'background 0.5s ease' }}>
      <header className="header" style={{ justifyContent: 'space-between' }}>
        <Link href={`/v/${viewId}`} className="font-mono" style={{ textDecoration: 'none', color: collection.theme === 'marble' ? '#222' : '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>&larr; BACK TO SHELF</Link>
        <div className="logo font-serif-italic" style={{ color: collection.theme === 'marble' ? '#222' : '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>unbound</div>
        <div style={{ width: '130px' }}></div> 
      </header>

      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <BookReader pages={pages} bookTitle={book.title} collection={collection} />
      </div>
    </main>
  );
}
