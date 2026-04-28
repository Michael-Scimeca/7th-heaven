import { NextResponse } from "next/server";
import { createClient as createSanityClient } from "next-sanity";

const sanity = createSanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "1dg5ciuj",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: false,
});

// Geocode a city + state to lat/lng using free nominatim API
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

// POST /api/sync-shows — sync Sanity tour dates → Supabase shows table
export async function POST() {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch all upcoming tour dates from Sanity
    const tourDates = await sanity.fetch(
      `*[_type == "tourDate"] | order(date asc) {
        _id, venue, city, state, date, time, day,
        doorsTime, allAges, cover, ticketLink, isSoldOut, isFestival, notes, lat, lng
      }`
    );

    if (!tourDates?.length) {
      return NextResponse.json({ message: "No tour dates found in Sanity", synced: 0 });
    }

    let synced = 0;
    let geocoded = 0;
    const errors: string[] = [];

    for (const tour of tourDates) {
      // Use existing lat/lng from Sanity if available, otherwise geocode
      let lat = tour.lat ?? null;
      let lng = tour.lng ?? null;

      if ((!lat || !lng) && tour.city && tour.state) {
        // Rate-limit nominatim: 1 req/sec
        await new Promise(resolve => setTimeout(resolve, 1100));
        const coords = await geocodeCity(tour.city, tour.state);
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
          geocoded++;
          // Write coords back to Sanity too
          try {
            const { createClient: createWriteClient } = await import("next-sanity");
            const writeClient = createWriteClient({
              projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "1dg5ciuj",
              dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
              apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
              token: process.env.SANITY_API_TOKEN,
              useCdn: false,
            });
            await writeClient.patch(tour._id).set({ lat, lng }).commit();
          } catch {}
        }
      }

      const showData = {
        venue_name: tour.venue || "TBA",
        city: tour.city || "",
        state: tour.state || "",
        date: tour.date,
        time: tour.time || "",
        status: "upcoming",
        latitude: lat,
        longitude: lng,
      };

      // Upsert by venue + date combo
      const { error } = await supabase
        .from("shows")
        .upsert(showData, { onConflict: "venue_name,date" })
        .select();

      if (error) {
        // If upsert fails due to missing unique constraint, just insert
        const { error: insertError } = await supabase.from("shows").insert(showData);
        if (insertError) {
          errors.push(`${tour.venue} (${tour.date}): ${insertError.message}`);
        } else {
          synced++;
        }
      } else {
        synced++;
      }
    }

    return NextResponse.json({
      success: true,
      total: tourDates.length,
      synced,
      geocoded,
      errors: errors.length ? errors : undefined,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// GET — check current shows in Supabase
export async function GET() {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: shows, error } = await supabase
      .from("shows")
      .select("id, venue_name, city, state, date, latitude, longitude, status")
      .order("date", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ shows, count: shows?.length ?? 0 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
