// One-time database setup script for 7th Heaven
// This outputs the SQL you need to paste into the Supabase SQL Editor

const SQL = `
-- ═══════════════════════════════════════════
-- 7th Heaven — Live Feed Tables
-- Paste this in: https://supabase.com/dashboard/project/acfzdcyqdskrmfuuoesb/sql/new
-- ═══════════════════════════════════════════

-- Create live_feed table
CREATE TABLE IF NOT EXISTS public.live_feed (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id text NOT NULL,
 show_id uuid,
 post_type text NOT NULL DEFAULT 'update' CHECK (post_type IN ('update', 'setlist', 'photo', 'video', 'fan_moment', 'announcement')),
 content text NOT NULL CHECK (char_length(content) <= 1000),
 media_url text,
 media_type text,
 is_pinned boolean NOT NULL DEFAULT false,
 likes_count integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now()
);

-- Create feed_reactions table
CREATE TABLE IF NOT EXISTS public.feed_reactions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 post_id uuid NOT NULL REFERENCES public.live_feed ON DELETE CASCADE,
 user_id text NOT NULL,
 reaction text NOT NULL DEFAULT '🔥',
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(post_id, user_id)
);

-- Create live_streams table
CREATE TABLE IF NOT EXISTS public.live_streams (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id text NOT NULL,
 show_id uuid,
 title text NOT NULL DEFAULT '',
 stream_url text,
 thumbnail_url text,
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'live', 'ended')),
 viewer_count integer NOT NULL DEFAULT 0,
 started_at timestamptz,
 ended_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_live_feed_created ON public.live_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_feed_user ON public.live_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_reactions_post ON public.feed_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON public.live_streams(status);

-- Enable RLS
ALTER TABLE public.live_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

-- Open policies (dev mode - everyone can read/write)
DO $$ BEGIN CREATE POLICY "live_feed_select" ON public.live_feed FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "live_feed_insert" ON public.live_feed FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "live_feed_delete" ON public.live_feed FOR DELETE USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "live_feed_update" ON public.live_feed FOR UPDATE USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "reactions_select" ON public.feed_reactions FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "reactions_insert" ON public.feed_reactions FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "streams_select" ON public.live_streams FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "streams_insert" ON public.live_streams FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "streams_update" ON public.live_streams FOR UPDATE USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Enable realtime
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.live_feed; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.live_streams; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
`;

console.log(SQL);
