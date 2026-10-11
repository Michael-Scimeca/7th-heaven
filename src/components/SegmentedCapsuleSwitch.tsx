"use client";

import React from "react";
import { X, ShieldCheck, Check } from "lucide-react";

export interface SegmentedCapsuleOption<T extends string | number | boolean> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  activeClassName?: string;
}

export interface SegmentedCapsuleSwitchProps<T extends string | number | boolean> {
  id?: string;
  label?: string;
  value: T;
  options: SegmentedCapsuleOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * SegmentedCapsuleSwitch
 *
 * Frictionless 1-click segmented pill switch for binary and discrete form choices.
 * Features an ambient frosted gradient capsule with side-by-side radio options.
 */
export default function SegmentedCapsuleSwitch<T extends string | number | boolean>({
  id,
  label,
  value,
  options,
  onChange,
  className = "",
  size = "md",
}: SegmentedCapsuleSwitchProps<T>) {
  const sizeClasses = {
    sm: {
      capsule: "p-0.5",
      btn: "px-3.5 py-1.5 text-[11px]",
      divider: "h-3.5",
    },
    md: {
      capsule: "p-1",
      btn: "px-4 py-2 text-xs",
      divider: "h-4",
    },
    lg: {
      capsule: "p-1.5",
      btn: "px-5 py-2.5 text-sm",
      divider: "h-5",
    },
  }[size];

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <span
          id={id ? `${id}-label` : undefined}
          className="block text-xs font-bold uppercase tracking-widest text-white/70"
        >
          {label}
        </span>
      )}

      <div
        role="radiogroup"
        aria-labelledby={id ? `${id}-label` : undefined}
        aria-label={!id ? label : undefined}
        className={`inline-flex items-center self-start rounded-full bg-gradient-to-r from-purple-950/50 via-indigo-950/40 to-purple-900/50 backdrop-blur-2xl ${sizeClasses.capsule}`}
      >
        {options.map((opt, idx) => {
          const isSelected = opt.value === value;
          const isFirst = idx === 0;
          const isLast = idx === options.length - 1;

          // Default active styling
          const isPositive =
            String(opt.value).toLowerCase() === "yes" ||
            String(opt.label).toLowerCase().includes("yes");

          const selectedClass =
            opt.activeClassName ||
            (isPositive
              ? "bg-emerald-500/25 text-emerald-200 border border-emerald-400/30 shadow-md"
              : "bg-white/20 text-white shadow-md");

          return (
            <React.Fragment key={String(opt.value)}>
              {idx > 0 && <div className={`w-px bg-white/20 mx-1 ${sizeClasses.divider}`} />}
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChange(opt.value)}
                className={`flex cursor-pointer items-center gap-2 rounded-full font-black uppercase tracking-wider transition-all duration-200 active:scale-[0.98] ${
                  sizeClasses.btn
                } ${
                  isSelected
                    ? selectedClass
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                <span>{opt.label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export { X, ShieldCheck, Check };
