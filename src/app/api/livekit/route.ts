import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export async function GET(req: NextRequest) {
 const room = req.nextUrl.searchParams.get('room') || '7h-live';
 const username = req.nextUrl.searchParams.get('username') || 'viewer';
 const isPublisher = req.nextUrl.searchParams.get('publish') === 'true';

 const apiKey = process.env.LIVEKIT_API_KEY;
 const apiSecret = process.env.LIVEKIT_API_SECRET;

 if (!apiKey || !apiSecret) {
  return NextResponse.json(
   { error: 'LiveKit credentials not configured. Add LIVEKIT_API_KEY and LIVEKIT_API_SECRET to .env.local' },
   { status: 500 }
  );
 }

 const at = new AccessToken(apiKey, apiSecret, {
  identity: username,
  name: username,
 });

 at.addGrant({
  roomJoin: true,
  room: room,
  canPublish: isPublisher,       // Only crew can publish video
  canSubscribe: true,             // Everyone can watch
  canPublishData: true,           // Everyone can send chat
 });

 const token = await at.toJwt();

 return NextResponse.json({
  token,
  url: process.env.NEXT_PUBLIC_LIVEKIT_URL,
  room,
 });
}
