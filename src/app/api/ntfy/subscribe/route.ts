import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidEmail, sanitizeText } from "@/lib/api-utils";
import { sendEmail } from "@/lib/resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, group = "fans", source = "live-stream" } = body;

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email address required." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = sanitizeText(name || "7th Heaven Fan", 100);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const unsubscribeUrl = `${siteUrl}/api/ntfy/unsubscribe?email=${encodeURIComponent(cleanEmail)}&group=${group}`;

    // 1. Save subscriber in database (newsletter_subscribers or push_subscribers)
    await supabase
      .from("newsletter_subscribers")
      .upsert(
        {
          email: cleanEmail,
          name: cleanName,
          source,
          subscribed: true,
          unsubscribed_at: null,
        },
        { onConflict: "email" }
      );

    // 2. Dispatch Welcome Subscription Email
    const emailSubject = `🔔 You are subscribed to 7th Heaven Live Stream Push Alerts!`;
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <title>${emailSubject}</title>
        </head>
        <body style="margin:0;padding:0;background-color:#0b0714;font-family:'Barlow',Arial,sans-serif;color:#ffffff;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0b0714;padding:40px 10px;">
            <tr>
              <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background:#130b24;border:1px solid #7e22ce;border-radius:16px;overflow:hidden;padding:32px;">
                  <tr>
                    <td align="center" style="padding-bottom:24px;">
                      <div style="font-size:36px;margin-bottom:8px;">🎸 🔔</div>
                      <h1 style="color:#ffffff;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:1px;margin:0;">7th Heaven Live Alerts</h1>
                      <p style="color:#c084fc;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-top:6px;">Subscription Confirmed</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="color:#e9d5ff;font-size:15px;line-height:1.6;padding-bottom:24px;">
                      Hi <strong>${cleanName}</strong>,<br/><br/>
                      Thank you for signing up! You are now subscribed to <strong>7th Heaven Live Stream Push Alerts</strong>.
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#090512;border:1px solid #3b0764;border-radius:12px;padding:20px;margin-bottom:24px;">
                      <h3 style="color:#f472b6;font-size:14px;font-weight:800;text-transform:uppercase;margin:0 0 10px 0;">How Live Stream Alerts Work:</h3>
                      <ul style="color:#d8b4fe;font-size:13px;line-height:1.6;margin:0;padding-left:20px;">
                        <li>Whenever 7th Heaven or a crew member broadcasts live, you will receive an instant push notification on your browser/phone.</li>
                        <li>Notifications include direct links to join the live concert video feed and fan chat.</li>
                        <li>Your subscription is 100% free with zero spam.</li>
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top:24px;border-top:1px solid #2e1065;">
                      <p style="color:#a855f7;font-size:12px;margin-bottom:12px;">Need to unsubscribe or change settings?</p>
                      <a href="${unsubscribeUrl}" style="display:inline-block;padding:10px 20px;background:#ef4444;color:#ffffff;text-decoration:none;font-weight:800;font-size:12px;text-transform:uppercase;letter-spacing:1px;border-radius:8px;">
                        Unsubscribe from Push Alerts
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    await sendEmail({
      to: cleanEmail,
      subject: emailSubject,
      html: emailHtml,
    });

    return NextResponse.json({
      ok: true,
      message: "Subscription successful. Confirmation email sent.",
      email: cleanEmail,
    });
  } catch (err: any) {
    console.error("[api/ntfy/subscribe] error:", err);
    return NextResponse.json({ error: err?.message || "Failed to process subscription." }, { status: 500 });
  }
}
