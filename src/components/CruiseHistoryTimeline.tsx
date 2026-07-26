'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import type * as THREE from 'three';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

function TopDownHistoryShip({ shipScaleRef }: { shipScaleRef: React.RefObject<number> }) {
  const { scene } = useGLTF('/objects/ship.glb');
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      const s = shipScaleRef.current ?? 1.0;
      groupRef.current.rotation.set(0, 0, 0);
      groupRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} position={[0, 0, 0]} />
    </group>
  );
}

export type HistoryTuningConfig = {
  startScale: number;
  growthPerYear: number;
  scrollStartMul: number;
  scrollEndMul: number;
  bowOffsetPx: number;
  lineWidth: number;
  lineColor: string;
};

export const DEFAULT_HISTORY_TUNING: HistoryTuningConfig = {
  startScale: 0.70,
  growthPerYear: 0.115,
  scrollStartMul: 0.70,
  scrollEndMul: 0.80,
  bowOffsetPx: 70,
  lineWidth: 6,
  lineColor: '#06b6d4',
};

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
  const shipDivRef = useRef<HTMLDivElement>(null);
  const shipScaleRef = useRef(1.0);
  const lastAngleRef = useRef(0);
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

  const [tuning, setTuning] = useState<HistoryTuningConfig>(DEFAULT_HISTORY_TUNING);
  const [showSettings, setShowSettings] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedStr = localStorage.getItem('7h_history_tuning');
      if (savedStr) {
        setTuning({ ...DEFAULT_HISTORY_TUNING, ...JSON.parse(savedStr) });
      }
    } catch {}
  }, []);

  const handleSaveTuning = () => {
    try {
      localStorage.setItem('7h_history_tuning', JSON.stringify(tuning));
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch {}
  };

  const handleResetTuning = () => {
    setTuning(DEFAULT_HISTORY_TUNING);
    try {
      localStorage.removeItem('7h_history_tuning');
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch {}
  };

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

  // Hook up GSAP ScrollTrigger scrub
  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const startPct = (tuning.scrollStartMul * 100).toFixed(0);
    const endPct = (tuning.scrollEndMul * 100).toFixed(0);

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
              start: `top ${startPct}%`,
              end: `bottom ${endPct}%`,
              scrub: 0.5,
              onUpdate: (self) => {
                setDesktopProgress(self.progress);
                if (desktopPathRef.current && desktopPathLength > 0 && shipDivRef.current) {
                  const progress = Math.min(1.0, Math.max(0, self.progress));
                  const totalHistoryYears = chronologicalHistory.length || 23;
                  const yearsPassed = progress * (totalHistoryYears - 1);
                  const currentScale = (tuning.startScale ?? 0.70) + yearsPassed * (tuning.growthPerYear ?? 0.115);
                  shipScaleRef.current = currentScale;

                  // Offset travel length by front bow half-length so the front bow tip stops exactly at the end of the line
                  const halfBowOffset = (tuning.bowOffsetPx ?? 70) * currentScale;
                  const maxTravelLength = Math.max(0, desktopPathLength - halfBowOffset);
                  const len = Math.min(maxTravelLength, Math.max(0, progress * maxTravelLength));

                  const pt = desktopPathRef.current.getPointAtLength(len);
                  const pPrev = desktopPathRef.current.getPointAtLength(Math.max(0, len - 15));
                  const pNext = desktopPathRef.current.getPointAtLength(Math.min(desktopPathLength, len + 15));
                  const dx = pNext.x - pPrev.x;
                  const dy = pNext.y - pPrev.y;

                  if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
                    lastAngleRef.current = Math.atan2(dy, dx);
                  }
                  const angle = lastAngleRef.current;

                  shipDivRef.current.style.left = `${pt.x}px`;
                  shipDivRef.current.style.top = `${pt.y}px`;
                  shipDivRef.current.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
                  shipDivRef.current.style.opacity = self.progress > 0.005 ? '1' : '0';
                }
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
              start: `top ${startPct}%`,
              end: `bottom ${endPct}%`,
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
    };
  }, [desktopPathLength, mobilePathLength, tuning]);

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
        {/* 3D Top-Down Cruise Ship Follower riding the History & Milestones serpentine path */}
        <div
          ref={shipDivRef}
          style={{
            position: 'absolute',
            left: -300,
            top: -300,
            width: 1200,
            height: 1200,
            pointerEvents: 'none',
            zIndex: 30,
            overflow: 'visible',
            transition: 'none',
            opacity: 0,
          }}
        >
          <Canvas
            orthographic
            gl={{ powerPreference: 'high-performance', antialias: true, alpha: true }}
            camera={{ left: -1000, right: 1000, top: 1000, bottom: -1000, zoom: 22, position: [0, 350, 0], up: [0, 0, -1] }}
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            <ambientLight intensity={1.8} />
            <directionalLight position={[5, 12, 5]} intensity={2.5} />
            <pointLight position={[-5, 5, -5]} intensity={1} color="#06b6d4" />
            <React.Suspense fallback={null}>
              <TopDownHistoryShip shipScaleRef={shipScaleRef} />
            </React.Suspense>
          </Canvas>
        </div>
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
              stroke={tuning.lineColor || '#06b6d4'}
              strokeWidth={tuning.lineWidth || 6}
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
              className="w-5 h-5 rounded-full bg-cyan-400 border-4 border-[#06060c] z-10"
            />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-black bg-cyan-400 px-4 py-1.5 rounded-full font-mono z-10">
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
                              ? 'bg-[#06060c] border border-cyan-400/90 scale-105'
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
                          className={`bg-[#0c0c16]/90 backdrop-blur-xl p-6 rounded-3xl transition-all duration-300 ${
                            isReached
                              ? 'border border-cyan-400/70 -translate-y-1'
                              : 'border border-white/10 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`text-[10px] font-black uppercase tracking-widest font-mono px-3 py-0.5 rounded transition-colors ${
                                isReached
                                  ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-500/50'
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
                    isReached ? 'bg-cyan-300 scale-125' : 'bg-cyan-500/30'
                  }`}
                />

                <div
                  className={`bg-[#0c0c16]/90 backdrop-blur-xl p-5 rounded-2xl transition-all duration-300 ${
                    isReached ? 'border border-cyan-400/60' : 'border border-white/10 opacity-70'
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

      {/* ── Persistent Floating History Settings Button & Modal Drawer ── */}
      {showSettings && mounted && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="fixed bottom-16 left-6 w-[440px] max-w-[94vw] max-h-[85vh] overflow-y-auto p-6 bg-[#080814] border-2 border-cyan-400 rounded-3xl backdrop-blur-2xl shadow-[0_0_90px_rgba(6,182,212,0.5)] text-left animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                <h3 className="text-sm font-black uppercase tracking-widest text-cyan-300">
                  History Timeline & 3D Ship Controls
                </h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-white/60 hover:text-white text-lg font-bold px-2 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 text-xs">
              {/* 1. Start Ship Scale */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-white/90">⚓ 1998 Start Ship Size (Scale)</span>
                  <span className="text-cyan-400 font-mono font-bold">{tuning.startScale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.20"
                  max="2.00"
                  step="0.05"
                  value={tuning.startScale}
                  onChange={e => setTuning({ ...tuning, startScale: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[10px] text-white/40 mt-1">Starting size of the 3D ship at 1998 Inaugural Voyage.</p>
              </div>

              {/* 2. Growth Per Year */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-white/90">📈 Growth Rate Per Year (+Scale/Yr)</span>
                  <span className="text-cyan-400 font-mono font-bold">+{tuning.growthPerYear.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0.000"
                  max="0.300"
                  step="0.005"
                  value={tuning.growthPerYear}
                  onChange={e => setTuning({ ...tuning, growthPerYear: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[10px] text-white/40 mt-1">How much larger the ship gets for every passed year.</p>
              </div>

              {/* 3. Bow Offset */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-white/90">🎯 Bow Tip End Stop Offset</span>
                  <span className="text-cyan-400 font-mono font-bold">{tuning.bowOffsetPx}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  step="5"
                  value={tuning.bowOffsetPx}
                  onChange={e => setTuning({ ...tuning, bowOffsetPx: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[10px] text-white/40 mt-1">Ensures the front bow tip lands exactly at the end of the line.</p>
              </div>

              {/* 4. Scroll Start Target */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-white/90">🚀 Scroll Start Position (% Viewport)</span>
                  <span className="text-cyan-400 font-mono font-bold">{(tuning.scrollStartMul * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.90"
                  step="0.05"
                  value={tuning.scrollStartMul}
                  onChange={e => setTuning({ ...tuning, scrollStartMul: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* 5. Scroll End Target */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-white/90">🏁 Scroll End Position (% Viewport)</span>
                  <span className="text-cyan-400 font-mono font-bold">{(tuning.scrollEndMul * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.90"
                  step="0.05"
                  value={tuning.scrollEndMul}
                  onChange={e => setTuning({ ...tuning, scrollEndMul: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* 6. Line Width */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-white/90">🖊️ Line Thickness</span>
                  <span className="text-cyan-400 font-mono font-bold">{tuning.lineWidth}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="16"
                  step="1"
                  value={tuning.lineWidth}
                  onChange={e => setTuning({ ...tuning, lineWidth: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* 7. Line Color */}
              <div>
                <span className="font-bold text-white/90 block mb-2">🎨 Line Glow Color</span>
                <div className="flex items-center gap-2">
                  {['#06b6d4', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'].map(col => (
                    <button
                      key={col}
                      onClick={() => setTuning({ ...tuning, lineColor: col })}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer border-2 ${
                        tuning.lineColor === col ? 'scale-125 border-white shadow-[0_0_12px_rgba(255,255,255,0.8)]' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-6">
              <button
                onClick={handleResetTuning}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              >
                🔄 Reset Defaults
              </button>
              <div className="flex items-center gap-2">
                {saveToast && (
                  <span className="text-xs font-bold text-emerald-400 animate-in fade-in duration-300">
                    ✓ Saved!
                  </span>
                )}
                <button
                  onClick={handleSaveTuning}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
                >
                  💾 Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Persistent Floating Trigger Button ── */}
      {mounted && createPortal(
        <button
          onClick={() => setShowSettings(prev => !prev)}
          className="fixed bottom-6 left-6 z-[999999] bg-[#060614] hover:bg-cyan-950 border-2 border-cyan-400 text-cyan-300 px-5 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(6,182,212,0.6)] backdrop-blur-md flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
        >
          <span>⚙️</span> {showSettings ? 'Close History Controls' : 'Tune History Controls'}
        </button>,
        document.body
      )}
    </div>
  );
}
