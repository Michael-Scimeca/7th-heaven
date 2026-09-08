"use client";

import React, { useEffect, useRef, ElementType, ReactNode } from "react";
import gsap from "gsap";

interface ExoTextRevealProps {
  children: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  threshold?: number;
}

const EXO_EASE = "cubic-bezier(0.496, 0.004, 0, 1)";

export default function ExoTextReveal({
  children,
  as: Component = "h2",
  className = "",
  delay = 0,
  duration = 0.9,
  stagger = 0.08,
  threshold = 0.15,
}: ExoTextRevealProps) {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const lines = el.querySelectorAll<HTMLSpanElement>(".exo-text-line-inner");
    if (!lines.length) return;

    gsap.set(lines, {
      yPercent: 108,
      rotation: 6,
      opacity: 0,
      transformOrigin: "0% 100%",
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(lines, {
              yPercent: 0,
              rotation: 0,
              opacity: 1,
              duration,
              delay,
              stagger,
              ease: EXO_EASE,
              overwrite: "auto",
            });
            observer.unobserve(el);
          }
        });
      },
      { threshold }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [delay, duration, stagger, threshold]);

  // Split text string into lines by newline or natural grouping
  const lineArray = children.split("\n").filter(Boolean);

  const Tag = Component as any;

  return (
    <Tag ref={containerRef} className={`exo-text-reveal ${className}`}>
      {lineArray.map((line, idx) => (
        <span
          key={idx}
          className="exo-text-line-wrap block overflow-hidden py-[0.05em] transform-gpu"
        >
          <span className="exo-text-line-inner block transform-gpu will-change-transform">
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
