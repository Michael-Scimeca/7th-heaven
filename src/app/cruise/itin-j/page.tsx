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

// Bento-style varied tile sizes
const SIZES = [
  "lg:col-span-2 lg:row-span-2", // Day 1 — big
  "lg:col-span-1 lg:row-span-1", // Day 2
  "lg:col-span-1 lg:row-span-1", // Day 3
  "lg:col-span-1 lg:row-span-2", // Day 4 — tall
  "lg:col-span-2 lg:row-span-1", // Day 5 — wide
  "lg:col-span-1 lg:row-span-1", // Day 6
  "lg:col-span-1 lg:row-span-1", // Day 7
];
const HEIGHTS = ["min-h-[340px]", "min-h-[160px]", "min-h-[160px]", "min-h-[340px]", "min-h-[160px]", "min-h-[160px]", "min-h-[160px]"];

export default function ItineraryJ() {
  return (
    <div className="bg-[#050508] min-h-screen pt-[72px]">
      {/* Thin cinematic header */}
      <div className="text-center py-14 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(133,29,239,0.08),_transparent_70%)]" />
        <p className="relative text-[0.55rem] font-black uppercase tracking-[0.4em] text-[var(--color-accent)] mb-3">7 Nights · Caribbean</p>
        <h1 className="relative text-[clamp(2.5rem,7vw,5.5rem)] font-black italic uppercase text-white leading-none" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-cyan-400">Journey</span>
        </h1>
      </div>

      {/* Photo bento grid */}
      <div className="site-container max-w-7xl pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-3 gap-3 auto-rows-auto">
          {ITINERARY.map((day, i) => (
            <div key={day.day} className={`group relative overflow-hidden rounded-2xl ${SIZES[i]} ${HEIGHTS[i]} cursor-pointer`}>
              {/* Photo */}
              <img src={day.photo} alt={day.port} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10 group-hover:from-black/70 transition-all duration-300" />

              {/* Content */}
              <div className="absolute inset-0 p-5 flex flex-col justify-between">
                {/* Top */}
                <div className="flex items-start justify-between">
                  <span className={`text-[0.45rem] font-black uppercase tracking-[0.25em] px-2.5 py-1.5 rounded-lg backdrop-blur-md bg-black/50 ${
                    day.type === "island" ? "text-cyan-400" : day.type === "sea" ? "text-purple-400" : "text-amber-400"
                  }`}>Day {day.day}</span>
                  <span className="text-2xl drop-shadow-lg">{day.icon}</span>
                </div>

                {/* Bottom */}
                <div>
                  <span className={`text-[0.45rem] font-bold uppercase tracking-widest block mb-1 ${
                    day.type === "island" ? "text-cyan-400" : day.type === "sea" ? "text-purple-400" : "text-amber-400"
                  }`}>{day.label}</span>
                  <h2 className={`font-black text-white leading-tight mb-2 ${i === 0 ? "text-2xl" : "text-lg"}`}>{day.port}</h2>
                  <p className={`text-white/50 leading-snug ${i === 0 ? "text-sm" : "text-xs"} ${i > 0 ? "line-clamp-2" : ""}`}>{day.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">Layout J — Photo Bento Grid</div>
    </div>
  );
}
