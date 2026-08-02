/**
 * Crew SMS Alert API
 * Sends a text message to all crew members who have a phone number.
 */
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/api-utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // Verify caller is an authenticated admin
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { message, selectedPhones, additionalPhones, showDate, showVenue, showTime, sentToNames, sendSms = true, sendEmail = true, emailSubject, sendAsGroup = false } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const phoneSet = new Set<string>();
    const targets: { name: string; phone: string; email: string }[] = [];

    // 1. Add selected/checked crew members
    if (Array.isArray(selectedPhones) && selectedPhones.length > 0) {
      const { data: crewProfiles } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('role', 'crew');
      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('role', 'admin');
      const allProfiles = [...(crewProfiles || []), ...(adminProfiles || [])];

      for (const phone of selectedPhones) {
        const digits = phone.replace(/\D/g, '');
        if (digits.length >= 10) {
          const e164 = digits.length === 10 ? `+1${digits}` : `+${digits}`;
          if (!phoneSet.has(e164)) {
            phoneSet.add(e164);
            const match = allProfiles.find(p => p.phone && p.phone.replace(/\D/g, '') === digits);
            targets.push({
              name: match ? match.full_name : `Selected Recipient (${e164})`,
              phone: e164,
              email: match ? (match.email || '') : ''
            });
          }
        }
      }
    } else if (!selectedPhones) {
      // Default: Send to all registered crew/admin numbers (backward compatibility)
      const { data: crewProfiles } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('role', 'crew');

      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('role', 'admin');

      const allRecipients = [...(crewProfiles || []), ...(adminProfiles || [])];
      const withPhone = allRecipients.filter(p => p.phone?.replace(/\D/g, '').length >= 10);

      for (const p of withPhone) {
        const digits = p.phone.replace(/\D/g, '');
        const e164 = digits.length === 10 ? `+1${digits}` : `+${digits}`;
        if (!phoneSet.has(e164)) {
          phoneSet.add(e164);
          targets.push({ name: p.full_name || p.email, phone: e164, email: p.email });
        }
      }
    }

    // 2. Add custom additional numbers
    if (additionalPhones) {
      const customNumbers = typeof additionalPhones === 'string'
        ? additionalPhones.split(',').map(s => s.trim()).filter(Boolean)
        : additionalPhones;

      for (const phone of customNumbers) {
        const digits = phone.replace(/\D/g, '');
        if (digits.length >= 10) {
          const e164 = digits.length === 10 ? `+1${digits}` : `+${digits}`;
          if (!phoneSet.has(e164)) {
            phoneSet.add(e164);
            targets.push({ name: `Custom Number (${e164})`, phone: e164, email: '' });
          }
        }
      }
    }

    // Send via Twilio if configured
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    let sent = 0, failed = 0;

    if (sendSms && accountSid?.startsWith('AC') && authToken && twilioPhone && targets.length > 0) {
      try {
        const twilio = (await import('twilio')).default;
        const client = twilio(accountSid, authToken);

        const recipientListStr = sendAsGroup && targets.length > 0
          ? `\n\nGroup: ${targets.map(t => t.name).join(', ')}`
          : '';

        for (const target of targets) {
          try {
            await client.messages.create({
              body: `🛡️ 7th Heaven CREW ALERT:\n\n${message}${recipientListStr}\n\n— Band Management`,
              from: twilioPhone,
              to: target.phone,
            });
            sent++;
          } catch (err) {
            console.error(`Failed to send to ${target.phone}:`, err);
            failed++;
          }
        }

        // Resolve detailed recipients (with avatars, roles, and hours)
        const recipientsDetail = await resolveRecipientsDetails(targets, showDate || '');

        if (sendEmail) {
          // Send email notifications to admins and crew members
          await notifyAdminsOfAlert({ message, showDate, showVenue, showTime, recipients: recipientsDetail, subjectOverride: emailSubject });
          await notifyCrewOfAlert({ message, showDate, showVenue, showTime, recipients: recipientsDetail, subjectOverride: emailSubject });
        }

        return NextResponse.json({
          success: true,
          sent,
          failed,
          withPhone: targets.length,
        });
      } catch (twilioErr) {
        console.error('[Crew Alert] Twilio error, falling back to dev mode:', twilioErr);
        if (sendSms) {
          sent = targets.length;
        }
      }
    }

    // Dev mode — no Twilio (or fallback)
    if (sendSms) {
      console.log('[Crew Alert] DEV MODE — would send to:', targets.map(t => t.name));
      sent = targets.length;
    }

    // Resolve detailed recipients (with avatars, roles, and hours)
    const recipientsDetail = await resolveRecipientsDetails(targets, showDate || '');

    if (sendEmail) {
      // Send email notifications to admins and crew members
      await notifyAdminsOfAlert({ message, showDate, showVenue, showTime, recipients: recipientsDetail, subjectOverride: emailSubject });
      await notifyCrewOfAlert({ message, showDate, showVenue, showTime, recipients: recipientsDetail, subjectOverride: emailSubject });
    }

    return NextResponse.json({
      success: true,
      sent,
      failed: 0,
      withPhone: targets.length,
      dev: true,
      note: sendSms ? 'Twilio not configured — SMS not actually sent' : 'SMS sending disabled',
    });
  } catch (err: any) {
    console.error('Crew alert error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function notifyAdminsOfAlert({
  message,
  showDate,
  showVenue,
  showTime,
  recipients,
  subjectOverride
}: {
  message: string;
  showDate?: string;
  showVenue?: string;
  showTime?: string;
  recipients: Array<{ name: string; phone: string; email: string; avatar?: string; role?: string; hours?: string }>;
  subjectOverride?: string;
}) {
  try {
    const { data: admins } = await supabase
      .from('profiles')
      .select('email')
      .eq('role', 'admin');

    const adminEmails = (admins || [])
      .map(a => a.email)
      .filter(Boolean);

    if (adminEmails.length === 0) {
      console.warn('[Crew Alert Email] No admin email addresses found.');
      return;
    }

    const { sendEmail } = await import('@/lib/email');
    const { crewSmsDispatchedAlert } = await import('@/lib/email-templates');

    const html = crewSmsDispatchedAlert({
      message,
      showDate,
      showVenue,
      showTime,
      recipients
    });

    const subject = subjectOverride || `🔔 Crew SMS Alert Dispatched - ${showVenue || 'General Alert'}`;

    await sendEmail({
      to: adminEmails,
      subject,
      html
    });

    console.log(`[Crew Alert Email] Successfully sent notification to admins: ${adminEmails.join(', ')}`);
  } catch (err) {
    console.error('[Crew Alert Email] Failed to send email to admins:', err);
  }
}

