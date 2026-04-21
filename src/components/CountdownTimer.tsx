"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
 targetDate: string;
 targetTime?: string;
}

export default function CountdownTimer({ targetDate, targetTime }: CountdownTimerProps) {
 const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 30 });

 useEffect(() => {
  const getTarget = () => {
   const d = new Date(targetDate);
   if (targetTime) {
    const match = targetTime.match(/(\d+):(\d+)(am|pm)/i);
    if (match) {
     let h = parseInt(match[1]);
     const m = parseInt(match[2]);
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
    return;
   }

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
  <div className="flex items-center gap-2">
   {units.map((u, i) => (
    <div key={u.label} className="flex items-center gap-2">
     <div className="flex flex-col items-center border border-white/10 bg-white/[0.03] px-3 py-2 min-w-[52px]">
      <span
       className="text-[1.8rem] md:text-[2.2rem] font-extrabold leading-none tabular-nums transition-colors duration-1000"
       style={{ color: numberColor }}
      >
       {String(u.value).padStart(2, "0")}
      </span>
      <span className="text-[0.45rem] uppercase tracking-[0.2em] text-white/30 font-bold mt-1">{u.label}</span>
     </div>
     {i < units.length - 1 && (
      <span className="text-[1.5rem] font-bold text-[var(--color-accent)]/50 -mt-3">:</span>
     )}
    </div>
   ))}
  </div>
 );
}
