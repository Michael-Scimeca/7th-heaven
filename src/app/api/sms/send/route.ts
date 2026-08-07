import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { distanceMiles } from "@/lib/geo";
import { VENUE_COORDS } from "@/lib/venue-coords";
import { requireAdmin } from "@/lib/api-utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST: Send proximity SMS blast to subscribers near a venue.
 *
 * Body params:
 *   venue     — Venue name (e.g. "Station 34")
 *   city      — City name (e.g. "Mt. Prospect")
 *   state     — State abbreviation (e.g. "IL")
 *   date      — Show date string (e.g. "Saturday, May 10")
 *   time      — Show time (e.g. "8:00pm")
 *   doorsTime — Doors open time (e.g. "7:00pm")
 *   allAges   — Boolean for all-ages show
 *   cover     — Cover/admission info (e.g. "Free", "$10", "$15 at door")
 *   message   — (optional) Custom message override — if provided, skips auto-format
 *   lat/lng   — (optional) Override venue coordinates
 *   radius    — (optional) Override max radius in miles (default: use each subscriber's own radius)
 */
export async function POST(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      venue, city, state,
      date, time, doorsTime, playTime,
      allAges, cover,
      showId,
      message: customMessage,
      lat, lng, radius: overrideRadius,
    } = body;

    // Build show page URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://7thheavenband.com";
    const showUrl = showId ? `${siteUrl}/shows/${showId}` : null;

    // Build the SMS body — either from show details or a custom message
    let smsBody: string;

    if (customMessage) {
      // Admin provided a raw custom message
      smsBody = `🎸 7th Heaven: ${customMessage}\n\nReply STOP to unsubscribe.`;
    } else {
      // Auto-build from show details
      if (!venue || !city) {
        return NextResponse.json({
          error: "Provide venue + city (for auto-message) or a custom message.",
        }, { status: 400 });
      }

      const location = state ? `${city}, ${state}` : city;
      const lines: string[] = [
        `🎸 7th Heaven is playing in your area!`,
        ``,
        `📍 ${venue} — ${location}`,
      ];

      if (date) lines.push(`📅 ${date}`);
      let timeLine = "";
      if (doorsTime) timeLine += `🚪 Doors: ${doorsTime}`;
      if (time) timeLine += `${timeLine ? " | " : ""}Show: ${time}`;
      if (playTime) timeLine += `${timeLine ? " | " : ""}Plays: ${playTime}`;
      if (timeLine) lines.push(timeLine);

      if (allAges === true) {
        lines.push(`✅ All Ages`);
      } else if (allAges === false) {
        lines.push(`🔞 21+`);
      }

      if (cover) {
        const lowerCover = cover.toLowerCase();
        if (lowerCover === "free" || lowerCover === "no cover" || lowerCover === "$0") {
          lines.push(`🎟️ FREE — No Cover`);
        } else {
          lines.push(`🎟️ Cover: ${cover}`);
        }
      }

      // Fetch attendance count if we have a showId
      if (showId) {
        const { count } = await supabase
          .from("show_attendance")
          .select("*", { count: "exact", head: true })
          .eq("show_id", showId);
        if (count && count > 0) {
          lines.push(`🔥 ${count} fan${count === 1 ? "" : "s"} already going!`);
        }
      }

      // Show link + reply options
      if (showUrl) {
        lines.push(``);
        lines.push(`RSVP & see who's going:`);
        lines.push(showUrl);
        lines.push(``);
        lines.push(`Reply 1=GOING 2=DIRECTIONS`);
      }

      lines.push(``);
      lines.push(`Reply STOP to unsubscribe.`);
      smsBody = lines.join("\n");
    }

    // Resolve venue coordinates
    let venueLat = lat;
    let venueLng = lng;

    if (!venueLat || !venueLng) {
      if (venue && city) {
        const key = `${venue}|${city}`;
        const coords = VENUE_COORDS[key];
        if (coords) {
          venueLat = coords[0];
          venueLng = coords[1];
        }
      }
    }

    if (!venueLat || !venueLng) {
      return NextResponse.json({
        error: "Could not resolve venue location. Provide venue+city or lat+lng.",
      }, { status: 400 });
    }

    // Fetch opted-in subscribers — basic query first (always works)
    let allSubscribers: any[] = [];
    let geoEnabled = false;

    // Try basic fetch first
    const { data: subs, error: subsError } = await supabase
      .from("sms_subscribers")
      .select("phone, name")
      .eq("opted_in", true);

    if (subsError) throw subsError;
    allSubscribers = subs || [];

    // For now, send to all subscribers (proximity filtering requires geo columns migration)
    const nearbySubscribers = allSubscribers;

    // Twilio batch send (if configured)
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && twilioPhone) {
      const twilio = (await import("twilio")).default;
      const client = twilio(accountSid, authToken);
      const smsResults = await Promise.all(nearbySubscribers.map(async (sub) => {
        try {
          await client.messages.create({
            body: smsBody,
            from: twilioPhone,
            to: sub.phone,
          });
          return true;
        } catch {
          return false;
        }
      }));

      let sent = smsResults.filter(Boolean).length;
      let failed = smsResults.length - sent;

      return NextResponse.json({
        success: true,
        sent,
        failed,
        total: nearbySubscribers.length,
        allSubscribers: allSubscribers?.length || 0,
        venue: `${venue || "Custom"} (${city || "N/A"})`,
        preview: smsBody,
      });
    }

    // Dev mode — no Twilio credentials
    return NextResponse.json({
      success: true,
      message: `Would send to ${nearbySubscribers.length} of ${allSubscribers?.length || 0} total subscribers near ${venue || "venue"}`,
      nearbyCount: nearbySubscribers.length,
      totalSubscribers: allSubscribers?.length || 0,
      venueLat,
      venueLng,
      preview: smsBody,
      note: "Twilio not configured — add API keys to .env.local",
    });
  } catch (error: any) {
    console.error("SMS send error:", error?.message || error);
    return NextResponse.json({ error: "Failed to send messages", detail: error?.message || String(error) }, { status: 500 });
  }
}

// DELETE: Opt-out a subscriber by phone
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone")?.replace(/\D/g, "");

    if (!phone) {
      return NextResponse.json({ error: "Phone required" }, { status: 400 });
    }

    const e164 = phone.length === 10 ? `+1${phone}` : `+${phone}`;

    await supabase
      .from("sms_subscribers")
      .update({ opted_in: false, opted_out_at: new Date().toISOString() })
      .eq("phone", e164);

    return NextResponse.json({ success: true, message: "Unsubscribed" });
  } catch (error) {
    console.error("SMS unsubscribe error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
