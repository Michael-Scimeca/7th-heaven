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
   * Optional group synchronization ID. Buttons with the same syncId will match transition timing, speed, and color palette.
   */
  syncId?: string;
  /**
   * Custom icon component (optional, defaults to Sparkles icon if true, or custom ReactNode)
   */
  icon?: React.ReactNode | boolean;
  /**
   * Additional custom className
   */
  className?: string;
}

const PALETTES = [
  // Electric Cyan & Magenta
  ["rgba(0, 240, 255, 0.85)", "rgba(255, 0, 214, 0.9)", "rgba(0, 0, 0, 0.7)", "rgba(157, 0, 255, 0.85)", "rgba(236, 72, 153, 0.8)", "rgba(124, 58, 237, 0.95)"],
  // Neon Amber & Crimson
  ["rgba(255, 107, 0, 0.85)", "rgba(255, 0, 102, 0.9)", "rgba(15, 0, 30, 0.7)", "rgba(245, 158, 11, 0.85)", "rgba(239, 68, 68, 0.8)", "rgba(147, 51, 234, 0.95)"],
  // Cyber Emerald & Electric Blue
  ["rgba(16, 185, 129, 0.85)", "rgba(6, 182, 212, 0.9)", "rgba(5, 15, 30, 0.7)", "rgba(59, 130, 246, 0.85)", "rgba(168, 85, 247, 0.8)", "rgba(16, 185, 129, 0.95)"],
  // Royal Sunset & Gold
  ["rgba(236, 72, 153, 0.85)", "rgba(168, 85, 247, 0.9)", "rgba(20, 0, 40, 0.7)", "rgba(251, 146, 60, 0.85)", "rgba(244, 63, 94, 0.8)", "rgba(99, 102, 241, 0.95)"],
  // Deep Purple Hyperglow
  ["rgba(192, 38, 211, 0.85)", "rgba(124, 58, 237, 0.9)", "rgba(10, 0, 25, 0.7)", "rgba(232, 121, 249, 0.85)", "rgba(99, 102, 241, 0.8)", "rgba(217, 70, 239, 0.95)"],
];

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
      duration = 0.75,
      easing = "cubic-bezier(0.4, 0, 0.2, 1)",
      autoDrift = true,
      driftInterval = 2.0,
      maxOffset = 30,
      engine = "property",
      syncId,
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

    // Unique desynchronized random motion, direction & color palette per button instance (or synced if syncId provided)
    const [randomAnimProps, setRandomAnimProps] = useState<{
      name: string;
      dur: string;
      delay: string;
      dir: string;
      r1c?: string;
      r2c?: string;
      r3c?: string;
      r4c?: string;
      r5c?: string;
      r6c?: string;
      r1x?: string;
      r1y?: string;
      r2x?: string;
      r2y?: string;
    }>({
      name: "cosmic-radial-property-drift",
      dur: "6s",
      delay: "0s",
      dir: "alternate",
    });

    useEffect(() => {
      let seed = 0;
      if (syncId) {
        for (let i = 0; i < syncId.length; i++) {
          seed = (seed << 5) - seed + syncId.charCodeAt(i);
          seed |= 0;
        }
      } else {
        seed = Math.floor(Math.random() * 1000000);
      }
      const absSeed = Math.abs(seed);
      const animNames = [
        "cosmic-radial-property-drift",
        "cosmic-radial-property-drift-reverse",
        "cosmic-radial-property-drift-spiral",
      ];
      const directions = ["normal", "reverse", "alternate", "alternate-reverse"];
      const palette = PALETTES[absSeed % PALETTES.length];
      const rName = animNames[absSeed % animNames.length];
      const rDur = (3.8 + (absSeed % 45) / 10).toFixed(2);
      const rDelay = syncId ? "0s" : (-((absSeed % 60) / 10)).toFixed(2);
      const rDir = directions[absSeed % directions.length];

      const r1x = Math.floor(15 + (absSeed % 70));
      const r1y = Math.floor(15 + ((absSeed * 3) % 70));
      const r2x = Math.floor(15 + ((absSeed * 7) % 70));
      const r2y = Math.floor(15 + ((absSeed * 11) % 70));

      setRandomAnimProps({
        name: rName,
        dur: `${rDur}s`,
        delay: rDelay,
        dir: rDir,
        r1c: palette[0],
        r2c: palette[1],
        r3c: palette[2],
        r4c: palette[3],
        r5c: palette[4],
        r6c: palette[5],
        r1x: `${r1x}%`,
        r1y: `${r1y}%`,
        r2x: `${r2x}%`,
        r2y: `${r2y}%`,
      });
    }, [syncId]);

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
          className={`btn-cosmic-radial-property animate-cosmic-property-drift px-7 py-3.5  rounded-lg text-white font-extrabold text-xs uppercase tracking-widest cursor-pointer flex items-center gap-2.5 ${className}`}
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
          className={`relative px-2 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] cursor-pointer flex items-center justify-center gap-3 group overflow-hidden ${className}`}
          {...restProps}
        >
          {renderIcon()}
          <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">{children}</span>
        </button>
      );
    }

    // Default 'property' engine mode (CSS @property registered percentage variables)
    const propertyStyle = {
      "--cosmic-anim-name": randomAnimProps.name,
      "--cosmic-anim-dur": randomAnimProps.dur,
      "--cosmic-anim-delay": randomAnimProps.delay,
      "--cosmic-anim-dir": randomAnimProps.dir,
      ...(randomAnimProps.r1c ? { "--r1-c": randomAnimProps.r1c } : {}),
      ...(randomAnimProps.r2c ? { "--r2-c": randomAnimProps.r2c } : {}),
      ...(randomAnimProps.r3c ? { "--r3-c": randomAnimProps.r3c } : {}),
      ...(randomAnimProps.r4c ? { "--r4-c": randomAnimProps.r4c } : {}),
      ...(randomAnimProps.r5c ? { "--r5-c": randomAnimProps.r5c } : {}),
      ...(randomAnimProps.r6c ? { "--r6-c": randomAnimProps.r6c } : {}),
      ...(randomAnimProps.r1x ? { "--r1-x": randomAnimProps.r1x } : {}),
      ...(randomAnimProps.r1y ? { "--r1-y": randomAnimProps.r1y } : {}),
      ...(randomAnimProps.r2x ? { "--r2-x": randomAnimProps.r2x } : {}),
      ...(randomAnimProps.r2y ? { "--r2-y": randomAnimProps.r2y } : {}),
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
        onTouchStart={() => randomizePositions()}
        style={propertyStyle}
        className={`btn-cosmic-radial-property relative px-6 py-3 rounded-2xl text-white font-black text-xs uppercase tracking-[0.15em] cursor-pointer flex items-center justify-center gap-2.5 group overflow-hidden hover:scale-105 hover:brightness-115 active:scale-95 transition-all duration-300 shadow-[0_0_25px_rgba(147,51,234,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.75)] whitespace-nowrap flex-nowrap shrink-0 select-none ${className}`}
        {...restProps}
      >
        {renderIcon()}
        <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] whitespace-nowrap shrink-0 flex items-center gap-2">{children}</span>
      </button>
    );
  }
);

CosmicRadialButton.displayName = "CosmicRadialButton";

export default CosmicRadialButton;
