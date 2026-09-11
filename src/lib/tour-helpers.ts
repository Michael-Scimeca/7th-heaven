import { VENUE_COORDS, CITY_COORDS, getVenueCoords } from "@/lib/venue-coords";

export { VENUE_COORDS, CITY_COORDS, getVenueCoords };

export const typeConfig: Record<string, { color: string; label: string; initial: string }> = {
  full: { color: "#a855f7", label: "Full Band", initial: "F" },
  unplugged: { color: "#c084fc", label: "Unplugged", initial: "U" },
  outdoor: { color: "#22c55e", label: "Outdoor", initial: "O" },
  casino: { color: "#eab308", label: "Casino", initial: "C" },
  tv: { color: "#06b6d4", label: "TV", initial: "T" },
  fundraiser: { color: "#f43f5e", label: "Fundraiser", initial: "G" },
  special: { color: "#ec4899", label: "Special", initial: "S" },
};

export function getShowType(showOrInfo: any): string {
  let info = "";
  let tags: string[] = [];
  let isFest = false;

  if (typeof showOrInfo === "string") {
    info = showOrInfo;
  } else if (showOrInfo && typeof showOrInfo === "object") {
    info = (showOrInfo.info || showOrInfo.notes || "") + " " + (showOrInfo.venue || "");
    tags = Array.isArray(showOrInfo.tags) ? showOrInfo.tags : [];
    isFest = Boolean(showOrInfo.isFestival);
  }

  const lower = info.toLowerCase();
  const hasTag = (t: string) => tags.some(tag => String(tag).toLowerCase().includes(t));

  if (hasTag("unplugged") || lower.includes("unplugged")) return "unplugged";
  if (isFest || hasTag("festival") || hasTag("outdoor") || lower.includes("outdoor") || lower.includes("beer garden") || lower.includes("fest")) return "outdoor";
  if (hasTag("casino") || lower.includes("casino")) return "casino";
  if (hasTag("tv") || lower.includes("tv") || lower.includes("wgn") || lower.includes("news")) return "tv";
  if (hasTag("fundraiser") || hasTag("gala") || lower.includes("fundraiser") || lower.includes("gala") || lower.includes("rescue")) return "fundraiser";
  if (hasTag("special") || hasTag("cruise") || lower.includes("cruise")) return "special";

  return "full";
}

export function getShowDateTime(startDateStr?: string, dateStr?: string, timeStr?: string): Date {
  let d: Date;
  if (startDateStr && /^\d{4}-\d{2}-\d{2}/.test(startDateStr)) {
    d = new Date(startDateStr + 'T00:00:00');
  } else if (dateStr) {
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      d = new Date(dateStr + 'T00:00:00');
    } else if (/\b\d{4}\b/.test(dateStr)) {
      d = new Date(dateStr);
    } else {
      const currentYear = new Date().getFullYear();
      d = new Date(`${dateStr}, ${currentYear}`);
    }
  } else {
    return new Date(0);
  }

  if (isNaN(d.getTime())) return new Date(0);

  if (timeStr) {
    const cleaned = timeStr.toLowerCase().replace(/\s+/g, '');
    const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (match) {
      let h = parseInt(match[1]);
      const m = parseInt(match[2] || '0');
      const ampm = match[3].toLowerCase();
      if (ampm === 'pm' && h !== 12) h += 12;
      if (ampm === 'am' && h === 12) h = 0;
      d.setHours(h, m, 0, 0);
      return d;
    }
  }
  // Default to end of day
  d.setHours(23, 59, 59, 999);
  return d;
}

export function isShowOver(show: { startDate?: string; date: string; time: string }): boolean {
  const showDateTime = getShowDateTime(show.startDate, show.date, show.time);
  return showDateTime.getTime() + (4 * 60 * 60 * 1000) < Date.now();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function ensureUpcomingTourDates<T extends { date: string; startDate?: string; time?: string; day?: string }>(shows: T[]): T[] {
  if (!shows || shows.length === 0) return shows;

  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  // Helper to format date into "Month Day" (e.g. "September 10")
  const formatDateToMonthDay = (dt: Date) => {
    const month = MONTH_NAMES[dt.getMonth()];
    const day = dt.getDate();
    return `${month} ${day}`;
  };

  // Check if there are any upcoming shows on or after today
  const hasUpcoming = shows.some(s => {
    const dt = getShowDateTime(s.startDate, s.date, s.time);
    return dt.getTime() + (4 * 60 * 60 * 1000) >= now.getTime();
  });

  if (hasUpcoming) {
    // Format date string to "Month Day" if it's in YYYY-MM-DD format
    return shows.map(s => {
      if (/^\d{4}-\d{2}-\d{2}/.test(s.date)) {
        const dt = getShowDateTime(s.startDate || s.date, s.date, s.time);
        if (!isNaN(dt.getTime()) && dt.getTime() > 0) {
          const formatted = formatDateToMonthDay(dt);
          const yyyy = dt.getFullYear();
          const mm = String(dt.getMonth() + 1).padStart(2, '0');
          const dd = String(dt.getDate()).padStart(2, '0');
          return {
            ...s,
            startDate: s.startDate || `${yyyy}-${mm}-${dd}`,
            date: formatted,
            day: s.day || DAY_NAMES[dt.getDay()],
          };
        }
      }
      return s;
    });
  }

  // If ALL shows are in the past, shift the schedule forward so the first show starts today
  const firstShowDt = getShowDateTime(shows[0].startDate, shows[0].date, shows[0].time);
  if (isNaN(firstShowDt.getTime()) || firstShowDt.getTime() === 0) return shows;

  const firstShowMidnight = new Date(firstShowDt.getFullYear(), firstShowDt.getMonth(), firstShowDt.getDate()).getTime();
  const diffMs = todayMidnight - firstShowMidnight;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return shows.map(s => {
    const dt = getShowDateTime(s.startDate, s.date, s.time);
    if (isNaN(dt.getTime()) || dt.getTime() === 0) return s;

    const newDt = new Date(dt.getTime() + diffDays * 24 * 60 * 60 * 1000);
    const yyyy = newDt.getFullYear();
    const mm = String(newDt.getMonth() + 1).padStart(2, '0');
    const dd = String(newDt.getDate()).padStart(2, '0');
    const newStartDate = `${yyyy}-${mm}-${dd}`;
    const newDayName = DAY_NAMES[newDt.getDay()];
    const newDateStr = formatDateToMonthDay(newDt);

    return {
      ...s,
      startDate: newStartDate,
      date: newDateStr,
      day: newDayName,
    };
  });
}
