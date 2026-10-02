"use client";

import React, { memo } from "react";
import { Play, Pause } from "lucide-react";

export interface GlassPlayButtonProps extends React.HTMLAttributes<HTMLElement> {
  as?: "button" | "div";
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "purple" | "amber" | "emerald" | "cyan" | "rose" | "dark";
  isPlaying?: boolean;
  glow?: boolean;
  pulse?: boolean;
  className?: string;
  iconClassName?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const DEFAULT_VARIANT_STYLE = {
  bg: "bg-[#3b154c]/70 hover:bg-[#521c6b]/90",
  border: "border-white/25 hover:border-purple-300/70",
  shadow:
    "shadow-[0_4px_20px_rgba(59,21,76,0.5)] hover:shadow-[0_0_24px_rgba(192,132,252,0.45)]",
};

const VARIANT_CLASSES: Record<
  NonNullable<GlassPlayButtonProps["variant"]>,
  { bg: string; border: string; shadow: string }
> = {
  purple: DEFAULT_VARIANT_STYLE,
  amber: DEFAULT_VARIANT_STYLE,
  emerald: DEFAULT_VARIANT_STYLE,
  cyan: DEFAULT_VARIANT_STYLE,
  rose: DEFAULT_VARIANT_STYLE,
  dark: DEFAULT_VARIANT_STYLE,
};

const SIZE_CLASSES: Record<
  NonNullable<GlassPlayButtonProps["size"]>,
  { button: string; icon: string }
> = {
  sm: {
    button: "p-4  ",
    icon: "w-3.5 h-3.5",
  },
  md: {
    button: "p-4  ",
    icon: "w-4 h-4",
  },
  lg: {
    button: "p-5 ",
    icon: "w-5 h-5",
  },
  xl: {
    button: "p-8",
    icon: "w-6 h-6",
  },
};

/**
 * GlassPlayButton — Reusable frosted-glass capsule play button
 * matching 7th Heaven design language.
 */
export const GlassPlayButton = memo(
  ({
    as = "button",
    size = "md",
    variant = "purple",
    isPlaying = false,
    glow = false,
    pulse = false,
    className = "",
    iconClassName = "",
    disabled = false,
    type = "button",
    children,
    ...props
  }: GlassPlayButtonProps) => {
    const varStyles = VARIANT_CLASSES[variant] || VARIANT_CLASSES.purple;
    const sizeStyles = SIZE_CLASSES[size] || SIZE_CLASSES.md;
    const Component = as === "div" ? "div" : "button";

    return (
      <Component
        {...(as === "button" ? { type, disabled } : {})}
        className={`seventh--btn group relative inline-flex h-15 w-15 cursor-pointer items-center justify-center !rounded-full border border-solid backdrop-blur-md backdrop-saturate-150 transition-[background-color,border-color,box-shadow,transform,opacity] select-none active:scale-95 ${varStyles.bg} ${varStyles.border} ${varStyles.shadow} ${sizeStyles.button} ${glow ? "ring-2 ring-purple-400/40 ring-offset-2 ring-offset-black/50" : ""} ${pulse ? "animate-pulse" : ""} ${disabled ? "pointer-events-none cursor-not-allowed opacity-40" : "hover:scale-105"} ${className}`}
        {...props}
      >
        {isPlaying ? (
          <Pause
            className={`transition-transform fill-white group-hover:scale-110 ${sizeStyles.icon} ${iconClassName}`}
          />
        ) : (
          <Play
            className={`transition-transform ml-0.5 fill-white group-hover:scale-110 ${sizeStyles.icon} ${iconClassName}`}
          />
        )}
        {children && <span className="ml-2">{children}</span>}
      </Component>
    );
  },
);

GlassPlayButton.displayName = "GlassPlayButton";
export default GlassPlayButton;
