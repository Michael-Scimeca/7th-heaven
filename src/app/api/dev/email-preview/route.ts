import { NextRequest, NextResponse } from "next/server";
import { EMAIL_TEMPLATES, raffleWin } from "@/lib/email-templates";
import { getShopifyProductForPrize } from "@/lib/shopify";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || "";
  
  if (id === "raffle_win") {
    const pin = "7482";
    const prizeName = searchParams.get("prize") || "Signed Vinyl Record";
    const claimUrl = "http://localhost:3000/claim/7482";

    const pinDigits = pin.split('').map(d =>
      `<td style="width:48px;height:56px;background:#0a0a0e;border:2px solid #FBBF24;border-radius:8px;text-align:center;font-size:28px;font-weight:900;color:#FBBF24;font-family:monospace;">${d}</td>`
    ).join('<td style="width:8px;"></td>');

    const lowerPrize = prizeName.toLowerCase();
    let imgPath = '/images/merch/vinyl.png';
    if (lowerPrize.includes('shirt') || lowerPrize.includes('tee')) {
      imgPath = '/images/merch/logo-tee.png';
    } else if (lowerPrize.includes('hood') || lowerPrize.includes('sweat')) {
      imgPath = '/images/merch/hoodie.png';
    }

    const origin = new URL(req.url).origin;
    let displayImage = `${origin}${imgPath}`;
    let displayTitle = prizeName;
    let displayDescription = "Congratulations — your name was drawn live!";

    // Retrieve from Shopify
    const shopifyProduct = await getShopifyProductForPrize(prizeName);
    if (shopifyProduct) {
      displayImage = shopifyProduct.imageUrl || displayImage;
      displayTitle = shopifyProduct.title || displayTitle;
      displayDescription = shopifyProduct.description || displayDescription;
    }


    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
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
    <div style="text-align:center;">
      <p style="font-size:52px;margin:0 0 16px;">🏆</p>
      <h1 style="margin:0 0 12px;color:#fff;font-size:28px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">YOU WON THE RAFFLE</h1>
      <p style="margin:0 0 32px;color:#888;font-size:15px;">${displayDescription}</p>
      
      <div style="background:#0a0a0e;border:2px solid #FBBF24;border-radius:12px;padding:24px;margin-bottom:28px;text-align:center;">
        <p style="margin:0 0 16px;color:#92600a;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Your Prize</p>
        <div style="margin-bottom:16px;">
          <img src="${displayImage}" alt="${displayTitle}" width="120" height="120" style="border-radius:8px;border:1px solid rgba(255,255,255,0.1);display:inline-block;" />
        </div>
        <p style="margin:0;color:#fff;font-size:22px;font-weight:900;">${displayTitle}</p>
        <p style="margin:8px 0 0;color:#FBBF24;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">
          Size: ${lowerPrize.includes('shirt') || lowerPrize.includes('tee') || lowerPrize.includes('hood') || lowerPrize.includes('sweat') ? 'S / M / L / XL / XXL (Select at Pickup/Checkout)' : 'Any Size'}
        </p>
      </div>

      <p style="margin:0 0 12px;color:#555;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Your Claim PIN</p>
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 8px;"><tr>${pinDigits}</tr></table>
      <p style="margin:0 0 24px;color:#444;font-size:11px;">Show this PIN to the crew at the merch table</p>

      <div style="margin:0 auto 28px;text-align:center;">
        <p style="margin:0 0 12px;color:#555;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">One-Time Use QR Code</p>
        <div style="display:inline-block;padding:12px;background:#fff;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.5);">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(claimUrl)}" width="140" height="140" alt="Claim QR Code" style="display:block;" />
        </div>
        <p style="margin:12px 0 0;color:#ef4444;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">⚠️ SINGLE-USE REDEMPTION ONLY</p>
      </div>

      <a href="${claimUrl}" style="display:inline-block;background:#FBBF24;color:#000;font-weight:900;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 36px;border-radius:10px;">Open My Claim Page</a>
    </div>
</td></tr>
<!-- Footer -->
<tr><td style="background:#08080c;padding:24px 32px;text-align:center;border:1px solid rgba(255,255,255,0.05);border-top:none;border-radius:0 0 16px 16px;">
<p style="margin:0 0 8px;color:#444;font-size:11px;">© 2026 7th Heaven — All rights reserved</p>
<p style="margin:0 0 8px;color:#7c3aed;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">7thheavenband.com</p>
<p style="margin:0 0 6px;color:#333;font-size:10px;">7th Heaven · Chicago, IL 60601</p>
<p style="margin:0;font-size:10px;"><a href="https://7thheavenband.com/api/newsletter/unsubscribe?email={{email}}" style="color:#555;text-decoration:underline;">Unsubscribe</a> · <a href="https://7thheavenband.com/privacy" style="color:#555;text-decoration:underline;">Privacy Policy</a></p>
</td></tr>
</table></td></tr></table></body></html>`;

    return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
  }

  if (id === "auth_pin") {
    const html = `
      <!DOCTYPE html><html><head><meta charset="utf-8"></head>
      <body style="margin:0;padding:24px;background:#050508;">
        <div style="font-family: sans-serif; background-color: #0c0c18; color: #ffffff; padding: 40px 20px; text-align: center; border: 1px solid rgba(255,255,255,0.1); max-width: 500px; margin: 0 auto; border-radius: 12px;">
          <h2 style="color: #a855f7; margin-bottom: 20px; font-weight: 800; text-transform: uppercase; tracking: 0.05em;">7th Heaven Verification</h2>
          <p style="font-size: 15px; color: rgba(255,255,255,0.7); line-height: 1.6; margin-bottom: 30px;">
            Use the 6-digit verification code below to confirm your email address and complete your signup.
          </p>
          <div style="font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #ffffff; background: rgba(255,255,255,0.03); padding: 18px 30px; margin: 20px auto; border-radius: 8px; width: fit-content; border: 1px solid rgba(255,255,255,0.1); font-family: monospace;">
            582901
          </div>
          <p style="font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 40px; line-height: 1.5;">
            This code is valid for 10 minutes. If you did not request this code, you can safely ignore this email.
          </p>
        </div>
      </body></html>
    `;
    return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
  }
  const template = EMAIL_TEMPLATES.find(t => t.id === id);
  if (!template) {
    return new NextResponse(`Template ${id} not found`, { status: 404 });
  }
  return new NextResponse(template.render(), {
    headers: { "Content-Type": "text/html" }
  });
}
