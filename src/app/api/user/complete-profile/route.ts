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
      error: 'Unauthorized'
    }, {
      status: 401
    });
    const {
      data: profile
    } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    return NextResponse.json({
      profile
    });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message
    }, {
      status: 500
    });
  }
}
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({
      error: 'Unauthorized'
    }, {
      status: 401
    });
    const {
      username,
      notifications_enabled,
      zip,
      profile_completed,
      avatar_url
    } = await req.json();
    if (username) {
      const {
        data: existing
      } = await supabase.from('profiles').select('id').eq('username', username).neq('id', user.id).maybeSingle();
      if (existing) {
        return NextResponse.json({
          error: `Username "${username}" is already taken.`
        }, {
          status: 400
        });
      }
    }
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    if (username !== undefined) updates.username = username;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (notifications_enabled !== undefined) updates.notifications_enabled = notifications_enabled;
    if (zip !== undefined) updates.zip = zip;
    if (profile_completed !== undefined) updates.profile_completed = profile_completed;
    const {
      error
    } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (error) return NextResponse.json({
      error: error.message
    }, {
      status: 500
    });
    return NextResponse.json({
      success: true
    });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message
    }, {
      status: 500
    });
  }
}