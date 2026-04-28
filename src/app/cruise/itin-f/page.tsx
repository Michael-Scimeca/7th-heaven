"use client";

const ITIN = [
  { day: 1, port: "Miami, FL", label: "Embarkation", icon: "🚢", desc: "Board the ship and join the Sail-Away Party with 7th Heaven on the pool deck." },
  { day: 2, port: "At Sea", label: "Sea Day", icon: "🌊", desc: "Acoustic set by the pool. Meet & Greet. Full electric show in the main theater." },
  { day: 3, port: "Cozumel, Mexico", label: "Port Day", icon: "🏝️", desc: "Explore Mayan ruins, snorkel crystal reefs, or chill on the beach." },
  { day: 4, port: "Grand Cayman", label: "Port Day", icon: "🐢", desc: "Stingray City, Seven Mile Beach. Sunset deck session with the band." },
  { day: 5, port: "Roatán, Honduras", label: "Port Day", icon: "🤿", desc: "World-class diving and zip-lining through the jungle canopy." },
  { day: 6, port: "At Sea", label: "Sea Day", icon: "🎸", desc: "Grand Finale — full 2-hour concert, fan-request setlist, after-party." },
  { day: 7, port: "Miami, FL", label: "Disembarkation", icon: "⚓", desc: "Farewell breakfast and group photo before heading home." },
];

/* Layout F — Table / Boarding Pass Style */
export default function ItineraryF() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pt-[72px]">
      <div className="site-container max-w-4xl py-16">
        <h2 className="text-3xl font-black uppercase italic tracking-tight mb-12 text-center" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          Day-by-Day <span className="accent-gradient-text">Itinerary</span>
        </h2>

        {/* Table header */}
        <div className="hidden md:grid grid-cols-[60px_1fr_120px_1fr] gap-4 px-6 py-3 text-[0.5rem] font-bold uppercase tracking-[0.2em] text-white/20 border-b border-white/5">
          <span>Day</span><span>Destination</span><span>Type</span><span>Details</span>
        </div>

        {/* Rows */}
        {ITIN.map((day, i) => (
          <div key={day.day} className={`grid grid-cols-1 md:grid-cols-[60px_1fr_120px_1fr] gap-4 px-6 py-5 items-center border-b border-white/5 hover:bg-white/[0.02] transition-colors ${i === 0 || i === 6 ? "bg-amber-500/[0.02]" : ""}`}>
            {/* Day number */}
            <div className="flex items-center gap-2 md:block">
              <span className="text-2xl font-black text-white/10">{String(day.day).padStart(2, "0")}</span>
            </div>
            {/* Destination */}
            <div className="flex items-center gap-3">
              <span className="text-xl">{day.icon}</span>
              <div>
                <h3 className="text-base font-bold text-white">{day.port}</h3>
              </div>
            </div>
            {/* Type badge */}
            <div>
              <span className={`px-3 py-1 rounded-full text-[0.5rem] font-bold uppercase tracking-widest ${
                day.label === "Port Day" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                day.label === "Sea Day" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}>{day.label}</span>
            </div>
            {/* Description */}
            <p className="text-[0.8rem] text-white/35 leading-relaxed">{day.desc}</p>
          </div>
        ))}
      </div>
      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">Layout F — Table</div>
    </div>
  );
}
