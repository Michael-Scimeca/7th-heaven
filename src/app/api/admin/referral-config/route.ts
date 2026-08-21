import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/api-utils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

/**
 * GET /api/admin/referral-config
 * Public read: returns whether referral program is enabled + milestone tiers
 */
export async function GET() {
  try {
    // Fetch enabled state
    const { data: enabledRow } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "referral_program_enabled")
      .single();

    // Fetch milestones
    const { data: milestonesRow } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "referral_milestones")
      .single();

    const enabled = enabledRow?.value === "true" || enabledRow?.value === true;

    let milestones = [
      { threshold: 3, reward: "🎸 Rare Pick", emoji: "🎸" },
      { threshold: 10, reward: "🎽 Free Merch", emoji: "🎽" },
      { threshold: 25, reward: "⭐ VIP Status", emoji: "⭐" },
    ];

    if (milestonesRow?.value) {
      try {
        const parsed = typeof milestonesRow.value === "string"
          ? JSON.parse(milestonesRow.value)
          : milestonesRow.value;
        if (Array.isArray(parsed) && parsed.length > 0) milestones = parsed;
      } catch {}
    }

    return NextResponse.json({ enabled, milestones });
  } catch (err) {
    console.error("[referral-config] GET error:", err);
    return NextResponse.json({ enabled: false, milestones: [] }, { status: 500 });
  }
}

/**
 * POST /api/admin/referral-config
 * Admin-only: update enabled state and/or milestones
 */
export async function POST(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    // Update enabled state
    if (body.enabled !== undefined) {
      await supabaseAdmin
        .from("site_settings")
        .upsert(
          { key: "referral_program_enabled", value: String(body.enabled), updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
    }

    // Update milestones
    if (body.milestones !== undefined && Array.isArray(body.milestones)) {
      await supabaseAdmin
        .from("site_settings")
        .upsert(
          { key: "referral_milestones", value: JSON.stringify(body.milestones), updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[referral-config] POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
