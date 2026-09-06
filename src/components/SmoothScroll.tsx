"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/admin") || pathname?.startsWith("/crew") || pathname?.startsWith("/planner");

  useEffect(() => {
    if (typeof window === "undefined" || isDashboard || window.innerWidth < 768) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    (window as any).__lenis = lenis;

    if (document.documentElement.classList.contains("is-preloading")) {
      lenis.stop();
    }

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Debounce lenis.resize to prevent forced synchronous layout reflows during mount
    let resizeTimer: NodeJS.Timeout | null = null;
    const safeResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        requestAnimationFrame(() => {
          lenis.resize();
        });
      }, 150);
    };

    const t1 = setTimeout(safeResize, 500);

    const ro = new ResizeObserver(safeResize);
    if (document.body) ro.observe(document.body);

    return () => {
      clearTimeout(t1);
      if (resizeTimer) clearTimeout(resizeTimer);
      cancelAnimationFrame(rafId);
      ro.disconnect();
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, [isDashboard]);

  return <>{children}</>;
}
