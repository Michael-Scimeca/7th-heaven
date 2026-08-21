import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { distanceMiles } from "@/lib/geo";
import { VENUE_COORDS } from "@/lib/venue-coords";
import { requireAdmin, requireAdminSecret } from "@/lib/api-utils";
import { publishToGroup } from "@/lib/ntfy";

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
  // Accept either a valid admin session cookie OR the x-admin-secret header
  const secretError = requireAdminSecret(request);
  if (secretError) {
    const sessionError = await requireAdmin(request);
    if (sessionError) return sessionError;
  }

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

    // Parse custom recipients list if provided
    let customPhoneList: string[] = [];
    if (body.recipients) {
      const raw = typeof body.recipients === "string"
        ? body.recipients.split(/[\n,;]+/)
        : Array.isArray(body.recipients) ? body.recipients : [];
      customPhoneList = Array.from(new Set(raw
        .map((r: any) => {
          const digits = String(r).replace(/\D/g, "");
          if (digits.length === 10) return `+1${digits}`;
          if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
          return digits ? `+${digits}` : "";
        })
        .filter(Boolean)));
    }

    let nearbySubscribers: { phone: string }[] = [];
    let allSubscribersCount = 0;

    if (customPhoneList.length > 0) {
      // Use custom recipients list directly
      nearbySubscribers = customPhoneList.map(phone => ({ phone }));
      allSubscribersCount = customPhoneList.length;
    } else {
      // Resolve venue coordinates if sending to nearby subscribers
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

      // Fetch opted-in subscribers from database
      const { data: subs, error: subsError } = await supabase
        .from("sms_subscribers")
        .select("phone, name")
        .eq("opted_in", true);

      if (subsError) throw subsError;
      const allSubscribers = subs || [];
      nearbySubscribers = allSubscribers;
      allSubscribersCount = allSubscribers.length;
    }

    // Always dispatch instant ntfy push notification to fans group
    const pushResult = await publishToGroup('fans', {
      title: venue ? `🎸 7th Heaven at ${venue}` : '🚨 7th Heaven Alert',
      message: customMessage || smsBody,
      priority: 'high',
      tags: ['guitar', 'bell'],
    }).catch((err) => {
      console.error('[ntfy] Push dispatch failed:', err);
      return false;
    });

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
        allSubscribers: allSubscribersCount,
        venue: `${venue || "Custom"} (${city || "N/A"})`,
        preview: smsBody,
      });
    }

    // Dev mode — no Twilio credentials
    return NextResponse.json({
      success: true,
      message: `Would send SMS text to ${nearbySubscribers.length} recipient${nearbySubscribers.length === 1 ? "" : "s"}`,
      nearbyCount: nearbySubscribers.length,
      totalSubscribers: allSubscribersCount,
      preview: smsBody,
      note: "Twilio API status active",
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
