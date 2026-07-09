const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function main() {
  const { data: profiles, error } = await supabase.from('profiles').select('id, email, full_name, role, username');
  if (error) {
    console.error(error);
  } else {
    console.log(JSON.stringify(profiles, null, 2));
  }
}
main();
