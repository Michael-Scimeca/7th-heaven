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
    <div className={`flex items-center gap-2 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse shrink-0 ${compact ? 'px-3 py-1.5 bg-red-500/10 border border-red-500/20' : 'px-5 py-3 bg-red-500/10 border border-red-500/30'}`}>
     <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
     </span>
     <span className={`font-black uppercase tracking-[0.2em] text-white ${compact ? 'text-[var(--font-size-5xs)]' : 'text-xs'}`}>LIVE NOW</span>
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
   <div className={`flex items-center shrink-0 ${className ? className : (compact ? 'gap-1.5' : 'gap-4 md:gap-5')}`}>
    {units.map((u, i) => (
     <div key={u.label} className={`flex items-center ${compact ? 'gap-1.5' : 'gap-3 md:gap-4'}`}>
      <div className={`flex flex-col items-center ${compact ? 'px-2 py-1 min-w-[44px]' : 'px-3 py-2 min-w-[64px]'}`}>
       <span
        className={`font-extrabold leading-none tabular-nums transition-colors duration-1000 ${compact ? 'text-[clamp(18px,2vw,25px)] font-black' : 'text-[clamp(24px,4vw,3.9rem)]'}`}
        style={{ color: numberColor }}
       >
        {String(u.value).padStart(2, "0")}
       </span>
       <span className={`uppercase tracking-wider ${compact ? 'text-[12px] sm:text-[13px] font-extrabold text-white/70 mt-1 tracking-widest' : 'text-[clamp(9px,1.2vw,11px)] font-extrabold text-white/60 mt-1.5 tracking-widest'}`}>{u.label}</span>
      </div>
      {i < 3 && <span className={`text-white/40 font-bold ${compact ? 'text-lg' : 'text-4xl'}`}>:</span>}
     </div>
    ))}
   </div>
  );
}
