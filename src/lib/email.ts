import { Resend } from 'resend';

const resend = new Resend((typeof window === 'undefined' ? process.env.RESEND_API_KEY : undefined) || 're_dummy_key');

const UNSUBSCRIBE_BASE = 'https://7thheavenband.com/api/newsletter/unsubscribe';

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * CAN-SPAM compliant email sender.
 *
 * Automatically:
 * 1. Replaces {{email}} placeholder in unsubscribe URLs with the actual recipient
 * 2. Adds RFC 8058 List-Unsubscribe + List-Unsubscribe-Post headers
 *    (enables native "Unsubscribe" button in Gmail, Outlook, Apple Mail)
 */
export async function sendEmail({ to, subject, html, replyTo }: EmailPayload) {
  try {
    // Resolve the primary recipient for personalization
    const primaryRecipient = Array.isArray(to) ? to[0] : to;
    const encodedEmail = encodeURIComponent(primaryRecipient.toLowerCase().trim());

    // CAN-SPAM: Replace {{email}} placeholder with actual recipient email
    const personalizedHtml = html.replace(/\{\{email\}\}/g, encodedEmail);

    // CAN-SPAM: Build one-click unsubscribe URL for List-Unsubscribe header
    const unsubscribeUrl = `${UNSUBSCRIBE_BASE}?email=${encodedEmail}`;

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

    let fromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    
    // Resend requires a verified custom domain or their default onboarding domain (onboarding@resend.dev).
    // Public webmail domains (aol.com, gmail.com, yahoo.com, hotmail.com) cannot be verified on Resend and trigger a 403.
    const isUnverifiedPublicDomain = /@(aol|gmail|yahoo|hotmail|outlook|icloud)\.com$/i.test(fromAddress.trim());
    if (isUnverifiedPublicDomain) {
      fromAddress = 'onboarding@resend.dev';
    }

    const data = await resend.emails.send({
      from: `7th Heaven <${fromAddress}>`, // Change to noreply@7thheavenband.com after domain verification
      to,
      replyTo,
      subject,
      html: personalizedHtml,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

