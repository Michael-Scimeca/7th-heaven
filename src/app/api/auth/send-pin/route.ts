import { NextResponse } from "next/server";
import { savePin } from "@/lib/pins";
import { sendEmail } from "@/lib/email";
import { isValidEmail } from "@/lib/api-utils";
import { getFakeLogins } from "@/lib/get-fake-logins";
import { createClient } from "@supabase/supabase-js";

import { plannerPinVerification } from "@/lib/email-templates";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let email = (body.email || body.identifier || "").trim();

    if (!email) {
      return NextResponse.json(
        { error: "Email or username is required." },
        { status: 400 },
      );
    }

    // If identifier doesn't contain '@', resolve username to email
    if (!email.includes("@")) {
      const cleanUser = email.replace(/^@/, "").toLowerCase();
      const fakeLogins = getFakeLogins();
      const devMatch = fakeLogins.find(
        (u: any) =>
          u.username?.toLowerCase() === cleanUser ||
          u.name?.toLowerCase() === cleanUser,
      );
      if (devMatch?.email) {
        email = devMatch.email;
      } else {
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
          const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
          if (supabaseUrl && supabaseServiceKey) {
            const supabaseAdmin: any = createClient(
              supabaseUrl,
              supabaseServiceKey,
              { auth: { autoRefreshToken: false, persistSession: false } },
            );
            const { data: profile } = await supabaseAdmin
              .from("profiles")
              .select("id, email, username")
              .ilike("username", cleanUser)
              .single();

            if (profile?.email) {
              email = profile.email;
            } else if (profile?.id) {
              const { data: userData } =
                await supabaseAdmin.auth.admin.getUserById(profile.id);
              if (userData?.user?.email) {
                email = userData.user.email;
              }
            }
          }
        } catch (e) {
          console.warn("Username resolution error:", e);
        }
      }
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "No account found matching that username or email." },
        { status: 400 },
      );
    }

    // ── Dev bypass: use the fixed PIN from fake-logins.json ──
    if (process.env.NODE_ENV !== "production") {
      try {
        const fakeLogins = getFakeLogins();
        const devUser = fakeLogins.find(
          (u: any) => u.email.toLowerCase() === email.toLowerCase(),
        );
        if (devUser?.pin) {
          savePin(email, devUser.pin, 24 * 60 * 60 * 1000); // 24h expiry for dev
          console.log(`\n==============================================`);
          console.log(`🛠️ DEV PIN for ${email}: ${devUser.pin}`);
          console.log(`==============================================\n`);
          return NextResponse.json({ success: true, devBypass: true, email });
        }
      } catch {
        /* ignore — fall through to normal flow */
      }
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
      console.warn(
        "Resend email failed. This is common if the recipient is not verified in a Resend sandbox account.",
      );
      console.log("\n==============================================");
      console.log(`🔑 DEV FALLBACK PIN FOR ${email}: ${pin}`);
      console.log("==============================================\n");
      return NextResponse.json({ success: true, sandboxFallback: true, email });
    }

    return NextResponse.json({ success: true, email });
  } catch (error: any) {
    console.error("Failed to generate and send PIN:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 },
    );
  }
}
