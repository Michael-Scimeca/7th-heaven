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
      { rootMargin: "100px 0px" } // Defer rendering until 100px from section viewport
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (isVisible) {
    return <>{children}</>;
  }

  const computedStyle = { ...style, minHeight: fallbackHeight };
  const computedClassName = className?.trim() || undefined;

  return (
    <section
      ref={ref as any}
      id={id || undefined}
      className={computedClassName}
      style={computedStyle}
    />
  );
}
