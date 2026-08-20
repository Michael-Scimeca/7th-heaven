import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch {
    return null;
  }
}

export type CruiseVideoItem = {
  id: string;
  title: string;
  category: string;
  url: string;
  youtubeId?: string;
  poster?: string;
  description?: string;
  featured?: boolean;
  createdAt: string;
};

const DEFAULT_VIDEOS: CruiseVideoItem[] = [
  {
    id: 'vid-cmc-1',
    title: 'Star of the Seas 2027 — Official Promo Video',
    category: 'Promo & Announcements',
    url: 'https://www.youtube.com/watch?v=vaMRyPbgAz4',
    youtubeId: 'vaMRyPbgAz4',
    poster: 'https://img.youtube.com/vi/vaMRyPbgAz4/hqdefault.jpg',
    description: 'Official promo video for the 2027 Chicago Music Cruise aboard Royal Caribbean\'s Star of the Seas (Jan 10, 2027).',
    featured: true,
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'vid-cmc-2',
    title: 'Pre-Cruise Speech — Oasis of the Seas (2025)',
    category: 'Pre-Cruise Speeches',
    url: 'https://www.youtube.com/watch?v=N3xFvQPXfqk',
    youtubeId: 'N3xFvQPXfqk',
    poster: 'https://img.youtube.com/vi/N3xFvQPXfqk/hqdefault.jpg',
    description: 'Exclusive pre-cruise address & announcements for Oasis of the Seas passengers (March 12, 2025).',
    featured: false,
    createdAt: '2025-03-12T00:00:00.000Z',
  },
  {
    id: 'vid-cmc-3',
    title: 'Pre-Cruise Speech — Icon of the Seas (2025)',
    category: 'Pre-Cruise Speeches',
    url: 'https://www.youtube.com/watch?v=P4j-2p-qLZE',
    youtubeId: 'P4j-2p-qLZE',
    poster: 'https://img.youtube.com/vi/P4j-2p-qLZE/hqdefault.jpg',
    description: 'Official pre-cruise briefing and group activity overview on Icon of the Seas (January 5, 2025).',
    featured: false,
    createdAt: '2025-01-05T00:00:00.000Z',
  },
  {
    id: 'vid-cmc-4',
    title: 'Pre-Cruise Speech — Wonder of the Seas (2023)',
    category: 'Pre-Cruise Speeches',
    url: 'https://www.youtube.com/watch?v=bduMR3nhxnA',
    youtubeId: 'bduMR3nhxnA',
    poster: 'https://img.youtube.com/vi/bduMR3nhxnA/hqdefault.jpg',
    description: 'Pre-cruise speech and band performance highlights aboard Wonder of the Seas (December 5, 2023).',
    featured: false,
    createdAt: '2023-12-05T00:00:00.000Z',
  },
  {
    id: 'vid-cmc-5',
    title: 'Pre-Cruise Speech — Wonder of the Seas (2022)',
    category: 'Pre-Cruise Speeches',
    url: 'https://www.youtube.com/watch?v=55C64kqfR9I',
    youtubeId: '55C64kqfR9I',
    poster: 'https://img.youtube.com/vi/55C64kqfR9I/hqdefault.jpg',
    description: 'Pre-cruise speech and itinerary preview for Wonder of the Seas (December 11, 2022).',
    featured: false,
    createdAt: '2022-12-11T00:00:00.000Z',
  },
  {
    id: 'vid-cmc-6',
    title: 'Pre-Cruise Video Cast — Wonder of the Seas (2022)',
    category: 'Behind the Scenes',
    url: 'https://www.youtube.com/watch?v=Tj-gK_g5g1I',
    youtubeId: 'Tj-gK_g5g1I',
    poster: 'https://img.youtube.com/vi/Tj-gK_g5g1I/hqdefault.jpg',
    description: 'Special video cast with band members previewing the upcoming cruise season (March 11, 2022).',
    featured: false,
    createdAt: '2022-03-11T00:00:00.000Z',
  },
  {
    id: 'vid-cmc-7',
    title: 'Pre-Cruise Speech — Allure of the Seas (2020)',
    category: 'Pre-Cruise Speeches',
    url: 'https://www.youtube.com/watch?v=If2QYmT7AV4',
    youtubeId: 'If2QYmT7AV4',
    poster: 'https://img.youtube.com/vi/If2QYmT7AV4/hqdefault.jpg',
    description: 'Pre-cruise speech for the 2020 Allure of the Seas Eastern Caribbean voyage (January 9, 2020).',
    featured: false,
    createdAt: '2020-01-09T00:00:00.000Z',
  },
  {
    id: 'vid-cmc-8',
    title: 'Chicago Music Cruise — Video Blog #2 (2019)',
    category: 'Vlogs & Recaps',
    url: 'https://www.youtube.com/watch?v=jXSyCd_siAA',
    youtubeId: 'jXSyCd_siAA',
    poster: 'https://img.youtube.com/vi/jXSyCd_siAA/hqdefault.jpg',
    description: 'Video blog recap detailing cruise preparations and concert schedules (April 2, 2019).',
    featured: false,
    createdAt: '2019-04-02T00:00:00.000Z',
  },
  {
    id: 'vid-cmc-9',
    title: 'Chicago Music Cruise — Video Blog #1 (2019)',
    category: 'Vlogs & Recaps',
    url: 'https://www.youtube.com/watch?v=88TOdJ24Re0',
    youtubeId: '88TOdJ24Re0',
    poster: 'https://img.youtube.com/vi/88TOdJ24Re0/hqdefault.jpg',
    description: 'Inaugural 2019 video blog with behind-the-scenes cruise announcements (March 5, 2019).',
    featured: false,
    createdAt: '2019-03-05T00:00:00.000Z',
  },
  {
    id: 'vid-cmc-10',
    title: 'Pre-Cruise Speech 2019 — Symphony of the Seas',
    category: 'Pre-Cruise Speeches',
    url: 'https://www.youtube.com/watch?v=6NJKIpsC7bs',
    youtubeId: '6NJKIpsC7bs',
    poster: 'https://img.youtube.com/vi/6NJKIpsC7bs/hqdefault.jpg',
    description: 'Full 2019 pre-cruise presentation for Symphony of the Seas passengers (January 15, 2019).',
    featured: false,
    createdAt: '2019-01-15T00:00:00.000Z',
  },
  {
    id: 'vid-cmc-11',
    title: 'Symphony of the Seas Highlights (2018)',
    category: 'Highlights & Recaps',
    url: 'https://www.youtube.com/watch?v=0KkOUuzNYcs',
    youtubeId: '0KkOUuzNYcs',
    poster: 'https://img.youtube.com/vi/0KkOUuzNYcs/hqdefault.jpg',
    description: 'Highlight reel from the historic Symphony of the Seas fan cruise (September 1, 2018).',
    featured: false,
    createdAt: '2018-09-01T00:00:00.000Z',
  },
  {
    id: 'vid-cmc-12',
    title: 'Pre-Cruise Speech 2018 — Liberty of the Seas',
    category: 'Pre-Cruise Speeches',
    url: 'https://www.youtube.com/watch?v=5nLO1fjBvmU',
    youtubeId: '5nLO1fjBvmU',
    poster: 'https://img.youtube.com/vi/5nLO1fjBvmU/hqdefault.jpg',
    description: 'Official 2018 pre-cruise speech and band lineup announcement.',
    featured: false,
    createdAt: '2018-01-01T00:00:00.000Z',
  },
];

