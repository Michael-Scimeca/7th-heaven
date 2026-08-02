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
  rose:    { text: "text-rose-500",    bg: "bg-rose-500/15",    border: "border-rose-500/20" },
  amber:   { text: "text-amber-500",   bg: "bg-amber-500/15",   border: "border-amber-500/20" },
  emerald: { text: "text-emerald-500", bg: "bg-emerald-500/15", border: "border-emerald-500/20" },
  cyan:    { text: "text-cyan-500",    bg: "bg-cyan-500/15",    border: "border-cyan-500/20" },
  purple:  { text: "text-purple-500",  bg: "bg-purple-500/15",  border: "border-purple-500/20" },
  blue:    { text: "text-blue-500",    bg: "bg-blue-500/15",    border: "border-blue-500/20" },
  indigo:  { text: "text-indigo-500",  bg: "bg-indigo-500/15",  border: "border-indigo-500/20" },
  pink:    { text: "text-pink-500",    bg: "bg-pink-500/15",    border: "border-pink-500/20" },
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
      className={`text-[8.5px] font-black uppercase tracking-widest ${c.text} ${c.bg} ${c.border} px-2 py-0.5 rounded border whitespace-nowrap ${className}`}
    >
      {label}
    </span>
  );
}
