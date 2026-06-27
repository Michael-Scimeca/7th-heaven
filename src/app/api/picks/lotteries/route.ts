import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET /api/picks/lotteries?userId=xxx — Fetch all active lotteries + user's entry status
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    const supabase = getAdmin();

    // Get all active lotteries
    const { data: lotteries, error: lotErr } = await supabase
      .from("lotteries")
      .select("*")
      .in("status", ["active", "drawing"])
      .order("ends_at", { ascending: true });

    if (lotErr) throw lotErr;

    // Get entry counts per lottery
    const { data: entryCounts } = await supabase
      .from("lottery_entries")
      .select("lottery_id");

    // Count entries per lottery
    const countMap: Record<string, number> = {};
    (entryCounts || []).forEach((e: any) => {
      countMap[e.lottery_id] = (countMap[e.lottery_id] || 0) + 1;
    });

    // If userId provided, get their entries
    let userEntries: string[] = [];
    if (userId) {
      const { data: entries } = await supabase
        .from("lottery_entries")
        .select("lottery_id")
        .eq("user_id", userId);
      userEntries = (entries || []).map((e: any) => e.lottery_id);
    }

    // Get user's pick data for eligibility
    let userPicks: any[] = [];
    if (userId) {
      const { data: picks } = await supabase
        .from("fan_picks")
        .select("*")
        .eq("user_id", userId)
        .eq("is_used", false);
      userPicks = picks || [];
    }

    const totalPicks = userPicks.length;
    const uniqueTypes = new Set(userPicks.map((p: any) => p.pick_type)).size;

    const enriched = (lotteries || []).map((l: any) => {
      const isEntered = userEntries.includes(l.id);
      let isEligible = false;
      let progress = 0;

      if (l.requirement_type === "min_picks") {
        isEligible = totalPicks >= l.requirement_value;
        progress = Math.min(100, (totalPicks / l.requirement_value) * 100);
      } else if (l.requirement_type === "all_rarities") {
        isEligible = uniqueTypes >= l.requirement_value;
        progress = Math.min(100, (uniqueTypes / l.requirement_value) * 100);
      }

      const endsAt = l.ends_at ? new Date(l.ends_at) : null;
      const now = new Date();
      let endsIn = "";
      if (endsAt) {
        const diff = endsAt.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        endsIn = days > 0 ? `${days} day${days !== 1 ? "s" : ""}` : "Ended";
      }

      return {
        ...l,
        entryCount: countMap[l.id] || 0,
        isEntered,
        isEligible,
        progress,
        endsIn,
      };
    });

    return NextResponse.json({ lotteries: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/picks/lotteries — Enter a lottery
export async function POST(req: Request) {
  try {
    const { lotteryId, userId } = await req.json();

    if (!lotteryId || !userId) {
      return NextResponse.json({ error: "lotteryId and userId are required" }, { status: 400 });
    }

    const supabase = getAdmin();

    // Verify lottery exists and is active
    const { data: lottery, error: lotErr } = await supabase
      .from("lotteries")
      .select("*")
      .eq("id", lotteryId)
      .single();

    if (lotErr || !lottery) {
      return NextResponse.json({ error: "Lottery not found" }, { status: 404 });
    }

    if (lottery.status !== "active") {
      return NextResponse.json({ error: "This lottery is no longer accepting entries" }, { status: 400 });
    }

    // Check if already entered
    const { data: existing } = await supabase
      .from("lottery_entries")
      .select("id")
      .eq("lottery_id", lotteryId)
      .eq("user_id", userId)
      .single();

    if (existing) {
      return NextResponse.json({ error: "You've already entered this lottery" }, { status: 400 });
    }

    // Verify eligibility
    const { data: picks } = await supabase
      .from("fan_picks")
      .select("*")
      .eq("user_id", userId)
      .eq("is_used", false);

    const userPicks = picks || [];
    const totalPicks = userPicks.length;
    const uniqueTypes = new Set(userPicks.map((p: any) => p.pick_type)).size;

    let eligible = false;
    if (lottery.requirement_type === "min_picks") {
      eligible = totalPicks >= lottery.requirement_value;
    } else if (lottery.requirement_type === "all_rarities") {
      eligible = uniqueTypes >= lottery.requirement_value;
    }

    if (!eligible) {
      return NextResponse.json({ error: "You don't meet the requirements for this lottery" }, { status: 400 });
    }

    // Create entry
    const pickIds = userPicks.slice(0, lottery.requirement_value).map((p: any) => p.id);

    const { error: entryErr } = await supabase
      .from("lottery_entries")
      .insert({
        lottery_id: lotteryId,
        user_id: userId,
        pick_ids: pickIds,
      });

    if (entryErr) throw entryErr;

    return NextResponse.json({
      success: true,
      message: `Entered ${lottery.name}! Good luck! 🎸`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
