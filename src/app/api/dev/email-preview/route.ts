import { NextRequest, NextResponse } from "next/server";
import { EMAIL_TEMPLATES } from "@/lib/email-templates";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || "";
  if (id === "auth_pin") {
    const html = `
      <!DOCTYPE html><html><head><meta charset="utf-8"></head>
      <body style="margin:0;padding:24px;background:#050508;">
        <div style="font-family: sans-serif; background-color: #0c0c18; color: #ffffff; padding: 40px 20px; text-align: center; border: 1px solid rgba(255,255,255,0.1); max-width: 500px; margin: 0 auto; border-radius: 12px;">
          <h2 style="color: #a855f7; margin-bottom: 20px; font-weight: 800; text-transform: uppercase; tracking: 0.05em;">7th Heaven Verification</h2>
          <p style="font-size: 15px; color: rgba(255,255,255,0.7); line-height: 1.6; margin-bottom: 30px;">
            Use the 6-digit verification code below to confirm your email address and complete your signup.
          </p>
          <div style="font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #ffffff; background: rgba(255,255,255,0.03); padding: 18px 30px; margin: 20px auto; border-radius: 8px; width: fit-content; border: 1px solid rgba(255,255,255,0.1); font-family: monospace;">
            582901
          </div>
          <p style="font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 40px; line-height: 1.5;">
            This code is valid for 10 minutes. If you did not request this code, you can safely ignore this email.
          </p>
        </div>
      </body></html>
    `;
    return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
  }
  const template = EMAIL_TEMPLATES.find(t => t.id === id);
  if (!template) {
    return new NextResponse(`Template ${id} not found`, { status: 404 });
  }
  return new NextResponse(template.render(), {
    headers: { "Content-Type": "text/html" }
  });
}
