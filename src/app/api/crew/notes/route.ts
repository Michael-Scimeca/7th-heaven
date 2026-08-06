import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function POST(request: Request) {
  try {
    const {
      crew_id,
      crew_name,
      content
    } = await request.json();
    if (!crew_id) {
      return NextResponse.json({
        error: "Missing crew_id"
      }, {
        status: 400
      });
    }
    const {
      error
    } = await supabase.from("crew_notes").upsert({
      crew_id,
      crew_name: crew_name || "Crew Member",
      content: content || "",
      updated_at: new Date().toISOString()
    }, {
      onConflict: "crew_id"
    });
    if (error) {
      return NextResponse.json({
        error: error.message
      }, {
        status: 500
      });
    }
    return NextResponse.json({
      success: true
    });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message || "Failed to save crew notes"
    }, {
      status: 500
    });
  }
}