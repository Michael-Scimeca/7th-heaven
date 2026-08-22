import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { cruiseCommunityBlast } from '@/lib/email-templates';
import { requireAdmin, maskEmail } from '@/lib/api-utils';
import { publishToGroup } from '@/lib/ntfy';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

import { cleanWysiwygHtml } from '@/lib/wysiwyg-cleaner';

export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { subject, body, push = true } = await req.json();
    const cleanBody = cleanWysiwygHtml(body);

    if (!subject || !cleanBody) {
      return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 });
    }

    // Push notification (ntfy) — free, and independent of the email-signup
    // list below: it reaches whoever is subscribed to the cruise topic,
    // regardless of whether they've also given an email address.
    const pushResult = push
      ? await publishToGroup('cruise', {
          title: subject,
          message: cleanBody.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500),
          priority: 'default',
          tags: ['ship'],
        })
      : null;

    // Fetch all cruise signups & unsubscribed preferences
    const [{ data: signups, error }, { data: unsubscribedRecords }] = await Promise.all([
      supabase.from('cruise_signups').select('name, email').eq('cruise_notifications', true),
      supabase.from('newsletter_subscribers').select('email').eq('subscribed', false),
    ]);

    if (error) {
      throw error;
    }

    const unsubscribedSet = new Set((unsubscribedRecords || []).map(u => u.email.toLowerCase().trim()));
    const eligibleSignups = (signups || []).filter(s => s.email && !unsubscribedSet.has(s.email.toLowerCase().trim()));

    if (eligibleSignups.length === 0) {
      return NextResponse.json({ error: 'No eligible subscribers found', sent: 0, push: pushResult }, { status: 404 });
    }

    const html = cruiseCommunityBlast({ subject, body: cleanBody });

    // Send to all signups in parallel
    const blastResults = await Promise.all(eligibleSignups.map(async (signup) => {
      try {
        // Replace {{email}} placeholder for unsubscribe link
        const personalizedHtml = html.replace(/\{\{email\}\}/g, encodeURIComponent(signup.email));
        await sendEmail({
          to: signup.email,
          subject,
          html: personalizedHtml,
        });
        return { success: true };
      } catch (err: any) {
        return { success: false, error: `${maskEmail(signup.email)}: ${err.message}` };
      }
    }));

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const res of blastResults) {
      if (res.success) {
        sent++;
      } else {
        failed++;
        if (res.error) errors.push(res.error);
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: signups.length,
      errors: errors.length > 0 ? errors : undefined,
      push: pushResult,
    });
  } catch (err: any) {
    console.error('Cruise blast error:', err);
    return NextResponse.json({ error: err?.message || 'Blast failed' }, { status: 500 });
  }
}
