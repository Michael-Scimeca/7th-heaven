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

export default function ItineraryH() {
  return (
    <div className="bg-[#050508] min-h-screen pt-[72px]">
      {/* Hero header */}
      <div className="relative h-[40vh] overflow-hidden">
        <img src="/images/cruise/at-sea.png" alt="Caribbean cruise" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#050508]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-[var(--color-accent)] mb-2">7 Nights · Caribbean</p>
          <h1 className="text-[clamp(3rem,8vw,6rem)] font-black italic uppercase text-white leading-none" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            Cruise <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-cyan-400">Itinerary</span>
          </h1>
        </div>
      </div>

      {/* Photo card grid */}
      <div className="site-container max-w-6xl py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ITINERARY.map(day => (
            <div key={day.day} className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl">
              {/* Photo */}
              <div className="relative h-52 overflow-hidden">
                <img src={day.photo} alt={day.port} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-black/20 to-transparent" />
                {/* Day pill on photo */}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md rounded-lg px-2.5 py-1">
                  <span className={`text-[0.45rem] font-black uppercase tracking-[0.2em] ${day.type === "island" ? "text-cyan-400" : day.type === "sea" ? "text-purple-400" : "text-amber-400"}`}>Day {day.day}</span>
                </div>
                <div className="absolute top-3 right-3 text-2xl">{day.icon}</div>
              </div>

              {/* Text below photo */}
              <div className="bg-[#0c0c18] p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="text-base font-black text-white leading-tight">{day.port}</h2>
                  <span className={`shrink-0 text-[0.4rem] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${
                    day.type === "island" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                    day.type === "sea"    ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                            "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>{day.label}</span>
                </div>
                <p className="text-white/40 text-xs leading-relaxed">{day.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">Layout H — Photo Card Grid</div>
    </div>
  );
}
