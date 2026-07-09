const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Custom parser for .env.local to avoid requiring dotenv
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

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const sqlPath = path.join(__dirname, '..', 'supabase', 'migration_017_cruise_checked_off.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

console.log("Running migration_017_cruise_checked_off.sql on Supabase using exec_sql...");

supabase.rpc('exec_sql', { sql })
  .then(({ data, error }) => {
    if (error) {
      console.error("Migration failed:", error);
      process.exit(1);
    }
    console.log("Migration executed successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Unhandled error:", err);
    process.exit(1);
  });
