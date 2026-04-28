import { NextResponse } from "next/server";
import { sanityFetch } from "@/sanity/live";

export const dynamic = 'force-dynamic';

/**
 * GET: Fetch upcoming tour dates for the SMS blast show picker.
 * Returns shows with all details needed to auto-compose a proximity message.
 */
export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: shows } = await sanityFetch({
      query: `*[_type == "tourDate" && date >= "${today}" && isPrivate != true && !("private" in coalesce(tags, [])) && !("corporate" in coalesce(tags, []))] | order(date asc) {
        _id, venue, city, state, date, time, day,
        doorsTime, allAges, cover,
        lat, lng, isSoldOut, tags, notes
      }`
    });

    return NextResponse.json(shows || []);
  } catch (error: any) {
    console.error("Failed to fetch shows for SMS picker:", error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
