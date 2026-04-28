-- Migration 010: Add anonymous flag to cruise signups
-- Allows fans to hide their name from the public "Who's Joined" list

ALTER TABLE public.cruise_signups ADD COLUMN IF NOT EXISTS anonymous BOOLEAN DEFAULT false;
