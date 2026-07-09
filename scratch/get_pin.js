const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Custom parser for .env.local
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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

supabase.from('cruise_pending_signups')
  .select('pin, email')
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle()
  .then(({ data }) => {
    if (data) {
      console.log(`PIN_CODE:${data.pin} FOR:${data.email}`);
    } else {
      console.log("NO_PIN_FOUND");
    }
    process.exit(0);
  });
