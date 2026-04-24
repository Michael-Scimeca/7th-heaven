// Seed tour dates into Sanity
// Run: node seed-tour-dates.js

const { createClient } = require('@sanity/client');

// Load env manually
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) envVars[key.trim()] = val.join('=').trim();
});
const client = createClient({
  projectId: '1dg5ciuj',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: envVars.SANITY_API_TOKEN,
  useCdn: false,
});

const tourDates = [
  {
    _type: 'tourDate',
    venue: 'Durty Nellies',
    city: 'Palatine',
    state: 'IL',
    date: '2026-05-10',
    time: '9:00 PM',
    day: 'Saturday',
    ticketLink: '',
    isSoldOut: false,
    notes: 'Full band show — outdoor patio stage',
  },
  {
    _type: 'tourDate',
    venue: 'Joe\'s Live',
    city: 'Rosemont',
    state: 'IL',
    date: '2026-05-24',
    time: '8:00 PM',
    day: 'Saturday',
    ticketLink: '',
    isSoldOut: false,
    notes: '',
  },
  {
    _type: 'tourDate',
    venue: 'Mullen\'s Bar & Grill',
    city: 'Lisle',
    state: 'IL',
    date: '2026-06-07',
    time: '9:30 PM',
    day: 'Saturday',
    ticketLink: '',
    isSoldOut: false,
    notes: 'Private event — doors open at 8:30 PM',
  },
  {
    _type: 'tourDate',
    venue: 'Taste of Chicago',
    city: 'Chicago',
    state: 'IL',
    date: '2026-07-04',
    time: '6:00 PM',
    day: 'Saturday',
    ticketLink: '',
    isSoldOut: false,
    isFestival: true,
    notes: 'Festival stage — Grant Park',
  },
  {
    _type: 'tourDate',
    venue: 'Wire',
    city: 'Berwyn',
    state: 'IL',
    date: '2026-07-18',
    time: '9:00 PM',
    day: 'Saturday',
    ticketLink: '',
    isSoldOut: false,
    notes: '',
  },
];

async function seed() {
  console.log('🎵 Seeding tour dates into Sanity...');
  for (const date of tourDates) {
    const result = await client.create(date);
    console.log(`  ✅ Created: ${date.venue} (${date.city}, ${date.state}) — ${date.date} → ${result._id}`);
  }
  console.log(`\n🎉 Done! ${tourDates.length} tour dates added.`);
}

seed().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
