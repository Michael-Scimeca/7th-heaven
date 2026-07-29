"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// ── Mode ─────────────────────────────────────────────────────────────────────
// idle       → no transition
// covering   → Phase 1: wave sweeps in (navigation has NOT happened yet)
// covered    → wave at full coverage, router.push just fired, waiting for page
// uncovering → Phase 2: wave sweeps out, new page revealed
export type TransitionMode = "idle" | "covering" | "covered" | "uncovering";

// ── Types ─────────────────────────────────────────────────────────────────────
interface TransitionContextValue {
  mode: TransitionMode;
  setMode: (m: TransitionMode) => void;
  /** The href to navigate to after the wave covers. Set by requestTransition. */
  pendingHref: string | null;
  /**
   * Call this when the user initiates navigation (e.g. link click).
   * Starts the wave covering animation; navigation fires when covered.
   */
  requestTransition: (href: string) => void;
  clearPendingHref: () => void;
  // Convenience flags kept for components that consume them
  isTransitioning: boolean;
  isCovered: boolean;
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
});

// ── Provider ──────────────────────────────────────────────────────────────────
export function TransitionProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<TransitionMode>("idle");
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const setMode = useCallback((m: TransitionMode) => setModeState(m), []);

  const requestTransition = useCallback(
    (href: string) => {
      setModeState((prev) => {
        if (prev !== "idle") return prev; // already animating
        setPendingHref(href);
        return "covering";
      });
    },
    []
  );

  const clearPendingHref = useCallback(() => setPendingHref(null), []);

  return (
    <TransitionContext.Provider
      value={{
        mode,
        setMode,
        pendingHref,
        requestTransition,
        clearPendingHref,
        isTransitioning: mode !== "idle",
        isCovered: mode === "covered" || mode === "uncovering",
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useTransition() {
  return useContext(TransitionContext);
}
