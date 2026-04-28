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

/* Layout G — Map Route Style (visual journey path) */
export default function ItineraryG() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pt-[72px]">
      <div className="site-container max-w-5xl py-16">
        <h2 className="text-3xl font-black uppercase italic tracking-tight mb-12 text-center" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          Day-by-Day <span className="accent-gradient-text">Itinerary</span>
        </h2>

        {/* Horizontal route path */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-8 left-[40px] right-[40px] h-0.5 bg-gradient-to-r from-amber-500 via-[var(--color-accent)] to-amber-500" />

          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {ITIN.map(day => (
              <div key={day.day} className="flex flex-col items-center text-center group">
                {/* Pin */}
                <div className="w-16 h-16 rounded-full bg-[#0d0d14] border-2 border-[var(--color-accent)]/30 flex items-center justify-center text-2xl relative z-10 group-hover:border-[var(--color-accent)] group-hover:shadow-[0_0_20px_rgba(133,29,239,0.3)] transition-all">
                  {day.icon}
                </div>
                {/* Info */}
                <div className="mt-4 px-1">
                  <span className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-[var(--color-accent)]">Day {day.day}</span>
                  <h3 className="text-sm font-bold text-white mt-0.5 leading-tight">{day.port}</h3>
                  <span className="text-[0.45rem] font-bold uppercase tracking-widest text-white/15 block mt-1">{day.label}</span>
                  <p className="text-[0.65rem] text-white/25 leading-relaxed mt-2 hidden md:block">{day.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-rose-500 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">Layout G — Route Path</div>
    </div>
  );
}
