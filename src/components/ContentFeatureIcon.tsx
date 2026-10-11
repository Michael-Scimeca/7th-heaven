import React from "react";

export interface ContentFeatureIconProps {
  className?: string;
  size?: "sm" | "md";
}

export function ContentFeatureIcon({
  className = "",
  size = "md",
}: ContentFeatureIconProps) {
  const sizeClasses = size === "sm" ? "!w-6 !h-6 !p-1 !mt-0" : "";

  return (
    <span
      className={`content-feature-icon ${sizeClasses} ${className}`}
      aria-hidden="true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M20 6L9 17L4 12"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default ContentFeatureIcon;
