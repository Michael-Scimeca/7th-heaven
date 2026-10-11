import supabaseShowsData from "@/data/shows-supabase.json";

export interface SupabaseShowRecord {
  id: string;
  venue_name: string;
  city: string;
  state: string;
  date: string;
  time?: string;
}

const supabaseShows: SupabaseShowRecord[] = supabaseShowsData as SupabaseShowRecord[];

function normalize(str?: string): string {
  return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Pre-computed indexes for instant synchronous lookup
const exactDateVenueMap = new Map<string, string>();
const showsByDateMap = new Map<string, SupabaseShowRecord[]>();
const showsByVenueMap = new Map<string, SupabaseShowRecord[]>();

for (const s of supabaseShows) {
  const normV = normalize(s.venue_name);
  exactDateVenueMap.set(`${s.date}_${normV}`, s.id);

  if (!showsByDateMap.has(s.date)) {
    showsByDateMap.set(s.date, []);
  }
  showsByDateMap.get(s.date)!.push(s);

  if (!showsByVenueMap.has(normV)) {
    showsByVenueMap.set(normV, []);
  }
  showsByVenueMap.get(normV)!.push(s);
}

/**
 * Finds the Supabase show ID for a given show based on date and venue.
 */
export function findShowId(options: {
  date?: string;
  startDate?: string;
  venue?: string;
}): string | undefined {
  const normV = normalize(options.venue);
  const d = options.startDate || (options.date && /^\d{4}-\d{2}-\d{2}$/.test(options.date) ? options.date : undefined);

  // 1. Direct exact match (date + normalized venue)
  if (d && normV && exactDateVenueMap.has(`${d}_${normV}`)) {
    return exactDateVenueMap.get(`${d}_${normV}`);
  }

  // 2. Partial venue match on same date
  if (d && showsByDateMap.has(d)) {
    const list = showsByDateMap.get(d)!;
    for (const s of list) {
      const sNorm = normalize(s.venue_name);
      if (sNorm.includes(normV) || normV.includes(sNorm)) {
        return s.id;
      }
    }
    // If only 1 show on that date, return it
    if (list.length === 1) {
      return list[0].id;
    }
  }

  // 3. Match venue within +/- 35 days (handles slight calendar re-schedulings)
  if (normV && showsByVenueMap.has(normV)) {
    const list = showsByVenueMap.get(normV)!;
    if (list.length === 1) return list[0].id;
    if (d) {
      const targetTime = new Date(d).getTime();
      let closest: SupabaseShowRecord | null = null;
      let minDiff = Infinity;
      for (const s of list) {
        const diff = Math.abs(new Date(s.date).getTime() - targetTime);
        if (diff < minDiff && diff <= 35 * 86400000) {
          minDiff = diff;
          closest = s;
        }
      }
      if (closest) return closest.id;
    }
  }

  return undefined;
}

export function getAllSupabaseShows(): SupabaseShowRecord[] {
  return supabaseShows;
}
