"use client";

import React from "react";

export type StackGap =
  | "3xs"
  | "2xs"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "section"
  | "section-sm"
  | "section-lg"
  | string;

export interface StackProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  gap?: StackGap;
  className?: string;
  as?: React.ElementType;
}

const gapClassMap: Record<string, string> = {
  "3xs": "gap-[var(--spacing-3xs)]",
  "2xs": "gap-[var(--spacing-2xs)]",
  xs: "gap-[var(--spacing-xs)]",
  sm: "gap-[var(--spacing-sm)]",
  md: "gap-[var(--spacing-md)]",
  lg: "gap-[var(--spacing-lg)]",
  xl: "gap-[var(--spacing-xl)]",
  "2xl": "gap-[var(--spacing-2xl)]",
  section: "gap-[var(--spacing-section)]",
  "section-sm": "gap-[var(--spacing-section-sm)]",
  "section-lg": "gap-[var(--spacing-section-lg)]",
};

export function Stack({
  children,
  gap = "md",
  className = "",
  as: Component = "div",
  ...props
}: StackProps) {
  const gapClass =
    gapClassMap[gap] ||
    (gap.startsWith("gap-") ? gap : `gap-${gap}`);

  const Comp = Component as any;

  return (
    <Comp className={`flex flex-col ${gapClass} ${className}`.trim()} {...props}>
      {children}
    </Comp>
  );
}

export default Stack;
