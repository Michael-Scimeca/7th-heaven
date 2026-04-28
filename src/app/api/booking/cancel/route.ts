import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";
import { bookingCancelledAdminAlert } from "@/lib/email-templates";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "mikeyscimeca@gmail.com";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { bookingId, token } = await request.json();

    if (!bookingId || !token) {
      return NextResponse.json({ error: "Missing booking ID or token" }, { status: 400 });
    }

    // Look up booking by booking_id and verify cancel token
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("booking_id", bookingId)
      .eq("cancel_token", token)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Invalid booking or token" }, { status: 404 });
    }

    if (booking.status === "cancelled") {
      return NextResponse.json({ error: "This booking has already been cancelled" }, { status: 400 });
    }

    // Cancel the booking
    const { error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("booking_id", bookingId)
      .eq("cancel_token", token);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Send Admin Email Alert
    try {
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `🚨 Booking Cancelled: ${bookingId}`,
        html: bookingCancelledAdminAlert({
          bookingId: bookingId,
          eventDate: booking.event_date || "Unknown Date",
          eventType: booking.event_type || "Unknown Event",
        }),
      });
    } catch (emailError) {
      console.error("Failed to send booking cancellation admin alert:", emailError);
      // We still return success since the cancellation was recorded
    }

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
      bookingId,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
