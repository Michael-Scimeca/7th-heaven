-- ============================================
-- 7th Heaven — Migration 014: Secure Chat
-- Disables public inserts on chat_messages to prevent spam.
-- Chat will now be routed through a secure Next.js API endpoint.
-- ============================================

-- Drop the permissive insert policy
DROP POLICY IF EXISTS "chat_insert_all" ON public.chat_messages;

-- Create a restrictive policy (only admin/service role can insert)
-- Service role bypasses RLS anyway, so we just restrict public.
CREATE POLICY "chat_insert_all" ON public.chat_messages FOR INSERT WITH CHECK (false);
