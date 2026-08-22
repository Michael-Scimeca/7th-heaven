// ─── Centralized Email Templates for 7th Heaven ───
// All templates use the same dark brand wrapper for consistency.

function sanitize(str: string | undefined | null): string {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getInitials(name: string | undefined | null): string {
  if (!name) return 'C';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
}

// ── Brand wrapper shared by all templates ──
function wrap(content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark only"><meta name="supported-color-schemes" content="dark only"></head>
<body style="margin:0;padding:0;background-color:#050508;background:#050508;color:#ffffff;font-family:-apple-system,system-ui,'Segoe UI',Roboto,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050508;background:#050508;padding:40px 16px;"><tr><td align="center"><table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;"><!-- Header -->
<tr><td style="background-color:#7c3aed;background:linear-gradient(135deg,#7c3aed,#a855f7);padding:20px 40px;text-align:center;border-radius:16px 16px 0 0;"><p style="margin:0;color:#fff;font-size:18px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">7TH HEAVEN</p>
</td></tr>
<!-- Body -->
<tr><td style="background-color:#0a0a0f;background:#0a0a0f;padding:40px 32px;border-left:1px solid rgba(255,255,255,0.05);border-right:1px solid rgba(255,255,255,0.05);">${content}
</td></tr>
<!-- Footer -->
<tr><td style="background-color:#08080c;background:#08080c;padding:24px 32px;text-align:center;border:1px solid rgba(255,255,255,0.05);border-top:none;border-radius:0 0 16px 16px;"><p style="margin:0 0 8px;color:#444;font-size:11px;">© ${new Date().getFullYear()} 7th Heaven — All rights reserved</p>
<p style="margin:0 0 8px;color:#7c3aed;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">7thheavenband.com</p>
<p style="margin:0 0 6px;color:#333;font-size:10px;">7th Heaven · Chicago, IL 60601</p>
<p style="margin:0;font-size:10px;"><a href="https://7thheavenband.com/api/newsletter/unsubscribe?email={{email}}" style="color:#555;text-decoration:underline;">Unsubscribe</a> · <a href="https://7thheavenband.com/privacy" style="color:#555;text-decoration:underline;">Privacy Policy</a></p>
</td></tr>
</table></td></tr></table></body></html>`;
}

// ── Shared button style ──
const btnStyle = `display:inline-block;background-color:#7c3aed;background:#7c3aed;color:#fff;font-weight:800;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 36px;border-radius:10px;`;
const btnGold = `display:inline-block;background-color:#c084fc;background:#c084fc;color:#000;font-weight:900;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 36px;border-radius:10px;`;

// ═══════════════════════════════════════════════
// 1. BOOKING CONFIRMATION (sent to planner)
// ═══════════════════════════════════════════════
export function bookingConfirmation(b: {
  name: string; bookingId: string; eventType: string; eventDate: string;
  startTime?: string; endTime?: string; venueName?: string; venueCity: string; venueState: string;
  phone?: string; organization?: string; indoorOutdoor?: string; expectedAttendance?: string;
  details?: string; cancelToken?: string;
}) {
  const cancelUrl = b.cancelToken ? `https://7thheavenband.com/book/cancel?token=${b.cancelToken}&id=${b.bookingId}` : 'https://7thheavenband.com/planner';
  const dashboardUrl = 'https://7thheavenband.com/planner';
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://7thheavenband.com';
  const icsUrl = `${SITE_URL}/api/calendar/ics?bookingId=${encodeURIComponent(b.bookingId)}&date=${encodeURIComponent(b.eventDate)}&venue=${encodeURIComponent(b.venueName || '')}&city=${encodeURIComponent(b.venueCity)}&state=${encodeURIComponent(b.venueState)}&eventType=${encodeURIComponent(b.eventType)}&startTime=${encodeURIComponent(b.startTime || '')}&endTime=${encodeURIComponent(b.endTime || '')}`;
  const td1 = 'padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;width:140px;vertical-align:top;';
  const td2 = 'padding:8px 0;color:#fff;font-size:14px;font-weight:600;';
  return wrap(`
    <h1 style="margin:0 0 8px;color:#fff;font-size:26px;font-weight:900;text-align:center;">Booking Request Received</h1><p style="margin:0 0 28px;color:rgba(255,255,255,0.4);font-size:13px;text-align:center;">We'll review your details and get back to you within 24–48 hours.</p>
    <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;margin:0 0 24px;">Hey <strong style="color:#fff;">${sanitize(b.name)}</strong>, thanks for reaching out! Here's a full summary of what you submitted.
</p>
    <div style="background:rgba(255,10,61,0.08);border:1px solid rgba(255,10,61,0.25);border-radius:12px;padding:18px 24px;margin-bottom:24px;"><p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.35);font-weight:700;">Your Booking ID</p>
      <p style="margin:0;font-size:22px;font-weight:900;color:#a855f7;">${sanitize(b.bookingId)}</p>
</div>
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:20px;"><p style="margin:0 0 14px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);font-weight:700;">Event Details</p>
      <table style="width:100%;border-collapse:collapse;"><tr><td style="${td1}">Event Type</td><td style="${td2}">${sanitize(b.eventType)}</td></tr>
        <tr><td style="${td1}">Date</td><td style="${td2}">${sanitize(b.eventDate)}</td></tr>
        <tr><td style="${td1}">Time</td><td style="${td2}">${sanitize(b.startTime) || 'TBD'} – ${sanitize(b.endTime) || 'TBD'}</td></tr>
        <tr><td style="${td1}">Venue</td><td style="${td2}">${sanitize(b.venueName) || 'Not specified'}</td></tr>
        <tr><td style="${td1}">Location</td><td style="${td2}">${sanitize(b.venueCity)}, ${sanitize(b.venueState)}</td></tr>
        ${b.indoorOutdoor ? `<tr><td style="${td1}">Indoor/Outdoor</td><td style="${td2}">${sanitize(b.indoorOutdoor)}</td></tr>` : ''}
        ${b.expectedAttendance ? `<tr><td style="${td1}">Attendance</td><td style="${td2}">${sanitize(b.expectedAttendance)}</td></tr>` : ''}
      </table>
</div>
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:20px;"><p style="margin:0 0 14px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);font-weight:700;">Your Contact Info</p>
      <table style="width:100%;border-collapse:collapse;"><tr><td style="${td1}">Name</td><td style="${td2}">${sanitize(b.name)}</td></tr>
        ${b.phone ? `<tr><td style="${td1}">Phone</td><td style="${td2}">${sanitize(b.phone)}</td></tr>` : ''}
        ${b.organization ? `<tr><td style="${td1}">Organization</td><td style="${td2}">${sanitize(b.organization)}</td></tr>` : ''}
      </table>
</div>
    ${b.details ? `<div style="background:rgba(255,10,61,0.05);border:1px solid rgba(255,10,61,0.15);border-radius:12px;padding:20px;margin-bottom:20px;"><p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.3);font-weight:700;">Additional Notes</p><p style="margin:0;color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;">${sanitize(b.details)}</p></div>` : ''}
    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px;margin-bottom:24px;"><p style="margin:0 0 14px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#a855f7;font-weight:800;">What Happens Next</p>
      <table style="width:100%;border-spacing:0 8px;"><tr><td style="color:#a855f7;font-weight:900;font-size:15px;width:28px;vertical-align:top;padding-right:12px;">1</td><td style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5;">Our team reviews your request within <strong style="color:#fff;">24–48 hours</strong>.</td></tr>
        <tr><td style="color:#a855f7;font-weight:900;font-size:15px;width:28px;vertical-align:top;padding-right:12px;">2</td><td style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5;">We reach out to confirm availability and discuss your event.</td></tr>
        <tr><td style="color:#a855f7;font-weight:900;font-size:15px;width:28px;vertical-align:top;padding-right:12px;">3</td><td style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.5;">You'll receive a final quote and contract once confirmed.</td></tr>
      </table>
</div>
    <div style="text-align:center;margin-bottom:16px;"><a href="${icsUrl}" style="display:inline-block;padding:8px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#a855f7;font-size:12px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:1px;">Add to Google / Outlook Calendar (.ics)</a>
</div>
    <div style="text-align:center;margin-bottom:24px;"><a href="${dashboardUrl}" style="${btnStyle}">View My Booking Dashboard</a>
</div>
    <p style="color:rgba(255,255,255,0.35);font-size:13px;text-align:center;margin:0 0 12px;">Questions? <a href="mailto:7thheaven@gmail.com" style="color:#a855f7;text-decoration:none;">7thheaven@gmail.com</a></p>
    <p style="text-align:center;margin:0;"><a href="${cancelUrl}" style="color:rgba(255,255,255,0.2);font-size:12px;text-decoration:underline;">Cancel this booking request</a></p>
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
  const replyMailto = `mailto:${b.email}?subject=Re: Booking ${b.bookingId} — 7th Heaven`;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://7thheavenband.com';
  const icsUrl = `${SITE_URL}/api/calendar/ics?bookingId=${encodeURIComponent(b.bookingId)}&date=${encodeURIComponent(b.eventDate)}&venue=${encodeURIComponent(b.venueName || '')}&city=${encodeURIComponent(b.venueCity)}&state=${encodeURIComponent(b.venueState)}&eventType=${encodeURIComponent(b.eventType)}&startTime=${encodeURIComponent(b.startTime || '')}&endTime=${encodeURIComponent(b.endTime || '')}`;
  const td1 = 'padding:6px 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;width:140px;vertical-align:top;';
  const td2 = 'padding:6px 0;color:#fff;font-size:14px;font-weight:600;';
  return wrap(`
    <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#a855f7;font-weight:800;text-align:center;">New Booking Request</p>
    <h1 style="margin:0 0 20px;font-size:24px;font-weight:900;color:#fff;text-align:center;">${sanitize(b.bookingId)}</h1><div style="text-align:center;margin-bottom:24px;"><a href="${replyMailto}" style="${btnStyle}">Reply to ${sanitize(b.name)} →</a>
      ${b.phone ? `<br/><a href="tel:${sanitize(b.phone)}" style="display:inline-block;margin-top:8px;color:#a855f7;font-size:14px;font-weight:600;text-decoration:none;">${sanitize(b.phone)}</a>` : ''}
      <br/><a href="${icsUrl}" style="display:inline-block;margin-top:12px;padding:6px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#a855f7;font-size:11px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:1px;">Add to Calendar (.ics)</a>
</div>
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:16px;"><p style="margin:0 0 14px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);font-weight:700;">Planner Contact</p>
      <table style="width:100%;border-collapse:collapse;"><tr><td style="${td1}">Name</td><td style="${td2}">${sanitize(b.name)}</td></tr>
        <tr><td style="${td1}">Email</td><td style="${td2};color:#a855f7;">${sanitize(b.email)}</td></tr>
        <tr><td style="${td1}">Phone</td><td style="${td2}">${sanitize(b.phone) || 'N/A'}</td></tr>
        <tr><td style="${td1}">Organization</td><td style="${td2}">${sanitize(b.organization) || 'N/A'}</td></tr>
      </table>
</div>
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:16px;"><p style="margin:0 0 14px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);font-weight:700;">Event Details</p>
      <table style="width:100%;border-collapse:collapse;"><tr><td style="${td1}">Event Type</td><td style="${td2}">${sanitize(b.eventType)}</td></tr>
        <tr><td style="${td1}">Date</td><td style="${td2}">${sanitize(b.eventDate)}</td></tr>
        <tr><td style="${td1}">Time</td><td style="${td2}">${sanitize(b.startTime) || 'TBD'} – ${sanitize(b.endTime) || 'TBD'}</td></tr>
        <tr><td style="${td1}">Venue</td><td style="${td2}">${sanitize(b.venueName) || 'Not specified'}</td></tr>
        <tr><td style="${td1}">Location</td><td style="${td2}">${sanitize(b.venueCity)}, ${sanitize(b.venueState)}</td></tr>
        <tr><td style="${td1}">Indoor/Outdoor</td><td style="${td2}">${sanitize(b.indoorOutdoor) || 'N/A'}</td></tr>
        <tr><td style="${td1}">Attendance</td><td style="${td2}">${sanitize(b.expectedAttendance) || 'N/A'}</td></tr>
      </table>
</div>
    ${b.details ? `<div style="background:rgba(255,10,61,0.05);border:1px solid rgba(255,10,61,0.15);border-radius:12px;padding:16px;"><p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.3);font-weight:700;">Notes from Planner</p><p style="margin:0;color:rgba(255,255,255,0.7);font-size:14px;line-height:1.5;">${sanitize(b.details)}</p></div>` : ''}
  `);
}

// ═══════════════════════════════════════════════
// 2.5 BOOKING CANCELLED ALERT (sent to admin)
// ═══════════════════════════════════════════════
export function bookingCancelledAdminAlert(b: {
  bookingId: string; eventDate: string; eventType: string;
}) {
  return wrap(`
    <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#ef4444;font-weight:800;text-align:center;">Booking Cancelled</p>
    <h1 style="margin:0 0 24px;font-size:24px;font-weight:900;color:#fff;text-align:center;">${sanitize(b.bookingId)}</h1><div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:16px;text-align:center;"><p style="margin:0 0 16px;color:rgba(255,255,255,0.7);font-size:15px;">The event planner just cancelled this booking using their token link. This date is now open again.</p>
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
    `<td style="width:48px;height:56px;background:#0a0a0e;border:2px solid #c084fc;border-radius:8px;text-align:center;font-size:28px;font-weight:900;color:#c084fc;font-family:monospace;">${d}</td>`
  ).join('<td style="width:8px;"></td>');

  const lowerPrize = b.prizeName.toLowerCase();
  let imgPath = '/images/merch/vinyl.png';
  if (lowerPrize.includes('shirt') || lowerPrize.includes('tee')) {
    imgPath = '/images/merch/logo-tee.png';
  } else if (lowerPrize.includes('hood') || lowerPrize.includes('sweat')) {
    imgPath = '/images/merch/hoodie.png';
  }
  const fullImgUrl = imgPath;

  return wrap(`
    <div style="text-align:center;"><h1 style="margin:0 0 12px;color:#fff;font-size:28px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">YOU WON THE RAFFLE</h1><p style="margin:0 0 32px;color:#888;font-size:15px;">Congratulations — your name was drawn live!</p>
      
      <div style="background:#0a0a0e;border:2px solid #c084fc;border-radius:12px;padding:24px;margin-bottom:28px;text-align:center;"><p style="margin:0 0 16px;color:#92600a;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Your Prize</p>
        <div style="margin-bottom:16px;"><img src="${fullImgUrl}" alt="${sanitize(b.prizeName)}" width="120" height="120" style="border-radius:8px;border:1px solid rgba(255,255,255,0.1);display:inline-block;" />
</div>
        <p style="margin:0;color:#fff;font-size:22px;font-weight:900;">${sanitize(b.prizeName)}</p>
        <p style="margin:8px 0 0;color:#c084fc;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Size: ${lowerPrize.includes('shirt') || lowerPrize.includes('tee') || lowerPrize.includes('hood') || lowerPrize.includes('sweat') ? 'S / M / L / XL / XXL (Select at Pickup/Checkout)' : 'Any Size'}
</p>
</div>

      ${b.pin ? `
        <p style="margin:0 0 12px;color:#555;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Your Claim PIN</p>
        <table cellpadding="0" cellspacing="0" style="margin:0 auto 8px;"><tr>${pinDigits}</tr></table>
        <p style="margin:0 0 24px;color:#444;font-size:11px;">Show this PIN to the crew at the merch table</p>
      ` : ''}
      ${b.claimUrl ? `
        <div style="margin:0 auto 28px;text-align:center;"><p style="margin:0 0 12px;color:#555;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">One-Time Use QR Code</p>
          <div style="display:inline-block;padding:12px;background:#fff;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.5);"><img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(b.claimUrl)}" width="140" height="140" alt="Claim QR Code" style="display:block;" />
</div>
          <p style="margin:12px 0 0;color:#ef4444;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">SINGLE-USE REDEMPTION ONLY</p>
</div>
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
    <div style="text-align:center;"><h1 style="margin:0 0 12px;color:#c084fc;font-size:24px;font-weight:900;text-transform:uppercase;">Raffle Entry Confirmed</h1><p style="margin:0 0 24px;color:rgba(255,255,255,0.6);font-size:15px;line-height:1.6;">You've been entered to win <strong style="color:#fff;">${sanitize(b.prizeName)}</strong>. Stay tuned — the winner will be drawn live on stream!
</p>
      <p style="margin:0;color:rgba(255,255,255,0.3);font-size:13px;">Good luck!</p>
</div>
  `);
}

// 4.5. RAFFLE Thanks for Trying
export function raffleLoss(b: { prizeName: string }) {
  return wrap(`
    <div style="text-align:center;"><h1 style="margin:0 0 12px;color:#F43F5E;font-size:24px;font-weight:900;text-transform:uppercase;">Thanks For Trying</h1><p style="margin:0 0 24px;color:rgba(255,255,255,0.6);font-size:15px;line-height:1.6;">Thank you for entering our live stream raffle for <strong style="color:#fff;">${sanitize(b.prizeName)}</strong>.
        Unfortunately, your name wasn't drawn this time.
</p>
      <p style="margin:0 0 28px;color:rgba(255,255,255,0.4);font-size:14px;line-height:1.6;">Don't worry — we host drawings regularly during our live streams. Stay tuned and try your luck in the next one!
</p>
      <p style="margin:0;color:rgba(255,255,255,0.3);font-size:13px;">Better luck next time!</p>
</div>
  `);
}



// ═══════════════════════════════════════════════
// 8. NEWSLETTER BLAST
// ═══════════════════════════════════════════════
export function newsletterBlast(b: { subject: string; body: string }) {
  return wrap(`
    <div style="text-align:center;margin-bottom:28px;"><p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:4px;color:#a855f7;font-weight:800;">Announcement</p>
      <h1 style="margin:0;font-size:26px;font-weight:900;color:#fff;letter-spacing:-0.5px;">${sanitize(b.subject)}</h1></div>
    <div style="color:rgba(255,255,255,0.75);font-size:15px;line-height:1.7;white-space:pre-wrap;margin-bottom:32px;">${sanitize(b.body)}</div>
    <div style="text-align:center;"><a href="https://7thheavenband.com" style="${btnStyle}">Visit 7th Heaven</a>
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
        ? `<span style="display:inline-block;padding:2px 8px;background:rgba(6,182,212,0.15);color:#06b6d4;font-size:10px;font-weight:700;border-radius:6px;text-transform:uppercase;letter-spacing:1px;">Child${g.age ? ' · Age ' + g.age : ''}</span>`
        : `<span style="display:inline-block;padding:2px 8px;background:rgba(138,28,252,0.1);color:#8a1cfc;font-size:10px;font-weight:700;border-radius:6px;text-transform:uppercase;letter-spacing:1px;">Adult</span>`;
      const contact = !isChild && (g.email || g.phone)
        ? `<br/><span style="color:rgba(255,255,255,0.25);font-size:11px;">${g.email || ''}${g.email && g.phone ? ' · ' : ''}${g.phone || ''}</span>`
        : '';
      return `<tr>
        <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);"><div><span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:${isChild ? '#06b6d4' : '#8a1cfc'};color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:28px;">${g.name ? g.name[0].toUpperCase() : (i + 2)}</span>
          <span style="color:#fff;font-size:13px;font-weight:600;margin-left:8px;">${g.name || 'Guest ' + (i + 2)}</span>${contact}</div>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);text-align:right;vertical-align:middle;">${badge}</td>
      </tr>`;
    }).join('');

    guestRosterHtml = `
      <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:0;margin-bottom:24px;overflow:hidden;"><div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.05);"><p style="margin:0;color:rgba(255,255,255,0.3);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;">Your Group</p>
</div>
        <table style="width:100%;border-spacing:0;"><tr>
            <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);"><div><span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#8a1cfc;color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:28px;">${b.name ? b.name[0].toUpperCase() : '1'}</span>
              <span style="color:#fff;font-size:13px;font-weight:600;margin-left:8px;">${b.name}</span>
              <span style="color:rgba(255,255,255,0.25);font-size:11px;margin-left:4px;">(you)</span></div>
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);text-align:right;"><span style="display:inline-block;padding:2px 8px;background:rgba(138,28,252,0.1);color:#8a1cfc;font-size:10px;font-weight:700;border-radius:6px;text-transform:uppercase;letter-spacing:1px;">Primary</span>
            </td>
          </tr>
          ${guestRows}
        </table>
</div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><meta name="color-scheme" content="dark only"><meta name="supported-color-schemes" content="dark only"></head>
<body style="margin:0;padding:0;background-color:#0a0a0f;background:#0a0a0f;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"><div style="max-width:560px;margin:0 auto;padding:40px 24px;"><div style="text-align:center;margin-bottom:32px;"><h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;font-style:italic;letter-spacing:-0.5px;">You're on the List!</h1><p style="margin:8px 0 0;color:rgba(255,255,255,0.4);font-size:14px;">7th Heaven Cruise — Interest Confirmed</p>
</div>
    <div style="background-color:#111118;background:#111118;border:1px solid rgba(138,28,252,0.3);border-radius:16px;padding:32px;margin-bottom:24px;"><p style="margin:0 0 16px;color:#fff;font-size:16px;">Hey <strong>${b.name}</strong>,</p>
      <p style="margin:0 0 16px;color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">Thanks for signing up for the <strong style="color:#fff;">7th Heaven Caribbean Cruise</strong>!
        We've got you down for <strong style="color:#8a1cfc;">${b.guestCount} ${b.guestCount > 1 ? 'people' : 'person'}</strong> in your group.
</p>
      <p style="margin:0 0 24px;color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">This is <strong style="color:#fff;">not a booking</strong> — it's a free interest signup. The more fans who sign up,
        the better group rate we can negotiate with cruise management.
</p>
      ${guestRosterHtml}
      <div style="background:rgba(138,28,252,0.05);border:1px solid rgba(138,28,252,0.15);border-radius:12px;padding:20px;margin-bottom:24px;"><p style="margin:0 0 12px;color:#8a1cfc;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;">What Happens Next</p>
        <table style="width:100%;border-spacing:0 8px;"><tr><td style="color:#8a1cfc;font-weight:900;font-size:14px;width:24px;vertical-align:top;padding-right:10px;">1</td><td style="color:rgba(255,255,255,0.5);font-size:13px;">We collect interest and build the headcount</td></tr>
          <tr><td style="color:#8a1cfc;font-weight:900;font-size:14px;width:24px;vertical-align:top;padding-right:10px;">2</td><td style="color:rgba(255,255,255,0.5);font-size:13px;">We negotiate the best group rate with the cruise line</td></tr>
          <tr><td style="color:#8a1cfc;font-weight:900;font-size:14px;width:24px;vertical-align:top;padding-right:10px;">3</td><td style="color:rgba(255,255,255,0.5);font-size:13px;">You get <strong style="color:#fff;">first access</strong> to book at the locked-in price</td></tr>
        </table>
</div>
      <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:20px;"><p style="margin:0 0 12px;color:rgba(255,255,255,0.3);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;">Cruise Overview</p>
        <table style="width:100%;border-spacing:0 6px;"><tr><td style="color:rgba(255,255,255,0.3);font-size:12px;width:90px;">Route</td><td style="color:#fff;font-size:13px;font-weight:600;">Miami → Caribbean → Miami</td></tr>
          <tr><td style="color:rgba(255,255,255,0.3);font-size:12px;">Duration</td><td style="color:#fff;font-size:13px;font-weight:600;">7 Nights</td></tr>
          <tr><td style="color:rgba(255,255,255,0.3);font-size:12px;">Islands</td><td style="color:#fff;font-size:13px;font-weight:600;">Cozumel · Grand Cayman · Roatán</td></tr>
          <tr><td style="color:rgba(255,255,255,0.3);font-size:12px;">Shows</td><td style="color:#fff;font-size:13px;font-weight:600;">6 Live Performances</td></tr>
          <tr><td style="color:rgba(255,255,255,0.3);font-size:12px;">Your Group</td><td style="color:#8a1cfc;font-size:13px;font-weight:700;">${b.guestCount} ${b.guestCount > 1 ? 'people' : 'person'}</td></tr>
        </table>
</div>
</div>
    <div style="text-align:center;margin-bottom:32px;"><p style="margin:0 0 12px;color:rgba(255,255,255,0.4);font-size:13px;">Help us get a better rate — spread the word!</p>
      <a href="https://7thheavenband.com/cruise" style="display:inline-block;padding:12px 32px;background:#8a1cfc;color:#fff;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;text-decoration:none;border-radius:10px;">Share the Cruise Page</a>
</div>
    <div style="text-align:center;padding-top:24px;border-top:1px solid rgba(255,255,255,0.05);"><p style="margin:0 0 8px;color:rgba(255,255,255,0.2);font-size:11px;">7th Heaven · Chicago, IL 60601</p>
      <p style="margin:0 0 6px;color:rgba(255,255,255,0.15);font-size:11px;">Changed your mind? <a href="${cancelUrl}" style="color:rgba(138,28,252,0.6);text-decoration:underline;">Cancel your signup</a></p>
      <p style="margin:0;font-size:10px;"><a href="https://7thheavenband.com/api/newsletter/unsubscribe?email={{email}}" style="color:rgba(255,255,255,0.15);text-decoration:underline;">Unsubscribe from all emails</a> · <a href="https://7thheavenband.com/privacy" style="color:rgba(255,255,255,0.15);text-decoration:underline;">Privacy</a></p>
</div>
</div>
</body></html>`;
}

