-- ============================================
-- 7th Heaven — Migration 006: Chat Delete Policy
-- Allows crew/admin to delete chat messages
-- ============================================

-- Note: RLS is enabled on chat_messages. Server-side deletes use service_role which bypasses RLS automatically.
