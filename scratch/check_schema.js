const SUPABASE_URL = 'https://acfzdcyqdskrmfuuoesb.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZnpkY3lxZHNrcm1mdXVvZXNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA0MjU2OCwiZXhwIjoyMDkxNjE4NTY4fQ.fxcoKdzPMaPOEVLxkH99uMukzzIzMkw1Ue1ukqpcmfY';

async function query(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });
  const text = await res.text();
  console.log('exec_sql body:', text);
}

query("select column_name, data_type from information_schema.columns where table_name = 'cruise_signups';")
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
