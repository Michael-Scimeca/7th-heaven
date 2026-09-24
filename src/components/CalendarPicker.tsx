/* eslint-disable react-doctor/no-giant-component */
import React, { useState, useMemo, useSyncExternalStore } from "react";
import { Guitar, Mic, PartyPopper, Sparkles } from "lucide-react";
import GooeyMessagesDropdown from "@/components/GooeyMessagesDropdown";
import SeventhButton from "@/components/SeventhButton";

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

export function CalendarPicker({
  slots = EMPTY_SLOTS,
  onChangeSlots,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
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
  labels,
}: {
  slots: BookingSlot[];
  onChangeSlots: (slots: BookingSlot[]) => void;
  startTime: string;
  onStartTimeChange: (t: string) => void;
  endTime: string;
  onEndTimeChange: (t: string) => void;
  selectedType?: string;
  onSelectType?: (t: string) => void;
  customDetails?: string;
  onCustomDetailsChange?: (d: string) => void;
  mapUrl?: string;
  onMapUrlChange?: (m: string) => void;
  parkingInfo?: string;
  onParkingInfoChange?: (p: string) => void;
  label: string;
  required?: boolean;
  blockedDates?: string[];
  labels?: CalendarPickerLabels;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [expandedMetadata, setExpandedMetadata] = useState<
    Record<string, boolean>
  >({});

  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);

  const todayTimestamp = useSyncExternalStore(
    () => () => {},
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

  return (
    <div className="w-full border-0 p-0">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3>
            {label} {required && <span className="text-[#c27aff]">*</span>}
          </h3>
          <p>
            {labels?.calendarSubtitle ||
              "Select one or more dates to secure your slot"}
          </p>
        </div>
      </div>

      {/* Legend — Static frame-0 render prevents post-mount injection layout shift */}
      <div className="mb-6 flex items-center gap-5">
        <span className="/90 flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-white/10 bg-white/10" />{" "}
          Available
        </span>
        <span className="flex items-center gap-1.5 text-rose-400">
          <span className="inline-block h-3 w-3 rounded border border-rose-500/30 bg-rose-500/20" />{" "}
          Booked
        </span>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-6 min-[1500px]:grid-cols-[1.8fr_1.05fr_1.35fr] md:grid-cols-2">
        {/* Row 1, Col 1: Calendar */}
        <div className="col-span-1 min-[1500px]:col-span-1">
          {/* Month & Year Selection Bar */}
          <div className="mb-6 flex items-center justify-between border-0 p-0">
            <button
              aria-label="Previous"
              type="button"
              onClick={handlePrevMonth}
              className="flex cursor-pointer items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 hover:bg-white/20"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Prev</span>
            </button>

            <div className="flex items-center gap-2">
              {/* Month Select Dropdown */}
              <GooeyMessagesDropdown
                placeholder="Month"
                showAllOption={false}
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
              aria-label="Next"
              type="button"
              onClick={handleNextMonth}
              className="flex cursor-pointer items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 hover:bg-white/20"
            >
              <span>Next</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className="mb-6 grid grid-cols-7">
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

              return (
                <button
                  key={dateString}
                  type="button"
                  disabled={isPastDate || isBlocked}
                  onClick={() => {
                    if (isSelected) {
                      // Already selected, deselect (remove all slots for this date)
                      onChangeSlots(slots.filter((s) => s.date !== dateString));
                    } else {
                      // Add new slot
                      const newSlot = {
                        id: Math.random().toString(36).substring(2, 9),
                        date: dateString,
                        startTime: startTime || "7:00 PM",
                        endTime: endTime || "10:00 PM",
                        eventType: selectedType || "full_band",
                        customEventType: customDetails || "",
                        ageRestriction: "all_ages",
                        doorsTime: "",
                        cover: "",
                        ticketLink: "",
                        isFestival: false,
                        notes: "",
                      };
                      onChangeSlots([...slots, newSlot]);
                    }
                  }}
                  title={isBlocked ? "This date is already booked" : undefined}
                  className={`relative flex h-12 w-full items-center justify-center rounded-lg text-base ${isPastDate || isBlocked ? "cursor-not-allowed opacity-25" : "cursor-pointer"} ${isBlocked ? "border border-rose-500/30 bg-rose-500/20 text-rose-400 line-through" : isSelected ? "scale-105 border-2 border-purple-400 bg-purple-600 shadow-purple-600/40" : "border border-white/10 bg-[#00000029] hover:border-purple-400/60 hover:bg-white/10"}`}
                >
                  {date.getDate()}
                  {isBlocked && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-lg bg-rose-500" />
                  )}
                  {slotsForDay.length > 1 && (
                    <span className="animate-scale-in absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-lg border border-white/10 bg-purple-600">
                      {slotsForDay.length}x
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 1, Col 2: Booking Window */}
        <div className="col-span-1 border-t border-white/10 pt-6 min-[1500px]:col-span-1 min-[1500px]:border-l md:border-t-0 md:border-l md:pt-0">
          <h4 className="mb-6 text-white/50">
            {labels?.bookingWindowHeading || "Booking Window"}
          </h4>
          <div className="flex flex-col gap-3">
            {/* Show Start Time */}
            <div>
              <label htmlFor="cal-show-start-time" className="mb-1 block">
                {labels?.showStartLabel || "When does the show start?"}
              </label>
              <GooeyMessagesDropdown
                fullWidth={true}
                placeholder="Select Show Start Time"
                defaultSelectedId={startTime}
                customers={[
                  "12:00 PM",
                  "1:00 PM",
                  "2:00 PM",
                  "3:00 PM",
                  "4:00 PM",
                  "5:00 PM",
                  "6:00 PM",
                  "7:00 PM",
                  "8:00 PM",
                  "9:00 PM",
                  "10:00 PM",
                  "11:00 PM",
                  "12:00 AM",
                ].map((t) => ({ id: t, name: t }))}
                onSelect={(opt) => onStartTimeChange(opt.id)}
                className="w-full"
              />
            </div>

            {/* Show Finish Time */}
            <div>
              <label htmlFor="cal-show-finish-time" className="mb-1 block">
                {labels?.showFinishLabel || "When does the show finish?"}
              </label>
              <GooeyMessagesDropdown
                fullWidth={true}
                placeholder="Select Show Finish Time"
                defaultSelectedId={endTime}
                customers={[
                  "4:00 PM",
                  "5:00 PM",
                  "6:00 PM",
                  "7:00 PM",
                  "8:00 PM",
                  "9:00 PM",
                  "10:00 PM",
                  "11:00 PM",
                  "12:00 AM",
                  "1:00 AM",
                  "2:00 AM",
                  "3:00 AM",
                ].map((t) => ({ id: t, name: t }))}
                onSelect={(opt) => onEndTimeChange(opt.id)}
                className="w-full"
              />
            </div>

            {/* Band Start Time */}
            <div>
              <label htmlFor="cal-band-start-time" className="mb-1 block">
                {labels?.bandStartLabel || "When does the band go on?"}
              </label>
              <GooeyMessagesDropdown
                fullWidth={true}
                placeholder="Select Band Start Time"
                defaultSelectedId={startTime}
                customers={[
                  "12:00 PM",
                  "1:00 PM",
                  "2:00 PM",
                  "3:00 PM",
                  "4:00 PM",
                  "5:00 PM",
                  "6:00 PM",
                  "7:00 PM",
                  "8:00 PM",
                  "9:00 PM",
                  "10:00 PM",
                  "11:00 PM",
                  "12:00 AM",
                ].map((t) => ({ id: t, name: t }))}
                onSelect={(opt) => onStartTimeChange(opt.id)}
                className="w-full"
              />
            </div>

            {/* Band Finish Time */}
            <div>
              <label htmlFor="cal-band-finish-time" className="mb-1 block">
                {labels?.bandFinishLabel || "When does the band finish?"}
              </label>
              <GooeyMessagesDropdown
                fullWidth={true}
                placeholder="Select Band Finish Time"
                defaultSelectedId={endTime}
                customers={[
                  "4:00 PM",
                  "5:00 PM",
                  "6:00 PM",
                  "7:00 PM",
                  "8:00 PM",
                  "9:00 PM",
                  "10:00 PM",
                  "11:00 PM",
                  "12:00 AM",
                  "1:00 AM",
                  "2:00 AM",
                  "3:00 AM",
                ].map((t) => ({ id: t, name: t }))}
                onSelect={(opt) => onEndTimeChange(opt.id)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Event Format (spans full width on Row 2 below 1500px, moves to Col 3 at 1500px+) */}
        <div className="col-span-1 min-[1500px]:col-span-1 min-[1500px]:pt-0 md:col-span-2">
          <h4 className="mb-6 text-white/50">
            {labels?.eventFormatHeading || "Event Format"}
          </h4>
          <div className="grid grid-cols-1 gap-6 min-[1500px]:grid-cols-1 sm:grid-cols-2">
            {[
              {
                id: "full_band",
                defaultLabel: "Full Band",
                Icon: Guitar,
                defaultDesc: "High energy, full 5-piece concert setup",
              },
              {
                id: "unplugged",
                defaultLabel: "Unplugged",
                Icon: Mic,
                defaultDesc: "Acoustic, intimate stripped-down set",
              },
              {
                id: "private",
                defaultLabel: "Private Event",
                Icon: PartyPopper,
                defaultDesc: "Birthdays, corporate events, weddings",
              },
              {
                id: "custom",
                defaultLabel: "Custom Booking",
                Icon: Sparkles,
                defaultDesc: "Special requests, festivals, hybrid shows",
              },
            ].map((type) => {
              const matchedCustom = labels?.formats?.find(
                (f) => f.id === type.id,
              );
              const displayLabel = matchedCustom?.label || type.defaultLabel;
              const displayDesc = matchedCustom?.desc || type.defaultDesc;
              const isSelected = selectedType === type.id;
              const TypeIcon = type.Icon;
              return (
                <div key={type.id}>
                  <SeventhButton
                    isActive={isSelected}
                    onClick={() => onSelectType && onSelectType(type.id)}
                    className="group flex !h-auto w-full cursor-pointer !justify-start gap-3 !rounded-[2.5rem] !p-0 py-3 pr-4 text-left sm:gap-4 sm:py-4 sm:pr-5 [&>span]:w-full [&>span]:max-w-full [&>span]:min-w-0 [&>span]:whitespace-normal"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 ${isSelected ? "bg-purple-600/30" : "bg-white/10 text-white/50"}`}
                    >
                      <TypeIcon className="h-5 w-5 shrink-0" />
                    </div>
                    <div className="flex min-w-0 flex-1 items-center gap-2 text-left">
                      <span
                        className={`block sm:text-base ${isSelected ? " " : " "}`}
                      >
                        {displayLabel}
                      </span>
                      <span className="sm: line-clamp-1 block sm:line-clamp-2">
                        {displayDesc}
                      </span>
                    </div>
                  </SeventhButton>
                  {type.id === "custom" && isSelected && (
                    <div className="mt-2 animate-[fade-in-up_0.2s_ease-out_both]">
                      <input
                        type="text"
                        placeholder="Describe your custom event (e.g. Street Fair)..."
                        value={customDetails || ""}
                        onChange={(e) =>
                          onCustomDetailsChange?.(e.target.value)
                        }
                        autoFocus
                        className="placeholder: focus-ring w-full rounded-lg border border-white/10 bg-[#0c0817]/80 px-4 py-3 text-white/40 shadow-inner backdrop-blur-2xl"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
