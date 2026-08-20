import { Resend } from 'resend';

const resend = new Resend((typeof window === 'undefined' ? process.env.RESEND_API_KEY : undefined) || 're_dummy_key');

const UNSUBSCRIBE_BASE = 'https://7thheavenband.com/api/newsletter/unsubscribe';

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export function isPublicWebmailDomain(email?: string): boolean {
  if (!email) return true;
  return /@(aol|gmail|yahoo|hotmail|outlook|icloud|comcast)\.(com|net)$/i.test(email.trim());
}

export function getSendingFromEmail(email?: string): string {
  if (!email || isPublicWebmailDomain(email)) {
    return 'onboarding@resend.dev';
  }
  return email.trim();
}

export function buildUnsubscribeUrl(email: string): string {
  const encodedEmail = encodeURIComponent(email.toLowerCase().trim());
  return `${UNSUBSCRIBE_BASE}?email=${encodedEmail}`;
}

/**
 * CAN-SPAM compliant email sender.
 */
export async function sendEmail({ to, subject, html, replyTo }: EmailPayload) {
  try {
    const primaryRecipient = Array.isArray(to) ? to[0] : to;
    const encodedEmail = encodeURIComponent(primaryRecipient.toLowerCase().trim());

    // CAN-SPAM: Replace {{email}} placeholder with actual recipient email
    const personalizedHtml = html.replace(/\{\{email\}\}/g, encodedEmail);

    // CAN-SPAM: Build one-click unsubscribe URL for List-Unsubscribe header
    const unsubscribeUrl = buildUnsubscribeUrl(primaryRecipient);

    // If we don't have a real API key configured yet, log it to the console instead of throwing an error
    if (!process.env.RESEND_API_KEY) {
      console.log('--- DEVELOPMENT EMAIL MOCK ---');
      console.log(`To: ${Array.isArray(to) ? to.join(', ') : to}`);
      console.log(`Subject: ${subject}`);
      console.log(`List-Unsubscribe: <${unsubscribeUrl}>`);
      console.log(`Body: ${personalizedHtml.substring(0, 100)}...`);
      console.log('------------------------------');
      return { success: true, mock: true };
    }

    const rawFromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const verifiedFromAddress = getSendingFromEmail(rawFromAddress);

    let data = await resend.emails.send({
      from: `7th Heaven <${verifiedFromAddress}>`,
      to,
      replyTo,
      subject,
      html: personalizedHtml,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });

    // If Resend limits testing emails to account owner email in dev/unverified mode
    const resendRes: any = data;
    if (resendRes?.error) {
      const errMsg = typeof resendRes.error === 'string' ? resendRes.error : resendRes.error.message || JSON.stringify(resendRes.error);
      if (errMsg.includes('only send testing emails') || errMsg.includes('validation_error') || resendRes.error?.statusCode === 403) {
        console.warn('[Resend Test Mode Fallback]: Retrying send to account owner (mikeyscimeca.dev@gmail.com)...');
        data = await resend.emails.send({
          from: `7th Heaven <${verifiedFromAddress}>`,
          to: 'mikeyscimeca.dev@gmail.com',
          replyTo,
          subject: `[TEST - Original To: ${Array.isArray(to) ? to.join(', ') : to}] ${subject}`,
          html: personalizedHtml,
          headers: {
            'List-Unsubscribe': `<${unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        });
      }
    }

    const finalRes: any = data;
    if (finalRes?.error) {
      console.warn('[Resend API Warning]:', finalRes.error.message || finalRes.error);
      return { success: false, error: finalRes.error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
