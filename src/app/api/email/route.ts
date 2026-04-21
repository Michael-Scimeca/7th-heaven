import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required email fields' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      // Stub email sending if no API key is provided
      console.log('\n==============================');
      console.log('📧 INTERCEPTED OUTBOUND EMAIL');
      console.log('==============================');
      console.log(`TO:      ${to}`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`HTML Body:`);
      console.log(html);
      console.log('==============================\n');
      console.log('(To send real emails, add RESEND_API_KEY to your .env.local file)');

      return NextResponse.json({ success: true, simulated: true });
    }

    // Call Resend API using standard fetch
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: '7th Heaven Live <updates@7thheavenband.com>',
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email via Resend');
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error: any) {
    console.error('Email API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
