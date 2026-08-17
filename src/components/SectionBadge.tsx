"use client";

import React from "react";

/**
 * SectionBadge — A compact pill-shaped label for admin section headers.
 *
 * @param label    — The text displayed inside the badge (e.g. "SMS • Email • Fan Wall")
 * @param color    — Tailwind color name without shade: "rose" | "amber" | "emerald" | "cyan" | "purple" | "blue" | "indigo" | "pink"
 * @param className — Optional extra classes to merge
 */

type BadgeColor = "rose" | "amber" | "emerald" | "cyan" | "purple" | "blue" | "indigo" | "pink";

const COLOR_MAP: Record<BadgeColor, { text: string; bg: string; border: string }> = {
  rose: { text: "text-rose-500", bg: "bg-transparent", border: "border-rose-500/20" },
  amber: { text: "text-[var(--color-purple-light)]", bg: "bg-transparent", border: "border-[var(--color-border-purple)]" },
  emerald: { text: "text-emerald-500", bg: "bg-transparent", border: "border-[var(--color-accent)]/30" },
  cyan: { text: "text-cyan-500", bg: "bg-transparent", border: "border-cyan-500/20" },
  purple: { text: "text-[var(--color-accent)]", bg: "bg-transparent", border: "border-[var(--color-accent)]/20" },
  blue: { text: "text-blue-500", bg: "bg-transparent", border: "border-blue-500/20" },
  indigo: { text: "text-indigo-500", bg: "bg-transparent", border: "border-indigo-500/20" },
  pink: { text: "text-pink-500", bg: "bg-transparent", border: "border-pink-500/20" },
};

interface SectionBadgeProps {
  label: string;
  color?: BadgeColor;
  className?: string;
}

export function SectionBadge({ label, color = "rose", className = "" }: SectionBadgeProps) {
  const c = COLOR_MAP[color];

  return (
    <span
      className={`text-[12px] font-black uppercase tracking-wider ${c.text} bg-transparent px-3 py-1  rounded-lg  border-none whitespace-nowrap ${className}`}
      style={{ fontSize: "12px" }}
    >
      {label}
    </span>
  );
}
