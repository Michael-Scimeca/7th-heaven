"use client";

import React, { useState, useRef, useCallback } from "react";
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
} from "lucide-react";

export const DRAG_SETUPS = [
  {
    id: 1,
    name: "1. DAW Clip & Range Drag",
    badge: "Most Popular",
    desc: "Drag the glowing live concert clip, stretch start/end handles, or slide the whole set across the evening",
  },
  {
    id: 2,
    name: "2. Magnetic Milestone Pins",
    badge: "Precision Snapping",
    desc: "4 tactile glowing pins along a laser time ruler with magnetic 15-min snapping and floating live HUD",
  },
  {
    id: 3,
    name: "3. Dual-Divider Elastic Rail",
    badge: "Proportional Split",
    desc: "Continuous multi-zone bar with draggable ribbed dividers between reception, live show, and wrap",
  },
  {
    id: 4,
    name: "4. Pro DJ Mixer Faders",
    badge: "Studio Console",
    desc: "Twin tactile horizontal console faders with LED dB level strips for Showtime and Curtain Call",
  },
  {
    id: 5,
    name: "5. Waveform Scrub Ribbon",
    badge: "Live Audio Visualizer",
    desc: "Concert soundwave with glowing laser playheads and draggable performance bracket",
  },
] as const;

export type DragSetupId = (typeof DRAG_SETUPS)[number]["id"];

// Time scale: 2:00 PM (14:00 = 840 mins) to 2:00 AM next day (26:00 = 1560 mins)
const RAIL_START_MINUTES = 14 * 60; // 840
const RAIL_END_MINUTES = 26 * 60; // 1560
const TOTAL_SPAN_MINUTES = RAIL_END_MINUTES - RAIL_START_MINUTES; // 720 mins (12h)

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
  // If AM (12:00 AM - 5:59 AM), map to evening next day
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

export function minutesToPct(mins: number): number {
  const clamped = Math.max(RAIL_START_MINUTES, Math.min(RAIL_END_MINUTES, mins));
  return ((clamped - RAIL_START_MINUTES) / TOTAL_SPAN_MINUTES) * 100;
}

export function formatDurationLabel(minutes: number, label: string = ""): string {
  const hours = minutes / 60;
  const formatted = Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
  return label ? `${formatted} ${label}` : formatted;
}

interface DraggableTimelineProps {
  layoutId: DragSetupId;
  effectiveEventStart: string;
  effectiveBandStart: string;
  effectiveBandEnd: string;
  effectiveEventEnd: string;
  handleSelectTimelineTime: (stage: string, t: string) => void;
  bandLiveMinutes: number;
  totalEventMinutes: number;
  preShowMinutes: number;
  postShowMinutes: number;
}

type DragTarget = "eventStart" | "bandStart" | "bandEnd" | "eventEnd" | "clipShift";

