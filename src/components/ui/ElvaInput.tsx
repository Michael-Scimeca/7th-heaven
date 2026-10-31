"use client";

import React, { useRef, useState, useEffect, forwardRef, useId } from "react";

export interface ElvaInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  showDot?: boolean;
  gradientId?: string;
  startColor?: string;
  endColor?: string;
  wrapperClassName?: string;
  inputClassName?: string;
  onClear?: () => void;
}

/**
 * Recreates the exact frosted glass capsule input with animated laser-draw
 * perimeter gradient stroke on hover/focus from Elva Labs / Backdrop Video Tuner.
 */
export const ElvaInput = forwardRef<HTMLInputElement, ElvaInputProps>(
  (
    {
      icon,
      rightElement,
      showDot = true,
      gradientId,
      startColor = "#0989d8",
      endColor = "#850dee",
      wrapperClassName = "",
      inputClassName = "",
      className = "",
      onClear,
      value,
      placeholder,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const gradId =
      gradientId ||
      `elva-input-grad-${autoId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 280, height: 40 });

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
    const perimeter = Math.max(
      10,
      Math.round(2 * (w - 2 * rx) + 2 * (h - 2 * rx) + 2 * Math.PI * rx)
    );
    const svgW = w + 4;
    const svgH = h + 4;

    return (
      <div
        ref={containerRef}
        className={`group relative flex items-center w-full rounded-[16px] border border-white/10 hover:border-transparent focus-within:border-transparent bg-white/[0.05] hover:bg-white/[0.08] focus-within:bg-white/[0.08] backdrop-blur-[10px] backdrop-saturate-[180%] shadow-2xl transition-all overflow-hidden ${wrapperClassName}`}
      >
        {/* Animated Laser Gradient Perimeter Stroke */}
        <svg
          className="pointer-events-none absolute -inset-[2px] transition-opacity"
          width={svgW}
          height={svgH}
          aria-hidden="true"
          style={{ filter: "blur(3px)" }}
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="30%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={startColor} />
              <stop offset="100%" stopColor={endColor} />
            </linearGradient>
          </defs>
          <rect
            x="2"
            y="2"
            rx={rx}
            fill="none"
            stroke={`url(#${gradId})`}
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

        {/* Optional Left Icon */}
        {icon && (
          <div className="relative z-10 pl-3.5 pr-1 flex items-center justify-center shrink-0 text-zinc-400 group-hover:text-amber-300 group-focus-within:text-amber-300 transition-colors pointer-events-none">
            {icon}
          </div>
        )}

        {/* Native Text Input */}
        <input
          ref={ref}
          value={value}
          placeholder={placeholder}
          className={`no-bg-icon relative z-10 w-full bg-transparent px-3 py-2 text-xs font-semibold text-zinc-100 placeholder:text-zinc-500 placeholder:font-normal focus:outline-none transition-colors !pl-2.5 !bg-none ${inputClassName} ${className}`}
          {...props}
        />

        {/* Clear Button */}
        {Boolean(value) && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="relative z-10 mr-1.5 p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Clear input text"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Right Element (shortcut badge, count, etc.) */}
        {rightElement && (
          <div className="relative z-10 pr-2.5 flex items-center shrink-0">
            {rightElement}
          </div>
        )}

        {/* Elva White Tracking Dot Indicator */}
        {showDot && (
          <span
            aria-hidden="true"
            className="relative z-10 mr-3 block h-1 w-1 shrink-0 rounded-full bg-white opacity-85 transition-transform group-hover:scale-150 group-hover:opacity-100 group-focus-within:scale-150 group-focus-within:opacity-100"
          />
        )}
      </div>
    );
  }
);

ElvaInput.displayName = "ElvaInput";
export default ElvaInput;
