import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST: Blast all opted-in subscribers that a live stream has started
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const hostName = body.hostName || "7th Heaven";

    // Fetch from Supabase instead of file
    const { data: subscribers } = await supabase
      .from('sms_subscribers')
      .select('phone, name')
      .eq('opted_in', true);

    const targets = subscribers || [];

    if (targets.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: "No opted-in subscribers to notify.",
      });
    }

    const message = `7th Heaven: 🎸 ${hostName} just went LIVE! Tune in now at 7thheavenband.com/live\n\nReply STOP to unsubscribe.`;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid?.startsWith('AC') || !authToken || !twilioPhone) {
      console.log("\n📲 [LIVE ALERT] DEV MODE — would notify:", targets.length, "subscribers");
      return NextResponse.json({
        success: true,
        sent: targets.length,
        dev: true,
        message: `DEV: Would text ${targets.length} subscribers. Add Twilio env vars to send real SMS.`,
      });
    }

    // Send real SMS via Twilio
    const twilio = (await import('twilio')).default;
    const client = twilio(accountSid, authToken);
    const results: { phone: string; status: string; error?: string }[] = [];

    for (const sub of targets) {
      try {
        await client.messages.create({
          body: message,
          from: twilioPhone,
          to: sub.phone,
        });
        results.push({ phone: sub.phone, status: "sent" });
      } catch (err: any) {
        results.push({ phone: sub.phone, status: "failed", error: err.message });
      }
    }

    const sentCount = results.filter((r) => r.status === "sent").length;
    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: results.length - sentCount,
      message: `Notified ${sentCount}/${results.length} subscribers.`,
    });
  } catch (error) {
    console.error("Live alert error:", error);
    return NextResponse.json({ error: "Failed to send live alerts" }, { status: 500 });
  }
}
