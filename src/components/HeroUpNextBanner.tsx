"use client";

import { useState, useEffect, useCallback } from "react";
import CountdownTimer from "@/components/CountdownTimer";
import {
  ensureUpcomingTourDates,
  getShowDateTime,
  isShowOver,
} from "@/lib/tour-helpers";
import { VENUE_LINKS } from "@/lib/venue-links";

interface Show {
  day?: string;
  date: string;
  venue: string;
  city: string;
  state: string;
  time: string;
  playTime?: string;
  info?: string;
  mapUrl?: string;
  websiteUrl?: string;
  startDate?: string;
  allAges?: boolean;
  isPrivate?: boolean;
  [key: string]: unknown;
}

const FALLBACK_SHOWS: Show[] = [
  {
    day: "Fri",
    date: "January 2",
    venue: "Station 34",
    city: "Mt. Prospect",
    state: "IL",
    time: "8:30pm",
    info: "F.A.N. Show - Unplugged",
    mapUrl:
      "https://maps.apple.com/place?address=34%20S%20Main%20St,%20Mount%20Prospect,%20IL%2060056,%20United%20States&coordinate=42.064738,-87.936988&name=34%20S%20Main%20St&map=explore",
    websiteUrl: "https://stationthirtyfour.com/events/",
    startDate: "2026-01-02",
  },
  {
    day: "Sat",
    date: "January 3",
    venue: "Old Republic",
    city: "Elgin",
    state: "IL",
    time: "8:00pm",
    info: "All Age Outdoor",
    mapUrl:
      "https://maps.apple.com/?address=155%20S%20Randall%20Rd,%20Elgin,%20IL%2060123,%20United%20States&ll=42.028251,-88.336949&q=155%20S%20Randall%20Rd",
    websiteUrl: "https://www.oldrepublicbar.com",
    startDate: "2026-01-03",
  },
  {
    day: "Fri",
    date: "January 9",
    venue: "Rookies",
    city: "Hoffman Est.",
    state: "IL",
    time: "8:00pm",
    info: "F.A.N. Show - Unplugged",
    mapUrl:
      "https://maps.apple.com/place?address=4607%20W%20Higgins%20Rd,%20Hoffman%20Estates,%20IL%2060192,%20United%20States&coordinate=42.074379,-88.191220&name=4607%20W%20Higgins%20Rd",
    websiteUrl: "https://www.rookiespub.com/hoffmanestates.html",
    startDate: "2026-01-09",
  },
  {
    day: "Fri",
    date: "September 25",
    venue: "Huntley Fall Fest",
    city: "Huntley",
    state: "IL",
    time: "8:30pm",
    info: "Outdoor All-Age Festival",
    mapUrl: "https://maps.apple.com/?q=Huntley+Fall+Fest+Huntley+IL",
    websiteUrl: "https://huntleyfallfest.com",
    startDate: "2026-09-25",
  },
];

function getGoogleCalendarUrl(show: Show) {
  const start = getShowDateTime(show.startDate, show.date, show.time);
  if (start.getHours() === 23 && start.getMinutes() === 59) {
    start.setHours(20, 0, 0, 0);
  }
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const formatGCalDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const title = `7th Heaven at ${show.venue}`;
  const details = `Catch 7th Heaven live!\nVenue: ${show.venue}\nDetails: ${show.info || ""}`;
  const location = show.city
    ? `${show.venue}, ${show.city}${show.state ? `, ${show.state}` : ""}`
    : show.venue;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatGCalDate(start)}/${formatGCalDate(end)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
}

