import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { count } = await supabaseAdmin.from('cruise_signups').select('*', { count: 'exact', head: true });
    let { data, error } = await supabaseAdmin.from('cruise_signups')
      .select('name,guest_count,anonymous,created_at')
      .order('created_at', { ascending: false });

    // Fallback if 'anonymous' column is missing (migration 010 not run yet)
    if (error && error.message.includes('anonymous')) {
      const fallback = await supabaseAdmin.from('cruise_signups')
        .select('name,guest_count,created_at')
        .order('created_at', { ascending: false });
      data = fallback.data as typeof data;
    }

    const totalGuests = (data || []).reduce((sum: number, r: any) => sum + (r.guest_count || 1), 0);

    return NextResponse.json({
      signupCount: count || 0,
      totalGuests,
      joinedFans: data || []
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
