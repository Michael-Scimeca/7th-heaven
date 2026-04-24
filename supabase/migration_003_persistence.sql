-- ============================================
-- 7th Heaven — Migration 003: Bulletproof Persistence
-- Migrates raffle state, notifications, and merch
-- pickups from volatile localStorage to Supabase.
-- Run in Supabase SQL Editor.
-- ============================================

-- ── RAFFLES ──
-- Stores the full raffle lifecycle so state survives refresh
CREATE TABLE IF NOT EXISTS public.raffles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id text,                          -- links to live_streams or localStorage room ID
  crew_id text NOT NULL,                   -- crew member who started the raffle
  status text NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'open', 'drawing', 'complete')),
  prize_name text NOT NULL DEFAULT '',
  prize_qty integer NOT NULL DEFAULT 1,
  min_entrants integer NOT NULL DEFAULT 15,
  entrants jsonb NOT NULL DEFAULT '[]',    -- [{name, ts}]
  winners jsonb NOT NULL DEFAULT '[]',     -- [{name, ts}]
  winner_pins jsonb NOT NULL DEFAULT '[]', -- [{name, pin, prize, claimed}]
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_raffles_crew ON public.raffles(crew_id);
CREATE INDEX IF NOT EXISTS idx_raffles_status ON public.raffles(status);

ALTER TABLE public.raffles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'raffles_select_all') THEN
    CREATE POLICY "raffles_select_all" ON public.raffles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'raffles_insert_all') THEN
    CREATE POLICY "raffles_insert_all" ON public.raffles FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'raffles_update_all') THEN
    CREATE POLICY "raffles_update_all" ON public.raffles FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'raffles_delete_all') THEN
    CREATE POLICY "raffles_delete_all" ON public.raffles FOR DELETE USING (true);
  END IF;
END $$;

-- ── NOTIFICATIONS (VIP Inbox) ──
-- Persistent fan notifications that survive refresh/device changes
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('raffle_win', 'merch_pickup', 'announcement', 'info')),
  title text NOT NULL,
  body text,
  pin text,                               -- verification PIN for merch claims
  prize text,                             -- prize name
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_email ON public.notifications(user_email);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'notifications_select_all') THEN
    CREATE POLICY "notifications_select_all" ON public.notifications FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'notifications_insert_all') THEN
    CREATE POLICY "notifications_insert_all" ON public.notifications FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'notifications_update_all') THEN
    CREATE POLICY "notifications_update_all" ON public.notifications FOR UPDATE USING (true);
  END IF;
END $$;

-- ── MERCH PICKUPS ──
-- Tracks merch purchased during live streams
CREATE TABLE IF NOT EXISTS public.merch_pickups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_email text NOT NULL,
  fan_name text NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  total numeric(10,2) NOT NULL DEFAULT 0,
  pin text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'picked_up', 'cancelled')),
  stream_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_merch_pickups_email ON public.merch_pickups(fan_email);
CREATE INDEX IF NOT EXISTS idx_merch_pickups_status ON public.merch_pickups(status);

ALTER TABLE public.merch_pickups ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'merch_pickups_select_all') THEN
    CREATE POLICY "merch_pickups_select_all" ON public.merch_pickups FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'merch_pickups_insert_all') THEN
    CREATE POLICY "merch_pickups_insert_all" ON public.merch_pickups FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'merch_pickups_update_all') THEN
    CREATE POLICY "merch_pickups_update_all" ON public.merch_pickups FOR UPDATE USING (true);
  END IF;
END $$;

-- ── Enable Realtime for all new tables ──
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.raffles;
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.merch_pickups;
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
