-- Add geolocation and radius to SMS subscribers for proximity matching
-- Run this in the Supabase SQL Editor

-- Add lat/lng columns for geocoded subscriber location
ALTER TABLE public.sms_subscribers
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS notification_radius integer NOT NULL DEFAULT 50;

-- Index for geo queries
CREATE INDEX IF NOT EXISTS idx_sms_lat_lng
  ON public.sms_subscribers (latitude, longitude)
  WHERE opted_in = true AND latitude IS NOT NULL;

-- Backfill: if you have existing subscribers, run the /api/sms/backfill-geo endpoint after applying this migration
