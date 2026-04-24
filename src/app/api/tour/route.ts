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
    }));
    return NextResponse.json(shows);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
