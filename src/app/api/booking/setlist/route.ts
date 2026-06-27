/**
 * Setlist Request API
 * Lets planners submit song requests after booking.
 */
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { protectAction } from '@/lib/security';
import { isValidEmail, sanitizeName, sanitizeNotes } from '@/lib/validation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, name, songs, notes } = await request.json();

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const protection = await protectAction({ identifier: `setlist:${ip}` });
    if (!protection.success) {
      return NextResponse.json({ error: protection.error }, { status: protection.status as number });
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Filter out empty song entries and sanitize
    const cleanSongs = (songs || []).filter((s: string) => s.trim()).map((s: string) => sanitizeName(s, 200));

    const { data, error } = await supabase
      .from('setlist_requests')
      .insert({
        booking_email: email.toLowerCase().trim(),
        booking_name: sanitizeName(name),
        songs: cleanSongs,
        notes: sanitizeNotes(notes, 1000),
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
