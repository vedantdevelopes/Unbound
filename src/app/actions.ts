'use server';

import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { deriveKey, encryptField, decryptField } from '@/lib/crypto';
import { randomUUID, createHash } from 'crypto';
import { cookies, headers } from 'next/headers';

// ── Rate Limiter (in-memory, per-process) ───────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// ── File Upload Validation ──────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function validateUploadedFile(file: File): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 5MB.`);
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type "${file.type}". Allowed: JPEG, PNG, WebP, GIF, AVIF.`);
  }
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.{2,}/g, '.');
}

export async function createCollection(formData: FormData) {
  const recipient_name = formData.get('recipient_name') as string;
  const sender_name = formData.get('sender_name') as string;
  const description = formData.get('description') as string;
  const theme = (formData.get('theme') as string) || 'wood';
  const unlock_at_raw = formData.get('unlock_at') as string | null;
  const pin_raw = formData.get('access_pin') as string | null;
  const bottle_mode = formData.get('bottle_mode') === 'true';

  if (!recipient_name || !sender_name) {
    throw new Error('Required fields missing');
  }

  const id = randomUUID();
  const key = deriveKey(id);

  const unlock_at = unlock_at_raw ? new Date(unlock_at_raw).toISOString() : null;
  const access_pin = pin_raw && pin_raw.length === 4
    ? createHash('sha256').update(pin_raw).digest('hex')
    : null;

  const { data, error } = await supabase
    .from('collections')
    .insert([{
      id,
      recipient_name: encryptField(recipient_name, key),
      sender_name: encryptField(sender_name, key),
      description: encryptField(description, key),
      theme,
      unlock_at,
      access_pin,
      bottle_mode,
    }])
    .select('edit_id')
    .single();

  if (error || !data) {
    console.error('Error creating collection:', error);
    throw new Error('Failed to create collection. Check your Supabase configuration.');
  }

  redirect(`/e/${data.edit_id}`);
}

export async function updateCollectionSettings(editId: string, formData: FormData) {
  // Fetch existing collection
  const { data: collection, error } = await supabase
    .from('collections')
    .select('id, description, access_pin')
    .eq('edit_id', editId)
    .single();

  if (error || !collection) throw new Error('Collection not found');

  const key = deriveKey(collection.id);

  // Description (re-encrypt if changed)
  const description_raw = formData.get('description') as string | null;
  const description = description_raw !== null
    ? encryptField(description_raw, key)
    : undefined;

  // Time capsule
  const unlock_at_raw = formData.get('unlock_at') as string | null;
  const clear_unlock = formData.get('clear_unlock') === '1';
  const unlock_at = clear_unlock
    ? null
    : unlock_at_raw ? new Date(unlock_at_raw).toISOString() : undefined;

  // PIN — only update if user typed a new one; '----' or empty means keep existing
  const pin_raw = formData.get('access_pin') as string | null;
  const clear_pin = formData.get('clear_pin') === '1';
  let access_pin: string | null | undefined = undefined;
  if (clear_pin) {
    access_pin = null;
  } else if (pin_raw && pin_raw.length === 4 && /^\d{4}$/.test(pin_raw)) {
    access_pin = createHash('sha256').update(pin_raw).digest('hex');
  }

  // Bottle mode
  const bottle_mode_raw = formData.get('bottle_mode');
  const bottle_mode = bottle_mode_raw !== null ? bottle_mode_raw === 'true' : undefined;

  const updates: Record<string, unknown> = {};
  if (description !== undefined) updates.description = description;
  if (unlock_at !== undefined) updates.unlock_at = unlock_at;
  if (access_pin !== undefined) updates.access_pin = access_pin;
  if (bottle_mode !== undefined) updates.bottle_mode = bottle_mode;

  if (Object.keys(updates).length === 0) {
    redirect(`/e/${editId}`);
    return;
  }

  const { error: updateError } = await supabase
    .from('collections')
    .update(updates)
    .eq('edit_id', editId);

  if (updateError) throw new Error('Failed to update settings');
  redirect(`/e/${editId}`);
}

export async function toggleBookPublished(editId: string, bookId: string, currentlyPublished: boolean) {
  const { error } = await supabase
    .from('books')
    .update({ is_published: !currentlyPublished })
    .eq('id', bookId);

  if (error) throw new Error('Failed to toggle book visibility');
  redirect(`/e/${editId}`);
}

export async function createBook(editId: string, coverImageUrl: string, formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const coverFile = formData.get('cover_file') as File | null;
  const spine_color = (formData.get('spine_color') as string) || '#2a2626';
  const soundtrack_url = (formData.get('soundtrack_url') as string) || null;

  let finalCoverUrl = coverImageUrl || null;

  if (!title) {
    throw new Error('Title is required');
  }

  // Handle direct file upload to Supabase Storage if provided
  if (coverFile && coverFile.size > 0) {
    validateUploadedFile(coverFile);
    const fileExt = sanitizeFileName(coverFile.name).split('.').pop();
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
      cover_image_url: finalCoverUrl,
      spine_color,
      soundtrack_url,
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
    validateUploadedFile(polaroidFile);
    const fileExt = sanitizeFileName(polaroidFile.name).split('.').pop();
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

// ── Recipient Reply ─────────────────────────────────────────────────────────
export async function submitReply(viewId: string, formData: FormData) {
  const content = (formData.get('content') as string)?.trim();
  if (!content) throw new Error('Please write something');

  const { data: collection } = await supabase
    .from('collections')
    .select('id, reply_content')
    .eq('view_id', viewId)
    .single();

  if (!collection) throw new Error('Library not found');
  if (collection.reply_content) {
    redirect(`/v/${viewId}/reply?sent=1`);
  }

  const key = deriveKey(collection.id);
  await supabase
    .from('collections')
    .update({ reply_content: encryptField(content, key), reply_created_at: new Date().toISOString() })
    .eq('view_id', viewId);

  redirect(`/v/${viewId}/reply?sent=1`);
}

// ── PIN Verification ────────────────────────────────────────────────────────
export async function verifyPin(viewId: string, formData: FormData) {
  // ── Rate limiting: 5 attempts per 15 minutes per IP+viewId ────────────
  const headerStore = await headers();
  const ip = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateLimitKey = `pin:${ip}:${viewId}`;

  if (isRateLimited(rateLimitKey)) {
    redirect(`/v/${viewId}/unlock?error=rate`);
  }

  const pin = (formData.get('pin') as string)?.trim();

  const { data: collection } = await supabase
    .from('collections')
    .select('access_pin')
    .eq('view_id', viewId)
    .single();

  if (!collection?.access_pin) redirect(`/v/${viewId}`);

  const hash = createHash('sha256').update(pin).digest('hex');
  if (hash !== collection.access_pin) {
    redirect(`/v/${viewId}/unlock?error=1`);
  }

  const cookieStore = await cookies();
  cookieStore.set(`unbound-pin-${viewId}`, 'verified', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'strict',
    path: '/',
  });

  redirect(`/v/${viewId}`);
}

// ── Page Reordering ─────────────────────────────────────────────────────────
export async function reorderPages(editId: string, bookId: string, orderedIds: string[]) {
  const { data: collection } = await supabase
    .from('collections')
    .select('id')
    .eq('edit_id', editId)
    .single();

  if (!collection) throw new Error('Not found');

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('pages').update({ sort_order: index + 1 }).eq('id', id).eq('book_id', bookId)
    )
  );
}

// ── Remove PIN ──────────────────────────────────────────────────────────────
export async function removePinLock(editId: string) {
  await supabase.from('collections').update({ access_pin: null }).eq('edit_id', editId);
  redirect(`/e/${editId}`);
}

export async function updatePage(editId: string, bookId: string, pageId: string, formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const submitAction = formData.get('action') as string;

  const strippedContent = content?.replace(/<[^>]*>/g, '').trim();
  if (!title || !strippedContent) {
    throw new Error('Title and content are both required');
  }

  const is_published = submitAction !== 'draft';

  // Fetch collection for encryption key
  const { data: collection, error: colError } = await supabase
    .from('collections')
    .select('id')
    .eq('edit_id', editId)
    .single();

  if (colError || !collection) {
    throw new Error('Could not resolve collection');
  }

  const key = deriveKey(collection.id);

  const { error } = await supabase
    .from('pages')
    .update({
      title:  encryptField(title, key),
      content: encryptField(content, key),
      is_published,
    })
    .eq('id', pageId);

  if (error) {
    console.error('Error updating page:', JSON.stringify(error));
    throw new Error(`Failed to update page: ${error.message}`);
  }

  redirect(`/e/${editId}/book/${bookId}`);
}

// keep decryptField referenced to avoid lint unused-import error
void decryptField;
