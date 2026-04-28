-- ============================================
-- 7th Heaven — Migration 005: Homepage Visibility Toggle
-- Adds the ability for crew to choose if their live stream
-- should be featured on the platform home page.
-- ============================================

ALTER TABLE public.live_streams 
ADD COLUMN IF NOT EXISTS show_on_homepage boolean DEFAULT false;

-- Also add a "featured" flag to allow admins to override or pin a specific stream
ALTER TABLE public.live_streams 
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Index for fast lookup on the home page
CREATE INDEX IF NOT EXISTS idx_live_streams_visibility 
ON public.live_streams(show_on_homepage, is_featured, status);
