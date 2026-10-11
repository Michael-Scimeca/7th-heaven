"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
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
  Music,
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

  return hours * 60 + minutes;
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
  // Parse minutes ensuring monotonically non-decreasing timeline order (Doors <= Showtime < Encore <= Curfew)
  const doorsMin = parseEveningMinutes(effectiveEventStart, 18);

  let rawStart = parseEveningMinutes(effectiveBandStart, 19.5);
  if (effectiveBandStart?.trim().toUpperCase().startsWith("12:00 AM") && doorsMin > 0) {
    rawStart = 1440;
  } else if (rawStart < doorsMin) {
    rawStart += 1440;
  }
  const bandStartMin = Math.max(doorsMin, rawStart);

  let rawEnd = parseEveningMinutes(effectiveBandEnd, 22.5);
  if (effectiveBandEnd?.trim().toUpperCase().startsWith("12:00 AM") && bandStartMin > 0) {
    rawEnd = 1440;
  } else if (rawEnd < bandStartMin) {
    rawEnd += 1440;
  }
  const bandEndMin = Math.max(bandStartMin + 15, rawEnd);

  let rawCurfew = parseEveningMinutes(effectiveEventEnd, 23.5);
  if (effectiveEventEnd?.trim().toUpperCase().startsWith("12:00 AM") && bandEndMin > 0) {
    rawCurfew = 1440;
  } else if (rawCurfew < bandEndMin) {
    rawCurfew += 1440;
  }
  const curfewMin = Math.max(bandEndMin, rawCurfew);

  // Time Scale Ruler State (noUiSlider Sean Mooney setup)
  const [scaleMode, setScaleMode] = useState<"24h" | "focus">("24h");
  const [timeFormat, setTimeFormat] = useState<"24h" | "12h">("12h");
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
    initialSpan: number;
    initialRailStart: number;
    initialRailEnd: number;
  } | null>(null);

  // Hover and focus state for time picking guideline
  const [hoveredHandle, setHoveredHandle] = useState<DragTarget | null>(null);
  const [focusedHandle, setFocusedHandle] = useState<DragTarget | null>(null);

  // Custom time inputs inside popovers
  const [customInput, setCustomInput] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [popoverTab, setPopoverTab] = useState<"all" | "popular" | "custom">("all");

  // Custom dial state
  const [dialHour, setDialHour] = useState("7");
  const [dialMinute, setDialMinute] = useState("30");
  const [dialPeriod, setDialPeriod] = useState<"AM" | "PM">("PM");

  // All 24 hours of the day (0 to 24) for the timeline ruler
  const ALL_24H_HOURLY_TICKS = useMemo(() => {
    return Array.from({ length: 25 }, (_, h) => {
      const minute = h * 60;
      const pct = (h / 24) * 100;
      const label24 = h === 24 ? "24" : h.toString().padStart(2, "0");
      const hourNum = h === 0 || h === 24 ? 12 : h > 12 ? h - 12 : h;
      const period = h < 12 || h === 24 ? "AM" : "PM";
      const periodShort = period === "AM" ? "a" : "p";
      const label12 = `${hourNum} ${period}`;
      const label12Short = `${hourNum}${periodShort}`;

      return {
        hour: h,
        hourNum,
        period,
        periodShort,
        minute,
        pct,
        label24,
        label12,
        label12Short,
      };
    });
  }, []);

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

  // Active target for time picking guideline (drag > hover > focus)
  const activePickTarget = activeDrag?.target || hoveredHandle || focusedHandle;

  // Guidelines to show what time the user is actively picking
  const pickingGuides = useMemo(() => {
    if (!activePickTarget) return [];

    const getAlign = (pct: number) =>
      pct < 8 ? "left-0 translate-x-0" : pct > 92 ? "right-0 translate-x-0" : "left-1/2 -translate-x-1/2";
    const getCaretClass = (pct: number) =>
      pct < 8 ? "left-3" : pct > 92 ? "right-3" : "left-1/2 -translate-x-1/2";

    if (activePickTarget === "eventStart") {
      const time = timeFormat === "24h" ? minutesToH24(doorsMin) : effectiveEventStart;
      return [
        {
          key: "doors",
          pct: doorsPct,
          label: "Doors Open",
          time,
          badgeAlign: getAlign(doorsPct),
          caretClass: getCaretClass(doorsPct),
          badgeClass: "border-cyan-400/80 bg-zinc-950/95 text-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.5)]",
          lineClass: "bg-cyan-400 shadow-[0_0_8px_rgb(34,211,238)]",
          pipClass: "bg-cyan-300 shadow-[0_0_6px_rgb(34,211,238)]",
        },
      ];
    }

    if (activePickTarget === "bandStart") {
      const time = timeFormat === "24h" ? minutesToH24(bandStartMin) : effectiveBandStart;
      return [
        {
          key: "showtime",
          pct: bandStartPct,
          label: "Show Time",
          time,
          badgeAlign: getAlign(bandStartPct),
          caretClass: getCaretClass(bandStartPct),
          badgeClass: "border-purple-400/80 bg-zinc-950/95 text-purple-200 shadow-[0_0_14px_rgba(168,85,247,0.5)]",
          lineClass: "bg-purple-400 shadow-[0_0_8px_rgb(168,85,247)]",
          pipClass: "bg-purple-300 shadow-[0_0_6px_rgb(168,85,247)]",
        },
      ];
    }

    if (activePickTarget === "bandEnd") {
      const time = timeFormat === "24h" ? minutesToH24(bandEndMin) : effectiveBandEnd;
      return [
        {
          key: "encore",
          pct: bandEndPct,
          label: "Show Ends",
          time,
          badgeAlign: getAlign(bandEndPct),
          caretClass: getCaretClass(bandEndPct),
          badgeClass: "border-pink-400/80 bg-zinc-950/95 text-pink-200 shadow-[0_0_14px_rgba(244,114,182,0.5)]",
          lineClass: "bg-pink-400 shadow-[0_0_8px_rgb(244,114,182)]",
          pipClass: "bg-pink-300 shadow-[0_0_6px_rgb(244,114,182)]",
        },
      ];
    }

    if (activePickTarget === "eventEnd") {
      const time = timeFormat === "24h" ? minutesToH24(curfewMin) : effectiveEventEnd;
      return [
        {
          key: "curfew",
          pct: curfewPct,
          label: "Doors Close",
          time,
          badgeAlign: getAlign(curfewPct),
          caretClass: getCaretClass(curfewPct),
          badgeClass: "border-amber-400/80 bg-zinc-950/95 text-amber-200 shadow-[0_0_14px_rgba(251,191,36,0.5)]",
          lineClass: "bg-amber-400 shadow-[0_0_8px_rgb(251,191,36)]",
          pipClass: "bg-amber-300 shadow-[0_0_6px_rgb(251,191,36)]",
        },
      ];
    }

    if (activePickTarget === "clipShift") {
      const startTime = timeFormat === "24h" ? minutesToH24(bandStartMin) : effectiveBandStart;
      const endTime = timeFormat === "24h" ? minutesToH24(bandEndMin) : effectiveBandEnd;
      return [
        {
          key: "clip-start",
          pct: bandStartPct,
          label: "Show Time",
          time: startTime,
          badgeAlign: getAlign(bandStartPct),
          caretClass: getCaretClass(bandStartPct),
          badgeClass: "border-purple-400/80 bg-zinc-950/95 text-purple-200 shadow-[0_0_14px_rgba(168,85,247,0.5)]",
          lineClass: "bg-purple-400 shadow-[0_0_8px_rgb(168,85,247)]",
          pipClass: "bg-purple-300 shadow-[0_0_6px_rgb(168,85,247)]",
        },
        {
          key: "clip-end",
          pct: bandEndPct,
          label: "Show Ends",
          time: endTime,
          badgeAlign: getAlign(bandEndPct),
          caretClass: getCaretClass(bandEndPct),
          badgeClass: "border-pink-400/80 bg-zinc-950/95 text-pink-200 shadow-[0_0_14px_rgba(244,114,182,0.5)]",
          lineClass: "bg-pink-400 shadow-[0_0_8px_rgb(244,114,182)]",
          pipClass: "bg-pink-300 shadow-[0_0_6px_rgb(244,114,182)]",
        },
      ];
    }

    return [];
  }, [
    activePickTarget,
    doorsMin,
    bandStartMin,
    bandEndMin,
    curfewMin,
    doorsPct,
    bandStartPct,
    bandEndPct,
    curfewPct,
    effectiveEventStart,
    effectiveBandStart,
    effectiveBandEnd,
    effectiveEventEnd,
    timeFormat,
  ]);

  // Start pointer dragging
  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>, target: DragTarget) => {
      e.preventDefault();
      e.stopPropagation();

      setActiveDrag({
        target,
        startX: e.clientX,
        initialDoors: doorsMin,
        initialBandStart: bandStartMin,
        initialBandEnd: bandEndMin,
        initialCurfew: curfewMin,
        initialSpan: totalSpanMinutes,
        initialRailStart: railStartMinutes,
        initialRailEnd: railEndMinutes,
      });
    },
    [doorsMin, bandStartMin, bandEndMin, curfewMin, totalSpanMinutes, railStartMinutes, railEndMinutes]
  );

  // Global window pointer listeners for butter-smooth dragging without tracking loss
  useEffect(() => {
    if (!activeDrag) return;

    const onPointerMove = (e: PointerEvent) => {
      const trackEl = sliderTrackRef.current || railRef.current;
      if (!trackEl) return;
      const rect = trackEl.getBoundingClientRect();
      if (rect.width <= 0) return;

      const deltaX = e.clientX - activeDrag.startX;
      const deltaMinutes = (deltaX / rect.width) * activeDrag.initialSpan;

      if (activeDrag.target === "bandStart") {
        const newMinutes = snap15(
          Math.max(activeDrag.initialDoors, Math.min(activeDrag.initialBandEnd - 30, activeDrag.initialBandStart + deltaMinutes))
        );
        handleSelectTimelineTime("bandStart", minutesToTimeStr(newMinutes));
      } else if (activeDrag.target === "bandEnd") {
        const newMinutes = snap15(
          Math.max(activeDrag.initialBandStart + 30, Math.min(activeDrag.initialCurfew, activeDrag.initialBandEnd + deltaMinutes))
        );
        handleSelectTimelineTime("bandEnd", minutesToTimeStr(newMinutes));
      } else if (activeDrag.target === "eventStart") {
        const newMinutes = snap15(
          Math.max(activeDrag.initialRailStart, Math.min(activeDrag.initialBandStart, activeDrag.initialDoors + deltaMinutes))
        );
        handleSelectTimelineTime("eventStart", minutesToTimeStr(newMinutes));
      } else if (activeDrag.target === "eventEnd") {
        const newMinutes = snap15(
          Math.max(activeDrag.initialBandEnd, Math.min(activeDrag.initialRailEnd, activeDrag.initialCurfew + deltaMinutes))
        );
        handleSelectTimelineTime("eventEnd", minutesToTimeStr(newMinutes));
      } else if (activeDrag.target === "clipShift") {
        const duration = activeDrag.initialBandEnd - activeDrag.initialBandStart;
        const proposedStart = snap15(activeDrag.initialBandStart + deltaMinutes);
        const maxStart = activeDrag.initialCurfew - duration;
        const clampedStart = Math.max(activeDrag.initialDoors, Math.min(maxStart, proposedStart));
        const clampedEnd = clampedStart + duration;

        handleSelectTimelineTime("bandStart", minutesToTimeStr(clampedStart));
        handleSelectTimelineTime("bandEnd", minutesToTimeStr(clampedEnd));
      }
    };

    const onPointerUp = () => {
      setActiveDrag(null);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [activeDrag, handleSelectTimelineTime]);

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
        className={`absolute top-14 ${alignRight ? "left-0 sm:left-auto sm:right-0" : "left-0"
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
            className={`flex-1 rounded-lg py-1 text-[10px] font-bold transition-all ${popoverTab === "all"
              ? "bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.5)]"
              : "text-white/60 hover:text-white"
              }`}
          >
            All (15m)
          </button>
          <button
            type="button"
            onClick={() => setPopoverTab("popular")}
            className={`flex-1 rounded-lg py-1 text-[10px] font-bold transition-all ${popoverTab === "popular"
              ? "bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.5)]"
              : "text-white/60 hover:text-white"
              }`}
          >
            Popular
          </button>
          <button
            type="button"
            onClick={() => setPopoverTab("custom")}
            className={`flex-1 rounded-lg py-1 text-[10px] font-bold transition-all ${popoverTab === "custom"
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
                    className={`flex-1 rounded-lg text-[10px] font-bold ${dialPeriod === "AM" ? "bg-purple-600 text-white" : "text-white/60"
                      }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setDialPeriod("PM")}
                    className={`flex-1 rounded-lg text-[10px] font-bold ${dialPeriod === "PM" ? "bg-purple-600 text-white" : "text-white/60"
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
                    className={`rounded-lg border px-2 py-1.5 text-xs font-semibold transition-all ${isSelected
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
      className="relative flex flex-col gap-4 select-none"
    >
      {/* Active Drag Floating Tooltip HUD */}
      {activeDrag && (
        <div className="pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-purple-400/50 bg-[#0d1322]/95 px-5 py-2.5 shadow-[0_0_30px_rgba(168,85,247,0.6)] backdrop-blur-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <span className="flex h-2 w-2 animate-ping rounded-full bg-pink-400" />
            <span className="text-purple-300 uppercase tracking-wider">
              {activeDrag.target === "eventStart" && "1. DOORS OPEN (Guests Arrive)"}
              {activeDrag.target === "bandStart" && "2. SHOW TIME (Live Show Starts)"}
              {activeDrag.target === "bandEnd" && "3. SHOW ENDS (Final Bows)"}
              {activeDrag.target === "eventEnd" && "4. DOORS CLOSE (Party Concludes)"}
              {activeDrag.target === "clipShift" && "🎸 LIVE CONCERT WINDOW"}
              :
            </span>
            <span className="font-mono text-sm text-pink-300">
              {activeDrag.target === "eventStart" && effectiveEventStart}
              {activeDrag.target === "bandStart" && effectiveBandStart}
              {activeDrag.target === "bandEnd" && effectiveBandEnd}
              {activeDrag.target === "eventEnd" && effectiveEventEnd}
              {activeDrag.target === "clipShift" && `${effectiveBandStart} – ${effectiveBandEnd}`}
            </span>
          </div>
        </div>
      )}

      {/* Main Container Frame */}
      <div className="flex flex-col gap-4 ">

        {/* ============================================================ */}
        {/* UNIFIED MERGED TIMELINE SLIDER (Ruler + Draggable Track)     */}
        {/* ============================================================ */}
        <div
          id="timeline-time-ruler"
          className="relative flex flex-col w-full select-none"
        >
          {/* Top Controls Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-pink-500/20 text-pink-300">
                <Flame className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Live Concert Master Deck
              </span>
              <span className="hidden sm:inline-block text-[11px] text-white/50">
                • Drag handles or click stage cards below
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="hidden md:flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-0.5 text-[11px] font-bold text-cyan-200">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Pre-Show: {(preShowMinutes / 60).toFixed(1)}h
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-pink-500/50 bg-pink-950/60 px-2.5 py-0.5 text-[11px] font-black text-pink-100 shadow-[0_0_12px_rgba(236,72,153,0.35)]">
                <span className="h-1.5 w-1.5 rounded-full bg-pink-400 animate-pulse" />
                Live Show: {(bandLiveMinutes / 60).toFixed(1)}h
              </div>
              <div className="hidden md:flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-950/40 px-2.5 py-0.5 text-[11px] font-bold text-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Post-Show: {(postShowMinutes / 60).toFixed(1)}h
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-bold text-white/80">
                <Clock className="h-3 w-3 text-white/60" />
                Total: {(totalEventMinutes / 60).toFixed(1)}h
              </div>

              {/* Time Format Switcher (12H / 24H) */}
              <div className="flex items-center rounded-lg border border-white/15 bg-white/5 p-0.5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setTimeFormat("12h")}
                  className={`rounded px-2 py-0.5 transition-all ${
                    timeFormat === "12h"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  12H
                </button>
                <button
                  type="button"
                  onClick={() => setTimeFormat("24h")}
                  className={`rounded px-2 py-0.5 transition-all ${
                    timeFormat === "24h"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  24H
                </button>
              </div>
            </div>
          </div>

          {/* Main Stage: Floating Tooltips + Slider Track + Attached Pips Scale */}
          <div className="relative w-full px-3.5">
            <div
              onPointerMove={handleRulerPointerMove}
              onPointerLeave={() => {
                setRulerHover(null);
                setHoveredHandle(null);
              }}
              className="relative w-full flex flex-col gap-1.5"
            >
              {/* 2. Middle Slider Track Enclosure */}
              <div ref={sliderTrackRef} className="relative w-full">

                {/* --- VARIANT 1: Electric Laser Beam (Rock Concert Master Deck) --- */}
                {layoutId === 1 && (
                  <div className="relative flex h-13 w-full items-center overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-b from-zinc-900/90 via-black to-zinc-950/95 shadow-[0_16px_36px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.2)] select-none">
                    {/* Interior Laser Guide Rail */}
                    <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[1px] -translate-y-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    {/* Daytime / Inactive Pre-Event Track (00:00 to Doors) */}
                    {preEventWidthPct > 0 && (
                      <div
                        className="relative flex h-full items-center justify-center bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.015),rgba(255,255,255,0.015)_6px,transparent_6px,transparent_12px)] border-r border-white/10 px-2 text-[9px] font-mono text-zinc-500 overflow-hidden leading-tight select-none [width:var(--preev-w)] shrink-0"
                        style={{ "--preev-w": `${preEventWidthPct}%` } as React.CSSProperties}
                      >
                        {preEventWidthPct > 15 && (
                          <span className="truncate tracking-wider opacity-60 uppercase">
                            Daytime Setup
                          </span>
                        )}
                      </div>
                    )}

                    {/* Handle 1: 1. DOORS OPEN */}
                    <div
                      role="slider"
                      tabIndex={0}
                      aria-label="Drag to adjust Doors Open Time"
                      aria-valuenow={doorsMin}
                      onPointerDown={(e) => startDrag(e, "eventStart")}
                      onPointerEnter={() => setHoveredHandle("eventStart")}
                      onPointerLeave={() => setHoveredHandle(null)}
                      onFocus={() => setFocusedHandle("eventStart")}
                      onBlur={() => setFocusedHandle(null)}
                      onKeyDown={(e) => handleHandleKeyDown(e, "eventStart", doorsMin, railStartMinutes, bandStartMin)}
                      className="group z-30 flex h-full w-8 shrink-0 -ml-4 -mr-4 cursor-ew-resize items-center justify-center transition-transform hover:scale-105 active:scale-95"
                      title={`1. DOORS OPEN (${effectiveEventStart})`}
                    >
                      <div className="flex h-9 w-6 flex-col items-center justify-center gap-1 rounded-lg border border-cyan-400 bg-gradient-to-b from-zinc-800 to-zinc-950 shadow-[0_0_15px_rgba(34,211,238,0.7),inset_0_1px_1px_rgba(255,255,255,0.4)]">
                        <div className="h-4 w-1 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
                        <div className="flex gap-0.5">
                          <span className="h-1 w-0.5 rounded-full bg-cyan-400/60" />
                          <span className="h-1 w-0.5 rounded-full bg-cyan-400/60" />
                        </div>
                      </div>
                    </div>

                    {/* Pre-Show Track with Time Frame */}
                    <div
                      className="relative flex h-full items-center justify-center bg-gradient-to-r from-cyan-950/40 via-cyan-900/30 to-purple-950/30 border-y border-cyan-500/20 px-2 overflow-hidden leading-tight [width:var(--pre-w)] shrink-0"
                      style={{ "--pre-w": `${preShowWidthPct}%` } as React.CSSProperties}
                    >
                      {preShowWidthPct > 12 && (
                        <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-cyan-300/80 truncate">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                          Pre-Show Reception
                        </span>
                      )}
                    </div>

                    {/* Draggable Live Set Region with Time Frame */}
                    <div
                      onPointerDown={(e) => startDrag(e, "clipShift")}
                      onPointerEnter={() => setHoveredHandle("clipShift")}
                      onPointerLeave={() => setHoveredHandle(null)}
                      className="group relative flex h-full cursor-grab active:cursor-grabbing items-center justify-between rounded-xl bg-gradient-to-r from-purple-700 via-pink-600 to-amber-600 px-0.5 border border-pink-300/40 shadow-[0_0_30px_rgba(236,72,153,0.5),inset_0_1px_2px_rgba(255,255,255,0.5)] transition-all hover:shadow-[0_0_40px_rgba(236,72,153,0.7)] [width:var(--clip-w)] shrink-0"
                      style={{ "--clip-w": `${clipWidthPct}%` } as React.CSSProperties}
                    >
                      {/* Left Handle (Show Time) */}
                      <div
                        role="slider"
                        tabIndex={0}
                        aria-label="Drag to adjust Show Time"
                        aria-valuenow={bandStartMin}
                        onPointerDown={(e) => startDrag(e, "bandStart")}
                        onPointerEnter={() => setHoveredHandle("bandStart")}
                        onPointerLeave={() => setHoveredHandle(null)}
                        onFocus={() => setFocusedHandle("bandStart")}
                        onBlur={() => setFocusedHandle(null)}
                        onKeyDown={(e) => handleHandleKeyDown(e, "bandStart", bandStartMin, doorsMin, bandEndMin - 30)}
                        className="flex h-9 w-6 shrink-0 cursor-ew-resize items-center justify-center rounded-lg bg-black/40 hover:bg-black/60 border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-sm"
                        title={`2. SHOW TIME (${effectiveBandStart})`}
                      >
                        <ChevronLeft className="h-3.5 w-3.5 text-white/90 group-hover:text-pink-200" />
                      </div>

                      {/* Center Info with Time Frame & Soundwave Visualizer */}
                      <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-1 text-center pointer-events-none leading-tight overflow-hidden select-none">
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5 h-3">
                            <span className="h-1.5 w-0.5 rounded-full bg-pink-200 animate-pulse" />
                            <span className="h-3 w-0.5 rounded-full bg-white animate-pulse" />
                            <span className="h-2 w-0.5 rounded-full bg-pink-200 animate-pulse" />
                          </div>
                          <span className="text-[12px] font-black uppercase tracking-wider text-white truncate drop-shadow">
                            {formatDurationLabel(bandLiveMinutes, "Live Concert")}
                          </span>
                        </div>
                        {clipWidthPct > 18 && (
                          <span className="text-[9px] font-bold text-pink-100/90 truncate">
                            7TH HEAVEN ON STAGE
                          </span>
                        )}
                      </div>

                      {/* Right Handle (Show Ends) */}
                      <div
                        role="slider"
                        tabIndex={0}
                        aria-label="Drag to adjust Show Ends Time"
                        aria-valuenow={bandEndMin}
                        onPointerDown={(e) => startDrag(e, "bandEnd")}
                        onPointerEnter={() => setHoveredHandle("bandEnd")}
                        onPointerLeave={() => setHoveredHandle(null)}
                        onFocus={() => setFocusedHandle("bandEnd")}
                        onBlur={() => setFocusedHandle(null)}
                        onKeyDown={(e) => handleHandleKeyDown(e, "bandEnd", bandEndMin, bandStartMin + 30, curfewMin)}
                        className="flex h-9 w-6 shrink-0 cursor-ew-resize items-center justify-center rounded-lg bg-black/40 hover:bg-black/60 border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-sm"
                        title={`3. SHOW ENDS (${effectiveBandEnd})`}
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-white/90 group-hover:text-pink-200" />
                      </div>
                    </div>

                    {/* Post-Show Track with Time Frame */}
                    <div
                      className="relative flex h-full items-center justify-center bg-gradient-to-r from-purple-950/30 via-amber-950/30 to-amber-900/30 border-y border-amber-500/20 px-2 overflow-hidden leading-tight [width:var(--post-w)] shrink-0"
                      style={{ "--post-w": `${postShowWidthPct}%` } as React.CSSProperties}
                    >
                      {postShowWidthPct > 12 && (
                        <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-amber-300/80 truncate">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                          Encore & Wrap-up
                        </span>
                      )}
                    </div>

                    {/* Handle 4: 4. DOORS CLOSE */}
                    <div
                      role="slider"
                      tabIndex={0}
                      aria-label="Drag to adjust Doors Close Time"
                      aria-valuenow={curfewMin}
                      onPointerDown={(e) => startDrag(e, "eventEnd")}
                      onPointerEnter={() => setHoveredHandle("eventEnd")}
                      onPointerLeave={() => setHoveredHandle(null)}
                      onFocus={() => setFocusedHandle("eventEnd")}
                      onBlur={() => setFocusedHandle(null)}
                      onKeyDown={(e) => handleHandleKeyDown(e, "eventEnd", curfewMin, bandEndMin, railEndMinutes)}
                      className="group z-30 flex h-full w-8 shrink-0 -ml-4 -mr-4 cursor-ew-resize items-center justify-center transition-transform hover:scale-105 active:scale-95"
                      title={`4. DOORS CLOSE (${effectiveEventEnd})`}
                    >
                      <div className="flex h-9 w-6 flex-col items-center justify-center gap-1 rounded-lg border border-amber-400 bg-gradient-to-b from-zinc-800 to-zinc-950 shadow-[0_0_15px_rgba(251,191,36,0.7),inset_0_1px_1px_rgba(255,255,255,0.4)]">
                        <div className="h-4 w-1 rounded-full bg-amber-300 shadow-[0_0_8px_#fbbf24]" />
                        <div className="flex gap-0.5">
                          <span className="h-1 w-0.5 rounded-full bg-amber-400/60" />
                          <span className="h-1 w-0.5 rounded-full bg-amber-400/60" />
                        </div>
                      </div>
                    </div>

                    {/* Late Night / Inactive Post-Event Track (Curfew to 24:00) */}
                    {postEventWidthPct > 0 && (
                      <div
                        className="relative flex h-full items-center justify-center bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.015),rgba(255,255,255,0.015)_6px,transparent_6px,transparent_12px)] border-l border-white/10 px-2 text-[9px] font-mono text-zinc-500 overflow-hidden leading-tight select-none [width:var(--postev-w)] shrink-0"
                        style={{ "--postev-w": `${postEventWidthPct}%` } as React.CSSProperties}
                      >
                        {postEventWidthPct > 15 && (
                          <span className="truncate tracking-wider opacity-60 uppercase">
                            Overnight
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* --- VARIANT 2: Knurled Chrome Dividers --- */}
                {layoutId === 2 && (
                  <div className="relative flex h-11 w-full items-center rounded-xl border border-white/20 bg-[#060910] shadow-inner overflow-hidden">
                    {preEventWidthPct > 0 && (
                      <div
                        className="flex h-full items-center justify-center bg-black/50 border-r border-white/10 px-2 text-[8.5px] font-mono text-zinc-400 overflow-hidden leading-tight select-none [width:var(--preev-w)] shrink-0"
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
                      aria-label="Drag to adjust Doors Open Time"
                      aria-valuenow={doorsMin}
                      onPointerDown={(e) => startDrag(e, "eventStart")}
                      onPointerEnter={() => setHoveredHandle("eventStart")}
                      onPointerLeave={() => setHoveredHandle(null)}
                      onFocus={() => setFocusedHandle("eventStart")}
                      onBlur={() => setFocusedHandle(null)}
                      onKeyDown={(e) => handleHandleKeyDown(e, "eventStart", doorsMin, railStartMinutes, bandStartMin)}
                      className="group relative z-30 flex h-full w-7 shrink-0 -ml-3.5 -mr-3.5 cursor-ew-resize items-center justify-center border border-cyan-400 bg-gradient-to-b from-cyan-700 to-cyan-950 shadow-[0_0_12px_rgba(34,211,238,0.7)]"
                      title={`1. DOORS OPEN (${effectiveEventStart})`}
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
                      aria-label="Drag to adjust Show Time"
                      aria-valuenow={bandStartMin}
                      onPointerDown={(e) => startDrag(e, "bandStart")}
                      onPointerEnter={() => setHoveredHandle("bandStart")}
                      onPointerLeave={() => setHoveredHandle(null)}
                      onFocus={() => setFocusedHandle("bandStart")}
                      onBlur={() => setFocusedHandle(null)}
                      onKeyDown={(e) => handleHandleKeyDown(e, "bandStart", bandStartMin, doorsMin, bandEndMin - 30)}
                      className="group relative z-30 flex h-full w-7 shrink-0 -ml-3.5 -mr-3.5 cursor-ew-resize items-center justify-center border border-purple-400 bg-gradient-to-b from-purple-700 to-purple-950 shadow-[0_0_12px_rgba(168,85,247,0.7)]"
                      title={`2. SHOW TIME (${effectiveBandStart})`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[7.5px] font-black text-purple-200">2</span>
                        <span className="h-2.5 w-1 rounded-full bg-white" />
                      </div>
                    </div>

                    <div
                      onPointerDown={(e) => startDrag(e, "clipShift")}
                      onPointerEnter={() => setHoveredHandle("clipShift")}
                      onPointerLeave={() => setHoveredHandle(null)}
                      className="flex h-full cursor-grab active:cursor-grabbing flex-col items-center justify-center bg-purple-950/80 border-y border-purple-400/40 px-2 text-center leading-tight [width:var(--clip-w)] shrink-0"
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
                      aria-label="Drag to adjust Show Ends Time"
                      aria-valuenow={bandEndMin}
                      onPointerDown={(e) => startDrag(e, "bandEnd")}
                      onPointerEnter={() => setHoveredHandle("bandEnd")}
                      onPointerLeave={() => setHoveredHandle(null)}
                      onFocus={() => setFocusedHandle("bandEnd")}
                      onBlur={() => setFocusedHandle(null)}
                      onKeyDown={(e) => handleHandleKeyDown(e, "bandEnd", bandEndMin, bandStartMin + 30, curfewMin)}
                      className="group relative z-30 flex h-full w-7 shrink-0 -ml-3.5 -mr-3.5 cursor-ew-resize items-center justify-center border border-pink-400 bg-gradient-to-b from-pink-700 to-pink-950 shadow-[0_0_12px_rgba(236,72,153,0.7)]"
                      title={`3. SHOW ENDS (${effectiveBandEnd})`}
                    >
                      <div className="flex flex-col items-center gap-0.5">

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
                      aria-label="Drag to adjust Doors Close Time"
                      aria-valuenow={curfewMin}
                      onPointerDown={(e) => startDrag(e, "eventEnd")}
                      onPointerEnter={() => setHoveredHandle("eventEnd")}
                      onPointerLeave={() => setHoveredHandle(null)}
                      onFocus={() => setFocusedHandle("eventEnd")}
                      onBlur={() => setFocusedHandle(null)}
                      onKeyDown={(e) => handleHandleKeyDown(e, "eventEnd", curfewMin, bandEndMin, railEndMinutes)}
                      className="group relative z-30 flex h-full w-7 shrink-0 -ml-3.5 -mr-3.5 cursor-ew-resize items-center justify-center border border-amber-400 bg-gradient-to-b from-amber-700 to-amber-950 shadow-[0_0_12px_rgba(251,191,36,0.7)]"
                      title={`4. DOORS CLOSE (${effectiveEventEnd})`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[7.5px] font-black text-amber-200">4</span>
                        <span className="h-2.5 w-1 rounded-full bg-white" />
                      </div>
                    </div>

                    {postEventWidthPct > 0 && (
                      <div
                        className="flex h-full items-center justify-center bg-black/50 border-l border-white/10 px-1 text-[8px] font-mono text-zinc-400 overflow-hidden leading-tight select-none [width:var(--postev-w)] shrink-0"
                        style={{ "--postev-w": `${postEventWidthPct}%` } as React.CSSProperties}
                      >
                        {postEventWidthPct > 5 && (
                          <span className="truncate tracking-wider opacity-60">
                            {timeFormat === "24h" ? minutesToH24(curfewMin) : effectiveEventEnd}–{timeFormat === "24h" ? "24:00" : "12:00 AM"}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* --- VARIANT 3: Pro DAW Arranger Strip --- */}
                {layoutId === 3 && (
                  <div className="relative flex h-11 w-full items-center overflow-hidden rounded-xl border border-purple-400/30 bg-[#070b16] p-1 shadow-inner font-sans">
                    {preEventWidthPct > 0 && (
                      <div
                        className="relative flex h-full items-center justify-center bg-black/50 border-r border-white/10 px-2 text-[8.5px] font-mono text-zinc-400 overflow-hidden leading-tight select-none [width:var(--preev-w)] shrink-0"
                        style={{ "--preev-w": `${preEventWidthPct}%` } as React.CSSProperties}
                      >
                        {preEventWidthPct > 15 && (
                          <span className="truncate tracking-wider opacity-60">
                            DAYTIME / SETUP ({timeFormat === "24h" ? "00:00" : "12:00 AM"} – {timeFormat === "24h" ? minutesToH24(doorsMin) : effectiveEventStart})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Handle 1: 1. DOORS */}
                    <div
                      role="slider"
                      tabIndex={0}
                      aria-label="Drag to adjust Doors Open Time"
                      aria-valuenow={doorsMin}
                      onPointerDown={(e) => startDrag(e, "eventStart")}
                      onPointerEnter={() => setHoveredHandle("eventStart")}
                      onPointerLeave={() => setHoveredHandle(null)}
                      onFocus={() => setFocusedHandle("eventStart")}
                      onBlur={() => setFocusedHandle(null)}
                      onKeyDown={(e) => handleHandleKeyDown(e, "eventStart", doorsMin, railStartMinutes, bandStartMin)}
                      className="group relative z-30 flex h-full w-7 shrink-0 -ml-3.5 -mr-3.5 cursor-ew-resize items-center justify-center border border-cyan-400/60 bg-cyan-950 hover:bg-cyan-900 transition-colors shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                      title={`1. DOORS OPEN (${effectiveEventStart})`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="h-3 w-1 rounded-full bg-cyan-400 group-hover:bg-cyan-200" />
                      </div>
                    </div>

                    {/* Pre-Show Track */}
                    <div
                      className="relative flex h-full flex-col justify-center overflow-hidden bg-cyan-900/35 border-y border-cyan-500/30 leading-tight [width:var(--pre-show-w)] shrink-0"
                      style={{ "--pre-show-w": `${preShowWidthPct}%` } as React.CSSProperties}
                    />

                    {/* CH 02 LIVE AUDIO CLIP with Handles 2 & 3 */}
                    <div
                      onPointerDown={(e) => startDrag(e, "clipShift")}
                      onPointerEnter={() => setHoveredHandle("clipShift")}
                      onPointerLeave={() => setHoveredHandle(null)}
                      className="group relative flex h-full cursor-grab active:cursor-grabbing z-20 items-center justify-between border border-purple-400/70 bg-gradient-to-r from-purple-900/90 via-pink-900/90 to-purple-900/90 px-0.5 shadow-[0_0_16px_rgba(168,85,247,0.6)] [width:var(--clip-w)] shrink-0"
                      style={{ "--clip-w": `${clipWidthPct}%` } as React.CSSProperties}
                    >
                      {/* Handle 2: SHOWTIME */}
                      <div
                        role="slider"
                        tabIndex={0}
                        aria-label="Drag to adjust Show Time"
                        aria-valuenow={bandStartMin}
                        onPointerDown={(e) => startDrag(e, "bandStart")}
                        onPointerEnter={() => setHoveredHandle("bandStart")}
                        onPointerLeave={() => setHoveredHandle(null)}
                        onFocus={() => setFocusedHandle("bandStart")}
                        onBlur={() => setFocusedHandle(null)}
                        onKeyDown={(e) => handleHandleKeyDown(e, "bandStart", bandStartMin, doorsMin, bandEndMin - 30)}
                        className="flex h-full w-6 cursor-ew-resize items-center justify-center bg-black/40 hover:bg-black/60 transition-colors"
                        title={`2. SHOW TIME (${effectiveBandStart})`}
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
                        aria-label="Drag to adjust Show Ends Time"
                        aria-valuenow={bandEndMin}
                        onPointerDown={(e) => startDrag(e, "bandEnd")}
                        onPointerEnter={() => setHoveredHandle("bandEnd")}
                        onPointerLeave={() => setHoveredHandle(null)}
                        onFocus={() => setFocusedHandle("bandEnd")}
                        onBlur={() => setFocusedHandle(null)}
                        onKeyDown={(e) => handleHandleKeyDown(e, "bandEnd", bandEndMin, bandStartMin + 30, curfewMin)}
                        className="flex h-full w-6 cursor-ew-resize items-center justify-center bg-black/40 hover:bg-black/60 transition-colors"
                        title={`3. SHOW ENDS (${effectiveBandEnd})`}
                      >
                        <div className="flex flex-col items-center gap-0.5">

                          <div className="h-3.5 w-1.5 rounded-full bg-pink-300 shadow-[0_0_8px_#f472b6]" />
                        </div>
                      </div>
                    </div>

                    {/* Post-Show Track */}
                    <div
                      className="relative flex h-full flex-col justify-center overflow-hidden bg-cyan-900/35 border-y border-cyan-500/30 leading-tight [width:var(--post-show-w)] shrink-0"
                      style={{ "--post-show-w": `${postShowWidthPct}%` } as React.CSSProperties}
                    />

                    {/* Handle 4: 4. CURFEW */}
                    <div
                      role="slider"
                      tabIndex={0}
                      aria-label="Drag to adjust Doors Close Time"
                      aria-valuenow={curfewMin}
                      onPointerDown={(e) => startDrag(e, "eventEnd")}
                      onPointerEnter={() => setHoveredHandle("eventEnd")}
                      onPointerLeave={() => setHoveredHandle(null)}
                      onFocus={() => setFocusedHandle("eventEnd")}
                      onBlur={() => setFocusedHandle(null)}
                      onKeyDown={(e) => handleHandleKeyDown(e, "eventEnd", curfewMin, bandEndMin, railEndMinutes)}
                      className="group relative z-30 flex h-full w-7 shrink-0 -ml-3.5 -mr-3.5 cursor-ew-resize items-center justify-center border border-amber-400/60 bg-amber-950 hover:bg-amber-900 transition-colors shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                      title={`4. DOORS CLOSE (${effectiveEventEnd})`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[7.5px] font-black text-amber-300">4</span>
                        <div className="h-3 w-1 rounded-full bg-amber-400 group-hover:bg-amber-200" />
                      </div>
                    </div>

                    {postEventWidthPct > 0 && (
                      <div
                        className="relative flex h-full items-center justify-center bg-black/50 border-l border-white/10 px-1 text-[8px] font-mono text-zinc-400 overflow-hidden leading-tight select-none [width:var(--postev-w)] shrink-0"
                        style={{ "--postev-w": `${postEventWidthPct}%` } as React.CSSProperties}
                      >
                        {postEventWidthPct > 5 && (
                          <span className="truncate tracking-wider opacity-60">
                            {timeFormat === "24h" ? minutesToH24(curfewMin) : effectiveEventEnd}–{timeFormat === "24h" ? "24:00" : "12:00 AM"}
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
                            [SYS: DAYTIME {timeFormat === "24h" ? "00:00" : "12:00 AM"}–{timeFormat === "24h" ? minutesToH24(doorsMin) : effectiveEventStart}]
                          </span>
                        )}
                      </div>
                    )}

                    {/* Node 1: DOORS */}
                    <div
                      role="slider"
                      tabIndex={0}
                      aria-label="Drag to adjust Doors Open Time"
                      aria-valuenow={doorsMin}
                      onPointerDown={(e) => startDrag(e, "eventStart")}
                      onKeyDown={(e) => handleHandleKeyDown(e, "eventStart", doorsMin, railStartMinutes, bandStartMin)}
                      className="z-30 flex h-6 w-6 shrink-0 cursor-ew-resize -rotate-45 items-center justify-center border-2 border-cyan-400 bg-cyan-950 shadow-[0_0_10px_#22d3ee]"
                      title={`1. DOORS OPEN (${effectiveEventStart})`}
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
                      aria-label="Drag to adjust Show Time"
                      aria-valuenow={bandStartMin}
                      onPointerDown={(e) => startDrag(e, "bandStart")}
                      onKeyDown={(e) => handleHandleKeyDown(e, "bandStart", bandStartMin, doorsMin, bandEndMin - 30)}
                      className="z-30 flex h-6 w-6 shrink-0 cursor-ew-resize -rotate-45 items-center justify-center border-2 border-purple-400 bg-purple-900 shadow-[0_0_10px_#c084fc]"
                      title={`2. SHOW TIME (${effectiveBandStart})`}
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
                      aria-label="Drag to adjust Show Ends Time"
                      aria-valuenow={bandEndMin}
                      onPointerDown={(e) => startDrag(e, "bandEnd")}
                      onKeyDown={(e) => handleHandleKeyDown(e, "bandEnd", bandEndMin, bandStartMin + 30, curfewMin)}
                      className="z-30 flex h-6 w-6 shrink-0 cursor-ew-resize -rotate-45 items-center justify-center border-2 border-pink-400 bg-pink-900 shadow-[0_0_10px_#f472b6]"
                      title={`3. SHOW ENDS (${effectiveBandEnd})`}
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
                      aria-label="Drag to adjust Doors Close Time"
                      aria-valuenow={curfewMin}
                      onPointerDown={(e) => startDrag(e, "eventEnd")}
                      onKeyDown={(e) => handleHandleKeyDown(e, "eventEnd", curfewMin, bandEndMin, railEndMinutes)}
                      className="z-30 flex h-6 w-6 shrink-0 cursor-ew-resize -rotate-45 items-center justify-center border-2 border-amber-400 bg-amber-950 shadow-[0_0_10px_#fbbf24]"
                      title={`4. DOORS CLOSE (${effectiveEventEnd})`}
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
                            {timeFormat === "24h" ? minutesToH24(curfewMin) : effectiveEventEnd}–{timeFormat === "24h" ? "24:00" : "12:00 AM"}
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
                        aria-label="Drag to adjust Doors Open Time"
                        aria-valuenow={doorsMin}
                        onPointerDown={(e) => startDrag(e, "eventStart")}
                        onKeyDown={(e) => handleHandleKeyDown(e, "eventStart", doorsMin, railStartMinutes, bandStartMin)}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 cursor-ew-resize flex flex-col items-center [left:var(--spot-left)]"
                        style={{ "--spot-left": `${doorsPct}%` } as React.CSSProperties}
                        title={`1. DOORS OPEN (${effectiveEventStart})`}
                      >
                        <div className="h-4 w-4 rounded-full border border-cyan-300 bg-cyan-700 shadow-[0_0_10px_#22d3ee] flex items-center justify-center text-[7px] font-black text-cyan-100">1</div>
                      </div>

                      {/* Spotlight 2: Showtime */}
                      <div
                        role="slider"
                        tabIndex={0}
                        aria-label="Drag to adjust Show Time"
                        aria-valuenow={bandStartMin}
                        onPointerDown={(e) => startDrag(e, "bandStart")}
                        onKeyDown={(e) => handleHandleKeyDown(e, "bandStart", bandStartMin, doorsMin, bandEndMin - 30)}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 cursor-ew-resize flex flex-col items-center [left:var(--spot-left)]"
                        style={{ "--spot-left": `${bandStartPct}%` } as React.CSSProperties}
                        title={`2. SHOW TIME (${effectiveBandStart})`}
                      >
                        <div className="h-4 w-4 rounded-full border border-purple-300 bg-purple-600 shadow-[0_0_10px_#c084fc] flex items-center justify-center text-[7px] font-black text-purple-100">2</div>
                      </div>

                      {/* Spotlight 3: Curtain Call / Encore */}
                      <div
                        role="slider"
                        tabIndex={0}
                        aria-label="Drag to adjust Show Ends Time"
                        aria-valuenow={bandEndMin}
                        onPointerDown={(e) => startDrag(e, "bandEnd")}
                        onKeyDown={(e) => handleHandleKeyDown(e, "bandEnd", bandEndMin, bandStartMin + 30, curfewMin)}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 cursor-ew-resize flex flex-col items-center [left:var(--spot-left)]"
                        style={{ "--spot-left": `${bandEndPct}%` } as React.CSSProperties}
                        title={`3. SHOW ENDS (${effectiveBandEnd})`}
                      >
                        <div className="h-4 w-4 rounded-full border border-pink-300 bg-pink-600 shadow-[0_0_10px_#f472b6] flex items-center justify-center text-[7px] font-black text-pink-100">3</div>
                      </div>

                      {/* Spotlight 4: Curfew */}
                      <div
                        role="slider"
                        tabIndex={0}
                        aria-label="Drag to adjust Doors Close Time"
                        aria-valuenow={curfewMin}
                        onPointerDown={(e) => startDrag(e, "eventEnd")}
                        onKeyDown={(e) => handleHandleKeyDown(e, "eventEnd", curfewMin, bandEndMin, railEndMinutes)}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 cursor-ew-resize flex flex-col items-center [left:var(--spot-left)]"
                        style={{ "--spot-left": `${curfewPct}%` } as React.CSSProperties}
                        title={`4. DOORS CLOSE (${effectiveEventEnd})`}
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
                      aria-label="Drag to adjust Doors Open Time"
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
                      aria-label="Drag to adjust Show Time"
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
                      aria-label="Drag to adjust Show Ends Time"
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
                      aria-label="Drag to adjust Doors Close Time"
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
                            DAYTIME ({timeFormat === "24h" ? "00:00" : "12:00 AM"} – {timeFormat === "24h" ? minutesToH24(doorsMin) : effectiveEventStart})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Tape Head 1: Doors */}
                    <div
                      role="slider"
                      tabIndex={0}
                      aria-label="Drag to adjust Doors Open Time"
                      aria-valuenow={doorsMin}
                      onPointerDown={(e) => startDrag(e, "eventStart")}
                      onKeyDown={(e) => handleHandleKeyDown(e, "eventStart", doorsMin, railStartMinutes, bandStartMin)}
                      className="z-30 flex h-full w-7 shrink-0 -ml-3.5 -mr-3.5 cursor-ew-resize items-center justify-center bg-cyan-950/80 border border-cyan-400/50 hover:bg-cyan-800 transition-colors"
                      title={`1. DOORS OPEN (${effectiveEventStart})`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
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
                      className="group relative flex h-full [width:var(--clip-w)] shrink-0 cursor-grab active:cursor-grabbing items-center justify-between border border-amber-400/60 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 px-0.5 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                      style={{ "--clip-w": `${clipWidthPct}%` } as React.CSSProperties}
                    >
                      <div
                        role="slider"
                        tabIndex={0}
                        aria-label="Drag to adjust Show Time"
                        aria-valuenow={bandStartMin}
                        onPointerDown={(e) => startDrag(e, "bandStart")}
                        onKeyDown={(e) => handleHandleKeyDown(e, "bandStart", bandStartMin, doorsMin, bandEndMin - 30)}
                        className="flex h-full w-6 cursor-ew-resize items-center justify-center bg-black/40 hover:bg-black/60"
                        title={`2. SHOW TIME (${effectiveBandStart})`}
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
                        aria-label="Drag to adjust Show Ends Time"
                        aria-valuenow={bandEndMin}
                        onPointerDown={(e) => startDrag(e, "bandEnd")}
                        onKeyDown={(e) => handleHandleKeyDown(e, "bandEnd", bandEndMin, bandStartMin + 30, curfewMin)}
                        className="flex h-full w-6 cursor-ew-resize items-center justify-center bg-black/40 hover:bg-black/60"
                        title={`3. SHOW ENDS (${effectiveBandEnd})`}
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
                      aria-label="Drag to adjust Doors Close Time"
                      aria-valuenow={curfewMin}
                      onPointerDown={(e) => startDrag(e, "eventEnd")}
                      onKeyDown={(e) => handleHandleKeyDown(e, "eventEnd", curfewMin, bandEndMin, railEndMinutes)}
                      className="z-30 flex h-full w-7 shrink-0 -ml-3.5 -mr-3.5 cursor-ew-resize items-center justify-center bg-amber-950/80 border border-amber-400/50 hover:bg-amber-800 transition-colors"
                      title={`4. DOORS CLOSE (${effectiveEventEnd})`}
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
                            {timeFormat === "24h" ? minutesToH24(curfewMin) : effectiveEventEnd}–{timeFormat === "24h" ? "24:00" : "12:00 AM"}
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
                        className="flex h-full items-center justify-center rounded-lg border border-white/5 bg-black/40 px-2 text-[8.5px] font-mono text-zinc-400 overflow-hidden leading-tight select-none [width:var(--preev-w)] shrink-0"
                        style={{ "--preev-w": `${preEventWidthPct}%` } as React.CSSProperties}
                      >
                        {preEventWidthPct > 15 && (
                          <span className="truncate tracking-wider opacity-60">
                            DAY ({timeFormat === "24h" ? "00:00" : "12:00 AM"}–{timeFormat === "24h" ? minutesToH24(doorsMin) : effectiveEventStart})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Splitter 1: Doors */}
                    <div
                      role="slider"
                      tabIndex={0}
                      aria-label="Drag to adjust Doors Open Time"
                      aria-valuenow={doorsMin}
                      onPointerDown={(e) => startDrag(e, "eventStart")}
                      onKeyDown={(e) => handleHandleKeyDown(e, "eventStart", doorsMin, railStartMinutes, bandStartMin)}
                      className="flex h-full w-7 shrink-0 -ml-3.5 -mr-3.5 cursor-ew-resize items-center justify-center rounded-lg border border-cyan-400/60 bg-cyan-950/80 shadow-[0_0_10px_#22d3ee]"
                      title={`1. DOORS OPEN (${effectiveEventStart})`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
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
                      aria-label="Drag to adjust Show Time"
                      aria-valuenow={bandStartMin}
                      onPointerDown={(e) => startDrag(e, "bandStart")}
                      onKeyDown={(e) => handleHandleKeyDown(e, "bandStart", bandStartMin, doorsMin, bandEndMin - 30)}
                      className="flex h-full w-7 shrink-0 -ml-3.5 -mr-3.5 cursor-ew-resize items-center justify-center rounded-lg border border-purple-400/60 bg-purple-900/80 shadow-[0_0_10px_#a855f7]"
                      title={`2. SHOW TIME (${effectiveBandStart})`}
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
                      aria-label="Drag to adjust Show Ends Time"
                      aria-valuenow={bandEndMin}
                      onPointerDown={(e) => startDrag(e, "bandEnd")}
                      onKeyDown={(e) => handleHandleKeyDown(e, "bandEnd", bandEndMin, bandStartMin + 30, curfewMin)}
                      className="flex h-full w-7 shrink-0 -ml-3.5 -mr-3.5 cursor-ew-resize items-center justify-center rounded-lg border border-pink-400/60 bg-pink-900/80 shadow-[0_0_10px_#ec4899]"
                      title={`3. SHOW ENDS (${effectiveBandEnd})`}
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
                      aria-label="Drag to adjust Doors Close Time"
                      aria-valuenow={curfewMin}
                      onPointerDown={(e) => startDrag(e, "eventEnd")}
                      onKeyDown={(e) => handleHandleKeyDown(e, "eventEnd", curfewMin, bandEndMin, railEndMinutes)}
                      className="flex h-full w-7 shrink-0 -ml-3.5 -mr-3.5 cursor-ew-resize items-center justify-center rounded-lg border border-amber-400/60 bg-amber-950/80 shadow-[0_0_10px_#fbbf24]"
                      title={`4. DOORS CLOSE (${effectiveEventEnd})`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[7.5px] font-black text-amber-300">4</span>
                        <div className="h-3 w-1 rounded-full bg-amber-400" />
                      </div>
                    </div>

                    {/* Late Night / Inactive Post-Event Track (Curfew to 24:00) */}
                    {postEventWidthPct > 0 && (
                      <div
                        className="flex h-full items-center justify-center rounded-lg border border-white/5 bg-black/40 px-1 text-[8px] font-mono text-zinc-400 overflow-hidden leading-tight select-none [width:var(--postev-w)] shrink-0"
                        style={{ "--postev-w": `${postEventWidthPct}%` } as React.CSSProperties}
                      >
                        {postEventWidthPct > 5 && (
                          <span className="truncate tracking-wider opacity-60">
                            {timeFormat === "24h" ? minutesToH24(curfewMin) : effectiveEventEnd}–{timeFormat === "24h" ? "24:00" : "12:00 AM"}
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
                      aria-label="Drag to adjust Doors Open Time"
                      aria-valuenow={doorsMin}
                      onPointerDown={(e) => startDrag(e, "eventStart")}
                      onKeyDown={(e) => handleHandleKeyDown(e, "eventStart", doorsMin, railStartMinutes, bandStartMin)}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 cursor-ew-resize flex h-7 w-7 items-center justify-center rounded-md border border-cyan-400 bg-cyan-950 shadow-[0_0_10px_#22d3ee] [left:var(--knob-left)]"
                      style={{ "--knob-left": `${doorsPct}%` } as React.CSSProperties}
                      title={`1. DOORS OPEN (${effectiveEventStart})`}
                    >
                      <span className="text-[8px] font-black text-cyan-300">1</span>
                    </div>

                    {/* Fader 2: Showtime */}
                    <div
                      role="slider"
                      tabIndex={0}
                      aria-label="Drag to adjust Show Time"
                      aria-valuenow={bandStartMin}
                      onPointerDown={(e) => startDrag(e, "bandStart")}
                      onKeyDown={(e) => handleHandleKeyDown(e, "bandStart", bandStartMin, doorsMin, bandEndMin - 30)}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-40 cursor-ew-resize flex h-7 w-8 items-center justify-center rounded-md border border-purple-400 bg-purple-900 shadow-[0_0_10px_#a855f7] [left:var(--knob-left)]"
                      style={{ "--knob-left": `${bandStartPct}%` } as React.CSSProperties}
                      title={`2. SHOW TIME (${effectiveBandStart})`}
                    >
                      <span className="text-[8px] font-black text-purple-200">2</span>
                    </div>

                    {/* Fader 3: Encore */}
                    <div
                      role="slider"
                      tabIndex={0}
                      aria-label="Drag to adjust Show Ends Time"
                      aria-valuenow={bandEndMin}
                      onPointerDown={(e) => startDrag(e, "bandEnd")}
                      onKeyDown={(e) => handleHandleKeyDown(e, "bandEnd", bandEndMin, bandStartMin + 30, curfewMin)}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-40 cursor-ew-resize flex h-7 w-8 items-center justify-center rounded-md border border-pink-400 bg-pink-900 shadow-[0_0_10px_#ec4899] [left:var(--knob-left)]"
                      style={{ "--knob-left": `${bandEndPct}%` } as React.CSSProperties}
                      title={`3. SHOW ENDS (${effectiveBandEnd})`}
                    >
                      <span className="text-[8px] font-black text-pink-200">3</span>
                    </div>

                    {/* Fader 4: Curfew */}
                    <div
                      role="slider"
                      tabIndex={0}
                      aria-label="Drag to adjust Doors Close Time"
                      aria-valuenow={curfewMin}
                      onPointerDown={(e) => startDrag(e, "eventEnd")}
                      onKeyDown={(e) => handleHandleKeyDown(e, "eventEnd", curfewMin, bandEndMin, railEndMinutes)}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 cursor-ew-resize flex h-7 w-7 items-center justify-center rounded-md border border-amber-400 bg-amber-950 shadow-[0_0_10px_#fbbf24] [left:var(--knob-left)]"
                      style={{ "--knob-left": `${curfewPct}%` } as React.CSSProperties}
                      title={`4. DOORS CLOSE (${effectiveEventEnd})`}
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
                            DAY ({timeFormat === "24h" ? "00:00" : "12:00 AM"}–{timeFormat === "24h" ? minutesToH24(doorsMin) : effectiveEventStart})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bubble 1: Doors */}
                    <div
                      role="slider"
                      tabIndex={0}
                      aria-label="Drag to adjust Doors Open Time"
                      aria-valuenow={doorsMin}
                      onPointerDown={(e) => startDrag(e, "eventStart")}
                      onKeyDown={(e) => handleHandleKeyDown(e, "eventStart", doorsMin, railStartMinutes, bandStartMin)}
                      className="z-30 flex h-6 w-6 shrink-0 cursor-ew-resize items-center justify-center rounded-full border-2 border-cyan-300 bg-cyan-700 shadow-[0_0_15px_#22d3ee]"
                      title={`1. DOORS OPEN (${effectiveEventStart})`}
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
                      aria-label="Drag to adjust Show Time"
                      aria-valuenow={bandStartMin}
                      onPointerDown={(e) => startDrag(e, "bandStart")}
                      onKeyDown={(e) => handleHandleKeyDown(e, "bandStart", bandStartMin, doorsMin, bandEndMin - 30)}
                      className="z-30 flex h-6 w-6 shrink-0 cursor-ew-resize items-center justify-center rounded-full border-2 border-white bg-purple-600 shadow-[0_0_15px_#c084fc]"
                      title={`2. SHOW TIME (${effectiveBandStart})`}
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
                      aria-label="Drag to adjust Show Ends Time"
                      aria-valuenow={bandEndMin}
                      onPointerDown={(e) => startDrag(e, "bandEnd")}
                      onKeyDown={(e) => handleHandleKeyDown(e, "bandEnd", bandEndMin, bandStartMin + 30, curfewMin)}
                      className="z-30 flex h-6 w-6 shrink-0 cursor-ew-resize items-center justify-center rounded-full border-2 border-white bg-pink-600 shadow-[0_0_15px_#f472b6]"
                      title={`3. SHOW ENDS (${effectiveBandEnd})`}
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
                      aria-label="Drag to adjust Doors Close Time"
                      aria-valuenow={curfewMin}
                      onPointerDown={(e) => startDrag(e, "eventEnd")}
                      onKeyDown={(e) => handleHandleKeyDown(e, "eventEnd", curfewMin, bandEndMin, railEndMinutes)}
                      className="z-30 flex h-6 w-6 shrink-0 cursor-ew-resize items-center justify-center rounded-full border-2 border-amber-300 bg-amber-700 shadow-[0_0_15px_#fbbf24]"
                      title={`4. DOORS CLOSE (${effectiveEventEnd})`}
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
                            {timeFormat === "24h" ? minutesToH24(curfewMin) : effectiveEventEnd}–{timeFormat === "24h" ? "24:00" : "12:00 AM"}
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
                            className={`absolute top-0 -translate-x-1/2 rounded-full ${isMajor
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

                    {/* Hourly Numbers (All 24 Hours: 12 AM to 12 AM / 00 to 24) */}
                    <div className="relative w-full h-5 mt-0.5">
                      {ALL_24H_HOURLY_TICKS.map((tick, idx) => {
                        const alignClass = "-translate-x-1/2 text-center";
                        const isQuarter = idx % 6 === 0;
                        const isMid = idx % 3 === 0;
                        return (
                          <div
                            key={tick.hour}
                            aria-label={timeFormat === "24h" ? tick.label24 : tick.label12}
                            data-hour={tick.hour}
                            className={`absolute top-0 font-mono tracking-tight whitespace-nowrap ${alignClass} ${isQuarter
                              ? "text-[8.5px] sm:text-[9.5px] md:text-[10.5px] font-bold text-zinc-200"
                              : isMid
                                ? "text-[7.5px] sm:text-[8.5px] md:text-[9.5px] font-medium text-zinc-400"
                                : "text-[7px] sm:text-[8px] md:text-[9px] font-normal text-zinc-400"
                              } [left:var(--lbl-x)]`}
                            style={{ "--lbl-x": `${tick.pct}%` } as React.CSSProperties}
                          >
                            {timeFormat === "24h" ? (
                              <span
                                className={
                                  isQuarter
                                    ? "font-bold text-zinc-100 text-[10px] sm:text-[11px]"
                                    : isMid
                                      ? "font-semibold text-zinc-300 text-[9px] sm:text-[9.5px]"
                                      : "text-zinc-400 text-[8px] sm:text-[8.5px]"
                                }
                              >
                                {tick.label24}
                              </span>
                            ) : isQuarter ? (
                              <div className="flex flex-col items-center leading-[1.0] -mt-0.5">
                                <span className="font-bold text-zinc-100 text-[9.5px] sm:text-[10.5px]">{tick.hourNum}</span>
                                <span className="font-bold text-zinc-400 text-[6.5px] sm:text-[7px] tracking-tight">{tick.period}</span>
                              </div>
                            ) : (
                              <span
                                className={
                                  isMid
                                    ? "font-semibold text-zinc-300 text-[8.5px] sm:text-[9.5px]"
                                    : "font-normal text-zinc-400 text-[7.5px] sm:text-[8.5px]"
                                }
                              >
                                {tick.hourNum}
                              </span>
                            )}
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
                      {focusWindow.ticks.map((tick) => {
                        const alignClass = "-translate-x-1/2 text-center";
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

              {/* Active Time-Picking Guidelines & Realtime Badges */}
              {pickingGuides.map((guide) => (
                <div
                  key={guide.key}
                  className="absolute inset-y-0 w-0.5 pointer-events-none z-40 [left:var(--pick-x)]"
                  style={{ "--pick-x": `${guide.pct}%` } as React.CSSProperties}
                >
                  {/* Vertical Laser Guideline */}
                  <div className={`absolute inset-y-0 w-0.5 -translate-x-1/2 ${guide.lineClass}`} />

                  {/* Floating Time Badge */}
                  <div
                    className={`absolute -top-7 flex items-center gap-1.5 rounded-md px-2 py-0.5 border text-xs font-mono font-bold shadow-2xl whitespace-nowrap ${guide.badgeAlign} ${guide.badgeClass}`}
                  >
                    <span className="text-xs uppercase tracking-wider opacity-75">{guide.label}</span>
                    <span className="font-extrabold text-white">{guide.time}</span>
                    <div
                      className={`absolute -bottom-1 h-1.5 w-1.5 rotate-45 border-r border-b border-inherit bg-inherit ${guide.caretClass}`}
                    />
                  </div>

                  {/* Intersection Pip at Ruler Ticks Level */}
                  <div className={`absolute bottom-6 h-2 w-2 -translate-x-1/2 rounded-full ${guide.pipClass}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* BOTTOM DECK: 4 LUXURY CONCERT PHASE CARDS                   */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">

          {/* Card 1: DOORS OPEN */}
          <div className="relative">
            <button
              type="button"
              id="dual-bar-doors-btn"
              aria-haspopup="listbox"
              aria-expanded={openTimeline === "eventStart"}
              onClick={() => setOpenTimeline(openTimeline === "eventStart" ? null : "eventStart")}
              className={`group flex w-full cursor-pointer flex-col gap-2 rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${openTimeline === "eventStart"
                ? "border-cyan-400 bg-cyan-950/70 shadow-[0_0_25px_rgba(34,211,238,0.4)]"
                : "border-white/15 bg-white/[0.04] hover:border-cyan-400/60 hover:bg-white/[0.08] hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
                }`}
            >
              {/* Card Header: Step Tag + Rotating Chevron */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300">
                    1. DOORS OPEN:
                  </span>
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-cyan-300 transition-all group-hover:bg-cyan-500/20">
                  <DotChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${openTimeline === "eventStart" ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* Card Center: Large High-Contrast Time */}
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black tracking-tight text-white drop-shadow-sm">
                  {effectiveEventStart}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 group-hover:text-cyan-200/80">
                  Arrival
                </span>
              </div>

              {/* Card Footer: Subtitle */}
              <div className="flex items-center gap-1.5 pt-1.5 border-t border-white/10">
                <span className="text-[11px] font-medium text-zinc-300 truncate">
                  Guests Arrive
                </span>
              </div>
            </button>
            {renderDropdown("eventStart", effectiveEventStart, "Select Doors Open Time")}
          </div>

          {/* Card 2: SHOW TIME (MAIN EVENT) */}
          <div className="relative">
            <button
              type="button"
              id="dual-bar-showtime-btn"
              aria-haspopup="listbox"
              aria-expanded={openTimeline === "bandStart"}
              onClick={() => setOpenTimeline(openTimeline === "bandStart" ? null : "bandStart")}
              className={`group flex w-full cursor-pointer flex-col gap-2 rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${openTimeline === "bandStart"
                ? "border-pink-400 bg-gradient-to-b from-purple-950/80 to-pink-950/70 shadow-[0_0_30px_rgba(236,72,153,0.5)]"
                : "border-pink-500/50 bg-pink-950/20 hover:border-pink-400 hover:bg-pink-950/40 hover:shadow-[0_8px_24px_rgba(236,72,153,0.3)]"
                }`}
            >
              {/* Card Header: Step Tag + Main Event Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-pink-400 shadow-[0_0_8px_#f472b6] animate-pulse" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-pink-300">
                    2. SHOW TIME:
                  </span>
                </div>
                <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-pink-200 border border-pink-400/40 shadow-sm">
                  Live Set
                </span>
              </div>

              {/* Card Center: Large High-Contrast Time */}
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black tracking-tight text-white drop-shadow-sm">
                  {effectiveBandStart}
                </span>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-500/20 text-pink-200 transition-all group-hover:bg-pink-500/30">
                  <DotChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${openTimeline === "bandStart" ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* Card Footer: Subtitle */}
              <div className="flex items-center gap-1.5 pt-1.5 border-t border-white/10">
                <span className="text-[11px] font-medium text-pink-200/90 truncate">
                  Live Show Starts
                </span>
              </div>
            </button>
            {renderDropdown("bandStart", effectiveBandStart, "Select Show Time")}
          </div>

          {/* Card 3: SHOW ENDS */}
          <div className="relative">
            <button
              type="button"
              id="dual-bar-encore-btn"
              aria-haspopup="listbox"
              aria-expanded={openTimeline === "bandEnd"}
              onClick={() => setOpenTimeline(openTimeline === "bandEnd" ? null : "bandEnd")}
              className={`group flex w-full cursor-pointer flex-col gap-2 rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${openTimeline === "bandEnd"
                ? "border-purple-400 bg-purple-950/70 shadow-[0_0_25px_rgba(168,85,247,0.4)]"
                : "border-purple-500/40 bg-purple-950/20 hover:border-purple-400 hover:bg-purple-950/40 hover:shadow-[0_8px_24px_rgba(168,85,247,0.3)]"
                }`}
            >
              {/* Card Header: Step Tag + Rotating Chevron */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-300">
                    3. SHOW ENDS:
                  </span>
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-purple-300 transition-all group-hover:bg-purple-500/20">
                  <DotChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${openTimeline === "bandEnd" ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* Card Center: Large High-Contrast Time */}
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black tracking-tight text-white drop-shadow-sm">
                  {effectiveBandEnd}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 group-hover:text-purple-200/80">
                  Encore
                </span>
              </div>

              {/* Card Footer: Subtitle */}
              <div className="flex items-center gap-1.5 pt-1.5 border-t border-white/10">
                <span className="text-[11px] font-medium text-zinc-300 truncate">
                  Final Bows
                </span>
              </div>
            </button>
            {renderDropdown("bandEnd", effectiveBandEnd, "Select Show Ends Time", true)}
          </div>

          {/* Card 4: DOORS CLOSE */}
          <div className="relative">
            <button
              type="button"
              id="dual-bar-curfew-btn"
              aria-haspopup="listbox"
              aria-expanded={openTimeline === "eventEnd"}
              onClick={() => setOpenTimeline(openTimeline === "eventEnd" ? null : "eventEnd")}
              className={`group flex w-full cursor-pointer flex-col gap-2 rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${openTimeline === "eventEnd"
                ? "border-amber-400 bg-amber-950/70 shadow-[0_0_25px_rgba(251,191,36,0.4)]"
                : "border-white/15 bg-white/[0.04] hover:border-amber-400/60 hover:bg-white/[0.08] hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
                }`}
            >
              {/* Card Header: Step Tag + Rotating Chevron */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                    4. DOORS CLOSE:
                  </span>
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-amber-300 transition-all group-hover:bg-amber-500/20">
                  <DotChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${openTimeline === "eventEnd" ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* Card Center: Large High-Contrast Time */}
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black tracking-tight text-white drop-shadow-sm">
                  {effectiveEventEnd}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 group-hover:text-amber-200/80">
                  Curfew
                </span>
              </div>

              {/* Card Footer: Subtitle */}
              <div className="flex items-center gap-1.5 pt-1.5 border-t border-white/10">
                <span className="text-[11px] font-medium text-zinc-300 truncate">
                  Party Concludes
                </span>
              </div>
            </button>
            {renderDropdown("eventEnd", effectiveEventEnd, "Select Doors Close Time", true)}
          </div>
        </div>

      </div>
    </div>
  );
}
