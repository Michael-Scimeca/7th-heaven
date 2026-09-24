"use client";

import { useState, useEffect } from "react";
import { getShowDateTime } from "@/lib/tour-helpers";

interface CountdownTimerProps {
  targetDate: string;
  targetTime?: string;
  compact?: boolean;
  className?: string;
}

export default function CountdownTimer({
  targetDate,
  targetTime,
  compact = false,
  className = "",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalDays: 30,
  });
  const [isHappening, setIsHappening] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const targetObj = getShowDateTime(undefined, targetDate, targetTime);
      const targetTimeMs = targetObj.getTime();

      // Guard against invalid date
      if (!targetTimeMs || isNaN(targetTimeMs)) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalDays: 0,
        });
        setIsHappening(false);
        return;
      }

      const diff = targetTimeMs - now;

      if (isNaN(diff) || diff <= 0) {
        const endTime = targetTimeMs + 4 * 60 * 60 * 1000;
        const liveDiff = endTime - now;
        if (now >= targetTimeMs && liveDiff > 0) {
          setIsHappening(true);
          const hours = Math.floor(
            (liveDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          );
          const minutes = Math.floor(
            (liveDiff % (1000 * 60 * 60)) / (1000 * 60),
          );
          const seconds = Math.floor((liveDiff % (1000 * 60)) / 1000);
          setTimeLeft({ days: 0, hours, minutes, seconds, totalDays: 0 });
        } else {
          setIsHappening(false);
          setTimeLeft({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            totalDays: 0,
          });
        }
        return;
      }

      setIsHappening(false);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
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

  const urgency = Math.max(0, Math.min(1, 1 - timeLeft.totalDays / 14));
  const numberColor = isHappening
    ? "#34d399"
    : urgency > 0.5
      ? "#a855f7"
      : "#ffffff";

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hrs", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center gap-3">
      {isHappening && (
        <div className="flex animate-pulse items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 text-[10px] text-emerald-300 md:text-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span>LIVE NOW</span>
        </div>
      )}
      <div
        className={`no-scrollbar flex max-w-full shrink-0 items-start overflow-x-auto ${className ? className : compact ? "gap-0.5 sm:gap-1" : "gap-1 sm:gap-3 md:gap-4"}`}
      >
        {units.map((u, i) => (
          <div
            key={u.label}
            className={`flex items-start ${compact ? "gap-0.5 sm:gap-1" : "gap-1 sm:gap-2.5 md:gap-3.5"}`}
          >
            <div
              className={`flex flex-col items-center justify-center ${compact ? "min-w-[28px] px-1 py-0.5 sm:min-w-[34px]" : "min-w-0 px-1 sm:min-w-[52px] sm:px-0 md:min-w-[64px]"}`}
            >
              <span
                className={`leading-none font-black tabular-nums transition-colors duration-1000 ${compact ? "text-xs sm:text-sm md:text-base" : "text-[clamp(18px,4.5vw,3.5rem)]"}`}
                style={{ color: numberColor }}
              >
                {String(isNaN(u.value) || u.value < 0 ? 0 : u.value).padStart(
                  2,
                  "0",
                )}
              </span>
              <span
                className={`r ${compact ? "mt-0.5 text-[9px] text-white/60 sm:text-[10px]" : "mt-1.5"}`}
              >
                {u.label}
              </span>
            </div>
            {i < 3 && (
              <span
                className={`flex items-center justify-center self-start leading-none text-white/40 select-none ${compact ? "mt-0.5 h-3.5 text-xs sm:text-sm" : "h-[clamp(18px,4.5vw,3.5rem)] text-lg sm:text-2xl md:text-4xl"}`}
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
