"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
} from "react";
import { Smartphone, ChevronUp, ChevronDown } from "lucide-react";

export interface ScrollWheelTimePickerProps {
  id?: string;
  name?: string;
  label: string;
  value?: string; // e.g. "7:00 PM" or "19:00"
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  milestoneBadge?: string; // e.g. "Doors Open", "Band Plays", "Curfew"
  milestoneTheme?: "emerald" | "purple" | "amber" | "cyan" | "rose";
  placeholder?: string;
  className?: string;
  defaultMinuteStep?: 5 | 1;
}

const ITEM_HEIGHT = 40; // 40px height per item in drum

/**
 * Parse a 12-hour or 24-hour time string into hour (1-12), minute (0-59), and period (AM/PM)
 */
function parseTimeString(raw?: string): {
  hour: number;
  minute: number;
  period: "AM" | "PM";
  raw24: string;
} {
  if (!raw || typeof raw !== "string" || !raw.trim()) {
    return { hour: 7, minute: 0, period: "PM", raw24: "19:00" };
  }

  const clean = raw.trim();

  // Try 12-hour with AM/PM (e.g. "7:30 PM", "08:00 AM", "7:00 PM (Band Plays)")
  const match12 = clean.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const p = match12[3].toUpperCase() as "AM" | "PM";
    if (h < 1) h = 12;
    if (h > 12) h = 12;
    const clampedM = Math.max(0, Math.min(59, isNaN(m) ? 0 : m));

    let h24 = h;
    if (p === "PM" && h !== 12) h24 += 12;
    if (p === "AM" && h === 12) h24 = 0;
    const raw24 = `${h24.toString().padStart(2, "0")}:${clampedM
      .toString()
      .padStart(2, "0")}`;

    return { hour: h, minute: clampedM, period: p, raw24 };
  }

  // Try 24-hour (e.g. "19:30" or "09:00")
  const match24 = clean.match(/(\d{1,2}):(\d{2})/);
  if (match24) {
    let h24 = parseInt(match24[1], 10);
    const m = parseInt(match24[2], 10);
    if (isNaN(h24)) h24 = 19;
    const clampedM = Math.max(0, Math.min(59, isNaN(m) ? 0 : m));

    const p: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    const raw24 = `${h24.toString().padStart(2, "0")}:${clampedM
      .toString()
      .padStart(2, "0")}`;

    return { hour: h12, minute: clampedM, period: p, raw24 };
  }

  return { hour: 7, minute: 0, period: "PM", raw24: "19:00" };
}

function format12h(hour: number, minute: number, period: "AM" | "PM"): string {
  const mStr = minute.toString().padStart(2, "0");
  return `${hour}:${mStr} ${period}`;
}

