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
  // Chunk history items into 3 items per row, matching the CodePen 3-column serpentine layout
  const rows: HistoryItem[][] = [];
  const chunkSize = 3;
  for (let i = 0; i < history.length; i += chunkSize) {
    rows.push(history.slice(i, i + chunkSize));
  }

  return (
    <div className="border-t border-white/10 pt-16 mt-16 text-left overflow-x-hidden">
      {/* Section Header */}
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
          Explore 7th Heaven&apos;s history at sea across Royal Caribbean, MSC, and landmark voyages in our serpentine timeline.
        </p>
      </div>

      {/* ── DESKTOP CODEPEN SERPENTINE SNAKE TIMELINE (LG & UP) ── */}
      <div className="hidden lg:block max-w-6xl mx-auto py-8 px-8 relative">
        
        {/* START POINT HEADER (Top-Left Corner Entry) */}
        <div className="relative pl-4 mb-16">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-cyan-400 border-4 border-[#06060c] shadow-[0_0_15px_rgba(6,182,212,0.9)] animate-pulse z-10" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-black bg-cyan-400 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.6)] font-mono z-10">
              START · LATEST VOYAGES
            </span>
          </div>

          {/* Vertical Stem from START button turning RIGHT into Row 0 */}
          <div className="absolute top-2 left-6 w-[76px] h-[76px] border-l-2 border-b-2 border-cyan-400 rounded-bl-[76px] shadow-[0_0_10px_rgba(6,182,212,0.5)] pointer-events-none z-0" />
        </div>

        {/* TIMELINE ROWS CONTAINER */}
        <div className="space-y-36">
          {rows.map((rowItems, rowIndex) => {
            const isEvenRow = rowIndex % 2 === 0; // Row 0 (L->R), Row 1 (R->L), Row 2 (L->R)...
            const isLastRow = rowIndex === rows.length - 1;

            return (
              <div
                key={rowIndex}
                className={`relative flex justify-between items-start px-12 ${
                  isEvenRow ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                {/* 1. Horizontal Pipeline Line Across Row Top */}
                <div className="absolute top-0 left-[76px] right-[76px] h-[2px] bg-cyan-500/80 shadow-[0_0_10px_rgba(6,182,212,0.6)] pointer-events-none z-0" />

                {/* 2. Connecting S-Curve Bends (If not last row) */}
                {!isLastRow && (
                  <>
                    {isEvenRow ? (
                      /* RIGHT SIDE BEND (Connects Row Top-Right -> Next Row Top-Right) */
                      <>
                        {/* Top-Right Curve Arc */}
                        <div className="absolute top-0 right-0 w-[76px] h-[76px] border-t-2 border-r-2 border-cyan-400 rounded-tr-[76px] shadow-[0_0_12px_rgba(6,182,212,0.5)] pointer-events-none z-0" />
                        {/* Right Vertical Drop Line */}
                        <div className="absolute top-[76px] bottom-[-144px] right-0 w-[2px] bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)] pointer-events-none z-0" />
                        {/* Bottom-Right Curve Arc */}
                        <div className="absolute bottom-[-144px] right-0 w-[76px] h-[76px] border-b-2 border-r-2 border-cyan-400 rounded-br-[76px] shadow-[0_0_12px_rgba(6,182,212,0.5)] pointer-events-none z-0" />
                      </>
                    ) : (
                      /* LEFT SIDE BEND (Connects Row Top-Left -> Next Row Top-Left) */
                      <>
                        {/* Top-Left Curve Arc */}
                        <div className="absolute top-0 left-0 w-[76px] h-[76px] border-t-2 border-l-2 border-cyan-400 rounded-tl-[76px] shadow-[0_0_12px_rgba(6,182,212,0.5)] pointer-events-none z-0" />
                        {/* Left Vertical Drop Line */}
                        <div className="absolute top-[76px] bottom-[-144px] left-0 w-[2px] bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)] pointer-events-none z-0" />
                        {/* Bottom-Left Curve Arc */}
                        <div className="absolute bottom-[-144px] left-0 w-[76px] h-[76px] border-b-2 border-l-2 border-cyan-400 rounded-bl-[76px] shadow-[0_0_12px_rgba(6,182,212,0.5)] pointer-events-none z-0" />
                      </>
                    )}
                  </>
                )}

                {/* 3. Milestone Items (3 Per Row) */}
                {rowItems.map((hist, itemIndex) => {
                  const globalIdx = rowIndex * chunkSize + itemIndex;
                  const voyageNum = history.length - globalIdx;

                  return (
                    <div
                      key={itemIndex}
                      className="w-[300px] relative text-center shrink-0 z-10 group"
                    >
                      {/* GIANT YEAR HEADER - Breaks Line Directly In Center */}
                      <div className="relative inline-block -translate-y-1/2 bg-[#06060c] px-4 py-0.5 rounded-2xl z-20">
                        <h6 className="text-4xl md:text-5xl font-black text-cyan-400 font-mono tracking-tight group-hover:text-white transition-colors drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
                          {hist.year}
                        </h6>
                      </div>

                      {/* Content Box Below Year Header */}
                      <div className="bg-[#0c0c16]/90 backdrop-blur-xl border border-white/10 hover:border-cyan-400/60 p-5 rounded-3xl shadow-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_30px_rgba(6,182,212,0.2)] text-left mt-2">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400/80 font-mono bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
                            VOYAGE #{voyageNum}
                          </span>
                          <span className="text-xs">🚢</span>
                        </div>

                        <h4 className="text-sm font-black text-white uppercase leading-snug group-hover:text-cyan-300 transition-colors">
                          {hist.ship}
                        </h4>
                        <p className="text-xs text-white/50 mt-2 leading-relaxed font-sans">
                          {hist.details}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* END POINT FOOTER */}
        <div className="relative flex items-center gap-3 mt-20 pl-4">
          <div className="w-5 h-5 rounded-full bg-purple-500 border-4 border-[#06060c] shadow-[0_0_15px_rgba(168,85,247,0.9)] z-10" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-white bg-purple-600 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.6)] font-mono z-10">
            CONTINUE · INAUGURAL 1998 VOYAGE 🏆
          </span>
        </div>
      </div>

      {/* ── MOBILE VERTICAL SNAKE TIMELINE (MD & BELOW) ── */}
      <div className="block lg:hidden relative max-w-lg mx-auto py-6 px-4">
        {/* Central Vertical Line */}
        <div className="absolute left-6 top-4 bottom-4 w-[2px] bg-gradient-to-b from-cyan-400 via-blue-500/40 to-purple-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] pointer-events-none" />

        <div className="space-y-6 pl-10">
          {history.map((hist, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute left-[-26px] top-4 w-4 h-4 rounded-full bg-cyan-400 border-2 border-[#06060c] shadow-[0_0_10px_rgba(6,182,212,0.8)] group-hover:scale-125 transition-transform" />

              <div className="bg-[#0c0c16]/90 backdrop-blur-xl border border-white/10 hover:border-cyan-400/60 p-5 rounded-2xl shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-lg font-black text-cyan-400 font-mono">
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
