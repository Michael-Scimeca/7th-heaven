-- Migration 017: Cruise Checked Off Column
-- Adds checked_off column to track processed submissions

ALTER TABLE public.cruise_signups ADD COLUMN IF NOT EXISTS checked_off BOOLEAN DEFAULT false;