export function plannerPinVerification(pin: string = '582901', email: string = 'planner@example.com') {
  return wrap(`
    <div style="text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#a855f7;font-weight:800;">SECURITY VERIFICATION</p>
      <h1 style="margin:0 0 8px;color:#fff;font-size:26px;font-weight:900;">Planner Access Security PIN</h1>
      <p style="margin:0;color:rgba(255,255,255,0.5);font-size:13px;">Enter the 6-digit verification code below to authorize your 7th Heaven Planner Dashboard account.</p>
    </div>

    <!-- Glowing 6-Digit PIN Box -->
    <div style="background:rgba(124,58,237,0.08);border:2px solid rgba(168,85,247,0.4);border-radius:16px;padding:32px 24px;margin:28px 0;text-align:center;box-shadow:0 12px 40px rgba(124,58,237,0.25);">
      <p style="margin:0 0 10px;font-size:11px;text-transform:uppercase;letter-spacing:2.5px;color:rgba(255,255,255,0.4);font-weight:700;">YOUR 6-DIGIT VERIFICATION PIN</p>
      <div style="font-size:46px;font-weight:900;letter-spacing:14px;color:#ffffff;font-family:monospace;margin:0 auto;text-shadow:0 0 20px rgba(168,85,247,0.8);">
        ${sanitize(pin)}
      </div>
      <p style="margin:14px 0 0;font-size:12px;color:#a855f7;font-weight:600;letter-spacing:1px;">⏱️ EXPIRES IN 10 MINUTES</p>
    </div>

    <!-- Instructions & Details -->
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:24px;">
      <p style="margin:0 0 14px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);font-weight:700;">VERIFICATION DETAILS</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;width:140px;">Requested For</td><td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600;">${sanitize(email)}</td></tr>
        <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Action Required</td><td style="padding:6px 0;color:#a855f7;font-size:14px;font-weight:700;">Enter PIN into the Planner Access Modal</td></tr>
        <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Security Status</td><td style="padding:6px 0;color:#22c55e;font-size:14px;font-weight:700;">Encrypted 256-Bit Auth</td></tr>
      </table>
    </div>

    <!-- CTA Button -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="https://7thheavenband.com/book" style="${btnStyle}">Return to Booking Form →</a>
    </div>

    <p style="color:rgba(255,255,255,0.35);font-size:12px;text-align:center;margin:0;">
      If you did not request this verification PIN, please ignore this message or contact <a href="mailto:support@7thheavenband.com" style="color:#a855f7;text-decoration:none;">support@7thheavenband.com</a>.
    </p>
  `);
}

