import { NextResponse } from "next/server";
import { verifyPin } from "@/lib/pins";

/**
 * Admin 2FA PIN verification endpoint.
 * After successful email+password login, the admin must verify a 6-digit PIN
 * sent to their email before accessing the dashboard.
 *
 * This is a lightweight PIN-only check — it does NOT create users
 * (unlike /api/auth/verify-pin which handles signup).
 */
export async function POST(req: Request) {
  try {
    const { email, pin } = await req.json();

    if (!email || !pin) {
      return NextResponse.json(
        { error: "Email and verification code are required." },
        { status: 400 }
      );
    }

    // Dev bypass: check fake-logins.json for fixed PINs
    if (process.env.NODE_ENV !== "production") {
      try {
        const fakeLogins = (await import("@/data/fake-logins.json")).default;
        const devUser = fakeLogins.find(
          (u: any) =>
            u.email.toLowerCase() === email.toLowerCase() &&
            u.pin === pin
        );
        if (devUser) {
          console.log(`\n==============================================`);
          console.log(`✅ DEV 2FA bypass for ${email} (PIN: ${pin})`);
          console.log(`==============================================\n`);
          return NextResponse.json({ success: true });
        }
      } catch {
        /* ignore — fall through to normal flow */
      }
    }

    // Verify the PIN via the shared pin store
    const isValid = verifyPin(email, pin);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin 2FA verification failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
