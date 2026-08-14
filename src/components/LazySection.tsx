"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  fallbackHeight?: string;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}

export default function LazySection({
  children,
  fallbackHeight = "250px",
  className = "",
  id,
  style,
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" } // Load 400px before viewport entry for seamless scroll
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      id={id}
      className={className}
      style={{
        ...style,
        minHeight: isVisible ? undefined : fallbackHeight,
      }}
    >
      {isVisible ? children : null}
    </div>
  );
}
