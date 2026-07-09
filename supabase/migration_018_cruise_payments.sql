-- Migration 018: Cruise Payments Tracking Columns
-- Adds deposit_paid and full_paid columns to track financial details

ALTER TABLE public.cruise_signups 
ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS full_paid BOOLEAN DEFAULT false;
