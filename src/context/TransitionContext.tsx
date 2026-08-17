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
import { useRouter } from "next/navigation";

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
export function TransitionProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<TransitionMode>("idle");
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const router = useRouter();
  const [isPending, startTransition] = useReactTransition();

  const setMode = useCallback((m: TransitionMode) => setModeState(m), []);

  // Track mode in a ref so requestTransition can read it synchronously
  // without putting mode in its dependency array or inside a state updater.
  const modeRef = useRef<TransitionMode>("idle");
  useEffect(() => { modeRef.current = mode; }, [mode]);

  const requestTransition = useCallback(
    (href: string) => {
      if (modeRef.current !== "idle") return; // already animating
      // Set the global flag SYNCHRONOUSLY so that canvas rAF loops on the
      // current page see it immediately and skip their expensive draw calls.
      if (typeof window !== "undefined") {
        (window as any).__pageTransitionActive = true;
      }
      setPendingHref(href);
      setModeState("covering");

      // Fire the actual navigation RIGHT NOW — the same instant the click
      // happens — instead of waiting for the 1s leave animation to finish
      // first (the original design here, and the thing exoape.com's real
      // site doesn't do: it's a Vue/Nuxt SPA where the destination route is
      // already compiled and ready, so their leave→swap→enter reads as one
      // continuous motion with only a brief flicker at the covered point,
      // confirmed by frame-brightness analysis of their real site — not the
      // 1s+ dead hold this component used to have while it waited to START
      // loading only after going fully opaque).
      //
      // Wrapping in startTransition means React does NOT rip the old page
      // out from under the leave animation: React keeps rendering the OLD
      // `children` tree (this is exactly what `isPending` tracks) until the
      // new route's tree is actually ready to commit, however long that
      // takes. So the recede/fade plays over the CURRENT page exactly as
      // before; the only change is that the destination has a full second
      // (the leave tween's duration) of head start to be ready by the time
      // the curtain goes fully opaque, instead of zero.
      startTransition(() => {
        router.push(href);
      });
    },
    [router, startTransition]
  );

  const clearPendingHref = useCallback(() => setPendingHref(null), []);

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