async function notifyCrewOfAlert({
  message,
  showDate,
  showVenue,
  showTime,
  recipients,
  subjectOverride
}: {
  message: string;
  showDate?: string;
  showVenue?: string;
  showTime?: string;
  recipients: Array<{ name: string; phone: string; email: string; avatar?: string; role?: string; hours?: string }>;
  subjectOverride?: string;
}) {
  try {
    const { sendEmail } = await import('@/lib/email');
    const { crewSmsAlertReceived } = await import('@/lib/email-templates');

    const emailTargets = recipients.filter(t => t.email);
    for (const target of emailTargets) {
      try {
        const html = crewSmsAlertReceived({
          memberName: target.name || 'Crew Member',
          message,
          showDate,
          showVenue,
          showTime
        });

        await sendEmail({
          to: target.email,
          subject: subjectOverride || `🛡️ Crew Alert: ${showVenue || 'Show Update'}`,
          html
        });
        console.log(`[Crew Alert Email] Successfully sent notification to crew member: ${target.name} (${target.email})`);
      } catch (err) {
        console.error(`[Crew Alert Email] Failed to send email to crew member ${target.email}:`, err);
      }
    }
  } catch (err) {
    console.error('[Crew Alert Email] Error inside notifyCrewOfAlert:', err);
  }
}

async function resolveRecipientsDetails(
  targets: Array<{ name: string; phone: string; email: string }>,
  showDate: string
) {
  let schedules: any[] = [];
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const schedulesPath = path.join(process.cwd(), 'schedules.json');
    const schedulesData = await fs.readFile(schedulesPath, 'utf-8');
    schedules = JSON.parse(schedulesData);
  } catch (e) {
    console.warn('[resolveRecipientsDetails] Failed to read schedules.json:', e);
  }

  // Get profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, avatar_url, role')
    .in('role', ['crew', 'admin']);

  return targets.map(target => {
    const digits = target.phone.replace(/\D/g, '');
    const matchProfile = (profiles || []).find(p => p.phone && p.phone.replace(/\D/g, '') === digits);
    const matchShift = matchProfile
      ? schedules.find(s => s.crewId === matchProfile.id && s.date === showDate)
      : schedules.find(s => s.date === showDate && target.name.toLowerCase().includes(s.crewId?.toLowerCase()));

    return {
      name: matchProfile ? matchProfile.full_name : target.name,
      phone: target.phone,
      email: target.email || (matchProfile ? (matchProfile.email || '') : ''),
      avatar: matchProfile ? (matchProfile.avatar_url || '') : '',
      role: matchShift ? matchShift.role : (matchProfile ? matchProfile.role?.toUpperCase() : 'CREW'),
      hours: matchShift ? matchShift.time : 'N/A'
    };
  });
}

// GET — return crew count and full recipient list for the UI
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

    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, role, avatar_url, profile_photo_url, crew_duty')
      .in('role', ['crew', 'admin']);

    const isNotBandOnlyMember = (name?: string, email?: string) => {
      const lowerN = (name || '').toLowerCase();
      const lowerE = (email || '').toLowerCase();
      if (lowerN.includes('richard') || lowerN.includes('hofherr')) return false;
      if (lowerE.includes('richard') || lowerE.includes('hofherr')) return false;
      return true;
    };

    const validProfiles = (allProfiles || [])
      .filter(p => isNotBandOnlyMember(p.full_name, p.email))
      .filter(p => p.phone?.replace(/\D/g, '').length >= 10);

    const recipients = (allProfiles || [])
      .filter(p => isNotBandOnlyMember(p.full_name, p.email))
      .map(p => {
        const digits = p.phone ? p.phone.replace(/\D/g, '') : '';
        const e164 = digits.length >= 10 ? (digits.length === 10 ? `+1${digits}` : `+${digits}`) : '';
        return {
          id: p.id,
          name: p.full_name || p.email,
          phone: e164 || null,
          role: p.role,
          email: p.email || '',
          avatar: p.avatar_url || p.profile_photo_url || null,
          duty: p.crew_duty || null,
        };
      });

    return NextResponse.json({
      totalCrew: (crewCount || 0) + (adminCount || 0),
      withPhone: validProfiles.length,
      recipients,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH — update a crew member's duty
export async function PATCH(request: Request) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { profileId, duty } = await request.json();
    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required' }, { status: 400 });
    }

    // First ensure the column exists (auto-add if missing)
    try {
      await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS crew_duty text;`
      });
    } catch {
      // Column may already exist or RPC not available — try direct update anyway
    }

    const { error } = await supabase
      .from('profiles')
      .update({ crew_duty: duty || null })
      .eq('id', profileId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
