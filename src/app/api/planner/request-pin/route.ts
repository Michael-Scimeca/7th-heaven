import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { savePin } from '@/lib/pins';
import { sendEmail } from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function generatePin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function buildPinEmailHtml({ name, pin, email }: { name: string; pin: string; email: string }) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/planner/verify?email=${encodeURIComponent(email)}`;
  const digits = pin.split('');
  const digitBoxes = digits.map(d =>
    `<span style="display:inline-block;width:44px;height:56px;line-height:56px;text-align:center;font-size:26px;font-weight:900;color:#fff;background:rgba(255,10,61,0.12);border:2px solid rgba(255,10,61,0.4);border-radius:10px;margin:0 4px;">${d}</span>`
  ).join('');

  return `
  <div style="font-family:-apple-system,system-ui,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);">
    <div style="padding:40px 32px;text-align:center;background:linear-gradient(135deg,#1a0030,#0a0a0f);">
      <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:4px;color:#a855f7;font-weight:800;">7th Heaven Live</p>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;">Your Planner PIN 📋</h1>
      <p style="margin:0;color:rgba(255,255,255,0.4);font-size:14px;">Use this code to access your Planner Dashboard</p>
    </div>
    <div style="padding:36px 32px;text-align:center;">
      <p style="color:rgba(255,255,255,0.6);font-size:15px;margin:0 0 28px;">
        Hey <strong style="color:#fff;">${name}</strong>, here is your 6-digit verification code:
      </p>
      <div style="margin:0 auto 28px;">${digitBoxes}</div>
      <p style="color:rgba(255,255,255,0.35);font-size:13px;margin:0 0 28px;">
        ⏰ This PIN expires in <strong style="color:#fff;">10 minutes</strong>
      </p>
      <a href="${verifyUrl}" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:800;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 36px;border-radius:10px;">
        Enter PIN on Site →
      </a>
    </div>
    <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
      <p style="margin:0;color:rgba(255,255,255,0.2);font-size:11px;">
        If you didn't request this, ignore this email. © 7th Heaven Live
      </p>
    </div>
  </div>`;
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });

    const cleanEmail = email.toLowerCase().trim();

    // Validate the planner has an existing booking
    const { data: booking } = await supabase
      .from('bookings')
      .select('planner_name, booking_id')
      .eq('planner_email', cleanEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!booking) {
      return NextResponse.json(
        { error: 'No booking found for this email address. Please submit a booking request first.' },
        { status: 404 }
      );
    }

    const pin = generatePin();
    savePin(cleanEmail, pin);

    await sendEmail({
      to: cleanEmail,
      subject: '🔐 Your Planner Dashboard PIN — 7th Heaven',
      html: buildPinEmailHtml({
        name: booking.planner_name || 'Planner',
        pin,
        email: cleanEmail,
      }),
    });

    return NextResponse.json({ success: true, message: 'PIN sent to your email.' });
  } catch (err: any) {
    console.error('[planner/request-pin]', err);
    return NextResponse.json({ error: 'Failed to send PIN.' }, { status: 500 });
  }
}
