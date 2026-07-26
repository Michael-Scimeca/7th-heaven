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
    window.scrollTo(0, 0);
    if (typeof window !== 'undefined' && (window as any).__lenis) {
      (window as any).__lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  return null;
}
