import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ADMIN_EMAIL = "mikeyscimeca@gmail.com";

function generateBookingId() {
  return `7H-BK-${Math.floor(1000 + Math.random() * 9000)}`;
}

function buildPlannerEmailHtml(booking: any) {
  return `
  <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #fff; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);">
    <div style="padding: 40px 32px; text-align: center; background: linear-gradient(135deg, #1a0030, #0a0a0f);">
      <h1 style="margin: 0 0 8px; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">Booking Request Received</h1>
      <p style="margin: 0; color: rgba(255,255,255,0.4); font-size: 14px;">7th Heaven Live — Event Booking</p>
    </div>
    <div style="padding: 32px;">
      <p style="color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
        Hey <strong style="color: #fff;">${booking.name}</strong>, thanks for submitting your booking request! Our team will review your event details and get back to you within 24–48 hours.
      </p>
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.3); font-weight: 700;">Booking ID</p>
        <p style="margin: 0 0 20px; font-size: 18px; font-weight: 800; color: #a855f7;">${booking.bookingId}</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; width: 120px;">Event</td>
            <td style="padding: 8px 0; color: #fff; font-size: 14px; font-weight: 600;">${booking.eventType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Date</td>
            <td style="padding: 8px 0; color: #fff; font-size: 14px; font-weight: 600;">${booking.eventDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Time</td>
            <td style="padding: 8px 0; color: #fff; font-size: 14px; font-weight: 600;">${booking.startTime || 'TBD'} – ${booking.endTime || 'TBD'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Venue</td>
            <td style="padding: 8px 0; color: #fff; font-size: 14px; font-weight: 600;">${booking.venueName || 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Location</td>
            <td style="padding: 8px 0; color: #fff; font-size: 14px; font-weight: 600;">${booking.venueCity}, ${booking.venueState}</td>
          </tr>
        </table>
      </div>
      <p style="color: rgba(255,255,255,0.4); font-size: 13px; line-height: 1.6; margin: 0;">
        If you have any questions, reply directly to this email or contact us at <a href="mailto:7thheaven@gmail.com" style="color: #a855f7; text-decoration: none;">7thheaven@gmail.com</a>.
      </p>
    </div>
    <div style="padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
      <p style="margin: 0; color: rgba(255,255,255,0.2); font-size: 11px;">© 7th Heaven Live — All rights reserved</p>
    </div>
  </div>`;
}

function buildAdminNotificationHtml(booking: any) {
  return `
  <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #fff; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);">
    <div style="padding: 32px; text-align: center; background: linear-gradient(135deg, #1a0030, #0a0a0f);">
      <p style="margin: 0 0 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #a855f7; font-weight: 800;">⚡ New Booking Request</p>
      <h1 style="margin: 0; font-size: 24px; font-weight: 900;">${booking.bookingId}</h1>
    </div>
    <div style="padding: 32px;">
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px; margin-bottom: 16px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; width: 130px;">Name</td>
            <td style="padding: 6px 0; color: #fff; font-size: 14px; font-weight: 600;">${booking.name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Email</td>
            <td style="padding: 6px 0; color: #a855f7; font-size: 14px; font-weight: 600;">${booking.email}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Phone</td>
            <td style="padding: 6px 0; color: #fff; font-size: 14px; font-weight: 600;">${booking.phone || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Organization</td>
            <td style="padding: 6px 0; color: #fff; font-size: 14px; font-weight: 600;">${booking.organization || 'N/A'}</td>
          </tr>
          <tr><td colspan="2" style="padding: 10px 0;"><hr style="border: none; border-top: 1px solid rgba(255,255,255,0.05);"></td></tr>
          <tr>
            <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Event Type</td>
            <td style="padding: 6px 0; color: #fff; font-size: 14px; font-weight: 600;">${booking.eventType}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Date</td>
            <td style="padding: 6px 0; color: #fff; font-size: 14px; font-weight: 600;">${booking.eventDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Time</td>
            <td style="padding: 6px 0; color: #fff; font-size: 14px; font-weight: 600;">${booking.startTime || 'TBD'} – ${booking.endTime || 'TBD'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Venue</td>
            <td style="padding: 6px 0; color: #fff; font-size: 14px; font-weight: 600;">${booking.venueName || 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Location</td>
            <td style="padding: 6px 0; color: #fff; font-size: 14px; font-weight: 600;">${booking.venueCity}, ${booking.venueState}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Indoor/Outdoor</td>
            <td style="padding: 6px 0; color: #fff; font-size: 14px; font-weight: 600;">${booking.indoorOutdoor || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Attendance</td>
            <td style="padding: 6px 0; color: #fff; font-size: 14px; font-weight: 600;">${booking.expectedAttendance || 'N/A'}</td>
          </tr>
        </table>
      </div>
      ${booking.details ? `<div style="background: rgba(168,85,247,0.05); border: 1px solid rgba(168,85,247,0.15); border-radius: 12px; padding: 16px; margin-bottom: 16px;"><p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.3); font-weight: 700;">Additional Notes</p><p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.5;">${booking.details}</p></div>` : ''}
    </div>
  </div>`;
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "bookings.json");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json([]);
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.eventDate || !data.eventType || !data.venueCity || !data.venueState) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const bookingId = generateBookingId();

    // Add timestamp and ID
    const booking = {
      ...data,
      bookingId,
      submittedAt: new Date().toISOString(),
      status: "pending",
    };

    // Save to JSON file
    const filePath = path.join(process.cwd(), "data", "bookings.json");
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let bookings = [];
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      bookings = JSON.parse(raw);
    }
    bookings.push(booking);
    fs.writeFileSync(filePath, JSON.stringify(bookings, null, 2));

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
    const { bookingId, status } = await request.json();
    
    const filePath = path.join(process.cwd(), "data", "bookings.json");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "No bookings found" }, { status: 404 });
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const bookings = JSON.parse(raw);
    const idx = bookings.findIndex((b: any) => b.bookingId === bookingId);
    
    if (idx === -1) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    bookings[idx].status = status;
    bookings[idx].updatedAt = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify(bookings, null, 2));

    return NextResponse.json({ success: true, booking: bookings[idx] });
  } catch (error) {
    console.error("Booking PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
