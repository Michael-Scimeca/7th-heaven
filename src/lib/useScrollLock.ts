"use client";

import { useEffect, useLayoutEffect } from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

let activeLocks = 0;
let savedScrollY = 0;

/**
 * Robust, unified iOS Safari & Desktop body scroll-lock hook.
 * 
 * On iOS Safari, `overflow: hidden` on body is bypassed by touch gestures.
 * This hook uses the `position: fixed` + `top: -scrollY` pattern to completely
 * lock scrolling behind modals, drawers, and overlays while preserving the exact
 * scroll position upon restoration. It also pauses/resumes Lenis smooth scrolling.
 */
export function useScrollLock(locked: boolean = true) {
  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined" || !locked) return;

    activeLocks++;

    if (activeLocks === 1) {
      savedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.body.style.position = "fixed";
      document.body.style.top = `-${savedScrollY}px`;
      document.body.style.left = "0px";
      document.body.style.right = "0px";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      document.body.setAttribute("data-scroll-locked", "true");

      if (typeof window !== "undefined" && (window as any).__lenis) {
        try {
          (window as any).__lenis.stop();
        } catch {}
      }
    }

    return () => {
      activeLocks = Math.max(0, activeLocks - 1);

      if (activeLocks === 0) {
        const top = document.body.style.top;
        const restoreY = top ? Math.abs(parseInt(top, 10)) : savedScrollY;

        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        document.body.removeAttribute("data-scroll-locked");

        if (typeof window !== "undefined") {
          window.scrollTo(0, restoreY);
          if ((window as any).__lenis) {
            try {
              (window as any).__lenis.start();
            } catch {}
          }
        }
      }
    };
  }, [locked]);
}

export default useScrollLock;
