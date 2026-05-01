import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { cruiseCommunityBlast } from '@/lib/email-templates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { subject, body } = await req.json();

    if (!subject || !body) {
      return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 });
    }

    // Fetch all cruise signups
    const { data: signups, error } = await supabase
      .from('cruise_signups')
      .select('name, email');

    if (error) {
      throw error;
    }

    if (!signups || signups.length === 0) {
      return NextResponse.json({ error: 'No cruise signups found' }, { status: 404 });
    }

    const html = cruiseCommunityBlast({ subject, body });

    // Send to all signups
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const signup of signups) {
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
        errors.push(`${signup.email}: ${err.message}`);
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
