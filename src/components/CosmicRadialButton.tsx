"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles } from "lucide-react";

export interface CosmicRadialButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button content/label
   */
  children?: React.ReactNode;
  /**
   * Transition duration in seconds for radial gradient morphing (default: 1.5)
   */
  duration?: number;
  /**
   * CSS easing timing function curve (default: 'cubic-bezier(0.4, 0, 0.2, 1)')
   */
  easing?: string;
  /**
   * Whether to automatically drift radial centers every N seconds (default: true)
   */
  autoDrift?: boolean;
  /**
   * Auto drift interval in seconds (default: 2.0)
   */
  driftInterval?: number;
  /**
   * Maximum random position offset percentage (default: 30)
   */
  maxOffset?: number;
  /**
   * Render engine mode:
   * - 'property': Uses registered CSS @property custom percentage variables (silky smooth CSS transition)
   * - 'raf': Uses 60fps frame lerp loop for fluid physics
   * - 'keyframes': Uses pure CSS keyframes animation loop
   * (default: 'property')
   */
  engine?: "property" | "raf" | "keyframes";
  /**
   * Custom icon component (optional, defaults to Sparkles icon if true, or custom ReactNode)
   */
  icon?: React.ReactNode | boolean;
  /**
   * Additional custom className
   */
  className?: string;
}

const COSMIC_BASE_CENTERS = [
  { x: 18, y: 71 },
  { x: 36, y: 76 },
  { x: 7, y: 98 },
  { x: 72, y: 23 },
  { x: 91, y: 74 },
  { x: 67, y: 38 },
];

export const CosmicRadialButton = React.forwardRef<
  HTMLButtonElement,
  CosmicRadialButtonProps