function getICSFileUrl(show: Show) {
  const start = getShowDateTime(show.startDate, show.date, show.time);
  if (start.getHours() === 23 && start.getMinutes() === 59) {
    start.setHours(20, 0, 0, 0);
  }
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const formatICSDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const title = `7th Heaven at ${show.venue}`;
  const details = `Catch 7th Heaven live!\\nVenue: ${show.venue}\\nDetails: ${show.info || ""}`;
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

export default function HeroUpNextBanner() {
  const [shows, setShows] = useState<Show[]>(() =>
    ensureUpcomingTourDates(FALLBACK_SHOWS),
  );
  const [isCalOpen, setIsCalOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-doctor/no-fetch-in-effect
    fetch("/api/tour")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Show[] = data.map((s: Record<string, unknown>) => {
            const venue = (s.venue as string) || "";
            const city = (s.city as string) || "";
            const state = (s.state as string) || "";
            const isPrivate = (s.isPrivate as boolean) || false;
            const explicitMap =
              (s.directionsLink as string) || (s.mapUrl as string) || "";
            const fallbackMap =
              VENUE_LINKS[venue]?.mapUrl ||
              (venue && city && !isPrivate
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue} ${city} ${state}`)}`
                : "");
            const mapUrl = explicitMap || fallbackMap;

            return {
              day: (s.day as string) || "TBD",
              date: s.date as string,
              venue,
              city,
              state,
              time: (s.time as string) || "",
              playTime: (s.playTime as string) || "",
              info: (s.notes as string) || (s.info as string) || "",
              mapUrl,
              websiteUrl:
                (s.ticketLink as string) || (s.websiteUrl as string) || "",
              startDate: (s.startDate as string) || (s.date as string),
              allAges: s.allAges as boolean | undefined,
              isPrivate,
            };
          });
          const ensured = ensureUpcomingTourDates(mapped);
          const upcoming = ensured.filter((s) => !isShowOver(s));
          if (upcoming.length > 0) setShows(upcoming);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isCalOpen &&
        !(e.target as HTMLElement).closest(".hero-cal-dropdown-container")
      ) {
        setIsCalOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isCalOpen]);

  const getUpcomingShow = useCallback(() => {
    const now = new Date();
    for (const show of shows) {
      if (!show.city || show.isPrivate) continue;
      const showDateTime = getShowDateTime(
        show.startDate,
        show.date,
        show.time,
      );
      const showEndTime = new Date(showDateTime.getTime() + 4 * 60 * 60 * 1000);
      if (now >= showDateTime && now < showEndTime) return show;
    }
    for (const show of shows) {
      if (!show.city || show.isPrivate) continue;
      const showDateTime = getShowDateTime(
        show.startDate,
        show.date,
        show.time,
      );
      if (showDateTime >= now) return show;
    }
    const publicShows = shows.filter((s) => s.city && !s.isPrivate);
    return publicShows[0] || shows[0] || null;
  }, [shows]);

  const upNext = getUpcomingShow();
  if (!upNext) return null;

  const now = new Date();
  const showDateTime = getShowDateTime(
    upNext.startDate,
    upNext.date,
    upNext.playTime || upNext.time,
  );
  const showEndTime = new Date(showDateTime.getTime() + 4 * 60 * 60 * 1000);
  const isHappeningNow = now >= showDateTime && now < showEndTime;

  const formattedDay =
    upNext.day === "Mon"
      ? "Monday"
      : upNext.day === "Tue"
        ? "Tuesday"
        : upNext.day === "Wed"
          ? "Wednesday"
          : upNext.day === "Thu"
            ? "Thursday"
            : upNext.day === "Fri"
              ? "Friday"
              : upNext.day === "Sat"
                ? "Saturday"
                : upNext.day === "Sun"
                  ? "Sunday"
                  : upNext.day || "";

  const dateLabel = `${formattedDay ? `${formattedDay}, ` : ""}${upNext.date}`;

  return (
    <div className="pointer-events-auto relative z-20 w-full max-w-[550px]">
      <div className="flex w-full flex-col gap-2.5 rounded-2xl border border-white/10 p-4 text-left shadow-[0_15px_50px_rgba(0,0,0,0.85)] backdrop-blur-[24px] select-none">
        {/* Top Header: UP NEXT Badge + Compact Countdown Timer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-2.5">
          <span
            className={`st inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-[10px] font-black sm:text-xs ${isHappeningNow ? "border-emerald-500/50 bg-emerald-950/80 text-emerald-300" : "border-purple-400/40 bg-purple-950/80 text-purple-300"}`}
          >
            <span
              className={`h-2 w-2 rounded-full ${isHappeningNow ? "animate-ping bg-emerald-400" : "animate-pulse bg-purple-400"}`}
            />
            <span>{isHappeningNow ? "HAPPENING NOW" : "UP NEXT"}</span>
          </span>

          <CountdownTimer
            targetDate={upNext.startDate || upNext.date}
            targetTime={upNext.playTime || upNext.time}
            compact
          />
        </div>

        {/* Venue Name */}
        <h2>{upNext.venue}</h2>

        {/* Date, Location & Time */}
        <div className="/90 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <span>{dateLabel}</span>
          {upNext.city && (
            <>
              <span className="text-white/40">·</span>
              <span>
                {upNext.city}
                {upNext.state ? `, ${upNext.state}` : ""}
              </span>
            </>
          )}
          {(upNext.playTime || upNext.time) && (
            <>
              <span className="text-white/40">·</span>
              <span className="text-rose-400">
                {upNext.playTime ? `Plays: ${upNext.playTime}` : upNext.time}
              </span>
            </>
          )}
        </div>

        {/* Subtitle / Notes */}
        {upNext.info && (
          <h3 className="text-[11px] font-normal text-purple-300/90 sm:text-xs">
            {upNext.info}
          </h3>
        )}

        {/* Action Links (DIRECTIONS | WEBSITE | ADD TO CALENDAR) */}
        <div className="mt-1 flex flex-wrap items-center gap-4 border-t border-white/10 pt-4 text-xs font-black sm:gap-6">
          {upNext.mapUrl && (
            <a
              href={upNext.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer"
            >
              DIRECTIONS
            </a>
          )}
          {upNext.websiteUrl && (
            <a
              href={upNext.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer"
            >
              WEBSITE
            </a>
          )}
          <div className="hero-cal-dropdown-container relative">
            <button
              type="button"
              onClick={() => setIsCalOpen(!isCalOpen)}
              className="a-btn cursor-pointer"
            >
              ADD TO CALENDAR
            </button>

            {isCalOpen && (
              <div className="absolute bottom-full left-0 z-50 mb-2 min-w-[170px] rounded-xl border border-purple-400/40 bg-[#0c0721]/95 py-2 whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,0.95)] backdrop-blur-[30px]">
                <a
                  href={getGoogleCalendarUrl(upNext)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsCalOpen(false)}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs transition-colors hover:bg-purple-600/30 hover:text-white"
                >
                  Google Calendar
                </a>
                <a
                  href={getICSFileUrl(upNext)}
                  download={`${upNext.venue.replace(/\s+/g, "_")}_show.ics`}
                  onClick={() => setIsCalOpen(false)}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs transition-colors hover:bg-purple-600/30 hover:text-white"
                >
                  Apple / iCal
                </a>
                <a
                  href={getICSFileUrl(upNext)}
                  download={`${upNext.venue.replace(/\s+/g, "_")}_show.ics`}
                  onClick={() => setIsCalOpen(false)}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs transition-colors hover:bg-purple-600/30 hover:text-white"
                >
                  Outlook
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
