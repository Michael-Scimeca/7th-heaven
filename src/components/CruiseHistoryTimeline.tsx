'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

import { suppressBlobTextureErrors } from '@/lib/suppressBlobTextureErrors';

// Suppress blob URL texture errors that occur during page transitions
suppressBlobTextureErrors();

// Preload the GLTF model at module level so the asset + all blob-URL textures
// are fully cached before any component mounts. This prevents THREE.GLTFLoader
// errors when a page transition interrupts a mid-load blob URL texture.
if (typeof window !== 'undefined') {
  useGLTF.preload('/objects/ship.glb');
}

function TopDownHistoryShip({ shipScaleRef }: { shipScaleRef: React.RefObject<number> }) {
  const { scene } = useGLTF('/objects/ship.glb');
  const { clonedScene, maxDim } = React.useMemo(() => {
    const c = scene.clone();
    c.traverse((child) => {
      child.matrixAutoUpdate = true;
    });

    const box = new THREE.Box3().setFromObject(c);
    const center = new THREE.Vector3();
    box.getCenter(center);
    c.position.sub(center);

    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;

    return { clonedScene: c, maxDim };
  }, [scene]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ camera }) => {
    const targetLengthPx = shipScaleRef.current ?? 150;
    if (groupRef.current) {
      groupRef.current.rotation.set(0, 0, 0);
      const scale = targetLengthPx / maxDim;
      groupRef.current.scale.set(scale, scale, scale);
      groupRef.current.updateMatrixWorld(true);
    }
    if (camera && 'zoom' in camera) {
      const orthCamera = camera as THREE.OrthographicCamera;
      orthCamera.zoom = 1;
      orthCamera.updateProjectionMatrix();
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
  endScale: number;
  scalingCurve: 'linear' | 'exponential' | 'stepped';
  growthCurveExp: number;
  shipOffsetX: number;
  shipOffsetY: number;
  bowOffsetPx: number;
  scrollStartMul: number;
  scrollEndMul: number;
  scrubDamping: number;
  lineWidth: number;
  lineColor: string;
};

export const DEFAULT_HISTORY_TUNING: HistoryTuningConfig = {
  startScale: 0.85,
  endScale: 2.40,
  scalingCurve: 'linear',
  growthCurveExp: 1.5,
  shipOffsetX: 0,
  shipOffsetY: 0,
  bowOffsetPx: 145,
  scrollStartMul: 0.50,
  scrollEndMul: 0.50,
  scrubDamping: 0.5,
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
  const shipScaleRef = useRef(150);
  const lastAngleRef = useRef(0);
  const startDotRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const mobilePathRef = useRef<SVGPathElement>(null);

  const [desktopPathLength, setDesktopPathLength] = useState(0);

  const [mobileProgress, setMobileProgress] = useState(0);
  const [mobilePathLength, setMobilePathLength] = useState(0);

  const [pathD, setPathD] = useState('');
  const [staticFuturePathD, setStaticFuturePathD] = useState('');
  const [svgSize, setSvgSize] = useState({ w: 1400, h: 2000 });
  const [mobileSvgSize, setMobileSvgSize] = useState({ w: 400, h: 3000 });

  const [tuning, setTuning] = useState<HistoryTuningConfig>(DEFAULT_HISTORY_TUNING);
  const [showSettings, setShowSettings] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [mounted, setMounted] = useState(false);
  const latestProgressRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    try {
      const savedStr = localStorage.getItem('7h_history_tuning_v6');
      if (savedStr) {
        const parsed = JSON.parse(savedStr);
        setTuning({ ...DEFAULT_HISTORY_TUNING, ...parsed });
      }
    } catch { }
  }, []);

  const handleSaveTuning = () => {
    try {
      localStorage.setItem('7h_history_tuning_v6', JSON.stringify(tuning));
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch { }
  };

  const handleResetTuning = () => {
    setTuning(DEFAULT_HISTORY_TUNING);
    try {
      localStorage.removeItem('7h_history_tuning');
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch { }
  };

  // Reverse history so timeline starts at 1998 (Inaugural Voyage) and proceeds chronologically to 2028
  const chronologicalHistory = [...history].reverse();

  // Chunk history items into 3 items per row for desktop
  const rows: HistoryItem[][] = [];
  const chunkSize = 3;
  for (let i = 0; i < chronologicalHistory.length; i += chunkSize) {
    rows.push(chronologicalHistory.slice(i, i + chunkSize));
  }

  const idx2026 = chronologicalHistory.findIndex(h => h.year === '2026');
  const max2026Ratio = idx2026 >= 0 ? (idx2026 / Math.max(1, chronologicalHistory.length - 1)) : 0.88;
  const maxMobileHeight = max2026Ratio * (mobileSvgSize.h || 3000);

  // Measure path distance to 2026 badge and all individual year badges
  const [pathLengthTo2026, setPathLengthTo2026] = useState<number | null>(null);
  const pathLengthTo2026Ref = useRef<number | null>(null);
  const rowCentersRef = useRef<number[]>([]);
  const rowPathLengthsRef = useRef<number[]>([]);
  const [badgePathLengths, setBadgePathLengths] = useState<number[]>([]);
  const [currentShipLength, setCurrentShipLength] = useState<number>(0);
  const [shipMaxTravelLength, setShipMaxTravelLength] = useState<number>(0);

  // Position ship dynamically using SVG path and relative container percentages
  const updateShipPosition = useCallback((scrollProgress: number) => {
    if (!desktopPathRef.current || !shipDivRef.current || !desktopContainerRef.current) return;
    const pathLength = desktopPathRef.current.getTotalLength();
    if (pathLength <= 0) return;

    const scrollProgressClamped = Math.min(1.0, Math.max(0, scrollProgress));
    const maxTravelLen = Math.max(0, pathLength - (tuning.bowOffsetPx ?? 145));
    setShipMaxTravelLength(maxTravelLen);

    const xProgress = Math.min(1.0, scrollProgressClamped * 1.35);
    const pathDistance = Math.min(maxTravelLen, Math.max(0, xProgress * maxTravelLen));
    setCurrentShipLength(pathDistance);

    const containerRect = desktopContainerRef.current.getBoundingClientRect();
    const containerW = containerRect.width || 1400;
    const containerH = containerRect.height || 1;
    const widthScale = Math.max(0.5, containerW / 1400);

    const startPx = 150 * widthScale;
    const endPx = 220 * widthScale;
    const targetLengthPx = startPx + xProgress * (endPx - startPx);
    shipScaleRef.current = targetLengthPx;

    const strokeOffset = Math.max(0, pathLength - pathDistance);
    desktopPathRef.current.style.strokeDashoffset = `${strokeOffset}px`;

    const pt = desktopPathRef.current.getPointAtLength(pathDistance);
    const pPrev = desktopPathRef.current.getPointAtLength(Math.max(0, pathDistance - 15));
    const pNext = desktopPathRef.current.getPointAtLength(Math.min(pathLength, pathDistance + 15));
    const dx = pNext.x - pPrev.x;
    const dy = pNext.y - pPrev.y;

    if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
      lastAngleRef.current = Math.atan2(dy, dx);
    }
    const angle = lastAngleRef.current;

    const offX = tuning.shipOffsetX ?? 0;
    const offY = tuning.shipOffsetY ?? 0;

    const leftPct = ((pt.x + offX) / containerW) * 100;
    const topPct = ((pt.y + offY) / containerH) * 100;

    shipDivRef.current.style.position = 'absolute';
    shipDivRef.current.style.left = `${leftPct}%`;
    shipDivRef.current.style.top = `${topPct}%`;
    shipDivRef.current.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
    shipDivRef.current.style.zIndex = '10';
    shipDivRef.current.style.opacity = scrollProgressClamped > 0.005 ? '1' : '0';
  }, [tuning]);

  // Calculate single continuous SVG path string dynamically from real DOM positions
  const updatePathGeometry = useCallback(() => {
    if (!desktopContainerRef.current) return;
    const containerRect = desktopContainerRef.current.getBoundingClientRect();
    const w = containerRect.width;
    const h = containerRect.height;
    if (w === 0 || h === 0) return;
    setSvgSize({ w, h });

    // Measure exact Y-center for each row's year badge pill
    const rowCenters: number[] = [];
    rowRefs.current.forEach((rowEl) => {
      if (rowEl) {
        const badgeEl = rowEl.querySelector('[data-year-badge]') || rowEl.querySelector('[data-year-header-row]');
        if (badgeEl) {
          const rect = badgeEl.getBoundingClientRect();
          const yCenter = rect.top - containerRect.top + rect.height / 2;
          rowCenters.push(yCenter);
        }
      }
    });

    if (rowCenters.length === 0) return;
    rowCentersRef.current = rowCenters;

    // Measure START dot position (Top Left)
    let startX = 24;
    let startY = 20;
    if (startDotRef.current) {
      const dotRect = startDotRef.current.getBoundingClientRect();
      startX = dotRect.left - containerRect.left + dotRect.width / 2;
      startY = dotRect.top - containerRect.top + dotRect.height / 2;
    }

    const outerRight = w - 32;
    const outerLeft = 32;
    const r = 32; // Corner radius matching 32px layout spacing

    // Measure exact X-center for 2026 badge node for path termination
    const allYearBadges = Array.from(desktopContainerRef.current.querySelectorAll('[data-year-badge]'));
    const badge2026El = allYearBadges.find(el => el.textContent?.includes('2026'));
    let endX2026 = outerRight - 80;
    if (badge2026El) {
      const bRect = badge2026El.getBoundingClientRect();
      endX2026 = bRect.left - containerRect.left + bRect.width / 2;
    }

    // Active timeline rows from Row 0 (1998) through Row 6 (2024-2026)
    const activeRowCenters = rowCenters.slice(0, 7);

    // Build single continuous SVG path string terminating PRECISELY at 2026 node
    let d = `M ${startX} ${startY} V ${activeRowCenters[0] - r} A ${r} ${r} 0 0 0 ${startX + r} ${activeRowCenters[0]} H ${outerRight - r}`;

    for (let i = 0; i < activeRowCenters.length - 1; i++) {
      const yCurr = activeRowCenters[i];
      const yNext = activeRowCenters[i + 1];
      const isEven = i % 2 === 0;

      if (i === activeRowCenters.length - 2) {
        // Final row turn into Row 6: draw horizontal line straight to the 2026 badge node!
        d += ` A ${r} ${r} 0 0 0 ${outerLeft} ${yCurr + r} V ${yNext - r} A ${r} ${r} 0 0 0 ${outerLeft + r} ${yNext} H ${endX2026}`;
      } else if (isEven) {
        // Right bend from Row i to Row i+1
        d += ` A ${r} ${r} 0 0 1 ${outerRight} ${yCurr + r} V ${yNext - r} A ${r} ${r} 0 0 1 ${outerRight - r} ${yNext} H ${outerLeft + r}`;
      } else {
        // Left bend from Row i to Row i+1
        d += ` A ${r} ${r} 0 0 0 ${outerLeft} ${yCurr + r} V ${yNext - r} A ${r} ${r} 0 0 0 ${outerLeft + r} ${yNext} H ${outerRight - r}`;
      }
    }

    setPathD(d);

    // Measure exact X-center for 2028 badge node for path termination
    const badge2028El = allYearBadges.find(el => el.textContent?.includes('2028'));
    let endX2028 = w / 2;
    if (badge2028El) {
      const bRect = badge2028El.getBoundingClientRect();
      endX2028 = bRect.left - containerRect.left + bRect.width / 2;
    }

    // Build dim/unfilled connector line for 2026 -> 2027 (right) -> 2028 (middle)
    if (rowCenters.length >= 8) {
      const yRow6 = rowCenters[6];
      const yRow7 = rowCenters[7];
      const futureD = `M ${endX2026} ${yRow6} H ${outerRight - r} A ${r} ${r} 0 0 1 ${outerRight} ${yRow6 + r} V ${yRow7 - r} A ${r} ${r} 0 0 1 ${outerRight - r} ${yRow7} H ${endX2028}`;
      setStaticFuturePathD(futureD);
    } else {
      setStaticFuturePathD('');
    }

    // Measure exact distance along path to each row center for 1:1 scroll progress mapping
    if (desktopPathRef.current && rowCenters.length > 0) {
      const totalLen = desktopPathRef.current.getTotalLength();
      const rLengths: number[] = [];

      rowCenters.forEach((yCenter) => {
        let closestLen = 0;
        let minDistance = Infinity;
        for (let l = 0; l <= totalLen; l += 15) {
          const pt = desktopPathRef.current!.getPointAtLength(l);
          const dist = Math.abs(pt.y - yCenter);
          if (dist < minDistance) {
            minDistance = dist;
            closestLen = l;
          }
        }
        rLengths.push(closestLen);
      });

      rowPathLengthsRef.current = rLengths;

      const lengths: number[] = [];
      allYearBadges.forEach((badgeEl) => {
        const targetRect = badgeEl.getBoundingClientRect();
        const targetX = targetRect.left - containerRect.left;
        const targetY = targetRect.top - containerRect.top + targetRect.height / 2;

        let closestLen = 0;
        let minDistance = Infinity;
        for (let l = 0; l <= totalLen; l += 15) {
          const pt = desktopPathRef.current!.getPointAtLength(l);
          const dist = Math.hypot(pt.x - targetX, pt.y - targetY);
          if (dist < minDistance) {
            minDistance = dist;
            closestLen = l;
          }
        }
        lengths.push(closestLen);
      });

      setBadgePathLengths(lengths);

      const targetBadgeIdx = allYearBadges.findIndex((el) => el.textContent?.includes('2026'));
      if (targetBadgeIdx !== -1 && lengths[targetBadgeIdx] !== undefined) {
        pathLengthTo2026Ref.current = lengths[targetBadgeIdx];
        setPathLengthTo2026(lengths[targetBadgeIdx]);
      }
    }
  }, []);

  // Update geometry & ship position on mount, window resize, and container ResizeObserver with debouncing
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout | null = null;

    const debouncedResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updatePathGeometry();
        requestAnimationFrame(() => {
          updateShipPosition(latestProgressRef.current);
        });
      }, 150);
    };

    // Immediate initial update
    updatePathGeometry();
    requestAnimationFrame(() => {
      updateShipPosition(latestProgressRef.current);
    });

    let resizeObserver: ResizeObserver | null = null;
    if (desktopContainerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        debouncedResize();
      });
      resizeObserver.observe(desktopContainerRef.current);
    }

    window.addEventListener('resize', debouncedResize, { passive: true });
    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', debouncedResize);
    };
  }, [rows.length, updatePathGeometry, updateShipPosition]);

  // Measure path length whenever pathD updates
  useEffect(() => {
    if (desktopPathRef.current && pathD) {
      setDesktopPathLength(desktopPathRef.current.getTotalLength());
      updateShipPosition(latestProgressRef.current);
      const t = setTimeout(() => {
        if (typeof window !== 'undefined' && (window as any).__lenis) {
          (window as any).__lenis.resize();
        }
      }, 250);
      return () => clearTimeout(t);
    }
    if (mobilePathRef.current) {
      setMobilePathLength(mobilePathRef.current.getTotalLength());
    }
  }, [pathD, updateShipPosition]);

  const updateShipPositionRef = useRef(updateShipPosition);
  useEffect(() => {
    updateShipPositionRef.current = updateShipPosition;
  }, [updateShipPosition]);

  // Native scroll-progress scrub (replaces GSAP ScrollTrigger)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const row2026El = rowRefs.current.find(rowEl =>
      rowEl?.querySelector('[data-year-badge]')?.textContent?.includes('2026')
    ) || null;

    const computeProgress = (
      triggerEl: HTMLElement | null,
      startVh: number,
      endEl: HTMLElement | null,
      endVh: number
    ): number => {
      if (!triggerEl) return 0;
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const rect = triggerEl.getBoundingClientRect();
      const startScroll = scrollY + rect.top - vh * startVh;
      let endScroll: number;
      if (endEl) {
        const er = endEl.getBoundingClientRect();
        endScroll = scrollY + (er.top + er.height / 2) - vh * 0.5;
      } else {
        endScroll = scrollY + rect.bottom - vh * endVh;
      }
      if (endScroll <= startScroll) return 0;
      return Math.min(1, Math.max(0, (scrollY - startScroll) / (endScroll - startScroll)));
    };

    let desktopRaw = 0;
    let mobileRaw = 0;
    let desktopSmoothed = 0;
    let mobileSmoothed = 0;
    const LERP = 0.08;
    let rafId: number;

    const tick = () => {
      if (Math.abs(desktopRaw - desktopSmoothed) > 0.0001) {
        desktopSmoothed += (desktopRaw - desktopSmoothed) * LERP;
        latestProgressRef.current = desktopSmoothed;
        updateShipPositionRef.current(desktopSmoothed);
      }
      if (Math.abs(mobileRaw - mobileSmoothed) > 0.0001) {
        mobileSmoothed += (mobileRaw - mobileSmoothed) * LERP;
        setMobileProgress(mobileSmoothed);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const onScroll = () => {
      desktopRaw = computeProgress(
        desktopContainerRef.current,
        0.5,
        row2026El,
        1 - tuning.scrollEndMul
      );
      mobileRaw = computeProgress(
        mobileContainerRef.current,
        0.7,
        null,
        0.4
      );
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    const lenis = (window as any).__lenis;
    if (lenis) lenis.on('scroll', onScroll);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      const l = (window as any).__lenis;
      if (l) l.off('scroll', onScroll);
    };
  }, [desktopPathLength, mobilePathLength, pathLengthTo2026, tuning]);

  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-gradient-to-b from-[#071126] via-[#0c1a3a] to-[#060d1f] pt-20 pb-24 text-left overflow-x-clip border-t border-cyan-500/20">
      {/* Section Header — Synced to Global Layout Padding (25px Mobile / 32px Desktop) */}
      <div className="text-center max-w-4xl mx-auto mb-16 px-[25px] md:px-[32px]">
        <span className="text-[var(--font-size-3xs)] font-black uppercase tracking-[0.25em] text-cyan-400 block mb-1">
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

      {/* ── DESKTOP & TABLET SERPENTINE SNAKE TIMELINE (32px LEADING & TRAILING SPACING) ── */}
      <div
        ref={desktopContainerRef}
        className="hidden md:block w-full py-8 px-[32px] relative overflow-clip"
      >
        {/* 3D Top-Down Cruise Ship Follower riding the History & Milestones serpentine path */}
        <div
          ref={shipDivRef}
          style={{
            position: 'absolute',
            left: 24,
            top: 20,
            width: 1200,
            height: 1200,
            pointerEvents: 'none',
            zIndex: 10,
            overflow: 'visible',
            transition: 'none',
            opacity: 1,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Canvas
            orthographic
            gl={{ powerPreference: 'high-performance', antialias: true, alpha: true }}
            camera={{ left: -600, right: 600, top: 600, bottom: -600, zoom: 1, position: [0, 350, 0], up: [0, 0, -1] }}
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

              {/* SVG Animated Fluid Water Wave Turbulence Filter */}
              <filter id="water-wave-motion" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="2" result="noise">
                  <animate
                    attributeName="baseFrequency"
                    dur="16s"
                    values="0.02 0.05; 0.04 0.08; 0.02 0.05"
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

            {/* Dim/Unfilled Track Line Extension from 2026 -> 2027 -> 2028 */}
            {staticFuturePathD && (
              <path
                d={staticFuturePathD}
                fill="none"
                stroke="rgba(6, 182, 212, 0.15)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

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
            <span className="text-[var(--font-size-3xs)] md:text-xs font-black uppercase tracking-[0.2em] text-black bg-cyan-400 px-3.5 md:px-4 py-1.5 rounded-full font-mono z-10">
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
                className="relative mb-16 md:mb-20 lg:mb-24 last:mb-0"
              >
                {/* YEAR HEADERS ROW */}
                <div
                  data-year-header-row
                  className={`relative flex justify-between items-center px-2 md:px-4 lg:px-6 h-12 z-30 ${isEvenRow ? 'flex-row' : 'flex-row-reverse'
                    }`}
                >
                  {(() => {
                    const paddedItems = rowItems.length < chunkSize
                      ? [...rowItems, ...Array(chunkSize - rowItems.length).fill(null)]
                      : rowItems;

                    return paddedItems.map((hist, itemIndex) => {
                      if (!hist) {
                        return (
                          <div
                            key={`dummy-${itemIndex}`}
                            className="shrink-0 opacity-0 pointer-events-none"
                            style={{ width: 'clamp(200px, 24vw, 380px)' }}
                          />
                        );
                      }

                      const globalIdx = rowIndex * chunkSize + itemIndex;
                      const badgePathLen = badgePathLengths[globalIdx] ?? Infinity;
                      const is2026 = hist.year === '2026';
                      const isFutureNode = hist.year === '2027' || hist.year === '2028';
                      const isReached = isFutureNode
                        ? false
                        : is2026
                          ? (currentShipLength > 0 && shipMaxTravelLength > 0 && currentShipLength >= (shipMaxTravelLength - 10))
                          : (currentShipLength > 0 && currentShipLength >= (badgePathLen - 80));

                      const flexAlignClass = isEvenRow
                        ? (itemIndex === 0 ? 'flex justify-start text-left' : itemIndex === chunkSize - 1 ? 'flex justify-end text-right' : 'flex justify-center text-center')
                        : (itemIndex === 0 ? 'flex justify-end text-right' : itemIndex === chunkSize - 1 ? 'flex justify-start text-left' : 'flex justify-center text-center');

                      return (
                        <div
                          key={itemIndex}
                          className={`shrink-0 z-30 group ${flexAlignClass}`}
                          style={{ width: 'clamp(200px, 24vw, 380px)' }}
                        >
                          <div
                            data-year-badge
                            className={`inline-block  z-40 transition-colors duration-300 ${isReached
                              ? 'bg-[#06060c] border-2 border-cyan-400 text-cyan-300 scale-105 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
                              : 'bg-[#06060c] border border-white/10'
                              }`}
                            style={{ padding: 'clamp(0.25rem, 0.6vw, 0.5rem) clamp(0.75rem, 1.5vw, 1.5rem)' }}
                          >
                            <h6
                              className={`font-black font-mono tracking-tight transition-colors leading-none ${isReached ? 'text-cyan-300' : 'text-white/40'
                                }`}
                              style={{ fontSize: 'clamp(1.5rem, 3.2vw, 3rem)' }}
                            >
                              {hist.year}
                            </h6>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* CARDS ROW */}
                <div
                  className={`flex justify-between items-start px-2 md:px-4 lg:px-6 mt-4 ${isEvenRow ? 'flex-row' : 'flex-row-reverse'
                    }`}
                >
                  {(() => {
                    const paddedItems = rowItems.length < chunkSize
                      ? [...rowItems, ...Array(chunkSize - rowItems.length).fill(null)]
                      : rowItems;

                    return paddedItems.map((hist, itemIndex) => {
                      if (!hist) {
                        return (
                          <div
                            key={`dummy-card-${itemIndex}`}
                            className="shrink-0 opacity-0 pointer-events-none"
                            style={{ width: 'clamp(200px, 24vw, 380px)' }}
                          />
                        );
                      }

                      const globalIdx = rowIndex * chunkSize + itemIndex;
                      const voyageNum = globalIdx + 1;
                      const badgePathLen = badgePathLengths[globalIdx] ?? Infinity;
                      const is2026 = hist.year === '2026';
                      const isFutureNode = hist.year === '2027' || hist.year === '2028';
                      const isReached = globalIdx === 0 || (isFutureNode
                        ? false
                        : is2026
                          ? (currentShipLength > 0 && shipMaxTravelLength > 0 && currentShipLength >= (shipMaxTravelLength - 10))
                          : (currentShipLength > 0 && currentShipLength >= (badgePathLen - 80)));

                      return (
                        <div
                          key={itemIndex}
                          className="shrink-0 group text-left"
                          style={{ width: 'clamp(200px, 24vw, 380px)' }}
                        >
                          <div
                            className={`transition-colors duration-300 ${isReached
                              ? 'opacity-100'
                              : 'opacity-70'
                              }`}
                            style={{ padding: '0.5rem 0' }}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span
                                className={`font-black uppercase tracking-widest font-mono rounded transition-colors ${isReached
                                  ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-500/50'
                                  : 'text-white/40 bg-white/5 border border-white/10'
                                  }`}
                                style={{ fontSize: 'clamp(0.55rem, 0.75vw, 0.65rem)', padding: '0.125rem 0.5rem' }}
                              >
                                VOYAGE #{voyageNum}
                              </span>
                              <span style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>🚢</span>
                            </div>

                            <h4
                              className={`font-black uppercase leading-snug transition-colors ${isReached ? 'text-white' : 'text-white/60'
                                }`}
                              style={{ fontSize: 'clamp(0.75rem, 1.1vw, 1rem)' }}
                            >
                              {hist.ship}
                            </h4>
                            <p
                              className="text-white/50 mt-2 leading-relaxed font-sans"
                              style={{ fontSize: 'clamp(0.65rem, 0.85vw, 0.75rem)' }}
                            >
                              {hist.details}
                            </p>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MOBILE VERTICAL SNAKE TIMELINE (MOBILE ONLY, BELOW MD — 32px LEFT ALIGNED & STOPS AT 2026) ── */}
      <div
        ref={mobileContainerRef}
        className="block md:hidden relative w-full py-6 px-[25px]"
      >
        <div className="space-y-6 pl-6 relative">
          {chronologicalHistory.map((hist, idx) => {
            const isReached = idx === 0 || mobileProgress >= Math.max(0, (idx / chronologicalHistory.length) - 0.03);
            const nextHist = chronologicalHistory[idx + 1];
            const isLastHistoricalNode = hist.year === '2026';
            const isFutureItem = hist.year === '2027' || hist.year === '2028';
            const showConnectorLine = !isLastHistoricalNode && !isFutureItem && nextHist;

            return (
              <div key={idx} className="relative group">
                {/* Node Circle Box */}
                <div
                  className={`absolute left-[-25px] top-2 w-4 h-4 rounded-full border-2 border-[#06060c] z-10 transition-colors duration-300 ${isReached ? 'bg-cyan-300 scale-125 shadow-[0_0_12px_rgba(6,182,212,0.8)]' : 'bg-cyan-500/30'
                    }`}
                />

                {/* Connecting Line Segment — Aligned at 25px Global Mobile Padding */}
                {showConnectorLine && (
                  <div
                    className={`absolute left-[-19px] top-2 bottom-[-32px] w-[4px] transition-colors duration-300 ${isReached ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'bg-cyan-500/20'
                      }`}
                  />
                )}

                <div
                  className={`py-1 transition-colors duration-300 ${isReached ? 'opacity-100' : 'opacity-70'
                    }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-lg font-black text-cyan-400 font-mono">
                      {hist.year}
                    </span>
                    <span className="text-[var(--font-size-4xs)] font-extrabold uppercase tracking-widest text-white/30 font-mono">
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
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-transparent pointer-events-none transition-opacity duration-200 ease-out">
          <div
            data-settings-panel
            className="fixed bottom-16 left-6 w-[450px] max-w-[94vw] max-h-[85vh] overflow-y-auto p-6 bg-[#04040e]/30 border border-cyan-400/40 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.25)] text-left transition-opacity duration-300 ease-out pointer-events-auto"
          >
            <style>{`
              [data-settings-panel], [data-settings-panel] * {
                cursor: default !important;
              }
              [data-settings-panel] input[type="range"],
              [data-settings-panel] button,
              [data-settings-panel] a {
                cursor: pointer !important;
              }
            `}</style>
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
                  <span className="text-cyan-400 font-mono font-bold">{(tuning.startScale ?? 0.70).toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="5.00"
                  step="0.05"
                  value={tuning.startScale ?? 0.70}
                  onChange={e => setTuning({ ...tuning, startScale: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[var(--font-size-3xs)] text-white/40 mt-1">Size at 1998 Inaugural Voyage (0.05x to 5.00x).</p>
              </div>

              {/* 2. End Ship Scale */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-white/90">🚀 2028 End Ship Size (Scale)</span>
                  <span className="text-cyan-400 font-mono font-bold">{(tuning.endScale ?? 3.20).toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="8.00"
                  step="0.05"
                  value={tuning.endScale ?? 3.20}
                  onChange={e => setTuning({ ...tuning, endScale: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[var(--font-size-3xs)] text-white/40 mt-1">Size at 2028 Voyage #23 finish (0.05x to 8.00x).</p>
              </div>

              {/* 3. Year Scaling Curve Mode */}
              <div className="bg-cyan-950/40 border border-cyan-400/40 p-3.5 space-y-2">
                <span className="font-black text-cyan-300 block text-xs uppercase tracking-wide">📈 Year-by-Year Scaling Mode</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['linear', 'exponential', 'stepped'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setTuning({ ...tuning, scalingCurve: mode })}
                      className={`py-1.5 px-2  text-[var(--font-size-3xs)] font-black uppercase tracking-wider transition-colors cursor-pointer border ${(tuning.scalingCurve || 'linear') === mode
                        ? 'bg-cyan-400 text-black border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      {mode === 'linear' ? 'Linear' : mode === 'exponential' ? 'Accel' : 'Stepped'}
                    </button>
                  ))}
                </div>
                <p className="text-[var(--font-size-3xs)] text-white/50">
                  {tuning.scalingCurve === 'stepped'
                    ? 'Steps size discretely as each year milestone is passed.'
                    : tuning.scalingCurve === 'exponential'
                      ? 'Accelerates size growth faster in recent years.'
                      : 'Smooth continuous growth from 1998 to 2028.'}
                </p>
              </div>

              {/* 4. Exponential Curve Exponent (only shown if exponential mode selected) */}
              {(tuning.scalingCurve === 'exponential') && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-white/90">⚡ Year Acceleration Curve (Exponent)</span>
                    <span className="text-cyan-400 font-mono font-bold">{(tuning.growthCurveExp ?? 1.5).toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="3.5"
                    step="0.1"
                    value={tuning.growthCurveExp ?? 1.5}
                    onChange={e => setTuning({ ...tuning, growthCurveExp: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <p className="text-[var(--font-size-3xs)] text-white/40 mt-1">Lower = early growth, Higher = rapid late growth.</p>
                </div>
              )}

              {/* 3. Ship X Position Offset */}
              <div className="bg-cyan-950/30 border border-cyan-400/30 p-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-black text-cyan-300">↔️ Ship X Position Offset (Horizontal)</span>
                  <span className="text-cyan-400 font-mono font-black text-sm">{tuning.shipOffsetX ?? 0}px</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  step="1"
                  value={tuning.shipOffsetX ?? 0}
                  onChange={e => setTuning({ ...tuning, shipOffsetX: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[var(--font-size-3xs)] text-white/50 mt-1">Nudge ship left or right on the path (-200px to +200px).</p>
              </div>

              {/* 4. Ship Y Position Offset */}
              <div className="bg-cyan-950/30 border border-cyan-400/30 p-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-black text-cyan-300">↕️ Ship Y Position Offset (Vertical)</span>
                  <span className="text-cyan-400 font-mono font-black text-sm">{tuning.shipOffsetY ?? 0}px</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  step="1"
                  value={tuning.shipOffsetY ?? 0}
                  onChange={e => setTuning({ ...tuning, shipOffsetY: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[var(--font-size-3xs)] text-white/50 mt-1">Nudge ship up or down on the path (-200px to +200px).</p>
              </div>

              {/* 5. Bow Offset / Ship Stop Position */}
              <div className="bg-cyan-950/30 border border-cyan-400/30 p-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-black text-cyan-300">🎯 Ship & Blue Line Timeline Stop Position</span>
                  <span className="text-cyan-400 font-mono font-black text-sm">{tuning.bowOffsetPx}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="400"
                  step="5"
                  value={tuning.bowOffsetPx}
                  onChange={e => setTuning({ ...tuning, bowOffsetPx: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[var(--font-size-3xs)] text-white/50 mt-1">Live tunes where the 3D ship and solid blue line stop on the timeline relative to 2026 (0px to 400px).</p>
              </div>

              {/* 6. Scroll Start Target */}
              <div className="bg-cyan-950/30 border border-cyan-400/30 p-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-black text-cyan-300">🚀 Scroll Start Trigger (% Viewport)</span>
                  <span className="text-cyan-400 font-mono font-black text-sm">{(tuning.scrollStartMul * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.95"
                  step="0.05"
                  value={tuning.scrollStartMul}
                  onChange={e => setTuning({ ...tuning, scrollStartMul: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[var(--font-size-3xs)] text-white/50 mt-1">Controls when the timeline scrub starts scrolling into view (10% to 95%).</p>
              </div>

              {/* 7. Scroll End Target */}
              <div className="bg-cyan-950/30 border border-cyan-400/30 p-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-black text-cyan-300">🏁 2026 Finish Viewport Position (% Viewport)</span>
                  <span className="text-cyan-400 font-mono font-black text-sm">{(tuning.scrollEndMul * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.95"
                  step="0.05"
                  value={tuning.scrollEndMul}
                  onChange={e => setTuning({ ...tuning, scrollEndMul: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[var(--font-size-3xs)] text-white/50 mt-1">Controls vertically where row 2026 sits on screen when the timeline finishes (10% to 95%).</p>
              </div>

              {/* 8. Scrub Damping / Smoothness */}
              <div className="bg-cyan-950/30 border border-cyan-400/30 p-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-black text-cyan-300">⚡ Scroll Scrub Smoothness (Damping)</span>
                  <span className="text-cyan-400 font-mono font-black text-sm">{(tuning.scrubDamping ?? 0.5).toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={tuning.scrubDamping ?? 0.5}
                  onChange={e => setTuning({ ...tuning, scrubDamping: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[var(--font-size-3xs)] text-white/50 mt-1">Adjusts how smoothly the 3D ship responds to your scroll wheel (0.1s snappy to 2.0s ultra-smooth).</p>
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
                  {['#06b6d4', '#a855f7', '#3b82f6', '#10b981', '#9333ea', '#ec4899'].map(col => (
                    <button
                      key={col}
                      onClick={() => setTuning({ ...tuning, lineColor: col })}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer border-2 ${tuning.lineColor === col ? 'scale-125 border-white shadow-[0_0_12px_rgba(255,255,255,0.8)]' : 'border-transparent opacity-70 hover:opacity-100'
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
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 font-extrabold text-xs uppercase tracking-widest transition-colors cursor-pointer"
              >
                🔄 Reset Defaults
              </button>
              <div className="flex items-center gap-2">
                {saveToast && (
                  <span className="text-xs font-bold text-[var(--color-accent)] transition-opacity duration-300 ease-out">
                    ✓ Saved!
                  </span>
                )}
                <button
                  onClick={handleSaveTuning}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
                >
                  💾 Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}


    </div>
  );
}