// ═══════════════════════════════════════════════
// TEMPLATE REGISTRY — used by preview page
// ═══════════════════════════════════════════════
export const EMAIL_TEMPLATES = [
  {
    id: 'auth_pin',
    name: 'Planner Verification PIN',
    description: 'Sent to event planners with a 6-digit security code to verify identity.',
    category: 'Security',
    status: 'live' as const,
    render: () => plannerPinVerification('582901', 'planner@example.com'),
  },
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
      phone: '(312) 555-0187', organization: 'Rivera Entertainment',
      indoorOutdoor: 'Indoor', expectedAttendance: '500',
      details: 'Annual summer gala fundraiser. Please bring full PA setup.',
      cancelToken: 'demo-cancel-token-preview',
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
    id: 'raffle_loss',
    name: 'Raffle Thanks for Trying',
    description: 'Sent to a fan who entered the raffle but did not win.',
    category: 'Live Stream',
    status: 'live' as const,
    render: () => raffleLoss({ prizeName: 'Signed Vinyl Record' }),
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
    id: 'fan_upload_approved',
    name: 'Fan Upload Approved',
    description: 'Sent to a fan when their Photo/Video Wall upload is approved.',
    category: 'Account',
    status: 'live' as const,
    render: () => fanUploadApproved({ name: 'Sarah Johnson', title: 'Front Row at Chicago Theatre!' }),
  },
  {
    id: 'fan_upload_rejected',
    name: 'Fan Upload Rejected',
    description: 'Sent to a fan when their Photo/Video Wall upload is rejected.',
    category: 'Account',
    status: 'live' as const,
    render: () => fanUploadRejected({ name: 'Sarah Johnson', title: 'Front Row at Chicago Theatre!', reason: 'Image contains non-band related advertising or spam text.' }),
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
      subject: ' New Show Announced — Chicago June 15th!',
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
  {
    id: 'cruise_community',
    name: 'Cruise Community Welcome',
    description: 'Sent to fans who opt-in to the community during cruise signup.',
    category: 'Cruise',
    status: 'live' as const,
    render: () => cruiseCommunityWelcome({ name: 'Michael Scimeca' }),
  },
  {
    id: 'cruise_cancellation',
    name: 'Cruise Cancellation',
    description: 'Sent when a fan cancels their cruise interest via token link.',
    category: 'Cruise',
    status: 'live' as const,
    render: () => wrap(`
      <div style="text-align:center;"><h1 style="margin:0 0 12px;color:#fff;font-size:24px;font-weight:900;">Cruise Interest Cancelled</h1><p style="margin:0 0 24px;color:rgba(255,255,255,0.5);font-size:14px;line-height:1.6;">Your cruise interest signup has been removed. If this was a mistake, you can sign up again anytime.</p>
        <a href="https://7thheavenband.com/cruise" style="${btnStyle}">Re-Sign Up</a>
</div>
    `),
  },
  {
    id: 'welcome_crew',
    name: 'Welcome — Crew',
    description: 'Sent to a new crew member when their account is created by admin.',
    category: 'Account',
    status: 'live' as const,
    render: () => welcomeCrew({ name: 'Alex Rivera', email: 'alex@7thheaven.com', username: 'alex_7h', tempPassword: 'x8k2mQ!A1' }),
  },
  {
    id: 'new_account_admin_alert',
    name: 'New Account Alert — Admin',
    description: 'Sent to the site manager when a new account is created (crew, fan, or planner).',
    category: 'Account',
    status: 'live' as const,
    render: () => newAccountAdminAlert({ accountName: 'Alex Rivera', accountEmail: 'alex@7thheaven.com', accountUsername: 'alex_7h', accountRole: 'crew', createdBy: 'Michael Scimeca (Admin)' }),
  },
  {
    id: 'cruise_community_blast',
    name: 'Cruise Community Blast',
    description: 'Sent to all cruise signups with the latest news, updates, and announcements.',
    category: 'Cruise',
    status: 'live' as const,
    render: () => cruiseCommunityBlast({
      subject: ' Cruise Update: Cabin Pricing Preview Coming Soon!',
      body: `<p>Hey Cruiser!</p><p>We're getting closer to locking in our <strong>group rate</strong> with the cruise line. Here's what you need to know:</p><ul><li> <strong>412 fans</strong> have signed up — we're blowing past our goal!</li><li> Cabin pricing preview drops <strong>next Friday, June 6th</strong></li><li> The onboard setlist vote opens next week in the Cruise Hub</li><li> Shore excursion packages will be available for pre-booking soon</li></ul><p>Stay tuned — this is going to be <strong>epic</strong>.</p>`,
    }),
  },
  {
    id: 'fan_invitation',
    name: 'Fan Invitation',
    description: 'Sent when an administrator invites a fan via CSV or text bulk list.',
    category: 'Account',
    status: 'live' as const,
    render: () => fanInvitation({ name: 'Jane Doe', email: 'jane.doe@example.com', pin: '891043' }),
  },
  {
    id: 'crew_hours_summary',
    name: 'Crew Work Hours Summary',
    description: 'Sent to a crew member summarizing their weekly/monthly scheduled hours and capacity load.',
    category: 'Crew',
    status: 'live' as const,
    render: () => crewHoursSummary({
      memberName: 'Abbie Janssen',
      weekHours: 18,
      monthHours: 72,
      maxHours: 40,
      loadPercentage: 45,
      status: 'optimal',
      dateRange: 'Jan 23 - Jan 29, 2026',
      shifts: [
        { date: 'Tue, Jan 24', venue: 'Station 34', time: '4:00 PM - 10:00 PM', role: 'Server' },
        { date: 'Wed, Jan 25', venue: 'Old Republic', time: '5:00 PM - 11:00 PM', role: 'Server' },
        { date: 'Fri, Jan 27', venue: 'The Chicago Theatre', time: '5:00 PM - 11:00 PM', role: 'Server' }
      ]
    }),
  },
  {
    id: 'schedule_change_alert',
    name: 'Schedule Change Alert',
    description: 'Sent to a crew member when their scheduled shift is added, updated, or removed.',
    category: 'Crew',
    status: 'live' as const,
    render: () => scheduleChangeAlert({
      memberName: 'Abbie Janssen',
      actionType: 'updated',
      shifts: [
        { date: 'Tue, Jan 24', venue: 'Station 34', role: 'Server', time: '4:00 PM - 10:00 PM' },
        { date: 'Wed, Jan 25', venue: 'Old Republic', role: 'Server', time: '5:00 PM - 11:00 PM' }
      ]
    }),
  },
  {
    id: 'crew_sms_dispatched_alert',
    name: 'Crew SMS Dispatched Alert',
    description: 'Sent to administrators notifying them that a crew SMS alert has been dispatched with date, time, location, and recipient crew list details.',
    category: 'Crew',
    status: 'live' as const,
    render: () => crewSmsDispatchedAlert({
      message: 'Show Alert for Old Republic (Jul 16): Check in by 4:30 PM today.',
      showDate: 'July 16, 2026',
      showTime: '5:00 PM - 10:00 PM',
      showVenue: 'Old Republic at Elgin, IL',
      recipients: [
        { name: 'Sammy D', phone: '(815) 555-0199', email: 'sammy@7thheaven.com', avatar: 'https://ui-avatars.com/api/?name=Sammy+D&background=ec4899&color=fff', role: 'SERVER', hours: '5:00 PM - 10:00 PM' },
        { name: 'John Doe', phone: '(312) 555-0144', email: 'john@7thheaven.com', avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff', role: 'SERVER', hours: '5:00 PM - 10:00 PM' },
        { name: 'Unique Crew Member', phone: '(708) 555-0188', email: 'unique@7thheaven.com', avatar: 'https://ui-avatars.com/api/?name=Unique+Crew+Member&background=10b981&color=fff', role: 'SERVER', hours: '5:00 PM - 10:00 PM' }
      ]
    }),
  },
  {
    id: 'crew_sms_alert_received',
    name: 'Crew SMS Alert Received',
    description: 'Sent to a crew member when they receive an SMS alert notification.',
    category: 'Crew',
    status: 'live' as const,
    render: () => crewSmsAlertReceived({
      memberName: 'Alex Rivera',
      message: 'Show Alert for Old Republic (Jul 16): Check in by 4:30 PM today.',
      showDate: 'July 16, 2026',
      showTime: '5:00 PM - 10:00 PM',
      showVenue: 'Old Republic at Elgin, IL'
    }),
  },
  {
    id: 'flash_merch_pickup',
    name: ' Flash Merch - Table Pickup',
    description: 'Sent to a fan confirming their live drop purchase for venue pickup (includes PIN and single-use QR code).',
    category: 'Live Stream',
    status: 'live' as const,
    render: () => flashMerchPickup({
      name: 'Michael Scimeca',
      prizeName: '7th Heaven Tour Tee 2026',
      pin: '3501',
      size: 'L',
      color: 'Black',
      description: 'Official 2026 tour tee — premium cotton blend with front & back graphics.',
      imageUrl: 'https://7thheavenband.com/images/merch/logo-tee.png'
    }),
  },
  {
    id: 'flash_merch_shipping',
    name: ' Flash Merch - Shipping',
    description: 'Sent to a fan confirming their live drop purchase for home delivery.',
    category: 'Live Stream',
    status: 'live' as const,
    render: () => flashMerchShipping({
      name: 'Michael Scimeca',
      prizeName: 'Crew Hoodie — Black',
      address: '123 Chicago Ave',
      city: 'Chicago, IL',
      zip: '60611',
      price: '$65.00',
      size: 'L',
      color: 'Black',
      description: 'Heavyweight pullover hoodie with embroidered 7th Heaven crest.',
      imageUrl: 'https://7thheavenband.com/images/merch/hoodie.png'
    }),
  },
  {
    id: 'shift_coverage_request',
    name: 'Shift Coverage Request',
    description: 'Sent to qualified crew members when someone requests coverage for their shift.',
    category: 'Crew',
    status: 'live' as const,
    render: () => shiftCoverageRequest({
      requestingCrewName: 'Abbie Janssen',
      role: 'SERVER',
      date: 'July 24, 2026',
      time: '4:00 PM - 10:00 PM',
      location: 'Station 34',
      shiftId: 'demo-shift-id',
      recipientSlug: 'abbie',
    }),
  },
];

// ═══════════════════════════════════════════════
// 8. WELCOME — FAN (sent after fan account creation)
// ═══════════════════════════════════════════════
export function welcomeFan(data: { name: string }) {
  return wrap(`
    <h1 style="margin:0 0 8px;color:#fff;font-size:26px;font-weight:900;text-align:center;">Welcome to the Family</h1><p style="margin:0 0 28px;color:rgba(255,255,255,0.4);font-size:13px;text-align:center;">You're officially in the 7th Heaven community.</p>
    <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;margin:0 0 28px;">Hey <strong style="color:#fff;">${sanitize(data.name)}</strong>, thanks for signing up! You now have access to:
</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;"><tr><td style="padding:12px 16px;background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.15);border-radius:10px;margin-bottom:8px;"><p style="margin:0 0 6px;color:#a78bfa;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">YOUR FAN PERKS</p>
        <p style="margin:0;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.8;">Fan Dashboard with VIP rewards<br/>
           Submit photos to the Fan Wall<br/>
           Enter live raffles for merch & prizes<br/>
           Get proximity alerts for nearby shows<br/>
           Early access to cruise signups
</p>
      </td></tr>
    </table>
    <div style="text-align:center;margin:24px 0;"><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://7thheavenband.com'}/fans" style="${btnStyle}">Open My Dashboard</a>
</div>
  `);
}

// ═══════════════════════════════════════════════
// 9. WELCOME — PLANNER (sent after planner account creation)
// ═══════════════════════════════════════════════
export function welcomePlanner(data: { name: string; email: string }) {
  return wrap(`
    <h1 style="margin:0 0 8px;color:#fff;font-size:26px;font-weight:900;text-align:center;">Your Planner Account is Ready</h1><p style="margin:0 0 28px;color:rgba(255,255,255,0.4);font-size:13px;text-align:center;">Manage your events with 7th Heaven in one place.</p>
    <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;margin:0 0 28px;">Hey <strong style="color:#fff;">${sanitize(data.name)}</strong>, your planner account has been created. You can now:
</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;"><tr><td style="padding:12px 16px;background:rgba(20,184,166,0.1);border:1px solid rgba(20,184,166,0.15);border-radius:10px;"><p style="margin:0 0 6px;color:#2dd4bf;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">PLANNER TOOLS</p>
        <p style="margin:0;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.8;">Track the status of all your bookings<br/>
           View event details & timelines<br/>
           Quickly rebook for future events<br/>
           Cancel bookings with one click
</p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;"><tr><td style="padding:12px 16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;"><p style="margin:0 0 4px;color:rgba(255,255,255,0.3);font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">YOUR LOGIN</p>
        <p style="margin:0;color:rgba(255,255,255,0.7);font-size:14px;font-family:monospace;">${sanitize(data.email)}</p>
      </td></tr>
    </table>
    <div style="text-align:center;margin:24px 0;"><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://7thheavenband.com'}/planner" style="${btnStyle}">Go to Planner Dashboard</a>
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
    confirmed: { emoji: '', color: '#10b981', label: 'Confirmed', msg: 'Great news! Your booking has been approved.' },
    cancelled: { emoji: '', color: '#ef4444', label: 'Cancelled', msg: 'Your booking has been cancelled.' },
    completed: { emoji: '', color: '#a78bfa', label: 'Completed', msg: 'Your event has been marked as completed. Thank you!' },
  };
  const s = statusConfig[b.status];
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://7thheavenband.com';
  const icsUrl = `${SITE_URL}/api/calendar/ics?bookingId=${encodeURIComponent(b.bookingId)}&date=${encodeURIComponent(b.eventDate)}&venue=${encodeURIComponent(b.venueName || '')}&city=${encodeURIComponent(b.venueCity)}&state=${encodeURIComponent(b.venueState)}&eventType=${encodeURIComponent(b.eventType)}`;

  return wrap(`
    <h1 style="margin:0 0 8px;color:#fff;font-size:26px;font-weight:900;text-align:center;">${s.emoji} Booking ${s.label}</h1><p style="margin:0 0 28px;color:rgba(255,255,255,0.4);font-size:13px;text-align:center;">${s.msg}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;"><tr><td style="padding:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:6px 0;"><span style="color:rgba(255,255,255,0.3);font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">BOOKING ID</span></td><td style="padding:6px 0;text-align:right;color:#a78bfa;font-size:14px;font-weight:700;font-family:monospace;">${sanitize(b.bookingId)}</td></tr>
          <tr><td style="padding:6px 0;"><span style="color:rgba(255,255,255,0.3);font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">STATUS</span></td><td style="padding:6px 0;text-align:right;"><span style="background:${s.color}22;color:${s.color};font-size:11px;font-weight:800;padding:4px 12px;border-radius:6px;letter-spacing:1px;text-transform:uppercase;">${s.label}</span></td></tr>
          <tr><td style="padding:6px 0;"><span style="color:rgba(255,255,255,0.3);font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">EVENT TYPE</span></td><td style="padding:6px 0;text-align:right;color:rgba(255,255,255,0.7);font-size:14px;">${sanitize(b.eventType).replace('_', ' ')}</td></tr>
          <tr><td style="padding:6px 0;"><span style="color:rgba(255,255,255,0.3);font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">DATE</span></td><td style="padding:6px 0;text-align:right;color:rgba(255,255,255,0.7);font-size:14px;">${sanitize(b.eventDate)}</td></tr>
          <tr><td style="padding:6px 0;"><span style="color:rgba(255,255,255,0.3);font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">VENUE</span></td><td style="padding:6px 0;text-align:right;color:rgba(255,255,255,0.7);font-size:14px;">${sanitize(b.venueName) || 'TBD'} — ${sanitize(b.venueCity)}, ${sanitize(b.venueState)}</td></tr>
        </table>
      </td></tr>
    </table>
    ${b.status === 'confirmed' ? `
    <div style="text-align:center;margin-bottom:12px;"><a href="${icsUrl}" style="display:inline-block;padding:8px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#a855f7;font-size:12px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:1px;">Add to Google / Outlook Calendar (.ics)</a>
</div>
    ` : ''}
    <div style="text-align:center;margin:24px 0;"><a href="${SITE_URL}/planner" style="${btnStyle}">View in Dashboard</a>
</div>
  `);
}

// ═══════════════════════════════════════════════
// 11. CRUISE COMMUNITY WELCOME
// ═══════════════════════════════════════════════
export function cruiseCommunityWelcome(b: { name: string; inviteLink?: string }) {
  return wrap(`
    <div style="text-align:center;"><span style="display:inline-block;padding:4px 12px;background:rgba(6,182,212,0.1);color:#06b6d4;font-size:10px;font-weight:900;border-radius:6px;text-transform:uppercase;letter-spacing:2px;margin-bottom:16px;border:1px solid rgba(6,182,212,0.2);">Community Invite</span>
      <h1 style="margin:0 0 12px;color:#fff;font-size:26px;font-weight:900;">Welcome to the Cruise Community</h1><p style="margin:0 0 16px;color:rgba(255,255,255,0.6);font-size:15px;line-height:1.6;">Hey <strong style="color:#fff;">${sanitize(b.name)}</strong>, you're now part of the inner circle for the 7th Heaven Caribbean Cruise!
</p>
      <p style="margin:0 0 24px;color:rgba(255,255,255,0.6);font-size:15px;line-height:1.6;">Because you signed up as the <strong style="color:#06b6d4;">primary guest</strong> for your group, we've automatically created an official 7th Heaven Fan Account for you.
</p>
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px;margin-bottom:28px;text-align:left;"><p style="margin:0 0 12px;color:rgba(255,255,255,0.3);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;">YOUR COMMUNITY PERKS</p>
        <ul style="margin:0;padding:0;list-style:none;color:rgba(255,255,255,0.7);font-size:13px;line-height:1.8;"><li> <strong>Vote on Setlists</strong> for the deck parties</li>
          <li> <strong>Exclusive Deck Maps</strong> & band hangout spots</li>
          <li> <strong>Early Access</strong> to the Cruise Gallery</li>
          <li> <strong>Pre-Cruise Chat</strong> with other fans</li>
        </ul>
</div>
      <a href="${b.inviteLink || 'https://7thheavenband.com/cruise/dashboard'}" style="${btnStyle}">${b.inviteLink ? 'Confirm Email & Access Hub' : 'Access My Cruise Hub'}</a>
      ${b.inviteLink ? `<p style="margin:16px 0 0;color:rgba(255,255,255,0.4);font-size:13px;">Please click the button above to confirm your email and securely set your password.</p>` : ''}
      <p style="margin:24px 0 0;color:rgba(255,255,255,0.2);font-size:11px;">You can opt out of community alerts in your Fan Dashboard settings.</p>
</div>
  `);
}

// ═══════════════════════════════════════════════
// 12. WELCOME — CREW (sent to new crew member by admin)
// ═══════════════════════════════════════════════
export function welcomeCrew(data: { name: string; email: string; username?: string; tempPassword: string }) {
  return wrap(`
    <h1 style="margin:0 0 8px;color:#fff;font-size:26px;font-weight:900;text-align:center;">Welcome to the Crew</h1><p style="margin:0 0 28px;color:rgba(255,255,255,0.4);font-size:13px;text-align:center;">You've been added to the 7th Heaven crew by an admin.</p>
    <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;margin:0 0 28px;">Hey <strong style="color:#fff;">${sanitize(data.name)}</strong>, welcome aboard! Your crew account is live. Here are your login credentials — please change your password after your first login.
</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;"><tr><td style="padding:16px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;"><p style="margin:0 0 12px;color:#10b981;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">YOUR LOGIN CREDENTIALS</p>
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;width:120px;">Email</td>
            <td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600;font-family:monospace;">${sanitize(data.email)}</td>
          </tr>
          ${data.username ? `<tr>
            <td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Username</td>
            <td style="padding:6px 0;color:#10b981;font-size:14px;font-weight:700;">@${sanitize(data.username)}</td>
          </tr>` : ''}
          <tr>
            <td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Temp Password</td>
            <td style="padding:6px 0;color:#c084fc;font-size:16px;font-weight:900;font-family:monospace;letter-spacing:2px;">${sanitize(data.tempPassword)}</td>
          </tr>
        </table>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;"><tr><td style="padding:12px 16px;background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.15);border-radius:10px;"><p style="margin:0 0 6px;color:#a78bfa;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">CREW TOOLS</p>
        <p style="margin:0;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.8;">Go live and broadcast to fans<br/>
           Run live raffles and giveaways<br/>
           Moderate fan photo submissions<br/>
           Post to the live feed during shows<br/>
           View and manage fan accounts
</p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;"><tr><td style="padding:12px 16px;background:rgba(16,185,129,0.05);border:1px solid rgba(16,185,129,0.15);border-radius:10px;"><p style="margin:0 0 6px;color:#10b981;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">ONBOARDING CHECKLIST</p>
        <p style="margin:0;color:rgba(255,255,255,0.6);font-size:12px;line-height:1.6;">Please go to your Profile page and fill in your <strong style="color:#fff;">phone number</strong> and upload a <strong style="color:#fff;">profile picture (avatar)</strong>. This ensures the management can successfully assign you shifts on the Crew Schedule and alert you via group texts!
</p>
      </td></tr>
    </table>
    <div style="background:rgba(192, 132, 252,0.08);border:1px solid rgba(192, 132, 252,0.2);border-radius:10px;padding:14px 16px;margin-bottom:24px;"><p style="margin:0;color:rgba(255,255,255,0.6);font-size:12px;line-height:1.6;"><strong style="color:#c084fc;">Security Notice:</strong> Please change your password immediately after logging in. Never share your credentials via email or text.</p>
</div>
    <div style="text-align:center;margin:24px 0;"><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://7thheavenband.com'}/crew" style="${btnStyle}">Open Crew Dashboard</a>
</div>
  `);
}

// ═══════════════════════════════════════════════
// 13. NEW ACCOUNT ADMIN ALERT (sent to site manager)
// ═══════════════════════════════════════════════
export function newAccountAdminAlert(data: {
  accountName: string; accountEmail: string; accountUsername?: string;
  accountRole: string; createdBy?: string;
}) {
  const roleColors: Record<string, string> = {
    crew: '#10b981', admin: '#9333ea', fan: '#a855f7', event_planner: '#d946ef', merch: '#06b6d4',
  };
  const color = roleColors[data.accountRole] || '#a855f7';
  const roleLabel = data.accountRole === 'event_planner' ? 'Event Planner' : data.accountRole.charAt(0).toUpperCase() + data.accountRole.slice(1);
  const dashboardUrl = 'https://7thheavenband.com/admin';
  const td1 = 'padding:6px 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;width:120px;vertical-align:top;';
  const td2 = 'padding:6px 0;color:#fff;font-size:14px;font-weight:600;';

  return wrap(`
    <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:3px;color:${color};font-weight:800;text-align:center;">New Account Created</p>
    <h1 style="margin:0 0 24px;font-size:24px;font-weight:900;color:#fff;text-align:center;">New ${sanitize(roleLabel)} Account</h1><div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:20px;"><p style="margin:0 0 14px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);font-weight:700;">Account Details</p>
      <table style="width:100%;border-collapse:collapse;"><tr><td style="${td1}">Name</td><td style="${td2}">${sanitize(data.accountName)}</td></tr>
        <tr><td style="${td1}">Email</td><td style="${td2};color:${color};">${sanitize(data.accountEmail)}</td></tr>
        ${data.accountUsername ? `<tr><td style="${td1}">Username</td><td style="${td2}">@${sanitize(data.accountUsername)}</td></tr>` : ''}
        <tr><td style="${td1}">Role</td><td style="${td2}"><span style="display:inline-block;padding:3px 10px;background:${color}22;color:${color};font-size:11px;font-weight:800;border-radius:6px;letter-spacing:1px;text-transform:uppercase;">${sanitize(roleLabel)}</span></td></tr>
        ${data.createdBy ? `<tr><td style="${td1}">Created By</td><td style="${td2}">${sanitize(data.createdBy)}</td></tr>` : ''}
        <tr><td style="${td1}">Created At</td><td style="${td2}">${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td></tr>
      </table>
</div>
    <div style="text-align:center;margin:24px 0;"><a href="${dashboardUrl}" style="${btnStyle}">Open Admin Dashboard</a>
</div>
    <p style="margin:0;color:rgba(255,255,255,0.25);font-size:11px;text-align:center;">This is an automated notification. No action required unless this account was not expected.</p>
  `);
}

// ═══════════════════════════════════════════════
// 14. CRUISE COMMUNITY BLAST (sent to all cruise signups)
// ═══════════════════════════════════════════════
export function cruiseCommunityBlast(data: { subject: string; body: string }) {
  const btnCruise = `display:inline-block;background-color:#06b6d4;background:#06b6d4;color:#fff;font-weight:800;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 36px;border-radius:10px;`;
  const formattedBody = (data.body || '').replace(/<a /gi, '<a style="color:#06b6d4;text-decoration:underline;font-weight:700;" ');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;background:#f8fafc;color:#0f172a;font-family:-apple-system,system-ui,'Segoe UI',Roboto,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;background:#f8fafc;padding:40px 16px;"><tr><td align="center"><table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;"><!-- Cruise Header -->
<tr><td style="background-color:#06b6d4;background:linear-gradient(135deg,#0e7490,#06b6d4,#0891b2);padding:24px 40px;text-align:center;border-radius:16px 16px 0 0;"><p style="margin:0 0 4px;font-size:28px;line-height:1.2;"></p>
<p style="margin:0 0 4px;color:#ffffff !important;font-size:18px;font-weight:900;letter-spacing:4px;text-transform:uppercase;line-height:1.4;">7TH HEAVEN CRUISE</p>
<p style="margin:0;color:rgba(255,255,255,0.85) !important;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;line-height:1.4;">Community Update</p>
</td></tr>
<!-- Body -->
<tr><td style="background-color:#ffffff;background:#ffffff;padding:40px 32px;border:1px solid #e2e8f0;border-top:none;"><h1 style="margin:0 0 24px;color:#0f172a;font-size:24px;font-weight:900;text-align:center;letter-spacing:-0.5px;">${sanitize(data.subject).replace(' ', '')}</h1><div style="color:#334155;font-size:15px;line-height:1.7;margin-bottom:32px;">${formattedBody}</div>
<div style="text-align:center;margin-bottom:0px;"><a href="https://7thheavenband.com/cruise/dashboard" style="${btnCruise}">Open Cruise Hub</a>
</div>
</td></tr>
<!-- Footer -->
<tr><td style="background-color:#f1f5f9;background:#f1f5f9;padding:24px 32px;text-align:center;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;"><p style="margin:0 0 8px;color:#64748b;font-size:11px;">© ${new Date().getFullYear()} 7th Heaven — All rights reserved</p>
<p style="margin:0 0 8px;color:#0891b2;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">7thheavenband.com/cruise</p>
<p style="margin:0 0 6px;color:#94a3b8;font-size:10px;">7th Heaven · Chicago, IL 60601</p>
<p style="margin:0;font-size:10px;"><a href="https://7thheavenband.com/api/newsletter/unsubscribe?email={{email}}" style="color:#64748b;text-decoration:underline;">Unsubscribe</a> · <a href="https://7thheavenband.com/privacy" style="color:#64748b;text-decoration:underline;">Privacy Policy</a></p>
</td></tr>
</table></td></tr></table></body></html>`;
}

// ═══════════════════════════════════════════════
// 15. FAN INVITATION (sent when an admin invites fans in bulk)
// ═══════════════════════════════════════════════
export function fanInvitation(data: { name?: string; email: string; pin: string }) {
  const pinDigits = data.pin.split('').map(d =>
    `<td style="width:48px;height:56px;background:#0a0a0e;border:2px solid #7c3aed;border-radius:8px;text-align:center;font-size:28px;font-weight:900;color:#a78bfa;font-family:monospace;">${d}</td>`
  ).join('<td style="width:8px;"></td>');

  const greeting = data.name ? `Hey <strong>${sanitize(data.name)}</strong>` : `Hello there`;
  const claimUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/?inviteEmail=${encodeURIComponent(data.email)}&invitePin=${data.pin}${data.name ? `&inviteName=${encodeURIComponent(data.name)}` : ''}`;

  return wrap(`
    <h1 style="margin:0 0 8px;color:#fff;font-size:26px;font-weight:900;text-align:center;">You're Invited!</h1><p style="margin:0 0 28px;color:rgba(255,255,255,0.4);font-size:13px;text-align:center;">Join the official 7th Heaven Fan Club</p>
    <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;margin:0 0 24px;">${greeting}, we've invited you to create your official 7th Heaven Fan Club membership!
</p>
    <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;margin:0 0 24px;">Once registered, you'll unlock immediate access to exclusive music drops, live chat feeds, proximity show alerts, and early cruise signups. Your name and email are already on file — just choose a username, set a password, and pick your notification preferences.
</p>
    
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:28px;text-align:center;"><p style="margin:0 0 12px;color:rgba(255,255,255,0.4);font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Your Verification Code</p>
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 8px;"><tr>${pinDigits}</tr></table>
      <p style="margin:0;color:rgba(255,255,255,0.3);font-size:11px;">Use this PIN to verify your email instantly during signup</p>
</div>

    <div style="text-align:center;margin:24px 0;"><a href="${claimUrl}" style="${btnStyle}">Claim Invitation & Sign Up</a>
</div>
    
    <p style="margin:24px 0 0;color:rgba(255,255,255,0.15);font-size:11px;text-align:center;">If you did not expect this invitation, you can safely ignore this email.</p>
  `);
}

// ═══════════════════════════════════════════════
// 16. CREW HOURS SUMMARY
// ═══════════════════════════════════════════════
export function crewHoursSummary(b: {
  memberName: string;
  weekHours: number;
  monthHours: number;
  maxHours: number;
  loadPercentage: number;
  status: 'overloaded' | 'optimal' | 'underutilized';
  dateRange: string;
  shifts?: Array<{ date: string; venue: string; time: string; role: string }>;
}) {
  const statusColor = b.status === 'overloaded' ? '#ef4444' : b.status === 'optimal' ? '#10b981' : '#0ea5e9';
  const statusLabel = b.status.toUpperCase();
  const progressPercent = Math.min(100, b.loadPercentage);

  return wrap(`
    <div style="text-align:center;"><p style="font-size:48px;margin:0 0 16px;">⏱️</p>
      <h1 style="margin:0 0 8px;color:#fff;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:1px;">Work Hours Summary</h1><p style="margin:0 0 24px;color:rgba(255,255,255,0.4);font-size:13px;">Week of ${sanitize(b.dateRange)}</p>
      
      <p style="color:rgba(255,255,255,0.75);font-size:14px;line-height:1.6;margin:0 0 24px;text-align:left;">Hello <strong style="color:#fff;">${sanitize(b.memberName)}</strong>, here is your work hours and capacity load utilization summary for the current scheduling period.
</p>

      <div style="background:#0a0a0f;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:24px;margin-bottom:24px;text-align:left;"><table style="width:100%;border-collapse:collapse;"><tr>
            <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Weekly Scheduled</td>
            <td style="padding:8px 0;text-align:right;color:#fff;font-size:16px;font-weight:800;">${b.weekHours} hrs</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Weekly Limit (Max)</td>
            <td style="padding:8px 0;text-align:right;color:#fff;font-size:16px;font-weight:800;">${b.maxHours} hrs</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Capacity Status</td>
            <td style="padding:8px 0;text-align:right;color:${statusColor};font-size:14px;font-weight:900;letter-spacing:1px;">${statusLabel}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Monthly Total</td>
            <td style="padding:8px 0;text-align:right;color:#fff;font-size:16px;font-weight:800;">${b.monthHours} hrs</td>
          </tr>
        </table>
        
        <div style="margin-top:20px;border-top:1px solid rgba(255,255,255,0.06);padding-top:16px;"><div style="margin-bottom:8px;font-size:12px;font-weight:700;color:rgba(255,255,255,0.5);display:table;width:100%;"><span style="display:table-cell;text-align:left;">CAPACITY LOAD UTILIZATION</span>
            <span style="display:table-cell;text-align:right;color:#fff;">${b.loadPercentage}%</span>
</div>
          <div style="height:8px;background:rgba(255,255,255,0.05);border-radius:4px;overflow:hidden;"><div style="height:100%;background:${statusColor};width:${progressPercent}%;border-radius:4px;"></div>
</div>
</div>

        ${b.shifts && b.shifts.length > 0 ? `
          <div style="margin-top:24px;border-top:1px solid rgba(255,255,255,0.06);padding-top:16px;"><p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);font-weight:700;">Working Schedule Details</p>
            <table style="width:100%;border-collapse:collapse;font-size:13px;">${b.shifts.map((s, idx) => `
                <tr style="${idx < b.shifts!.length - 1 ? 'border-bottom:1px solid rgba(255,255,255,0.04);' : ''}"><td style="padding:10px 0;vertical-align:top;width:120px;"><strong style="color:#fff;font-size:12px;">${sanitize(s.date)}</strong>
                  </td>
                  <td style="padding:10px 0;vertical-align:top;"><div style="font-weight:700;color:#fff;font-size:13px;">${sanitize(s.venue)}</div>
                    <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px;"><span style="color:#10b981;font-weight:bold;text-transform:uppercase;">${sanitize(s.role)}</span>
                      <span style="color:rgba(255,255,255,0.2);margin:0 4px;">&middot;</span>
                      <span>${sanitize(s.time)}</span>
</div>
                  </td>
                </tr>
              `).join('')}
            </table>
</div>
        ` : ''}
</div>

      <div style="background:rgba(124,58,237,0.05);border:1px solid rgba(124,58,237,0.15);border-radius:12px;padding:16px;margin-bottom:28px;text-align:left;"><p style="margin:0;color:rgba(255,255,255,0.7);font-size:12px;line-height:1.5;">ℹ️ Your capacity status is determined by your scheduled hours relative to your configured limit. If you are overloaded or have questions about your hours, please contact your scheduling manager.
</p>
</div>

      <a href="https://7thheavenband.com/crew" style="${btnStyle}">Access Crew Portal</a>
</div>
  `);
}

