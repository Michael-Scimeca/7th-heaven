"use client";

import React, { useState } from "react";
import { ArrowRight, Zap, Clock, Sparkles, Music, Calendar, Volume2, Radio, Sliders, MoveHorizontal, Flame } from "lucide-react";
import { DotChevronDown } from "@/components/ui/DotArrow";
import {
  DraggableTimelineSetups,
  DRAG_SETUPS,
  type DragSetupId,
} from "@/components/DraggableTimelineSetups";
import {
  DualBarTimelineSetups,
  DUAL_BAR_SETUPS,
  type DualBarSetupId,
} from "@/components/DualBarTimelineSetups";

export const RAIL_SETUPS = [
  {
    id: 1,
    name: "1. Laser-Threaded Rail",
    desc: "Neon laser beam threads directly through the center of all 4 milestone pills",
  },
  {
    id: 2,
    name: "2. Pro Audio Console",
    desc: "Concert soundboard channel strip with LED level meters and fader modules",
  },
  {
    id: 3,
    name: "3. Proportional Time Bar",
    desc: "True time-scaled horizontal bar reflecting actual duration proportions",
  },
  {
    id: 4,
    name: "4. Dual-Deck Milestone",
    desc: "Refined top milestone halo track with dedicated stage cards below",
  },
  {
    id: 5,
    name: "5. Neon Waveform Track",
    desc: "Glowing audio frequency waveform with rock concert energy peak during live set",
  },
] as const;

export type RailSetupId = (typeof RAIL_SETUPS)[number]["id"];

const EVENT_START_TIMES = [
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
];

const BAND_START_TIMES = [
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
  "9:00 PM",
  "9:30 PM",
  "10:00 PM",
];

const BAND_END_TIMES = [
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "9:30 PM",
  "10:00 PM",
  "10:30 PM",
  "11:00 PM",
  "11:30 PM",
  "12:00 AM",
  "12:30 AM",
  "1:00 AM",
];

const EVENT_END_TIMES = [
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
  "10:30 PM",
  "11:00 PM",
  "11:30 PM",
  "12:00 AM",
  "12:30 AM",
  "1:00 AM",
  "1:30 AM",
  "2:00 AM",
];

function formatDuration(minutes: number, label: string = ""): string {
  const hours = minutes / 60;
  const formatted = Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
  return label ? `${formatted} ${label}` : formatted;
}

interface RailDropdownProps {
  stage: "eventStart" | "bandStart" | "bandEnd" | "eventEnd";
  time: string;
  openTimeline: string | null;
  setOpenTimeline: (s: string | null) => void;
  times: string[];
  popoverTitle: string;
  popoverAlign?: "left" | "right";
  onSelectTime: (stage: string, t: string) => void;
}

