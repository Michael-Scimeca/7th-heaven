#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://acfzdcyqdskrmfuuoesb.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZnpkY3lxZHNrcm1mdXVvZXNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA0MjU2OCwiZXhwIjoyMDkxNjE4NTY4fQ.fxcoKdzPMaPOEVLxkH99uMukzzIzMkw1Ue1ukqpcmfY';

const migrations = [
  path.join(__dirname, '../supabase/migration_012_invite_challenge.sql'),
  path.join(__dirname, '../supabase/migration_013_show_memories.sql'),
];

async function runMigration(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);

  console.log(`\nRunning: ${fileName}`);

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
    // Try the pg endpoint instead
    const res2 = await fetch(`${SUPABASE_URL}/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    if (!res2.ok) {
      console.error(`  ✗ Failed: ${await res2.text()}`);
      return false;
    }
  }

  console.log(`  ✓ ${fileName} executed successfully`);
  return true;
}

(async () => {
  for (const m of migrations) {
    await runMigration(m);
  }
})();
