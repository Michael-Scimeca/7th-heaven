"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { DotChevronDown } from "@/components/ui/DotArrow";

export interface VisionCapsuleOption<T extends string | number> {
  value: T;
  label: string;
  sublabel?: string;
  dotColor?: string;
}

export interface VisionCapsuleDropdownProps<T extends string | number> {
  id?: string;
  label?: string;
  value: T;
  options: (VisionCapsuleOption<T> | { value: T; label: string })[];
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  idPrefix?: string;
  fullWidth?: boolean;
}

/**
 * VisionCapsuleDropdown
 *
 * Official single-select frosted glass capsule dropdown for forms and options.
 * Features an ambient background shader tint, status beacon dot, top-level z-index,
 * and Lenis-isolated opaque scrolling menu.
 */
export default function VisionCapsuleDropdown<T extends string | number>({
  id,
  label,
  value,
  options,
  onChange,
  className = "",
  size = "md",
  idPrefix = "vision-capsule",
  fullWidth = false,
}: VisionCapsuleDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Auto-scroll selected item into view on open
  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedEl = listRef.current.querySelector<HTMLElement>('[aria-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [isOpen]);

  const normalizedOptions: VisionCapsuleOption<T>[] = useMemo(() => {
    return options.map((opt) => {
      const isYes = String(opt.value).toLowerCase() === "yes" || String(opt.label).toLowerCase().includes("yes");
      const defaultDot = isYes ? "bg-emerald-400" : "bg-white/50";
      return {
        value: opt.value,
        label: opt.label,
        sublabel: "sublabel" in opt ? opt.sublabel : undefined,
        dotColor: "dotColor" in opt && opt.dotColor ? opt.dotColor : defaultDot,
      };
    });
  }, [options]);

  const activeOption = useMemo(() => {
    return (
      normalizedOptions.find(
        (o) => String(o.value).toLowerCase() === String(value).toLowerCase()
      ) || normalizedOptions[0]
    );
  }, [normalizedOptions, value]);

  const sizeClasses = {
    sm: {
      btn: "px-3.5 py-1.5 text-[11px]",
      dot: "h-1.5 w-1.5",
      chevron: "h-2.5 w-2.5",
    },
    md: {
      btn: "px-5 py-2.5 text-xs",
      dot: "h-2 w-2",
      chevron: "h-3 w-3",
    },
    lg: {
      btn: "px-6 py-3 text-sm",
      dot: "h-2.5 w-2.5",
      chevron: "h-3.5 w-3.5",
    },
  }[size];

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${isOpen ? "z-[9999]" : "z-10"} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {label && (
        <label
          htmlFor={id || `${idPrefix}-trigger`}
          className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/70"
        >
          {label}
        </label>
      )}

      <div className="relative inline-block">
        <button
          id={id || `${idPrefix}-trigger`}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-950/50 via-indigo-950/40 to-purple-900/50 font-black uppercase tracking-widest text-white backdrop-blur-2xl transition-all hover:bg-white/10 active:scale-[0.98] cursor-pointer ${sizeClasses.btn}`}
        >
          <span
            className={`rounded-full shrink-0 ${activeOption?.dotColor || "bg-white/50"} ${sizeClasses.dot}`}
          />
          <span className="truncate">{activeOption?.label}</span>
          <DotChevronDown
            className={`text-white/80 shrink-0 transition-transform duration-300 ${sizeClasses.chevron} ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div
            id={`${idPrefix}-menu`}
            role="listbox"
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="absolute top-[calc(100%+8px)] left-0 z-[99999] min-w-[260px] max-w-[360px] rounded-2xl border border-white/20 bg-[#0f0724] py-1.5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
          >
            <div
              ref={listRef}
              data-lenis-prevent="true"
              data-lenis-prevent-wheel="true"
              data-lenis-prevent-touch="true"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="custom-scrollbar max-h-56 overflow-y-auto overscroll-contain touch-pan-y flex flex-col"
            >
              {normalizedOptions.map((opt) => {
                const isSelected =
                  String(opt.value).toLowerCase() === String(value).toLowerCase();
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`flex cursor-pointer flex-col px-4 py-2.5 text-left transition-colors ${
                      isSelected
                        ? "bg-white/15 text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${opt.dotColor}`}
                      />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {opt.label}
                      </span>
                    </div>
                    {opt.sublabel && (
                      <span className="mt-0.5 pl-4 text-[10px] text-white/50">
                        {opt.sublabel}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
