'use client';

import React, { useState } from 'react';

export type HistoryItem = {
  year: string;
  ship: string;
  details: string;
};

type Props = {
  history: HistoryItem[];
};

type LayoutMode = 'vertical-line' | 'zigzag' | 'horizontal-carousel' | 'grid-matrix' | 'spotlight-stepper' | 'nautical-logbook';

const LAYOUT_OPTIONS: { id: LayoutMode; label: string; icon: string }[] = [
  { id: 'vertical-line', label: 'Vertical Line', icon: '📍' },
  { id: 'zigzag', label: 'Alternating Zig-Zag', icon: '⚡' },
  { id: 'horizontal-carousel', label: 'Horizontal Cards', icon: '↔️' },
  { id: 'grid-matrix', label: 'Grid Matrix', icon: '🔳' },
  { id: 'spotlight-stepper', label: 'Spotlight Stepper', icon: '⭐' },
  { id: 'nautical-logbook', label: 'Logbook List', icon: '⚓' },
];

export default function CruiseHistoryTimeline({ history }: Props) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('zigzag');
  const [activeStepIdx, setActiveStepIdx] = useState(0);

  return (
    <div className="border-t border-white/10 pt-16 mt-16 text-left">
      {/* Title & Layout Switcher Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 text-center md:text-left">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400 block mb-1">
            25+ Years Legacy
          </span>
          <h3
            className="text-3xl md:text-4xl font-black uppercase italic text-white tracking-tight"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            Cruising <span className="accent-gradient-text">History & Milestones</span>
          </h3>
          <p className="text-white/40 text-xs mt-1">
            Explore 7th Heaven&apos;s history at sea across Royal Caribbean, MSC, and celebrity voyages.
          </p>
        </div>

        {/* 6-Layout Mode Selector */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 bg-[#080810] p-2 rounded-2xl border border-white/10 shrink-0 shadow-2xl">
          {LAYOUT_OPTIONS.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setLayoutMode(opt.id)}
              className={`px-3 py-1.5 rounded-xl text-2xs font-extrabold uppercase tracking-wider transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                layoutMode === opt.id
                  ? 'bg-cyan-500 text-black font-black shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-[1.03]'
                  : 'text-white/40 hover:text-white hover:bg-white/5 bg-transparent'
              }`}
            >
              <span>{opt.icon}</span>
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── LAYOUT 1: VERTICAL LINE ── */}
      {layoutMode === 'vertical-line' && (
        <div className="relative max-w-4xl mx-auto pl-6 border-l border-cyan-500/20 space-y-8 animate-in fade-in duration-300">
          <div className="absolute top-0 bottom-0 left-[23px] w-[1px] bg-gradient-to-b from-cyan-500 to-transparent pointer-events-none" />
          {history.map((hist, idx) => (
            <div key={idx} className="relative pl-6 group">
              <div className="absolute left-[-31px] top-1.5 w-4 h-4 rounded-full border-2 border-[#050508] bg-cyan-400 z-10 shadow-[0_0_12px_rgba(6,182,212,0.8)] group-hover:scale-125 transition-transform" />
              <span className="text-xs font-black text-cyan-400 block font-mono">{hist.year}</span>
              <h4 className="text-base font-extrabold text-white uppercase mt-0.5 group-hover:text-cyan-300 transition-colors">
                {hist.ship}
              </h4>
              <p className="text-xs text-white/50 mt-1 leading-normal">{hist.details}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 2: ALTERNATING ZIG-ZAG ── */}
      {layoutMode === 'zigzag' && (
        <div className="relative max-w-5xl mx-auto py-6 animate-in fade-in duration-300">
          {/* Vertical axis line */}
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

                  {/* Center Node Anchor Badge */}
                  <div className="shrink-0 w-10 h-10 rounded-full bg-cyan-500 text-black font-black text-sm flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.8)] z-10 border-2 border-[#050508] group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                    ⚡
                  </div>

                  {/* Empty Spacer Column for Desktop Grid Balancing */}
                  <div className="w-full md:w-1/2 hidden md:block" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LAYOUT 3: HORIZONTAL CAROUSEL ── */}
      {layoutMode === 'horizontal-carousel' && (
        <div className="overflow-x-auto pb-6 pt-2 animate-in fade-in duration-300 no-scrollbar">
          <div className="flex gap-5 min-w-max">
            {history.map((hist, idx) => (
              <div
                key={idx}
                className="w-72 bg-[#0a0a14] border border-white/10 hover:border-cyan-400/50 p-6 rounded-3xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-black text-cyan-400 font-mono px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20">
                      {hist.year}
                    </span>
                    <span className="text-white/20 text-xs font-bold">#{history.length - idx}</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white uppercase line-clamp-2">{hist.ship}</h4>
                  <p className="text-xs text-white/45 mt-3 leading-relaxed">{hist.details}</p>
                </div>
                <div className="mt-6 pt-3 border-t border-white/5 text-[10px] font-bold uppercase text-white/30 tracking-wider">
                  Official Voyage Milestone
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── LAYOUT 4: GRID MATRIX ── */}
      {layoutMode === 'grid-matrix' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {history.map((hist, idx) => (
            <div
              key={idx}
              className="bg-[#0b0b14] border border-white/10 hover:border-cyan-400/40 p-6 rounded-3xl flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-mono">
                    {hist.year}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    Cruise #{history.length - idx}
                  </span>
                </div>
                <h4 className="text-base font-black text-white uppercase">{hist.ship}</h4>
                <p className="text-xs text-white/50 mt-2 leading-relaxed">{hist.details}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── LAYOUT 5: SPOTLIGHT STEPPER ── */}
      {layoutMode === 'spotlight-stepper' && (
        <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
          {/* Stepper Buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            {history.map((hist, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveStepIdx(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase font-mono transition-all cursor-pointer ${
                  activeStepIdx === idx
                    ? 'bg-cyan-500 text-black font-black shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-105'
                    : 'bg-white/5 text-white/50 border border-white/10 hover:text-white'
                }`}
              >
                {hist.year}
              </button>
            ))}
          </div>

          {/* Active Spotlight Card */}
          {history[activeStepIdx] && (
            <div className="bg-[#0a0a14] border-2 border-cyan-400/60 p-8 md:p-10 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />
              <span className="text-xs font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30 inline-block mb-3">
                Milestone Year: {history[activeStepIdx].year}
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                {history[activeStepIdx].ship}
              </h3>
              <p className="text-white/70 text-sm md:text-base leading-relaxed mt-4">
                {history[activeStepIdx].details}
              </p>
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/10 text-xs font-bold text-white/40 uppercase">
                <span>Voyage #{history.length - activeStepIdx} of 7th Heaven Cruise History</span>
                <span className="text-cyan-400">Official Group Cruise</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── LAYOUT 6: NAUTICAL LOGBOOK LIST ── */}
      {layoutMode === 'nautical-logbook' && (
        <div className="space-y-3 max-w-4xl mx-auto animate-in fade-in duration-300">
          {history.map((hist, idx) => (
            <div
              key={idx}
              className="bg-[#090912] border border-white/10 hover:border-cyan-400/40 p-4 md:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:bg-white/[0.02]"
            >
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-black text-sm flex items-center justify-center shrink-0">
                  {hist.year}
                </span>
                <div>
                  <h4 className="text-sm md:text-base font-black text-white uppercase">{hist.ship}</h4>
                  <p className="text-xs text-white/50 mt-0.5">{hist.details}</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase text-cyan-400/80 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 shrink-0 self-start md:self-auto">
                Log Entry #{history.length - idx}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
