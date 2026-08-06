-- Migration 008: Cruise Signups
-- Stores fan interest for the 7th Heaven cruise group deal

CREATE TABLE IF NOT EXISTS public.cruise_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  guest_count INTEGER DEFAULT 2,
  notes TEXT,
  cancel_token TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prevent duplicate signups by email
CREATE UNIQUE INDEX IF NOT EXISTS idx_cruise_signups_email ON public.cruise_signups(email);

-- Enable RLS (server-side actions use service_role which bypasses RLS automatically)
ALTER TABLE public.cruise_signups ENABLE ROW LEVEL SECURITY;
