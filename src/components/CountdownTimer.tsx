"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: string;
  targetTime?: string;
  compact?: boolean;
  className?: string;
}

export default function CountdownTimer({ targetDate, targetTime, compact = false, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 30 });
  const [isHappening, setIsHappening] = useState(false);

  useEffect(() => {
    const getTarget = (): Date => {
      if (!targetDate) return new Date();

      let d: Date;

      // 1. If ISO date string (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}/.test(targetDate)) {
        d = new Date(targetDate.length === 10 ? `${targetDate}T20:00:00` : targetDate);
      } else {
        // 2. Remove duplicate years if caller passed e.g. "Aug 15, 2026, 2026"
        const cleanDateStr = targetDate.replace(/,\s*\d{4}.*$/, "").trim();

        // Try parsing direct clean string
        d = new Date(cleanDateStr);

        // If direct parse failed, append current year
        if (isNaN(d.getTime())) {
          d = new Date(`${cleanDateStr}, ${new Date().getFullYear()}`);
        }

        // If still invalid, try matching "Month Day" pattern
        if (isNaN(d.getTime())) {
          const match = targetDate.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}/i);
          if (match) {
            d = new Date(`${match[0]}, ${new Date().getFullYear()}`);
          }
        }
      }

      if (isNaN(d.getTime())) {
        d = new Date();
      }

      // Parse targetTime if provided
      if (targetTime) {
        const match = targetTime.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
        if (match) {
          let h = parseInt(match[1], 10);
          const m = parseInt(match[2] || "0", 10);
          const ampm = match[3]?.toLowerCase();
          if (ampm === "pm" && h !== 12) h += 12;
          if (ampm === "am" && h === 12) h = 0;
          if (!isNaN(h) && !isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
            d.setHours(h, m, 0, 0);
          }
        }
      }

      return d;
    };

    const update = () => {
      const now = new Date().getTime();
      const targetObj = getTarget();
      const targetTimeMs = targetObj.getTime();

      // Guard against NaN
      if (isNaN(targetTimeMs)) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0 });
        setIsHappening(false);
        return;
      }

      const diff = targetTimeMs - now;

      if (isNaN(diff) || diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0 });
        setIsHappening(now >= targetTimeMs && now < targetTimeMs + (4 * 60 * 60 * 1000));
        return;
      }

      setIsHappening(false);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days: isNaN(days) || days < 0 ? 0 : days,
        hours: isNaN(hours) || hours < 0 ? 0 : hours,
        minutes: isNaN(minutes) || minutes < 0 ? 0 : minutes,
        seconds: isNaN(seconds) || seconds < 0 ? 0 : seconds,
        totalDays: isNaN(days) || days < 0 ? 0 : days,
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate, targetTime]);

  if (isHappening) {
    return (
      <div className={`flex items-center gap-2 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.3)] bg-red-500/20 border border-red-500/40 animate-pulse shrink-0 whitespace-nowrap ${compact ? 'px-3.5 py-1.5' : 'px-5 py-2.5'} ${className}`}>
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-lg bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-lg h-2.5 w-2.5 bg-red-500"></span>
        </span>
        <span className={`font-bold uppercase    text-white whitespace-nowrap ${compact ? 'text-[var(--font-size-5xs)]' : 'text-xs'}`}>NOW LIVE</span>
      </div>
    );
  }

  const urgency = Math.max(0, Math.min(1, 1 - timeLeft.totalDays / 14));
  const numberColor = urgency > 0.5 ? '#a855f7' : '#ffffff';

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hrs", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <div className={`flex items-center shrink-0 max-w-full overflow-x-auto no-scrollbar ${className ? className : (compact ? 'gap-1 sm:gap-1.5' : 'gap-1 sm:gap-3 md:gap-4')}`}>
      {units.map((u, i) => (
        <div key={u.label} className={`flex items-center ${compact ? 'gap-1 sm:gap-1.5' : 'gap-1 sm:gap-2.5 md:gap-3.5'}`}>
          <div className={`flex flex-col items-center justify-center ${compact ? 'px-1.5 py-0.5 sm:px-2 sm:py-1 min-w-[36px] sm:min-w-[44px]' : 'px-1 sm:px-0 md:px-3 py-1 md:py-2 min-w-0 sm:min-w-[52px] md:min-w-[64px]'}`}>
            <span
              className={`font-bold leading-none tabular-nums transition-colors duration-1000 ${compact ? 'text-[clamp(15px,1.8vw,25px)]  font-bold ' : 'text-[clamp(18px,4.5vw,3.5rem)]'}`}
              style={{ color: numberColor }}
            >
              {String(isNaN(u.value) || u.value < 0 ? 0 : u.value).padStart(2, "0")}
            </span>
            <span className={`uppercase  ${compact ? 'text-[10px] sm:text-[12px] font-bold text-white/70 mt-0.5 sm:mt-1   ' : 'text-[clamp(8px,1vw,11px)] font-bold  text-white  mt-1   '}`}>{u.label}</span>
          </div>
          {i < 3 && <span className={`text-white/40 font-bold ${compact ? 'text-sm sm:text-lg' : 'text-lg sm:text-2xl md:text-4xl'}`}>:</span>}
        </div>
      ))}
    </div>
  );
}
