/**
 * Safari & Cross-Browser Safe Date Parsing Utilities
 * 
 * Safari's Date parser is notoriously strict and produces "Invalid Date" for
 * non-standard date strings (e.g. "Oct 12th", "10/12", "2026-10-12 19:00").
 * This module parses dates explicitly into Year, Month, Day, Hours, Minutes components
 * rather than relying on native Date.parse heuristics.
 */

const MONTH_MAP: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

/**
 * Parse time string into hours (0-23) and minutes (0-59).
 */
export function parseTimeSafe(timeStr?: string): { hours: number; minutes: number } | null {
  if (!timeStr) return null;
  const cleaned = timeStr.trim().toLowerCase();

  // e.g. "7:30 pm", "7:30pm", "7 pm", "7pm", "19:00", "7:00pm - 10:00pm"
  const match12 = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2] || "0", 10);
    const ampm = match12[3].toLowerCase();
    if (ampm === "pm" && h !== 12) h += 12;
    if (ampm === "am" && h === 12) h = 0;
    return { hours: h, minutes: m };
  }

  // 24-hour format e.g. "19:30" or "19:30:00"
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})/);
  if (match24) {
    const h = parseInt(match24[1], 10);
    const m = parseInt(match24[2], 10);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return { hours: h, minutes: m };
    }
  }

  return null;
}

/**
 * Parse a date and time string safely across all browsers (especially WebKit / iOS Safari).
 */
export function parseDateSafe(
  dateStr?: string,
  timeStr?: string,
  referenceYear?: number
): Date {
  if (!dateStr || typeof dateStr !== "string") {
    return new Date(0);
  }

  let trimmed = dateStr.trim();
  // Strip leading weekday (e.g. "Friday, ", "Fri ", "Saturday, ")
  trimmed = trimmed.replace(/^(?:mon|tue|wed|thu|fri|sat|sun)[a-z]*[,\s]+/i, "");
  const currentYear = referenceYear || new Date().getFullYear();

  // 1. ISO format: "2026-10-12" or "2026-10-12T19:00:00" or "2026-10-12 19:00:00"
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    const timeParsed = parseTimeSafe(timeStr);
    const hours = timeParsed ? timeParsed.hours : (isoMatch[4] ? parseInt(isoMatch[4], 10) : 23);
    const minutes = timeParsed ? timeParsed.minutes : (isoMatch[5] ? parseInt(isoMatch[5], 10) : 59);
    const seconds = isoMatch[6] ? parseInt(isoMatch[6], 10) : (timeParsed ? 0 : 59);
    return new Date(y, m, d, hours, minutes, seconds, 0);
  }

  // 2. Slash format: "10/12/2026" or "10/12"
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (slashMatch) {
    const m = parseInt(slashMatch[1], 10) - 1;
    const d = parseInt(slashMatch[2], 10);
    let y = slashMatch[3] ? parseInt(slashMatch[3], 10) : currentYear;
    if (y < 100) y += 2000;
    const timeParsed = parseTimeSafe(timeStr);
    const hours = timeParsed ? timeParsed.hours : 23;
    const minutes = timeParsed ? timeParsed.minutes : 59;
    return new Date(y, m, d, hours, minutes, timeParsed ? 0 : 59, 0);
  }

  // 3. Month name format: "October 12", "Oct 12th", "October 12, 2026", "Oct. 12th 2026"
  const monthNameMatch = trimmed.match(/^([a-zA-Z]+)\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?/i);
  if (monthNameMatch) {
    const monthKey = monthNameMatch[1].toLowerCase();
    const monthIdx = MONTH_MAP[monthKey];
    if (monthIdx !== undefined) {
      const d = parseInt(monthNameMatch[2], 10);
      const y = monthNameMatch[3] ? parseInt(monthNameMatch[3], 10) : currentYear;
      const timeParsed = parseTimeSafe(timeStr);
      const hours = timeParsed ? timeParsed.hours : 23;
      const minutes = timeParsed ? timeParsed.minutes : 59;
      return new Date(y, monthIdx, d, hours, minutes, timeParsed ? 0 : 59, 0);
    }
  }

  // Fallback: try Native Date parse with sanitized string
  const sanitized = trimmed.replace(/(st|nd|rd|th)/gi, "");
  const fallbackDate = new Date(sanitized);
  if (!isNaN(fallbackDate.getTime())) {
    const timeParsed = parseTimeSafe(timeStr);
    if (timeParsed) {
      fallbackDate.setHours(timeParsed.hours, timeParsed.minutes, 0, 0);
    }
    return fallbackDate;
  }

  return new Date(0);
}

/**
 * Returns a full Date for a tour show, checking startDate then date then time strings.
 */
export function getShowDateTime(
  startDateStr?: string,
  dateStr?: string,
  timeStr?: string,
): Date {
  if (startDateStr && startDateStr.trim()) {
    const d = parseDateSafe(startDateStr, timeStr);
    if (d.getTime() > 0) return d;
  }
  if (dateStr && dateStr.trim()) {
    return parseDateSafe(dateStr, timeStr);
  }
  return new Date(0);
}

/**
 * Determines whether a show has completed (expired 4 hours after its start time).
 */
export function isShowOver(show: {
  startDate?: string;
  date: string;
  time: string;
}): boolean {
  const showDateTime = getShowDateTime(show.startDate, show.date, show.time);
  return showDateTime.getTime() + 4 * 60 * 60 * 1000 < Date.now();
}
