import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    // Only allow internal requests (from our own API routes or server)
    const origin = request.headers.get('origin') || request.headers.get('referer') || '';
    const host = request.headers.get('host') || '';
    const isInternal = !origin || origin.includes(host) || origin.includes('localhost');
    if (!isInternal && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { to, subject, html } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required email fields' }, { status: 400 });
    }

    const result = await sendEmail({ to, subject, html });

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to send email via Resend');
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Email API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
