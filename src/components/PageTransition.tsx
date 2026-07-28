"use client";

import {
  useLayoutEffect,
  useEffect,
  useState,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import { flushSync } from "react-dom";
import { usePathname } from "next/navigation";
import { useTransition } from "@/context/TransitionContext";

// ─── Easing library (ykob/shape-overlays reference) ──────────────────────────
const ease = {
  exponentialIn:    (t: number) => t === 0 ? t : Math.pow(2, 10 * (t - 1)),
  exponentialOut:   (t: number) => t === 1 ? t : 1 - Math.pow(2, -10 * t),
  exponentialInOut: (t: number) =>
    t === 0 || t === 1 ? t : t < 0.5
      ? 0.5 * Math.pow(2, 20 * t - 10)
      : -0.5 * Math.pow(2, 10 - t * 20) + 1,
  sineOut:       (t: number) => Math.sin(t * 1.5707963267948966),
  circularInOut: (t: number) =>
    t < 0.5
      ? 0.5 * (1 - Math.sqrt(1 - 4 * t * t))
      : 0.5 * (Math.sqrt((3 - 2 * t) * (2 * t - 1)) + 1),
  cubicIn:    (t: number) => t * t * t,
  cubicOut:   (t: number) => { const f = t - 1; return f * f * f + 1; },
  cubicInOut: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 0.5 * Math.pow(2 * t - 2, 3) + 1,
  quadraticOut: (t: number) => -t * (t - 2),
  quarticOut:   (t: number) => Math.pow(t - 1, 3) * (1 - t) + 1,
};

// Exact values from ykob/shape-overlays demo6.js
const NUM_POINTS     = 10;
const DURATION       = 900;
const DELAY_MAX      = 300;
const DELAY_PER_PATH = 250;
const NUM_PATHS      = 3;
const ANIM_TOTAL     = DURATION + DELAY_PER_PATH * (NUM_PATHS - 1) + DELAY_MAX;
const EASE_FN        = ease.cubicInOut;

function buildPath(points: number[], isOpened: boolean): string {
  let str = isOpened ? `M 0 0 V ${points[0]}` : `M 0 ${points[0]}`;
  for (let i = 0; i < NUM_POINTS - 1; i++) {
    const p  = ((i + 1) / (NUM_POINTS - 1)) * 100;
    const cp = p - (100 / (NUM_POINTS - 1)) / 2;
    str += ` C ${cp} ${points[i]} ${cp} ${points[i + 1]} ${p} ${points[i + 1]}`;
  }
  str += isOpened ? ` V 100 H 0` : ` V 0 H 0`;
  return str;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname        = usePathname();
  const prevPathnameRef = useRef(pathname);

  const { isTransitioning, setIsTransitioning, setIsCovered } = useTransition();

  // SVG path DOM refs
  const pathRefs   = useRef<(SVGPathElement | null)[]>([]);
  const svgRef     = useRef<SVGSVGElement | null>(null);
  // Content wrapper ref — we imperatively set opacity via DOM to guarantee
  // the new page is NEVER visible before the overlay covers the screen,
  // regardless of React's concurrent rendering schedule.
  const contentRef = useRef<HTMLDivElement>(null);

  // Animation refs
  const isOpenedRef       = useRef(false);
  const timeStartRef      = useRef(0);
  const delaysRef         = useRef<number[]>(Array(NUM_POINTS).fill(0));
  const rafRef            = useRef<number | null>(null);
  const isTransitioningRef = useRef(false);

  // Latest children — always up to date (updated every render via no-dep useLayoutEffect)
  const latestChildrenRef = useRef<ReactNode>(children);

  // What's rendered in the content div
  const [displayChildren, setDisplayChildren] = useState<ReactNode>(children);

  // ── Sync latest children ref (fires before every other named effect) ──────
  useLayoutEffect(() => {
    latestChildrenRef.current = children;
  });

  // ── Non-transition children sync ──────────────────────────────────────────
  useEffect(() => {
    if (!isTransitioningRef.current) {
      setDisplayChildren(children);
    }
  }, [children]);

  // ── Animation helpers ─────────────────────────────────────────────────────
  const renderFrame = useCallback(() => {
    const now      = Date.now();
    const isOpened = isOpenedRef.current;
    for (let i = 0; i < NUM_PATHS; i++) {
      const el = pathRefs.current[i];
      if (!el) continue;
      const offset  = isOpened
        ? DELAY_PER_PATH * i
        : DELAY_PER_PATH * (NUM_PATHS - i - 1);
      const elapsed = now - (timeStartRef.current + offset);
      const points: number[] = [];
      for (let j = 0; j < NUM_POINTS; j++) {
        const raw = Math.min(Math.max(elapsed - delaysRef.current[j], 0) / DURATION, 1);
        points[j] = (1 - EASE_FN(raw)) * 100;
      }
      el.setAttribute("d", buildPath(points, isOpened));
    }
  }, []);

  const startLoop = useCallback((onDone: () => void) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const tick = () => {
      renderFrame();
      if (Date.now() - timeStartRef.current < ANIM_TOTAL) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        onDone();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [renderFrame]);

  const randomiseDelays = useCallback(() => {
    for (let i = 0; i < NUM_POINTS; i++) {
      delaysRef.current[i] = Math.random() * DELAY_MAX;
    }
  }, []);

  const startClose = useCallback(() => {
    setIsCovered(false);
    randomiseDelays();
    isOpenedRef.current  = false;
    timeStartRef.current = Date.now();
    startLoop(() => {
      isTransitioningRef.current = false;
      setIsTransitioning(false);
    });
  }, [randomiseDelays, startLoop, setIsCovered, setIsTransitioning]);

  // ── TRANSITION ────────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (prevPathnameRef.current === pathname) return;
    prevPathnameRef.current = pathname;

    isTransitioningRef.current = true;

    // ─────────────────────────────────────────────────────────────────────────
    // CRITICAL: Imperatively hide the content wrapper BEFORE the browser paints.
    // useLayoutEffect fires synchronously after DOM mutation but before paint,
    // so this opacity=0 is applied before any pixel is drawn.
    //
    // Why this is necessary:
    // React 18 Concurrent Mode can deliver new `children` (the new page)
    // to the content div in the same commit as the pathname change.
    // Even with isTransitioningRef blocking the useEffect update, the
    // INITIAL render of the new children may be committed to the DOM before
    // we have a chance to prevent it via React state.
    //
    // Setting opacity:0 directly on the DOM node bypasses React scheduling
    // entirely and guarantees zero frames of new-page flash.
    // ─────────────────────────────────────────────────────────────────────────
    if (contentRef.current) {
      contentRef.current.style.opacity = "0";
      contentRef.current.style.visibility = "hidden";
    }

    setIsTransitioning(true);
    setIsCovered(false);

    randomiseDelays();
    isOpenedRef.current  = true;
    timeStartRef.current = Date.now();

    startLoop(() => {
      // Overlay fully covers the screen.
      // Now safe to show content (it's completely hidden by the overlay above).
      if (contentRef.current) {
        contentRef.current.style.opacity = "1";
        contentRef.current.style.visibility = "visible";
      }

      // Atomically swap to new page content while overlay covers everything
      flushSync(() => {
        setIsCovered(true);
        setDisplayChildren(latestChildrenRef.current);
      });

      window.scrollTo({ top: 0, behavior: "instant" });

      // Start Phase 2 on the very next frame — guaranteed, no React scheduling
      requestAnimationFrame(() => startClose());
    });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      // Always restore visibility on cleanup (e.g. fast navigation)
      if (contentRef.current) {
        contentRef.current.style.opacity = "1";
        contentRef.current.style.visibility = "visible";
      }
    };
  }, [pathname, startLoop, randomiseDelays, setIsTransitioning, setIsCovered, startClose]);

  return (
    <>
      {/* Content wrapper — opacity/visibility controlled imperatively during transition */}
      <div ref={contentRef} className="flex-1 flex flex-col">
        {displayChildren}
      </div>

      {/* Shape overlay SVG — fixed full viewport, above everything */}
      <svg
        ref={svgRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 99999,
          pointerEvents: isTransitioning ? "auto" : "none",
        }}
        aria-hidden="true"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <linearGradient id="pg-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#0d001f" />
            <stop offset="100%" stopColor="#2a0055" />
          </linearGradient>
          <linearGradient id="pg-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#4a00a0" />
            <stop offset="100%" stopColor="#7c00e8" />
          </linearGradient>
          <linearGradient id="pg-grad-3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#8519ef" />
            <stop offset="50%"  stopColor="#b94fff" />
            <stop offset="100%" stopColor="#6a00ff" />
          </linearGradient>
        </defs>
        <path ref={(el) => { pathRefs.current[0] = el; }} fill="url(#pg-grad-1)" d="M 0 100 V 100 H 0" />
        <path ref={(el) => { pathRefs.current[1] = el; }} fill="url(#pg-grad-2)" d="M 0 100 V 100 H 0" />
        <path ref={(el) => { pathRefs.current[2] = el; }} fill="url(#pg-grad-3)" d="M 0 100 V 100 H 0" />
      </svg>
    </>
  );
}
