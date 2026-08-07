import { NextRequest, NextResponse } from 'next/server';

const parseTime = (timeStr: string, defaultHour: number) => {
  try {
    const clean = timeStr.trim().toUpperCase();
    const isPM = clean.includes('PM');
    const isAM = clean.includes('AM');
    const numbers = clean.replace(/[A-Z\s]/g, '').split(':');
    let hour = parseInt(numbers[0], 10);
    let minute = numbers.length > 1 ? parseInt(numbers[1], 10) : 0;
    if (isPM && hour !== 12) hour += 12;
    if (isAM && hour === 12) hour = 0;
    return { hour, minute };
  } catch {
    return { hour: defaultHour, minute: 0 };
  }
};

const pad = (n: number) => String(n).padStart(2, '0');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId') || '7H-BK';
    const dateStr = searchParams.get('date') || '';
    const venue = searchParams.get('venue') || 'Show Venue';
    const city = searchParams.get('city') || '';
    const state = searchParams.get('state') || '';
    const eventType = searchParams.get('eventType') || 'Performance';
    const startTime = searchParams.get('startTime') || '7:00 PM';
    const endTime = searchParams.get('endTime') || '10:00 PM';

    // Parse date (e.g. "June 14, 2026") into YYYYMMDD
    let year = 2026;
    let month = 6;
    let day = 14;
    try {
      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          year = d.getFullYear();
          month = d.getMonth() + 1;
          day = d.getDate();
        }
      }
    } catch {}

    const start = parseTime(startTime, 19);
    const end = parseTime(endTime, 22);

    // Format for ICS (YYYYMMDDTHHMMSS)
    const icsDateStart = `${year}${pad(month)}${pad(day)}T${pad(start.hour)}${pad(start.minute)}00`;
    const icsDateEnd = `${year}${pad(month)}${pad(day)}T${pad(end.hour)}${pad(end.minute)}00`;
    const icsStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const location = [venue, city, state].filter(Boolean).join(', ');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//7th Heaven Band//Event Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${bookingId}@7thheavenband.com`,
      `DTSTAMP:${icsStamp}`,
      `DTSTART:${icsDateStart}`,
      `DTEND:${icsDateEnd}`,
      `SUMMARY:7th Heaven - ${eventType}`,
      `LOCATION:${location}`,
      `DESCRIPTION:Booking ID: ${bookingId}\\nEvent: ${eventType}\\nTime: ${startTime} - ${endTime}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return new Response(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="7th-heaven-booking-${bookingId}.ics"`
      }
    });
  } catch (error: any) {
    console.error('Error generating ICS file:', error);
    return NextResponse.json({ error: 'Failed to generate calendar file' }, { status: 500 });
  }
}
