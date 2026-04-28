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

export default function ItineraryA() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pt-[72px]">
      <div className="site-container max-w-5xl py-16">
        <h2 className="text-3xl font-black uppercase italic tracking-tight mb-12 text-center" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          Day-by-Day <span className="accent-gradient-text">Itinerary</span>
        </h2>

        {/* Horizontal scrolling cards */}
        <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {ITINERARY.map(day => (
            <div key={day.day} className="snap-center shrink-0 w-[280px] bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-[var(--color-accent)]/30 transition-all group">
              {/* Top color band */}
              <div className={`h-2 ${day.type === "island" ? "bg-gradient-to-r from-cyan-500 to-emerald-500" : day.type === "sea" ? "bg-gradient-to-r from-[var(--color-accent)] to-blue-500" : "bg-gradient-to-r from-amber-500 to-orange-500"}`} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[0.55rem] font-black uppercase tracking-[0.25em] text-[var(--color-accent)]">Day {day.day}</span>
                  <span className="text-2xl">{day.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{day.port}</h3>
                <span className={`inline-block px-2 py-0.5 rounded text-[0.5rem] font-bold uppercase tracking-widest mb-3 ${
                  day.type === "island" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                  day.type === "sea" ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20" :
                  "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}>{day.label}</span>
                <p className="text-[0.8rem] text-white/35 leading-relaxed">{day.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-8">
          {[
            { color: "bg-amber-500", label: "Port" },
            { color: "bg-gradient-to-r from-[var(--color-accent)] to-blue-500", label: "Sea Day" },
            { color: "bg-gradient-to-r from-cyan-500 to-emerald-500", label: "Island" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2">
              <span className={`w-3 h-1.5 rounded-full ${l.color}`} />
              <span className="text-[0.55rem] text-white/30 font-bold uppercase tracking-widest">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
        Itinerary A — Horizontal Cards
      </div>
    </div>
  );
}
