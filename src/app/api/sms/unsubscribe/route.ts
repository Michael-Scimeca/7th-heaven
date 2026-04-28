import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
 try {
  const { phone } = await req.json();

  if (!phone) {
   return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
  }

  const cleaned = phone.replace(/\D/g, "");
  const e164 = cleaned.length === 10 ? `+1${cleaned}` : cleaned.length === 11 && cleaned.startsWith("1") ? `+${cleaned}` : null;
  if (!e164) {
   return NextResponse.json({ error: "Enter a valid US phone number." }, { status: 400 });
  }

  // Opt out in Supabase
  await supabase
    .from('sms_subscribers')
    .update({ opted_in: false, opted_out_at: new Date().toISOString() })
    .eq('phone', e164);

  // Send unsubscribe confirmation via Twilio (if configured)
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid?.startsWith('AC') && authToken && twilioPhone) {
    try {
      const twilio = (await import('twilio')).default;
      const client = twilio(accountSid, authToken);
      await client.messages.create({
        body: "7th Heaven: You've been unsubscribed from Show Alerts. Reply START to re-subscribe.",
        from: twilioPhone,
        to: e164,
      });
    } catch (err) {
      console.error('[SMS Unsubscribe] Twilio error:', err);
    }
  }

  return NextResponse.json({
   success: true,
   message: "You've been unsubscribed. You will no longer receive show alerts.",
  });
 } catch (err: unknown) {
  console.error("[SMS Unsubscribe Error]", err);
  const message = err instanceof Error ? err.message : "Something went wrong.";
  return NextResponse.json({ error: message }, { status: 500 });
 }
}
