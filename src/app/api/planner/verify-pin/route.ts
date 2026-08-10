import { NextResponse } from 'next/server';
import { verifyPin } from '@/lib/pins';
import { createClient } from '@supabase/supabase-js';

const supabase: any = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function POST(req: Request) {
  try {
    const { email, pin } = await req.json();

    if (!email || !pin) {
      return NextResponse.json({ error: 'Email and PIN are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Verify PIN
    const isValid = verifyPin(cleanEmail, pin);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired PIN. Please request a new one.' }, { status: 400 });
    }

    // 2. Look up their most recent booking for name
    const { data: booking } = await supabase
      .from('bookings')
      .select('planner_name, booking_id')
      .eq('planner_email', cleanEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const name = booking?.planner_name || 'Planner';

    // 3. Upsert a Supabase auth user with planner role
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u: any) => u.email === cleanEmail);

    if (existingUser) {
      // Update their profile role to planner if not already set
      await supabase
        .from('profiles')
        .update({ role: 'planner', updated_at: new Date().toISOString() })
        .eq('id', existingUser.id);
    } else {
      // Create a new planner user
      const tempPwd = Math.random().toString(36).slice(2) + 'Pl7!';
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        password: tempPwd,
        email_confirm: true,
        user_metadata: { full_name: name, role: 'planner' },
      });
      if (!createErr && newUser?.user) {
        await supabase
          .from('profiles')
          .update({ role: 'planner' })
          .eq('id', newUser.user.id);
      }
    }

    return NextResponse.json({
      success: true,
      name,
      redirectUrl: `${SITE_URL}/planner`,
    });
  } catch (err: any) {
    console.error('[planner/verify-pin]', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
