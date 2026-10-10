"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  Zap,
  Clock,
  Sparkles,
  Sliders,
  MoveHorizontal,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Volume2,
  Disc3,
  Flame,
  Search,
  Check,
} from "lucide-react";
import { DotChevronDown } from "@/components/ui/DotArrow";

export const DUAL_BAR_SETUPS = [
  {
    id: 1,
    name: "1. Electric Laser Beam",
    badge: "Concert Glow",
    desc: "Sleek glowing continuous laser bar with drag handles + 4 frosted dropdown capsules below",
  },
  {
    id: 2,
    name: "2. Knurled Chrome Dividers",
    badge: "Hardware Audio",
    desc: "Tactile metallic splitter pins on matte steel rail with machined console time pills",
  },
  {
    id: 3,
    name: "3. Pro DAW Arranger Strip",
    badge: "Studio Master",
    desc: "Digital audio arranger clip with multi-frequency waveform lines and channel strip dropdowns",
  },
  {
    id: 4,
    name: "4. Cyberpunk HUD Ribbon",
    badge: "Futuristic Neon",
    desc: "Angled geometry with hazard-stripe live set, diamond drag nodes, and high-tech hex badges",
  },
  {
    id: 5,
    name: "5. Stage Truss & Spotlights",
    badge: "Rock Arena Rig",
    desc: "Overhead lighting rig with draggable spotlight heads casting illuminated light cones onto pills below",
  },
  {
    id: 6,
    name: "6. Dual Needle Playheads",
    badge: "Minimal Precision",
    desc: "Hairline laser rail with floating vertical needle scrubbers and minimalist time pills",
  },
  {
    id: 7,
    name: "7. Retro Vinyl & Tape",
    badge: "Analog Gold",
    desc: "Magnetic tape transport runner with glowing gold live glow and vintage amp style pills",
  },
  {
    id: 8,
    name: "8. Floating Glass Split-Blocks",
    badge: "Modern Aero",
    desc: "3 floating frosted-glass segments that expand and contract with elastic junction grabbers",
  },
  {
    id: 9,
    name: "9. DJ Mixer Crossfader Rail",
    badge: "Pioneer Console",
    desc: "Horizontal mixer crossfader slots with illuminated LED step meter strip and cue buttons",
  },
  {
    id: 10,
    name: "10. Radiant Aurora Pulse",
    badge: "Northern Lights",
    desc: "Fluid aurora borealis gradient with magnetic bubble handles and ambient pill triggers",
  },
] as const;

export type DualBarSetupId = (typeof DUAL_BAR_SETUPS)[number]["id"];

export function parseEveningMinutes(timeStr: string, defaultHour: number = 18): number {
  if (!timeStr) return defaultHour * 60;
  const match = timeStr.trim().match(/^(\d+)(?::(\d+))?\s*(AM|PM)?$/i);
  if (!match) return defaultHour * 60;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3]?.toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  let total = hours * 60 + minutes;
  // If AM (12:00 AM - 5:59 AM), map to next day for evening booking flow
  if (period === "AM" && total < 6 * 60) {
    total += 1440;
  }
  return total;
}

export function minutesToTimeStr(mins: number): string {
  const normalized = ((mins % 1440) + 1440) % 1440;
  const h24 = Math.floor(normalized / 60);
  const m = normalized % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const mStr = m < 10 ? `0${m}` : `${m}`;
  return `${h12}:${mStr} ${period}`;
}

export function snap15(mins: number): number {
  return Math.round(mins / 15) * 15;
}

export function minutesToH24(mins: number): string {
  const normalized = ((mins % 1440) + 1440) % 1440;
  const h24 = Math.floor(normalized / 60);
  const m = normalized % 60;
  const h24Str = h24 < 10 ? `0${h24}` : `${h24}`;
  const mStr = m < 10 ? `0${m}` : `${m}`;
  return `${h24Str}:${mStr}`;
}

export function formatDurationLabel(minutes: number, label: string = ""): string {
  const hours = minutes / 60;
  const formatted = Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
  return label ? `${formatted} ${label}` : formatted;
}

// Generate ALL 15-minute times from 8:00 AM (480 mins) to 3:30 AM next day (1650 mins)
export const ALL_QUARTER_HOUR_TIMES: string[] = [];
for (let m = 8 * 60; m <= 27.5 * 60; m += 15) {
  ALL_QUARTER_HOUR_TIMES.push(minutesToTimeStr(m));
}

// Curated popular evening concert times
export const POPULAR_EVENING_TIMES = [
  "4:00 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
  "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM", "10:30 PM", "11:00 PM",
  "11:30 PM", "12:00 AM", "12:30 AM", "1:00 AM", "1:30 AM", "2:00 AM",
];

export function parseCustomTime(str: string): string | null {
  if (!str) return null;
  const cleaned = str.trim();
  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = match[2] ? parseInt(match[2], 10) : 0;
  let p = match[3]?.toUpperCase();

  if (m < 0 || m > 59) return null;

  if (!p) {
    if (h >= 12 && h < 24) {
      p = "PM";
      if (h > 12) h -= 12;
    } else if (h === 24 || h === 0) {
      h = 12;
      p = "AM";
    } else if (h >= 1 && h <= 11) {
      p = "PM"; // Default to PM for evening concerts
    } else {
      return null;
    }
  } else {
    if (h < 1 || h > 12) return null;
  }

  const mStr = m < 10 ? `0${m}` : `${m}`;
  return `${h}:${mStr} ${p}`;
}

interface DualBarTimelineProps {
  layoutId: DualBarSetupId;
  effectiveEventStart: string;
  effectiveBandStart: string;
  effectiveBandEnd: string;
  effectiveEventEnd: string;
  handleSelectTimelineTime: (stage: string, t: string) => void;
  openTimeline: string | null;
  setOpenTimeline: (s: string | null) => void;
  bandLiveMinutes: number;
  totalEventMinutes: number;
  preShowMinutes: number;
  postShowMinutes: number;
}

type DragTarget = "eventStart" | "bandStart" | "bandEnd" | "eventEnd" | "clipShift";

