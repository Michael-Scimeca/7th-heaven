"use client";

import React, { useState, useEffect, useRef } from "react";
import { DotChevronDown } from "@/components/ui/DotArrow";

export interface DoubleDropdownOption {
  id: string;
  name: string;
}

export interface ConnectedDoubleDropdownProps {
  // Left side
  leftSelected: string;
  leftOptions: Array<string | DoubleDropdownOption>;
  onLeftSelect: (value: string) => void;
  leftLabel?: string;
  leftDot?: boolean;

  // Right side
  rightSelected: string;
  rightOptions: Array<string | DoubleDropdownOption>;
  onRightSelect: (value: string) => void;
  rightLabel?: string;

  size?: "sm" | "md" | "lg";
  className?: string;
  idPrefix?: string;
}

/**
 * ConnectedDoubleDropdown
 *
 * Generic dual-dropdown connected capsule for 7th Heaven.
 * Joined in a single rounded-full container with a central frosted hairline divider,
 * VisionOS frosted glass gradient body, and zero outer drop blur.
 */
export default function ConnectedDoubleDropdown({
  leftSelected,
  leftOptions,
  onLeftSelect,
  leftLabel,
  leftDot = true,

  rightSelected,
  rightOptions,
  onRightSelect,
  rightLabel,

  size = "md",
  className = "",
  idPrefix = "double-dropdown",
}: ConnectedDoubleDropdownProps) {
  const [openSide, setOpenSide] = useState<"left" | "right" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftListRef = useRef<HTMLDivElement>(null);
  const rightListRef = useRef<HTMLDivElement>(null);

  // Auto-scroll selected item into view when dropdown opens
  useEffect(() => {
    if (openSide === "left" && leftListRef.current) {
      const selectedEl = leftListRef.current.querySelector<HTMLElement>('[aria-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "nearest" });
      }
    } else if (openSide === "right" && rightListRef.current) {
      const selectedEl = rightListRef.current.querySelector<HTMLElement>('[aria-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [openSide]);

  // Close on outside click or Escape
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenSide(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenSide(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const sizeClasses = {
    sm: {
      capsule: "p-0.5",
      leftBtn: "px-3.5 py-1.5 text-[11px]",
      rightBtn: "px-3 py-1.5 text-[11px]",
      divider: "h-4",
      dot: "h-1.5 w-1.5",
      chevron: "h-2.5 w-2.5",
    },
    md: {
      capsule: "p-0.5",
      leftBtn: "px-5 py-2.5 text-xs",
      rightBtn: "px-4.5 py-2.5 text-xs",
      divider: "h-5",
      dot: "h-2 w-2",
      chevron: "h-3 w-3",
    },
    lg: {
      capsule: "p-1",
      leftBtn: "px-6 py-3 text-sm",
      rightBtn: "px-5 py-3 text-sm",
      divider: "h-6",
      dot: "h-2.5 w-2.5",
      chevron: "h-3.5 w-3.5",
    },
  }[size];

  const normalizeOptions = (opts: Array<string | DoubleDropdownOption>): DoubleDropdownOption[] => {
    return opts.map((opt) => (typeof opt === "string" ? { id: opt, name: opt } : opt));
  };

  const normalizedLeft = normalizeOptions(leftOptions);
  const normalizedRight = normalizeOptions(rightOptions);

  const leftDisplay =
    normalizedLeft.find((o) => o.id === leftSelected)?.name || leftSelected || leftLabel || "Select";
  const rightDisplay =
    normalizedRight.find((o) => o.id === rightSelected)?.name || rightSelected || rightLabel || "Select";

  return (
    <div
      ref={containerRef}
      className={`relative ${openSide ? "z-[9999]" : "z-10"} inline-flex items-center rounded-full bg-gradient-to-r from-purple-950/50 via-indigo-950/40 to-purple-900/50 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] ${sizeClasses.capsule} ${className}`}
    >
      {/* ===================================================================== */}
      {/* LEFT SEGMENT                                                          */}
      {/* ===================================================================== */}
      <div className="relative">
        <button
          id={`${idPrefix}-left-trigger`}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={openSide === "left"}
          onClick={() => setOpenSide(openSide === "left" ? null : "left")}
          className={`flex items-center gap-2.5 rounded-l-full font-black tracking-widest text-white uppercase transition-colors hover:bg-white/10 active:scale-[0.98] ${sizeClasses.leftBtn}`}
        >
          {leftDot && <span className={`rounded-full bg-white/90 ${sizeClasses.dot}`} />}
          <span>{leftDisplay}</span>
          <DotChevronDown
            className={`text-white/80 transition-transform duration-300 ${sizeClasses.chevron} ${openSide === "left" ? "rotate-180" : ""
              }`}
          />
        </button>

        {/* Left Dropdown Menu */}
        {openSide === "left" && (
          <div
            id={`${idPrefix}-left-menu`}
            role="listbox"
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="absolute top-[calc(100%+8px)] left-0 z-[99999] w-52 rounded-2xl border border-white/20 bg-[#0f0724] p-1.5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            <div
              ref={leftListRef}
              data-lenis-prevent="true"
              data-lenis-prevent-wheel="true"
              data-lenis-prevent-touch="true"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="custom-scrollbar max-h-56 overflow-y-auto overscroll-contain touch-pan-y pr-1 flex flex-col gap-1"
            >
              {normalizedLeft.map((opt) => {
                const isSelected = leftSelected === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onLeftSelect(opt.id);
                      setOpenSide(null);
                    }}
                    className={`flex cursor-pointer items-center justify-between px-3.5 py-2 text-left text-xs font-bold transition-all  ${isSelected
                      ? "bg-white/15 text-white "
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    <span>{opt.name}</span>

                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* FROSTED HAIRLINE DIVIDER                                              */}
      {/* ===================================================================== */}
      <div className={`w-px bg-white/30 ${sizeClasses.divider}`} />

      {/* ===================================================================== */}
      {/* RIGHT SEGMENT                                                         */}
      {/* ===================================================================== */}
      <div className="relative">
        <button
          id={`${idPrefix}-right-trigger`}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={openSide === "right"}
          onClick={() => setOpenSide(openSide === "right" ? null : "right")}
          className={`flex items-center gap-2 rounded-r-full font-black tracking-widest text-white uppercase transition-colors hover:bg-white/10 active:scale-[0.98] ${sizeClasses.rightBtn}`}
        >
          <span>{rightDisplay}</span>
          <DotChevronDown
            className={`text-white/80 transition-transform duration-300 ${sizeClasses.chevron} ${openSide === "right" ? "rotate-180" : ""
              }`}
          />
        </button>

        {/* Right Dropdown Menu */}
        {openSide === "right" && (
          <div
            id={`${idPrefix}-right-menu`}
            role="listbox"
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="absolute top-[calc(100%+8px)] right-0 z-[99999] w-36 rounded-2xl border border-white/20 bg-[#0f0724] p-1.5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            <div
              ref={rightListRef}
              data-lenis-prevent="true"
              data-lenis-prevent-wheel="true"
              data-lenis-prevent-touch="true"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="custom-scrollbar max-h-56 overflow-y-auto overscroll-contain touch-pan-y pr-1 flex flex-col gap-1"
            >
              {normalizedRight.map((opt) => {
                const isSelected = rightSelected === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onRightSelect(opt.id);
                      setOpenSide(null);
                    }}
                    className={`flex cursor-pointer items-center justify-between px-3.5 py-2 text-left text-xs font-bold transition-all  ${isSelected
                      ? "bg-white/15 text-white "
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    <span>{opt.name}</span>

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
