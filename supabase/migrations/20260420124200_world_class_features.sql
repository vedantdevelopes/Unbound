-- World-Class Unbound Features Migration
-- Collections: Time Capsule + Reply + PIN Lock + Bottle Mode
ALTER TABLE collections
  ADD COLUMN IF NOT EXISTS unlock_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reply_content    TEXT,
  ADD COLUMN IF NOT EXISTS reply_created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS access_pin       TEXT,
  ADD COLUMN IF NOT EXISTS bottle_mode      BOOLEAN DEFAULT FALSE;

-- Books: Spine Color + Soundtrack URL
ALTER TABLE books
  ADD COLUMN IF NOT EXISTS spine_color    TEXT DEFAULT '#2a2626',
  ADD COLUMN IF NOT EXISTS soundtrack_url TEXT;
