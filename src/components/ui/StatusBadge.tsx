"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: "success" | "warning" | "error" | "info" | "neutral";
  dot?: boolean;
  children: React.ReactNode;
}

const statusStyles: Record<NonNullable<StatusBadgeProps["status"]>, string> = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  error: "border-red-500/30 bg-red-500/10 text-red-400",
  info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  neutral: "border-white/10 bg-white/5 text-white/70",
};

const dotStyles: Record<NonNullable<StatusBadgeProps["status"]>, string> = {
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  error: "bg-red-400",
  info: "bg-cyan-400",
  neutral: "bg-white/60",
};

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  (
    { status = "neutral", dot = false, className, children, ...props },
    ref,
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors",
          statusStyles[status],
          className,
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotStyles[status])}
          />
        )}
        {children}
      </span>
    );
  },
);

StatusBadge.displayName = "StatusBadge";

export default StatusBadge;
