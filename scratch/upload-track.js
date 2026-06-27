const { createClient } = require('@supabase/supabase-js');
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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

const client = createClient(supabaseUrl, serviceRoleKey);

// Ensure the public/uploads/featured/ directory exists and copy the test-song.mp3 into it
const uploadDir = path.join(__dirname, '../public/uploads/featured');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const srcPath = path.join(__dirname, 'test-song.mp3');
const destPath = path.join(uploadDir, 'test-song.mp3');
fs.copyFileSync(srcPath, destPath);

console.log("Seeding test track into featured_tracks database table...");

async function run() {
  // Deactivate existing
  await client.from('featured_tracks').update({ is_active: false }).eq('is_active', true);

  // Insert test track
  const { data, error } = await client.from('featured_tracks').insert({
    title: 'Acoustic Anthem (Visualizer Test Track)',
    audio_url: '/uploads/featured/test-song.mp3',
    visibility: 'everyone',
    is_active: true
  }).select();

  if (error) {
    console.error("Error inserting track:", error);
  } else {
    console.log("Success! Featured track seeded:", data);
  }
}

run();
