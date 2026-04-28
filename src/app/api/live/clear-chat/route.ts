import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/live/clear-chat
 * Deletes all chat_messages for a given room using the service role key
 * (bypasses RLS since the client-side anon key lacks DELETE permission).
 */
export async function POST(req: NextRequest) {
  try {
    const { room } = await req.json();
    if (!room) {
      return NextResponse.json({ error: 'Missing room' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error, count } = await supabase
      .from('chat_messages')
      .delete()
      .eq('room', room);

    if (error) {
      console.error('clear-chat error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted: count });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
