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

export default function ItineraryC() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pt-[72px]">
      <div className="site-container max-w-5xl py-16">
        <h2 className="text-3xl font-black uppercase italic tracking-tight mb-12 text-center" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          Day-by-Day <span className="accent-gradient-text">Itinerary</span>
        </h2>

        {/* Grid layout — alternating large/small cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ITINERARY.map((day, i) => {
            // First and last are full-width, islands are tall, sea days are standard
            const isWide = i === 0 || i === 6;
            const isTall = day.type === "island";

            return (
              <div key={day.day}
                className={`relative bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-[var(--color-accent)]/30 transition-all group ${
                  isWide ? "md:col-span-3" : isTall ? "md:row-span-2" : ""
                }`}
              >
                {/* Accent left border */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  day.type === "island" ? "bg-gradient-to-b from-cyan-500 to-emerald-500" :
                  day.type === "sea" ? "bg-gradient-to-b from-[var(--color-accent)] to-blue-500" :
                  "bg-gradient-to-b from-amber-500 to-orange-500"
                }`} />

                <div className={`p-6 ${isWide ? "flex items-center gap-6" : ""}`}>
                  <div className={`flex items-center gap-3 ${isWide ? "" : "mb-3"}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                      day.type === "island" ? "bg-cyan-500/10 border border-cyan-500/20" :
                      day.type === "sea" ? "bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20" :
                      "bg-amber-500/10 border border-amber-500/20"
                    }`}>
                      {day.icon}
                    </div>
                    <div>
                      <span className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-[var(--color-accent)]">Day {day.day}</span>
                      <h3 className="text-lg font-bold text-white leading-tight">{day.port}</h3>
                    </div>
                  </div>

                  <div className={isWide ? "flex-1" : ""}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[0.45rem] font-bold uppercase tracking-widest ${
                        day.type === "island" ? "bg-cyan-500/10 text-cyan-400" : day.type === "sea" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"
                      }`}>{day.label}</span>
                      {day.type === "sea" && <span className="text-[0.45rem] text-white/15 font-bold uppercase tracking-widest">🎵 Live Music</span>}
                    </div>
                    <p className="text-[0.8rem] text-white/35 leading-relaxed">{day.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Summary Row */}
        <div className="flex justify-center gap-8 mt-10 pt-8 border-t border-white/5">
          {[
            { n: "7", label: "Nights", icon: "🌙" },
            { n: "3", label: "Islands", icon: "🏝️" },
            { n: "6", label: "Shows", icon: "🎸" },
            { n: "2", label: "Sea Days", icon: "🌊" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="text-lg">{s.icon}</span>
              <div>
                <p className="text-xl font-black text-white leading-none">{s.n}</p>
                <p className="text-[0.5rem] font-bold uppercase tracking-[0.2em] text-white/20">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-amber-500 text-black text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
        Itinerary C — Bento Grid
      </div>
    </div>
  );
}
