"use client";
import { useState } from "react";

const ITINERARY = [
  { day: 1, port: "Miami, FL", label: "Embarkation", icon: "🚢", desc: "Board the ship and join the Sail-Away Party with 7th Heaven on the pool deck.", type: "depart" },
  { day: 2, port: "At Sea", label: "Sea Day", icon: "🌊", desc: "Acoustic set by the pool. Meet & Greet. Full electric show in the main theater.", type: "sea" },
  { day: 3, port: "Cozumel, Mexico", label: "Port Day", icon: "🏝️", desc: "Explore Mayan ruins, snorkel crystal reefs, or chill on the beach.", type: "island" },
  { day: 4, port: "Grand Cayman", label: "Port Day", icon: "🐢", desc: "Stingray City, Seven Mile Beach. Sunset deck session with the band.", type: "island" },
  { day: 5, port: "Roatán, Honduras", label: "Port Day", icon: "🤿", desc: "World-class diving and zip-lining through the jungle canopy.", type: "island" },
  { day: 6, port: "At Sea", label: "Sea Day", icon: "🎸", desc: "Grand Finale — full 2-hour concert, fan-request setlist, after-party.", type: "sea" },
  { day: 7, port: "Miami, FL", label: "Disembarkation", icon: "⚓", desc: "Farewell breakfast and group photo before heading home.", type: "depart" },
];

const panelBg: Record<string, string> = {
  island: "from-cyan-950 via-[#060c14] to-[#050508]",
  sea:    "from-violet-950 via-[#08060f] to-[#050508]",
  depart: "from-amber-950 via-[#110900] to-[#050508]",
};
const glowColor: Record<string, string> = {
  island: "bg-cyan-500",
  sea:    "bg-[var(--color-accent)]",
  depart: "bg-amber-500",
};
const accentText: Record<string, string> = {
  island: "text-cyan-400",
  sea:    "text-purple-400",
  depart: "text-amber-400",
};

export default function ItineraryE() {
  const [active, setActive] = useState(0);
  const day = ITINERARY[active];

  return (
    <div className="min-h-screen bg-[#050508] pt-[72px] flex flex-col">
      {/* Top day selector strip */}
      <div className="border-b border-white/[0.06] bg-[#080810]">
        <div className="site-container max-w-5xl">
          <div className="flex">
            {ITINERARY.map((d, i) => (
              <button
                key={d.day}
                onClick={() => setActive(i)}
                className={`flex-1 py-4 flex flex-col items-center gap-1 border-b-2 transition-all cursor-pointer relative group ${
                  i === active
                    ? `border-[var(--color-accent)] ${accentText[d.type]}`
                    : "border-transparent text-white/25 hover:text-white/50 hover:border-white/20"
                }`}
              >
                <span className="text-xl">{d.icon}</span>
                <span className={`text-[0.4rem] font-black uppercase tracking-[0.2em] hidden sm:block`}>Day {d.day}</span>
                <span className="text-[0.5rem] font-bold hidden md:block text-center leading-tight">{d.port.split(",")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Big detail panel */}
      <div className={`flex-1 bg-gradient-to-br ${panelBg[day.type]} relative overflow-hidden transition-all duration-500`}>
        {/* Glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full ${glowColor[day.type]} opacity-[0.05] blur-[100px] pointer-events-none`} />

        <div className="site-container max-w-3xl py-20 relative z-10">
          {/* Day badge */}
          <div className="flex items-center gap-4 mb-8">
            <span className={`text-[0.55rem] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-full border ${
              day.type === "island" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
              day.type === "sea"    ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                      "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}>Day {day.day} · {day.label}</span>
          </div>

          {/* Giant icon */}
          <div className="text-[6rem] mb-6 animate-[fade-in-up_0.4s_ease-out]">{day.icon}</div>

          {/* Port name */}
          <h1 className="text-[clamp(3rem,8vw,6rem)] font-black italic uppercase leading-none text-white mb-6" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            {day.port}
          </h1>

          {/* Description */}
          <p className="text-white/50 text-lg leading-relaxed max-w-xl mb-10">{day.desc}</p>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActive(Math.max(0, active - 1))}
              disabled={active === 0}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-sm font-bold cursor-pointer"
            >
              ← Prev
            </button>
            <div className="flex-1 flex items-center gap-1.5">
              {ITINERARY.map((_, i) => (
                <div key={i} className={`flex-1 h-0.5 rounded-full transition-all ${i <= active ? glowColor[day.type] + " opacity-60" : "bg-white/10"}`} />
              ))}
            </div>
            <button
              onClick={() => setActive(Math.min(ITINERARY.length - 1, active + 1))}
              disabled={active === ITINERARY.length - 1}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-sm font-bold cursor-pointer"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
        Layout E — Interactive Day Selector
      </div>
    </div>
  );
}
