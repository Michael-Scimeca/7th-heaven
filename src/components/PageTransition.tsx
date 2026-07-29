"use client";

import {
  useLayoutEffect,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "@/context/TransitionContext";

// ─── Easing ──────────────────────────────────────────────────────────────────
const cubicInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 0.5 * Math.pow(2 * t - 2, 3) + 1;

// ─── Constants ───────────────────────────────────────────────────────────────
const NUM_POINTS     = 10;
const DURATION       = 900;
const DELAY_MAX      = 300;
const DELAY_PER_PATH = 200;
const NUM_PATHS      = 3;
const ANIM_TOTAL     = DURATION + DELAY_PER_PATH * (NUM_PATHS - 1) + DELAY_MAX;

// ─── Path builder ─────────────────────────────────────────────────────────────
// Wave closes to the TOP (V 0 H 0).
// Phase 1 (covering, top→bottom):  points go 0→100, area ABOVE wave is filled
// Phase 2 (uncovering, bottom→top): points go 100→0, wave retreats upward
function buildPath(points: number[]): string {
  let str = `M 0 ${points[0]}`;
  for (let i = 0; i < NUM_POINTS - 1; i++) {
    const p  = ((i + 1) / (NUM_POINTS - 1)) * 100;
    const cp = p - (100 / (NUM_POINTS - 1)) / 2;
    str += ` C ${cp} ${points[i]} ${cp} ${points[i + 1]} ${p} ${points[i + 1]}`;
  }
  str += ` V 0 H 0`;
  return str;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  const { mode, setMode, pendingHref, clearPendingHref, requestTransition } =
    useTransition();

  // Track pathname so we can detect when Next.js commits the new page
  const prevPathnameRef = useRef(pathname);

  // SVG path refs
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  // Animation refs
  const isOpenedRef  = useRef(false);
  const timeStartRef = useRef(0);
  const delaysRef    = useRef<number[]>(Array(NUM_POINTS).fill(0));
  const rafRef       = useRef<number | null>(null);

  // Stable ref for pendingHref so the Phase-1 callback always sees the latest value
  const pendingHrefRef = useRef(pendingHref);
  useEffect(() => { pendingHrefRef.current = pendingHref; }, [pendingHref]);

  // ── Animation core ────────────────────────────────────────────────────────
  const renderFrame = useCallback(() => {
    const now      = Date.now();
    const isOpened = isOpenedRef.current;
    for (let i = 0; i < NUM_PATHS; i++) {
      const el = pathRefs.current[i];
      if (!el) continue;
      const offset = isOpened
        ? DELAY_PER_PATH * i
        : DELAY_PER_PATH * (NUM_PATHS - i - 1);
      const elapsed = now - (timeStartRef.current + offset);
      const pts: number[] = [];
      for (let j = 0; j < NUM_POINTS; j++) {
        const raw = Math.min(Math.max(elapsed - delaysRef.current[j], 0) / DURATION, 1);
        // Phase 1 (isOpened=true):  0→100 (sweeps down, covers from top)
        // Phase 2 (isOpened=false): 100→0 (retreats up, reveals from bottom)
        pts[j] = isOpened ? cubicInOut(raw) * 100 : (1 - cubicInOut(raw)) * 100;
      }
      el.setAttribute("d", buildPath(pts));
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

  const randomDelays = useCallback(() => {
    for (let i = 0; i < NUM_POINTS; i++) {
      delaysRef.current[i] = Math.random() * DELAY_MAX;
    }
  }, []);

  // Phase 2: wave exits upward — called after pathname confirms new page is live
  const startPhase2 = useCallback(() => {
    randomDelays();
    isOpenedRef.current  = false;
    timeStartRef.current = Date.now();
    startLoop(() => {
      setMode("idle");
    });
  }, [randomDelays, startLoop, setMode]);

  // ── Phase 1: start when mode switches to "covering" ───────────────────────
  useEffect(() => {
    if (mode !== "covering") return;

    randomDelays();
    isOpenedRef.current  = true;
    timeStartRef.current = Date.now();

    startLoop(() => {
      // ──────────────────────────────────────────────────────────────────────
      // COVERED. The wave is at full-screen coverage.
      //
      // NOW we navigate. React's children won't update until the route
      // commits, which happens AFTER the wave is already covering everything.
      // The user sees zero flash of the new page during Phase 1 because the
      // route literally hasn't changed yet.
      // ──────────────────────────────────────────────────────────────────────
      const href = pendingHrefRef.current;
      clearPendingHref();
      window.scrollTo({ top: 0, behavior: "instant" });
      setMode("covered");          // wave holds at full coverage
      if (href) router.push(href); // navigate — children will update soon
      // Phase 2 fires when useLayoutEffect detects pathname changed (below)
    });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // ── Phase 2 trigger: start when Next.js confirms the new page ─────────────
  useLayoutEffect(() => {
    if (prevPathnameRef.current === pathname) return;
    prevPathnameRef.current = pathname;

    if (mode === "covered") {
      // Pathname changed while wave covers → new page is in the DOM.
      // Give React one frame to paint the new page, then start Phase 2.
      requestAnimationFrame(() => startPhase2());
    }
  }, [pathname, mode, startPhase2]);

  // ── Global link interceptor ───────────────────────────────────────────────
  // Instead of replacing every <Link> with a custom component, we intercept
  // all anchor clicks at the document level (capture phase).
  // This catches Next.js <Link>, plain <a>, and any other anchor.
  const modeRef = useRef(mode);
  const requestTransitionRef = useRef(requestTransition);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { requestTransitionRef.current = requestTransition; }, [requestTransition]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Ignore modifier clicks (open in new tab, etc.)
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return; // left click only

      // Walk up the DOM to find the nearest anchor
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip external, hash-only, mailto, tel, and blob links
      if (
        href.startsWith("http") ||
        href.startsWith("//")   ||
        href.startsWith("#")    ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("blob:")
      ) return;

      // If already transitioning, block the click
      if (modeRef.current !== "idle") {
        e.preventDefault();
        return;
      }

      // Same-page link? Skip transition.
      const targetPath = href.split("?")[0].split("#")[0];
      if (targetPath === window.location.pathname && !href.includes("?")) return;

      // Intercept: prevent Next.js and the browser from navigating now.
      // We will call router.push(href) ourselves after the wave covers.
      e.preventDefault();
      e.stopPropagation();

      requestTransitionRef.current(href);
    };

    // Capture phase so we fire before Next.js's own click handler
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []); // Mount once — uses refs for live mode/requestTransition values

  return (
    <>
      {/* Page content — React updates this freely.
          During Phase 1 the route hasn't changed, so children = old page.
          During Phase 2 the route has changed, so children = new page.
          No displayChildren state, no blocking refs — React's own batching
          keeps the content correct by construction. */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>

      {/* SVG wave overlay */}
      <svg
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 99999,
          pointerEvents: mode !== "idle" ? "auto" : "none",
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
        <path ref={el => { pathRefs.current[0] = el; }} fill="url(#pg-grad-1)" d="M 0 0 V 0 H 0" />
        <path ref={el => { pathRefs.current[1] = el; }} fill="url(#pg-grad-2)" d="M 0 0 V 0 H 0" />
        <path ref={el => { pathRefs.current[2] = el; }} fill="url(#pg-grad-3)" d="M 0 0 V 0 H 0" />
      </svg>
    </>
  );
}
