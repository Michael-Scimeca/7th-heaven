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
    <div className="border-t border-white/10 pt-16 mt-16 text-left">
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
      <div className="hidden lg:block max-w-6xl mx-auto py-8 px-16 relative">
        
        {/* START POINT HEADER (Top-Left Corner Entry) */}
        <div className="relative pl-2 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-cyan-400 border-4 border-[#06060c] drop-shadow-[0_0_10px_rgba(6,182,212,0.9)] animate-pulse z-10" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-black bg-cyan-400 px-4 py-1.5 rounded-full drop-shadow-[0_0_10px_rgba(6,182,212,0.6)] font-mono z-10">
              START · LATEST VOYAGES
            </span>
          </div>

          {/* SVG Smooth Curve from START button directly into 2028 on the left */}
          <svg className="absolute left-[10px] top-[10px] bottom-[-2.25rem] w-[100px] h-[calc(100%+2.25rem)] pointer-events-none z-0 overflow-visible">
            <path
              d="M 0 0 V calc(100% - 20px) A 20 20 0 0 0 20 100% H 80"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
            />
          </svg>
        </div>

        {/* TIMELINE ROWS CONTAINER */}
        <div className="flex flex-col">
          {rows.map((rowItems, rowIndex) => {
            const isEvenRow = rowIndex % 2 === 0; // Row 0 (L->R), Row 1 (R->L), Row 2 (L->R)...
            const isLastRow = rowIndex === rows.length - 1;

            return (
              <div key={rowIndex} className="relative mb-24 last:mb-0">
                {/* YEAR HEADERS & HORIZONTAL LINE ROW */}
                <div
                  className={`relative flex justify-between items-center px-8 h-12 ${
                    isEvenRow ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {/* Horizontal Pipeline Line Passing Directly Through Center of Year Headers */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-[60px] right-[60px] h-[2.5px] bg-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] pointer-events-none z-0" />

                  {/* 100% Perfect SVG Side Curve Bends connecting line across rows */}
                  {!isLastRow && (
                    <>
                      {isEvenRow ? (
                        /* RIGHT SIDE BEND: Exits 2026 right, curves down and left into 2025 right */
                        <svg className="absolute right-[60px] top-1/2 bottom-[-8rem] w-[60px] h-[calc(100%+8rem)] pointer-events-none z-0 overflow-visible">
                          <path
                            d="M 0 0 H 24 A 36 36 0 0 1 60 36 V calc(100% - 36px) A 36 36 0 0 1 24 100% H 0"
                            fill="none"
                            stroke="#06b6d4"
                            strokeWidth="2.5"
                            className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                          />
                        </svg>
                      ) : (
                        /* LEFT SIDE BEND: Exits 2023 left, curves down and right into 2022 left */
                        <svg className="absolute left-[60px] top-1/2 bottom-[-8rem] w-[60px] h-[calc(100%+8rem)] pointer-events-none z-0 overflow-visible">
                          <path
                            d="M 60 0 H 36 A 36 36 0 0 0 0 36 V calc(100% - 36px) A 36 36 0 0 0 36 100% H 60"
                            fill="none"
                            stroke="#06b6d4"
                            strokeWidth="2.5"
                            className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                          />
                        </svg>
                      )}
                    </>
                  )}

                  {/* Year Headers (3 per row) */}
                  {rowItems.map((hist, itemIndex) => {
                    return (
                      <div
                        key={itemIndex}
                        className="w-[280px] text-center shrink-0 z-10 group"
                      >
                        <div className="inline-block bg-[#06060c] px-5 py-1 rounded-2xl z-20 shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                          <h6 className="text-4xl md:text-5xl font-black text-cyan-400 font-mono tracking-tight group-hover:text-white transition-colors drop-shadow-[0_0_8px_rgba(6,182,212,0.7)] leading-none">
                            {hist.year}
                          </h6>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* CARDS ROW (Positioned Directly Below Year Headers) */}
                <div
                  className={`flex justify-between items-start px-8 mt-4 ${
                    isEvenRow ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {rowItems.map((hist, itemIndex) => {
                    const globalIdx = rowIndex * chunkSize + itemIndex;
                    const voyageNum = history.length - globalIdx;

                    return (
                      <div
                        key={itemIndex}
                        className="w-[280px] shrink-0 group text-left"
                      >
                        <div className="bg-[#0c0c16]/90 backdrop-blur-xl border border-white/10 hover:border-cyan-400/60 p-5 rounded-3xl shadow-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_30px_rgba(6,182,212,0.2)]">
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
              </div>
            );
          })}
        </div>

        {/* END POINT FOOTER */}
        <div className="relative flex items-center gap-3 mt-12 pl-2">
          <div className="w-5 h-5 rounded-full bg-purple-500 border-4 border-[#06060c] drop-shadow-[0_0_10px_rgba(168,85,247,0.9)] z-10" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-white bg-purple-600 px-4 py-1.5 rounded-full drop-shadow-[0_0_10px_rgba(168,85,247,0.6)] font-mono z-10">
            CONTINUE · INAUGURAL 1998 VOYAGE 🏆
          </span>
        </div>
      </div>

      {/* ── MOBILE VERTICAL SNAKE TIMELINE (MD & BELOW) ── */}
      <div className="block lg:hidden relative max-w-lg mx-auto py-6 px-4">
        <div className="absolute left-6 top-4 bottom-4 w-[2.5px] bg-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.7)] pointer-events-none" />

        <div className="space-y-6 pl-10">
          {history.map((hist, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute left-[-26px] top-4 w-4 h-4 rounded-full bg-cyan-400 border-2 border-[#06060c] drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] group-hover:scale-125 transition-transform" />

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
