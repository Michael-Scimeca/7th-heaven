import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getNtfyTopic } from "@/lib/ntfy";

export const dynamic = "force-dynamic";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  const sb = getSupabase();
  let userRole = "fan";
  let isBand = false;

  if (token) {
    const {
      data: { user },
    } = await sb.auth.getUser(token);
    if (user) {
      const { data: profile } = await sb
        .from("profiles")
        .select("role, is_band")
        .eq("id", user.id)
        .single();
      if (profile) {
        userRole = profile.role || "fan";
        isBand = !!profile.is_band;
      }
    }
  }

  const topics: Record<string, string | null> = {
    fans: getNtfyTopic("fans"),
  };

  // Only return crew topic to authenticated crew or admins
  if (userRole === "crew" || userRole === "admin") {
    topics.crew = getNtfyTopic("crew");
  }

  // Only return band topic to band members or admins
  if (isBand || userRole === "admin") {
    topics.band = getNtfyTopic("band");
  }

  return NextResponse.json({
    topics,
    server: process.env.NTFY_SERVER || "https://ntfy.sh",
  });
}
