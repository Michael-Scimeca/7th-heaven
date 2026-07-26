'use client';

import React, { useEffect, useRef, useState } from 'react';

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
  const desktopPathRef = useRef<SVGPathElement>(null);
  
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const mobilePathRef = useRef<SVGPathElement>(null);

  const [desktopProgress, setDesktopProgress] = useState(0);
  const [desktopPathLength, setDesktopPathLength] = useState(0);

  const [mobileProgress, setMobileProgress] = useState(0);
  const [mobilePathLength, setMobilePathLength] = useState(0);

  // Chunk history items into 3 items per row for desktop
  const rows: HistoryItem[][] = [];
  const chunkSize = 3;
  for (let i = 0; i < history.length; i += chunkSize) {
    rows.push(history.slice(i, i + chunkSize));
  }

  // Calculate SVG path lengths & update scroll progress dynamically
  useEffect(() => {
    if (desktopPathRef.current) {
      setDesktopPathLength(desktopPathRef.current.getTotalLength());
    }
    if (mobilePathRef.current) {
      setMobilePathLength(mobilePathRef.current.getTotalLength());
    }

    const handleScroll = () => {
      const windowHeight = window.innerHeight;

      // Desktop Scroll Calculation
      if (desktopContainerRef.current) {
        const rect = desktopContainerRef.current.getBoundingClientRect();
        const startY = rect.top;
        const totalHeight = rect.height - windowHeight * 0.3;
        if (totalHeight > 0) {
          const current = windowHeight * 0.7 - startY;
          setDesktopProgress(Math.max(0, Math.min(1, current / totalHeight)));
        }
      }

      // Mobile Scroll Calculation
      if (mobileContainerRef.current) {
        const rect = mobileContainerRef.current.getBoundingClientRect();
        const startY = rect.top;
        const totalHeight = rect.height - windowHeight * 0.3;
        if (totalHeight > 0) {
          const current = windowHeight * 0.7 - startY;
          setMobileProgress(Math.max(0, Math.min(1, current / totalHeight)));
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Single Continuous Desktop Serpentine SVG Path (viewBox 0 0 1000 1800)
  const serpentinePathD = `
    M 20 10
    V 40
    A 20 20 0 0 0 40 60
    H 940
    A 40 40 0 0 1 980 100
    V 260
    A 40 40 0 0 1 940 300
    H 60
    A 40 40 0 0 0 20 340
    V 500
    A 40 40 0 0 0 60 540
    H 940
    A 40 40 0 0 1 980 580
    V 740
    A 40 40 0 0 1 940 780
    H 60
    A 40 40 0 0 0 20 820
    V 980
    A 40 40 0 0 0 60 1020
    H 940
    A 40 40 0 0 1 980 1060
    V 1220
    A 40 40 0 0 1 940 1260
    H 60
    A 40 40 0 0 0 20 1300
    V 1460
    A 40 40 0 0 0 60 1500
    H 940
    A 40 40 0 0 1 980 1540
    V 1700
    A 40 40 0 0 1 940 1740
    H 60
  `.replace(/\s+/g, ' ').trim();

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
        {/* SINGLE CONTINUOUS ANIMATED SVG SERPENTINE PATHWAY */}
        <svg
          viewBox="0 0 1000 1800"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
        >
          {/* 1. Subtle Muted Track Path (Always Visible Outline) */}
          <path
            d={serpentinePathD}
            fill="none"
            stroke="rgba(6, 182, 212, 0.15)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 2. Interactive Scroll-Animated Glowing Cyan Line */}
          <path
            ref={desktopPathRef}
            d={serpentinePathD}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: desktopPathLength || 10000,
              strokeDashoffset: desktopPathLength
                ? desktopPathLength * (1 - desktopProgress)
                : 10000,
              filter: 'drop-shadow(0 0 10px rgba(6, 182, 212, 0.9))',
              transition: 'stroke-dashoffset 0.1s linear',
            }}
          />
        </svg>
        
        {/* START POINT HEADER */}
        <div className="relative pl-2 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-cyan-400 border-4 border-[#06060c] drop-shadow-[0_0_10px_rgba(6,182,212,0.9)] animate-pulse z-10" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-black bg-cyan-400 px-4 py-1.5 rounded-full drop-shadow-[0_0_10px_rgba(6,182,212,0.6)] font-mono z-10">
              START · LATEST VOYAGES
            </span>
          </div>
        </div>

        {/* TIMELINE ROWS CONTAINER */}
        <div className="flex flex-col">
          {rows.map((rowItems, rowIndex) => {
            const isEvenRow = rowIndex % 2 === 0;

            return (
              <div key={rowIndex} className="relative mb-24 last:mb-0">
                {/* YEAR HEADERS ROW */}
                <div
                  className={`relative flex justify-between items-center px-8 h-12 ${
                    isEvenRow ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
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

                {/* CARDS ROW */}
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
      <div
        ref={mobileContainerRef}
        className="block lg:hidden relative max-w-lg mx-auto py-6 px-4"
      >
        <svg className="absolute left-6 top-4 bottom-4 w-[4px] h-[calc(100%-2rem)] pointer-events-none z-0">
          <path
            d="M 2 0 V 1000"
            fill="none"
            stroke="rgba(6, 182, 212, 0.15)"
            strokeWidth="3"
          />
          <path
            ref={mobilePathRef}
            d="M 2 0 V 1000"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3.5"
            style={{
              strokeDasharray: mobilePathLength || 1000,
              strokeDashoffset: mobilePathLength
                ? mobilePathLength * (1 - mobileProgress)
                : 1000,
              filter: 'drop-shadow(0 0 8px rgba(6,182,212,0.9))',
              transition: 'stroke-dashoffset 0.1s linear',
            }}
          />
        </svg>

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
