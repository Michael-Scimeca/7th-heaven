/**
 * Newsletter Subscribe API
 * Handles public email signups for the newsletter.
 */
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, name, source, userId } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Upsert — if they already exist, just update subscribed to true
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .upsert({
        email: email.toLowerCase().trim(),
        name: name || '',
        source: source || 'website',
        user_id: userId || null,
        subscribed: true,
        unsubscribed_at: null,
      }, { onConflict: 'email' })
      .select()
      .single();

    if (error) {
      // If upsert fails due to unique constraint, try update
      if (error.code === '23505') {
        await supabase
          .from('newsletter_subscribers')
          .update({ subscribed: true, unsubscribed_at: null, name: name || '' })
          .eq('email', email.toLowerCase().trim());
        return NextResponse.json({ success: true, resubscribed: true });
      }
      throw error;
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error('Newsletter subscribe error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
