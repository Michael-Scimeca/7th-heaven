"use client";

// Lenis smooth scroll is wired inside HeroScrollEffect (GSAP ticker integration).
// This wrapper is kept for future layout-level concerns.
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
