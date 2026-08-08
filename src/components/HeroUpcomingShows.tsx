"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Guitar, MapPin, Calendar } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import { getShowDateTime } from "@/lib/date-utils";

interface HeroUpcomingShowsProps {
  upcomingShows: any[];
}

function getGoogleCalendarUrl(show: any) {
  const start = getShowDateTime(show.startDate, show.date, show.time);
  if (start.getHours() === 23 && start.getMinutes() === 59) {
    start.setHours(20, 0, 0, 0); // Default to 8:00 PM if no time set
  }
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);

  const formatGCalDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const title = `7th Heaven at ${show.venue}`;
  const details = `Catch 7th Heaven live!\nShow Info: ${show.info || ""}\nMore details: ${show.websiteUrl || 'https://www.7thheavenband.com/tour'}`;
  const location = show.city ? `${show.venue}, ${show.city}${show.state ? `, ${show.state}` : ""}` : show.venue;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatGCalDate(start)}/${formatGCalDate(end)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
}

function getICSFileUrl(show: any) {
  const start = getShowDateTime(show.startDate, show.date, show.time);
  if (start.getHours() === 23 && start.getMinutes() === 59) {
    start.setHours(20, 0, 0, 0); // Default to 8:00 PM if no time set
  }
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);

  const formatICSDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const title = `7th Heaven at ${show.venue}`;
  const details = `Catch 7th Heaven live!\\nShow Info: ${show.info || ""}\\nMore details: ${show.websiteUrl || 'https://www.7thheavenband.com/tour'}`;
  const location = show.city ? `${show.venue}, ${show.city}${show.state ? `, ${show.state}` : ""}` : show.venue;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//7th Heaven//Tour Calendar//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}-${encodeURIComponent(show.venue)}@7thheavenband.com`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(start)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${details}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsLines.join('\r\n'))}`;
}

