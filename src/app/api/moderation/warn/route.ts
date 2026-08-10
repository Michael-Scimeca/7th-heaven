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

export async function POST(req: Request) {
  try {
    // 1. Verify caller is crew or admin
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

    const { data: { user }, error: authError } = await (supabaseUser.auth as any).getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const admin = getAdmin();
    const { data: profileData } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const profile = profileData as { role: string } | null;

    if (!profile || !['crew', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden — crew or admin required.' }, { status: 403 });
    }

    // 2. Parse body
    let body: Record<string, any>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { target, room, action = 'warn', reason = 'No reason given' } = body;
    if (!target) {
      return NextResponse.json({ error: 'target is required.' }, { status: 400 });
    }

    // 3. Find profile by id, username, email, or full_name
    let targetProfile: any = null;
    
    // Test if target is a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(target)) {
      const { data } = await admin.from('profiles').select('id, email, full_name, username').eq('id', target).maybeSingle();
      if (data) targetProfile = data;
    }

    if (!targetProfile) {
      // Search email
      const { data } = await admin.from('profiles').select('id, email, full_name, username').eq('email', target).maybeSingle();
      if (data) targetProfile = data;
    }

    if (!targetProfile) {
      // Search username
      const { data } = await admin.from('profiles').select('id, email, full_name, username').eq('username', target).maybeSingle();
      if (data) targetProfile = data;
    }

    if (!targetProfile) {
      // Search full_name
      const { data } = await admin.from('profiles').select('id, email, full_name, username').eq('full_name', target).maybeSingle();
      if (data) targetProfile = data;
    }

    if (!targetProfile) {
      return NextResponse.json({ error: 'Target user profile not found.' }, { status: 404 });
    }

    // 4. Update the user profile
    const isWarned = action === 'warn';
    const { error: updateError } = await (admin as any)
      .from('profiles')
      .update({ is_warned: isWarned, updated_at: new Date().toISOString() })
      .eq('id', targetProfile.id);

    if (updateError) {
      throw updateError;
    }

    // 5. If a room is provided, insert a system warning message
    if (room && typeof room === 'string' && (room.startsWith('live_') || room.startsWith('cruise_'))) {
      const systemContent = isWarned
        ? `🛡️ Warning: ${targetProfile.username || targetProfile.full_name || 'A user'} has been warned by a moderator. Reason: ${reason}`
        : `🛡️ Warning removed: ${targetProfile.username || targetProfile.full_name || 'A user'} has been unwarned by a moderator.`;

      await (admin as any).from('chat_messages').insert({
        room,
        sender_name: 'System',
        sender_role: 'system',
        sender_avatar: '⚠️',
        content: systemContent,
      });
    }

    return NextResponse.json({
      success: true,
      userId: targetProfile.id,
      username: targetProfile.username || targetProfile.full_name,
      action
    });

  } catch (err: any) {
    console.error('[moderation/warn] Error:', err?.message ?? err);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}
