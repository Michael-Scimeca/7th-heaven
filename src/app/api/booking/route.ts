import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STATUS_LABELS: Record<string, string> = {
  approved: '✅ Booking Approved',
  cancelled: '❌ Booking Cancelled',
  completed: '🎉 Show Complete',
};
import { bookingStatusUpdate } from "@/lib/email-templates";
import { protectAction, sanitize as securitySanitize } from "@/lib/security";
import { isValidEmail } from "@/lib/validation";
import { requireAdmin, applyRateLimit, isSpam } from "@/lib/api-utils";
import crypto from "crypto";

import { ADMIN_ALERT_EMAIL } from "@/lib/role-config";

const ADMIN_EMAIL = ADMIN_ALERT_EMAIL;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Sanitize user input before injecting into HTML email templates
function sanitize(str: string | undefined | null): string {
  return securitySanitize(str);
}

const eventTypeLabels: Record<string, string> = {
  full_band: "Full Band",
  unplugged: "Unplugged",
  private: "Private Event",
  custom: "Custom Booking",
};

function generateBookingId() {
  return `7H-BK-${Math.floor(1000 + Math.random() * 9000)}`;
}

function buildPlannerEmailHtml(booking: any) {
  const cancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/book/cancel?token=${booking.cancelToken}&id=${booking.bookingId}`;
  const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/planner`;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://7thheavenband.com';
  const td1 = `padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;width:140px;vertical-align:top;`;
  const td2 = `padding:8px 0;color:#fff;font-size:14px;font-weight:600;`;

  let scheduleHtml = "";
  if (Array.isArray(booking.bookingSlots) && booking.bookingSlots.length > 0) {
    scheduleHtml = booking.bookingSlots.map((s: any, idx: number) => {
      const dateStr = new Date(s.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const typeLabel = eventTypeLabels[s.eventType] || s.eventType;
      const customStr = s.customEventType ? ` (${s.customEventType})` : "";
      let metaInfo = "";
      const ageLabel = s.ageRestriction === "21_plus" ? "🔞 21 & Over" : s.ageRestriction === "18_plus" ? "🔞 18 & Over" : "✅ All Ages";
      metaInfo += `<br/><span style="color:rgba(255,255,255,0.5);font-size:12px;">Age Limit: ${ageLabel}</span>`;
      if (s.doorsTime) {
        metaInfo += ` · <span style="color:rgba(255,255,255,0.5);font-size:12px;">Doors: ${sanitize(s.doorsTime)}</span>`;
      }
      if (s.cover) {
        metaInfo += ` · <span style="color:rgba(255,255,255,0.5);font-size:12px;">Cover: ${sanitize(s.cover)}</span>`;
      }
      if (s.ticketLink) {
        metaInfo += `<br/><span style="color:rgba(255,255,255,0.4);font-size:11px;">Tickets: <a href="${sanitize(s.ticketLink)}" style="color:#a855f7;text-decoration:none;">${sanitize(s.ticketLink)}</a></span>`;
      }
      if (s.notes) {
        metaInfo += `<br/><span style="color:rgba(255,255,255,0.6);font-size:12px;font-style:italic;">Notes: "${sanitize(s.notes)}"</span>`;
      }
      const icsUrl = `${SITE_URL}/api/calendar/ics?bookingId=${encodeURIComponent(booking.bookingId)}&date=${encodeURIComponent(s.date)}&venue=${encodeURIComponent(booking.venueName || '')}&city=${encodeURIComponent(booking.venueCity)}&state=${encodeURIComponent(booking.venueState)}&eventType=${encodeURIComponent(typeLabel)}&startTime=${encodeURIComponent(s.startTime || '')}&endTime=${encodeURIComponent(s.endTime || '')}`;
      return `<div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.05);color:#fff;">
        <span style="font-size:11px;color:#a855f7;text-transform:uppercase;font-weight:700;letter-spacing:1px;display:block;margin-bottom:2px;">Show #${idx + 1}</span>
        <strong>📅 ${sanitize(dateStr)}</strong> · ${sanitize(s.startTime) || 'TBD'} – ${sanitize(s.endTime) || 'TBD'}
        <br/><span style="color:rgba(255,255,255,0.4);font-size:12px;">Format: ${sanitize(typeLabel)}${sanitize(customStr)}</span>
        ${metaInfo}
        <div style="margin-top:8px;">
          <a href="${icsUrl}" style="display:inline-block;padding:4px 8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#a855f7;font-size:10px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:0.5px;">📅 Add to Calendar (.ics)</a>
        </div>
      </div>`;
    }).join("");
  } else {
    const legacyDate = Array.isArray(booking.eventDates) && booking.eventDates.length > 0
      ? booking.eventDates.map((d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })).join(', ')
      : (booking.eventDate ? new Date(booking.eventDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD');
    const icsUrl = `${SITE_URL}/api/calendar/ics?bookingId=${encodeURIComponent(booking.bookingId)}&date=${encodeURIComponent(booking.eventDate || '')}&venue=${encodeURIComponent(booking.venueName || '')}&city=${encodeURIComponent(booking.venueCity)}&state=${encodeURIComponent(booking.venueState)}&eventType=${encodeURIComponent(booking.eventType)}&startTime=${encodeURIComponent(booking.startTime || '')}&endTime=${encodeURIComponent(booking.endTime || '')}`;
    scheduleHtml = `<div style="color:#fff;">
      <strong>📅 ${sanitize(legacyDate)}</strong> · ${sanitize(booking.startTime) || 'TBD'} – ${sanitize(booking.endTime) || 'TBD'}
      <br/><span style="color:rgba(255,255,255,0.4);font-size:12px;">Format: ${sanitize(eventTypeLabels[booking.eventType] || booking.eventType)}</span>
      <div style="margin-top:8px;">
        <a href="${icsUrl}" style="display:inline-block;padding:4px 8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#a855f7;font-size:10px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:0.5px;">📅 Add to Calendar (.ics)</a>
      </div>
    </div>`;
  }

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
      <div style="background:rgba(255,10,61,0.08);border:1px solid rgba(255,10,61,0.25);border-radius:12px;padding:18px 24px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.35);font-weight:700;">Your Booking ID</p>
        <p style="margin:0;font-size:22px;font-weight:900;color:#a855f7;">${sanitize(booking.bookingId)}</p>
      </div>
      <!-- Event Details -->
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:20px;">
        <p style="margin:0 0 14px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);font-weight:700;">Event Details</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          <tr><td style="${td1}">Venue</td><td style="${td2}">${sanitize(booking.venueName) || 'Not specified'}</td></tr>
          <tr><td style="${td1}">Location</td><td style="${td2}">${sanitize(booking.venueCity)}, ${sanitize(booking.venueState)}</td></tr>
          ${booking.indoorOutdoor ? `<tr><td style="${td1}">Indoor/Outdoor</td><td style="${td2}">${sanitize(booking.indoorOutdoor)}</td></tr>` : ''}
          ${booking.expectedAttendance ? `<tr><td style="${td1}">Attendance</td><td style="${td2}">${sanitize(booking.expectedAttendance)}</td></tr>` : ''}
        </table>
        
        <p style="margin:16px 0 10px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);font-weight:700;border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;">Scheduled Shows</p>
        ${scheduleHtml}
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
      ${booking.details ? `<div style="background:rgba(255,10,61,0.05);border:1px solid rgba(255,10,61,0.15);border-radius:12px;padding:20px;margin-bottom:20px;"><p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.3);font-weight:700;">Additional Notes</p><p style="margin:0;color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;">${sanitize(booking.details)}</p></div>` : ''}
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
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://7thheavenband.com';
  const td1 = `padding:6px 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;width:140px;vertical-align:top;`;
  const td2 = `padding:6px 0;color:#fff;font-size:14px;font-weight:600;`;

  let scheduleHtml = "";
  if (Array.isArray(booking.bookingSlots) && booking.bookingSlots.length > 0) {
    scheduleHtml = booking.bookingSlots.map((s: any, idx: number) => {
      const dateStr = new Date(s.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const typeLabel = eventTypeLabels[s.eventType] || s.eventType;
      const customStr = s.customEventType ? ` (${s.customEventType})` : "";
      let metaInfo = "";
      const ageLabel = s.ageRestriction === "21_plus" ? "🔞 21 & Over" : s.ageRestriction === "18_plus" ? "🔞 18 & Over" : "✅ All Ages";
      metaInfo += `<br/><span style="color:rgba(255,255,255,0.5);font-size:12px;">Age Limit: ${ageLabel}</span>`;
      if (s.doorsTime) {
        metaInfo += ` · <span style="color:rgba(255,255,255,0.5);font-size:12px;">Doors: ${sanitize(s.doorsTime)}</span>`;
      }
      if (s.cover) {
        metaInfo += ` · <span style="color:rgba(255,255,255,0.5);font-size:12px;">Cover: ${sanitize(s.cover)}</span>`;
      }
      if (s.ticketLink) {
        metaInfo += `<br/><span style="color:rgba(255,255,255,0.4);font-size:11px;">Tickets: <a href="${sanitize(s.ticketLink)}" style="color:#a855f7;text-decoration:none;">${sanitize(s.ticketLink)}</a></span>`;
      }
      if (s.notes) {
        metaInfo += `<br/><span style="color:rgba(255,255,255,0.6);font-size:12px;font-style:italic;">Notes: "${sanitize(s.notes)}"</span>`;
      }
      const icsUrl = `${SITE_URL}/api/calendar/ics?bookingId=${encodeURIComponent(booking.bookingId)}&date=${encodeURIComponent(s.date)}&venue=${encodeURIComponent(booking.venueName || '')}&city=${encodeURIComponent(booking.venueCity)}&state=${encodeURIComponent(booking.venueState)}&eventType=${encodeURIComponent(typeLabel)}&startTime=${encodeURIComponent(s.startTime || '')}&endTime=${encodeURIComponent(s.endTime || '')}`;
      return `<div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.05);color:#fff;">
        <span style="font-size:10px;color:#a855f7;text-transform:uppercase;font-weight:700;letter-spacing:1px;display:block;margin-bottom:2px;">Show #${idx + 1}</span>
        <strong>📅 ${sanitize(dateStr)}</strong> · ${sanitize(s.startTime) || 'TBD'} – ${sanitize(s.endTime) || 'TBD'}
        <br/><span style="color:rgba(255,255,255,0.4);font-size:12px;">Format: ${sanitize(typeLabel)}${sanitize(customStr)}</span>
        ${metaInfo}
        <div style="margin-top:8px;">
          <a href="${icsUrl}" style="display:inline-block;padding:4px 8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#a855f7;font-size:10px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:0.5px;">📅 Add to Calendar (.ics)</a>
        </div>
      </div>`;
    }).join("");
  } else {
    const legacyDate = Array.isArray(booking.eventDates) && booking.eventDates.length > 0
      ? booking.eventDates.map((d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })).join(', ')
      : (booking.eventDate ? new Date(booking.eventDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD');
    const icsUrl = `${SITE_URL}/api/calendar/ics?bookingId=${encodeURIComponent(booking.bookingId)}&date=${encodeURIComponent(booking.eventDate || '')}&venue=${encodeURIComponent(booking.venueName || '')}&city=${encodeURIComponent(booking.venueCity)}&state=${encodeURIComponent(booking.venueState)}&eventType=${encodeURIComponent(booking.eventType)}&startTime=${encodeURIComponent(booking.startTime || '')}&endTime=${encodeURIComponent(booking.endTime || '')}`;
    scheduleHtml = `<div style="color:#fff;">
      <strong>📅 ${sanitize(legacyDate)}</strong> · ${sanitize(booking.startTime) || 'TBD'} – ${sanitize(booking.endTime) || 'TBD'}
      <br/><span style="color:rgba(255,255,255,0.4);font-size:12px;">Format: ${sanitize(eventTypeLabels[booking.eventType] || booking.eventType)}</span>
      <div style="margin-top:8px;">
        <a href="${icsUrl}" style="display:inline-block;padding:4px 8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#a855f7;font-size:10px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:0.5px;">📅 Add to Calendar (.ics)</a>
      </div>
    </div>`;
  }

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
        <table style="width: 100%; border-collapse: collapse; margin-bottom:16px;">
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

        <p style="margin: 16px 0 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.3); font-weight: 700; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px;">Scheduled Shows</p>
        ${scheduleHtml}
      </div>
      </div>
      ${booking.details ? `<div style="background: rgba(255,10,61,0.05); border: 1px solid rgba(255,10,61,0.15); border-radius: 12px; padding: 16px; margin-bottom: 16px;"><p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.3); font-weight: 700;">Additional Notes</p><p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.5;">${sanitize(booking.details)}</p></div>` : ''}
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
    const bookings = (data || []).map((b: any) => {
      let parsedDetails = { notes: b.details || "" } as any;
      try {
        if (b.details && b.details.startsWith('{') && b.details.endsWith('}')) {
          parsedDetails = JSON.parse(b.details);
        }
      } catch {}

      return {
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
        details: parsedDetails.notes || b.details,
        ageRestriction: parsedDetails.ageRestriction || "all_ages",
        doorsTime: parsedDetails.doorsTime || "",
        cover: parsedDetails.cover || "",
        ticketLink: parsedDetails.ticketLink || "",
        isFestival: parsedDetails.isFestival || false,
        plannerNotes: parsedDetails.plannerNotes || "",
        status: b.status,
        cancelledAt: b.cancelled_at,
        submittedAt: b.created_at,
        updatedAt: b.updated_at,
        // Payment fields
        depositAmount: b.deposit_amount || 0,
        paymentStatus: b.payment_status || 'none',
        stripePaymentId: b.stripe_payment_id || null,
      };
    });

    return NextResponse.json(bookings);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // ── Protection ──
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';

    // Full-body spam check: honeypot field, alt-honeypot (_hp), and timing (_t)
    if (isSpam(data)) {
      return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
    }

    // Sliding-window rate limit: 3 booking requests per IP per hour
    const protection = await protectAction({
      identifier: `booking:${ip}`,
      honeypotValue: data.website,
      requests: 3,
      windowDuration: '60 m',
    });
    if (!protection.success) {
      return NextResponse.json({ error: protection.error }, { status: protection.status });
    }

    // Validate required fields
    const bookingSlots = Array.isArray(data.bookingSlots) ? data.bookingSlots : [];
    const eventDates: string[] = Array.isArray(data.eventDates) && data.eventDates.length > 0 
      ? data.eventDates 
      : (data.eventDate ? [data.eventDate] : []);

    const hasSlots = bookingSlots.length > 0;
    const hasLegacyDates = eventDates.length > 0;

    if (!data.name || !data.email || (!hasSlots && !hasLegacyDates) || !data.venueCity || !data.venueState) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const firstEventType = hasSlots ? bookingSlots[0].eventType : data.eventType;
    if (!firstEventType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(data.email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const baseBookingId = generateBookingId();
    
    // Map over all selected dates/slots to create separate booking records
    const slotsToInsert = hasSlots
      ? bookingSlots
      : eventDates.map((dateStr, idx) => ({
          date: dateStr,
          startTime: data.startTime || null,
          endTime: data.endTime || null,
          eventType: data.eventType,
          customEventType: data.customEventType || null,
        }));

    const inserts = slotsToInsert.map((slot: any, idx: number) => {
      const bookingId = slotsToInsert.length > 1 ? `${baseBookingId}-${idx + 1}` : baseBookingId;
      const cancelToken = crypto.randomBytes(24).toString('hex');
      
      const detailsObj = {
        notes: slot.notes || "",
        ageRestriction: slot.ageRestriction || "all_ages",
        doorsTime: slot.doorsTime || "",
        cover: slot.cover || "",
        ticketLink: slot.ticketLink || "",
        isFestival: slot.isFestival || false,
        plannerNotes: data.details || "",
        useSeparateInfo: slot.useSeparateInfo || false,
        contactName: slot.contactName || "",
        contactEmail: slot.contactEmail || "",
        contactPhone: slot.contactPhone || "",
        venueName: slot.venueName || "",
        venueCity: slot.venueCity || "",
        venueState: slot.venueState || "",
      };

      return {
        booking_id: bookingId,
        planner_name: (slot.useSeparateInfo && slot.contactName) ? slot.contactName : data.name,
        planner_email: ((slot.useSeparateInfo && slot.contactEmail) ? slot.contactEmail : data.email).toLowerCase(),
        planner_phone: (slot.useSeparateInfo && slot.contactPhone) ? slot.contactPhone : (data.phone || null),
        organization: (slot.useSeparateInfo && slot.organization) ? slot.organization : (data.organization || null),
        event_type: slot.eventType,
        event_date: slot.date,
        start_time: slot.startTime || null,
        end_time: slot.endTime || null,
        venue_name: (slot.useSeparateInfo && slot.venueName) ? slot.venueName : (data.venueName || null),
        venue_city: (slot.useSeparateInfo && slot.venueCity) ? slot.venueCity : data.venueCity,
        venue_state: (slot.useSeparateInfo && slot.venueState) ? slot.venueState : data.venueState,
        indoor_outdoor: data.indoorOutdoor || null,
        expected_attendance: data.expectedAttendance || null,
        details: JSON.stringify(detailsObj),
        status: 'pending',
        cancel_token: cancelToken,
      };
    });

    // Insert all booking dates into Supabase
    const { error } = await supabaseAdmin.from('bookings').insert(inserts);

    if (error) {
      console.error('Booking insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Use details of the first insert record for confirmation/cancel links
    const firstBookingId = inserts[0].booking_id;
    const firstCancelToken = inserts[0].cancel_token;
    const booking = { 
      ...data, 
      bookingId: firstBookingId, 
      cancelToken: firstCancelToken,
      bookingSlots: slotsToInsert.map((s: any) => ({
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        eventType: s.eventType,
        customEventType: s.customEventType,
        ageRestriction: s.ageRestriction,
        doorsTime: s.doorsTime,
        cover: s.cover,
        ticketLink: s.ticketLink,
        isFestival: s.isFestival,
        notes: s.notes,
      })),
      eventDates: slotsToInsert.map((s: any) => s.date)
    };

    // Send confirmation emails (non-blocking)
    const emailBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // 1. Confirmation to the planner
    fetch(`${emailBaseUrl}/api/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: data.email,
        subject: `Booking Request Received — ${firstBookingId} | 7th Heaven`,
        html: buildPlannerEmailHtml(booking),
      }),
    }).catch(err => console.error("Planner email failed:", err));

    // 2. Admin notification
    fetch(`${emailBaseUrl}/api/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: ADMIN_EMAIL,
        subject: `⚡ New Booking Request — ${firstBookingId} from ${data.name}`,
        html: buildAdminNotificationHtml(booking),
      }),
    }).catch(err => console.error("Admin email failed:", err));

    return NextResponse.json({ success: true, bookingId: baseBookingId, message: "Booking request received" });
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
    // Verify caller is an authenticated admin
    const authError = await requireAdmin(request);
    if (authError) return authError;

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

    // ── Automatically create Sanity Tour Date when booking is confirmed ──
    if (status === 'confirmed' && data) {
      try {
        // Geocode city and state
        let lat = null;
        let lng = null;
        if (data.venue_city && data.venue_state) {
          try {
            const query = encodeURIComponent(`${data.venue_city}, ${data.venue_state}, USA`);
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
              { headers: { "User-Agent": "7thHeavenBand/1.0" } }
            );
            if (geoRes.ok) {
              const geoJson = await geoRes.json();
              if (geoJson?.[0]) {
                lat = parseFloat(geoJson[0].lat);
                lng = parseFloat(geoJson[0].lon);
              }
            }
          } catch (geoErr) {
            console.error("Geocoding failed during booking auto-sync:", geoErr);
          }
        }

        // Calculate day of the week
        let day = "";
        if (data.event_date) {
          try {
            const dateObj = new Date(data.event_date + 'T12:00:00');
            day = DAY_NAMES[dateObj.getDay()];
          } catch {}
        }

        // Import write client and insert (parallelized — no dependency between them)
        const [{ sanityWriteClient }, { revalidatePath }] = await Promise.all([
          import("@/lib/sanity"),
          import("next/cache"),
        ]);

        let notes = data.details || "";
        let allAges = true;
        let cover = "";
        let ticketLink = "";
        let doorsTime = "";
        let playTime = "";
        let isFestival = data.details?.toLowerCase().includes("festival") || data.details?.toLowerCase().includes("fest") || false;
        let ageRestrictionStr = "";

        try {
          if (data.details && data.details.startsWith('{') && data.details.endsWith('}')) {
            const parsed = JSON.parse(data.details);
            notes = parsed.notes || "";
            allAges = parsed.ageRestriction !== "21_plus";
            cover = parsed.cover || "";
            ticketLink = parsed.ticketLink || "";
            doorsTime = parsed.doorsTime || "";
            playTime = parsed.playTime || "";
            isFestival = parsed.isFestival || false;
            ageRestrictionStr = parsed.ageRestriction || "";
          }
        } catch {}

        const isPrivate = data.event_type === 'private';
        const tags = [data.event_type || "custom"];
        if (ageRestrictionStr === "21_plus") tags.push("21+");
        else if (ageRestrictionStr === "18_plus") tags.push("18+");
        else tags.push("All Ages");

        await sanityWriteClient.create({
          _type: "tourDate",
          venue: data.venue_name || "Private Event",
          city: data.venue_city || "",
          state: data.venue_state || "",
          date: data.event_date || "",
          day,
          time: data.start_time || "",
          notes,
          allAges,
          cover,
          ticketLink,
          doorsTime,
          playTime,
          isSoldOut: false,
          isFestival,
          isPrivate,
          tags,
          lat,
          lng
        });
        revalidatePath("/tour");
      } catch (sanityErr) {
        console.error("Failed to auto-create Sanity tourDate for confirmed booking:", sanityErr);
      }
    }

    // ── Send status notification email to planner ──
    if (data && data.planner_email && ['confirmed', 'approved', 'cancelled', 'completed'].includes(status)) {
      const emailBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const plannerName = data.planner_name || 'there';
      const eventDate = data.event_date || 'TBD';

      // Map DB status to template status
      const templateStatus = (status === 'approved' || status === 'confirmed') ? 'confirmed' : status === 'cancelled' ? 'cancelled' : 'completed';

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

      const statusLabels = STATUS_LABELS;

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
