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

const gradients: Record<string, { card: string; glow: string; text: string; tag: string }> = {
  island: { card: "border-cyan-500/15 bg-gradient-to-br from-cyan-950/80 to-[#07101a]", glow: "shadow-cyan-500/15", text: "text-cyan-400", tag: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300" },
  sea:    { card: "border-purple-500/15 bg-gradient-to-br from-purple-950/80 to-[#09060f]", glow: "shadow-purple-500/15", text: "text-purple-400", tag: "bg-purple-500/10 border-purple-500/20 text-purple-300" },
  depart: { card: "border-amber-500/15 bg-gradient-to-br from-amber-950/80 to-[#0f0900]", glow: "shadow-amber-500/15", text: "text-amber-400", tag: "bg-amber-500/10 border-amber-500/20 text-amber-300" },
};

export default function ItineraryF() {
  return (
    <div className="min-h-screen bg-[#050508] pt-[72px]">
      {/* Full-bleed hero */}
      <div className="relative overflow-hidden text-center py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,_rgba(133,29,239,0.12),_transparent_60%)]" />
        {/* Decorative route rope */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <p className="relative text-[0.55rem] font-black uppercase tracking-[0.4em] text-[var(--color-accent)] mb-3">Caribbean · 7 Nights</p>
        <h1 className="relative text-[clamp(3rem,8vw,6rem)] font-black italic uppercase text-white leading-none" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          7th Heaven<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] via-cyan-400 to-blue-400">At Sea</span>
        </h1>
        <p className="relative text-white/30 text-sm mt-4">Miami → Cozumel → Grand Cayman → Roatán → Miami</p>
      </div>

      {/* Masonry-style bento grid */}
      <div className="site-container max-w-6xl pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
          {ITINERARY.map((day, i) => {
            const g = gradients[day.type];
            // Make some cards taller for bento feel
            const isTall = i === 1 || i === 5; // sea days get tall treatment
            const isWide = i === 3; // grand cayman spans 2 cols on lg

            return (
              <div
                key={day.day}
                className={`relative rounded-3xl border shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden ${g.card} ${g.glow} ${isWide ? "lg:col-span-2" : ""} ${isTall ? "row-span-1" : ""}`}
              >
                {/* Background giant emoji */}
                <div className="absolute bottom-4 right-4 text-[5rem] opacity-[0.06] pointer-events-none select-none">{day.icon}</div>

                <div className="relative z-10 p-7 flex flex-col h-full min-h-[180px]">
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-auto">
                    <div>
                      <span className={`text-[0.45rem] font-black uppercase tracking-[0.3em] ${g.text} block mb-2`}>Day {day.day}</span>
                      <h2 className={`font-black text-white leading-tight ${isWide ? "text-2xl" : "text-xl"}`}>{day.port}</h2>
                    </div>
                    <div className="text-3xl">{day.icon}</div>
                  </div>

                  {/* Tag */}
                  <span className={`inline-block self-start mt-4 px-2.5 py-1 rounded-full text-[0.45rem] font-bold uppercase tracking-widest border ${g.tag}`}>
                    {day.label}
                  </span>

                  {/* Desc */}
                  <p className="text-white/35 text-sm leading-relaxed mt-3">{day.desc}</p>

                  {/* Bottom accent line */}
                  <div className={`mt-5 h-px w-full ${
                    day.type === "island" ? "bg-gradient-to-r from-cyan-500/50 to-transparent" :
                    day.type === "sea"    ? "bg-gradient-to-r from-purple-500/50 to-transparent" :
                                            "bg-gradient-to-r from-amber-500/50 to-transparent"
                  }`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
        Layout F — Bento Grid
      </div>
    </div>
  );
}
