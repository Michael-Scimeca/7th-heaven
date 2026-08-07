import { VENUE_COORDS } from "@/lib/venue-coords";

export { VENUE_COORDS };

export const typeConfig: Record<string, { color: string; label: string }> = {
  full: { color: "#a855f7", label: "Full Band" },
  unplugged: { color: "#9333ea", label: "Unplugged" },
  outdoor: { color: "#22c55e", label: "Outdoor" },
  casino: { color: "#eab308", label: "Casino" },
  tv: { color: "#06b6d4", label: "TV" },
  fundraiser: { color: "#f43f5e", label: "Fundraiser" },
  special: { color: "#ec4899", label: "Special" },
};

export function getShowType(info: string): string {
  const lower = info.toLowerCase();
  if (lower.includes("unplugged")) return "unplugged";
  if (lower.includes("outdoor") || lower.includes("beer garden") || lower.includes("fest")) return "outdoor";
  if (lower.includes("casino")) return "casino";
  if (lower.includes("tv") || lower.includes("wgn") || lower.includes("news")) return "tv";
  if (lower.includes("fundraiser") || lower.includes("gala") || lower.includes("rescue")) return "fundraiser";
  if (lower.includes("cruise")) return "special";
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
