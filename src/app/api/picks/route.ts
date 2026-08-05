import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PICK_TYPES = {
  purple:      { name: "Classic Purple",  rarity: "Common",    color: "#a855f7" },
  red:         { name: "Crimson Fire",    rarity: "Uncommon",  color: "#ef4444" },
  black:       { name: "Stealth Black",   rarity: "Uncommon",  color: "#6b7280" },
  silver:      { name: "Chrome Silver",   rarity: "Rare",      color: "#c0c0c0" },
  gold:        { name: "24K Gold",        rarity: "Epic",      color: "#c084fc" },
  holographic: { name: "Holographic",     rarity: "Legendary", color: "#ec4899" },
};

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET /api/picks?userId=xxx — Fetch all picks for a user
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(userId);
    let picks: any[] = [];

    if (isUUID) {
      const supabase = getAdmin();
      const { data, error } = await supabase
        .from("fan_picks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        picks = data;
      }
    }

    // Group picks by type
    const grouped: Record<string, { count: number; picks: any[]; meta: any }> = {};
    for (const [typeId, meta] of Object.entries(PICK_TYPES)) {
      const typePicks = (picks || []).filter((p: any) => p.pick_type === typeId);
      grouped[typeId] = {
        count: typePicks.length,
        picks: typePicks,
        meta,
      };
    }

    const totalOwned = (picks || []).length;
    const uniqueTypes = Object.values(grouped).filter((g) => g.count > 0).length;

    return NextResponse.json({
      picks: picks || [],
      grouped,
      totalOwned,
      uniqueTypes,
      totalTypes: Object.keys(PICK_TYPES).length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/picks — Award a pick to a fan
export async function POST(req: Request) {
  try {
    const { userId, pickType, reason, showId, awardedBy } = await req.json();

    if (!userId || !pickType) {
      return NextResponse.json({ error: "userId and pickType are required" }, { status: 400 });
    }

    if (!PICK_TYPES[pickType as keyof typeof PICK_TYPES]) {
      return NextResponse.json({ error: `Invalid pick type: ${pickType}` }, { status: 400 });
    }

    const supabase = getAdmin();

    const { data, error } = await supabase
      .from("fan_picks")
      .insert({
        user_id: userId,
        pick_type: pickType,
        awarded_by: awardedBy || "admin",
        awarded_reason: reason || "manual",
        show_id: showId || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      pick: data,
      message: `Awarded ${PICK_TYPES[pickType as keyof typeof PICK_TYPES].name} pick to user.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
