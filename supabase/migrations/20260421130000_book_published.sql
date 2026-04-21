-- Add is_published column to books table
ALTER TABLE books
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;

-- Existing books default to published so nothing breaks
UPDATE books SET is_published = TRUE WHERE is_published IS NULL;
