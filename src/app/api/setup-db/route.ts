import { NextResponse } from 'next/server';

// Creates the missing live_feed, feed_reactions, and live_streams tables
// Uses the Supabase SQL endpoint with the service_role key
export async function POST() {
 // Block in production — this route should only run during development setup
 if (process.env.NODE_ENV === 'production') {
  return NextResponse.json({ error: 'This endpoint is disabled in production' }, { status: 403 });
 }

 const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
 const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

 if (!serviceKey) {
  return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
 }

 // SQL to create the live feed tables
 const sql = `
-- Create live_feed if not exists
CREATE TABLE IF NOT EXISTS public.live_feed (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id text NOT NULL,
 show_id uuid,
 post_type text NOT NULL DEFAULT 'update' CHECK (post_type IN ('update', 'setlist', 'photo', 'video', 'fan_moment', 'announcement')),
 content text NOT NULL CHECK (char_length(content) <= 1000),
 media_url text,
 media_type text CHECK (media_type IN ('image', 'video')),
 is_pinned boolean NOT NULL DEFAULT false,
 likes_count integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now()
);

-- Create feed_reactions if not exists
CREATE TABLE IF NOT EXISTS public.feed_reactions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 post_id uuid NOT NULL REFERENCES public.live_feed ON DELETE CASCADE,
 user_id text NOT NULL,
 reaction text NOT NULL DEFAULT '🔥' CHECK (reaction IN ('🔥', '🎸', '❤️', '🤘', '👏')),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(post_id, user_id)
);

-- Create live_streams if not exists
CREATE TABLE IF NOT EXISTS public.live_streams (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id text NOT NULL,
 show_id uuid,
 title text NOT NULL DEFAULT '',
 stream_url text,
 thumbnail_url text,
 guest_name text DEFAULT '',
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'live', 'ended')),
 viewer_count integer NOT NULL DEFAULT 0,
 started_at timestamptz,
 ended_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure missing columns exist (for backward compatibility if table already existed)
ALTER TABLE public.live_streams ADD COLUMN IF NOT EXISTS stream_url text;
ALTER TABLE public.live_streams ADD COLUMN IF NOT EXISTS show_on_homepage boolean DEFAULT false;
ALTER TABLE public.live_streams ADD COLUMN IF NOT EXISTS pinned_message text;
ALTER TABLE public.live_streams ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_live_feed_created ON public.live_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_feed_user ON public.live_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_reactions_post ON public.feed_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON public.live_streams(status);

-- Enable RLS
ALTER TABLE public.live_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

-- Allow everyone to SELECT (read) from all tables
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'live_feed_select_all') THEN
    CREATE POLICY "live_feed_select_all" ON public.live_feed FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'live_feed_insert_all') THEN
    CREATE POLICY "live_feed_insert_all" ON public.live_feed FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'live_feed_delete_all') THEN
    CREATE POLICY "live_feed_delete_all" ON public.live_feed FOR DELETE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'feed_reactions_select_all') THEN
    CREATE POLICY "feed_reactions_select_all" ON public.feed_reactions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'feed_reactions_insert_all') THEN
    CREATE POLICY "feed_reactions_insert_all" ON public.feed_reactions FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'live_streams_select_all') THEN
    CREATE POLICY "live_streams_select_all" ON public.live_streams FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'live_streams_insert_all') THEN
    CREATE POLICY "live_streams_insert_all" ON public.live_streams FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'live_streams_update_all') THEN
    CREATE POLICY "live_streams_update_all" ON public.live_streams FOR UPDATE USING (true);
  END IF;
END $$;

-- Enable realtime
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.live_feed;
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.live_streams;
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
`;

 // Use the Supabase SQL endpoint
 const res = await fetch(`${url}/rest/v1/rpc`, {
  method: 'POST',
  headers: {
   'Content-Type': 'application/json',
   'apikey': serviceKey,
   'Authorization': `Bearer ${serviceKey}`,
   'Prefer': 'return=minimal',
  },
  body: JSON.stringify({ query: sql }),
 });

 // If the rpc endpoint doesn't work, we'll try the pg endpoint
 if (!res.ok) {
  // Try through the pg/query endpoint
  const pgRes = await fetch(`${url}/pg/query`, {
   method: 'POST',
   headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${serviceKey}`,
   },
   body: JSON.stringify({ query: sql }),
  });

  if (!pgRes.ok) {
   const errBody = await pgRes.text();
   return NextResponse.json({
    error: 'Could not execute SQL',
    status: pgRes.status,
    body: errBody,
    suggestion: 'Copy the SQL from supabase/schema.sql and run it in the Supabase SQL Editor: https://supabase.com/dashboard/project/acfzdcyqdskrmfuuoesb/sql/new'
   }, { status: 500 });
  }

  const pgData = await pgRes.json();
  return NextResponse.json({ success: true, method: 'pg/query', result: pgData });
 }

 const data = await res.text();
 return NextResponse.json({ success: true, method: 'rpc', result: data });
}
