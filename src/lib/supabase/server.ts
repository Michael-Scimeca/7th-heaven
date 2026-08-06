import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function createClient() {
 const cookieStore = await cookies();

 return createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
   cookies: {
    getAll() {
     return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
     try {
      cookiesToSet.forEach(({ name, value, options }) =>
       cookieStore.set(name, value, options)
      );
     } catch {
      // The `setAll` method was called from a Server Component.
      // This can be ignored if you have middleware refreshing sessions.
     }
    },
   },
  }
 );
}

/**
 * Guard for admin-only server actions.
 * Reads the caller’s session from cookies and checks that their profiles.role
 * is ‘admin’. Throws if unauthenticated or insufficient role.
 */
export async function requireAdminSession(): Promise<{ userId: string }> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized: you must be signed in to perform this action.');
  }

  // Check the DB role (not just the JWT claim, which can be stale).
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Forbidden: admin role required.');
  }

  return { userId: user.id };
}

/**
 * Guard for crew-or-admin server actions.
 */
export async function requireCrewSession(): Promise<{ userId: string }> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized: you must be signed in to perform this action.');
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!['admin', 'crew'].includes(profile?.role ?? '')) {
    throw new Error('Forbidden: crew or admin role required.');
  }

  return { userId: user.id };
}
