import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { applyRateLimit, getClientIp, sanitizeText, isSpam } from "@/lib/api-utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/fans/memories
export async function POST(req: Request) {
  const ip = await getClientIp();
  const rateLimited = await applyRateLimit(ip, "7h:memories", 5, "60 s");
  if (rateLimited) return rateLimited;

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  if (isSpam(body)) return NextResponse.json({ ok: true }); // silent drop

  const show_id = sanitizeText(body.show_id as string, 100);
  const memory_text = sanitizeText(body.memory_text as string, 280);
  const display_name = sanitizeText(body.display_name as string, 100);
  const photo_url = typeof body.photo_url === 'string' && body.photo_url.startsWith('https://') ? body.photo_url : null;

  if (!show_id || !memory_text || memory_text.length < 3) {
    return NextResponse.json({ error: "show_id and memory_text required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("show_memories")
    .insert({ show_id, memory_text, display_name, photo_url: photo_url ?? null, approved: false })
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

// GET /api/fans/memories?showId=xxx&all=true (all=true returns pending too, for admin)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const showId = searchParams.get("showId");
  const returnAll = searchParams.get("all") === "true";

  let query = supabase.from("show_memories").select("*").order("created_at", { ascending: false });

  // Only return approved memories by default; admin can request all
  if (!returnAll) {
    query = query.eq("approved", true);
  }

  if (showId) query = query.eq("show_id", showId);

  const { data, error } = await query;
  if (error) return NextResponse.json([], { status: 200 }); // fail gracefully
  return NextResponse.json(data ?? []);
}

// PATCH /api/fans/memories — approve or reject a memory (admin moderation)
export async function PATCH(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const id = body.id as string;
  const action = body.action as string;

  if (!id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: "id and action (approve|reject) required" }, { status: 400 });
  }

  if (action === 'approve') {
    const { error } = await supabase
      .from("show_memories")
      .update({ approved: true })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    // reject = delete
    const { error } = await supabase
      .from("show_memories")
      .delete()
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
