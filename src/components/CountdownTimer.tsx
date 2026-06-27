"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
 targetDate: string;
 targetTime?: string;
}

export default function CountdownTimer({ targetDate, targetTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 30 });
  const [isHappening, setIsHappening] = useState(false);

  useEffect(() => {
   const getTarget = () => {
    // Handle both ISO (2026-04-24) and display (April 24) date formats
    let d: Date;
    if (/^\d{4}-\d{2}-\d{2}/.test(targetDate)) {
     d = new Date(targetDate + 'T20:00:00');
    } else {
     d = new Date(targetDate + ', ' + new Date().getFullYear());
    }
    if (targetTime) {
     const match = targetTime.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i);
     if (match) {
      let h = parseInt(match[1]);
      const m = parseInt(match[2] || '0');
      if (match[3].toLowerCase() === "pm" && h !== 12) h += 12;
      if (match[3].toLowerCase() === "am" && h === 12) h = 0;
      d.setHours(h, m, 0, 0);
     }
    }
    return d;
   };

   const update = () => {
    const now = new Date().getTime();
    const target = getTarget().getTime();
    const diff = target - now;

    if (diff <= 0) {
     setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0 });
     setIsHappening(now >= target && now < target + (4 * 60 * 60 * 1000));
     return;
    }

    setIsHappening(false);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    setTimeLeft({
     days,
     hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
     minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
     seconds: Math.floor((diff % (1000 * 60)) / 1000),
     totalDays: days,
    });
   };

   update();
   const interval = setInterval(update, 1000);
   return () => clearInterval(interval);
  }, [targetDate, targetTime]);

  if (isHappening) {
   return (
    <div className="flex items-center gap-3 px-5 py-3 bg-red-500/10 border border-red-500/30 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse shrink-0">
     <span className="relative flex h-3.5 w-3.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
     </span>
     <span className="text-xs font-black uppercase tracking-[0.25em] text-white">LIVE SHOW HAPPENING NOW</span>
    </div>
   );
  }

  // Color transitions from white → accent purple as show approaches
  // 14+ days = white, 0 days = full purple
  const urgency = Math.max(0, Math.min(1, 1 - timeLeft.totalDays / 14));
  // Interpolate: white (255,255,255) → accent purple (133,29,239)
  const r = Math.round(255 - urgency * (255 - 133));
  const g = Math.round(255 - urgency * (255 - 29));
  const b = Math.round(255 - urgency * (255 - 239));
  const numberColor = `rgb(${r}, ${g}, ${b})`;

  const units = [
   { label: "Days", value: timeLeft.days },
   { label: "Hrs", value: timeLeft.hours },
   { label: "Min", value: timeLeft.minutes },
   { label: "Sec", value: timeLeft.seconds },
  ];

  return (
   <div className="flex items-center gap-2 shrink-0">
    {units.map((u, i) => (
     <div key={u.label} className="flex items-center gap-2">
      <div className="flex flex-col items-center border border-white/10 bg-white/[0.03] px-3 py-2 min-w-[52px]">
       <span
        className="text-3xl md:text-[2.2rem] font-extrabold leading-none tabular-nums transition-colors duration-1000"
        style={{ color: numberColor }}
       >
        {String(u.value).padStart(2, "0")}
       </span>
       <span className="text-2xs uppercase tracking-[0.2em] text-white/30 font-bold mt-1">{u.label}</span>
      </div>
      {i < units.length - 1 && (
       <span className="text-2xl font-bold text-[var(--color-accent)]/50 -mt-3">:</span>
      )}
     </div>
    ))}
   </div>
  );
}
