const fs = require('fs');
const path = require('path');

// Load environment variables manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const sqlPath = path.join(__dirname, '../supabase/migration_015_featured_tracks.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

console.log(`Sending migration SQL to ${url}/pg/query...`);

fetch(`${url}/pg/query`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${serviceKey}`,
  },
  body: JSON.stringify({ query: sql }),
})
.then(async res => {
  if (!res.ok) {
    const text = await res.text();
    console.error(`HTTP Error ${res.status}:`, text);
    process.exit(1);
  }
  return res.json();
})
.then(data => {
  console.log("Migration executed successfully via /pg/query!", data);
  process.exit(0);
})
.catch(err => {
  console.error("Fetch Error:", err);
  process.exit(1);
});
