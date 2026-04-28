-- ============================================
-- 7th Heaven — Migration 006: Chat Delete Policy
-- Allows crew/admin to delete chat messages
-- ============================================

-- Add DELETE policy so crew can purge chat on stream end/start
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'chat_delete_all') THEN
    CREATE POLICY "chat_delete_all" ON public.chat_messages FOR DELETE USING (true);
  END IF;
END $$;
