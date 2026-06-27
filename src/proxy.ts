import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Protected route prefixes that need Supabase session refresh.
 * All other routes get an instant pass-through for maximum speed.
 */
const PROTECTED_PREFIXES = ['/admin', '/crew', '/fans', '/planner'];

export async function proxy(request: NextRequest) {
 const { pathname } = request.nextUrl;

 // Only run the (async) Supabase session check on protected routes
 if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
  return await updateSession(request);
 }

 // Public routes — fast pass-through, no Supabase round-trip
 return NextResponse.next();
}

export const config = {
 matcher: [
  /*
   * Match all request paths except:
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - public assets (images, etc.)
   */
  '/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
 ],
};
