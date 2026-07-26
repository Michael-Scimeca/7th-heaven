'use client';

import React from 'react';

export type HistoryItem = {
  year: string;
  ship: string;
  details: string;
};

type Props = {
  history: HistoryItem[];
};

export default function CruiseHistoryTimeline({ history }: Props) {
  // Group history items into rows of 2 for a clean serpentine S-curve grid on desktop
  const rows: HistoryItem[][] = [];
  const chunkSize = 2;
  for (let i = 0; i < history.length; i += chunkSize) {
    rows.push(history.slice(i, i + chunkSize));
  }

  return (
    <div className="border-t border-white/10 pt-16 mt-16 text-left">
      {/* Section Title */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400 block mb-1">
          25+ Years Legacy Pathway
        </span>
        <h3
          className="text-3xl md:text-5xl font-black uppercase italic text-white tracking-tight"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
          Cruising <span className="accent-gradient-text">History & Milestones</span>
        </h3>
        <p className="text-white/40 text-xs md:text-sm mt-2 leading-relaxed">
          Explore 7th Heaven&apos;s journey across Royal Caribbean, MSC, and landmark voyages in our serpentine history timeline.
        </p>
      </div>

      {/* ── DESKTOP SERPENTINE SNAKE TIMELINE (MD & UP) ── */}
      <div className="hidden md:block relative max-w-5xl mx-auto py-8 px-4">
        {/* Start Point Header */}
        <div className="flex flex-col items-center justify-center mb-12 relative z-10">
          <div className="w-5 h-5 rounded-full bg-cyan-400 border-4 border-[#050508] shadow-[0_0_15px_rgba(6,182,212,0.9)] animate-pulse mb-3" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 bg-cyan-500/10 px-4 py-1 rounded-full border border-cyan-500/30">
            Latest Voyages
          </span>
        </div>

        {/* Serpentine Rows */}
        <div className="space-y-16">
          {rows.map((rowItems, rowIndex) => {
            const isEvenRow = rowIndex % 2 === 0; // Row 0 (L->R), Row 1 (R->L), Row 2 (L->R)...
            const isLastRow = rowIndex === rows.length - 1;

            return (
              <div key={rowIndex} className="relative">
                {/* Horizontal Connecting Pipeline */}
                <div className="absolute top-1/2 left-12 right-12 h-[2px] -translate-y-1/2 bg-gradient-to-r from-cyan-400 via-blue-500/50 to-purple-500 shadow-[0_0_10px_rgba(6,182,212,0.4)] pointer-events-none z-0" />

                {/* S-Curve Side Bend Corner (Connecting to Next Row) */}
                {!isLastRow && (
                  <>
                    {isEvenRow ? (
                      /* Right Side Turn (Top-Right -> Bottom-Right) */
                      <div className="absolute right-0 top-1/2 bottom-[-4rem] w-16 pointer-events-none z-0">
                        {/* Top-Right Curve Arc */}
                        <div className="absolute top-0 right-4 w-16 h-16 border-t-2 border-r-2 border-cyan-400 rounded-tr-[50px] shadow-[0_0_12px_rgba(6,182,212,0.5)]" />
                        {/* Bottom-Right Curve Arc */}
                        <div className="absolute bottom-0 right-4 w-16 h-16 border-b-2 border-r-2 border-purple-500 rounded-br-[50px] shadow-[0_0_12px_rgba(168,85,247,0.5)]" />
                      </div>
                    ) : (
                      /* Left Side Turn (Top-Left -> Bottom-Left) */
                      <div className="absolute left-0 top-1/2 bottom-[-4rem] w-16 pointer-events-none z-0">
                        {/* Top-Left Curve Arc */}
                        <div className="absolute top-0 left-4 w-16 h-16 border-t-2 border-l-2 border-purple-500 rounded-tl-[50px] shadow-[0_0_12px_rgba(168,85,247,0.5)]" />
                        {/* Bottom-Left Curve Arc */}
                        <div className="absolute bottom-0 left-4 w-16 h-16 border-b-2 border-l-2 border-cyan-400 rounded-bl-[50px] shadow-[0_0_12px_rgba(6,182,212,0.5)]" />
                      </div>
                    )}
                  </>
                )}

                {/* Row Grid Container */}
                <div
                  className={`grid grid-cols-2 gap-12 relative z-10 ${
                    isEvenRow ? '' : 'flex-row-reverse'
                  }`}
                >
                  {rowItems.map((hist, itemIndex) => {
                    const globalIdx = rowIndex * chunkSize + itemIndex;
                    const voyageNum = history.length - globalIdx;

                    return (
                      <div
                        key={itemIndex}
                        className={`group relative ${
                          !isEvenRow && itemIndex === 0 ? 'col-start-2' : ''
                        }`}
                      >
                        {/* Milestone Card */}
                        <div className="bg-[#0b0b14]/90 backdrop-blur-xl border border-white/10 hover:border-cyan-400/60 p-6 rounded-3xl shadow-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_30px_rgba(6,182,212,0.18)] relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />

                          {/* Node Icon Circle */}
                          <div className="absolute -top-3 left-6 w-7 h-7 rounded-full bg-cyan-500 text-black font-black text-xs flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.8)] border-2 border-[#050508] group-hover:scale-125 transition-transform">
                            ⚡
                          </div>

                          <div className="flex items-center justify-between gap-4 mt-2 mb-3">
                            <span className="text-xs font-black text-cyan-400 font-mono bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                              {hist.year}
                            </span>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/30 font-mono">
                              VOYAGE #{voyageNum}
                            </span>
                          </div>

                          <h4 className="text-base font-black text-white uppercase tracking-tight group-hover:text-cyan-300 transition-colors">
                            {hist.ship}
                          </h4>
                          <p className="text-xs text-white/60 mt-2 leading-relaxed font-sans">
                            {hist.details}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* End Point Footer */}
        <div className="flex flex-col items-center justify-center mt-16 relative z-10">
          <div className="w-5 h-5 rounded-full bg-purple-500 border-4 border-[#050508] shadow-[0_0_15px_rgba(168,85,247,0.9)] mb-3" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-purple-400 bg-purple-500/10 px-4 py-1 rounded-full border border-purple-500/30">
            Inaugural 1998 Sailing 🏆
          </span>
        </div>
      </div>

      {/* ── MOBILE VERTICAL SNAKE TIMELINE (SM & BELOW) ── */}
      <div className="block md:hidden relative max-w-lg mx-auto py-6 px-4">
        {/* Central Vertical Pathway */}
        <div className="absolute left-6 top-4 bottom-4 w-[2px] bg-gradient-to-b from-cyan-400 via-blue-500/40 to-purple-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] pointer-events-none" />

        <div className="space-y-6 pl-10">
          {history.map((hist, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline Node Dot */}
              <div className="absolute left-[-26px] top-4 w-4 h-4 rounded-full bg-cyan-400 border-2 border-[#050508] shadow-[0_0_10px_rgba(6,182,212,0.8)] group-hover:scale-125 transition-transform" />

              {/* Card Container */}
              <div className="bg-[#0b0b14]/90 backdrop-blur-xl border border-white/10 hover:border-cyan-400/60 p-5 rounded-2xl shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-xs font-black text-cyan-400 font-mono bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/30">
                    {hist.year}
                  </span>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/30 font-mono">
                    VOYAGE #{history.length - idx}
                  </span>
                </div>
                <h4 className="text-sm font-black text-white uppercase">{hist.ship}</h4>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">{hist.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
