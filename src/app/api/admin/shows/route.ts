import { NextResponse } from "next/server";
import { sanityFetch } from "@/sanity/live";
import { sanityWriteClient } from "@/lib/sanity";
import { requireAdmin } from "@/lib/api-utils";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

// Helper to geocode city + state to lat/lng using free OpenStreetMap Nominatim API
async function geocodeCity(city: string, state: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = encodeURIComponent(`${city}, ${state}, USA`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { "User-Agent": "7thHeavenBand/1.0" } }
    );
    const data = await res.json();
    if (data?.[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

// Helper to calculate the day of the week from a date string (YYYY-MM-DD)
function getDayOfWeek(dateStr: string): string {
  try {
    const dateObj = new Date(dateStr + 'T12:00:00');
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return dayNames[dateObj.getDay()];
  } catch {
    return "";
  }
}

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
        doorsTime, allAges, cover, ticketLink, directionsLink,
        lat, lng, isSoldOut, tags, notes
      }`
    });

    return NextResponse.json(shows || []);
  } catch (error: any) {
    console.error("Failed to fetch shows for SMS picker:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST: Create a new tour date in Sanity (Admin only).
 */
export async function POST(request: Request) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const {
      venue, city, state, date, time, doorsTime, playTime,
      allAges, cover, ticketLink, directionsLink,
      isSoldOut, isFestival, isPrivate, notes, tags
    } = body;

    if (!venue || !city || !state || !date) {
      return NextResponse.json({ error: "Missing required fields (venue, city, state, date)" }, { status: 400 });
    }

    // Geocode coordinates
    const coords = await geocodeCity(city, state);
    const lat = coords?.lat ?? null;
    const lng = coords?.lng ?? null;

    // Calculate day of the week
    const day = getDayOfWeek(date);

    const doc = {
      _type: "tourDate",
      venue,
      city,
      state,
      date,
      day,
      time: time || "",
      doorsTime: doorsTime || "",
      playTime: playTime || "",
      allAges: allAges ?? true,
      cover: cover || "",
      ticketLink: ticketLink || "",
      directionsLink: directionsLink || "",
      isSoldOut: isSoldOut ?? false,
      isFestival: isFestival ?? false,
      isPrivate: isPrivate ?? false,
      notes: notes || "",
      tags: tags || [],
      lat,
      lng,
    };

    const result = await sanityWriteClient.create(doc);
    revalidatePath("/tour");

    return NextResponse.json({ success: true, show: result });
  } catch (error: any) {
    console.error("Failed to create show date in Sanity:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH: Update an existing tour date in Sanity (Admin only).
 */
export async function PATCH(request: Request) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const {
      _id, venue, city, state, date, time, doorsTime, playTime,
      allAges, cover, ticketLink, directionsLink,
      isSoldOut, isFestival, isPrivate, notes, tags
    } = body;

    if (!_id) {
      return NextResponse.json({ error: "Missing show ID (_id)" }, { status: 400 });
    }

    // Prepare fields to set
    const updateFields: any = {};
    if (venue !== undefined) updateFields.venue = venue;
    if (city !== undefined) updateFields.city = city;
    if (state !== undefined) updateFields.state = state;
    if (date !== undefined) {
      updateFields.date = date;
      updateFields.day = getDayOfWeek(date);
    }
    if (time !== undefined) updateFields.time = time;
    if (doorsTime !== undefined) updateFields.doorsTime = doorsTime;
    if (playTime !== undefined) updateFields.playTime = playTime;
    if (allAges !== undefined) updateFields.allAges = allAges;
    if (cover !== undefined) updateFields.cover = cover;
    if (ticketLink !== undefined) updateFields.ticketLink = ticketLink;
    if (directionsLink !== undefined) updateFields.directionsLink = directionsLink;
    if (isSoldOut !== undefined) updateFields.isSoldOut = isSoldOut;
    if (isFestival !== undefined) updateFields.isFestival = isFestival;
    if (isPrivate !== undefined) updateFields.isPrivate = isPrivate;
    if (notes !== undefined) updateFields.notes = notes;
    if (tags !== undefined) updateFields.tags = tags;

    // Recalculate geocoding if city or state changed, or if coordinates are not set
    if (city || state) {
      const currentDoc = await sanityWriteClient.getDocument(_id);
      const newCity = city || currentDoc?.city;
      const newState = state || currentDoc?.state;
      if (newCity && newState) {
        const coords = await geocodeCity(newCity, newState);
        if (coords) {
          updateFields.lat = coords.lat;
          updateFields.lng = coords.lng;
        }
      }
    }

    const result = await sanityWriteClient.patch(_id).set(updateFields).commit();
    revalidatePath("/tour");

    return NextResponse.json({ success: true, show: result });
  } catch (error: any) {
    console.error("Failed to update show date in Sanity:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE: Delete a tour date in Sanity (Admin only).
 */
export async function DELETE(request: Request) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing show ID (id)" }, { status: 400 });
    }

    await sanityWriteClient.delete(id);
    revalidatePath("/tour");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete show date in Sanity:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
