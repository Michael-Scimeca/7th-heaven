const { createClient } = require('@supabase/supabase-js');
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

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase configuration in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Day map for dates
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

async function updateSeed() {
  console.log("Fetching current shows from Supabase...");
  const { data: shows, error } = await supabase
    .from("shows")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch shows from Supabase: ${error.message}`);
  }

  console.log(`Retrieved ${shows.length} shows from Supabase.`);

  // Format shows for the javascript file array
  const formattedShows = shows.map(s => {
    // Derive day of week if missing
    let day = "";
    if (s.date) {
      const d = new Date(s.date + 'T12:00:00');
      day = daysOfWeek[d.getDay()];
    }

    const obj = {
      venue: s.venue_name || "TBA",
      city: s.city || "",
      state: s.state || "IL",
      date: s.date || "",
      time: s.time || "",
      day: day,
      notes: s.info || "",
      lat: s.latitude || null,
      lng: s.longitude || null
    };
    return obj;
  });

  // Load seed-all-content.js
  const seedFilePath = path.resolve(__dirname, '../seed-all-content.js');
  if (!fs.existsSync(seedFilePath)) {
    console.error("seed-all-content.js not found at:", seedFilePath);
    process.exit(1);
  }

  let content = fs.readFileSync(seedFilePath, 'utf8');

  // Locate the tourDates array definition in seed-all-content.js
  // It starts with const tourDates = [ and ends with ];
  const regex = /(const tourDates = \[\s*[\s\S]*?\n\];)/;
  const match = content.match(regex);

  if (!match) {
    console.error("Could not locate 'const tourDates = [...];' in seed-all-content.js");
    process.exit(1);
  }

  // Generate the new tourDates code
  const arrayString = JSON.stringify(formattedShows, null, 2);
  const newArrayCode = `const tourDates = ${arrayString};`;

  // Replace and write
  const updatedContent = content.replace(regex, newArrayCode);
  fs.writeFileSync(seedFilePath, updatedContent, 'utf8');
  console.log("Successfully updated seed-all-content.js with the new 147 tour dates!");
}

updateSeed().catch(console.error);
