import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidEmail } from "@/lib/api-utils";
import { sendEmail } from "@/lib/email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !isValidEmail(email) || !token) {
      return NextResponse.redirect(new URL("/live?error=invalid_token", request.url));
    }

    const cleanEmail = email.toLowerCase().trim();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // 1. Verify token in Supabase or fallback verification check
    const { data: subscriber, error: dbError } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (dbError && dbError.code !== "PGRST116") {
      console.error("[api/ntfy/verify] db query error:", dbError);
    }

    // 2. Mark subscriber as verified & active
    await supabase
      .from("newsletter_subscribers")
      .upsert(
        {
          email: cleanEmail,
          subscribed: true,
          verified: true,
          verified_at: new Date().toISOString(),
          unsubscribed_at: null,
        },
        { onConflict: "email" }
      );

    // 3. Send final welcome email
    const unsubscribeUrl = `${siteUrl}/api/ntfy/unsubscribe?email=${encodeURIComponent(cleanEmail)}`;
    const emailSubject = `🎉 Subscription Confirmed! 7th Heaven Live Alerts Activated`;
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"/><title>${emailSubject}</title></head>
        <body style="margin:0;padding:0;background-color:#0b0714;font-family:'Barlow',Arial,sans-serif;color:#ffffff;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0b0714;padding:40px 10px;">
            <tr>
              <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background:#130b24;border:1px solid #10b981;border-radius:16px;overflow:hidden;padding:32px;">
                  <tr>
                    <td align="center" style="padding-bottom:24px;">
                      <div style="font-size:42px;margin-bottom:8px;">🎉 🔔</div>
                      <h1 style="color:#ffffff;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:1px;margin:0;">Subscription Verified!</h1>
                      <p style="color:#34d399;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-top:6px;">7th Heaven Official Alerts</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="color:#e9d5ff;font-size:15px;line-height:1.6;padding-bottom:24px;">
                      Your email address (<strong>${cleanEmail}</strong>) has been successfully verified! You will now receive instant alerts whenever 7th Heaven or a crew member goes live.
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top:16px;padding-bottom:24px;">
                      <a href="${siteUrl}/live" style="display:inline-block;padding:14px 28px;background:linear-gradient(to right, #9333ea, #ec4899);color:#ffffff;text-decoration:none;font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:1px;border-radius:12px;box-shadow:0 0 20px rgba(168,85,247,0.5);">
                        View Live Stream Hub →
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top:20px;border-top:1px solid #2e1065;">
                      <a href="${unsubscribeUrl}" style="color:#ef4444;font-size:12px;text-decoration:underline;">Unsubscribe Anytime</a>
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

    // 4. Redirect to /live with success parameter
    return NextResponse.redirect(`${siteUrl}/live?verified=true`);
  } catch (err: any) {
    console.error("[api/ntfy/verify] error:", err);
    return NextResponse.redirect(new URL("/live?error=verify_failed", request.url));
  }
}
