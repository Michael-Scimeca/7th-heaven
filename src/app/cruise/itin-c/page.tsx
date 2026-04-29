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

const cardGrad: Record<string, string> = {
  island: "from-cyan-900/60 via-emerald-900/30 to-[#0a0a14]",
  sea:    "from-violet-900/60 via-blue-900/30 to-[#0a0a14]",
  depart: "from-amber-900/60 via-orange-900/30 to-[#0a0a14]",
};
const glow: Record<string, string> = {
  island: "shadow-cyan-500/20",
  sea:    "shadow-purple-500/20",
  depart: "shadow-amber-500/20",
};
const border: Record<string, string> = {
  island: "border-cyan-500/20 hover:border-cyan-500/50",
  sea:    "border-purple-500/20 hover:border-purple-500/50",
  depart: "border-amber-500/20 hover:border-amber-500/50",
};
const accentText: Record<string, string> = {
  island: "text-cyan-400",
  sea:    "text-purple-400",
  depart: "text-amber-400",
};

export default function ItineraryC() {
  return (
    <div className="min-h-screen bg-[#050508] pt-[72px]">
      {/* Ocean wave header */}
      <div className="relative overflow-hidden py-20 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/10 via-blue-900/5 to-cyan-900/10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        <p className="text-[0.6rem] font-black uppercase tracking-[0.35em] text-cyan-400 mb-4">7 Nights · Caribbean Adventure</p>
        <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-black italic uppercase leading-none text-white" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-[var(--color-accent)] to-blue-400">Voyage</span>
        </h1>
        {/* Route string */}
        <div className="flex items-center justify-center gap-1.5 mt-6 flex-wrap px-4">
          {ITINERARY.map((d, i) => (
            <span key={d.day} className="flex items-center gap-1.5">
              <span className={`text-[0.55rem] font-bold ${accentText[d.type]}`}>{d.port.split(",")[0]}</span>
              {i < ITINERARY.length - 1 && <span className="text-white/15 text-[0.55rem]">→</span>}
            </span>
          ))}
        </div>
      </div>

      {/* 7-column grid on desktop, 2-col on tablet, 1 on mobile */}
      <div className="site-container max-w-7xl py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
          {ITINERARY.map(day => (
            <div key={day.day} className={`relative rounded-2xl border bg-gradient-to-b ${cardGrad[day.type]} ${border[day.type]} shadow-xl ${glow[day.type]} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col overflow-hidden group`}>
              {/* Top accent bar */}
              <div className={`h-[3px] ${
                day.type === "island" ? "bg-gradient-to-r from-cyan-500 to-emerald-400" :
                day.type === "sea"    ? "bg-gradient-to-r from-[var(--color-accent)] to-blue-400" :
                                        "bg-gradient-to-r from-amber-500 to-orange-400"
              }`} />

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[0.45rem] font-black uppercase tracking-[0.25em] ${accentText[day.type]}`}>Day {day.day}</span>
                  <span className="text-2xl group-hover:scale-110 transition-transform">{day.icon}</span>
                </div>

                <div className="flex-1">
                  <h2 className="text-base font-black text-white leading-tight mb-1">{day.port}</h2>
                  <span className={`text-[0.45rem] font-bold uppercase tracking-widest ${accentText[day.type]} opacity-70`}>{day.label}</span>
                  <p className="text-white/30 text-[0.65rem] leading-relaxed mt-3">{day.desc}</p>
                </div>

                {/* Bottom day counter */}
                <div className={`mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-1`}>
                  {ITINERARY.map(d => (
                    <div key={d.day} className={`flex-1 h-0.5 rounded-full ${d.day <= day.day ? (
                      day.type === "island" ? "bg-cyan-400" :
                      day.type === "sea" ? "bg-purple-400" : "bg-amber-400"
                    ) : "bg-white/10"}`} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
        Layout C — 7-Column Grid
      </div>
    </div>
  );
}
