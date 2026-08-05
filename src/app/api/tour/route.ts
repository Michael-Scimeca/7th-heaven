import { NextResponse } from "next/server";
import { sanityFetch } from "@/sanity/live";
import { queries, SanityTourDate } from "@/lib/sanity";

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

    // Only shift if the first show date is in an older year (e.g. 2025 or earlier)
    if (deduplicated.length > 0 && deduplicated[0].date && deduplicated[0].date.startsWith('2025')) {
      const firstShowDate = new Date(deduplicated[0].date + 'T12:00:00');
      const targetDate = new Date('2026-05-20T12:00:00');
      const diffTime = targetDate.getTime() - firstShowDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      const shifted = deduplicated.map(s => {
        if (!s.date) return s;
        const d = new Date(s.date + 'T12:00:00');
        d.setDate(d.getDate() + diffDays);

        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const newDateStr = `${yyyy}-${mm}-${dd}`;

        const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const newDay = weekdays[d.getDay()];

        return { ...s, date: newDateStr, day: newDay };
      });

      return NextResponse.json(shifted, {
        headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' }
      });
    }

    return NextResponse.json(deduplicated, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' }
    });
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
