"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const STORAGE_KEY = "7h_scroll_pos_v1";

/**
 * Handles scroll behavior across navigations:
 * - Saves scroll positions per route in sessionStorage.
 * - Restores scroll position on popstate (back/forward).
 * - Scrolls to top on forward/link navigations.
 */
export default function ScrollToTop() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const isPopState = useRef(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "scrollRestoration" in window.history
    ) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      isPopState.current = true;
      try {
        const stored = JSON.parse(
          sessionStorage.getItem(STORAGE_KEY) || "{}",
        );
        const saved = stored[window.location.pathname];
        if (typeof saved === "number") {
          requestAnimationFrame(() => {
            window.scrollTo({ top: saved, behavior: "instant" as ScrollBehavior });
            const win = window as unknown as {
              __lenis?: { scrollTo: (y: number, opts: { immediate: boolean }) => void };
            };
            if (win.__lenis) {
              win.__lenis.scrollTo(saved, { immediate: true });
            }
          });
        }
      } catch {}
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (prevPathname.current !== pathname) {
      try {
        const stored = JSON.parse(
          sessionStorage.getItem(STORAGE_KEY) || "{}",
        );
        stored[prevPathname.current] = window.scrollY;
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      } catch {}
      prevPathname.current = pathname;
    }

    if (isPopState.current) {
      isPopState.current = false;
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    const win = window as unknown as {
      __lenis?: { scrollTo: (y: number, opts: { immediate: boolean }) => void };
    };
    if (win.__lenis) {
      win.__lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  return null;
}