function to24h(hour: number, minute: number, period: "AM" | "PM"): string {
  let h24 = hour;
  if (period === "PM" && hour !== 12) h24 += 12;
  if (period === "AM" && hour === 12) h24 = 0;
  return `${h24.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
}

const HOURS_LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES_5_LIST = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const MINUTES_60_LIST = Array.from({ length: 60 }, (_, i) => i);
const PERIODS_LIST: ("AM" | "PM")[] = ["AM", "PM"];

export function ScrollWheelTimePicker({
  id,
  name,
  label,
  value = "",
  onChange,
  required = false,
  disabled = false,
  milestoneBadge,
  milestoneTheme = "purple",
  placeholder,
  className = "",
  defaultMinuteStep = 5,
}: ScrollWheelTimePickerProps) {
  const generatedId = useId();
  const inputId = id || `timepicker-${generatedId}`;

  const nativeInputRef = useRef<HTMLInputElement>(null);
  const hoursColRef = useRef<HTMLDivElement>(null);
  const minutesColRef = useRef<HTMLDivElement>(null);
  const periodColRef = useRef<HTMLDivElement>(null);

  const [minuteStep, setMinuteStep] = useState<1 | 5>(defaultMinuteStep);

  // Parse current value
  const parsed = parseTimeString(value);
  const [selectedHour, setSelectedHour] = useState(parsed.hour);
  const [selectedMinute, setSelectedMinute] = useState(parsed.minute);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">(
    parsed.period,
  );

  const selectedHourRef = useRef(selectedHour);
  const selectedMinuteRef = useRef(selectedMinute);
  const selectedPeriodRef = useRef(selectedPeriod);
  useEffect(() => {
    selectedHourRef.current = selectedHour;
    selectedMinuteRef.current = selectedMinute;
    selectedPeriodRef.current = selectedPeriod;
  }, [selectedHour, selectedMinute, selectedPeriod]);

  const isUserInteracting = useRef(false);
  const interactionTimer = useRef<NodeJS.Timeout | null>(null);

  const markUserInteracting = useCallback(() => {
    isUserInteracting.current = true;
    if (interactionTimer.current) clearTimeout(interactionTimer.current);
    interactionTimer.current = setTimeout(() => {
      isUserInteracting.current = false;
    }, 400);
  }, []);

  const hoursList = HOURS_LIST;
  const minutesList = minuteStep === 5 ? MINUTES_5_LIST : MINUTES_60_LIST;
  const periodsList = PERIODS_LIST;

  // Scroll a specific column to center on an index
  const scrollColumnToIndex = useCallback(
    (col: HTMLDivElement | null, index: number, smooth = true) => {
      if (!col) return;
      const targetTop = index * ITEM_HEIGHT;
      if (Math.abs(col.scrollTop - targetTop) > 2) {
        col.scrollTo({
          top: targetTop,
          behavior: smooth ? "smooth" : "instant",
        });
      }
    },
    [],
  );

  // Sync state when external value changes
  useEffect(() => {
    const p = parseTimeString(value);
    setSelectedHour(p.hour);
    setSelectedMinute(p.minute);
    setSelectedPeriod(p.period);

    if (!isUserInteracting.current) {
      const hIdx = HOURS_LIST.indexOf(p.hour);
      if (hIdx !== -1) scrollColumnToIndex(hoursColRef.current, hIdx, true);

      const activeMinutes = minuteStep === 5 ? MINUTES_5_LIST : MINUTES_60_LIST;
      let mIdx = activeMinutes.indexOf(p.minute);
      if (mIdx === -1) {
        mIdx = activeMinutes.reduce(
          (closest, m, idx) =>
            Math.abs(m - p.minute) < Math.abs(activeMinutes[closest] - p.minute)
              ? idx
              : closest,
          0,
        );
      }
      scrollColumnToIndex(minutesColRef.current, mIdx, true);

      const pIdx = PERIODS_LIST.indexOf(p.period);
      if (pIdx !== -1) scrollColumnToIndex(periodColRef.current, pIdx, true);
    }
  }, [value, minuteStep, scrollColumnToIndex]);

  // Initial centering on mount (without animation)
  useEffect(() => {
    const timer = setTimeout(() => {
      const p = parseTimeString(value);
      const hIdx = HOURS_LIST.indexOf(p.hour);
      if (hIdx !== -1) scrollColumnToIndex(hoursColRef.current, hIdx, false);

      const activeMinutes = minuteStep === 5 ? MINUTES_5_LIST : MINUTES_60_LIST;
      let mIdx = activeMinutes.indexOf(p.minute);
      if (mIdx === -1) {
        mIdx = activeMinutes.reduce(
          (closest, m, idx) =>
            Math.abs(m - p.minute) < Math.abs(activeMinutes[closest] - p.minute)
              ? idx
              : closest,
          0,
        );
      }
      scrollColumnToIndex(minutesColRef.current, mIdx, false);

      const pIdx = PERIODS_LIST.indexOf(p.period);
      if (pIdx !== -1) scrollColumnToIndex(periodColRef.current, pIdx, false);
    }, 60);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle native time input change (from mobile native iOS/Android picker)
  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val24 = e.target.value;
    if (!val24) return;
    const p = parseTimeString(val24);
    setSelectedHour(p.hour);
    setSelectedMinute(p.minute);
    setSelectedPeriod(p.period);
    const formatted = format12h(p.hour, p.minute, p.period);
    onChange(formatted);
  };

  // Open the native mobile time picker
  const triggerNativePicker = () => {
    if (!nativeInputRef.current) return;
    try {
      if ("showPicker" in HTMLInputElement.prototype) {
        nativeInputRef.current.showPicker();
      } else {
        nativeInputRef.current.focus();
        nativeInputRef.current.click();
      }
    } catch {
      nativeInputRef.current.focus();
      nativeInputRef.current.click();
    }
  };

  // Update selected time and notify parent
  const commitTime = useCallback(
    (h: number, m: number, p: "AM" | "PM") => {
      setSelectedHour(h);
      setSelectedMinute(m);
      setSelectedPeriod(p);
      const formatted = format12h(h, m, p);
      onChange(formatted);
    },
    [onChange],
  );

  // Steppers for hour (with 1..12 wrapping)
  const stepHour = (dir: number) => {
    markUserInteracting();
    const curH = selectedHourRef.current;
    let nextH = curH + dir;
    if (nextH > 12) nextH = 1;
    if (nextH < 1) nextH = 12;
    commitTime(nextH, selectedMinuteRef.current, selectedPeriodRef.current);
    const idx = hoursList.indexOf(nextH);
    if (idx !== -1) scrollColumnToIndex(hoursColRef.current, idx, true);
  };

  // Steppers for minute (with wrapping)
  const stepMinute = (dir: number) => {
    markUserInteracting();
    const curM = selectedMinuteRef.current;
    const list = minutesList;
    const curIdx = list.indexOf(curM);
    let nextIdx = (curIdx === -1 ? 0 : curIdx) + dir;
    if (nextIdx >= list.length) nextIdx = 0;
    if (nextIdx < 0) nextIdx = list.length - 1;
    const nextM = list[nextIdx];
    commitTime(selectedHourRef.current, nextM, selectedPeriodRef.current);
    scrollColumnToIndex(minutesColRef.current, nextIdx, true);
  };

  // Steppers for period (toggle AM/PM)
  const togglePeriod = () => {
    markUserInteracting();
    const nextP = selectedPeriodRef.current === "AM" ? "PM" : "AM";
    commitTime(selectedHourRef.current, selectedMinuteRef.current, nextP);
    const idx = periodsList.indexOf(nextP);
    if (idx !== -1) scrollColumnToIndex(periodColRef.current, idx, true);
  };

  const handleHourSelect = (h: number) => {
    markUserInteracting();
    commitTime(h, selectedMinuteRef.current, selectedPeriodRef.current);
    const idx = hoursList.indexOf(h);
    if (idx !== -1) scrollColumnToIndex(hoursColRef.current, idx, true);
  };

  const handleMinuteSelect = (m: number) => {
    markUserInteracting();
    commitTime(selectedHourRef.current, m, selectedPeriodRef.current);
    const idx = minutesList.indexOf(m);
    if (idx !== -1) scrollColumnToIndex(minutesColRef.current, idx, true);
  };

  const handlePeriodSelect = (p: "AM" | "PM") => {
    markUserInteracting();
    commitTime(selectedHourRef.current, selectedMinuteRef.current, p);
    const idx = periodsList.indexOf(p);
    if (idx !== -1) scrollColumnToIndex(periodColRef.current, idx, true);
  };

  const handleHoursScroll = (e: React.UIEvent<HTMLDivElement>) => {
    markUserInteracting();
    const col = e.currentTarget;
    const idx = Math.round(col.scrollTop / ITEM_HEIGHT);
    const safeIdx = Math.max(0, Math.min(hoursList.length - 1, idx));
    const newH = hoursList[safeIdx];
    if (newH !== undefined && newH !== selectedHourRef.current) {
      commitTime(newH, selectedMinuteRef.current, selectedPeriodRef.current);
    }
  };

  const handleMinutesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    markUserInteracting();
    const col = e.currentTarget;
    const idx = Math.round(col.scrollTop / ITEM_HEIGHT);
    const safeIdx = Math.max(0, Math.min(minutesList.length - 1, idx));
    const newM = minutesList[safeIdx];
    if (newM !== undefined && newM !== selectedMinuteRef.current) {
      commitTime(selectedHourRef.current, newM, selectedPeriodRef.current);
    }
  };

  const handlePeriodScroll = (e: React.UIEvent<HTMLDivElement>) => {
    markUserInteracting();
    const col = e.currentTarget;
    const idx = Math.round(col.scrollTop / ITEM_HEIGHT);
    const safeIdx = Math.max(0, Math.min(periodsList.length - 1, idx));
    const newP = periodsList[safeIdx];
    if (newP !== undefined && newP !== selectedPeriodRef.current) {
      commitTime(selectedHourRef.current, selectedMinuteRef.current, newP);
    }
  };

  // Mouse wheel stepping
  const lastWheelTime = useRef(0);
  const handleWheel = (
    e: React.WheelEvent<HTMLDivElement>,
    type: "hour" | "minute" | "period",
  ) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastWheelTime.current < 80) return;
    if (Math.abs(e.deltaY) < 3) return;

    lastWheelTime.current = now;
    markUserInteracting();

    const dir = e.deltaY > 0 ? 1 : -1;
    if (type === "hour") {
      stepHour(dir);
    } else if (type === "minute") {
      stepMinute(dir);
    } else if (type === "period") {
      togglePeriod();
    }
  };

  // Mouse drag-to-scroll support (allows dragging up/down with cursor)
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    colRef: React.RefObject<HTMLDivElement | null>,
    type: "hour" | "minute" | "period",
  ) => {
    const col = colRef.current;
    if (!col) return;
    if (e.button !== 0) return;

    markUserInteracting();
    const startY = e.clientY;
    const startScrollTop = col.scrollTop;
    let isDragging = false;

    const onPointerMove = (moveEv: PointerEvent) => {
      const deltaY = moveEv.clientY - startY;
      if (Math.abs(deltaY) > 3) {
        isDragging = true;
        markUserInteracting();
        col.scrollTop = startScrollTop - deltaY;
      }
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      if (isDragging) {
        markUserInteracting();
        const listLength =
          type === "hour"
            ? hoursList.length
            : type === "minute"
              ? minutesList.length
              : periodsList.length;
        const rawIdx = Math.round(col.scrollTop / ITEM_HEIGHT);
        const safeIdx = Math.max(0, Math.min(listLength - 1, rawIdx));

        if (type === "hour") {
          const h = hoursList[safeIdx];
          if (h !== undefined) {
            commitTime(h, selectedMinuteRef.current, selectedPeriodRef.current);
            scrollColumnToIndex(col, safeIdx, true);
          }
        } else if (type === "minute") {
          const m = minutesList[safeIdx];
          if (m !== undefined) {
            commitTime(selectedHourRef.current, m, selectedPeriodRef.current);
            scrollColumnToIndex(col, safeIdx, true);
          }
        } else if (type === "period") {
          const p = periodsList[safeIdx];
          if (p !== undefined) {
            commitTime(selectedHourRef.current, selectedMinuteRef.current, p);
            scrollColumnToIndex(col, safeIdx, true);
          }
        }
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  // Stepper adjustments for quick buttons
  const adjustMinutes = (delta: number) => {
    markUserInteracting();
    let totalMinutes =
      (selectedHourRef.current % 12) * 60 +
      selectedMinuteRef.current +
      (selectedPeriodRef.current === "PM" ? 12 * 60 : 0);
    totalMinutes = (totalMinutes + delta + 24 * 60) % (24 * 60);

    const newH24 = Math.floor(totalMinutes / 60);
    const newM = totalMinutes % 60;
    const newP: "AM" | "PM" = newH24 >= 12 ? "PM" : "AM";
    let newH12 = newH24 % 12;
    if (newH12 === 0) newH12 = 12;

    commitTime(newH12, newM, newP);

    // Scroll columns to match
    const hIdx = hoursList.indexOf(newH12);
    if (hIdx !== -1) scrollColumnToIndex(hoursColRef.current, hIdx, true);

    const activeMinutes = minuteStep === 5 ? MINUTES_5_LIST : MINUTES_60_LIST;
    let mIdx = activeMinutes.indexOf(newM);
    if (mIdx === -1) {
      mIdx = activeMinutes.reduce(
        (closest, m, idx) =>
          Math.abs(m - newM) < Math.abs(activeMinutes[closest] - newM)
            ? idx
            : closest,
        0,
      );
    }
    scrollColumnToIndex(minutesColRef.current, mIdx, true);

    const pIdx = periodsList.indexOf(newP);
    if (pIdx !== -1) scrollColumnToIndex(periodColRef.current, pIdx, true);
  };

  // Badge theme colors
  const badgeClasses = {
    purple: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    rose: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  }[milestoneTheme];

  const highlightBorderClasses = {
    purple:
      "border border-purple-400/50 bg-purple-500/20 shadow-[0_0_18px_rgba(168,85,247,0.22)]",
    emerald:
      "border border-emerald-400/50 bg-emerald-500/20 shadow-[0_0_18px_rgba(16,185,129,0.22)]",
    amber:
      "border border-amber-400/50 bg-amber-500/20 shadow-[0_0_18px_rgba(245,158,11,0.22)]",
    cyan:
      "border border-cyan-400/50 bg-cyan-500/20 shadow-[0_0_18px_rgba(6,182,212,0.22)]",
    rose:
      "border border-rose-400/50 bg-rose-500/20 shadow-[0_0_18px_rgba(244,63,94,0.22)]",
  }[milestoneTheme];

  const periodActiveClasses = {
    purple: "text-purple-300 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]",
    emerald: "text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.5)]",
    amber: "text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]",
    cyan: "text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.5)]",
    rose: "text-rose-300 drop-shadow-[0_0_8px_rgba(253,164,175,0.5)]",
  }[milestoneTheme];

  const displayTime = value ? parseTimeString(value) : null;
  const displayFormatted = displayTime
    ? format12h(displayTime.hour, displayTime.minute, displayTime.period)
    : "";

  return (
    <div className={`relative flex w-full flex-col justify-start ${className}`}>
      {/* Hidden Native Time Input for iOS & Android Mobile Pickers */}
      <input
        ref={nativeInputRef}
        type="time"
        id={inputId}
        name={name}
        value={to24h(selectedHour, selectedMinute, selectedPeriod)}
        onChange={handleNativeChange}
        required={required}
        disabled={disabled}
        aria-label={label || name || "Time picker"}
        className="sr-only pointer-events-none absolute -left-[9999px]"
        tabIndex={-1}
      />

      {/* Embedded Interactive Schedule Card */}
      <div
        className={`w-full select-none transition-all duration-200 ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
          }`}
      >
        {/* Card Header: Field Label on Left, Time Readout on Right (Same Row, Aligned) */}
        <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-white/10">
          {Boolean(label) && (
            <label
              htmlFor={inputId}
              className="text-[10px] font-bold uppercase tracking-wide text-white/80 cursor-pointer whitespace-nowrap leading-none select-none"
            >
              <span>{label}</span>
              {required && <span className="text-rose-400 ml-0.5">*</span>}
            </label>
          )}

          <span className="font-mono text-xs font-bold tracking-tight text-white whitespace-nowrap leading-none select-none">
            {displayFormatted || placeholder || "Select Time"}
          </span>
        </div>

        {/* Embedded 3-Column Scroll Wheel Drum Area */}
        <div className="relative my-2.5 flex flex-col rounded-xl border border-white/10 bg-neutral-950/80 p-1 overflow-hidden">
          {/* Top Chevron Stepper Row */}


          {/* Drum Columns Body */}
          <div className="relative flex h-[120px] w-full items-center justify-center overflow-hidden">
            {/* Center Highlight Pill Overlay */}
            <div
              className={`pointer-events-none absolute inset-x-1.5 top-[40px] z-10 h-[40px] rounded-full ${highlightBorderClasses}`}
            />

            {/* Top Gradient Fade Overlay */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[36px] bg-gradient-to-b from-neutral-950/90 via-neutral-950/40 to-transparent" />

            {/* Bottom Gradient Fade Overlay */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[36px] bg-gradient-to-t from-neutral-950/90 via-neutral-950/40 to-transparent" />

            {/* COLUMN 1: HOURS (1 to 12) */}
            <div className="relative flex flex-1 flex-col items-center h-full">
              <div
                ref={hoursColRef}
                onScroll={handleHoursScroll}
                onWheel={(e) => handleWheel(e, "hour")}
                onPointerDown={(e) => handlePointerDown(e, hoursColRef, "hour")}
                className="scroll-wheel-column h-[120px] w-full pt-[40px] pb-[40px] text-center cursor-grab active:cursor-grabbing select-none"
              >
                {hoursList.map((h) => {
                  const isSelected = h === selectedHour;
                  return (
                    <div
                      key={h}
                      onClick={() => handleHourSelect(h)}
                      className={`scroll-wheel-item flex h-[40px] cursor-pointer items-center justify-center font-mono transition-all duration-150 ${isSelected
                        ? "text-xl font-black text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]"
                        : "text-sm font-semibold text-white/60 hover:text-white hover:scale-105"
                        }`}
                    >
                      {h}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time Separator Colon */}
            <div className="z-20 font-mono text-base font-bold text-white/50 pb-0.5 px-0.5">
              :
            </div>

            {/* COLUMN 2: MINUTES (00 to 55 or 00 to 59) */}
            <div className="relative flex flex-1 flex-col items-center h-full">
              <div
                ref={minutesColRef}
                onScroll={handleMinutesScroll}
                onWheel={(e) => handleWheel(e, "minute")}
                onPointerDown={(e) =>
                  handlePointerDown(e, minutesColRef, "minute")
                }
                className="scroll-wheel-column h-[120px] w-full pt-[40px] pb-[40px] text-center cursor-grab active:cursor-grabbing select-none"
              >
                {minutesList.map((m) => {
                  const isSelected = m === selectedMinute;
                  return (
                    <div
                      key={m}
                      onClick={() => handleMinuteSelect(m)}
                      className={`scroll-wheel-item flex h-[40px] cursor-pointer items-center justify-center font-mono transition-all duration-150 ${isSelected
                        ? "text-xl font-black text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]"
                        : "text-sm font-semibold text-white/60 hover:text-white hover:scale-105"
                        }`}
                    >
                      {m.toString().padStart(2, "0")}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 3: AM / PM */}
            <div className="relative flex w-12 flex-col items-center h-full">
              <div
                ref={periodColRef}
                onScroll={handlePeriodScroll}
                onWheel={(e) => handleWheel(e, "period")}
                onPointerDown={(e) =>
                  handlePointerDown(e, periodColRef, "period")
                }
                className="scroll-wheel-column h-[120px] w-full pt-[40px] pb-[40px] text-center cursor-grab active:cursor-grabbing select-none"
              >
                {periodsList.map((p) => {
                  const isSelected = p === selectedPeriod;
                  return (
                    <div
                      key={p}
                      onClick={() => handlePeriodSelect(p)}
                      className={`scroll-wheel-item flex h-[40px] cursor-pointer items-center justify-center font-mono tracking-wider transition-all duration-150 ${isSelected
                        ? `text-sm font-extrabold scale-110 ${periodActiveClasses}`
                        : "text-xs font-semibold text-white/50 hover:text-white"
                        }`}
                    >
                      {p}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>


        </div>


      </div>
    </div>
  );
}

export default ScrollWheelTimePicker;
