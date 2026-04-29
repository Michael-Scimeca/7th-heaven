"use client";

// Layout N — Layout G aesthetic (alternating photo rows) + full daily schedule timeline
const ITINERARY = [
  {
    day: 1, port: "Miami, FL", label: "Embarkation", icon: "🚢", type: "depart",
    photo: "/images/cruise/miami.png",
    schedule: [
      { time: "12:00 PM", event: "Boarding begins at PortMiami", cat: "ship" },
      { time: "2:00 PM",  event: "Cabins open — drop your bags & explore", cat: "explore" },
      { time: "4:00 PM",  event: "🎸 Sail-Away Party — pool deck", cat: "band" },
      { time: "6:00 PM",  event: "Depart Miami — skyline views from deck", cat: "ship" },
      { time: "8:00 PM",  event: "Welcome dinner & cocktails", cat: "food" },
    ],
  },
  {
    day: 2, port: "At Sea", label: "Sea Day", icon: "🌊", type: "sea",
    photo: "/images/cruise/at-sea.png",
    schedule: [
      { time: "9:00 AM",  event: "Sunrise coffee on the upper deck", cat: "explore" },
      { time: "11:00 AM", event: "🎸 Acoustic set by the pool", cat: "band" },
      { time: "2:00 PM",  event: "🎸 VIP Meet & Greet — Sky Lounge", cat: "band" },
      { time: "4:00 PM",  event: "Free time — spa, casino, sun deck", cat: "explore" },
      { time: "8:00 PM",  event: "🎸 Full electric show — main theater", cat: "band" },
    ],
  },
  {
    day: 3, port: "Cozumel, Mexico", label: "Port Day", icon: "🏝️", type: "island",
    photo: "/images/cruise/cozumel.png",
    schedule: [
      { time: "7:00 AM",  event: "Dock at Cozumel International Pier", cat: "ship" },
      { time: "8:00 AM",  event: "Mayan ruins tour — Tulum excursion", cat: "explore" },
      { time: "10:00 AM", event: "Snorkeling at Palancar Reef", cat: "explore" },
      { time: "12:00 PM", event: "Beach clubs & lunch on the water", cat: "food" },
      { time: "4:00 PM",  event: "All aboard deadline", cat: "ship" },
      { time: "9:00 PM",  event: "🎸 Deck party — 7th Heaven classics", cat: "band" },
    ],
  },
  {
    day: 4, port: "Grand Cayman", label: "Port Day", icon: "🐢", type: "island",
    photo: "/images/cruise/grand-cayman.png",
    schedule: [
      { time: "8:00 AM",  event: "Tender boats to George Town", cat: "ship" },
      { time: "9:00 AM",  event: "Stingray City sandbar excursion", cat: "explore" },
      { time: "11:00 AM", event: "Seven Mile Beach — free swim & sun", cat: "explore" },
      { time: "12:30 PM", event: "Rum Point beach bar lunch", cat: "food" },
      { time: "3:30 PM",  event: "Return tender to ship", cat: "ship" },
      { time: "7:30 PM",  event: "🎸 Sunset deck session with the band", cat: "band" },
    ],
  },
  {
    day: 5, port: "Roatán, Honduras", label: "Port Day", icon: "🤿", type: "island",
    photo: "/images/cruise/roatan.png",
    schedule: [
      { time: "7:00 AM",  event: "Dock at Mahogany Bay Pier", cat: "ship" },
      { time: "8:00 AM",  event: "Zip-lining through the jungle canopy", cat: "explore" },
      { time: "9:30 AM",  event: "Scuba & snorkeling — Mesoamerican Reef", cat: "explore" },
      { time: "12:30 PM", event: "Beachside lunch at Tabyana Beach", cat: "food" },
      { time: "4:00 PM",  event: "All aboard deadline", cat: "ship" },
      { time: "8:30 PM",  event: "🎸 Late-night jam — Lido deck", cat: "band" },
    ],
  },
  {
    day: 6, port: "At Sea", label: "Grand Finale", icon: "🎸", type: "sea",
    photo: "/images/cruise/concert.png",
    schedule: [
      { time: "10:00 AM", event: "Farewell brunch — main dining room", cat: "food" },
      { time: "12:00 PM", event: "🎸 Fan Q&A with 7th Heaven — Sky Lounge", cat: "band" },
      { time: "5:00 PM",  event: "🎸 Sound check — fans welcome", cat: "band" },
      { time: "8:00 PM",  event: "🎸 Grand Finale — 2-hr fan-request concert", cat: "band" },
      { time: "10:30 PM", event: "🎸 After-party — pool deck, no curfew", cat: "band" },
    ],
  },
  {
    day: 7, port: "Miami, FL", label: "Disembarkation", icon: "⚓", type: "depart",
    photo: "/images/cruise/miami.png",
    schedule: [
      { time: "7:00 AM",  event: "Arrive back in Miami — sunrise views", cat: "ship" },
      { time: "7:30 AM",  event: "Farewell breakfast buffet", cat: "food" },
      { time: "9:00 AM",  event: "🎸 Group photo with the band — pool deck", cat: "band" },
      { time: "10:00 AM", event: "Disembarkation begins by group", cat: "ship" },
    ],
  },
];

