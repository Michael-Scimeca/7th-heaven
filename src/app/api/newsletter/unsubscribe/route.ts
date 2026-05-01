/**
 * Newsletter Unsubscribe API
 * Handles unsubscribe requests from email links.
 * Supports both GET (from email link click) and POST.
 */
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET — one-click unsubscribe from email link
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return new Response(unsubscribePage('Missing email parameter.', false), {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const decodedEmail = decodeURIComponent(email).toLowerCase().trim();

    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ subscribed: false, unsubscribed_at: new Date().toISOString() })
      .eq('email', decodedEmail);

    if (error) {
      console.error('Unsubscribe error:', error);
      return new Response(unsubscribePage('Something went wrong. Please try again.', false), {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    return new Response(unsubscribePage(decodedEmail, true), {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (err: any) {
    console.error('Unsubscribe error:', err);
    return new Response(unsubscribePage('Server error. Please try again later.', false), {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

// POST — programmatic unsubscribe
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ subscribed: false, unsubscribed_at: new Date().toISOString() })
      .eq('email', email.toLowerCase().trim());

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Unsubscribe error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Branded unsubscribe confirmation page
function unsubscribePage(emailOrMessage: string, success: boolean): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Unsubscribed — 7th Heaven</title>
</head>
<body style="margin:0;padding:0;background:#050508;font-family:-apple-system,system-ui,'Segoe UI',Roboto,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;">
  <div style="max-width:480px;margin:40px auto;padding:48px 32px;text-align:center;">
    <p style="font-size:48px;margin:0 0 20px;">${success ? '✅' : '⚠️'}</p>
    <h1 style="margin:0 0 12px;color:#fff;font-size:24px;font-weight:900;">
      ${success ? 'Unsubscribed' : 'Oops'}
    </h1>
    <p style="margin:0 0 32px;color:rgba(255,255,255,0.5);font-size:15px;line-height:1.6;">
      ${success
        ? `<strong style="color:#fff;">${emailOrMessage}</strong> has been removed from our mailing list. You won't receive any more newsletters from us.`
        : emailOrMessage
      }
    </p>
    ${success ? `
      <p style="margin:0 0 24px;color:rgba(255,255,255,0.3);font-size:13px;">
        Changed your mind? You can always re-subscribe on our website.
      </p>
    ` : ''}
    <a href="https://7thheavenband.com" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:800;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 36px;border-radius:10px;">
      Back to 7th Heaven
    </a>
    <p style="margin:32px 0 0;color:rgba(255,255,255,0.15);font-size:11px;">
      © ${new Date().getFullYear()} 7th Heaven · Chicago, IL
    </p>
  </div>
</body>
</html>`;
}
