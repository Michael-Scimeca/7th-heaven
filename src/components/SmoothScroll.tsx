/* eslint-disable react-doctor/three-prefer-set-animation-loop */
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/crew") ||
    pathname?.startsWith("/planner") ||
    pathname?.startsWith("/studio");

  useEffect(() => {
    const isTouchDevice =
      typeof window !== "undefined" &&
      (window.innerWidth < 1024 ||
        window.matchMedia("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        (navigator && navigator.maxTouchPoints > 0));
    if (typeof window === "undefined" || isDashboard || isTouchDevice) return;

    // Register ScrollTrigger once globally so Lenis can drive it
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
      autoResize: true,
    });

    (window as any).__lenis = lenis;

    // Keep GSAP ScrollTrigger in sync with Lenis virtual scroll position.
    // Without this, ScrollTrigger reads native window.scrollY while Lenis
    // controls a virtual position — they diverge and cause scrub jitter.
    lenis.on("scroll", ScrollTrigger.update);

    if (document.documentElement.classList.contains("is-preloading")) {
      lenis.stop();
    }

    let rafId: number;
    function raf(time: number) {
      if (!document.hidden) {
        lenis.raf(time);
      }
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    let resizeRaf: number | null = null;
    const safeResize = () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        lenis.resize();
        resizeRaf = null;
      });
    };

    safeResize();

    const targetEl = document.querySelector("main") || document.body;
    const ro = new ResizeObserver(safeResize);
    if (targetEl) ro.observe(targetEl);

    return () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      cancelAnimationFrame(rafId);
      lenis.off("scroll", ScrollTrigger.update);
      ro.disconnect();
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, [isDashboard]);

  return <>{children}</>;
}
