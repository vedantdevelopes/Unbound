-- ══════════════════════════════════════════════════════════════════
-- Enable Row Level Security on all public tables
-- Unbound uses link-based access (edit_id / view_id) enforced at
-- the application layer. RLS here allows the anon role full CRUD
-- so the app works, while blocking direct table access from browsers
-- that don't go through the PostgREST API at all.
-- ══════════════════════════════════════════════════════════════════

-- ── Collections ────────────────────────────────────────────────────
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Anyone can read a collection (viewer needs to look up by view_id,
-- editor by edit_id — both are unguessable UUIDs)
CREATE POLICY "collections_select"
  ON public.collections FOR SELECT
  TO anon
  USING (true);

-- Anyone can create a new collection (register a new library)
CREATE POLICY "collections_insert"
  ON public.collections FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anyone can update a collection they reached via edit_id
-- (application enforces edit_id ownership before calling update)
CREATE POLICY "collections_update"
  ON public.collections FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- ── Books ────────────────────────────────────────────────────────
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "books_select"
  ON public.books FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "books_insert"
  ON public.books FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "books_update"
  ON public.books FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "books_delete"
  ON public.books FOR DELETE
  TO anon
  USING (true);

-- ── Pages ────────────────────────────────────────────────────────
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pages_select"
  ON public.pages FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "pages_insert"
  ON public.pages FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "pages_update"
  ON public.pages FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "pages_delete"
  ON public.pages FOR DELETE
  TO anon
  USING (true);
