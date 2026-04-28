"use client";

import { useState } from "react";

const ITIN = [
  { day: 1, port: "Miami, FL", label: "Embarkation", icon: "🚢", desc: "Board the ship and join the Sail-Away Party with 7th Heaven on the pool deck." },
  { day: 2, port: "At Sea", label: "Sea Day", icon: "🌊", desc: "Acoustic set by the pool. Meet & Greet. Full electric show in the main theater." },
  { day: 3, port: "Cozumel, Mexico", label: "Port Day", icon: "🏝️", desc: "Explore Mayan ruins, snorkel crystal reefs, or chill on the beach." },
  { day: 4, port: "Grand Cayman", label: "Port Day", icon: "🐢", desc: "Stingray City, Seven Mile Beach. Sunset deck session with the band." },
  { day: 5, port: "Roatán, Honduras", label: "Port Day", icon: "🤿", desc: "World-class diving and zip-lining through the jungle canopy." },
  { day: 6, port: "At Sea", label: "Sea Day", icon: "🎸", desc: "Grand Finale — full 2-hour concert, fan-request setlist, after-party." },
  { day: 7, port: "Miami, FL", label: "Disembarkation", icon: "⚓", desc: "Farewell breakfast and group photo before heading home." },
];

/* Layout E — Accordion Expandable */
export default function ItineraryE() {
  const [open, setOpen] = useState<number>(0);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pt-[72px]">
      <div className="site-container max-w-3xl py-16">
        <h2 className="text-3xl font-black uppercase italic tracking-tight mb-12 text-center" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          Day-by-Day <span className="accent-gradient-text">Itinerary</span>
        </h2>

        <div className="space-y-2">
          {ITIN.map((day, i) => (
            <div key={day.day} className={`border rounded-2xl overflow-hidden transition-all ${open === i ? "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5" : "border-white/5 bg-white/[0.01]"}`}>
              <button onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full flex items-center gap-4 p-5 text-left cursor-pointer hover:bg-white/[0.02] transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all ${open === i ? "bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/30" : "bg-white/[0.03] border border-white/5"}`}>
                  {day.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`text-[0.55rem] font-black uppercase tracking-[0.2em] ${open === i ? "text-[var(--color-accent)]" : "text-white/25"}`}>Day {day.day}</span>
                    <span className="text-[0.45rem] font-bold uppercase tracking-widest text-white/15 bg-white/[0.03] px-2 py-0.5 rounded">{day.label}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">{day.port}</h3>
                </div>
                <span className={`text-white/20 text-xl transition-transform ${open === i ? "rotate-180" : ""}`}>▾</span>
              </button>
              {open === i && (
                <div className="px-5 pb-5 pl-[76px] -mt-1">
                  <p className="text-[0.85rem] text-white/40 leading-relaxed">{day.desc}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">Layout E — Accordion</div>
    </div>
  );
}
