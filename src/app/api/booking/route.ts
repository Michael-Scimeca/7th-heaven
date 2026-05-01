import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { bookingStatusUpdate } from "@/lib/email-templates";
import { protectAction, sanitize as securitySanitize } from "@/lib/security";
import crypto from "crypto";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "mikeyscimeca@gmail.com";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Sanitize user input before injecting into HTML email templates
function sanitize(str: string | undefined | null): string {
  return securitySanitize(str);
}

function generateBookingId() {
  return `7H-BK-${Math.floor(1000 + Math.random() * 9000)}`;
}

function buildPlannerEmailHtml(booking: any) {
  const cancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/book/cancel?token=${booking.cancelToken}&id=${booking.bookingId}`;
  const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/planner`;
  const td1 = `padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;width:140px;vertical-align:top;`;
  const td2 = `padding:8px 0;color:#fff;font-size:14px;font-weight:600;`;
  return `
  <div style="font-family:-apple-system,system-ui,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);">
    <div style="padding:40px 32px;text-align:center;background:linear-gradient(135deg,#1a0030,#0a0a0f);">
      <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:4px;color:#a855f7;font-weight:800;">7th Heaven Live</p>
      <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;">Booking Request Received</h1>
      <p style="margin:0;color:rgba(255,255,255,0.4);font-size:14px;">We'll review your details and get back to you within 24–48 hours.</p>
    </div>
    <div style="padding:32px;">
      <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;margin:0 0 24px;">
        Hey <strong style="color:#fff;">${sanitize(booking.name)}</strong>, thanks for reaching out! Here's a full summary of what you submitted.
      </p>
      <!-- Booking ID -->
      <div style="background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.25);border-radius:12px;padding:18px 24px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.35);font-weight:700;">Your Booking ID</p>
        <p style="margin:0;font-size:22px;font-weight:900;color:#a855f7;">${sanitize(booking.bookingId)}</p>
      </div>
      <!-- Event Details -->
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:20px;">
        <p style="margin:0 0 14px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);font-weight:700;">Event Details</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="${td1}">Event Type</td><td style="${td2}">${sanitize(booking.eventType)}</td></tr>
          <tr><td style="${td1}">Date</td><td style="${td2}">${sanitize(booking.eventDate)}</td></tr>
          <tr><td style="${td1}">Time</td><td style="${td2}">${sanitize(booking.startTime) || 'TBD'} – ${sanitize(booking.endTime) || 'TBD'}</td></tr>
          <tr><td style="${td1}">Venue</td><td style="${td2}">${sanitize(booking.venueName) || 'Not specified'}</td></tr>
          <tr><td style="${td1}">Location</td><td style="${td2}">${sanitize(booking.venueCity)}, ${sanitize(booking.venueState)}</td></tr>
          ${booking.indoorOutdoor ? `<tr><td style="${td1}">Indoor/Outdoor</td><td style="${td2}">${sanitize(booking.indoorOutdoor)}</td></tr>` : ''}
          ${booking.expectedAttendance ? `<tr><td style="${td1}">Attendance</td><td style="${td2}">${sanitize(booking.expectedAttendance)}</td></tr>` : ''}
        </table>
      </div>
      <!-- Contact Info -->
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:20px;">
        <p style="margin:0 0 14px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);font-weight:700;">Your Contact Info</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="${td1}">Name</td><td style="${td2}">${sanitize(booking.name)}</td></tr>
          <tr><td style="${td1}">Email</td><td style="${td2}">${sanitize(booking.email)}</td></tr>
          ${booking.phone ? `<tr><td style="${td1}">Phone</td><td style="${td2}">${sanitize(booking.phone)}</td></tr>` : ''}
          ${booking.organization ? `<tr><td style="${td1}">Organization</td><td style="${td2}">${sanitize(booking.organization)}</td></tr>` : ''}
        </table>
      </div>
      ${booking.details ? `<div style="background:rgba(168,85,247,0.05);border:1px solid rgba(168,85,247,0.15);border-radius:12px;padding:20px;margin-bottom:20px;"><p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.3);font-weight:700;">Additional Notes</p><p style="margin:0;color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;">${sanitize(booking.details)}</p></div>` : ''}
      <!-- What Happens Next -->
      <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 14px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#a855f7;font-weight:800;">What Happens Next</p>
        <table style="width:100%;border-spacing:0 8px;">
          <tr><td style="color:#a855f7;font-weight:900;font-size:15px;width:28px;vertical-align:top;padding-right:12px;">1</td><td style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5;">Our team reviews your request within <strong style="color:#fff;">24–48 hours</strong>.</td></tr>
          <tr><td style="color:#a855f7;font-weight:900;font-size:15px;width:28px;vertical-align:top;padding-right:12px;">2</td><td style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5;">We reach out to confirm availability and discuss your event.</td></tr>
          <tr><td style="color:#a855f7;font-weight:900;font-size:15px;width:28px;vertical-align:top;padding-right:12px;">3</td><td style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5;">You'll receive a final quote and contract once confirmed.</td></tr>
        </table>
      </div>
      <!-- CTA -->
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${dashboardUrl}" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:800;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 36px;border-radius:10px;">View My Booking Dashboard</a>
      </div>
      <p style="color:rgba(255,255,255,0.35);font-size:13px;text-align:center;margin:0 0 12px;">Questions? Reply to this email or contact <a href="mailto:7thheaven@gmail.com" style="color:#a855f7;text-decoration:none;">7thheaven@gmail.com</a></p>
      <p style="text-align:center;margin:0;"><a href="${cancelUrl}" style="color:rgba(255,255,255,0.2);font-size:12px;text-decoration:underline;">Cancel this booking request</a></p>
    </div>
    <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
      <p style="margin:0;color:rgba(255,255,255,0.2);font-size:11px;">© 7th Heaven Live · Chicago, IL · All rights reserved</p>
    </div>
  </div>`;
}

function buildAdminNotificationHtml(booking: any) {
  const replyMailto = `mailto:${booking.email}?subject=Re: Booking ${booking.bookingId} — 7th Heaven`;
  const td1 = `padding:6px 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;width:140px;vertical-align:top;`;
  const td2 = `padding:6px 0;color:#fff;font-size:14px;font-weight:600;`;
  return `
  <div style="font-family:-apple-system,system-ui,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);">
    <div style="padding:32px;text-align:center;background:linear-gradient(135deg,#1a0030,#0a0a0f);">
      <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#a855f7;font-weight:800;">⚡ New Booking Request</p>
      <h1 style="margin:0;font-size:24px;font-weight:900;">${sanitize(booking.bookingId)}</h1>
    </div>
    <div style="padding:32px;">
      <!-- Reply CTA up top -->
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${replyMailto}" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:800;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:12px 32px;border-radius:10px;">Reply to ${sanitize(booking.name)} →</a>
        ${booking.phone ? `<br/><a href="tel:${sanitize(booking.phone)}" style="display:inline-block;margin-top:8px;color:#a855f7;font-size:13px;font-weight:600;text-decoration:none;">${sanitize(booking.phone)}</a>` : ''}
      </div>
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px; margin-bottom: 16px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; width: 130px;">Name</td>
            <td style="padding: 6px 0; color: #fff; font-size: 14px; font-weight: 600;">${sanitize(booking.name)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Email</td>
            <td style="padding: 6px 0; color: #a855f7; font-size: 14px; font-weight: 600;">${sanitize(booking.email)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Phone</td>
            <td style="padding: 6px 0; color: #fff; font-size: 14px; font-weight: 600;">${sanitize(booking.phone) || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Organization</td>
            <td style="padding: 6px 0; color: #fff; font-size: 14px; font-weight: 600;">${sanitize(booking.organization) || 'N/A'}</td>
          </tr>
          <tr><td colspan="2" style="padding: 10px 0;"><hr style="border: none; border-top: 1px solid rgba(255,255,255,0.05);"></td></tr>
          <tr>
            <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Event Type</td>
            <td style="padding: 6px 0; color: #fff; font-size: 14px; font-weight: 600;">${sanitize(booking.eventType)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Date</td>
            <td style="padding: 6px 0; color: #fff; font-size: 14px; font-weight: 600;">${sanitize(booking.eventDate)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Time</td>
            <td style="padding: 6px 0; color: #fff; font-size: 14px; font-weight: 600;">${sanitize(booking.startTime) || 'TBD'} – ${sanitize(booking.endTime) || 'TBD'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Venue</td>
            <td style="padding: 6px 0; color: #fff; font-size: 14px; font-weight: 600;">${sanitize(booking.venueName) || 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Location</td>
            <td style="padding: 6px 0; color: #fff; font-size: 14px; font-weight: 600;">${sanitize(booking.venueCity)}, ${sanitize(booking.venueState)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Indoor/Outdoor</td>
            <td style="padding: 6px 0; color: #fff; font-size: 14px; font-weight: 600;">${sanitize(booking.indoorOutdoor) || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Attendance</td>
            <td style="padding: 6px 0; color: #fff; font-size: 14px; font-weight: 600;">${sanitize(booking.expectedAttendance) || 'N/A'}</td>
          </tr>
        </table>
      </div>
      ${booking.details ? `<div style="background: rgba(168,85,247,0.05); border: 1px solid rgba(168,85,247,0.15); border-radius: 12px; padding: 16px; margin-bottom: 16px;"><p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.3); font-weight: 700;">Additional Notes</p><p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.5;">${sanitize(booking.details)}</p></div>` : ''}
      <div style="text-align: center; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05);">
        <p style="margin: 0 0 8px; color: rgba(255,255,255,0.3); font-size: 12px;">Need to cancel this booking?</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/book/cancel?token=${booking.cancelToken}&id=${booking.bookingId}" style="color: #a855f7; font-size: 13px; font-weight: 600; text-decoration: underline;">Cancel Booking →</a>
      </div>
    </div>
  </div>`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    let query = supabaseAdmin.from('bookings').select('*').order('created_at', { ascending: false });

    // If email provided, filter to that planner's bookings
    if (email) {
      query = query.eq('planner_email', email.toLowerCase());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Bookings fetch error:', error);
      return NextResponse.json([]);
    }

    // Transform Supabase format to match existing client expectations
    const bookings = (data || []).map((b: any) => ({
      bookingId: b.booking_id,
      name: b.planner_name,
      email: b.planner_email,
      phone: b.planner_phone,
      organization: b.organization,
      eventType: b.event_type,
      eventDate: b.event_date,
      startTime: b.start_time,
      endTime: b.end_time,
      venueName: b.venue_name,
      venueCity: b.venue_city,
      venueState: b.venue_state,
      indoorOutdoor: b.indoor_outdoor,
      expectedAttendance: b.expected_attendance,
      details: b.details,
      status: b.status,
      cancelledAt: b.cancelled_at,
      submittedAt: b.created_at,
      updatedAt: b.updated_at,
    }));

    return NextResponse.json(bookings);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // ── Protection ──
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const protection = await protectAction({
      identifier: `booking:${ip}`,
      honeypotValue: data.website, // bot bait
    });
    if (!protection.success) {
      return NextResponse.json({ error: protection.error }, { status: protection.status });
    }

    // Validate required fields
    if (!data.name || !data.email || !data.eventDate || !data.eventType || !data.venueCity || !data.venueState) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const bookingId = generateBookingId();
    const cancelToken = crypto.randomBytes(24).toString('hex');

    // Insert into Supabase
    const { error } = await supabaseAdmin.from('bookings').insert({
      booking_id: bookingId,
      planner_name: data.name,
      planner_email: data.email.toLowerCase(),
      planner_phone: data.phone || null,
      organization: data.organization || null,
      event_type: data.eventType,
      event_date: data.eventDate,
      start_time: data.startTime || null,
      end_time: data.endTime || null,
      venue_name: data.venueName || null,
      venue_city: data.venueCity,
      venue_state: data.venueState,
      indoor_outdoor: data.indoorOutdoor || null,
      expected_attendance: data.expectedAttendance || null,
      details: data.details || null,
      status: 'pending',
      cancel_token: cancelToken,
    });

    if (error) {
      console.error('Booking insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const booking = { ...data, bookingId, cancelToken };

    // Send confirmation emails (non-blocking)
    const emailBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // 1. Confirmation to the planner
    fetch(`${emailBaseUrl}/api/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: data.email,
        subject: `Booking Confirmed — ${bookingId} | 7th Heaven`,
        html: buildPlannerEmailHtml(booking),
      }),
    }).catch(err => console.error("Planner email failed:", err));

    // 2. Admin notification
    fetch(`${emailBaseUrl}/api/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: ADMIN_EMAIL,
        subject: `⚡ New Booking Request — ${bookingId} from ${data.name}`,
        html: buildAdminNotificationHtml(booking),
      }),
    }).catch(err => console.error("Admin email failed:", err));

    return NextResponse.json({ success: true, bookingId, message: "Booking request received" });
  } catch (error) {
    console.error("Booking API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { bookingId, status, notes } = await request.json();

    const update: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      update.status = status;
    }

    if (notes !== undefined) {
      update.details = notes;
    }

    if (status === 'cancelled') {
      update.cancelled_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update(update)
      .eq('booking_id', bookingId)
      .select()
      .single();

    if (error) {
      console.error('Booking update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ── Send status notification email to planner ──
    if (data && data.planner_email && ['approved', 'cancelled', 'completed'].includes(status)) {
      const emailBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const plannerName = data.planner_name || 'there';
      const eventDate = data.event_date || 'TBD';

      // Map DB status to template status
      const templateStatus = status === 'approved' ? 'confirmed' : status === 'cancelled' ? 'cancelled' : 'completed';

      const html = bookingStatusUpdate({
        name: plannerName,
        bookingId: bookingId,
        status: templateStatus as 'confirmed' | 'cancelled' | 'completed',
        eventDate: eventDate,
        eventType: data.event_type || 'event',
        venueName: data.venue_name,
        venueCity: data.venue_city || '',
        venueState: data.venue_state || '',
      });

      const statusLabels: Record<string, string> = {
        approved: '✅ Booking Approved',
        cancelled: '❌ Booking Cancelled',
        completed: '🎉 Show Complete',
      };

      fetch(`${emailBaseUrl}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.planner_email,
          subject: `${statusLabels[status] || 'Status Update'} — ${bookingId} | 7th Heaven`,
          html,
        }),
      }).catch(err => console.error('Status notification email failed:', err));
    }

    return NextResponse.json({ success: true, booking: data });
  } catch (error) {
    console.error("Booking PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
