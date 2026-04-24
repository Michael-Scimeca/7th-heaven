-- ============================================
-- 7th Heaven — Migration 002: Bookings Table
-- Run in Supabase SQL Editor
-- ============================================

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id text UNIQUE NOT NULL,
  planner_email text NOT NULL,
  planner_name text NOT NULL,
  planner_phone text,
  organization text,
  event_type text NOT NULL,
  event_date date NOT NULL,
  start_time text,
  end_time text,
  venue_name text,
  venue_city text NOT NULL,
  venue_state text NOT NULL DEFAULT 'IL',
  indoor_outdoor text,
  expected_attendance text,
  details text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_email ON public.bookings(planner_email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(event_date);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Everyone can read their own bookings, admin can read all
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'bookings_select_all') THEN
    CREATE POLICY "bookings_select_all" ON public.bookings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'bookings_insert_all') THEN
    CREATE POLICY "bookings_insert_all" ON public.bookings FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'bookings_update_all') THEN
    CREATE POLICY "bookings_update_all" ON public.bookings FOR UPDATE USING (true);
  END IF;
END $$;

-- Create chat_messages table for persistent crew/fan chat
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room text NOT NULL DEFAULT 'global',
  sender_name text NOT NULL,
  sender_role text NOT NULL DEFAULT 'fan',
  sender_avatar text,
  content text NOT NULL CHECK (char_length(content) <= 1000),
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_room ON public.chat_messages(room);
CREATE INDEX IF NOT EXISTS idx_chat_created ON public.chat_messages(created_at DESC);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'chat_select_all') THEN
    CREATE POLICY "chat_select_all" ON public.chat_messages FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'chat_insert_all') THEN
    CREATE POLICY "chat_insert_all" ON public.chat_messages FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Enable realtime for chat
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
