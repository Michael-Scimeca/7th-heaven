import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { links } = await req.json();
    
    const { error } = await supabase.from('site_settings').upsert({
      key: 'cruise_important_links',
      value: JSON.stringify(links || []),
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

    if (error) {
      console.error('Supabase upsert error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'cruise_important_links').single();
    if (!data?.value) return NextResponse.json({ links: [] });
    
    let parsed = data.value;
    let parseAttempts = 0;
    while (typeof parsed === 'string' && parseAttempts < 3) {
      try { 
        parsed = JSON.parse(parsed); 
        parseAttempts++;
      } catch (e) { 
        break; 
      }
    }
    
    return NextResponse.json({ links: Array.isArray(parsed) ? parsed : [] });
  } catch (err: any) {
    return NextResponse.json({ links: [] });
  }
}
