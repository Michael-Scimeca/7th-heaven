/**
 * Setlist Request API
 * Lets planners submit song requests after booking.
 */
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { protectAction } from '@/lib/security';
import { isValidEmail, sanitizeName, sanitizeNotes } from '@/lib/validation';
import { isSpam } from '@/lib/api-utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    // Capture raw body before destructuring so isSpam can inspect _hp and _t fields
    const body = await request.json();
    const { email, name, songs, notes } = body;

    // Full-body spam check (no honeypot was previously wired here at all)
    if (isSpam(body)) {
      return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
    }

    // Rate limiting — 5 setlist submissions per IP per hour
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    const protection = await protectAction({
      identifier: `setlist:${ip}`,
      requests: 5,
      windowDuration: '60 m',
    });
    if (!protection.success) {
      return NextResponse.json({ error: protection.error }, { status: protection.status as number });
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Filter out empty song entries and sanitize
    const cleanSongs = (songs || []).flatMap((s: string) => s.trim() ? [sanitizeName(s, 200)] : []);

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
