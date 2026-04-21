import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

// These come from your Twilio dashboard:
// https://console.twilio.com/
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER; // e.g. "+1234567890"

export async function POST(req: NextRequest) {
 try {
  const { name, zip, phone } = await req.json();

  // --- Validate ---
  if (!phone || !zip) {
   return NextResponse.json({ error: "Phone and zip code are required." }, { status: 400 });
  }

  // Normalize phone to E.164 (US numbers)
  const cleaned = phone.replace(/\D/g, "");
  const e164 = cleaned.length === 10 ? `+1${cleaned}` : cleaned.length === 11 && cleaned.startsWith("1") ? `+${cleaned}` : null;
  if (!e164) {
   return NextResponse.json({ error: "Enter a valid US phone number." }, { status: 400 });
  }

  // --- Check Twilio credentials ---
  if (!accountSid || !authToken || !twilioPhone) {
   // Dev mode: log and return success without sending
   console.log("[SMS Subscribe] DEV MODE — no Twilio creds", { name, zip, phone: e164 });
   return NextResponse.json({
    success: true,
    dev: true,
    message: "Subscribed (dev mode — no SMS sent). Add TWILIO env vars to enable.",
   });
  }

  // --- Send confirmation text via Twilio ---
  const client = twilio(accountSid, authToken);

  await client.messages.create({
   body: `7th Heaven Show Alerts: You're subscribed, ${name || "friend"}! We'll text you when we play near ${zip}. Reply STOP to opt out. Msg & data rates may apply.`,
   from: twilioPhone,
   to: e164,
  });

  // TODO: Save to your database:
  // - phone (e164), name, zip
  // - consent timestamp (new Date().toISOString())
  // - IP address (req.headers.get("x-forwarded-for"))
  console.log("[SMS Subscribe]", { name, zip, phone: e164, timestamp: new Date().toISOString() });

  return NextResponse.json({
   success: true,
   message: "You're subscribed! Check your phone for a confirmation text.",
  });
 } catch (err: unknown) {
  console.error("[SMS Subscribe Error]", err);
  const message = err instanceof Error ? err.message : "Something went wrong.";
  return NextResponse.json({ error: message }, { status: 500 });
 }
}
