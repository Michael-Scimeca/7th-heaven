import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { geocodeZip } from "@/lib/geo";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// These come from your Twilio dashboard:
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

export async function POST(req: NextRequest) {
 try {
  const body = await req.json();
  const { name, zipCode, zip, phone, radius } = body;
  const zipVal = zipCode || zip || '';

  // --- Validate ---
  if (!phone || !zipVal) {
   return NextResponse.json({ error: "Phone and zip code are required." }, { status: 400 });
  }

  // Normalize phone to E.164 (US numbers)
  const cleaned = phone.replace(/\D/g, "");
  const e164 = cleaned.length === 10 ? `+1${cleaned}` : cleaned.length === 11 && cleaned.startsWith("1") ? `+${cleaned}` : null;
  if (!e164) {
   return NextResponse.json({ error: "Enter a valid US phone number." }, { status: 400 });
  }

  // --- Geocode the zip code for proximity matching ---
  const geo = await geocodeZip(zipVal);

  // --- Save to Supabase ---
  const { error: dbError } = await supabase
    .from('sms_subscribers')
    .upsert({
      phone: e164,
      name: name || '',
      zip_code: zipVal,
      opted_in: true,
      opted_out_at: null,
      latitude: geo?.lat ?? null,
      longitude: geo?.lng ?? null,
      notification_radius: radius || 50,
    }, { onConflict: 'phone' });

  if (dbError) {
    console.error('[SMS Subscribe] DB error:', dbError);
    // Don't fail — still try to send the text
  }

  // --- Send confirmation text via Twilio (if credentials exist) ---
  if (accountSid && authToken && twilioPhone) {
    try {
      const twilio = (await import('twilio')).default;
      const client = twilio(accountSid, authToken);
      await client.messages.create({
        body: `🎸 7th Heaven Show Alerts: You're subscribed, ${name || "friend"}! We'll text you when we play within ${radius || 50} miles of ${zipVal}. Reply STOP to opt out. Msg freq varies. Msg & data rates may apply.`,
        from: twilioPhone,
        to: e164,
      });
    } catch (twilioErr) {
      console.error('[SMS] Twilio send failed:', twilioErr);
    }
  } else {
    console.log("[SMS Subscribe] DEV MODE — no Twilio creds", { name, zipVal, phone: e164, geo });
  }

  return NextResponse.json({
   success: true,
   geocoded: !!geo,
   message: accountSid ? "You're subscribed! Check your phone for a confirmation text." : "Subscribed! (SMS will activate when Twilio is configured)",
  });
 } catch (err: unknown) {
  console.error("[SMS Subscribe Error]", err);
  const message = err instanceof Error ? err.message : "Something went wrong.";
  return NextResponse.json({ error: message }, { status: 500 });
 }
}
