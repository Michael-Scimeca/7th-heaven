import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({
      profile: null
    });
    const {
      data: profile
    } = await supabase.from('profiles').select('role, username, points, tier, shows_attended, notifications_enabled, notification_radius, cruise_signup_id, signup_source, is_banned, is_warned').eq('id', user.id).single();
    return NextResponse.json({
      profile: profile || null
    });
  } catch (err: any) {
    return NextResponse.json({
      profile: null
    });
  }
}