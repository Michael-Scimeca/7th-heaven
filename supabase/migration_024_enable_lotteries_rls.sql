-- ============================================================================
-- Migration 024: Enable Row Level Security (RLS) for Lotteries & Fan Picks
-- Resolves Supabase Security Critical alerts:
--   - "RLS Disabled in Public: Table public.lotteries"
--   - "RLS Disabled in Public: Table public.lottery_entries"
--   - "RLS Disabled in Public: Table public.fan_picks"
-- ============================================================================

-- 1. Enable RLS on all three tables
ALTER TABLE IF EXISTS public.lotteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lottery_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fan_picks ENABLE ROW LEVEL SECURITY;

-- 2. Policies for public.lotteries
-- Public/anon & authenticated users can read active/drawing lotteries
DROP POLICY IF EXISTS "Allow public read active lotteries" ON public.lotteries;
CREATE POLICY "Allow public read active lotteries"
  ON public.lotteries FOR SELECT
  USING (true);

-- Service role has full management access to lotteries
DROP POLICY IF EXISTS "Service role manages lotteries" ON public.lotteries;
CREATE POLICY "Service role manages lotteries"
  ON public.lotteries FOR ALL
  TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 3. Policies for public.lottery_entries
-- Service role manages all entries
DROP POLICY IF EXISTS "Service role manages lottery entries" ON public.lottery_entries;
CREATE POLICY "Service role manages lottery entries"
  ON public.lottery_entries FOR ALL
  TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Authenticated users can read their own entries
DROP POLICY IF EXISTS "Users can read own lottery entries" ON public.lottery_entries;
CREATE POLICY "Users can read own lottery entries"
  ON public.lottery_entries FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Policies for public.fan_picks
-- Service role manages all picks
DROP POLICY IF EXISTS "Service role manages fan picks" ON public.fan_picks;
CREATE POLICY "Service role manages fan picks"
  ON public.fan_picks FOR ALL
  TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Authenticated users can read their own picks
DROP POLICY IF EXISTS "Users can read own fan picks" ON public.fan_picks;
CREATE POLICY "Users can read own fan picks"
  ON public.fan_picks FOR SELECT
  USING (auth.uid() = user_id);
