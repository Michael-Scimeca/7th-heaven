import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type CruiseVideoItem = {
  id: string;
  title: string;
  category: string;
  url: string;
  poster?: string;
  description?: string;
  featured?: boolean;
  createdAt: string;
};

const DEFAULT_VIDEOS: CruiseVideoItem[] = [
  {
    id: 'vid-1',
    title: 'Star of the Seas — Official Ship Tour',
    category: 'Ship Tour',
    url: '/movie/cruise.mp4',
    poster: '/images/cruise-hero.png',
    description: 'Explore the world\'s largest cruise ship featuring 8 unique neighborhoods and groundbreaking entertainment.',
    featured: true,
    createdAt: '2026-07-01T00:00:00.000Z',
  },
  {
    id: 'vid-2',
    title: 'AquaDome & Pool Deck Experience',
    category: 'Entertainment',
    url: '/movie/ship-sea.mp4',
    poster: '/images/cruise/at-sea.png',
    description: 'Panoramic views of the high-energy pool deck, water slides, and evening shows at sea.',
    featured: false,
    createdAt: '2026-07-05T00:00:00.000Z',
  },
  {
    id: 'vid-3',
    title: 'Port Canaveral & Island Sail-Away',
    category: 'Destinations',
    url: '/movie/ship-port.mp4',
    poster: '/images/cruise/miami.png',
    description: 'Relive the excitement of sailing out of Port Canaveral towards CocoCay and the Caribbean.',
    featured: false,
    createdAt: '2026-07-10T00:00:00.000Z',
  },
];

export async function GET() {
  try {
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
