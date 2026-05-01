/**
 * Newsletter Blast API
 * Sends a branded email to all registered fans.
 */
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { newsletterBlast } from '@/lib/email-templates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { subject, body } = await request.json();

    if (!subject || !body) {
      return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 });
    }

    // Get emails from both sources: fan accounts + newsletter subscribers
    const [{ data: fans }, { data: subscribers }] = await Promise.all([
      supabase.from('profiles').select('email').eq('role', 'fan'),
      supabase.from('newsletter_subscribers').select('email').eq('subscribed', true),
    ]);

    // Deduplicate
    const emailSet = new Set<string>();
    (fans || []).forEach(f => f.email && emailSet.add(f.email.toLowerCase()));
    (subscribers || []).forEach(s => s.email && emailSet.add(s.email.toLowerCase()));
    const emails = Array.from(emailSet);

    if (emails.length === 0) {
      return NextResponse.json({ error: 'No subscribers found', sent: 0 }, { status: 404 });
    }

    const baseHtml = newsletterBlast({ subject, body });
    const emailBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Send to each fan (batch)
    let sent = 0;
    let failed = 0;
    const batchSize = 10;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(email => {
          // Replace {{email}} placeholder with actual recipient for unsubscribe links
          const personalizedHtml = baseHtml.replace(/\{\{email\}\}/g, encodeURIComponent(email));
          return fetch(`${emailBaseUrl}/api/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: email, subject: `${subject} — 7th Heaven`, html: personalizedHtml }),
          }).then(r => r.ok ? 'ok' : 'fail');
         })
       );
      results.forEach(r => {
        if (r.status === 'fulfilled' && r.value === 'ok') sent++;
        else failed++;
      });
    }

    return NextResponse.json({ success: true, sent, failed, total: emails.length });
  } catch (err: any) {
    console.error('Newsletter blast error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
