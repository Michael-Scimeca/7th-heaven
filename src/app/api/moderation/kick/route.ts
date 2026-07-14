import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { sendEmail } from '@/lib/email';

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

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
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

    const { target, room } = body;
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

    // Protect crew/admins from being kicked
    const { data: targetRoleData } = await admin
      .from('profiles')
      .select('role')
      .eq('id', targetProfile.id)
      .single();
    
    if (targetRoleData && ['crew', 'admin'].includes((targetRoleData as any).role)) {
      return NextResponse.json({ error: 'Cannot kick other crew or administrators.' }, { status: 400 });
    }

    console.log(`[moderation/kick] Kicking fan: ${targetProfile.username} (${targetProfile.email})`);

    // 4. Send deactivation email
    if (targetProfile.email) {
      await sendEmail({
        to: targetProfile.email,
        subject: 'Account Terminated — 7th Heaven',
        html: `
          <div style="font-family: sans-serif; padding: 24px; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 12px; background: #ffffff; color: #1a1a1a;">
            <h2 style="color: #ef4444; margin-top: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Account Terminated</h2>
            <p>Hello <strong>${targetProfile.username || targetProfile.full_name || 'Fan'}</strong>,</p>
            <p>This email is to notify you that your 7th Heaven account has been permanently terminated and removed from our site due to bad behavior and violations of our community guidelines.</p>
            <p>Your user profile has been deleted, and your login credentials are no longer valid. You will not be able to log in or post comments.</p>
            <p style="color: #888888; font-size: 11px; border-top: 1px solid #eaeaea; padding-top: 12px; margin-top: 24px;">
              This is an automated security alert. Please keep all future interactions respectful.
            </p>
          </div>
        `
      });
    }

    // 5. Delete profile from database
    const { error: deleteProfileError } = await admin
      .from('profiles')
      .delete()
      .eq('id', targetProfile.id);

    if (deleteProfileError) {
      console.error('[moderation/kick] Profile delete error:', deleteProfileError.message);
    }

    // 6. Delete user from auth table
    const { error: deleteAuthError } = await admin.auth.admin.deleteUser(targetProfile.id);
    if (deleteAuthError) {
      console.error('[moderation/kick] Auth user delete error:', deleteAuthError.message);
    }

    // 7. Write system announcement into the target room chat
    if (room && typeof room === 'string') {
      await (admin as any).from('chat_messages').insert({
        room,
        sender_name: 'System',
        sender_role: 'system',
        sender_avatar: '🚪',
        content: `🚪 ${targetProfile.username || 'A user'} has been permanently kicked and removed from the site.`,
      });
    }

    return NextResponse.json({
      success: true,
      userId: targetProfile.id,
      username: targetProfile.username || targetProfile.full_name,
      email: targetProfile.email
    });

  } catch (err: any) {
    console.error('[moderation/kick] Error:', err?.message ?? err);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}
