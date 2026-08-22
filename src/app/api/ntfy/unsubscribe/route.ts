import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function renderUnsubscribeHtml(email: string, success: boolean, message: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>7th Heaven — Unsubscribe Status</title>
        <style>
          body { background-color: #0b0714; color: #ffffff; font-family: 'Barlow', Arial, sans-serif; margin: 0; padding: 40px 16px; text-align: center; }
          .card { max-width: 480px; margin: 0 auto; background: #130b24; border: 1px solid #7e22ce; border-radius: 16px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
          .badge { display: inline-block; padding: 6px 12px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; background: rgba(239,68,68,0.2); color: #f87171; margin-bottom: 16px; }
          h1 { font-size: 24px; font-weight: 900; margin: 0 0 12px 0; text-transform: uppercase; }
          p { color: #d8b4fe; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
          .btn { display: inline-block; padding: 12px 24px; background: #a855f7; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-radius: 10px; transition: background 0.2s; }
          .btn:hover { background: #9333ea; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">${success ? "UNSUBSCRIBED" : "NOTICE"}</div>
          <h1>${success ? "You Have Been Unsubscribed" : "Unsubscribe Status"}</h1>
          <p>${message}</p>
          <p style="font-size:12px;color:#94a3b8;font-family:monospace;">Target Email: ${email || "Unknown"}</p>
          <a href="${siteUrl}/live" class="btn">Return to 7th Heaven Live</a>
        </div>
      </body>
    </html>
  `;
}

async function performUnsubscribe(cleanEmail: string) {
  // 1. Update database
  await supabase
    .from("newsletter_subscribers")
    .upsert(
      { email: cleanEmail, subscribed: false, unsubscribed_at: new Date().toISOString() },
      { onConflict: "email" }
    );

  // 2. Dispatch Unsubscribe Confirmation Email
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resubscribeUrl = `${siteUrl}/live`;
  const emailSubject = `7th Heaven Live Stream Alerts — Unsubscribe Confirmed`;
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
                    <div style="font-size:36px;margin-bottom:8px;">🔔 ❌</div>
                    <h1 style="color:#ffffff;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:1px;margin:0;">Unsubscribed Confirmed</h1>
                    <p style="color:#f87171;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-top:6px;">7th Heaven Live Stream Push Alerts</p>
                  </td>
                </tr>
                <tr>
                  <td style="color:#e9d5ff;font-size:15px;line-height:1.6;padding-bottom:24px;">
                    Hello,<br/><br/>
                    This email confirms that <strong style="color:#ffffff;">${cleanEmail}</strong> has been successfully unsubscribed from 7th Heaven Live Stream Push Alerts.
                  </td>
                </tr>
                <tr>
                  <td style="background:#090512;border:1px solid #3b0764;border-radius:12px;padding:20px;margin-bottom:24px;">
                    <p style="color:#d8b4fe;font-size:13px;line-height:1.6;margin:0;">
                      You will no longer receive live stream push notifications or broadcast emails. If you ever change your mind, you can re-subscribe anytime with 1 click from the 7th Heaven website.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:24px;border-top:1px solid #2e1065;">
                    <a href="${resubscribeUrl}" style="display:inline-block;padding:12px 24px;background:#a855f7;color:#ffffff;text-decoration:none;font-weight:800;font-size:12px;text-transform:uppercase;letter-spacing:1px;border-radius:8px;">
                      Re-Subscribe to Live Alerts
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
}

function renderConfirmUnsubscribeHtml(email: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>7th Heaven — Unsubscribe Confirmation</title>
        <style>
          body { background-color: #0b0714; color: #ffffff; font-family: 'Barlow', Arial, sans-serif; margin: 0; padding: 40px 16px; text-align: center; }
          .card { max-width: 480px; margin: 0 auto; background: #130b24; border: 1px solid #7e22ce; border-radius: 16px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
          .badge { display: inline-block; padding: 6px 12px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; background: rgba(239,68,68,0.2); color: #f87171; margin-bottom: 16px; }
          h1 { font-size: 24px; font-weight: 900; margin: 0 0 12px 0; text-transform: uppercase; }
          p { color: #d8b4fe; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
          .btn { display: inline-block; padding: 14px 28px; background: #ef4444; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-radius: 10px; border: none; cursor: pointer; }
          .btn:hover { background: #dc2626; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">CONFIRM UNSUBSCRIBE</div>
          <h1>Unsubscribe from 7th Heaven Live Alerts?</h1>
          <p>Are you sure you want to stop receiving live stream push notifications & emails for <strong>${email}</strong>?</p>
          <form method="POST" action="${siteUrl}/api/ntfy/unsubscribe">
            <input type="hidden" name="email" value="${email}" />
            <button type="submit" class="btn">Yes, Unsubscribe Me 🛑</button>
          </form>
        </div>
      </body>
    </html>
  `;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const isUnsubscribed = searchParams.get("unsubscribed") === "true";

  if (!email) {
    return new Response(renderUnsubscribeHtml("", false, "No email address was provided in the unsubscribe request."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  const cleanEmail = decodeURIComponent(email).toLowerCase().trim();

  if (isUnsubscribed) {
    return new Response(
      renderUnsubscribeHtml(
        cleanEmail,
        true,
        `Your email address (${cleanEmail}) has been successfully removed from 7th Heaven Live Stream Push Alerts.`
      ),
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  return new Response(renderConfirmUnsubscribeHtml(cleanEmail), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

export async function POST(request: Request) {
  try {
    let email = "";
    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      email = String(formData.get("email") || "");
    } else {
      const body = await request.json().catch(() => ({}));
      email = body.email || "";
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    await performUnsubscribe(cleanEmail);

    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      return NextResponse.redirect(`${siteUrl}/api/ntfy/unsubscribe?email=${encodeURIComponent(cleanEmail)}&unsubscribed=true`);
    }

    return NextResponse.json({ ok: true, message: "Successfully unsubscribed." });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error." }, { status: 500 });
  }
}
