import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: Request) {
  try {
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'cruise_itinerary').single();
    if (!data?.value) return NextResponse.json([]);
    
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
    
    return NextResponse.json(parsed || []);
  } catch (err: any) {
    console.error('[API/cruise/itinerary] GET Error:', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itinerary } = body;

    const payloadString = JSON.stringify(itinerary);

    const { error } = await supabase.from('site_settings').upsert({
      key: 'cruise_itinerary',
      value: payloadString,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API/cruise/itinerary] POST Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
