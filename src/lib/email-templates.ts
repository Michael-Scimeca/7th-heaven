// ─── Centralized Email Templates for 7th Heaven ───
// All templates use the same dark brand wrapper for consistency.

function sanitize(str: string | undefined | null): string {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Brand wrapper shared by all templates ──
function wrap(content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050508;font-family:-apple-system,system-ui,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050508;padding:40px 16px;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">
<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:20px 40px;text-align:center;border-radius:16px 16px 0 0;">
<p style="margin:0;color:#fff;font-size:18px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">7TH HEAVEN</p>
</td></tr>
<!-- Body -->
<tr><td style="background:#0a0a0f;padding:40px 32px;border-left:1px solid rgba(255,255,255,0.05);border-right:1px solid rgba(255,255,255,0.05);">
${content}
</td></tr>
<!-- Footer -->
<tr><td style="background:#08080c;padding:24px 32px;text-align:center;border:1px solid rgba(255,255,255,0.05);border-top:none;border-radius:0 0 16px 16px;">
<p style="margin:0 0 8px;color:#444;font-size:11px;">© ${new Date().getFullYear()} 7th Heaven — All rights reserved</p>
<p style="margin:0 0 8px;color:#7c3aed;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">7thheavenband.com</p>
<p style="margin:0 0 6px;color:#333;font-size:10px;">7th Heaven · Chicago, IL 60601</p>
<p style="margin:0;font-size:10px;"><a href="https://7thheavenband.com/api/newsletter/unsubscribe?email={{email}}" style="color:#555;text-decoration:underline;">Unsubscribe</a> · <a href="https://7thheavenband.com/privacy" style="color:#555;text-decoration:underline;">Privacy Policy</a></p>
</td></tr>
</table></td></tr></table></body></html>`;
}

// ── Shared button style ──
const btnStyle = `display:inline-block;background:#7c3aed;color:#fff;font-weight:800;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 36px;border-radius:10px;`;
const btnGold = `display:inline-block;background:#FBBF24;color:#000;font-weight:900;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 36px;border-radius:10px;`;

// ═══════════════════════════════════════════════
// 1. BOOKING CONFIRMATION (sent to planner)
// ═══════════════════════════════════════════════
export function bookingConfirmation(b: {
  name: string; bookingId: string; eventType: string; eventDate: string;
  startTime?: string; endTime?: string; venueName?: string; venueCity: string; venueState: string;
}) {
  return wrap(`
    <h1 style="margin:0 0 8px;color:#fff;font-size:26px;font-weight:900;text-align:center;">Booking Request Received</h1>
    <p style="margin:0 0 28px;color:rgba(255,255,255,0.4);font-size:13px;text-align:center;">We'll review your details and get back to you within 24–48 hours.</p>
    <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;margin:0 0 28px;">
      Hey <strong style="color:#fff;">${sanitize(b.name)}</strong>, thanks for submitting your booking request!
    </p>
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);font-weight:700;">Booking ID</p>
      <p style="margin:0 0 20px;font-size:20px;font-weight:800;color:#a855f7;">${sanitize(b.bookingId)}</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;width:110px;">Event</td><td style="padding:8px 0;color:#fff;font-size:14px;font-weight:600;">${sanitize(b.eventType)}</td></tr>
        <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Date</td><td style="padding:8px 0;color:#fff;font-size:14px;font-weight:600;">${sanitize(b.eventDate)}</td></tr>
        <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Time</td><td style="padding:8px 0;color:#fff;font-size:14px;font-weight:600;">${sanitize(b.startTime) || 'TBD'} – ${sanitize(b.endTime) || 'TBD'}</td></tr>
        <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Venue</td><td style="padding:8px 0;color:#fff;font-size:14px;font-weight:600;">${sanitize(b.venueName) || 'Not specified'}</td></tr>
        <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Location</td><td style="padding:8px 0;color:#fff;font-size:14px;font-weight:600;">${sanitize(b.venueCity)}, ${sanitize(b.venueState)}</td></tr>
      </table>
    </div>
    <p style="color:rgba(255,255,255,0.4);font-size:13px;line-height:1.6;margin:0;">
      Questions? Reply to this email or contact <a href="mailto:7thheaven@gmail.com" style="color:#a855f7;text-decoration:none;">7thheaven@gmail.com</a>.
    </p>
  `);
}

// ═══════════════════════════════════════════════
// 2. BOOKING NOTIFICATION (sent to admin)
// ═══════════════════════════════════════════════
export function bookingAdminNotification(b: {
  name: string; email: string; phone?: string; organization?: string; bookingId: string;
  eventType: string; eventDate: string; startTime?: string; endTime?: string;
  venueName?: string; venueCity: string; venueState: string;
  indoorOutdoor?: string; expectedAttendance?: string; details?: string;
}) {
  return wrap(`
    <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#a855f7;font-weight:800;text-align:center;">⚡ New Booking Request</p>
    <h1 style="margin:0 0 24px;font-size:24px;font-weight:900;color:#fff;text-align:center;">${sanitize(b.bookingId)}</h1>
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:16px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;width:130px;">Name</td><td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600;">${sanitize(b.name)}</td></tr>
        <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Email</td><td style="padding:6px 0;color:#a855f7;font-size:14px;font-weight:600;">${sanitize(b.email)}</td></tr>
        <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Phone</td><td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600;">${sanitize(b.phone) || 'N/A'}</td></tr>
        <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Organization</td><td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600;">${sanitize(b.organization) || 'N/A'}</td></tr>
        <tr><td colspan="2" style="padding:10px 0;"><hr style="border:none;border-top:1px solid rgba(255,255,255,0.05);"></td></tr>
        <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Event</td><td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600;">${sanitize(b.eventType)}</td></tr>
        <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Date</td><td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600;">${sanitize(b.eventDate)}</td></tr>
        <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Time</td><td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600;">${sanitize(b.startTime) || 'TBD'} – ${sanitize(b.endTime) || 'TBD'}</td></tr>
        <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Venue</td><td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600;">${sanitize(b.venueName) || 'Not specified'}</td></tr>
        <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Location</td><td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600;">${sanitize(b.venueCity)}, ${sanitize(b.venueState)}</td></tr>
        <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Indoor/Outdoor</td><td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600;">${sanitize(b.indoorOutdoor) || 'N/A'}</td></tr>
        <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Attendance</td><td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600;">${sanitize(b.expectedAttendance) || 'N/A'}</td></tr>
      </table>
    </div>
    ${b.details ? `<div style="background:rgba(168,85,247,0.05);border:1px solid rgba(168,85,247,0.15);border-radius:12px;padding:16px;"><p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.3);font-weight:700;">Additional Notes</p><p style="margin:0;color:rgba(255,255,255,0.7);font-size:14px;line-height:1.5;">${sanitize(b.details)}</p></div>` : ''}
  `);
}

// ═══════════════════════════════════════════════
// 2.5 BOOKING CANCELLED ALERT (sent to admin)
// ═══════════════════════════════════════════════
export function bookingCancelledAdminAlert(b: {
  bookingId: string; eventDate: string; eventType: string;
}) {
  return wrap(`
    <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#ef4444;font-weight:800;text-align:center;">🚨 Booking Cancelled</p>
    <h1 style="margin:0 0 24px;font-size:24px;font-weight:900;color:#fff;text-align:center;">${sanitize(b.bookingId)}</h1>
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:16px;text-align:center;">
      <p style="margin:0 0 16px;color:rgba(255,255,255,0.7);font-size:15px;">The event planner just cancelled this booking using their token link. This date is now open again.</p>
      <p style="margin:0 0 4px;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Date</p>
      <p style="margin:0 0 16px;color:#fff;font-size:16px;font-weight:600;">${sanitize(b.eventDate)}</p>
      <p style="margin:0 0 4px;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Event Type</p>
      <p style="margin:0;color:#fff;font-size:16px;font-weight:600;">${sanitize(b.eventType).replace('_', ' ')}</p>
    </div>
  `);
}

// ═══════════════════════════════════════════════
// 3. RAFFLE WIN (sent to winning fan)
// ═══════════════════════════════════════════════
export function raffleWin(b: { prizeName: string; pin: string; claimUrl: string }) {
  const pinDigits = b.pin.split('').map(d =>
    `<td style="width:48px;height:56px;background:#0a0a0e;border:2px solid #FBBF24;border-radius:8px;text-align:center;font-size:28px;font-weight:900;color:#FBBF24;font-family:monospace;">${d}</td>`
  ).join('<td style="width:8px;"></td>');

  return wrap(`
    <div style="text-align:center;">
      <p style="font-size:52px;margin:0 0 16px;">🏆</p>
      <h1 style="margin:0 0 12px;color:#fff;font-size:28px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">YOU WON THE RAFFLE</h1>
      <p style="margin:0 0 32px;color:#888;font-size:15px;">Congratulations — your name was drawn live!</p>
      <div style="background:#0a0a0e;border:2px solid #FBBF24;border-radius:12px;padding:24px;margin-bottom:28px;">
        <p style="margin:0 0 8px;color:#92600a;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Your Prize</p>
        <p style="margin:0;color:#fff;font-size:22px;font-weight:900;">${sanitize(b.prizeName)}</p>
      </div>
      ${b.pin ? `
        <p style="margin:0 0 12px;color:#555;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Your Claim PIN</p>
        <table cellpadding="0" cellspacing="0" style="margin:0 auto 8px;"><tr>${pinDigits}</tr></table>
        <p style="margin:0 0 28px;color:#444;font-size:11px;">Show this PIN to the crew at the merch table</p>
      ` : ''}
      <a href="${b.claimUrl}" style="${btnGold}">Open My Claim Page</a>
    </div>
  `);
}

// ═══════════════════════════════════════════════
// 4. RAFFLE ENTRY CONFIRMATION
// ═══════════════════════════════════════════════
export function raffleEntry(b: { prizeName: string }) {
  return wrap(`
    <div style="text-align:center;">
      <p style="font-size:48px;margin:0 0 16px;">🎟️</p>
      <h1 style="margin:0 0 12px;color:#FBBF24;font-size:24px;font-weight:900;text-transform:uppercase;">Raffle Entry Confirmed</h1>
      <p style="margin:0 0 24px;color:rgba(255,255,255,0.6);font-size:15px;line-height:1.6;">
        You've been entered to win <strong style="color:#fff;">${sanitize(b.prizeName)}</strong>. Stay tuned — the winner will be drawn live on stream!
      </p>
      <p style="margin:0;color:rgba(255,255,255,0.3);font-size:13px;">Good luck! 🤞</p>
    </div>
  `);
}



// ═══════════════════════════════════════════════
// 8. NEWSLETTER BLAST
// ═══════════════════════════════════════════════
export function newsletterBlast(b: { subject: string; body: string }) {
  return wrap(`
    <div style="text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:4px;color:#a855f7;font-weight:800;">Announcement</p>
      <h1 style="margin:0;font-size:26px;font-weight:900;color:#fff;letter-spacing:-0.5px;">${sanitize(b.subject)}</h1>
    </div>
    <div style="color:rgba(255,255,255,0.75);font-size:15px;line-height:1.7;white-space:pre-wrap;margin-bottom:32px;">${sanitize(b.body)}</div>
    <div style="text-align:center;">
      <a href="https://7thheavenband.com" style="${btnStyle}">Visit 7th Heaven</a>
    </div>
    <p style="margin:24px 0 0;color:rgba(255,255,255,0.15);font-size:11px;text-align:center;">You're receiving this because you subscribed to the 7th Heaven newsletter.<br/><a href="https://7thheavenband.com/api/newsletter/unsubscribe?email={{email}}" style="color:rgba(255,255,255,0.3);text-decoration:underline;font-weight:700;">Unsubscribe</a> · <a href="https://7thheavenband.com/privacy" style="color:rgba(255,255,255,0.25);text-decoration:underline;">Privacy</a> · <a href="https://7thheavenband.com/terms" style="color:rgba(255,255,255,0.25);text-decoration:underline;">Terms</a></p>
  `);
}

// ═══════════════════════════════════════════════
// 9. CRUISE SIGNUP CONFIRMATION
// ═══════════════════════════════════════════════
export function cruiseConfirmation(b: {
  name: string; guestCount: number; cancelToken: string;
  guests?: { name: string; email?: string; phone?: string; age?: string; type: string }[];
}) {
  const cancelUrl = `https://7thheavenband.com/cruise/cancel?token=${b.cancelToken}`;

  let guestRosterHtml = '';
  if (b.guests && b.guests.length > 0) {
    const guestRows = b.guests.map((g, i) => {
      const isChild = g.type === 'child';
      const badge = isChild
        ? `<span style="display:inline-block;padding:2px 8px;background:rgba(6,182,212,0.15);color:#06b6d4;font-size:10px;font-weight:700;border-radius:6px;text-transform:uppercase;letter-spacing:1px;">🧒 Child${g.age ? ' · Age ' + g.age : ''}</span>`
        : `<span style="display:inline-block;padding:2px 8px;background:rgba(138,28,252,0.1);color:#8a1cfc;font-size:10px;font-weight:700;border-radius:6px;text-transform:uppercase;letter-spacing:1px;">👤 Adult</span>`;
      const contact = !isChild && (g.email || g.phone)
        ? `<br/><span style="color:rgba(255,255,255,0.25);font-size:11px;">${g.email || ''}${g.email && g.phone ? ' · ' : ''}${g.phone || ''}</span>`
        : '';
      return `<tr>
        <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);">
          <div><span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:${isChild ? '#06b6d4' : '#8a1cfc'};color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:28px;">${g.name ? g.name[0].toUpperCase() : (i + 2)}</span>
          <span style="color:#fff;font-size:13px;font-weight:600;margin-left:8px;">${g.name || 'Guest ' + (i + 2)}</span>${contact}</div>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);text-align:right;vertical-align:middle;">${badge}</td>
      </tr>`;
    }).join('');

    guestRosterHtml = `
      <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:0;margin-bottom:24px;overflow:hidden;">
        <div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.05);">
          <p style="margin:0;color:rgba(255,255,255,0.3);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;">Your Group</p>
        </div>
        <table style="width:100%;border-spacing:0;">
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);">
              <div><span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#8a1cfc;color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:28px;">${b.name ? b.name[0].toUpperCase() : '1'}</span>
              <span style="color:#fff;font-size:13px;font-weight:600;margin-left:8px;">${b.name}</span>
              <span style="color:rgba(255,255,255,0.25);font-size:11px;margin-left:4px;">(you)</span></div>
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);text-align:right;">
              <span style="display:inline-block;padding:2px 8px;background:rgba(138,28,252,0.1);color:#8a1cfc;font-size:10px;font-weight:700;border-radius:6px;text-transform:uppercase;letter-spacing:1px;">👤 Primary</span>
            </td>
          </tr>
          ${guestRows}
        </table>
      </div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;font-style:italic;letter-spacing:-0.5px;">🚢 You're on the List!</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.4);font-size:14px;">7th Heaven Cruise — Interest Confirmed</p>
    </div>
    <div style="background:#111118;border:1px solid rgba(138,28,252,0.3);border-radius:16px;padding:32px;margin-bottom:24px;">
      <p style="margin:0 0 16px;color:#fff;font-size:16px;">Hey <strong>${b.name}</strong>,</p>
      <p style="margin:0 0 16px;color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">
        Thanks for signing up for the <strong style="color:#fff;">7th Heaven Caribbean Cruise</strong>!
        We've got you down for <strong style="color:#8a1cfc;">${b.guestCount} ${b.guestCount > 1 ? 'people' : 'person'}</strong> in your group.
      </p>
      <p style="margin:0 0 24px;color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">
        This is <strong style="color:#fff;">not a booking</strong> — it's a free interest signup. The more fans who sign up,
        the better group rate we can negotiate with cruise management.
      </p>
      ${guestRosterHtml}
      <div style="background:rgba(138,28,252,0.05);border:1px solid rgba(138,28,252,0.15);border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px;color:#8a1cfc;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;">What Happens Next</p>
        <table style="width:100%;border-spacing:0 8px;">
          <tr><td style="color:#8a1cfc;font-weight:900;font-size:14px;width:24px;vertical-align:top;padding-right:10px;">1</td><td style="color:rgba(255,255,255,0.5);font-size:13px;">We collect interest and build the headcount</td></tr>
          <tr><td style="color:#8a1cfc;font-weight:900;font-size:14px;width:24px;vertical-align:top;padding-right:10px;">2</td><td style="color:rgba(255,255,255,0.5);font-size:13px;">We negotiate the best group rate with the cruise line</td></tr>
          <tr><td style="color:#8a1cfc;font-weight:900;font-size:14px;width:24px;vertical-align:top;padding-right:10px;">3</td><td style="color:rgba(255,255,255,0.5);font-size:13px;">You get <strong style="color:#fff;">first access</strong> to book at the locked-in price</td></tr>
        </table>
      </div>
      <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:20px;">
        <p style="margin:0 0 12px;color:rgba(255,255,255,0.3);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;">Cruise Overview</p>
        <table style="width:100%;border-spacing:0 6px;">
          <tr><td style="color:rgba(255,255,255,0.3);font-size:12px;width:90px;">Route</td><td style="color:#fff;font-size:13px;font-weight:600;">Miami → Caribbean → Miami</td></tr>
          <tr><td style="color:rgba(255,255,255,0.3);font-size:12px;">Duration</td><td style="color:#fff;font-size:13px;font-weight:600;">7 Nights</td></tr>
          <tr><td style="color:rgba(255,255,255,0.3);font-size:12px;">Islands</td><td style="color:#fff;font-size:13px;font-weight:600;">Cozumel · Grand Cayman · Roatán</td></tr>
          <tr><td style="color:rgba(255,255,255,0.3);font-size:12px;">Shows</td><td style="color:#fff;font-size:13px;font-weight:600;">6 Live Performances</td></tr>
          <tr><td style="color:rgba(255,255,255,0.3);font-size:12px;">Your Group</td><td style="color:#8a1cfc;font-size:13px;font-weight:700;">${b.guestCount} ${b.guestCount > 1 ? 'people' : 'person'}</td></tr>
        </table>
      </div>
    </div>
    <div style="text-align:center;margin-bottom:32px;">
      <p style="margin:0 0 12px;color:rgba(255,255,255,0.4);font-size:13px;">Help us get a better rate — spread the word!</p>
      <a href="https://7thheavenband.com/cruise" style="display:inline-block;padding:12px 32px;background:#8a1cfc;color:#fff;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;text-decoration:none;border-radius:10px;">Share the Cruise Page</a>
    </div>
    <div style="text-align:center;padding-top:24px;border-top:1px solid rgba(255,255,255,0.05);">
      <p style="margin:0 0 8px;color:rgba(255,255,255,0.2);font-size:11px;">7th Heaven · Chicago, IL 60601</p>
      <p style="margin:0 0 6px;color:rgba(255,255,255,0.15);font-size:11px;">Changed your mind? <a href="${cancelUrl}" style="color:rgba(138,28,252,0.6);text-decoration:underline;">Cancel your signup</a></p>
      <p style="margin:0;font-size:10px;"><a href="https://7thheavenband.com/api/newsletter/unsubscribe?email={{email}}" style="color:rgba(255,255,255,0.15);text-decoration:underline;">Unsubscribe from all emails</a> · <a href="https://7thheavenband.com/privacy" style="color:rgba(255,255,255,0.15);text-decoration:underline;">Privacy</a></p>
    </div>
  </div>
</body></html>`;
}

// ═══════════════════════════════════════════════
// TEMPLATE REGISTRY — used by preview page
// ═══════════════════════════════════════════════
export const EMAIL_TEMPLATES = [
  {
    id: 'booking_confirmation',
    name: 'Booking Confirmation',
    description: 'Sent to the event planner after submitting a booking request.',
    category: 'Booking',
    status: 'live' as const,
    render: () => bookingConfirmation({
      name: 'Marcus Rivera', bookingId: '7H-BK-4821', eventType: 'Full Band',
      eventDate: 'June 14, 2026', startTime: '7:00 PM', endTime: '10:00 PM',
      venueName: 'The Chicago Theatre', venueCity: 'Chicago', venueState: 'IL',
    }),
  },
  {
    id: 'booking_admin',
    name: 'Booking Admin Alert',
    description: 'Sent to admin when a new booking request comes in.',
    category: 'Booking',
    status: 'live' as const,
    render: () => bookingAdminNotification({
      name: 'Marcus Rivera', email: 'marcus@rivera.com', phone: '(312) 555-0187',
      organization: 'Rivera Entertainment', bookingId: '7H-BK-4821', eventType: 'Full Band',
      eventDate: 'June 14, 2026', startTime: '7:00 PM', endTime: '10:00 PM',
      venueName: 'The Chicago Theatre', venueCity: 'Chicago', venueState: 'IL',
      indoorOutdoor: 'Indoor', expectedAttendance: '500', details: 'Annual summer gala fundraiser.',
    }),
  },
  {
    id: 'booking_cancelled_admin',
    name: 'Booking Cancelled Alert',
    description: 'Sent to admin when a planner cancels their booking via token link.',
    category: 'Booking',
    status: 'live' as const,
    render: () => bookingCancelledAdminAlert({
      bookingId: '7H-BK-4821', eventDate: 'June 14, 2026', eventType: 'Full Band',
    }),
  },
  {
    id: 'raffle_win',
    name: 'Raffle Winner',
    description: 'Sent to the fan who wins a live raffle with their claim PIN.',
    category: 'Live Stream',
    status: 'live' as const,
    render: () => raffleWin({ prizeName: 'Signed Vinyl Record', pin: '7482', claimUrl: 'https://7thheavenband.com/fans' }),
  },
  {
    id: 'raffle_entry',
    name: 'Raffle Entry Confirmation',
    description: 'Sent when a fan enters a live raffle.',
    category: 'Live Stream',
    status: 'live' as const,
    render: () => raffleEntry({ prizeName: 'Signed Vinyl Record' }),
  },
  {
    id: 'welcome_fan',
    name: 'Welcome — Fan',
    description: 'Sent after a fan creates their account.',
    category: 'Account',
    status: 'live' as const,
    render: () => welcomeFan({ name: 'Sarah Johnson' }),
  },
  {
    id: 'welcome_planner',
    name: 'Welcome — Planner',
    description: 'Sent after a planner creates their account from the booking flow.',
    category: 'Account',
    status: 'live' as const,
    render: () => welcomePlanner({ name: 'Marcus Rivera', email: 'marcus@riveraentertainment.com' }),
  },
  {
    id: 'booking_status',
    name: 'Booking Status Update',
    description: 'Sent when a booking is approved, cancelled, or completed.',
    category: 'Booking',
    status: 'live' as const,
    render: () => bookingStatusUpdate({ name: 'Marcus Rivera', bookingId: '7H-BK-4821', status: 'confirmed', eventDate: 'June 14, 2026', eventType: 'full_band', venueCity: 'Chicago', venueState: 'IL', venueName: 'The Chicago Theatre' }),
  },
  {
    id: 'newsletter_blast',
    name: 'Newsletter Blast',
    description: 'Sent to all fans & subscribers from the admin dashboard.',
    category: 'Newsletter',
    status: 'live' as const,
    render: () => newsletterBlast({
      subject: '🎸 New Show Announced — Chicago June 15th!',
      body: 'Hey 7th Heaven family!\n\nWe\'re thrilled to announce we\'ll be playing at the legendary House of Blues in Chicago on June 15th!\n\nThis is going to be an incredible night of music, energy, and connection.\n\nDoors open at 7pm. VIP meet & greet starts at 6pm.\n\nDon\'t miss it!',
    }),
  },
  {
    id: 'cruise_confirmation',
    name: 'Cruise Signup Confirmation',
    description: 'Sent to fans after signing up for the cruise interest list with guest roster.',
    category: 'Cruise',
    status: 'live' as const,
    render: () => cruiseConfirmation({
      name: 'Michael Scimeca',
      guestCount: 5,
      cancelToken: 'demo-token-preview',
      guests: [
        { name: 'Sarah Johnson', email: 'sarah@example.com', phone: '(312) 555-0102', type: 'adult' },
        { name: 'Jake Johnson', email: 'jake@example.com', phone: '(312) 555-0103', type: 'adult' },
        { name: 'Lily Johnson', type: 'child', age: '8' },
        { name: 'Max Johnson', type: 'child', age: '5' },
      ],
    }),
  },
];

// ═══════════════════════════════════════════════
// 8. WELCOME — FAN (sent after fan account creation)
// ═══════════════════════════════════════════════
export function welcomeFan(data: { name: string }) {
  return wrap(`
    <h1 style="margin:0 0 8px;color:#fff;font-size:26px;font-weight:900;text-align:center;">Welcome to the Family 🎸</h1>
    <p style="margin:0 0 28px;color:rgba(255,255,255,0.4);font-size:13px;text-align:center;">You're officially in the 7th Heaven community.</p>
    <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;margin:0 0 28px;">
      Hey <strong style="color:#fff;">${sanitize(data.name)}</strong>, thanks for signing up! You now have access to:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr><td style="padding:12px 16px;background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.15);border-radius:10px;margin-bottom:8px;">
        <p style="margin:0 0 6px;color:#a78bfa;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">YOUR FAN PERKS</p>
        <p style="margin:0;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.8;">
          🎵 Fan Dashboard with VIP rewards<br/>
          📸 Submit photos to the Fan Wall<br/>
          🎟️ Enter live raffles for merch & prizes<br/>
          📡 Get proximity alerts for nearby shows<br/>
          🚢 Early access to cruise signups
        </p>
      </td></tr>
    </table>
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://7thheavenband.com'}/fans" style="${btnStyle}">Open My Dashboard</a>
    </div>
  `);
}

// ═══════════════════════════════════════════════
// 9. WELCOME — PLANNER (sent after planner account creation)
// ═══════════════════════════════════════════════
export function welcomePlanner(data: { name: string; email: string }) {
  return wrap(`
    <h1 style="margin:0 0 8px;color:#fff;font-size:26px;font-weight:900;text-align:center;">Your Planner Account is Ready 📋</h1>
    <p style="margin:0 0 28px;color:rgba(255,255,255,0.4);font-size:13px;text-align:center;">Manage your events with 7th Heaven in one place.</p>
    <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;margin:0 0 28px;">
      Hey <strong style="color:#fff;">${sanitize(data.name)}</strong>, your planner account has been created. You can now:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr><td style="padding:12px 16px;background:rgba(20,184,166,0.1);border:1px solid rgba(20,184,166,0.15);border-radius:10px;">
        <p style="margin:0 0 6px;color:#2dd4bf;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">PLANNER TOOLS</p>
        <p style="margin:0;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.8;">
          📊 Track the status of all your bookings<br/>
          📝 View event details & timelines<br/>
          🔁 Quickly rebook for future events<br/>
          ❌ Cancel bookings with one click
        </p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr><td style="padding:12px 16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;">
        <p style="margin:0 0 4px;color:rgba(255,255,255,0.3);font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">YOUR LOGIN</p>
        <p style="margin:0;color:rgba(255,255,255,0.7);font-size:14px;font-family:monospace;">${sanitize(data.email)}</p>
      </td></tr>
    </table>
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://7thheavenband.com'}/planner" style="${btnStyle}">Go to Planner Dashboard</a>
    </div>
  `);
}

// ═══════════════════════════════════════════════
// 10. BOOKING STATUS UPDATE (approved / cancelled / completed)
// ═══════════════════════════════════════════════
export function bookingStatusUpdate(b: {
  name: string; bookingId: string; status: 'confirmed' | 'cancelled' | 'completed';
  eventDate: string; venueName?: string; venueCity: string; venueState: string; eventType: string;
}) {
  const statusConfig = {
    confirmed: { emoji: '✅', color: '#10b981', label: 'Confirmed', msg: 'Great news! Your booking has been approved.' },
    cancelled: { emoji: '❌', color: '#ef4444', label: 'Cancelled', msg: 'Your booking has been cancelled.' },
    completed: { emoji: '🎉', color: '#a78bfa', label: 'Completed', msg: 'Your event has been marked as completed. Thank you!' },
  };
  const s = statusConfig[b.status];
  return wrap(`
    <h1 style="margin:0 0 8px;color:#fff;font-size:26px;font-weight:900;text-align:center;">${s.emoji} Booking ${s.label}</h1>
    <p style="margin:0 0 28px;color:rgba(255,255,255,0.4);font-size:13px;text-align:center;">${s.msg}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr><td style="padding:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:6px 0;"><span style="color:rgba(255,255,255,0.3);font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">BOOKING ID</span></td><td style="padding:6px 0;text-align:right;color:#a78bfa;font-size:14px;font-weight:700;font-family:monospace;">${sanitize(b.bookingId)}</td></tr>
          <tr><td style="padding:6px 0;"><span style="color:rgba(255,255,255,0.3);font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">STATUS</span></td><td style="padding:6px 0;text-align:right;"><span style="background:${s.color}22;color:${s.color};font-size:11px;font-weight:800;padding:4px 12px;border-radius:6px;letter-spacing:1px;text-transform:uppercase;">${s.label}</span></td></tr>
          <tr><td style="padding:6px 0;"><span style="color:rgba(255,255,255,0.3);font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">EVENT TYPE</span></td><td style="padding:6px 0;text-align:right;color:rgba(255,255,255,0.7);font-size:14px;">${sanitize(b.eventType).replace('_', ' ')}</td></tr>
          <tr><td style="padding:6px 0;"><span style="color:rgba(255,255,255,0.3);font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">DATE</span></td><td style="padding:6px 0;text-align:right;color:rgba(255,255,255,0.7);font-size:14px;">${sanitize(b.eventDate)}</td></tr>
          <tr><td style="padding:6px 0;"><span style="color:rgba(255,255,255,0.3);font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">VENUE</span></td><td style="padding:6px 0;text-align:right;color:rgba(255,255,255,0.7);font-size:14px;">${sanitize(b.venueName) || 'TBD'} — ${sanitize(b.venueCity)}, ${sanitize(b.venueState)}</td></tr>
        </table>
      </td></tr>
    </table>
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://7thheavenband.com'}/planner" style="${btnStyle}">View in Dashboard</a>
    </div>
  `);
}
