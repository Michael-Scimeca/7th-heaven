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

const bg: Record<string, string> = {
  island: "from-cyan-900/40 via-emerald-900/20 to-transparent",
  sea:    "from-purple-900/40 via-blue-900/20 to-transparent",
  depart: "from-amber-900/40 via-orange-900/20 to-transparent",
};
const accent: Record<string, string> = {
  island: "text-cyan-400",
  sea:    "text-[var(--color-accent)]",
  depart: "text-amber-400",
};
const pill: Record<string, string> = {
  island: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  sea:    "bg-purple-500/10 text-purple-400 border-purple-500/20",
  depart: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};
const bar: Record<string, string> = {
  island: "from-cyan-500 to-emerald-400",
  sea:    "from-[var(--color-accent)] to-blue-500",
  depart: "from-amber-500 to-orange-400",
};

export default function ItineraryA() {
  return (
    <div className="min-h-screen bg-[#050508] pt-[72px]">
      {/* Hero */}
      <div className="relative py-16 text-center border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-accent)]/5 to-transparent pointer-events-none" />
        <p className="text-[0.65rem] font-black uppercase tracking-[0.35em] text-[var(--color-accent)] mb-3">7 Nights · Caribbean</p>
        <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black italic uppercase tracking-tight text-white leading-none" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          Your Cruise <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-cyan-400">Itinerary</span>
        </h1>
        <p className="text-white/35 text-sm mt-4 max-w-md mx-auto">Miami → Cozumel → Grand Cayman → Roatán → Miami</p>
      </div>

      {/* Full-bleed day rows */}
      <div>
        {ITINERARY.map((day, i) => (
          <div key={day.day} className={`relative overflow-hidden border-b border-white/[0.04] bg-gradient-to-r ${bg[day.type]}`}>
            <div className="site-container max-w-5xl py-10 flex items-center gap-8">
              {/* Giant day number */}
              <div className={`shrink-0 text-[5rem] font-black leading-none tabular-nums ${accent[day.type]} opacity-[0.15] select-none`} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                {String(day.day).padStart(2, "0")}
              </div>
              {/* Icon circle */}
              <div className={`shrink-0 w-14 h-14 rounded-full border bg-gradient-to-br flex items-center justify-center text-2xl shadow-lg ${
                day.type === "island" ? "border-cyan-500/30 shadow-cyan-500/10" :
                day.type === "sea"    ? "border-purple-500/30 shadow-purple-500/10" :
                                        "border-amber-500/30 shadow-amber-500/10"
              }`}>
                {day.icon}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className={`text-[0.5rem] font-black uppercase tracking-[0.25em] ${accent[day.type]}`}>Day {day.day}</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[0.5rem] font-bold uppercase tracking-widest border ${pill[day.type]}`}>{day.label}</span>
                </div>
                <h2 className="text-xl font-black text-white mb-2">{day.port}</h2>
                <p className="text-white/40 text-sm leading-relaxed max-w-xl">{day.desc}</p>
              </div>
              {/* Right number */}
              <div className={`hidden lg:block shrink-0 text-[0.5rem] font-black uppercase tracking-[0.2em] ${accent[day.type]} opacity-60`}>{i + 1} / {ITINERARY.length}</div>
            </div>
            {/* Bottom accent line */}
            <div className={`absolute bottom-0 left-0 h-[1px] w-[30%] bg-gradient-to-r ${bar[day.type]}`} />
          </div>
        ))}
      </div>

      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
        Layout A — Full-Width Rows
      </div>
    </div>
  );
}