>(
  (
    {
      children = "Cosmic Morphing Radial CTA",
      duration = 1.5,
      easing = "cubic-bezier(0.4, 0, 0.2, 1)",
      autoDrift = true,
      driftInterval = 2.0,
      maxOffset = 30,
      engine = "property",
      icon = true,
      className = "",
      onMouseEnter,
      style,
      ...restProps
    },
    ref
  ) => {
    // Target offsets (in %)
    const [targetOffsets, setTargetOffsets] = useState([
      { dx: 0, dy: 0 },
      { dx: 0, dy: 0 },
      { dx: 0, dy: 0 },
      { dx: 0, dy: 0 },
      { dx: 0, dy: 0 },
      { dx: 0, dy: 0 },
    ]);

    // Current interpolated positions for 60fps RAF mode
    const [rafCenters, setRafCenters] = useState(() =>
      COSMIC_BASE_CENTERS.map((b) => ({ x: b.x, y: b.y }))
    );

    const randomizeRef = useRef<() => void>(() => { });

    const randomizePositions = useCallback(() => {
      const span = maxOffset * 2;
      setTargetOffsets([
        { dx: Math.random() * span - maxOffset, dy: Math.random() * span - maxOffset },
        { dx: Math.random() * span - maxOffset, dy: Math.random() * span - maxOffset },
        { dx: Math.random() * span - maxOffset, dy: Math.random() * span - maxOffset },
        { dx: Math.random() * span - maxOffset, dy: Math.random() * span - maxOffset },
        { dx: Math.random() * span - maxOffset, dy: Math.random() * span - maxOffset },
        { dx: Math.random() * span - maxOffset, dy: Math.random() * span - maxOffset },
      ]);
    }, [maxOffset]);

    useEffect(() => {
      randomizeRef.current = randomizePositions;
    }, [randomizePositions]);

    // Auto drift timer
    useEffect(() => {
      if (!autoDrift) return;
      const timer = setInterval(() => {
        randomizeRef.current();
      }, driftInterval * 1000);
      return () => clearInterval(timer);
    }, [autoDrift, driftInterval]);

    // 60fps RAF lerp loop for 'raf' engine mode
    useEffect(() => {
      if (engine !== "raf") return;
      let animId: number;

      const animate = () => {
        setRafCenters((prev) =>
          prev.map((curr, i) => {
            const base = COSMIC_BASE_CENTERS[i];
            const tx = Math.max(0, Math.min(100, base.x + (targetOffsets[i]?.dx || 0)));
            const ty = Math.max(0, Math.min(100, base.y + (targetOffsets[i]?.dy || 0)));
            const lerpRate = 0.04;
            return {
              x: curr.x + (tx - curr.x) * lerpRate,
              y: curr.y + (ty - curr.y) * lerpRate,
            };
          })
        );
        animId = requestAnimationFrame(animate);
      };

      animId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animId);
    }, [engine, targetOffsets]);

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      randomizePositions();
      onMouseEnter?.(e);
    };

    // Target center coordinates (for CSS @property engine)
    const targetCenters = COSMIC_BASE_CENTERS.map((b, i) => ({
      x: Math.max(0, Math.min(100, Math.round(b.x + (targetOffsets[i]?.dx || 0)))),
      y: Math.max(0, Math.min(100, Math.round(b.y + (targetOffsets[i]?.dy || 0)))),
    }));

    const renderIcon = () => {
      if (icon === false || icon === null) return null;

      if (icon === true) {
        return (
          <Sparkles className="w-4 h-4 text-purple-300 group-hover:rotate-12 transition-transform duration-500 animate-pulse shrink-0" />
        );
      }

      if (React.isValidElement(icon)) {
        const existingClassName = (icon.props as { className?: string })?.className || "";
        const mergedClassName = existingClassName
          ? existingClassName
          : "w-4 h-4 text-purple-300 group-hover:rotate-12 transition-transform duration-500 shrink-0";
        return React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
          className: mergedClassName,
        });
      }

      if (typeof icon === "function" || (typeof icon === "object" && icon !== null)) {
        const IconComp = icon as unknown as React.ComponentType<{ className?: string }>;
        return (
          <IconComp className="w-4 h-4 text-purple-300 group-hover:rotate-12 transition-transform duration-500 shrink-0" />
        );
      }

      return icon;
    };

    if (engine === "keyframes") {
      return (
        <button
          ref={ref}
          type="button"
          onMouseEnter={handleMouseEnter}
          className={`btn-cosmic-radial-property animate-cosmic-property-drift px-7 py-3.5 rounded-xl text-white font-extrabold text-xs uppercase tracking-widest cursor-pointer flex items-center gap-2.5 ${className}`}
          style={style}
          {...restProps}
        >
          {renderIcon()}
          <span>{children}</span>
        </button>
      );
    }

    if (engine === "raf") {
      const rafBgImage = `radial-gradient(18% 28% at ${rafCenters[0].x.toFixed(1)}% ${rafCenters[0].y.toFixed(1)}%, #6200FFDB 6%, #073AFF00 100%),radial-gradient(70% 53% at ${rafCenters[1].x.toFixed(1)}% ${rafCenters[1].y.toFixed(1)}%, #7217DDFF 0%, #073AFF00 100%),radial-gradient(31% 43% at ${rafCenters[2].x.toFixed(1)}% ${rafCenters[2].y.toFixed(1)}%, #000000B5 24%, #073AFF00 100%),radial-gradient(21% 37% at ${rafCenters[3].x.toFixed(1)}% ${rafCenters[3].y.toFixed(1)}%, #54007D9C 11%, #3B55B600 100%),radial-gradient(35% 56% at ${rafCenters[4].x.toFixed(1)}% ${rafCenters[4].y.toFixed(1)}%, #8A4FFFF5 9%, #073AFF00 100%),radial-gradient(74% 86% at ${rafCenters[5].x.toFixed(1)}% ${rafCenters[5].y.toFixed(1)}%, #920092F5 24%, #073AFF00 100%),linear-gradient(125deg, #190773FF 1%, #0F0439FF 100%)`;

      return (
        <button
          ref={ref}
          type="button"
          onMouseEnter={handleMouseEnter}
          style={{
            backgroundSize: "100% 100%",
            backgroundPosition: "0px 0px, 0px 0px, 0px 0px, 0px 0px, 0px 0px, 0px 0px, 0px 0px",
            backgroundImage: rafBgImage,
            ...style,
          }}
          className={`relative px-8 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_35px_rgba(114,23,221,0.45)] hover:shadow-[0_15px_45px_rgba(138,79,255,0.75)] cursor-pointer flex items-center gap-3 group overflow-hidden ${className}`}
          {...restProps}
        >
          {renderIcon()}
          <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">{children}</span>
        </button>
      );
    }

    // Default 'property' engine mode (CSS @property registered percentage variables)
    const propertyStyle = {
      "--cosmic-duration": `${duration.toFixed(1)}s`,
      "--cosmic-easing": easing,
      "--r1-x": `${targetCenters[0].x}%`,
      "--r1-y": `${targetCenters[0].y}%`,
      "--r2-x": `${targetCenters[1].x}%`,
      "--r2-y": `${targetCenters[1].y}%`,
      "--r3-x": `${targetCenters[2].x}%`,
      "--r3-y": `${targetCenters[2].y}%`,
      "--r4-x": `${targetCenters[3].x}%`,
      "--r4-y": `${targetCenters[3].y}%`,
      "--r5-x": `${targetCenters[4].x}%`,
      "--r5-y": `${targetCenters[4].y}%`,
      "--r6-x": `${targetCenters[5].x}%`,
      "--r6-y": `${targetCenters[5].y}%`,
      ...style,
    } as React.CSSProperties;

    return (
      <button
        ref={ref}
        type="button"
        onMouseEnter={handleMouseEnter}
        style={propertyStyle}
        className={`btn-cosmic-radial-property relative px-8 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] cursor-pointer flex items-center gap-3 group overflow-hidden ${className}`}
        {...restProps}
      >
        {renderIcon()}
        <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">{children}</span>
      </button>
    );
  }
);

CosmicRadialButton.displayName = "CosmicRadialButton";

export default CosmicRadialButton;
