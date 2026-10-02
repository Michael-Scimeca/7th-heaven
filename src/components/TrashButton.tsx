"use client";

import React from "react";

export interface TrashButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  variant?: "danger" | "ghost" | "solid";
  title?: string;
  iconSize?: number;
}

const SIZE_CLASSES = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

const ICON_SIZES = {
  sm: 14,
  md: 15,
  lg: 16,
};

const VARIANT_CLASSES = {
  danger:
    "border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white",
  ghost:
    "border border-transparent text-white/20 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400",
  solid:
    "border border-rose-500 bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:bg-rose-600",
};

export const TrashButton = React.forwardRef<
  HTMLButtonElement,
  TrashButtonProps
>(
  (
    {
      size = "lg",
      variant = "danger",
      title = "Delete",
      "aria-label": ariaLabel,
      iconSize,
      className = "",
      type = "button",
      disabled,
      ...props
    },
    ref,
  ) => {
    const computedIconSize = iconSize ?? ICON_SIZES[size];

    return (
      <button
        ref={ref}
        type={type}
        title={title}
        aria-label={ariaLabel || title}
        disabled={disabled}
        className={`group/trash flex cursor-pointer items-center justify-center transition-[background-color,border-color,color,transform] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
        {...props}
      >
        <svg
          className="transition-transform group-hover/trash:scale-110"
          width={computedIconSize}
          height={computedIconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
        </svg>
      </button>
    );
  },
);

TrashButton.displayName = "TrashButton";
export default TrashButton;
