/**
 * Crew SMS Alert API
 * Sends a text message to all crew members who have a phone number.
 */
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Fetch all crew members with phone numbers
    const { data: crewProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('role', 'crew');

    if (profilesError) throw profilesError;

    // Also get admin profiles (they should get crew alerts too)
    const { data: adminProfiles } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('role', 'admin');

    const allRecipients = [...(crewProfiles || []), ...(adminProfiles || [])];
    
    // Filter to those with phone numbers
    const withPhone = allRecipients.filter(p => p.phone?.replace(/\D/g, '').length >= 10);

    // Deduplicate by phone
    const phoneSet = new Set<string>();
    const targets: { name: string; phone: string; email: string }[] = [];
    for (const p of withPhone) {
      const digits = p.phone.replace(/\D/g, '');
      const e164 = digits.length === 10 ? `+1${digits}` : `+${digits}`;
      if (!phoneSet.has(e164)) {
        phoneSet.add(e164);
        targets.push({ name: p.full_name || p.email, phone: e164, email: p.email });
      }
    }

    // Send via Twilio if configured
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid?.startsWith('AC') && authToken && twilioPhone && targets.length > 0) {
      try {
        const twilio = (await import('twilio')).default;
        const client = twilio(accountSid, authToken);
        let sent = 0, failed = 0;

        for (const target of targets) {
          try {
            await client.messages.create({
              body: `🛡️ 7th Heaven CREW ALERT:\n\n${message}\n\n— Band Management`,
              from: twilioPhone,
              to: target.phone,
            });
            sent++;
          } catch (err) {
            console.error(`Failed to send to ${target.phone}:`, err);
            failed++;
          }
        }

        return NextResponse.json({
          success: true,
          sent,
          failed,
          totalCrew: allRecipients.length,
          withPhone: targets.length,
        });
      } catch (twilioErr) {
        console.error('[Crew Alert] Twilio error, falling back to dev mode:', twilioErr);
      }
    }

    // Dev mode — no Twilio
    console.log('[Crew Alert] DEV MODE — would send to:', targets.map(t => t.name));
    return NextResponse.json({
      success: true,
      sent: targets.length,
      failed: 0,
      totalCrew: allRecipients.length,
      withPhone: targets.length,
      dev: true,
      note: 'Twilio not configured — SMS not actually sent',
    });
  } catch (err: any) {
    console.error('Crew alert error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET — return crew count for the UI
export async function GET() {
  try {
    const { count: crewCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'crew');

    const { count: adminCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');

    const { data: withPhone } = await supabase
      .from('profiles')
      .select('phone')
      .in('role', ['crew', 'admin'])
      .not('phone', 'is', null);

    const phoneCount = (withPhone || []).filter(p => p.phone?.replace(/\D/g, '').length >= 10).length;

    return NextResponse.json({
      totalCrew: (crewCount || 0) + (adminCount || 0),
      withPhone: phoneCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
