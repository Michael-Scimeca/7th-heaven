"use client";

import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  label?: string;
  variant?: "purple" | "gradient" | "outline" | "glow" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
}

const VARIANT_CLASSES: Record<NonNullable<BadgeProps["variant"]>, string> = {
  purple:
    "bg-[#6c1bce] hover:bg-[#7b24e6]   border border-purple-300/40 shadow-[0_2px_12px_rgba(108,27,206,0.4)]",
  gradient:
    "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700   border border-purple-300/40 shadow-[0_2px_15px_rgba(147,51,234,0.4)]",
  outline:
    "bg-purple-950/40 text-purple-200 border border-purple-400/60 shadow-[0_0_10px_rgba(168,85,247,0.2)] hover:border-purple-300",
  glow: "bg-[#6c1bce]   border border-purple-300/60 shadow-[0_0_20px_rgba(168,85,247,0.6)] animate-pulse",
  dark: "bg-purple-950/80  /90 border border-white/20 shadow-md hover:bg-purple-900/80",
};

const SIZE_CLASSES: Record<NonNullable<BadgeProps["size"]>, string> = {
  sm: "px-3 py-1    r",
  md: "px-5 py-2    ",
  lg: "px-7 py-2.5 text-base  ",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      label,
      variant = "purple",
      size = "md",
      className = "",
      onClick,
      ...props
    },
    ref,
  ) => {
    return (
      <span
        ref={ref}
        onClick={onClick}
        className={`inline-flex items-center justify-center rounded-full transition-[background-color,border-color,color,transform] select-none ${onClick ? "cursor-pointer active:scale-95" : ""} ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.purple} ${SIZE_CLASSES[size] || SIZE_CLASSES.md} ${className}`}
        {...props}
      >
        {children || label || "CEO / BOOKING / BANDS"}
      </span>
    );
  },
);

Badge.displayName = "Badge";

export default Badge;
