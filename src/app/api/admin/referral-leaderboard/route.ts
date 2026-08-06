import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin, maskEmail } from "@/lib/api-utils";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/referral-leaderboard
 * Returns aggregated referral counts per referrer, sorted by most referrals.
 * Joins against profiles to get names.
 */
export async function GET(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    // Get all referrals grouped by referrer_code
    const { data: referrals, error } = await supabaseAdmin
      .from("referrals")
      .select("referrer_id, referrer_code, status, created_at, referred_email")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[referral-leaderboard] query error:", error);
      return NextResponse.json({ leaderboard: [], totalReferrals: 0, totalConverted: 0 });
    }

    // Build aggregation map
    const referrerMap: Record<string, {
      referrer_id: string | null;
      referrer_code: string;
      total: number;
      signed_up: number;
      rewarded: number;
      pending: number;
      recent: string[];
    }> = {};

    for (const r of (referrals || [])) {
      const key = r.referrer_code;
      if (!referrerMap[key]) {
        referrerMap[key] = {
          referrer_id: r.referrer_id,
          referrer_code: key,
          total: 0,
          signed_up: 0,
          rewarded: 0,
          pending: 0,
          recent: [],
        };
      }
      referrerMap[key].total++;
      if (r.status === "signed_up") referrerMap[key].signed_up++;
      if (r.status === "rewarded") referrerMap[key].rewarded++;
      if (r.status === "pending") referrerMap[key].pending++;
      if (referrerMap[key].recent.length < 5) {
        referrerMap[key].recent.push(maskEmail(r.referred_email));
      }
    }

    // Get profile names for all referrer IDs
    const referrerIds = Object.values(referrerMap).flatMap(r => r.referrer_id ? [r.referrer_id] : []);

    let nameMap: Record<string, string> = {};
    if (referrerIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, email")
        .in("id", referrerIds);

      if (profiles) {
        for (const p of profiles) {
          nameMap[p.id] = p.full_name || p.email || "Unknown";
        }
      }
    }

    // Build sorted leaderboard
    const leaderboard = Object.values(referrerMap)
      .map((r) => ({
        ...r,
        name: r.referrer_id ? nameMap[r.referrer_id] || r.referrer_code : r.referrer_code,
      }))
      .sort((a, b) => b.total - a.total);

    const totalReferrals = (referrals || []).length;
    const totalConverted = (referrals || []).filter((r) => r.status === "signed_up" || r.status === "rewarded").length;

    return NextResponse.json({
      leaderboard,
      totalReferrals,
      totalConverted,
    });
  } catch (err) {
    console.error("[referral-leaderboard] error:", err);
    return NextResponse.json({ leaderboard: [], totalReferrals: 0, totalConverted: 0 }, { status: 500 });
  }
}

/**
 * POST /api/admin/referral-leaderboard
 * Mark a referral as rewarded (admin checks off that the prize was claimed)
 */
export async function POST(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { referrer_code, action } = await request.json();

    if (action === "mark_rewarded" && referrer_code) {
      // Mark all signed_up referrals for this code as rewarded
      const { error } = await supabaseAdmin
        .from("referrals")
        .update({ status: "rewarded" })
        .eq("referrer_code", referrer_code)
        .eq("status", "signed_up");

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
