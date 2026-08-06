-- ==============================================================
-- Migration 019: Pending Cruise Signups table for PIN verification
-- ==============================================================

CREATE TABLE IF NOT EXISTS public.cruise_pending_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  password TEXT NOT NULL,
  pin TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prevent RLS lockouts on this temporary staging table
ALTER TABLE public.cruise_pending_signups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can manage pending signups" ON public.cruise_pending_signups;
