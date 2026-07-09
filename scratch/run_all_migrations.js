const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://acfzdcyqdskrmfuuoesb.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZnpkY3lxZHNrcm1mdXVvZXNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA0MjU2OCwiZXhwIjoyMDkxNjE4NTY4fQ.fxcoKdzPMaPOEVLxkH99uMukzzIzMkw1Ue1ukqpcmfY';

const supabaseDir = path.join(__dirname, '../supabase');
const files = fs.readdirSync(supabaseDir);

const migrationFiles = files
  .filter(f => f.startsWith('migration_') && f.endsWith('.sql'))
  .sort();

async function runMigration(fileName) {
  const filePath = path.join(supabaseDir, fileName);
  const sql = fs.readFileSync(filePath, 'utf8');

  console.log(`Running: ${fileName}`);

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
    return false;
  }

  console.log(`  ✓ Executed successfully`);
  return true;
}

(async () => {
  for (const file of migrationFiles) {
    await runMigration(file);
  }
  process.exit(0);
})();
