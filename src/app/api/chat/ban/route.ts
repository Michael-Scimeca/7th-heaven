import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/* ─────────────────────────────────────────────────────────
   Singleton admin client (service role — bypasses RLS)
   ───────────────────────────────────────────────────────── */
let _admin: ReturnType<typeof createClient> | null = null;
function getAdmin() {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
  }
  return _admin;
}

/* ─────────────────────────────────────────────────────────
   POST /api/chat/ban
   Body: { room, banned_name, reason?, duration_minutes? }
   
   Requires: caller must be crew or admin (session validated).
   Inserts a chat_bans row that blocks sender_name from
   sending messages in that room for duration_minutes
   (default: permanent / null expires_at).
   ───────────────────────────────────────────────────────── */
export async function POST(req: Request) {
  try {
    /* 1 ── Verify caller is crew or admin ── */
    const cookieStore = await cookies();
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Check role via admin client (bypass RLS)
    const admin = getAdmin();
    const { data: profileData } = await admin
      .from('profiles')
      .select('role, username')
      .eq('id', user.id)
      .single();

    const profile = profileData as { role: string; username?: string } | null;

    if (!profile || !['crew', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden — crew or admin required.' }, { status: 403 });
    }

    /* 2 ── Parse body ── */
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { room, banned_name, reason, duration_minutes } = body;

    if (typeof room !== 'string' || !room.startsWith('live_')) {
      return NextResponse.json({ error: 'Invalid room.' }, { status: 400 });
    }
    if (typeof banned_name !== 'string' || banned_name.trim().length === 0) {
      return NextResponse.json({ error: 'banned_name is required.' }, { status: 400 });
    }

    // Calculate expiry
    let expires_at: string | null = null;
    if (typeof duration_minutes === 'number' && duration_minutes > 0) {
      const exp = new Date(Date.now() + duration_minutes * 60 * 1000);
      expires_at = exp.toISOString();
    }

    /* 3 ── Upsert ban record ── */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbErr } = await (admin as any)
      .from('chat_bans')
      .upsert(
        {
          room:        room.trim().substring(0, 60),
          banned_name: banned_name.trim().substring(0, 30),
          banned_by:   profile.username ?? user.email ?? 'crew',
          reason:      typeof reason === 'string' ? reason.substring(0, 200) : 'No reason given',
          expires_at,
          created_at:  new Date().toISOString(),
        },
        { onConflict: 'room,banned_name' }   // update if already banned
      );

    if (dbErr) throw dbErr;

    return NextResponse.json({
      success: true,
      banned_name,
      room,
      expires_at: expires_at ?? 'permanent',
    });

  } catch (err: any) {
    console.error('[chat/ban] Error:', err?.message ?? err);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}
