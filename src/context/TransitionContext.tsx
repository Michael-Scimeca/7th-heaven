"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

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

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<TransitionMode>("idle");
  const router = useRouter();

  const requestTransition = useCallback(
    (href: string) => {
      if (typeof window !== "undefined") {
        (window as any).__pageTransitionActive = false;
        document.documentElement.classList.remove("is-page-transitioning");
      }
      router.push(href);
    },
    [router]
  );

  const clearPendingHref = useCallback(() => {}, []);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      pendingHref: null,
      requestTransition,
      clearPendingHref,
      isTransitioning: false,
      isCovered: false,
      isPending: false,
    }),
    [mode, requestTransition, clearPendingHref]
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
