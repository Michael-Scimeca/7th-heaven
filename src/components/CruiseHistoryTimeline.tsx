/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/three-prefer-set-animation-loop, react-doctor/no-high-complexity-react-function */
/* oxlint-disable react-doctor/control-has-associated-label, react-doctor/label-has-associated-control */
/* eslint-disable react-doctor/control-has-associated-label, react-doctor/label-has-associated-control */
"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { Canvas, useFrame, invalidate } from "@react-three/fiber";
import { StatsGl, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const emptySubscribe = () => () => { };

import { suppressBlobTextureErrors } from "@/lib/suppressBlobTextureErrors";
import { SectionBadge } from "./SectionBadge";

// Suppress blob URL texture errors that occur during page transitions
suppressBlobTextureErrors();

interface ShipErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ShipErrorBoundaryState {
  hasError: boolean;
}

class ShipErrorBoundary extends React.Component<ShipErrorBoundaryProps, ShipErrorBoundaryState> {
  constructor(props: ShipErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("3D Ship GLTF failed to load, rendering procedural fallback:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

function FallbackTopDownShip({
  shipScaleRef,
}: {
  shipScaleRef: React.RefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ camera }) => {
    const targetLengthPx = shipScaleRef.current ?? 150;
    if (groupRef.current) {
      groupRef.current.rotation.set(0, 0, 0);
      const scale = targetLengthPx / 10;
      groupRef.current.scale.set(scale, scale, scale);
      groupRef.current.updateMatrixWorld(true);
    }
    if (camera && "zoom" in camera) {
      const orthCamera = camera as THREE.OrthographicCamera;
      orthCamera.zoom = 1;
      orthCamera.updateProjectionMatrix();
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 1, 8]} />
        <meshStandardMaterial color="#9e852a" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, -4.5]} rotation={[0, 0, 0]}>
        <coneGeometry args={[1.5, 3, 4]} />
        <meshStandardMaterial color="#9e852a" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.8, -0.5]}>
        <boxGeometry args={[2.2, 0.8, 4.5]} />
        <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.5} />
      </mesh>
    </group>
  );
}

// 3D ship model is loaded lazily when the timeline mounts in viewport

