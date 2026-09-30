"use client";

import React, { useState, useEffect, useRef } from "react";

export interface LazyHeavyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minHeight?: string;
  aspectRatio?: string;
  className?: string;
  style?: React.CSSProperties;
  rootMargin?: string;
  idleTimeout?: number;
  /**
   * Optional prefetch function to execute quietly on idle after initial page load
   * e.g. () => import('./HeavyComponent') or () => useGLTF.preload('/objects/ship.glb')
   */
  prefetch?: () => Promise<unknown> | void;
}

export default function LazyHeavy({
  children,
  fallback,
  minHeight,
  aspectRatio,
  className = "",
  style,
  rootMargin = "1500px 0px",
  idleTimeout = 500,
  prefetch,
}: LazyHeavyProps) {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefetchRef = useRef(prefetch);

  useEffect(() => {
    prefetchRef.current = prefetch;
  }, [prefetch]);

  // 1. Quiet background prefetch on idle after page load
  useEffect(() => {
    if (!prefetchRef.current) return undefined;

    const timer = setTimeout(() => {
      try {
        prefetchRef.current?.();
      } catch (_) {}
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // 2. IntersectionObserver (1500px rootMargin) + requestIdleCallback for smooth non-blocking mount
  useEffect(() => {
    let idleId: number | null = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let observer: IntersectionObserver | null = null;

    if (!isMounted && containerRef.current) {
      const el = containerRef.current;
      if (typeof IntersectionObserver === "undefined") {
        setIsMounted(true);
      } else {
        observer = new IntersectionObserver(
          ([entry]) => {
            if (entry?.isIntersecting) {
              observer?.disconnect();
              const triggerMount = () => {
                setIsMounted(true);
              };

              if (typeof window !== "undefined" && "requestIdleCallback" in window) {
                idleId = (window as any).requestIdleCallback(triggerMount, {
                  timeout: idleTimeout,
                });
              } else {
                timerId = setTimeout(triggerMount, 16);
              }
            }
          },
          { rootMargin }
        );

        observer.observe(el);
      }
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
      if (idleId !== null && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        (window as any).cancelIdleCallback(idleId);
      }
      if (timerId !== null) {
        clearTimeout(timerId);
      }
    };
  }, [isMounted, rootMargin, idleTimeout]);

  const dynamicStyle: React.CSSProperties = {
    ...(minHeight ? { minHeight } : {}),
    ...(aspectRatio ? { aspectRatio } : {}),
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={dynamicStyle}
    >
      {isMounted ? children : fallback ?? null}
    </div>
  );
}
