const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://acfzdcyqdskrmfuuoesb.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZnpkY3lxZHNrcm1mdXVvZXNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA0MjU2OCwiZXhwIjoyMDkxNjE4NTY4fQ.fxcoKdzPMaPOEVLxkH99uMukzzIzMkw1Ue1ukqpcmfY';

async function runMigration() {
  const filePath = path.join(__dirname, '../supabase/migration_016_featured_album_drops.sql');
  const sql = fs.readFileSync(filePath, 'utf8');

  console.log("Running migration 016 via exec_sql...");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`  ✗ Failed: ${err}`);
    process.exit(1);
  }

  console.log(`  ✓ migration_016_featured_album_drops.sql executed successfully`);
  process.exit(0);
}

runMigration();