export function DualBarTimelineSetups({
  layoutId,
  effectiveEventStart,
  effectiveBandStart,
  effectiveBandEnd,
  effectiveEventEnd,
  handleSelectTimelineTime,
  openTimeline,
  setOpenTimeline,
  bandLiveMinutes,
  totalEventMinutes,
  preShowMinutes,
  postShowMinutes,
}: DualBarTimelineProps) {
  // Parse minutes
  const doorsMin = parseEveningMinutes(effectiveEventStart, 18);
  const bandStartMin = parseEveningMinutes(effectiveBandStart, 19.5);
  const bandEndMin = parseEveningMinutes(effectiveBandEnd, 22.5);
  const curfewMin = parseEveningMinutes(effectiveEventEnd, 23.5);

  // Time Scale Ruler State (noUiSlider Sean Mooney setup)
  const [scaleMode, setScaleMode] = useState<"24h" | "focus">("24h");
  const [timeFormat, setTimeFormat] = useState<"24h" | "12h">("24h");
  const [rulerHover, setRulerHover] = useState<{
    pct: number;
    mins: number;
    timeStr: string;
    h24Str: string;
  } | null>(null);

  // Focus Window Ticks (Doors to Curfew rounded to whole hours)
  const focusWindow = useMemo(() => {
    const startH = Math.floor(doorsMin / 60) * 60;
    const endH = Math.max(startH + 180, Math.ceil(curfewMin / 60) * 60);
    const span = Math.max(60, endH - startH);
    const step = span > 480 ? 120 : 60; // Every 1h or 2h
    const ticks: { minute: number; label24: string; label12: string; pct: number }[] = [];
    for (let m = startH; m <= endH; m += step) {
      const pct = ((m - startH) / span) * 100;
      const normalized = ((m % 1440) + 1440) % 1440;
      const h24 = Math.floor(normalized / 60);
      const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
      const period = h24 >= 12 ? "PM" : "AM";
      ticks.push({
        minute: m,
        label24: h24 < 10 ? `0${h24}` : `${h24}`,
        label12: `${h12} ${period}`,
        pct,
      });
    }
    return { startH, endH, span, ticks };
  }, [doorsMin, curfewMin]);

  // Dynamic rail envelope so any selected times scale smoothly
  const railStartMinutes = scaleMode === "24h" ? 0 : focusWindow.startH;
  const railEndMinutes = scaleMode === "24h" ? 1440 : focusWindow.endH;
  const totalSpanMinutes = Math.max(60, railEndMinutes - railStartMinutes);

  const minutesToPct = useCallback(
    (mins: number): number => {
      const clamped = Math.max(railStartMinutes, Math.min(railEndMinutes, mins));
      return ((clamped - railStartMinutes) / totalSpanMinutes) * 100;
    },
    [railStartMinutes, railEndMinutes, totalSpanMinutes]
  );

  // Drag tracking state
  const [activeDrag, setActiveDrag] = useState<{
    target: DragTarget;
    startX: number;
    initialDoors: number;
    initialBandStart: number;
    initialBandEnd: number;
    initialCurfew: number;
    currentHoverTime: string;
  } | null>(null);

  // Custom time inputs inside popovers
  const [customInput, setCustomInput] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [popoverTab, setPopoverTab] = useState<"all" | "popular" | "custom">("all");

  // Custom dial state
  const [dialHour, setDialHour] = useState("7");
  const [dialMinute, setDialMinute] = useState("30");
  const [dialPeriod, setDialPeriod] = useState<"AM" | "PM">("PM");

  // 24H Major Ticks: 00, 06, 12, 18, 24 matching DAW timeline ruler screenshot
  const MAJOR_24H_TICKS = useMemo(
    () => [
      { minute: 0, pct: 0, label24: "00", label12: "12 AM" },
      { minute: 360, pct: 25, label24: "06", label12: "6 AM" },
      { minute: 720, pct: 50, label24: "12", label12: "12 PM" },
      { minute: 1080, pct: 75, label24: "18", label12: "6 PM" },
      { minute: 1440, pct: 100, label24: "24", label12: "12 AM" },
    ],
    []
  );

  // Positions on 24H day scale (0 - 1440)
  const doors24Pct = Math.min(100, Math.max(0, (doorsMin / 1440) * 100));
  const bandStart24Pct = Math.min(100, Math.max(0, (bandStartMin / 1440) * 100));
  const bandEnd24Pct = Math.min(100, Math.max(0, (bandEndMin / 1440) * 100));
  const curfew24Pct = Math.min(100, Math.max(0, (curfewMin / 1440) * 100));

  // Pointer move on ruler for time inspection
  const handleRulerPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      if (rect.width <= 0) return;
      const relX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const pct = (relX / rect.width) * 100;

      let mins: number;
      if (scaleMode === "24h") {
        mins = Math.round((pct / 100) * railEndMinutes);
      } else {
        mins = Math.round(railStartMinutes + (pct / 100) * totalSpanMinutes);
      }
      mins = snap15(mins);
      const timeStr = minutesToTimeStr(mins);
      const normalized = ((mins % 1440) + 1440) % 1440;
      const h24 = Math.floor(normalized / 60);
      const m = normalized % 60;
      const h24Str = `${h24 < 10 ? `0${h24}` : h24}:${m < 10 ? `0${m}` : m}`;

      setRulerHover({ pct, mins, timeStr, h24Str });
    },
    [scaleMode, railStartMinutes, railEndMinutes, totalSpanMinutes]
  );

  const railRef = useRef<HTMLDivElement>(null);
  const sliderTrackRef = useRef<HTMLDivElement>(null);

  // Compute percentages for dynamic CSS properties
  const doorsPct = minutesToPct(doorsMin);
  const bandStartPct = minutesToPct(bandStartMin);
  const bandEndPct = minutesToPct(bandEndMin);
  const curfewPct = minutesToPct(curfewMin);

  const preEventWidthPct = Math.max(0, doorsPct);
  const preShowWidthPct = Math.max(0, bandStartPct - doorsPct);
  const clipWidthPct = Math.max(4, bandEndPct - bandStartPct);
  const postShowWidthPct = Math.max(0, curfewPct - bandEndPct);
  const postEventWidthPct = Math.max(0, 100 - curfewPct);

  const isDoorsShowtimeClose = bandStartPct - doorsPct < 6;
  const isEncoreCurfewClose = curfewPct - bandEndPct < 6;

  const preShowTimeFrame = `${effectiveEventStart} – ${effectiveBandStart}`;
  const liveSetTimeFrame = `${effectiveBandStart} – ${effectiveBandEnd}`;
  const postShowTimeFrame = `${effectiveBandEnd} – ${effectiveEventEnd}`;
  const totalEventTimeFrame = `${effectiveEventStart} – ${effectiveEventEnd}`;

  // Start pointer dragging
  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>, target: DragTarget) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);

      let initialTime = "";
      if (target === "eventStart") initialTime = effectiveEventStart;
      else if (target === "bandStart") initialTime = effectiveBandStart;
      else if (target === "bandEnd") initialTime = effectiveBandEnd;
      else if (target === "eventEnd") initialTime = effectiveEventEnd;
      else initialTime = `${effectiveBandStart} - ${effectiveBandEnd}`;

      setActiveDrag({
        target,
        startX: e.clientX,
        initialDoors: doorsMin,
        initialBandStart: bandStartMin,
        initialBandEnd: bandEndMin,
        initialCurfew: curfewMin,
        currentHoverTime: initialTime,
      });
    },
    [doorsMin, bandStartMin, bandEndMin, curfewMin, effectiveEventStart, effectiveBandStart, effectiveBandEnd, effectiveEventEnd]
  );

  // Handle pointer move
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!activeDrag) return;
      const trackEl = sliderTrackRef.current || railRef.current;
      if (!trackEl) return;
      const rect = trackEl.getBoundingClientRect();
      const deltaX = e.clientX - activeDrag.startX;
      const deltaMinutes = (deltaX / rect.width) * totalSpanMinutes;

      if (activeDrag.target === "bandStart") {
        const newMinutes = snap15(
          Math.max(activeDrag.initialDoors, Math.min(activeDrag.initialBandEnd - 30, activeDrag.initialBandStart + deltaMinutes))
        );
        const timeStr = minutesToTimeStr(newMinutes);
        setActiveDrag((prev) => (prev ? { ...prev, currentHoverTime: timeStr } : null));
        handleSelectTimelineTime("bandStart", timeStr);
      } else if (activeDrag.target === "bandEnd") {
        const newMinutes = snap15(
          Math.max(activeDrag.initialBandStart + 30, Math.min(activeDrag.initialCurfew, activeDrag.initialBandEnd + deltaMinutes))
        );
        const timeStr = minutesToTimeStr(newMinutes);
        setActiveDrag((prev) => (prev ? { ...prev, currentHoverTime: timeStr } : null));
        handleSelectTimelineTime("bandEnd", timeStr);
      } else if (activeDrag.target === "eventStart") {
        const newMinutes = snap15(
          Math.max(railStartMinutes, Math.min(activeDrag.initialBandStart, activeDrag.initialDoors + deltaMinutes))
        );
        const timeStr = minutesToTimeStr(newMinutes);
        setActiveDrag((prev) => (prev ? { ...prev, currentHoverTime: timeStr } : null));
        handleSelectTimelineTime("eventStart", timeStr);
      } else if (activeDrag.target === "eventEnd") {
        const newMinutes = snap15(
          Math.max(activeDrag.initialBandEnd, Math.min(railEndMinutes, activeDrag.initialCurfew + deltaMinutes))
        );
        const timeStr = minutesToTimeStr(newMinutes);
        setActiveDrag((prev) => (prev ? { ...prev, currentHoverTime: timeStr } : null));
        handleSelectTimelineTime("eventEnd", timeStr);
      } else if (activeDrag.target === "clipShift") {
        const duration = activeDrag.initialBandEnd - activeDrag.initialBandStart;
        const proposedStart = snap15(activeDrag.initialBandStart + deltaMinutes);
        const maxStart = activeDrag.initialCurfew - duration;
        const clampedStart = Math.max(activeDrag.initialDoors, Math.min(maxStart, proposedStart));
        const clampedEnd = clampedStart + duration;

        const startStr = minutesToTimeStr(clampedStart);
        const endStr = minutesToTimeStr(clampedEnd);
        setActiveDrag((prev) => (prev ? { ...prev, currentHoverTime: `${startStr} - ${endStr}` } : null));
        handleSelectTimelineTime("bandStart", startStr);
        handleSelectTimelineTime("bandEnd", endStr);
      }
    },
    [activeDrag, handleSelectTimelineTime, railStartMinutes, railEndMinutes, totalSpanMinutes]
  );

  const endDrag = useCallback(() => {
    setActiveDrag(null);
  }, []);

  const handleHandleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      target: DragTarget,
      currentMinutes: number,
      minBound: number,
      maxBound: number
    ) => {
      let delta = 0;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") delta = -15;
      else if (e.key === "ArrowRight" || e.key === "ArrowUp") delta = 15;
      if (delta !== 0) {
        e.preventDefault();
        const newMinutes = snap15(Math.max(minBound, Math.min(maxBound, currentMinutes + delta)));
        const timeStr = minutesToTimeStr(newMinutes);
        if (target === "eventStart") handleSelectTimelineTime("eventStart", timeStr);
        else if (target === "bandStart") handleSelectTimelineTime("bandStart", timeStr);
        else if (target === "bandEnd") handleSelectTimelineTime("bandEnd", timeStr);
        else if (target === "eventEnd") handleSelectTimelineTime("eventEnd", timeStr);
      }
    },
    [handleSelectTimelineTime]
  );

  const handleApplyCustomTime = (stage: string) => {
    if (!customInput) return;
    const parsed = parseCustomTime(customInput);
    if (parsed) {
      handleSelectTimelineTime(stage, parsed);
      setCustomInput("");
      setOpenTimeline(null);
    }
  };

  const handleApplyDialTime = (stage: string) => {
    const formatted = `${dialHour}:${dialMinute} ${dialPeriod}`;
    handleSelectTimelineTime(stage, formatted);
    setOpenTimeline(null);
  };

  // Dropdown Popover Helper with ANY TIME Support
  const renderDropdown = (
    stage: "eventStart" | "bandStart" | "bandEnd" | "eventEnd",
    time: string,
    popoverTitle: string,
    alignRight = false
  ) => {
    if (openTimeline !== stage) return null;

    const filteredTimes = ALL_QUARTER_HOUR_TIMES.filter((t) =>
      filterQuery ? t.toLowerCase().includes(filterQuery.toLowerCase()) : true
    );

    const displayedTimes = popoverTab === "popular" ? POPULAR_EVENING_TIMES : filteredTimes;

    return (
      <div
        role="listbox"
        data-lenis-prevent
        aria-label={popoverTitle}
        className={`absolute top-14 ${
          alignRight ? "left-0 sm:left-auto sm:right-0" : "left-0"
        } z-50 w-72 sm:w-80 rounded-2xl border border-white/20 bg-[#0c1220]/98 p-4 shadow-2xl backdrop-blur-3xl`}
      >
        {/* Popover Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {popoverTitle}
          </span>
          <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
            {time}
          </span>
        </div>

        {/* Tab Switcher: All 15m vs Popular vs Custom */}
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/40 p-1 mb-2.5">
          <button
            type="button"
            onClick={() => setPopoverTab("all")}
            className={`flex-1 rounded-lg py-1 text-[10px] font-bold transition-all ${
              popoverTab === "all"
                ? "bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            All (15m)
          </button>
          <button
            type="button"
            onClick={() => setPopoverTab("popular")}
            className={`flex-1 rounded-lg py-1 text-[10px] font-bold transition-all ${
              popoverTab === "popular"
                ? "bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            Popular
          </button>
          <button
            type="button"
            onClick={() => setPopoverTab("custom")}
            className={`flex-1 rounded-lg py-1 text-[10px] font-bold transition-all ${
              popoverTab === "custom"
                ? "bg-pink-600 text-white shadow-[0_0_8px_rgba(236,72,153,0.5)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            Custom Dial
          </button>
        </div>

        {/* Custom Dial Mode */}
        {popoverTab === "custom" && (
          <div className="flex flex-col gap-3 py-1">
            <span className="text-[11px] text-white/70">Pick exact hour, minute, and AM/PM:</span>
            <div className="grid grid-cols-3 gap-2">
              {/* Hour Select */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-white/50 uppercase">Hour</span>
                <select
                  aria-label="Select custom hour"
                  value={dialHour}
                  onChange={(e) => setDialHour(e.target.value)}
                  className="rounded-xl border border-white/20 bg-white/10 px-2 py-1.5 text-xs font-bold text-white focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                    <option key={h} value={String(h)} className="bg-[#0f172a] text-white">
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Minute Select */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-white/50 uppercase">Minute</span>
                <select
                  aria-label="Select custom minute"
                  value={dialMinute}
                  onChange={(e) => setDialMinute(e.target.value)}
                  className="rounded-xl border border-white/20 bg-white/10 px-2 py-1.5 text-xs font-bold text-white focus:outline-none"
                >
                  {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                    <option key={m} value={m} className="bg-[#0f172a] text-white">
                      :{m}
                    </option>
                  ))}
                </select>
              </div>

              {/* AM/PM */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-white/50 uppercase">Period</span>
                <div className="flex h-9 rounded-xl border border-white/20 bg-white/5 p-0.5">
                  <button
                    type="button"
                    onClick={() => setDialPeriod("AM")}
                    className={`flex-1 rounded-lg text-[10px] font-bold ${
                      dialPeriod === "AM" ? "bg-purple-600 text-white" : "text-white/60"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setDialPeriod("PM")}
                    className={`flex-1 rounded-lg text-[10px] font-bold ${
                      dialPeriod === "PM" ? "bg-purple-600 text-white" : "text-white/60"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleApplyDialTime(stage)}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-pink-400 bg-pink-600 py-2 text-xs font-bold text-white shadow-[0_0_12px_rgba(236,72,153,0.5)] hover:bg-pink-500"
            >
              <Check className="h-3.5 w-3.5" />
              Apply {dialHour}:{dialMinute} {dialPeriod}
            </button>
          </div>
        )}

        {/* List / Search Mode */}
        {popoverTab !== "custom" && (
          <>
            {/* Quick Type Search */}
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Type any time (e.g. 7:15 PM)..."
                value={customInput}
                onChange={(e) => {
                  setCustomInput(e.target.value);
                  setFilterQuery(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyCustomTime(stage);
                  }
                }}
                className="w-full rounded-xl border border-white/15 bg-black/50 py-1.5 pl-8 pr-14 text-xs font-semibold text-white placeholder-white/40 focus:border-purple-400 focus:outline-none"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
              {customInput && (
                <button
                  type="button"
                  onClick={() => handleApplyCustomTime(stage)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-purple-500"
                >
                  Set
                </button>
              )}
            </div>

            {/* Scrollable Time Grid */}
            <div
              data-lenis-prevent
              className="custom-scrollbar grid max-h-52 grid-cols-2 sm:grid-cols-3 gap-1 overflow-y-auto overscroll-contain pr-1 touch-pan-y"
            >
              {displayedTimes.map((t) => {
                const isSelected = t === time;
                return (
                  <button
                    key={t}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      handleSelectTimelineTime(stage, t);
                      setOpenTimeline(null);
                    }}
                    className={`rounded-lg border px-2 py-1.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? "border-purple-400 bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                        : "border-white/10 bg-white/5 text-white/80 hover:border-white/25 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      ref={railRef}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className="relative flex flex-col gap-4 select-none"
    >
      {/* Active Drag Floating Tooltip HUD */}
      {activeDrag && (
        <div className="pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-purple-400/50 bg-[#0d1322]/95 px-5 py-2.5 shadow-[0_0_30px_rgba(168,85,247,0.6)] backdrop-blur-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <span className="flex h-2 w-2 animate-ping rounded-full bg-pink-400" />
            <span className="text-purple-300 uppercase tracking-wider">
              {activeDrag.target === "eventStart" && "1. DOORS (Guests Arrive)"}
              {activeDrag.target === "bandStart" && "2. SHOWTIME (Live Show Starts)"}
              {activeDrag.target === "bandEnd" && "3. ENCORE (Final Bows)"}
              {activeDrag.target === "eventEnd" && "4. CURFEW (Party Concludes)"}
              {activeDrag.target === "clipShift" && "🎸 LIVE CONCERT WINDOW"}
              :
            </span>
            <span className="font-mono text-sm text-pink-300">{activeDrag.currentHoverTime}</span>
          </div>
        </div>
      )}

      {/* Main Container Frame */}
      <div className="flex flex-col gap-4 rounded-3xl border border-white/20 bg-gradient-to-b from-[#101524]/95 via-[#0b0e1b]/95 to-[#070912]/95 p-5 sm:p-6 backdrop-blur-2xl">
        
        {/* ============================================================ */}
        {/* TOP HEADER: Scale Readout & Live Set Summary                */}
        {/* ============================================================ */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 text-xs">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-purple-300">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>DYNAMIC TIMELINE SCALE</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
              Drag Any of the 4 Handles on Slider or Click Below
            </span>
          </div>
          <span className="font-bold text-white">
            {formatDurationLabel(totalEventMinutes, "TOTAL BOOKING")}
          </span>
        </div>

        {/* 4 Milestones Quick Header Scale Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setOpenTimeline(openTimeline === "eventStart" ? null : "eventStart")}
            className="flex items-center justify-between gap-1 rounded-lg bg-cyan-950/40 border border-cyan-500/20 px-2.5 py-1 text-cyan-300 hover:border-cyan-400 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1 font-bold truncate">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
              1. DOORS:
            </span>
            <span className="font-bold">{effectiveEventStart}</span>
          </button>
          <button
            type="button"
            onClick={() => setOpenTimeline(openTimeline === "bandStart" ? null : "bandStart")}
            className="flex items-center justify-between gap-1 rounded-lg bg-purple-950/40 border border-purple-500/20 px-2.5 py-1 text-purple-300 hover:border-purple-400 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1 font-bold truncate">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shrink-0" />
              2. SHOWTIME:
            </span>
            <span className="font-bold">{effectiveBandStart}</span>
          </button>
          <button
            type="button"
            onClick={() => setOpenTimeline(openTimeline === "bandEnd" ? null : "bandEnd")}
            className="flex items-center justify-between gap-1 rounded-lg bg-pink-950/40 border border-pink-500/20 px-2.5 py-1 text-pink-300 hover:border-pink-400 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1 font-bold truncate">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shrink-0" />
              3. ENCORE:
            </span>
            <span className="font-bold">{effectiveBandEnd}</span>
          </button>
          <button
            type="button"
            onClick={() => setOpenTimeline(openTimeline === "eventEnd" ? null : "eventEnd")}
            className="flex items-center justify-between gap-1 rounded-lg bg-amber-950/40 border border-amber-500/20 px-2.5 py-1 text-amber-300 hover:border-amber-400 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1 font-bold truncate">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
              4. CURFEW:
            </span>
            <span className="font-bold">{effectiveEventEnd}</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* UNIFIED MERGED TIMELINE SLIDER (Ruler + Draggable Track)     */}
        {/* ============================================================ */}
        <div
          id="timeline-time-ruler"
          className="relative flex flex-col w-full rounded-2xl border border-white/20 bg-gradient-to-b from-[#0f1424] via-[#090d19] to-[#060810] shadow-[0_8px_32px_rgba(0,0,0,0.7)] backdrop-blur-2xl overflow-hidden select-none"
        >
          {/* Top Controls Header Bar */}
          <div className="relative w-full bg-[#12141a]/90 px-4 pt-3 pb-2.5 border-b border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Title & Live Readout */}
              <div className="flex items-center gap-2">
                <Sliders className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-200">
                  TIME RANGE SLIDER
                </span>
                {rulerHover ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 text-[10px] font-mono text-purple-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                    <span className="font-bold">{timeFormat === "24h" ? rulerHover.h24Str : rulerHover.timeStr}</span>
                    <span className="text-white/50">({timeFormat === "24h" ? rulerHover.timeStr : rulerHover.h24Str})</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                    Drag handles or hover to inspect timeline
                  </span>
                )}
              </div>

              {/* Controls: Scale mode & Time format */}
              <div className="flex items-center gap-1.5">
                {/* Scale Mode Toggle: 24H Day vs Event Zoom */}
                <div className="flex items-center rounded-lg bg-black/60 border border-white/10 p-0.5 text-[9.5px] font-mono">
                  <button
                    type="button"
                    onClick={() => setScaleMode("24h")}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                      scaleMode === "24h"
                        ? "bg-purple-600 text-white font-bold shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                        : "text-zinc-400 hover:text-white"
                    }`}
                    title="24-Hour Day Overview (00 to 24)"
                  >
                    24H DAY (00–24)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScaleMode("focus")}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                      scaleMode === "focus"
                        ? "bg-purple-600 text-white font-bold shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                        : "text-zinc-400 hover:text-white"
                    }`}
                    title="Concert Window Zoom (Doors to Curfew)"
                  >
                    EVENT ZOOM
                  </button>
                </div>

                {/* Time Format Toggle: 24H vs 12H */}
                <div className="flex items-center rounded-lg bg-black/60 border border-white/10 p-0.5 text-[9.5px] font-mono">
                  <button
                    type="button"
                    onClick={() => setTimeFormat("24h")}
                    className={`px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                      timeFormat === "24h"
                        ? "bg-zinc-700 text-white font-bold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                    title="24-Hour Format (00, 06, 12, 18, 24)"
                  >
                    24H
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeFormat("12h")}
                    className={`px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                      timeFormat === "12h"
                        ? "bg-zinc-700 text-white font-bold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                    title="12-Hour Format"
                  >
                    12H
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Stage: Floating Tooltips + Slider Track + Attached Pips Scale */}
          <div className="relative w-full px-4 sm:px-6 pt-2 pb-4 bg-black/40">
            <div
              onPointerMove={handleRulerPointerMove}
              onPointerLeave={() => setRulerHover(null)}
              className="relative w-full flex flex-col gap-1.5"
            >
              {/* 1. Floating Tooltips Layer (noUiSlider zEGMqL elevated carets) */}
              <div className="relative w-full h-11 pointer-events-none">
                {/* Tooltip 1: Doors */}
                <div
                  className="absolute bottom-1 -translate-x-1/2 flex flex-col items-center transition-all [left:clamp(36px,var(--t-doors),calc(100%-36px))]"
                  style={{ "--t-doors": `${doorsPct}%` } as React.CSSProperties}
                >
                  <div className="flex items-center gap-1 rounded-md bg-cyan-950/95 border border-cyan-400/80 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-200 shadow-lg whitespace-nowrap">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span>{timeFormat === "24h" ? minutesToH24(doorsMin) : effectiveEventStart}</span>
                  </div>
                  <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-cyan-400/80" />
                </div>

                {/* Tooltip 2: Showtime (staggered up if close to Doors) */}
                <div
                  className={`absolute ${
                    isDoorsShowtimeClose ? "bottom-6" : "bottom-1"
                  } -translate-x-1/2 flex flex-col items-center transition-all [left:clamp(36px,var(--t-show),calc(100%-36px))]`}
                  style={{ "--t-show": `${bandStartPct}%` } as React.CSSProperties}
                >
                  <div className="flex items-center gap-1 rounded-md bg-purple-950/95 border border-purple-400/80 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-200 shadow-lg whitespace-nowrap">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shrink-0" />
                    <span>{timeFormat === "24h" ? minutesToH24(bandStartMin) : effectiveBandStart}</span>
                  </div>
                  <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-purple-400/80" />
                </div>

                {/* Tooltip 3: Encore (staggered up if close to Curfew) */}
                <div
                  className={`absolute ${
                    isEncoreCurfewClose ? "bottom-6" : "bottom-1"
                  } -translate-x-1/2 flex flex-col items-center transition-all [left:clamp(36px,var(--t-encore),calc(100%-36px))]`}
                  style={{ "--t-encore": `${bandEndPct}%` } as React.CSSProperties}
                >
                  <div className="flex items-center gap-1 rounded-md bg-pink-950/95 border border-pink-400/80 px-2 py-0.5 text-[10px] font-mono font-bold text-pink-200 shadow-lg whitespace-nowrap">
                    <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shrink-0" />
                    <span>{timeFormat === "24h" ? minutesToH24(bandEndMin) : effectiveBandEnd}</span>
                  </div>
                  <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-pink-400/80" />
                </div>

                {/* Tooltip 4: Curfew */}
                <div
                  className="absolute bottom-1 -translate-x-1/2 flex flex-col items-center transition-all [left:clamp(36px,var(--t-curfew),calc(100%-36px))]"
                  style={{ "--t-curfew": `${curfewPct}%` } as React.CSSProperties}
                >
                  <div className="flex items-center gap-1 rounded-md bg-amber-950/95 border border-amber-400/80 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-200 shadow-lg whitespace-nowrap">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>{timeFormat === "24h" ? minutesToH24(curfewMin) : effectiveEventEnd}</span>
                  </div>
                  <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-amber-400/80" />
                </div>
              </div>

              {/* 2. Middle Slider Track Enclosure */}
              <div ref={sliderTrackRef} className="relative w-full">

        {/* --- VARIANT 1: Electric Laser Beam --- */}
        {layoutId === 1 && (
          <div className="relative flex h-9 w-full items-center overflow-hidden rounded-xl border border-white/15 bg-black/70 p-0.5 shadow-inner">
            {/* Daytime / Inactive Pre-Event Track (00:00 to Doors) */}
            {preEventWidthPct > 0 && (
              <div
                className="relative flex h-full items-center justify-center bg-black/50 border-r border-white/10 px-2 text-[8.5px] font-mono text-zinc-500 overflow-hidden leading-tight select-none [width:var(--preev-w)]"
                style={{ "--preev-w": `${preEventWidthPct}%` } as React.CSSProperties}
              >
                {preEventWidthPct > 15 && (
                  <span className="truncate tracking-wider opacity-60">
                    DAYTIME / SETUP (00:00 – {effectiveEventStart})
                  </span>
                )}
              </div>
            )}

            {/* Handle 1: 1. DOORS */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Doors Time"
              aria-valuenow={doorsMin}
              onPointerDown={(e) => startDrag(e, "eventStart")}
              onKeyDown={(e) => handleHandleKeyDown(e, "eventStart", doorsMin, railStartMinutes, bandStartMin)}
              className="z-30 flex h-full w-7 shrink-0 cursor-ew-resize items-center justify-center rounded-l-lg bg-cyan-950/90 border border-cyan-400/50 hover:bg-cyan-800 transition-colors"
              title={`1. DOORS (${effectiveEventStart})`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[7.5px] font-black text-cyan-300">1</span>
                <div className="h-2.5 w-1 rounded-full bg-cyan-400" />
              </div>
            </div>

            {/* Pre-Show Track with Time Frame */}
            <div
              className="relative flex h-full flex-col justify-center bg-cyan-950/40 px-2 text-left transition-all overflow-hidden leading-tight [width:var(--pre-w)]"
              style={{ "--pre-w": `${preShowWidthPct}%` } as React.CSSProperties}
            >
              {preShowWidthPct > 3 && (
                <>
                  <span className="text-[8.5px] font-bold text-cyan-300 uppercase tracking-wider truncate">
                    {preShowWidthPct > 8 ? `PRE: ${preShowTimeFrame}` : "PRE"}
                  </span>
                  <span className="text-[9px] font-semibold text-white/90 truncate">{formatDurationLabel(preShowMinutes)}</span>
                </>
              )}
            </div>

            {/* Draggable Live Set Region with Time Frame */}
            <div
              onPointerDown={(e) => startDrag(e, "clipShift")}
              className="group relative flex h-full cursor-grab active:cursor-grabbing items-center justify-between rounded-lg bg-gradient-to-r from-purple-700 via-pink-600 to-purple-700 px-0.5 shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-shadow hover:shadow-[0_0_30px_rgba(217,70,239,0.7)] [width:var(--clip-w)]"
              style={{ "--clip-w": `${clipWidthPct}%` } as React.CSSProperties}
            >
              {/* Left Handle (Showtime) */}
              <div
                role="slider"
                tabIndex={0}
                aria-label="Drag to adjust Showtime"
                aria-valuenow={bandStartMin}
                onPointerDown={(e) => startDrag(e, "bandStart")}
                onKeyDown={(e) => handleHandleKeyDown(e, "bandStart", bandStartMin, doorsMin, bandEndMin - 30)}
                className="flex h-full w-6 cursor-ew-resize items-center justify-center rounded-l-md bg-black/30 hover:bg-black/50"
                title={`2. SHOWTIME (${effectiveBandStart})`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[7.5px] font-black text-purple-200">2</span>
                  <ChevronLeft className="h-3 w-3 text-white/80 group-hover:text-pink-300" />
                </div>
              </div>

              {/* Center Info with Time Frame */}
              <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-1 text-center pointer-events-none leading-tight overflow-hidden">
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-white drop-shadow truncate">
                  <Zap className="h-2.5 w-2.5 text-yellow-300 shrink-0" />
                  7TH HEAVEN LIVE
                </span>
                <span className="text-[8.5px] font-semibold text-pink-100 truncate">
                  🎸 {formatDurationLabel(bandLiveMinutes, "Live Concert")}
                </span>
              </div>

              {/* Right Handle (Curtain Call / Encore) */}
              <div
                role="slider"
                tabIndex={0}
                aria-label="Drag to adjust Curtain Call"
                aria-valuenow={bandEndMin}
                onPointerDown={(e) => startDrag(e, "bandEnd")}
                onKeyDown={(e) => handleHandleKeyDown(e, "bandEnd", bandEndMin, bandStartMin + 30, curfewMin)}
                className="flex h-full w-6 cursor-ew-resize items-center justify-center rounded-r-md bg-black/30 hover:bg-black/50"
                title={`3. ENCORE (${effectiveBandEnd})`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[7.5px] font-black text-pink-200">3</span>
                  <ChevronRight className="h-3 w-3 text-white/80 group-hover:text-pink-300" />
                </div>
              </div>
            </div>

            {/* Post-Show Track with Time Frame */}
            <div
              className="relative flex h-full flex-col justify-center bg-cyan-950/40 px-2 text-left transition-all overflow-hidden leading-tight [width:var(--post-w)]"
              style={{ "--post-w": `${postShowWidthPct}%` } as React.CSSProperties}
            >
              {postShowWidthPct > 3 && (
                <>
                  <span className="text-[8.5px] font-bold text-cyan-300 uppercase tracking-wider truncate">
                    {postShowWidthPct > 8 ? `POST: ${postShowTimeFrame}` : "POST"}
                  </span>
                  <span className="text-[9px] font-semibold text-white/80 truncate">{formatDurationLabel(postShowMinutes)}</span>
                </>
              )}
            </div>

            {/* Handle 4: 4. CURFEW */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Curfew Time"
              aria-valuenow={curfewMin}
              onPointerDown={(e) => startDrag(e, "eventEnd")}
              onKeyDown={(e) => handleHandleKeyDown(e, "eventEnd", curfewMin, bandEndMin, railEndMinutes)}
              className="z-30 flex h-full w-7 shrink-0 cursor-ew-resize items-center justify-center rounded-r-lg bg-amber-950/90 border border-amber-400/50 hover:bg-amber-800 transition-colors"
              title={`4. CURFEW (${effectiveEventEnd})`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[7.5px] font-black text-amber-300">4</span>
                <div className="h-2.5 w-1 rounded-full bg-amber-400" />
              </div>
            </div>

            {/* Late Night / Inactive Post-Event Track (Curfew to 24:00) */}
            {postEventWidthPct > 0 && (
              <div
                className="relative flex h-full items-center justify-center bg-black/50 border-l border-white/10 px-1 text-[8px] font-mono text-zinc-500 overflow-hidden leading-tight select-none [width:var(--postev-w)]"
                style={{ "--postev-w": `${postEventWidthPct}%` } as React.CSSProperties}
              >
                {postEventWidthPct > 5 && (
                  <span className="truncate tracking-wider opacity-60">
                    {effectiveEventEnd}–24:00
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- VARIANT 2: Knurled Chrome Dividers --- */}
        {layoutId === 2 && (
          <div className="relative flex h-11 w-full items-center rounded-xl border border-white/20 bg-[#060910] p-1 shadow-inner overflow-hidden">
            {preEventWidthPct > 0 && (
              <div
                className="flex h-full items-center justify-center bg-black/50 border-r border-white/10 px-2 text-[8.5px] font-mono text-zinc-500 overflow-hidden leading-tight select-none [width:var(--preev-w)] shrink-0"
                style={{ "--preev-w": `${preEventWidthPct}%` } as React.CSSProperties}
              >
                {preEventWidthPct > 15 && (
                  <span className="truncate tracking-wider opacity-60">
                    DAYTIME ({timeFormat === "24h" ? "00:00" : "12:00 AM"} – {timeFormat === "24h" ? minutesToH24(doorsMin) : effectiveEventStart})
                  </span>
                )}
              </div>
            )}

            {/* Knurled Chrome Pin 1 (Doors) */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Doors Time"
              aria-valuenow={doorsMin}
              onPointerDown={(e) => startDrag(e, "eventStart")}
              onKeyDown={(e) => handleHandleKeyDown(e, "eventStart", doorsMin, railStartMinutes, bandStartMin)}
              className="group relative z-30 flex h-full w-7 shrink-0 cursor-ew-resize items-center justify-center rounded-l-md border border-cyan-400 bg-gradient-to-b from-cyan-700 to-cyan-950 shadow-[0_0_12px_rgba(34,211,238,0.7)]"
              title={`1. DOORS (${effectiveEventStart})`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[7.5px] font-black text-cyan-200">1</span>
                <span className="h-2.5 w-1 rounded-full bg-white" />
              </div>
            </div>

            <div
              className="flex h-full flex-col justify-center bg-white/[0.04] px-1.5 overflow-hidden leading-tight [width:var(--pre-w)] shrink-0"
              style={{ "--pre-w": `${preShowWidthPct}%` } as React.CSSProperties}
            >
              {preShowWidthPct > 4 && (
                <>
                  <span className="text-[8.5px] font-bold text-white/50 uppercase truncate">
                    {preShowWidthPct > 10 ? `Pre: ${preShowTimeFrame}` : "Pre"}
                  </span>
                  <span className="text-[9.5px] font-bold text-white truncate">{formatDurationLabel(preShowMinutes)}</span>
                </>
              )}
            </div>

            {/* Knurled Chrome Pin 2 (Showtime) */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Showtime"
              aria-valuenow={bandStartMin}
              onPointerDown={(e) => startDrag(e, "bandStart")}
              onKeyDown={(e) => handleHandleKeyDown(e, "bandStart", bandStartMin, doorsMin, bandEndMin - 30)}
              className="group relative z-30 flex h-full w-7 shrink-0 cursor-ew-resize items-center justify-center rounded-md border border-purple-400 bg-gradient-to-b from-purple-700 to-purple-950 shadow-[0_0_12px_rgba(168,85,247,0.7)]"
              title={`2. SHOWTIME (${effectiveBandStart})`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[7.5px] font-black text-purple-200">2</span>
                <span className="h-2.5 w-1 rounded-full bg-white" />
              </div>
            </div>

            <div
              onPointerDown={(e) => startDrag(e, "clipShift")}
              className="flex h-full cursor-grab active:cursor-grabbing flex-col items-center justify-center bg-purple-950/80 border-y border-purple-400/40 px-2 text-center min-w-0 leading-tight [width:var(--clip-w)] shrink-0"
              style={{ "--clip-w": `${clipWidthPct}%` } as React.CSSProperties}
            >
              <span className="text-[11px] font-black uppercase text-purple-200 truncate">
                🎸 7TH HEAVEN LIVE
              </span>
              <span className="text-[9.5px] font-bold text-pink-300 truncate">
                {formatDurationLabel(bandLiveMinutes, "Live Set")}
              </span>
            </div>

            {/* Knurled Chrome Pin 3 (Curtain Call / Encore) */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Curtain Call"
              aria-valuenow={bandEndMin}
              onPointerDown={(e) => startDrag(e, "bandEnd")}
              onKeyDown={(e) => handleHandleKeyDown(e, "bandEnd", bandEndMin, bandStartMin + 30, curfewMin)}
              className="group relative z-30 flex h-full w-7 shrink-0 cursor-ew-resize items-center justify-center rounded-md border border-pink-400 bg-gradient-to-b from-pink-700 to-pink-950 shadow-[0_0_12px_rgba(236,72,153,0.7)]"
              title={`3. ENCORE (${effectiveBandEnd})`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[7.5px] font-black text-pink-200">3</span>
                <span className="h-2.5 w-1 rounded-full bg-white" />
              </div>
            </div>

            <div
              className="flex h-full flex-col justify-center bg-white/[0.04] px-1.5 overflow-hidden leading-tight [width:var(--post-w)] shrink-0"
              style={{ "--post-w": `${postShowWidthPct}%` } as React.CSSProperties}
            >
              {postShowWidthPct > 4 && (
                <>
                  <span className="text-[8.5px] font-bold text-white/50 uppercase truncate">
                    {postShowWidthPct > 10 ? `Post: ${postShowTimeFrame}` : "Post"}
                  </span>
                  <span className="text-[9.5px] font-bold text-white truncate">{formatDurationLabel(postShowMinutes)}</span>
                </>
              )}
            </div>

            {/* Knurled Chrome Pin 4 (Curfew) */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Curfew Time"
              aria-valuenow={curfewMin}
              onPointerDown={(e) => startDrag(e, "eventEnd")}
              onKeyDown={(e) => handleHandleKeyDown(e, "eventEnd", curfewMin, bandEndMin, railEndMinutes)}
              className="group relative z-30 flex h-full w-7 shrink-0 cursor-ew-resize items-center justify-center rounded-r-md border border-amber-400 bg-gradient-to-b from-amber-700 to-amber-950 shadow-[0_0_12px_rgba(251,191,36,0.7)]"
              title={`4. CURFEW (${effectiveEventEnd})`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[7.5px] font-black text-amber-200">4</span>
                <span className="h-2.5 w-1 rounded-full bg-white" />
              </div>
            </div>

            {postEventWidthPct > 0 && (
              <div
                className="flex h-full items-center justify-center bg-black/50 border-l border-white/10 px-1 text-[8px] font-mono text-zinc-500 overflow-hidden leading-tight select-none [width:var(--postev-w)] shrink-0"
                style={{ "--postev-w": `${postEventWidthPct}%` } as React.CSSProperties}
              >
                {postEventWidthPct > 5 && (
                  <span className="truncate tracking-wider opacity-60">
                    {effectiveEventEnd}–24:00
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- VARIANT 3: Pro DAW Arranger Strip --- */}
        {layoutId === 3 && (
          <div className="relative flex h-11 w-full items-center overflow-hidden rounded-xl border border-purple-400/30 bg-[#070b16] p-1 shadow-inner font-sans">
            <div className="absolute inset-x-2 top-1.5 bottom-1.5 flex items-center justify-between gap-1 opacity-20 pointer-events-none">
              {Array.from({ length: 48 }).map((_, i) => (
                <span
                  key={i}
                  className="w-0.5 rounded-full bg-white [height:var(--h)]"
                  style={{ "--h": `${20 + (i % 6) * 14}%` } as React.CSSProperties}
                />
              ))}
            </div>

            {preEventWidthPct > 0 && (
              <div
                className="relative flex h-full items-center justify-center bg-black/50 border-r border-white/10 px-2 text-[8.5px] font-mono text-zinc-500 overflow-hidden leading-tight select-none [width:var(--preev-w)] shrink-0"
                style={{ "--preev-w": `${preEventWidthPct}%` } as React.CSSProperties}
              >
                {preEventWidthPct > 15 && (
                  <span className="truncate tracking-wider opacity-60">
                    DAYTIME / SETUP (00:00 – {effectiveEventStart})
                  </span>
                )}
              </div>
            )}

            {/* Handle 1: 1. DOORS */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Doors Time"
              aria-valuenow={doorsMin}
              onPointerDown={(e) => startDrag(e, "eventStart")}
              onKeyDown={(e) => handleHandleKeyDown(e, "eventStart", doorsMin, railStartMinutes, bandStartMin)}
              className="group relative z-30 flex h-full w-7 shrink-0 cursor-ew-resize items-center justify-center rounded-l-lg border border-cyan-400/60 bg-cyan-950 hover:bg-cyan-900 transition-colors shadow-[0_0_10px_rgba(34,211,238,0.5)]"
              title={`1. DOORS (${effectiveEventStart})`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[7.5px] font-black text-cyan-300">1</span>
                <div className="h-3 w-1 rounded-full bg-cyan-400 group-hover:bg-cyan-200" />
              </div>
            </div>

            {/* CH 01 PRE-SHOW */}
            <div
              className="relative flex h-full flex-col justify-center overflow-hidden bg-cyan-900/35 px-1.5 border-y border-cyan-500/30 leading-tight [width:var(--pre-show-w)] shrink-0"
              style={{ "--pre-show-w": `${preShowWidthPct}%` } as React.CSSProperties}
            >
              {preShowWidthPct > 4 && (
                <>
                  <span className="text-[8px] font-mono text-cyan-300 truncate">
                    {preShowWidthPct > 10 ? `CH 01 • ${preShowTimeFrame}` : "CH 01 PRE"}
                  </span>
                  <span className="text-[9.5px] font-bold text-white truncate">{formatDurationLabel(preShowMinutes)}</span>
                </>
              )}
            </div>

            {/* CH 02 LIVE AUDIO CLIP with Handles 2 & 3 */}
            <div
              onPointerDown={(e) => startDrag(e, "clipShift")}
              className="group relative flex h-full cursor-grab active:cursor-grabbing z-20 items-center justify-between rounded-lg border border-purple-400/70 bg-gradient-to-r from-purple-900/90 via-pink-900/90 to-purple-900/90 px-0.5 shadow-[0_0_16px_rgba(168,85,247,0.6)] [width:var(--clip-w)] shrink-0"
              style={{ "--clip-w": `${clipWidthPct}%` } as React.CSSProperties}
            >
              {/* Handle 2: SHOWTIME */}
              <div
                role="slider"
                tabIndex={0}
                aria-label="Drag to adjust Showtime"
                aria-valuenow={bandStartMin}
                onPointerDown={(e) => startDrag(e, "bandStart")}
                onKeyDown={(e) => handleHandleKeyDown(e, "bandStart", bandStartMin, doorsMin, bandEndMin - 30)}
                className="flex h-full w-6 cursor-ew-resize items-center justify-center rounded-l-md bg-black/40 hover:bg-black/60 transition-colors"
                title={`2. SHOWTIME (${effectiveBandStart})`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[7.5px] font-black text-purple-200">2</span>
                  <div className="h-3.5 w-1.5 rounded-full bg-purple-300 shadow-[0_0_8px_#c084fc]" />
                </div>
              </div>

              {/* Center Info with Time Frame */}
              <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-1.5 pointer-events-none text-center leading-tight">
                <span className="text-[10.5px] font-black text-white truncate flex items-center gap-1">
                  <Zap className="h-2.5 w-2.5 text-yellow-300 shrink-0" />
                  AUDIO CLIP: 7TH HEAVEN LIVE
                </span>
                <span className="text-[9.5px] font-bold text-pink-300 truncate">
                  {formatDurationLabel(bandLiveMinutes, "Live Set")}
                </span>
              </div>

              {/* Handle 3: ENCORE */}
              <div
                role="slider"
                tabIndex={0}
                aria-label="Drag to adjust Curtain Call"
                aria-valuenow={bandEndMin}
                onPointerDown={(e) => startDrag(e, "bandEnd")}
                onKeyDown={(e) => handleHandleKeyDown(e, "bandEnd", bandEndMin, bandStartMin + 30, curfewMin)}
                className="flex h-full w-6 cursor-ew-resize items-center justify-center rounded-r-md bg-black/40 hover:bg-black/60 transition-colors"
                title={`3. ENCORE (${effectiveBandEnd})`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[7.5px] font-black text-pink-200">3</span>
                  <div className="h-3.5 w-1.5 rounded-full bg-pink-300 shadow-[0_0_8px_#f472b6]" />
                </div>
              </div>
            </div>

            {/* CH 04 POST-SHOW */}
            <div
              className="relative flex h-full flex-col justify-center overflow-hidden bg-cyan-900/35 px-1.5 border-y border-cyan-500/30 leading-tight [width:var(--post-show-w)] shrink-0"
              style={{ "--post-show-w": `${postShowWidthPct}%` } as React.CSSProperties}
            >
              {postShowWidthPct > 4 && (
                <>
                  <span className="text-[8px] font-mono text-cyan-300 truncate">
                    {postShowWidthPct > 10 ? `CH 04 • ${postShowTimeFrame}` : "CH 04 POST"}
                  </span>
                  <span className="text-[9.5px] font-bold text-white truncate">{formatDurationLabel(postShowMinutes)}</span>
                </>
              )}
            </div>

            {/* Handle 4: 4. CURFEW */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Curfew Time"
              aria-valuenow={curfewMin}
              onPointerDown={(e) => startDrag(e, "eventEnd")}
              onKeyDown={(e) => handleHandleKeyDown(e, "eventEnd", curfewMin, bandEndMin, railEndMinutes)}
              className="group relative z-30 flex h-full w-7 shrink-0 cursor-ew-resize items-center justify-center rounded-r-lg border border-amber-400/60 bg-amber-950 hover:bg-amber-900 transition-colors shadow-[0_0_10px_rgba(251,191,36,0.5)]"
              title={`4. CURFEW (${effectiveEventEnd})`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[7.5px] font-black text-amber-300">4</span>
                <div className="h-3 w-1 rounded-full bg-amber-400 group-hover:bg-amber-200" />
              </div>
            </div>

            {postEventWidthPct > 0 && (
              <div
                className="relative flex h-full items-center justify-center bg-black/50 border-l border-white/10 px-1 text-[8px] font-mono text-zinc-500 overflow-hidden leading-tight select-none [width:var(--postev-w)] shrink-0"
                style={{ "--postev-w": `${postEventWidthPct}%` } as React.CSSProperties}
              >
                {postEventWidthPct > 5 && (
                  <span className="truncate tracking-wider opacity-60">
                    {effectiveEventEnd}–24:00
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- VARIANT 4: Cyberpunk HUD Ribbon --- */}
        {layoutId === 4 && (
          <div className="relative flex h-11 w-full items-center overflow-hidden rounded-xl border-2 border-cyan-400/50 bg-[#040810] p-1 font-mono">
            {preEventWidthPct > 0 && (
              <div
                className="flex h-full items-center justify-center bg-black/60 border-r border-cyan-400/30 px-2 text-[8px] text-cyan-400/60 overflow-hidden leading-tight select-none [width:var(--preev-w)] shrink-0"
                style={{ "--preev-w": `${preEventWidthPct}%` } as React.CSSProperties}
              >
                {preEventWidthPct > 15 && (
                  <span className="truncate tracking-wider">
                    [SYS: DAYTIME 00:00–{effectiveEventStart}]
                  </span>
                )}
              </div>
            )}

            {/* Node 1: DOORS */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Doors Time"
              aria-valuenow={doorsMin}
              onPointerDown={(e) => startDrag(e, "eventStart")}
              onKeyDown={(e) => handleHandleKeyDown(e, "eventStart", doorsMin, railStartMinutes, bandStartMin)}
              className="z-30 flex h-6 w-6 shrink-0 cursor-ew-resize -rotate-45 items-center justify-center border-2 border-cyan-400 bg-cyan-950 shadow-[0_0_10px_#22d3ee]"
              title={`1. DOORS (${effectiveEventStart})`}
            >
              <span className="rotate-45 text-[7px] font-black text-cyan-300">01</span>
            </div>

            <div
              className="flex h-full flex-col justify-center bg-cyan-950/60 px-1.5 overflow-hidden leading-tight [width:var(--pre-w)] shrink-0"
              style={{ "--pre-w": `${preShowWidthPct}%` } as React.CSSProperties}
            >
              {preShowWidthPct > 4 && (
                <>
                  <span className="text-[8px] text-cyan-400 truncate">
                    {preShowWidthPct > 10 ? `[PRE: ${preShowTimeFrame}]` : "[PRE]"}
                  </span>
                  <span className="text-[9.5px] font-bold text-white truncate">{formatDurationLabel(preShowMinutes)}</span>
                </>
              )}
            </div>

            {/* Node 2: SHOWTIME */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Showtime"
              aria-valuenow={bandStartMin}
              onPointerDown={(e) => startDrag(e, "bandStart")}
              onKeyDown={(e) => handleHandleKeyDown(e, "bandStart", bandStartMin, doorsMin, bandEndMin - 30)}
              className="z-30 flex h-6 w-6 shrink-0 cursor-ew-resize -rotate-45 items-center justify-center border-2 border-purple-400 bg-purple-900 shadow-[0_0_10px_#c084fc]"
              title={`2. SHOWTIME (${effectiveBandStart})`}
            >
              <span className="rotate-45 text-[7px] font-black text-purple-200">02</span>
            </div>

            <div
              onPointerDown={(e) => startDrag(e, "clipShift")}
              className="flex h-full cursor-grab active:cursor-grabbing flex-col items-center justify-center bg-gradient-to-r from-purple-800 via-pink-700 to-purple-800 px-2 shadow-[0_0_15px_#ec4899] min-w-0 leading-tight [width:var(--clip-w)] shrink-0"
              style={{ "--clip-w": `${clipWidthPct}%` } as React.CSSProperties}
            >
              <span className="text-[10.5px] font-black tracking-wider text-white truncate">
                ⚡ 7TH HEAVEN LIVE
              </span>
              <span className="text-[9px] font-bold text-pink-200 truncate">
                {formatDurationLabel(bandLiveMinutes, "DURATION")}
              </span>
            </div>

            {/* Node 3: ENCORE */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Curtain Call"
              aria-valuenow={bandEndMin}
              onPointerDown={(e) => startDrag(e, "bandEnd")}
              onKeyDown={(e) => handleHandleKeyDown(e, "bandEnd", bandEndMin, bandStartMin + 30, curfewMin)}
              className="z-30 flex h-6 w-6 shrink-0 cursor-ew-resize -rotate-45 items-center justify-center border-2 border-pink-400 bg-pink-900 shadow-[0_0_10px_#f472b6]"
              title={`3. ENCORE (${effectiveBandEnd})`}
            >
              <span className="rotate-45 text-[7px] font-black text-pink-200">03</span>
            </div>

            <div
              className="flex h-full flex-col justify-center bg-violet-950/60 px-1.5 overflow-hidden leading-tight [width:var(--post-w)] shrink-0"
              style={{ "--post-w": `${postShowWidthPct}%` } as React.CSSProperties}
            >
              {postShowWidthPct > 4 && (
                <>
                  <span className="text-[8px] text-violet-400 truncate">
                    {postShowWidthPct > 10 ? `[POST: ${postShowTimeFrame}]` : "[POST]"}
                  </span>
                  <span className="text-[9.5px] font-bold text-white truncate">{formatDurationLabel(postShowMinutes)}</span>
                </>
              )}
            </div>

            {/* Node 4: CURFEW */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Curfew Time"
              aria-valuenow={curfewMin}
              onPointerDown={(e) => startDrag(e, "eventEnd")}
              onKeyDown={(e) => handleHandleKeyDown(e, "eventEnd", curfewMin, bandEndMin, railEndMinutes)}
              className="z-30 flex h-6 w-6 shrink-0 cursor-ew-resize -rotate-45 items-center justify-center border-2 border-amber-400 bg-amber-950 shadow-[0_0_10px_#fbbf24]"
              title={`4. CURFEW (${effectiveEventEnd})`}
            >
              <span className="rotate-45 text-[7px] font-black text-amber-300">04</span>
            </div>

            {postEventWidthPct > 0 && (
              <div
                className="flex h-full items-center justify-center bg-black/60 border-l border-amber-400/30 px-1 text-[8px] text-amber-400/60 overflow-hidden leading-tight select-none [width:var(--postev-w)] shrink-0"
                style={{ "--postev-w": `${postEventWidthPct}%` } as React.CSSProperties}
              >
                {postEventWidthPct > 5 && (
                  <span className="truncate tracking-wider">
                    {effectiveEventEnd}–24:00
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- VARIANT 5: Stage Truss & Spotlights --- */}
        {layoutId === 5 && (
          <div className="relative flex h-14 w-full flex-col justify-between overflow-hidden rounded-xl border border-white/20 bg-[#060913] p-1.5">
            <div className="relative h-1.5 w-full rounded-full bg-white/20">
              {/* Spotlight 1: Doors */}
              <div
                role="slider"
                tabIndex={0}
                aria-label="Drag to adjust Doors Time"
                aria-valuenow={doorsMin}
                onPointerDown={(e) => startDrag(e, "eventStart")}
                onKeyDown={(e) => handleHandleKeyDown(e, "eventStart", doorsMin, railStartMinutes, bandStartMin)}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 cursor-ew-resize flex flex-col items-center [left:var(--spot-left)]"
                style={{ "--spot-left": `${doorsPct}%` } as React.CSSProperties}
                title={`1. DOORS (${effectiveEventStart})`}
              >
                <div className="h-4 w-4 rounded-full border border-cyan-300 bg-cyan-700 shadow-[0_0_10px_#22d3ee] flex items-center justify-center text-[7px] font-black text-cyan-100">1</div>
              </div>

              {/* Spotlight 2: Showtime */}
              <div
                role="slider"
                tabIndex={0}
                aria-label="Drag to adjust Showtime"
                aria-valuenow={bandStartMin}
                onPointerDown={(e) => startDrag(e, "bandStart")}
                onKeyDown={(e) => handleHandleKeyDown(e, "bandStart", bandStartMin, doorsMin, bandEndMin - 30)}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 cursor-ew-resize flex flex-col items-center [left:var(--spot-left)]"
                style={{ "--spot-left": `${bandStartPct}%` } as React.CSSProperties}
                title={`2. SHOWTIME (${effectiveBandStart})`}
              >
                <div className="h-4 w-4 rounded-full border border-purple-300 bg-purple-600 shadow-[0_0_10px_#c084fc] flex items-center justify-center text-[7px] font-black text-purple-100">2</div>
              </div>

              {/* Spotlight 3: Curtain Call / Encore */}
              <div
                role="slider"
                tabIndex={0}
                aria-label="Drag to adjust Curtain Call"
                aria-valuenow={bandEndMin}
                onPointerDown={(e) => startDrag(e, "bandEnd")}
                onKeyDown={(e) => handleHandleKeyDown(e, "bandEnd", bandEndMin, bandStartMin + 30, curfewMin)}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 cursor-ew-resize flex flex-col items-center [left:var(--spot-left)]"
                style={{ "--spot-left": `${bandEndPct}%` } as React.CSSProperties}
                title={`3. ENCORE (${effectiveBandEnd})`}
              >
                <div className="h-4 w-4 rounded-full border border-pink-300 bg-pink-600 shadow-[0_0_10px_#f472b6] flex items-center justify-center text-[7px] font-black text-pink-100">3</div>
              </div>

              {/* Spotlight 4: Curfew */}
              <div
                role="slider"
                tabIndex={0}
                aria-label="Drag to adjust Curfew Time"
                aria-valuenow={curfewMin}
                onPointerDown={(e) => startDrag(e, "eventEnd")}
                onKeyDown={(e) => handleHandleKeyDown(e, "eventEnd", curfewMin, bandEndMin, railEndMinutes)}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 cursor-ew-resize flex flex-col items-center [left:var(--spot-left)]"
                style={{ "--spot-left": `${curfewPct}%` } as React.CSSProperties}
                title={`4. CURFEW (${effectiveEventEnd})`}
              >
                <div className="h-4 w-4 rounded-full border border-amber-300 bg-amber-700 shadow-[0_0_10px_#fbbf24] flex items-center justify-center text-[7px] font-black text-amber-100">4</div>
              </div>
            </div>

            <div
              onPointerDown={(e) => startDrag(e, "clipShift")}
              className="flex h-8 cursor-grab active:cursor-grabbing items-center justify-between rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-3 shadow-[0_0_15px_rgba(217,70,239,0.5)] [margin-left:var(--m-left)] [width:var(--m-width)] leading-tight"
              style={
                {
                  "--m-left": `${bandStartPct}%`,
                  "--m-width": `${clipWidthPct}%`,
                } as React.CSSProperties
              }
            >
              <span className="text-[10.5px] font-black text-white truncate">🎸 LIVE ({liveSetTimeFrame})</span>
              <span className="text-[9.5px] font-bold text-pink-100 truncate">
                {formatDurationLabel(bandLiveMinutes, "Live Set")}
              </span>
            </div>
          </div>
        )}

        {/* --- VARIANT 6: Dual Floating Needle Playheads --- */}
        {layoutId === 6 && (
          <div className="relative flex h-12 w-full items-center rounded-xl border border-white/15 bg-black/60 p-1.5">
            <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 h-1 bg-white/15 rounded-full" />
            <div
              className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 shadow-[0_0_12px_#d946ef] [left:var(--live-left)] [width:var(--live-width)]"
              style={
                {
                  "--live-left": `${bandStartPct}%`,
                  "--live-width": `${clipWidthPct}%`,
                } as React.CSSProperties
              }
            />

            {/* Needle 1: Doors */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Doors Time"
              aria-valuenow={doorsMin}
              onPointerDown={(e) => startDrag(e, "eventStart")}
              onKeyDown={(e) => handleHandleKeyDown(e, "eventStart", doorsMin, railStartMinutes, bandStartMin)}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 cursor-ew-resize flex flex-col items-center [left:var(--needle-left)]"
              style={{ "--needle-left": `${doorsPct}%` } as React.CSSProperties}
            >
              <div className="rounded-full border border-cyan-400 bg-cyan-950 px-1.5 py-0.2 text-[8px] font-bold text-cyan-200 shadow-[0_0_8px_#22d3ee] whitespace-nowrap">
                1. {effectiveEventStart}
              </div>
              <div className="h-4 w-1 bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
            </div>

            {/* Needle 2: Showtime */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Showtime"
              aria-valuenow={bandStartMin}
              onPointerDown={(e) => startDrag(e, "bandStart")}
              onKeyDown={(e) => handleHandleKeyDown(e, "bandStart", bandStartMin, doorsMin, bandEndMin - 30)}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-40 cursor-ew-resize flex flex-col items-center [left:var(--needle-left)]"
              style={{ "--needle-left": `${bandStartPct}%` } as React.CSSProperties}
            >
              <div className="rounded-full border border-purple-400 bg-purple-900 px-1.5 py-0.2 text-[8px] font-bold text-white shadow-[0_0_8px_#a855f7] whitespace-nowrap">
                2. {effectiveBandStart}
              </div>
              <div className="h-4 w-1 bg-purple-400 shadow-[0_0_6px_#c084fc]" />
            </div>

            {/* Needle 3: Encore */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Curtain Call"
              aria-valuenow={bandEndMin}
              onPointerDown={(e) => startDrag(e, "bandEnd")}
              onKeyDown={(e) => handleHandleKeyDown(e, "bandEnd", bandEndMin, bandStartMin + 30, curfewMin)}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-40 cursor-ew-resize flex flex-col items-center [left:var(--needle-left)]"
              style={{ "--needle-left": `${bandEndPct}%` } as React.CSSProperties}
            >
              <div className="rounded-full border border-pink-400 bg-pink-900 px-1.5 py-0.2 text-[8px] font-bold text-white shadow-[0_0_8px_#ec4899] whitespace-nowrap">
                3. {effectiveBandEnd}
              </div>
              <div className="h-4 w-1 bg-pink-400 shadow-[0_0_6px_#f472b6]" />
            </div>

            {/* Needle 4: Curfew */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Curfew Time"
              aria-valuenow={curfewMin}
              onPointerDown={(e) => startDrag(e, "eventEnd")}
              onKeyDown={(e) => handleHandleKeyDown(e, "eventEnd", curfewMin, bandEndMin, railEndMinutes)}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 cursor-ew-resize flex flex-col items-center [left:var(--needle-left)]"
              style={{ "--needle-left": `${curfewPct}%` } as React.CSSProperties}
            >
              <div className="rounded-full border border-amber-400 bg-amber-950 px-1.5 py-0.2 text-[8px] font-bold text-amber-200 shadow-[0_0_8px_#fbbf24] whitespace-nowrap">
                4. {effectiveEventEnd}
              </div>
              <div className="h-4 w-1 bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
            </div>

            <div className="mx-auto z-10 rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-bold text-purple-200 border border-purple-400/30 truncate">
              🎸 LIVE ({liveSetTimeFrame}) • {formatDurationLabel(bandLiveMinutes)}
            </div>
          </div>
        )}

        {/* --- VARIANT 7: Retro Vinyl / Analog Tape Transport --- */}
        {layoutId === 7 && (
          <div className="relative flex h-11 w-full items-center overflow-hidden rounded-xl border border-amber-500/30 bg-[#0d0905] p-1 font-serif">
            {/* Daytime / Inactive Pre-Event Track (00:00 to Doors) */}
            {preEventWidthPct > 0 && (
              <div
                className="relative flex h-full items-center justify-center bg-black/60 border-r border-amber-500/20 px-2 text-[8.5px] font-mono text-amber-500/60 overflow-hidden leading-tight select-none [width:var(--preev-w)] shrink-0"
                style={{ "--preev-w": `${preEventWidthPct}%` } as React.CSSProperties}
              >
                {preEventWidthPct > 15 && (
                  <span className="truncate tracking-wider opacity-60">
                    DAYTIME (00:00 – {effectiveEventStart})
                  </span>
                )}
              </div>
            )}

            {/* Tape Head 1: Doors */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Doors Time"
              aria-valuenow={doorsMin}
              onPointerDown={(e) => startDrag(e, "eventStart")}
              onKeyDown={(e) => handleHandleKeyDown(e, "eventStart", doorsMin, railStartMinutes, bandStartMin)}
              className="z-30 flex h-full w-7 shrink-0 cursor-ew-resize items-center justify-center rounded-l-md bg-cyan-950/80 border border-cyan-400/50 hover:bg-cyan-800 transition-colors"
              title={`1. DOORS (${effectiveEventStart})`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[7.5px] font-black text-cyan-300">1</span>
                <div className="h-2.5 w-1 bg-cyan-400" />
              </div>
            </div>

            <div
              className="flex h-full flex-col justify-center bg-amber-950/30 px-1.5 overflow-hidden leading-tight [width:var(--pre-w)]"
              style={{ "--pre-w": `${preShowWidthPct}%` } as React.CSSProperties}
            >
              {preShowWidthPct > 4 && (
                <>
                  <span className="text-[8px] uppercase tracking-wider text-amber-400/70 truncate">
                    {preShowWidthPct > 10 ? `TAPE A • ${preShowTimeFrame}` : "PRE"}
                  </span>
                  <span className="text-[9.5px] font-bold text-amber-100 truncate">{formatDurationLabel(preShowMinutes)}</span>
                </>
              )}
            </div>

            <div
              onPointerDown={(e) => startDrag(e, "clipShift")}
              className="group relative flex h-full [width:var(--clip-w)] shrink-0 cursor-grab active:cursor-grabbing items-center justify-between rounded-md border border-amber-400/60 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 px-0.5 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
              style={{ "--clip-w": `${clipWidthPct}%` } as React.CSSProperties}
            >
              <div
                role="slider"
                tabIndex={0}
                aria-label="Drag to adjust Showtime"
                aria-valuenow={bandStartMin}
                onPointerDown={(e) => startDrag(e, "bandStart")}
                onKeyDown={(e) => handleHandleKeyDown(e, "bandStart", bandStartMin, doorsMin, bandEndMin - 30)}
                className="flex h-full w-6 cursor-ew-resize items-center justify-center rounded bg-black/40 hover:bg-black/60"
                title={`2. SHOWTIME (${effectiveBandStart})`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[7.5px] font-black text-amber-200">2</span>
                  <div className="h-2.5 w-1 bg-amber-200" />
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-center pointer-events-none px-1 text-center leading-tight">
                <span className="text-[10.5px] font-black tracking-wider text-black truncate">
                  🎙️ MASTER: {liveSetTimeFrame}
                </span>
                <span className="text-[9px] font-bold text-amber-950 truncate">
                  {formatDurationLabel(bandLiveMinutes, "LIVE SET")}
                </span>
              </div>
              <div
                role="slider"
                tabIndex={0}
                aria-label="Drag to adjust Curtain Call"
                aria-valuenow={bandEndMin}
                onPointerDown={(e) => startDrag(e, "bandEnd")}
                onKeyDown={(e) => handleHandleKeyDown(e, "bandEnd", bandEndMin, bandStartMin + 30, curfewMin)}
                className="flex h-full w-6 cursor-ew-resize items-center justify-center rounded bg-black/40 hover:bg-black/60"
                title={`3. ENCORE (${effectiveBandEnd})`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[7.5px] font-black text-amber-200">3</span>
                  <div className="h-2.5 w-1 bg-amber-200" />
                </div>
              </div>
            </div>

            <div
              className="flex h-full flex-col justify-center bg-amber-950/30 px-1.5 overflow-hidden leading-tight [width:var(--post-w)]"
              style={{ "--post-w": `${postShowWidthPct}%` } as React.CSSProperties}
            >
              {postShowWidthPct > 4 && (
                <>
                  <span className="text-[8px] uppercase tracking-wider text-amber-400/70 truncate">
                    {postShowWidthPct > 10 ? `TAPE B • ${postShowTimeFrame}` : "POST"}
                  </span>
                  <span className="text-[9.5px] font-bold text-amber-100 truncate">{formatDurationLabel(postShowMinutes)}</span>
                </>
              )}
            </div>

            {/* Tape Head 4: Curfew */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Curfew Time"
              aria-valuenow={curfewMin}
              onPointerDown={(e) => startDrag(e, "eventEnd")}
              onKeyDown={(e) => handleHandleKeyDown(e, "eventEnd", curfewMin, bandEndMin, railEndMinutes)}
              className="z-30 flex h-full w-7 shrink-0 cursor-ew-resize items-center justify-center rounded-r-md bg-amber-950/80 border border-amber-400/50 hover:bg-amber-800 transition-colors"
              title={`4. CURFEW (${effectiveEventEnd})`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[7.5px] font-black text-amber-300">4</span>
                <div className="h-2.5 w-1 bg-amber-400" />
              </div>
            </div>

            {/* Late Night / Inactive Post-Event Track (Curfew to 24:00) */}
            {postEventWidthPct > 0 && (
              <div
                className="relative flex h-full items-center justify-center bg-black/60 border-l border-amber-500/20 px-1 text-[8px] font-mono text-amber-500/60 overflow-hidden leading-tight select-none [width:var(--postev-w)] shrink-0"
                style={{ "--postev-w": `${postEventWidthPct}%` } as React.CSSProperties}
              >
                {postEventWidthPct > 5 && (
                  <span className="truncate tracking-wider opacity-60">
                    {effectiveEventEnd}–24:00
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- VARIANT 8: Floating Glassmorphic Split-Blocks --- */}
        {layoutId === 8 && (
          <div className="flex h-11 w-full items-center gap-1">
            {/* Daytime / Inactive Pre-Event Track (00:00 to Doors) */}
            {preEventWidthPct > 0 && (
              <div
                className="flex h-full items-center justify-center rounded-lg border border-white/5 bg-black/40 px-2 text-[8.5px] font-mono text-zinc-500 overflow-hidden leading-tight select-none [width:var(--preev-w)] shrink-0"
                style={{ "--preev-w": `${preEventWidthPct}%` } as React.CSSProperties}
              >
                {preEventWidthPct > 15 && (
                  <span className="truncate tracking-wider opacity-60">
                    DAY (00:00–{effectiveEventStart})
                  </span>
                )}
              </div>
            )}

            {/* Splitter 1: Doors */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Doors Time"
              aria-valuenow={doorsMin}
              onPointerDown={(e) => startDrag(e, "eventStart")}
              onKeyDown={(e) => handleHandleKeyDown(e, "eventStart", doorsMin, railStartMinutes, bandStartMin)}
              className="flex h-full w-7 shrink-0 cursor-ew-resize items-center justify-center rounded-lg border border-cyan-400/60 bg-cyan-950/80 shadow-[0_0_10px_#22d3ee]"
              title={`1. DOORS (${effectiveEventStart})`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[7.5px] font-black text-cyan-300">1</span>
                <div className="h-3 w-1 rounded-full bg-cyan-400" />
              </div>
            </div>

            <div
              className="flex h-full flex-col justify-center rounded-lg border border-white/10 bg-white/5 px-1.5 backdrop-blur-xl transition-all overflow-hidden leading-tight [width:var(--pre-w)]"
              style={{ "--pre-w": `${preShowWidthPct}%` } as React.CSSProperties}
            >
              {preShowWidthPct > 4 && (
                <>
                  <span className="text-[8.5px] font-bold text-cyan-300 uppercase truncate">
                    {preShowWidthPct > 10 ? `Pre: ${preShowTimeFrame}` : "Pre"}
                  </span>
                  <span className="text-[9.5px] font-bold text-white truncate">{formatDurationLabel(preShowMinutes)}</span>
                </>
              )}
            </div>

            {/* Splitter 2: Showtime */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Showtime"
              aria-valuenow={bandStartMin}
              onPointerDown={(e) => startDrag(e, "bandStart")}
              onKeyDown={(e) => handleHandleKeyDown(e, "bandStart", bandStartMin, doorsMin, bandEndMin - 30)}
              className="flex h-full w-7 shrink-0 cursor-ew-resize items-center justify-center rounded-lg border border-purple-400/60 bg-purple-900/80 shadow-[0_0_10px_#a855f7]"
              title={`2. SHOWTIME (${effectiveBandStart})`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[7.5px] font-black text-purple-200">2</span>
                <div className="h-3 w-1 rounded-full bg-purple-300" />
              </div>
            </div>

            <div
              onPointerDown={(e) => startDrag(e, "clipShift")}
              className="flex h-full [width:var(--clip-w)] shrink-0 cursor-grab active:cursor-grabbing flex-col items-center justify-center rounded-lg border border-pink-400/60 bg-gradient-to-r from-purple-700/80 to-pink-600/80 px-2 shadow-[0_0_15px_rgba(236,72,153,0.5)] backdrop-blur-xl min-w-0 leading-tight"
              style={{ "--clip-w": `${clipWidthPct}%` } as React.CSSProperties}
            >
              <span className="text-[10.5px] font-black text-white uppercase tracking-wider truncate">
                ⚡ LIVE ({liveSetTimeFrame})
              </span>
              <span className="text-[9px] font-bold text-pink-100 truncate">
                🎸 {formatDurationLabel(bandLiveMinutes, "Live Set")}
              </span>
            </div>

            {/* Splitter 3: Encore */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Curtain Call"
              aria-valuenow={bandEndMin}
              onPointerDown={(e) => startDrag(e, "bandEnd")}
              onKeyDown={(e) => handleHandleKeyDown(e, "bandEnd", bandEndMin, bandStartMin + 30, curfewMin)}
              className="flex h-full w-7 shrink-0 cursor-ew-resize items-center justify-center rounded-lg border border-pink-400/60 bg-pink-900/80 shadow-[0_0_10px_#ec4899]"
              title={`3. ENCORE (${effectiveBandEnd})`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[7.5px] font-black text-pink-200">3</span>
                <div className="h-3 w-1 rounded-full bg-pink-300" />
              </div>
            </div>

            <div
              className="flex h-full flex-col justify-center rounded-lg border border-white/10 bg-white/5 px-1.5 backdrop-blur-xl transition-all overflow-hidden leading-tight [width:var(--post-w)]"
              style={{ "--post-w": `${postShowWidthPct}%` } as React.CSSProperties}
            >
              {postShowWidthPct > 4 && (
                <>
                  <span className="text-[8.5px] font-bold text-violet-300 uppercase truncate">
                    {postShowWidthPct > 10 ? `Post: ${postShowTimeFrame}` : "Post"}
                  </span>
                  <span className="text-[9.5px] font-bold text-white truncate">{formatDurationLabel(postShowMinutes)}</span>
                </>
              )}
            </div>

            {/* Splitter 4: Curfew */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Curfew Time"
              aria-valuenow={curfewMin}
              onPointerDown={(e) => startDrag(e, "eventEnd")}
              onKeyDown={(e) => handleHandleKeyDown(e, "eventEnd", curfewMin, bandEndMin, railEndMinutes)}
              className="flex h-full w-7 shrink-0 cursor-ew-resize items-center justify-center rounded-lg border border-amber-400/60 bg-amber-950/80 shadow-[0_0_10px_#fbbf24]"
              title={`4. CURFEW (${effectiveEventEnd})`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[7.5px] font-black text-amber-300">4</span>
                <div className="h-3 w-1 rounded-full bg-amber-400" />
              </div>
            </div>

            {/* Late Night / Inactive Post-Event Track (Curfew to 24:00) */}
            {postEventWidthPct > 0 && (
              <div
                className="flex h-full items-center justify-center rounded-lg border border-white/5 bg-black/40 px-1 text-[8px] font-mono text-zinc-500 overflow-hidden leading-tight select-none [width:var(--postev-w)] shrink-0"
                style={{ "--postev-w": `${postEventWidthPct}%` } as React.CSSProperties}
              >
                {postEventWidthPct > 5 && (
                  <span className="truncate tracking-wider opacity-60">
                    {effectiveEventEnd}–24:00
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- VARIANT 9: DJ Mixer Crossfader Rail --- */}
        {layoutId === 9 && (
          <div className="relative flex h-11 w-full items-center rounded-xl border border-white/20 bg-[#070b14] p-1.5">
            <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-black/90 border border-white/15" />
            <div
              className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 shadow-[0_0_12px_#ec4899] [left:var(--live-left)] [width:var(--live-width)]"
              style={
                {
                  "--live-left": `${bandStartPct}%`,
                  "--live-width": `${clipWidthPct}%`,
                } as React.CSSProperties
              }
            />

            {/* Fader 1: Doors */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Doors Time"
              aria-valuenow={doorsMin}
              onPointerDown={(e) => startDrag(e, "eventStart")}
              onKeyDown={(e) => handleHandleKeyDown(e, "eventStart", doorsMin, railStartMinutes, bandStartMin)}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 cursor-ew-resize flex h-7 w-7 items-center justify-center rounded-md border border-cyan-400 bg-cyan-950 shadow-[0_0_10px_#22d3ee] [left:var(--knob-left)]"
              style={{ "--knob-left": `${doorsPct}%` } as React.CSSProperties}
              title={`1. DOORS (${effectiveEventStart})`}
            >
              <span className="text-[8px] font-black text-cyan-300">1</span>
            </div>

            {/* Fader 2: Showtime */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Showtime"
              aria-valuenow={bandStartMin}
              onPointerDown={(e) => startDrag(e, "bandStart")}
              onKeyDown={(e) => handleHandleKeyDown(e, "bandStart", bandStartMin, doorsMin, bandEndMin - 30)}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-40 cursor-ew-resize flex h-7 w-8 items-center justify-center rounded-md border border-purple-400 bg-purple-900 shadow-[0_0_10px_#a855f7] [left:var(--knob-left)]"
              style={{ "--knob-left": `${bandStartPct}%` } as React.CSSProperties}
              title={`2. SHOWTIME (${effectiveBandStart})`}
            >
              <span className="text-[8px] font-black text-purple-200">2</span>
            </div>

            {/* Fader 3: Encore */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Curtain Call"
              aria-valuenow={bandEndMin}
              onPointerDown={(e) => startDrag(e, "bandEnd")}
              onKeyDown={(e) => handleHandleKeyDown(e, "bandEnd", bandEndMin, bandStartMin + 30, curfewMin)}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-40 cursor-ew-resize flex h-7 w-8 items-center justify-center rounded-md border border-pink-400 bg-pink-900 shadow-[0_0_10px_#ec4899] [left:var(--knob-left)]"
              style={{ "--knob-left": `${bandEndPct}%` } as React.CSSProperties}
              title={`3. ENCORE (${effectiveBandEnd})`}
            >
              <span className="text-[8px] font-black text-pink-200">3</span>
            </div>

            {/* Fader 4: Curfew */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Curfew Time"
              aria-valuenow={curfewMin}
              onPointerDown={(e) => startDrag(e, "eventEnd")}
              onKeyDown={(e) => handleHandleKeyDown(e, "eventEnd", curfewMin, bandEndMin, railEndMinutes)}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 cursor-ew-resize flex h-7 w-7 items-center justify-center rounded-md border border-amber-400 bg-amber-950 shadow-[0_0_10px_#fbbf24] [left:var(--knob-left)]"
              style={{ "--knob-left": `${curfewPct}%` } as React.CSSProperties}
              title={`4. CURFEW (${effectiveEventEnd})`}
            >
              <span className="text-[8px] font-black text-amber-300">4</span>
            </div>

            <div className="mx-auto z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold text-white border border-white/10 truncate">
              <Disc3 className="h-3 w-3 text-purple-400 animate-spin" />
              <span>LIVE: {liveSetTimeFrame} • {formatDurationLabel(bandLiveMinutes)}</span>
            </div>
          </div>
        )}

        {/* --- VARIANT 10: Radiant Aurora Pulse --- */}
        {layoutId === 10 && (
          <div className="relative flex h-11 w-full items-center overflow-hidden rounded-xl border border-white/25 bg-gradient-to-r from-emerald-950/40 via-purple-900/50 to-pink-950/40 p-1 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            {/* Daytime / Inactive Pre-Event Track (00:00 to Doors) */}
            {preEventWidthPct > 0 && (
              <div
                className="relative flex h-full items-center justify-center bg-black/50 border-r border-white/10 px-2 text-[8.5px] font-mono text-emerald-400/60 overflow-hidden leading-tight select-none [width:var(--preev-w)] shrink-0"
                style={{ "--preev-w": `${preEventWidthPct}%` } as React.CSSProperties}
              >
                {preEventWidthPct > 15 && (
                  <span className="truncate tracking-wider opacity-60">
                    DAY (00:00–{effectiveEventStart})
                  </span>
                )}
              </div>
            )}

            {/* Bubble 1: Doors */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Doors Time"
              aria-valuenow={doorsMin}
              onPointerDown={(e) => startDrag(e, "eventStart")}
              onKeyDown={(e) => handleHandleKeyDown(e, "eventStart", doorsMin, railStartMinutes, bandStartMin)}
              className="z-30 flex h-6 w-6 shrink-0 cursor-ew-resize items-center justify-center rounded-full border-2 border-cyan-300 bg-cyan-700 shadow-[0_0_15px_#22d3ee]"
              title={`1. DOORS (${effectiveEventStart})`}
            >
              <span className="text-[7.5px] font-black text-cyan-100">1</span>
            </div>

            <div
              className="flex h-full flex-col justify-center px-1.5 overflow-hidden leading-tight [width:var(--pre-w)]"
              style={{ "--pre-w": `${preShowWidthPct}%` } as React.CSSProperties}
            >
              {preShowWidthPct > 4 && (
                <>
                  <span className="text-[8.5px] font-bold text-emerald-300 uppercase truncate">
                    {preShowWidthPct > 10 ? `Pre: ${preShowTimeFrame}` : "Pre"}
                  </span>
                  <span className="text-[9.5px] font-bold text-white truncate">{formatDurationLabel(preShowMinutes)}</span>
                </>
              )}
            </div>

            {/* Bubble 2: Showtime */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Showtime"
              aria-valuenow={bandStartMin}
              onPointerDown={(e) => startDrag(e, "bandStart")}
              onKeyDown={(e) => handleHandleKeyDown(e, "bandStart", bandStartMin, doorsMin, bandEndMin - 30)}
              className="z-30 flex h-6 w-6 shrink-0 cursor-ew-resize items-center justify-center rounded-full border-2 border-white bg-purple-600 shadow-[0_0_15px_#c084fc]"
              title={`2. SHOWTIME (${effectiveBandStart})`}
            >
              <span className="text-[7.5px] font-black text-purple-100">2</span>
            </div>

            <div
              onPointerDown={(e) => startDrag(e, "clipShift")}
              className="flex h-full [width:var(--clip-w)] shrink-0 cursor-grab active:cursor-grabbing flex-col items-center justify-center bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 px-2 shadow-[0_0_20px_rgba(217,70,239,0.8)] rounded-md min-w-0 leading-tight"
              style={{ "--clip-w": `${clipWidthPct}%` } as React.CSSProperties}
            >
              <span className="text-[10.5px] font-black text-white uppercase tracking-wider truncate">
                🌌 LIVE: {liveSetTimeFrame}
              </span>
              <span className="text-[9px] font-bold text-white/90 truncate">
                {formatDurationLabel(bandLiveMinutes, "Live Set")}
              </span>
            </div>

            {/* Bubble 3: Encore */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Curtain Call"
              aria-valuenow={bandEndMin}
              onPointerDown={(e) => startDrag(e, "bandEnd")}
              onKeyDown={(e) => handleHandleKeyDown(e, "bandEnd", bandEndMin, bandStartMin + 30, curfewMin)}
              className="z-30 flex h-6 w-6 shrink-0 cursor-ew-resize items-center justify-center rounded-full border-2 border-white bg-pink-600 shadow-[0_0_15px_#f472b6]"
              title={`3. ENCORE (${effectiveBandEnd})`}
            >
              <span className="text-[7.5px] font-black text-pink-100">3</span>
            </div>

            <div
              className="flex h-full flex-col justify-center px-1.5 overflow-hidden leading-tight [width:var(--post-w)]"
              style={{ "--post-w": `${postShowWidthPct}%` } as React.CSSProperties}
            >
              {postShowWidthPct > 4 && (
                <>
                  <span className="text-[8.5px] font-bold text-pink-300 uppercase truncate">
                    {postShowWidthPct > 10 ? `Post: ${postShowTimeFrame}` : "Post"}
                  </span>
                  <span className="text-[9.5px] font-bold text-white truncate">{formatDurationLabel(postShowMinutes)}</span>
                </>
              )}
            </div>

            {/* Bubble 4: Curfew */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Drag to adjust Curfew Time"
              aria-valuenow={curfewMin}
              onPointerDown={(e) => startDrag(e, "eventEnd")}
              onKeyDown={(e) => handleHandleKeyDown(e, "eventEnd", curfewMin, bandEndMin, railEndMinutes)}
              className="z-30 flex h-6 w-6 shrink-0 cursor-ew-resize items-center justify-center rounded-full border-2 border-amber-300 bg-amber-700 shadow-[0_0_15px_#fbbf24]"
              title={`4. CURFEW (${effectiveEventEnd})`}
            >
              <span className="text-[7.5px] font-black text-amber-100">4</span>
            </div>

            {/* Late Night / Inactive Post-Event Track (Curfew to 24:00) */}
            {postEventWidthPct > 0 && (
              <div
                className="relative flex h-full items-center justify-center bg-black/50 border-l border-white/10 px-1 text-[8px] font-mono text-pink-400/60 overflow-hidden leading-tight select-none [width:var(--postev-w)] shrink-0"
                style={{ "--postev-w": `${postEventWidthPct}%` } as React.CSSProperties}
              >
                {postEventWidthPct > 5 && (
                  <span className="truncate tracking-wider opacity-60">
                    {effectiveEventEnd}–24:00
                  </span>
                )}
              </div>
            )}
          </div>
        )}
              </div>

              {/* 3. Attached Pips & Ticks Scale (Sean Mooney / CodePen zEGMqL style) */}
              <div className="relative w-full pt-1.5 select-none">
                {scaleMode === "24h" ? (
                  <div className="relative w-full flex flex-col">
                    {/* Hourly Tick Marks (0 through 24) */}
                    <div className="relative w-full h-2 pointer-events-none">
                      {Array.from({ length: 25 }, (_, i) => {
                        const isMajor = i % 6 === 0;
                        const isMid = i % 3 === 0;
                        return (
                          <div
                            key={i}
                            className={`absolute top-0 -translate-x-1/2 rounded-full ${
                              isMajor
                                ? "h-2.5 w-[2px] bg-zinc-300"
                                : isMid
                                ? "h-2 w-[1.5px] bg-zinc-500"
                                : "h-1.5 w-[1px] bg-zinc-700"
                            } [left:var(--tick-x)]`}
                            style={{ "--tick-x": `${(i / 24) * 100}%` } as React.CSSProperties}
                          />
                        );
                      })}
                    </div>

                    {/* Major Numbers (00, 06, 12, 18, 24) */}
                    <div className="relative w-full h-5 mt-0.5">
                      {MAJOR_24H_TICKS.map((tick, idx) => {
                        const alignClass =
                          idx === 0
                            ? "translate-x-0 text-left"
                            : idx === MAJOR_24H_TICKS.length - 1
                            ? "-translate-x-full text-right"
                            : "-translate-x-1/2 text-center";
                        return (
                          <div
                            key={tick.label24}
                            className={`absolute top-0 font-mono text-[11px] font-bold text-zinc-300 tracking-wider ${alignClass} [left:var(--lbl-x)]`}
                            style={{ "--lbl-x": `${tick.pct}%` } as React.CSSProperties}
                          >
                            {timeFormat === "24h" ? tick.label24 : tick.label12}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Focus Event Zoom Mode */
                  <div className="relative w-full flex flex-col">
                    <div className="relative w-full h-2 pointer-events-none">
                      {focusWindow.ticks.map((tick) => (
                        <div
                          key={tick.minute}
                          className="absolute top-0 -translate-x-1/2 h-2.5 w-[2px] bg-zinc-300 rounded-full [left:var(--tick-x)]"
                          style={{ "--tick-x": `${tick.pct}%` } as React.CSSProperties}
                        />
                      ))}
                    </div>
                    <div className="relative w-full h-5 mt-0.5">
                      {focusWindow.ticks.map((tick, idx) => {
                        const alignClass =
                          idx === 0
                            ? "translate-x-0 text-left"
                            : idx === focusWindow.ticks.length - 1
                            ? "-translate-x-full text-right"
                            : "-translate-x-1/2 text-center";
                        return (
                          <div
                            key={tick.minute}
                            className={`absolute top-0 font-mono text-[11px] font-bold text-zinc-300 tracking-wider ${alignClass} [left:var(--lbl-x)]`}
                            style={{ "--lbl-x": `${tick.pct}%` } as React.CSSProperties}
                          >
                            {timeFormat === "24h" ? tick.label24 : tick.label12}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Shared Interactive Hairline Playhead */}
              {rulerHover && (
                <div
                  className="absolute inset-y-0 w-[1.5px] bg-cyan-400 shadow-[0_0_8px_#22d3ee] pointer-events-none -translate-x-1/2 [left:var(--hover-x)] z-50"
                  style={{ "--hover-x": `${rulerHover.pct}%` } as React.CSSProperties}
                >
                  <div className="absolute top-1 -translate-x-1/2 rounded bg-black/95 border border-cyan-400/80 px-1.5 py-0.5 text-[9px] font-mono text-cyan-200 shadow-lg whitespace-nowrap">
                    {timeFormat === "24h" ? rulerHover.h24Str : rulerHover.timeStr}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* BOTTOM DECK: 4 STAGE MILESTONE PILLS (ALL CLICKABLE DROPDOWN)*/}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Pill 1: DOORS OPEN */}
          <div className="relative">
            <button
              type="button"
              id="dual-bar-doors-btn"
              aria-haspopup="listbox"
              aria-expanded={openTimeline === "eventStart"}
              onClick={() => setOpenTimeline(openTimeline === "eventStart" ? null : "eventStart")}
              className={`flex w-full cursor-pointer items-center justify-between rounded-full border px-4 py-2.5 text-xs transition-all ${
                openTimeline === "eventStart"
                  ? "border-cyan-400 bg-cyan-950/80 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                  : "border-white/20 bg-white/[0.06] text-white hover:border-white/35 hover:bg-white/[0.12]"
              }`}
            >
              <span className="text-[11px] font-bold text-white/60 tracking-wider">1. DOORS:</span>
              <span className="text-sm font-bold text-white">{effectiveEventStart}</span>
              <DotChevronDown className="h-3.5 w-3.5 text-white/60" />
            </button>
            <span className="mt-1 block pl-3 text-[10px] text-white/50">Guests Arrive</span>
            {renderDropdown("eventStart", effectiveEventStart, "Select Doors Time")}
          </div>

          {/* Pill 2: CONCERT SHOWTIME */}
          <div className="relative">
            <button
              type="button"
              id="dual-bar-showtime-btn"
              aria-haspopup="listbox"
              aria-expanded={openTimeline === "bandStart"}
              onClick={() => setOpenTimeline(openTimeline === "bandStart" ? null : "bandStart")}
              className={`flex w-full cursor-pointer items-center justify-between rounded-full border px-4 py-2.5 text-xs transition-all ${
                openTimeline === "bandStart"
                  ? "border-purple-400 bg-purple-900/90 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                  : "border-purple-500/40 bg-purple-950/40 text-white hover:border-purple-400 hover:bg-purple-900/50"
              }`}
            >
              <span className="text-[11px] font-bold text-purple-300 tracking-wider">2. SHOWTIME:</span>
              <span className="text-sm font-bold text-white">{effectiveBandStart}</span>
              <DotChevronDown className="h-3.5 w-3.5 text-purple-300" />
            </button>
            <span className="mt-1 block pl-3 text-[10px] text-purple-300/70">Live Show Starts</span>
            {renderDropdown("bandStart", effectiveBandStart, "Select Concert Showtime")}
          </div>

          {/* Pill 3: CURTAIN CALL / ENCORE */}
          <div className="relative">
            <button
              type="button"
              id="dual-bar-encore-btn"
              aria-haspopup="listbox"
              aria-expanded={openTimeline === "bandEnd"}
              onClick={() => setOpenTimeline(openTimeline === "bandEnd" ? null : "bandEnd")}
              className={`flex w-full cursor-pointer items-center justify-between rounded-full border px-4 py-2.5 text-xs transition-all ${
                openTimeline === "bandEnd"
                  ? "border-pink-400 bg-pink-900/90 text-white shadow-[0_0_20px_rgba(244,114,182,0.6)]"
                  : "border-pink-500/40 bg-pink-950/40 text-white hover:border-pink-400 hover:bg-pink-900/50"
              }`}
            >
              <span className="text-[11px] font-bold text-pink-300 tracking-wider">3. ENCORE:</span>
              <span className="text-sm font-bold text-white">{effectiveBandEnd}</span>
              <DotChevronDown className="h-3.5 w-3.5 text-pink-300" />
            </button>
            <span className="mt-1 block pl-3 text-[10px] text-pink-300/70">Final Bows</span>
            {renderDropdown("bandEnd", effectiveBandEnd, "Select Curtain Call Time", true)}
          </div>

          {/* Pill 4: CURFEW / EVENT WRAP */}
          <div className="relative">
            <button
              type="button"
              id="dual-bar-curfew-btn"
              aria-haspopup="listbox"
              aria-expanded={openTimeline === "eventEnd"}
              onClick={() => setOpenTimeline(openTimeline === "eventEnd" ? null : "eventEnd")}
              className={`flex w-full cursor-pointer items-center justify-between rounded-full border px-4 py-2.5 text-xs transition-all ${
                openTimeline === "eventEnd"
                  ? "border-amber-400 bg-amber-950/80 text-white shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                  : "border-white/20 bg-white/[0.06] text-white hover:border-white/35 hover:bg-white/[0.12]"
              }`}
            >
              <span className="text-[11px] font-bold text-white/60 tracking-wider">4. CURFEW:</span>
              <span className="text-sm font-bold text-white">{effectiveEventEnd}</span>
              <DotChevronDown className="h-3.5 w-3.5 text-white/60" />
            </button>
            <span className="mt-1 block pl-3 text-[10px] text-white/50">Party Concludes</span>
            {renderDropdown("eventEnd", effectiveEventEnd, "Select Curfew Time", true)}
          </div>
        </div>

        {/* Bottom Helper Indicator */}
        <div className="flex flex-wrap items-center justify-between border-t border-white/10 pt-3 text-xs text-white/60">
          <span>
            Pre-show: <strong>{formatDurationLabel(preShowMinutes)}</strong> • Post-show:{" "}
            <strong>{formatDurationLabel(postShowMinutes)}</strong>
          </span>
          <span className="flex items-center gap-2 font-bold text-white">
            <span className="rounded-full bg-purple-500/20 px-3 py-1 text-purple-300">
              🎸 {formatDurationLabel(bandLiveMinutes, "Live Set")}
            </span>
            <span className="text-white/30">•</span>
            <span>{formatDurationLabel(totalEventMinutes, "Total Event Window")}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
