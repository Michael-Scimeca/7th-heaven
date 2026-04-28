"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Show {
  id: string;
  venue: string;
  city: string;
  state: string;
  date: string;
  time: string;
  ticketLink: string;
  directionsLink: string;
  isSoldOut: boolean;
  isFestival: boolean;
  notes: string;
  lat: number | null;
  lng: number | null;
}

/* ── US state centroids for geocoding fallback ── */
const STATE_COORDS: Record<string, [number, number]> = {
  IL: [40.0, -89.0], IN: [39.85, -86.26], WI: [44.5, -89.5], MI: [44.3, -84.5],
  OH: [40.4, -82.7], MN: [46.0, -94.2], IA: [42.0, -93.5], MO: [38.5, -92.3],
  KY: [37.8, -84.3], TN: [35.8, -86.3], FL: [28.1, -81.6], TX: [31.0, -100.0],
  NY: [42.0, -75.5], CA: [36.7, -119.4], PA: [41.2, -77.2], NJ: [40.0, -74.5],
  GA: [32.7, -83.5], NC: [35.6, -79.4], VA: [37.4, -79.5], CO: [39.0, -105.5],
  AZ: [34.0, -112.0], NV: [39.0, -117.0], SC: [34.0, -81.0], AL: [32.8, -86.8],
  LA: [31.0, -92.0], MS: [32.7, -89.7], AR: [34.7, -92.3], OK: [35.5, -97.5],
  KS: [38.5, -98.0], NE: [41.5, -100.0], SD: [44.5, -100.0], ND: [47.5, -100.5],
  MT: [46.8, -110.4], WY: [43.0, -107.5], ID: [44.0, -114.7], WA: [47.4, -120.7],
  OR: [43.8, -120.5], UT: [39.3, -111.7], NM: [34.5, -106.0], WV: [38.6, -80.6],
  MD: [39.0, -76.8], CT: [41.6, -72.7], MA: [42.4, -71.8], ME: [45.3, -69.5],
  NH: [43.2, -71.6], VT: [44.0, -72.7], RI: [41.7, -71.5], DE: [39.0, -75.5],
  HI: [19.9, -155.6], AK: [64.0, -153.0],
};

/* ── City-level geocoding for common cities ── */
const CITY_COORDS: Record<string, [number, number]> = {
  "chicago,il": [41.8781, -87.6298], "aurora,il": [41.7606, -88.3201], "naperville,il": [41.7508, -88.1535],
  "rockford,il": [42.2711, -89.0940], "joliet,il": [41.5250, -88.0817], "springfield,il": [39.7817, -89.6501],
  "peoria,il": [40.6936, -89.5890], "elgin,il": [42.0355, -88.2826], "waukegan,il": [42.3636, -87.8448],
  "cicero,il": [41.8456, -87.7539], "champaign,il": [40.1164, -88.2434], "bloomington,il": [40.4842, -88.9937],
  "arlington heights,il": [42.0884, -87.9806], "schaumburg,il": [42.0334, -88.0834],
  "indianapolis,in": [39.7684, -86.1581], "milwaukee,wi": [43.0389, -87.9065],
  "detroit,mi": [42.3314, -83.0458], "columbus,oh": [39.9612, -82.9988], "cleveland,oh": [41.4993, -81.6944],
  "minneapolis,mn": [44.9778, -93.2650], "st. louis,mo": [38.6270, -90.1994], "kansas city,mo": [39.0997, -94.5786],
  "nashville,tn": [36.1627, -86.7816], "memphis,tn": [35.1495, -90.0490],
  "new york,ny": [40.7128, -74.0060], "los angeles,ca": [34.0522, -118.2437],
  "miami,fl": [25.7617, -80.1918], "orlando,fl": [28.5383, -81.3792], "tampa,fl": [27.9506, -82.4572],
  "dallas,tx": [32.7767, -96.7970], "houston,tx": [29.7604, -95.3698], "austin,tx": [30.2672, -97.7431],
  "denver,co": [39.7392, -104.9903], "phoenix,az": [33.4484, -112.0740], "las vegas,nv": [36.1699, -115.1398],
  "atlanta,ga": [33.7490, -84.3880], "charlotte,nc": [35.2271, -80.8431], "seattle,wa": [47.6062, -122.3321],
  "portland,or": [45.5152, -122.6784], "boston,ma": [42.3601, -71.0589], "philadelphia,pa": [39.9526, -75.1652],
  "pittsburgh,pa": [40.4406, -79.9959], "baltimore,md": [39.2904, -76.6122],
};

function getCoords(show: Show): [number, number] | null {
  if (show.lat && show.lng) return [show.lat, show.lng];
  const cityKey = `${show.city.toLowerCase()},${show.state.toLowerCase()}`;
  if (CITY_COORDS[cityKey]) return CITY_COORDS[cityKey];
  if (STATE_COORDS[show.state.toUpperCase()]) return STATE_COORDS[show.state.toUpperCase()];
  return null;
}

