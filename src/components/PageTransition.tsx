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
const DURATION       = 600;
const DELAY_MAX      = 200;
const DELAY_PER_PATH = 180;
const NUM_PATHS      = 2;
const ANIM_TOTAL     = DURATION + DELAY_PER_PATH * (NUM_PATHS - 1) + DELAY_MAX;

// ─── Path builder ─────────────────────────────────────────────────────────────
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

// ─── Page-ready check (Fonts + DOM Text + Images + Double RAF) ─────────────
const MAX_WAIT_MS = 1200;
async function waitForPageReady(): Promise<void> {
  // 1. Wait for custom web fonts (Barlow, Rockstar, Inter, etc.) to fully load
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready;
      if (document.fonts.status === "loading") {
        await new Promise<void>(resolve => {
          const onDone = () => {
            document.fonts.removeEventListener("loadingdone", onDone);
            resolve();
          };
          document.fonts.addEventListener("loadingdone", onDone);
          setTimeout(resolve, 600);
        });
      }
    } catch {}
  }

  // 2. Ensure text content is rendered in DOM and images/paint passes complete
  return new Promise<void>(resolve => {
    let resolved = false;
    const finish = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(deadline);
      // Double RAF ensures Next.js layout & browser font paint frames have finished
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    };

    const deadline = setTimeout(finish, MAX_WAIT_MS);

    const check = () => {
      if (resolved) return;

      // Verify DOM has rendered text
      const target = document.querySelector("main") || document.body;
      const textLength = (target.innerText || target.textContent || "").trim().length;

      // Find visible images that haven't finished loading
      const pendingImages = Array.from(
        document.querySelectorAll<HTMLImageElement>("img")
      ).filter(img => {
        if (img.complete) return false;
        const r = img.getBoundingClientRect();
        return r.top < window.innerHeight && r.bottom > 0;
      });

      if (textLength > 30 && pendingImages.length === 0) {
        finish();
      } else if (pendingImages.length > 0) {
        let remaining = pendingImages.length;
        const imgDone = () => {
          if (--remaining <= 0) finish();
        };
        pendingImages.forEach(img => {
          img.addEventListener("load", imgDone, { once: true });
          img.addEventListener("error", imgDone, { once: true });
        });
      } else {
        // Re-check next frame if React DOM is still mounting text
        requestAnimationFrame(check);
      }
    };

    requestAnimationFrame(check);
  });
}




