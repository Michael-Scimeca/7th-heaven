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

  // Decode HTML entities and fix mis-encoded characters in track paths
  url = url
    .replace(/&apos;/g, '%27')   // HTML apostrophe → URL-encoded '
    .replace(/&quot;/g,  '%22')  // HTML quote entity → literal %22 (handled below)
    .replace(/&amp;/g,   '%26')
    .replace(/&lt;/g,    '%3C')
    .replace(/&gt;/g,    '%3E')
    .replace(/%22/g,     '%20'); // " used as space separator in track filenames → space

  // Only allow fetching from the band's domain
  if (!url.startsWith('https://7thheavenband.com/')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Forward Range header so the browser can seek and get duration
    const rangeHeader = request.headers.get('range');
    const upstreamHeaders: HeadersInit = {};
    if (rangeHeader) upstreamHeaders['Range'] = rangeHeader;

    const response = await fetch(url, { headers: upstreamHeaders });

    if (!response.ok && response.status !== 206) {
      return NextResponse.json({ error: 'Not found' }, { status: response.status });
    }

    // Forward key headers so the browser can determine duration and seek
    const headers: Record<string, string> = {
      'Content-Type':              response.headers.get('Content-Type')  ?? 'audio/mpeg',
      'Content-Disposition':       'inline',
      'Cache-Control':             'public, max-age=31536000, immutable',
      'Expires':                   'Thu, 31 Dec 2037 23:59:59 GMT',
      'X-Content-Type-Options':    'nosniff',
      'Accept-Ranges':             'bytes',
    };

    const contentLength = response.headers.get('Content-Length');
    if (contentLength) headers['Content-Length'] = contentLength;

    const contentRange = response.headers.get('Content-Range');
    if (contentRange) headers['Content-Range'] = contentRange;

    // Stream the body — no buffering, works with Range requests
    return new NextResponse(response.body, {
      status: response.status,
      headers,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