// ═══════════════════════════════════════════════
// 17. SCHEDULE CHANGE ALERT
// ═══════════════════════════════════════════════
export function scheduleChangeAlert(b: {
  memberName: string;
  actionType: 'added' | 'updated' | 'deleted';
  shifts: Array<{ date: string; venue: string; role: string; time: string }>;
}) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://7thheavenband.com';
  let actionDescription = '';
  if (b.actionType === 'added') {
    actionDescription = `The following shifts have been assigned to you:`;
  } else if (b.actionType === 'updated') {
    actionDescription = `Your shifts have been updated:`;
  } else {
    actionDescription = `The following shifts have been removed from your schedule:`;
  }

  return wrap(`
    <div style="text-align:center;"><h1 style="margin:0 0 8px;color:#fff;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:1px;">Schedule Change Alert</h1><p style="margin:0 0 24px;color:rgba(255,255,255,0.4);font-size:13px;">Shifts ${b.actionType.toUpperCase()}</p>
      
      <p style="color:rgba(255,255,255,0.75);font-size:14px;line-height:1.6;margin:0 0 24px;text-align:left;">Hello <strong style="color:#fff;">${sanitize(b.memberName)}</strong>, ${actionDescription}
</p>

      <div style="background:#0a0a0f;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:24px;margin-bottom:24px;text-align:left;"><p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);font-weight:700;">Shift Schedule Details</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">${b.shifts.map((s, idx) => {
            const icsUrl = `${SITE_URL}/api/calendar/ics?bookingId=crew-shift-${idx}&date=${encodeURIComponent(s.date)}&venue=${encodeURIComponent(s.venue)}&eventType=${encodeURIComponent(s.role)}&startTime=${encodeURIComponent(s.time.split(' - ')[0] || '')}&endTime=${encodeURIComponent(s.time.split(' - ')[1] || '')}`;
            return `
            <tr style="${idx < b.shifts.length - 1 ? 'border-bottom:1px solid rgba(255,255,255,0.04);' : ''}"><td style="padding:12px 0;vertical-align:middle;width:110px;"><strong style="color:#fff;font-size:12px;">${sanitize(s.date)}</strong>
              </td>
              <td style="padding:12px 0;vertical-align:middle;"><div style="font-weight:700;color:#fff;font-size:13px;">${sanitize(s.venue)}</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px;"><span style="color:#10b981;font-weight:bold;text-transform:uppercase;">${sanitize(s.role)}</span>
                  <span style="color:rgba(255,255,255,0.2);margin:0 4px;">&middot;</span>
                  <span>${sanitize(s.time)}</span>
</div>
              </td>
              <td style="padding:12px 0;vertical-align:middle;text-align:right;width:100px;"><a href="${icsUrl}" style="color:#10b981;text-decoration:none;font-size:10px;font-weight:700;background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.15);padding:4px 8px;border-radius:6px;display:inline-block;text-transform:uppercase;letter-spacing:0.5px;">Add to Cal</a>
              </td>
            </tr>
            `;
          }).join('')}
        </table>
</div>

      <div style="background:rgba(124,58,237,0.05);border:1px solid rgba(124,58,237,0.15);border-radius:12px;padding:16px;margin-bottom:28px;text-align:left;"><p style="margin:0;color:rgba(255,255,255,0.6);font-size:12px;line-height:1.5;">Please review these changes in your calendar and confirm your attendance in the portal.
</p>
</div>

      <a href="https://7thheavenband.com/crew" style="${btnStyle}">Open Crew Portal</a>
</div>
  `);
}

