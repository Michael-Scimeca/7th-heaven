/* eslint-disable react-doctor/no-high-complexity-react-function */
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
  const details = `Catch 7th Heaven live!\nShow Info: ${show.info || ""}\nMore details: ${show.websiteUrl || "https://www.7thheavenband.com/tour"}`;
  const location = show.city
    ? `${show.venue}, ${show.city}${show.state ? `, ${show.state}` : ""}`
    : show.venue;

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
  const details = `Catch 7th Heaven live!\\nShow Info: ${show.info || ""}\\nMore details: ${show.websiteUrl || "https://www.7thheavenband.com/tour"}`;
  const location = show.city
    ? `${show.venue}, ${show.city}${show.state ? `, ${show.state}` : ""}`
    : show.venue;

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//7th Heaven//Tour Calendar//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}-${encodeURIComponent(show.venue)}@7thheavenband.com`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(start)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${details}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsLines.join("\r\n"))}`;
}

export default function HeroUpcomingShows({
  upcomingShows,
}: HeroUpcomingShowsProps) {
  const [activeCalDropdownId, setActiveCalDropdownId] = useState<string | null>(
    null,
  );
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        activeCalDropdownId &&
        !(event.target as HTMLElement).closest(".calendar-dropdown-container")
      ) {
        setActiveCalDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeCalDropdownId]);

  if (!upcomingShows || upcomingShows.length === 0) {
    return (
      <div className="h-full rounded-lg border border-white/10 p-2.5 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <div className="mb-1.5 flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1">
            <span className="h-1 w-1 animate-pulse rounded-lg bg-[var(--color-accent)]" />
            <span className="text-[var(--color-accent)]">Upcoming Shows</span>
          </div>
          <Link
            href="/tour"
            className="flex items-center gap-0.5 text-white/30 hover:text-white"
          >
            All
            <svg
              width="6"
              height="6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
        <p className="py-2 text-center">No upcoming shows scheduled</p>
      </div>
    );
  }

  const nextShow = upcomingShows[0];
  const remainingShows = upcomingShows.slice(1, 3);

  const getDaysUntilLabel = () => {
    if (!nextShow || !currentTime) return "";
    const showDateTime = getShowDateTime(
      nextShow.startDate,
      nextShow.date,
      nextShow.playTime || nextShow.time,
    );
    const showEndTime = new Date(showDateTime.getTime() + 4 * 60 * 60 * 1000);

    if (currentTime >= showDateTime && currentTime < showEndTime) {
      return "Happening Now";
    }

    const today = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate(),
    );
    const showDateOnly = new Date(
      showDateTime.getFullYear(),
      showDateTime.getMonth(),
      showDateTime.getDate(),
    );
    const diffTime = showDateOnly.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 1) return `${diffDays} days away`;
    return "";
  };

  const daysLabel = getDaysUntilLabel();

  return (
    <div className="w-full rounded-lg border border-white/10 bg-black/85 p-2.5 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.7)] backdrop-blur-xl">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1">
          <span className="h-1 w-1 animate-pulse rounded-lg bg-[var(--color-accent)]" />
          <span className="text-[var(--color-accent)]">Upcoming Shows</span>
        </div>
        <Link
          href="/tour"
          className="flex items-center gap-0.5 text-white/30 hover:text-white"
        >
          All
          <svg
            width="6"
            height="6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>

      {/* Main Countdown Banner for Next Show */}
      <div className="relative mb-2 flex flex-col gap-2.5 overflow-hidden rounded-lg border border-[var(--color-accent)]/15 bg-[rgba(20,15,30,0.85)] p-3">
        {/* Subtle purple gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[rgba(255,10,61,0.06)] via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col gap-2">
          {/* Top block: UP NEXT Badge & Countdown timer inline */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* UP NEXT Badge */}
            <div className="flex items-center gap-1 text-[var(--font-size-5xs)]">
              <span
                className={`h-0.5 w-0.5 rounded-lg ${daysLabel === "Happening Now" ? "animate-ping bg-red-500" : "animate-pulse bg-[var(--color-accent)]"}`}
              />
              <span
                className={
                  daysLabel === "Happening Now"
                    ? "text-red-500"
                    : "text-[var(--color-accent)]"
                }
              >
                {daysLabel === "Happening Now" ? "Live" : "Up Next"}
              </span>
              {daysLabel && daysLabel !== "Happening Now" && (
                <>
                  <span className="text-white/20">·</span>
                  <span className="text-[var(--color-accent)]">
                    {daysLabel}
                  </span>
                </>
              )}
            </div>

            {/* Compact Countdown widget */}
            <CountdownTimer
              targetDate={nextShow.startDate || nextShow.date}
              targetTime={nextShow.playTime || nextShow.time}
              compact
            />
          </div>

          {/* Middle block: Venue & details (clickable link to tour page) */}
          <Link href="/tour" className="group/venue block hover:opacity-85">
            <h2 className="group-hover/venue: mb-1">{nextShow.venue}</h2>
            <div className="flex flex-wrap items-center gap-1 text-white/50">
              <span>
                {nextShow.day}, {nextShow.date}
              </span>
              {nextShow.city && (
                <>
                  <span className="text-white/20">·</span>
                  <span>
                    {nextShow.city}
                    {nextShow.state ? `, ${nextShow.state}` : ""}
                  </span>
                </>
              )}
              {nextShow.playTime ? (
                <>
                  <span className="text-white/20">·</span>
                  <span className="text-rose-400">
                    Plays: {nextShow.playTime}
                  </span>
                  {nextShow.time && (
                    <>
                      <span className="text-white/20">·</span>
                      <span className="text-white/30">
                        Event: {nextShow.time}
                      </span>
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
              <p className="flex items-center gap-1 text-[var(--color-accent)]/80">
                <Guitar className="h-3 w-3" /> {nextShow.info}
              </p>
            )}
          </Link>

          {/* Bottom block: Action buttons */}
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-2">
            {nextShow.mapUrl && (
              <a
                href={nextShow.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline btn-outline-hover flex items-center gap-1 border-[var(--color-accent)]/20 px-2 py-1 text-[var(--font-size-5xs)]"
                id="hero-upnext-map"
              >
                <MapPin className="h-3 w-3" /> Directions
              </a>
            )}
            {nextShow.websiteUrl && (
              <a
                href={nextShow.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary btn-primary-hover bg-[var(--color-accent)] px-3 py-1 text-[var(--font-size-5xs)]"
                id="hero-upnext-website"
              >
                Website
              </a>
            )}
            <div className="calendar-dropdown-container relative">
              <button
                aria-label="Next"
                onClick={() =>
                  setActiveCalDropdownId(
                    activeCalDropdownId === "upnext" ? null : "upnext",
                  )
                }
                className="btn-outline btn-outline-hover flex cursor-pointer items-center gap-1 border-[var(--color-accent)]/20 px-2 py-1 text-[var(--font-size-5xs)]"
                id="hero-upnext-calendar-btn"
              >
                <Calendar className="h-3 w-3" /> Calendar
              </button>
              {activeCalDropdownId === "upnext" && (
                <div className="absolute right-0 bottom-full z-50 mb-1 min-w-[160px] rounded-xl border border-purple-400/30 bg-[#0c0721]/95 py-1.5 whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,0.95)] backdrop-blur-md">
                  <a
                    href={getGoogleCalendarUrl(nextShow)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setActiveCalDropdownId(null)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[var(--color-accent)]/20 hover:text-white"
                  >
                    Google Cal
                  </a>
                  <a
                    href={getICSFileUrl(nextShow)}
                    download={`${nextShow.venue.replace(/\s+/g, "_")}_show.ics`}
                    onClick={() => setActiveCalDropdownId(null)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[var(--color-accent)]/20 hover:text-white"
                  >
                    iCal / Apple
                  </a>
                  <a
                    href={getICSFileUrl(nextShow)}
                    download={`${nextShow.venue.replace(/\s+/g, "_")}_show.ics`}
                    onClick={() => setActiveCalDropdownId(null)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[var(--color-accent)]/20 hover:text-white"
                  >
                    Outlook
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Remaining list shows */}
      <div className="flex flex-col gap-1">
        {remainingShows.map((show) => (
          <Link
            key={show.id || `${show.venue}-${show.date}`}
            href="/tour"
            className="flex items-center gap-2 rounded border border-white/10 bg-white/[0.02] px-2 py-1.5 hover:bg-white/[0.04]"
          >
            <div className="flex h-7 w-7 shrink-0 flex-col items-center justify-center rounded border border-white/5 bg-white/[0.03] text-white/40">
              <span className="text-[var(--font-size-5xs)]">
                {show.date.split(" ")[0]?.slice(0, 3)}
              </span>
              <span className="mt-0.5 text-[var(--font-size-2xs)]">
                {show.date.split(" ")[1]}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p>{show.venue}</p>
              {(show.city || show.state) && (
                <p className="mt-0.5 flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5 shrink-0 text-purple-400" />
                  {show.city
                    ? `${show.city}${show.state ? `, ${show.state}` : ""}`
                    : show.state}
                </p>
              )}
            </div>
            <span className="text-white/20">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
