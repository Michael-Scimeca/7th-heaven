"use client";

import React from "react";

export interface PillBadgeButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  label?: string;
  showDot?: boolean;
  dotColor?: "purple" | "emerald" | "rose" | "cyan" | "amber";
  isActive?: boolean;
  className?: string;
}

const DOT_COLORS = {
  purple:
    "bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.9)] border-purple-950",
  emerald:
    "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] border-emerald-950",
  rose:
    "bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.9)] border-rose-950",
  cyan:
    "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)] border-cyan-950",
  amber:
    "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)] border-amber-950",
};

export const PillBadgeButton = React.forwardRef<
  HTMLButtonElement,
  PillBadgeButtonProps
>(
  (
    {
      children,
      label,
      showDot = true,
      dotColor = "purple",
      isActive = false,
      className = "",
      onClick,
      ...props
    },
    ref
  ) => {

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={`relative inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#301650]/80 hover:bg-[#3d1d66] border border-white/20 hover:border-purple-400/60 shadow-[0_2px_10px_rgba(0,0,0,0.3)] transition-all duration-200 cursor-pointer active:scale-95 ${isActive
            ? "bg-[#451f73] border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            : ""
          } ${className}`}
        {...props}
      >
        {showDot && (
          <span
            className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 ${DOT_COLORS[dotColor] || DOT_COLORS.purple
              } animate-pulse pointer-events-none`}
          />
        )}
        <span>{children || label || "PRESS & MEDIA"}</span>
      </button>
    );
  }
);

PillBadgeButton.displayName = "PillBadgeButton";

export default PillBadgeButton;
