/* eslint-disable react-doctor/no-giant-component */
import React, { useState, useMemo, useSyncExternalStore } from "react";
import { Guitar, Mic, PartyPopper, Sparkles } from "lucide-react";

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
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
  label,
  required,
  blockedDates = EMPTY_BLOCKED_DATES,
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
  label: string;
  required?: boolean;
  blockedDates?: string[];
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [expandedMetadata, setExpandedMetadata] = useState<Record<string, boolean>>({});

  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);

  const todayTimestamp = useSyncExternalStore(
    () => () => {},
    () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); },
    () => 0
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
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };



  return (
    <div className="bg-[var(--color-section-bg)] backdrop-blur-xl border border-[var(--color-section-border)] p-6 w-full rounded-2xl shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-white font-extrabold tracking-wider uppercase text-sm">{label} {required && <span className="text-cyan-400">*</span>}</h3>
          <p className="text-white/60 text-xs mt-1 uppercase tracking-wide">Select one or more dates to secure your slot</p>
        </div>
      </div>

      {/* Legend */}
      {blockedDates.length > 0 && (
        <div className="flex items-center gap-5 mb-4 text-xs uppercase tracking-widest font-bold">
          <span className="flex items-center gap-1.5 text-white/60"><span className="w-3 h-3 rounded bg-white/10 border border-white/20 inline-block" /> Available</span>
          <span className="flex items-center gap-1.5 text-rose-400"><span className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/30 inline-block" /> Booked</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1.5fr] gap-8">
        <div>
          {/* Month & Year Selection Bar */}
          <div className="flex items-center justify-between bg-white/5 border border-white/10 p-3 mb-4 rounded-xl">
            <button aria-label="Previous"
              type="button"
              onClick={handlePrevMonth}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/10 border border-white/15 rounded-lg text-xs font-bold text-white hover:bg-white/20 transition-colors cursor-pointer shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
              <span>Prev</span>
            </button>

            <div className="flex items-center gap-2">
              {/* Month Select Dropdown */}
              <select aria-label="Select option"
                value={currentMonth.getMonth()}
                onChange={(e) => {
                  const newMonth = parseInt(e.target.value, 10);
                  setCurrentMonth(new Date(currentMonth.getFullYear(), newMonth, 1));
                }}
                className="bg-[var(--color-input-bg)] backdrop-blur-md border border-[var(--color-input-border)] text-white font-extrabold text-sm py-1.5 px-3 rounded-lg outline-none cursor-pointer focus:border-cyan-400 shadow-sm"
              >
                {[
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ].map((name, idx) => (
                  <option key={name} value={idx} className="bg-[#0c0817] text-white">{name}</option>
                ))}
              </select>

              {/* Year Select Dropdown */}
              <select aria-label="Select option"
                value={currentMonth.getFullYear()}
                onChange={(e) => {
                  const newYear = parseInt(e.target.value, 10);
                  setCurrentMonth(new Date(newYear, currentMonth.getMonth(), 1));
                }}
                className="bg-[var(--color-input-bg)] backdrop-blur-md border border-[var(--color-input-border)] text-white font-extrabold text-sm py-1.5 px-3 rounded-lg outline-none cursor-pointer focus:border-cyan-400 shadow-sm"
              >
                {[2026, 2027, 2028].map(yr => (
                  <option key={yr} value={yr} className="bg-[#0c0817] text-white">{yr}</option>
                ))}
              </select>
            </div>

            <button aria-label="Next"
              type="button"
              onClick={handleNextMonth}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/10 border border-white/15 rounded-lg text-xs font-bold text-white hover:bg-white/20 transition-colors cursor-pointer shadow-sm"
            >
              <span>Next</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center text-xs font-bold uppercase tracking-widest text-white/50">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {emptyDays.map(i => (
              <div key={`empty-${i}`} className="h-12 w-full" />
            ))}
            {daysInMonth.map(date => {
              const dateString = date.toISOString().split("T")[0];
              const slotsForDay = slots.filter(s => s.date === dateString);
              const isSelected = slotsForDay.length > 0;
              const isPastDate = todayTimestamp > 0 && date.getTime() < todayTimestamp;
              const isBlocked = blockedSet.has(dateString);

              return (
                <button aria-label="Action button"
                  key={dateString}
                  type="button"
                  disabled={isPastDate || isBlocked}
                  onClick={() => {
                    if (isSelected) {
                      // Already selected, deselect (remove all slots for this date)
                      onChangeSlots(slots.filter(s => s.date !== dateString));
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
                  className={`h-12 w-full flex items-center justify-center font-bold text-base transition-colors relative rounded-lg
                    ${(isPastDate || isBlocked) ? "cursor-not-allowed opacity-25" : "cursor-pointer"}
                    ${isBlocked
                      ? "bg-rose-500/20 border border-rose-500/30 text-rose-400 line-through"
                      : isSelected
                        ? "bg-cyan-600 text-white font-black shadow-lg shadow-cyan-600/40 scale-105"
                        : "bg-white/5 border border-white/10 hover:border-cyan-400/60 hover:bg-white/10 text-white"}
                  `}
                >
                  {date.getDate()}
                  {isBlocked && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
                  )}
                  {slotsForDay.length > 1 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-purple-600 border border-white/30 text-white text-[var(--font-size-3xs)] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale-in">
                      {slotsForDay.length}x
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-6">
          <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-white/50 mb-4">
            Booking Window
          </h4>
          <div className="flex flex-col gap-4">
            {/* Show Start Time */}
            <div>
              <label htmlFor="cal-show-start-time" className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1">When does the show start?</label>
              <div className="relative">
                <select aria-label="Select option"
                  id="cal-show-start-time"
                  value={startTime}
                  onChange={(e) => onStartTimeChange(e.target.value)}
                  className="w-full bg-[var(--color-input-bg)] backdrop-blur-md border border-[var(--color-input-border)] text-white font-bold tracking-wider py-3 px-4 text-xs outline-none focus:border-cyan-400 transition-colors appearance-none cursor-pointer rounded-lg shadow-inner"
                >
                  <option value="" disabled className="bg-[#0c0817] text-white">Select Show Start Time</option>
                  {["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM", "12:00 AM"].map(time => (
                    <option key={time} value={time} className="bg-[#0c0817] text-white">{time}</option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>

            {/* Show Finish Time */}
            <div>
              <label htmlFor="cal-show-finish-time" className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1">When does the show finish?</label>
              <div className="relative">
                <select aria-label="Select option"
                  id="cal-show-finish-time"
                  value={endTime}
                  onChange={(e) => onEndTimeChange(e.target.value)}
                  className="w-full bg-[var(--color-input-bg)] backdrop-blur-md border border-[var(--color-input-border)] text-white font-bold tracking-wider py-3 px-4 text-xs outline-none focus:border-cyan-400 transition-colors appearance-none cursor-pointer rounded-lg shadow-inner"
                >
                  <option value="" disabled className="bg-[#0c0817] text-white">Select Show Finish Time</option>
                  {["4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM", "12:00 AM", "1:00 AM", "2:00 AM", "3:00 AM"].map(time => (
                    <option key={time} value={time} className="bg-[#0c0817] text-white">{time}</option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-2" />

            {/* Band Start Time */}
            <div>
              <label htmlFor="cal-band-start-time" className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1">When does the band go on?</label>
              <div className="relative">
                <select aria-label="Select option"
                  id="cal-band-start-time"
                  value={startTime}
                  onChange={(e) => onStartTimeChange(e.target.value)}
                  className="w-full bg-[var(--color-input-bg)] backdrop-blur-md border border-[var(--color-input-border)] text-white font-bold tracking-wider py-3 px-4 text-xs outline-none focus:border-cyan-400 transition-colors appearance-none cursor-pointer rounded-lg shadow-inner"
                >
                  <option value="" disabled className="bg-[#0c0817] text-white">Select Band Start Time</option>
                  {["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM", "12:00 AM"].map(time => (
                    <option key={time} value={time} className="bg-[#0c0817] text-white">{time}</option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>

            {/* Band Finish Time */}
            <div>
              <label htmlFor="cal-band-finish-time" className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1">When does the band finish?</label>
              <div className="relative">
                <select aria-label="Select option"
                  id="cal-band-finish-time"
                  value={endTime}
                  onChange={(e) => onEndTimeChange(e.target.value)}
                  className="w-full bg-[var(--color-input-bg)] backdrop-blur-md border border-[var(--color-input-border)] text-white font-bold tracking-wider py-3 px-4 text-xs outline-none focus:border-cyan-400 transition-colors appearance-none cursor-pointer rounded-lg shadow-inner"
                >
                  <option value="" disabled className="bg-[#0c0817] text-white">Select Band Finish Time</option>
                  {["4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM", "12:00 AM", "1:00 AM", "2:00 AM", "3:00 AM"].map(time => (
                    <option key={time} value={time} className="bg-[#0c0817] text-white">{time}</option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-6">
          <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-white/50 mb-4">
            Event Format
          </h4>
          <div className="flex flex-col gap-3">
            {[
              { id: "full_band", label: "Full Band", Icon: Guitar, desc: "High energy, full 5-piece concert setup" },
              { id: "unplugged", label: "Unplugged", Icon: Mic, desc: "Acoustic, intimate stripped-down set" },
              { id: "private", label: "Private Event", Icon: PartyPopper, desc: "Birthdays, corporate events, weddings" },
              { id: "custom", label: "Custom Booking", Icon: Sparkles, desc: "Special requests, festivals, hybrid shows" },
            ].map(type => {
              const isSelected = selectedType === type.id;
              const TypeIcon = type.Icon;
              return (
                <div key={type.id}>
                  <button aria-label="Action button"
                    type="button"
                    onClick={() => onSelectType && onSelectType(type.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer flex gap-4 items-center group
                       ${isSelected
                        ? "border-cyan-400 bg-cyan-500/20 text-white shadow-md"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 text-white/80"}
                     `}
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={`text-base font-bold block mb-0.5 tracking-wide ${isSelected ? "text-cyan-300" : "text-white"}`}>{type.label}</span>
                      <span className="text-xs text-white/60 block leading-tight">{type.desc}</span>
                    </div>
                  </button>
                  {type.id === "custom" && isSelected && (
                    <div className="mt-2 animate-[fade-in-up_0.2s_ease-out_both]">
                      <input aria-label="Input field"
                        type="text"
                        placeholder="Describe your custom event (e.g. Street Fair)..."
                        value={customDetails || ""}
                        onChange={(e) => onCustomDetailsChange?.(e.target.value)}
                        autoFocus
                        className="w-full bg-[#0c0817]/80 backdrop-blur-md border border-white/20 text-white text-sm px-4 py-3 focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-white/40 rounded-lg shadow-inner"
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

