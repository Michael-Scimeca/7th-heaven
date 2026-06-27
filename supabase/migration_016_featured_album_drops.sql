-- Migration 016: Featured Album Drops
-- Supports drops with multiple songs under a single album/drop name.

-- Drop the old featured_tracks table
DROP TABLE IF EXISTS public.featured_tracks CASCADE;

-- Create featured_drops table
CREATE TABLE IF NOT EXISTS public.featured_drops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, -- Album or EP Name
  visibility text NOT NULL CHECK (visibility IN ('everyone', 'fans')),
  expires_at timestamptz, -- NULL means show indefinitely (or until manually closed)
  is_active boolean NOT NULL DEFAULT true, -- can be manually closed/disabled
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create featured_drop_songs table
CREATE TABLE IF NOT EXISTS public.featured_drop_songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id uuid NOT NULL REFERENCES public.featured_drops(id) ON DELETE CASCADE,
  title text NOT NULL, -- Individual song name
  audio_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for querying active drops quickly
CREATE INDEX IF NOT EXISTS idx_featured_drops_active_query
  ON public.featured_drops(is_active, expires_at, visibility);

-- Index for lookup of songs belonging to a drop
CREATE INDEX IF NOT EXISTS idx_featured_drop_songs_lookup
  ON public.featured_drop_songs(drop_id, sort_order);

-- Enable Row Level Security (RLS)
ALTER TABLE public.featured_drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_drop_songs ENABLE ROW LEVEL SECURITY;

-- 1. Read Policy for Drops:
-- - Admins can read all featured drops.
-- - Public can read if visibility = 'everyone' and the drop is active and not expired.
-- - Authenticated users can read if (visibility = 'fans' or visibility = 'everyone') and the drop is active and not expired.
CREATE POLICY "Read active featured drops" ON public.featured_drops
  FOR SELECT USING (
    -- Admin can read all
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR (
      is_active = true 
      AND (expires_at IS NULL OR expires_at > now())
      AND (
        visibility = 'everyone'
        OR (visibility = 'fans' AND auth.uid() IS NOT NULL)
      )
    )
  );

-- 2. Admin Policy for Drops:
CREATE POLICY "Admin manage featured drops" ON public.featured_drops
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Read Policy for Songs:
CREATE POLICY "Read active featured drop songs" ON public.featured_drop_songs
  FOR SELECT USING (
    -- Admin can read all
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM public.featured_drops d
      WHERE d.id = drop_id
        AND d.is_active = true 
        AND (d.expires_at IS NULL OR d.expires_at > now())
        AND (
          d.visibility = 'everyone'
          OR (d.visibility = 'fans' AND auth.uid() IS NOT NULL)
        )
    )
  );

-- 4. Admin Policy for Songs:
CREATE POLICY "Admin manage featured drop songs" ON public.featured_drop_songs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
