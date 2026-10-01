import { NextResponse } from "next/server";
import {
  sanityClient,
  sanityWriteClient,
  queries,
  SanityTourDate,
} from "@/lib/sanity";
import { ensureUpcomingTourDates } from "@/lib/tour-helpers";
import { VENUE_LINKS } from "@/lib/venue-links";

export const revalidate = 60;

export async function GET() {
  try {
    const showsData = await sanityClient.fetch<SanityTourDate[]>(
      queries.allTourDates,
      {},
      { next: { revalidate: 60, tags: ["sanity", "tour"] } },
    );
    const shows = (showsData as SanityTourDate[]).map((s) => {
      const fallbackMap =
        VENUE_LINKS[s.venue]?.mapUrl ||
        (s.venue && s.city && !s.isPrivate
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.venue} ${s.city} ${s.state || ""}`)}`
          : "");
      const mapLink = s.directionsLink || s.mapUrl || fallbackMap;
      return {
        _id: s._id,
        venue: s.venue,
        city: s.city || "",
        state: s.state || "",
        date: s.date,
        time: s.time || "",
        playTime: s.playTime || "",
        doorsTime: s.doorsTime || "",
        day: s.day || "",
        notes: s.notes || "",
        ticketLink: s.ticketLink || s.websiteUrl || "",
        directionsLink: mapLink,
        mapUrl: mapLink,
        websiteUrl: s.websiteUrl || s.ticketLink || "",
        parkingInfo: s.parkingInfo || "",
        parkingUrl: s.parkingUrl || "",
        isSoldOut: s.isSoldOut || false,
        isFestival: s.isFestival || false,
        isPrivate: s.isPrivate || false,
        allAges: s.allAges,
        tags: s.tags || [],
        lat: s.lat,
        lng: s.lng,
      };
    });

    // Deduplicate shows by date and venue
    const seen = new Set<string>();
    const deduplicated = shows.filter((s) => {
      const key = `${s.date || ""}_${(s.venue || "").toLowerCase().trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort shows by date ascending
    deduplicated.sort((a, b) => (a.date || "").localeCompare(b.date || ""));

    const ensured = ensureUpcomingTourDates(deduplicated);

    return NextResponse.json(ensured, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
