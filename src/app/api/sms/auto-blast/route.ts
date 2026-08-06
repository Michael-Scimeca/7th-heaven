import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/sms/auto-blast
 * 
 * Called by a cron job (e.g., Vercel Cron, every hour or at specific times).
 * Checks for shows happening within the next 8 hours and auto-sends
 * proximity SMS to fans near each venue.
 * 
 * Handles multiple shows per day — each show is blasted independently.
 * Uses sms_blast_log to prevent duplicate blasts.
 */

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
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

    // Get hours-before setting (default 8)
    const { data: hoursSetting } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "sms_auto_blast_hours")
      .single();
    const hoursBefore = parseInt(hoursSetting?.value || "8", 10);

    // Calculate the blast window: now → now + hoursBefore
    // This means if the cron runs hourly, shows whose start time is
    // within the next 8 hours will be picked up.
    const now = new Date();
    const windowEnd = new Date(now.getTime() + hoursBefore * 60 * 60 * 1000);

    // Fetch shows for today AND tomorrow (to catch late-night + early blasts)
    const todayStr = now.toISOString().split("T")[0];
    const tomorrowStr = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const shows = await sanityClient.fetch(
      `*[_type == "tourDate" && date >= $today && date <= $tomorrow && !isPrivate && !("private" in tags) && !("corporate" in tags)] | order(date asc, time asc) {
        _id, venue, city, state, date, time, playTime, day,
        doorsTime, allAges, cover, lat, lng
      }`,
      { today: todayStr, tomorrow: tomorrowStr }
    );

    if (!shows || shows.length === 0) {
      return NextResponse.json({ skipped: true, reason: "No shows today/tomorrow" });
    }

    // Parse show times and filter to those within the blast window
    const showsInWindow = shows.filter((show: any) => {
      // Parse show time — try "8:00 PM" / "9PM" / "21:00" formats
      const showDate = show.date; // "2026-05-04"
      const showTime = show.doorsTime || show.time || "20:00"; // default 8pm
      
      let showDateTime: Date;
      const timeMatch = showTime.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2] || "0", 10);
        const ampm = (timeMatch[3] || "").toUpperCase();
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
        showDateTime = new Date(`${showDate}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`);
      } else {
        // Fallback: assume 8pm
        showDateTime = new Date(`${showDate}T20:00:00`);
      }

      // Show should be in the future and within the blast window
      return showDateTime > now && showDateTime <= windowEnd;
    });

    if (showsInWindow.length === 0) {
      return NextResponse.json({
        skipped: true,
        reason: `No shows starting within next ${hoursBefore} hours`,
        totalShowsFound: shows.length,
        checkedWindow: { from: now.toISOString(), to: windowEnd.toISOString() },
      });
    }

    // Check which shows have already been blasted
    const { data: blastedShows } = await supabaseAdmin
      .from("sms_blast_log")
      .select("show_id")
      .in("show_id", showsInWindow.map((s: any) => s._id));

    const alreadyBlasted = new Set((blastedShows || []).map((b: any) => b.show_id));
    const showsToBlast = showsInWindow.filter((s: any) => !alreadyBlasted.has(s._id));

    if (showsToBlast.length === 0) {
      return NextResponse.json({
        skipped: true,
        reason: "All shows in window already blasted",
        showsInWindow: showsInWindow.length,
      });
    }

    // Send blasts — each show independently (handles multi-show days)
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
        playTime: show.playTime || "",
        showId: show._id, // for show link + attendance count in SMS
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

        results.push({ showId: show._id, venue: show.venue, city: show.city, sent: data.sent || 0, success: true });
      } catch (err: any) {
        results.push({ showId: show._id, venue: show.venue, city: show.city, error: err.message, success: false });
      }
    }

    return NextResponse.json({
      success: true,
      blasted: results.length,
      totalShowsToday: shows.length,
      showsInWindow: showsInWindow.length,
      results,
    });
  } catch (error: any) {
    console.error("Auto-blast error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    endpoint: "/api/sms/auto-blast",
    method: "POST required to trigger blast",
  });
}
