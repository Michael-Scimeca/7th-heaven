import { RoomServiceClient } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { roomName } = await req.json();

    if (!roomName) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl) {
      return NextResponse.json({ error: 'LiveKit configuration missing' }, { status: 500 });
    }

    const httpUrl = livekitUrl.replace('wss://', 'https://');
    const roomService = new RoomServiceClient(httpUrl, apiKey, apiSecret);
    
    // Explicitly delete the room to kick everyone out and remove it from the active list
    await roomService.deleteRoom(roomName);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('LiveKit room delete error:', error?.message || error);
    // Return success anyway if room already gone
    return NextResponse.json({ success: true });
  }
}
