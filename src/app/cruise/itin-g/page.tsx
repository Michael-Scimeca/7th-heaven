"use client";

// Layout G: Full-bleed photo hero per day — alternating split rows
const ITINERARY = [
  { day: 1, port: "Miami, FL",        label: "Embarkation",   icon: "🚢", desc: "Board the ship and join the Sail-Away Party with 7th Heaven on the pool deck.", type: "depart", photo: "/images/cruise/miami.png" },
  { day: 2, port: "At Sea",           label: "Sea Day",        icon: "🌊", desc: "Acoustic set by the pool. Meet & Greet. Full electric show in the main theater.", type: "sea",    photo: "/images/cruise/at-sea.png" },
  { day: 3, port: "Cozumel, Mexico",  label: "Port Day",       icon: "🏝️", desc: "Explore Mayan ruins, snorkel crystal reefs, or chill on the beach.", type: "island", photo: "/images/cruise/cozumel.png" },
  { day: 4, port: "Grand Cayman",     label: "Port Day",       icon: "🐢", desc: "Stingray City, Seven Mile Beach. Sunset deck session with the band.", type: "island", photo: "/images/cruise/grand-cayman.png" },
  { day: 5, port: "Roatán, Honduras", label: "Port Day",       icon: "🤿", desc: "World-class diving and zip-lining through the jungle canopy.", type: "island", photo: "/images/cruise/roatan.png" },
  { day: 6, port: "At Sea",           label: "Grand Finale",   icon: "🎸", desc: "Grand Finale — full 2-hour concert, fan-request setlist, after-party.", type: "sea",    photo: "/images/cruise/concert.png" },
  { day: 7, port: "Miami, FL",        label: "Disembarkation", icon: "⚓", desc: "Farewell breakfast and group photo before heading home.", type: "depart", photo: "/images/cruise/miami.png" },
];

export default function ItineraryG() {
  return (
    <div className="bg-[#050508] min-h-screen">
      <div className="sticky top-0 z-40 bg-[#050508]/90 backdrop-blur-xl border-b border-white/[0.06] px-6 py-3 flex items-center justify-between">
        <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white/60">7th Heaven · Caribbean Cruise</h1>
        <span className="text-[0.55rem] font-bold uppercase tracking-widest text-[var(--color-accent)]">7 Nights</span>
      </div>
      {ITINERARY.map((day, i) => (
        <div key={day.day} className={`relative flex flex-col lg:flex-row ${i % 2 === 1 ? "lg:flex-row-reverse" : ""} min-h-[380px] overflow-hidden`}>
          <div className="relative lg:w-1/2 h-56 lg:h-auto overflow-hidden">
            <img src={day.photo} alt={day.port} className="absolute inset-0 w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-700" />
            <div className={`absolute inset-0 bg-gradient-to-${i % 2 === 1 ? "l" : "r"} from-transparent to-[#050508]`} />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2">
              <span className="text-[0.5rem] font-black uppercase tracking-[0.3em] text-[var(--color-accent)] block">Day {day.day}</span>
              <span className="text-lg font-black text-white leading-none">{day.icon}</span>
            </div>
          </div>
          <div className="lg:w-1/2 flex items-center px-8 lg:px-16 py-10">
            <div className="max-w-md">
              <span className={`text-[0.5rem] font-black uppercase tracking-[0.3em] mb-3 block ${day.type === "island" ? "text-cyan-400" : day.type === "sea" ? "text-purple-400" : "text-amber-400"}`}>{day.label}</span>
              <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black italic uppercase text-white leading-none mb-4" style={{ fontFamily: "var(--font-barlow-condensed)" }}>{day.port}</h2>
              <p className="text-white/45 leading-relaxed">{day.desc}</p>
              <div className="mt-6 flex items-center gap-3">
                <div className={`w-8 h-0.5 rounded-full ${day.type === "island" ? "bg-cyan-400" : day.type === "sea" ? "bg-purple-400" : "bg-amber-400"}`} />
                <span className="text-white/20 text-[0.55rem] font-bold uppercase tracking-widest">{i + 1} of {ITINERARY.length}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">Layout G — Split Photo Rows</div>
    </div>
  );
}
