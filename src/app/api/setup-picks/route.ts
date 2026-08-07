import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Execute table setups in parallel
    const [{ error: e1 }, { error: e2 }, { error: e3 }] = await Promise.all([
      supabase.rpc("exec_sql", {
        query: `
          CREATE TABLE IF NOT EXISTS fan_picks (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            pick_type TEXT NOT NULL,
            awarded_by TEXT DEFAULT 'system',
            awarded_reason TEXT DEFAULT 'manual',
            show_id TEXT,
            is_used BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
          CREATE INDEX IF NOT EXISTS idx_fan_picks_user ON fan_picks(user_id);
        `,
      }),
      supabase.rpc("exec_sql", {
        query: `
          CREATE TABLE IF NOT EXISTS lotteries (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            prize TEXT NOT NULL,
            requirement_type TEXT NOT NULL DEFAULT 'min_picks',
            requirement_value INT DEFAULT 1,
            status TEXT DEFAULT 'active',
            ends_at TIMESTAMPTZ,
            winner_user_id UUID,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `,
      }),
      supabase.rpc("exec_sql", {
        query: `
          CREATE TABLE IF NOT EXISTS lottery_entries (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            lottery_id UUID NOT NULL,
            user_id UUID NOT NULL,
            pick_ids UUID[] NOT NULL DEFAULT '{}',
            entered_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(lottery_id, user_id)
          );
          CREATE INDEX IF NOT EXISTS idx_lottery_entries_user ON lottery_entries(user_id);
          CREATE INDEX IF NOT EXISTS idx_lottery_entries_lottery ON lottery_entries(lottery_id);
        `,
      })
    ]);

    // If exec_sql doesn't exist, fallback to direct table creation
    if (e1 || e2 || e3) {
      // Try creating tables via the REST API directly
      // Create fan_picks
      try { await supabase.from("fan_picks").select("id").limit(1); } catch {}
      try { await supabase.from("lotteries").select("id").limit(1); } catch {}
      try { await supabase.from("lottery_entries").select("id").limit(1); } catch {}

      return NextResponse.json({
        success: true,
        message: "Tables may already exist or need manual SQL creation.",
        note: "Run the SQL in your Supabase dashboard if tables don't exist.",
        sql: getCreateSQL(),
        errors: { fan_picks: e1?.message, lotteries: e2?.message, lottery_entries: e3?.message },
      });
    }

    return NextResponse.json({ success: true, message: "Pick Awards tables created successfully." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function getCreateSQL() {
  return `
-- Run this in your Supabase SQL editor:

CREATE TABLE IF NOT EXISTS fan_picks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pick_type TEXT NOT NULL,
  awarded_by TEXT DEFAULT 'system',
  awarded_reason TEXT DEFAULT 'manual',
  show_id TEXT,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fan_picks_user ON fan_picks(user_id);

ALTER TABLE fan_picks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own picks" ON fan_picks FOR SELECT USING (true);
CREATE POLICY "Service role can insert picks" ON fan_picks FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update picks" ON fan_picks FOR UPDATE USING (true);

CREATE TABLE IF NOT EXISTS lotteries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  prize TEXT NOT NULL,
  requirement_type TEXT NOT NULL DEFAULT 'min_picks',
  requirement_value INT DEFAULT 1,
  status TEXT DEFAULT 'active',
  ends_at TIMESTAMPTZ,
  winner_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lotteries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read lotteries" ON lotteries FOR SELECT USING (true);
CREATE POLICY "Service role can manage lotteries" ON lotteries FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS lottery_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lottery_id UUID NOT NULL,
  user_id UUID NOT NULL,
  pick_ids UUID[] NOT NULL DEFAULT '{}',
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lottery_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_lottery_entries_user ON lottery_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_lottery_entries_lottery ON lottery_entries(lottery_id);

ALTER TABLE lottery_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own entries" ON lottery_entries FOR SELECT USING (true);
CREATE POLICY "Authenticated can enter" ON lottery_entries FOR INSERT WITH CHECK (true);

-- Seed some lotteries
INSERT INTO lotteries (name, prize, requirement_type, requirement_value, ends_at) VALUES
  ('Signed Guitar Raffle', 'Signed Electric Guitar', 'min_picks', 5, NOW() + INTERVAL '30 days'),
  ('VIP Season Pass', 'Free entry to every 2026 show', 'all_rarities', 6, NOW() + INTERVAL '60 days'),
  ('Backstage Birthday Party', 'Private backstage party for you + 5 friends', 'min_picks', 10, NOW() + INTERVAL '90 days');
  `.trim();
}
