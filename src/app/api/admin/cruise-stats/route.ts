import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('cruise_signups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    let total = 0;
    let adults = 0;
    let children = 0;

    const recentSignups: { name: string; email: string; phone: string; date: string; partySize: number }[] = [];

    for (const signup of data) {
      total += (signup.guest_count || 1);
      
      // Primary booker is assumed to be an adult
      adults += 1;

      recentSignups.push({
        name: signup.name || 'Unknown',
        email: signup.email || '',
        phone: signup.phone || '',
        date: new Date(signup.created_at).toLocaleDateString(),
        partySize: signup.guest_count || 1,
      });

      if (signup.notes && signup.notes.includes('Guest Details: [')) {
        try {
          const jsonStr = signup.notes.split('Guest Details: ')[1];
          const guests = JSON.parse(jsonStr);

          for (const guest of guests) {
            if (guest.type === 'child') {
              children += 1;
            } else {
              adults += 1;
            }
          }
        } catch (e) {
          // ignore parsing errors for individual rows
        }
      }
    }

    return NextResponse.json({
      total,
      adults,
      children,
      signups: data.length,
      recentSignups: recentSignups.slice(0, 10), // top 10 most recent
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
