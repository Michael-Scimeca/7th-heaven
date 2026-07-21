import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: showId } = await params;

    if (!showId) {
      return NextResponse.json({ error: "Show ID is required" }, { status: 400 });
    }

    const { count, error } = await supabase
      .from("show_attendance")
      .select("*", { count: "exact", head: true })
      .eq("show_id", showId);

    if (error) throw error;

    return NextResponse.json({ count: count || 0, going: count || 0 });
  } catch (error: any) {
    console.error("Attendance fetch error:", error?.message || error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}
