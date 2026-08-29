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
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
      if ((window as any).__lenis) {
        (window as any).__lenis.scrollTo(0, { immediate: true });
      }
    }

    let active = true;
    const t = setTimeout(() => {
      if (!active) return;
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.scrollTo(0, { immediate: true });
      }
    }, 50);

    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [pathname]);

  return null;
}