const TYPE_ACCENT: Record<string, string> = {
  island: "text-cyan-400",
  sea:    "text-purple-400",
  depart: "text-amber-400",
};
const TYPE_BAR: Record<string, string> = {
  island: "from-cyan-500 to-emerald-400",
  sea:    "from-purple-500 to-[var(--color-accent)]",
  depart: "from-amber-500 to-orange-400",
};
const CAT_DOT: Record<string, string> = {
  band:    "bg-[var(--color-accent)] shadow-[0_0_6px_rgba(133,29,239,0.8)]",
  explore: "bg-cyan-400",
  food:    "bg-emerald-400",
  ship:    "bg-white/25",
};
const CAT_TEXT: Record<string, string> = {
  band:    "text-white font-semibold",
  explore: "text-white/70",
  food:    "text-white/60",
  ship:    "text-white/35",
};

export default function ItineraryN() {
  return (
    <div className="bg-[#050508] min-h-screen">
      {/* Sticky nav bar */}
      <div className="sticky top-0 z-40 bg-[#050508]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="site-container max-w-7xl flex items-center justify-between py-3">
          <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white/60">7th Heaven · Caribbean Cruise</h1>
          {/* Day nav dots */}
          <div className="flex items-center gap-1.5">
            {ITINERARY.map(d => (
              <a key={d.day} href={`#day-${d.day}`}
                className={`w-2 h-2 rounded-full transition-all hover:scale-125 ${
                  d.type === "island" ? "bg-cyan-500/40 hover:bg-cyan-400" :
                  d.type === "sea"    ? "bg-purple-500/40 hover:bg-purple-400" :
                                        "bg-amber-500/40 hover:bg-amber-400"
                }`}
                title={`Day ${d.day} — ${d.port}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Day rows */}
      {ITINERARY.map((day, i) => (
        <div
          key={day.day}
          id={`day-${day.day}`}
          className={`flex flex-col ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} min-h-[520px] overflow-hidden scroll-mt-16`}
        >
          {/* ─── Photo half ─── */}
          <div className="relative lg:w-[45%] h-64 lg:h-auto overflow-hidden">
            <img
              src={day.photo}
              alt={day.port}
              className="absolute inset-0 w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-700"
            />
            {/* Dark gradient toward text side */}
            <div className={`absolute inset-0 bg-gradient-to-${i % 2 === 0 ? "r" : "l"} from-transparent via-black/30 to-[#050508]`} />
            {/* Bottom on mobile */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent lg:hidden" />

            {/* Day badge */}
            <div className="absolute top-5 left-5 bg-black/65 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/10">
              <span className={`text-[0.45rem] font-black uppercase tracking-[0.3em] ${TYPE_ACCENT[day.type]} block`}>Day {day.day}</span>
              <span className="text-2xl leading-none">{day.icon}</span>
            </div>
          </div>

          {/* ─── Schedule half ─── */}
          <div className="flex-1 flex items-stretch px-8 lg:px-14 py-10">
            <div className="w-full max-w-xl mx-auto lg:mx-0">

              {/* Port header */}
              <div className="mb-6 pb-5 border-b border-white/[0.06]">
                <span className={`text-[0.45rem] font-black uppercase tracking-[0.3em] ${TYPE_ACCENT[day.type]}`}>{day.label}</span>
                <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black italic uppercase text-white leading-none mt-0.5" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  {day.port}
                </h2>
              </div>

              {/* Schedule timeline */}
              <div className="relative space-y-0">
                {/* Vertical spine */}
                <div className={`absolute left-[7px] top-2 bottom-2 w-[2px] bg-gradient-to-b ${TYPE_BAR[day.type]} opacity-20`} />

                {day.schedule.map((item, si) => (
                  <div key={si} className="relative flex items-start gap-4 pb-4 last:pb-0">
                    {/* Dot on spine */}
                    <div className={`shrink-0 w-4 h-4 rounded-full border-2 border-[#050508] mt-0.5 z-10 ${CAT_DOT[item.cat]}`} />
                    {/* Time */}
                    <span className="shrink-0 text-[0.5rem] font-black text-white/20 w-16 pt-1 tabular-nums">{item.time}</span>
                    {/* Event */}
                    <span className={`text-[0.875rem] leading-snug pt-0.5 ${CAT_TEXT[item.cat]}`}>{item.event}</span>
                  </div>
                ))}
              </div>

              {/* Legend mini */}
              <div className="flex flex-wrap gap-3 mt-7 pt-5 border-t border-white/[0.05]">
                {[
                  { dot: "bg-[var(--color-accent)]", label: "Band" },
                  { dot: "bg-cyan-400", label: "Excursion" },
                  { dot: "bg-emerald-400", label: "Food" },
                  { dot: "bg-white/25", label: "Ship" },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${l.dot}`} />
                    <span className="text-[0.45rem] font-bold uppercase tracking-widest text-white/20">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
        Layout N — Photo Rows + Schedule
      </div>
    </div>
  );
}
