"use client";

import React, { useState, useMemo } from "react";
import {
  Check,
  ArrowLeft,
  ArrowRight,
  Clock,
  Truck,
  DoorOpen,
  Zap,
  Flag,
  Moon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Toggle } from "@/components/Toggle";
import type { BookingSlot } from "@/components/CalendarPicker";
import type { TourDateDetailItem } from "@/lib/booking-availability";

interface StepScheduleSentenceProps {
  bookingSlots: BookingSlot[];
  setBookingSlots: React.Dispatch<React.SetStateAction<BookingSlot[]>>;
  formData: {
    eventDate?: string;
    eventStartTime?: string;
    startTime?: string;
    endTime?: string;
    eventEndTime?: string;
    loadInTime?: string;
    [key: string]: any;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  isLoadInUnsure: boolean;
  setIsLoadInUnsure: (val: boolean) => void;
  selectedType: string | null;
  setSelectedType: (type: string) => void;
  blockedDates?: string[];
  dateDetails?: Record<string, TourDateDetailItem[]>;
  onNext: () => void;
  onPrev: () => void;
  onStepClick: (step: 1 | 2 | 3) => void;
}

const MONTH_NAMES = [
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

const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const TIME_OPTIONS = [
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
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

// Helper to convert time string (e.g., "7:00 PM") to minutes since midnight
function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

// Calculate duration between two time strings
function calculateDuration(
  startStr: string,
  endStr: string,
): { durationText: string; durationPillText: string; progressPercent: number } {
  const startMin = timeToMinutes(startStr);
  let endMin = timeToMinutes(endStr);
  if (endMin <= startMin) {
    endMin += 24 * 60; // Next day
  }
  const diff = Math.max(0, endMin - startMin);
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  let durationText = `${hours}h`;
  if (minutes > 0) {
    durationText = `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  } else {
    durationText = `${hours}h 00m`;
  }

  let durationPillText = `${hours}h`;
  if (minutes === 30) {
    durationPillText = `${hours}.5h`;
  } else if (minutes > 0) {
    durationPillText = `${hours}h ${minutes}m`;
  }

  // Bar progress scaled against 4h max (240 min)
  const progressPercent = Math.min(100, Math.max(5, (diff / 240) * 100));

  return { durationText, durationPillText, progressPercent };
}

// Format date into "Fri, Oct 30"
function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return "Fri, Oct 30";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      const dayName = DAY_NAMES_SHORT[d.getDay()];
      const monthName = MONTH_NAMES_SHORT[d.getMonth()];
      return `${dayName}, ${monthName} ${day}`;
    }
  }
  return "Fri, Oct 30";
}

// Sample fallback scheduled shows for October 2026 to match screenshot
const DEFAULT_SCHEDULED_DATES_OCT_2026 = new Set([
  "2026-10-01",
  "2026-10-03",
  "2026-10-04",
  "2026-10-10",
  "2026-10-16",
  "2026-10-17",
  "2026-10-24",
  "2026-10-31",
]);

function formatMonoTime(timeStr: string): string {
  if (!timeStr) return "07:00 PM";
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return timeStr;
  const h = match[1].padStart(2, "0");
  const m = match[2];
  const p = match[3].toUpperCase();
  return `${h}:${m} ${p}`;
}

export default function StepScheduleSentence({
  bookingSlots,
  setBookingSlots,
  formData,
  setFormData,
  isLoadInUnsure,
  setIsLoadInUnsure,
  selectedType,
  setSelectedType,
  blockedDates = [],
  onNext,
  onPrev,
  onStepClick,
}: StepScheduleSentenceProps) {
  // Calendar month state (default to October 2026 as shown in screenshot)
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date(2026, 9, 1));
  const [openTimePicker, setOpenTimePicker] = useState<string | null>(null);

  // Time values with defaults
  const loadInTime = formData.loadInTime || "3:00 PM";
  const eventStartTime = formData.eventStartTime || "6:00 PM";
  const bandStartTime = formData.startTime || "7:00 PM";
  const bandEndTime = formData.endTime || "9:00 PM";
  const eventEndTime = formData.eventEndTime || "11:00 PM";

  // Selected date
  const selectedDateStr = bookingSlots[0]?.date || formData.eventDate || "2026-10-30";
  const formattedDate = formatDateDisplay(selectedDateStr);

  // Duration
  const { durationText, durationPillText, progressPercent } = useMemo(
    () => calculateDuration(bandStartTime, bandEndTime),
    [bandStartTime, bandEndTime],
  );

  // Scheduled blocked set
  const scheduledSet = useMemo(() => {
    const set = new Set(blockedDates);
    if (
      currentMonthDate.getFullYear() === 2026 &&
      currentMonthDate.getMonth() === 9
    ) {
      DEFAULT_SCHEDULED_DATES_OCT_2026.forEach((d) => set.add(d));
    }
    return set;
  }, [blockedDates, currentMonthDate]);

  // Calendar days generation
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const daysInMonth = useMemo(() => {
    const list: Date[] = [];
    const d = new Date(year, month, 1);
    while (d.getMonth() === month) {
      list.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return list;
  }, [year, month]);

  const firstDayIndex = new Date(year, month, 1).getDay();
  const emptyLeadingDays = Array.from({ length: firstDayIndex }, (_, i) => i);

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (dateStr: string) => {
    if (selectedDateStr === dateStr) {
      // Toggle off
      setBookingSlots([]);
      setFormData((prev: any) => ({ ...prev, eventDate: "" }));
    } else {
      const newSlot: BookingSlot = {
        id: Math.random().toString(36).substring(2, 9),
        date: dateStr,
        startTime: bandStartTime,
        endTime: bandEndTime,
        eventType: selectedType || "full_band",
        doorsTime: eventStartTime,
      };
      setBookingSlots([newSlot]);
      setFormData((prev: any) => ({ ...prev, eventDate: dateStr }));
    }
  };

  const updateTime = (field: string, val: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: val }));
    if (field === "startTime" || field === "endTime") {
      setBookingSlots((prev) =>
        prev.map((s) => ({
          ...s,
          [field]: val,
        })),
      );
    }
  };

  // Format type display
  const formatLabel = useMemo(() => {
    switch (selectedType) {
      case "unplugged":
        return "Unplugged Acoustic";
      case "private":
        return "Private Event";
      case "custom":
        return "Custom Booking";
      default:
        return "Full Band";
    }
  }, [selectedType]);

  return (
    <div className="relative mx-auto w-full  px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[400px_1fr] xl:grid-cols-[440px_1fr] 2xl:grid-cols-[480px_1fr]">
        {/* ══════════════ LEFT COLUMN ══════════════ */}
        <div className="flex flex-col">
          {/* Top Row: Dashed 02 Box + Step Progress */}
          <div className="flex items-center gap-5">
            {/* Outline 02 in Dashed Box */}
            <div className="flex h-24 w-28 shrink-0 items-center justify-center rounded-2xl border border-dashed border-pink-500/50 bg-pink-950/10 shadow-[0_0_20px_rgba(236,72,153,0.15)]">
              <span className="font-[family-name:var(--font-anton)] text-6xl tracking-tight text-transparent [-webkit-text-stroke:2px_#ec4899] drop-shadow-[0_0_14px_rgba(236,72,153,0.5)] select-none">
                02
              </span>
            </div>

            {/* Vertical Step Progress List */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onStepClick(1)}
                className="group flex items-center gap-2 text-left text-xs font-medium text-white/60 transition-colors hover:text-white"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30">
                  <Check className="h-3 w-3 stroke-[3]" />
                </span>
                <span>Contact &amp; Planner</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <span className="flex h-4 w-4 items-center justify-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899]" />
                </span>
                <span>Schedule &amp; Format</span>
              </div>

              <button
                type="button"
                onClick={() => onStepClick(3)}
                className="group flex items-center gap-2 text-left text-xs font-normal text-white/40 transition-colors hover:text-white/80"
              >
                <span className="flex h-4 w-4 items-center justify-center">
                  <span className="h-2.5 w-2.5 rounded-full border border-white/40 group-hover:border-white/70" />
                </span>
                <span>Venue &amp; Production</span>
              </button>
            </div>
          </div>

          {/* Headline: YOUR SHOW, IN ONE SENTENCE */}
          <h2 className="mt-8 font-[family-name:var(--font-anton)] text-4xl uppercase leading-[0.98] tracking-tight text-white sm:text-5xl lg:text-[46px]">
            YOUR SHOW,
            <br />
            IN ONE SENTENCE
          </h2>

          {/* Interactive Live Sentence */}
          <p className="mt-6 text-lg font-normal leading-[1.7] text-white/85 sm:text-xl">
            We&apos;d like 7th Heaven on{" "}
            <span className="inline-flex items-center rounded-md bg-[#f5c344] px-2.5 py-0.5 font-semibold text-[#120826] shadow-sm">
              {formattedDate}
            </span>
            . Load-in at{" "}
            <span className="inline-flex items-center rounded-md border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 font-mono text-base font-medium text-emerald-300">
              {isLoadInUnsure ? "TBD" : loadInTime}
            </span>
            , doors at{" "}
            <span className="inline-flex items-center rounded-md border border-cyan-500/40 bg-cyan-950/60 px-2 py-0.5 font-mono text-base font-medium text-cyan-300">
              {eventStartTime}
            </span>
            , band on stage{" "}
            <span className="inline-flex items-center rounded-md border border-purple-500/40 bg-purple-950/70 px-2 py-0.5 font-mono text-base font-medium text-purple-300">
              {bandStartTime}
            </span>{" "}
            to{" "}
            <span className="inline-flex items-center rounded-md border border-pink-500/40 bg-pink-950/70 px-2 py-0.5 font-mono text-base font-medium text-pink-300">
              {bandEndTime}
            </span>{" "}
            — a{" "}
            <span className="inline-flex items-center rounded-md bg-white/10 px-2 py-0.5 text-base font-semibold text-white">
              {durationPillText}
            </span>{" "}
            set — and we wrap at{" "}
            <span className="inline-flex items-center rounded-md border border-amber-500/40 bg-amber-950/60 px-2 py-0.5 font-mono text-base font-medium text-amber-300">
              {eventEndTime}
            </span>
            .
          </p>

          {/* Action Navigation Buttons */}
          <div className="mt-8 flex items-center gap-3.5">
            <button
              type="button"
              onClick={onPrev}
              aria-label="Back to Contact & Planner"
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/70 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onNext}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 px-7 py-3.5 text-sm font-bold text-white shadow-[0_4px_24px_rgba(236,72,153,0.4)] transition-all hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
            >
              <span>Continue to Venue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Footnote */}
          <p className="mt-3 text-xs text-white/40">
            Format:{" "}
            <span className="font-medium text-white/70">{formatLabel}</span> ·
            You&apos;ll review everything before submitting.
          </p>
        </div>

        {/* ══════════════ RIGHT COLUMN ══════════════ */}
        <div className="flex flex-col gap-4">
          {/* Card 1: PRIMARY EVENT SCHEDULE */}
          <div className="rounded-[24px] border border-white/10 bg-[#160b29]/80 p-5 backdrop-blur-xl shadow-[0_12px_40px_rgba(10,4,20,0.6)] sm:p-6">
            {/* Card Header: Title + Month Nav */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-white sm:text-base">
                  <span>PRIMARY EVENT SCHEDULE</span>
                  <span className="text-pink-400">*</span>
                </h3>
                <p className="mt-0.5 text-xs text-white/50">
                  Select one or more dates to reserve 7th Heaven.
                </p>
              </div>

              {/* Month Navigator Capsule */}
              <div className="flex shrink-0 items-center justify-between rounded-full border border-white/10 bg-[#0d061b]/80 px-3 py-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-[130px] text-center font-mono text-xs font-semibold tracking-wider text-white">
                  {MONTH_NAMES[month]} {year}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="mt-6 grid grid-cols-7 text-center font-mono text-xs font-medium tracking-wider text-white/40">
              {DAYS_OF_WEEK.map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="mt-1 grid grid-cols-7 gap-1.5 sm:gap-2">
              {emptyLeadingDays.map((i) => (
                <div key={`empty-${i}`} className="h-11 sm:h-12" />
              ))}
              {daysInMonth.map((d) => {
                const dateString = `${d.getFullYear()}-${String(
                  d.getMonth() + 1,
                ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                const isSelected = selectedDateStr === dateString;
                const isScheduled = scheduledSet.has(dateString);

                return (
                  <button
                    key={dateString}
                    type="button"
                    onClick={() => handleDateClick(dateString)}
                    aria-pressed={isSelected}
                    className={`relative flex h-11 w-full cursor-pointer items-center justify-center rounded-xl font-mono text-xs sm:h-12 sm:text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 ${isSelected
                        ? "bg-[#f5c344] text-[#120826] shadow-lg shadow-amber-500/20"
                        : isScheduled
                          ? "border border-white/10 bg-white/[0.04] text-white/90 hover:border-pink-500/50 hover:bg-pink-950/20"
                          : "border border-transparent bg-white/[0.02] text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    <span>{d.getDate()}</span>

                    {/* Pink indicator dot for scheduled shows */}
                    {isScheduled && !isSelected && (
                      <span
                        aria-hidden="true"
                        className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-pink-500 shadow-[0_0_6px_#ec4899]"
                      />
                    )}

                    {/* Selected indicator inside yellow pill */}
                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#120826]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-white/5 pt-4 text-xs text-white/60">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white/20" />
                Available
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-pink-500 shadow-[0_0_6px_#ec4899]" />
                Show scheduled (double-booking allowed)
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#f5c344]" />
                Your pick
              </span>
            </div>
          </div>

          {/* Middle Row: BEFORE THE SHOW + THE SET */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Card 2: BEFORE THE SHOW */}
            <div className="flex flex-col justify-between rounded-[24px] border border-white/10 bg-[#160b29]/80 p-5 backdrop-blur-xl shadow-[0_12px_40px_rgba(10,4,20,0.6)]">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/40">
                  BEFORE THE SHOW
                </h4>

                {/* Field 1: Load-in / setup */}
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
                      <Truck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Load-in / setup</span>
                    </span>
                    <Toggle
                      id="loadin-unsure-toggle"
                      size="sm"
                      checked={isLoadInUnsure}
                      onChange={(next) => {
                        setIsLoadInUnsure(next);
                        if (next) {
                          updateTime(
                            "loadInTime",
                            "Unsure — Band admin will confirm",
                          );
                        } else {
                          updateTime("loadInTime", "3:00 PM");
                        }
                      }}
                      label={<span className="text-xs text-white/50">Unsure?</span>}
                    />
                  </div>

                  {isLoadInUnsure ? (
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0d061b]/60 px-4 py-3 text-xs text-white/40">
                      <span>Band admin will coordinate setup time</span>
                      <Clock className="h-4 w-4 text-white/30" />
                    </div>
                  ) : (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenTimePicker(
                            openTimePicker === "loadIn" ? null : "loadIn",
                          )
                        }
                        className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-[#0d061b]/90 px-4 py-3 font-mono text-base font-semibold tracking-wider text-white transition-colors hover:border-purple-400/40 hover:bg-[#120826]"
                      >
                        <span>{formatMonoTime(loadInTime)}</span>
                        <Clock className="h-4 w-4 text-white/40" />
                      </button>

                      {openTimePicker === "loadIn" && (
                        <div className="absolute z-50 mt-2 max-h-52 w-full overflow-y-auto rounded-xl border border-purple-500/30 bg-[#160b29] p-2 shadow-2xl backdrop-blur-xl">
                          <div className="grid grid-cols-2 gap-1">
                            {TIME_OPTIONS.map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => {
                                  updateTime("loadInTime", t);
                                  setOpenTimePicker(null);
                                }}
                                className={`rounded-lg px-2 py-1.5 text-center font-mono text-xs transition-colors ${loadInTime === t
                                    ? "bg-purple-600 font-bold text-white"
                                    : "text-white/70 hover:bg-white/10 hover:text-white"
                                  }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Field 2: Event start */}
                <div className="mt-4">
                  <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-white/90">
                    <DoorOpen className="h-3.5 w-3.5 text-sky-400" />
                    <span>Event start</span>
                  </span>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenTimePicker(
                          openTimePicker === "eventStart" ? null : "eventStart",
                        )
                      }
                      className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-[#0d061b]/90 px-4 py-3 font-mono text-base font-semibold tracking-wider text-white transition-colors hover:border-purple-400/40 hover:bg-[#120826]"
                    >
                      <span>{formatMonoTime(eventStartTime)}</span>
                      <Clock className="h-4 w-4 text-white/40" />
                    </button>

                    {openTimePicker === "eventStart" && (
                      <div className="absolute z-50 mt-2 max-h-52 w-full overflow-y-auto rounded-xl border border-purple-500/30 bg-[#160b29] p-2 shadow-2xl backdrop-blur-xl">
                        <div className="grid grid-cols-2 gap-1">
                          {TIME_OPTIONS.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                updateTime("eventStartTime", t);
                                setOpenTimePicker(null);
                              }}
                              className={`rounded-lg px-2 py-1.5 text-center font-mono text-xs transition-colors ${eventStartTime === t
                                  ? "bg-purple-600 font-bold text-white"
                                  : "text-white/70 hover:bg-white/10 hover:text-white"
                                }`}
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
            </div>

            {/* Card 3: THE SET */}
            <div className="flex flex-col justify-between rounded-[24px] border border-white/10 bg-[#160b29]/80 p-5 backdrop-blur-xl shadow-[0_12px_40px_rgba(10,4,20,0.6)]">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/40">
                    THE SET
                  </h4>
                  <span className="font-mono text-xs font-bold text-white/70">
                    {durationText}
                  </span>
                </div>

                {/* Field 1: Band start */}
                <div className="mt-4">
                  <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-white/90">
                    <Zap className="h-3.5 w-3.5 text-purple-400" />
                    <span>Band start</span>
                    <span className="text-pink-400">*</span>
                  </span>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenTimePicker(
                          openTimePicker === "bandStart" ? null : "bandStart",
                        )
                      }
                      className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-[#0d061b]/90 px-4 py-3 font-mono text-base font-semibold tracking-wider text-white transition-colors hover:border-purple-400/40 hover:bg-[#120826]"
                    >
                      <span>{formatMonoTime(bandStartTime)}</span>
                      <Clock className="h-4 w-4 text-white/40" />
                    </button>

                    {openTimePicker === "bandStart" && (
                      <div className="absolute z-50 mt-2 max-h-52 w-full overflow-y-auto rounded-xl border border-purple-500/30 bg-[#160b29] p-2 shadow-2xl backdrop-blur-xl">
                        <div className="grid grid-cols-2 gap-1">
                          {TIME_OPTIONS.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                updateTime("startTime", t);
                                setOpenTimePicker(null);
                              }}
                              className={`rounded-lg px-2 py-1.5 text-center font-mono text-xs transition-colors ${bandStartTime === t
                                  ? "bg-purple-600 font-bold text-white"
                                  : "text-white/70 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Field 2: Band end */}
                <div className="mt-4">
                  <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-white/90">
                    <Flag className="h-3.5 w-3.5 text-pink-400" />
                    <span>Band end</span>
                    <span className="text-pink-400">*</span>
                  </span>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenTimePicker(
                          openTimePicker === "bandEnd" ? null : "bandEnd",
                        )
                      }
                      className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-[#0d061b]/90 px-4 py-3 font-mono text-base font-semibold tracking-wider text-white transition-colors hover:border-purple-400/40 hover:bg-[#120826]"
                    >
                      <span>{formatMonoTime(bandEndTime)}</span>
                      <Clock className="h-4 w-4 text-white/40" />
                    </button>

                    {openTimePicker === "bandEnd" && (
                      <div className="absolute z-50 mt-2 max-h-52 w-full overflow-y-auto rounded-xl border border-purple-500/30 bg-[#160b29] p-2 shadow-2xl backdrop-blur-xl">
                        <div className="grid grid-cols-2 gap-1">
                          {TIME_OPTIONS.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                updateTime("endTime", t);
                                setOpenTimePicker(null);
                              }}
                              className={`rounded-lg px-2 py-1.5 text-center font-mono text-xs transition-colors ${bandEndTime === t
                                  ? "bg-purple-600 font-bold text-white"
                                  : "text-white/70 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Duration Progress Meter */}
                <div className="mt-5">
                  <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 transition-all duration-300 w-[var(--progress-val)]"
                      style={
                        {
                          "--progress-val": `${progressPercent}%`,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] text-white/40">
                    <span>0h</span>
                    <span>Typical 1.5-2.5h</span>
                    <span>4h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: AFTER THE SHOW */}
          <div className="flex flex-col justify-between gap-4 rounded-[24px] border border-white/10 bg-[#160b29]/80 p-5 backdrop-blur-xl shadow-[0_12px_40px_rgba(10,4,20,0.6)] sm:p-6 md:flex-row md:items-center">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/40">
                AFTER THE SHOW
              </h4>
              <p className="mt-1 text-xs text-white/50">
                When does the event wrap up for guests?
              </p>
            </div>

            <div className="w-full md:w-72">
              <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-300/90">
                <Moon className="h-3.5 w-3.5 text-amber-400" />
                <span>Event end</span>
              </span>

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenTimePicker(
                      openTimePicker === "eventEnd" ? null : "eventEnd",
                    )
                  }
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-[#0d061b]/90 px-4 py-3 font-mono text-base font-semibold tracking-wider text-white transition-colors hover:border-purple-400/40 hover:bg-[#120826]"
                >
                  <span>{formatMonoTime(eventEndTime)}</span>
                  <Clock className="h-4 w-4 text-white/40" />
                </button>

                {openTimePicker === "eventEnd" && (
                  <div className="absolute z-50 mt-2 max-h-52 w-full overflow-y-auto rounded-xl border border-purple-500/30 bg-[#160b29] p-2 shadow-2xl backdrop-blur-xl">
                    <div className="grid grid-cols-2 gap-1">
                      {TIME_OPTIONS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            updateTime("eventEndTime", t);
                            setOpenTimePicker(null);
                          }}
                          className={`rounded-lg px-2 py-1.5 text-center font-mono text-xs transition-colors ${eventEndTime === t
                              ? "bg-purple-600 font-bold text-white"
                              : "text-white/70 hover:bg-white/10 hover:text-white"
                            }`}
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
        </div>
      </div>
    </div>
  );
}
