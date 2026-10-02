"use client";

import React from "react";

export interface SectionBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  label?: string;
  className?: string;
  isActive?: boolean;
  variant?: "box" | "pill";
  color?: "default" | "purple" | "emerald" | "amber" | "rose" | "cyan";
  onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
}

const COLOR_CLASSES: Record<string, string> = {
  default: "",
  purple: "!border-purple-400/30 !bg-purple-500/20 !text-purple-200",
  emerald: "!border-emerald-500/30 !bg-emerald-500/10 !text-emerald-400",
  amber: "!border-amber-500/30 !bg-amber-500/10 !text-amber-400",
  rose: "!border-rose-500/30 !bg-rose-500/10 !text-rose-400",
  cyan: "!border-cyan-500/30 !bg-cyan-500/10 !text-cyan-300",
};

export function SectionBadge({
  children,
  label,
  className = "",
  isActive = false,
  variant = "box",
  color = "default",
  onClick,
  ...props
}: SectionBadgeProps) {
  const isInteractive = Boolean(onClick);
  const colorClass = COLOR_CLASSES[color] || "";
  const radiusClass =
    variant === "pill" ? "!rounded-full" : "rounded-[var(--radius-box)]";

  return (
    <span
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.(e as any);
              }
            }
          : undefined
      }
      className={`btn-pill-glass ${radiusClass} ${colorClass} ${
        isInteractive ? "cursor-pointer select-none active:scale-95" : ""
      } ${isActive ? "active" : ""} ${className}`}
      {...props}
    >
      {children || label}
    </span>
  );
}

export default SectionBadge;
