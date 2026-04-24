-- ============================================
-- 7th Heaven — Database Migration
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/acfzdcyqdskrmfuuoesb/sql/new
-- ============================================

-- 1. Update profiles role constraint to include all app roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('fan', 'crew', 'admin', 'merch', 'event_planner'));

-- 2. Make date_of_birth nullable (admin-created crew accounts don't have one)
ALTER TABLE public.profiles ALTER COLUMN date_of_birth DROP NOT NULL;

-- 3. Create feed_reactions if missing
CREATE TABLE IF NOT EXISTS public.feed_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.live_feed ON DELETE CASCADE,
  user_id text NOT NULL,
  reaction text NOT NULL DEFAULT '🔥' CHECK (reaction IN ('🔥', '🎸', '❤️', '🤘', '👏')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.feed_reactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'feed_reactions_select_all') THEN
    CREATE POLICY "feed_reactions_select_all" ON public.feed_reactions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'feed_reactions_insert_all') THEN
    CREATE POLICY "feed_reactions_insert_all" ON public.feed_reactions FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- 4. Update the handle_new_user trigger to include role + handle missing date_of_birth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, date_of_birth, phone, zip)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'fan'),
    (NEW.raw_user_meta_data->>'date_of_birth')::date,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'zip'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Done! All tables and constraints are now up to date.
