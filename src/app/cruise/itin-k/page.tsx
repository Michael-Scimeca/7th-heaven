"use client";

const ITINERARY = [
  { day: 1, port: "Miami, FL",        label: "Embarkation",   icon: "🚢", desc: "Board the ship and join the Sail-Away Party with 7th Heaven on the pool deck.", type: "depart", photo: "/images/cruise/miami.png" },
  { day: 2, port: "At Sea",           label: "Sea Day",        icon: "🌊", desc: "Acoustic set by the pool. Meet & Greet. Full electric show in the main theater.", type: "sea",    photo: "/images/cruise/at-sea.png" },
  { day: 3, port: "Cozumel, Mexico",  label: "Port Day",       icon: "🏝️", desc: "Explore Mayan ruins, snorkel crystal reefs, or chill on the beach.", type: "island", photo: "/images/cruise/cozumel.png" },
  { day: 4, port: "Grand Cayman",     label: "Port Day",       icon: "🐢", desc: "Stingray City, Seven Mile Beach. Sunset deck session with the band.", type: "island", photo: "/images/cruise/grand-cayman.png" },
  { day: 5, port: "Roatán, Honduras", label: "Port Day",       icon: "🤿", desc: "World-class diving and zip-lining through the jungle canopy.", type: "island", photo: "/images/cruise/roatan.png" },
  { day: 6, port: "At Sea",           label: "Grand Finale",   icon: "🎸", desc: "Grand Finale — full 2-hour concert, fan-request setlist, after-party.", type: "sea",    photo: "/images/cruise/concert.png" },
  { day: 7, port: "Miami, FL",        label: "Disembarkation", icon: "⚓", desc: "Farewell breakfast and group photo before heading home.", type: "depart", photo: "/images/cruise/miami.png" },
];

export default function ItineraryK() {
  return (
    <div className="bg-[#050508] min-h-screen pt-[72px]">
      {/* Full-bleed stacked sections — each day is full viewport height */}
      {ITINERARY.map((day, i) => (
        <section
          key={day.day}
          className="relative min-h-screen flex items-end overflow-hidden"
          style={{ minHeight: i === 0 ? "100vh" : "85vh" }}
        >
          {/* Full bleed background photo */}
          <img
            src={day.photo}
            alt={day.port}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.55)" }}
          />

          {/* Bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

          {/* Content pinned to bottom */}
          <div className="relative z-10 w-full site-container max-w-5xl pb-16 pt-32">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-[0.5rem] font-black uppercase tracking-[0.3em] ${
                    day.type === "island" ? "text-cyan-400" : day.type === "sea" ? "text-purple-400" : "text-amber-400"
                  }`}>Day {day.day}</span>
                  <span className={`text-[0.45rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                    day.type === "island" ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" :
                    day.type === "sea"    ? "bg-purple-500/20 text-purple-300 border-purple-500/30" :
                                            "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}>{day.label}</span>
                </div>
                <h2 className="text-[clamp(3rem,8vw,7rem)] font-black italic uppercase text-white leading-none" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  {day.port}
                </h2>
              </div>
              <div className="max-w-sm">
                <div className="text-4xl mb-3">{day.icon}</div>
                <p className="text-white/55 leading-relaxed">{day.desc}</p>
              </div>
            </div>

            {/* Day progress dots */}
            <div className="flex items-center gap-2 mt-10">
              {ITINERARY.map((_, j) => (
                <div key={j} className={`rounded-full transition-all ${j === i ? "w-6 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/20"}`} />
              ))}
            </div>
          </div>
        </section>
      ))}

      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">Layout K — Full Screen Scroll</div>
    </div>
  );
}