// ═══════════════════════════════════════════════
// 17b. CREW SMS DISPATCHED ALERT (sent to admins)
// ═══════════════════════════════════════════════
export function crewSmsDispatchedAlert(b: {
  message: string;
  showDate?: string;
  showVenue?: string;
  showTime?: string;
  recipients?: Array<{
    name: string;
    phone: string;
    email: string;
    avatar?: string;
    role?: string;
    hours?: string;
  }>;
  sentToNames?: string[];
}) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://7thheavenband.com';
  let recipientList = b.recipients;
  if (!Array.isArray(recipientList) || recipientList.length === 0) {
    const fallbackNames = Array.isArray(b.sentToNames) && b.sentToNames.length > 0
      ? b.sentToNames
      : ['None (All Crew)'];
    recipientList = fallbackNames.map(name => ({
      name,
      phone: 'N/A',
      email: '',
      avatar: '',
      role: 'CREW',
      hours: 'N/A'
    }));
  }

  return wrap(`
    <div style="text-align:left;"><h2 style="margin:0 0 16px;color:#fff;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #7c3aed;padding-bottom:12px;">Crew SMS Alert Dispatched</h2><p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;margin:0 0 24px;">An administrator has dispatched a new SMS alert to the crew members. Here is the full dispatch log:
</p>

      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:20px;"><p style="margin:0 0 14px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);font-weight:700;">Show / Event Details</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;color:#fff;margin-bottom:14px;"><tr style="border-bottom:1px solid rgba(255,255,255,0.04);"><td style="padding:10px 0;color:rgba(255,255,255,0.4);width:120px;">Date</td><td style="padding:10px 0;font-weight:600;">${sanitize(b.showDate) || 'N/A'}</td></tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.04);"><td style="padding:10px 0;color:rgba(255,255,255,0.4);">Time</td><td style="padding:10px 0;font-weight:600;">${sanitize(b.showTime) || 'N/A'}</td></tr>
          <tr><td style="padding:10px 0;color:rgba(255,255,255,0.4);">Place / Venue</td><td style="padding:10px 0;font-weight:600;">${sanitize(b.showVenue) || 'N/A'}</td></tr>
        </table>
        <div style="text-align:center;border-top:1px solid rgba(255,255,255,0.04);padding-top:14px;"><a href="${SITE_URL}/api/calendar/ics?bookingId=admin-crew-alert&date=${encodeURIComponent(b.showDate || '')}&venue=${encodeURIComponent(b.showVenue || '')}&eventType=Admin Crew Alert&startTime=${encodeURIComponent(b.showTime?.split(' - ')[0] || '')}&endTime=${encodeURIComponent(b.showTime?.split(' - ')[1] || '')}" style="display:inline-block;padding:6px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#a855f7;font-size:11px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:1px;">Add to Calendar (.ics)</a>
</div>
</div>

      <div style="background:rgba(124,58,237,0.05);border:1px solid rgba(124,58,237,0.15);border-radius:12px;padding:20px;margin-bottom:20px;"><p style="margin:0 0 10px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#a855f7;font-weight:800;">SMS Message Text</p>
        <div style="font-size:14px;color:rgba(255,255,255,0.75);font-style:italic;line-height:1.6;">"${sanitize(b.message)}"
</div>
</div>

      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:24px;"><p style="margin:0 0 16px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);font-weight:700;">SMS Recipients (${recipientList.length})</p>
        
        <table style="width:100%;border-collapse:collapse;">${recipientList.map((r, idx) => {
            const initials = getInitials(r.name);
            const isLocalAvatar = r.avatar && (r.avatar.startsWith('/') || r.avatar.startsWith('http')) && !r.avatar.includes('ui-avatars.com');
            const avatarHtml = isLocalAvatar
              ? `<img src="${r.avatar}" alt="${sanitize(r.name)}" style="width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,0.1);display:block;" />`
              : `<div style="width:32px;height:32px;border-radius:50%;background:#7c3aed;color:#fff;text-align:center;line-height:32px;font-weight:800;font-size:11px;letter-spacing:0.5px;border:1px solid rgba(255,255,255,0.15);">${initials}</div>`;
            const roleStr = r.role || 'Crew';
            const hoursStr = r.hours || 'N/A';
            const rawPhone = r.phone || '';
            const digits = rawPhone.replace(/\D/g, '');
            const clean = digits.startsWith('1') && digits.length === 11 ? digits.slice(1) : digits;
            const formattedPhone = clean.length === 10
              ? `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`
              : rawPhone;
            return `
              <tr style="${idx < recipientList.length - 1 ? 'border-bottom:1px solid rgba(255,255,255,0.04);' : ''}"><td style="padding:12px 0;width:40px;vertical-align:middle;">${avatarHtml}
                </td>
                <td style="padding:12px 0 12px 12px;vertical-align:middle;"><div style="font-weight:700;color:#fff;font-size:13px;">${sanitize(r.name)}</div>
                  <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px;">${sanitize(formattedPhone)}</div>
                </td>
                <td style="padding:12px 0;vertical-align:middle;text-align:right;"><span style="display:inline-block;background:rgba(124,58,237,0.1);color:#a855f7;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:3px 8px;border-radius:6px;border:1px solid rgba(124,58,237,0.2);">${sanitize(roleStr)}</span>
                  <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:4px;">⏱️ ${sanitize(hoursStr)}</div>
                </td>
              </tr>
            `;
          }).join('')}
        </table>
</div>

      <div style="text-align:center;"><a href="https://7thheavenband.com/admin" style="${btnStyle}">Open Admin Panel</a>
</div>
</div>
  `);
}

