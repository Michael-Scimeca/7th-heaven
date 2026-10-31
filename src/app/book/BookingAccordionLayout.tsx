"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Clock,
  Sparkles,
  MapPin,
  Building,
} from "lucide-react";
import type { BookingSlot } from "@/components/CalendarPicker";
import type { TourDateDetailItem } from "@/lib/booking-availability";
import { PARKING_OPTIONS } from "./BookClient";
import BookingSummaryCard from "./BookingSummaryCard";
import InputField from "@/components/InputField";
import EventScheduleTimelinePicker, {
  type EventScheduleData,
} from "./EventScheduleTimelinePicker";

interface BookingAccordionLayoutProps {
  formData: {
    name?: string;
    email?: string;
    phone?: string;
    organization?: string;
    eventDate?: string;
    startTime?: string;
    endTime?: string;
    venueName?: string;
    venueCity?: string;
    venueState?: string;
    parkingAddress?: string;
    parkingType?: string;
    indoorOutdoor?: string;
    soundSystem?: string;
    stageAvailable?: string;
    [key: string]: any;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  bookingSlots: BookingSlot[];
  setBookingSlots: React.Dispatch<React.SetStateAction<BookingSlot[]>>;
  selectedType: string | null;
  setSelectedType: (type: string) => void;
  blockedDates?: string[];
  dateDetails?: Record<string, TourDateDetailItem[]>;
  eventTypes: Array<{ id: string; label: string;[key: string]: any }>;
  activeStep: 1 | 2 | 3;
  setActiveStep: (step: 1 | 2 | 3) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting?: boolean;
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

const SHOW_TIME_OPTIONS = [
  { id: "select", label: "Select a time", start: "", end: "" },
  { id: "7-9", label: "7:00 PM – 9:00 PM (Standard 2h)", start: "7:00 PM", end: "9:00 PM" },
  { id: "8-10", label: "8:00 PM – 10:00 PM (Prime evening)", start: "8:00 PM", end: "10:00 PM" },
  { id: "6-8", label: "6:00 PM – 8:00 PM (Early set)", start: "6:00 PM", end: "8:00 PM" },
  { id: "9-11", label: "9:00 PM – 11:00 PM (Late night)", start: "9:00 PM", end: "11:00 PM" },
  { id: "1-3", label: "1:00 PM – 3:00 PM (Afternoon festival)", start: "1:00 PM", end: "3:00 PM" },
];

export default function BookingAccordionLayout({
  formData,
  setFormData,
  bookingSlots,
  setBookingSlots,
  selectedType,
  setSelectedType,
  blockedDates = [],
  dateDetails = {},
  eventTypes,
  activeStep,
  setActiveStep,
  onSubmit,
  submitting = false,
}: BookingAccordionLayoutProps) {
  // Calendar month state defaults to October 2026 to match screenshot
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(
    () => new Date(2026, 9, 1),
  );

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  // Scheduled dates in October 2026
  const scheduledSet = useMemo(() => {
    const s = new Set<string>();
    // Default scheduled shows
    const fallbackDates = [
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
      "2026-10-04",
      "2026-10-09",
      "2026-10-10",
      "2026-10-16",
      "2026-10-17",
      "2026-10-23",
      "2026-10-24",
      "2026-10-30",
      "2026-10-31",
    ];
    for (const d of fallbackDates) s.add(d);
    for (const d of blockedDates) s.add(d);
    return s;
  }, [blockedDates]);

  // Calendar days
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

  const selectedDateStr = bookingSlots[0]?.date || formData.eventDate || "2026-10-30";

  const handleDateClick = (dateStr: string) => {
    if (selectedDateStr === dateStr && bookingSlots.length > 0) {
      setBookingSlots([]);
      setFormData((prev: any) => ({ ...prev, eventDate: "" }));
    } else {
      const newSlot: BookingSlot = {
        id: Math.random().toString(36).substring(2, 9),
        date: dateStr,
        startTime: formData.startTime || "7:00 PM",
        endTime: formData.endTime || "9:00 PM",
        eventType: selectedType || "full_band",
      };
      setBookingSlots([newSlot]);
      setFormData((prev: any) => ({ ...prev, eventDate: dateStr }));
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const opt = SHOW_TIME_OPTIONS.find((o) => o.id === e.target.value);
    if (opt && opt.start) {
      setFormData((prev: any) => ({
        ...prev,
        startTime: opt.start,
        endTime: opt.end,
      }));
      setBookingSlots((prev) =>
        prev.map((s) => ({
          ...s,
          startTime: opt.start,
          endTime: opt.end,
        })),
      );
    } else {
      setFormData((prev: any) => ({
        ...prev,
        startTime: "",
        endTime: "",
      }));
      setBookingSlots((prev) =>
        prev.map((s) => ({
          ...s,
          startTime: "",
          endTime: "",
        })),
      );
    }
  };

  const handleScheduleChange = useCallback(
    (sched: EventScheduleData) => {
      setFormData((prev: any) => ({
        ...prev,
        startTime: sched.onStageTime,
        endTime: sched.setEndTime,
        loadInTime: sched.loadInTime,
        doorsOpenTime: sched.doorsTime,
        eventStartTime: sched.doorsTime,
        eventEndTime: sched.wrapTime,
        setLength: `${sched.setLengthLabel} set`,
      }));

      setBookingSlots((prev) => {
        if (prev.length === 0) {
          return [
            {
              id: "primary-slot",
              date: formData.eventDate || "2026-10-30",
              startTime: sched.onStageTime,
              endTime: sched.setEndTime,
              eventType: selectedType || "full_band",
            },
          ];
        }
        return prev.map((s) => ({
          ...s,
          startTime: sched.onStageTime,
          endTime: sched.setEndTime,
        }));
      });
    },
    [formData.eventDate, selectedType, setFormData, setBookingSlots],
  );

  const displayDateBadge = useMemo(() => {
    if (selectedDateStr) {
      try {
        const d = new Date(selectedDateStr + "T12:00:00Z");
        return d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        });
      } catch {
        return "Fri, Oct 30";
      }
    }
    return "Fri, Oct 30";
  }, [selectedDateStr]);

  const isStep1Complete = Boolean(
    formData.name?.trim() && formData.email?.trim() && formData.phone?.trim(),
  );
  const isStep2Complete = Boolean(selectedDateStr && selectedType);
  const isStep3Complete = Boolean(
    formData.venueName?.trim() && formData.venueCity?.trim(),
  );

  return (
    <div className="relative mx-auto w-full site-container py-6 ">
      {/* ── Top Header ── */}
      <div className="mb-8">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#f5c344]">
          BOOK 7TH HEAVEN
        </span>
        <h1 className="mt-1 font-[family-name:var(--font-anton)] text-4xl sm:text-5xl uppercase tracking-wider text-white">
          BOOKING REQUEST
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Complete each step — your summary updates live on the right.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] 2xl:grid-cols-[1fr_460px]">
        {/* ══════════════ LEFT COLUMN: ACCORDION STEPS ══════════════ */}
        <div className="flex flex-col gap-4">
          {/* ────── STEP 1: Contact & Planner ────── */}
          <div className=" border border-white/10 bg-[#120826]/70 p-5 backdrop-blur-xl transition-all">
            {activeStep === 1 ? (
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f5c344] text-xs font-bold text-[#120826]">
                      1
                    </span>
                    <div>
                      <h2 className="text-base font-bold text-white">
                        Contact &amp; Planner
                      </h2>
                      <p className="text-xs text-white/50">
                        Enter your contact details so our band manager can coordinate your booking.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    aria-label="Collapse contact section"
                    className="p-1 text-white/40 hover:text-white"
                  >
                    <ChevronUp className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField
                    label="Full Name"
                    name="name"
                    value={formData.name || ""}
                    onChange={(e: any) =>
                      setFormData((p: any) => ({ ...p, name: e.target.value }))
                    }
                    required
                    placeholder="Michael Scimeca"
                  />
                  <InputField
                    label="Organization / Company"
                    name="organization"
                    value={formData.organization || ""}
                    onChange={(e: any) =>
                      setFormData((p: any) => ({
                        ...p,
                        organization: e.target.value,
                      }))
                    }
                    placeholder="Scoreboard Entertainment"
                  />
                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e: any) =>
                      setFormData((p: any) => ({ ...p, email: e.target.value }))
                    }
                    required
                    placeholder="michael@7thheaven.com"
                  />
                  <InputField
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e: any) =>
                      setFormData((p: any) => ({ ...p, phone: e.target.value }))
                    }
                    required
                    placeholder="(847) 555-0199"
                  />
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-purple-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-purple-500 transition-colors"
                  >
                    <span>Continue to schedule</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <Check className="h-4 w-4 stroke-[3]" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">
                        Contact &amp; Planner
                      </span>
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                        Complete
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-white/60 truncate">
                      {formData.name && formData.name !== "Event Planner" ? formData.name : "Michael Scimeca"} ·{" "}
                      {formData.organization || "Scoreboard Entertainment"} ·{" "}
                      {formData.email && formData.email !== "planner@7thheavenband.com" ? formData.email : "michael@7thheaven.com"} ·{" "}
                      {formData.phone || "(847) 555-0199"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="flex shrink-0 items-center gap-1 text-xs font-medium text-white/60 hover:text-white transition-colors cursor-pointer ml-3"
                >
                  <span>Edit</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* ────── STEP 2: Schedule & Format (Active In Screenshot) ────── */}
          <div className="border border-white/10 bg-[#120826]/80 p-5 sm:p-6 backdrop-blur-xl transition-all">
            {activeStep === 2 ? (
              <div>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f5c344] text-xs font-bold text-[#120826]">
                      2
                    </span>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-white">
                        Schedule &amp; Format
                      </h2>
                      <p className="text-xs text-white/50">
                        Select one or more dates to reserve 7th Heaven
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    aria-label="Collapse schedule section"
                    className="p-1 text-white/40 hover:text-white cursor-pointer"
                  >
                    <ChevronUp className="h-5 w-5" />
                  </button>
                </div>

                {/* Calendar Bar: Month Capsule + Legend */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  {/* Month Capsule */}
                  <div className="flex shrink-0 items-center justify-between rounded-full border border-white/10 bg-[#0d061b] px-3 py-1.5">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      aria-label="Previous month"
                      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="min-w-[120px] text-center font-mono text-xs font-bold tracking-wider text-white">
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

                  {/* Legend */}
                  <div className="flex items-center gap-5 text-xs text-white/60">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-white/20" />
                      <span>Available</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-pink-500 shadow-[0_0_6px_#ec4899]" />
                      <span>Show scheduled (double-booking allowed)</span>
                    </span>
                  </div>
                </div>

                {/* Days of Week Header */}
                <div className="mt-5 grid grid-cols-7 text-center font-mono text-xs font-semibold tracking-wider text-white/40">
                  {DAYS_OF_WEEK.map((d) => (
                    <div key={d} className="py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar Days Grid */}
                <div className="mt-1 grid grid-cols-7 gap-1.5 sm:gap-2">
                  {emptyLeadingDays.map((i) => (
                    <div key={`empty-${i}`} className="h-10 sm:h-12" />
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
                        className={`relative flex h-10 w-full cursor-pointer items-center justify-center rounded-xl font-mono text-xs sm:h-12 sm:text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${isSelected
                          ? "bg-[#f5c344] text-[#120826] shadow-lg shadow-amber-500/20 font-bold"
                          : isScheduled
                            ? "border border-white/10 bg-white/[0.04] text-white/90 hover:border-pink-500/50 hover:bg-pink-950/20"
                            : "border border-white/5 bg-white/[0.02] text-white/70 hover:bg-white/10 hover:text-white"
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

                        {/* Dark dot inside yellow pill when selected */}
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

                {/* ── Interactive Schedule & Production Timeline Picker ── */}
                <div className="mt-6 pt-5 border-t border-white/10">
                  <EventScheduleTimelinePicker
                    initialSchedule={{
                      loadInMinutes: 180, // 3:00 PM
                      doorsMinutes: 360, // 6:00 PM
                      onStageMinutes: 420, // 7:00 PM
                      setLengthMinutes: 120, // 2h
                      wrapMinutes: 660, // 11:00 PM
                    }}
                    onChange={handleScheduleChange}
                  />
                </div>

                {/* ── Live Dynamic Schedule Itinerary Sentence ── */}
                <div className="mt-4 border border-white/10 bg-[#0d061b]/60 p-3 sm:p-3.5 text-xs sm:text-[13px] text-white/80 leading-relaxed backdrop-blur-sm">
                  <span>7th Heaven plays on </span>
                  <span className="inline-flex items-center rounded-md bg-amber-500/20 px-1.5 py-0.5 text-xs font-semibold text-amber-300">
                    {displayDateBadge}
                  </span>
                  <span>. Load-in at </span>
                  <span className="inline-flex items-center rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-xs font-semibold text-emerald-300">
                    {formData.loadInTime || "3:00 PM"}
                  </span>
                  <span>, doors at </span>
                  <span className="inline-flex items-center rounded-md bg-sky-500/20 px-1.5 py-0.5 text-xs font-semibold text-sky-300">
                    {formData.doorsOpenTime || "6:00 PM"}
                  </span>
                  <span>, on stage </span>
                  <span className="inline-flex items-center rounded-md bg-purple-500/30 px-1.5 py-0.5 text-xs font-semibold text-purple-300">
                    {formData.startTime || "7:00 PM"}
                  </span>
                  <span> to </span>
                  <span className="inline-flex items-center rounded-md bg-pink-500/30 px-1.5 py-0.5 text-xs font-semibold text-pink-300">
                    {formData.endTime || "9:00 PM"}
                  </span>
                  <span>, wrapping at </span>
                  <span className="inline-flex items-center rounded-md bg-amber-500/20 px-1.5 py-0.5 text-xs font-semibold text-amber-300">
                    {formData.eventEndTime || "11:00 PM"}
                  </span>
                  <span>.</span>
                </div>

                {/* Bottom Controls Row: Format + Continue to Venue Button */}
                <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
                  {/* Format (Segmented Pill Toggle) */}
                  <div className="w-full sm:w-auto">
                    <span className="block text-xs font-semibold text-white/60 mb-1.5">
                      Band Format
                    </span>
                    <div className="inline-flex rounded-xl border border-white/10 bg-[#0d061b] p-1">
                      <button
                        type="button"
                        onClick={() => setSelectedType("full_band")}
                        className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${selectedType === "full_band" || !selectedType
                          ? "bg-white text-black shadow-sm"
                          : "text-white/60 hover:text-white"
                          }`}
                      >
                        Full Band
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedType("unplugged")}
                        className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${selectedType === "unplugged"
                          ? "bg-white text-black shadow-sm"
                          : "text-white/60 hover:text-white"
                          }`}
                      >
                        Acoustic Trio
                      </button>
                    </div>
                  </div>

                  {/* Continue to Venue Button */}
                  <div className="flex sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveStep(3)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#7c3aed] hover:bg-[#6d28d9] px-6 py-2.5 text-xs font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all hover:brightness-110 active:scale-[0.98]"
                    >
                      <span>Continue to venue</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isStep2Complete
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-white/10 text-white/50"
                      }`}
                  >
                    {isStep2Complete ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : (
                      "2"
                    )}
                  </span>
                  <div className="min-w-0">
                    <span className="text-base font-bold text-white">
                      Schedule &amp; Format
                    </span>
                    <p className="mt-0.5 text-xs text-white/60 truncate">
                      {selectedDateStr ? (
                        <>
                          {new Date(selectedDateStr + "T12:00:00Z").toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              timeZone: "UTC",
                            },
                          )}
                          {formData.startTime ? ` · ${formData.startTime}` : ""} ·{" "}
                          {selectedType === "unplugged" ? "Acoustic Trio" : "Full Band"}
                        </>
                      ) : (
                        "Select one or more dates to reserve 7th Heaven"
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="flex shrink-0 items-center gap-1 text-xs font-medium text-white/60 hover:text-white transition-colors cursor-pointer ml-3"
                >
                  <span>Edit</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* ────── STEP 3: Venue & Production ────── */}
          <div className="border border-white/10 bg-[#120826]/70 p-5 backdrop-blur-xl transition-all">
            {activeStep === 3 ? (
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f5c344] text-xs font-bold text-[#120826]">
                      3
                    </span>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-white">
                        Venue &amp; Production
                      </h2>
                      <p className="text-xs text-white/50">
                        Enter venue location, parking access and stage requirements.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    aria-label="Collapse venue section"
                    className="p-1 text-white/40 hover:text-white cursor-pointer"
                  >
                    <ChevronUp className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField
                    label="Venue Name"
                    name="venueName"
                    value={formData.venueName || ""}
                    onChange={(e: any) =>
                      setFormData((p: any) => ({ ...p, venueName: e.target.value }))
                    }
                    placeholder="Grand Ballroom / Festival Grounds"
                    required
                  />
                  <InputField
                    label="Street / Parking Address"
                    name="parkingAddress"
                    value={formData.parkingAddress || ""}
                    onChange={(e: any) =>
                      setFormData((p: any) => ({
                        ...p,
                        parkingAddress: e.target.value,
                      }))
                    }
                    placeholder="105 E Main St"
                  />
                  <InputField
                    label="City"
                    name="venueCity"
                    value={formData.venueCity || ""}
                    onChange={(e: any) =>
                      setFormData((p: any) => ({ ...p, venueCity: e.target.value }))
                    }
                    placeholder="Chicago"
                    required
                  />
                  <InputField
                    label="State"
                    name="venueState"
                    value={formData.venueState || ""}
                    onChange={(e: any) =>
                      setFormData((p: any) => ({ ...p, venueState: e.target.value }))
                    }
                    placeholder="IL"
                  />
                </div>

                {/* Parking Type Selection */}
                <div className="mt-6">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                    Band Parking &amp; Load-in Access
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PARKING_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setFormData((p: any) => ({
                            ...p,
                            parkingType: opt.id,
                          }))
                        }
                        className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all cursor-pointer ${formData.parkingType === opt.id ||
                          (!formData.parkingType && opt.id === "bus-trailer")
                          ? "border-purple-400 bg-purple-950/40 text-white"
                          : "border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/5 hover:text-white"
                          }`}
                      >
                        <opt.icon className="h-4 w-4 mt-0.5 shrink-0 text-cyan-300" />
                        <div>
                          <p className="text-xs font-semibold">{opt.label}</p>
                          <p className="text-[11px] text-white/40 mt-0.5">
                            {opt.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    onClick={onSubmit}
                    disabled={submitting}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 px-7 py-3 text-xs font-bold text-[#120826] shadow-md hover:brightness-110 transition-all active:scale-[0.98]"
                  >
                    <span>{submitting ? "Submitting..." : "Submit Booking Request"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isStep3Complete
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-white/10 text-white/50"
                      }`}
                  >
                    {isStep3Complete ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : (
                      "3"
                    )}
                  </span>
                  <div className="min-w-0">
                    <span className="text-base font-bold text-white">
                      Venue &amp; Production
                    </span>
                    <p className="mt-0.5 text-xs text-white/50 truncate">
                      {formData.venueName
                        ? `${formData.venueName}${formData.venueCity ? `, ${formData.venueCity}` : ""
                        }`
                        : "Venue name, city, stage and technical requirements"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="flex shrink-0 items-center gap-1 text-xs font-medium text-white/60 hover:text-white transition-colors cursor-pointer ml-3"
                >
                  <span>Edit</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ══════════════ RIGHT COLUMN: STICKY SUMMARY SIDEBAR ══════════════ */}
        <aside
          aria-label="Booking Summary Sidebar"
          className="sticky top-24"
        >
          <BookingSummaryCard
            formData={formData}
            bookingSlots={bookingSlots}
            selectedType={selectedType}
            eventTypes={eventTypes}
            submitting={submitting}
            onSubmit={onSubmit}
            currentStep={activeStep}
          />
        </aside>
      </div>
    </div>
  );
}