export default function HeroUpcomingShows({ upcomingShows }: HeroUpcomingShowsProps) {
  const [activeCalDropdownId, setActiveCalDropdownId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activeCalDropdownId && !(event.target as HTMLElement).closest('.calendar-dropdown-container')) {
        setActiveCalDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeCalDropdownId]);

  if (!upcomingShows || upcomingShows.length === 0) {
    return (
      <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-lg p-2.5 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.7)] h-full">
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-[var(--color-accent)] animate-pulse" />
            <span className="text-[var(--font-size-4xs)] font-black uppercase tracking-[0.2em]  text-[var(--color-accent)]">Upcoming Shows</span>
          </div>
          <Link href="/tour" className="text-[var(--font-size-4xs)] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors flex items-center gap-0.5">
            All
            <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
          </Link>
        </div>
        <p className="text-[var(--font-size-3xs)] text-white/40 py-2 text-center font-bold">No upcoming shows scheduled</p>
      </div>
    );
  }

  const nextShow = upcomingShows[0];
  const remainingShows = upcomingShows.slice(1, 3);

  const getDaysUntilLabel = () => {
    if (!nextShow || !currentTime) return "";
    const showDateTime = getShowDateTime(nextShow.startDate, nextShow.date, nextShow.playTime || nextShow.time);
    const showEndTime = new Date(showDateTime.getTime() + 4 * 60 * 60 * 1000);

    if (currentTime >= showDateTime && currentTime < showEndTime) {
      return "Happening Now";
    }

    const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
    const showDateOnly = new Date(showDateTime.getFullYear(), showDateTime.getMonth(), showDateTime.getDate());
    const diffTime = showDateOnly.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 1) return `${diffDays} days away`;
    return "";
  };

  const daysLabel = getDaysUntilLabel();

  return (
    <div className="bg-[var(--color-bg-deep)]/85 backdrop-blur-xl border border-white/10 rounded-lg p-2.5 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.7)] w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-[var(--color-accent)] animate-pulse" />
          <span className="text-[var(--font-size-4xs)] font-black uppercase tracking-[0.2em]  text-[var(--color-accent)]">Upcoming Shows</span>
        </div>
        <Link href="/tour" className="text-[var(--font-size-4xs)] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors flex items-center gap-0.5">
          All
          <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
        </Link>
      </div>

      {/* Main Countdown Banner for Next Show */}
      <div className="relative border border-[var(--color-accent)]/15 bg-[rgba(20,15,30,0.85)] overflow-hidden rounded-lg p-3 mb-2 flex flex-col gap-2.5">
        {/* Subtle purple gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-[rgba(255,10,61,0.06)] via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-2">
          {/* Top block: UP NEXT Badge & Countdown timer inline */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* UP NEXT Badge */}
            <div className="flex items-center gap-1 text-[var(--font-size-5xs)] font-black uppercase tracking-[0.15em]">
              <span className={`w-0.5 h-0.5 rounded-full ${daysLabel === "Happening Now" ? "bg-red-500 animate-ping" : "bg-[var(--color-accent)] animate-pulse"}`} />
              <span className={daysLabel === "Happening Now" ? "text-red-500 font-black" : " text-[var(--color-accent)]"}>
                {daysLabel === "Happening Now" ? "Live" : "Up Next"}
              </span>
              {daysLabel && daysLabel !== "Happening Now" && (
                <>
                  <span className="text-white/20">·</span>
                  <span className=" text-[var(--color-accent)]">{daysLabel}</span>
                </>
              )}
            </div>

            {/* Compact Countdown widget */}
            <CountdownTimer targetDate={`${nextShow.date}, ${new Date().getFullYear()}`} targetTime={nextShow.playTime || nextShow.time} compact />
          </div>

          {/* Middle block: Venue & details (clickable link to tour page) */}
          <Link href="/tour" className="block hover:opacity-85 transition-opacity group/venue">
            <h2 className="font-[var(--font-heading)] text-sm font-extrabold text-white leading-tight mb-1 uppercase tracking-tight truncate group-hover/venue: text-[var(--color-accent)] transition-colors">
              {nextShow.venue}
            </h2>
            <div className="flex flex-wrap items-center gap-1 text-[var(--font-size-4xs)] text-white/50 font-medium">
              <span>{nextShow.day}, {nextShow.date}</span>
              {nextShow.city && (
                <>
                  <span className="text-white/20">·</span>
                  <span className="truncate">{nextShow.city}{nextShow.state ? `, ${nextShow.state}` : ""}</span>
                </>
              )}
              {nextShow.playTime ? (
                <>
                  <span className="text-white/20">·</span>
                  <span className="text-rose-400 font-extrabold">Plays: {nextShow.playTime}</span>
                  {nextShow.time && (
                    <>
                      <span className="text-white/20">·</span>
                      <span className="text-white/30">Event: {nextShow.time}</span>
                    </>
                  )}
                </>
              ) : (
                nextShow.time && (
                  <>
                    <span className="text-white/20">·</span>
                    <span>{nextShow.time}</span>
                  </>
                )
              )}
            </div>
            {nextShow.info && (
              <p className="mt-1 text-[var(--font-size-5xs)] font-extrabold uppercase tracking-[0.12em] text-[var(--color-accent)]/80 flex items-center gap-1">
                <Guitar className="w-3 h-3" /> {nextShow.info}
              </p>
            )}
          </Link>

          {/* Bottom block: Action buttons */}
          <div className="flex flex-wrap gap-1.5 items-center mt-0.5 pt-2 border-t border-white/5">
            {nextShow.mapUrl && (
              <a href={nextShow.mapUrl} target="_blank" rel="noopener noreferrer" className="btn-outline btn-outline-hover text-[var(--font-size-5xs)] py-1 px-2 border-[var(--color-accent)]/20 uppercase tracking-widest font-bold flex items-center gap-1" id="hero-upnext-map">
                <MapPin className="w-3 h-3 text-cyan-400" /> Directions
              </a>
            )}
            {nextShow.websiteUrl && (
              <a href={nextShow.websiteUrl} target="_blank" rel="noopener noreferrer" className="btn-primary btn-primary-hover text-[var(--font-size-5xs)] py-1 px-3 bg-[var(--color-accent)] text-white uppercase tracking-widest font-bold" id="hero-upnext-website">
                Website
              </a>
            )}
            <div className="relative calendar-dropdown-container">
              <button aria-label="Next"
                onClick={() => setActiveCalDropdownId(activeCalDropdownId === 'upnext' ? null : 'upnext')}
                className="btn-outline btn-outline-hover text-[var(--font-size-5xs)] py-1 px-2 border-[var(--color-accent)]/20 flex items-center gap-1 cursor-pointer uppercase tracking-widest font-bold text-white/70"
                id="hero-upnext-calendar-btn"
              >
                <Calendar className="w-3 h-3 text-cyan-400" /> Calendar
              </button>
              {activeCalDropdownId === 'upnext' && (
                <div className="absolute left-0 bottom-full mb-1 bg-[var(--color-bg-deep)] border border-[var(--color-accent)]/30 rounded py-1 shadow-[0_6px_24px_rgba(0,0,0,0.8)] z-50 min-w-[110px] backdrop-blur-md">
                  <a href={getGoogleCalendarUrl(nextShow)} target="_blank" rel="noopener noreferrer" onClick={() => setActiveCalDropdownId(null)} className="flex items-center gap-2 px-2.5 py-1 text-[var(--font-size-4xs)] font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-[var(--color-accent)]/20 transition-colors text-left w-full">Google</a>
                  <a href={getICSFileUrl(nextShow)} download={`${nextShow.venue.replace(/\s+/g, '_')}_show.ics`} onClick={() => setActiveCalDropdownId(null)} className="flex items-center gap-2 px-2.5 py-1 text-[var(--font-size-4xs)] font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-[var(--color-accent)]/20 transition-colors text-left w-full">iCal / Apple</a>
                  <a href={getICSFileUrl(nextShow)} download={`${nextShow.venue.replace(/\s+/g, '_')}_show.ics`} onClick={() => setActiveCalDropdownId(null)} className="flex items-center gap-2 px-2.5 py-1 text-[var(--font-size-4xs)] font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-[var(--color-accent)]/20 transition-colors text-left w-full">Outlook</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Remaining list shows */}
      <div className="flex flex-col gap-1">
        {remainingShows.map((show, idx) => (
          // eslint-disable-next-line react-doctor/no-array-index-as-key
          <Link key={`hero_show_${idx}_${show.id || show.venue}`} href="/tour" className="flex items-center gap-2 px-2 py-1.5 rounded bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]">
            <div className="w-7 h-7 rounded flex flex-col items-center justify-center bg-white/[0.03] text-white/40 shrink-0 border border-white/5">
              <span className="text-[var(--font-size-5xs)] font-black uppercase tracking-wider leading-none">{show.date.split(' ')[0]?.slice(0, 3)}</span>
              <span className="text-[var(--font-size-2xs)] font-black leading-none mt-0.5">{show.date.split(' ')[1]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white/90 truncate leading-tight">{show.venue}</p>
              <p className="text-[var(--font-size-4xs)] text-white/30 truncate mt-0.5 flex items-center gap-1"><MapPin className="w-2.5 h-2.5 text-cyan-400 shrink-0" /> {show.city}{show.state ? `, ${show.state}` : ''}</p>
            </div>
            <span className="text-[var(--font-size-4xs)] font-bold text-white/20">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
