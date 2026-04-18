-- ⚠️ WARNING: THIS SCRIPT WILL DROP YOUR EXISTING TABLES ⚠️
-- Run this in your Supabase SQL Editor.

-- Drop old tables if they exist
DROP TABLE IF EXISTS pages;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS collections;

-- 1. Collections (The "Link" wrapper that holds multiple books)
CREATE TABLE collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  edit_id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  view_id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  recipient_name TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Books (Individual books inside a collection)
CREATE TABLE books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Pages (Entries inside a book)
CREATE TABLE pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  media_urls TEXT[], 
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- 4. Storage Buckets & Policies
-- Create the buckets programmatically if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('covers', 'covers', true), 
  ('polaroids', 'polaroids', true)
ON CONFLICT (id) DO NOTHING;

-- Covers Bucket Policies
CREATE POLICY "Public Insert Covers" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'covers');
CREATE POLICY "Public Select Covers" ON storage.objects FOR SELECT TO public USING (bucket_id = 'covers');

-- Polaroids Bucket Policies
CREATE POLICY "Public Insert Polaroids" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'polaroids');
CREATE POLICY "Public Select Polaroids" ON storage.objects FOR SELECT TO public USING (bucket_id = 'polaroids');
