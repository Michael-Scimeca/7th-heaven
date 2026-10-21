"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    const el = document.getElementById("page-content-wrapper");
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (mode === "covering" || mode === "covered") {
      el.classList.add("page-blur-out");
      el.classList.remove("page-blur-in");
      return;
    }

    // back to idle: the new page is in, so bring it up out of the blur
    el.classList.remove("page-blur-out");
    el.classList.add("page-blur-in");
    const done = window.setTimeout(() => el.classList.remove("page-blur-in"), 700);
    return () => window.clearTimeout(done);
  }, [mode, pathname]);

  return null;
}
