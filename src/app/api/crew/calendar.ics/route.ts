import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import { sanityFetch } from "@/sanity/live";
import { queries, SanityTourDate } from "@/lib/sanity";

const FILE_PATH = path.join(process.cwd(), "schedules.json");

async function readSchedules() {
  try {
    const data = await fs.readFile(FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function fetchTourDates() {
  try {
    const { data } = await sanityFetch({ query: queries.allTourDates });
    return (data as SanityTourDate[]) || [];
  } catch {
    return [];
  }
}

const formatICalDate = (dateStr: string, hourDecimal: number) => {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return "";
  
  const yyyy = parts[0];
  const mm = parts[1];
  const dd = parts[2];
  
  const h = Math.floor(hourDecimal);
  const m = Math.round((hourDecimal - h) * 60);
  
  const hourStr = String(h).padStart(2, '0');
  const minStr = String(m).padStart(2, '0');
  
  return `${yyyy}${mm}${dd}T${hourStr}${minStr}00`;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const crewId = searchParams.get("crewId");
    
    const [schedules, tourDates] = await Promise.all([
      readSchedules(),
      fetchTourDates()
    ]);
    
    const filtered = crewId 
      ? schedules.filter((s: any) => s.crewId === crewId)
      : schedules;
      
    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//7thHeaven//Crew Scheduling Feed//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:" + (crewId ? `7th Heaven - ${filtered[0]?.crewName || crewId}` : "7th Heaven - Crew Schedule"),
      "X-WR-TIMEZONE:America/Chicago",
      "BEGIN:VTIMEZONE",
      "TZID:America/Chicago",
      "BEGIN:DAYLIGHT",
      "TZOFFSETFROM:-0600",
      "TZOFFSETTO:-0500",
      "TZNAME:CDT",
      "DTSTART:19700308T020000",
      "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
      "END:DAYLIGHT",
      "BEGIN:STANDARD",
      "TZOFFSETFROM:-0500",
      "TZOFFSETTO:-0600",
      "TZNAME:CST",
      "DTSTART:19701101T020000",
      "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
      "END:STANDARD",
      "END:VTIMEZONE"
    ];

    const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    for (const shift of filtered) {
      const dtStart = formatICalDate(shift.date, shift.startHour);
      const dtEnd = formatICalDate(shift.date, shift.endHour);
      
      if (!dtStart || !dtEnd) continue;
      
      const matchingShow = tourDates.find((show: any) => show.date === shift.date);
      
      const uid = `${shift.id || Math.random().toString(36).substring(2)}@7thheavenband.com`;
      
      icsContent.push("BEGIN:VEVENT");
      icsContent.push(`UID:${uid}`);
      icsContent.push(`DTSTAMP:${stamp}`);
      icsContent.push(`DTSTART;TZID=America/Chicago:${dtStart}`);
      icsContent.push(`DTEND;TZID=America/Chicago:${dtEnd}`);
      
      // Dynamic Summary
      const summary = matchingShow 
        ? `${shift.role} @ 7th Heaven Gig (${matchingShow.venue})`
        : `${shift.role} - ${shift.crewName}`;
      icsContent.push(`SUMMARY:${summary}`);
      
      // Dynamic Location
      const location = matchingShow 
        ? `${matchingShow.venue}, ${matchingShow.city || ""}, ${matchingShow.state || ""}`
        : shift.location;
      icsContent.push(`LOCATION:${location}`);
      
      // Dynamic Description with rich fields
      const descLines = [
        `Role / Duty: ${shift.role}`,
        `Working Hours: ${shift.time}`,
        `Location: ${location}`
      ];
      
      if (shift.notes) {
        descLines.push(`Crew Instructions: ${shift.notes}`);
      }
      
      if (matchingShow) {
        descLines.push(`--- SHOW DETAILS ---`);
        if (matchingShow.time) descLines.push(`Official Showtime: ${matchingShow.time}`);
        if (matchingShow.day) descLines.push(`Gig Day: ${matchingShow.day}`);
        if (matchingShow.notes) descLines.push(`Setlist / Show Notes: ${matchingShow.notes}`);
        if (matchingShow.ticketLink) descLines.push(`Ticket Link: ${matchingShow.ticketLink}`);
        if (matchingShow.directionsLink) descLines.push(`Google Maps Directions: ${matchingShow.directionsLink}`);
      }
      
      const descCleaned = descLines
        .map(line => line.replace(/[,;]/g, "\\$1"))
        .join("\\n");
        
      icsContent.push(`DESCRIPTION:${descCleaned}`);
      icsContent.push("END:VEVENT");
    }

    icsContent.push("END:VCALENDAR");

    const responseText = icsContent.join("\r\n");

    return new Response(responseText, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${crewId ? crewId : "crew"}-schedule.ics"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error: any) {
    return new Response("Error generating calendar feed: " + error.message, { status: 500 });
  }
}
