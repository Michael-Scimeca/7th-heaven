import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/sms/auto-blast
 * 
 * Called by a cron job (e.g., Vercel Cron, daily at 9am).
 * Checks for shows happening within X days and auto-sends proximity SMS
 * to fans near the venue — UNLESS auto-blast is disabled or the show
 * has already been blasted.
 */

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // Check auth (cron secret or admin)
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    if (secret !== process.env.CRON_SECRET && secret !== "dev") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if auto-blast is enabled
    const { data: setting } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "sms_auto_blast")
      .single();

    const autoBlastEnabled = setting?.value !== "off";
    if (!autoBlastEnabled) {
      return NextResponse.json({ skipped: true, reason: "Auto-blast disabled by admin" });
    }

    // Get days-before setting (default 3)
    const { data: daysSetting } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "sms_auto_blast_days")
      .single();
    const daysBefore = parseInt(daysSetting?.value || "3", 10);

    // Find shows happening within the next X days (excluding private)
    const now = new Date();
    const targetDate = new Date(now.getTime() + daysBefore * 24 * 60 * 60 * 1000);
    const todayStr = now.toISOString().split("T")[0];
    const targetStr = targetDate.toISOString().split("T")[0];

    const shows = await sanityClient.fetch(
      `*[_type == "tourDate" && date >= $today && date <= $target && !isPrivate && !("private" in tags) && !("corporate" in tags)] | order(date asc) {
        _id, venue, city, state, date, time, day,
        doorsTime, allAges, cover, lat, lng
      }`,
      { today: todayStr, target: targetStr }
    );

    if (!shows || shows.length === 0) {
      return NextResponse.json({ skipped: true, reason: "No shows in window" });
    }

    // Check which shows have already been blasted
    const { data: blastedShows } = await supabaseAdmin
      .from("sms_blast_log")
      .select("show_id")
      .in("show_id", shows.map((s: any) => s._id));

    const alreadyBlasted = new Set((blastedShows || []).map((b: any) => b.show_id));
    const showsToBlast = shows.filter((s: any) => !alreadyBlasted.has(s._id));

    if (showsToBlast.length === 0) {
      return NextResponse.json({ skipped: true, reason: "All shows already blasted" });
    }

    // Send blasts
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const results: any[] = [];

    for (const show of showsToBlast) {
      if (!show.lat || !show.lng) continue; // Skip shows without coordinates

      const d = new Date(show.date + "T12:00:00");
      const body: any = {
        venue: show.venue,
        city: show.city,
        state: show.state || "",
        lat: show.lat,
        lng: show.lng,
        date: d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
        time: show.time || "",
        doorsTime: show.doorsTime || "",
      };
      if (show.allAges !== undefined && show.allAges !== null) body.allAges = show.allAges;
      if (show.cover) body.cover = show.cover;

      try {
        const res = await fetch(`${baseUrl}/api/sms/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();

        // Log the blast
        await supabaseAdmin.from("sms_blast_log").insert({
          show_id: show._id,
          venue: show.venue,
          date: show.date,
          sent_count: data.sent || 0,
          blasted_at: new Date().toISOString(),
        });

        results.push({ showId: show._id, venue: show.venue, sent: data.sent || 0, success: true });
      } catch (err: any) {
        results.push({ showId: show._id, venue: show.venue, error: err.message, success: false });
      }
    }

    return NextResponse.json({ success: true, blasted: results.length, results });
  } catch (error: any) {
    console.error("Auto-blast error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
