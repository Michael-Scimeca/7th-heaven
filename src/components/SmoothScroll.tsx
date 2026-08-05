"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/admin") || pathname?.startsWith("/crew") || pathname?.startsWith("/planner");

  useEffect(() => {
    if (typeof window === "undefined" || isDashboard) return;

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

    // Recalculate scroll bounds after layout settles
    const t1 = setTimeout(() => lenis.resize(), 100);
    const t2 = setTimeout(() => lenis.resize(), 400);

    const ro = new ResizeObserver(() => lenis.resize());
    if (document.body) ro.observe(document.body);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      cancelAnimationFrame(rafId);
      ro.disconnect();
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, [isDashboard]);

  return <>{children}</>;
}