// ─── Component ────────────────────────────────────────────────────────────────
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  const { mode, setMode, pendingHref, clearPendingHref, requestTransition } =
    useTransition();

  const prevPathnameRef = useRef(pathname);
  const pathRefs        = useRef<(SVGPathElement | null)[]>([]);

  const isOpenedRef  = useRef(false);
  const timeStartRef = useRef(0);
  const delaysRef    = useRef<number[]>(Array(NUM_POINTS).fill(0));
  const rafRef       = useRef<number | null>(null);

  const pendingHrefRef = useRef(pendingHref);
  useEffect(() => { pendingHrefRef.current = pendingHref; }, [pendingHref]);

  const routerRef = useRef(router);
  useEffect(() => { routerRef.current = router; }, [router]);

  const modeRef = useRef(mode);
  const requestTransitionRef = useRef(requestTransition);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { requestTransitionRef.current = requestTransition; }, [requestTransition]);

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
        pts[j] = isOpened ? cubicInOut(raw) * 100 : (1 - cubicInOut(raw)) * 100;
      }
      el.setAttribute("d", buildPath(pts));
    }
  }, []);

  const startLoop = useCallback((label: string, onDone: () => void) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    let lastFrameTime = performance.now();
    let frameCount = 0;
    console.log(`[Wave] ${label} START — ANIM_TOTAL=${ANIM_TOTAL}ms`);
    const tick = () => {
      const now = performance.now();
      const gap = now - lastFrameTime;
      frameCount++;
      if (gap > 50) {
        console.warn(`[Wave] ${label} FRAME DROP — gap=${gap.toFixed(0)}ms after ${frameCount} frames (${(now - timeStartRef.current).toFixed(0)}ms into anim)`);
      }
      lastFrameTime = now;
      try { renderFrame(); } catch (err) {
        console.warn("[PageTransition] renderFrame error", err);
      }
      if (Date.now() - timeStartRef.current < ANIM_TOTAL) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        console.log(`[Wave] ${label} DONE — ${frameCount} frames rendered`);
        try { onDone(); } catch (err) {
          console.warn("[PageTransition] onDone error", err);
          setMode("idle");
        }
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [renderFrame, setMode]);

  const randomDelays = useCallback(() => {
    for (let i = 0; i < NUM_POINTS; i++) {
      delaysRef.current[i] = Math.random() * DELAY_MAX;
    }
  }, []);

  const phase2StartedRef = useRef(false);

  const startPhase2 = useCallback(() => {
    if (phase2StartedRef.current) return;

    // Hard Guard: Refuse to start Phase 2 if current browser location doesn't match target route!
    if (targetPathnameRef.current) {
      const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
      const targetPath = targetPathnameRef.current.replace(/\/$/, "") || "/";
      if (currentPath !== targetPath) {
        console.warn(`[Wave] Guard blocked startPhase2: current path (${currentPath}) !== target path (${targetPath})`);
        return;
      }
    }

    phase2StartedRef.current = true;
    console.log(`[Wave] Phase2 startPhase2 executing — confirmed route: ${window.location.pathname}`);
    randomDelays();
    isOpenedRef.current  = false;
    timeStartRef.current = Date.now();
    startLoop("Phase2", () => {
      phase2StartedRef.current = false;
      targetPathnameRef.current = null;
      setMode("idle");
    });
  }, [randomDelays, startLoop, setMode]);

  // ── Global signals ────────────────────────────────────────────────────────
  const signalDone = useCallback(() => {
    (window as any).__pageTransitionActive = false;
    window.dispatchEvent(new CustomEvent("7h:pagetransition:done"));
  }, []);

  // ── Paths reset + event dispatch on idle ──────────────────────────────────
  useEffect(() => {
    if (mode === "covering") {
      (window as any).__pageTransitionActive = true;
    }
    if (mode !== "idle") return;
    pathRefs.current.forEach(el => {
      if (el) el.setAttribute("d", "M 0 0 V 0 H 0");
    });
    signalDone();
  }, [mode, signalDone]);

  // ── Reset Phase 2 guard ───────────────────────────────────────────────────
  useEffect(() => {
    if (mode === "covering") phase2StartedRef.current = false;
  }, [mode]);

  const targetPathnameRef = useRef<string | null>(null);

  // ── Phase 1 ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== "covering") return;
    randomDelays();
    isOpenedRef.current  = true;
    timeStartRef.current = Date.now();
    startLoop("Phase1", () => {
      const href = pendingHrefRef.current;
      if (href) {
        targetPathnameRef.current = href.split("?")[0].split("#")[0];
      } else {
        targetPathnameRef.current = null;
      }
      clearPendingHref();
      window.scrollTo({ top: 0, behavior: "instant" });
      setMode("covered");
      if (href) routerRef.current.push(href);
    });
    return () => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // ── Phase 2 trigger: pathname changed to target route ─────────────────────
  useLayoutEffect(() => {
    if (prevPathnameRef.current === pathname) return;
    const prev = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    if (mode === "covered") {
      let cancelled = false;
      waitForPageReady().then(() => { if (!cancelled) startPhase2(); });
      return () => { cancelled = true; prevPathnameRef.current = prev; };
    }
  }, [pathname, mode, startPhase2]);

  // ── Fallback & Explicit Ready Signal ──────────────────────────────────────
  useEffect(() => {
    if (mode !== "covered") return;
    let cancelled = false;

    const tryStartPhase2 = () => {
      const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
      const targetPath = targetPathnameRef.current ? targetPathnameRef.current.replace(/\/$/, "") || "/" : null;

      if (targetPath && currentPath !== targetPath) {
        console.log(`[Wave] Route transition in progress: current (${currentPath}) !== target (${targetPath})`);
        return;
      }
      waitForPageReady().then(() => { if (!cancelled) startPhase2(); });
    };

    // Listener for explicit "7h:page:ready" event
    const handlePageReady = () => {
      if (cancelled) return;
      tryStartPhase2();
    };
    window.addEventListener("7h:page:ready", handlePageReady, { once: true });

    // Safety polling: check every 150ms until router navigation to target path completes
    const intervalId = setInterval(() => {
      if (cancelled || phase2StartedRef.current) return;
      const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
      const targetPath = targetPathnameRef.current ? targetPathnameRef.current.replace(/\/$/, "") || "/" : null;

      if (!targetPath || currentPath === targetPath) {
        clearInterval(intervalId);
        waitForPageReady().then(() => { if (!cancelled) startPhase2(); });
      }
    }, 150);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      window.removeEventListener("7h:page:ready", handlePageReady);
    };
  }, [mode, pathname, startPhase2]);




  // ── Safety 1: visibilitychange ────────────────────────────────────────────
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (modeRef.current === "idle") return;
      if (rafRef.current !== null) return;
      phase2StartedRef.current = false;
      setMode("idle");
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [setMode]);

  // ── Safety 2: 5 s hard-reset ──────────────────────────────────────────────
  useEffect(() => {
    if (mode === "idle") return;
    const id = setTimeout(() => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      phase2StartedRef.current = false;
      setMode("idle");
    }, 5000);
    return () => clearTimeout(id);
  }, [mode, setMode]);

  // ── Click interceptor ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return;
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      if (
        href.startsWith("http") || href.startsWith("//") || href.startsWith("#") ||
        href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("blob:")
      ) return;
      if (modeRef.current !== "idle") { e.preventDefault(); return; }
      const targetPath = href.split("?")[0].split("#")[0];
      if (targetPath === window.location.pathname && !href.includes("?")) return;
      e.preventDefault();
      e.stopPropagation();
      try { routerRef.current.prefetch(href); } catch { /* ignore */ }
      requestTransitionRef.current(href);
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return (
    <>
      <div className="flex-1 flex flex-col">{children}</div>

      {/* SVG wave overlay — visibility:hidden when idle */}
      <svg
        style={{
          position     : "fixed",
          top          : 0,
          left         : 0,
          width        : "100vw",
          height       : "100vh",
          zIndex       : 99999,
          pointerEvents: mode !== "idle" ? "auto" : "none",
          visibility   : mode !== "idle" ? "visible" : "hidden",
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
            <stop offset="0%"   stopColor="#8519ef" />
            <stop offset="50%"  stopColor="#b94fff" />
            <stop offset="100%" stopColor="#6a00ff" />
          </linearGradient>
        </defs>
        <path ref={el => { pathRefs.current[0] = el; }} fill="url(#pg-grad-1)" d="M 0 0 V 0 H 0" />
        <path ref={el => { pathRefs.current[1] = el; }} fill="url(#pg-grad-2)" d="M 0 0 V 0 H 0" />
      </svg>
    </>
  );
}
