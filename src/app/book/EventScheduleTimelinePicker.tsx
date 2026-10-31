"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Truck,
  DoorOpen,
  Guitar,
  Hourglass,
  Moon,
  Minus,
  Plus,
  MousePointer,
  GripVertical,
  Sliders,
  Clock,
  Sparkles,
  LayoutGrid,
  Radio,
  Volume2,
  Calendar,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export interface EventScheduleData {
  loadInMinutes: number; // minutes from 12:00 PM (e.g. 180 = 3:00 PM)
  doorsMinutes: number; // e.g. 360 = 6:00 PM
  onStageMinutes: number; // e.g. 420 = 7:00 PM
  setLengthMinutes: number; // e.g. 120 = 2 hours
  wrapMinutes: number; // e.g. 660 = 11:00 PM
  loadInTime: string; // "3:00 PM"
  doorsTime: string; // "6:00 PM"
  onStageTime: string; // "7:00 PM"
  setEndTime: string; // "9:00 PM"
  setLengthLabel: string; // "2h"
  wrapTime: string; // "11:00 PM"
}

interface EventScheduleTimelinePickerProps {
  initialSchedule?: Partial<EventScheduleData>;
  onChange?: (schedule: EventScheduleData) => void;
  className?: string;
}

// Convert minutes from 12:00 PM (0 = 12:00 PM, 720 = 12:00 AM) to formatted time string
export function minutesToTimeString(minutes: number): string {
  const normalized = Math.max(0, Math.min(840, minutes));
  const totalMinutesFromMidnight = 12 * 60 + normalized; // 12:00 PM is 720 min from midnight
  const hours24 = Math.floor(totalMinutesFromMidnight / 60) % 24;
  const mins = totalMinutesFromMidnight % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minsStr = mins === 0 ? "00" : mins < 10 ? `0${mins}` : `${mins}`;
  return `${hours12}:${minsStr} ${period}`;
}

// Short label without :00 when on the hour (e.g. "3PM", "6PM")
export function minutesToShortTimeString(minutes: number): string {
  const normalized = Math.max(0, Math.min(840, minutes));
  const totalMinutesFromMidnight = 12 * 60 + normalized;
  const hours24 = Math.floor(totalMinutesFromMidnight / 60) % 24;
  const mins = totalMinutesFromMidnight % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  if (mins === 0) {
    return `${hours12}${period}`;
  }
  return `${hours12}:${mins < 10 ? `0${mins}` : mins}${period}`;
}

const SET_LENGTH_OPTIONS = [
  { minutes: 60, label: "1h" },
  { minutes: 90, label: "1h 30m" },
  { minutes: 120, label: "2h" },
  { minutes: 150, label: "2h 30m" },
  { minutes: 180, label: "3h" },
];

const TIMELINE_TICKS = [
  { minutes: 0, label: "12 PM" },
  { minutes: 120, label: "2 PM" },
  { minutes: 240, label: "4 PM" },
  { minutes: 360, label: "6 PM" },
  { minutes: 480, label: "8 PM" },
  { minutes: 600, label: "10 PM" },
  { minutes: 720, label: "12 AM" },
];

export const SCHEDULE_LAYOUTS = [
  { id: 1, label: "1. Studio Stack" },
  { id: 2, label: "2. Split Console" },
  { id: 3, label: "3. Compact Rail" },
  { id: 4, label: "4. Call Sheet" },
  { id: 5, label: "5. Bento Studio" },
  { id: 6, label: "6. Audio Faders" },
  { id: 7, label: "7. Tabbed Focus" },
  { id: 8, label: "8. Waveform DJ" },
  { id: 9, label: "9. Clock Arc" },
  { id: 10, label: "10. Fast Presets" },
] as const;

