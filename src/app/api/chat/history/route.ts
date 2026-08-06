import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const room = url.searchParams.get('room') || 'global';
    const limit = parseInt(url.searchParams.get('limit') || '80');
    const supabase = await createClient();
    const {
      data: messages
    } = await supabase.from('chat_messages').select('*').eq('room', room).order('created_at', {
      ascending: false
    }).limit(limit);
    return NextResponse.json({
      messages: (messages || []).reverse()
    });
  } catch (err: any) {
    return NextResponse.json({
      messages: []
    });
  }
}