// ═══════════════════════════════════════════════
// 17c. CREW SMS ALERT RECEIVED (sent to crew members)
// ═══════════════════════════════════════════════
export function crewSmsAlertReceived(b: {
  memberName: string;
  message: string;
  showDate?: string;
  showVenue?: string;
  showTime?: string;
}) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://7thheavenband.com';
  return wrap(`
    <div style="text-align:left;"><h2 style="margin:0 0 16px;color:#fff;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #7c3aed;padding-bottom:12px;">Crew Alert</h2><p style="color:rgba(255,255,255,0.75);font-size:14px;line-height:1.6;margin:0 0 24px;">Hello <strong style="color:#fff;">${sanitize(b.memberName)}</strong>, a new alert has been dispatched for your upcoming show crew assignment:
</p>

      <div style="background:rgba(124,58,237,0.05);border:1px solid rgba(124,58,237,0.15);border-radius:12px;padding:20px;margin-bottom:20px;"><p style="margin:0 0 10px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#a855f7;font-weight:800;">Alert Message</p>
        <div style="font-size:14px;color:rgba(255,255,255,0.85);font-style:italic;line-height:1.6;">"${sanitize(b.message)}"
</div>
</div>

      ${b.showVenue || b.showDate ? `
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:24px;"><p style="margin:0 0 14px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);font-weight:700;">Show / Event Details</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;color:#fff;margin-bottom:14px;">${b.showDate ? `<tr style="border-bottom:1px solid rgba(255,255,255,0.04);"><td style="padding:10px 0;color:rgba(255,255,255,0.4);width:120px;">Date</td><td style="padding:10px 0;font-weight:600;">${sanitize(b.showDate)}</td></tr>` : ''}
          ${b.showTime ? `<tr style="border-bottom:1px solid rgba(255,255,255,0.04);"><td style="padding:10px 0;color:rgba(255,255,255,0.4);">Time</td><td style="padding:10px 0;font-weight:600;">${sanitize(b.showTime)}</td></tr>` : ''}
          ${b.showVenue ? `<tr><td style="padding:10px 0;color:rgba(255,255,255,0.4);">Place / Venue</td><td style="padding:10px 0;font-weight:600;">${sanitize(b.showVenue)}</td></tr>` : ''}
        </table>
        <div style="text-align:center;border-top:1px solid rgba(255,255,255,0.04);padding-top:14px;"><a href="${SITE_URL}/api/calendar/ics?bookingId=crew-alert&date=${encodeURIComponent(b.showDate || '')}&venue=${encodeURIComponent(b.showVenue || '')}&eventType=Crew Alert&startTime=${encodeURIComponent(b.showTime?.split(' - ')[0] || '')}&endTime=${encodeURIComponent(b.showTime?.split(' - ')[1] || '')}" style="display:inline-block;padding:6px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#a855f7;font-size:11px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:1px;">Add to Calendar (.ics)</a>
