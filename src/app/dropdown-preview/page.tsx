"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  DotChevronDown,
} from "@/components/ui/DotArrow";
import GlobalDropdownShowcase from "@/components/GlobalDropdownShowcase";
import FormDropdownShowcase from "@/components/FormDropdownShowcase";
import SingleDropdownShowcase from "@/components/SingleDropdownShowcase";
import {
  Zap,
  ArrowRight,
  ChevronRight,
  Music2,
  CalendarDays,
  Sparkles,
  Info,
  Clock,
  CheckCircle2,
  PartyPopper,
} from "lucide-react";

// Contextual times for each stage of an evening event
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

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/^(\d+)(?::(\d+))?\s*(AM|PM)?$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3]?.toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function calculateDiffMinutes(start: string, end: string): number {
  if (!start || !end) return 180;
  const startMins = parseTimeToMinutes(start);
  let endMins = parseTimeToMinutes(end);

  if (endMins <= startMins) {
    endMins += 24 * 60;
  }
  return Math.max(0, endMins - startMins);
}

function formatDuration(minutes: number, label: string = ""): string {
  const hours = minutes / 60;
  const formatted = Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
  return label ? `${formatted} ${label}` : formatted;
}

export default function DropdownPreviewPage() {
  // Option 1: Dual Stacked Pods
  const [opt1ShowStart, setOpt1ShowStart] = useState("6:00 PM");
  const [opt1ShowEnd, setOpt1ShowEnd] = useState("11:00 PM");
  const [opt1BandStart, setOpt1BandStart] = useState("8:00 PM");
  const [opt1BandEnd, setOpt1BandEnd] = useState("10:30 PM");
  const [openPod1, setOpenPod1] = useState<string | null>(null);

  // Option 2: 4-Stage Night Timeline Capsule (With Full Visual Explanations)
  const [tEventStart, setTEventStart] = useState("6:00 PM");
  const [tBandStart, setTBandStart] = useState("8:00 PM");
  const [tBandEnd, setTBandEnd] = useState("10:30 PM");
  const [tEventEnd, setTEventEnd] = useState("11:00 PM");
  const [openTimeline, setOpenTimeline] = useState<string | null>(null);

  // Option 3: Twin Pods with 1-Click Sync
  const [opt3ShowStart, setOpt3ShowStart] = useState("7:00 PM");
  const [opt3ShowEnd, setOpt3ShowEnd] = useState("11:00 PM");
  const [opt3BandStart, setOpt3BandStart] = useState("8:00 PM");
  const [opt3BandEnd, setOpt3BandEnd] = useState("10:30 PM");
  const [isSynced, setIsSynced] = useState(false);
  const [openPod3, setOpenPod3] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenPod1(null);
        setOpenTimeline(null);
        setOpenPod3(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenPod1(null);
        setOpenTimeline(null);
        setOpenPod3(null);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Timeline durations for Option 2
  const preShowMinutes = useMemo(
    () => calculateDiffMinutes(tEventStart, tBandStart),
    [tEventStart, tBandStart]
  );
  const bandLiveMinutes = useMemo(
    () => calculateDiffMinutes(tBandStart, tBandEnd),
    [tBandStart, tBandEnd]
  );
  const postShowMinutes = useMemo(
    () => calculateDiffMinutes(tBandEnd, tEventEnd),
    [tBandEnd, tEventEnd]
  );
  const totalEventMinutes = useMemo(
    () => calculateDiffMinutes(tEventStart, tEventEnd),
    [tEventStart, tEventEnd]
  );

  return (
    <main ref={containerRef} className="min-h-screen bg-[#0d0714] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="site-container flex flex-wrap items-center justify-between gap-4 py-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 items-center rounded-full border border-purple-500/40 bg-purple-500/20 px-2.5 text-[11px] font-bold tracking-wider text-purple-300 uppercase">
                Time Picker Labs
              </span>
              <span className="text-xs text-white/50">Solving the 4-Dropdown Booking Window</span>
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Understanding & Styling All 4 Event Times
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Clear visual explanations and interactive Connected Range Pod setups.
            </p>
          </div>
          <Link
            href="/book"
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
          >
            <ChevronRight className="h-4 w-4 rotate-180" /> Return to Booking
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="site-container py-10">
        {/* ========================================================================= */}
        {/* 8 LOCATION & SINGLE-SELECT DROPDOWN STYLES SHOWCASE */}
        {/* ========================================================================= */}
        <section aria-label="Location Dropdown Styles" className="mb-14">
          <SingleDropdownShowcase />
        </section>

        {/* ========================================================================= */}
        {/* 5 GLOBAL DROPDOWN STYLINGS SHOWCASE */}
        {/* ========================================================================= */}
        <section aria-label="Global Dropdown Styles" className="mb-14">
          <GlobalDropdownShowcase />
        </section>

        {/* ========================================================================= */}
        {/* FORM DROPDOWN (TRAVEL INSURANCE / YES-NO) LAYOUT STYLING SECTIONS         */}
        {/* ========================================================================= */}
        <section aria-label="Form Dropdown Layout Styles" className="mb-14">
          <FormDropdownShowcase />
        </section>

        {/* ========================================================================= */}
        {/* WHY ARE THERE 4 TIMES? (Explanation Callout Card) */}
        {/* ========================================================================= */}
        <div className="mb-10 rounded-2xl border border-purple-500/30 bg-purple-950/20 p-6 backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600/30 text-purple-300">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Why Does the Booking Form Ask for 4 Separate Times?
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-white/70">
                Most events (festivals, corporate galas, weddings, parties) run for 4 to 6 hours,
                but <strong>7th Heaven usually performs a 2.5 to 3-hour headline show</strong> during that time.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/40 p-3.5">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-purple-300 uppercase">
                    <CalendarDays className="h-4 w-4" /> 1. Overall Event Hours
                  </span>
                  <p className="mt-1 text-xs text-white/60">
                    <strong>Event Start & Finish:</strong> When your venue opens, guests arrive for cocktails/dinner, and when the party ends.
                    Tells our production crew when soundcheck must be completed before guests walk in.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 p-3.5">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase">
                    <Music2 className="h-4 w-4" /> 2. Band Performance Hours
                  </span>
                  <p className="mt-1 text-xs text-white/60">
                    <strong>Band Starts & Finishes:</strong> The exact window 7th Heaven is on stage playing live music.
                    Tells the band when to take the stage and coordinate sets around speeches or meals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SETUPS COMPARISON */}
        {/* ========================================================================= */}
        <div className="flex flex-col gap-12">
          {/* ========================================================================= */}
          {/* SETUP A: 4-STAGE TIMELINE CAPSULE WITH FULL VISUAL PROGRESS GAUGE */}
          {/* ========================================================================= */}
          <section
            aria-labelledby="setup-a-heading"
            className="rounded-[var(--radius-box)] border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 to-black/40 p-6 shadow-2xl backdrop-blur-md"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-cyan-400 uppercase">
                  Enhanced Option 02
                </span>
                <h2 id="setup-a-heading" className="text-xl font-bold text-white">
                  Chronological Evening Timeline (With Visual Schedule Bar)
                </h2>
              </div>
              <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                Full Visual Clarity
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-white/70 max-w-3xl">
              Eliminates confusing jargon (replaced &quot;Doors&quot; and &quot;Curfew&quot; with plain English).
              Directly below the pills, a <strong>live interactive schedule bar</strong> illustrates the pre-show dinner,
              the live band concert, and the event wrap.
            </p>

            {/* Interactive Timeline Pod */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/60 p-6">
              <span className="mb-3 block text-xs font-bold tracking-wider text-cyan-300 uppercase">
                Step-by-Step Evening Flow:
              </span>

              {/* The 4 Connected Pills */}
              <div className="relative inline-flex flex-wrap items-center gap-3 rounded-2xl border border-white/15 bg-white/5 p-3 lg:rounded-full">
                {/* 1. Event Start */}
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => setOpenTimeline(openTimeline === "eventStart" ? null : "eventStart")}
                    className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase transition-all ${
                      openTimeline === "eventStart"
                        ? "border-cyan-400 bg-cyan-500/30 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                        : "border-white/10 bg-black/40 text-white/90 hover:bg-black/60 hover:text-white"
                    }`}
                  >
                    <span className="text-[10px] text-white/50">EVENT STARTS:</span>
                    <span>{tEventStart}</span>
                    <DotChevronDown className="h-3 w-3 text-cyan-300" />
                  </button>
                  <span className="mt-1 pl-3 text-[10px] text-white/40">Guests Arrive</span>
                </div>

                <div className="px-0.5 text-cyan-400">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>

                {/* 2. Band Starts */}
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => setOpenTimeline(openTimeline === "bandStart" ? null : "bandStart")}
                    className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase transition-all ${
                      openTimeline === "bandStart"
                        ? "border-purple-400 bg-purple-500/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                        : "border-purple-500/30 bg-purple-950/40 text-purple-200 hover:bg-purple-900/50 hover:text-white"
                    }`}
                  >
                    <span className="text-[10px] text-purple-300/70">BAND ON STAGE:</span>
                    <span>{tBandStart}</span>
                    <DotChevronDown className="h-3 w-3 text-purple-300" />
                  </button>
                  <span className="mt-1 pl-3 text-[10px] text-purple-300/60">Live Show Starts</span>
                </div>

                <div className="px-0.5 text-purple-400">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>

                {/* 3. Band Finishes */}
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => setOpenTimeline(openTimeline === "bandEnd" ? null : "bandEnd")}
                    className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase transition-all ${
                      openTimeline === "bandEnd"
                        ? "border-purple-400 bg-purple-500/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                        : "border-purple-500/30 bg-purple-950/40 text-purple-200 hover:bg-purple-900/50 hover:text-white"
                    }`}
                  >
                    <span className="text-[10px] text-purple-300/70">BAND FINISHES:</span>
                    <span>{tBandEnd}</span>
                    <DotChevronDown className="h-3 w-3 text-purple-300" />
                  </button>
                  <span className="mt-1 pl-3 text-[10px] text-purple-300/60">Final Encore</span>
                </div>

                <div className="px-0.5 text-cyan-400">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>

                {/* 4. Event Ends */}
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => setOpenTimeline(openTimeline === "eventEnd" ? null : "eventEnd")}
                    className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase transition-all ${
                      openTimeline === "eventEnd"
                        ? "border-cyan-400 bg-cyan-500/30 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                        : "border-white/10 bg-black/40 text-white/90 hover:bg-black/60 hover:text-white"
                    }`}
                  >
                    <span className="text-[10px] text-white/50">EVENT ENDS:</span>
                    <span>{tEventEnd}</span>
                    <DotChevronDown className="h-3 w-3 text-cyan-300" />
                  </button>
                  <span className="mt-1 pl-3 text-[10px] text-white/40">Party Concludes</span>
                </div>

                {/* Duration Summary Pill */}
                <span className="flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/80 px-3.5 py-2 text-[11px] font-bold text-cyan-200 shadow-lg">
                  <Zap className="h-3.5 w-3.5 text-cyan-300" />
                  <span>🎸 {formatDuration(bandLiveMinutes, "Live Set")}</span>
                  <span className="text-white/40">•</span>
                  <span>{formatDuration(totalEventMinutes, "Total")}</span>
                </span>

                {/* Popover */}
                {openTimeline && (
                  <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-72 rounded-2xl border border-cyan-500/30 bg-[#061424]/95 p-3.5 shadow-2xl backdrop-blur-2xl">
                    <div className="mb-2 text-[10px] font-bold text-cyan-300 uppercase">
                      Select {openTimeline === "eventStart" && "Event Start"}
                      {openTimeline === "bandStart" && "Band Start"}
                      {openTimeline === "bandEnd" && "Band Finish"}
                      {openTimeline === "eventEnd" && "Event End"} Time
                    </div>
                    <div className="grid max-h-52 grid-cols-2 gap-1.5 overflow-y-auto pr-1">
                      {(openTimeline === "eventStart"
                        ? EVENT_START_TIMES
                        : openTimeline === "bandStart"
                        ? BAND_START_TIMES
                        : openTimeline === "bandEnd"
                        ? BAND_END_TIMES
                        : EVENT_END_TIMES
                      ).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            if (openTimeline === "eventStart") setTEventStart(t);
                            if (openTimeline === "bandStart") setTBandStart(t);
                            if (openTimeline === "bandEnd") setTBandEnd(t);
                            if (openTimeline === "eventEnd") setTEventEnd(t);
                            setOpenTimeline(null);
                          }}
                          className="rounded-xl border border-white/5 bg-white/5 px-2.5 py-2 text-xs font-semibold text-white/80 hover:border-cyan-400/50 hover:bg-cyan-500/20 hover:text-white"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ========================================================================= */}
              {/* THE VISUAL SCHEDULE PROGRESS GAUGE (Explains everything at a glance) */}
              {/* ========================================================================= */}
              <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-white/70">Visual Schedule Breakdown:</span>
                  <span className="text-[11px] text-cyan-300 font-bold">
                    {tEventStart} to {tEventEnd} ({formatDuration(totalEventMinutes)} total)
                  </span>
                </div>

                {/* Multi-segment Progress Bar */}
                <div className="flex h-10 w-full overflow-hidden rounded-xl border border-white/10 bg-black/60 p-1">
                  {/* Segment 1: Pre-Show */}
                  <div
                    className="flex h-full items-center justify-center rounded-lg bg-white/10 px-2 text-[10px] font-bold text-white/70 transition-all"
                    style={{
                      width: `${Math.max(15, (preShowMinutes / totalEventMinutes) * 100)}%`,
                    }}
                  >
                    <span className="truncate">🍽️ Arrival / Dinner ({formatDuration(preShowMinutes)})</span>
                  </div>

                  {/* Segment 2: Band Live Set */}
                  <div
                    className="flex h-full items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-3 text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all"
                    style={{
                      width: `${Math.max(40, (bandLiveMinutes / totalEventMinutes) * 100)}%`,
                    }}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Zap className="h-3.5 w-3.5 text-yellow-300" />
                      <span>7TH HEAVEN LIVE CONCERT ({formatDuration(bandLiveMinutes)})</span>
                    </span>
                  </div>

                  {/* Segment 3: Post-Show Wrap */}
                  <div
                    className="flex h-full items-center justify-center rounded-lg bg-white/10 px-2 text-[10px] font-bold text-white/70 transition-all"
                    style={{
                      width: `${Math.max(15, (postShowMinutes / totalEventMinutes) * 100)}%`,
                    }}
                  >
                    <span className="truncate">🥂 Wrap ({formatDuration(postShowMinutes)})</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/50">
                  <span>• <strong>{tEventStart}</strong>: Venue opens & dinner starts</span>
                  <span>• <strong>{tBandStart}</strong>: Band kicks off show</span>
                  <span>• <strong>{tBandEnd}</strong>: Band encore ends</span>
                  <span>• <strong>{tEventEnd}</strong>: Event concludes</span>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SETUP B: DUAL STACKED PODS (Clear Event Box + Band Box) */}
          {/* ========================================================================= */}
          <section
            aria-labelledby="setup-b-heading"
            className="rounded-[var(--radius-box)] border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-6 shadow-2xl backdrop-blur-md"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-amber-400 uppercase">
                  Option 01
                </span>
                <h2 id="setup-b-heading" className="text-xl font-bold text-white">
                  Dual Stacked Pods (Two Distinct Step Boxes)
                </h2>
              </div>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                Separated by Purpose
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-white/60 max-w-3xl">
              If putting all 4 on one line feels busy, this setup splits them into two clean stacked pods:
              one pod for <strong>Overall Event Hours</strong>, and one pod for <strong>Band Performance Hours</strong>.
            </p>

            <div className="mt-6 flex flex-col gap-6 rounded-2xl border border-white/10 bg-black/40 p-6">
              {/* Box 1: Event Schedule */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-purple-300 uppercase">
                    <CalendarDays className="h-4 w-4" /> 1. Overall Event Window
                  </span>
                  <span className="text-[11px] text-white/50">When guests arrive & leave</span>
                </div>

                <div className="relative inline-flex flex-wrap items-center gap-2 rounded-2xl border border-white/15 bg-white/5 p-2 sm:rounded-full">
                  <button
                    type="button"
                    onClick={() => setOpenPod1(openPod1 === "showStart" ? null : "showStart")}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-bold uppercase hover:bg-black/60"
                  >
                    <span className="text-[10px] text-white/50">EVENT STARTS:</span>
                    <span>{opt1ShowStart}</span>
                    <DotChevronDown className="h-3 w-3 text-purple-300" />
                  </button>

                  <ArrowRight className="h-3.5 w-3.5 text-purple-400" />

                  <button
                    type="button"
                    onClick={() => setOpenPod1(openPod1 === "showEnd" ? null : "showEnd")}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-bold uppercase hover:bg-black/60"
                  >
                    <span className="text-[10px] text-white/50">EVENT ENDS:</span>
                    <span>{opt1ShowEnd}</span>
                    <DotChevronDown className="h-3 w-3 text-purple-300" />
                  </button>

                  <span className="rounded-full border border-purple-500/40 bg-purple-950/60 px-3 py-1.5 text-[11px] font-bold text-purple-200">
                    ⚡ {formatDuration(calculateDiffMinutes(opt1ShowStart, opt1ShowEnd), "Total Event")}
                  </span>

                  {openPod1?.startsWith("show") && (
                    <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-72 rounded-2xl border border-purple-500/30 bg-[#160a22]/95 p-3.5 shadow-2xl backdrop-blur-2xl">
                      <div className="grid max-h-52 grid-cols-2 gap-1.5 overflow-y-auto pr-1">
                        {(openPod1 === "showStart" ? EVENT_START_TIMES : EVENT_END_TIMES).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              if (openPod1 === "showStart") setOpt1ShowStart(t);
                              else setOpt1ShowEnd(t);
                              setOpenPod1(null);
                            }}
                            className="rounded-xl border border-white/5 bg-white/5 px-2.5 py-2 text-xs font-semibold text-white/80 hover:bg-purple-500/20 hover:text-white"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Box 2: Band Performance */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-950/[0.08] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase">
                    <Music2 className="h-4 w-4" /> 2. Band Performance Window
                  </span>
                  <span className="text-[11px] text-amber-200/60">Actual live concert time on stage</span>
                </div>

                <div className="relative inline-flex flex-wrap items-center gap-2 rounded-2xl border border-amber-500/30 bg-white/5 p-2 sm:rounded-full">
                  <button
                    type="button"
                    onClick={() => setOpenPod1(openPod1 === "bandStart" ? null : "bandStart")}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-amber-400/40 bg-black/40 px-4 py-2 text-xs font-bold uppercase hover:bg-black/60"
                  >
                    <span className="text-[10px] text-amber-300/70">BAND ON STAGE:</span>
                    <span>{opt1BandStart}</span>
                    <DotChevronDown className="h-3 w-3 text-amber-300" />
                  </button>

                  <ArrowRight className="h-3.5 w-3.5 text-amber-400" />

                  <button
                    type="button"
                    onClick={() => setOpenPod1(openPod1 === "bandEnd" ? null : "bandEnd")}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-amber-400/40 bg-black/40 px-4 py-2 text-xs font-bold uppercase hover:bg-black/60"
                  >
                    <span className="text-[10px] text-amber-300/70">BAND FINISHES:</span>
                    <span>{opt1BandEnd}</span>
                    <DotChevronDown className="h-3 w-3 text-amber-300" />
                  </button>

                  <span className="rounded-full border border-amber-500/40 bg-amber-950/60 px-3 py-1.5 text-[11px] font-bold text-amber-300">
                    🎸 {formatDuration(calculateDiffMinutes(opt1BandStart, opt1BandEnd), "Live Set")}
                  </span>

                  {openPod1?.startsWith("band") && (
                    <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-72 rounded-2xl border border-amber-500/30 bg-[#1c1204]/95 p-3.5 shadow-2xl backdrop-blur-2xl">
                      <div className="grid max-h-52 grid-cols-2 gap-1.5 overflow-y-auto pr-1">
                        {(openPod1 === "bandStart" ? BAND_START_TIMES : BAND_END_TIMES).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              if (openPod1 === "bandStart") setOpt1BandStart(t);
                              else setOpt1BandEnd(t);
                              setOpenPod1(null);
                            }}
                            className="rounded-xl border border-white/5 bg-white/5 px-2.5 py-2 text-xs font-semibold text-white/80 hover:bg-amber-500/20 hover:text-white"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
