'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function RootTemplate({ children }: { children: React.ReactNode }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const accentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.inOut' } });

    // Set initial states
    gsap.set(pageRef.current, { opacity: 0, y: 15 });
    gsap.set([curtainRef.current, accentRef.current], { scaleY: 1, display: 'block' });

    tl.to(accentRef.current, {
      scaleY: 0,
      transformOrigin: 'top',
      duration: 0.65,
      delay: 0.05,
    })
    .to(curtainRef.current, {
      scaleY: 0,
      transformOrigin: 'top',
      duration: 0.7,
    }, '-=0.5')
    .to(pageRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power3.out',
      clearProps: 'all',
    }, '-=0.45')
    .set([curtainRef.current, accentRef.current], { display: 'none' });
  }, []);

  return (
    <div className="relative w-full">
      {/* Black Primary Curtain */}
      <div
        id="curtain-primary"
        ref={curtainRef}
        className="fixed inset-0 z-[9998] bg-black"
        style={{ transformOrigin: 'top', display: 'block' }}
      />
      {/* Violet Accent Curtain */}
      <div
        id="curtain-accent"
        ref={accentRef}
        className="fixed inset-0 z-[9999] bg-[#851DEF]"
        style={{ transformOrigin: 'top', display: 'block' }}
      />
      {/* Page Content */}
      <div id="page-content-wrapper" ref={pageRef} style={{ opacity: 0 }}>
        {children}
      </div>
    </div>
  );
}
