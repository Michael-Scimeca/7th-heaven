"use client";

export default function EmailPreviewPage() {
  const sampleGuests = [
    { name: "Sarah Johnson", email: "sarah@example.com", phone: "(312) 555-0102", type: "adult" },
    { name: "Jake Johnson", email: "jake@example.com", phone: "(312) 555-0103", type: "adult" },
    { name: "Lily Johnson", email: "", phone: "", age: "8", type: "child" },
    { name: "Max Johnson", email: "", phone: "", age: "5", type: "child" },
  ];

  const primaryName = "Michael Scimeca";
  const guestCount = 5;

  // Build guest roster
  const guestRows = sampleGuests.map((g, i) => {
    const isChild = g.type === 'child';
    const badge = isChild
      ? `<span style="display:inline-block;padding:2px 8px;background:rgba(6,182,212,0.15);color:#06b6d4;font-size:10px;font-weight:700;border-radius:6px;text-transform:uppercase;letter-spacing:1px;">🧒 Child${g.age ? ' · Age ' + g.age : ''}</span>`
      : `<span style="display:inline-block;padding:2px 8px;background:rgba(138,28,252,0.1);color:#8a1cfc;font-size:10px;font-weight:700;border-radius:6px;text-transform:uppercase;letter-spacing:1px;">👤 Adult</span>`;
    const contact = !isChild && (g.email || g.phone)
      ? `<br/><span style="color:rgba(255,255,255,0.25);font-size:11px;">${g.email || ''}${g.email && g.phone ? ' · ' : ''}${g.phone || ''}</span>`
      : '';
    return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);">
          <div>
            <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:${isChild ? '#06b6d4' : '#8a1cfc'};color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:28px;">${g.name[0].toUpperCase()}</span>
            <span style="color:#fff;font-size:13px;font-weight:600;margin-left:8px;">${g.name}</span>
            ${contact}
          </div>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);text-align:right;vertical-align:middle;">
          ${badge}
        </td>
      </tr>`;
  }).join('');

  const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;font-style:italic;letter-spacing:-0.5px;">
        🚢 You're on the List!
      </h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.4);font-size:14px;">
        7th Heaven Cruise — Interest Confirmed
      </p>
    </div>

    <!-- Card -->
    <div style="background:#111118;border:1px solid rgba(138,28,252,0.3);border-radius:16px;padding:32px;margin-bottom:24px;">
      <p style="margin:0 0 16px;color:#fff;font-size:16px;">
        Hey <strong>${primaryName}</strong>,
      </p>
      <p style="margin:0 0 16px;color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">
        Thanks for signing up for the <strong style="color:#fff;">7th Heaven Caribbean Cruise</strong>!
        We've got you down for <strong style="color:#8a1cfc;">${guestCount} people</strong> in your group.
      </p>
      <p style="margin:0 0 24px;color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">
        This is <strong style="color:#fff;">not a booking</strong> — it's a free interest signup. The more fans who sign up,
        the better group rate we can negotiate with cruise management. We'll email you
        the moment we have pricing locked in.
      </p>

      <!-- Guest Roster -->
      <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:0;margin-bottom:24px;overflow:hidden;">
        <div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.05);">
          <p style="margin:0;color:rgba(255,255,255,0.3);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;">
            Your Group
          </p>
        </div>
        <table style="width:100%;border-spacing:0;">
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);">
              <div>
                <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#8a1cfc;color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:28px;">M</span>
                <span style="color:#fff;font-size:13px;font-weight:600;margin-left:8px;">${primaryName}</span>
                <span style="color:rgba(255,255,255,0.25);font-size:11px;margin-left:4px;">(you)</span>
              </div>
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);text-align:right;">
              <span style="display:inline-block;padding:2px 8px;background:rgba(138,28,252,0.1);color:#8a1cfc;font-size:10px;font-weight:700;border-radius:6px;text-transform:uppercase;letter-spacing:1px;">👤 Primary</span>
            </td>
          </tr>
          ${guestRows}
        </table>
      </div>

      <!-- What's Next -->
      <div style="background:rgba(138,28,252,0.05);border:1px solid rgba(138,28,252,0.15);border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px;color:#8a1cfc;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;">
          What Happens Next
        </p>
        <table style="width:100%;border-spacing:0 8px;">
          <tr>
            <td style="color:#8a1cfc;font-weight:900;font-size:14px;width:24px;vertical-align:top;padding-right:10px;">1</td>
            <td style="color:rgba(255,255,255,0.5);font-size:13px;">We collect interest and build the headcount</td>
          </tr>
          <tr>
            <td style="color:#8a1cfc;font-weight:900;font-size:14px;width:24px;vertical-align:top;padding-right:10px;">2</td>
            <td style="color:rgba(255,255,255,0.5);font-size:13px;">We negotiate the best group rate with the cruise line</td>
          </tr>
          <tr>
            <td style="color:#8a1cfc;font-weight:900;font-size:14px;width:24px;vertical-align:top;padding-right:10px;">3</td>
            <td style="color:rgba(255,255,255,0.5);font-size:13px;">You get <strong style="color:#fff;">first access</strong> to book at the locked-in price</td>
          </tr>
        </table>
      </div>

      <!-- Cruise Details -->
      <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:20px;">
        <p style="margin:0 0 12px;color:rgba(255,255,255,0.3);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;">
          Cruise Overview
        </p>
        <table style="width:100%;border-spacing:0 6px;">
          <tr><td style="color:rgba(255,255,255,0.3);font-size:12px;width:90px;">Route</td><td style="color:#fff;font-size:13px;font-weight:600;">Miami → Caribbean → Miami</td></tr>
          <tr><td style="color:rgba(255,255,255,0.3);font-size:12px;">Duration</td><td style="color:#fff;font-size:13px;font-weight:600;">7 Nights</td></tr>
          <tr><td style="color:rgba(255,255,255,0.3);font-size:12px;">Islands</td><td style="color:#fff;font-size:13px;font-weight:600;">Cozumel · Grand Cayman · Roatán</td></tr>
          <tr><td style="color:rgba(255,255,255,0.3);font-size:12px;">Shows</td><td style="color:#fff;font-size:13px;font-weight:600;">6 Live Performances</td></tr>
          <tr><td style="color:rgba(255,255,255,0.3);font-size:12px;">Your Group</td><td style="color:#8a1cfc;font-size:13px;font-weight:700;">${guestCount} people</td></tr>
        </table>
      </div>
    </div>

    <!-- Share CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <p style="margin:0 0 12px;color:rgba(255,255,255,0.4);font-size:13px;">
        Help us get a better rate — spread the word!
      </p>
      <a href="#" style="display:inline-block;padding:12px 32px;background:#8a1cfc;color:#fff;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;text-decoration:none;border-radius:10px;">
        Share the Cruise Page
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-top:24px;border-top:1px solid rgba(255,255,255,0.05);">
      <p style="margin:0 0 8px;color:rgba(255,255,255,0.2);font-size:11px;">
        7th Heaven · Chicago, IL
      </p>
      <p style="margin:0;color:rgba(255,255,255,0.15);font-size:11px;">
        Changed your mind?
        <a href="#" style="color:rgba(138,28,252,0.6);text-decoration:underline;">Cancel your signup</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  return (
    <div className="min-h-screen bg-[#1a1a2e] pt-28 pb-20">
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
        {/* Email client chrome */}
        <div style={{ background: "#1e1e2e", borderRadius: "16px 16px 0 0", border: "1px solid rgba(255,255,255,0.08)", borderBottom: "none", padding: "20px 24px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, fontWeight: 600, width: 50, textAlign: "right" }}>From:</span>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>7th Heaven &lt;noreply@7thheaven.band&gt;</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, fontWeight: 600, width: 50, textAlign: "right" }}>To:</span>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>michael@example.com</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, fontWeight: 600, width: 50, textAlign: "right" }}>Subject:</span>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>🚢 You&apos;re on the Cruise List! — 7th Heaven</span>
            </div>
          </div>
        </div>
        {/* Email body */}
        <div style={{ borderRadius: "0 0 16px 16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <iframe
            srcDoc={emailHtml}
            style={{ width: "100%", height: 1100, border: "none", display: "block" }}
            title="Email Preview"
          />
        </div>
      </div>
    </div>
  );
}
