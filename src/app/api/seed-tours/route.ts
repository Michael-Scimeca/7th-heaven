import { NextResponse } from "next/server";
import { sanityWriteClient } from "@/lib/sanity";

// Temporary endpoint to seed tour dates — remove after use
export async function POST() {
  const tourDates = [
    { _type: 'tourDate', venue: 'Durty Nellies', city: 'Palatine', state: 'IL', date: '2026-05-10', time: '9:00 PM', day: 'Saturday', isSoldOut: false, notes: 'Full band show — outdoor patio stage' },
    { _type: 'tourDate', venue: "Joe's Live", city: 'Rosemont', state: 'IL', date: '2026-05-24', time: '8:00 PM', day: 'Saturday', isSoldOut: false },
    { _type: 'tourDate', venue: "Mullen's Bar & Grill", city: 'Lisle', state: 'IL', date: '2026-06-07', time: '9:30 PM', day: 'Saturday', isSoldOut: false, notes: 'Doors open at 8:30 PM' },
    { _type: 'tourDate', venue: 'Taste of Chicago', city: 'Chicago', state: 'IL', date: '2026-07-04', time: '6:00 PM', day: 'Saturday', isSoldOut: false, isFestival: true, notes: 'Festival stage — Grant Park' },
    { _type: 'tourDate', venue: 'Wire', city: 'Berwyn', state: 'IL', date: '2026-07-18', time: '9:00 PM', day: 'Saturday', isSoldOut: false },
  ];

  try {
    const results = [];
    for (const td of tourDates) {
      const res = await sanityWriteClient.create(td as any);
      results.push({ id: res._id, venue: td.venue });
    }
    return NextResponse.json({ success: true, created: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
