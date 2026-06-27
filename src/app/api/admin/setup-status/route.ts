import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = {
      supabase: {
        connected: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set",
      },
      resend: {
        connected: !!process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes("dummy"),
        fromEmail: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        isSandbox: !process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL === "onboarding@resend.dev",
      },
      twilio: {
        connected: !!process.env.TWILIO_ACCOUNT_SID && !!process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || "Not set",
        isTest: process.env.TWILIO_PHONE_NUMBER === "+15005550006",
      },
      googleAnalytics: {
        connected: !!process.env.NEXT_PUBLIC_GA_ID,
        gaId: process.env.NEXT_PUBLIC_GA_ID || "Not set",
      },
      stripe: {
        connected: !!process.env.STRIPE_SECRET_KEY || !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        secretKeySet: !!process.env.STRIPE_SECRET_KEY,
        publishableKeySet: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      },
      mux: {
        connected: !!process.env.MUX_TOKEN_ID && !!process.env.MUX_TOKEN_SECRET,
      },
      livekit: {
        connected: !!process.env.LIVEKIT_API_KEY && !!process.env.LIVEKIT_API_SECRET,
        url: process.env.NEXT_PUBLIC_LIVEKIT_URL || "Not set",
      },
      shopify: {
        connected: !!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN && !!process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
        domain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "Not set",
      },
      sanity: {
        connected: !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && !!process.env.SANITY_API_TOKEN,
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "Not set",
      }
    };

    return NextResponse.json(status);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
