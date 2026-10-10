/* eslint-disable react-doctor/no-giant-component */
import React, { useState, useMemo, useRef, useEffect, useSyncExternalStore } from "react";
import { Guitar, Mic, PartyPopper, Sparkles, Check, Zap, ArrowRight } from "lucide-react";
import { DotChevronLeft, DotChevronRight, DotChevronDown } from "@/components/ui/DotArrow";
import GooeyMessagesDropdown from "@/components/GooeyMessagesDropdown";
import GlowInput from "@/components/GlowInput";
import SectionHeader from "@/components/SectionHeader";

export interface BookingSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  eventType: string;
  customEventType?: string;
  ageRestriction?: string;
  doorsTime?: string;
  cover?: string;
  ticketLink?: string;
  directionsLink?: string;
  mapUrl?: string;
  parkingInfo?: string;
  parkingUrl?: string;
  isFestival?: boolean;
  notes?: string;
  useSeparateInfo?: boolean;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  organization?: string;
  venueName?: string;
  venueCity?: string;
  venueState?: string;
}

const EMPTY_SLOTS: BookingSlot[] = [];
const EMPTY_BLOCKED_DATES: string[] = [];
const EMPTY_DATE_DETAILS: Record<
  string,
  Array<{ time: string; venue?: string; city?: string }>
