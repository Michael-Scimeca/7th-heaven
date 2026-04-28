"use client";

import { useState } from "react";

const ITINERARY = [
  { day: 1, port: "Miami, FL", label: "Embarkation", icon: "🚢", desc: "Board the ship and join the Sail-Away Party with 7th Heaven on the pool deck.", highlights: ["Sail-Away Party", "Welcome Dinner", "First Night Meet"], type: "depart" },
  { day: 2, port: "At Sea", label: "Sea Day", icon: "🌊", desc: "Acoustic set by the pool. Meet & Greet. Full electric show in the main theater.", highlights: ["Pool Acoustic Set", "Band Meet & Greet", "Theater Concert"], type: "sea" },
  { day: 3, port: "Cozumel, Mexico", label: "Port Day", icon: "🏝️", desc: "Explore Mayan ruins, snorkel crystal reefs, or chill on the beach.", highlights: ["Mayan Ruins Tour", "Reef Snorkeling", "Beach Day"], type: "island" },
  { day: 4, port: "Grand Cayman", label: "Port Day", icon: "🐢", desc: "Stingray City, Seven Mile Beach. Sunset deck session with the band.", highlights: ["Stingray City", "Seven Mile Beach", "Sunset Deck Jam"], type: "island" },
  { day: 5, port: "Roatán, Honduras", label: "Port Day", icon: "🤿", desc: "World-class diving and zip-lining through the jungle canopy.", highlights: ["Scuba Diving", "Jungle Zip-line", "Island Exploration"], type: "island" },
  { day: 6, port: "At Sea", label: "Sea Day", icon: "🎸", desc: "Grand Finale — full 2-hour concert, fan-request setlist, after-party.", highlights: ["2-Hour Concert", "Fan Request Set", "Grand After-Party"], type: "sea" },
  { day: 7, port: "Miami, FL", label: "Disembarkation", icon: "⚓", desc: "Farewell breakfast and group photo before heading home.", highlights: ["Farewell Breakfast", "Group Photo", "Until Next Time"], type: "depart" },
];

export default function ItineraryB() {
  const [activeDay, setActiveDay] = useState(0);
  const day = ITINERARY[activeDay];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pt-[72px]">
      <div className="site-container max-w-4xl py-16">
        <h2 className="text-3xl font-black uppercase italic tracking-tight mb-12 text-center" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          Day-by-Day <span className="accent-gradient-text">Itinerary</span>
        </h2>

        {/* Tab-style day selector */}
        <div className="flex justify-center gap-2 mb-8">
          {ITINERARY.map((d, i) => (
            <button key={d.day} onClick={() => setActiveDay(i)}
              className={`flex flex-col items-center px-4 py-3 rounded-xl transition-all cursor-pointer border ${
                activeDay === i
                  ? "bg-[var(--color-accent)]/15 border-[var(--color-accent)]/50 shadow-[0_0_15px_rgba(133,29,239,0.2)]"
                  : "bg-white/[0.02] border-white/5 hover:border-white/15"
              }`}
            >
              <span className="text-lg">{d.icon}</span>
              <span className={`text-[0.5rem] font-black uppercase tracking-widest mt-1 ${activeDay === i ? "text-[var(--color-accent)]" : "text-white/30"}`}>Day {d.day}</span>
            </button>
          ))}
        </div>

        {/* Active day detail card */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-10 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-[var(--color-accent)]/5 blur-[100px] rounded-full" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-5xl">{day.icon}</span>
              <div>
                <span className="text-[0.6rem] font-black uppercase tracking-[0.25em] text-[var(--color-accent)]">Day {day.day}</span>
                <h3 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: "var(--font-barlow-condensed)" }}>{day.port}</h3>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[0.5rem] font-bold uppercase tracking-widest ${
                  day.type === "island" ? "bg-cyan-500/10 text-cyan-400" : day.type === "sea" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"
                }`}>{day.label}</span>
              </div>
            </div>

            <p className="text-white/45 leading-relaxed mb-8 max-w-lg">{day.desc}</p>

            {/* Highlights */}
            <div>
              <p className="text-[0.55rem] font-bold uppercase tracking-widest text-white/20 mb-3">Highlights</p>
              <div className="flex flex-wrap gap-3">
                {day.highlights.map(h => (
                  <span key={h} className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl text-[0.75rem] text-white/50 font-medium hover:border-[var(--color-accent)]/30 hover:text-white/70 transition-all">
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Nav arrows */}
            <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
              <button onClick={() => setActiveDay(Math.max(0, activeDay - 1))} disabled={activeDay === 0}
                className="text-[0.6rem] font-bold uppercase tracking-widest text-white/30 hover:text-white disabled:opacity-20 cursor-pointer transition-colors">
                ← Previous Day
              </button>
              <button onClick={() => setActiveDay(Math.min(6, activeDay + 1))} disabled={activeDay === 6}
                className="text-[0.6rem] font-bold uppercase tracking-widest text-white/30 hover:text-white disabled:opacity-20 cursor-pointer transition-colors">
                Next Day →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-cyan-500 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
        Itinerary B — Tabbed Detail
      </div>
    </div>
  );
}
