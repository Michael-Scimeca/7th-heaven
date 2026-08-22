import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = readFileSync('.env.local', 'utf8');
const get = (key) => env.match(new RegExp(`^${key}=(.+)$`, 'm'))?.[1]?.trim().replace(/^["']|["']$/g, '');

const SUPABASE_URL = get('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_KEY = get('SUPABASE_SERVICE_ROLE_KEY');

const sb = createClient(SUPABASE_URL, SERVICE_KEY);

// Check if table exists
const { error } = await sb.from('push_subscribers').select('id').limit(1);

if (!error) {
  console.log('✅ push_subscribers table already exists.');
  process.exit(0);
}

console.log('Table missing:', error.message);
console.log('\n📋 Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql):\n');
console.log(`
CREATE TABLE IF NOT EXISTS push_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text UNIQUE NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  email text,
  zip text,
  radius text NOT NULL DEFAULT '50',
  selected_types text[] NOT NULL DEFAULT ARRAY['all'],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS push_subscribers_email_idx ON push_subscribers(email);
CREATE INDEX IF NOT EXISTS push_subscribers_zip_idx ON push_subscribers(zip);
`);
