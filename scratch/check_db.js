const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function check() {
  const { data, error } = await supabase.from('featured_drops').select('*').limit(1);
  if (error) {
    console.log("featured_drops check error:", error);
  } else {
    console.log("featured_drops exists! count:", data.length);
  }

  const { data: songs, error: songsError } = await supabase.from('featured_drop_songs').select('*').limit(1);
  if (songsError) {
    console.log("featured_drop_songs check error:", songsError);
  } else {
    console.log("featured_drop_songs exists! count:", songs.length);
  }
}

check();