export function DraggableTimelineSetups({
  layoutId,
  effectiveEventStart,
  effectiveBandStart,
  effectiveBandEnd,
  effectiveEventEnd,
  handleSelectTimelineTime,
  bandLiveMinutes,
  totalEventMinutes,
  preShowMinutes,
  postShowMinutes,
}: DraggableTimelineProps) {
  // Convert current props to numerical minutes
  const doorsMin = parseEveningMinutes(effectiveEventStart, 18); // 6:00 PM
  const bandStartMin = parseEveningMinutes(effectiveBandStart, 19.5); // 7:30 PM
  const bandEndMin = parseEveningMinutes(effectiveBandEnd, 22.5); // 10:30 PM
  const curfewMin = parseEveningMinutes(effectiveEventEnd, 23.5); // 11:30 PM

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

  const railRef = useRef<HTMLDivElement>(null);

  // Compute positions
  const doorsPct = minutesToPct(doorsMin);
  const bandStartPct = minutesToPct(bandStartMin);
  const bandEndPct = minutesToPct(bandEndMin);
  const curfewPct = minutesToPct(curfewMin);
  const clipWidthPct = Math.max(4, bandEndPct - bandStartPct);

  // Pointer drag initialization
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

  // Handle pointer move while dragging
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!activeDrag || !railRef.current) return;
      const rect = railRef.current.getBoundingClientRect();
      const deltaX = e.clientX - activeDrag.startX;
      const deltaMinutes = (deltaX / rect.width) * TOTAL_SPAN_MINUTES;

      if (activeDrag.target === "bandStart") {
        const newMinutes = snap15(
          Math.max(activeDrag.initialDoors, Math.min(activeDrag.initialBandEnd - 45, activeDrag.initialBandStart + deltaMinutes))
        );
        const timeStr = minutesToTimeStr(newMinutes);
        setActiveDrag((prev) => (prev ? { ...prev, currentHoverTime: timeStr } : null));
        handleSelectTimelineTime("bandStart", timeStr);
      } else if (activeDrag.target === "bandEnd") {
        const newMinutes = snap15(
          Math.max(activeDrag.initialBandStart + 45, Math.min(activeDrag.initialCurfew, activeDrag.initialBandEnd + deltaMinutes))
        );
        const timeStr = minutesToTimeStr(newMinutes);
        setActiveDrag((prev) => (prev ? { ...prev, currentHoverTime: timeStr } : null));
        handleSelectTimelineTime("bandEnd", timeStr);
      } else if (activeDrag.target === "eventStart") {
        const newMinutes = snap15(
          Math.max(RAIL_START_MINUTES, Math.min(activeDrag.initialBandStart, activeDrag.initialDoors + deltaMinutes))
        );
        const timeStr = minutesToTimeStr(newMinutes);
        setActiveDrag((prev) => (prev ? { ...prev, currentHoverTime: timeStr } : null));
        handleSelectTimelineTime("eventStart", timeStr);
      } else if (activeDrag.target === "eventEnd") {
        const newMinutes = snap15(
          Math.max(activeDrag.initialBandEnd, Math.min(RAIL_END_MINUTES, activeDrag.initialCurfew + deltaMinutes))
        );
        const timeStr = minutesToTimeStr(newMinutes);
        setActiveDrag((prev) => (prev ? { ...prev, currentHoverTime: timeStr } : null));
        handleSelectTimelineTime("eventEnd", timeStr);
      } else if (activeDrag.target === "clipShift") {
        // Shift entire live set maintaining duration
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
    [activeDrag, handleSelectTimelineTime]
  );

  const endDrag = useCallback(() => {
    setActiveDrag(null);
  }, []);

  // Quick nudges
  const nudgeSet = (deltaMin: number) => {
    const duration = bandEndMin - bandStartMin;
    const newStart = Math.max(doorsMin, Math.min(curfewMin - duration, bandStartMin + deltaMin));
    const newEnd = newStart + duration;
    handleSelectTimelineTime("bandStart", minutesToTimeStr(newStart));
    handleSelectTimelineTime("bandEnd", minutesToTimeStr(newEnd));
  };

  const adjustLength = (deltaMin: number) => {
    const newEnd = Math.max(bandStartMin + 45, Math.min(curfewMin, bandEndMin + deltaMin));
    handleSelectTimelineTime("bandEnd", minutesToTimeStr(newEnd));
  };

  const resetToStandard = () => {
    handleSelectTimelineTime("eventStart", "6:00 PM");
    handleSelectTimelineTime("bandStart", "7:30 PM");
    handleSelectTimelineTime("bandEnd", "10:30 PM");
    handleSelectTimelineTime("eventEnd", "11:30 PM");
  };

  // Hour tick marks for the ruler (4 PM, 6 PM, 8 PM, 10 PM, 12 AM)
  const rulerTicks = [
    { label: "4 PM", mins: 16 * 60 },
    { label: "6 PM", mins: 18 * 60 },
    { label: "8 PM", mins: 20 * 60 },
    { label: "10 PM", mins: 22 * 60 },
    { label: "12 AM", mins: 24 * 60 },
  ];

  return (
    <div
      ref={railRef}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className="relative select-none"
    >
      {/* Active Drag Floating Tooltip HUD */}
      {activeDrag && (
        <div className="pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-purple-400/50 bg-[#0d1322]/95 px-5 py-2.5 shadow-[0_0_30px_rgba(168,85,247,0.6)] backdrop-blur-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <span className="flex h-2 w-2 animate-ping rounded-full bg-pink-400" />
            <span className="text-purple-300 uppercase tracking-wider">
              {activeDrag.target === "clipShift" ? "Sliding Live Set" : `Adjusting ${activeDrag.target}`}:
            </span>
            <span className="font-mono text-sm text-pink-300">{activeDrag.currentHoverTime}</span>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SETUP 1: DAW Performance Clip & Range Drag                  */}
      {/* ============================================================ */}
      {layoutId === 1 && (
        <div className="flex flex-col gap-4 rounded-3xl border border-white/20 bg-gradient-to-b from-[#0e1320]/95 to-[#070a12]/95 p-5 sm:p-6 backdrop-blur-2xl">
          {/* Top Arranger Header & Interactive Help */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300">
                <Sliders className="h-3.5 w-3.5" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  DAW Arranger Live Set Track
                </span>
                <span className="block text-[11px] text-white/50">
                  Drag the center to slide concert • Drag left/right handles to resize
                </span>
              </div>
            </div>

            {/* Quick Nudge Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => nudgeSet(-30)}
                aria-label="Shift live concert 30 minutes earlier"
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/70 hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft className="h-3 w-3" /> Earlier
              </button>
              <button
                type="button"
                onClick={() => nudgeSet(30)}
                aria-label="Shift live concert 30 minutes later"
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/70 hover:bg-white/10 hover:text-white"
              >
                Later <ChevronRight className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => adjustLength(30)}
                aria-label="Extend live concert by 30 minutes"
                className="flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-semibold text-purple-300 hover:bg-purple-500/20"
              >
                +30m Set
              </button>
              <button
                type="button"
                onClick={resetToStandard}
                aria-label="Reset timeline to standard 3-hour set"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white"
                title="Reset to 7:30 PM - 10:30 PM"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Time Ruler (Hour Markings) */}
          <div className="relative h-5 w-full text-[10px] font-mono text-white/40">
            {rulerTicks.map((tick) => {
              const tickPct = minutesToPct(tick.mins);
              return (
                <div
                  key={tick.label}
                  className="absolute -translate-x-1/2 flex flex-col items-center [left:var(--tick-left)]"
                  style={{ "--tick-left": `${tickPct}%` } as React.CSSProperties}
                >
                  <span className="h-1.5 w-px bg-white/20" />
                  <span>{tick.label}</span>
                </div>
              );
            })}
          </div>

          {/* Master Timeline Track */}
          <div className="relative h-24 w-full overflow-hidden rounded-2xl border border-white/15 bg-black/60 shadow-inner">
            {/* Event Window Backdrop (Doors to Curfew) */}
            <div
              className="absolute top-0 bottom-0 border-x border-cyan-400/30 bg-cyan-950/20 [left:var(--win-left)] [width:var(--win-width)]"
              style={
                {
                  "--win-left": `${doorsPct}%`,
                  "--win-width": `${curfewPct - doorsPct}%`,
                } as React.CSSProperties
              }
            >
              <div className="absolute top-1 left-2 text-[9px] font-bold text-cyan-400 uppercase tracking-widest">
                Doors: {effectiveEventStart}
              </div>
              <div className="absolute top-1 right-2 text-[9px] font-bold text-cyan-400 uppercase tracking-widest">
                Curfew: {effectiveEventEnd}
              </div>
            </div>

            {/* Draggable 7th Heaven Live Set Audio Clip */}
            <div
              onPointerDown={(e) => startDrag(e, "clipShift")}
              className={`absolute top-2 bottom-2 z-20 flex cursor-grab active:cursor-grabbing items-center justify-between rounded-xl border border-purple-400/60 bg-gradient-to-r from-purple-700/90 via-pink-600/90 to-purple-700/90 shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-shadow hover:shadow-[0_0_35px_rgba(217,70,239,0.7)] [left:var(--clip-left)] [width:var(--clip-width)] ${
                activeDrag?.target === "clipShift" ? "ring-2 ring-pink-400 scale-[1.01]" : ""
              }`}
              style={
                {
                  "--clip-left": `${bandStartPct}%`,
                  "--clip-width": `${clipWidthPct}%`,
                } as React.CSSProperties
              }
            >
              {/* Left Resize Handle (Showtime) */}
              <div
                role="slider"
                tabIndex={0}
                aria-label="Adjust Band Showtime"
                aria-valuenow={bandStartMin}
                onPointerDown={(e) => startDrag(e, "bandStart")}
                className="group relative flex h-full w-5 cursor-ew-resize items-center justify-center rounded-l-xl bg-black/40 hover:bg-black/60 transition-colors"
                title="Drag to adjust showtime"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="h-3 w-0.5 rounded-full bg-white/70 group-hover:bg-pink-300" />
                  <span className="h-3 w-0.5 rounded-full bg-white/70 group-hover:bg-pink-300" />
                </div>
                {/* Floating start tag */}
                <div className="absolute -top-6 left-0 rounded bg-purple-950/90 px-1.5 py-0.5 text-[9px] font-bold text-pink-200 border border-purple-400/30 whitespace-nowrap">
                  {effectiveBandStart}
                </div>
              </div>

              {/* Center Clip Body (Live Info & Drag Hint) */}
              <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-2 text-center pointer-events-none">
                <span className="flex items-center gap-1.5 text-xs font-black tracking-wider text-white drop-shadow">
                  <Zap className="h-3.5 w-3.5 text-yellow-300 animate-pulse" />
                  7TH HEAVEN LIVE
                </span>
                <span className="text-[11px] font-bold text-pink-100">
                  {formatDurationLabel(bandLiveMinutes, "Live Set")}
                </span>
              </div>

              {/* Right Resize Handle (Curtain Call) */}
              <div
                role="slider"
                tabIndex={0}
                aria-label="Adjust Band Curtain Call"
                aria-valuenow={bandEndMin}
                onPointerDown={(e) => startDrag(e, "bandEnd")}
                className="group relative flex h-full w-5 cursor-ew-resize items-center justify-center rounded-r-xl bg-black/40 hover:bg-black/60 transition-colors"
                title="Drag to adjust curtain call"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="h-3 w-0.5 rounded-full bg-white/70 group-hover:bg-pink-300" />
                  <span className="h-3 w-0.5 rounded-full bg-white/70 group-hover:bg-pink-300" />
                </div>
                {/* Floating end tag */}
                <div className="absolute -top-6 right-0 rounded bg-purple-950/90 px-1.5 py-0.5 text-[9px] font-bold text-pink-200 border border-purple-400/30 whitespace-nowrap">
                  {effectiveBandEnd}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Live Metrics */}
          <div className="flex flex-wrap items-center justify-between border-t border-white/10 pt-3 text-xs">
            <span className="text-white/60">
              Pre-show: <strong>{formatDurationLabel(preShowMinutes)}</strong> • Post-show:{" "}
              <strong>{formatDurationLabel(postShowMinutes)}</strong>
            </span>
            <span className="flex items-center gap-2 font-bold text-white">
              <span className="rounded-full bg-purple-500/20 px-3 py-1 text-purple-300">
                🎸 {formatDurationLabel(bandLiveMinutes, "Live Set")}
              </span>
              <span className="text-white/30">•</span>
              <span>{formatDurationLabel(totalEventMinutes, "Total Booking")}</span>
            </span>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SETUP 2: Magnetic Milestone Pin Scrubber                    */}
      {/* ============================================================ */}
      {layoutId === 2 && (
        <div className="flex flex-col gap-4 rounded-3xl border border-white/20 bg-[#090d16]/95 p-5 sm:p-6 backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
              <Sparkles className="h-4 w-4" /> 4-Pin Magnetic Milestone Scrubber
            </span>
            <span className="text-[11px] text-white/50">Grab any milestone pin and slide across the laser track</span>
          </div>

          {/* Time Ruler Header */}
          <div className="relative h-6 w-full text-[10px] font-mono text-white/40">
            {rulerTicks.map((tick) => {
              const tickPct = minutesToPct(tick.mins);
              return (
                <div
                  key={tick.label}
                  className="absolute -translate-x-1/2 flex flex-col items-center [left:var(--tick-left)]"
                  style={{ "--tick-left": `${tickPct}%` } as React.CSSProperties}
                >
                  <span className="h-2 w-px bg-white/20" />
                  <span>{tick.label}</span>
                </div>
              );
            })}
          </div>

          {/* Laser Track with 4 Magnetic Pins */}
          <div className="relative my-4 h-16 w-full flex items-center">
            {/* Base Wire Track */}
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-2 rounded-full bg-white/10" />

            {/* Glowing Live Set Laser Segment (between Pin 2 and Pin 3) */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 shadow-[0_0_20px_rgba(217,70,239,0.9)] [left:var(--live-left)] [width:var(--live-width)]"
              style={
                {
                  "--live-left": `${bandStartPct}%`,
                  "--live-width": `${clipWidthPct}%`,
                } as React.CSSProperties
              }
            />

            {/* Pin 1: DOORS (Cyan) */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Doors Open Pin"
              aria-valuenow={doorsMin}
              onPointerDown={(e) => startDrag(e, "eventStart")}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 cursor-grab active:cursor-grabbing flex flex-col items-center [left:var(--pin-left)]"
              style={{ "--pin-left": `${doorsPct}%` } as React.CSSProperties}
            >
              <div className="rounded-full border-2 border-cyan-300 bg-cyan-950 px-2.5 py-1 text-[10px] font-black text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.6)] whitespace-nowrap">
                1 DOORS • {effectiveEventStart}
              </div>
              <div className="h-4 w-1 bg-cyan-400 rounded-full mt-0.5" />
            </div>

            {/* Pin 2: SHOWTIME (Purple) */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Concert Showtime Pin"
              aria-valuenow={bandStartMin}
              onPointerDown={(e) => startDrag(e, "bandStart")}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-40 cursor-grab active:cursor-grabbing flex flex-col items-center [left:var(--pin-left)]"
              style={{ "--pin-left": `${bandStartPct}%` } as React.CSSProperties}
            >
              <div className="rounded-full border-2 border-purple-400 bg-purple-900 px-3 py-1.5 text-xs font-black text-white shadow-[0_0_20px_rgba(168,85,247,0.8)] whitespace-nowrap">
                ⚡ 2 SHOWTIME • {effectiveBandStart}
              </div>
              <div className="h-5 w-1.5 bg-purple-400 rounded-full mt-0.5 shadow-[0_0_10px_#c084fc]" />
            </div>

            {/* Pin 3: CURTAIN CALL (Pink) */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Curtain Call Pin"
              aria-valuenow={bandEndMin}
              onPointerDown={(e) => startDrag(e, "bandEnd")}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-40 cursor-grab active:cursor-grabbing flex flex-col items-center [left:var(--pin-left)]"
              style={{ "--pin-left": `${bandEndPct}%` } as React.CSSProperties}
            >
              <div className="rounded-full border-2 border-pink-400 bg-pink-900 px-3 py-1.5 text-xs font-black text-white shadow-[0_0_20px_rgba(244,114,182,0.8)] whitespace-nowrap">
                🎸 3 FINALE • {effectiveBandEnd}
              </div>
              <div className="h-5 w-1.5 bg-pink-400 rounded-full mt-0.5 shadow-[0_0_10px_#f472b6]" />
            </div>

            {/* Pin 4: CURFEW (Amber) */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Curfew Pin"
              aria-valuenow={curfewMin}
              onPointerDown={(e) => startDrag(e, "eventEnd")}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 cursor-grab active:cursor-grabbing flex flex-col items-center [left:var(--pin-left)]"
              style={{ "--pin-left": `${curfewPct}%` } as React.CSSProperties}
            >
              <div className="rounded-full border-2 border-amber-400 bg-amber-950 px-2.5 py-1 text-[10px] font-black text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.6)] whitespace-nowrap">
                4 CURFEW • {effectiveEventEnd}
              </div>
              <div className="h-4 w-1 bg-amber-400 rounded-full mt-0.5" />
            </div>
          </div>

          {/* Milestone Quick Summary Grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center">
              <span className="text-[10px] text-white/50 block">DOORS</span>
              <span className="text-xs font-bold text-cyan-300">{effectiveEventStart}</span>
            </div>
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-2.5 text-center">
              <span className="text-[10px] text-purple-300 block">ON STAGE</span>
              <span className="text-xs font-bold text-white">{effectiveBandStart}</span>
            </div>
            <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-2.5 text-center">
              <span className="text-[10px] text-pink-300 block">ENCORE FINISH</span>
              <span className="text-xs font-bold text-white">{effectiveBandEnd}</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center">
              <span className="text-[10px] text-white/50 block">CURFEW</span>
              <span className="text-xs font-bold text-amber-300">{effectiveEventEnd}</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SETUP 3: Dual-Divider Elastic Time Blocks                    */}
      {/* ============================================================ */}
      {layoutId === 3 && (
        <div className="flex flex-col gap-4 rounded-3xl border border-white/20 bg-gradient-to-b from-[#0c1220]/95 to-[#060911]/95 p-5 sm:p-6 backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-300">
              <Flame className="h-4 w-4" /> Proportional Elastic Time Bar with Draggable Dividers
            </span>
            <span className="text-[11px] text-white/50">Drag the vertical dividers to balance reception & live show</span>
          </div>

          {/* 3 Elastic Segments with 2 Draggable Dividers */}
          <div className="relative flex h-20 w-full overflow-hidden rounded-2xl border border-white/20 bg-black/50 p-1">
            {/* Zone 1: Pre-Show Reception */}
            <div
              className="relative flex flex-col justify-center rounded-l-xl bg-cyan-950/40 px-4 text-left transition-all overflow-hidden [width:var(--pre-width)]"
              style={{ "--pre-width": `${bandStartPct}%` } as React.CSSProperties}
            >
              <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">Pre-Show</span>
              <span className="text-xs font-bold text-white/80">{formatDurationLabel(preShowMinutes)}</span>
              <span className="text-[10px] text-white/40 truncate">Doors: {effectiveEventStart}</span>
            </div>

            {/* Draggable Divider A (Showtime Splitter) */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Draggable Showtime Divider"
              aria-valuenow={bandStartMin}
              onPointerDown={(e) => startDrag(e, "bandStart")}
              className="group relative z-30 flex w-7 cursor-ew-resize shrink-0 items-center justify-center bg-purple-950 border-x border-purple-400 hover:bg-purple-800 transition-colors"
              title="Drag to change concert start time"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="h-4 w-1 rounded-full bg-purple-300 shadow-[0_0_8px_#c084fc]" />
              </div>
              <div className="absolute -top-7 -translate-x-1/2 left-1/2 rounded bg-purple-900 border border-purple-400/50 px-1.5 py-0.5 text-[9px] font-black text-white whitespace-nowrap">
                {effectiveBandStart}
              </div>
            </div>

            {/* Zone 2: 7th Heaven Live Concert */}
            <div
              className="relative flex flex-1 flex-col justify-center bg-gradient-to-r from-purple-700 via-pink-600 to-purple-700 px-4 text-center shadow-[0_0_25px_rgba(168,85,247,0.5)] overflow-hidden"
            >
              <div className="flex items-center justify-center gap-1 text-xs font-black text-white uppercase tracking-wider">
                <Zap className="h-3.5 w-3.5 text-yellow-300" /> 7TH HEAVEN LIVE CONCERT
              </div>
              <span className="text-xs font-bold text-pink-100">
                🎸 {formatDurationLabel(bandLiveMinutes, "Live Set Duration")}
              </span>
            </div>

            {/* Draggable Divider B (Curtain Call Splitter) */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Draggable Curtain Call Divider"
              aria-valuenow={bandEndMin}
              onPointerDown={(e) => startDrag(e, "bandEnd")}
              className="group relative z-30 flex w-7 cursor-ew-resize shrink-0 items-center justify-center bg-pink-950 border-x border-pink-400 hover:bg-pink-800 transition-colors"
              title="Drag to change concert finish time"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="h-4 w-1 rounded-full bg-pink-300 shadow-[0_0_8px_#f472b6]" />
              </div>
              <div className="absolute -top-7 -translate-x-1/2 left-1/2 rounded bg-pink-900 border border-pink-400/50 px-1.5 py-0.5 text-[9px] font-black text-white whitespace-nowrap">
                {effectiveBandEnd}
              </div>
            </div>

            {/* Zone 3: Post-Show Finale & Curfew */}
            <div
              className="relative flex flex-col justify-center rounded-r-xl bg-violet-950/40 px-4 text-left transition-all overflow-hidden [width:var(--post-width)]"
              style={{ "--post-width": `${100 - bandEndPct}%` } as React.CSSProperties}
            >
              <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider">Post-Show</span>
              <span className="text-xs font-bold text-white/80">{formatDurationLabel(postShowMinutes)}</span>
              <span className="text-[10px] text-white/40 truncate">Curfew: {effectiveEventEnd}</span>
            </div>
          </div>

          {/* Bottom Duration Chips */}
          <div className="flex flex-wrap items-center justify-between border-t border-white/10 pt-3 text-xs">
            <span className="text-white/60">
              Total Night Span: <strong>{formatDurationLabel(totalEventMinutes)}</strong>
            </span>
            <span className="font-bold text-purple-300">
              ⚡ Drag dividers anytime to dynamically rebalance sets
            </span>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SETUP 4: Pro DJ Mixer Dual-Fader Scrubber                    */}
      {/* ============================================================ */}
      {layoutId === 4 && (
        <div className="flex flex-col gap-4 rounded-3xl border border-white/20 bg-[#070b14]/95 p-5 sm:p-6 backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
              <Disc3 className="h-4 w-4 animate-spin text-purple-400" /> Pro Touring Console Dual-Fader Scrubber
            </span>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="text-[11px] font-bold text-emerald-300">CH 1 & 2 ACTIVE</span>
            </div>
          </div>

          {/* Fader Track 1: SHOWTIME */}
          <div className="flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-400" /> Fader 1: Band On Stage
              </span>
              <span className="font-mono font-bold text-purple-300">{effectiveBandStart}</span>
            </div>

            <div className="relative my-2 h-10 w-full flex items-center">
              {/* Slot rail */}
              <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-2.5 rounded-full bg-black/80 border border-white/15" />
              {/* Illuminated active track */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-purple-500 shadow-[0_0_12px_#a855f7] [left:0] [width:var(--fader1-width)]"
                style={{ "--fader1-width": `${bandStartPct}%` } as React.CSSProperties}
              />
              {/* Tactile Fader Knob */}
              <div
                role="slider"
                tabIndex={0}
                aria-label="Showtime Fader Knob"
                aria-valuenow={bandStartMin}
                onPointerDown={(e) => startDrag(e, "bandStart")}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 cursor-grab active:cursor-grabbing flex h-8 w-12 items-center justify-center rounded-lg border-2 border-purple-400 bg-gradient-to-b from-purple-800 to-purple-950 shadow-[0_0_15px_rgba(168,85,247,0.7)] [left:var(--knob-left)]"
                style={{ "--knob-left": `${bandStartPct}%` } as React.CSSProperties}
              >
                <div className="h-4 w-1 rounded-full bg-white" />
              </div>
            </div>
          </div>

          {/* Fader Track 2: CURTAIN CALL */}
          <div className="flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-pink-400" /> Fader 2: Curtain Call (Encore Finish)
              </span>
              <span className="font-mono font-bold text-pink-300">{effectiveBandEnd}</span>
            </div>

            <div className="relative my-2 h-10 w-full flex items-center">
              {/* Slot rail */}
              <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-2.5 rounded-full bg-black/80 border border-white/15" />
              {/* Illuminated active track */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-pink-500 shadow-[0_0_12px_#ec4899] [left:0] [width:var(--fader2-width)]"
                style={{ "--fader2-width": `${bandEndPct}%` } as React.CSSProperties}
              />
              {/* Tactile Fader Knob */}
              <div
                role="slider"
                tabIndex={0}
                aria-label="Curtain Call Fader Knob"
                aria-valuenow={bandEndMin}
                onPointerDown={(e) => startDrag(e, "bandEnd")}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 cursor-grab active:cursor-grabbing flex h-8 w-12 items-center justify-center rounded-lg border-2 border-pink-400 bg-gradient-to-b from-pink-800 to-pink-950 shadow-[0_0_15px_rgba(236,72,153,0.7)] [left:var(--knob-left)]"
                style={{ "--knob-left": `${bandEndPct}%` } as React.CSSProperties}
              >
                <div className="h-4 w-1 rounded-full bg-white" />
              </div>
            </div>
          </div>

          {/* Master Live Window Console Readout */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/60 p-3 text-xs">
            <span className="text-white/70">
              Active Console Set: <strong>{effectiveBandStart}</strong> → <strong>{effectiveBandEnd}</strong>
            </span>
            <span className="rounded-full bg-purple-500/20 px-3 py-1 font-bold text-purple-300">
              🎸 {formatDurationLabel(bandLiveMinutes, "Continuous Performance")}
            </span>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SETUP 5: Waveform Scrub Ribbon & Laser Playheads            */}
      {/* ============================================================ */}
      {layoutId === 5 && (
        <div className="flex flex-col gap-4 rounded-3xl border border-white/20 bg-gradient-to-b from-[#0b0e1b]/95 to-[#060810]/95 p-5 sm:p-6 backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
              <Volume2 className="h-4 w-4 text-purple-400" /> Waveform Playhead Scrub Ribbon
            </span>
            <span className="text-[11px] text-white/50">Drag laser playheads or the top ribbon across the audio wave</span>
          </div>

          {/* Audio Waveform with Draggable Laser Playheads */}
          <div className="relative my-3 h-28 w-full overflow-hidden rounded-2xl border border-white/15 bg-black/70 p-3">
            {/* 40 Simulated Audio Frequency Bars */}
            <div className="absolute inset-x-4 top-6 bottom-6 flex items-center justify-between gap-1 pointer-events-none">
              {Array.from({ length: 42 }).map((_, i) => {
                const ratio = i / 41;
                const isLive = ratio >= bandStartPct / 100 && ratio <= bandEndPct / 100;
                // Wave pattern
                const heightPct = isLive
                  ? 30 + Math.sin(i * 0.8) * 35 + 25
                  : 15 + Math.sin(i * 0.8) * 10;
                return (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full transition-all [height:var(--bar-h)] ${
                      isLive
                        ? "bg-gradient-to-t from-purple-500 to-pink-400 shadow-[0_0_8px_#d946ef]"
                        : "bg-white/15"
                    }`}
                    style={{ "--bar-h": `${heightPct}%` } as React.CSSProperties}
                  />
                );
              })}
            </div>

            {/* Draggable Performance Window Bracket (Top Ribbon) */}
            <div
              onPointerDown={(e) => startDrag(e, "clipShift")}
              className="absolute top-1 h-6 cursor-grab active:cursor-grabbing z-20 flex items-center justify-center rounded-md border border-purple-400/60 bg-purple-600/40 backdrop-blur-md hover:bg-purple-600/60 transition-colors [left:var(--win-left)] [width:var(--win-width)]"
              style={
                {
                  "--win-left": `${bandStartPct}%`,
                  "--win-width": `${clipWidthPct}%`,
                } as React.CSSProperties
              }
            >
              <span className="flex items-center gap-1 text-[10px] font-black text-white uppercase tracking-wider">
                <MoveHorizontal className="h-3 w-3" />
                7th Heaven Live Set
              </span>
            </div>

            {/* Laser Playhead 1 (Showtime) */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Showtime Laser Playhead"
              aria-valuenow={bandStartMin}
              onPointerDown={(e) => startDrag(e, "bandStart")}
              className="absolute top-0 bottom-0 z-30 w-5 -translate-x-1/2 cursor-ew-resize flex flex-col items-center [left:var(--laser-left)]"
              style={{ "--laser-left": `${bandStartPct}%` } as React.CSSProperties}
            >
              <div className="rounded bg-purple-600 px-1.5 py-0.5 text-[9px] font-black text-white shadow-[0_0_10px_#a855f7] whitespace-nowrap">
                {effectiveBandStart}
              </div>
              <div className="w-0.5 flex-1 bg-purple-400 shadow-[0_0_8px_#c084fc]" />
            </div>

            {/* Laser Playhead 2 (Curtain Call) */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Curtain Call Laser Playhead"
              aria-valuenow={bandEndMin}
              onPointerDown={(e) => startDrag(e, "bandEnd")}
              className="absolute top-0 bottom-0 z-30 w-5 -translate-x-1/2 cursor-ew-resize flex flex-col items-center [left:var(--laser-left)]"
              style={{ "--laser-left": `${bandEndPct}%` } as React.CSSProperties}
            >
              <div className="rounded bg-pink-600 px-1.5 py-0.5 text-[9px] font-black text-white shadow-[0_0_10px_#ec4899] whitespace-nowrap">
                {effectiveBandEnd}
              </div>
              <div className="w-0.5 flex-1 bg-pink-400 shadow-[0_0_8px_#f472b6]" />
            </div>
          </div>

          {/* Bottom Duration Footer */}
          <div className="flex flex-wrap items-center justify-between border-t border-white/10 pt-3 text-xs">
            <span className="text-white/60">
              Concert Window: <strong>{effectiveBandStart}</strong> to <strong>{effectiveBandEnd}</strong>
            </span>
            <span className="rounded-full bg-pink-500/20 px-3 py-1 font-bold text-pink-300">
              ⚡ {formatDurationLabel(bandLiveMinutes, "Live Music")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
