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
  return (
    <div className="border-t border-white/10 pt-16 mt-16 text-left">
      {/* Section Title */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400 block mb-1">
          25+ Years Legacy
        </span>
        <h3
          className="text-3xl md:text-5xl font-black uppercase italic text-white tracking-tight"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
          Cruising <span className="accent-gradient-text">History & Milestones</span>
        </h3>
        <p className="text-white/40 text-xs md:text-sm mt-2 leading-relaxed">
          Explore 7th Heaven&apos;s history at sea across Royal Caribbean, MSC, and celebrity voyages.
        </p>
      </div>

      {/* ── ALTERNATING ZIG-ZAG TIMELINE ── */}
      <div className="relative max-w-5xl mx-auto py-6">
        {/* Glowing Center Vertical Axis Line */}
        <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-[2px] -translate-x-1/2 bg-gradient-to-b from-cyan-400 via-purple-500/40 to-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.5)] pointer-events-none" />

        <div className="space-y-8 md:space-y-12">
          {history.map((hist, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={idx}
                className={`flex flex-col md:flex-row items-center ${
                  isEven ? 'md:flex-row-reverse' : ''
                } gap-4 md:gap-8 group`}
              >
                {/* Card Content */}
                <div className="w-full md:w-1/2 px-2">
                  <div className="bg-[#0b0b14]/90 backdrop-blur-xl border border-white/10 hover:border-cyan-400/60 p-6 md:p-7 rounded-3xl shadow-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />

                    <div className="flex items-center justify-between gap-4 mb-3">
                      <span className="text-sm font-black text-cyan-400 font-mono bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30 inline-block shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                        {hist.year}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/30 font-mono">
                        Voyage #{history.length - idx}
                      </span>
                    </div>

                    <h4 className="text-base md:text-lg font-black text-white uppercase tracking-tight group-hover:text-cyan-300 transition-colors">
                      {hist.ship}
                    </h4>
                    <p className="text-xs md:text-sm text-white/60 mt-2 leading-relaxed font-sans">
                      {hist.details}
                    </p>
                  </div>
                </div>

                {/* Center Node Icon Badge */}
                <div className="shrink-0 w-10 h-10 rounded-full bg-cyan-500 text-black font-black text-sm flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.8)] z-10 border-2 border-[#050508] group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                  ⚡
                </div>

                {/* Empty Spacer Column for Desktop Grid Alignment */}
                <div className="w-full md:w-1/2 hidden md:block" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
