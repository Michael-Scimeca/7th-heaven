"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface IconCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "default" | "purple" | "emerald" | "rose" | "amber" | "cyan";
  children: React.ReactNode;
}

const sizeStyles: Record<NonNullable<IconCircleProps["size"]>, string> = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
  xl: "h-16 w-16 text-xl",
};

const colorStyles: Record<NonNullable<IconCircleProps["color"]>, string> = {
  default: "border-white/10 bg-white/5 text-white/80",
  purple: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  rose: "border-red-500/30 bg-red-500/10 text-red-400",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
};

export const IconCircle = forwardRef<HTMLDivElement, IconCircleProps>(
  (
    { size = "md", color = "default", className, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full border transition-colors",
          sizeStyles[size],
          colorStyles[color],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

IconCircle.displayName = "IconCircle";

export default IconCircle;