function TopDownHistoryShip({
  shipScaleRef,
}: {
  shipScaleRef: React.RefObject<number>;
}) {
  const { scene } = useGLTF("/objects/ship.glb");
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
    if (camera && "zoom" in camera) {
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
  scalingCurve: "linear" | "exponential" | "stepped";
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

const DEFAULT_HISTORY_TUNING: HistoryTuningConfig = {
  startScale: 0.85,
  endScale: 2.4,
  scalingCurve: "linear",
  growthCurveExp: 1.5,
  shipOffsetX: 0,
  shipOffsetY: 0,
  bowOffsetPx: 145,
  scrollStartMul: 0.5,
  scrollEndMul: 0.5,
  scrubDamping: 0.5,
  lineWidth: 6,
  lineColor: "#780aed",
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

  const containerDimensionsRef = useRef<{ w: number; h: number; top: number }>({
    w: 1400,
    h: 2000,
    top: 0,
  });

  const [desktopPathLength, setDesktopPathLength] = useState(0);
  const [mobilePathLength, setMobilePathLength] = useState(0);

  const [pathD, setPathD] = useState("");
  const [staticFuturePathD, setStaticFuturePathD] = useState("");
  const [svgSize, setSvgSize] = useState({ w: 1400, h: 2000 });
  const [mobileSvgSize, setMobileSvgSize] = useState({ w: 400, h: 3000 });

  const [tuning, setTuning] = useState<HistoryTuningConfig>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedStr = localStorage.getItem("7h_history_tuning_v6");
        if (savedStr) {
          const parsed = JSON.parse(savedStr);
          if (parsed.lineColor === "#06b6d4") parsed.lineColor = "#780aed";
          return { ...DEFAULT_HISTORY_TUNING, ...parsed };
        }
      } catch { }
    }
    return DEFAULT_HISTORY_TUNING;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const latestProgressRef = useRef(0);

  const handleSaveTuning = () => {
    try {
      localStorage.setItem("7h_history_tuning_v6", JSON.stringify(tuning));
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch { }
  };

  const handleResetTuning = () => {
    setTuning(DEFAULT_HISTORY_TUNING);
    try {
      localStorage.removeItem("7h_history_tuning");
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch { }
  };

  const isMobile = useSyncExternalStore(
    (callback) => {
      window.addEventListener("resize", callback);
      return () => window.removeEventListener("resize", callback);
    },
    () => (typeof window !== "undefined" ? window.innerWidth < 768 : false),
    () => false,
  );

  // Reverse history so timeline starts at 1998 (Inaugural Voyage) and proceeds chronologically to 2028
  const chronologicalHistory = React.useMemo(() => [...history].reverse(), [history]);

  // Chunk history items dynamically: 1 item per row on mobile, 3 items per row on desktop
  const chunkSize = isMobile ? 1 : 3;
  const rows: HistoryItem[][] = [];
  for (let i = 0; i < chronologicalHistory.length; i += chunkSize) {
    rows.push(chronologicalHistory.slice(i, i + chunkSize));
  }

  const idx2026 = chronologicalHistory.findIndex((h) => h.year === "2026");
  const max2026Ratio =
    idx2026 >= 0
      ? idx2026 / Math.max(1, chronologicalHistory.length - 1)
      : 0.88;
  const maxMobileHeight = max2026Ratio * (mobileSvgSize.h || 3000);

  const [pathLengthTo2026, setPathLengthTo2026] = useState<number | null>(null);
  const pathLengthTo2026Ref = useRef<number | null>(null);
  const row2026OffsetTopRef = useRef<number | null>(null);
  const rowCentersRef = useRef<number[]>([]);
  const rowPathLengthsRef = useRef<number[]>([]);
  const badgePathLengthsRef = useRef<number[]>([]);
  const [badgePathLengths, setBadgePathLengths] = useState<number[]>([]);

  const currentShipLengthRef = useRef<number>(0);
  const shipMaxTravelLengthRef = useRef<number>(0);
  const [reachedBadges, setReachedBadges] = useState<boolean[]>([]);
  const reachedBadgesRef = useRef<boolean[]>([]);
  const desktopGlowPathRef = useRef<SVGPathElement>(null);

  // Position ship dynamically using SVG path and relative container percentages
  const updateShipPosition = useCallback(
    (scrollProgress: number) => {
      if (
        !desktopPathRef.current ||
        !shipDivRef.current ||
        !desktopContainerRef.current
      )
        return;
      const pathLength = desktopPathRef.current.getTotalLength();
      if (pathLength <= 0) return;

      const scrollProgressClamped = Math.min(1.0, Math.max(0, scrollProgress));
      const maxTravelLen = Math.max(
        0,
        pathLength - (tuning.bowOffsetPx ?? 145),
      );
      shipMaxTravelLengthRef.current = maxTravelLen;

      const xProgress = Math.min(1.0, scrollProgressClamped * 1.35);
      const pathDistance = Math.min(
        maxTravelLen,
        Math.max(0, xProgress * maxTravelLen),
      );
      currentShipLengthRef.current = pathDistance;

      const containerW = containerDimensionsRef.current.w || 1400;
      const containerH = containerDimensionsRef.current.h || 1;
      const widthScale = Math.max(0.5, containerW / 1400);

      const startPx = 150 * widthScale;
      const endPx = 220 * widthScale;
      const targetLengthPx = startPx + xProgress * (endPx - startPx);
      shipScaleRef.current = targetLengthPx;

      const strokeOffset = Math.max(0, pathLength - pathDistance);
      desktopPathRef.current.style.strokeDashoffset = `${strokeOffset}px`;
      if (desktopGlowPathRef.current) {
        desktopGlowPathRef.current.style.strokeDashoffset = `${strokeOffset}px`;
      }

      const pt = desktopPathRef.current.getPointAtLength(pathDistance);
      const pPrev = desktopPathRef.current.getPointAtLength(
        Math.max(0, pathDistance - 15),
      );
      const pNext = desktopPathRef.current.getPointAtLength(
        Math.min(pathLength, pathDistance + 15),
      );
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

      const ship = shipDivRef.current;
      ship.style.setProperty("--ship-left", `${leftPct}%`);
      ship.style.setProperty("--ship-top", `${topPct}%`);
      ship.style.setProperty("--ship-angle", `${angle}rad`);
      ship.style.setProperty("--ship-opacity", scrollProgressClamped > 0.005 ? "1" : "0");

      invalidate();

      // Check badge reached states only and flip state if changed
      const bLengths = badgePathLengthsRef.current;
      if (bLengths.length > 0) {
        let changed = false;
        const newReached = [...reachedBadgesRef.current];
        chronologicalHistory.forEach((hist, idx) => {
          const badgePathLen = bLengths[idx] ?? Infinity;
          const is2026 = hist.year === "2026";
          const isFutureNode = hist.year === "2027" || hist.year === "2028";
          const isReached = idx === 0 || (isFutureNode
            ? false
            : is2026
              ? pathDistance > 0 && maxTravelLen > 0 && pathDistance >= maxTravelLen - 10
              : pathDistance > 0 && pathDistance >= badgePathLen - 80);
          if (newReached[idx] !== isReached) {
            newReached[idx] = isReached;
            changed = true;
          }
        });
        if (changed) {
          reachedBadgesRef.current = newReached;
          setReachedBadges(newReached);
        }
      }
    },
    [tuning, chronologicalHistory],
  );

  // Calculate single continuous SVG path string dynamically from real DOM positions
  const updatePathGeometry = useCallback(() => {
    if (!desktopContainerRef.current) return;
    const containerRect = desktopContainerRef.current.getBoundingClientRect();
    const w = containerRect.width;
    const h = containerRect.height;
    if (w === 0 || h === 0) return;
    const top = containerRect.top + (typeof window !== "undefined" ? window.scrollY : 0);
    containerDimensionsRef.current = { w, h, top };
    setSvgSize({ w, h });

    // Measure exact Y-center for each row's year badge pill
    const rowCenters: number[] = [];
    rowRefs.current.forEach((rowEl) => {
      if (rowEl) {
        const badgeEl =
          rowEl.querySelector("[data-year-badge]") ||
          rowEl.querySelector("[data-year-header-row]");
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

    const outerRight = w < 640 ? w - 16 : w - 32;
    const outerLeft = w < 640 ? 16 : 32;
    const r = w < 640 ? 16 : 32; // Corner radius matching layout spacing

    // Measure exact X-center for 2026 badge node for path termination
    const allYearBadges = Array.from(
      desktopContainerRef.current.querySelectorAll("[data-year-badge]"),
    );
    const badge2026El = allYearBadges.find((el) =>
      el.textContent?.includes("2026"),
    );
    let endX2026 = outerRight - (w < 640 ? 40 : 80);
    if (badge2026El) {
      const bRect = badge2026El.getBoundingClientRect();
      endX2026 = bRect.left - containerRect.left + bRect.width / 2;
      row2026OffsetTopRef.current = bRect.top - containerRect.top + bRect.height / 2;
    }

    const idx2026 = chronologicalHistory.findIndex((h) => h.year === "2026");
    const row2026Idx = idx2026 >= 0 ? Math.floor(idx2026 / chunkSize) : rowCenters.length - 1;

    // Active timeline rows from Row 0 (1998) through 2026 row
    const activeRowCenters = rowCenters.slice(0, row2026Idx + 1);

    // Build single continuous SVG path string terminating PRECISELY at 2026 node
    let d = `M ${startX} ${startY} V ${activeRowCenters[0] - r} A ${r} ${r} 0 0 0 ${startX + r} ${activeRowCenters[0]} H ${outerRight - r}`;

    for (let i = 0; i < activeRowCenters.length - 1; i++) {
      const yCurr = activeRowCenters[i];
      const yNext = activeRowCenters[i + 1];
      const isEven = i % 2 === 0;

      if (i === activeRowCenters.length - 2) {
        // Final row turn into 2026 row: draw line straight to the 2026 badge node!
        const turnX = isEven ? outerRight : outerLeft;
        const sweep = isEven ? 1 : 0;
        const endLineX = isEven ? outerRight - r : outerLeft + r;
        d += ` A ${r} ${r} 0 0 ${sweep} ${turnX} ${yCurr + r} V ${yNext - r} A ${r} ${r} 0 0 ${sweep} ${endLineX} ${yNext} H ${endX2026}`;
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
    const badge2028El = allYearBadges.find((el) =>
      el.textContent?.includes("2028"),
    );
    let endX2028 = w / 2;
    if (badge2028El) {
      const bRect = badge2028El.getBoundingClientRect();
      endX2028 = bRect.left - containerRect.left + bRect.width / 2;
    }

    // Build dim/unfilled connector line for 2026 -> 2027 -> 2028
    if (rowCenters.length > row2026Idx + 1) {
      const yRow2026 = rowCenters[row2026Idx];
      const yRowNext = rowCenters[row2026Idx + 1];
      const isEven2026 = row2026Idx % 2 === 0;
      const turnX = isEven2026 ? outerRight : outerLeft;
      const sweep = isEven2026 ? 1 : 0;
      const endLineX = isEven2026 ? outerRight - r : outerLeft + r;
      const futureD = `M ${endX2026} ${yRow2026} H ${endLineX} A ${r} ${r} 0 0 ${sweep} ${turnX} ${yRow2026 + r} V ${yRowNext - r} A ${r} ${r} 0 0 ${sweep} ${endLineX} ${yRowNext} H ${endX2028}`;
      setStaticFuturePathD(futureD);
    } else {
      setStaticFuturePathD("");
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
        const targetY =
          targetRect.top - containerRect.top + targetRect.height / 2;

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

      badgePathLengthsRef.current = lengths;
      setBadgePathLengths(lengths);

      const targetBadgeIdx = allYearBadges.findIndex((el) =>
        el.textContent?.includes("2026"),
      );
      if (targetBadgeIdx !== -1 && lengths[targetBadgeIdx] !== undefined) {
        pathLengthTo2026Ref.current = lengths[targetBadgeIdx];
        setPathLengthTo2026(lengths[targetBadgeIdx]);
      }
    }
  }, [chronologicalHistory, chunkSize]);

  // Update geometry & ship position on mount, window resize, and container ResizeObserver with debouncing
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout | null = null;

    const debouncedResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updatePathGeometry();
        requestAnimationFrame(() => {
          updateShipPositionRef.current(latestProgressRef.current);
        });
      }, 150);
    };

    // Immediate initial update
    updatePathGeometry();
    requestAnimationFrame(() => {
      updateShipPositionRef.current(latestProgressRef.current);
    });

    let resizeObserver: ResizeObserver | null = null;
    if (desktopContainerRef.current && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        debouncedResize();
      });
      resizeObserver.observe(desktopContainerRef.current);
    }

    window.addEventListener("resize", debouncedResize, { passive: true });
    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", debouncedResize);
    };
  }, [rows.length, updatePathGeometry]);

  // Measure path length whenever pathD updates
  useEffect(() => {
    if (desktopPathRef.current && pathD) {
      const len = Math.round(desktopPathRef.current.getTotalLength());
      setDesktopPathLength((prev) => (Math.abs(prev - len) > 1 ? len : prev));
      updateShipPosition(latestProgressRef.current);
      const t = setTimeout(() => {
        if (typeof window !== "undefined" && (window as any).__lenis) {
          (window as any).__lenis.resize();
        }
      }, 250);
      return () => clearTimeout(t);
    }
    if (mobilePathRef.current) {
      const mLen = Math.round(mobilePathRef.current.getTotalLength());
      setMobilePathLength((prev) => (Math.abs(prev - mLen) > 1 ? mLen : prev));
    }
  }, [pathD, updateShipPosition]);

  const updateShipPositionRef = useRef(updateShipPosition);
  useEffect(() => {
    updateShipPositionRef.current = updateShipPosition;
  }, [updateShipPosition]);

  // Native scroll-progress scrub with off-screen IntersectionObserver & settled tick loop
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isRunning = true;
    let isVisible = false;
    let isTicking = false;
    let rafId: number;

    const row2026El =
      rowRefs.current.find((rowEl) =>
        rowEl
          ?.querySelector("[data-year-badge]")
          ?.textContent?.includes("2026"),
      ) || null;

    const computeProgress = (
      triggerEl: HTMLElement | null,
      startVh: number,
      endEl: HTMLElement | null,
      endVh: number,
    ): number => {
      if (!triggerEl) return 0;
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const containerTop = containerDimensionsRef.current.top;
      const containerH = containerDimensionsRef.current.h;
      const startScroll = containerTop - vh * startVh;
      let endScroll: number;
      if (endEl && row2026OffsetTopRef.current !== null) {
        endScroll = containerTop + row2026OffsetTopRef.current - vh * 0.5;
      } else {
        endScroll = containerTop + containerH - vh * endVh;
      }
      if (endScroll <= startScroll) return 0;
      return Math.min(
        1,
        Math.max(0, (scrollY - startScroll) / (endScroll - startScroll)),
      );
    };

    let desktopRaw = 0;
    let mobileRaw = 0;
    let desktopSmoothed = 0;
    let mobileSmoothed = 0;
    const LERP = 0.08;

    const tick = () => {
      if (!isRunning || !isVisible) {
        isTicking = false;
        return;
      }

      let active = false;

      const desktopDiff = Math.abs(desktopRaw - desktopSmoothed);
      if (desktopDiff > 0.0001) {
        desktopSmoothed += (desktopRaw - desktopSmoothed) * LERP;
        latestProgressRef.current = desktopSmoothed;
        updateShipPositionRef.current(desktopSmoothed);
        active = true;
      }

      const mobileDiff = Math.abs(mobileRaw - mobileSmoothed);
      if (mobileDiff > 0.0001) {
        mobileSmoothed += (mobileRaw - mobileSmoothed) * LERP;
        if (mobileContainerRef.current) {
          mobileContainerRef.current.style.setProperty(
            "--mobile-progress",
            mobileSmoothed.toFixed(4),
          );
        }
        active = true;
      }

      if (active) {
        rafId = requestAnimationFrame(tick);
      } else {
        isTicking = false;
      }
    };

    const wakeTick = () => {
      if (!isTicking && isRunning && isVisible) {
        isTicking = true;
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(tick);
      }
    };

    const onScroll = () => {
      if (!isVisible) return;
      desktopRaw = computeProgress(
        desktopContainerRef.current,
        0.5,
        row2026El,
        1 - tuning.scrollEndMul,
      );
      mobileRaw = computeProgress(mobileContainerRef.current, 0.7, null, 0.4);
      wakeTick();
    };

    let observer: IntersectionObserver | null = null;
    const targetEl = desktopContainerRef.current || mobileContainerRef.current;
    if (typeof IntersectionObserver !== "undefined" && targetEl) {
      observer = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            onScroll();
            wakeTick();
          }
        },
        { rootMargin: "300px 0px" },
      );
      observer.observe(targetEl);
    } else {
      isVisible = true;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    const lenis = (window as any).__lenis;
    if (lenis) lenis.on("scroll", onScroll);

    onScroll();

    return () => {
      isRunning = false;
      cancelAnimationFrame(rafId);
      if (observer) observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      const l = (window as any).__lenis;
      if (l) l.off("scroll", onScroll);
    };
  }, [desktopPathLength, mobilePathLength, pathLengthTo2026, tuning]);
  const [maskSettings, setMaskSettings] = useState({
    itinTopFadeStart: 0,
    itinTopFadeEnd: 3,
    itinBottomFadeStart: 95,
    itinBottomFadeEnd: 100,
    itinBgOpacity: 90,
    itinBlur: 16,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("7h_cruise_hero_mask_v4");
      if (saved) {
        setMaskSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch { }

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setMaskSettings((prev) => ({ ...prev, ...customEvent.detail }));
      }
    };
    window.addEventListener("hero-mask-update", handleUpdate);
    return () => window.removeEventListener("hero-mask-update", handleUpdate);
  }, []);

  const itinTopEnd = Math.max(
    maskSettings.itinTopFadeStart,
    maskSettings.itinTopFadeEnd,
    3,
  );
  const itinBottomEnd = Math.max(
    maskSettings.itinBottomFadeStart,
    maskSettings.itinBottomFadeEnd,
  );

  return (
    <div className="py-section-fluid relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen overflow-x-clip text-left">
      {/* ── Inner Backdrop & Tint Overlay (Separated from maskImage to eliminate Chrome compositor white polygon bug) ── */}
      <div className="pointer-events-none absolute inset-0 z-0" />

      {/* Section Header — Inside Container Box */}
      <div className="relative z-20 mx-auto mb-6 max-w-4xl px-[25px] text-center md:px-[32px]">
        <span className="text-purple-400 block mb-1">
          25+ Years Legacy Pathway
        </span>
        <h3>
          Cruising{" "}
          <span className="accent-gradient-text">History & Milestones</span>
        </h3>
        <p className="mt-2">
          Explore 7th Heaven&apos;s history at sea across Royal Caribbean, MSC,
          and landmark voyages in our serpentine timeline.
        </p>

        {/* Inline Tuning Controls Toggle */}
        <div className="mt-4 flex justify-center">
          <SectionBadge
            onClick={() => setShowSettings(!showSettings)}
            isActive={showSettings}
          >
            Timeline Path & Physics Tuning
          </SectionBadge>
        </div>
      </div>

      {/* ── DESKTOP & TABLET SERPENTINE SNAKE TIMELINE (0px FULL BLEED EDGE-TO-EDGE) ── */}
      <div
        ref={desktopContainerRef}
        className="site-container relative mx-auto overflow-clip md:block"
      >
        {/* 3D Top-Down Cruise Ship Follower riding the History & Milestones serpentine path */}
        <div
          ref={shipDivRef}
          className="timeline-ship-marker pointer-events-none overflow-visible transition-none w-[400px] h-[400px]"
        >
          <Canvas
            frameloop="demand"
            dpr={[1, 1.5]}
            orthographic
            gl={{
              powerPreference: "high-performance",
              antialias: true,
              alpha: true,
            }}
            camera={{
              left: -200,
              right: 200,
              top: 200,
              bottom: -200,
              zoom: 1,
              position: [0, 350, 0],
              up: [0, 0, -1],
            }}
            style={{ width: "100%", height: "100%", overflow: "visible" }}
          >
            {process.env.NODE_ENV === "development" && (
              <StatsGl className="r3f-gpu-stats" />
            )}
            <ambientLight intensity={1.8} />
            <directionalLight position={[5, 12, 5]} intensity={2.5} />
            <pointLight
              position={[-5, 5, -5]}
              intensity={1}
              color="#9e852a"
            />
            <ShipErrorBoundary fallback={<FallbackTopDownShip shipScaleRef={shipScaleRef} />}>
              <React.Suspense fallback={null}>
                <TopDownHistoryShip shipScaleRef={shipScaleRef} />
              </React.Suspense>
            </ShipErrorBoundary>
          </Canvas>
        </div>
        {/* ONE SINGLE CONTINUOUS DYNAMIC SVG PATHWAY WITH WATER WAVE MOTION */}
        {pathD && (
          <svg
            viewBox={`0 0 ${svgSize.w} ${svgSize.h}`}
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
          >
            <defs>
              {/* Crisp Solid Ocean Cyan Gradient */}
              <linearGradient
                id="ocean-water-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#00f2fe" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>

              {/* SVG Animated Fluid Water Wave Turbulence Filter */}
              <filter
                id="water-wave-motion"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.02 0.05"
                  numOctaves="2"
                  result="noise"
                >
                  <animate
                    attributeName="baseFrequency"
                    dur="16s"
                    values="0.02 0.05; 0.04 0.08; 0.02 0.05"
                    repeatCount="indefinite"
                  />
                </feTurbulence>
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale="2.5"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>

            {/* 1. Muted Background Track Path */}
            <path
              d={pathD}
              fill="none"
              fillOpacity={0}
              stroke="rgba(98, 25, 153, 0.7)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ fill: "none", fillOpacity: 0 }}
            />

            {/* Dim/Unfilled Track Line Extension from 2026 -> 2027 -> 2028 */}
            {staticFuturePathD && (
              <path
                d={staticFuturePathD}
                fill="none"
                fillOpacity={0}
                stroke="rgba(75, 35, 93, 0.45)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ fill: "none", fillOpacity: 0 }}
              />
            )}

            {/* 2. Glow Underlay Path (Wider, low-opacity stroke replacing expensive drop-shadow filter) */}
            <path
              ref={desktopGlowPathRef}
              d={pathD}
              fill="none"
              stroke={tuning.lineColor || "#780aed"}
              strokeWidth={(tuning.lineWidth || 6) + 12}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.3}
              style={{
                strokeDasharray: desktopPathLength || 10000,
                strokeDashoffset: desktopPathLength || 10000,
              }}
            />

            {/* 3. Main Liquid Ocean Water Line Filler */}
            <path
              ref={desktopPathRef}
              d={pathD}
              fill="none"
              stroke={tuning.lineColor || "#780aed"}
              strokeWidth={tuning.lineWidth || 6}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                fill: "none",
                fillOpacity: 0,
                strokeDasharray: desktopPathLength || 10000,
                strokeDashoffset: desktopPathLength || 10000,
              }}
            />
          </svg>
        )}

        {/* START POINT HEADER (Top-Left Corner) */}
        <div className="relative mb-12 pl-2">
          <div className="flex items-center gap-3">
            <div
              ref={startDotRef}
              className="bg-dark-purple z-10 h-5 w-5 rounded-full border-2 border-transparent"
            />
            <span className="bg-dark-purple z-10  px-3.5 py-1.5 md:px-4">
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
                ref={(el) => {
                  rowRefs.current[rowIndex] = el;
                }}
                className="relative mb-16 last:mb-0 md:mb-20 lg:mb-24"
              >
                {/* YEAR HEADERS ROW */}
                <div
                  data-year-header-row
                  className={`relative z-30 flex h-12 items-center justify-between  ${isEvenRow ? "flex-row" : "flex-row-reverse"}`}
                >
                  {(() => {
                    const paddedItems =
                      rowItems.length < chunkSize
                        ? [
                          ...rowItems,
                          ...Array(chunkSize - rowItems.length).fill(null),
                        ]
                        : rowItems;

                    return paddedItems.map((hist, itemIndex) => {
                      if (!hist) {
                        return (
                          <div
                            key={`dummy-${itemIndex}`}
                            className="pointer-events-none shrink-0 opacity-0"
                            style={{ width: isMobile ? "calc(100% - 32px)" : "clamp(200px, 24vw, 380px)", maxWidth: isMobile ? "280px" : undefined }}
                          />
                        );
                      }

                      const globalIdx = rowIndex * chunkSize + itemIndex;
                      const isReached = reachedBadges[globalIdx] ?? (globalIdx === 0);

                      const flexAlignClass = isEvenRow
                        ? itemIndex === 0
                          ? "flex justify-start text-left"
                          : itemIndex === chunkSize - 1
                            ? "flex justify-end text-right"
                            : "flex justify-center text-center"
                        : itemIndex === 0
                          ? "flex justify-end text-right"
                          : itemIndex === chunkSize - 1
                            ? "flex justify-start text-left"
                            : "flex justify-center text-center";

                      return (
                        <div
                          key={itemIndex}
                          className={`group z-30 shrink-0 ${flexAlignClass}`}
                          style={{ width: isMobile ? "calc(100% - 32px)" : "clamp(200px, 24vw, 380px)", maxWidth: isMobile ? "280px" : undefined }}
                        >
                          <div
                            data-year-badge
                            className={`z-40 inline-block  ${isReached ? "scale-105 border-2 border-purple-400 bg-[#240852] shadow-[0_0_25px_rgba(6,182,212,0.4)]" : "border border-white/10 bg-[#240852]"}`}
                            style={{
                              padding:
                                "clamp(0.25rem, 0.6vw, 0.5rem) clamp(0.75rem, 1.5vw, 1.5rem)",
                            }}
                          >
                            <h6
                              className={` ${isReached ? " " : "text-white/40"}`}
                              style={{ fontSize: isMobile ? "clamp(1.75rem, 5vw, 2.5rem)" : "clamp(1.5rem, 3.2vw, 3rem)" }}
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
                  className={`mt-4 flex items-start justify-between px-2 md:px-4 lg:px-6 ${isEvenRow ? "flex-row" : "flex-row-reverse"}`}
                >
                  {(() => {
                    const paddedItems =
                      rowItems.length < chunkSize
                        ? [
                          ...rowItems,
                          ...Array(chunkSize - rowItems.length).fill(null),
                        ]
                        : rowItems;

                    return paddedItems.map((hist, itemIndex) => {
                      if (!hist) {
                        return (
                          <div
                            key={`dummy-card-${itemIndex}`}
                            className="pointer-events-none shrink-0 opacity-0"
                            style={{ width: isMobile ? "calc(100% - 32px)" : "clamp(200px, 24vw, 380px)", maxWidth: isMobile ? "280px" : undefined }}
                          />
                        );
                      }

                      const globalIdx = rowIndex * chunkSize + itemIndex;
                      const voyageNum = globalIdx + 1;
                      const isReached = reachedBadges[globalIdx] ?? (globalIdx === 0);

                      return (
                        <div
                          key={itemIndex}
                          className={`group shrink-0 ${isEvenRow ? "text-left" : isMobile ? "text-right" : "text-left"}`}
                          style={{ width: isMobile ? "calc(100% - 32px)" : "clamp(200px, 24vw, 380px)", maxWidth: isMobile ? "280px" : undefined }}
                        >
                          <div
                            className={`${isReached ? "opacity-100" : "opacity-70"}`}
                            style={{ padding: "0.5rem 0" }}
                          >
                            <div className={`mb-2 flex items-center gap-2 ${isEvenRow ? "justify-start" : isMobile ? "justify-end" : "justify-between"}`}>
                              <span
                                className={`rounded-lg ${isReached ? "border border-white/10 bg-cyan-500/20" : "border border-white/10 bg-[#00000029] text-white/40"}`}
                                style={{
                                  fontSize: "clamp(0.55rem, 0.75vw, 0.65rem)",
                                  padding: "0.125rem 0.5rem",
                                }}
                              >
                                VOYAGE #{voyageNum}
                              </span>
                            </div>

                            <h4
                              className={` ${isReached ? " " : " "}`}
                              style={{
                                fontSize: isMobile ? "0.95rem" : "clamp(0.75rem, 1.1vw, 1rem)",
                              }}
                            >
                              {hist.ship}
                            </h4>
                            <p
                              className="mt-2"
                              style={{
                                fontSize: isMobile ? "0.8rem" : "clamp(0.65rem, 0.85vw, 0.75rem)",
                              }}
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



      {/* ── Persistent Floating History Settings Button & Modal Drawer ── */}
      {showSettings &&
        mounted &&
        createPortal(
          <div className="pointer-events-none fixed inset-0 z-[999999] flex items-center justify-center p-4">
            <div
              data-settings-panel
              className="pointer-events-auto fixed bottom-16 left-6 max-h-[85vh] w-[450px] max-w-[94vw] overflow-y-auto rounded-3xl border border-purple-400/40 bg-[#04040e]/30 p-6 text-left shadow-[0_0_60px_rgba(6,182,212,0.25)]"
            >
              <div className="mb-5 flex items-center justify-between border-b border-purple-500/30 pb-3">
                <div className="flex items-center gap-2">
                  <h3>History Timeline & 3D Ship Controls</h3>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="cursor-pointer  px-2 py-1 hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-5">
                {/* 1. Start Ship Scale */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="/90">⚓ 1998 Start Ship Size (Scale)</span>
                    <span>{(tuning.startScale ?? 0.7).toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="5.00"
                    step="0.05"
                    value={tuning.startScale ?? 0.7}
                    onChange={(e) =>
                      setTuning({
                        ...tuning,
                        startScale: parseFloat(e.target.value),
                      })
                    }
                    className="w-full cursor-pointer accent-cyan-400"
                  />
                  <p>Size at 1998 Inaugural Voyage (0.05x to 5.00x).</p>
                </div>

                {/* 2. End Ship Scale */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="/90">🚀 2028 End Ship Size (Scale)</span>
                    <span>{(tuning.endScale ?? 3.2).toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="8.00"
                    step="0.05"
                    value={tuning.endScale ?? 3.2}
                    onChange={(e) =>
                      setTuning({
                        ...tuning,
                        endScale: parseFloat(e.target.value),
                      })
                    }
                    className="w-full cursor-pointer accent-cyan-400"
                  />
                  <p>Size at 2028 Voyage #23 finish (0.05x to 8.00x).</p>
                </div>

                {/* 3. Year Scaling Curve Mode */}
                <div className="space-y-2 border border-purple-400/40 bg-cyan-950/40 p-3.5">
                  <span className="block">📈 Year-by-Year Scaling Mode</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["linear", "exponential", "stepped"] as const).map(
                      (mode) => (
                        <button
                          key={mode}
                          onClick={() =>
                            setTuning({ ...tuning, scalingCurve: mode })
                          }
                          className={`cursor-pointer border px-2 py-1.5 ${(tuning.scalingCurve || "linear") === mode ? "border-purple-300 bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)]" : "border-white/10 bg-[#00000029] hover:bg-white/10 hover:text-white"}`}
                        >
                          {mode === "linear"
                            ? "Linear"
                            : mode === "exponential"
                              ? "Accel"
                              : "Stepped"}
                        </button>
                      ),
                    )}
                  </div>
                  <p>
                    {tuning.scalingCurve === "stepped"
                      ? "Steps size discretely as each year milestone is passed."
                      : tuning.scalingCurve === "exponential"
                        ? "Accelerates size growth faster in recent years."
                        : "Smooth continuous growth from 1998 to 2028."}
                  </p>
                </div>

                {/* 4. Exponential Curve Exponent (only shown if exponential mode selected) */}
                {tuning.scalingCurve === "exponential" && (
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="/90">
                        ⚡ Year Acceleration Curve (Exponent)
                      </span>
                      <span>{(tuning.growthCurveExp ?? 1.5).toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="3.5"
                      step="0.1"
                      value={tuning.growthCurveExp ?? 1.5}
                      onChange={(e) =>
                        setTuning({
                          ...tuning,
                          growthCurveExp: parseFloat(e.target.value),
                        })
                      }
                      className="w-full cursor-pointer accent-cyan-400"
                    />
                    <p>Lower = early growth, Higher = rapid late growth.</p>
                  </div>
                )}

                {/* 3. Ship X Position Offset */}
                <div className="border border-purple-400/30 bg-cyan-950/30 p-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span>↔️ Ship X Position Offset (Horizontal)</span>
                    <span>{tuning.shipOffsetX ?? 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    step="1"
                    value={tuning.shipOffsetX ?? 0}
                    onChange={(e) =>
                      setTuning({
                        ...tuning,
                        shipOffsetX: parseInt(e.target.value),
                      })
                    }
                    className="w-full cursor-pointer accent-cyan-400"
                  />
                  <p>
                    Nudge ship left or right on the path (-200px to +200px).
                  </p>
                </div>

                {/* 4. Ship Y Position Offset */}
                <div className="border border-purple-400/30 bg-cyan-950/30 p-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span>↕️ Ship Y Position Offset (Vertical)</span>
                    <span>{tuning.shipOffsetY ?? 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    step="1"
                    value={tuning.shipOffsetY ?? 0}
                    onChange={(e) =>
                      setTuning({
                        ...tuning,
                        shipOffsetY: parseInt(e.target.value),
                      })
                    }
                    className="w-full cursor-pointer accent-cyan-400"
                  />
                  <p>Nudge ship up or down on the path (-200px to +200px).</p>
                </div>

                {/* 5. Bow Offset / Ship Stop Position */}
                <div className="border border-purple-400/30 bg-cyan-950/30 p-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span>🎯 Ship & Blue Line Timeline Stop Position</span>
                    <span>{tuning.bowOffsetPx}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="400"
                    step="5"
                    value={tuning.bowOffsetPx}
                    onChange={(e) =>
                      setTuning({
                        ...tuning,
                        bowOffsetPx: parseInt(e.target.value),
                      })
                    }
                    className="w-full cursor-pointer accent-cyan-400"
                  />
                  <p>
                    Live tunes where the 3D ship and solid blue line stop on the
                    timeline relative to 2026 (0px to 400px).
                  </p>
                </div>

                {/* 6. Scroll Start Target */}
                <div className="border border-purple-400/30 bg-cyan-950/30 p-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span>🚀 Scroll Start Trigger (% Viewport)</span>
                    <span>{(tuning.scrollStartMul * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.10"
                    max="0.95"
                    step="0.05"
                    value={tuning.scrollStartMul}
                    onChange={(e) =>
                      setTuning({
                        ...tuning,
                        scrollStartMul: parseFloat(e.target.value),
                      })
                    }
                    className="w-full cursor-pointer accent-cyan-400"
                  />
                  <p>
                    Controls when the timeline scrub starts scrolling into view
                    (10% to 95%).
                  </p>
                </div>

                {/* 7. Scroll End Target */}
                <div className="border border-purple-400/30 bg-cyan-950/30 p-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span>🏁 2026 Finish Viewport Position (% Viewport)</span>
                    <span>{(tuning.scrollEndMul * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.10"
                    max="0.95"
                    step="0.05"
                    value={tuning.scrollEndMul}
                    onChange={(e) =>
                      setTuning({
                        ...tuning,
                        scrollEndMul: parseFloat(e.target.value),
                      })
                    }
                    className="w-full cursor-pointer accent-cyan-400"
                  />
                  <p>
                    Controls vertically where row 2026 sits on screen when the
                    timeline finishes (10% to 95%).
                  </p>
                </div>

                {/* 8. Scrub Damping / Smoothness */}
                <div className="border border-purple-400/30 bg-cyan-950/30 p-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span>⚡ Scroll Scrub Smoothness (Damping)</span>
                    <span>{(tuning.scrubDamping ?? 0.5).toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={tuning.scrubDamping ?? 0.5}
                    onChange={(e) =>
                      setTuning({
                        ...tuning,
                        scrubDamping: parseFloat(e.target.value),
                      })
                    }
                    className="w-full cursor-pointer accent-cyan-400"
                  />
                  <p>
                    Adjusts how smoothly the 3D ship responds to your scroll
                    wheel (0.1s snappy to 2.0s ultra-smooth).
                  </p>
                </div>

                {/* 6. Line Width */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="/90">🖊️ Line Thickness</span>
                    <span>{tuning.lineWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="16"
                    step="1"
                    value={tuning.lineWidth}
                    onChange={(e) =>
                      setTuning({
                        ...tuning,
                        lineWidth: parseInt(e.target.value),
                      })
                    }
                    className="w-full cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* 7. Line Color */}
                <div>
                  <span className="/90 mb-2 block">🎨 Line Glow Color</span>
                  <div className="flex items-center gap-2">
                    {[
                      "#06b6d4",
                      "#a855f7",
                      "#3b82f6",
                      "#10b981",
                      "#9333ea",
                      "#ec4899",
                    ].map((col) => (
                      <button
                        key={col}
                        onClick={() => setTuning({ ...tuning, lineColor: col })}
                        className={`h-7 w-7 cursor-pointer  border-2 ${tuning.lineColor === col ? "scale-125 border-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" : "border-transparent opacity-70 hover:opacity-100"}`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <button
                  onClick={handleResetTuning}
                  className="cursor-pointer bg-white/10 px-4 py-2 hover:bg-white/20"
                >
                  🔄 Reset Defaults
                </button>
                <div className="flex items-center gap-2">
                  {saveToast && (
                    <span className="text-[var(--color-accent)]">✓ Saved!</span>
                  )}
                  <button
                    onClick={handleSaveTuning}
                    className="cursor-pointer bg-cyan-500 px-5 py-2 shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:bg-cyan-400"
                  >
                    💾 Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
