import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const DEFAULT_CARIBBEAN_ITINERARY = [
  {
    id: "day1",
    dayLabel: "Day 1 · Sun Jan 10",
    location: "Port Canaveral, Florida (Orlando)",
    theme: "Welcome Aboard & Sail Away",
    colorTheme: "#06b6d4",
    events: [
      { id: "e1-1", time: "12:00 PM", title: "VIP Boarding & Check-In", subtitle: "Port Canaveral Terminal (Orlando)" },
      { id: "e1-2", time: "4:30 PM", title: "Ship Depart & Lido Deck Sail Away", subtitle: "Set sail with 7th Heaven live acoustic kick-off" },
      { id: "e1-3", time: "9:00 PM", title: "7th Heaven: The Classics Live", subtitle: "Main Theater — First full rock set!" },
    ]
  },
  {
    id: "day2",
    dayLabel: "Day 2 · Mon Jan 11",
    location: "Cococay, Bahamas (Private Island)",
    theme: "Private Island Beach Party",
    colorTheme: "#3b82f6",
    events: [
      { id: "e2-1", time: "7:00 AM", title: "Island Arrival & Docking", subtitle: "Disembark at Royal Caribbean's Private Island" },
      { id: "e2-2", time: "1:00 PM", title: "Oasis Lagoon Poolside Jam", subtitle: "Live band performance at freshwater pool" },
      { id: "e2-3", time: "4:00 PM", title: "All Aboard & Sunset Departure", subtitle: "Return to ship for evening dinner & show" },
    ]
  },
  {
    id: "day3",
    dayLabel: "Day 3 · Tue Jan 12",
    location: "Day At Sea",
    theme: "Rock & Roll At Sea",
    colorTheme: "#a855f7",
    events: [
      { id: "e3-1", time: "11:00 AM", title: "Band Q&A & Photo Session", subtitle: "Deck 11 Lounge — Meet all 7th Heaven members" },
      { id: "e3-2", time: "3:30 PM", title: "Poolside Acoustic Set", subtitle: "Lido Deck Main Stage" },
      { id: "e3-3", time: "10:00 PM", title: "Late Night 80s Rock Party", subtitle: "Main Theater Arena" },
    ]
  },
  {
    id: "day4",
    dayLabel: "Day 4 · Wed Jan 13",
    location: "St. Thomas",
    theme: "Virgin Islands Exploration",
    colorTheme: "#10b981",
    events: [
      { id: "e4-1", time: "12:30 PM", title: "Dock at St. Thomas", subtitle: "Explore Charlotte Amalie & Magens Bay" },
      { id: "e4-2", time: "6:00 PM", title: "St. Thomas Sunset Deck Hang", subtitle: "Enjoy island views from the upper deck" },
      { id: "e4-3", time: "8:00 PM", title: "Ship Departs St. Thomas", subtitle: "All aboard for evening concert" },
    ]
  },
  {
    id: "day5",
    dayLabel: "Day 5 · Thu Jan 14",
    location: "St. Maarten",
    theme: "Tropical Island Sunset",
    colorTheme: "#9333ea",
    events: [
      { id: "e5-1", time: "8:00 AM", title: "Dock at Philipsburg, St. Maarten", subtitle: "Maho Beach plane watching & shopping" },
      { id: "e5-2", time: "5:00 PM", title: "Ship Departs St. Maarten", subtitle: "Set sail for evening theater show" },
      { id: "e5-3", time: "9:00 PM", title: "7th Heaven Unplugged: Deep Cuts", subtitle: "Intimate acoustic theater performance" },
    ]
  },
  {
    id: "day6",
    dayLabel: "Day 6 · Fri Jan 15",
    location: "Day At Sea",
    theme: "Caribbean Cruising",
    colorTheme: "#ec4899",
    events: [
      { id: "e6-1", time: "1:00 PM", title: "Fan Rock Trivia & Prize Raffle", subtitle: "Win autographed merchandise & VIP passes" },
      { id: "e6-2", time: "4:00 PM", title: "Deck Party & Cocktail Hour", subtitle: "Poolside grooves with 7th Heaven" },
      { id: "e6-3", time: "9:30 PM", title: "Rock the Ocean Showcase", subtitle: "Main Deck Concert" },
    ]
  },
  {
    id: "day7",
    dayLabel: "Day 7 · Sat Jan 16",
    location: "Day At Sea",
    theme: "Grand Finale Celebration",
    colorTheme: "#8b5cf6",
    events: [
      { id: "e7-1", time: "2:00 PM", title: "Farewell Fan Photo & Autographs", subtitle: "Deck 5 Atrium" },
      { id: "e7-2", time: "9:00 PM", title: "7th Heaven Farewell Concert", subtitle: "Grand Theater — All the mega hits!" },
      { id: "e7-3", time: "11:30 PM", title: "After-Party Jam Session", subtitle: "Lounge 360" },
    ]
  },
  {
    id: "day8",
    dayLabel: "Day 8 · Sun Jan 17",
    location: "Port Canaveral, Florida (Orlando)",
    theme: "Disembarkation & Farewell",
    colorTheme: "#64748b",
    events: [
      { id: "e8-1", time: "6:00 AM", title: "Ship Arrives Port Canaveral", subtitle: "Docking at Orlando Cruise Terminal" },
      { id: "e8-2", time: "8:00 AM", title: "Farewell Breakfast & Disembarkation", subtitle: "Safe travels home — see you next voyage!" },
    ]
  }
];

export async function GET(req: Request) {
  try {
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'cruise_itinerary').single();
    if (!data?.value) return NextResponse.json(DEFAULT_CARIBBEAN_ITINERARY);
    
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
    
    if (Array.isArray(parsed) && parsed.length >= 8) {
      return NextResponse.json(parsed);
    }
    return NextResponse.json(DEFAULT_CARIBBEAN_ITINERARY);
  } catch (err: any) {
    console.error('[API/cruise/itinerary] GET Error:', err);
    return NextResponse.json(DEFAULT_CARIBBEAN_ITINERARY);
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
