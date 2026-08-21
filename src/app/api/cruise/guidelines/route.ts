import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_GUIDELINES = {
  title: "Cruise Information & Guidelines",
  subtitle: "Cruiser Welcome Pack",
  content: `<p>Welcome to the official 7th Heaven Cruise Passenger Portal! We are absolutely thrilled to have you join us for this one-of-a-kind rock-and-roll voyage. This portal is your exclusive gateway to everything happening during our journey, designed to keep you connected with the band, the crew, and your fellow passengers from the moment you book until we return to port.</p><p>As we prepare to embark, make sure you review the official <a href="/cruise">travel check-list</a> and itinerary details. From shipboard safety drills to themed concert nights, staying informed ensures you won't miss a single beat of the action. Keep an eye on the Captain's Log and priority updates above for any real-time adjustments or exciting announcements from the band.</p><p>Onboard entertainment is the heart of the 7th Heaven cruise experience. We have a stellar lineup of main stage concert performances, intimate acoustic lounge sets, Q&A sessions, and exclusive deck parties scheduled throughout the trip. Be sure to check the <a href="#itinerary">official itinerary schedule</a> below to plan your days and nights around these highlight events.</p><p>Beyond the music, this cruise offers incredible opportunities to explore beautiful tropical destinations, coordinate group excursions, and participate in fun community activities. Whether you are relaxing by the pool, dining with friends, or exploring local ports of call, there is always something exciting to do with the 7th Heaven community.</p><p>Lastly, don't forget to use the Passenger Lounge Chat on the right to introduce yourself, coordinate plans, and share your excitement! Connecting with other fans before and during the cruise is a huge part of what makes this trip so special. We can't wait to see you onboard and rock the high seas together!</p>`
};

import { cleanWysiwygHtml } from '@/lib/wysiwyg-cleaner';

export async function GET() {
  try {
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'cruise_guidelines').single();
    if (!data?.value) return NextResponse.json(DEFAULT_GUIDELINES);
    
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
    
    if (parsed && typeof parsed === 'object' && parsed.content) {
      parsed.content = cleanWysiwygHtml(parsed.content);
    }
    
    return NextResponse.json(parsed || DEFAULT_GUIDELINES);
  } catch (err: any) {
    return NextResponse.json(DEFAULT_GUIDELINES);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, subtitle, content } = body;
    
    const valueToSave = JSON.stringify({
      title: title || DEFAULT_GUIDELINES.title,
      subtitle: subtitle || DEFAULT_GUIDELINES.subtitle,
      content: cleanWysiwygHtml(content || DEFAULT_GUIDELINES.content),
      updated_at: new Date().toISOString()
    });

    const { error } = await supabase.from('site_settings').upsert({
      key: 'cruise_guidelines',
      value: valueToSave,
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
