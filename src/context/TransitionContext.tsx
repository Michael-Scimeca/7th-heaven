"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { useOptionalWebGLTransition } from "@/components/WebGLNoiseTransition";

export type TransitionMode = "idle" | "covering" | "covered" | "uncovering";

interface TransitionContextValue {
  mode: TransitionMode;
  setMode: (m: TransitionMode) => void;
  pendingHref: string | null;
  requestTransition: (href: string, force?: boolean) => void;
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
  const webgl = useOptionalWebGLTransition();
  const [mode, setMode] = useState<TransitionMode>("idle");
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!webgl?.isTransitioning && mode !== "idle") {
      setMode("idle");
      setPendingHref(null);
    }
  }, [webgl?.isTransitioning, mode]);

  const requestTransition = useCallback(
    (href: string, force = false) => {
      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";
      if (href.startsWith("/studio") || currentPath.startsWith("/studio")) {
        return;
      }
      const cleanHref = href.split(/[?#]/)[0];
      const cleanPath = currentPath.split(/[?#]/)[0];
      if (!force && cleanHref === cleanPath) {
        if (typeof window !== "undefined" && (window as any).__lenis) {
          (window as any).__lenis.scrollTo(0);
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      if (webgl?.navigateWithTransition) {
        setPendingHref(href);
        setMode("covering");
        webgl.navigateWithTransition(href).catch(() => {
          setMode("idle");
          setPendingHref(null);
        });
        return;
      }

      setPendingHref(href);
      setMode("covering");
    },
    [webgl],
  );

  const clearPendingHref = useCallback(() => setPendingHref(null), []);

  const value = useMemo<TransitionContextValue>(
    () => ({
      mode,
      setMode,
      pendingHref,
      requestTransition,
      clearPendingHref,
      isTransitioning: (webgl?.isTransitioning ?? false) || mode !== "idle",
      isCovered: mode === "covered",
      isPending: mode === "covering",
    }),
    [mode, pendingHref, requestTransition, clearPendingHref, webgl?.isTransitioning],
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
