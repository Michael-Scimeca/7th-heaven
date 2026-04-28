// Test script to fire all 7 email templates to a target address
// Usage: node scripts/test-emails.mjs

const BASE = 'http://localhost:3000';
const TO = 'mikeyscimeca.dev@gmail.com';

const templates = [
  {
    name: '1/7 — Booking Confirmation (Planner)',
    subject: 'TEST 1/7: Booking Confirmed — 7H-BK-4821 | 7th Heaven',
    html: `<div style="font-family:-apple-system,system-ui,sans-serif;max-width:580px;margin:0 auto;background:#0a0a0f;color:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);">
      <div style="padding:20px 40px;text-align:center;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:16px 16px 0 0;"><p style="margin:0;color:#fff;font-size:18px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">7TH HEAVEN</p></div>
      <div style="padding:40px 32px;background:#0a0a0f;border-left:1px solid rgba(255,255,255,0.05);border-right:1px solid rgba(255,255,255,0.05);">
        <h1 style="margin:0 0 8px;color:#fff;font-size:26px;font-weight:900;text-align:center;">Booking Request Received</h1>
        <p style="margin:0 0 28px;color:rgba(255,255,255,0.4);font-size:13px;text-align:center;">We'll review your details and get back to you within 24–48 hours.</p>
        <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;margin:0 0 28px;">Hey <strong style="color:#fff;">Marcus Rivera</strong>, thanks for submitting your booking request!</p>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);font-weight:700;">Booking ID</p>
          <p style="margin:0 0 20px;font-size:20px;font-weight:800;color:#a855f7;">7H-BK-4821</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;width:110px;">Event</td><td style="padding:8px 0;color:#fff;font-size:14px;font-weight:600;">Full Band</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Date</td><td style="padding:8px 0;color:#fff;font-size:14px;font-weight:600;">June 14, 2026</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Venue</td><td style="padding:8px 0;color:#fff;font-size:14px;font-weight:600;">The Chicago Theatre</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Location</td><td style="padding:8px 0;color:#fff;font-size:14px;font-weight:600;">Chicago, IL</td></tr>
          </table>
        </div>
      </div>
      <div style="background:#08080c;padding:24px 32px;text-align:center;border:1px solid rgba(255,255,255,0.05);border-top:none;border-radius:0 0 16px 16px;"><p style="margin:0;color:#7c3aed;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">7thheavenband.com</p></div>
    </div>`,
  },
  {
    name: '2/7 — Booking Admin Alert',
    subject: 'TEST 2/7: ⚡ New Booking Request — 7H-BK-4821',
    html: `<div style="font-family:-apple-system,system-ui,sans-serif;max-width:580px;margin:0 auto;background:#0a0a0f;color:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);">
      <div style="padding:20px 40px;text-align:center;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:16px 16px 0 0;"><p style="margin:0;color:#fff;font-size:18px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">7TH HEAVEN</p></div>
      <div style="padding:40px 32px;background:#0a0a0f;">
        <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#a855f7;font-weight:800;text-align:center;">⚡ New Booking Request</p>
        <h1 style="margin:0 0 24px;font-size:24px;font-weight:900;color:#fff;text-align:center;">7H-BK-4821</h1>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;width:130px;">Name</td><td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600;">Marcus Rivera</td></tr>
            <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Email</td><td style="padding:6px 0;color:#a855f7;font-size:14px;font-weight:600;">marcus@rivera.com</td></tr>
            <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Event</td><td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600;">Full Band — June 14, 2026</td></tr>
            <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Venue</td><td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600;">The Chicago Theatre, Chicago, IL</td></tr>
          </table>
        </div>
      </div>
      <div style="background:#08080c;padding:24px 32px;text-align:center;border:1px solid rgba(255,255,255,0.05);border-top:none;border-radius:0 0 16px 16px;"><p style="margin:0;color:#7c3aed;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">7thheavenband.com</p></div>
    </div>`,
  },
  {
    name: '3/7 — Raffle Winner',
    subject: 'TEST 3/7: 🏆 You Won the 7th Heaven Raffle!',
    html: `<div style="font-family:-apple-system,system-ui,sans-serif;max-width:580px;margin:0 auto;background:#0a0a0f;color:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);">
      <div style="padding:20px 40px;text-align:center;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:16px 16px 0 0;"><p style="margin:0;color:#fff;font-size:18px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">7TH HEAVEN</p></div>
      <div style="padding:40px 32px;background:#0a0a0f;text-align:center;">
        <p style="font-size:52px;margin:0 0 16px;">🏆</p>
        <h1 style="margin:0 0 12px;color:#fff;font-size:28px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">YOU WON THE RAFFLE</h1>
        <p style="margin:0 0 32px;color:#888;font-size:15px;">Congratulations — your name was drawn live!</p>
        <div style="background:#0a0a0e;border:2px solid #FBBF24;border-radius:12px;padding:24px;margin-bottom:28px;">
          <p style="margin:0 0 8px;color:#92600a;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Your Prize</p>
          <p style="margin:0;color:#fff;font-size:22px;font-weight:900;">Signed Vinyl Record</p>
        </div>
        <p style="margin:0 0 12px;color:#555;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Your Claim PIN</p>
        <table cellpadding="0" cellspacing="0" style="margin:0 auto 8px;"><tr>
          <td style="width:48px;height:56px;background:#0a0a0e;border:2px solid #FBBF24;border-radius:8px;text-align:center;font-size:28px;font-weight:900;color:#FBBF24;font-family:monospace;">7</td><td style="width:8px;"></td>
          <td style="width:48px;height:56px;background:#0a0a0e;border:2px solid #FBBF24;border-radius:8px;text-align:center;font-size:28px;font-weight:900;color:#FBBF24;font-family:monospace;">4</td><td style="width:8px;"></td>
          <td style="width:48px;height:56px;background:#0a0a0e;border:2px solid #FBBF24;border-radius:8px;text-align:center;font-size:28px;font-weight:900;color:#FBBF24;font-family:monospace;">8</td><td style="width:8px;"></td>
          <td style="width:48px;height:56px;background:#0a0a0e;border:2px solid #FBBF24;border-radius:8px;text-align:center;font-size:28px;font-weight:900;color:#FBBF24;font-family:monospace;">2</td>
        </tr></table>
        <p style="margin:0 0 28px;color:#444;font-size:11px;">Show this PIN to the crew at the merch table</p>
        <a href="https://7thheavenband.com/fans" style="display:inline-block;background:#FBBF24;color:#000;font-weight:900;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 36px;border-radius:10px;">Open My Claim Page</a>
      </div>
      <div style="background:#08080c;padding:24px 32px;text-align:center;border:1px solid rgba(255,255,255,0.05);border-top:none;border-radius:0 0 16px 16px;"><p style="margin:0;color:#7c3aed;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">7thheavenband.com</p></div>
    </div>`,
  },
  {
    name: '4/7 — Raffle Entry Confirmation',
    subject: 'TEST 4/7: 🎟️ Raffle Entry Confirmed!',
    html: `<div style="font-family:-apple-system,system-ui,sans-serif;max-width:580px;margin:0 auto;background:#0a0a0f;color:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);">
      <div style="padding:20px 40px;text-align:center;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:16px 16px 0 0;"><p style="margin:0;color:#fff;font-size:18px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">7TH HEAVEN</p></div>
      <div style="padding:40px 32px;background:#0a0a0f;text-align:center;">
        <p style="font-size:48px;margin:0 0 16px;">🎟️</p>
        <h1 style="margin:0 0 12px;color:#FBBF24;font-size:24px;font-weight:900;text-transform:uppercase;">Raffle Entry Confirmed</h1>
        <p style="margin:0 0 24px;color:rgba(255,255,255,0.6);font-size:15px;line-height:1.6;">You've been entered to win <strong style="color:#fff;">Signed Vinyl Record</strong>. Stay tuned — the winner will be drawn live on stream!</p>
        <p style="margin:0;color:rgba(255,255,255,0.3);font-size:13px;">Good luck! 🤞</p>
      </div>
      <div style="background:#08080c;padding:24px 32px;text-align:center;border:1px solid rgba(255,255,255,0.05);border-top:none;border-radius:0 0 16px 16px;"><p style="margin:0;color:#7c3aed;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">7thheavenband.com</p></div>
    </div>`,
  },
  {
    name: '5/7 — Welcome Fan',
    subject: 'TEST 5/7: 🎸 Welcome to the 7th Heaven Family!',
    html: `<div style="font-family:-apple-system,system-ui,sans-serif;max-width:580px;margin:0 auto;background:#0a0a0f;color:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);">
      <div style="padding:20px 40px;text-align:center;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:16px 16px 0 0;"><p style="margin:0;color:#fff;font-size:18px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">7TH HEAVEN</p></div>
      <div style="padding:40px 32px;background:#0a0a0f;text-align:center;">
        <p style="font-size:48px;margin:0 0 16px;">🎸</p>
        <h1 style="margin:0 0 12px;color:#fff;font-size:26px;font-weight:900;">Welcome to the Family!</h1>
        <p style="margin:0 0 28px;color:rgba(255,255,255,0.6);font-size:15px;line-height:1.6;">Hey <strong style="color:#fff;">Michael Scimeca</strong>, your 7th Heaven fan account is ready. You now have access to:</p>
        <div style="text-align:left;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:28px;">
          <p style="margin:0 0 12px;color:#fff;font-size:14px;">✅ &nbsp;Live stream access & chat</p>
          <p style="margin:0 0 12px;color:#fff;font-size:14px;">✅ &nbsp;VIP raffle entries at shows</p>
          <p style="margin:0 0 12px;color:#fff;font-size:14px;">✅ &nbsp;Referral rewards & points</p>
          <p style="margin:0;color:#fff;font-size:14px;">✅ &nbsp;Proximity notifications for nearby shows</p>
        </div>
        <a href="https://7thheavenband.com/fans" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:800;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 36px;border-radius:10px;">Open My Dashboard</a>
      </div>
      <div style="background:#08080c;padding:24px 32px;text-align:center;border:1px solid rgba(255,255,255,0.05);border-top:none;border-radius:0 0 16px 16px;"><p style="margin:0;color:#7c3aed;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">7thheavenband.com</p></div>
    </div>`,
  },
  {
    name: '6/7 — Welcome Planner',
    subject: 'TEST 6/7: 📋 Planner Account Created — 7th Heaven',
    html: `<div style="font-family:-apple-system,system-ui,sans-serif;max-width:580px;margin:0 auto;background:#0a0a0f;color:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);">
      <div style="padding:20px 40px;text-align:center;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:16px 16px 0 0;"><p style="margin:0;color:#fff;font-size:18px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">7TH HEAVEN</p></div>
      <div style="padding:40px 32px;background:#0a0a0f;text-align:center;">
        <p style="font-size:48px;margin:0 0 16px;">📋</p>
        <h1 style="margin:0 0 12px;color:#fff;font-size:26px;font-weight:900;">Planner Account Created</h1>
        <p style="margin:0 0 28px;color:rgba(255,255,255,0.6);font-size:15px;line-height:1.6;">Hey <strong style="color:#fff;">Marcus Rivera</strong>, your Event Planner dashboard is ready. You can now track bookings, rebook events, and manage details — all in one place.</p>
        <div style="background:rgba(168,85,247,0.05);border:1px solid rgba(168,85,247,0.2);border-radius:12px;padding:20px;margin-bottom:28px;">
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.3);font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Linked Booking</p>
          <p style="margin:0;color:#a855f7;font-size:20px;font-weight:800;">7H-BK-4821</p>
        </div>
        <a href="https://7thheavenband.com/planner" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:800;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 36px;border-radius:10px;">Open Planner Dashboard</a>
      </div>
      <div style="background:#08080c;padding:24px 32px;text-align:center;border:1px solid rgba(255,255,255,0.05);border-top:none;border-radius:0 0 16px 16px;"><p style="margin:0;color:#7c3aed;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">7thheavenband.com</p></div>
    </div>`,
  },
  {
    name: '7/7 — Booking Status Update (Approved)',
    subject: 'TEST 7/7: ✅ Booking Approved — 7H-BK-4821',
    html: `<div style="font-family:-apple-system,system-ui,sans-serif;max-width:580px;margin:0 auto;background:#0a0a0f;color:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);">
      <div style="padding:20px 40px;text-align:center;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:16px 16px 0 0;"><p style="margin:0;color:#fff;font-size:18px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">7TH HEAVEN</p></div>
      <div style="padding:40px 32px;background:#0a0a0f;text-align:center;">
        <p style="font-size:48px;margin:0 0 16px;">✅</p>
        <h1 style="margin:0 0 12px;color:#22c55e;font-size:26px;font-weight:900;text-transform:uppercase;">Booking Approved!</h1>
        <p style="margin:0 0 8px;color:rgba(255,255,255,0.3);font-size:12px;font-weight:700;letter-spacing:2px;">7H-BK-4821</p>
        <p style="margin:0 0 28px;color:rgba(255,255,255,0.6);font-size:15px;line-height:1.6;">Hey <strong style="color:#fff;">Marcus Rivera</strong>, Great news — your event has been confirmed. We look forward to rocking your stage!</p>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:28px;">
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.3);font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Event Date</p>
          <p style="margin:0;color:#fff;font-size:18px;font-weight:800;">June 14, 2026</p>
        </div>
        <a href="https://7thheavenband.com/planner" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:800;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 36px;border-radius:10px;">View Booking Details</a>
      </div>
      <div style="background:#08080c;padding:24px 32px;text-align:center;border:1px solid rgba(255,255,255,0.05);border-top:none;border-radius:0 0 16px 16px;"><p style="margin:0;color:#7c3aed;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">7thheavenband.com</p></div>
    </div>`,
  },
];

async function sendAll() {
  console.log(`\n🚀 Sending ${templates.length} test emails to ${TO}...\n`);

  for (const t of templates) {
    try {
      const res = await fetch(`${BASE}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: TO, subject: t.subject, html: t.html }),
      });
      const data = await res.json();
      if (data.success) {
        console.log(`  ✅ ${t.name}`);
      } else {
        console.log(`  ❌ ${t.name} — ${JSON.stringify(data)}`);
      }
    } catch (err) {
      console.log(`  ❌ ${t.name} — ${err.message}`);
    }
    // Small delay to avoid rate-limiting
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log('\n🎉 Done! Check your inbox at mikeyscimeca@gmail.com\n');
}

sendAll();
