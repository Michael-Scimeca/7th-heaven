require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '1dg5ciuj';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';
const token = process.env.SANITY_API_TOKEN;

if (!token) {
  console.error('Error: SANITY_API_TOKEN is missing in environment!');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

async function main() {
  const parsedShowsPath = '/Users/michaelscimeca/.gemini/antigravity-ide/brain/7bf05689-d29c-45e7-81e8-c09d4b593b57/scratch/parsed_shows.json';
  const showsData = JSON.parse(fs.readFileSync(parsedShowsPath, 'utf8'));

  console.log(`Loaded ${showsData.length} parsed shows from seed list.`);

  // Fetch all existing tour dates from Sanity
  const existingDocs = await client.fetch(`*[_type == "tourDate"] { _id, venue, city, state, date, directionsLink, mapUrl, lat, lng }`);
  console.log(`Found ${existingDocs.length} existing tourDate documents in Sanity.`);

  // Build lookup map by "date" and normalized venue name
  const docMap = new Map();
  for (const doc of existingDocs) {
    const key = `${doc.date}_${(doc.venue || '').toLowerCase().trim()}`;
    docMap.set(key, doc);
  }

  let updatedCount = 0;
  let createdCount = 0;

  for (const show of showsData) {
    const venueNorm = show.venue.toLowerCase().trim();
    const key = `${show.date}_${venueNorm}`;

    // Try exact key match, or search by date
    let doc = docMap.get(key);
    if (!doc) {
      // Try matching by date only
      const dateMatches = existingDocs.filter(d => d.date === show.date);
      if (dateMatches.length === 1) {
        doc = dateMatches[0];
      } else if (dateMatches.length > 1) {
        // Find best venue match
        doc = dateMatches.find(d => (d.venue || '').toLowerCase().includes(venueNorm) || venueNorm.includes((d.venue || '').toLowerCase()));
      }
    }

    // Google Maps link fallback or preferred google map link
    const googleMapUrl = show.lat && show.lng 
      ? `https://www.google.com/maps?q=${show.lat},${show.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${show.venue} ${show.city} ${show.state}`)}`;

    const patchData = {
      directionsLink: show.googleMapUrl || googleMapUrl,
      mapUrl: show.mapUrl || googleMapUrl,
    };

    if (show.lat !== null && show.lng !== null) {
      patchData.lat = show.lat;
      patchData.lng = show.lng;
    }

    if (doc) {
      // Update existing document
      await client.patch(doc._id).set(patchData).commit();
      console.log(`[UPDATED] ${show.date} - ${show.venue} (${show.city}, ${show.state}) -> ID: ${doc._id}`);
      updatedCount++;
    } else {
      // Create new document
      const newDoc = {
        _type: 'tourDate',
        venue: show.venue,
        city: show.city,
        state: show.state,
        date: show.date,
        directionsLink: show.googleMapUrl || googleMapUrl,
        mapUrl: show.mapUrl || googleMapUrl,
        isSoldOut: false,
        isFestival: false,
        allAges: true,
      };
      if (show.lat !== null && show.lng !== null) {
        newDoc.lat = show.lat;
        newDoc.lng = show.lng;
      }

      const res = await client.create(newDoc);
      console.log(`[CREATED] ${show.date} - ${show.venue} (${show.city}, ${show.state}) -> ID: ${res._id}`);
      createdCount++;
    }
  }

  console.log(`\nSuccessfully processed all seed shows!`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Created: ${createdCount}`);
}

main().catch(err => {
  console.error('Error in seed script:', err);
  process.exit(1);
});