</div>
</div>
      ` : ''}

      <div style="text-align:center;"><a href="https://7thheavenband.com/crew" style="${btnStyle}">Open Crew Portal</a>
</div>
</div>
  `);
}



// ═══════════════════════════════════════════════
// 11. FLASH MERCH PURCHASE - PICKUP (with QR Code)
// ═══════════════════════════════════════════════
export function flashMerchPickup(b: { name: string; prizeName: string; pin: string; price?: string; imageUrl?: string; size?: string; color?: string; description?: string }) {
  const lowerPrize = b.prizeName.toLowerCase();
  let imgPath = b.imageUrl || '/images/merch/vinyl.png';
  if (imgPath.startsWith('https://7thheavenband.com')) {
    imgPath = imgPath.replace('https://7thheavenband.com', '');
  }
  if (imgPath === '/images/merch/vinyl.png') {
    if (lowerPrize.includes('shirt') || lowerPrize.includes('tee')) {
      imgPath = '/images/merch/logo-tee.png';
    } else if (lowerPrize.includes('hood') || lowerPrize.includes('sweat')) {
      imgPath = '/images/merch/hoodie.png';
    }
  }

  const imgHtml = imgPath 
    ? `<div style="margin-bottom:16px;"><img src="${sanitize(imgPath)}" alt="${sanitize(b.prizeName)}" width="140" height="140" style="border-radius:12px;border:1px solid rgba(255,255,255,0.1);display:inline-block;object-fit:cover;" /></div>`
    : '';

  const descHtml = b.description
    ? `<p style="margin:4px 0 0;color:rgba(255,255,255,0.45);font-size:12px;line-height:1.4;">${sanitize(b.description)}</p>`
    : '';

  const sizeHtml = b.size
    ? `<p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:13px;"><strong>Size:</strong> ${sanitize(b.size)}</p>`
    : '';

  const colorMap: Record<string, string> = { Black: '#1a1a1a', White: '#f5f5f5', 'Heather Grey': '#9ca3af', Navy: '#1e3a5f', Red: '#dc2626', 'Forest Green': '#166534' };
  const colorHtml = b.color
    ? `<p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:13px;"><strong>Color:</strong> <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${colorMap[b.color] || '#888'};border:1px solid rgba(255,255,255,0.2);vertical-align:middle;margin-right:4px;"></span>${sanitize(b.color)}</p>`
    : '';

  return wrap(`
    <div style="text-align:center;"><h1 style="margin:0 0 12px;color:#fff;font-size:26px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">Merch Ready for Pickup</h1><p style="margin:0 0 32px;color:#888;font-size:15px;">Your live stream purchase has been registered for venue pickup!</p>
      
      <div style="background:#0a0a0e;border:2px solid rgba(255,255,255,0.06);border-radius:12px;padding:24px;margin-bottom:28px;text-align:left;"><p style="margin:0 0 16px;color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;text-align:center;">Order Details</p>
        <div style="text-align:center;margin-bottom:20px;">${imgHtml}
          <p style="margin:0;color:#fff;font-size:20px;font-weight:900;">${sanitize(b.prizeName)}</p>
          ${descHtml}
          ${sizeHtml}
          ${colorHtml}
</div>
        <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;"><p style="margin:0 0 8px;color:rgba(255,255,255,0.6);font-size:13px;"><strong>Recipient:</strong> ${sanitize(b.name)}</p>
          <p style="margin:0 0 8px;color:rgba(255,255,255,0.6);font-size:13px;"><strong>Method:</strong> Merch Table Pickup</p>
          <p style="margin:0;color:rgba(255,255,255,0.6);font-size:13px;"><strong>Price Paid:</strong> ${sanitize(b.price || '$45.00')}</p>
</div>
</div>

      <div style="margin:0 auto 28px;text-align:center;"><p style="margin:0 0 12px;color:#555;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">One-Time Use QR Code</p>
        <div style="display:inline-block;padding:12px;background:#fff;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.5);"><img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=PU-${b.pin}" width="140" height="140" alt="Claim QR Code" style="display:block;" />
</div>
        <p style="margin:12px 0 0;color:#ef4444;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">SINGLE-USE REDEMPTION ONLY</p>
</div>

      <div style="background:rgba(16,185,129,0.05);border:1px solid rgba(16,185,129,0.15);border-radius:12px;padding:20px;margin-bottom:28px;text-align:left;"><p style="margin:0;color:rgba(255,255,255,0.6);font-size:12px;line-height:1.5;"><strong>Pickup Instructions:</strong> Please bring this email with the QR code to the show's Merch Table. Once scanned, your item will be handed to you. This ticket is only valid for ONE handoff.
</p>
</div>

      <a href="https://7thheavenband.com" style="${btnStyle}">Visit Website</a>
</div>
  `);
}

// ═══════════════════════════════════════════════
// 12. FLASH MERCH PURCHASE - SHIPPING
// ═══════════════════════════════════════════════
export function flashMerchShipping(b: { name: string; prizeName: string; address: string; city: string; zip: string; price: string; imageUrl?: string; size?: string; color?: string; description?: string }) {
  const lowerPrize = b.prizeName.toLowerCase();
  let imgPath = b.imageUrl || '/images/merch/vinyl.png';
  if (imgPath.startsWith('https://7thheavenband.com')) {
    imgPath = imgPath.replace('https://7thheavenband.com', '');
  }
  if (imgPath === '/images/merch/vinyl.png') {
    if (lowerPrize.includes('shirt') || lowerPrize.includes('tee')) {
      imgPath = '/images/merch/logo-tee.png';
    } else if (lowerPrize.includes('hood') || lowerPrize.includes('sweat')) {
      imgPath = '/images/merch/hoodie.png';
    }
  }

  const imgHtml = imgPath 
    ? `<div style="margin-bottom:16px;"><img src="${sanitize(imgPath)}" alt="${sanitize(b.prizeName)}" width="140" height="140" style="border-radius:12px;border:1px solid rgba(255,255,255,0.1);display:inline-block;object-fit:cover;" /></div>`
    : '';

  const descHtml = b.description
    ? `<p style="margin:4px 0 0;color:rgba(255,255,255,0.45);font-size:12px;line-height:1.4;">${sanitize(b.description)}</p>`
    : '';

  const sizeHtml = b.size
    ? `<p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:13px;"><strong>Size:</strong> ${sanitize(b.size)}</p>`
    : '';

  const colorMap: Record<string, string> = { Black: '#1a1a1a', White: '#f5f5f5', 'Heather Grey': '#9ca3af', Navy: '#1e3a5f', Red: '#dc2626', 'Forest Green': '#166534' };
  const colorHtml = b.color
    ? `<p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:13px;"><strong>Color:</strong> <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${colorMap[b.color] || '#888'};border:1px solid rgba(255,255,255,0.2);vertical-align:middle;margin-right:4px;"></span>${sanitize(b.color)}</p>`
    : '';

  return wrap(`
    <div style="text-align:center;"><h1 style="margin:0 0 12px;color:#fff;font-size:26px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">Order Confirmed</h1><p style="margin:0 0 32px;color:#888;font-size:15px;">Your order has been confirmed and is being prepped for shipment!</p>
      
      <div style="background:#0a0a0e;border:2px solid rgba(255,255,255,0.06);border-radius:12px;padding:24px;margin-bottom:28px;text-align:left;"><p style="margin:0 0 16px;color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;text-align:center;">Order Details</p>
        <div style="text-align:center;margin-bottom:20px;">${imgHtml}
          <p style="margin:0;color:#fff;font-size:20px;font-weight:900;">${sanitize(b.prizeName)}</p>
          ${descHtml}
          ${sizeHtml}
          ${colorHtml}
</div>
        <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;"><p style="margin:0 0 8px;color:rgba(255,255,255,0.6);font-size:13px;"><strong>Recipient:</strong> ${sanitize(b.name)}</p>
          <p style="margin:0 0 8px;color:rgba(255,255,255,0.6);font-size:13px;"><strong>Method:</strong> Shipped to Home</p>
          <p style="margin:0;color:rgba(255,255,255,0.6);font-size:13px;"><strong>Price Paid:</strong> ${sanitize(b.price)}</p>
</div>
</div>

      <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:28px;text-align:left;"><p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);font-weight:700;">Shipping Address</p>
        <p style="margin:0;color:#fff;font-size:14px;font-weight:700;">${sanitize(b.name)}</p>
        <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.4;">${sanitize(b.address)}<br/>
          ${sanitize(b.city)}, ${sanitize(b.zip)}
</p>
</div>

      <div style="background:rgba(124,58,237,0.05);border:1px solid rgba(124,58,237,0.15);border-radius:12px;padding:20px;margin-bottom:28px;text-align:left;"><p style="margin:0;color:rgba(255,255,255,0.6);font-size:12px;line-height:1.5;"><strong>Next Steps:</strong> We are packing your order. As soon as it leaves the warehouse, we will email you with your parcel tracking link.
</p>
</div>

      <a href="https://7thheavenband.com" style="${btnStyle}">Go to Shop</a>
</div>
  `);
}

