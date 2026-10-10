/**
 * Booking Availability API
 * Returns confirmed booking and tour dates so the calendar can block them.
 */
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getBookingAvailability } from "@/lib/booking-availability";

export async function GET() {
  try {
    const data = await getBookingAvailability();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (err: any) {
    console.error("Availability API error:", err);
    return NextResponse.json({ blockedDates: [], dateDetails: {} });
  }
}
