"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTransition } from "@/context/TransitionContext";

/**
 * Blurs the page content out while the canvas transition covers the screen,
 * and blurs it back in once the next page is mounted.
 *
 * The class goes on #page-content-wrapper. `filter` makes that element a
 * containing block for fixed children, so the class is removed the instant
 * the animation is done rather than left on.
 */
export default function PageBlur() {
  const { mode } = useTransition();
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const el = document.getElementById("page-content-wrapper");
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // FedTransition handles its own synchronized exit & enter blur animation
    if (document.documentElement.classList.contains("fed-exiting")) return;

    if (mode === "covering" || mode === "covered") {
      el.classList.add("page-blur-out");
      el.classList.remove("page-blur-in");
      return;
    }

    const isFirstMount = prevPathRef.current === null;
    const isNewRoute = prevPathRef.current !== pathname;
    prevPathRef.current = pathname;

    // Skip if still idle on same route
    if (!isFirstMount && !isNewRoute && mode === "idle") {
      return;
    }

    // Skip initial mount if site preloader curtain is active
    if (isFirstMount && document.documentElement.classList.contains("is-preloading")) {
      return;
    }

    // New page is in, bring it up out of the blur
    el.classList.remove("page-blur-out");
    el.classList.remove("page-blur-in");
    void el.offsetWidth; // Force reflow to reliably restart CSS keyframe animation
    el.classList.add("page-blur-in");

    const done = window.setTimeout(() => {
      el.classList.remove("page-blur-in");
    }, 700);

    return () => window.clearTimeout(done);
  }, [mode, pathname]);

  return null;
}
