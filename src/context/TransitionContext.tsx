"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
interface TransitionContextValue {
  /** True from the moment a navigation starts until the overlay fully closes */
  isTransitioning: boolean;
  /** True only while the overlay is at full-screen coverage (the "peak") */
  isCovered: boolean;
  /** Called by PageTransition to update state */
  setIsTransitioning: (v: boolean) => void;
  setIsCovered: (v: boolean) => void;
}

// ── Context ──────────────────────────────────────────────────────────────────
const TransitionContext = createContext<TransitionContextValue>({
  isTransitioning: false,
  isCovered: false,
  setIsTransitioning: () => {},
  setIsCovered: () => {},
});

// ── Provider ─────────────────────────────────────────────────────────────────
export function TransitionProvider({ children }: { children: ReactNode }) {
  const [isTransitioning, setIsTransitioningState] = useState(false);
  const [isCovered, setIsCoveredState] = useState(false);

  const setIsTransitioning = useCallback((v: boolean) => setIsTransitioningState(v), []);
  const setIsCovered = useCallback((v: boolean) => setIsCoveredState(v), []);

  return (
    <TransitionContext.Provider value={{ isTransitioning, isCovered, setIsTransitioning, setIsCovered }}>
      {children}
    </TransitionContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useTransition() {
  return useContext(TransitionContext);
}
