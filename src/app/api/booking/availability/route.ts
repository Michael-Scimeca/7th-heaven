/**
 * Booking Availability API
 * Returns confirmed booking and tour dates so the calendar can block them.
 */
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sanityClient, queries, SanityTourDate } from "@/lib/sanity";
import { ensureUpcomingTourDates } from "@/lib/tour-helpers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET() {
  try {
    const blockedSet = new Set<string>();
    const dateDetails: Record<
      string,
      Array<{ time: string; venue?: string; city?: string }>
    > = {};

    const addDetail = (
      dStr: string,
      item: { time: string; venue?: string; city?: string },
    ) => {
      blockedSet.add(dStr);
      if (!dateDetails[dStr]) {
        dateDetails[dStr] = [];
      }
      dateDetails[dStr].push(item);
    };

    // 1. Fetch confirmed bookings from Supabase
    try {
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("event_date, start_time, end_time, venue_name, venue_city")
        .eq("status", "confirmed");

      (bookingsData || []).forEach((b) => {
        if (b.event_date) {
          const match = b.event_date.match(/^\d{4}-\d{2}-\d{2}/);
          const dStr = match ? match[0] : b.event_date;
          const timeStr =
            b.start_time && b.end_time
              ? `${b.start_time} – ${b.end_time}`
              : b.start_time || "Confirmed Event";
          addDetail(dStr, {
            time: timeStr,
            venue: b.venue_name || undefined,
            city: b.venue_city || undefined,
          });
        }
      });
    } catch (e) {
      console.error("Error fetching Supabase bookings availability:", e);
    }

    // 2. Fetch tour dates from Sanity
    try {
      const sanityShows = await sanityClient.fetch<SanityTourDate[]>(
        queries.allTourDates,
        {},
        { cache: "no-store", next: { revalidate: 0 } },
      );
      const ensured = ensureUpcomingTourDates(sanityShows || []);
      (ensured || []).forEach((s: any) => {
        const dateVal = s.startDate || s.date;
        if (dateVal) {
          let dStr = "";
          const match = dateVal.match(/^\d{4}-\d{2}-\d{2}/);
          if (match) {
            dStr = match[0];
          } else {
            const dt = new Date(dateVal);
            if (!isNaN(dt.getTime())) {
              const yyyy = dt.getFullYear();
              const mm = String(dt.getMonth() + 1).padStart(2, "0");
              const dd = String(dt.getDate()).padStart(2, "0");
              dStr = `${yyyy}-${mm}-${dd}`;
            }
          }

          if (dStr) {
            const timeStr =
              s.playTime ||
              s.time ||
              (s.doorsTime ? `Doors ${s.doorsTime}` : "Evening Show");
            addDetail(dStr, {
              time: timeStr,
              venue: s.venue || undefined,
              city: s.city ? `${s.city}${s.state ? `, ${s.state}` : ""}` : undefined,
            });
          }
        }
      });
    } catch (e) {
      console.error("Error fetching Sanity tour dates for availability:", e);
    }

    // 3. Check Supabase shows if any
    try {
      const { data: showsData } = await supabase
        .from("shows")
        .select("date, time, venue, city");

      (showsData || []).forEach((s) => {
        if (s.date) {
          const match = s.date.match(/^\d{4}-\d{2}-\d{2}/);
          if (match) {
            const dStr = match[0];
            addDetail(dStr, {
              time: s.time || "Scheduled Show",
              venue: s.venue || undefined,
              city: s.city || undefined,
            });
          }
        }
      });
    } catch {
      // Supabase shows table might not exist or error, safe to ignore
    }

    const blockedDates = Array.from(blockedSet).sort();

    return NextResponse.json(
      { blockedDates, dateDetails },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (err: any) {
    console.error("Availability API error:", err);
    return NextResponse.json({ blockedDates: [], dateDetails: {} });
  }
}

