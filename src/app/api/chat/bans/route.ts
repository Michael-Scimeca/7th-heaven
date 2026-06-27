import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
   GET /api/chat/bans?room=live_michael
   Returns all active bans for a room (non-expired).
   Used by crew dashboard to display the ban list.
   Public-readable (no auth) — names are display names,
   not any PII.
   ───────────────────────────────────────────────────────── */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const room = searchParams.get('room');

    if (!room || !room.startsWith('live_')) {
      return NextResponse.json({ error: 'Invalid room.' }, { status: 400 });
    }

    const admin = getAdmin();
    const now = new Date().toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (admin as any)
      .from('chat_bans')
      .select('banned_name, banned_by, reason, expires_at, created_at')
      .eq('room', room)
      .or(`expires_at.is.null,expires_at.gt.${now}`)   // null = permanent, or not yet expired
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ bans: data ?? [] });

  } catch (err: any) {
    console.error('[chat/bans] Error:', err?.message ?? err);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}
