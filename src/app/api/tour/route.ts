import { NextResponse } from "next/server";
import { sanityFetch } from "@/sanity/live";
import { queries, SanityTourDate } from "@/lib/sanity";
import { ensureUpcomingTourDates } from "@/lib/tour-helpers";

// Cache tour dates for 5 minutes — avoids a Sanity fetch on every page load
export const revalidate = 300;

export async function GET() {
  try {
    const { data: showsData } = await sanityFetch({ query: queries.allTourDates });
    const shows = (showsData as SanityTourDate[]).map(s => ({
      venue: s.venue,
      city: s.city || '',
      state: s.state || '',
      date: s.date,
      time: s.time || '',
      day: s.day || '',
      notes: s.notes || '',
      ticketLink: s.ticketLink || '',
      directionsLink: s.directionsLink || '',
      isSoldOut: s.isSoldOut || false,
      isFestival: s.isFestival || false,
      allAges: s.allAges,
    }));

    // Deduplicate shows by date and venue
    const seen = new Set<string>();
    const deduplicated = shows.filter(s => {
      const key = `${s.date || ''}_${(s.venue || '').toLowerCase().trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort shows by date ascending
    deduplicated.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    const ensured = ensureUpcomingTourDates(deduplicated);

    return NextResponse.json(ensured, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' }
    });
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
