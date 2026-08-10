import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

/**
 * POST /api/payment-test
 * Creates a Stripe Checkout Session (test mode) for the /payment test page.
 * Card data never touches this server — Stripe hosts the payment form.
 */
export async function POST(req: NextRequest) {
  try {
    const { amount, description } = await req.json();

    const cents = Math.round(parseFloat(amount) * 100);
    if (!cents || cents < 50) {
      return NextResponse.json(
        { error: "Enter a valid amount of at least $0.50." },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: description || "7th Heaven Test Payment" },
            unit_amount: cents,
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/payment-test?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/payment-test?status=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[payment-test] Stripe error:", err);
    const message =
      err?.message === "STRIPE_SECRET_KEY is not set"
        ? "STRIPE_SECRET_KEY is not set in .env.local. Add your Stripe test-mode secret key to use this page."
        : err?.message || "Failed to start checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/payment-test?session_id=...
 * Looks up a completed Checkout Session so the page can confirm payment status.
 */
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      status: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
    });
  } catch (err: any) {
    console.error("[payment-test] Stripe lookup error:", err);
    return NextResponse.json({ error: err?.message || "Lookup failed" }, { status: 500 });
  }
}
