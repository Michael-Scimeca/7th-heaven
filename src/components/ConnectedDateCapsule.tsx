"use client";

import React, { useState, useEffect, useRef } from "react";
import { DotChevronDown } from "@/components/ui/DotArrow";

export const MONTH_NAMES_FULL = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

export const AVAILABLE_YEARS = [2025, 2026, 2027, 2028, 2029];

export interface ConnectedDateCapsuleProps {
  selectedMonth: number; // 0-indexed: 0 = January, 11 = December
  selectedYear: number;
  onMonthChange?: (month: number) => void;
  onYearChange?: (year: number) => void;
  onChange?: (date: { month: number; year: number }) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  idPrefix?: string;
}

/**
 * ConnectedDateCapsule
 *
 * Official Global Date Selection Control for 7th Heaven.
 * Features a single unified frosted glass capsule joining Month & Year with
 * an ambient background shader tint, frosted hairline divider, and zero outer drop blur.
 */
export default function ConnectedDateCapsule({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  onChange,
  size = "md",
  className = "",
  idPrefix = "connected-capsule",
}: ConnectedDateCapsuleProps) {
  const [openDropdown, setOpenDropdown] = useState<"month" | "year" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const monthListRef = useRef<HTMLDivElement>(null);
  const yearListRef = useRef<HTMLDivElement>(null);

  // Auto-scroll selected item into view when dropdown opens
  useEffect(() => {
    if (openDropdown === "month" && monthListRef.current) {
      const selectedEl = monthListRef.current.querySelector<HTMLElement>('[aria-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "nearest" });
      }
    } else if (openDropdown === "year" && yearListRef.current) {
      const selectedEl = yearListRef.current.querySelector<HTMLElement>('[aria-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [openDropdown]);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSelectMonth = (monthIdx: number) => {
    onMonthChange?.(monthIdx);
    onChange?.({ month: monthIdx, year: selectedYear });
    setOpenDropdown(null);
  };

  const handleSelectYear = (yearVal: number) => {
    onYearChange?.(yearVal);
    onChange?.({ month: selectedMonth, year: yearVal });
    setOpenDropdown(null);
  };

  const sizeClasses = {
    sm: {
      capsule: "p-0.5",
      monthBtn: "px-3.5 py-1.5 text-[11px]",
      yearBtn: "px-3 py-1.5 text-[11px]",
      divider: "h-4",
      dot: "h-1.5 w-1.5",
      chevron: "h-2.5 w-2.5",
    },
    md: {
      capsule: "p-0.5",
      monthBtn: "px-5 py-2.5 text-xs",
      yearBtn: "px-4.5 py-2.5 text-xs",
      divider: "h-5",
      dot: "h-2 w-2",
      chevron: "h-3 w-3",
    },
    lg: {
      capsule: "p-1",
      monthBtn: "px-6 py-3 text-sm",
      yearBtn: "px-5 py-3 text-sm",
      divider: "h-6",
      dot: "h-2.5 w-2.5",
      chevron: "h-3.5 w-3.5",
    },
  }[size];

  const currentMonthName = MONTH_NAMES_FULL[selectedMonth] ?? "OCTOBER";

  return (
    <div
      ref={containerRef}
      className={`relative ${openDropdown ? "z-[9999]" : "z-10"} inline-flex items-center rounded-full bg-gradient-to-r from-purple-950/50 via-indigo-950/40 to-purple-900/50 backdrop-blur-2xl ${sizeClasses.capsule} ${className}`}
    >
      {/* ===================================================================== */}
      {/* MONTH SEGMENT                                                         */}
      {/* ===================================================================== */}
      <div className="relative">
        <button
          id={`${idPrefix}-month-trigger`}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={openDropdown === "month"}
          onClick={() => setOpenDropdown(openDropdown === "month" ? null : "month")}
          className={`flex items-center gap-2.5 rounded-l-full font-black tracking-widest text-white uppercase transition-colors hover:bg-white/10 active:scale-[0.98] ${sizeClasses.monthBtn}`}
        >
          <span className={`rounded-full bg-white/90 ${sizeClasses.dot}`} />
          <span>{currentMonthName}</span>
          <DotChevronDown
            className={`text-white/80 transition-transform duration-300 ${sizeClasses.chevron} ${openDropdown === "month" ? "rotate-180" : ""
              }`}
          />
        </button>

        {/* Month Dropdown Menu */}
        {openDropdown === "month" && (
          <div
            id={`${idPrefix}-month-menu`}
            role="listbox"
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="absolute top-[calc(100%+8px)] left-0 z-[99999] w-52 rounded-2xl border border-white/20 bg-[#0f0724] pt-1.5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
          >
            <div
              ref={monthListRef}
              data-lenis-prevent="true"
              data-lenis-prevent-wheel="true"
              data-lenis-prevent-touch="true"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="custom-scrollbar max-h-56 overflow-y-auto overscroll-contain touch-pan-y  flex flex-col"
            >
              {MONTH_NAMES_FULL.map((mName, idx) => {
                const isSelected = selectedMonth === idx;
                return (
                  <button
                    key={mName}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectMonth(idx)}
                    className={`flex cursor-pointer items-center justify-between px-3.5 py-2 text-left text-xs font-bold transition-all ${isSelected
                      ? "bg-white/15 text-white "
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    <span>{mName}</span>

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
      {/* YEAR SEGMENT                                                          */}
      {/* ===================================================================== */}
      <div className="relative">
        <button
          id={`${idPrefix}-year-trigger`}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={openDropdown === "year"}
          onClick={() => setOpenDropdown(openDropdown === "year" ? null : "year")}
          className={`flex items-center gap-2 rounded-r-full font-black tracking-widest text-white uppercase transition-colors hover:bg-white/10 active:scale-[0.98] ${sizeClasses.yearBtn}`}
        >
          <span>{selectedYear}</span>
          <DotChevronDown
            className={`text-white/80 transition-transform duration-300 ${sizeClasses.chevron} ${openDropdown === "year" ? "rotate-180" : ""
              }`}
          />
        </button>

        {/* Year Dropdown Menu */}
        {openDropdown === "year" && (
          <div
            id={`${idPrefix}-year-menu`}
            role="listbox"
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="absolute top-[calc(100%+8px)] right-0 z-[99999] w-36 rounded-2xl border border-white/20 bg-[#0f0724] py-1.5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden
"
          >
            <div
              ref={yearListRef}
              data-lenis-prevent="true"
              data-lenis-prevent-wheel="true"
              data-lenis-prevent-touch="true"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="custom-scrollbar max-h-56 overflow-y-auto overscroll-contain touch-pan-y flex flex-col"
            >
              {AVAILABLE_YEARS.map((yr) => {
                const isSelected = selectedYear === yr;
                return (
                  <button
                    key={yr}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectYear(yr)}
                    className={`flex cursor-pointer items-center justify-between px-3.5 py-2 text-left text-xs font-bold transition-all ${isSelected
                      ? "bg-white/15 text-white "
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    <span>{yr}</span>

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
