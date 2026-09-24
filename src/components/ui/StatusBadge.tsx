import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: "success" | "warning" | "error" | "info" | "neutral" | "purple";
  size?: "sm" | "md";
  dot?: boolean;
  children: React.ReactNode;
}

const statusStyles: Record<NonNullable<StatusBadgeProps["status"]>, string> = {
  success:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  warning:
    "border-amber-500/30 bg-amber-500/10 text-amber-300",
  error:
    "border-rose-500/30 bg-rose-500/10 text-rose-300",
  info:
    "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  neutral:
    "border-white/10 bg-white/5 text-white/70",
  purple:
    "border-purple-500/30 bg-purple-500/10 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]",
};

const dotColors: Record<NonNullable<StatusBadgeProps["status"]>, string> = {
  success: "bg-emerald-400 animate-pulse",
  warning: "bg-amber-400 animate-pulse",
  error: "bg-rose-400 animate-pulse",
  info: "bg-cyan-400 animate-pulse",
  neutral: "bg-white/40",
  purple: "bg-purple-400 animate-pulse",
};

const sizeStyles: Record<NonNullable<StatusBadgeProps["size"]>, string> = {
  sm: "px-2.5 py-0.5 text-xs  ",
  md: "px-3 py-1 text-sm  ",
};

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  (
    {
      status = "neutral",
      size = "sm",
      dot = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border tracking-wide select-none",
          statusStyles[status],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn("h-1.5 w-1.5 rounded-full", dotColors[status])}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  },
);

StatusBadge.displayName = "StatusBadge";

export default StatusBadge;
