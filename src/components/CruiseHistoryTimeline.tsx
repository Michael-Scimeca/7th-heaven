'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

export type HistoryItem = {
  year: string;
  ship: string;
  details: string;
};

type Props = {
  history: HistoryItem[];
};

export default function CruiseHistoryTimeline({ history }: Props) {
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);

  const [desktopProgress, setDesktopProgress] = useState(0);
  const [mobileProgress, setMobileProgress] = useState(0);

  // Chunk history items into 3 items per row for desktop
  const rows: HistoryItem[][] = [];
  const chunkSize = 3;
  for (let i = 0; i < history.length; i += chunkSize) {
    rows.push(history.slice(i, i + chunkSize));
  }

  // Hook up Lenis Smooth Scroll & GSAP ScrollTrigger scrub
  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis smooth scroll instance
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // Desktop Lenis + GSAP ScrollTrigger
      if (desktopContainerRef.current) {
        ScrollTrigger.create({
          trigger: desktopContainerRef.current,
          start: 'top 70%',
          end: 'bottom 80%',
          scrub: 0.5,
          onUpdate: (self) => {
            setDesktopProgress(self.progress);
          },
        });
      }

      // Mobile Lenis + GSAP ScrollTrigger
      if (mobileContainerRef.current) {
        ScrollTrigger.create({
          trigger: mobileContainerRef.current,
          start: 'top 70%',
          end: 'bottom 80%',
          scrub: 0.5,
          onUpdate: (self) => {
            setMobileProgress(self.progress);
          },
        });
      }
    });

    return () => {
      ctx.revert();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="border-t border-white/10 pt-16 mt-16 text-left">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 block mb-1">
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
      <div
        ref={desktopContainerRef}
        className="hidden lg:block max-w-6xl mx-auto py-8 px-16 relative"
      >
        {/* START POINT HEADER (Top-Left Corner Entry) */}
        <div className="relative pl-2 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-cyan-400 border-4 border-[#06060c] z-10" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-black bg-cyan-400 px-4 py-1.5 rounded-full font-mono z-10">
              START · LATEST VOYAGES
            </span>
          </div>

          {/* Smooth Curve connecting START badge down into left-[60px] of 2028 (100% flush!) */}
          <div className="absolute left-[17.5px] top-[10px] bottom-[-4.55rem] w-[42.5px] border-l-[3px] border-b-[3px] border-cyan-400 rounded-bl-[20px] pointer-events-none z-0" />
        </div>

        {/* TIMELINE ROWS CONTAINER */}
        <div className="flex flex-col">
          {rows.map((rowItems, rowIndex) => {
            const isEvenRow = rowIndex % 2 === 0;
            const isLastRow = rowIndex === rows.length - 1;

            return (
              <div key={rowIndex} className="relative mb-24 last:mb-0">
                {/* 100% Perfect Continuous Side Bends with zero step/jump */}
                {!isLastRow && (
                  <>
                    {isEvenRow ? (
                      /* RIGHT SIDE BEND: Exits 2026 right, curves 52px out to right-[8px], drops, and curves back to 2025 right */
                      <div className="absolute right-[8px] top-[24px] bottom-[-7.55rem] w-[52px] border-r-[3px] border-t-[3px] border-b-[3px] border-cyan-400 rounded-tr-[44px] rounded-br-[44px] pointer-events-none z-0" />
                    ) : (
                      /* LEFT SIDE BEND: Exits 2023 left, curves 52px out to left-[8px], drops, and curves back to 2022 left */
                      <div className="absolute left-[8px] top-[24px] bottom-[-7.55rem] w-[52px] border-l-[3px] border-t-[3px] border-b-[3px] border-cyan-400 rounded-tl-[44px] rounded-bl-[44px] pointer-events-none z-0" />
                    )}
                  </>
                )}

                {/* YEAR HEADERS & HORIZONTAL LINE ROW (100% Dead-Center through Year Badges) */}
                <div
                  className={`relative flex justify-between items-center px-8 h-12 ${
                    isEvenRow ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {/* Horizontal Pipeline Line (100% Dead-Center behind every year badge) */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-[60px] right-[60px] h-[3px] bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 pointer-events-none z-0" />

                  {/* Year Headers (3 per row) */}
                  {rowItems.map((hist, itemIndex) => {
                    const globalIdx = rowIndex * chunkSize + itemIndex;
                    const itemProgressTrigger = (globalIdx + 0.5) / history.length;
                    const isReached = desktopProgress >= itemProgressTrigger;

                    return (
                      <div
                        key={itemIndex}
                        className="w-[280px] text-center shrink-0 z-10 group"
                      >
                        <div
                          className={`inline-block px-5 py-1 rounded-2xl z-20 shadow-[0_0_15px_rgba(0,0,0,0.8)] transition-all duration-300 ${
                            isReached
                              ? 'bg-[#06060c] border border-cyan-400/80 scale-105'
                              : 'bg-[#06060c] border border-white/10'
                          }`}
                        >
                          <h6
                            className={`text-4xl md:text-5xl font-black font-mono tracking-tight transition-colors leading-none ${
                              isReached ? 'text-cyan-300' : 'text-white/40'
                            }`}
                          >
                            {hist.year}
                          </h6>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* CARDS ROW */}
                <div
                  className={`flex justify-between items-start px-8 mt-4 ${
                    isEvenRow ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {rowItems.map((hist, itemIndex) => {
                    const globalIdx = rowIndex * chunkSize + itemIndex;
                    const voyageNum = history.length - globalIdx;
                    const itemProgressTrigger = (globalIdx + 0.5) / history.length;
                    const isReached = desktopProgress >= itemProgressTrigger;

                    return (
                      <div
                        key={itemIndex}
                        className="w-[280px] shrink-0 group text-left"
                      >
                        <div
                          className={`bg-[#0c0c16]/90 backdrop-blur-xl p-5 rounded-3xl shadow-2xl transition-all duration-300 ${
                            isReached
                              ? 'border border-cyan-400/60 -translate-y-1'
                              : 'border border-white/10 opacity-70'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`text-[10px] font-black uppercase tracking-widest font-mono px-2.5 py-0.5 rounded transition-colors ${
                                isReached
                                  ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-500/40'
                                  : 'text-white/40 bg-white/5 border border-white/10'
                              }`}
                            >
                              VOYAGE #{voyageNum}
                            </span>
                            <span className="text-xs">🚢</span>
                          </div>

                          <h4
                            className={`text-sm font-black uppercase leading-snug transition-colors ${
                              isReached ? 'text-white' : 'text-white/60'
                            }`}
                          >
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
      </div>

      {/* ── MOBILE VERTICAL SNAKE TIMELINE (MD & BELOW) ── */}
      <div
        ref={mobileContainerRef}
        className="block lg:hidden relative max-w-lg mx-auto py-6 px-4"
      >
        <div className="absolute left-6 top-4 bottom-4 w-[3px] bg-cyan-400 pointer-events-none z-0" />

        <div className="space-y-6 pl-10">
          {history.map((hist, idx) => {
            const isReached = mobileProgress >= (idx + 0.5) / history.length;

            return (
              <div key={idx} className="relative group">
                <div
                  className={`absolute left-[-26px] top-4 w-4 h-4 rounded-full border-2 border-[#06060c] transition-all duration-300 ${
                    isReached ? 'bg-cyan-300 scale-125' : 'bg-cyan-500/30'
                  }`}
                />

                <div
                  className={`bg-[#0c0c16]/90 backdrop-blur-xl p-5 rounded-2xl shadow-xl transition-all duration-300 ${
                    isReached ? 'border border-cyan-400/60' : 'border border-white/10 opacity-70'
                  }`}
                >
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
