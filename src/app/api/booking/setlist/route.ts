/**
 * Setlist Request API
 * Lets planners submit song requests after booking.
 */
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, name, songs, notes } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Filter out empty song entries
    const cleanSongs = (songs || []).filter((s: string) => s.trim());

    const { data, error } = await supabase
      .from('setlist_requests')
      .insert({
        booking_email: email.toLowerCase().trim(),
        booking_name: name || '',
        songs: cleanSongs,
        notes: notes || '',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error('Setlist request error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET — admin fetch all setlist requests
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('setlist_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ requests: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
