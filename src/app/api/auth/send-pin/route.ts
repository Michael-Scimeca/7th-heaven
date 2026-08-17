import { NextResponse } from "next/server";
import { savePin } from "@/lib/pins";
import { sendEmail } from "@/lib/email";
import { isValidEmail } from "@/lib/api-utils";
import { getFakeLogins } from "@/lib/get-fake-logins";

import { plannerPinVerification } from "@/lib/email-templates";

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

    // Prepare email HTML body using official 7th Heaven brand wrapper template
    const emailHtml = plannerPinVerification(pin, email);

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
