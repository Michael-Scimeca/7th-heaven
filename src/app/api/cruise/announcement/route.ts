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
    const { message } = await req.json();
    
    // Explicitly handle empty messages or clear actions
    if (message === '' || message === null) {
      const { error: deleteError } = await supabase.from('site_settings').delete().eq('key', 'cruise_announcement');
      if (deleteError) {
        console.error('Delete error:', deleteError);
        return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: '' });
    }

    const { error } = await supabase.from('site_settings').upsert({
      key: 'cruise_announcement',
      value: JSON.stringify({ message, timestamp: new Date().toISOString() }),
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
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'cruise_announcement').single();
    if (!data?.value) return NextResponse.json({ message: '' });
    
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
    
    return NextResponse.json(parsed || { message: '' });
  } catch (err: any) {
    console.error('[API/cruise/announcement] GET Error:', err);
    return NextResponse.json({ message: '' });
  }
}
