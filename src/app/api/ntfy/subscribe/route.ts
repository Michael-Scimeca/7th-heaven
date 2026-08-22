import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidEmail, sanitizeText } from "@/lib/api-utils";
import { sendEmail } from "@/lib/email";

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
    const token = Buffer.from(`${cleanEmail}:${Date.now()}`).toString("base64url");
    const verifyUrl = `${siteUrl}/api/ntfy/verify?token=${token}&email=${encodeURIComponent(cleanEmail)}`;
    const unsubscribeUrl = `${siteUrl}/api/ntfy/unsubscribe?email=${encodeURIComponent(cleanEmail)}&group=${group}`;

    // 1. Save subscriber in database with pending verification status
    await supabase
      .from("newsletter_subscribers")
      .upsert(
        {
          email: cleanEmail,
          name: cleanName,
          source,
          subscribed: false, // Double Opt-In: pending until link clicked
          verified: false,
          verification_token: token,
          unsubscribed_at: null,
        },
        { onConflict: "email" }
      );

    // 2. Dispatch Double Opt-In Verification Email
    const emailSubject = ` Action Required: Confirm your 7th Heaven Live Stream Alerts Subscription 🔔`;
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
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background:#130b24;border:1px solid #a855f7;border-radius:16px;overflow:hidden;padding:32px;box-shadow:0 0 30px rgba(168,85,247,0.3);">
                  <tr>
                    <td align="center" style="padding-bottom:24px;">
                      <div style="font-size:42px;margin-bottom:8px;">🎸 🔔</div>
                      <h1 style="color:#ffffff;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:1px;margin:0;">Confirm Your Subscription</h1>
                      <p style="color:#c084fc;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-top:6px;">Double Opt-In Security Verification</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="color:#e9d5ff;font-size:15px;line-height:1.6;padding-bottom:24px;">
                      Hi <strong>${cleanName}</strong>,<br/><br/>
                      Someone (hopefully you!) entered this email address to subscribe to <strong>7th Heaven Live Stream Push & Email Alerts</strong>.
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom:28px;">
                      <a href="${verifyUrl}" style="display:inline-block;padding:16px 36px;background:linear-gradient(to right, #9333ea, #ec4899);color:#ffffff;text-decoration:none;font-weight:900;font-size:15px;text-transform:uppercase;letter-spacing:1.5px;border-radius:12px;box-shadow:0 0 25px rgba(168,85,247,0.6);">
                        CONFIRM MY SUBSCRIPTION 🔔
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#090512;border:1px solid #3b0764;border-radius:12px;padding:20px;margin-bottom:24px;">
                      <h3 style="color:#f472b6;font-size:13px;font-weight:800;text-transform:uppercase;margin:0 0 8px 0;">🛡️ Anti-Spam Security Note:</h3>
                      <p style="color:#d8b4fe;font-size:12px;line-height:1.5;margin:0;">
                        If you did not request this subscription, you can safely ignore this email. You will not receive any live alerts unless you click the button above.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top:20px;border-top:1px solid #2e1065;">
                      <a href="${unsubscribeUrl}" style="color:#94a3b8;font-size:11px;text-decoration:underline;">Cancel Request</a>
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
      requiresVerification: true,
      message: "Verification email sent! Please check your inbox to confirm subscription.",
      email: cleanEmail,
    });
  } catch (err: any) {
    console.error("[api/ntfy/subscribe] error:", err);
    return NextResponse.json({ error: err?.message || "Failed to process subscription." }, { status: 500 });
  }
}
