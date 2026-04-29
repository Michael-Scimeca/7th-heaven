/**
 * Newsletter Subscribe API
 * Handles public email signups for the newsletter.
 */
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { applyRateLimit, getClientIp, isValidEmail, sanitizeText, isSpam } from '@/lib/api-utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const ip = await getClientIp();
    const rateLimited = await applyRateLimit(ip, "7h:newsletter", 10, "60 s");
    if (rateLimited) return rateLimited;

    let body: Record<string, unknown>;
    try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

    // Honeypot + timing spam check — silent drop
    if (isSpam(body)) return NextResponse.json({ success: true });

    const { email, name, source, userId } = body as Record<string, string>;

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const safeName = sanitizeText(name, 100);
    const safeSource = ['website', 'cruise', 'fan-dashboard', 'book', 'live'].includes(source) ? source : 'website';

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .upsert({
        email: email.toLowerCase().trim(),
        name: safeName,
        source: safeSource,
        user_id: userId || null,
        subscribed: true,
        unsubscribed_at: null,
      }, { onConflict: 'email' })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        await supabase
          .from('newsletter_subscribers')
          .update({ subscribed: true, unsubscribed_at: null, name: safeName })
          .eq('email', email.toLowerCase().trim());
        return NextResponse.json({ success: true, resubscribed: true });
      }
      throw error;
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: unknown) {
    console.error('Newsletter subscribe error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
