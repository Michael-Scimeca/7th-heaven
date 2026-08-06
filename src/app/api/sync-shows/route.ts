import { NextResponse } from "next/server";
import { createClient as createSanityClient } from "next-sanity";
import * as cheerio from "cheerio";

const sanity = createSanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "1dg5ciuj",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: false,
});

const getSanityWriteClient = () => {
  const token = process.env.SANITY_API_TOKEN;
  if (!token) {
    throw new Error("Missing SANITY_API_TOKEN in environment variables");
  }
  return createSanityClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "1dg5ciuj",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
    token,
    useCdn: false,
  });
};

// Geocode a city + state to lat/lng using free nominatim API
async function geocodeCity(city: string, state: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = encodeURIComponent(`${city}, ${state}, USA`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { "User-Agent": "7thHeavenBand/1.0" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

// POST /api/sync-shows — Scrape legacy tour dates and sync to Sanity & Supabase
export async function POST() {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Fetch current Sanity tour dates to seed our geocoding cache
    console.log("Seeding geocoding cache from Sanity...");
    const existingTours = await sanity.fetch(
      `*[_type == "tourDate"] { _id, city, state, lat, lng }`
    );

    const geoCache: Record<string, { lat: number; lng: number }> = {};
    const existingSanityIds: string[] = [];

    existingTours.forEach((t: any) => {
      if (t._id) existingSanityIds.push(t._id);
      if (t.city && t.state && t.lat && t.lng) {
        const key = `${t.city.trim().toLowerCase()},${t.state.trim().toLowerCase()}`;
        geoCache[key] = { lat: t.lat, lng: t.lng };
      }
    });

    // 2. Fetch and scrape legacy website
    console.log("Fetching legacy tour dates...");
    const scrapeRes = await fetch("https://7thheavenband.com/tour.html");
    if (!scrapeRes.ok) {
      throw new Error(`Failed to fetch legacy tour dates page: ${scrapeRes.status}`);
    }
    const html = await scrapeRes.text();
    const $ = cheerio.load(html);

    const showsToInsert: any[] = [];
    const rows = $("table.dsR1 tbody tr");

    rows.each((i, el) => {
      // Skip header row
      if (i === 0) return;

      const tds = $(el).find("td");
      if (tds.length < 9) return;

      const day = $(tds[0]).text().trim();
      const dateStr = $(tds[1]).text().trim();
      const venue = $(tds[2]).text().trim();
      const city = $(tds[3]).text().trim().replace(/&nbsp;/g, "").trim();
      const state = $(tds[4]).text().trim().replace(/&nbsp;/g, "").trim();
      const time = $(tds[5]).text().trim().replace(/&nbsp;/g, "").trim();
      const info = $(tds[6]).text().trim().replace(/&nbsp;/g, "").trim();

      const mapAnchor = $(tds[7]).find("a");
      const directionsLink = mapAnchor.attr("href") || "";

      const ticketAnchor = $(tds[8]).find("a");
      const ticketLink = ticketAnchor.attr("href") || "";

      if (!venue || venue === "Day") return; // Header or empty rows

      // Parse the dateStr (e.g., "January 2" or "February 13") into ISO "YYYY-MM-DD"
      let isoDate = "";
      if (dateStr) {
        try {
          const dateObj = new Date(`${dateStr}, 2026`);
          if (!isNaN(dateObj.getTime())) {
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, "0");
            const dayVal = String(dateObj.getDate()).padStart(2, "0");
            isoDate = `${year}-${month}-${dayVal}`;
          }
        } catch (err) {
          console.warn(`Failed to parse date: ${dateStr}`);
        }
      }

      if (!isoDate) return;

      showsToInsert.push({
        day,
        date: isoDate,
        venue_name: venue,
        city,
        state: state || "IL",
        time,
        info,
        directionsLink,
        ticketLink,
      });
    });

    console.log(`Parsed ${showsToInsert.length} shows from legacy website.`);

    // 3. Process geocoding using cache
    let geocodedCount = 0;
    const resolvedShows: any[] = [];

    for (const show of showsToInsert) {
      const geoKey = `${show.city.trim().toLowerCase()},${show.state.trim().toLowerCase()}`;
      let lat = geoCache[geoKey]?.lat ?? null;
      let lng = geoCache[geoKey]?.lng ?? null;

      if ((!lat || !lng) && show.city && show.state) {
        // Sleep briefly to avoid geocoding rate-limit
        await new Promise((resolve) => setTimeout(resolve, 1100));
        const coords = await geocodeCity(show.city, show.state);
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
          geoCache[geoKey] = coords; // cache it
          geocodedCount++;
        }
      }

      resolvedShows.push({
        ...show,
        lat,
        lng,
      });
    }

    // 4. Update Sanity CMS via a unified transaction
    console.log("Updating Sanity CMS...");
    const writeClient = getSanityWriteClient();
    const tx = writeClient.transaction();

    // Delete existing docs
    existingSanityIds.forEach((id) => tx.delete(id));

    // Create new docs
    resolvedShows.forEach((show) => {
      const isFestival =
        show.info.toLowerCase().includes("festival") ||
        show.info.toLowerCase().includes("fest");

      tx.create({
        _type: "tourDate",
        venue: show.venue_name,
        city: show.city,
        state: show.state,
        date: show.date,
        time: show.time,
        day: show.day,
        notes: show.info,
        ticketLink: show.ticketLink,
        directionsLink: show.directionsLink,
        isSoldOut: false,
        isFestival,
        lat: show.lat,
        lng: show.lng,
      });
    });

    await tx.commit();
    console.log(`Sanity updated: deleted ${existingSanityIds.length} and created ${resolvedShows.length} docs.`);

    // 5. Update Supabase database in a single bulk upsert
    console.log("Updating Supabase database...");
    const supabasePayloads = resolvedShows.map((show) => ({
      venue_name: show.venue_name,
      city: show.city,
      state: show.state,
      date: show.date,
      time: show.time,
      status: "upcoming",
      latitude: show.lat,
      longitude: show.lng,
    }));

    const { error: supabaseError } = await supabase
      .from("shows")
      .upsert(supabasePayloads, { onConflict: "venue_name,date" });

    if (supabaseError) {
      throw new Error(`Supabase upsert failed: ${supabaseError.message}`);
    }

    console.log(`Supabase synced ${supabasePayloads.length} shows.`);

    return NextResponse.json({
      success: true,
      scraped: showsToInsert.length,
      sanityDeleted: existingSanityIds.length,
      sanityCreated: resolvedShows.length,
      supabaseUpserted: supabasePayloads.length,
      geocoded: geocodedCount,
    });
  } catch (e: any) {
    console.error("Sync error:", e);
    return NextResponse.json({ success: false, error: String(e.message || e) }, { status: 500 });
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
