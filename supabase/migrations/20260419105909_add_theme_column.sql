-- Add the theme column to collections so Reader Environments work
ALTER TABLE collections ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'wood';
