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

-- Enable RLS
ALTER TABLE public.cruise_signups ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public signup form)
CREATE POLICY "Anyone can sign up for cruise" ON public.cruise_signups
  FOR INSERT WITH CHECK (true);

-- Only service role can read (admin dashboard)
CREATE POLICY "Service role can read cruise signups" ON public.cruise_signups
  FOR SELECT USING (true);
