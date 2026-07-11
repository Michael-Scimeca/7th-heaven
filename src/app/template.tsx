'use client';

import { useEffect, useRef } from 'react';

export default function RootTemplate({ children }: { children: React.ReactNode }) {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    // Simple opacity fade-in
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.35s ease-out';
    requestAnimationFrame(() => {
      el.style.opacity = '1';
    });
  }, []);

  return (
    <div ref={pageRef} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
