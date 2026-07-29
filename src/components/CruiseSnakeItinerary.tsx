'use client';

import React, { useEffect, useRef, useState, Fragment, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import Lenis from 'lenis';
import type * as THREE from 'three';
import styles from './CruiseSnakeItinerary.module.css';

import { suppressBlobTextureErrors } from '@/lib/suppressBlobTextureErrors';

// Suppress blob URL texture errors that occur during page transitions
suppressBlobTextureErrors();

// Preload 3D ship asset immediately so it renders without network delay on production
if (typeof window !== 'undefined') {
  useGLTF.preload('/objects/ship.glb');
}

function ShipModel({
  scale = 1.0,
  offsetY = 1.05,
  shipRotYRef,
  shipScaleFactorRef,
}: {
  scale?: number;
  offsetY?: number;
  shipRotYRef: React.RefObject<number>;
  shipScaleFactorRef: React.RefObject<number>;
}) {
  const { scene } = useGLTF('/objects/ship.glb');
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);
  const groupRef = useRef<THREE.Group>(null);
  const scaleVelRef = useRef(0);
  const currentScaleFactorRef = useRef(1.0);

  useFrame(() => {
    if (groupRef.current) {
      // 1. Smooth Y-rotation flip turn (180 deg) when heading left vs right
      if (shipRotYRef.current !== undefined) {
        let diff = shipRotYRef.current - groupRef.current.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        groupRef.current.rotation.y += diff * 0.12;
      }

      // 2. Elastic spring scale animation over day circle nodes
      const targetScale = shipScaleFactorRef.current ?? 1.0;
      const stiffness = 0.22;
      const damping = 0.58;
      const force = (targetScale - currentScaleFactorRef.current) * stiffness;
      scaleVelRef.current = (scaleVelRef.current + force) * damping;
      currentScaleFactorRef.current += scaleVelRef.current;

      const finalS = scale * currentScaleFactorRef.current;
      groupRef.current.scale.set(finalS, finalS, finalS);
    }
  });

  return (
    <group ref={groupRef}>
      <primitive
        object={clonedScene}
        position={[0, offsetY, 0]}
      />
    </group>
  );
}

type ItineraryEvent = { id: string; time: string; title: string; subtitle: string };
type ItineraryDay = {
  id: string;
  dayLabel: string;
  location: string;
  theme: string;
  events: ItineraryEvent[];
  colorTheme: string;
  photo?: string;
};
type Props = { itinerary: ItineraryDay[] };

function CircleVideoNode({
  src,
  shouldPlay,
}: {
  src: string;
  shouldPlay: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (shouldPlay) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [shouldPlay]);

  return (
    <video
      ref={videoRef}
      src={`${src}#t=0.001`}
      loop
      muted
      playsInline
      preload="auto"
      className="w-full h-full object-cover rounded-full pointer-events-none scale-125 transition-transform duration-500"
    />
  );
}

/* ── Layout constants (SVG coordinate space) ── */
const SVG_W   = 1400;
const STEP_H  = 680;
const LEFT_X  = 68;   // Safe left margin (prevents circle border clipping)
const RIGHT_X = 1332; // Safe right margin (prevents circle border clipping)
const NODE_R  = 32;

const DAY_ICONS = ['📍', '🎸', '🏝️', '🥂', '⚓', '🌊', '🌴'];

const DAY_IMAGES: Record<number, string> = {
  0: '/images/cruise/port-canaveral-docked.png',
  1: '/images/cruise/cococay-beach-party.png',
  2: '/images/cruise/at-sea.png',
  3: '/images/cruise/st-thomas-island.png',
  4: '/images/cruise/roatan.png',
  5: '/images/cruise/at-sea.png',
  6: '/images/cruise/at-sea.png',
  7: '/images/cruise/port-canaveral-docked.png',
};

export type CruiseTuningConfig = {
  rippleAmp: number;       // Wave ripple height amplitude (0 to 40px)
  waveSpeed: number;       // Wave ripple animation speed (0.0001 to 0.0050)
  lerpSpeed: number;       // Boat tracking lerp speed (0.05 to 1.0)
  scrollStartMul: number;  // Scroll start threshold (0.0 to 1.0)
  scrollEndMul: number;    // Scroll end threshold (0.0 to 1.0)
  speedMultiplier: number; // Cruise boat & line travel speed multiplier (0.2 to 4.0x)
  shipScale: number;       // 3D Ship scale (0.5 to 4.0)
  shipOffsetY: number;     // 3D Hull Y position offset (0.0 to 3.0)
  anchorOffsetX: number;   // Anchor X position offset (-100 to +100px)
  anchorOffsetY: number;   // Anchor Y position offset (-100 to +100px)
  minShipDist: number;     // Start node padding (0 to 400px)
  maxShipDistPad: number;  // End node padding (0 to 400px)
  lineWidth: number;       // SVG path stroke width (2 to 20px)
  glowBlur: number;        // SVG path glow blur radius (0 to 25px)
  nodeDipRadius: number;   // Distance from port circle center to trigger scale down (20 to 250px)
  nodeMinScale: number;    // Minimum scale factor over port circle center (0.0 to 1.0)
  nodeAction: string;      // Action mode: 'hide' | 'bounce' | 'spin'
  nodePopDist: number;     // Distance past port circle to pop back up (20 to 200px)
  shipAdvancePx: number;   // Advance ship front bow along path (-200 to +300px)
  lineFillLeadPx: number;  // Blue line lead/lag offset relative to ship (-200 to +200px)
};

