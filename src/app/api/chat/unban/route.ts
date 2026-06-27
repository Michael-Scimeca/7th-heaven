import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

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
   POST /api/chat/unban
   Body: { room, banned_name }
   Requires: crew or admin session.
   Deletes the chat_bans row — fan can message again.
   ───────────────────────────────────────────────────────── */
export async function POST(req: Request) {
  try {
    /* 1 ── Auth check ── */
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

    const admin = getAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profileData } = await (admin as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    const profile = profileData as { role: string } | null;

    if (!profile || !['crew', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    /* 2 ── Parse body ── */
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { room, banned_name } = body;

    if (typeof room !== 'string' || typeof banned_name !== 'string') {
      return NextResponse.json({ error: 'room and banned_name are required.' }, { status: 400 });
    }

    /* 3 ── Delete ban row ── */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbErr } = await (admin as any)
      .from('chat_bans')
      .delete()
      .eq('room', room.trim())
      .eq('banned_name', banned_name.trim());

    if (dbErr) throw dbErr;

    return NextResponse.json({ success: true, unbanned: banned_name });

  } catch (err: any) {
    console.error('[chat/unban] Error:', err?.message ?? err);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}
