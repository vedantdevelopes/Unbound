'use server';

import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { deriveKey, encryptField } from '@/lib/crypto';
import { randomUUID } from 'crypto';

export async function createCollection(formData: FormData) {
  const recipient_name = formData.get('recipient_name') as string;
  const sender_name = formData.get('sender_name') as string;
  const description = formData.get('description') as string;
  const theme = (formData.get('theme') as string) || 'wood';

  if (!recipient_name || !sender_name) {
    throw new Error('Required fields missing');
  }

  // Pre-generate UUID so we can derive the encryption key BEFORE inserting.
  // This ensures plaintext data NEVER touches the database.
  const id = randomUUID();
  const key = deriveKey(id);

  const { data, error } = await supabase
    .from('collections')
    .insert([{
      id,
      recipient_name: encryptField(recipient_name, key),
      sender_name: encryptField(sender_name, key),
      description: encryptField(description, key),
      theme,
    }])
    .select('edit_id')
    .single();

  if (error || !data) {
    console.error('Error creating collection:', error);
    throw new Error('Failed to create collection. Check your Supabase configuration.');
  }

  redirect(`/e/${data.edit_id}`);
}

export async function createBook(editId: string, coverImageUrl: string, formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const coverFile = formData.get('cover_file') as File | null;

  let finalCoverUrl = coverImageUrl || null;

  if (!title) {
    throw new Error('Title is required');
  }

  // Handle direct file upload to Supabase Storage if provided
  if (coverFile && coverFile.size > 0) {
    const fileExt = coverFile.name.split('.').pop();
    const fileName = `${editId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase
      .storage
      .from('covers')
      .upload(fileName, coverFile, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      console.error('File upload failed:', uploadError);
      throw new Error('Failed to upload cover image. Keep in mind you need to create a public "covers" bucket in Supabase storage.');
    }

    const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(fileName);
    finalCoverUrl = publicUrl;
  }

  // Fetch the collection — we need the id to derive the encryption key
  const { data: collection, error: colError } = await supabase
    .from('collections')
    .select('id')
    .eq('edit_id', editId)
    .single();

  if (colError || !collection) {
    throw new Error('Invalid collection edit link');
  }

  const key = deriveKey(collection.id);

  const { error } = await supabase
    .from('books')
    .insert([{
      collection_id: collection.id,
      title: encryptField(title, key),
      description: encryptField(description, key),
      cover_image_url: finalCoverUrl, // URLs left as plaintext (needed for <img> src)
    }]);

  if (error) {
    console.error('Error creating book:', error);
    throw new Error('Failed to create book');
  }

  redirect(`/e/${editId}`);
}

export async function addPage(editId: string, bookId: string, formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const submitAction = formData.get('action') as string;
  const polaroidFile = formData.get('polaroid_file') as File | null;

  // TipTap sends '<p></p>' as empty content — strip tags to check real length
  const strippedContent = content?.replace(/<[^>]*>/g, '').trim();
  if (!title || !strippedContent) {
    throw new Error('Title and content are both required');
  }

  const is_published = submitAction !== 'draft';
  const media_urls: string[] = [];

  if (polaroidFile && polaroidFile.size > 0) {
    const fileExt = polaroidFile.name.split('.').pop();
    const fileName = `${bookId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase
      .storage
      .from('polaroids')
      .upload(fileName, polaroidFile, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      console.error('File upload failed:', uploadError);
      throw new Error('Failed to upload polaroid. Keep in mind you need to create a public "polaroids" bucket in Supabase storage.');
    }

    const { data: { publicUrl } } = supabase.storage.from('polaroids').getPublicUrl(fileName);
    media_urls.push(publicUrl); // URLs left as plaintext (needed for <img> src)
  }

  // Fetch the collection id to derive the per-collection encryption key
  const { data: collection, error: colError } = await supabase
    .from('collections')
    .select('id')
    .eq('edit_id', editId)
    .single();

  if (colError || !collection) {
    throw new Error('Could not resolve collection for this book');
  }

  const key = deriveKey(collection.id);

  const { error } = await supabase
    .from('pages')
    .insert([{
      book_id: bookId,
      title: encryptField(title, key),
      content: encryptField(content, key),
      is_published,
      media_urls,
    }]);

  if (error) {
    console.error('Error adding page:', JSON.stringify(error));
    throw new Error(`Failed to add page: ${error.message}`);
  }

  redirect(`/e/${editId}/book/${bookId}`);
}
