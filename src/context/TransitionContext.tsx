"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  useTransition as useReactTransition,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { waitForPageReady } from "@/lib/waitForPageReady";
import { supportsViewTransition } from "@/lib/supportsViewTransition";
import { curtainHideRef } from "@/lib/curtainHideRef";

// Real, live-verified difference from exoape.com's actual transition
// (three back-to-back nav clicks on their site, each captured as a rapid
// screenshot burst — see PageTransition.tsx's file-level comment for the
// full writeup): their old page doesn't just sit there while the new page
// wipes over it — it visibly translates upward and off-screen WHILE the
// new page slides up from below, both moving together (a "push," not a
// static reveal). Tracked a text landmark ("Digital") across consecutive
// frames to confirm: its on-screen Y position shifted ~300px upward over
// ~0.2s, well before it was ever covered by the incoming page — that only
// happens if the outgoing page itself is being transformed, not merely
// occluded.
//
// React/Next.js can't keep the OLD route's rendered tree on screen
// alongside the NEW one to animate both independently like that — the App
// Router replaces `children` essentially atomically. The browser's native
// View Transitions API is built exactly for this: `startViewTransition()`
// snapshots the current DOM before its callback runs, snapshots it again
// after, and lets CSS animate the two snapshots (`::view-transition-old`/
// `::view-transition-new`) independently — see globals.css for the actual
// translateY/clip-path keyframes.
//
// Falls back to a plain `router.push()` with no special effect on browsers
// without support (Firefox as of when this was written) — not this
// project's job to polyfill a browser API, and an instant swap there is
// strictly better than a broken/no-op animation attempt.

// ── Mode ─────────────────────────────────────────────────────────────────────
// idle       → no transition
// covering   → Phase 1: wave sweeps in. router.push() already fired back in
//              requestTransition() below, so the destination is loading in
//              the background this whole phase — not waiting for this to
//              finish first.
// covered    → wave at full coverage, waiting for that navigation to have
//              actually landed (usually already has, by this point).
// uncovering → Phase 2: wave sweeps out, new page revealed
export type TransitionMode = "idle" | "covering" | "covered" | "uncovering";

// ── Types ─────────────────────────────────────────────────────────────────────
interface TransitionContextValue {
  mode: TransitionMode;
  setMode: (m: TransitionMode) => void;
  /** The href to navigate to after the wave covers. Set by requestTransition. */
  pendingHref: string | null;
  /**
   * Call this when the user initiates navigation (e.g. link click). Starts
   * the wave covering animation AND fires the real router.push() at the
   * same time, so the destination has the whole covering animation's
   * duration to load before it needs to be shown.
   */
  requestTransition: (href: string) => void;
  clearPendingHref: () => void;
  // Convenience flags kept for components that consume them
  isTransitioning: boolean;
  isCovered: boolean;
  /**
   * True from the moment requestTransition() fires router.push() until
   * React actually has the destination route's tree ready to commit. Lives
   * here (not a separate useTransition() call in PageTransition) because
   * React's startTransition/isPending pair only work together when they
   * come from the SAME hook instance — PageTransition needs to read the
   * pending state of THIS push, not a disconnected one of its own.
   */
  isPending: boolean;
}

// ── Context ───────────────────────────────────────────────────────────────────
const TransitionContext = createContext<TransitionContextValue>({
  mode: "idle",
  setMode: () => {},
  pendingHref: null,
  requestTransition: () => {},
  clearPendingHref: () => {},
  isTransitioning: false,
  isCovered: false,
  isPending: false,
});

// ── Provider ──────────────────────────────────────────────────────────────────
// Safety net for the View Transition path below: if the destination never
// actually becomes ready (broken route, hung fetch), don't leave the
// browser's transition promise — and the page underneath the frozen "old"
// snapshot — hanging forever.
function isSamePathname(currentPathname: string, targetHref: string | null): boolean {
  if (!targetHref) return true;
  try {
    const targetPath = new URL(targetHref, "http://localhost").pathname.replace(/\/$/, "") || "/";
    const currentPath = currentPathname.replace(/\/$/, "") || "/";
    return currentPath === targetPath;
  } catch {
    const cleanTarget = targetHref.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
    const cleanCurrent = currentPathname.replace(/\/$/, "") || "/";
    return cleanCurrent === cleanTarget;
  }
}

