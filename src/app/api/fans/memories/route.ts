import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/fans/memories
export async function POST(req: Request) {
  const body = await req.json();
  const { show_id, memory_text, display_name, photo_url } = body;

  if (!show_id || !memory_text) {
    return NextResponse.json({ error: "show_id and memory_text required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("show_memories")
    .insert({ show_id, memory_text, display_name, photo_url: photo_url ?? null })
    .select()
    .single();

  if (error) {
    // Gracefully handle missing table (before migration runs)
    if (error.code === "42P01") {
      return NextResponse.json({ ok: true, note: "table not yet created" });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// GET /api/fans/memories?showId=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const showId = searchParams.get("showId");

  let query = supabase.from("show_memories").select("*").eq("approved", true).order("created_at", { ascending: false });
  if (showId) query = query.eq("show_id", showId);

  const { data, error } = await query;
  if (error) return NextResponse.json([], { status: 200 }); // fail gracefully
  return NextResponse.json(data ?? []);
}
