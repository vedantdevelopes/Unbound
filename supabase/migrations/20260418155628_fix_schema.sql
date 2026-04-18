-- 1. Add media_urls safely
ALTER TABLE pages ADD COLUMN IF NOT EXISTS media_urls TEXT[];

-- 2. Turn off RLS for the content tables so nothing blocks them (since we use link-based auth)
ALTER TABLE collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE books DISABLE ROW LEVEL SECURITY;
ALTER TABLE pages DISABLE ROW LEVEL SECURITY;

-- 3. Run the bulletproof Bucket & Policy setup securely
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('covers', 'covers', true), 
  ('polaroids', 'polaroids', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
    CREATE POLICY "Public Insert Covers" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'covers');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    CREATE POLICY "Public Select Covers" ON storage.objects FOR SELECT TO public USING (bucket_id = 'covers');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    CREATE POLICY "Public Insert Polaroids" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'polaroids');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    CREATE POLICY "Public Select Polaroids" ON storage.objects FOR SELECT TO public USING (bucket_id = 'polaroids');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