const MAX_TRANSITION_WAIT_MS = 6000;

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<TransitionMode>("idle");
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useReactTransition();

  const setMode = useCallback((m: TransitionMode) => setModeState(m), []);

  // Track mode in a ref so requestTransition can read it synchronously
  // without putting mode in its dependency array or inside a state updater.
  const modeRef = useRef<TransitionMode>("idle");
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // Same idea, for pathname/isPending — the View Transition callback below
  // needs their LATEST values from inside a closure that's created once
  // (at click time) and polls afterward, not whatever they were when
  // requestTransition was called.
  const pathnameRef = useRef(pathname);
  useEffect(() => { pathnameRef.current = pathname; }, [pathname]);
  const isPendingRef = useRef(isPending);
  useEffect(() => { isPendingRef.current = isPending; }, [isPending]);

  const requestTransition = useCallback(
    (href: string) => {
      if (modeRef.current !== "idle") return; // already animating
      // Set the global flag SYNCHRONOUSLY so that canvas rAF loops on the
      // current page see it immediately and skip their expensive draw calls.
      if (typeof window !== "undefined") {
        (window as any).__pageTransitionActive = true;
        // Must be synchronous and BEFORE startViewTransition() below: that
        // call captures the "old" snapshot immediately, and the film-grain
        // layer has to already be hidden at that instant or it gets baked
        // into the snapshot and flickers against the "new" one. See the
        // .is-page-transitioning rule in globals.css. Cleared in
        // PageTransition.tsx's finish().
        document.documentElement.classList.add("is-page-transitioning");
      }
      setPendingHref(href);
      setModeState("covering");

      const navigateAndWait = () =>
        new Promise<void>((resolve) => {
          let settled = false;
          const settle = () => {
            if (settled) return;
            settled = true;
            // Only needed on the View Transition path — see curtainHideRef.ts
            // for why this has to happen before resolve(). On the fallback
            // path (no native support) this would fire slightly ahead of
            // PageTransition's own mode-driven curtain hide + content
            // clip-path reveal, and content would flash its final state
            // for a frame before the fallback wipe snaps back to its start
            // and plays — a real regression there, not a fix.
            if (supportsViewTransition()) curtainHideRef.current?.();
            resolve();
          };

          startTransition(() => {
            router.push(href);
          });

          // setTimeout, not requestAnimationFrame — this runs inside
          // startViewTransition()'s update callback below, and rAF is tied
          // to the paint pipeline. If the tab isn't actively being painted
          // (backgrounded/minimized, or — as measured while debugging this —
          // some automation contexts that report visibilityState "hidden"
          // even while still delivering clicks), rAF callbacks stop firing
          // or get throttled to near-zero, this poll never advances, and the
          // 6s safety-net timeout below becomes the only thing that ever
          // resolves — by which point Chrome has already unilaterally
          // aborted the transition itself (its `ready` promise rejects with
          // "InvalidStateError: Transition was aborted because of invalid
          // state"), silently degrading to an instant, unanimated DOM swap.
          // Measured: with rAF-based polling this took ~6.9s and always
          // aborted; with setTimeout it resolves in ~1-2 ticks.

          const poll = () => {
            if (settled) return;
            if (isSamePathname(pathnameRef.current, href)) {
              waitForPageReady().then(settle);
              return;
            }
            setTimeout(poll, 16);
          };
          setTimeout(poll, 16);

          // 1.2s max safety backstop: don't let slow route resolution hang the transition
          setTimeout(settle, 1200);
        });

      if (supportsViewTransition()) {
        const vt = (document as unknown as { startViewTransition: (cb: () => Promise<void>) => { finished: Promise<void> } })
          .startViewTransition(navigateAndWait);

        const onFinish = () => {
          if (typeof window !== "undefined") {
            (window as any).__pageTransitionActive = false;
            document.documentElement.classList.remove("is-page-transitioning");
          }
          setPendingHref(null);
          setModeState("idle");
        };

        if (vt && vt.finished) {
          vt.finished.then(onFinish).catch(onFinish);
        } else {
          setTimeout(onFinish, 1040);
        }
      } else {
        navigateAndWait();
      }
    },
    [router, startTransition]
  );

  const clearPendingHref = useCallback(() => setPendingHref(null), []);

  // Global click listener to hook up page transitions to EVERY internal link across the site
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleGlobalClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }

      const anchor = (e.target as HTMLElement)?.closest?.("a");
      if (!anchor) return;

      const target = anchor.getAttribute("target");
      if (target && target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      if (href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;

        const targetPath = url.pathname + url.search;
        const currentPath = window.location.pathname + window.location.search;

        if (url.pathname === window.location.pathname && url.hash) return;
        if (targetPath === currentPath) return;

        e.preventDefault();
        requestTransition(targetPath);
      } catch {
        // Ignore invalid URLs
      }
    };

    document.addEventListener("click", handleGlobalClick, true);
    return () => document.removeEventListener("click", handleGlobalClick, true);
  }, [requestTransition]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      pendingHref,
      requestTransition,
      clearPendingHref,
      isTransitioning: mode !== "idle",
      isCovered: mode === "covered" || mode === "uncovering",
      isPending,
    }),
    [mode, setMode, pendingHref, requestTransition, clearPendingHref, isPending]
  );

  return (
    <TransitionContext.Provider value={value}>
      {children}
    </TransitionContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useTransition() {
  return useContext(TransitionContext);
}
