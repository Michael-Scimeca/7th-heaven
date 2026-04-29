"use client";

const ITINERARY = [
  { day: 1, port: "Miami, FL", label: "Embarkation", icon: "🚢", desc: "Board the ship and join the Sail-Away Party with 7th Heaven on the pool deck.", type: "depart" },
  { day: 2, port: "At Sea", label: "Sea Day", icon: "🌊", desc: "Acoustic set by the pool. Meet & Greet. Full electric show in the main theater.", type: "sea" },
  { day: 3, port: "Cozumel, Mexico", label: "Port Day", icon: "🏝️", desc: "Explore Mayan ruins, snorkel crystal reefs, or chill on the beach.", type: "island" },
  { day: 4, port: "Grand Cayman", label: "Port Day", icon: "🐢", desc: "Stingray City, Seven Mile Beach. Sunset deck session with the band.", type: "island" },
  { day: 5, port: "Roatán, Honduras", label: "Port Day", icon: "🤿", desc: "World-class diving and zip-lining through the jungle canopy.", type: "island" },
  { day: 6, port: "At Sea", label: "Sea Day", icon: "🎸", desc: "Grand Finale — full 2-hour concert, fan-request setlist, after-party.", type: "sea" },
  { day: 7, port: "Miami, FL", label: "Disembarkation", icon: "⚓", desc: "Farewell breakfast and group photo before heading home.", type: "depart" },
];

const dot: Record<string, string> = {
  island: "bg-cyan-400 shadow-cyan-400/50",
  sea:    "bg-[var(--color-accent)] shadow-[var(--color-accent)]/50",
  depart: "bg-amber-400 shadow-amber-400/50",
};
const lineColor: Record<string, string> = {
  island: "border-cyan-500/30",
  sea:    "border-purple-500/30",
  depart: "border-amber-500/30",
};

export default function ItineraryB() {
  return (
    <div className="min-h-screen bg-[#050508] pt-[72px]">
      <div className="site-container max-w-3xl py-16">
        <div className="text-center mb-16">
          <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-[var(--color-accent)] mb-2">7 Nights · Caribbean</p>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-black italic uppercase text-white" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            Day-by-Day <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-cyan-400">Journey</span>
          </h1>
        </div>

        {/* Classic vertical timeline */}
        <div className="relative">
          {/* Vertical spine */}
          <div className="absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-[var(--color-accent)]/40 via-white/10 to-amber-400/30" />

          <div className="space-y-0">
            {ITINERARY.map((day, i) => (
              <div key={day.day} className="relative flex gap-8 pb-10 last:pb-0 group">
                {/* Dot */}
                <div className="relative z-10 shrink-0">
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl shadow-lg ${lineColor[day.type]} bg-[#0c0c18]`}>
                    {day.icon}
                  </div>
                  <div className={`absolute inset-1 rounded-full opacity-0 group-hover:opacity-20 ${dot[day.type]} transition-opacity blur-md`} />
                </div>

                {/* Card */}
                <div className={`flex-1 bg-white/[0.02] border rounded-2xl p-6 group-hover:border-white/10 transition-all ${lineColor[day.type]} group-hover:bg-white/[0.03]`}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <span className="text-[0.5rem] font-black uppercase tracking-[0.3em] text-white/25 block mb-1">Day {day.day}</span>
                      <h2 className="text-lg font-black text-white leading-tight">{day.port}</h2>
                    </div>
                    <span className={`shrink-0 text-[0.5rem] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border ${
                      day.type === "island" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                      day.type === "sea"    ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                              "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>{day.label}</span>
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed">{day.desc}</p>

                  {/* Progress line to next */}
                  {i < ITINERARY.length - 1 && (
                    <div className="mt-5 flex items-center gap-2">
                      <div className="h-px flex-1 bg-white/5" />
                      <span className="text-[0.4rem] text-white/15 uppercase tracking-widest font-bold">next stop</span>
                      <div className="h-px flex-1 bg-white/5" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
        Layout B — Vertical Timeline
      </div>
    </div>
  );
}
