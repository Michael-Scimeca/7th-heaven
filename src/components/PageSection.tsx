"use client";

import React from "react";

export interface PageSectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  id?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "none";
  as?: React.ElementType;
  fullBleed?: boolean;
  background?: React.ReactNode;
  containerClassName?: string;
}

export function PageSection({
  children,
  id,
  className = "",
  size = "md",
  as: Component = "section",
  fullBleed = false,
  background,
  containerClassName = "",
  ...props
}: PageSectionProps) {
  const sectionPaddingClass =
    size === "sm"
      ? "section-sm"
      : size === "lg"
      ? "section-lg"
      : size === "none"
      ? ""
      : "section";

  const hasBand = fullBleed || !!background;
  const bandPaddingClass = hasBand
    ? size === "sm"
      ? "py-[var(--spacing-section-sm)]"
      : size === "lg"
      ? "py-[var(--spacing-section-lg)]"
      : "py-[var(--spacing-section)]"
    : "";

  const Comp = Component as any;

  return (
    <Comp
      id={id}
      className={`${sectionPaddingClass} ${fullBleed ? "w-full relative" : ""} ${className}`.trim()}
      {...props}
    >
      {background}
      <div className={`site-container ${bandPaddingClass} ${containerClassName}`.trim()}>
        {children}
      </div>
    </Comp>
  );
}

export default PageSection;