export async function GET() {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ videos: DEFAULT_VIDEOS });
    }

    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'cruise_videos')
      .single();

    if (!data?.value) {
      return NextResponse.json({ videos: DEFAULT_VIDEOS });
    }

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

    const videos = Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_VIDEOS;
    return NextResponse.json({ videos });
  } catch (err: any) {
    return NextResponse.json({ videos: DEFAULT_VIDEOS });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database client unavailable' }, { status: 500 });
    }
    const body = await req.json();
    
    // Support adding a single video or saving full video array
    let updatedVideos: CruiseVideoItem[] = [];

    if (Array.isArray(body.videos)) {
      updatedVideos = body.videos;
    } else if (body.title && body.url) {
      // Fetch existing
      const getRes = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'cruise_videos')
        .single();
      
      let existing: CruiseVideoItem[] = DEFAULT_VIDEOS;
      if (getRes.data?.value) {
        let p = getRes.data.value;
        while (typeof p === 'string') {
          try { p = JSON.parse(p); } catch { break; }
        }
        if (Array.isArray(p)) existing = p;
      }

      const newVideo: CruiseVideoItem = {
        id: `vid-${Date.now()}`,
        title: body.title.trim(),
        category: body.category || 'Ship Tour',
        url: body.url.trim(),
        poster: body.poster || '/images/cruise-hero.png',
        description: body.description || '',
        featured: !!body.featured,
        createdAt: new Date().toISOString(),
      };

      updatedVideos = [newVideo, ...existing];
    } else {
      return NextResponse.json({ success: false, error: 'Missing title or video URL' }, { status: 400 });
    }

    const { error } = await supabase.from('site_settings').upsert({
      key: 'cruise_videos',
      value: JSON.stringify(updatedVideos),
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

    if (error) {
      console.error('Supabase video save error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, videos: updatedVideos });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database client unavailable' }, { status: 500 });
    }
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('id');

    if (!videoId) {
      return NextResponse.json({ success: false, error: 'Missing video ID' }, { status: 400 });
    }

    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'cruise_videos')
      .single();

    let existing: CruiseVideoItem[] = DEFAULT_VIDEOS;
    if (data?.value) {
      let p = data.value;
      while (typeof p === 'string') {
        try { p = JSON.parse(p); } catch { break; }
      }
      if (Array.isArray(p)) existing = p;
    }

    const updated = existing.filter(v => v.id !== videoId);

    const { error } = await supabase.from('site_settings').upsert({
      key: 'cruise_videos',
      value: JSON.stringify(updated),
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, videos: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
