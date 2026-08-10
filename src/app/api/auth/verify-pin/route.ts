import { NextResponse } from "next/server";
import { verifyPin } from "@/lib/pins";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const {
      email,
      pin,
      name,
      password,
      username,
      zip,
      wantNotifications,
      wantNewsletter,
      inviteBypass
    } = await req.json();

    if (!email || (!pin && !inviteBypass)) {
      return NextResponse.json({ error: "Email and verification code are required." }, { status: 400 });
    }

    // Skip PIN verification for invite flow (clicking the email link proves ownership)
    if (!inviteBypass) {
      const isVerified = verifyPin(email, pin);
      if (!isVerified) {
        return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 400 });
      }
    }

    // Initialize Supabase Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin: any = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log(`Creating pre-confirmed user ${email} in Supabase Auth...`);

    // Create the user via Admin API (auto-confirms email)
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        username: username || '',
        role: 'fan',
        phone: ''
      }
    });

    if (createError) {
      console.error("Supabase Admin createUser error:", createError.message);
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    const userId = userData.user.id;
    console.log(`User created successfully with ID: ${userId}`);

    // Geocode zip if provided
    let lat: number | null = null;
    let lng: number | null = null;
    if (zip) {
      try {
        const geoRes = await fetch(`https://api.zippopotam.us/us/${zip}`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          const place = geoData.places?.[0];
          if (place) {
            lat = parseFloat(place.latitude);
            lng = parseFloat(place.longitude);
          }
        }
      } catch (err: any) {
        console.warn("Geocoding failed during verification:", err.message);
      }
    }

    // Update profile table
    console.log("Updating public.profiles in database...");
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        role: 'fan',
        zip: zip || null,
        notification_radius: 50,
        notifications_enabled: !!wantNotifications,
        latitude: lat,
        longitude: lng,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Failed to update profile record:", profileError.message);
    }

    // Subscribe to newsletter if requested
    if (wantNewsletter) {
      console.log(`Adding ${email} to newsletter subscriber list...`);
      const { error: newsletterError } = await supabaseAdmin
        .from('newsletter_subscribers')
        .upsert({
          email: email.toLowerCase().trim(),
          name,
          source: 'signup',
          user_id: userId,
          subscribed: true,
          unsubscribed_at: null,
        }, { onConflict: 'email' });

      if (newsletterError) {
        console.error("Failed to add newsletter subscription:", newsletterError.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Verification processing failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