> = {};
const MONTH_NAMES = [
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

const DAY_NAMES_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTH_NAMES_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export interface CalendarPickerLabels {
  bookingWindowHeading?: string;
  showStartLabel?: string;
  showFinishLabel?: string;
  bandStartLabel?: string;
  bandFinishLabel?: string;
  eventFormatHeading?: string;
  calendarSubtitle?: string;
  formats?: Array<{ id: string; label: string; desc: string }>;
}

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

export function CalendarPicker({
  slots = EMPTY_SLOTS,
  onChangeSlots,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  eventStartTime,
  onEventStartTimeChange,
  eventEndTime,
  onEventEndTimeChange,
  selectedType,
  onSelectType,
  customDetails,
  onCustomDetailsChange,
  mapUrl,
  onMapUrlChange,
  parkingInfo,
  onParkingInfoChange,
  label,
  required,
  blockedDates = EMPTY_BLOCKED_DATES,
  dateDetails = EMPTY_DATE_DETAILS,
  labels,
  hideHeader = false,
  hideFormat = false,
}: {
  slots: BookingSlot[];
  onChangeSlots: (slots: BookingSlot[]) => void;
  startTime: string;
  onStartTimeChange: (t: string) => void;
  endTime: string;
  onEndTimeChange: (t: string) => void;
  eventStartTime?: string;
  onEventStartTimeChange?: (t: string) => void;
  eventEndTime?: string;
  onEventEndTimeChange?: (t: string) => void;
  selectedType?: string;
  onSelectType?: (t: string) => void;
  customDetails?: string;
  onCustomDetailsChange?: (d: string) => void;
  mapUrl?: string;
  onMapUrlChange?: (m: string) => void;
  parkingInfo?: string;
  onParkingInfoChange?: (p: string) => void;
  label?: string;
  required?: boolean;
  blockedDates?: string[];
  dateDetails?: Record<
    string,
    Array<{ time: string; venue?: string; city?: string }>
  >;
  labels?: CalendarPickerLabels;
  hideHeader?: boolean;
  hideFormat?: boolean;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [localEventStart, setLocalEventStart] = useState("6:00 PM");
  const [localEventEnd, setLocalEventEnd] = useState("11:00 PM");
  const [openTimeline, setOpenTimeline] = useState<string | null>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const [expandedMetadata, setExpandedMetadata] = useState<
    Record<string, boolean>
  >({});

  const effectiveEventStart = eventStartTime || localEventStart;
  const effectiveBandStart = startTime || "8:00 PM";
  const effectiveBandEnd = endTime || "10:30 PM";
  const effectiveEventEnd = eventEndTime || localEventEnd;

  const handleSelectTimelineTime = (stage: string, t: string) => {
    if (stage === "eventStart") {
      if (onEventStartTimeChange) {
        onEventStartTimeChange(t);
      } else {
        setLocalEventStart(t);
      }
    } else if (stage === "bandStart") {
      onStartTimeChange(t);
    } else if (stage === "bandEnd") {
      onEndTimeChange(t);
    } else if (stage === "eventEnd") {
      if (onEventEndTimeChange) {
        onEventEndTimeChange(t);
      } else {
        setLocalEventEnd(t);
      }
    }
  };

  useEffect(() => {
    if (!openTimeline) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (
        timelineContainerRef.current &&
        !timelineContainerRef.current.contains(e.target as Node)
      ) {
        setOpenTimeline(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenTimeline(null);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openTimeline]);

  const preShowMinutes = useMemo(
    () => calculateDiffMinutes(effectiveEventStart, effectiveBandStart),
    [effectiveEventStart, effectiveBandStart],
  );
  const bandLiveMinutes = useMemo(
    () => calculateDiffMinutes(effectiveBandStart, effectiveBandEnd),
    [effectiveBandStart, effectiveBandEnd],
  );
  const postShowMinutes = useMemo(
    () => calculateDiffMinutes(effectiveBandEnd, effectiveEventEnd),
    [effectiveBandEnd, effectiveEventEnd],
  );
  const totalEventMinutes = useMemo(
    () => calculateDiffMinutes(effectiveEventStart, effectiveEventEnd),
    [effectiveEventStart, effectiveEventEnd],
  );

  const preShowPct = useMemo(
    () => Math.max(15, (preShowMinutes / (totalEventMinutes || 1)) * 100),
    [preShowMinutes, totalEventMinutes],
  );
  const bandLivePct = useMemo(
    () => Math.max(40, (bandLiveMinutes / (totalEventMinutes || 1)) * 100),
    [bandLiveMinutes, totalEventMinutes],
  );
  const postShowPct = useMemo(
    () => Math.max(15, (postShowMinutes / (totalEventMinutes || 1)) * 100),
    [postShowMinutes, totalEventMinutes],
  );

  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);

  const todayTimestamp = useSyncExternalStore(
    () => () => { },
    () => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    },
    () => 0,
  );

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentMonth]);

  const firstDayOfMonth = daysInMonth[0].getDay();
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  // Find all selected dates that already have existing shows
  const selectedBlockedInfo = useMemo(() => {
    return slots
      .filter((s) => blockedSet.has(s.date))
      .map((s) => {
        const details = dateDetails[s.date] || [];
        const timeFrame = details.map((d) => d.time).join(", ") || "Scheduled Show";
        const venueInfo = details
          .map((d) => [d.venue, d.city].filter(Boolean).join(" - "))
          .filter(Boolean)
          .join("; ");
        return {
          id: s.id,
          date: s.date,
          time: timeFrame,
          venue: venueInfo,
        };
      });
  }, [slots, blockedSet, dateDetails]);

  return (
    <div className="w-full border-0 p-0">
      {!hideHeader && label && (
        <div className="">
          <SectionHeader
            as="h3"
            title={
              <>
                {label} {required && <span className="text-[#c27aff]">*</span>}
              </>
            }
            subtitle={
              labels?.calendarSubtitle ||
              "Select one or more dates to secure your slot"
            }
            divider={false}
          />
        </div>
      )}

      {/* Legend — Static frame-0 render prevents post-mount injection layout shift */}
      <div className="mb-6 flex flex-wrap items-center gap-5 text-xs" role="region" aria-label="Calendar date legend">
        <span className="flex items-center gap-1.5 text-white/80">
          <span className="inline-block h-2.5 w-2.5 rounded-full border border-white/20 bg-white/20" aria-hidden="true" />{" "}
          Available
        </span>
        <span className="flex items-center gap-1.5 text-rose-300">
          <span className="inline-block h-2.5 w-2.5 rounded-full border border-rose-500/40 bg-rose-500/20" aria-hidden="true" />{" "}
          Show Scheduled (Double-booking allowed)
        </span>
      </div>

      <div className="booking-calendar-grid">
        {/* Row 1, Col 1: Calendar */}
        <div className="col-span-1 min-w-0">
          {/* Month & Year Selection Bar */}
          <div className="mb-6 flex items-center justify-center gap-3 sm:gap-4 border-0 p-0">
            <button
              aria-label="Previous Month"
              type="button"
              onClick={handlePrevMonth}
              className="transition-colors flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/10 hover:bg-white/20 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <DotChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="flex shrink-0 items-center justify-center gap-2">
              {/* Month Select Dropdown */}
              <GooeyMessagesDropdown
                placeholder="Month"
                showAllOption={false}
                selected={String(currentMonth.getMonth())}
                defaultSelectedId={String(currentMonth.getMonth())}
                customers={[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((name, idx) => ({ id: String(idx), name }))}
                onSelect={(opt) => {
                  const newMonth = parseInt(opt.id, 10);
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), newMonth, 1),
                  );
                }}
              />

              {/* Year Select Dropdown */}
              <GooeyMessagesDropdown
                placeholder="Year"
                showAllOption={false}
                selected={String(currentMonth.getFullYear())}
                defaultSelectedId={String(currentMonth.getFullYear())}
                customers={[2026, 2027, 2028].map((yr) => ({
                  id: String(yr),
                  name: String(yr),
                }))}
                onSelect={(opt) => {
                  const newYear = parseInt(opt.id, 10);
                  setCurrentMonth(
                    new Date(newYear, currentMonth.getMonth(), 1),
                  );
                }}
              />
            </div>

            <button
              aria-label="Next Month"
              type="button"
              onClick={handleNextMonth}
              className="transition-colors flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/10 hover:bg-white/20 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <DotChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mb-6 grid grid-cols-7" aria-hidden="true">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-white/50">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {emptyDays.map((i) => (
              <div key={`empty-${i}`} className="h-12 w-full" />
            ))}
            {daysInMonth.map((date) => {
              const dateString = !isNaN(date.getTime())
                ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                : `invalid-date-${date.getTime()}`;
              const slotsForDay = slots.filter((s) => s.date === dateString);
              const isSelected = slotsForDay.length > 0;
              const isPastDate =
                todayTimestamp > 0 && date.getTime() < todayTimestamp;
              const isBlocked = blockedSet.has(dateString);
              const dayDetailsList = dateDetails[dateString] || [];
              const dayTimeStr = dayDetailsList.map((d) => d.time).join(", ");
              const dayVenueStr = dayDetailsList
                .map((d) => [d.venue, d.city].filter(Boolean).join(" - "))
                .filter(Boolean)
                .join("; ");

              const fullDateAriaLabel = !isNaN(date.getTime())
                ? `${DAY_NAMES_FULL[date.getDay()]}, ${MONTH_NAMES_FULL[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}${isPastDate
                  ? " — Past date / Unavailable"
                  : isBlocked
                    ? ` — Show scheduled (${dayTimeStr || "Existing event"}), double-booking available${isSelected ? " — Selected" : ""}`
                    : isSelected
                      ? " — Selected"
                      : " — Available"
                }`
                : `Date ${dateString}`;

              const buttonTitle = isBlocked
                ? `Show already scheduled (${dayTimeStr || "Existing event"}${dayVenueStr ? ` at ${dayVenueStr}` : ""}). Click to request another time slot.`
                : undefined;

              return (
                <button
                  key={dateString}
                  type="button"
                  disabled={isPastDate}
                  aria-label={fullDateAriaLabel}
                  aria-pressed={isSelected}
                  onClick={() => {
                    if (isSelected) {
                      // Already selected, deselect (remove all slots for this date)
                      onChangeSlots(slots.filter((s) => s.date !== dateString));
                    } else {
                      // Add new slot
                      const newSlot = {
                        id: Math.random().toString(36).substring(2, 9),
                        date: dateString,
                        startTime: effectiveBandStart,
                        endTime: effectiveBandEnd,
                        eventType: selectedType || "full_band",
                        customEventType: customDetails || "",
                        ageRestriction: "all_ages",
                        doorsTime: effectiveEventStart,
                        cover: "",
                        ticketLink: "",
                        isFestival: false,
                        notes: "",
                      };
                      onChangeSlots([...slots, newSlot]);
                    }
                  }}
                  title={buttonTitle}
                  className={`relative flex h-12 w-full items-center justify-center rounded-[var(--radius-box)] transition-[background-color,color,border-color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${isPastDate
                    ? "cursor-not-allowed opacity-25"
                    : "cursor-pointer"
                    } ${isSelected
                      ? "scale-105 border-2 border-purple-400 bg-purple-600 text-white shadow-purple-600/40"
                      : isBlocked
                        ? "border border-rose-500/40 bg-rose-500/15 text-rose-300 hover:border-rose-400 hover:bg-rose-500/25"
                        : "border border-white/10 bg-[#00000029] hover:border-purple-400/60 hover:bg-white/10"
                    }`}
                >
                  <span aria-hidden="true">{date.getDate()}</span>
                  {isBlocked && (
                    <span aria-hidden="true" className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500" />
                  )}
                  {slotsForDay.length > 1 && (
                    <span aria-hidden="true" className="animate-scale-in absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center border border-white/10 bg-purple-600 text-xs text-white">
                      {slotsForDay.length}x
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Banner notification when user selects dates that have existing shows */}
          {selectedBlockedInfo.length > 0 && (
            <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-sm text-rose-200">
              <div className="flex items-start gap-2">
                <span className="text-base leading-none">⚠️</span>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-rose-300">
                    Existing show scheduled on selected date
                    {selectedBlockedInfo.length > 1 ? "s" : ""}:
                  </p>
                  {selectedBlockedInfo.map((item) => (
                    <p key={item.id} className="text-xs text-rose-200/90">
                      <strong>{item.date}</strong>: {item.time}
                      {item.venue ? ` (${item.venue})` : ""} — You can request
                      an alternate time window (e.g., afternoon, daytime, or
                      late night set).
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4-Stage Night Progression Capsule */}
        <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="">
              {labels?.bookingWindowHeading || "Event Night Progression & Timing"}
            </h2>
          </div>

          <div
            ref={timelineContainerRef}
            className="relative flex flex-col gap-3 "
          >
            {/* Row 1: Event Starts -> Band on Stage */}
            <div className="flex flex-wrap items-start gap-2.5 sm:gap-3">
              {/* 1. Event Start */}
              <div className="relative flex flex-col">
                <button
                  type="button"
                  id="cal-event-start-btn"
                  aria-haspopup="listbox"
                  aria-expanded={openTimeline === "eventStart"}
                  onClick={() =>
                    setOpenTimeline(
                      openTimeline === "eventStart" ? null : "eventStart",
                    )
                  }
                  className={`flex h-10 sm:min-w-[210px] justify-between cursor-pointer items-center gap-2 rounded-full border px-4 text-xs font-bold uppercase transition-all ${openTimeline === "eventStart"
                    ? "border-white/50 bg-white/[0.16] text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                    : "border-white/20 bg-white/[0.06] text-white hover:border-white/35 hover:bg-white/[0.12]"
                    }`}
                >
                  <span className="text-[10px] text-white/50 tracking-wider">EVENT STARTS:</span>
                  <span className="text-white font-bold">{effectiveEventStart}</span>
                  <DotChevronDown className="h-3 w-3 text-white/60" />
                </button>
                <span className="mt-1.5 pl-3 text-[10px] text-white/40">
                  Guests Arrive
                </span>

                {/* Popover */}
                {openTimeline === "eventStart" && (
                  <div
                    role="listbox"
                    data-lenis-prevent
                    aria-label="Select event start time"
                    className="absolute top-12 left-0 z-50 w-64 rounded-2xl border border-white/20 bg-[#0d1522]/95 p-3.5 shadow-2xl backdrop-blur-2xl"
                  >
                    <div className="mb-2 text-[10px] font-bold text-white/70 uppercase">
                      Select Event Start Time
                    </div>
                    <div
                      data-lenis-prevent
                      className="custom-scrollbar grid max-h-56 grid-cols-2 gap-1.5 overflow-y-auto overscroll-contain pr-1 touch-pan-y"
                    >
                      {EVENT_START_TIMES.map((t) => {
                        const isSelected = t === effectiveEventStart;
                        return (
                          <button
                            key={t}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              handleSelectTimelineTime("eventStart", t);
                              setOpenTimeline(null);
                            }}
                            className={`rounded-xl border px-2.5 py-2 text-xs font-semibold transition-all ${isSelected
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
                )}
              </div>

              <div className="flex h-10 items-center px-0.5 text-white/40" aria-hidden="true">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>

              {/* 2. Band Starts */}
              <div className="relative flex flex-col">
                <button
                  type="button"
                  id="cal-band-start-btn"
                  aria-haspopup="listbox"
                  aria-expanded={openTimeline === "bandStart"}
                  onClick={() =>
                    setOpenTimeline(
                      openTimeline === "bandStart" ? null : "bandStart",
                    )
                  }
                  className={`flex h-10 sm:min-w-[210px] justify-between cursor-pointer items-center gap-2 rounded-full border px-4 text-xs font-bold uppercase transition-all ${openTimeline === "bandStart"
                    ? "border-white/50 bg-white/[0.16] text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                    : "border-white/20 bg-white/[0.06] text-white hover:border-white/35 hover:bg-white/[0.12]"
                    }`}
                >
                  <span className="text-[10px] text-white/50 tracking-wider">
                    BAND ON STAGE:
                  </span>
                  <span className="text-white font-bold">{effectiveBandStart}</span>
                  <DotChevronDown className="h-3 w-3 text-white/60" />
                </button>
                <span className="mt-1.5 pl-3 text-[10px] text-white/40">
                  Live Show Starts
                </span>

                {/* Popover */}
                {openTimeline === "bandStart" && (
                  <div
                    role="listbox"
                    data-lenis-prevent
                    aria-label="Select band on stage time"
                    className="absolute top-12 left-0 sm:left-auto sm:right-0 z-50 w-64 rounded-2xl border border-white/20 bg-[#0d1522]/95 p-3.5 shadow-2xl backdrop-blur-2xl"
                  >
                    <div className="mb-2 text-[10px] font-bold text-white/70 uppercase">
                      Select Band On Stage Time
                    </div>
                    <div
                      data-lenis-prevent
                      className="custom-scrollbar grid max-h-56 grid-cols-2 gap-1.5 overflow-y-auto overscroll-contain pr-1 touch-pan-y"
                    >
                      {BAND_START_TIMES.map((t) => {
                        const isSelected = t === effectiveBandStart;
                        return (
                          <button
                            key={t}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              handleSelectTimelineTime("bandStart", t);
                              setOpenTimeline(null);
                            }}
                            className={`rounded-xl border px-2.5 py-2 text-xs font-semibold transition-all ${isSelected
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
                )}
              </div>
            </div>

            {/* Row 2: Band Finishes -> Event Ends */}
            <div className="flex flex-wrap items-start gap-2.5 sm:gap-3">
              {/* 3. Band Finishes */}
              <div className="relative flex flex-col">
                <button
                  type="button"
                  id="cal-band-finish-btn"
                  aria-haspopup="listbox"
                  aria-expanded={openTimeline === "bandEnd"}
                  onClick={() =>
                    setOpenTimeline(
                      openTimeline === "bandEnd" ? null : "bandEnd",
                    )
                  }
                  className={`flex h-10 sm:min-w-[210px] justify-between cursor-pointer items-center gap-2 rounded-full border px-4 text-xs font-bold uppercase transition-all ${openTimeline === "bandEnd"
                    ? "border-white/50 bg-white/[0.16] text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                    : "border-white/20 bg-white/[0.06] text-white hover:border-white/35 hover:bg-white/[0.12]"
                    }`}
                >
                  <span className="text-[10px] text-white/50 tracking-wider">
                    BAND FINISHES:
                  </span>
                  <span className="text-white font-bold">{effectiveBandEnd}</span>
                  <DotChevronDown className="h-3 w-3 text-white/60" />
                </button>
                <span className="mt-1.5 pl-3 text-[10px] text-white/40">
                  Final Encore
                </span>

                {/* Popover */}
                {openTimeline === "bandEnd" && (
                  <div
                    role="listbox"
                    data-lenis-prevent
                    aria-label="Select band finish time"
                    className="absolute top-12 left-0 z-50 w-64 rounded-2xl border border-white/20 bg-[#0d1522]/95 p-3.5 shadow-2xl backdrop-blur-2xl"
                  >
                    <div className="mb-2 text-[10px] font-bold text-white/70 uppercase">
                      Select Band Finish Time
                    </div>
                    <div
                      data-lenis-prevent
                      className="custom-scrollbar grid max-h-56 grid-cols-2 gap-1.5 overflow-y-auto overscroll-contain pr-1 touch-pan-y"
                    >
                      {BAND_END_TIMES.map((t) => {
                        const isSelected = t === effectiveBandEnd;
                        return (
                          <button
                            key={t}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              handleSelectTimelineTime("bandEnd", t);
                              setOpenTimeline(null);
                            }}
                            className={`rounded-xl border px-2.5 py-2 text-xs font-semibold transition-all ${isSelected
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
                )}
              </div>

              <div className="flex h-10 items-center px-0.5 text-white/40" aria-hidden="true">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>

              {/* 4. Event Ends */}
              <div className="relative flex flex-col">
                <button
                  type="button"
                  id="cal-event-end-btn"
                  aria-haspopup="listbox"
                  aria-expanded={openTimeline === "eventEnd"}
                  onClick={() =>
                    setOpenTimeline(
                      openTimeline === "eventEnd" ? null : "eventEnd",
                    )
                  }
                  className={`flex h-10 sm:min-w-[210px] justify-between cursor-pointer items-center gap-2 rounded-full border px-4 text-xs font-bold uppercase transition-all ${openTimeline === "eventEnd"
                    ? "border-white/50 bg-white/[0.16] text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                    : "border-white/20 bg-white/[0.06] text-white hover:border-white/35 hover:bg-white/[0.12]"
                    }`}
                >
                  <span className="text-[10px] text-white/50 tracking-wider">EVENT ENDS:</span>
                  <span className="text-white font-bold">{effectiveEventEnd}</span>
                  <DotChevronDown className="h-3 w-3 text-white/60" />
                </button>
                <span className="mt-1.5 pl-3 text-[10px] text-white/40">
                  Party Concludes
                </span>

                {/* Popover */}
                {openTimeline === "eventEnd" && (
                  <div
                    role="listbox"
                    data-lenis-prevent
                    aria-label="Select event end time"
                    className="absolute top-12 left-0 sm:left-auto sm:right-0 z-50 w-64 rounded-2xl border border-white/20 bg-[#0d1522]/95 p-3.5 shadow-2xl backdrop-blur-2xl"
                  >
                    <div className="mb-2 text-[10px] font-bold text-white/70 uppercase">
                      Select Event End Time
                    </div>
                    <div
                      data-lenis-prevent
                      className="custom-scrollbar grid max-h-56 grid-cols-2 gap-1.5 overflow-y-auto overscroll-contain pr-1 touch-pan-y"
                    >
                      {EVENT_END_TIMES.map((t) => {
                        const isSelected = t === effectiveEventEnd;
                        return (
                          <button
                            key={t}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              handleSelectTimelineTime("eventEnd", t);
                              setOpenTimeline(null);
                            }}
                            className={`rounded-xl border px-2.5 py-2 text-xs font-semibold transition-all ${isSelected
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
                )}
              </div>
            </div>

            {/* Row 3: Duration Summary Badge */}
            <div className="flex h-10 items-center pt-1">
              <span className="flex h-10 items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-4 text-xs font-bold text-white shadow-sm backdrop-blur-md">
                <Zap className="h-3.5 w-3.5 text-white/80" />
                <span>🎸 {formatDuration(bandLiveMinutes, "Live Set")}</span>
                <span className="text-white/30">•</span>
                <span>{formatDuration(totalEventMinutes, "Total")}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Event Format (spans full width on mobile/tablet, spans both columns at lg+) */}
        {!hideFormat && (
          <div className="col-span-1 lg:col-span-2">
            <EventFormatPicker
              selectedType={selectedType}
              onSelectType={onSelectType}
              customDetails={customDetails}
              onCustomDetailsChange={onCustomDetailsChange}
              labels={labels}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export interface EventFormatPickerProps {
  selectedType?: string;
  onSelectType?: (t: string) => void;
  customDetails?: string;
  onCustomDetailsChange?: (d: string) => void;
  labels?: CalendarPickerLabels;
  hideHeader?: boolean;
}

export function EventFormatPicker({
  selectedType,
  onSelectType,
  customDetails,
  onCustomDetailsChange,
  labels,
  hideHeader = false,
}: EventFormatPickerProps) {
  return (
    <div className="w-full">
      {!hideHeader && (
        <div className="mb-4">
          <h4 className="m-0">
            {labels?.eventFormatHeading || "Event Format"}
          </h4>
          <p className="mt-1 text-xs text-white/50">
            Choose the performance style for your date
          </p>
        </div>
      )}

      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        role="radiogroup"
        aria-label={labels?.eventFormatHeading || "Event Format"}
      >
        {[
          {
            id: "full_band",
            defaultLabel: "Full Band",
            Icon: Guitar,
            defaultDesc: "High energy, full 5-piece concert setup",
            badge: "Concert",
          },
          {
            id: "unplugged",
            defaultLabel: "Unplugged",
            Icon: Mic,
            defaultDesc: "Acoustic, intimate stripped-down set",
            badge: "Acoustic",
          },
          {
            id: "private",
            defaultLabel: "Private Event",
            Icon: PartyPopper,
            defaultDesc: "Birthdays, corporate events, weddings",
            badge: "Private",
          },
          {
            id: "custom",
            defaultLabel: "Custom Booking",
            Icon: Sparkles,
            defaultDesc: "Special requests, festivals, hybrid shows",
            badge: "Bespoke",
          },
        ].map((type) => {
          const matchedCustom = labels?.formats?.find((f) => f.id === type.id);
          const displayLabel = matchedCustom?.label || type.defaultLabel;
          const displayDesc = matchedCustom?.desc || type.defaultDesc;
          const isSelected = selectedType === type.id;
          const TypeIcon = type.Icon;

          return (
            <button
              key={type.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${displayLabel} — ${displayDesc}`}
              onClick={() => onSelectType?.(type.id)}
              className={`group relative flex cursor-pointer flex-col justify-between rounded-[var(--radius-box)] border p-5 text-left transition-[background-color,border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${isSelected
                ? "border-purple-500/60 bg-purple-950/30 shadow-[0_0_24px_rgba(168,85,247,0.18)] ring-1 ring-purple-500/50"
                : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                }`}
            >
              <div className="flex w-full items-start justify-between gap-2">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105 ${isSelected
                    ? "bg-purple-600 text-white shadow-[0_0_16px_rgba(168,85,247,0.5)]"
                    : "bg-white/10 text-white/70 group-hover:text-white"
                    }`}
                >
                  <TypeIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
                </div>
                {isSelected ? (
                  <span className="flex items-center gap-1 rounded-full border border-purple-400/40 bg-purple-500/20 px-2 py-0.5 text-[11px] font-semibold text-purple-300">
                    <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" /> Selected
                  </span>
                ) : (
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/50">
                    {type.badge}
                  </span>
                )}
              </div>

              <div className="mt-4">
                <h5 className={isSelected ? "text-white" : "text-white/90"}>
                  {displayLabel}
                </h5>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  {displayDesc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {selectedType === "custom" && (
        <div className="mt-4 animate-[fade-in-up_0.2s_ease-out_both]">
          <GlowInput
            type="text"
            placeholder="Describe your custom event (e.g. Street Fair, Festival, Hybrid Acoustic)..."
            value={customDetails || ""}
            onChange={(e) => onCustomDetailsChange?.(e.target.value)}
            autoFocus
            wrapperClassName="w-full"
          />
        </div>
      )}
    </div>
  );
}
