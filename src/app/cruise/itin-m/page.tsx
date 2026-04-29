"use client";

// Layout M — Vertical Timeline with full daily schedule breakdown
const ITINERARY = [
  {
    day: 1, port: "Miami, FL", label: "Embarkation", icon: "🚢", type: "depart",
    photo: "/images/cruise/miami.png",
    schedule: [
      { time: "12:00 PM", event: "Ship boarding begins", category: "ship" },
      { time: "2:00 PM",  event: "Cabins available — drop your bags & explore", category: "explore" },
      { time: "4:00 PM",  event: "🎸 7th Heaven Sail-Away Party — pool deck", category: "band" },
      { time: "5:00 PM",  event: "All aboard / muster drill", category: "ship" },
      { time: "6:00 PM",  event: "Depart Miami — see the skyline fade away", category: "ship" },
      { time: "8:00 PM",  event: "Welcome dinner & first night cocktails", category: "food" },
    ],
  },
  {
    day: 2, port: "At Sea", label: "Sea Day", icon: "🌊", type: "sea",
    photo: "/images/cruise/at-sea.png",
    schedule: [
      { time: "9:00 AM",  event: "Coffee & sunrise on the upper deck", category: "explore" },
      { time: "11:00 AM", event: "🎸 Acoustic set by the pool with 7th Heaven", category: "band" },
      { time: "12:30 PM", event: "Lunch buffet — Caribbean cuisine", category: "food" },
      { time: "2:00 PM",  event: "🎸 Meet & Greet — VIP lounge (ticketed)", category: "band" },
      { time: "4:00 PM",  event: "Free time — spa, casino, sun deck", category: "explore" },
      { time: "8:00 PM",  event: "🎸 Full electric show — main theater", category: "band" },
    ],
  },
  {
    day: 3, port: "Cozumel, Mexico", label: "Port Day", icon: "🏝️", type: "island",
    photo: "/images/cruise/cozumel.png",
    schedule: [
      { time: "7:00 AM",  event: "Ship docks at Cozumel International Pier", category: "ship" },
      { time: "8:00 AM",  event: "Shore excursions begin — Mayan ruins tour", category: "explore" },
      { time: "9:00 AM",  event: "Snorkeling at Palancar Reef", category: "explore" },
      { time: "12:00 PM", event: "Beach clubs open — El Cid, Playa Mia", category: "explore" },
      { time: "4:00 PM",  event: "All aboard deadline", category: "ship" },
      { time: "9:00 PM",  event: "🎸 Deck party — 7th Heaven plays the classics", category: "band" },
    ],
  },
  {
    day: 4, port: "Grand Cayman", label: "Port Day", icon: "🐢", type: "island",
    photo: "/images/cruise/grand-cayman.png",
    schedule: [
      { time: "8:00 AM",  event: "Tender boats to George Town (no pier)", category: "ship" },
      { time: "9:00 AM",  event: "Stingray City sandbar excursion", category: "explore" },
      { time: "10:30 AM", event: "Seven Mile Beach — free swim & sunbathing", category: "explore" },
      { time: "12:00 PM", event: "Rum Point beach bar lunch", category: "food" },
      { time: "3:30 PM",  event: "Return tender to ship", category: "ship" },
      { time: "7:30 PM",  event: "🎸 Sunset deck session with the band", category: "band" },
    ],
  },
  {
    day: 5, port: "Roatán, Honduras", label: "Port Day", icon: "🤿", type: "island",
    photo: "/images/cruise/roatan.png",
    schedule: [
      { time: "7:00 AM",  event: "Dock at Mahogany Bay Pier", category: "ship" },
      { time: "8:00 AM",  event: "Zip-lining through the jungle canopy", category: "explore" },
      { time: "9:30 AM",  event: "World-class scuba & snorkeling — Mesoamerican Reef", category: "explore" },
      { time: "12:30 PM", event: "Beachside lunch at Tabyana Beach", category: "food" },
      { time: "4:00 PM",  event: "All aboard deadline", category: "ship" },
      { time: "8:30 PM",  event: "🎸 Late-night jam session — Lido deck", category: "band" },
    ],
  },
  {
    day: 6, port: "At Sea", label: "Grand Finale", icon: "🎸", type: "sea",
    photo: "/images/cruise/concert.png",
    schedule: [
      { time: "10:00 AM", event: "Farewell brunch — main dining room", category: "food" },
      { time: "12:00 PM", event: "Fan Q&A with 7th Heaven — Sky Lounge", category: "band" },
      { time: "2:00 PM",  event: "Free afternoon — spa, shopping, pool", category: "explore" },
      { time: "5:00 PM",  event: "🎸 Pre-show sound check — fans welcome", category: "band" },
      { time: "8:00 PM",  event: "🎸 Grand Finale — 2-hour full concert, fan-request setlist", category: "band" },
      { time: "10:30 PM", event: "🎸 After-party — pool deck (no curfew)", category: "band" },
    ],
  },
  {
    day: 7, port: "Miami, FL", label: "Disembarkation", icon: "⚓", type: "depart",
    photo: "/images/cruise/miami.png",
    schedule: [
      { time: "7:00 AM",  event: "Arrive back in Miami — sunrise views", category: "ship" },
      { time: "7:30 AM",  event: "Farewell breakfast buffet", category: "food" },
      { time: "9:00 AM",  event: "Group photo with the band — pool deck", category: "band" },
      { time: "10:00 AM", event: "Disembarkation begins by group", category: "ship" },
      { time: "12:00 PM", event: "Ship clear — see you next cruise! 🤘", category: "ship" },
    ],
  },
];

