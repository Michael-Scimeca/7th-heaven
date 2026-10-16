import { createClient } from "@supabase/supabase-js";
import { sanityClient, queries, SanityTourDate } from "@/lib/sanity";
import { ensureUpcomingTourDates } from "@/lib/tour-helpers";

export interface TourDateDetailItem {
  time: string;
  venue?: string;
  city?: string;
  state?: string;
  day?: string;
  playTime?: string;
  doorsTime?: string;
  cover?: string;
  ticketLink?: string;
  notes?: string;
  directionsLink?: string;
  mapUrl?: string;
  parkingInfo?: string;
  parkingUrl?: string;
  isFestival?: boolean;
  isPrivate?: boolean;
  allAges?: boolean;
  status?: string;
}

export interface BookingAvailabilityResult {
  blockedDates: string[];
  dateDetails: Record<string, TourDateDetailItem[]>;
}

export async function getBookingAvailability(): Promise<BookingAvailabilityResult> {
  const blockedSet = new Set<string>();
  const dateDetails: Record<string, TourDateDetailItem[]> = {};

  const addDetail = (
    dStr: string,
    item: TourDateDetailItem,
  ) => {
    blockedSet.add(dStr);
    if (!dateDetails[dStr]) {
      dateDetails[dStr] = [];
    }
    dateDetails[dStr].push(item);
  };

  // 1. Fetch confirmed bookings from Supabase
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
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
    }
  } catch (e) {
    console.error("Error fetching Supabase bookings availability:", e);
  }

  // 2. Fetch tour dates from Sanity
  try {
    const sanityShows = await sanityClient.fetch<SanityTourDate[]>(
      queries.allTourDates,
      {},
      { cache: "no-store", next: { revalidate: 60 } },
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
            city: s.city || undefined,
            state: s.state || undefined,
            day: s.day || undefined,
            playTime: s.playTime || s.time || undefined,
            doorsTime: s.doorsTime || undefined,
            cover: s.cover || undefined,
            ticketLink: s.ticketLink || s.websiteUrl || undefined,
            notes: s.notes || s.info || undefined,
            directionsLink: s.directionsLink || s.mapUrl || undefined,
            mapUrl: s.mapUrl || s.directionsLink || undefined,
            parkingInfo: s.parkingInfo || undefined,
            parkingUrl: s.parkingUrl || undefined,
            isFestival: Boolean(s.isFestival),
            isPrivate: Boolean(s.isPrivate),
            allAges: s.allAges !== false,
            status: "Scheduled Tour Date",
          });
        }
      }
    });
  } catch (e) {
    console.error("Error fetching Sanity tour dates for availability:", e);
  }

  // 3. Check Supabase shows if any
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: showsData } = await supabase
        .from("shows")
        .select("date, time, venue, city, state, notes");

      (showsData || []).forEach((s) => {
        if (s.date) {
          const match = s.date.match(/^\d{4}-\d{2}-\d{2}/);
          if (match) {
            const dStr = match[0];
            addDetail(dStr, {
              time: s.time || "Scheduled Show",
              venue: s.venue || undefined,
              city: s.city || undefined,
              state: s.state || undefined,
              notes: s.notes || undefined,
              status: "Scheduled Tour Date",
            });
          }
        }
      });
    }
  } catch {
    // Supabase shows table might not exist or error, safe to ignore
  }

  // Fallback: If no dates loaded (e.g. Sanity offline or cold dev start), load key tour dates
  if (blockedSet.size === 0) {
    const fallbackTourShows = [
      {
        date: "2026-10-16",
        day: "Fri",
        venue: "Sideouts",
        city: "Island Lake",
        state: "IL",
        time: "9:00pm",
        playTime: "9:00pm",
        doorsTime: "7:00pm",
        allAges: true,
        cover: "$10 at door",
        notes: "Outdoor Festival Stage",
        mapUrl:
          "https://maps.apple.com/?address=4018%20Roberts%20Rd,%20Island%20Lake,%20IL%2060042",
        directionsLink:
          "https://maps.apple.com/?address=4018%20Roberts%20Rd,%20Island%20Lake,%20IL%2060042",
        ticketLink: "https://www.3dsideouts.com/events/7th-heaven/",
        parkingInfo:
          "Front guest lot and side festival stage crew loading zone.",
        parkingUrl: "https://www.3dsideouts.com/location/",
        isFestival: true,
        isPrivate: false,
      },
      {
        date: "2026-10-24",
        day: "Sat",
        venue: "Tailgaters",
        city: "Bolingbrook",
        state: "IL",
        time: "9:00pm",
        playTime: "9:00pm",
        doorsTime: "7:30pm",
        allAges: false,
        cover: "$15 at door",
        notes: "Full Band Rock Show",
        mapUrl:
          "https://maps.apple.com/?address=431%20W%20Boughton%20Rd,%20Bolingbrook,%20IL%2060444",
        directionsLink:
          "https://maps.apple.com/?address=431%20W%20Boughton%20Rd,%20Bolingbrook,%20IL%2060444",
        ticketLink: "http://www.tailgatersgrill.com",
        parkingInfo: "Free venue parking lot in front and rear.",
        parkingUrl: "http://www.tailgatersgrill.com/directions/",
        isFestival: false,
        isPrivate: false,
      },
      {
        date: "2026-10-31",
        day: "Sat",
        venue: "Hard Rock Casino",
        city: "Gary",
        state: "IN",
        time: "9:00pm",
        playTime: "9:00pm",
        doorsTime: "8:00pm",
        allAges: false,
        cover: "Free Admission",
        notes: "Halloween Rock Extravaganza",
        mapUrl:
          "https://maps.apple.com/?address=5400%20W%2029th%20Ave,%20Gary,%20IN%2046406",
        directionsLink:
          "https://maps.apple.com/?address=5400%20W%2029th%20Ave,%20Gary,%20IN%2046406",
        ticketLink: "https://www.hardrockcasinonorthernindiana.com",
        parkingInfo:
          "Covered casino garage on 29th Ave. Loading bay 2 for crew.",
        parkingUrl: "https://www.hardrockcasinonorthernindiana.com/amenities/parking",
        isFestival: false,
        isPrivate: false,
      },
    ];
    fallbackTourShows.forEach((s) => {
      addDetail(s.date, {
        time: s.time,
        venue: s.venue,
        city: s.city,
        state: s.state,
        day: s.day,
        playTime: s.playTime,
        doorsTime: s.doorsTime,
        cover: s.cover,
        allAges: s.allAges,
        notes: s.notes,
        mapUrl: s.mapUrl,
        directionsLink: s.directionsLink,
        ticketLink: s.ticketLink,
        parkingInfo: s.parkingInfo,
        parkingUrl: s.parkingUrl,
        isFestival: s.isFestival,
        isPrivate: s.isPrivate,
        status: "Scheduled Tour Date",
      });
    });
  }

  const blockedDates = Array.from(blockedSet).sort();
  return { blockedDates, dateDetails };
}
