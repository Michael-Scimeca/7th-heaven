import { NextResponse } from 'next/server';

// Mux API integration for live streaming
// Get credentials at: https://dashboard.mux.com/settings/access-tokens

const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID;
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET;
const MUX_API = 'https://api.mux.com/video/v1';

// Create a new live stream
export async function POST() {
 if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
  return NextResponse.json(
   { error: 'Mux credentials not configured. Add MUX_TOKEN_ID and MUX_TOKEN_SECRET to .env.local' },
   { status: 500 }
  );
 }

 const auth = Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64');

 const res = await fetch(`${MUX_API}/live-streams`, {
  method: 'POST',
  headers: {
   'Content-Type': 'application/json',
   'Authorization': `Basic ${auth}`,
  },
  body: JSON.stringify({
   playback_policy: ['public'],
   new_asset_settings: { playback_policy: ['public'] }, // Auto-create VOD
   reduced_latency: true,
   max_continuous_duration: 43200, // 12 hours max
  }),
 });

 if (!res.ok) {
  const err = await res.text();
  return NextResponse.json({ error: 'Mux API error', details: err }, { status: res.status });
 }

 const { data } = await res.json();

 return NextResponse.json({
  streamId: data.id,
  streamKey: data.stream_key,
  rtmpUrl: `rtmps://global-live.mux.com:443/app`,
  playbackId: data.playback_ids?.[0]?.id,
  hlsUrl: data.playback_ids?.[0]?.id
   ? `https://stream.mux.com/${data.playback_ids[0].id}.m3u8`
   : null,
  status: data.status,
 });
}

// Get active live streams
export async function GET() {
 if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
  return NextResponse.json({ error: 'Mux not configured', streams: [] });
 }

 const auth = Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64');

 const res = await fetch(`${MUX_API}/live-streams?status=active`, {
  headers: { 'Authorization': `Basic ${auth}` },
 });

 if (!res.ok) {
  return NextResponse.json({ error: 'Failed to fetch streams', streams: [] });
 }

 const { data } = await res.json();

 return NextResponse.json({
  streams: data.map((s: Record<string, unknown>) => ({
   id: s.id,
   status: s.status,
   playbackId: (s.playback_ids as { id: string }[])?.[0]?.id,
   hlsUrl: (s.playback_ids as { id: string }[])?.[0]?.id
    ? `https://stream.mux.com/${(s.playback_ids as { id: string }[])[0].id}.m3u8`
    : null,
  })),
 });
}
