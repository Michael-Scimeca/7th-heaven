import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyPin } from '@/lib/pins';
import { sendEmail } from '@/lib/email';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const { email, pin } = await req.json();

    if (!email || !pin) {
      return NextResponse.json({ error: 'Email and PIN are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Verify the PIN
    const isValid = verifyPin(cleanEmail, pin);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired verification code.' }, { status: 400 });
    }

    // 2. Look up the cruise signup record to get the person's name + signup details
    const { data: signup } = await supabase
      .from('cruise_signups')
      .select('id, name, guest_count, cancel_token')
      .eq('email', cleanEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const name = signup?.name || 'Cruise Passenger';

    // 3. Create or update Supabase auth user as a cruise member
    // Try to create a new user first; if they already exist, update their profile
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === cleanEmail);

    let userId: string | null = null;

    if (existingUser) {
      userId = existingUser.id;
      // Update their role to include cruise access
      await supabase.from('profiles').update({
        cruise_signup_id: signup?.id,
        signup_source: 'cruise_verified',
        updated_at: new Date().toISOString(),
      }).eq('id', userId);
    } else {
      // Create a new auto-confirmed user (no password — they'll use magic link / Sign In)
      const tempPassword = crypto.randomBytes(12).toString('hex') + '!7A';
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          role: 'cruise',
          cruise_signup_id: signup?.id,
          source: 'cruise_verified',
        },
      });
      if (createError) {
        console.error('Failed to create cruise member account:', createError.message);
        // Non-fatal — still send confirmation email
      } else {
        userId = newUser.user.id;
        // Update profile record with cruise role
        if (userId) {
          await supabase.from('profiles').update({
            role: 'cruise',
            cruise_signup_id: signup?.id,
            signup_source: 'cruise_verified',
            updated_at: new Date().toISOString(),
          }).eq('id', userId);
        }
      }
    }

    // 4a. Generate a magic link so the client can auto-login without a password
    let magicRedirectUrl: string | null = null;
    try {
      const { data: linkData } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: cleanEmail,
        options: {
          redirectTo: `${SITE_URL}/cruise/dashboard`,
        },
      });
      magicRedirectUrl = (linkData as any)?.properties?.action_link ?? null;
    } catch (linkErr) {
      console.error('Magic link generation failed (non-fatal):', linkErr);
    }

    // 4. Send the cruise confirmation email ("You're on the List!")
    const cancelUrl = signup?.cancel_token
      ? `${SITE_URL}/cruise/cancel?token=${signup.cancel_token}`
      : `${SITE_URL}/cruise`;

    const confirmHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:48px 24px;">
    <p style="margin:0 0 4px;color:rgba(255,255,255,0.4);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:3px;text-align:center;">7th Heaven Cruise</p>
    <h1 style="margin:0 0 8px;color:#fff;font-size:32px;font-weight:900;text-align:center;">🚢 You're on the List!</h1>
    <p style="margin:0 0 32px;color:rgba(255,255,255,0.5);font-size:15px;line-height:1.6;text-align:center;">
      Hey ${name}, your email is confirmed and your Cruise Member account is active. Welcome aboard the 7th Heaven Caribbean Cruise!
    </p>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:40px;">
      <a href="${SITE_URL}/cruise/dashboard"
         style="display:inline-block;padding:14px 36px;background:#22d3ee;color:#0a0a0f;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:2px;border-radius:10px;text-decoration:none;">
        Access Cruise Hub →
      </a>
    </div>

    <!-- Info block -->
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:24px;margin-bottom:32px;">
      <p style="margin:0 0 6px;color:rgba(255,255,255,0.3);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">What's Next</p>
      <ul style="margin:0;padding-left:20px;color:rgba(255,255,255,0.6);font-size:14px;line-height:2;">
        <li>Complete your cabin booking via the travel portal</li>
        <li>Access the Passenger Lounge for setlist voting &amp; deck maps</li>
        <li>Connect with other passengers before we set sail</li>
      </ul>
    </div>

    <p style="margin:0 0 4px;color:rgba(255,255,255,0.2);font-size:11px;text-align:center;">
      Changed your mind? <a href="${cancelUrl}" style="color:rgba(255,255,255,0.4);text-decoration:underline;">Cancel your signup</a>
    </p>
    <p style="margin:0;color:rgba(255,255,255,0.15);font-size:11px;text-align:center;">7th Heaven · Chicago, IL</p>
  </div>
</body>
</html>`;

    await sendEmail({
      to: cleanEmail,
      subject: '🚢 You\'re Confirmed — Welcome to the 7th Heaven Cruise Hub!',
      html: confirmHtml,
    });

    return NextResponse.json({ success: true, redirectUrl: magicRedirectUrl });
  } catch (err: any) {
    console.error('Cruise verify-pin error:', err);
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
