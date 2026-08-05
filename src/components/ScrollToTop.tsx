'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Forces scroll to top on every client-side navigation and on initial mount.
 * Prevents pages from loading at the bottom due to layout shifts
 * (e.g., footer rendering before async content fills the page).
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Defer behind a task so Strict Mode's first-mount cleanup can cancel it.
    // Without this, both the mount and remount fire scrollTo(0,0) in rapid succession,
    // causing a visible Lenis flicker on initial page load.
    let active = true;
    const t = setTimeout(() => {
      if (!active) return;
      window.scrollTo(0, 0);
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.scrollTo(0, { immediate: true });
      }
    }, 0);
    return () => { active = false; clearTimeout(t); };
  }, [pathname]);

  return null;
}
