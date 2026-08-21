import { NextResponse } from "next/server";
import { getStripe, formatCents } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/api-utils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

/**
 * POST /api/admin/booking-refund
 * Refunds the deposit for a booking via Stripe.
 * Protected: requires admin auth.
 */
export async function POST(request: Request) {
  // Auth check
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { bookingId } = await request.json();
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId required" }, { status: 400 });
    }

    // Get the booking
    const { data: booking, error: fetchErr } = await supabaseAdmin
      .from("bookings")
      .select("stripe_payment_id, payment_status, deposit_amount, planner_name, planner_email")
      .eq("booking_id", bookingId)
      .single();

    if (fetchErr || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.payment_status !== "paid") {
      return NextResponse.json(
        { error: `Cannot refund — payment status is "${booking.payment_status}"` },
        { status: 400 }
      );
    }

    if (!booking.stripe_payment_id) {
      return NextResponse.json({ error: "No payment ID on record" }, { status: 400 });
    }

    // ── Issue Stripe refund ──
    const stripe = getStripe();
    if (!stripe) {
      // Dev mode: just update the status
      await supabaseAdmin
        .from("bookings")
        .update({
          payment_status: "refunded",
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("booking_id", bookingId);

      return NextResponse.json({ success: true, mode: "dev" });
    }

    const refund = await stripe.refunds.create({
      payment_intent: booking.stripe_payment_id,
    });

    // Update booking in DB
    await supabaseAdmin
      .from("bookings")
      .update({
        payment_status: "refunded",
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("booking_id", bookingId);

    // Notify planner
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    if (booking.planner_email) {
      fetch(`${siteUrl}/api/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: booking.planner_email,
          subject: `💸 Deposit Refunded — ${bookingId} | 7th Heaven`,
          html: `<div style="font-family:-apple-system,system-ui,sans-serif;max-width:500px;margin:0 auto;background:#0a0a0f;color:#fff;border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,0.05);">
            <h2 style="margin:0 0 16px;font-size:20px;">💸 Deposit Refunded</h2>
            <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;">
              Hey ${booking.planner_name || "there"}, your deposit of <strong style="color:#34d399;">${formatCents(booking.deposit_amount || 0)}</strong> for booking <strong style="color:#a855f7;">${bookingId}</strong> has been refunded. You should see it in your account within 5–10 business days.
            </p>
            <p style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:16px;">If you have any questions, reply to this email or reach us at info@7thheavenband.com.</p>
          </div>`,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      amount: formatCents(booking.deposit_amount || 0),
    });
  } catch (err: any) {
    console.error("[Booking Refund] Error:", err);
    return NextResponse.json(
      { error: err.message || "Refund failed" },
      { status: 500 }
    );
  }
}
