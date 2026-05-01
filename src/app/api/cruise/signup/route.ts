import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { protectAction, sanitize } from '@/lib/security';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

import { cruiseCommunityWelcome } from '@/lib/email-templates';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

function generateCancelToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

function buildConfirmationEmail(name: string, guests: number, cancelToken: string, guestList?: {name: string; email?: string; phone?: string; age?: string; type: string}[]): string {
  const cancelUrl = `${SITE_URL}/cruise/cancel?token=${cancelToken}`;

  // Build guest roster rows
  let guestRosterHtml = '';
  if (guestList && guestList.length > 0) {
    const guestRows = guestList.map((g, i) => {
      const isChild = g.type === 'child';
      const badge = isChild
        ? `<span style="display:inline-block;padding:2px 8px;background:rgba(6,182,212,0.15);color:#06b6d4;font-size:10px;font-weight:700;border-radius:6px;text-transform:uppercase;letter-spacing:1px;">🧒 Child${g.age ? ` · Age ${g.age}` : ''}</span>`
        : `<span style="display:inline-block;padding:2px 8px;background:rgba(138,28,252,0.1);color:#8a1cfc;font-size:10px;font-weight:700;border-radius:6px;text-transform:uppercase;letter-spacing:1px;">👤 Adult</span>`;
      const contact = !isChild && (g.email || g.phone)
        ? `<br/><span style="color:rgba(255,255,255,0.25);font-size:11px;">${g.email || ''}${g.email && g.phone ? ' · ' : ''}${g.phone || ''}</span>`
        : '';
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:${isChild ? '#06b6d4' : '#8a1cfc'};color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:28px;">${g.name ? g.name[0].toUpperCase() : (i + 2)}</span>
              <div>
                <span style="color:#fff;font-size:13px;font-weight:600;">${g.name || 'Guest ' + (i + 2)}</span>
                ${contact}
              </div>
            </div>
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);text-align:right;vertical-align:middle;">
            ${badge}
          </td>
        </tr>`;
    }).join('');

    guestRosterHtml = `
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
                <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#8a1cfc;color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:28px;">${name ? name[0].toUpperCase() : '1'}</span>
                <span style="color:#fff;font-size:13px;font-weight:600;margin-left:8px;">${name}</span>
                <span style="color:rgba(255,255,255,0.25);font-size:11px;margin-left:4px;">(you)</span>
              </div>
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);text-align:right;">
              <span style="display:inline-block;padding:2px 8px;background:rgba(138,28,252,0.1);color:#8a1cfc;font-size:10px;font-weight:700;border-radius:6px;text-transform:uppercase;letter-spacing:1px;">👤 Primary</span>
            </td>
          </tr>
          ${guestRows}
        </table>
      </div>`;
  }

  return `
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
        Hey <strong>${name}</strong>,
      </p>
      <p style="margin:0 0 16px;color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">
        Thanks for signing up for the <strong style="color:#fff;">7th Heaven Caribbean Cruise</strong>!
        We've got you down for <strong style="color:#8a1cfc;">${guests} ${guests > 1 ? 'people' : 'person'}</strong> in your group.
      </p>
      <p style="margin:0 0 24px;color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">
        This is <strong style="color:#fff;">not a booking</strong> — it's a free interest signup. The more fans who sign up,
        the better group rate we can negotiate with cruise management. We'll email you
        the moment we have pricing locked in.
      </p>

      <!-- Guest Roster -->
      ${guestRosterHtml}

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
          <tr><td style="color:rgba(255,255,255,0.3);font-size:12px;">Your Group</td><td style="color:#8a1cfc;font-size:13px;font-weight:700;">${guests} ${guests > 1 ? 'people' : 'person'}</td></tr>
        </table>
      </div>
    </div>

    <!-- Share CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <p style="margin:0 0 12px;color:rgba(255,255,255,0.4);font-size:13px;">
        Help us get a better rate — spread the word!
      </p>
      <a href="${SITE_URL}/cruise" style="display:inline-block;padding:12px 32px;background:#8a1cfc;color:#fff;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;text-decoration:none;border-radius:10px;">
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
        <a href="${cancelUrl}" style="color:rgba(138,28,252,0.6);text-decoration:underline;">Cancel your signup</a>
      </p>
    </div>`;
}

// POST — new signup
export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, guest_count, notes, anonymous, guests, joinCommunity, website } = await req.json();

    // ── Protection ──
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const protection = await protectAction({
      identifier: `cruise:${ip}`,
      honeypotValue: website,
    });
    if (!protection.success) {
      return NextResponse.json({ error: protection.error }, { status: protection.status });
    }

    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'Name, email, and phone are required' }, { status: 400 });
    }

    const cancelToken = generateCancelToken();

    // Build guest details JSON for storage
    const guestDetails = guests && guests.length > 0
      ? JSON.stringify(guests.map((g: any) => ({ name: g.name, email: g.email, phone: g.phone, age: g.age || null, type: g.type || 'adult' })))
      : null;

    // Insert primary booker into Supabase
    const { data, error } = await supabase.from('cruise_signups').insert({
      name,
      email: email.toLowerCase().trim(),
      phone: phone || null,
      guest_count: guest_count || 1,
      notes: notes ? `${notes}${guestDetails ? `\n\nGuest Details: ${guestDetails}` : ''}` : (guestDetails ? `Guest Details: ${guestDetails}` : null),
      cancel_token: cancelToken,
      anonymous: anonymous || false,
    }).select().single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'This email has already signed up!' }, { status: 409 });
      }
      throw error;
    }

    // Send confirmation email to primary booker
    await sendEmail({
      to: email.toLowerCase().trim(),
      subject: '🚢 You\'re on the Cruise List! — 7th Heaven',
      html: buildConfirmationEmail(name, guest_count || 1, cancelToken, guests || []),
    });

    // Send Community Welcome if opted in — triggers Supabase Auth Invitation
    if (joinCommunity) {
      try {
        // Use generateLink to create the user and get the secure confirmation link without sending Supabase's default email
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'invite',
          email: email.toLowerCase().trim(),
          options: {
            data: { 
              full_name: name, 
              role: 'fan',
              cruise_signup_id: data?.id,
              source: 'cruise_signup'
            },
            redirectTo: `${SITE_URL}/cruise/dashboard`,
          }
        });

        if (linkError) {
          // If user already exists (likely error code for existing email), just update their profile
          const { data: existingUser } = await supabase.from('profiles').select('id').eq('email', email.toLowerCase().trim()).single();
          
          if (existingUser) {
            await supabase.from('profiles').update({ 
              cruise_signup_id: data?.id,
              signup_source: 'cruise_signup_optin' 
            }).eq('id', existingUser.id);
          }

          // Send a regular welcome email (no invite link since they already have an account)
          await sendEmail({
            to: email.toLowerCase().trim(),
            subject: '🚢 Welcome to the Cruise Community! — 7th Heaven',
            html: cruiseCommunityWelcome({ name }),
          });
        } else if (linkData?.properties?.action_link) {
          // New user created, send our custom branded invite email with the confirmation link
          await sendEmail({
            to: email.toLowerCase().trim(),
            subject: '🚢 Confirm Your Cruise Community Account — 7th Heaven',
            html: cruiseCommunityWelcome({ 
              name, 
              inviteLink: linkData.properties.action_link 
            }),
          });
        }
      } catch (authErr) {
        console.error('Community invitation process error:', authErr);
      }
    }

    // Send notification emails to each additional guest
    if (guests && guests.length > 0) {
      for (const guest of guests) {
        if (guest.email) {
          try {
            await sendEmail({
              to: guest.email.toLowerCase().trim(),
              subject: '🚢 You\'ve Been Added to the 7th Heaven Cruise List!',
              html: buildConfirmationEmail(guest.name || 'Fan', guest_count || 1, cancelToken, guests || []),
            });
          } catch {}
        }
      }
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error('Cruise signup error:', err);
    return NextResponse.json({ error: err?.message || 'Signup failed' }, { status: 500 });
  }
}

// DELETE — cancel signup via token
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Cancel token required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('cruise_signups')
      .delete()
      .eq('cancel_token', token)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Invalid or expired cancel link' }, { status: 404 });
    }

    // Send cancellation confirmation email
    await sendEmail({
      to: data.email,
      subject: 'Cruise Signup Cancelled — 7th Heaven',
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;text-align:center;">
    <h1 style="margin:0 0 8px;color:#fff;font-size:24px;font-weight:900;">Signup Cancelled</h1>
    <p style="margin:0 0 24px;color:rgba(255,255,255,0.4);font-size:14px;">
      Hey ${data.name}, your cruise interest signup has been removed.
    </p>
    <p style="margin:0 0 24px;color:rgba(255,255,255,0.5);font-size:14px;line-height:1.6;">
      If you change your mind, you can always sign up again at
      <a href="${SITE_URL}/cruise" style="color:#8a1cfc;text-decoration:underline;">7thheavenband.com/cruise</a>.
    </p>
    <p style="margin:0;color:rgba(255,255,255,0.15);font-size:11px;">7th Heaven · Chicago, IL</p>
  </div>
</body>
</html>`,
    });

    return NextResponse.json({ success: true, name: data.name });
  } catch (err: any) {
    console.error('Cruise cancel error:', err);
    return NextResponse.json({ error: err?.message || 'Cancel failed' }, { status: 500 });
  }
}
