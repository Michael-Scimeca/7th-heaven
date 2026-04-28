-- Migration 009: Referral Tracking
-- Tracks fan referrals for the referral program

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referrer_code TEXT NOT NULL,
  referred_email TEXT NOT NULL,
  referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'rewarded')),
  created_at TIMESTAMPTZ DEFAULT now(),
  converted_at TIMESTAMPTZ
);

-- Index for looking up referrals by code
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referrer_code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_email);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can see their own referrals
CREATE POLICY "Users can see own referrals" ON public.referrals
  FOR SELECT USING (referrer_id = auth.uid());

-- Anyone can insert (public signup with ref code)
CREATE POLICY "Anyone can create referral" ON public.referrals
  FOR INSERT WITH CHECK (true);

-- Service role can update (mark as converted)
CREATE POLICY "Service can update referrals" ON public.referrals
  FOR UPDATE USING (true);