export default function TourMapClient({ shows }: { shows: Show[] }) {
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);

  const now = new Date();
  const filtered = useMemo(() => {
    return shows.filter(s => {
      if (!s.date) return filter === "all";
      const d = new Date(s.date + "T23:59:59");
      if (filter === "upcoming") return d >= now;
      if (filter === "past") return d < now;
      return true;
    });
  }, [shows, filter]);

  const geoShows = useMemo(() => {
    return filtered.map(s => ({ ...s, coords: getCoords(s) })).filter(s => s.coords);
  }, [filtered]);

  // Stats
  const totalVenues = new Set(shows.map(s => s.venue)).size;
  const totalCities = new Set(shows.map(s => `${s.city},${s.state}`)).size;
  const totalStates = new Set(shows.map(s => s.state)).size;
  const upcomingCount = shows.filter(s => s.date && new Date(s.date + "T23:59:59") >= now).length;

  // Center the map on the average coordinates
  const avgLat = geoShows.length > 0 ? geoShows.reduce((s, g) => s + g.coords![0], 0) / geoShows.length : 41.8;
  const avgLng = geoShows.length > 0 ? geoShows.reduce((s, g) => s + g.coords![1], 0) / geoShows.length : -87.6;

  // Use OpenStreetMap tiles via iframe for zero-dependency map
  const mapMarkers = geoShows.map(s => {
    const isPast = s.date && new Date(s.date + "T23:59:59") < now;
    return { ...s, isPast };
  });

  return (
    <div className="pt-[72px] min-h-screen bg-[var(--color-bg-primary)]">
      {/* Header */}
      <div className="site-container pt-12 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Link href="/tour" className="text-[0.6rem] font-bold uppercase tracking-widest text-white/30 hover:text-[var(--color-accent)] transition-colors mb-3 inline-block">
              ← Back to Tour Dates
            </Link>
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Tour <span className="accent-gradient-text">Map</span>
            </h1>
            <p className="text-white/40 text-sm mt-2">Every venue we&apos;ve played and where we&apos;re headed next.</p>
          </div>
          {/* Stats */}
          <div className="flex gap-6">
            {[
              { n: totalVenues, l: "Venues" },
              { n: totalCities, l: "Cities" },
              { n: totalStates, l: "States" },
              { n: upcomingCount, l: "Upcoming" },
            ].map(s => (
              <div key={s.l} className="text-center">
                <p className="text-2xl font-black text-white">{s.n}</p>
                <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-white/25">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-8">
          {(["all", "upcoming", "past"] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setSelectedShow(null); }}
              className={`px-4 py-2 text-[0.6rem] font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
                filter === f ? "bg-[var(--color-accent)] text-white" : "bg-white/[0.03] text-white/40 border border-white/5 hover:bg-white/[0.06]"
              }`}
            >
              {f === "all" ? `All Shows (${shows.length})` : f === "upcoming" ? `Upcoming (${shows.filter(s => s.date && new Date(s.date + "T23:59:59") >= now).length})` : `Past (${shows.filter(s => s.date && new Date(s.date + "T23:59:59") < now).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Map + List */}
      <div className="site-container pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 relative bg-[#0a0a12] border border-white/5 rounded-2xl overflow-hidden" style={{ minHeight: "550px" }}>
            {/* OpenStreetMap embed */}
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${avgLng - 8},${avgLat - 5},${avgLng + 8},${avgLat + 5}&layer=mapnik`}
              className="w-full h-full absolute inset-0 opacity-30 grayscale invert"
              style={{ minHeight: "550px", border: "none", filter: "grayscale(1) invert(1) brightness(0.4) contrast(1.2) hue-rotate(200deg)" }}
              loading="lazy"
            />
            {/* Custom marker overlay */}
            <div className="relative z-10 p-6 h-full flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_rgba(133,29,239,0.6)]" />
                  <span className="text-[0.55rem] text-white/40 font-bold uppercase tracking-widest">Upcoming</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-white/20" />
                  <span className="text-[0.55rem] text-white/40 font-bold uppercase tracking-widest">Past</span>
                </div>
              </div>
              {/* Show pins as a visual list on the map */}
              <div className="flex-1 flex flex-wrap content-start gap-2 overflow-y-auto">
                {mapMarkers.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedShow(s)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer text-left ${
                      selectedShow?.id === s.id
                        ? "bg-[var(--color-accent)]/20 border-[var(--color-accent)]/50 shadow-[0_0_15px_rgba(133,29,239,0.3)]"
                        : s.isPast
                        ? "bg-white/[0.03] border-white/5 hover:border-white/15 hover:bg-white/[0.06]"
                        : "bg-[var(--color-accent)]/5 border-[var(--color-accent)]/15 hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/10"
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.isPast ? "bg-white/20" : "bg-[var(--color-accent)] shadow-[0_0_6px_rgba(133,29,239,0.5)]"}`} />
                    <div>
                      <p className="text-[0.7rem] font-bold text-white leading-tight">{s.venue}</p>
                      <p className="text-[0.55rem] text-white/30">{s.city}, {s.state}</p>
                    </div>
                  </button>
                ))}
              </div>
              {geoShows.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-white/20 text-sm">No shows to display for this filter.</p>
                </div>
              )}
            </div>
          </div>

          {/* Show List / Details */}
          <div className="space-y-4">
            {selectedShow ? (
              /* Selected show detail */
              <div className="bg-white/[0.02] border border-[var(--color-accent)]/30 rounded-2xl p-6 space-y-4 shadow-[0_0_30px_rgba(133,29,239,0.1)]">
                <button onClick={() => setSelectedShow(null)} className="text-[0.55rem] text-white/30 hover:text-white font-bold uppercase tracking-widest cursor-pointer">← All Shows</button>
                <div>
                  <h3 className="text-xl font-black text-white">{selectedShow.venue}</h3>
                  <p className="text-[0.8rem] text-white/40">{selectedShow.city}, {selectedShow.state}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-[0.65rem] font-bold uppercase tracking-widest text-white/30">
                  {selectedShow.date && (
                    <span>{new Date(selectedShow.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                  )}
                  {selectedShow.time && <span>· {selectedShow.time}</span>}
                </div>
                {selectedShow.notes && <p className="text-[0.8rem] text-white/50 leading-relaxed">{selectedShow.notes}</p>}
                <div className="flex flex-wrap gap-2">
                  {selectedShow.isSoldOut && (
                    <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[0.55rem] font-bold uppercase tracking-widest rounded-lg">Sold Out</span>
                  )}
                  {selectedShow.isFestival && (
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[0.55rem] font-bold uppercase tracking-widest rounded-lg">Festival</span>
                  )}
                  {selectedShow.date && new Date(selectedShow.date + "T23:59:59") >= now && !selectedShow.isSoldOut && (
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[0.55rem] font-bold uppercase tracking-widest rounded-lg">Upcoming</span>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  {selectedShow.ticketLink && (
                    <a href={selectedShow.ticketLink} target="_blank" rel="noopener noreferrer"
                      className="flex-1 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white text-center text-[0.65rem] font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(133,29,239,0.3)]">
                      Get Tickets
                    </a>
                  )}
                  {selectedShow.directionsLink && (
                    <a href={selectedShow.directionsLink} target="_blank" rel="noopener noreferrer"
                      className="py-3 px-5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white/60 hover:text-white text-[0.65rem] font-bold uppercase tracking-widest rounded-xl transition-all">
                      Directions
                    </a>
                  )}
                </div>
              </div>
            ) : (
              /* Show list */
              <>
                <h2 className="text-lg font-black uppercase italic tracking-tight" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  {filter === "upcoming" ? "Upcoming" : filter === "past" ? "Past" : "All"} Shows
                  <span className="text-white/20 ml-2">({filtered.length})</span>
                </h2>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-hide">
                  {filtered.map(s => {
                    const isPast = s.date && new Date(s.date + "T23:59:59") < now;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedShow(s)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          isPast ? "bg-white/[0.01] border-white/5 hover:border-white/10" : "bg-[var(--color-accent)]/5 border-[var(--color-accent)]/10 hover:border-[var(--color-accent)]/30"
                        }`}
                      >
                        {s.date ? (
                          <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg shrink-0 ${isPast ? "bg-white/5 border border-white/5" : "bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20"}`}>
                            <span className={`text-[0.55rem] font-black uppercase ${isPast ? "text-white/30" : "text-[var(--color-accent)]"}`}>
                              {new Date(s.date + "T12:00:00").toLocaleDateString("en-US", { month: "short" })}
                            </span>
                            <span className={`text-lg font-black leading-none ${isPast ? "text-white/40" : "text-white"}`}>
                              {new Date(s.date + "T12:00:00").getDate()}
                            </span>
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center">
                            <span className="text-white/20 text-[0.6rem] font-bold">TBD</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-[0.8rem] font-bold truncate ${isPast ? "text-white/50" : "text-white"}`}>{s.venue}</p>
                          <p className="text-[0.65rem] text-white/30">{s.city}, {s.state}{s.time ? ` · ${s.time}` : ""}</p>
                        </div>
                        {s.isSoldOut && <span className="text-[0.45rem] font-bold uppercase tracking-widest text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">Sold Out</span>}
                      </button>
                    );
                  })}
                  {filtered.length === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-white/20 text-sm">No shows for this filter.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
