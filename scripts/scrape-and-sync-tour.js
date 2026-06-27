const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
const { createClient: createSanityClient } = require('@sanity/client');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const sanityToken = env.SANITY_API_TOKEN;

if (!supabaseUrl || !supabaseServiceKey || !sanityToken) {
  console.error("Missing Supabase or Sanity configuration in .env.local");
  process.exit(1);
}

const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);
const sanity = createSanityClient({
  projectId: '1dg5ciuj',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: sanityToken,
  useCdn: false,
});

// Geocode a city + state to lat/lng using free nominatim API
async function geocodeCity(city, state) {
  if (!city || !state) return null;
  try {
    const query = encodeURIComponent(`${city}, ${state}, USA`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { "User-Agent": "7thHeavenBand/1.0" } }
    );
    const data = await res.json();
    if (data && data[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function scrapeAndSync() {
  console.log("Fetching legacy tour dates from legacy site...");
  const res = await fetch("https://7thheavenband.com/tour.html");
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }
  const html = await res.text();
  const $ = cheerio.load(html);

  const showsToInsert = [];
  const rows = $('table.dsR1 tbody tr');

  console.log(`Found ${rows.length} total rows in tour table. Parsing...`);

  rows.each((i, el) => {
    // Skip the header row
    if (i === 0) return;

    const tds = $(el).find('td');
    if (tds.length < 9) return;

    const day = $(tds[0]).text().trim();
    const dateStr = $(tds[1]).text().trim();
    const venue = $(tds[2]).text().trim();
    const city = $(tds[3]).text().trim().replace(/&nbsp;/g, '').trim();
    const state = $(tds[4]).text().trim().replace(/&nbsp;/g, '').trim();
    const time = $(tds[5]).text().trim().replace(/&nbsp;/g, '').trim();
    const info = $(tds[6]).text().trim().replace(/&nbsp;/g, '').trim();

    const mapAnchor = $(tds[7]).find('a');
    const directionsLink = mapAnchor.attr('href') || '';

    const ticketAnchor = $(tds[8]).find('a');
    const ticketLink = ticketAnchor.attr('href') || '';

    if (!venue || venue === "Day") return; // Header or empty rows

    // Parse the dateStr (e.g., "January 2" or "February 13") into ISO "YYYY-MM-DD"
    let isoDate = '';
    if (dateStr) {
      try {
        const dateObj = new Date(`${dateStr}, 2026`);
        if (!isNaN(dateObj.getTime())) {
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const dayVal = String(dateObj.getDate()).padStart(2, '0');
          isoDate = `${year}-${month}-${dayVal}`;
        }
      } catch (err) {
        console.warn(`Failed to parse date: ${dateStr}`);
      }
    }

    if (!isoDate) {
      return;
    }

    showsToInsert.push({
      day,
      date: isoDate,
      venue_name: venue,
      city,
      state: state || 'IL',
      time,
      info,
      directionsLink,
      ticketLink
    });
  });

  console.log(`Parsed ${showsToInsert.length} shows.`);

  // 1. Clear existing tour dates in Sanity
  console.log('Clearing existing tour dates in Sanity CMS...');
  const existingSanityIds = await sanity.fetch('*[_type == "tourDate"]._id');
  if (existingSanityIds.length > 0) {
    const tx = sanity.transaction();
    existingSanityIds.forEach(id => tx.delete(id));
    await tx.commit();
    console.log(`Deleted ${existingSanityIds.length} existing tour dates in Sanity.`);
  }

  // 2. Iterate shows and insert to Sanity + Supabase
  let count = 0;
  for (const show of showsToInsert) {
    // Attempt to geocode coordinates for location-based proximity alerts
    let lat = null;
    let lng = null;
    if (show.city && show.state) {
      // Sleep briefly to avoid geocoding rate-limit
      await new Promise(resolve => setTimeout(resolve, 1000));
      const coords = await geocodeCity(show.city, show.state);
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
      }
    }

    // A. Create record in Sanity CMS
    const isFestival = show.info.toLowerCase().includes('festival') || show.info.toLowerCase().includes('fest');
    const sanityDoc = {
      _type: 'tourDate',
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
      lat,
      lng
    };

    try {
      await sanity.create(sanityDoc);
      console.log(`Sanity Created: ${show.venue_name} on ${show.date}`);
    } catch (sanityErr) {
      console.error(`Failed to create Sanity record for ${show.venue_name}:`, sanityErr.message);
    }

    // B. Upsert into Supabase database (unique constraint on venue_name & date)
    const payload = {
      venue_name: show.venue_name,
      city: show.city,
      state: show.state,
      date: show.date,
      time: show.time,
      status: 'upcoming',
      latitude: lat,
      longitude: lng
    };

    const { error: supabaseError } = await supabase
      .from('shows')
      .upsert(payload, { onConflict: 'venue_name,date' });

    if (supabaseError) {
      console.error(`Failed to upsert Supabase show for ${show.venue_name}:`, supabaseError.message);
    } else {
      console.log(`Supabase Synced: ${show.venue_name} on ${show.date} (lat: ${lat}, lng: ${lng})`);
      count++;
    }
  }

  console.log(`\n🎉 Success! Synchronized ${count} shows into both Sanity CMS and Supabase.`);
}

scrapeAndSync().catch(console.error);
