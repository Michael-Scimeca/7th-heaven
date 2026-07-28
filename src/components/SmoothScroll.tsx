"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/admin") || pathname?.startsWith("/crew") || pathname?.startsWith("/planner");

  useEffect(() => {
    if (typeof window === "undefined" || isDashboard) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    (window as any).__lenis = lenis;

    const onScroll = () => {
      ScrollTrigger.update();
    };

    lenis.on("scroll", onScroll);

    function update(time: number) {
      lenis.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Immediately recalculate page scroll bounds on mount & layout changes
    const resizeLenis = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };

    const t1 = setTimeout(resizeLenis, 100);
    const t2 = setTimeout(resizeLenis, 400);

    const ro = new ResizeObserver(() => {
      lenis.resize();
    });
    if (document.body) {
      ro.observe(document.body);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      ro.disconnect();
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(update);
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, [isDashboard]);

  return <>{children}</>;
}
