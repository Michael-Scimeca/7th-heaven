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

console.log("Looking for admin users in public.profiles...");
client.from('profiles').select('email, role').eq('role', 'admin').limit(5)
  .then(({ data, error }) => {
    if (error) {
      console.log("Error querying profiles:", error);
    } else {
      console.log("Admin users:", data);
    }
  });
