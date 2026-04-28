import { Resend } from 'resend';

// We use process.env.RESEND_API_KEY. For local dev without a key, we log it.
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: EmailPayload) {
  try {
    // If we don't have a real API key configured yet, log it to the console instead of throwing an error
    if (!process.env.RESEND_API_KEY) {
      console.log('--- DEVELOPMENT EMAIL MOCK ---');
      console.log(`To: ${Array.isArray(to) ? to.join(', ') : to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${html.substring(0, 100)}...`);
      console.log('------------------------------');
      return { success: true, mock: true };
    }

    const fromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    const data = await resend.emails.send({
      from: `7th Heaven <${fromAddress}>`, // Change to noreply@7thheavenband.com after domain verification
      to,
      replyTo,
      subject,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
