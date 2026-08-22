import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load .env.local manually
const env = readFileSync('.env.local', 'utf8');
const get = (key) => env.match(new RegExp(`^${key}=(.+)$`, 'm'))?.[1]?.trim();

const supabase = createClient(
  get('NEXT_PUBLIC_SUPABASE_URL'),
  get('SUPABASE_SERVICE_ROLE_KEY')
);

// Check if column exists by querying it
const { error } = await supabase
  .from('cruise_signups')
  .select('cruise_notifications')
  .limit(1);

if (!error) {
  console.log('✅ Column cruise_notifications already exists. Nothing to do.');
  process.exit(0);
}

// Column missing — use Supabase management API to run raw SQL
const url = get('NEXT_PUBLIC_SUPABASE_URL');
const key = get('SUPABASE_SERVICE_ROLE_KEY');
const projectRef = url.match(/https:\/\/([^.]+)\./)?.[1];

const res = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      query: 'ALTER TABLE cruise_signups ADD COLUMN IF NOT EXISTS cruise_notifications boolean NOT NULL DEFAULT true;'
    }),
  }
);

const data = await res.json();
if (res.ok) {
  console.log('✅ Column cruise_notifications added successfully.');
} else {
  console.error('❌ Failed:', JSON.stringify(data));
  process.exit(1);
}
