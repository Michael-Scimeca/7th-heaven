/**
 * Cruise Email Blast API
 * Sends a branded email to selected cruise passengers.
 */
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-utils';

export async function POST(request: Request) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { subject, body, recipients } = await request.json();

    if (!subject || !body) {
      return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 });
    }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients selected' }, { status: 400 });
    }

    const emailBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Build a cruise-themed HTML email
    const html = `
      <div style="max-width:600px;margin:0 auto;background:#0a0a0f;color:#e2e8f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);">
        <div style="background:linear-gradient(135deg,#0e7490,#06b6d4);padding:32px 24px;text-align:center;">
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.6);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:3px;">7th Heaven Cruise</p>
          <h1 style="margin:0;font-size:24px;font-weight:900;color:#fff;font-style:italic;">${subject}</h1>
        </div>
        <div style="padding:32px 24px;font-size:15px;line-height:1.7;color:#cbd5e1;">
          ${body.replace(/\n/g, '<br/>')}
        </div>
        <div style="padding:16px 24px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);"> 7th Heaven Cruise — You're receiving this because you registered for the cruise.</p>
        </div>
      </div>
    `;

    let sent = 0;
    let failed = 0;
    const batchSize = 10;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map((email: string) =>
          fetch(`${emailBaseUrl}/api/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: email, subject: ` ${subject} — 7th Heaven Cruise`, html }),
          }).then(r => r.ok ? 'ok' : 'fail')
        )
      );
      results.forEach(r => {
        if (r.status === 'fulfilled' && r.value === 'ok') sent++;
        else failed++;
      });
    }

    return NextResponse.json({ success: true, sent, failed, total: recipients.length });
  } catch (err: any) {
    console.error('Cruise email blast error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