// ═══════════════════════════════════════════════
// 27. FAN UPLOAD APPROVED (sent when fan wall upload approved)
// ═══════════════════════════════════════════════
export function fanUploadApproved(data: { name: string; title: string }) {
  return wrap(`
    <h1 style="margin:0 0 8px;color:#10b981;font-size:26px;font-weight:900;text-align:center;">Photo Wall Approved!</h1><p style="margin:0 0 28px;color:rgba(255,255,255,0.4);font-size:13px;text-align:center;">Your moments are now live for the community to see.</p>
    <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;margin:0 0 28px;">Hey <strong style="color:#fff;">${sanitize(data.name)}</strong>, good news! The media you uploaded ("${sanitize(data.title)}") has been approved by the 7th Heaven team and is now published to the public Fan Photo & Video Wall!
</p>
    <div style="text-align:center;margin:24px 0;"><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://7thheavenband.com'}/fan-photo-wall" style="${btnStyle}">View Photo Wall</a>
</div>
  `);
}

// ═══════════════════════════════════════════════
// 28. FAN UPLOAD REJECTED (sent when fan wall upload rejected with reason)
// ═══════════════════════════════════════════════
export function fanUploadRejected(data: { name: string; title: string; reason: string }) {
  return wrap(`
    <h1 style="margin:0 0 8px;color:#ef4444;font-size:26px;font-weight:900;text-align:center;">Photo Wall Upload Declined</h1><p style="margin:0 0 28px;color:rgba(255,255,255,0.4);font-size:13px;text-align:center;">Your photo upload could not be approved.</p>
    <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;margin:0 0 28px;">Hey <strong style="color:#fff;">${sanitize(data.name)}</strong>, we wanted to let you know that the media you uploaded ("${sanitize(data.title)}") could not be published to the Fan Wall.
</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;"><tr><td style="padding:12px 16px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.15);border-radius:10px;margin-bottom:8px;"><p style="margin:0 0 6px;color:#fca5a5;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">REASON FOR DECLINE</p>
        <p style="margin:0;color:#fff;font-size:14px;font-weight:700;line-height:1.6;">${sanitize(data.reason)}
</p>
      </td></tr>
    </table>
    <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.6;margin:0 0 28px;">Please ensure your uploads contain band-related content, show appropriate community guidelines, and don't feature copyrighted audio/video from other sources.
</p>
    <div style="text-align:center;margin:24px 0;"><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://7thheavenband.com'}/fan-photo-wall" style="${btnStyle}">Back to Fan Wall</a>
</div>
  `);
}

// ═══════════════════════════════════════════════
// 29. SHIFT COVERAGE REQUEST (sent to qualified crew members)
// ═══════════════════════════════════════════════
export function shiftCoverageRequest(b: {
  requestingCrewName: string;
  role: string;
  date: string;
  time: string;
  location: string;
  shiftId: string;
  recipientSlug: string;
}) {
  const acceptUrl = `http://localhost:3000/crew-${b.recipientSlug}?action=accept-coverage&shiftId=${b.shiftId}`;
  const declineUrl = `http://localhost:3000/crew-${b.recipientSlug}?action=decline-coverage&shiftId=${b.shiftId}`;
  const td1 = 'padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;width:120px;vertical-align:top;';
  const td2 = 'padding:8px 0;color:#fff;font-size:14px;font-weight:600;';

  return wrap(`
    <div style="text-align:center;margin-bottom:24px;"><p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#a855f7;font-weight:800;text-align:center;">Shift Coverage Request</p>
      <h1 style="margin:0 0 12px;font-size:24px;font-weight:900;color:#fff;text-align:center;">Can You Cover This Shift?</h1><p style="margin:0;color:rgba(255,255,255,0.6);font-size:14px;line-height:1.5;text-align:center;"><strong style="color:#fff;">${sanitize(b.requestingCrewName)}</strong> is looking for coverage. Since you are qualified for this role, we're reaching out to see if you can take it!
</p>
</div>

    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:28px;"><p style="margin:0 0 14px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);font-weight:700;">Shift Details</p>
      <table style="width:100%;border-collapse:collapse;"><tr><td style="${td1}">Role Required</td><td style="${td2};color:#a855f7;">${sanitize(b.role)}</td></tr>
        <tr><td style="${td1}">Date</td><td style="${td2}">${sanitize(b.date)}</td></tr>
        <tr><td style="${td1}">Time</td><td style="${td2}">${sanitize(b.time)}</td></tr>
        <tr><td style="${td1}">Location</td><td style="${td2}">${sanitize(b.location)}</td></tr>
      </table>
</div>

    <div style="text-align:center;margin-bottom:16px;"><a href="${acceptUrl}" style="${btnGold}">Accept Shift</a>
      <span style="display:inline-block;width:12px;"></span>
      <a href="${declineUrl}" style="display:inline-block;background-color:#1f2937;background:#1f2937;color:#9ca3af;font-weight:800;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 36px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);">Decline</a>
</div>

    <p style="color:rgba(255,255,255,0.35);font-size:11px;text-align:center;margin-top:24px;line-height:1.5;">Clicking "Accept Shift" will instantly log you in and add this shift to your schedule. The first qualified crew member to claim this shift will receive it.
</p>
  `);
}

// ═══════════════════════════════════════════════
// 19. PUSH & PROXIMITY ALERTS WELCOME & GUIDE EMAIL
// ═══════════════════════════════════════════════
export function pushWelcomeEmail(data: {
  name?: string;
  email: string;
  zip?: string;
  radius?: string;
  selectedTypes?: string[];
}) {
  const nameDisplay = data.name ? sanitize(data.name) : '7th Heaven Fan';
  const zipDisplay = data.zip ? sanitize(data.zip) : 'Your Area';
  const radiusDisplay = data.radius && data.radius !== 'all' ? `${data.radius} Miles` : 'All Show Radius';
  const typesDisplay = data.selectedTypes && data.selectedTypes.length > 0 ? data.selectedTypes.map(t => t.toUpperCase()).join(', ') : 'All Show Types';

  const tdLabel = 'padding:6px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;width:140px;vertical-align:top;';
  const tdVal = 'padding:6px 0;color:#fff;font-size:14px;font-weight:600;';

  return wrap(`
    <!-- Hero Title -->
    <div style="text-align:center;margin-bottom:28px;">
      <h1 style="margin:0 0 8px;color:#fff;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:1px;">You're All Set For 7th Heaven Show Alerts! 🎸</h1>
      <p style="margin:0;color:#c084fc;font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:800;">Proximity Alerts & Web Push Guide</p>
    </div>

    <p style="color:rgba(255,255,255,0.85);font-size:15px;line-height:1.6;margin:0 0 24px;">
      Hey <strong style="color:#fff;">${nameDisplay}</strong>, thanks for activating 7th Heaven notifications! You'll now receive instant alerts whenever 7th Heaven schedules a show near you.
    </p>

    <!-- Active Preferences Card -->
    <div style="background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.25);border-radius:14px;padding:24px;margin-bottom:28px;">
      <p style="margin:0 0 14px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#c084fc;font-weight:800;">Your Active Notification Preferences</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="${tdLabel}">Zip / City</td><td style="${tdVal}">${zipDisplay}</td></tr>
        <tr><td style="${tdLabel}">Distance Radius</td><td style="${tdVal}">${radiusDisplay}</td></tr>
        <tr><td style="${tdLabel}">Show Types</td><td style="${tdVal}">${typesDisplay}</td></tr>
      </table>
    </div>

    <!-- How It Works Section -->
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:24px;margin-bottom:28px;">
      <p style="margin:0 0 16px;font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#fff;font-weight:900;">How Your Push Notifications Work</p>
      
      <table style="width:100%;border-spacing:0 12px;">
        <tr>
          <td style="color:#ec4899;font-weight:900;font-size:18px;width:32px;vertical-align:top;">📍</td>
          <td style="color:rgba(255,255,255,0.8);font-size:13px;line-height:1.5;">
            <strong style="color:#fff;">Proximity Radius Matching:</strong> Our tour system automatically measures the distance between the venue and your location (<strong>${zipDisplay}</strong>). If the gig is within <strong>${radiusDisplay}</strong>, an alert is sent instantly to your device!
          </td>
        </tr>
        <tr>
          <td style="color:#ec4899;font-weight:900;font-size:18px;width:32px;vertical-align:top;">🎸</td>
          <td style="color:rgba(255,255,255,0.8);font-size:13px;line-height:1.5;">
            <strong style="color:#fff;">Filtered Show Types:</strong> You only get alerts for the types of shows you care about (Full Band, Unplugged, Outdoor, Casino, Special Events, etc.).
          </td>
        </tr>
        <tr>
          <td style="color:#ec4899;font-weight:900;font-size:18px;width:32px;vertical-align:top;">🔔</td>
          <td style="color:rgba(255,255,255,0.8);font-size:13px;line-height:1.5;">
            <strong style="color:#fff;">Real-Time Web Push:</strong> Push popups appear directly on your Phone or Desktop screen when a new show is posted or when doors open.
          </td>
        </tr>
      </table>
    </div>

    <!-- How to Remove Yourself / Unsubscribe Section -->
    <div style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);border-radius:14px;padding:24px;margin-bottom:28px;">
      <p style="margin:0 0 14px;font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#f87171;font-weight:900;">How to Remove Yourself or Manage Push Notifications</p>
      <p style="margin:0 0 14px;color:rgba(255,255,255,0.75);font-size:13px;line-height:1.5;">
        You are in 100% control of your notifications. You can change your distance, update show types, or remove yourself at any time using either method below:
      </p>

      <div style="background:rgba(0,0,0,0.3);border-radius:10px;padding:16px;margin-bottom:12px;">
        <p style="margin:0 0 6px;color:#fff;font-size:13px;font-weight:800;">Method 1: In Your Browser Settings (Instant Block)</p>
        <p style="margin:0;color:rgba(255,255,255,0.6);font-size:12px;line-height:1.5;">
          Click the <strong>Tune / Lock icon</strong> next to <code style="color:#c084fc;background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;">7thheavenband.com</code> in your browser address bar &rarr; Select <strong>Site Settings / Permissions</strong> &rarr; Change <strong>Notifications</strong> to <strong>Block</strong> or <strong>Reset</strong>.
        </p>
      </div>

      <div style="background:rgba(0,0,0,0.3);border-radius:10px;padding:16px;">
        <p style="margin:0 0 6px;color:#fff;font-size:13px;font-weight:800;">Method 2: On the 7th Heaven Website Footer</p>
        <p style="margin:0;color:rgba(255,255,255,0.6);font-size:12px;line-height:1.5;">
          Visit <a href="https://7thheavenband.com/notifications" style="color:#c084fc;text-decoration:underline;">7thheavenband.com/notifications</a> or scroll to the website footer to adjust your radius, deselect show types, or toggle off notifications completely.
        </p>
      </div>
    </div>

    <!-- Call to Action Buttons -->
    <div style="text-align:center;margin-bottom:20px;">
      <a href="https://7thheavenband.com/notifications" style="${btnStyle}">Manage Alert Preferences</a>
    </div>

    <p style="color:rgba(255,255,255,0.35);font-size:12px;text-align:center;margin:0;">
      Need help? Reply to this email or visit <a href="https://7thheavenband.com/privacy" style="color:#a855f7;text-decoration:underline;">7thheavenband.com/privacy</a>.
    </p>
  `);
}
