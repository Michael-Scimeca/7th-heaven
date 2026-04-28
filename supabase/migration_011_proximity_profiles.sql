-- Add lat/lng to profiles for proximity-based show notifications
-- Also add profile_photo_url if not already present

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS profile_photo_url text;

-- Index for geo queries on fans with notifications enabled
CREATE INDEX IF NOT EXISTS idx_profiles_geo
  ON public.profiles (latitude, longitude)
  WHERE notifications_enabled = true AND latitude IS NOT NULL;

-- Ensure show_attendance allows delete by owner
CREATE POLICY IF NOT EXISTS "Users can delete own attendance"
  ON public.show_attendance FOR DELETE
  USING (auth.uid() = user_id);
