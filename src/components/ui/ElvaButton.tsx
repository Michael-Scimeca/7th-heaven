"use client";

import React, { useRef, useState, useEffect } from "react";

export interface ElvaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  asChild?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  showDot?: boolean;
  gradientId?: string;
  startColor?: string;
  endColor?: string;
  className?: string;
}

/**
 * Recreates the exact frosted glass pill button with laser-draw gradient stroke
 * on hover from https://elvalabs.ai/.
 */
export function ElvaButton({
  children,
  href,
  target,
  rel,
  showDot = true,
  gradientId = "elva-grad",
  startColor = "#0989d8",
  endColor = "#850dee",
  className = "",
  onClick,
  ...props
}: ElvaButtonProps) {
  const containerRef = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const [dimensions, setDimensions] = useState({ width: 176, height: 48 });

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        if (offsetWidth > 0 && offsetHeight > 0) {
          setDimensions({ width: offsetWidth, height: offsetHeight });
        }
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const w = dimensions.width;
  const h = dimensions.height;
  const rx = 16;
  // Perimeter of rounded rectangle with radius rx: 2*(w - 2*rx) + 2*(h - 2*rx) + 2*PI*rx
  const perimeter = Math.max(10, Math.round(2 * (w - 2 * rx) + 2 * (h - 2 * rx) + 2 * Math.PI * rx));
  const svgW = w + 4;
  const svgH = h + 4;

  const content = (
    <>
      <svg
        className="pointer-events-none absolute -inset-[2px] transition-opacity"
        width={svgW}
        height={svgH}
        aria-hidden="true"
        style={{ filter: "blur(3px)" }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="30%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
        </defs>
        <rect
          x="2"
          y="2"
          rx={rx}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="4"
          width={w}
          height={h}
          className="elva-laser-rect"
          style={
            {
              "--elva-perimeter": `${perimeter}`,
            } as React.CSSProperties
          }
        />
      </svg>
      <span className="relative z-10 flex items-center gap-2 font-medium tracking-normal text-white">
        {children}
      </span>
      {showDot && (
        <span
          aria-hidden="true"
          className="relative z-10 block h-1 w-1 shrink-0 rounded-full bg-white opacity-90 transition-transform group-hover:scale-125 group-hover:opacity-100"
        />
      )}
    </>
  );

  const baseClasses =
    "group relative inline-flex items-center justify-between gap-3 box-border cursor-pointer select-none overflow-hidden rounded-[16px] bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-[10px] backdrop-saturate-[180%] px-[17px] py-2 text-sm text-white transition-all active:scale-[0.98]";

  if (href) {
    return (
      <a
        ref={containerRef as any}
        href={href}
        target={target}
        rel={rel}
        className={`${baseClasses} ${className}`}
        onClick={onClick as any}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={containerRef}
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
}

export default ElvaButton;