const CAT_STYLE: Record<string, string> = {
  band:    "bg-[var(--color-accent)]/20 text-[var(--color-accent)] border-[var(--color-accent)]/30",
  explore: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  food:    "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  ship:    "bg-white/5 text-white/40 border-white/10",
};
const CAT_DOT: Record<string, string> = {
  band:    "bg-[var(--color-accent)]",
  explore: "bg-cyan-400",
  food:    "bg-emerald-400",
  ship:    "bg-white/30",
};
const TYPE_COLOR: Record<string, string> = {
  island: "text-cyan-400",
  sea:    "text-purple-400",
  depart: "text-amber-400",
};

export default function ItineraryM() {
  return (
    <div className="bg-[#050508] min-h-screen pt-[72px]">
      {/* Hero */}
      <div className="relative overflow-hidden py-16 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(133,29,239,0.08),transparent_70%)]" />
        <p className="relative text-[0.55rem] font-black uppercase tracking-[0.4em] text-[var(--color-accent)] mb-2">7 Nights · Caribbean</p>
        <h1 className="relative text-[clamp(2.5rem,6vw,5rem)] font-black italic uppercase text-white leading-none" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          Full <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-cyan-400">Schedule</span>
        </h1>
        {/* Legend */}
        <div className="relative flex items-center justify-center gap-5 mt-6 flex-wrap">
          {[
            { dot: "bg-[var(--color-accent)]", label: "Band Event" },
            { dot: "bg-cyan-400", label: "Excursion" },
            { dot: "bg-emerald-400", label: "Food & Drink" },
            { dot: "bg-white/30", label: "Ship / Logistics" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${l.dot}`} />
              <span className="text-[0.5rem] font-bold uppercase tracking-widest text-white/30">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="site-container max-w-4xl pb-20">
        <div className="space-y-0">
          {ITINERARY.map((day, di) => (
            <div key={day.day} className="relative">
              {/* Day header card with photo */}
              <div className="relative overflow-hidden rounded-2xl mb-0 mt-8 first:mt-0">
                <img src={day.photo} alt={day.port} className="absolute inset-0 w-full h-full object-cover opacity-25" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050508] via-[#050508]/80 to-transparent" />
                <div className="relative z-10 flex items-center gap-6 px-8 py-6">
                  <div className="shrink-0 text-center">
                    <span className="text-[0.45rem] font-black uppercase tracking-[0.3em] text-white/30 block">Day</span>
                    <span className={`text-[3rem] font-black leading-none ${TYPE_COLOR[day.type]}`} style={{ fontFamily: "var(--font-barlow-condensed)" }}>{day.day}</span>
                  </div>
                  <div className="w-px h-14 bg-white/10 shrink-0" />
                  <div>
                    <span className={`text-[0.45rem] font-black uppercase tracking-[0.25em] ${TYPE_COLOR[day.type]}`}>{day.label}</span>
                    <h2 className="text-2xl font-black text-white leading-tight">{day.icon} {day.port}</h2>
                  </div>
                </div>
              </div>

              {/* Schedule list */}
              <div className="ml-8 pl-6 border-l border-white/[0.06] py-4 space-y-3">
                {day.schedule.map((item, si) => (
                  <div key={si} className="relative flex items-start gap-4 group">
                    {/* Timeline dot */}
                    <div className="shrink-0 relative">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1 ${CAT_DOT[item.category]} shadow-sm`} />
                      <div className="absolute -left-[26px] top-0 w-px h-full bg-white/[0.04]" />
                    </div>
                    {/* Time */}
                    <span className="shrink-0 text-[0.55rem] font-black text-white/25 w-16 pt-0.5 tabular-nums">{item.time}</span>
                    {/* Event */}
                    <span className={`text-sm font-medium leading-snug px-3 py-1.5 rounded-lg border ${CAT_STYLE[item.category]}`}>
                      {item.event}
                    </span>
                  </div>
                ))}
              </div>

              {/* Connector to next day */}
              {di < ITINERARY.length - 1 && (
                <div className="flex items-center gap-3 ml-8 pl-6 py-3 opacity-30">
                  <div className="w-1 h-1 rounded-full bg-white/30" />
                  <div className="h-px flex-1 bg-white/10 border-dashed" style={{ backgroundImage: "repeating-linear-gradient(to right, rgba(255,255,255,0.15) 0, rgba(255,255,255,0.15) 4px, transparent 4px, transparent 10px)" }} />
                  <span className="text-[0.4rem] font-bold uppercase tracking-widest text-white/30 whitespace-nowrap">overnight at sea</span>
                  <div className="h-px flex-1" style={{ backgroundImage: "repeating-linear-gradient(to right, rgba(255,255,255,0.15) 0, rgba(255,255,255,0.15) 4px, transparent 4px, transparent 10px)" }} />
                  <div className="w-1 h-1 rounded-full bg-white/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">Layout M — Full Schedule Timeline</div>
    </div>
  );
}
