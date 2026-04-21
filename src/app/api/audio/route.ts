import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('t');
  
  if (!token) {
    return NextResponse.json({ error: 'Missing parameter' }, { status: 400 });
  }

  // Decode the obfuscated URL
  let url: string;
  try {
    url = Buffer.from(token, 'base64').toString('utf-8');
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  // Only allow fetching from the band's domain
  if (!url.startsWith('https://7thheavenband.com/')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Not found' }, { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
