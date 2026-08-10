import { NextResponse } from "next/server";
import { verifyPin } from "@/lib/pins";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { email, pin, password } = await req.json();

    if (!email || !pin || !password) {
      return NextResponse.json({ error: "Email, verification PIN, and new password are required." }, { status: 400 });
    }

    // Verify PIN ownership
    const isVerified = verifyPin(email, pin);
    if (!isVerified) {
      return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 400 });
    }

    // Initialize Supabase Admin Client using service key to bypass RLS and perform admin auth tasks
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin: any = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log(`Resetting password for user ${email}...`);

    // Retrieve user list to locate by email
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error("Failed to list users from Supabase:", listError.message);
      if (process.env.NODE_ENV !== 'production') {
        try {
          const fakeLogins = (await import("@/data/fake-logins.json")).default;
          const isFake = fakeLogins.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
          if (isFake) {
            console.log(`[DEV BYPASS] Simulating password update for fake user ${email} on list failure`);
            return NextResponse.json({ success: true, devBypass: true });
          }
        } catch {}
      }
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const user = listData.users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
      if (process.env.NODE_ENV !== 'production') {
        try {
          const fakeLogins = (await import("@/data/fake-logins.json")).default;
          const isFake = fakeLogins.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
          if (isFake) {
            console.log(`[DEV BYPASS] Simulating password update for fake user ${email}`);
            return NextResponse.json({ success: true, devBypass: true });
          }
        } catch {}
      }
      return NextResponse.json({ error: "No registered user found with this email." }, { status: 404 });
    }

    // Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: password
    });

    if (updateError) {
      console.error("Failed to update user password:", updateError.message);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    console.log(`Password updated successfully for user ID: ${user.id}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
  }
}
