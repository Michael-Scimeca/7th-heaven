import { NextResponse } from 'next/server';
import { protectAction, sanitizeInput } from '@/lib/security';

export async function POST(req: Request) {
  try {
    const authResult = await protectAction('broadcast_alert', req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: authResult.status || 401 });
    }

    const body = await req.json();
    const {
      showName,
      showDate,
      alertType = 'cancellation',
      messageTitle,
      messageBody,
      channels = { sms: true, email: true, dashboardBanner: true },
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
