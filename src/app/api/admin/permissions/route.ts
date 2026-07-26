import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

const DEFAULT_PERMISSIONS: Record<string, Record<string, boolean>> = {
  'marygrivas65@icloud.com': {
    cruise_chat: true,
    cruise_admin: true,
    schedule: false,
    crew_roster: false,
    email_blasts: false,
    site_settings: false,
  }
};

export async function GET() {
  try {
    const { data } = await supabaseAdmin.from('site_settings').select('value').eq('key', 'admin_permissions').single();
    if (!data?.value) {
      return NextResponse.json({ permissions: DEFAULT_PERMISSIONS });
    }
    let parsed = data.value;
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch {}
    }
    return NextResponse.json({ permissions: parsed || DEFAULT_PERMISSIONS });
  } catch (err: any) {
    return NextResponse.json({ permissions: DEFAULT_PERMISSIONS });
  }
}

export async function POST(req: Request) {
  try {
    const { permissions } = await req.json();
    const { error } = await supabaseAdmin.from('site_settings').upsert({
      key: 'admin_permissions',
      value: JSON.stringify(permissions),
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
