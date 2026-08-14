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

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Batch lenis.resize inside requestAnimationFrame to prevent forced reflows
    let resizeRaf: number | null = null;
    const safeResize = () => {
      if (resizeRaf !== null) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        lenis.resize();
        resizeRaf = null;
      });
    };

    const t1 = setTimeout(safeResize, 100);
    const t2 = setTimeout(safeResize, 400);

    const ro = new ResizeObserver(safeResize);
    if (document.body) ro.observe(document.body);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (resizeRaf !== null) cancelAnimationFrame(resizeRaf);
      cancelAnimationFrame(rafId);
      ro.disconnect();
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, [isDashboard]);

  return <>{children}</>;
}
