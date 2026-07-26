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

  // Measure path length on mount
  useEffect(() => {
    if (desktopPathRef.current) {
      setDesktopPathLength(desktopPathRef.current.getTotalLength());
    }
    if (mobilePathRef.current) {
      setMobilePathLength(mobilePathRef.current.getTotalLength());
    }
  }, []);

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
      // Desktop Lenis + GSAP ScrollTrigger Scrub
      if (desktopPathRef.current && desktopPathLength > 0) {
        gsap.fromTo(
          desktopPathRef.current,
          { strokeDashoffset: desktopPathLength },
          {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: desktopContainerRef.current,
              start: 'top 70%',
              end: 'bottom 80%',
              scrub: 0.5,
              onUpdate: (self) => {
                setDesktopProgress(self.progress);
              },
            },
          }
        );
      }

      // Mobile Lenis + GSAP ScrollTrigger Scrub
      if (mobilePathRef.current && mobilePathLength > 0) {
        gsap.fromTo(
          mobilePathRef.current,
          { strokeDashoffset: mobilePathLength },
          {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: mobileContainerRef.current,
              start: 'top 70%',
              end: 'bottom 80%',
              scrub: 0.5,
              onUpdate: (self) => {
                setMobileProgress(self.progress);
              },
            },
          }
        );
      }
    });

    return () => {
      ctx.revert();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [desktopPathLength, mobilePathLength]);

  // Single Continuous Desktop Serpentine SVG Path passing 100% DIRECTLY THROUGH the center of Year Headers in every row
  // viewBox: 0 0 1000 2300 (Step = 284px per row)
  // Row 0 Y = 105, Row 1 Y = 389, Row 2 Y = 673, Row 3 Y = 957, Row 4 Y = 1241, Row 5 Y = 1525, Row 6 Y = 1809, Row 7 Y = 2093
  const serpentinePathD = `
    M 20 10
    V 60
    A 45 45 0 0 0 65 105
    H 935
    A 45 45 0 0 1 980 150
    V 344
    A 45 45 0 0 1 935 389
    H 65
    A 45 45 0 0 0 20 434
    V 628
    A 45 45 0 0 0 65 673
    H 935
    A 45 45 0 0 1 980 718
    V 912
    A 45 45 0 0 1 935 957
    H 65
    A 45 45 0 0 0 20 1002
    V 1196
    A 45 45 0 0 0 65 1241
    H 935
    A 45 45 0 0 1 980 1286
    V 1480
    A 45 45 0 0 1 935 1525
    H 65
    A 45 45 0 0 0 20 1570
    V 1764
    A 45 45 0 0 0 65 1809
    H 935
    A 45 45 0 0 1 980 1854
    V 2048
    A 45 45 0 0 1 935 2093
    H 65
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
        {/* SINGLE CONTINUOUS SOLID CLEAN SVG PATHWAY */}
        <svg
          viewBox="0 0 1000 2300"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
        >
          <defs>
            {/* Crisp Solid Ocean Cyan Gradient */}
            <linearGradient id="ocean-water-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>

          {/* 1. Muted Background Track Path */}
          <path
            d={serpentinePathD}
            fill="none"
            stroke="rgba(6, 182, 212, 0.15)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 2. Solid Crisp Clean Main Cyan Line Filler (No Outer Glow Blur) */}
          <path
            ref={desktopPathRef}
            d={serpentinePathD}
            fill="none"
            stroke="url(#ocean-water-gradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: desktopPathLength || 10000,
              strokeDashoffset: desktopPathLength || 10000,
            }}
          />
        </svg>
        
        {/* START POINT HEADER */}
        <div className="relative pl-2 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-cyan-400 border-4 border-[#06060c] z-10" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-black bg-cyan-400 px-4 py-1.5 rounded-full font-mono z-10">
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
                              isReached
                                ? 'text-cyan-300'
                                : 'text-white/40'
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
            stroke="url(#ocean-water-gradient)"
            strokeWidth="3.5"
            style={{
              strokeDasharray: mobilePathLength || 1000,
              strokeDashoffset: mobilePathLength || 1000,
            }}
          />
        </svg>

        <div className="space-y-6 pl-10">
          {history.map((hist, idx) => {
            const isReached = mobileProgress >= (idx + 0.5) / history.length;

            return (
              <div key={idx} className="relative group">
                <div
                  className={`absolute left-[-26px] top-4 w-4 h-4 rounded-full border-2 border-[#06060c] transition-all duration-300 ${
                    isReached
                      ? 'bg-cyan-300 scale-125'
                      : 'bg-cyan-500/30'
                  }`}
                />

                <div
                  className={`bg-[#0c0c16]/90 backdrop-blur-xl p-5 rounded-2xl shadow-xl transition-all duration-300 ${
                    isReached
                      ? 'border border-cyan-400/60'
                      : 'border border-white/10 opacity-70'
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
