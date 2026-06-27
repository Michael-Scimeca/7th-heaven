-- Migration 015: Featured Tracks
-- Admins can upload a featured song/soundtrack with visibility and expiration configuration.

CREATE TABLE IF NOT EXISTS public.featured_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  audio_url text NOT NULL,
  visibility text NOT NULL CHECK (visibility IN ('everyone', 'fans')),
  expires_at timestamptz, -- NULL means show indefinitely (or until manually closed)
  is_active boolean NOT NULL DEFAULT true, -- can be manually closed/disabled
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for querying active tracks quickly
CREATE INDEX IF NOT EXISTS idx_featured_tracks_active_query
  ON public.featured_tracks(is_active, expires_at, visibility);

-- Enable Row Level Security (RLS)
ALTER TABLE public.featured_tracks ENABLE ROW LEVEL SECURITY;

-- 1. Read Policy:
-- - Admins can read all featured tracks.
-- - Public can read if visibility = 'everyone' and the track is active and not expired.
-- - Authenticated users can read if (visibility = 'fans' or visibility = 'everyone') and the track is active and not expired.
CREATE POLICY "Read active featured tracks" ON public.featured_tracks
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

-- 2. Admin Policy:
-- Only users with 'admin' role in public.profiles can write/insert/update/delete.
CREATE POLICY "Admin manage featured tracks" ON public.featured_tracks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
