import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST: Twilio incoming SMS webhook
 *
 * Twilio sends form-urlencoded data with:
 *   From — sender phone (e.g. "+15551234567")
 *   Body — text message body
 *
 * Set this URL in Twilio → Phone Number → Messaging → "A MESSAGE COMES IN":
 *   https://7thheavenband.com/api/sms/webhook
 *
 * Handles:
 *   STOP / UNSUBSCRIBE — Opt out the subscriber
 *   START / SUBSCRIBE  — Re-opt-in
 *   1 / GOING          — Auto-RSVP to the most recent show
 *   2 / DIRECTIONS     — Reply with Google Maps link to the most recent show
 */
export async function POST(request: Request) {
  // ── Twilio Signature Verification ──────────────────────────────────────
  // Every inbound Twilio request is signed with HMAC-SHA1 using the auth token.
  // We validate before touching any DB to prevent spoofed webhook abuse.
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (authToken) {
    const twilioSignature = request.headers.get("x-twilio-signature") ?? "";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://7thheavenband.com";
    const webhookUrl = `${siteUrl}/api/sms/webhook`;

    // Clone the request so we can read the body for signature validation
    // AND again below for actual processing (Request body can only be read once).
    const clonedRequest = request.clone();
    const rawBody = await clonedRequest.text();

    // Build the params object Twilio uses for signature computation (sorted form fields).
    const params: Record<string, string> = {};
    for (const [key, value] of new URLSearchParams(rawBody)) {
      params[key] = value;
    }

    const isValid = twilio.validateRequest(authToken, twilioSignature, webhookUrl, params);
    if (!isValid) {
      console.warn("SMS webhook: invalid Twilio signature — request rejected");
      return new NextResponse("Forbidden", { status: 403 });
    }
  } else {
    // No auth token configured — block in production, warn in dev.
    if (process.env.NODE_ENV === "production") {
      console.error("SMS webhook: TWILIO_AUTH_TOKEN is not set — rejecting request in production");
      return new NextResponse("Service unavailable", { status: 503 });
    }
    console.warn("SMS webhook: TWILIO_AUTH_TOKEN not set — skipping signature check (dev only)");
  }
  // ── End Signature Verification ─────────────────────────────────────────

  try {
    const formData = await request.formData();
    const from = formData.get("From")?.toString() || "";
    const body = (formData.get("Body")?.toString() || "").trim().toUpperCase();

    // ── STOP / UNSUBSCRIBE ──────────────────────────────────────────
    if (["STOP", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"].includes(body)) {
      await supabase
        .from("sms_subscribers")
        .update({ opted_in: false, opted_out_at: new Date().toISOString() })
        .eq("phone", from);

      return twimlResponse("You've been unsubscribed from 7th Heaven alerts. Reply START to resubscribe anytime. 🎸");
    }

    // ── START / SUBSCRIBE ───────────────────────────────────────────
    if (["START", "SUBSCRIBE", "YES", "UNSTOP"].includes(body)) {
      await supabase
        .from("sms_subscribers")
        .update({ opted_in: true, opted_out_at: null })
        .eq("phone", from);

      return twimlResponse("Welcome back! You're subscribed to 7th Heaven show alerts. 🎸🔥 Reply STOP anytime to unsubscribe.");
    }

    // ── GOING (reply "1") ───────────────────────────────────────────
    if (body === "1" || body === "GOING") {
      const { data: show } = await supabase
        .from("shows")
        .select("id, venue_name, city, state")
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .limit(1)
        .single();

      if (show) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://7thheavenband.com";
        return twimlResponse(
          `🔥 You're going to ${show.venue_name}! See who else is going & RSVP:\n${siteUrl}/shows/${show.id}?rsvp=going`
        );
      }
      return twimlResponse("No upcoming shows found right now. Stay tuned! 🎸");
    }

    // ── DIRECTIONS (reply "2") ──────────────────────────────────────
    if (body === "2" || body === "DIRECTIONS") {
      const { data: show } = await supabase
        .from("shows")
        .select("venue_name, city, state, latitude, longitude")
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .limit(1)
        .single();

      if (show) {
        const mapsUrl = show.latitude && show.longitude
          ? `https://www.google.com/maps/search/?api=1&query=${show.latitude},${show.longitude}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${show.venue_name} ${show.city} ${show.state}`)}`;
        return twimlResponse(
          `📍 Directions to ${show.venue_name}:\n${mapsUrl}`
        );
      }
      return twimlResponse("No upcoming shows found right now. Stay tuned! 🎸");
    }

    // ── Default reply ───────────────────────────────────────────────
    return twimlResponse(
      "🎸 7th Heaven Alerts\nReply 1=GOING, 2=DIRECTIONS, STOP=unsubscribe"
    );
  } catch (error) {
    console.error("SMS webhook error:", error);
    return twimlResponse("Something went wrong. Try again later!");
  }
}

/** Return a TwiML XML response so Twilio sends an SMS reply */
function twimlResponse(message: string) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`;
  return new NextResponse(xml, {
    headers: { "Content-Type": "text/xml" },
  });
}

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
