import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function GET() {
  try {
    // Add is_published to books — safe to run multiple times (IF NOT EXISTS semantics via default)
    const { error } = await supabase.rpc('run_migration', {
      sql: `ALTER TABLE books ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;`
    });

    // Supabase JS doesn't expose raw SQL via rpc by default.
    // Instead we do it via a workaround: upsert a known-safe no-op and catch the column missing error.
    // Real approach: use the REST management API or direct pg connection.
    // For now, attempt to read is_published from books and detect if missing.
    const { error: testError } = await supabase
      .from('books')
      .select('is_published')
      .limit(1);

    if (testError && testError.message.includes('column')) {
      return NextResponse.json({
        success: false,
        message: '⚠️ Column is_published does not exist yet. Please run this SQL in your Supabase dashboard SQL editor:\n\nALTER TABLE books ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;',
        sql: 'ALTER TABLE books ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;',
      });
    }

    return NextResponse.json({
      success: true,
      message: '✅ Column is_published already exists on books table. Books publish toggle is ready.',
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
