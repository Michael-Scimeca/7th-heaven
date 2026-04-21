import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
 let supabaseResponse = NextResponse.next({ request });

 const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
   cookies: {
    getAll() {
     return request.cookies.getAll();
    },
    setAll(cookiesToSet) {
     cookiesToSet.forEach(({ name, value }) =>
      request.cookies.set(name, value)
     );
     supabaseResponse = NextResponse.next({ request });
     cookiesToSet.forEach(({ name, value, options }) =>
      supabaseResponse.cookies.set(name, value, options)
     );
    },
   },
  }
 );

 // Refresh the session — IMPORTANT: don't remove this
 const {
  data: { user },
 } = await supabase.auth.getUser();

 // Protect /members, /crew, /admin routes
 const path = request.nextUrl.pathname;

 // Note: Login redirect disabled until /login page is built.
 // The client-side role check in each page handles access gating for now.
 // if (!user && (path.startsWith('/members') || path.startsWith('/crew') || path.startsWith('/admin'))) {
 //  const url = request.nextUrl.clone();
 //  url.pathname = '/login';
 //  url.searchParams.set('redirect', path);
 //  return NextResponse.redirect(url);
 // }

 // Protect admin routes — check role from profile
 if (user && path.startsWith('/admin')) {
  const { data: profile } = await supabase
   .from('profiles')
   .select('role')
   .eq('id', user.id)
   .single();

  if (profile?.role !== 'admin') {
   return NextResponse.redirect(new URL('/members', request.url));
  }
 }

 // Protect crew routes
 if (user && path.startsWith('/crew')) {
  const { data: profile } = await supabase
   .from('profiles')
   .select('role')
   .eq('id', user.id)
   .single();

  if (!profile || !['crew', 'admin'].includes(profile.role)) {
   return NextResponse.redirect(new URL('/members', request.url));
  }
 }

 return supabaseResponse;
}
