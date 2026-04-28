"use client";

const ITIN = [
  { day: 1, port: "Miami, FL", label: "Embarkation", icon: "🚢", desc: "Board the ship. Sail-Away Party on the pool deck.", featured: false },
  { day: 2, port: "At Sea", label: "Sea Day", icon: "🌊", desc: "Acoustic pool set. Meet & Greet. Theater concert.", featured: false },
  { day: 3, port: "Cozumel", label: "Port Day", icon: "🏝️", desc: "Mayan ruins, crystal reefs, beach bars.", featured: true },
  { day: 4, port: "Grand Cayman", label: "Port Day", icon: "🐢", desc: "Stingray City, Seven Mile Beach, sunset jam.", featured: true },
  { day: 5, port: "Roatán", label: "Port Day", icon: "🤿", desc: "World-class diving, jungle zip-lines.", featured: true },
  { day: 6, port: "At Sea", label: "Sea Day", icon: "🎸", desc: "Grand Finale — 2-hour concert, after-party.", featured: true },
  { day: 7, port: "Miami, FL", label: "Disembark", icon: "⚓", desc: "Farewell breakfast and group photo.", featured: false },
];

export default function ItineraryH() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pt-[72px]">
      <div className="site-container max-w-5xl py-16">
        <h2 className="text-3xl font-black uppercase italic tracking-tight mb-12 text-center" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          Day-by-Day <span className="accent-gradient-text">Itinerary</span>
        </h2>
        <div className="space-y-3">
          {ITIN.map(day => (
            <div key={day.day} className={`rounded-2xl border overflow-hidden transition-all hover:border-[var(--color-accent)]/20 ${day.featured ? "border-white/5" : "border-white/5"}`}>
              <div className={day.featured ? "flex flex-col md:flex-row" : "flex items-center"}>
                {day.featured ? (
                  <div className="md:w-1/3 bg-gradient-to-br from-[var(--color-accent)]/10 to-cyan-500/10 p-8 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-white/5">
                    <span className="text-4xl mb-2">{day.icon}</span>
                    <span className="text-[0.5rem] font-black uppercase tracking-[0.25em] text-[var(--color-accent)]">Day {day.day}</span>
                    <h3 className="text-xl font-black text-white mt-1">{day.port}</h3>
                    <span className="text-[0.45rem] font-bold uppercase tracking-widest text-white/20 mt-1">{day.label}</span>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-xl shrink-0 ml-5">{day.icon}</div>
                )}
                <div className={day.featured ? "flex-1 p-8" : "flex-1 px-5 py-4"}>
                  {!day.featured && (
                    <div className="flex items-center gap-3 mb-0.5">
                      <span className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-[var(--color-accent)]">Day {day.day}</span>
                      <h3 className="text-base font-bold text-white">{day.port}</h3>
                    </div>
                  )}
                  <p className={`text-white/35 leading-relaxed ${day.featured ? "text-sm" : "text-[0.8rem]"}`}>{day.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-fuchsia-500 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">Layout H — Magazine</div>
    </div>
  );
}
