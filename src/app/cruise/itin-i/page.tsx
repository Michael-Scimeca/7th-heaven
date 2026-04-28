"use client";

const ITIN = [
  { day: 1, port: "Miami, FL", label: "Embarkation", icon: "🚢", desc: "Board the ship. Sail-Away Party on the pool deck." },
  { day: 2, port: "At Sea", label: "Sea Day", icon: "🌊", desc: "Acoustic pool set. Meet & Greet. Theater concert." },
  { day: 3, port: "Cozumel", label: "Port Day", icon: "🏝️", desc: "Mayan ruins, crystal reefs, beach day." },
  { day: 4, port: "Grand Cayman", label: "Port Day", icon: "🐢", desc: "Stingray City, Seven Mile Beach, sunset jam." },
  { day: 5, port: "Roatán", label: "Port Day", icon: "🤿", desc: "World-class diving, jungle zip-lines." },
  { day: 6, port: "At Sea", label: "Sea Day", icon: "🎸", desc: "Grand Finale — 2-hour concert, after-party." },
  { day: 7, port: "Miami, FL", label: "Disembark", icon: "⚓", desc: "Farewell breakfast and group photo." },
];

export default function ItineraryI() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pt-[72px]">
      <div className="site-container max-w-5xl py-16">
        <h2 className="text-3xl font-black uppercase italic tracking-tight mb-12 text-center" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          Day-by-Day <span className="accent-gradient-text">Itinerary</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ITIN.map((day, i) => (
            <div key={day.day} className={`relative p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[var(--color-accent)]/30 transition-all group ${i === 5 ? "md:col-span-2 bg-gradient-to-br from-[var(--color-accent)]/5 to-transparent border-[var(--color-accent)]/15" : ""}`}>
              <span className="absolute top-3 right-3 text-3xl opacity-20 group-hover:opacity-40 transition-opacity">{day.icon}</span>
              <span className="text-[0.5rem] font-black uppercase tracking-[0.25em] text-[var(--color-accent)]">Day {day.day}</span>
              <h3 className="text-lg font-bold text-white mt-1">{day.port}</h3>
              <span className="text-[0.45rem] font-bold uppercase tracking-widest text-white/15">{day.label}</span>
              <p className="text-[0.7rem] text-white/30 leading-relaxed mt-2">{day.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-orange-500 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">Layout I — Tile Grid</div>
    </div>
  );
}
