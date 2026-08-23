/**
 * GlowInput / GlowSelect / GlowTextarea
 * -------------------------------------
 * Drop-in replacements for <input>, <select>, and <textarea> that
 * automatically wrap the element in `.input-glow-border` — giving every
 * field the same spinning-gradient ring + purple glow that the style
 * guide demonstrates.
 */
"use client";

import React from "react";

/* ─── GlowInput ─────────────────────────────────────────── */
export interface GlowInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  wrapperClassName?: string;
  rounded?: string;
}

export function GlowInput({
  wrapperClassName = "w-full",
  rounded = "rounded-xl",
  className = "",
  ...props
}: GlowInputProps) {
  return (
    <div className={`input-glow-border ${rounded} ${wrapperClassName}`}>
      <input
        {...props}
        className={`w-full bg-[#e1e6ff29]   border border-white/10 ${rounded} text-white placeholder:text-white/40 px-4 py-2.5 text-sm outline-none transition-all ${className}`}
      />
    </div>
  );
}

/* ─── GlowSelect ─────────────────────────────────────────── */
export interface GlowSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  wrapperClassName?: string;
  rounded?: string;
  children: React.ReactNode;
}

export function GlowSelect({
  wrapperClassName = "w-full",
  rounded = "rounded-xl",
  className = "",
  children,
  ...props
}: GlowSelectProps) {
  return (
    <div className={`input-glow-border ${rounded} ${wrapperClassName}`}>
      <select
        {...props}
        className={`w-full bg-[#e1e6ff29]   border border-white/10 ${rounded} text-white px-4 py-2.5 text-sm outline-none transition-all cursor-pointer appearance-none ${className}`}
      >
        {children}
      </select>
    </div>
  );
}

/* ─── GlowTextarea ───────────────────────────────────────── */
export interface GlowTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  wrapperClassName?: string;
  rounded?: string;
}

export function GlowTextarea({
  wrapperClassName = "w-full",
  rounded = "rounded-xl",
  className = "",
  ...props
}: GlowTextareaProps) {
  return (
    <div className={`input-glow-border ${rounded} ${wrapperClassName}`}>
      <textarea
        {...props}
        className={`w-full bg-[#e1e6ff29]   border border-white/10 ${rounded} text-white placeholder:text-white/40 px-4 py-2.5 text-sm outline-none transition-all resize-y ${className}`}
      />
    </div>
  );
}

export default GlowInput;
