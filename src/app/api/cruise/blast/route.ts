import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { cruiseCommunityBlast } from '@/lib/email-templates';
import { requireAdmin, maskEmail } from '@/lib/api-utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

import { cleanWysiwygHtml } from '@/lib/wysiwyg-cleaner';

export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { subject, body } = await req.json();
    const cleanBody = cleanWysiwygHtml(body);

    if (!subject || !cleanBody) {
      return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 });
    }

    // Fetch all cruise signups & unsubscribed preferences
    const [{ data: signups, error }, { data: unsubscribedRecords }] = await Promise.all([
      supabase.from('cruise_signups').select('name, email'),
      supabase.from('newsletter_subscribers').select('email').eq('subscribed', false),
    ]);

    if (error) {
      throw error;
    }

    const unsubscribedSet = new Set((unsubscribedRecords || []).map(u => u.email.toLowerCase().trim()));
    const eligibleSignups = (signups || []).filter(s => s.email && !unsubscribedSet.has(s.email.toLowerCase().trim()));

    if (eligibleSignups.length === 0) {
      return NextResponse.json({ error: 'No eligible subscribers found', sent: 0 }, { status: 404 });
    }

    const html = cruiseCommunityBlast({ subject, body: cleanBody });

    // Send to all signups
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const signup of eligibleSignups) {
      try {
        // Replace {{email}} placeholder for unsubscribe link
        const personalizedHtml = html.replace(/\{\{email\}\}/g, encodeURIComponent(signup.email));
        await sendEmail({
          to: signup.email,
          subject,
          html: personalizedHtml,
        });
        sent++;
      } catch (err: any) {
        failed++;
        errors.push(`${maskEmail(signup.email)}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: signups.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error('Cruise blast error:', err);
    return NextResponse.json({ error: err?.message || 'Blast failed' }, { status: 500 });
  }
}
