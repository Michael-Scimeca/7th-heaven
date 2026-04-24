import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST() {
  // Update all live_streams rows that are currently live
  const { error } = await supabase
    .from('live_streams')
    .update({ status: 'ended' })
    .eq('status', 'live');

  if (error) {
    console.error('Failed to close live streams', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  // Optionally, clear any legacy localStorage flags client‑side via response header
  // (the frontend can clear them after a successful call).
  return NextResponse.json({ success: true });
}
