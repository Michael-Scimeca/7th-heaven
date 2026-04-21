import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { youtubeId, title, year, duration, description } = await req.json();

    if (!youtubeId || !title) {
      return NextResponse.json({ error: 'youtubeId and title are required.' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', 'data', 'videos.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    const categories: any[] = JSON.parse(raw);

    // Find or create the "Live Feeds" category
    let liveFeedsCategory = categories.find((c: any) => c.category === 'Live Feeds');
    if (!liveFeedsCategory) {
      liveFeedsCategory = { category: 'Live Feeds', videos: [] };
      categories.push(liveFeedsCategory);
    }

    // Avoid duplicate video IDs
    const alreadyExists = liveFeedsCategory.videos.some((v: any) => v.id === youtubeId);
    if (alreadyExists) {
      return NextResponse.json({ success: true, message: 'Video already exists in Live Feeds.' });
    }

    // Prepend this new archived feed so it appears at the top of the gallery
    liveFeedsCategory.videos.unshift({
      id: youtubeId,
      title: title,
      year: year || new Date().getFullYear(),
      duration: duration || '',
      description: description || '7th heaven — Live Feed Archive',
      viewCount: '0',
    });

    fs.writeFileSync(filePath, JSON.stringify(categories, null, 2), 'utf8');

    return NextResponse.json({ success: true, message: `"${title}" successfully saved to Live Feeds gallery.` });
  } catch (error: any) {
    console.error('[archive route error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
