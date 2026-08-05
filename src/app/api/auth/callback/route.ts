import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveInitialRole } from '@/lib/role-config';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/fans';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user) {
      const user = data.user;
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      let resolvedUsername = profile?.username;
      let isNewUser = false;

      if (!profile) {
        isNewUser = true;
        // Profile is missing, let's insert it
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        const email = user.email || '';
        
        // Auto-role assignment by email — lists are configured via ADMIN_EMAILS, CREW_EMAILS, etc. env vars
        const role = resolveInitialRole(email);

        // Base username suggestions
        const baseUsername = user.user_metadata?.username || fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20);
        resolvedUsername = baseUsername || `user_${Math.floor(Math.random() * 10000)}`;

        await supabase.from('profiles').insert({
          id: user.id,
          email: email.toLowerCase(),
          full_name: fullName,
          role: role,
          username: resolvedUsername,
          avatar_url: user.user_metadata?.avatar_url || null,
          date_of_birth: new Date(new Date().setFullYear(new Date().getFullYear() - 20)).toISOString().split('T')[0], // default adult DOB
          points: 0,
          tier: 'Bronze',
          shows_attended: 0,
          notifications_enabled: false,
          notification_radius: 25,
          profile_completed: false,
        });
      }
      
      // New OAuth users → complete profile page; returning users → dashboard
      if (isNewUser) {
        return NextResponse.redirect(`${origin}/fans/complete-profile`);
      }
      
      const finalRedirect = resolvedUsername ? `${origin}/fans/${resolvedUsername}` : `${origin}${next}`;
      return NextResponse.redirect(finalRedirect);
    }
  }

  // Return the user to home page on error
  return NextResponse.redirect(`${origin}/`);
}
