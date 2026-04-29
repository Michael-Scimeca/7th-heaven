"use client";

const ITINERARY = [
  { day: 1, port: "Miami, FL", label: "Embarkation", icon: "🚢", desc: "Board the ship and join the Sail-Away Party with 7th Heaven on the pool deck.", type: "depart" },
  { day: 2, port: "At Sea", label: "Sea Day", icon: "🌊", desc: "Acoustic set by the pool. Meet & Greet. Full electric show in the main theater.", type: "sea" },
  { day: 3, port: "Cozumel, Mexico", label: "Port Day", icon: "🏝️", desc: "Explore Mayan ruins, snorkel crystal reefs, or chill on the beach.", type: "island" },
  { day: 4, port: "Grand Cayman", label: "Port Day", icon: "🐢", desc: "Stingray City, Seven Mile Beach. Sunset deck session with the band.", type: "island" },
  { day: 5, port: "Roatán, Honduras", label: "Port Day", icon: "🤿", desc: "World-class diving and zip-lining through the jungle canopy.", type: "island" },
  { day: 6, port: "At Sea", label: "Sea Day", icon: "🎸", desc: "Grand Finale — full 2-hour concert, fan-request setlist, after-party.", type: "sea" },
  { day: 7, port: "Miami, FL", label: "Disembarkation", icon: "⚓", desc: "Farewell breakfast and group photo before heading home.", type: "depart" },
];

const leftColor: Record<string, string> = {
  island: "bg-gradient-to-b from-cyan-500 to-emerald-400",
  sea:    "bg-gradient-to-b from-[var(--color-accent)] to-blue-500",
  depart: "bg-gradient-to-b from-amber-500 to-orange-400",
};
const numColor: Record<string, string> = {
  island: "text-cyan-400",
  sea:    "text-purple-400",
  depart: "text-amber-400",
};
const tagStyle: Record<string, string> = {
  island: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  sea:    "bg-purple-500/10 text-purple-300 border-purple-500/20",
  depart: "bg-amber-500/10 text-amber-300 border-amber-500/20",
};

export default function ItineraryD() {
  return (
    <div className="min-h-screen bg-[#060610] pt-[72px]">
      <div className="site-container max-w-4xl py-16">

        {/* Split header */}
        <div className="flex items-end justify-between mb-14 pb-6 border-b border-white/[0.06]">
          <div>
            <span className="text-[0.55rem] font-black uppercase tracking-[0.3em] text-[var(--color-accent)] block mb-2">Caribbean · 7 Nights</span>
            <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-black uppercase text-white leading-none" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Cruise<br /><span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-cyan-400">Schedule</span>
            </h1>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-white/20 text-[0.6rem] font-bold uppercase tracking-widest">Departs</p>
            <p className="text-white font-black text-lg">Miami, FL</p>
            <p className="text-white/30 text-[0.6rem] mt-0.5">Returns same port</p>
          </div>
        </div>

        {/* Magazine-style alternating layout */}
        <div className="space-y-px">
          {ITINERARY.map((day, i) => (
            <div key={day.day} className={`relative flex ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"} group`}>
              {/* Color side bar */}
              <div className={`shrink-0 w-1.5 ${leftColor[day.type]} opacity-60 group-hover:opacity-100 transition-opacity`} />

              {/* Main content */}
              <div className="flex-1 flex items-center gap-6 bg-white/[0.015] group-hover:bg-white/[0.03] border-y border-white/[0.03] group-hover:border-white/[0.07] transition-all px-8 py-6">
                {/* Day # — big */}
                <div className={`shrink-0 text-[3.5rem] font-black leading-none tabular-nums ${numColor[day.type]} opacity-25 select-none`} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  {String(day.day).padStart(2, "0")}
                </div>

                {/* Divider */}
                <div className="shrink-0 w-px h-16 bg-white/[0.06]" />

                {/* Icon + label */}
                <div className="shrink-0 text-center">
                  <span className="text-3xl block mb-1">{day.icon}</span>
                  <span className={`text-[0.45rem] font-black uppercase tracking-[0.2em] ${numColor[day.type]}`}>{day.label}</span>
                </div>

                {/* Port & desc */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-black text-white mb-2">{day.port}</h2>
                  <p className="text-white/35 text-sm leading-relaxed">{day.desc}</p>
                </div>

                {/* Tag */}
                <div className="hidden md:block shrink-0">
                  <span className={`text-[0.45rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${tagStyle[day.type]}`}>
                    {day.type === "island" ? "🏖 Port" : day.type === "sea" ? "🎵 Sea Day" : "🚢 Miami"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer legend */}
        <div className="flex gap-6 mt-10 pt-6 border-t border-white/[0.06]">
          {[
            { color: "bg-gradient-to-r from-amber-500 to-orange-400", label: "Miami" },
            { color: "bg-gradient-to-r from-[var(--color-accent)] to-blue-500", label: "Sea Day" },
            { color: "bg-gradient-to-r from-cyan-500 to-emerald-400", label: "Island Port" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2">
              <span className={`w-6 h-1 rounded-full ${l.color}`} />
              <span className="text-[0.55rem] font-bold uppercase tracking-widest text-white/25">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
        Layout D — Magazine Alternating
      </div>
    </div>
  );
}
