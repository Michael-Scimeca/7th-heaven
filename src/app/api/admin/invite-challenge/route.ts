import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/invite-challenge?showId=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const showId = searchParams.get("showId");
  if (!showId) return NextResponse.json({ error: "showId required" }, { status: 400 });

  const { data, error } = await supabase
    .from("show_invite_challenges")
    .select("*")
    .eq("show_id", showId)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? null);
}

// POST /api/admin/invite-challenge
export async function POST(req: Request) {
  const body = await req.json();
  const { show_id, enabled, threshold, reward_name, reward_description } = body;

  if (!show_id || !reward_name) {
    return NextResponse.json({ error: "show_id and reward_name required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("show_invite_challenges")
    .upsert(
      { show_id, enabled, threshold, reward_name, reward_description, updated_at: new Date().toISOString() },
      { onConflict: "show_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
