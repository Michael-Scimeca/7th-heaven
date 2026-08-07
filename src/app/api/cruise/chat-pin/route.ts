import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

const stripHtml = (str: string | null) => str ? str.replace(/<[^>]*>/g, '').trim() : null;

export async function GET() {
  // Fetch pin + chat enabled state + announcement in parallel
  const [pinResult, enabledResult, annResult] = await Promise.all([
    supabaseAdmin.from('site_settings').select('value').eq('key', 'cruise_chat_pin').single(),
    supabaseAdmin.from('site_settings').select('value').eq('key', 'cruise_chat_enabled').single(),
    supabaseAdmin.from('site_settings').select('value').eq('key', 'cruise_announcement').single(),
  ]);

  let effectivePin = pinResult.data?.value || null;
  if (!effectivePin && annResult.data?.value) {
    try {
      let parsed = annResult.data.value;
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      effectivePin = parsed?.message || (typeof parsed === 'string' ? parsed : null);
    } catch {
      effectivePin = typeof annResult.data.value === 'string' ? annResult.data.value : null;
    }
  }

  return NextResponse.json({
    pin: stripHtml(effectivePin),
    chatEnabled: enabledResult.data?.value !== 'false', // default to true
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  // Handle pin update
  if (body.pin !== undefined) {
    const cleanPin = stripHtml(body.pin) || '';

    await supabaseAdmin.from('site_settings').upsert(
      { key: 'cruise_chat_pin', value: cleanPin },
      { onConflict: 'key' }
    );
    // Also sync to cruise_announcement key for consistency across all widgets
    await supabaseAdmin.from('site_settings').upsert(
      { key: 'cruise_announcement', value: JSON.stringify({ message: cleanPin, timestamp: new Date().toISOString() }) },
      { onConflict: 'key' }
    );

    // Broadcast to clients listening on the chat room channel
    const channel = supabaseAdmin.channel('room_cruise_dashboard');
    await channel.send({
      type: 'broadcast',
      event: 'pin_update',
      payload: { pin: cleanPin || null }
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
