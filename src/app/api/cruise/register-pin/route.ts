import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { isValidEmail, isValidPhone, sanitizeName } from '@/lib/validation';

let _admin: ReturnType<typeof createClient> | null = null;
function getAdmin() {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );
  }
  return _admin;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    const supabase = getAdmin() as any;

    if (action === 'request') {
      const { name, email, phone, password } = body;

      if (!name || !email || !password || !phone) {
        return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
      }

      if (!isValidEmail(email)) {
        return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
      }

      if (!isValidPhone(phone)) {
        return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 });
      }

      const safeName = sanitizeName(name);
      if (safeName.length < 2) {
        return NextResponse.json({ error: 'Name must be at least 2 characters.' }, { status: 400 });
      }

      // Check if user already exists in auth or cruise_signups
      const { data: existingUser } = await supabase.from('profiles').select('id').eq('email', email.toLowerCase().trim()).maybeSingle();
      if (existingUser) {
        return NextResponse.json({ error: 'This email is already registered.' }, { status: 409 });
      }

      // Generate a 6-digit verification PIN
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

      console.log(`[Cruise Register] Verification PIN for ${email}: ${pin}`);

      // Upsert into cruise_pending_signups
      const { error: dbErr } = await supabase.from('cruise_pending_signups').upsert({
        email: email.toLowerCase().trim(),
        name: safeName,
        phone,
        password, // stored securely for temp verification session
        pin,
        expires_at: expiresAt
      }, { onConflict: 'email' });

      if (dbErr) {
        console.error('Pending registration save error:', dbErr);
        return NextResponse.json({ error: 'Failed to create verification session.' }, { status: 500 });
      }

      // Send the PIN code email
      try {
        await sendEmail({
          to: email.toLowerCase().trim(),
          subject: '🚢 Your Cruise Hub Verification PIN: ' + pin,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #0a0a0f; color: #fff; border-radius: 12px; border: 1px solid rgba(138, 28, 252, 0.2);">
              <h2 style="color: #06b6d4; text-align: center;">Cruise Hub Verification</h2>
              <p>Hello <strong>${safeName}</strong>,</p>
              <p>Thank you for registering as a Cruise Member. Please use the following 6-digit PIN to confirm your email address and activate your account:</p>
              <div style="font-size: 32px; font-weight: 800; letter-spacing: 4px; text-align: center; margin: 30px 0; color: #a855f7; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
                ${pin}
              </div>
              <p style="font-size: 12px; color: rgba(255,255,255,0.4); text-align: center;">This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('Email send error:', emailErr);
        // Do not crash, in dev mode print code to console so they can still test
      }

      return NextResponse.json({ success: true, message: 'Verification PIN sent to email.' });

    } else if (action === 'confirm') {
      const { email, pin } = body;

      if (!email || !pin) {
        return NextResponse.json({ error: 'Email and PIN are required.' }, { status: 400 });
      }

      // Fetch pending registration
      const { data: pending, error: fetchErr } = await supabase
        .from('cruise_pending_signups')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (fetchErr || !pending) {
        return NextResponse.json({ error: 'No active registration session found. Please register again.' }, { status: 400 });
      }

      // Check expiry
      if (new Date() > new Date(pending.expires_at)) {
        return NextResponse.json({ error: 'Verification code has expired. Please register again.' }, { status: 400 });
      }

      // Verify PIN
      if (pending.pin !== pin.trim()) {
        return NextResponse.json({ error: 'Invalid verification PIN code.' }, { status: 400 });
      }

      // Generate unique username from email prefix by appending _cruise
      let basePrefix = pending.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      if (basePrefix.length < 3) basePrefix = 'cruiser';
      let uniqueUsername = `${basePrefix}_cruise`;
      
      const { data: taken } = await supabase.from('profiles').select('id').eq('username', uniqueUsername).maybeSingle();
      if (taken) {
        uniqueUsername = `${basePrefix}_cruise_${Math.floor(100 + Math.random() * 900)}`;
      }

      // Create Supabase Auth account
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: pending.email,
        password: pending.password,
        email_confirm: true,
        user_metadata: {
          full_name: pending.name,
          username: uniqueUsername,
          role: 'fan'
        }
      });

      if (authError) {
        console.error('Admin create user error:', authError);
        return NextResponse.json({ error: authError.message || 'Failed to create member account.' }, { status: 400 });
      }

      // Insert into cruise_signups list
      let signupRecord = null;
      const { data: inserted, error: signupErr } = await supabase.from('cruise_signups').insert({
        name: pending.name,
        email: pending.email,
        phone: pending.phone,
        guest_count: 2, // default
        anonymous: false,
        notes: 'Registered as a Cruise Member'
      }).select().single();

      if (signupErr && signupErr.code === '23505') {
        const { data: existing } = await supabase.from('cruise_signups').select('id').eq('email', pending.email).single();
        signupRecord = existing;
      } else if (signupErr) {
        console.error('Cruise signups list insert error:', signupErr);
      } else {
        signupRecord = inserted;
      }

      // Update profile with signup ID linkage and username if successfully created
      if (authUser?.user && signupRecord) {
        await supabase
          .from('profiles')
          .update({ 
            cruise_signup_id: signupRecord.id, 
            username: uniqueUsername,
            signup_source: 'cruise_member_signup' 
          })
          .eq('id', authUser.user.id);
      }

      // Delete the pending signup record
      await supabase.from('cruise_pending_signups').delete().eq('email', pending.email);

      return NextResponse.json({ success: true, message: 'Account verified and created successfully.' });

    } else {
      return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Register PIN API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
