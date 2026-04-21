import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
export const isSupabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co');

// Database types for the live feed
export interface FeedPostDB {
 id: string;
 member_name: string;
 member_role: string;
 member_avatar: string;
 content: string;
 post_type: 'text' | 'photo' | 'video' | 'setlist' | 'crowd' | 'announcement';
 image_url?: string;
 video_url?: string;
 show_id?: string; // links to a specific tour date
 reactions: Record<string, number>;
 is_live: boolean;
 created_at: string;
}

/*
-- Supabase SQL to create the feed_posts table:

CREATE TABLE feed_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_name TEXT NOT NULL,
  member_role TEXT NOT NULL,
  member_avatar TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'text',
  image_url TEXT,
  video_url TEXT,
  show_id TEXT,
  reactions JSONB DEFAULT '{}',
  is_live BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE feed_posts;

-- Enable RLS
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Public can read feed posts"
  ON feed_posts FOR SELECT
  USING (true);

-- Authenticated insert policy (for admin/crew)
CREATE POLICY "Authenticated users can insert feed posts"
  ON feed_posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated update policy
CREATE POLICY "Authenticated users can update feed posts"
  ON feed_posts FOR UPDATE
  USING (auth.role() = 'authenticated');
*/
