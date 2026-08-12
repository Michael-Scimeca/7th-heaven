import { NextResponse } from "next/server";
import { savePin } from "@/lib/pins";
import { sendEmail } from "@/lib/email";
import { isValidEmail } from "@/lib/api-utils";
import { getFakeLogins } from "@/lib/get-fake-logins";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email address is required." }, { status: 400 });
    }

    // ── Dev bypass: use the fixed PIN from fake-logins.json ──
    if (process.env.NODE_ENV !== 'production') {
      try {
        const fakeLogins = getFakeLogins();
        const devUser = fakeLogins.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (devUser?.pin) {
          savePin(email, devUser.pin, 24 * 60 * 60 * 1000); // 24h expiry for dev
          console.log(`\n==============================================`);
          console.log(`🛠️ DEV PIN for ${email}: ${devUser.pin}`);
          console.log(`==============================================\n`);
          return NextResponse.json({ success: true, devBypass: true });
        }
      } catch { /* ignore — fall through to normal flow */ }
    }

    // Generate a cryptographically random 6-digit PIN using Web Crypto API.
    // Math.random() is NOT cryptographically secure for authentication tokens.
    const pinArray = new Uint32Array(1);
    globalThis.crypto.getRandomValues(pinArray);
    const pin = String(100000 + (pinArray[0] % 900000));

    // Save PIN locally with 10-minute expiration
    savePin(email, pin, 10 * 60 * 1000);

    // Prepare email HTML body
    const emailHtml = `
      <div style="font-family: sans-serif; background-color: #0c0c18; color: #ffffff; padding: 40px 20px; text-align: center; border: 1px solid rgba(255,255,255,0.1); max-width: 500px; margin: 0 auto; border-radius: 12px;">
        <h2 style="color: #a855f7; margin-bottom: 20px; font-weight: 800; text-transform: uppercase; tracking: 0.05em;">7th Heaven Verification</h2>
        <p style="font-size: 15px; color: rgba(255,255,255,0.7); line-height: 1.6; margin-bottom: 30px;">
          Use the 6-digit verification code below to confirm your email address and complete your signup.
        </p>
        <div style="font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #ffffff; background: rgba(255,255,255,0.03); padding: 18px 30px; margin: 20px auto; border-radius: 8px; width: fit-content; border: 1px solid rgba(255,255,255,0.1); font-family: monospace;">
          ${pin}
        </div>
        <p style="font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 40px; line-height: 1.5;">
          This code is valid for 10 minutes. If you did not request this code, you can safely ignore this email.
        </p>
      </div>
    `;

    // Attempt to send email via Resend
    console.log(`Sending verification PIN ${pin} to ${email}...`);
    const emailResult = await sendEmail({
      to: email,
      subject: "🔑 Your 7th Heaven Verification Code",
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.warn("Resend email failed. This is common if the recipient is not verified in a Resend sandbox account.");
      console.log("\n==============================================");
      console.log(`🔑 DEV FALLBACK PIN FOR ${email}: ${pin}`);
      console.log("==============================================\n");
      return NextResponse.json({ success: true, sandboxFallback: true });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to generate and send PIN:", error);
    return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 });
  }
}
