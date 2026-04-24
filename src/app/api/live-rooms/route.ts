import { NextResponse } from 'next/server';
import { RoomServiceClient } from 'livekit-server-sdk';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !livekitUrl) {
    return NextResponse.json({ rooms: [], error: 'LiveKit not configured' });
  }

  try {
    // Convert wss:// URL to https:// for the REST API
    const httpUrl = livekitUrl.replace('wss://', 'https://');
    const roomService = new RoomServiceClient(httpUrl, apiKey, apiSecret);
    const rooms = await roomService.listRooms();

    const activeRooms = rooms.map((room) => ({
      name: room.name,
      numParticipants: room.numParticipants,
      creationTime: Number(room.creationTime),
    }));

    return NextResponse.json({ rooms: activeRooms });
  } catch (error: any) {
    console.error('LiveKit room list error:', error?.message || error);
    return NextResponse.json({ rooms: [], error: 'Failed to fetch rooms' });
  }
}
