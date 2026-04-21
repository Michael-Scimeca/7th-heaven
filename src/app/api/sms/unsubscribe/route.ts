import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

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

  // TODO: Remove from your database
  console.log("[SMS Unsubscribe]", { phone: e164, timestamp: new Date().toISOString() });

  // --- Send unsubscribe confirmation ---
  if (accountSid && authToken && twilioPhone) {
   const client = twilio(accountSid, authToken);
   await client.messages.create({
    body: "7th Heaven: You've been unsubscribed from Show Alerts. You will no longer receive texts. Reply START to re-subscribe.",
    from: twilioPhone,
    to: e164,
   });
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
