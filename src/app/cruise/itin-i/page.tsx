"use client";
import { useState } from "react";

const ITINERARY = [
  { day: 1, port: "Miami, FL",        label: "Embarkation",   icon: "🚢", desc: "Board the ship and join the Sail-Away Party with 7th Heaven on the pool deck.", type: "depart", photo: "/images/cruise/miami.png" },
  { day: 2, port: "At Sea",           label: "Sea Day",        icon: "🌊", desc: "Acoustic set by the pool. Meet & Greet. Full electric show in the main theater.", type: "sea",    photo: "/images/cruise/at-sea.png" },
  { day: 3, port: "Cozumel, Mexico",  label: "Port Day",       icon: "🏝️", desc: "Explore Mayan ruins, snorkel crystal reefs, or chill on the beach.", type: "island", photo: "/images/cruise/cozumel.png" },
  { day: 4, port: "Grand Cayman",     label: "Port Day",       icon: "🐢", desc: "Stingray City, Seven Mile Beach. Sunset deck session with the band.", type: "island", photo: "/images/cruise/grand-cayman.png" },
  { day: 5, port: "Roatán, Honduras", label: "Port Day",       icon: "🤿", desc: "World-class diving and zip-lining through the jungle canopy.", type: "island", photo: "/images/cruise/roatan.png" },
  { day: 6, port: "At Sea",           label: "Grand Finale",   icon: "🎸", desc: "Grand Finale — full 2-hour concert, fan-request setlist, after-party.", type: "sea",    photo: "/images/cruise/concert.png" },
  { day: 7, port: "Miami, FL",        label: "Disembarkation", icon: "⚓", desc: "Farewell breakfast and group photo before heading home.", type: "depart", photo: "/images/cruise/miami.png" },
];

export default function ItineraryI() {
  const [active, setActive] = useState(0);
  const day = ITINERARY[active];

  return (
    <div className="bg-[#050508] min-h-screen pt-[72px] flex flex-col lg:flex-row">
      {/* Left: big photo panel */}
      <div className="relative lg:w-[55%] h-[50vh] lg:h-auto lg:sticky lg:top-[72px] lg:self-start overflow-hidden">
        <img
          key={active}
          src={day.photo}
          alt={day.port}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#050508]" />
        {/* Floating info on photo */}
        <div className="absolute bottom-6 left-6 right-6">
          <span className={`text-[0.5rem] font-black uppercase tracking-[0.3em] block mb-1 ${day.type === "island" ? "text-cyan-400" : day.type === "sea" ? "text-purple-400" : "text-amber-400"}`}>Day {day.day} · {day.label}</span>
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black italic uppercase text-white leading-none" style={{ fontFamily: "var(--font-barlow-condensed)" }}>{day.port}</h2>
        </div>
      </div>

      {/* Right: scrollable day list */}
      <div className="flex-1 py-8 px-6 lg:px-12 overflow-y-auto">
        <div className="max-w-md mx-auto lg:mx-0">
          <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-[var(--color-accent)] mb-6">Select a Day</p>
          <div className="space-y-2">
            {ITINERARY.map((d, i) => (
              <button
                key={d.day}
                onClick={() => setActive(i)}
                className={`w-full flex items-center gap-4 rounded-2xl p-4 border transition-all duration-200 cursor-pointer text-left group ${
                  i === active
                    ? "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5"
                    : "border-white/[0.04] bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.03]"
                }`}
              >
                {/* Thumbnail */}
                <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden">
                  <img src={d.photo} alt={d.port} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-[0.45rem] font-black uppercase tracking-[0.2em] block ${i === active ? (d.type === "island" ? "text-cyan-400" : d.type === "sea" ? "text-purple-400" : "text-amber-400") : "text-white/25"}`}>Day {d.day}</span>
                  <span className="text-sm font-bold text-white truncate block">{d.port}</span>
                  <span className="text-[0.6rem] text-white/30">{d.label}</span>
                </div>
                {i === active && (
                  <div className={`shrink-0 w-1.5 h-8 rounded-full ${d.type === "island" ? "bg-cyan-400" : d.type === "sea" ? "bg-purple-400" : "bg-amber-400"}`} />
                )}
              </button>
            ))}
          </div>

          {/* Description panel */}
          <div className="mt-8 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-white/50 leading-relaxed">{day.desc}</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">Layout I — Photo Sidebar Picker</div>
    </div>
  );
}
