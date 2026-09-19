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
      className={`btn-pill-glass ${isInteractive ? "cursor-pointer active:scale-95 select-none" : ""} ${
        isActive ? "active" : ""
      } ${className}`}
      {...props}>
      {children || label}
    </span>
  );
}

export default SectionBadge;
