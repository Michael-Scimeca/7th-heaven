"use client";

import React, { forwardRef } from "react";

export interface DestructiveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "xs" | "sm" | "md" | "lg";
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const sizeClasses = {
  xs: "px-2.5 py-1 text-xs",
  sm: "px-3.5 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export const DestructiveButton = forwardRef<
  HTMLButtonElement,
  DestructiveButtonProps
>(
  (
    {
      size = "md",
      fullWidth = false,
      icon,
      children,
      className = "",
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={`transition-colors rounded-full border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 focus:outline-none focus:ring-1 focus:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-40 font-medium cursor-pointer inline-flex items-center justify-center gap-1.5 ${
          sizeClasses[size]
        } ${fullWidth ? "w-full" : ""} ${className}`}
        {...props}
      >
        {icon}
        {children && <span>{children}</span>}
      </button>
    );
  },
);

DestructiveButton.displayName = "DestructiveButton";

export default DestructiveButton;
