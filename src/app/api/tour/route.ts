import { NextResponse } from "next/server";
import { sanityFetch } from "@/sanity/live";
import { queries, SanityTourDate } from "@/lib/sanity";

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

    // Sort shows by date ascending
    shows.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    if (shows.length > 0 && shows[0].date) {
      // Calculate difference between the first show date and July 15, 2026
      const firstShowDate = new Date(shows[0].date + 'T12:00:00');
      const targetDate = new Date('2026-07-15T12:00:00');
      const diffTime = targetDate.getTime() - firstShowDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      // Shift all dates by diffDays
      const shifted = shows.map(s => {
        if (!s.date) return s;
        const d = new Date(s.date + 'T12:00:00');
        d.setDate(d.getDate() + diffDays);

        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const newDateStr = `${yyyy}-${mm}-${dd}`;

        const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const newDay = weekdays[d.getDay()];

        return {
          ...s,
          date: newDateStr,
          day: newDay
        };
      });

      return NextResponse.json(shifted);
    }

    return NextResponse.json(shows);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
