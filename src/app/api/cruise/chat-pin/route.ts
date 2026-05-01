import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  // Fetch pin + chat enabled state in parallel
  const [pinResult, enabledResult] = await Promise.all([
    supabaseAdmin.from('site_settings').select('value').eq('key', 'cruise_chat_pin').single(),
    supabaseAdmin.from('site_settings').select('value').eq('key', 'cruise_chat_enabled').single(),
  ]);

  return NextResponse.json({
    pin: pinResult.data?.value || null,
    chatEnabled: enabledResult.data?.value !== 'false', // default to true
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  // Handle pin update
  if (body.pin !== undefined) {
    await supabaseAdmin.from('site_settings').upsert(
      { key: 'cruise_chat_pin', value: body.pin || '' },
      { onConflict: 'key' }
    );

    // Broadcast to clients listening on the chat room channel
    const channel = supabaseAdmin.channel('room_cruise_dashboard');
    await channel.send({
      type: 'broadcast',
      event: 'pin_update',
      payload: { pin: body.pin || null }
    });
    await supabaseAdmin.removeChannel(channel);
  }

  // Handle chat enabled/disabled toggle
  if (body.chatEnabled !== undefined) {
    await supabaseAdmin.from('site_settings').upsert(
      { key: 'cruise_chat_enabled', value: String(body.chatEnabled) },
      { onConflict: 'key' }
    );

    // Broadcast chat enabled state to all connected clients
    const channel = supabaseAdmin.channel('room_cruise_dashboard');
    await channel.send({
      type: 'broadcast',
      event: 'chat_toggle',
      payload: { chatEnabled: body.chatEnabled }
    });
    await supabaseAdmin.removeChannel(channel);
  }

  return NextResponse.json({ success: true });
}
