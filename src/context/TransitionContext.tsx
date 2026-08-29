"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

export type TransitionMode = "idle" | "covering" | "covered" | "uncovering";

interface TransitionContextValue {
  mode: TransitionMode;
  setMode: (m: TransitionMode) => void;
  pendingHref: string | null;
  requestTransition: (href: string) => void;
  clearPendingHref: () => void;
  isTransitioning: boolean;
  isCovered: boolean;
  isPending: boolean;
}

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

// Deliberately just a mailbox: mode + pendingHref live here so any component
// (Header, Footer, TransitionLink) can read where a transition stands, but
// the actual GSAP animation frames AND the router.push call itself live
// entirely in PageTransition.tsx. A prior version of this feature had this
// context also drive navigation/timing, in parallel with PageTransition's
// own state -- two machines racing each other (plus a third View Transition
// code path) is what caused the flicker/hang bugs that got the whole
// feature pulled. Keeping this file dumb-by-design avoids that class of bug
// by construction rather than by careful sequencing between the two.
export function TransitionProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<TransitionMode>("idle");
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const requestTransition = useCallback(
    (href: string) => {
      if (mode !== "idle") return;
      setPendingHref(href);
      setMode("covering");
    },
    [mode]
  );

  const clearPendingHref = useCallback(() => setPendingHref(null), []);

  const value = useMemo<TransitionContextValue>(
    () => ({
      mode,
      setMode,
      pendingHref,
      requestTransition,
      clearPendingHref,
      isTransitioning: mode !== "idle",
      isCovered: mode === "covered",
      isPending: mode === "covering",
    }),
    [mode, pendingHref, requestTransition, clearPendingHref]
  );

  return (
    <TransitionContext.Provider value={value}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  return useContext(TransitionContext);
}