function RailDropdownPopover({
  stage,
  time,
  openTimeline,
  setOpenTimeline,
  times,
  popoverTitle,
  popoverAlign = "left",
  onSelectTime,
}: RailDropdownProps) {
  const isOpen = openTimeline === stage;
  if (!isOpen) return null;

  return (
    <div
      role="listbox"
      data-lenis-prevent
      aria-label={popoverTitle}
      className={`absolute top-12 ${
        popoverAlign === "right" ? "left-0 sm:left-auto sm:right-0" : "left-0"
      } z-50 w-64 rounded-2xl border border-white/20 bg-[#0d1522]/95 p-3.5 shadow-2xl backdrop-blur-2xl`}
    >
      <div className="mb-2 text-[10px] font-bold text-white/70 uppercase">
        {popoverTitle}
      </div>
      <div
        data-lenis-prevent
        className="custom-scrollbar grid max-h-56 grid-cols-2 gap-1.5 overflow-y-auto overscroll-contain pr-1 touch-pan-y"
      >
        {times.map((t) => {
          const isSelected = t === time;
          return (
            <button
              key={t}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => {
                onSelectTime(stage, t);
                setOpenTimeline(null);
              }}
              className={`rounded-xl border px-2.5 py-2 text-xs font-semibold transition-all ${
                isSelected
                  ? "border-white/40 bg-white/20 text-white font-bold shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                  : "border-white/10 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/15 hover:text-white"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface ProgressionLayoutsProps {
  layoutId: number;
  onSelectLayout: (id: number) => void;
  openTimeline: string | null;
  setOpenTimeline: (stage: string | null) => void;
  effectiveEventStart: string;
  effectiveBandStart: string;
  effectiveBandEnd: string;
  effectiveEventEnd: string;
  handleSelectTimelineTime: (stage: string, t: string) => void;
  bandLiveMinutes: number;
  totalEventMinutes: number;
  preShowMinutes: number;
  postShowMinutes: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function ProgressionLayouts({
  layoutId,
  onSelectLayout,
  openTimeline,
  setOpenTimeline,
  effectiveEventStart,
  effectiveBandStart,
  effectiveBandEnd,
  effectiveEventEnd,
  handleSelectTimelineTime,
  bandLiveMinutes,
  totalEventMinutes,
  preShowMinutes,
  postShowMinutes,
  containerRef,
}: ProgressionLayoutsProps) {
  const [timelineMode, setTimelineMode] = useState<"dual" | "drag" | "dropdown">("dual");
  const [dualLayoutId, setDualLayoutId] = useState<DualBarSetupId>(1);
  const [dragLayoutId, setDragLayoutId] = useState<DragSetupId>(1);

  const currentDualSetup = DUAL_BAR_SETUPS.find((s) => s.id === dualLayoutId) || DUAL_BAR_SETUPS[0];
  const currentDropdownSetup = RAIL_SETUPS.find((s) => s.id === layoutId) || RAIL_SETUPS[0];
  const currentDragSetup = DRAG_SETUPS.find((s) => s.id === dragLayoutId) || DRAG_SETUPS[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Interactive Toolbar: Mode Switcher + Setup Tabs */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/50 p-3.5 backdrop-blur-xl">
        {/* Mode Toggle Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-pink-500/20 text-pink-300">
              <MoveHorizontal className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Timeline Interaction Modes:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-white/15 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setTimelineMode("dual")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                timelineMode === "dual"
                  ? "border border-pink-400 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.6)]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Flame className="h-3.5 w-3.5 text-yellow-300" />
              10 Dual Setups (Drag + Dropdown)
            </button>
            <button
              type="button"
              onClick={() => setTimelineMode("drag")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                timelineMode === "drag"
                  ? "border border-purple-400 bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Zap className="h-3 w-3 text-yellow-300" />
              5 Drag Only
            </button>
            <button
              type="button"
              onClick={() => setTimelineMode("dropdown")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                timelineMode === "dropdown"
                  ? "border border-purple-400 bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Sparkles className="h-3 w-3 text-purple-300" />
              5 Dropdown Rails
            </button>
          </div>
        </div>

        {/* Setup Description Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
            {timelineMode === "dual"
              ? `Dual Setup (${dualLayoutId}/10): ${currentDualSetup.name}`
              : timelineMode === "drag"
              ? `Draggable Setup (${dragLayoutId}/5): ${currentDragSetup.name}`
              : `Dropdown Rail Setup (${layoutId}/5): ${currentDropdownSetup.name}`}
          </span>
          <span className="text-[11px] text-white/60">
            {timelineMode === "dual"
              ? currentDualSetup.desc
              : timelineMode === "drag"
              ? currentDragSetup.desc
              : currentDropdownSetup.desc}
          </span>
        </div>

        {/* Setup Tabs */}
        <div className="custom-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
          {timelineMode === "dual" &&
            DUAL_BAR_SETUPS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDualLayoutId(item.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  dualLayoutId === item.id
                    ? "border border-pink-400 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_14px_rgba(236,72,153,0.5)]"
                    : "border border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.name}
              </button>
            ))}

          {timelineMode === "drag" &&
            DRAG_SETUPS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDragLayoutId(item.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  dragLayoutId === item.id
                    ? "border border-pink-400 bg-pink-600 text-white shadow-[0_0_14px_rgba(236,72,153,0.5)]"
                    : "border border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.name}
              </button>
            ))}

          {timelineMode === "dropdown" &&
            RAIL_SETUPS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectLayout(item.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  layoutId === item.id
                    ? "border border-purple-400 bg-purple-600 text-white shadow-[0_0_14px_rgba(168,85,247,0.45)]"
                    : "border border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.name}
              </button>
            ))}
        </div>
      </div>

      {/* Container where the active setup renders */}
      <div ref={containerRef} className="relative">
        {/* Render Active Dual-Action Setup (Drag + Dropdown) */}
        {timelineMode === "dual" && (
          <DualBarTimelineSetups
            layoutId={dualLayoutId}
            effectiveEventStart={effectiveEventStart}
            effectiveBandStart={effectiveBandStart}
            effectiveBandEnd={effectiveBandEnd}
            effectiveEventEnd={effectiveEventEnd}
            handleSelectTimelineTime={handleSelectTimelineTime}
            openTimeline={openTimeline}
            setOpenTimeline={setOpenTimeline}
            bandLiveMinutes={bandLiveMinutes}
            totalEventMinutes={totalEventMinutes}
            preShowMinutes={preShowMinutes}
            postShowMinutes={postShowMinutes}
          />
        )}

        {/* Render Active Draggable Setup */}
        {timelineMode === "drag" && (
          <DraggableTimelineSetups
            layoutId={dragLayoutId}
            effectiveEventStart={effectiveEventStart}
            effectiveBandStart={effectiveBandStart}
            effectiveBandEnd={effectiveBandEnd}
            effectiveEventEnd={effectiveEventEnd}
            handleSelectTimelineTime={handleSelectTimelineTime}
            bandLiveMinutes={bandLiveMinutes}
            totalEventMinutes={totalEventMinutes}
            preShowMinutes={preShowMinutes}
            postShowMinutes={postShowMinutes}
          />
        )}

        {/* Render Dropdown Setups */}
        {timelineMode === "dropdown" && (
          <>
        {/* ============================================================ */}
        {/* SETUP 1: Laser-Threaded Rail (Beam passes through capsules)  */}
        {/* ============================================================ */}
        {layoutId === 1 && (
          <div className="relative rounded-3xl border border-white/20 bg-white/[0.04] p-5 sm:p-6 backdrop-blur-2xl">
            {/* The Connected Laser Beam */}
            <div className="relative mx-3 my-4 hidden lg:block">
              {/* Dim Base Wire */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/15" />
              {/* Glowing Performance Laser between 33% and 66% */}
              <div className="absolute top-[18px] left-[32%] right-[32%] h-1 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 shadow-[0_0_15px_rgba(217,70,239,0.9)]" />

              {/* Live Performance Chip pinned directly in the center of the laser */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                <span className="flex items-center gap-1.5 rounded-full border border-purple-400/50 bg-[#0d1522] px-3 py-1 text-[11px] font-bold text-purple-200 shadow-[0_0_16px_rgba(168,85,247,0.4)]">
                  <Zap className="h-3 w-3 text-purple-400" />
                  🎸 {formatDuration(bandLiveMinutes, "Live Concert")}
                </span>
              </div>
            </div>

            {/* 4 Threaded Capsules */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Node 1: Doors */}
              <div className="relative flex flex-col">
                <button
                  type="button"
                  id="cal-event-start-btn"
                  aria-haspopup="listbox"
                  aria-expanded={openTimeline === "eventStart"}
                  onClick={() => setOpenTimeline(openTimeline === "eventStart" ? null : "eventStart")}
                  className={`flex h-11 w-full justify-between cursor-pointer items-center gap-2 rounded-full border px-4 text-xs font-bold uppercase transition-all ${
                    openTimeline === "eventStart"
                      ? "border-white/50 bg-white/[0.16] text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                      : "border-white/20 bg-[#0d1522]/90 text-white hover:border-white/35 hover:bg-white/[0.12]"
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-[10px] text-white/50 tracking-wider">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white">1</span>
                    DOORS:
                  </span>
                  <span className="text-white font-bold">{effectiveEventStart}</span>
                  <DotChevronDown className="h-3 w-3 text-white/60" />
                </button>
                <span className="mt-1.5 pl-3 text-[10px] text-white/40">Guests Arrive</span>
                <RailDropdownPopover
                  stage="eventStart"
                  time={effectiveEventStart}
                  openTimeline={openTimeline}
                  setOpenTimeline={setOpenTimeline}
                  times={EVENT_START_TIMES}
                  popoverTitle="Select Doors Open Time"
                  onSelectTime={handleSelectTimelineTime}
                />
              </div>

              {/* Node 2: Showtime */}
              <div className="relative flex flex-col">
                <button
                  type="button"
                  id="cal-band-start-btn"
                  aria-haspopup="listbox"
                  aria-expanded={openTimeline === "bandStart"}
                  onClick={() => setOpenTimeline(openTimeline === "bandStart" ? null : "bandStart")}
                  className={`flex h-11 w-full justify-between cursor-pointer items-center gap-2 rounded-full border px-4 text-xs font-bold uppercase transition-all ${
                    openTimeline === "bandStart"
                      ? "border-purple-400 bg-purple-600/30 text-white shadow-[0_0_18px_rgba(168,85,247,0.3)]"
                      : "border-purple-500/40 bg-purple-950/80 text-white hover:border-purple-400 hover:bg-purple-900/60"
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-[10px] text-purple-300 tracking-wider">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/30 text-[10px] font-bold text-purple-200">2</span>
                    SHOWTIME:
                  </span>
                  <span className="text-white font-bold">{effectiveBandStart}</span>
                  <DotChevronDown className="h-3 w-3 text-purple-300" />
                </button>
                <span className="mt-1.5 pl-3 text-[10px] text-purple-300/60">Live Show Starts</span>
                <RailDropdownPopover
                  stage="bandStart"
                  time={effectiveBandStart}
                  openTimeline={openTimeline}
                  setOpenTimeline={setOpenTimeline}
                  times={BAND_START_TIMES}
                  popoverTitle="Select Showtime"
                  onSelectTime={handleSelectTimelineTime}
                />
              </div>

              {/* Node 3: Encore / Finish */}
              <div className="relative flex flex-col">
                <button
                  type="button"
                  id="cal-band-finish-btn"
                  aria-haspopup="listbox"
                  aria-expanded={openTimeline === "bandEnd"}
                  onClick={() => setOpenTimeline(openTimeline === "bandEnd" ? null : "bandEnd")}
                  className={`flex h-11 w-full justify-between cursor-pointer items-center gap-2 rounded-full border px-4 text-xs font-bold uppercase transition-all ${
                    openTimeline === "bandEnd"
                      ? "border-purple-400 bg-purple-600/30 text-white shadow-[0_0_18px_rgba(168,85,247,0.3)]"
                      : "border-purple-500/40 bg-purple-950/80 text-white hover:border-purple-400 hover:bg-purple-900/60"
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-[10px] text-purple-300 tracking-wider">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/30 text-[10px] font-bold text-purple-200">3</span>
                    ENCORE:
                  </span>
                  <span className="text-white font-bold">{effectiveBandEnd}</span>
                  <DotChevronDown className="h-3 w-3 text-purple-300" />
                </button>
                <span className="mt-1.5 pl-3 text-[10px] text-purple-300/60">Final Encore Finish</span>
                <RailDropdownPopover
                  stage="bandEnd"
                  time={effectiveBandEnd}
                  openTimeline={openTimeline}
                  setOpenTimeline={setOpenTimeline}
                  times={BAND_END_TIMES}
                  popoverTitle="Select Encore Finish"
                  popoverAlign="right"
                  onSelectTime={handleSelectTimelineTime}
                />
              </div>

              {/* Node 4: Curfew */}
              <div className="relative flex flex-col">
                <button
                  type="button"
                  id="cal-event-end-btn"
                  aria-haspopup="listbox"
                  aria-expanded={openTimeline === "eventEnd"}
                  onClick={() => setOpenTimeline(openTimeline === "eventEnd" ? null : "eventEnd")}
                  className={`flex h-11 w-full justify-between cursor-pointer items-center gap-2 rounded-full border px-4 text-xs font-bold uppercase transition-all ${
                    openTimeline === "eventEnd"
                      ? "border-white/50 bg-white/[0.16] text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                      : "border-white/20 bg-[#0d1522]/90 text-white hover:border-white/35 hover:bg-white/[0.12]"
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-[10px] text-white/50 tracking-wider">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white">4</span>
                    CURFEW:
                  </span>
                  <span className="text-white font-bold">{effectiveEventEnd}</span>
                  <DotChevronDown className="h-3 w-3 text-white/60" />
                </button>
                <span className="mt-1.5 pl-3 text-[10px] text-white/40">Party Concludes</span>
                <RailDropdownPopover
                  stage="eventEnd"
                  time={effectiveEventEnd}
                  openTimeline={openTimeline}
                  setOpenTimeline={setOpenTimeline}
                  times={EVENT_END_TIMES}
                  popoverTitle="Select Curfew Time"
                  popoverAlign="right"
                  onSelectTime={handleSelectTimelineTime}
                />
              </div>
            </div>

            {/* Bottom Status Summary */}
            <div className="mt-4 flex flex-wrap items-center justify-between border-t border-white/10 pt-3 text-xs">
              <span className="text-white/60">
                Pre-show: <strong>{formatDuration(preShowMinutes)}</strong> • Post-show: <strong>{formatDuration(postShowMinutes)}</strong>
              </span>
              <span className="flex items-center gap-2 font-bold text-white">
                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-purple-300">
                  🎸 {formatDuration(bandLiveMinutes, "Live Set")}
                </span>
                <span className="text-white/30">•</span>
                <span>{formatDuration(totalEventMinutes, "Total Event Window")}</span>
              </span>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SETUP 2: Pro Audio Console / Soundboard Level Meter           */}
        {/* ============================================================ */}
        {layoutId === 2 && (
          <div className="flex flex-col gap-4 rounded-3xl border border-white/20 bg-[#080d16]/90 p-5 sm:p-6 backdrop-blur-2xl">
            {/* Top Soundboard Header & Segmented LED Meter */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
                <Sliders className="h-4 w-4" /> Stage Channel Rack & Run-of-Show
              </span>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                <span className="text-[11px] font-semibold text-white/70">Console Active</span>
              </div>
            </div>

            {/* 4 Audio Channel Strips */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  stage: "eventStart" as const,
                  ch: "CH 01",
                  title: "DOORS OPEN",
                  time: effectiveEventStart,
                  sub: "Guests arrive / lounge",
                  times: EVENT_START_TIMES,
                  led: "bg-emerald-400 shadow-[0_0_8px_#34d399]",
                  badge: "Arrival",
                  hl: false,
                },
                {
                  stage: "bandStart" as const,
                  ch: "CH 02",
                  title: "BAND SHOWTIME",
                  time: effectiveBandStart,
                  sub: "7th Heaven takes stage",
                  times: BAND_START_TIMES,
                  led: "bg-purple-400 shadow-[0_0_10px_#c084fc]",
                  badge: "Live Concert",
                  hl: true,
                },
                {
                  stage: "bandEnd" as const,
                  ch: "CH 03",
                  title: "FINAL ENCORE",
                  time: effectiveBandEnd,
                  sub: "Closing set & bows",
                  times: BAND_END_TIMES,
                  led: "bg-pink-400 shadow-[0_0_10px_#f472b6]",
                  badge: "Encore",
                  hl: true,
                },
                {
                  stage: "eventEnd" as const,
                  ch: "CH 04",
                  title: "VENUE CURFEW",
                  time: effectiveEventEnd,
                  sub: "Party concludes",
                  times: EVENT_END_TIMES,
                  led: "bg-cyan-400 shadow-[0_0_8px_#22d3ee]",
                  badge: "Curfew",
                  hl: false,
                },
              ].map((strip, idx) => (
                <div
                  key={strip.stage}
                  className={`relative flex flex-col justify-between rounded-2xl border p-4 transition-all ${
                    strip.hl
                      ? "border-purple-400/40 bg-purple-950/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                      : "border-white/15 bg-white/[0.03]"
                  }`}
                >
                  {/* Channel Header */}
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/40">
                      {strip.ch}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${strip.led}`} />
                      <span className="text-[10px] font-bold text-white/80">{strip.badge}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-xs font-bold text-white uppercase">{strip.title}</div>
                    <div className="text-[11px] text-white/50">{strip.sub}</div>
                  </div>

                  {/* Fader Pill Button */}
                  <div className="relative">
                    <button
                      type="button"
                      id={`cal-${strip.stage}-btn`}
                      aria-haspopup="listbox"
                      aria-expanded={openTimeline === strip.stage}
                      onClick={() => setOpenTimeline(openTimeline === strip.stage ? null : strip.stage)}
                      className={`flex h-10 w-full justify-between cursor-pointer items-center gap-2 rounded-xl border px-3 text-xs font-bold uppercase transition-all ${
                        openTimeline === strip.stage
                          ? "border-white/50 bg-white/20 text-white shadow-[0_0_12px_rgba(255,255,255,0.2)]"
                          : "border-white/20 bg-white/10 text-white hover:border-white/35 hover:bg-white/15"
                      }`}
                    >
                      <span className="text-[10px] text-white/50 tracking-wider">SET:</span>
                      <span className="text-white font-bold">{strip.time}</span>
                      <DotChevronDown className="h-3 w-3 text-white/60" />
                    </button>

                    <RailDropdownPopover
                      stage={strip.stage}
                      time={strip.time}
                      openTimeline={openTimeline}
                      setOpenTimeline={setOpenTimeline}
                      times={strip.times}
                      popoverTitle={strip.title}
                      popoverAlign={idx >= 2 ? "right" : "left"}
                      onSelectTime={handleSelectTimelineTime}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Master Console VU Meter Footer */}
            <div className="flex flex-wrap items-center justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs">
              <span className="flex items-center gap-2 text-white/70">
                <Volume2 className="h-4 w-4 text-purple-400" />
                Live Performance Duration: <strong className="text-purple-300">{formatDuration(bandLiveMinutes)}</strong>
              </span>
              <span className="font-bold text-white">
                Total Venue Reservation: <strong className="text-white">{formatDuration(totalEventMinutes)}</strong>
              </span>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SETUP 3: Proportional Time Bar (True scaled visual bar)      */}
        {/* ============================================================ */}
        {layoutId === 3 && (
          <div className="flex flex-col gap-5 rounded-3xl border border-white/20 bg-white/[0.04] p-5 sm:p-6 backdrop-blur-2xl">
            {/* Header info */}
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/60">
              <span>Dynamic Timeline Scale</span>
              <span>{formatDuration(totalEventMinutes, "Total Booking")}</span>
            </div>

            {/* Scaled Proportional Visual Bar */}
            <div className="relative flex h-14 w-full overflow-hidden rounded-2xl border border-white/15 bg-black/40 p-1">
              {/* Segment 1: Pre-Show */}
              <div className="relative flex w-[25%] flex-col justify-center rounded-l-xl bg-cyan-950/40 px-3 text-left transition-all">
                <span className="text-[10px] font-bold text-cyan-300 uppercase">Pre-Show</span>
                <span className="text-[11px] font-semibold text-white/80">{formatDuration(preShowMinutes)}</span>
              </div>

              {/* Segment 2: 7th Heaven Live Concert (Glowing highlight) */}
              <div className="relative flex w-[55%] flex-col justify-center bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-4 text-left shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all">
                <div className="flex items-center gap-1.5 text-xs font-black text-white uppercase tracking-wider">
                  <Zap className="h-3.5 w-3.5" /> 7TH HEAVEN LIVE CONCERT
                </div>
                <span className="text-[11px] font-bold text-purple-100">
                  🎸 {formatDuration(bandLiveMinutes, "Live Set Duration")}
                </span>
              </div>

              {/* Segment 3: Post-Show */}
              <div className="relative flex w-[20%] flex-col justify-center rounded-r-xl bg-cyan-950/40 px-3 text-left transition-all">
                <span className="text-[10px] font-bold text-cyan-300 uppercase">Post-Show</span>
                <span className="text-[11px] font-semibold text-white/80">{formatDuration(postShowMinutes)}</span>
              </div>
            </div>

            {/* 4 Interactive Dropdown Pins directly anchored below the bar */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <button
                  type="button"
                  id="cal-event-start-btn"
                  aria-haspopup="listbox"
                  aria-expanded={openTimeline === "eventStart"}
                  onClick={() => setOpenTimeline(openTimeline === "eventStart" ? null : "eventStart")}
                  className={`flex h-11 w-full justify-between cursor-pointer items-center gap-2 rounded-2xl border px-3.5 text-xs font-bold uppercase transition-all ${
                    openTimeline === "eventStart"
                      ? "border-white/50 bg-white/20 text-white shadow-[0_0_12px_rgba(255,255,255,0.2)]"
                      : "border-white/20 bg-white/[0.06] text-white hover:border-white/35"
                  }`}
                >
                  <span className="text-[10px] text-white/50">1. DOORS:</span>
                  <span className="text-white font-bold">{effectiveEventStart}</span>
                  <DotChevronDown className="h-3 w-3 text-white/60" />
                </button>
                <span className="mt-1 block pl-3 text-[10px] text-white/40">Guests Arrive</span>
                <RailDropdownPopover
                  stage="eventStart"
                  time={effectiveEventStart}
                  openTimeline={openTimeline}
                  setOpenTimeline={setOpenTimeline}
                  times={EVENT_START_TIMES}
                  popoverTitle="Doors Open"
                  onSelectTime={handleSelectTimelineTime}
                />
              </div>

              <div className="relative">
                <button
                  type="button"
                  id="cal-band-start-btn"
                  aria-haspopup="listbox"
                  aria-expanded={openTimeline === "bandStart"}
                  onClick={() => setOpenTimeline(openTimeline === "bandStart" ? null : "bandStart")}
                  className={`flex h-11 w-full justify-between cursor-pointer items-center gap-2 rounded-2xl border px-3.5 text-xs font-bold uppercase transition-all ${
                    openTimeline === "bandStart"
                      ? "border-purple-400 bg-purple-600/30 text-white shadow-[0_0_16px_rgba(168,85,247,0.3)]"
                      : "border-purple-500/40 bg-purple-950/70 text-white hover:border-purple-400"
                  }`}
                >
                  <span className="text-[10px] text-purple-300">2. SHOWTIME:</span>
                  <span className="text-white font-bold">{effectiveBandStart}</span>
                  <DotChevronDown className="h-3 w-3 text-purple-300" />
                </button>
                <span className="mt-1 block pl-3 text-[10px] text-purple-300/60">Live Show Starts</span>
                <RailDropdownPopover
                  stage="bandStart"
                  time={effectiveBandStart}
                  openTimeline={openTimeline}
                  setOpenTimeline={setOpenTimeline}
                  times={BAND_START_TIMES}
                  popoverTitle="Band Starts"
                  onSelectTime={handleSelectTimelineTime}
                />
              </div>

              <div className="relative">
                <button
                  type="button"
                  id="cal-band-finish-btn"
                  aria-haspopup="listbox"
                  aria-expanded={openTimeline === "bandEnd"}
                  onClick={() => setOpenTimeline(openTimeline === "bandEnd" ? null : "bandEnd")}
                  className={`flex h-11 w-full justify-between cursor-pointer items-center gap-2 rounded-2xl border px-3.5 text-xs font-bold uppercase transition-all ${
                    openTimeline === "bandEnd"
                      ? "border-purple-400 bg-purple-600/30 text-white shadow-[0_0_16px_rgba(168,85,247,0.3)]"
                      : "border-purple-500/40 bg-purple-950/70 text-white hover:border-purple-400"
                  }`}
                >
                  <span className="text-[10px] text-purple-300">3. ENCORE:</span>
                  <span className="text-white font-bold">{effectiveBandEnd}</span>
                  <DotChevronDown className="h-3 w-3 text-purple-300" />
                </button>
                <span className="mt-1 block pl-3 text-[10px] text-purple-300/60">Final Bows</span>
                <RailDropdownPopover
                  stage="bandEnd"
                  time={effectiveBandEnd}
                  openTimeline={openTimeline}
                  setOpenTimeline={setOpenTimeline}
                  times={BAND_END_TIMES}
                  popoverTitle="Band Finishes"
                  popoverAlign="right"
                  onSelectTime={handleSelectTimelineTime}
                />
              </div>

              <div className="relative">
                <button
                  type="button"
                  id="cal-event-end-btn"
                  aria-haspopup="listbox"
                  aria-expanded={openTimeline === "eventEnd"}
                  onClick={() => setOpenTimeline(openTimeline === "eventEnd" ? null : "eventEnd")}
                  className={`flex h-11 w-full justify-between cursor-pointer items-center gap-2 rounded-2xl border px-3.5 text-xs font-bold uppercase transition-all ${
                    openTimeline === "eventEnd"
                      ? "border-white/50 bg-white/20 text-white shadow-[0_0_12px_rgba(255,255,255,0.2)]"
                      : "border-white/20 bg-white/[0.06] text-white hover:border-white/35"
                  }`}
                >
                  <span className="text-[10px] text-white/50">4. CURFEW:</span>
                  <span className="text-white font-bold">{effectiveEventEnd}</span>
                  <DotChevronDown className="h-3 w-3 text-white/60" />
                </button>
                <span className="mt-1 block pl-3 text-[10px] text-white/40">Party Concludes</span>
                <RailDropdownPopover
                  stage="eventEnd"
                  time={effectiveEventEnd}
                  openTimeline={openTimeline}
                  setOpenTimeline={setOpenTimeline}
                  times={EVENT_END_TIMES}
                  popoverTitle="Event Ends"
                  popoverAlign="right"
                  onSelectTime={handleSelectTimelineTime}
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SETUP 4: Dual-Deck Milestone Halo Rail                        */}
        {/* ============================================================ */}
        {layoutId === 4 && (
          <div className="flex flex-col gap-4 rounded-3xl border border-white/20 bg-white/[0.04] p-5 sm:p-6 backdrop-blur-2xl">
            {/* Top Milestone Halo Rail */}
            <div className="relative mx-3 hidden sm:block">
              {/* Rail Line */}
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/10" />
              {/* Pulsing Active Concert Rail Section */}
              <div className="absolute top-[15px] left-[33%] right-[33%] h-1 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]" />

              {/* 4 Halo Rings */}
              <div className="relative flex justify-between">
                {[
                  { id: "1", title: "DOORS OPEN", subtitle: "Cocktail Hour", glow: "border-white/30 bg-[#0d1522]" },
                  { id: "2", title: "SHOWTIME", subtitle: "Concert Starts", glow: "border-purple-400 bg-purple-900 shadow-[0_0_15px_rgba(168,85,247,0.7)]" },
                  { id: "3", title: "CURTAIN CALL", subtitle: "Final Encore", glow: "border-purple-400 bg-purple-900 shadow-[0_0_15px_rgba(168,85,247,0.7)]" },
                  { id: "4", title: "CURFEW", subtitle: "Event Wrap", glow: "border-white/30 bg-[#0d1522]" },
                ].map((node) => (
                  <div key={node.id} className="flex flex-col items-center">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-black text-white ${node.glow}`}>
                      {node.id}
                    </span>
                    <span className="mt-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                      {node.title}
                    </span>
                    <span className="text-[10px] text-white/40">{node.subtitle}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Card Deck */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <button
                  type="button"
                  id="cal-event-start-btn"
                  aria-haspopup="listbox"
                  aria-expanded={openTimeline === "eventStart"}
                  onClick={() => setOpenTimeline(openTimeline === "eventStart" ? null : "eventStart")}
                  className={`flex h-11 w-full justify-between cursor-pointer items-center gap-2 rounded-2xl border px-3.5 text-xs font-bold uppercase transition-all ${
                    openTimeline === "eventStart"
                      ? "border-white/50 bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                      : "border-white/20 bg-white/[0.06] text-white hover:border-white/35 hover:bg-white/[0.12]"
                  }`}
                >
                  <span className="text-[10px] text-white/50">TIME:</span>
                  <span className="text-white font-bold">{effectiveEventStart}</span>
                  <DotChevronDown className="h-3 w-3 text-white/60" />
                </button>
                <RailDropdownPopover
                  stage="eventStart"
                  time={effectiveEventStart}
                  openTimeline={openTimeline}
                  setOpenTimeline={setOpenTimeline}
                  times={EVENT_START_TIMES}
                  popoverTitle="Select Doors Open Time"
                  onSelectTime={handleSelectTimelineTime}
                />
              </div>

              <div className="relative">
                <button
                  type="button"
                  id="cal-band-start-btn"
                  aria-haspopup="listbox"
                  aria-expanded={openTimeline === "bandStart"}
                  onClick={() => setOpenTimeline(openTimeline === "bandStart" ? null : "bandStart")}
                  className={`flex h-11 w-full justify-between cursor-pointer items-center gap-2 rounded-2xl border px-3.5 text-xs font-bold uppercase transition-all ${
                    openTimeline === "bandStart"
                      ? "border-purple-400 bg-purple-600/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                      : "border-purple-500/40 bg-purple-950/70 text-white hover:border-purple-400 hover:bg-purple-900/60"
                  }`}
                >
                  <span className="text-[10px] text-purple-300">TIME:</span>
                  <span className="text-white font-bold">{effectiveBandStart}</span>
                  <DotChevronDown className="h-3 w-3 text-purple-300" />
                </button>
                <RailDropdownPopover
                  stage="bandStart"
                  time={effectiveBandStart}
                  openTimeline={openTimeline}
                  setOpenTimeline={setOpenTimeline}
                  times={BAND_START_TIMES}
                  popoverTitle="Select Showtime"
                  onSelectTime={handleSelectTimelineTime}
                />
              </div>

              <div className="relative">
                <button
                  type="button"
                  id="cal-band-finish-btn"
                  aria-haspopup="listbox"
                  aria-expanded={openTimeline === "bandEnd"}
                  onClick={() => setOpenTimeline(openTimeline === "bandEnd" ? null : "bandEnd")}
                  className={`flex h-11 w-full justify-between cursor-pointer items-center gap-2 rounded-2xl border px-3.5 text-xs font-bold uppercase transition-all ${
                    openTimeline === "bandEnd"
                      ? "border-purple-400 bg-purple-600/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                      : "border-purple-500/40 bg-purple-950/70 text-white hover:border-purple-400 hover:bg-purple-900/60"
                  }`}
                >
                  <span className="text-[10px] text-purple-300">TIME:</span>
                  <span className="text-white font-bold">{effectiveBandEnd}</span>
                  <DotChevronDown className="h-3 w-3 text-purple-300" />
                </button>
                <RailDropdownPopover
                  stage="bandEnd"
                  time={effectiveBandEnd}
                  openTimeline={openTimeline}
                  setOpenTimeline={setOpenTimeline}
                  times={BAND_END_TIMES}
                  popoverTitle="Select Encore Finish"
                  popoverAlign="right"
                  onSelectTime={handleSelectTimelineTime}
                />
              </div>

              <div className="relative">
                <button
                  type="button"
                  id="cal-event-end-btn"
                  aria-haspopup="listbox"
                  aria-expanded={openTimeline === "eventEnd"}
                  onClick={() => setOpenTimeline(openTimeline === "eventEnd" ? null : "eventEnd")}
                  className={`flex h-11 w-full justify-between cursor-pointer items-center gap-2 rounded-2xl border px-3.5 text-xs font-bold uppercase transition-all ${
                    openTimeline === "eventEnd"
                      ? "border-white/50 bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                      : "border-white/20 bg-white/[0.06] text-white hover:border-white/35 hover:bg-white/[0.12]"
                  }`}
                >
                  <span className="text-[10px] text-white/50">TIME:</span>
                  <span className="text-white font-bold">{effectiveEventEnd}</span>
                  <DotChevronDown className="h-3 w-3 text-white/60" />
                </button>
                <RailDropdownPopover
                  stage="eventEnd"
                  time={effectiveEventEnd}
                  openTimeline={openTimeline}
                  setOpenTimeline={setOpenTimeline}
                  times={EVENT_END_TIMES}
                  popoverTitle="Select Curfew Time"
                  popoverAlign="right"
                  onSelectTime={handleSelectTimelineTime}
                />
              </div>
            </div>

            {/* Bottom Floating Pill */}
            <div className="flex flex-wrap items-center justify-between border-t border-white/10 pt-3 text-xs">
              <span className="text-white/60">
                Pre-show: <strong>{formatDuration(preShowMinutes)}</strong> • Post-show: <strong>{formatDuration(postShowMinutes)}</strong>
              </span>
              <span className="flex items-center gap-2 font-bold text-white">
                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-purple-300">
                  🎸 {formatDuration(bandLiveMinutes, "Live Performance")}
                </span>
                <span className="text-white/30">•</span>
                <span>{formatDuration(totalEventMinutes, "Total Booking")}</span>
              </span>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SETUP 5: Neon Waveform Stage Track                            */}
        {/* ============================================================ */}
        {layoutId === 5 && (
          <div className="flex flex-col gap-4 rounded-3xl border border-white/20 bg-white/[0.04] p-5 sm:p-6 backdrop-blur-2xl">
            {/* Header Audio Waveform Track */}
            <div className="relative mx-2 hidden sm:block">
              <div className="mb-2 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-widest text-white/50">
                <span>01 Doors</span>
                <span className="text-purple-300">02 Showtime</span>
                <span className="text-pink-300">03 Finale</span>
                <span>04 Curfew</span>
              </div>

              {/* Graphic Sound Waveform visualization */}
              <div className="flex h-10 items-center justify-between gap-1 rounded-2xl bg-black/40 px-4">
                {/* Intro Soft Wave */}
                <div className="flex flex-1 items-center justify-around gap-1 opacity-50">
                  <div className="h-2 w-1 rounded-full bg-white/40" />
                  <div className="h-3 w-1 rounded-full bg-white/50" />
                  <div className="h-4 w-1 rounded-full bg-white/60" />
                  <div className="h-2 w-1 rounded-full bg-white/40" />
                </div>

                {/* Roaring Live Performance Wave Peak */}
                <div className="flex flex-[2] items-center justify-around gap-1 px-4">
                  <div className="h-5 w-1 rounded-full bg-purple-400" />
                  <div className="h-8 w-1 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
                  <div className="h-7 w-1 rounded-full bg-pink-400 shadow-[0_0_10px_#f472b6]" />
                  <span className="flex items-center gap-1 rounded-full bg-purple-900/90 px-3 py-1 text-[11px] font-black text-purple-200 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    <Zap className="h-3 w-3 text-yellow-300" />
                    🎸 {formatDuration(bandLiveMinutes, "LIVE SET")}
                  </span>
                  <div className="h-7 w-1 rounded-full bg-pink-400 shadow-[0_0_10px_#f472b6]" />
                  <div className="h-8 w-1 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
                  <div className="h-5 w-1 rounded-full bg-purple-400" />
                </div>

                {/* Outro Soft Wave */}
                <div className="flex flex-1 items-center justify-around gap-1 opacity-50">
                  <div className="h-3 w-1 rounded-full bg-white/50" />
                  <div className="h-4 w-1 rounded-full bg-white/60" />
                  <div className="h-3 w-1 rounded-full bg-white/50" />
                  <div className="h-2 w-1 rounded-full bg-white/40" />
                </div>
              </div>
            </div>

            {/* 4 Floating Pills */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <button
                  type="button"
                  id="cal-event-start-btn"
                  aria-haspopup="listbox"
                  aria-expanded={openTimeline === "eventStart"}
                  onClick={() => setOpenTimeline(openTimeline === "eventStart" ? null : "eventStart")}
                  className={`flex h-11 w-full justify-between cursor-pointer items-center gap-2 rounded-full border px-4 text-xs font-bold uppercase transition-all ${
                    openTimeline === "eventStart"
                      ? "border-white/50 bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                      : "border-white/20 bg-white/[0.06] text-white hover:border-white/35 hover:bg-white/[0.12]"
                  }`}
                >
                  <span className="text-[10px] text-white/50 tracking-wider">DOORS:</span>
                  <span className="text-white font-bold">{effectiveEventStart}</span>
                  <DotChevronDown className="h-3 w-3 text-white/60" />
                </button>
                <span className="mt-1 block pl-3 text-[10px] text-white/40">Guests Arrive</span>
                <RailDropdownPopover
                  stage="eventStart"
                  time={effectiveEventStart}
                  openTimeline={openTimeline}
                  setOpenTimeline={setOpenTimeline}
                  times={EVENT_START_TIMES}
                  popoverTitle="Select Doors Open Time"
                  onSelectTime={handleSelectTimelineTime}
                />
              </div>

              <div className="relative">
                <button
                  type="button"
                  id="cal-band-start-btn"
                  aria-haspopup="listbox"
                  aria-expanded={openTimeline === "bandStart"}
                  onClick={() => setOpenTimeline(openTimeline === "bandStart" ? null : "bandStart")}
                  className={`flex h-11 w-full justify-between cursor-pointer items-center gap-2 rounded-full border px-4 text-xs font-bold uppercase transition-all ${
                    openTimeline === "bandStart"
                      ? "border-purple-400 bg-purple-600/30 text-white shadow-[0_0_18px_rgba(168,85,247,0.3)]"
                      : "border-purple-500/40 bg-purple-950/70 text-white hover:border-purple-400 hover:bg-purple-900/60"
                  }`}
                >
                  <span className="text-[10px] text-purple-300 tracking-wider">ON STAGE:</span>
                  <span className="text-white font-bold">{effectiveBandStart}</span>
                  <DotChevronDown className="h-3 w-3 text-purple-300" />
                </button>
                <span className="mt-1 block pl-3 text-[10px] text-purple-300/60">Live Show Starts</span>
                <RailDropdownPopover
                  stage="bandStart"
                  time={effectiveBandStart}
                  openTimeline={openTimeline}
                  setOpenTimeline={setOpenTimeline}
                  times={BAND_START_TIMES}
                  popoverTitle="Select Showtime"
                  onSelectTime={handleSelectTimelineTime}
                />
              </div>

              <div className="relative">
                <button
                  type="button"
                  id="cal-band-finish-btn"
                  aria-haspopup="listbox"
                  aria-expanded={openTimeline === "bandEnd"}
                  onClick={() => setOpenTimeline(openTimeline === "bandEnd" ? null : "bandEnd")}
                  className={`flex h-11 w-full justify-between cursor-pointer items-center gap-2 rounded-full border px-4 text-xs font-bold uppercase transition-all ${
                    openTimeline === "bandEnd"
                      ? "border-purple-400 bg-purple-600/30 text-white shadow-[0_0_18px_rgba(168,85,247,0.3)]"
                      : "border-purple-500/40 bg-purple-950/70 text-white hover:border-purple-400 hover:bg-purple-900/60"
                  }`}
                >
                  <span className="text-[10px] text-purple-300 tracking-wider">FINISHES:</span>
                  <span className="text-white font-bold">{effectiveBandEnd}</span>
                  <DotChevronDown className="h-3 w-3 text-purple-300" />
                </button>
                <span className="mt-1 block pl-3 text-[10px] text-purple-300/60">Final Encore Finish</span>
                <RailDropdownPopover
                  stage="bandEnd"
                  time={effectiveBandEnd}
                  openTimeline={openTimeline}
                  setOpenTimeline={setOpenTimeline}
                  times={BAND_END_TIMES}
                  popoverTitle="Select Encore Finish"
                  popoverAlign="right"
                  onSelectTime={handleSelectTimelineTime}
                />
              </div>

              <div className="relative">
                <button
                  type="button"
                  id="cal-event-end-btn"
                  aria-haspopup="listbox"
                  aria-expanded={openTimeline === "eventEnd"}
                  onClick={() => setOpenTimeline(openTimeline === "eventEnd" ? null : "eventEnd")}
                  className={`flex h-11 w-full justify-between cursor-pointer items-center gap-2 rounded-full border px-4 text-xs font-bold uppercase transition-all ${
                    openTimeline === "eventEnd"
                      ? "border-white/50 bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                      : "border-white/20 bg-white/[0.06] text-white hover:border-white/35 hover:bg-white/[0.12]"
                  }`}
                >
                  <span className="text-[10px] text-white/50 tracking-wider">CURFEW:</span>
                  <span className="text-white font-bold">{effectiveEventEnd}</span>
                  <DotChevronDown className="h-3 w-3 text-white/60" />
                </button>
                <span className="mt-1 block pl-3 text-[10px] text-white/40">Party Concludes</span>
                <RailDropdownPopover
                  stage="eventEnd"
                  time={effectiveEventEnd}
                  openTimeline={openTimeline}
                  setOpenTimeline={setOpenTimeline}
                  times={EVENT_END_TIMES}
                  popoverTitle="Select Curfew Time"
                  popoverAlign="right"
                  onSelectTime={handleSelectTimelineTime}
                />
              </div>
            </div>

            {/* Bottom Status Summary */}
            <div className="flex flex-wrap items-center justify-between border-t border-white/10 pt-3 text-xs">
              <span className="text-white/60">
                Pre-show: <strong>{formatDuration(preShowMinutes)}</strong> • Post-show: <strong>{formatDuration(postShowMinutes)}</strong>
              </span>
              <span className="flex items-center gap-2 font-bold text-white">
                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-purple-300">
                  🎸 {formatDuration(bandLiveMinutes, "Live Set")}
                </span>
                <span className="text-white/30">•</span>
                <span>{formatDuration(totalEventMinutes, "Total Event Window")}</span>
              </span>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
