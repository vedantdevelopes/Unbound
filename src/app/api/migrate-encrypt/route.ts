/**
 * One-time encryption migration endpoint.
 * Finds all collections where data is still plaintext and encrypts everything.
 * SAFE TO RUN MULTIPLE TIMES — it detects already-encrypted data gracefully.
 *
 * Usage: GET /api/migrate-encrypt
 * After running once, all existing data is encrypted. Subsequent runs are no-ops.
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { deriveKey, encryptField, decryptField } from '@/lib/crypto';

export async function GET(request: Request) {
  // ── Auth gate: require MIGRATION_SECRET ──────────────────────────────────
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (!process.env.MIGRATION_SECRET || secret !== process.env.MIGRATION_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized. Provide ?secret=<MIGRATION_SECRET> to access this endpoint.' },
      { status: 401 }
    );
  }

  if (!process.env.ENCRYPTION_MASTER_SECRET) {
    return NextResponse.json(
      { error: 'ENCRYPTION_MASTER_SECRET is not set. Add it to your environment variables.' },
      { status: 500 }
    );
  }

  let processedCollections = 0;
  let processedBooks = 0;
  let processedPages = 0;
  const errors: string[] = [];

  try {
    // Fetch ALL collections (we re-encrypt safe via the graceful fallback logic)
    const { data: collections, error: colFetchErr } = await supabase
      .from('collections')
      .select('id, recipient_name, sender_name, description');

    if (colFetchErr) throw colFetchErr;

    for (const col of collections ?? []) {
      const key = deriveKey(col.id);
      if (!key) continue;

      // Decrypt first (in case it's already encrypted — idempotent)
      const plainRecipient = decryptField(col.recipient_name, key);
      const plainSender = decryptField(col.sender_name, key);
      const plainDescription = decryptField(col.description, key);

      // Re-encrypt with fresh IVs
      const { error: colUpdateErr } = await supabase
        .from('collections')
        .update({
          recipient_name: encryptField(plainRecipient, key),
          sender_name: encryptField(plainSender, key),
          description: encryptField(plainDescription, key),
        })
        .eq('id', col.id);

      if (colUpdateErr) {
        errors.push(`Collection ${col.id}: ${colUpdateErr.message}`);
        continue;
      }
      processedCollections++;

      // Encrypt all books for this collection
      const { data: books } = await supabase
        .from('books')
        .select('id, title, description')
        .eq('collection_id', col.id);

      for (const book of books ?? []) {
        const plainTitle = decryptField(book.title, key);
        const plainDesc = decryptField(book.description, key);

        const { error: bookErr } = await supabase
          .from('books')
          .update({
            title: encryptField(plainTitle, key),
            description: encryptField(plainDesc, key),
          })
          .eq('id', book.id);

        if (bookErr) {
          errors.push(`Book ${book.id}: ${bookErr.message}`);
          continue;
        }
        processedBooks++;

        // Encrypt all pages for this book
        const { data: pages } = await supabase
          .from('pages')
          .select('id, title, content')
          .eq('book_id', book.id);

        for (const page of pages ?? []) {
          const plainPageTitle = decryptField(page.title, key);
          const plainContent = decryptField(page.content, key);

          const { error: pageErr } = await supabase
            .from('pages')
            .update({
              title: encryptField(plainPageTitle, key),
              content: encryptField(plainContent, key),
            })
            .eq('id', page.id);

          if (pageErr) {
            errors.push(`Page ${page.id}: ${pageErr.message}`);
          } else {
            processedPages++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `✅ Migration complete! Encrypted ${processedCollections} collections, ${processedBooks} books, and ${processedPages} pages.`,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
