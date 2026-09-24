import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "solid" | "interactive" | "gradient";
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variantStyles: Record<NonNullable<GlassCardProps["variant"]>, string> = {
  default:
    "border border-white/10 bg-black/40 backdrop-blur-xl shadow-xl",
  solid:
    "border border-white/10 bg-[#0f0f13] backdrop-blur-md shadow-2xl",
  interactive:
    "border border-white/10 bg-black/40 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-purple-500/40 hover:bg-black/60 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]",
  gradient:
    "border border-purple-500/20 bg-gradient-to-b from-purple-900/20 via-black/40 to-black/60 backdrop-blur-xl shadow-2xl",
};

const paddingStyles: Record<NonNullable<GlassCardProps["padding"]>, string> = {
  none: "",
  sm: "p-3 sm:p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      variant = "default",
      padding = "md",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-colors",
          variantStyles[variant],
          paddingStyles[padding],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

GlassCard.displayName = "GlassCard";

export default GlassCard;