export default function EventScheduleTimelinePicker({
  initialSchedule,
  onChange,
  className = "",
}: EventScheduleTimelinePickerProps) {
  // Timeline spans 12 hours (720 minutes from 12 PM to 12 AM)
  const TOTAL_TIMELINE_MINUTES = 720;

  // Selected layout index (1 to 10)
  const [layoutMode, setLayoutMode] = useState<number>(1);

  // Time state
  const [loadInMinutes, setLoadInMinutes] = useState<number>(
    initialSchedule?.loadInMinutes ?? 180,
  );
  const [doorsMinutes, setDoorsMinutes] = useState<number>(
    initialSchedule?.doorsMinutes ?? 360,
  );
  const [onStageMinutes, setOnStageMinutes] = useState<number>(
    initialSchedule?.onStageMinutes ?? 420,
  );
  const [setLengthMinutes, setSetLengthMinutes] = useState<number>(
    initialSchedule?.setLengthMinutes ?? 120,
  );
  const [wrapMinutes, setWrapMinutes] = useState<number>(
    initialSchedule?.wrapMinutes ?? 660,
  );

  // Selected tab for Layout 7
  const [activeTab, setActiveTab] = useState<"loadIn" | "doors" | "stage" | "set" | "wrap">("stage");

  const timelineTrackRef = useRef<HTMLDivElement>(null);
  const [activeDrag, setActiveDrag] = useState<
    "crew" | "event" | "band-move" | "band-stretch" | null
  >(null);
  const dragStartRef = useRef<{
    startX: number;
    initialLoadIn: number;
    initialDoors: number;
    initialOnStage: number;
    initialSetLength: number;
    initialWrap: number;
  }>({
    startX: 0,
    initialLoadIn: 180,
    initialDoors: 360,
    initialOnStage: 420,
    initialSetLength: 120,
    initialWrap: 660,
  });

  // Keep parent in sync
  useEffect(() => {
    if (onChange) {
      const setEndTimeMinutes = onStageMinutes + setLengthMinutes;
      const setLengthObj =
        SET_LENGTH_OPTIONS.find((s) => s.minutes === setLengthMinutes) || {
          label: `${setLengthMinutes / 60}h`,
        };
      onChange({
        loadInMinutes,
        doorsMinutes,
        onStageMinutes,
        setLengthMinutes,
        wrapMinutes,
        loadInTime: minutesToTimeString(loadInMinutes),
        doorsTime: minutesToTimeString(doorsMinutes),
        onStageTime: minutesToTimeString(onStageMinutes),
        setEndTime: minutesToTimeString(setEndTimeMinutes),
        setLengthLabel: setLengthObj.label,
        wrapTime: minutesToTimeString(wrapMinutes),
      });
    }
  }, [
    loadInMinutes,
    doorsMinutes,
    onStageMinutes,
    setLengthMinutes,
    wrapMinutes,
    onChange,
  ]);

  // Stepper handlers (15 minute snap)
  const handleLoadInStep = (delta: number) => {
    setLoadInMinutes((prev) => {
      const next = Math.max(0, Math.min(doorsMinutes - 30, prev + delta));
      return Math.round(next / 15) * 15;
    });
  };

  const handleDoorsStep = (delta: number) => {
    setDoorsMinutes((prev) => {
      const next = Math.max(
        loadInMinutes + 30,
        Math.min(onStageMinutes, prev + delta),
      );
      return Math.round(next / 15) * 15;
    });
  };

  const handleOnStageStep = (delta: number) => {
    setOnStageMinutes((prev) => {
      const next = Math.max(
        doorsMinutes,
        Math.min(wrapMinutes - setLengthMinutes, prev + delta),
      );
      return Math.round(next / 15) * 15;
    });
  };

  const handleWrapStep = (delta: number) => {
    setWrapMinutes((prev) => {
      const next = Math.max(
        onStageMinutes + setLengthMinutes,
        Math.min(TOTAL_TIMELINE_MINUTES, prev + delta),
      );
      return Math.round(next / 15) * 15;
    });
  };

  // Drag interaction handlers
  const handlePointerDown = (
    e: React.PointerEvent,
    dragType: "crew" | "event" | "band-move" | "band-stretch",
  ) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setActiveDrag(dragType);
    dragStartRef.current = {
      startX: e.clientX,
      initialLoadIn: loadInMinutes,
      initialDoors: doorsMinutes,
      initialOnStage: onStageMinutes,
      initialSetLength: setLengthMinutes,
      initialWrap: wrapMinutes,
    };
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!activeDrag || !timelineTrackRef.current) return;
      const rect = timelineTrackRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaMinutes = (deltaX / rect.width) * TOTAL_TIMELINE_MINUTES;
      const snappedDelta = Math.round(deltaMinutes / 15) * 15;

      if (activeDrag === "crew") {
        const next = Math.max(
          0,
          Math.min(
            doorsMinutes - 30,
            dragStartRef.current.initialLoadIn + snappedDelta,
          ),
        );
        setLoadInMinutes(next);
      } else if (activeDrag === "band-move") {
        const proposedOnStage =
          dragStartRef.current.initialOnStage + snappedDelta;
        const clampedOnStage = Math.max(
          doorsMinutes,
          Math.min(wrapMinutes - setLengthMinutes, proposedOnStage),
        );
        setOnStageMinutes(clampedOnStage);
      } else if (activeDrag === "band-stretch") {
        const proposedLength =
          dragStartRef.current.initialSetLength + snappedDelta;
        const clampedLength = Math.max(
          60,
          Math.min(180, Math.min(wrapMinutes - onStageMinutes, proposedLength)),
        );
        const snappedLength = Math.round(clampedLength / 30) * 30;
        setSetLengthMinutes(Math.max(60, Math.min(180, snappedLength)));
      } else if (activeDrag === "event") {
        const proposedDoors = dragStartRef.current.initialDoors + snappedDelta;
        const proposedWrap = dragStartRef.current.initialWrap + snappedDelta;
        if (
          proposedDoors >= loadInMinutes + 30 &&
          proposedDoors <= onStageMinutes &&
          proposedWrap >= onStageMinutes + setLengthMinutes &&
          proposedWrap <= TOTAL_TIMELINE_MINUTES
        ) {
          setDoorsMinutes(proposedDoors);
          setWrapMinutes(proposedWrap);
        }
      }
    },
    [
      activeDrag,
      doorsMinutes,
      loadInMinutes,
      onStageMinutes,
      setLengthMinutes,
      wrapMinutes,
    ],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setActiveDrag(null);
  }, []);

  // Preset handlers for Layout 10
  const applyPreset = (preset: {
    loadIn: number;
    doors: number;
    stage: number;
    length: number;
    wrap: number;
  }) => {
    setLoadInMinutes(preset.loadIn);
    setDoorsMinutes(preset.doors);
    setOnStageMinutes(preset.stage);
    setSetLengthMinutes(preset.length);
    setWrapMinutes(preset.wrap);
  };

  // Calculations for subtitles
  const loadInHoursDiff = (doorsMinutes - loadInMinutes) / 60;
  const loadInSubtitle =
    loadInHoursDiff >= 2.5 ? (
      <span className="text-emerald-400 font-medium">
        Crew sets up · {loadInHoursDiff}h before doors — plenty of time ✓
      </span>
    ) : loadInHoursDiff >= 1.5 ? (
      <span className="text-emerald-400 font-medium">
        Crew sets up · {loadInHoursDiff}h before doors — good ✓
      </span>
    ) : (
      <span className="text-amber-400 font-medium">
        Crew sets up · {loadInHoursDiff}h before doors — tight load-in ⚠
      </span>
    );

  const eventDurationHours = (wrapMinutes - doorsMinutes) / 60;
  const doorsSubtitle = `Guests arrive · event runs ${eventDurationHours}h`;

  const onStageHoursAfterDoors = (onStageMinutes - doorsMinutes) / 60;
  const onStageSubtitle =
    onStageHoursAfterDoors === 1
      ? "1h after doors open"
      : onStageHoursAfterDoors > 0
      ? `${onStageHoursAfterDoors}h after doors open`
      : "Right as doors open";

  const setEndTimeStr = minutesToTimeString(onStageMinutes + setLengthMinutes);
  const setLengthSubtitle = `Plays until ${setEndTimeStr}`;

  const wrapHoursAfterSet =
    (wrapMinutes - (onStageMinutes + setLengthMinutes)) / 60;
  const wrapSubtitle =
    wrapHoursAfterSet === 1
      ? "1h after the set ends"
      : wrapHoursAfterSet > 0
      ? `${wrapHoursAfterSet}h after the set ends`
      : "Immediately as set ends";

  // Visual percentages for timeline
  const crewPillLeftPct = (loadInMinutes / TOTAL_TIMELINE_MINUTES) * 100;
  const crewDottedWidthPct =
    ((doorsMinutes - loadInMinutes) / TOTAL_TIMELINE_MINUTES) * 100;

  const eventLeftPct = (doorsMinutes / TOTAL_TIMELINE_MINUTES) * 100;
  const eventWidthPct =
    ((wrapMinutes - doorsMinutes) / TOTAL_TIMELINE_MINUTES) * 100;

  const bandLeftPct = (onStageMinutes / TOTAL_TIMELINE_MINUTES) * 100;
  const bandWidthPct = (setLengthMinutes / TOTAL_TIMELINE_MINUTES) * 100;

  const currentSetLengthObj =
    SET_LENGTH_OPTIONS.find((s) => s.minutes === setLengthMinutes) ||
    SET_LENGTH_OPTIONS[2];

  // Reusable Timeline Track Component
  const renderTimelineTrack = (compact: boolean = false) => (
    <div
      className={`rounded-2xl border border-white/10 bg-[#0d061b]/80 ${
        compact ? "p-3 sm:p-4" : "p-4 sm:p-5"
      } select-none shadow-inner`}
    >
      <div
        ref={timelineTrackRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative ${compact ? "h-36" : "h-44"} w-full touch-none`}
      >
        {/* Vertical Grid Lines & Ticks */}
        <div className="pointer-events-none absolute inset-0 flex justify-between">
          {TIMELINE_TICKS.map((tick) => {
            const tickPct = (tick.minutes / TOTAL_TIMELINE_MINUTES) * 100;
            return (
              <div
                key={tick.label}
                style={
                  {
                    "--tick-left": `${tickPct}%`,
                  } as React.CSSProperties
                }
                className="absolute top-0 bottom-6 w-px bg-white/10 left-[var(--tick-left)] flex flex-col justify-end"
              >
                <span className="absolute bottom-[-22px] -translate-x-1/2 text-[10px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap text-white/40">
                  {tick.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Row Labels (CREW, EVENT, BAND) */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-6 flex flex-col justify-around text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-white/40 z-0">
          <span>CREW</span>
          <span>EVENT</span>
          <span>BAND</span>
        </div>

        {/* ── ROW 1: CREW LOAD-IN ── */}
        <div className="absolute top-[8px] sm:top-[10px] left-14 sm:left-16 right-4 h-8">
          <div
            style={
              {
                "--dash-left": `${crewPillLeftPct}%`,
                "--dash-width": `${Math.max(0, crewDottedWidthPct)}%`,
              } as React.CSSProperties
            }
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-0 border-t-2 border-dashed border-emerald-400/80 left-[var(--dash-left)] w-[var(--dash-width)] z-10"
          />

          <div
            style={
              {
                "--crew-left": `${crewPillLeftPct}%`,
              } as React.CSSProperties
            }
            onPointerDown={(e) => handlePointerDown(e, "crew")}
            title="Drag to change Load-in time"
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-[var(--crew-left)] z-20 flex cursor-grab active:cursor-grabbing items-center gap-1 rounded-full bg-emerald-500 hover:bg-emerald-400 px-3 py-1 text-xs font-bold text-white shadow-md shadow-emerald-500/30 transition-transform active:scale-95"
          >
            <GripVertical className="h-3 w-3 opacity-70" />
            <span>{minutesToShortTimeString(loadInMinutes)}</span>
          </div>
        </div>

        {/* ── ROW 2: EVENT (Doors -> Wrap) ── */}
        <div className="absolute top-[48px] sm:top-[52px] left-14 sm:left-16 right-4 h-9">
          <div
            style={
              {
                "--event-left": `${eventLeftPct}%`,
                "--event-width": `${Math.max(4, eventWidthPct)}%`,
              } as React.CSSProperties
            }
            onPointerDown={(e) => handlePointerDown(e, "event")}
            title="Drag to shift event window"
            className="absolute top-0 bottom-0 left-[var(--event-left)] w-[var(--event-width)] z-10 flex cursor-grab active:cursor-grabbing items-center justify-center rounded-lg border-l-4 border-l-sky-400 border-r-4 border-r-amber-400 bg-gradient-to-r from-sky-500/25 via-sky-500/15 to-amber-500/25 px-2 text-white shadow-xs transition-shadow"
          >
            <span className="text-[11px] sm:text-xs font-mono font-semibold tracking-tight truncate select-none">
              Doors {minutesToShortTimeString(doorsMinutes)} → Wrap{" "}
              {minutesToShortTimeString(wrapMinutes)}
            </span>
          </div>
        </div>

        {/* ── ROW 3: BAND (7th Heaven on stage) ── */}
        <div className="absolute top-[88px] sm:top-[94px] left-14 sm:left-16 right-4 h-9">
          <div
            style={
              {
                "--band-left": `${bandLeftPct}%`,
                "--band-width": `${Math.max(6, bandWidthPct)}%`,
              } as React.CSSProperties
            }
            onPointerDown={(e) => handlePointerDown(e, "band-move")}
            title="Drag to move band set time"
            className="group absolute top-0 bottom-0 left-[var(--band-left)] w-[var(--band-width)] z-20 flex cursor-grab active:cursor-grabbing items-center justify-between rounded-lg bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 pl-3 pr-1 text-white shadow-lg shadow-pink-500/30 transition-transform active:scale-[0.99]"
          >
            <span className="text-xs font-bold tracking-tight select-none">
              {currentSetLengthObj.label} set
            </span>

            <div
              onPointerDown={(e) => handlePointerDown(e, "band-stretch")}
              title="Drag edge to change set length"
              className="flex h-7 w-3 cursor-ew-resize items-center justify-center rounded-full bg-white/90 shadow-xs hover:bg-white hover:scale-105 transition-transform"
            >
              <div className="h-3 w-0.5 rounded-full bg-pink-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-white/50">
        <MousePointer className="h-3 w-3 shrink-0" />
        <span>Drag a block to move it · drag its edges to stretch · snaps to 15 min</span>
      </div>
    </div>
  );

  return (
    <div className={`w-full ${className}`}>
      {/* ── Top Bar: Section Title + Quick Concert Presets ── */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-white/70">
              Show Schedule &amp; Production Timeline
            </span>
            <p className="text-[11px] text-white/40">
              Click a concert preset or drag the timeline to customize
            </p>
          </div>

          {/* Quick Style Switcher Pills & Dropdown */}
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] text-white/40 hidden sm:inline">Layout:</span>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 1, label: "Stack" },
                { id: 4, label: "Call Sheet" },
                { id: 5, label: "Bento" },
                { id: 6, label: "Mixer Faders" },
                { id: 8, label: "Waveform" },
                { id: 9, label: "Clock Arc" },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setLayoutMode(style.id)}
                  className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                    layoutMode === style.id
                      ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-900/50"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
            <select
              value={layoutMode}
              onChange={(e) => setLayoutMode(Number(e.target.value))}
              aria-label="Select timeline layout style"
              className="rounded-lg border border-white/15 bg-[#0d061b] px-2 py-1 text-[11px] font-semibold text-white/70 focus:border-purple-400 focus:outline-none cursor-pointer"
            >
              {SCHEDULE_LAYOUTS.map((layout) => (
                <option key={layout.id} value={layout.id} className="bg-[#120826] text-white">
                  {layout.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4 Instant Concert Presets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            {
              title: "⚡ Nightclub / Theatre",
              desc: "3PM Load · 6PM Doors · 7PM Stage (2h)",
              data: { loadIn: 180, doors: 360, stage: 420, length: 120, wrap: 660 },
            },
            {
              title: "🎪 Festival Headliner",
              desc: "4PM Load · 6:30PM Doors · 8:30PM Stage (2h)",
              data: { loadIn: 240, doors: 390, stage: 510, length: 120, wrap: 720 },
            },
            {
              title: "👔 Corporate Gala",
              desc: "2PM Load · 5PM Doors · 6:30PM Stage (90m)",
              data: { loadIn: 120, doors: 300, stage: 390, length: 90, wrap: 570 },
            },
            {
              title: "☀️ Afternoon Festival",
              desc: "12PM Load · 1PM Doors · 3PM Stage (2h)",
              data: { loadIn: 0, doors: 60, stage: 180, length: 120, wrap: 420 },
            },
          ].map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p.data)}
              className="group rounded-xl border border-white/10 bg-[#0d061b]/60 p-2.5 text-left hover:border-purple-500/50 hover:bg-purple-950/20 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                  {p.title}
                </span>
                <Sparkles className="h-3 w-3 text-purple-400 opacity-60 group-hover:opacity-100" />
              </div>
              <p className="mt-0.5 text-[10px] text-white/50 truncate">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          LAYOUT 1: STUDIO STACK (Classic Full-Width Stack)
         ══════════════════════════════════════════════════════════════ */}
      {layoutMode === 1 && (
        <div className="flex flex-col gap-4">
          {renderTimelineTrack(false)}

          {/* Steppers List */}
          <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#0d061b]/40 p-3 sm:p-4">
            {/* Load-in */}
            <div className="flex items-center justify-between py-3 first:pt-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <Truck className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">Load-in</p>
                  <p className="text-xs">{loadInSubtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <button
                  type="button"
                  onClick={() => handleLoadInStep(-15)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/15"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-20 text-center font-mono text-sm font-bold text-emerald-400">
                  {minutesToTimeString(loadInMinutes)}
                </span>
                <button
                  type="button"
                  onClick={() => handleLoadInStep(15)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/15"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Doors */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
                  <DoorOpen className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">Doors open</p>
                  <p className="text-xs text-white/50">{doorsSubtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <button
                  type="button"
                  onClick={() => handleDoorsStep(-15)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/15"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-20 text-center font-mono text-sm font-bold text-sky-400">
                  {minutesToTimeString(doorsMinutes)}
                </span>
                <button
                  type="button"
                  onClick={() => handleDoorsStep(15)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/15"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Stage */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                  <Guitar className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">7th Heaven on stage</p>
                  <p className="text-xs text-white/50">{onStageSubtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <button
                  type="button"
                  onClick={() => handleOnStageStep(-15)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/15"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-20 text-center font-mono text-sm font-bold text-purple-400">
                  {minutesToTimeString(onStageMinutes)}
                </span>
                <button
                  type="button"
                  onClick={() => handleOnStageStep(15)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/15"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Set Length */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400">
                  <Hourglass className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">Set length</p>
                  <p className="text-xs text-white/50">{setLengthSubtitle}</p>
                </div>
              </div>
              <div className="inline-flex rounded-xl p-1 border border-white/10 bg-[#0d061b] self-start sm:self-auto">
                {SET_LENGTH_OPTIONS.map((opt) => (
                  <button
                    key={opt.minutes}
                    type="button"
                    onClick={() => setSetLengthMinutes(opt.minutes)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      setLengthMinutes === opt.minutes
                        ? "bg-pink-600 text-white font-bold shadow-[0_0_12px_rgba(236,72,153,0.4)]"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Wrap */}
            <div className="flex items-center justify-between py-3 last:pb-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                  <Moon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">Event wraps</p>
                  <p className="text-xs text-white/50">{wrapSubtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <button
                  type="button"
                  onClick={() => handleWrapStep(-15)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/15"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-20 text-center font-mono text-sm font-bold text-amber-400">
                  {minutesToTimeString(wrapMinutes)}
                </span>
                <button
                  type="button"
                  onClick={() => handleWrapStep(15)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/15"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          LAYOUT 2: SPLIT CONSOLE (Side-by-Side 2-Column Grid)
         ══════════════════════════════════════════════════════════════ */}
      {layoutMode === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <div className="flex flex-col gap-3">
            {renderTimelineTrack(true)}
            <div className="rounded-xl border border-white/10 bg-[#0d061b]/60 p-3 text-xs text-white/70">
              <span className="font-bold text-purple-300">Live Stage Window: </span>
              {minutesToTimeString(onStageMinutes)} to {setEndTimeStr} ({currentSetLengthObj.label} set)
            </div>
          </div>

          <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#0d061b]/80 p-4">
            {/* Load-in */}
            <div className="flex items-center justify-between py-2.5 first:pt-0">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-emerald-400" />
                Load-in
              </span>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => handleLoadInStep(-15)} className="h-7 w-7 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-xs text-white"><Minus className="h-3 w-3" /></button>
                <span className="w-16 text-center font-mono text-xs font-bold text-emerald-400">{minutesToTimeString(loadInMinutes)}</span>
                <button type="button" onClick={() => handleLoadInStep(15)} className="h-7 w-7 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-xs text-white"><Plus className="h-3 w-3" /></button>
              </div>
            </div>

            {/* Doors */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <DoorOpen className="h-3.5 w-3.5 text-sky-400" />
                Doors Open
              </span>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => handleDoorsStep(-15)} className="h-7 w-7 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-xs text-white"><Minus className="h-3 w-3" /></button>
                <span className="w-16 text-center font-mono text-xs font-bold text-sky-400">{minutesToTimeString(doorsMinutes)}</span>
                <button type="button" onClick={() => handleDoorsStep(15)} className="h-7 w-7 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-xs text-white"><Plus className="h-3 w-3" /></button>
              </div>
            </div>

            {/* On Stage */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Guitar className="h-3.5 w-3.5 text-purple-400" />
                7th Heaven on Stage
              </span>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => handleOnStageStep(-15)} className="h-7 w-7 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-xs text-white"><Minus className="h-3 w-3" /></button>
                <span className="w-16 text-center font-mono text-xs font-bold text-purple-400">{minutesToTimeString(onStageMinutes)}</span>
                <button type="button" onClick={() => handleOnStageStep(15)} className="h-7 w-7 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-xs text-white"><Plus className="h-3 w-3" /></button>
              </div>
            </div>

            {/* Set Length */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Hourglass className="h-3.5 w-3.5 text-pink-400" />
                Set Length
              </span>
              <div className="inline-flex rounded-lg p-0.5 border border-white/10 bg-[#0d061b]">
                {SET_LENGTH_OPTIONS.map((opt) => (
                  <button key={opt.minutes} type="button" onClick={() => setSetLengthMinutes(opt.minutes)} className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${setLengthMinutes === opt.minutes ? "bg-pink-600 text-white font-bold" : "text-white/60"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Wrap */}
            <div className="flex items-center justify-between py-2.5 last:pb-0">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Moon className="h-3.5 w-3.5 text-amber-400" />
                Event Wraps
              </span>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => handleWrapStep(-15)} className="h-7 w-7 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-xs text-white"><Minus className="h-3 w-3" /></button>
                <span className="w-16 text-center font-mono text-xs font-bold text-amber-400">{minutesToTimeString(wrapMinutes)}</span>
                <button type="button" onClick={() => handleWrapStep(15)} className="h-7 w-7 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-xs text-white"><Plus className="h-3 w-3" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          LAYOUT 3: COMPACT HORIZONTAL RAIL (Space Saver)
         ══════════════════════════════════════════════════════════════ */}
      {layoutMode === 3 && (
        <div className="flex flex-col gap-3">
          {/* Thin Progress Rail */}
          <div className="relative h-10 w-full rounded-xl border border-white/10 bg-[#0d061b]/90 p-2 overflow-hidden shadow-inner flex items-center">
            <div
              style={{
                "--event-left": `${eventLeftPct}%`,
                "--event-width": `${Math.max(6, eventWidthPct)}%`,
              } as React.CSSProperties}
              className="absolute h-6 top-2 rounded-md bg-sky-500/20 border border-sky-400/50 left-[var(--event-left)] w-[var(--event-width)] flex items-center justify-center text-[10px] text-sky-200"
            >
              Event
            </div>
            <div
              style={{
                "--band-left": `${bandLeftPct}%`,
                "--band-width": `${Math.max(6, bandWidthPct)}%`,
              } as React.CSSProperties}
              className="absolute h-6 top-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-500 text-white left-[var(--band-left)] w-[var(--band-width)] flex items-center justify-center text-[10px] font-bold shadow-md"
            >
              7th Heaven
            </div>
            <div
              style={{
                "--crew-left": `${crewPillLeftPct}%`,
              } as React.CSSProperties}
              className="absolute top-2 h-6 -translate-x-1/2 left-[var(--crew-left)] rounded-full bg-emerald-500 px-2 flex items-center text-[10px] font-bold text-white shadow-sm"
            >
              Load-in
            </div>
          </div>

          {/* 5 Compact Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {/* Load-in Card */}
            <div className="rounded-xl border border-white/10 bg-[#0d061b]/60 p-2.5 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1"><Truck className="h-3 w-3" /> Load-in</span>
              <div className="flex items-center justify-between mt-2">
                <button type="button" onClick={() => handleLoadInStep(-15)} className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-xs"><Minus className="h-3 w-3" /></button>
                <span className="font-mono text-xs font-bold text-emerald-400">{minutesToShortTimeString(loadInMinutes)}</span>
                <button type="button" onClick={() => handleLoadInStep(15)} className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-xs"><Plus className="h-3 w-3" /></button>
              </div>
            </div>

            {/* Doors Card */}
            <div className="rounded-xl border border-white/10 bg-[#0d061b]/60 p-2.5 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-sky-400 flex items-center gap-1"><DoorOpen className="h-3 w-3" /> Doors</span>
              <div className="flex items-center justify-between mt-2">
                <button type="button" onClick={() => handleDoorsStep(-15)} className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-xs"><Minus className="h-3 w-3" /></button>
                <span className="font-mono text-xs font-bold text-sky-400">{minutesToShortTimeString(doorsMinutes)}</span>
                <button type="button" onClick={() => handleDoorsStep(15)} className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-xs"><Plus className="h-3 w-3" /></button>
              </div>
            </div>

            {/* On Stage Card */}
            <div className="rounded-xl border border-purple-500/40 bg-purple-950/20 p-2.5 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] uppercase font-bold text-purple-300 flex items-center gap-1"><Guitar className="h-3 w-3" /> Stage</span>
              <div className="flex items-center justify-between mt-2">
                <button type="button" onClick={() => handleOnStageStep(-15)} className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-xs"><Minus className="h-3 w-3" /></button>
                <span className="font-mono text-xs font-bold text-purple-300">{minutesToShortTimeString(onStageMinutes)}</span>
                <button type="button" onClick={() => handleOnStageStep(15)} className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-xs"><Plus className="h-3 w-3" /></button>
              </div>
            </div>

            {/* Set Length Card */}
            <div className="rounded-xl border border-pink-500/40 bg-pink-950/20 p-2.5 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-pink-300 flex items-center gap-1"><Hourglass className="h-3 w-3" /> Set</span>
              <div className="flex items-center justify-center gap-1 mt-2">
                {SET_LENGTH_OPTIONS.slice(0, 3).map((o) => (
                  <button key={o.minutes} type="button" onClick={() => setSetLengthMinutes(o.minutes)} className={`px-1.5 py-0.5 rounded text-[10px] ${setLengthMinutes === o.minutes ? "bg-pink-600 font-bold text-white" : "text-white/60"}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Wrap Card */}
            <div className="rounded-xl border border-white/10 bg-[#0d061b]/60 p-2.5 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1"><Moon className="h-3 w-3" /> Wrap</span>
              <div className="flex items-center justify-between mt-2">
                <button type="button" onClick={() => handleWrapStep(-15)} className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-xs"><Minus className="h-3 w-3" /></button>
                <span className="font-mono text-xs font-bold text-amber-400">{minutesToShortTimeString(wrapMinutes)}</span>
                <button type="button" onClick={() => handleWrapStep(15)} className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-xs"><Plus className="h-3 w-3" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          LAYOUT 4: FESTIVAL CALL SHEET (Vertical Order Line)
         ══════════════════════════════════════════════════════════════ */}
      {layoutMode === 4 && (
        <div className="relative pl-6 border-l-2 border-dashed border-purple-500/40 space-y-4 my-2">
          {/* Milestone 1: Crew */}
          <div className="relative flex items-center justify-between rounded-xl border border-white/10 bg-[#0d061b]/80 p-3">
            <span className="absolute -left-[31px] flex h-4 w-4 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-emerald-400" /> Crew Load-in</p>
              <p className="text-[11px] text-white/50">{loadInSubtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => handleLoadInStep(-15)} className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center"><Minus className="h-3 w-3" /></button>
              <span className="font-mono text-xs font-bold text-emerald-400">{minutesToTimeString(loadInMinutes)}</span>
              <button type="button" onClick={() => handleLoadInStep(15)} className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center"><Plus className="h-3 w-3" /></button>
            </div>
          </div>

          {/* Milestone 2: Doors */}
          <div className="relative flex items-center justify-between rounded-xl border border-white/10 bg-[#0d061b]/80 p-3">
            <span className="absolute -left-[31px] flex h-4 w-4 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5"><DoorOpen className="h-3.5 w-3.5 text-sky-400" /> Doors Open</p>
              <p className="text-[11px] text-white/50">{doorsSubtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => handleDoorsStep(-15)} className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center"><Minus className="h-3 w-3" /></button>
              <span className="font-mono text-xs font-bold text-sky-400">{minutesToTimeString(doorsMinutes)}</span>
              <button type="button" onClick={() => handleDoorsStep(15)} className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center"><Plus className="h-3 w-3" /></button>
            </div>
          </div>

          {/* Milestone 3: Live Performance (Featured) */}
          <div className="relative flex items-center justify-between rounded-xl border border-pink-500/50 bg-gradient-to-r from-purple-950/40 to-pink-950/30 p-3.5 shadow-lg">
            <span className="absolute -left-[33px] flex h-5 w-5 rounded-full bg-pink-500 shadow-[0_0_12px_#ec4899]" />
            <div>
              <p className="text-sm font-bold text-white flex items-center gap-1.5"><Guitar className="h-4 w-4 text-pink-400" /> 7th Heaven On Stage</p>
              <p className="text-xs text-pink-200/70">{setLengthSubtitle} · {currentSetLengthObj.label} set</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => handleOnStageStep(-15)} className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center"><Minus className="h-3.5 w-3.5" /></button>
              <span className="font-mono text-sm font-bold text-pink-300">{minutesToTimeString(onStageMinutes)}</span>
              <button type="button" onClick={() => handleOnStageStep(15)} className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center"><Plus className="h-3.5 w-3.5" /></button>
            </div>
          </div>

          {/* Milestone 4: Wrap */}
          <div className="relative flex items-center justify-between rounded-xl border border-white/10 bg-[#0d061b]/80 p-3">
            <span className="absolute -left-[31px] flex h-4 w-4 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5"><Moon className="h-3.5 w-3.5 text-amber-400" /> Event Wrap &amp; Curfew</p>
              <p className="text-[11px] text-white/50">{wrapSubtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => handleWrapStep(-15)} className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center"><Minus className="h-3 w-3" /></button>
              <span className="font-mono text-xs font-bold text-amber-400">{minutesToTimeString(wrapMinutes)}</span>
              <button type="button" onClick={() => handleWrapStep(15)} className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center"><Plus className="h-3 w-3" /></button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          LAYOUT 5: BENTO GRID STUDIO
         ══════════════════════════════════════════════════════════════ */}
      {layoutMode === 5 && (
        <div className="flex flex-col gap-3">
          {renderTimelineTrack(true)}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Box 1: Pre-Show */}
            <div className="rounded-2xl border border-white/10 bg-[#0d061b]/70 p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Phase 1 · Pre-Show</span>
                <h4 className="text-sm font-bold text-white mt-1">Crew &amp; Arrival</h4>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-semibold">Load-in</span>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => handleLoadInStep(-15)} className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center"><Minus className="h-3 w-3" /></button>
                    <span className="font-mono font-bold text-emerald-400">{minutesToShortTimeString(loadInMinutes)}</span>
                    <button type="button" onClick={() => handleLoadInStep(15)} className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center"><Plus className="h-3 w-3" /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sky-400 font-semibold">Doors</span>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => handleDoorsStep(-15)} className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center"><Minus className="h-3 w-3" /></button>
                    <span className="font-mono font-bold text-sky-400">{minutesToShortTimeString(doorsMinutes)}</span>
                    <button type="button" onClick={() => handleDoorsStep(15)} className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center"><Plus className="h-3 w-3" /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Headliner (Hero Tile) */}
            <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-b from-purple-950/40 to-[#0d061b] p-4 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-[10px] uppercase font-bold text-pink-400 tracking-wider">Phase 2 · Main Event</span>
                <h4 className="text-base font-bold text-white mt-1">7th Heaven Concert</h4>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/70">On Stage</span>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => handleOnStageStep(-15)} className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center"><Minus className="h-3 w-3" /></button>
                    <span className="font-mono text-sm font-bold text-pink-300">{minutesToTimeString(onStageMinutes)}</span>
                    <button type="button" onClick={() => handleOnStageStep(15)} className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center"><Plus className="h-3 w-3" /></button>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1">
                  {SET_LENGTH_OPTIONS.map((o) => (
                    <button key={o.minutes} type="button" onClick={() => setSetLengthMinutes(o.minutes)} className={`px-2 py-0.5 rounded text-[11px] ${setLengthMinutes === o.minutes ? "bg-pink-600 text-white font-bold" : "bg-white/5 text-white/60"}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Box 3: Post-Show */}
            <div className="rounded-2xl border border-white/10 bg-[#0d061b]/70 p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Phase 3 · Post-Show</span>
                <h4 className="text-sm font-bold text-white mt-1">Curfew &amp; Wrap</h4>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-400 font-semibold">Doors Close</p>
                  <p className="text-[11px] text-white/40">{wrapSubtitle}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => handleWrapStep(-15)} className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center"><Minus className="h-3 w-3" /></button>
                  <span className="font-mono text-xs font-bold text-amber-400">{minutesToShortTimeString(wrapMinutes)}</span>
                  <button type="button" onClick={() => handleWrapStep(15)} className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center"><Plus className="h-3 w-3" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          LAYOUT 6: AUDIO RACK FADERS (Pro Mixer Channel Strips)
         ══════════════════════════════════════════════════════════════ */}
      {layoutMode === 6 && (
        <div className="rounded-2xl border border-white/10 bg-[#0b0414] p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10 text-xs font-mono uppercase text-white/50">
            <span>CH 01: LOAD-IN</span>
            <span>CH 02: DOORS</span>
            <span>CH 03: LIVE BAND</span>
            <span>CH 04: SET LEN</span>
            <span>CH 05: CURFEW</span>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center">
            {/* Channel 1 */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2 flex flex-col items-center">
              <Truck className="h-4 w-4 text-emerald-400 mb-2" />
              <button type="button" onClick={() => handleLoadInStep(15)} className="h-6 w-6 rounded bg-white/10 flex items-center justify-center text-xs text-white mb-2"><Plus className="h-3 w-3" /></button>
              <div className="h-20 w-2 rounded-full bg-white/10 relative">
                <div style={{ "--fader-h": `${(loadInMinutes / 720) * 100}%` } as React.CSSProperties} className="absolute bottom-0 w-full rounded-full bg-emerald-500 h-[var(--fader-h)]" />
              </div>
              <button type="button" onClick={() => handleLoadInStep(-15)} className="h-6 w-6 rounded bg-white/10 flex items-center justify-center text-xs text-white mt-2"><Minus className="h-3 w-3" /></button>
              <span className="font-mono text-[11px] font-bold text-emerald-400 mt-2">{minutesToShortTimeString(loadInMinutes)}</span>
            </div>

            {/* Channel 2 */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2 flex flex-col items-center">
              <DoorOpen className="h-4 w-4 text-sky-400 mb-2" />
              <button type="button" onClick={() => handleDoorsStep(15)} className="h-6 w-6 rounded bg-white/10 flex items-center justify-center text-xs text-white mb-2"><Plus className="h-3 w-3" /></button>
              <div className="h-20 w-2 rounded-full bg-white/10 relative">
                <div style={{ "--fader-h": `${(doorsMinutes / 720) * 100}%` } as React.CSSProperties} className="absolute bottom-0 w-full rounded-full bg-sky-400 h-[var(--fader-h)]" />
              </div>
              <button type="button" onClick={() => handleDoorsStep(-15)} className="h-6 w-6 rounded bg-white/10 flex items-center justify-center text-xs text-white mt-2"><Minus className="h-3 w-3" /></button>
              <span className="font-mono text-[11px] font-bold text-sky-400 mt-2">{minutesToShortTimeString(doorsMinutes)}</span>
            </div>

            {/* Channel 3: Live Band */}
            <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-2 flex flex-col items-center">
              <Guitar className="h-4 w-4 text-purple-400 mb-2" />
              <button type="button" onClick={() => handleOnStageStep(15)} className="h-6 w-6 rounded bg-white/10 flex items-center justify-center text-xs text-white mb-2"><Plus className="h-3 w-3" /></button>
              <div className="h-20 w-2 rounded-full bg-white/10 relative">
                <div style={{ "--fader-h": `${(onStageMinutes / 720) * 100}%` } as React.CSSProperties} className="absolute bottom-0 w-full rounded-full bg-purple-500 h-[var(--fader-h)]" />
              </div>
              <button type="button" onClick={() => handleOnStageStep(-15)} className="h-6 w-6 rounded bg-white/10 flex items-center justify-center text-xs text-white mt-2"><Minus className="h-3 w-3" /></button>
              <span className="font-mono text-[11px] font-bold text-purple-300 mt-2">{minutesToShortTimeString(onStageMinutes)}</span>
            </div>

            {/* Channel 4: Set Length */}
            <div className="rounded-xl border border-pink-500/30 bg-pink-950/20 p-2 flex flex-col items-center">
              <Hourglass className="h-4 w-4 text-pink-400 mb-2" />
              <div className="flex flex-col gap-1 my-auto">
                {SET_LENGTH_OPTIONS.map((o) => (
                  <button key={o.minutes} type="button" onClick={() => setSetLengthMinutes(o.minutes)} className={`text-[10px] px-1 py-0.5 rounded ${setLengthMinutes === o.minutes ? "bg-pink-600 text-white font-bold" : "text-white/50"}`}>
                    {o.label}
                  </button>
                ))}
              </div>
              <span className="font-mono text-[11px] font-bold text-pink-400 mt-2">{currentSetLengthObj.label}</span>
            </div>

            {/* Channel 5: Wrap */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2 flex flex-col items-center">
              <Moon className="h-4 w-4 text-amber-400 mb-2" />
              <button type="button" onClick={() => handleWrapStep(15)} className="h-6 w-6 rounded bg-white/10 flex items-center justify-center text-xs text-white mb-2"><Plus className="h-3 w-3" /></button>
              <div className="h-20 w-2 rounded-full bg-white/10 relative">
                <div style={{ "--fader-h": `${(wrapMinutes / 720) * 100}%` } as React.CSSProperties} className="absolute bottom-0 w-full rounded-full bg-amber-400 h-[var(--fader-h)]" />
              </div>
              <button type="button" onClick={() => handleWrapStep(-15)} className="h-6 w-6 rounded bg-white/10 flex items-center justify-center text-xs text-white mt-2"><Minus className="h-3 w-3" /></button>
              <span className="font-mono text-[11px] font-bold text-amber-400 mt-2">{minutesToShortTimeString(wrapMinutes)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          LAYOUT 7: TABBED FOCUS INSPECTOR
         ══════════════════════════════════════════════════════════════ */}
      {layoutMode === 7 && (
        <div className="flex flex-col gap-3">
          {renderTimelineTrack(true)}

          {/* Tab Selector */}
          <div className="flex gap-1 overflow-x-auto pb-1 border-b border-white/10">
            {[
              { id: "loadIn", label: "1. Load-in", icon: Truck, color: "text-emerald-400" },
              { id: "doors", label: "2. Doors Open", icon: DoorOpen, color: "text-sky-400" },
              { id: "stage", label: "3. On Stage ★", icon: Guitar, color: "text-purple-400" },
              { id: "set", label: "4. Set Length", icon: Hourglass, color: "text-pink-400" },
              { id: "wrap", label: "5. Wrap & Curfew", icon: Moon, color: "text-amber-400" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === t.id
                    ? "bg-white/10 text-white border-b-2 border-purple-400"
                    : "text-white/50 hover:text-white"
                }`}
              >
                <t.icon className={`h-3.5 w-3.5 ${t.color}`} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Focused Tab Content Card */}
          <div className="rounded-2xl border border-white/10 bg-[#0d061b]/80 p-5">
            {activeTab === "stage" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      <Guitar className="h-5 w-5 text-purple-400" />
                      7th Heaven On Stage Time
                    </h4>
                    <p className="text-xs text-white/50 mt-0.5">{onStageSubtitle}</p>
                  </div>
                  <span className="font-mono text-2xl font-bold text-purple-400">{minutesToTimeString(onStageMinutes)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleOnStageStep(-30)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10">-30m</button>
                  <button type="button" onClick={() => handleOnStageStep(-15)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10">-15m</button>
                  <button type="button" onClick={() => handleOnStageStep(15)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10">+15m</button>
                  <button type="button" onClick={() => handleOnStageStep(30)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10">+30m</button>
                </div>
              </div>
            )}

            {activeTab === "loadIn" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white flex items-center gap-2"><Truck className="h-5 w-5 text-emerald-400" /> Crew Load-in</h4>
                    <p className="text-xs text-white/50 mt-0.5">{loadInSubtitle}</p>
                  </div>
                  <span className="font-mono text-2xl font-bold text-emerald-400">{minutesToTimeString(loadInMinutes)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleLoadInStep(-30)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10">-30m</button>
                  <button type="button" onClick={() => handleLoadInStep(-15)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10">-15m</button>
                  <button type="button" onClick={() => handleLoadInStep(15)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10">+15m</button>
                  <button type="button" onClick={() => handleLoadInStep(30)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10">+30m</button>
                </div>
              </div>
            )}

            {activeTab === "doors" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white flex items-center gap-2"><DoorOpen className="h-5 w-5 text-sky-400" /> Doors Open</h4>
                    <p className="text-xs text-white/50 mt-0.5">{doorsSubtitle}</p>
                  </div>
                  <span className="font-mono text-2xl font-bold text-sky-400">{minutesToTimeString(doorsMinutes)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleDoorsStep(-30)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10">-30m</button>
                  <button type="button" onClick={() => handleDoorsStep(-15)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10">-15m</button>
                  <button type="button" onClick={() => handleDoorsStep(15)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10">+15m</button>
                  <button type="button" onClick={() => handleDoorsStep(30)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10">+30m</button>
                </div>
              </div>
            )}

            {activeTab === "set" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white flex items-center gap-2"><Hourglass className="h-5 w-5 text-pink-400" /> Concert Set Length</h4>
                    <p className="text-xs text-white/50 mt-0.5">{setLengthSubtitle}</p>
                  </div>
                  <span className="font-mono text-2xl font-bold text-pink-400">{currentSetLengthObj.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {SET_LENGTH_OPTIONS.map((o) => (
                    <button key={o.minutes} type="button" onClick={() => setSetLengthMinutes(o.minutes)} className={`px-4 py-2 rounded-xl text-xs font-bold ${setLengthMinutes === o.minutes ? "bg-pink-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "wrap" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white flex items-center gap-2"><Moon className="h-5 w-5 text-amber-400" /> Event Wrap</h4>
                    <p className="text-xs text-white/50 mt-0.5">{wrapSubtitle}</p>
                  </div>
                  <span className="font-mono text-2xl font-bold text-amber-400">{minutesToTimeString(wrapMinutes)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleWrapStep(-30)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10">-30m</button>
                  <button type="button" onClick={() => handleWrapStep(-15)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10">-15m</button>
                  <button type="button" onClick={() => handleWrapStep(15)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10">+15m</button>
                  <button type="button" onClick={() => handleWrapStep(30)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10">+30m</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          LAYOUT 8: WAVEFORM AUDIO TRACK (DJ & Live Concert EQ)
         ══════════════════════════════════════════════════════════════ */}
      {layoutMode === 8 && (
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-white/10 bg-[#0d061b] p-4">
            <div className="flex items-center justify-between mb-3 text-xs text-white/60">
              <span className="flex items-center gap-1.5 font-bold"><Volume2 className="h-4 w-4 text-pink-400" /> Live Concert Audio Waveform</span>
              <span className="font-mono text-pink-300">{minutesToTimeString(onStageMinutes)} – {setEndTimeStr}</span>
            </div>

            {/* Waveform graphic with energetic soundbars */}
            <div className="h-20 w-full flex items-center justify-between gap-1 px-2 border border-white/10 rounded-xl bg-black/40">
              {Array.from({ length: 48 }).map((_, idx) => {
                const minutePoint = (idx / 48) * TOTAL_TIMELINE_MINUTES;
                const isBandPlaying = minutePoint >= onStageMinutes && minutePoint <= onStageMinutes + setLengthMinutes;
                const isDoorsOpen = minutePoint >= doorsMinutes && minutePoint <= wrapMinutes;
                const height = isBandPlaying ? 40 + ((idx * 17) % 36) : isDoorsOpen ? 16 + ((idx * 7) % 14) : 6;
                return (
                  <div
                    key={idx}
                    style={{ "--bar-height": `${height}px` } as React.CSSProperties}
                    className={`w-full rounded-full transition-all ${
                      isBandPlaying
                        ? "bg-gradient-to-t from-purple-500 to-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)] h-[var(--bar-height)]"
                        : isDoorsOpen
                        ? "bg-sky-400/40 h-[var(--bar-height)]"
                        : "bg-white/10 h-[var(--bar-height)]"
                    }`}
                  />
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-white/50">
              <span>Ambient / House Music</span>
              <span className="text-pink-400 font-bold">★★★ High Energy Live Rock Set ★★★</span>
              <span>Encore &amp; Load-out</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button type="button" onClick={() => handleOnStageStep(-15)} className="p-3 rounded-xl border border-white/10 bg-[#0d061b]/60 hover:bg-[#0d061b] text-left">
              <span className="text-[10px] text-white/50 uppercase">Shift Set Earlier</span>
              <p className="text-xs font-bold text-purple-300 mt-0.5">-15 Minutes</p>
            </button>
            <button type="button" onClick={() => handleOnStageStep(15)} className="p-3 rounded-xl border border-white/10 bg-[#0d061b]/60 hover:bg-[#0d061b] text-left">
              <span className="text-[10px] text-white/50 uppercase">Shift Set Later</span>
              <p className="text-xs font-bold text-purple-300 mt-0.5">+15 Minutes</p>
            </button>
            <button type="button" onClick={() => setSetLengthMinutes(Math.max(60, setLengthMinutes - 30))} className="p-3 rounded-xl border border-white/10 bg-[#0d061b]/60 hover:bg-[#0d061b] text-left">
              <span className="text-[10px] text-white/50 uppercase">Shorter Set</span>
              <p className="text-xs font-bold text-pink-300 mt-0.5">-30m Duration</p>
            </button>
            <button type="button" onClick={() => setSetLengthMinutes(Math.min(180, setLengthMinutes + 30))} className="p-3 rounded-xl border border-white/10 bg-[#0d061b]/60 hover:bg-[#0d061b] text-left">
              <span className="text-[10px] text-white/50 uppercase">Longer Set</span>
              <p className="text-xs font-bold text-pink-300 mt-0.5">+30m Duration</p>
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          LAYOUT 9: CIRCULAR 12H CLOCK ARC (Phase Dial)
         ══════════════════════════════════════════════════════════════ */}
      {layoutMode === 9 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center rounded-2xl border border-white/10 bg-[#0d061b]/80 p-5">
          {/* Dial SVG */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative h-48 w-48 flex items-center justify-center">
              <svg className="h-48 w-48 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="transparent" />
                {/* Event Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#38bdf8"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${(eventWidthPct / 100) * 264} 264`}
                  strokeDashoffset={`${-((eventLeftPct / 100) * 264)}`}
                />
                {/* Band Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#ec4899"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${(bandWidthPct / 100) * 264} 264`}
                  strokeDashoffset={`${-((bandLeftPct / 100) * 264)}`}
                />
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">7th Heaven</span>
                <span className="font-mono text-sm font-bold text-white">{minutesToShortTimeString(onStageMinutes)}</span>
                <span className="text-[10px] text-white/40">{currentSetLengthObj.label} set</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-white/50">12 PM to 12 AM Clock Rotation</p>
          </div>

          {/* Steppers */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 text-xs">
              <span className="text-emerald-400 font-bold">1. Load-in</span>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => handleLoadInStep(-15)} className="h-6 w-6 rounded bg-white/10 flex items-center justify-center">-</button>
                <span className="font-mono font-bold text-white">{minutesToTimeString(loadInMinutes)}</span>
                <button type="button" onClick={() => handleLoadInStep(15)} className="h-6 w-6 rounded bg-white/10 flex items-center justify-center">+</button>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 text-xs">
              <span className="text-sky-400 font-bold">2. Doors Open</span>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => handleDoorsStep(-15)} className="h-6 w-6 rounded bg-white/10 flex items-center justify-center">-</button>
                <span className="font-mono font-bold text-white">{minutesToTimeString(doorsMinutes)}</span>
                <button type="button" onClick={() => handleDoorsStep(15)} className="h-6 w-6 rounded bg-white/10 flex items-center justify-center">+</button>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs">
              <span className="text-purple-300 font-bold">3. Band On Stage</span>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => handleOnStageStep(-15)} className="h-6 w-6 rounded bg-white/10 flex items-center justify-center">-</button>
                <span className="font-mono font-bold text-pink-300">{minutesToTimeString(onStageMinutes)}</span>
                <button type="button" onClick={() => handleOnStageStep(15)} className="h-6 w-6 rounded bg-white/10 flex items-center justify-center">+</button>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 text-xs">
              <span className="text-amber-400 font-bold">4. Event Wrap</span>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => handleWrapStep(-15)} className="h-6 w-6 rounded bg-white/10 flex items-center justify-center">-</button>
                <span className="font-mono font-bold text-white">{minutesToTimeString(wrapMinutes)}</span>
                <button type="button" onClick={() => handleWrapStep(15)} className="h-6 w-6 rounded bg-white/10 flex items-center justify-center">+</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          LAYOUT 10: FAST SCHEDULE PRESETS (One-Click Itineraries)
         ══════════════════════════════════════════════════════════════ */}
      {layoutMode === 10 && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {[
              {
                title: "Nightclub / Theatre",
                desc: "Load-in 3PM · Doors 6PM · Stage 7PM (2h)",
                data: { loadIn: 180, doors: 360, stage: 420, length: 120, wrap: 660 },
              },
              {
                title: "Festival Headliner",
                desc: "Load-in 4PM · Doors 6:30PM · Stage 8:30PM (2h)",
                data: { loadIn: 240, doors: 390, stage: 510, length: 120, wrap: 720 },
              },
              {
                title: "Corporate Evening",
                desc: "Load-in 2PM · Doors 5PM · Stage 6:30PM (90m)",
                data: { loadIn: 120, doors: 300, stage: 390, length: 90, wrap: 570 },
              },
              {
                title: "Afternoon Festival",
                desc: "Load-in 12PM · Doors 1PM · Stage 3PM (2h)",
                data: { loadIn: 0, doors: 60, stage: 180, length: 120, wrap: 420 },
              },
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p.data)}
                className="rounded-xl border border-white/10 bg-[#0d061b]/80 p-3 text-left hover:border-purple-500/50 hover:bg-purple-950/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-purple-300">{p.title}</span>
                  <Sparkles className="h-3.5 w-3.5 text-purple-400 opacity-60 group-hover:opacity-100" />
                </div>
                <p className="mt-1 text-[11px] text-white/50">{p.desc}</p>
              </button>
            ))}
          </div>

          {/* Resulting Timeline */}
          {renderTimelineTrack(false)}

          {/* Quick Fine-Tuning Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0d061b]/60 p-2.5">
              <div>
                <span className="block text-[10px] text-white/50 uppercase font-bold">1. Load-in</span>
                <span className="font-mono text-xs font-bold text-emerald-400">{minutesToTimeString(loadInMinutes)}</span>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => handleLoadInStep(-15)} className="h-6 w-6 rounded-md bg-white/10 flex items-center justify-center text-xs font-bold hover:bg-white/20">-</button>
                <button type="button" onClick={() => handleLoadInStep(15)} className="h-6 w-6 rounded-md bg-white/10 flex items-center justify-center text-xs font-bold hover:bg-white/20">+</button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0d061b]/60 p-2.5">
              <div>
                <span className="block text-[10px] text-white/50 uppercase font-bold">2. Doors</span>
                <span className="font-mono text-xs font-bold text-sky-400">{minutesToTimeString(doorsMinutes)}</span>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => handleDoorsStep(-15)} className="h-6 w-6 rounded-md bg-white/10 flex items-center justify-center text-xs font-bold hover:bg-white/20">-</button>
                <button type="button" onClick={() => handleDoorsStep(15)} className="h-6 w-6 rounded-md bg-white/10 flex items-center justify-center text-xs font-bold hover:bg-white/20">+</button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-purple-500/40 bg-purple-950/40 p-2.5 shadow-sm shadow-purple-950">
              <div>
                <span className="block text-[10px] text-purple-300 uppercase font-bold">3. On Stage</span>
                <span className="font-mono text-xs font-bold text-purple-200">{minutesToTimeString(onStageMinutes)}</span>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => handleOnStageStep(-15)} className="h-6 w-6 rounded-md bg-white/10 flex items-center justify-center text-xs font-bold hover:bg-white/20">-</button>
                <button type="button" onClick={() => handleOnStageStep(15)} className="h-6 w-6 rounded-md bg-white/10 flex items-center justify-center text-xs font-bold hover:bg-white/20">+</button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0d061b]/60 p-2.5">
              <div>
                <span className="block text-[10px] text-white/50 uppercase font-bold">4. Curfew</span>
                <span className="font-mono text-xs font-bold text-amber-400">{minutesToTimeString(wrapMinutes)}</span>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => handleWrapStep(-15)} className="h-6 w-6 rounded-md bg-white/10 flex items-center justify-center text-xs font-bold hover:bg-white/20">-</button>
                <button type="button" onClick={() => handleWrapStep(15)} className="h-6 w-6 rounded-md bg-white/10 flex items-center justify-center text-xs font-bold hover:bg-white/20">+</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
