"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Genuinely defers mounting `children` until this section nears the
// viewport, instead of just hiding it with CSS. `content-visibility: auto`
// (used elsewhere on this site as `ViewportSection`) only skips paint/layout
// for off-screen content -- it does NOT stop React from mounting a
// component or stop any video/WebGL/animation setup inside it from running.
// That gap is exactly what caused the Cruise page's ~16s freeze: two
// Three.js scenes (a GLTF ship model + shader compile each) were mounting
// immediately on every visit no matter where they sat on the page, because
// `content-visibility` alone didn't defer the actual JS work. Wrapping the
// heavy sections of every page in this instead means only what's actually
// on/near screen does its expensive setup -- everything below the fold
// mounts a little before you scroll to it, so the initial page load has far
// less work to do up front and feels close to instant.
//
// `minHeight` should roughly match the section's real rendered height so
// the placeholder doesn't cause a layout jump/scroll-position snap once the
// real content mounts in. `rootMargin` controls how early (in px of scroll
// distance) the real content mounts before it's actually on screen --
// bigger for heavier/slower sections so the mount finishes before you get
// there, smaller for lighter ones.
export default function LazyMount({
  children,
  minHeight = "400px",
  rootMargin = "800px 0px",
  className = "",
}: {
  children: ReactNode;
  minHeight?: string;
  rootMargin?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} className={className} style={{ minHeight }}>
      {visible ? children : null}
    </div>
  );
}