const DEFAULT_TUNING: CruiseTuningConfig = {
  rippleAmp: 7,
  waveSpeed: 0.0011,
  lerpSpeed: 1.0,
  scrollStartMul: 0.45,
  scrollEndMul: 0.50,
  speedMultiplier: 1.0,
  shipScale: 1.5,
  shipOffsetY: 0.50,
  anchorOffsetX: 0,
  anchorOffsetY: 0,
  minShipDist: 0,
  maxShipDistPad: 0,
  lineWidth: 6,
  glowBlur: 0,
  nodeDipRadius: 65,
  nodeMinScale: 1.0,
  nodeAction: 'none',
  nodePopDist: 60,
  shipAdvancePx: 80,
  lineFillLeadPx: 0,
};

type LayoutMode = 'alternating' | 'harbor' | 'center' | 'zigzag';

export default function CruiseSnakeItinerary({ itinerary }: Props) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('alternating');
  const [showSettings, setShowSettings] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [tuning, setTuning] = useState<CruiseTuningConfig>(DEFAULT_TUNING);
  const shipRotYRef = useRef(0);
  const shipRotZRef = useRef(0);
  const shipScaleFactorRef = useRef(1.0);
  const activeNodeRef = useRef(0);
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);
  const visitedNodesRef = useRef<Record<number, boolean>>({});
  const [visitedNodes, setVisitedNodes] = useState<Record<number, boolean>>({});
  const hasScrolledIntoRangeRef = useRef(false);
  const [hasScrolledIntoRange, setHasScrolledIntoRange] = useState(false);
  const isShipInNodeProximityRef = useRef(false);
  const [isShipInNodeProximity, setIsShipInNodeProximity] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const portAudioRef = useRef<HTMLAudioElement | null>(null);
  const seaAudioRef = useRef<HTMLAudioElement | null>(null);
  const [soundMuted, setSoundMuted] = useState(false);

  const isAtSeaDay = (day?: ItineraryDay) => {
    if (!day) return false;
    const loc = (day.location || '').toLowerCase();
    const theme = (day.theme || '').toLowerCase();
    const label = (day.dayLabel || '').toLowerCase();
    return loc.includes('sea') || theme.includes('sea') || label.includes('sea') || loc.includes('cruising') || theme.includes('cruising');
  };

  const fadeAudioIn = (audio: HTMLAudioElement, targetVolume = 0.25, durationMs = 800) => {
    audio.play().catch(() => {});
    const startTime = performance.now();
    const startVol = audio.volume;

    const fade = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const nextVol = startVol + (targetVolume - startVol) * progress;
      audio.volume = Math.max(0, Math.min(1, nextVol));
      if (progress < 1) {
        requestAnimationFrame(fade);
      }
    };
    requestAnimationFrame(fade);
  };

  const fadeAudioOut = (audio: HTMLAudioElement | null, durationMs = 800) => {
    if (!audio || audio.paused) return;
    const startTime = performance.now();
    const startVol = audio.volume;
    if (startVol <= 0.01) {
      audio.volume = 0;
      audio.pause();
      return;
    }

    const fade = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const nextVol = startVol * (1 - progress);
      audio.volume = Math.max(0, Math.min(1, nextVol));
      if (progress < 1) {
        requestAnimationFrame(fade);
      } else {
        audio.pause();
      }
    };
    requestAnimationFrame(fade);
  };

  // Preload audio elements on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!portAudioRef.current) {
      portAudioRef.current = new Audio('/audio/ship-at-port.mp3');
      portAudioRef.current.loop = true;
      portAudioRef.current.volume = 0.25;
    }
    if (!seaAudioRef.current) {
      seaAudioRef.current = new Audio('/audio/ship-sea.mp3');
      seaAudioRef.current.loop = true;
      seaAudioRef.current.volume = 0.25;
    }
  }, []);

  // Unlock browser autoplay policy on first user interaction anywhere on page
  useEffect(() => {
    if (soundMuted || typeof window === 'undefined') return;

    const unlockAudio = () => {
      if (soundMuted || !hasScrolledIntoRangeRef.current) return;
      const currentDay = itinerary[activeNodeIndex];
      const isSea = isAtSeaDay(currentDay);
      if (isSea && seaAudioRef.current) {
        seaAudioRef.current.play().catch(() => {});
      } else if (portAudioRef.current) {
        portAudioRef.current.play().catch(() => {});
      }
    };

    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [activeNodeIndex, itinerary, soundMuted]);

  // Keep playing sound of current location continuously when in section range
  useEffect(() => {
    if (!itinerary || itinerary.length === 0) return;

    if (soundMuted || !hasScrolledIntoRange) {
      fadeAudioOut(portAudioRef.current);
      fadeAudioOut(seaAudioRef.current);
      return;
    }

    const currentDay = itinerary[activeNodeIndex];
    const isSea = isAtSeaDay(currentDay);

    if (isSea) {
      // Location is "At Sea" -> crossfade to ship-sea.mp3 and keep playing continuously
      fadeAudioOut(portAudioRef.current);
      if (!seaAudioRef.current) {
        seaAudioRef.current = new Audio('/audio/ship-sea.mp3');
        seaAudioRef.current.loop = true;
        seaAudioRef.current.volume = 0;
      }
      fadeAudioIn(seaAudioRef.current, 0.25);
    } else {
      // Location is a "Port" -> crossfade to ship-at-port.mp3 and keep playing continuously
      fadeAudioOut(seaAudioRef.current);
      if (!portAudioRef.current) {
        portAudioRef.current = new Audio('/audio/ship-at-port.mp3');
        portAudioRef.current.loop = true;
        portAudioRef.current.volume = 0;
      }
      fadeAudioIn(portAudioRef.current, 0.25);
    }
  }, [activeNodeIndex, itinerary, soundMuted, hasScrolledIntoRange]);

  useEffect(() => {
    return () => {
      if (portAudioRef.current) {
        portAudioRef.current.pause();
        portAudioRef.current = null;
      }
      if (seaAudioRef.current) {
        seaAudioRef.current.pause();
        seaAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    // Debounce: only update state 150ms after the user stops resizing
    // (without this, every pixel of resize triggers a full re-render)
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const debouncedCheck = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkMobile, 150);
    };
    window.addEventListener('resize', debouncedCheck, { passive: true });
    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener('resize', debouncedCheck);
    };
  }, []);

  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef  = useRef<HTMLDivElement>(null);
  const shipContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs   = useRef<(HTMLDivElement | null)[]>([]);

  // Load saved tuning from localStorage on mount (position boat cleanly on the path line)
  useEffect(() => {
    try {
      const savedStr = localStorage.getItem('7h_cruise_tuning');
      if (savedStr) {
        const saved = JSON.parse(savedStr);
        saved.shipScale = 1.5;
        saved.nodeMinScale = 1.0;
        saved.nodeAction = 'none';
        saved.anchorOffsetX = 0;
        saved.anchorOffsetY = 0;
        saved.shipOffsetY = 0.50;
        saved.maxShipDistPad = 0;
        saved.lerpSpeed = 1.0;
        saved.speedMultiplier = 1.0;
        setTuning({ ...DEFAULT_TUNING, ...saved, shipScale: 1.5, nodeMinScale: 1.0, nodeAction: 'none', shipOffsetY: 0.50, lerpSpeed: 1.0, speedMultiplier: 1.0, maxShipDistPad: 0 });
      }
    } catch {}
  }, []);

  // ── Sync tuning state to ref for requestAnimationFrame loop ──
  const tuneRef = useRef<CruiseTuningConfig>(tuning);
  useEffect(() => {
    tuneRef.current = tuning;
  }, [tuning]);

  const handleSaveTuning = () => {
    try {
      localStorage.setItem('7h_cruise_tuning', JSON.stringify(tuning));
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch {}
  };

  const handleResetTuning = () => {
    setTuning(DEFAULT_TUNING);
    try {
      localStorage.removeItem('7h_cruise_tuning');
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch {}
  };

  // Canvas height: last node Y + card height (560px) to prevent cutoff
  const lastNodeY = (itinerary.length - 1) * STEP_H + 50;
  const totalH = lastNodeY + 560;

  /* ── Node positions dynamically computed based on layoutMode ── */
  const nodes = itinerary.map((_, i) => {
    let x = i % 2 === 0 ? LEFT_X : RIGHT_X;
    if (layoutMode === 'harbor') {
      x = 120 + (i % 2 === 0 ? 0 : 40); // Left harbor channel
    } else if (layoutMode === 'center') {
      x = 700 + (i % 2 === 0 ? -30 : 30); // Center passage
    } else if (layoutMode === 'zigzag') {
      x = i % 2 === 0 ? 300 : 1100; // Compact zig-zag
    }
    return {
      x,
      y: i * STEP_H + 50,
      isLeft: layoutMode === 'harbor' ? false : layoutMode === 'center' ? i % 2 === 0 : i % 2 === 0,
    };
  });

  /* ── Animated water-wave serpentine path ── */
  const trackRef     = useRef<SVGPathElement>(null);
  const fillRef      = useRef<SVGPathElement>(null);
  const currentRef   = useRef<SVGPathElement>(null);
  const highlightRef = useRef<SVGPathElement>(null);

  const buildWavyPath = (phase: number, amp?: number) => {
    if (nodes.length === 0) return '';
    const STEPS = 24;
    const RIPPLE = amp ?? tuneRef.current.rippleAmp;
    const FREQ = 3;

    let d = `M ${nodes[0].x} ${nodes[0].y}`;

    for (let i = 1; i < nodes.length; i++) {
      const prev = nodes[i - 1];
      const curr = nodes[i];

      for (let s = 1; s <= STEPS; s++) {
        const t = s / STEPS;
        const baseX = prev.x + (curr.x - prev.x) * t;
        const baseY = prev.y + (curr.y - prev.y) * t;

        const angle = Math.atan2(curr.y - prev.y, curr.x - prev.x);
        // Phase shifts over time → organic flowing motion
        const envelope = 1 - Math.abs(t - 0.5) * 1.2;
        const ripple = Math.sin(t * Math.PI * 2 * FREQ + phase + i * 1.5) * RIPPLE * Math.max(0, envelope);
        const rx = baseX + Math.cos(angle + Math.PI / 2) * ripple;
        const ry = baseY + Math.sin(angle + Math.PI / 2) * ripple;

        d += ` L ${rx.toFixed(1)} ${ry.toFixed(1)}`;
      }
    }
    return d;
  };

  // Initial static path for SSR (used as d= on the SVG paths before the rAF loop starts)
  const initialPathD = buildWavyPath(0);

  // Animate the path ripples over time + scroll-driven fill
  useEffect(() => {
    let running = true;
    let rafId: number;
    let currentFillOffset = 99999;
    // Cache path length — getTotalLength() forces browser layout and is expensive.
    // Compute once (it never changes for a static path) and reuse every frame.
    let cachedTotalLen = -1;

    const tick = (time: number) => {
      if (!running) return;

      const t = tuneRef.current;

      // 1. Static deterministic path geometry (no wobbly vertex distortion over time)
      const canvas = canvasRef.current;
      const fill = fillRef.current;
      if (canvas && fill) {
        // Compute path length only once — force-reflow every frame was the cursor freeze
        if (cachedTotalLen < 0) {
          cachedTotalLen = fill.getTotalLength();
          fill.style.strokeDasharray = `${cachedTotalLen}`;
        }
        const totalLen = cachedTotalLen;
        if (currentFillOffset > totalLen) currentFillOffset = totalLen;

        const rect = canvas.getBoundingClientRect();
        const viewH = window.innerHeight;

        // Lock boat 1:1 with viewport scroll position matching first node to last node
        const startY = nodes[0]?.y ?? 50;
        const endY = nodes[nodes.length - 1]?.y ?? (totalH - 300);

        const viewportFocusY = viewH * (t.scrollStartMul ?? 0.45);
        const relativeScrollY = viewportFocusY - rect.top;

        // Calculate maximum reachable relative Y on current viewport height so progress reaches 1.0 at full scroll
        const maxReachableY = Math.min(endY, Math.max(startY + 100, totalH - viewH + viewportFocusY));
        const rawProgress = (relativeScrollY - startY) / Math.max(1, maxReachableY - startY);
        const progress = Math.max(0, Math.min(1, rawProgress * (t.speedMultiplier ?? 1.0)));
        const shipAdvance = t.shipAdvancePx ?? 80;
        const lineLead = t.lineFillLeadPx ?? 0;
        // Calculate target ship position along path
        const rawShipDist = Math.max(0, Math.min(totalLen, progress * totalLen + shipAdvance));
        // Sync solid blue line fill length with ship position + line lead offset
        const targetOffset = totalLen - (rawShipDist + lineLead);

        // Section is in range when the scroll focus position reaches the canvas top and bottom hasn't completely scrolled out
        const isSectionInRange = relativeScrollY > 0 && rect.bottom > -200;
        if (hasScrolledIntoRangeRef.current !== isSectionInRange) {
          hasScrolledIntoRangeRef.current = isSectionInRange;
          setHasScrolledIntoRange(isSectionInRange);
        }

        if (t.lerpSpeed >= 0.95) {
          currentFillOffset = targetOffset;
        } else {
          currentFillOffset += (targetOffset - currentFillOffset) * t.lerpSpeed;
        }
        fill.style.strokeDashoffset = `${currentFillOffset}`;

        const shipDist = Math.max(0, Math.min(totalLen, totalLen - currentFillOffset));
        const pt = fill.getPointAtLength(shipDist);

        // Scale boat down when directly over day circle node, controlled by nodeDipRadius & nodeAction
        let minNodeDist = 999;
        let closestIdx = 0;
        const nextVisited: Record<number, boolean> = {};

        nodes.forEach((node, i) => {
          const ndx = pt.x - node.x;
          const ndy = pt.y - node.y;
          const dist = Math.sqrt(ndx * ndx + ndy * ndy);
          if (dist < minNodeDist) {
            minNodeDist = dist;
            closestIdx = i;
          }

          // Node i is active/passed if section is in range AND (ship is within 90px OR progress reaches node i)
          if (isSectionInRange) {
            if (dist < 90 || (i === 0 ? progress > 0.005 : pt.y >= node.y - 30)) {
              nextVisited[i] = true;
            }
          }
        });

        // Update visited nodes state if changed during forward or reverse scrolling
        const visitedChanged = nodes.some((_, i) => !!visitedNodesRef.current[i] !== !!nextVisited[i]);
        if (visitedChanged) {
          visitedNodesRef.current = nextVisited;
          setVisitedNodes(nextVisited);
        }

        const inProximity = minNodeDist < 90;

        if (activeNodeRef.current !== closestIdx) {
          activeNodeRef.current = closestIdx;
          setActiveNodeIndex(closestIdx);
        }

        if (isShipInNodeProximityRef.current !== inProximity) {
          isShipInNodeProximityRef.current = inProximity;
          setIsShipInNodeProximity(inProximity);
        }

        shipScaleFactorRef.current = 1.0;
        const opacityVal = 1.0;
        
        // Compute direction tangent for ship heading angle (sample 24px behind & ahead for smooth angle)
        const pPrev = fill.getPointAtLength(Math.max(0, shipDist - 24));
        const pNext = fill.getPointAtLength(Math.min(totalLen, shipDist + 24));
        const dx = pNext.x - pPrev.x;
        const dy = pNext.y - pPrev.y;
        const headingLeft = dx < 0;
        const rawAngle = headingLeft ? Math.atan2(-dy, -dx) : Math.atan2(dy, dx);

        // Clamp maximum pitch angle to max ±22 degrees (0.38 rad) so the boat never nose-dives or looks like it's sinking
        const MAX_TILT = (22 * Math.PI) / 180;
        const angle = Math.max(-MAX_TILT, Math.min(MAX_TILT, rawAngle));

        shipRotYRef.current = headingLeft ? Math.PI : 0;

        if (shipContainerRef.current) {
          const xPct = (pt.x / SVG_W) * 100;
          const yPct = (pt.y / totalH) * 100;

          shipContainerRef.current.style.left = `${xPct}%`;
          shipContainerRef.current.style.top = `${yPct}%`;
          shipContainerRef.current.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
          shipContainerRef.current.style.opacity = opacityVal.toFixed(3);
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    // getTotalLength() + getPointAtLength() force browser layout reflow every frame.
    // Starting this loop while the page-transition wave is animating stalls the wave's
    // own rAF and causes it to freeze mid-animation. Defer until the wave exits.
    const startLoop = () => { if (running) rafId = requestAnimationFrame(tick); };

    if ((window as any).__pageTransitionActive) {
      window.addEventListener('7h:pagetransition:done', startLoop, { once: true });
      const fallback = setTimeout(startLoop, 3000);
      return () => {
        running = false;
        cancelAnimationFrame(rafId);
        clearTimeout(fallback);
        window.removeEventListener('7h:pagetransition:done', startLoop);
      };
    } else {
      startLoop();
      return () => { running = false; cancelAnimationFrame(rafId); };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itinerary.length, layoutMode]);


  /* ── Scroll-driven card reveal ── */
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    cardRefs.current.forEach((card) => {
      if (!card) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            card.classList.add(styles.cardVisible);
            obs.disconnect();
          }
        },
        { threshold: 0.15 }
      );
      obs.observe(card);
      observers.push(obs);
    });

    return () => observers.forEach(obs => obs.disconnect());
  }, [itinerary.length, layoutMode]);

  if (!itinerary || itinerary.length === 0) return null;

  return (
    <section className={styles.root} ref={sectionRef}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <span className={styles.eyebrow}><span>—</span> Your Voyage <span>—</span></span>
        <h2 id="itinerary" className={styles.title}>Official Itinerary</h2>

        {/* ── FIXED RIGHT SIDEBAR SETTINGS DRAWER (PORTAL TO BODY FOR TOP-MOST STACKING) ── */}
        {showSettings && mounted && createPortal(
          <div 
            data-settings-panel
            className="fixed top-16 right-4 w-[820px] max-w-[94vw] max-h-[90vh] overflow-y-auto p-5 bg-[var(--color-bg-deep)]/40 border-2 border-cyan-400/50 rounded-3xl shadow-[0_0_70px_rgba(6,182,212,0.35)] text-left animate-in slide-in-from-right duration-300 opacity-100"
            style={{ zIndex: 999999, pointerEvents: 'auto' }}
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

            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 sticky top-0 bg-[var(--color-bg-deep)]/60 pt-1 z-10">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                <div>
                  <h3 className="text-white font-black text-sm uppercase tracking-wide">SVG Path, Speed & Boat Controls</h3>
                  <p className="text-white/40 text-xs">All real-time physics tuning parameters</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-white/60 hover:text-white text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl cursor-pointer transition-all"
              >
                ✕ Close
              </button>
            </div>

            {/* Controls Sliders Grid — 2-Column organized sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              
              {/* SECTION 1: Velocity & Viewport Triggers */}
              <div className="md:col-span-2 bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-400/40 p-3.5 rounded-2xl space-y-2 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <div className="flex justify-between items-center text-cyan-300 font-black text-sm">
                  <span>⚡ Cruise Boat & Line Travel Speed</span>
                  <span className="text-cyan-400 font-mono text-base">{((tuning.speedMultiplier ?? 1.0)).toFixed(1)}x</span>
                </div>
                <input
                  type="range" min="0.2" max="4.0" step="0.1"
                  value={tuning.speedMultiplier ?? 1.0}
                  onChange={e => setTuning({ ...tuning, speedMultiplier: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer h-2"
                />
                <div className="flex justify-between text-[var(--font-size-3xs)] text-white/50 font-bold uppercase tracking-wider">
                  <span>0.2x (Slow Motion)</span>
                  <span>1.0x (1:1 Viewport Lock)</span>
                  <span>4.0x (Hyper Speed)</span>
                </div>
              </div>

              {/* Ship Bow Path Advance Offset */}
              <div className="bg-black/60 border border-white/10 p-3 rounded-2xl space-y-1.5">
                <div className="flex justify-between items-center text-white/90 font-bold">
                  <span>🚢 Ship Bow Path Advance Offset</span>
                  <span className="text-cyan-400 font-mono">{(tuning.shipAdvancePx ?? 80)}px</span>
                </div>
                <input
                  type="range" min="-200" max="300" step="5"
                  value={tuning.shipAdvancePx ?? 80}
                  onChange={e => setTuning({ ...tuning, shipAdvancePx: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Blue Line Lead / Lag Offset */}
              <div className="bg-black/60 border border-white/10 p-3 rounded-2xl space-y-1.5">
                <div className="flex justify-between items-center text-white/90 font-bold">
                  <span>🌊 Blue Line Lead/Lag Offset</span>
                  <span className="text-cyan-400 font-mono">{(tuning.lineFillLeadPx ?? 0)}px</span>
                </div>
                <input
                  type="range" min="-200" max="200" step="5"
                  value={tuning.lineFillLeadPx ?? 0}
                  onChange={e => setTuning({ ...tuning, lineFillLeadPx: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Start Trigger Location */}
              <div className="bg-black/60 border border-white/10 p-3 rounded-2xl space-y-1.5">
                <div className="flex justify-between items-center text-white/90 font-bold">
                  <span>📍 Start Trigger Location</span>
                  <span className="text-cyan-400 font-mono">{((tuning.scrollStartMul ?? 0.48) * 100).toFixed(0)}% Screen</span>
                </div>
                <input
                  type="range" min="0.0" max="1.0" step="0.01"
                  value={tuning.scrollStartMul ?? 0.48}
                  onChange={e => setTuning({ ...tuning, scrollStartMul: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* End Trigger Location */}
              <div className="bg-black/60 border border-white/10 p-3 rounded-2xl space-y-1.5">
                <div className="flex justify-between items-center text-white/90 font-bold">
                  <span>📍 End Trigger Location</span>
                  <span className="text-cyan-400 font-mono">{((tuning.scrollEndMul ?? 0.5) * 100).toFixed(0)}% Screen</span>
                </div>
                <input
                  type="range" min="0.0" max="1.0" step="0.01"
                  value={tuning.scrollEndMul ?? 0.5}
                  onChange={e => setTuning({ ...tuning, scrollEndMul: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Start Node Padding */}
              <div className="bg-black/60 border border-white/10 p-3 rounded-2xl space-y-1.5">
                <div className="flex justify-between items-center text-white/90 font-bold">
                  <span>🛑 Start Path Padding</span>
                  <span className="text-cyan-400 font-mono">{tuning.minShipDist ?? 0}px</span>
                </div>
                <input
                  type="range" min="0" max="400" step="10"
                  value={tuning.minShipDist ?? 0}
                  onChange={e => setTuning({ ...tuning, minShipDist: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* End Node Padding */}
              <div className="bg-black/60 border border-white/10 p-3 rounded-2xl space-y-1.5">
                <div className="flex justify-between items-center text-white/90 font-bold">
                  <span>🏁 End Path Finish Padding</span>
                  <span className="text-cyan-400 font-mono">{tuning.maxShipDistPad ?? 0}px</span>
                </div>
                <input
                  type="range" min="0" max="400" step="10"
                  value={tuning.maxShipDistPad ?? 0}
                  onChange={e => setTuning({ ...tuning, maxShipDistPad: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Anchor X Offset */}
              <div className="bg-black/60 border border-white/10 p-3 rounded-2xl space-y-1.5">
                <div className="flex justify-between items-center text-white/90 font-bold">
                  <span>⚓ Anchor X Offset</span>
                  <span className="text-cyan-400 font-mono">{tuning.anchorOffsetX ?? 0}px</span>
                </div>
                <input
                  type="range" min="-100" max="100" step="1"
                  value={tuning.anchorOffsetX ?? 0}
                  onChange={e => setTuning({ ...tuning, anchorOffsetX: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Anchor Y Offset */}
              <div className="bg-black/60 border border-white/10 p-3 rounded-2xl space-y-1.5">
                <div className="flex justify-between items-center text-white/90 font-bold">
                  <span>⚓ Anchor Y Offset</span>
                  <span className="text-cyan-400 font-mono">{tuning.anchorOffsetY ?? 0}px</span>
                </div>
                <input
                  type="range" min="-100" max="100" step="1"
                  value={tuning.anchorOffsetY ?? 0}
                  onChange={e => setTuning({ ...tuning, anchorOffsetY: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* 3D Ship Model Scale */}
              <div className="bg-black/30 border border-white/10 p-3 rounded-2xl space-y-1.5 backdrop-blur-sm">
                <div className="flex justify-between items-center text-white/90 font-bold">
                  <span>🔎 3D Ship Scale</span>
                  <span className="text-cyan-400 font-mono">{(tuning.shipScale ?? 1.8).toFixed(2)}x</span>
                </div>
                <input
                  type="range" min="0.05" max="8.0" step="0.05"
                  value={tuning.shipScale ?? 1.8}
                  onChange={e => setTuning({ ...tuning, shipScale: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* 3D Hull Y Offset */}
              <div className="bg-black/60 border border-white/10 p-3 rounded-2xl space-y-1.5">
                <div className="flex justify-between items-center text-white/90 font-bold">
                  <span>⚓ Hull Y Path Offset</span>
                  <span className="text-cyan-400 font-mono">{(tuning.shipOffsetY ?? 0.9).toFixed(1)}</span>
                </div>
                <input
                  type="range" min="0.0" max="3.0" step="0.1"
                  value={tuning.shipOffsetY ?? 0.9}
                  onChange={e => setTuning({ ...tuning, shipOffsetY: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* ── PORT CIRCLE & CORNER BEHAVIOR CONTROLS ── */}
              <div className="col-span-1 md:col-span-2 bg-cyan-950/40 border border-cyan-500/30 p-4 rounded-2xl space-y-3 mt-2">
                <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-2">
                  <span className="text-lg">📍</span>
                  <h3 className="text-white font-black uppercase text-xs tracking-wider">Port Circle & Corner Arrival Controls</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Action Mode Toggle */}
                  <div className="bg-black/60 border border-white/10 p-3 rounded-xl space-y-1.5">
                    <label className="block text-xs font-bold text-white/90">🎭 Port Circle Action</label>
                    <div className="flex gap-1.5 pt-1">
                      {[
                        { id: 'hide', label: '🙈 Hide & Flip' },
                        { id: 'bounce', label: '🏀 Elastic Bounce' },
                        { id: 'spin', label: '🌀 Spin & Dock' },
                      ].map(act => (
                        <button
                          key={act.id}
                          onClick={() => setTuning({ ...tuning, nodeAction: act.id })}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[var(--font-size-3xs)] font-black uppercase tracking-wider transition-all ${
                            (tuning.nodeAction ?? 'hide') === act.id
                              ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                              : 'bg-white/5 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Min Scale Over Circle */}
                  <div className="bg-black/60 border border-white/10 p-3 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-white/90">
                      <span>🔎 Min Scale Over Circle</span>
                      <span className="text-cyan-400 font-mono">{(tuning.nodeMinScale ?? 0.0).toFixed(2)}x</span>
                    </div>
                    <input
                      type="range" min="0.0" max="1.0" step="0.05"
                      value={tuning.nodeMinScale ?? 0.0}
                      onChange={e => setTuning({ ...tuning, nodeMinScale: Number(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Scale Down Distance */}
                  <div className="bg-black/60 border border-white/10 p-3 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-white/90">
                      <span>📏 Scale Down Trigger Radius</span>
                      <span className="text-cyan-400 font-mono">{tuning.nodeDipRadius ?? 65}px</span>
                    </div>
                    <input
                      type="range" min="20" max="250" step="5"
                      value={tuning.nodeDipRadius ?? 65}
                      onChange={e => setTuning({ ...tuning, nodeDipRadius: Number(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Re-appear Pop Distance */}
                  <div className="bg-black/60 border border-white/10 p-3 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-white/90">
                      <span>🚀 Re-appear Pop Distance</span>
                      <span className="text-cyan-400 font-mono">{tuning.nodePopDist ?? 60}px</span>
                    </div>
                    <input
                      type="range" min="20" max="200" step="5"
                      value={tuning.nodePopDist ?? 60}
                      onChange={e => setTuning({ ...tuning, nodePopDist: Number(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Boat Smoothness Lerp */}
              <div className="bg-black/60 border border-white/10 p-3 rounded-2xl space-y-1.5">
                <div className="flex justify-between items-center text-white/90 font-bold">
                  <span>🚢 Tracking Smoothness Lerp</span>
                  <span className="text-cyan-400 font-mono">{(tuning.lerpSpeed ?? 0.85).toFixed(2)}</span>
                </div>
                <input
                  type="range" min="0.05" max="1.0" step="0.05"
                  value={tuning.lerpSpeed ?? 0.85}
                  onChange={e => setTuning({ ...tuning, lerpSpeed: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Wave Ripple Height */}
              <div className="bg-black/60 border border-white/10 p-3 rounded-2xl space-y-1.5">
                <div className="flex justify-between items-center text-white/90 font-bold">
                  <span>🌊 Wave Ripple Height</span>
                  <span className="text-cyan-400 font-mono">{tuning.rippleAmp ?? 7}px</span>
                </div>
                <input
                  type="range" min="0" max="40" step="1"
                  value={tuning.rippleAmp ?? 7}
                  onChange={e => setTuning({ ...tuning, rippleAmp: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Wave Animation Speed */}
              <div className="bg-black/60 border border-white/10 p-3 rounded-2xl space-y-1.5">
                <div className="flex justify-between items-center text-white/90 font-bold">
                  <span>⏱️ Wave Motion Speed</span>
                  <span className="text-cyan-400 font-mono">{((tuning.waveSpeed ?? 0.0011) * 10000).toFixed(1)}</span>
                </div>
                <input
                  type="range" min="0.0001" max="0.0050" step="0.0001"
                  value={tuning.waveSpeed ?? 0.0011}
                  onChange={e => setTuning({ ...tuning, waveSpeed: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* SVG Line Thickness */}
              <div className="bg-black/60 border border-white/10 p-3 rounded-2xl space-y-1.5">
                <div className="flex justify-between items-center text-white/90 font-bold">
                  <span>📏 SVG Line Thickness</span>
                  <span className="text-cyan-400 font-mono">{tuning.lineWidth ?? 6}px</span>
                </div>
                <input
                  type="range" min="2" max="20" step="1"
                  value={tuning.lineWidth ?? 6}
                  onChange={e => setTuning({ ...tuning, lineWidth: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* SVG Glow Radius */}
              <div className="bg-black/60 border border-white/10 p-3 rounded-2xl space-y-1.5">
                <div className="flex justify-between items-center text-white/90 font-bold">
                  <span>✨ Neon Glow Blur</span>
                  <span className="text-cyan-400 font-mono">{tuning.glowBlur ?? 6}px</span>
                </div>
                <input
                  type="range" min="0" max="25" step="1"
                  value={tuning.glowBlur ?? 6}
                  onChange={e => setTuning({ ...tuning, glowBlur: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-white/10 sticky bottom-0 bg-[var(--color-bg-deep)]/40 backdrop-blur-md pb-1 z-10">
              <button
                onClick={handleResetTuning}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-white/10 cursor-pointer"
              >
                🔄 Reset to Defaults
              </button>

              <div className="flex items-center gap-3">
                {saveToast && (
                  <span className="text-xs font-bold text-emerald-400 animate-in fade-in duration-300">
                    ✓ Settings Saved!
                  </span>
                )}
                <button
                  onClick={handleSaveTuning}
                  className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
                >
                  💾 Save Settings
                </button>
              </div>
            </div>

          </div>,
          document.body
        )}



      </div>

      {/* ── CANVAS: Holds the SVG Track + 3D Cruise Ship + HTML Card Layout ── */}
      <div ref={canvasRef} className={styles.canvas} style={{ height: totalH, maxWidth: SVG_W }}>
        {/* SVG — path + nodes */}
        <svg
          className={styles.svg}
          viewBox={`0 0 ${SVG_W} ${totalH}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* FULL ROUTE GUIDE TRACK — Hidden transparent guide path */}
          <path
            ref={trackRef}
            d={initialPathD}
            fill="none"
            stroke="transparent"
            strokeWidth="0"
            opacity="0"
          />

          {/* BRIGHT FILL — scroll-driven, fills as you travel */}
          <path
            ref={fillRef}
            d={initialPathD}
            fill="none"
            stroke="#06b6d4"
            strokeWidth={tuning.lineWidth ?? 6}
            strokeLinecap="round"
          />

          {/* Flowing current dashes on the fill */}
          <path
            ref={currentRef}
            d={initialPathD}
            fill="none"
            stroke="rgba(6,182,212,0.9)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="12 24 6 18"
            className={styles.waterCurrent}
          />

          {/* Bright flowing highlights */}
          <path
            ref={highlightRef}
            d={initialPathD}
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="4 40 2 50"
            className={styles.waterHighlight}
          />

        </svg>

        {/* HTML cards — absolutely positioned at each node's coordinates according to layoutMode */}
        {nodes.map((node, i) => {
          const topPct  = (node.y / totalH) * 100;
          const leftPct = (node.x / SVG_W) * 100;
          const day = itinerary[i];
          const themeColor = day.colorTheme || (node.isLeft ? '#06b6d4' : '#a855f7');
          const dayImage = isAtSeaDay(day)
            ? '/images/cruise/at-sea.png'
            : (day?.photo || DAY_IMAGES[i % 6]);

          const cardContent = (
            <div className="group">
              {dayImage && (
                <div className="relative aspect-[21/9] -mx-10 -mt-9 w-[calc(100%+80px)] rounded-t-[24px] overflow-hidden mb-4 shadow-[0_4px_25px_rgba(0,0,0,0.5)] transition-all duration-500 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_25%,rgba(0,0,0,0)_100%)] [-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_25%,rgba(0,0,0,0)_100%)]">
                  <img 
                    src={dayImage} 
                    alt={day.theme} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                </div>
              )}
              {/* Card content header */}
              <h3 className={styles.cardTitle}>{day.theme}</h3>
              <ul className={styles.eventsList}>
                {day.events.map(ev => (
                  <li key={ev.id} className={styles.eventItem}>
                    <span className={styles.eventTime} style={{ color: themeColor }}>{ev.time}</span>
                    <div>
                      <div className={styles.eventTitle}>{ev.title}</div>
                      {ev.subtitle && <div className={styles.eventSubtitle}>{ev.subtitle}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );

          // Card layout positioning logic per layoutMode
          let cardStyle: React.CSSProperties = {
            position: 'absolute',
            top: `${topPct}%`,
            zIndex: 20,
          };

          if (layoutMode === 'harbor') {
            // All cards aligned cleanly to the right of the harbor channel
            cardStyle = {
              ...cardStyle,
              left: '220px',
              width: '740px',
            };
          } else if (layoutMode === 'center') {
            // Cards centered directly along the central channel
            cardStyle = {
              ...cardStyle,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '760px',
              maxWidth: '760px',
            };
          } else if (layoutMode === 'zigzag') {
            // Compact zig-zag cards
            cardStyle = {
              ...cardStyle,
              ...(node.isLeft
                ? { left: `${leftPct}%` }
                : { right: `${100 - leftPct}%` }
              ),
              width: '640px',
            };
          } else {
            // Wide Screen Sweep (default) — aligned with nav text padding (72px desktop / clamp)
            cardStyle = {
              ...cardStyle,
              ...(node.isLeft
                ? { left: 'clamp(24px, 5vw, 72px)' }
                : { right: 'clamp(24px, 5vw, 72px)' }
              ),
              width: 'min(620px, 42vw)',
            };
          }

          return (
            <div
              key={i}
              ref={el => { cardRefs.current[i] = el; }}
              className={`${styles.card} ${node.isLeft ? styles.cardLeft : styles.cardRight}`}
              style={cardStyle}
            >
              {cardContent}
            </div>
          );
        })}

        {/* 3D Cruise Ship follower riding the leading edge of the SVG fill */}
        <div
          ref={shipContainerRef}
          style={{
            position: 'absolute',
            width: isMobile ? 220 : 380,
            height: isMobile ? 220 : 380,
            pointerEvents: 'none',
            zIndex: 5,
            overflow: 'visible',
            transition: 'none',
            filter: 'none',
          }}
        >
          <Canvas
            orthographic
            gl={{ powerPreference: 'high-performance', antialias: true, alpha: true }}
            camera={{ left: -250, right: 250, top: 250, bottom: -250, zoom: isMobile ? 42 : 55, position: [0, 0, 100] }}
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 10, 5]} intensity={2} />
            <pointLight position={[-5, 5, -5]} intensity={1} color="#06b6d4" />
            <Suspense fallback={null}>
              <ShipModel
                scale={tuning.shipScale || 1.0}
                offsetY={tuning.shipOffsetY}
                shipRotYRef={shipRotYRef}
                shipScaleFactorRef={shipScaleFactorRef}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Node circle ring HTML overlays — video element always rendered, paused until ship reaches/passes node */}
        {nodes.map((node, i) => {
          const day = itinerary[i];
          const isSea = isAtSeaDay(day);
          const isActive = activeNodeIndex === i;
          const isPassed = visitedNodes[i];
          const videoSrc = isSea ? "/movie/ship-sea.mp4" : "/movie/ship-port.mp4";

          const themeColor = day.colorTheme || (node.isLeft ? '#06b6d4' : '#a855f7');
          const formatNodeBadgeText = (d: ItineraryDay, idx: number) => {
            const isSeaDay = isAtSeaDay(d);
            const loc = (d.location || '').toLowerCase();
            let locName = 'PORT';
            if (isSeaDay) locName = 'DAY AT SEA';
            else if (loc.includes('maarten')) locName = 'ST. MAARTEN';
            else if (loc.includes('thomas')) locName = 'ST. THOMAS';
            else if (loc.includes('cococay')) locName = 'COCOCAY';
            else if (loc.includes('canaveral')) locName = 'PORT CANAVERAL';
            else if (loc.includes('roatan')) locName = 'ROATAN';
            else if (loc.includes('cozumel')) locName = 'COZUMEL';
            else locName = (d.location || '').split(',')[0].trim().toUpperCase();

            return `DAY ${idx + 1} · ${locName}`;
          };

          return (
            <React.Fragment key={`node-group-${i}`}>
              <div
                style={{
                  position: 'absolute',
                  left: `clamp(140px, ${(node.x / SVG_W) * 100}%, calc(100% - 140px))`,
                  top: `calc(${(node.y / totalH) * 100}% - ${isMobile ? (isActive ? 64 : 56) : (isActive ? 76 : 68)}px)`,
                  transform: 'translateX(-50%)',
                  zIndex: 35,
                  pointerEvents: 'none',
                  color: themeColor,
                  backgroundColor: '#060614',
                  borderColor: `color-mix(in srgb, ${themeColor} 40%, transparent)`,
                  boxShadow: 'none',
                }}
                className={`whitespace-nowrap border text-[var(--font-size-2xs)] font-black uppercase tracking-widest px-4 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5 transition-all duration-300 ${
                  isActive ? 'scale-105 opacity-100' : 'opacity-85'
                }`}
              >
                <span>{isSea ? '🌊' : '📍'}</span> {formatNodeBadgeText(day, i)}
              </div>
              <div
                key={`node-ring-${i}`}
                style={{
                  position: 'absolute',
                  left: `${(node.x / SVG_W) * 100}%`,
                  top: `${(node.y / totalH) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: isMobile ? (isActive ? 89 : 73) : (isActive ? 109 : 93),
                  height: isMobile ? (isActive ? 89 : 73) : (isActive ? 109 : 93),
                  borderRadius: '50%',
                  backgroundColor: '#0a0a12',
                  border: isActive ? '3px solid #06b6d4' : '2px solid rgba(6,182,212,0.4)',
                  boxShadow: 'none',
                  zIndex: isActive ? 30 : 25,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CircleVideoNode
                  src={videoSrc}
                  shouldPlay={hasScrolledIntoRange && (isActive || isPassed)}
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
