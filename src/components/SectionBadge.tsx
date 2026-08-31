"use client";

import React from "react";

export interface SectionBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  label?: string;
  className?: string;
  isActive?: boolean;
  onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
}

export function SectionBadge({
  children,
  label,
  className = "",
  isActive = false,
  onClick,
  ...props
}: SectionBadgeProps) {
  const isInteractive = Boolean(onClick);

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
      className={`inline-flex items-center justify-center !text-[11px] !leading-[11px] !font-bold uppercase tracking-wider transition-all duration-200 ${isInteractive ? "cursor-pointer active:scale-95 select-none" : ""
        } ${isActive
          ? "bg-[#e1e6ff29] text-white border  border-white/10  hover:border-purple-400/50 hover:bg-white/1"
          : "bg-[#e1e6ff29] text-white border  border-white/10  hover:border-purple-400/50 hover:bg-white/10"
        } px-3.5 py-1.5 rounded-full whitespace-nowrap w-fit ${className}`}
      {...props}
    >
      {children || label}
    </span>
  );
}

export default SectionBadge;
