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
  const startDotRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const mobilePathRef = useRef<SVGPathElement>(null);

  const [desktopProgress, setDesktopProgress] = useState(0);
  const [desktopPathLength, setDesktopPathLength] = useState(0);

  const [mobileProgress, setMobileProgress] = useState(0);
  const [mobilePathLength, setMobilePathLength] = useState(0);

  const [pathD, setPathD] = useState('');
  const [svgSize, setSvgSize] = useState({ w: 1400, h: 2000 });

  // Reverse history so timeline starts at 1998 (Inaugural Voyage) and proceeds chronologically to 2028
  const chronologicalHistory = [...history].reverse();

  // Chunk history items into 3 items per row for desktop
  const rows: HistoryItem[][] = [];
  const chunkSize = 3;
  for (let i = 0; i < chronologicalHistory.length; i += chunkSize) {
    rows.push(chronologicalHistory.slice(i, i + chunkSize));
  }

  // Calculate single continuous SVG path string dynamically from real DOM positions (Matching Nav Width: max-w-[1400px])
  useEffect(() => {
    const updatePathGeometry = () => {
      if (!desktopContainerRef.current) return;
      const containerRect = desktopContainerRef.current.getBoundingClientRect();
      const w = containerRect.width;
      const h = containerRect.height;
      setSvgSize({ w, h });

      // Measure exact Y-center for each row's year header
      const rowCenters: number[] = [];
      rowRefs.current.forEach((rowEl) => {
        if (rowEl) {
          const headerEl = rowEl.querySelector('[data-year-header-row]');
          if (headerEl) {
            const rect = headerEl.getBoundingClientRect();
            const yCenter = rect.top - containerRect.top + rect.height / 2;
            rowCenters.push(yCenter);
          }
        }
      });

      if (rowCenters.length === 0) return;

      // Measure START dot position (Top Left)
      let startX = 24;
      let startY = 20;
      if (startDotRef.current) {
        const dotRect = startDotRef.current.getBoundingClientRect();
        startX = dotRect.left - containerRect.left + dotRect.width / 2;
        startY = dotRect.top - containerRect.top + dotRect.height / 2;
      }

      const outerRight = w - 16;
      const outerLeft = 16;
      const r = 44; // Corner radius matching expanded layout perfectly

      // Build single continuous SVG path string starting from top-left corner
      let d = `M ${startX} ${startY} V ${rowCenters[0] - r} A ${r} ${r} 0 0 0 ${startX + r} ${rowCenters[0]} H ${outerRight - r}`;

      for (let i = 0; i < rowCenters.length - 1; i++) {
        const yCurr = rowCenters[i];
        const yNext = rowCenters[i + 1];
        const isEven = i % 2 === 0;

        if (isEven) {
          // Right bend from Row i to Row i+1
          d += ` A ${r} ${r} 0 0 1 ${outerRight} ${yCurr + r} V ${yNext - r} A ${r} ${r} 0 0 1 ${outerRight - r} ${yNext} H ${outerLeft + r}`;
        } else {
          // Left bend from Row i to Row i+1
          d += ` A ${r} ${r} 0 0 0 ${outerLeft} ${yCurr + r} V ${yNext - r} A ${r} ${r} 0 0 0 ${outerLeft + r} ${yNext} H ${outerRight - r}`;
        }
      }

      setPathD(d);
    };

    updatePathGeometry();
    window.addEventListener('resize', updatePathGeometry);
    return () => window.removeEventListener('resize', updatePathGeometry);
  }, [rows.length]);

  // Measure path length whenever pathD updates
  useEffect(() => {
    if (desktopPathRef.current && pathD) {
      setDesktopPathLength(desktopPathRef.current.getTotalLength());
    }
    if (mobilePathRef.current) {
      setMobilePathLength(mobilePathRef.current.getTotalLength());
    }
  }, [pathD]);

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

  const activeVoyageIndex = Math.min(
    Math.floor(desktopProgress * chronologicalHistory.length) + 1,
    chronologicalHistory.length
  );
  const progressPercent = Math.round(desktopProgress * 100);

  return (
    <div className="border-t border-white/10 pt-16 mt-16 text-left">
      {/* Section Header */}
      <div className="text-center max-w-4xl mx-auto mb-16 px-4">
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

      {/* ── DESKTOP CODEPEN SERPENTINE SNAKE TIMELINE (MATCHING NAVBAR WIDTH: max-w-[1400px]) ── */}
      <div
        ref={desktopContainerRef}
        className="hidden lg:block w-full max-w-[1400px] mx-auto py-8 px-8 lg:px-12 relative"
      >
        {/* ONE SINGLE CONTINUOUS DYNAMIC SVG PATHWAY WITH WATER WAVE MOTION */}
        {pathD && (
          <svg
            viewBox={`0 0 ${svgSize.w} ${svgSize.h}`}
            className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
          >
            <defs>
              {/* Crisp Solid Ocean Cyan Gradient */}
              <linearGradient id="ocean-water-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f2fe" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>

              {/* SVG Animated Fluid Water Wave Turbulence Filter */}
              <filter id="water-wave-motion" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="2" result="noise">
                  <animate
                    attributeName="baseFrequency"
                    values="0.02 0.05; 0.03 0.08; 0.02 0.05"
                    dur="6s"
                    repeatCount="indefinite"
                  />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>

            {/* 1. Muted Background Track Path */}
            <path
              d={pathD}
              fill="none"
              stroke="rgba(6, 182, 212, 0.15)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 2. Lenis + GSAP ScrollTrigger Scrub Main Liquid Ocean Water Line Filler */}
            <path
              ref={desktopPathRef}
              d={pathD}
              fill="none"
              stroke="url(#ocean-water-gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: desktopPathLength || 10000,
                strokeDashoffset: desktopPathLength || 10000,
                filter: 'url(#water-wave-motion)',
              }}
            />
          </svg>
        )}
        
        {/* START POINT HEADER (Top-Left Corner) */}
        <div className="relative pl-2 mb-12">
          <div className="flex items-center gap-3">
            <div
              ref={startDotRef}
              className="w-5 h-5 rounded-full bg-cyan-400 border-4 border-[#06060c] z-10 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
            />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-black bg-cyan-400 px-4 py-1.5 rounded-full font-mono z-10 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              START · INAUGURAL 1998 VOYAGE
            </span>
          </div>
        </div>

        {/* TIMELINE ROWS CONTAINER */}
        <div className="flex flex-col">
          {rows.map((rowItems, rowIndex) => {
            const isEvenRow = rowIndex % 2 === 0;

            return (
              <div
                key={rowIndex}
                ref={(el) => { rowRefs.current[rowIndex] = el; }}
                className="relative mb-24 last:mb-0"
              >
                {/* YEAR HEADERS ROW */}
                <div
                  data-year-header-row
                  className={`relative flex justify-between items-center px-6 h-12 ${
                    isEvenRow ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {rowItems.map((hist, itemIndex) => {
                    const globalIdx = rowIndex * chunkSize + itemIndex;
                    const itemProgressTrigger = (globalIdx + 0.5) / chronologicalHistory.length;
                    const isReached = desktopProgress >= itemProgressTrigger;

                    return (
                      <div
                        key={itemIndex}
                        className="w-[340px] xl:w-[380px] text-center shrink-0 z-10 group"
                      >
                        <div
                          className={`inline-block px-6 py-1.5 rounded-2xl z-20 transition-all duration-300 ${
                            isReached
                              ? 'bg-[#06060c] border border-cyan-400/90 scale-110 shadow-[0_0_25px_rgba(6,182,212,0.6)]'
                              : 'bg-[#06060c] border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.8)]'
                          }`}
                        >
                          <h6
                            className={`text-4xl md:text-5xl font-black font-mono tracking-tight transition-colors leading-none ${
                              isReached ? 'text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'text-white/40'
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
                  className={`flex justify-between items-start px-6 mt-4 ${
                    isEvenRow ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {rowItems.map((hist, itemIndex) => {
                    const globalIdx = rowIndex * chunkSize + itemIndex;
                    const voyageNum = globalIdx + 1;
                    const itemProgressTrigger = (globalIdx + 0.5) / chronologicalHistory.length;
                    const isReached = desktopProgress >= itemProgressTrigger;

                    return (
                      <div
                        key={itemIndex}
                        className="w-[340px] xl:w-[380px] shrink-0 group text-left"
                      >
                        <div
                          className={`bg-[#0c0c16]/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl transition-all duration-300 ${
                            isReached
                              ? 'border border-cyan-400/70 -translate-y-1 shadow-[0_10px_30px_rgba(6,182,212,0.25)]'
                              : 'border border-white/10 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`text-[10px] font-black uppercase tracking-widest font-mono px-3 py-0.5 rounded transition-colors ${
                                isReached
                                  ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                                  : 'text-white/40 bg-white/5 border border-white/10'
                              }`}
                            >
                              VOYAGE #{voyageNum}
                            </span>
                            <span className="text-sm">🚢</span>
                          </div>

                          <h4
                            className={`text-base font-black uppercase leading-snug transition-colors ${
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
              filter: 'url(#water-wave-motion)',
            }}
          />
        </svg>

        <div className="space-y-6 pl-10">
          {chronologicalHistory.map((hist, idx) => {
            const isReached = mobileProgress >= (idx + 0.5) / chronologicalHistory.length;

            return (
              <div key={idx} className="relative group">
                <div
                  className={`absolute left-[-26px] top-4 w-4 h-4 rounded-full border-2 border-[#06060c] transition-all duration-300 ${
                    isReached ? 'bg-cyan-300 scale-125 shadow-[0_0_12px_rgba(6,182,212,0.8)]' : 'bg-cyan-500/30'
                  }`}
                />

                <div
                  className={`bg-[#0c0c16]/90 backdrop-blur-xl p-5 rounded-2xl shadow-xl transition-all duration-300 ${
                    isReached ? 'border border-cyan-400/60 shadow-[0_5px_20px_rgba(6,182,212,0.2)]' : 'border border-white/10 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-lg font-black text-cyan-400 font-mono">
                      {hist.year}
                    </span>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/30 font-mono">
                      VOYAGE #{idx + 1}
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
