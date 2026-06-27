import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-utils';
import { savePin } from '@/lib/pins';
import { sendEmail } from '@/lib/email';
import { fanInvitation } from '@/lib/email-templates';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // 1. Authorize Admin
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { invites } = await request.json();

    if (!invites || !Array.isArray(invites)) {
      return NextResponse.json({ error: 'Invites array is required' }, { status: 400 });
    }

    const results = {
      successCount: 0,
      failedCount: 0,
      failures: [] as { email: string; error: string }[],
    };

    // 2. Loop over invites and process sequentially
    for (const invite of invites) {
      const email = invite.email?.toLowerCase().trim();
      const name = invite.name?.trim();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        results.failedCount++;
        results.failures.push({ email: email || 'N/A', error: 'Invalid email address format' });
        continue;
      }

      // Generate verification PIN (6 digits)
      const pin = Math.floor(100000 + Math.random() * 900000).toString();

      // Save PIN with a longer 7-day expiration (in milliseconds)
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      savePin(email, pin, sevenDaysMs);

      // Render invitation HTML
      const emailHtml = fanInvitation({ name, email, pin });

      // Send the email invite
      const emailResult = await sendEmail({
        to: email,
        subject: "🎸 You're Invited to the 7th Heaven Fan Club!",
        html: emailHtml,
      });

      if (emailResult.success) {
        results.successCount++;
        if (emailResult.mock) {
          // Write to console in development
          console.log(`[CSV Invite] Verification code for ${email} is ${pin}`);
        }
      } else {
        results.failedCount++;
        results.failures.push({ email, error: (emailResult.error as any)?.message || 'Email delivery failed' });
      }
    }

    return NextResponse.json({ success: true, ...results });
  } catch (error: any) {
    console.error('Bulk Invite API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
