import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { deriveKey, decryptField } from '@/lib/crypto';
import EditPageEditor from '@/components/EditPageEditor';

export default async function EditPageRoute({
  params,
}: {
  params: Promise<{ bookId: string; id: string; pageId: string }>;
}) {
  const { bookId: editId, id: trueBookId, pageId } = await params;

  // Verify collection ownership and get encryption key
  const { data: collection, error: colError } = await supabase
    .from('collections')
    .select('id')
    .eq('edit_id', editId)
    .single();

  if (colError || !collection) notFound();

  // Verify the book belongs to this collection
  const { data: book, error: bookError } = await supabase
    .from('books')
    .select('id')
    .eq('id', trueBookId)
    .eq('collection_id', collection.id)
    .single();

  if (bookError || !book) notFound();

  // Fetch the page
  const { data: page, error: pageError } = await supabase
    .from('pages')
    .select('id, title, content, is_published')
    .eq('id', pageId)
    .eq('book_id', trueBookId)
    .single();

  if (pageError || !page) notFound();

  // Decrypt fields before passing to client
  const key = deriveKey(collection.id);
  const decryptedTitle   = decryptField(page.title, key);
  const decryptedContent = decryptField(page.content, key);

  return (
    <EditPageEditor
      params={Promise.resolve({ bookId: editId, id: trueBookId, pageId })}
      initialTitle={decryptedTitle}
      initialContent={decryptedContent}
      initialPublished={page.is_published}
    />
  );
}
