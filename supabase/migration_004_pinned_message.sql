-- ============================================
-- 7th Heaven — Migration 004: Pinned Messages
-- Adds pinned_message column to live_streams
-- so pins sync reliably via Supabase instead of localStorage.
-- Run in Supabase SQL Editor.
-- ============================================

ALTER TABLE public.live_streams
ADD COLUMN IF NOT EXISTS pinned_message jsonb DEFAULT NULL;

-- Ensure realtime picks up changes to this column
-- (live_streams should already be in the realtime publication from migration_002)
