/**
 * Booking Availability API
 * Returns confirmed booking dates so the calendar can block them.
 */
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('event_date')
      .eq('status', 'confirmed');

    if (error) throw error;

    const blockedDates = (data || [])
      .map(b => b.event_date)
      .filter(Boolean);

    return NextResponse.json({ blockedDates });
  } catch (err: any) {
    console.error('Availability API error:', err);
    return NextResponse.json({ blockedDates: [] });
  }
}
