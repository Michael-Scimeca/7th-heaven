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

/* Layout D — Zigzag Alternating */
export default function ItineraryD() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pt-[72px]">
      <div className="site-container max-w-4xl py-16">
        <h2 className="text-3xl font-black uppercase italic tracking-tight mb-14 text-center" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          Day-by-Day <span className="accent-gradient-text">Itinerary</span>
        </h2>

        {/* Center line */}
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-accent)]/40 via-white/10 to-[var(--color-accent)]/40 -translate-x-1/2" />

          {ITIN.map((day, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div key={day.day} className={`relative flex items-center mb-12 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
                {/* Content */}
                <div className={`w-[calc(50%-32px)] ${isLeft ? "text-right pr-8" : "text-left pl-8"}`}>
                  <span className="text-[0.55rem] font-black uppercase tracking-[0.25em] text-[var(--color-accent)]">Day {day.day}</span>
                  <h3 className="text-xl font-bold text-white mt-1">{day.port}</h3>
                  <span className="text-[0.5rem] font-bold uppercase tracking-widest text-white/20">{day.label}</span>
                  <p className="text-[0.8rem] text-white/35 leading-relaxed mt-2">{day.desc}</p>
                </div>

                {/* Center dot */}
                <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#0d0d14] border-2 border-[var(--color-accent)]/30 flex items-center justify-center text-lg z-10">
                  {day.icon}
                </div>

                {/* Spacer */}
                <div className="w-[calc(50%-32px)]" />
              </div>
            );
          })}
        </div>
      </div>
      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">Layout D — Zigzag</div>
    </div>
  );
}
