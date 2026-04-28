import { NextRequest, NextResponse } from "next/server";

// GET /api/proximity/attendees?showId=xxx
// Returns fans who are "going" or "there" for a given show
export async function GET(req: NextRequest) {
  try {
    const { createClient } = await import("@/utils/supabase/server");
    const supabase = await createClient();
    const showId = req.nextUrl.searchParams.get("showId");
    if (!showId) return NextResponse.json({ error: "showId required" }, { status: 400 });

    const { data: attendees, error } = await supabase
      .from("show_attendance")
      .select(`
        id,
        status,
        anonymous,
        checked_in_at,
        profiles (
          id,
          full_name,
          profile_photo_url,
          tier
        )
      `)
      .eq("show_id", showId)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ attendees: attendees || [] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST /api/proximity/attendees — mark "going" or check in
export async function POST(req: NextRequest) {
  try {
    const { createClient } = await import("@/utils/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { showId, status, anonymous } = body; // status: "going" | "there", anonymous: boolean

    const { error } = await supabase.from("show_attendance").upsert(
      {
        show_id: showId,
        user_id: user.id,
        status,
        anonymous: anonymous ?? false,
        checked_in_at: status === "there" ? new Date().toISOString() : null,
      },
      { onConflict: "show_id,user_id" }
    );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// DELETE /api/proximity/attendees — remove "going"
export async function DELETE(req: NextRequest) {
  try {
    const { createClient } = await import("@/utils/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const showId = req.nextUrl.searchParams.get("showId");
    if (!showId) return NextResponse.json({ error: "showId required" }, { status: 400 });

    await supabase.from("show_attendance").delete().eq("show_id", showId).eq("user_id", user.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
