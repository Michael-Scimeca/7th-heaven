"use client";

import { useState, useMemo } from "react";

const M_NAMES = [
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

export interface MiniDatePickerProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export function MiniDatePicker({
  label,
  value,
  onChange,
}: MiniDatePickerProps) {
  const [showCal, setShowCal] = useState(false);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [calMonth, setCalMonth] = useState(() => {
    if (value) {
      const vDate = new Date(value + "T12:00:00");
      if (!isNaN(vDate.getTime()))
        return new Date(vDate.getFullYear(), vDate.getMonth(), 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [showMonthGrid, setShowMonthGrid] = useState(false);
  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysCount = new Date(year, month + 1, 0).getDate();

  const isPrevDisabled =
    new Date(year, month, 1) <=
    new Date(today.getFullYear(), today.getMonth(), 1);

  const inputId = `mini-datepicker-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

  return (
    <div className="relative">
      <label htmlFor={inputId} className="mb-1.5 block cursor-pointer">
        {label}
      </label>
      <button
        id={inputId}
        aria-label={label || "Pick a date"}
        type="button"
        onClick={() => setShowCal(!showCal)}

        className={`group flex w-full cursor-pointer items-center justify-between rounded-lg border border-white/10 px-2.5 py-2.5 text-left ring-0 backdrop-blur-[45px] transition-colors outline-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none ${value ? " " : " "}`}
        style={{ background: "transparent", border: "1px solid #ffffff1a" }}
      >
        <span
          className={`transition-[color,opacity] duration-200 ${value ? " " : "/45 group-hover:text-white group-hover:opacity-100"}`}
        >
          {value
            ? new Date(value + "T12:00:00Z").toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              })
            : "Pick a date…"}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-50 transition-opacity duration-200 group-hover:opacity-100"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>
      {showCal && (
        <div className="absolute top-full left-0 z-50 mt-2 w-72 animate-[fade-in-up_0.15s_ease-out_both] rounded-lg border-0 bg-[#0c0817] p-4">
          <div className="mb-3 flex items-center justify-between">
            <button
              aria-label="Previous Month"
              type="button"
              disabled={isPrevDisabled}
              onClick={() => setCalMonth(new Date(year, month - 1, 1))}
              className={`p-1 transition-colors ${isPrevDisabled ? "cursor-not-allowed text-white/20" : "cursor-pointer hover:text-white"}`}
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
            </button>
            <button
              type="button"
              onClick={() => setShowMonthGrid(!showMonthGrid)}
              className="cursor-pointer transition-colors hover:text-[#c27aff]"
            >
              {calMonth.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </button>
            <button
              aria-label="Next Month"
              type="button"
              onClick={() => setCalMonth(new Date(year, month + 1, 1))}
              className="cursor-pointer p-1 hover:text-white"
            >
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
          {showMonthGrid ? (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCalMonth(new Date(year - 1, month, 1))}
                  className="cursor-pointer text-base hover:text-white"
                >
                  ← {year - 1}
                </button>
                <span>{year}</span>
                <button
                  type="button"
                  onClick={() => setCalMonth(new Date(year + 1, month, 1))}
                  className="cursor-pointer text-base hover:text-white"
                >
                  {year + 1} →
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {M_NAMES.map((m, i) => {
                  const isCur = month === i;
                  const isPast = new Date(year, i + 1, 0) < today;
                  return (
                    <button
                      key={m}
                      type="button"
                      disabled={isPast}
                      onClick={() => {
                        setCalMonth(new Date(year, i, 1));
                        setShowMonthGrid(false);
                      }}
                      className={`rounded-lg py-2 text-base transition-colors ${isPast ? "cursor-not-allowed text-white/20" : isCur ? "bg-[#a855f7] shadow-purple-600/30" : "cursor-pointer text-white/70 hover:bg-white/10"}`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <div className="mb-1 grid grid-cols-7">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div
                    key={`day-${i}-${d}`}
                    className="text-center text-lg text-white/40"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`e${i}`} />
                ))}
                {Array.from({ length: daysCount }).map((_, i) => {
                  const d = new Date(year, month, i + 1);
                  d.setHours(0, 0, 0, 0);
                  const ds = !isNaN(d.getTime())
                    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                    : `date-${i}`;
                  const isPast = d < today;
                  const isSel = value === ds;
                  return (
                    <button
                      key={`${ds}-${i}`}
                      type="button"
                      disabled={isPast}
                      onClick={() => {
                        onChange(ds);
                        setShowCal(false);
                      }}
                      className={`flex h-10 w-full items-center justify-center rounded-lg transition-colors ${isPast ? "cursor-not-allowed text-white/20" : isSel ? "bg-[#a855f7] shadow-purple-600/40" : "cursor-pointer bg-[#00000029] hover:bg-white/15"}`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setShowCal(false);
                  }}
                  className="mt-2 w-full cursor-pointer text-base text-rose-500 hover:text-rose-600"
                >
                  Clear
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
