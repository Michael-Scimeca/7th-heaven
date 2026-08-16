import { NextResponse } from 'next/server';
import { sanitizeInput } from '@/lib/security';
import { requireAdmin, applyRateLimit, getClientIp } from '@/lib/api-utils';
import { publishToGroups, type NtfyGroup, type NtfyPriority } from '@/lib/ntfy';

// Which ntfy topic(s) a given target audience should reach.
const AUDIENCE_TO_NTFY_GROUPS: Record<string, NtfyGroup[]> = {
  all_fans: ['fans'],
  show_fans: ['fans'],
  crew_and_band: ['crew', 'admins'],
};

const ALERT_TYPE_TO_NTFY = {
  cancellation: { priority: 'urgent' as NtfyPriority, tags: ['rotating_light'] },
  time_change: { priority: 'high' as NtfyPriority, tags: ['alarm_clock'] },
  venue_change: { priority: 'high' as NtfyPriority, tags: ['round_pushpin'] },
  announcement: { priority: 'default' as NtfyPriority, tags: ['loudspeaker'] },
} as const;

export async function POST(req: Request) {
  try {
    // Auth first — must be an admin session (Supabase cookie + profiles.role check)
    const authDenied = await requireAdmin(req);
    if (authDenied) return authDenied;

    // Rate limit — even admins shouldn't blast more than twice per hour
    const ip = await getClientIp();
    const rateLimited = await applyRateLimit(ip, 'broadcast', 2, '60 m');
    if (rateLimited) return rateLimited;

    const body = await req.json();
    const {
      showName,
      showDate,
      alertType = 'cancellation',
      messageTitle,
      messageBody,
      channels = { sms: true, email: true, dashboardBanner: true, push: true },
      targetAudience = 'all_fans',
      recipientCount = 1482,
    } = body;

    const cleanTitle = sanitizeInput(messageTitle || 'Show Update Alert');
    const cleanBody = sanitizeInput(messageBody || '');
    const cleanShowName = sanitizeInput(showName || 'Upcoming Show');

    // 160 chars per SMS segment at $0.0079 per Twilio SMS segment
    const textLength = cleanBody.length;
    const smsSegments = Math.max(1, Math.ceil(textLength / 160));
    const estimatedSmsCost = channels.sms ? Number((recipientCount * smsSegments * 0.0079).toFixed(2)) : 0;
    const estimatedEmailCost = channels.email ? Number((recipientCount * 0.001).toFixed(2)) : 0;
    const totalEstimatedCost = Number((estimatedSmsCost + estimatedEmailCost).toFixed(2));

    // Push (ntfy) is the one channel here that actually sends for real, for
    // free — unlike SMS/email above, which are cost-estimated but not wired
    // to a live provider in this demo broadcast flow.
    let pushResults: Awaited<ReturnType<typeof publishToGroups>> = [];
    if (channels.push !== false) {
      const groups = AUDIENCE_TO_NTFY_GROUPS[targetAudience] || ['fans'];
      const { priority, tags } = ALERT_TYPE_TO_NTFY[alertType as keyof typeof ALERT_TYPE_TO_NTFY] || ALERT_TYPE_TO_NTFY.announcement;
      pushResults = await publishToGroups(groups, {
        title: cleanTitle,
        message: cleanBody,
        priority,
        tags: [...tags],
      });
    }

    const dispatchRecord = {
      id: `broadcast-${Date.now()}`,
      showName: cleanShowName,
      showDate: showDate || new Date().toISOString().split('T')[0],
      alertType,
      title: cleanTitle,
      body: cleanBody,
      channels,
      targetAudience,
      recipientCount,
      estimatedCost: totalEstimatedCost,
      timestamp: new Date().toISOString(),
      status: 'sent',
      push: pushResults,
    };

    return NextResponse.json({
      success: true,
      dispatch: dispatchRecord,
      message: `Emergency alert dispatched to ${recipientCount.toLocaleString()} recipients!`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
