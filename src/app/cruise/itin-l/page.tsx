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

export default function ItineraryL() {
  return (
    <div className="bg-[#050508] min-h-screen pt-[72px]">
      {/* Hero with horizontal film strip */}
      <div className="py-14 text-center">
        <p className="text-[0.55rem] font-black uppercase tracking-[0.4em] text-[var(--color-accent)] mb-2">7 Nights · Caribbean</p>
        <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black italic uppercase text-white leading-none" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          Day-by-Day <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-cyan-400">Voyage</span>
        </h1>
      </div>

      {/* Horizontal photo strip — scrollable on mobile */}
      <div className="relative overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
        <div className="flex gap-4 w-max px-6">
          {ITINERARY.map(day => (
            <div key={day.day} className="snap-center shrink-0 w-[280px] group">
              {/* Photo */}
              <div className="relative h-[380px] rounded-2xl overflow-hidden mb-4">
                <img src={day.photo} alt={day.port} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {/* Overlay */}
                <div className="absolute top-4 left-4">
                  <span className={`text-[0.45rem] font-black uppercase tracking-[0.2em] px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm ${
                    day.type === "island" ? "text-cyan-400" : day.type === "sea" ? "text-purple-400" : "text-amber-400"
                  }`}>Day {day.day}</span>
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <h2 className="text-xl font-black text-white leading-tight">{day.port}</h2>
                </div>
              </div>

              {/* Below card info */}
              <div className="px-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{day.icon}</span>
                  <span className={`text-[0.5rem] font-bold uppercase tracking-widest ${
                    day.type === "island" ? "text-cyan-400" : day.type === "sea" ? "text-purple-400" : "text-amber-400"
                  }`}>{day.label}</span>
                </div>
                <p className="text-white/35 text-xs leading-relaxed">{day.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Below strip: compact route list */}
      <div className="site-container max-w-3xl py-12">
        <div className="flex items-center gap-0 overflow-x-auto">
          {ITINERARY.map((day, i) => (
            <div key={day.day} className="flex items-center shrink-0">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full border-2 ${
                  day.type === "island" ? "border-cyan-400 bg-cyan-400/20" :
                  day.type === "sea"    ? "border-purple-400 bg-purple-400/20" :
                                          "border-amber-400 bg-amber-400/20"
                }`} />
                <span className={`text-[0.4rem] font-bold uppercase tracking-widest mt-1 whitespace-nowrap ${
                  day.type === "island" ? "text-cyan-400" : day.type === "sea" ? "text-purple-400" : "text-amber-400"
                }`}>{day.port.split(",")[0]}</span>
              </div>
              {i < ITINERARY.length - 1 && (
                <div className="w-12 h-px bg-white/10 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">Layout L — Film Strip Scroll</div>
    </div>
  );
}
