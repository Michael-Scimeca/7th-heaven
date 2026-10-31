"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Calendar, Clock, Ticket } from "lucide-react";
import { ensureUpcomingTourDates, getShowType, typeConfig } from "@/lib/tour-helpers";

interface TourShow {
  id: string;
  day?: string;
  date: string;
  venue: string;
  city: string;
  state: string;
  time?: string;
  startDate?: string;
  websiteUrl?: string;
  mapUrl?: string;
  info?: string;
}

const SAMPLE_SHOWS: TourShow[] = [
  {
    id: "show-1",
    day: "Fri",
    date: "July 17",
    startDate: "2026-07-17",
    venue: "Arcada Theatre",
    city: "St. Charles",
    state: "IL",
    time: "8:00 PM",
    websiteUrl: "https://www.arcadalive.com",
    info: "Full Arena Rock Production",
  },
  {
    id: "show-2",
    day: "Sat",
    date: "July 25",
    startDate: "2026-07-25",
    venue: "Taste of Lincoln Avenue",
    city: "Chicago",
    state: "IL",
    time: "9:00 PM",
    websiteUrl: "https://7thheavenband.com/shows",
    info: "Summer Festival Headliner",
  },
  {
    id: "show-3",
    day: "Fri",
    date: "August 7",
    startDate: "2026-08-07",
    venue: "Hollywood Casino Amphitheatre",
    city: "Tinley Park",
    state: "IL",
    time: "7:30 PM",
    websiteUrl: "https://www.livenation.com",
    info: "Special Guest Rock Night",
  },
  {
    id: "show-4",
    day: "Sat",
    date: "August 15",
    startDate: "2026-08-15",
    venue: "Sideouts Sports Bar & Fest Grounds",
    city: "Island Lake",
    state: "IL",
    time: "9:30 PM",
    websiteUrl: "https://www.3dsideouts.com",
    info: "Outdoor Festival Stage",
  },
  {
    id: "show-5",
    day: "Fri",
    date: "August 28",
    startDate: "2026-08-28",
    venue: "Rivers Casino Event Center",
    city: "Des Plaines",
    state: "IL",
    time: "8:00 PM",
    websiteUrl: "https://www.riverscasino.com",
    info: "Casino Concert Series",
  },
  {
    id: "show-6",
    day: "Sun",
    date: "September 6",
    startDate: "2026-09-06",
    venue: "Labor Day Rock Fest",
    city: "Naperville",
    state: "IL",
    time: "8:15 PM",
    websiteUrl: "https://7thheavenband.com/shows",
    info: "Headline Summer Finale",
  },
];

interface VretailTourSectionProps {
  initialShows?: TourShow[];
  theme?: "lilac" | "indigo";
}

export default function VretailTourSection({ initialShows, theme = "lilac" }: VretailTourSectionProps) {
  const upcomingShows = useMemo(() => {
    const list = initialShows && initialShows.length > 0 ? initialShows : SAMPLE_SHOWS;
    return ensureUpcomingTourDates(list).slice(0, 6);
  }, [initialShows]);

  const isLilac = theme === "lilac";

  return (
    <section
      id="tour"
      aria-labelledby="vretail-tour-heading"
      className="relative z-10 w-full py-16 lg:py-24"
    >
      <div className="site-container w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2
              id="vretail-tour-heading"
              className={`font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight ${
                isLilac ? "text-black" : "text-white"
              }`}
            >
              UPCOMING LIVE CONCERT TOUR
            </h2>
            <p className={`text-base sm:text-lg mt-3 max-w-2xl ${isLilac ? "text-[#2b2456]" : "text-indigo-200/70"}`}>
              Catch 7th Heaven live at premier summer festivals, casino showrooms, and theatres.
              Over 100 high-voltage performances every year.
            </p>
          </div>

          <Link
            href="/shows"
            className={`inline-flex items-center gap-2 font-bold text-sm sm:text-base group ${
              isLilac ? "text-[#5500ff] hover:text-purple-800" : "text-purple-400 hover:text-purple-300"
            }`}
          >
            VIEW ALL 100+ DATES
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 3-Column Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingShows.map((show) => {
            const showType = getShowType(show);
            const badgeMeta = typeConfig[showType] || typeConfig.full;

            return (
              <div
                key={show.id}
                className={`group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between ${
                  isLilac
                    ? "bg-white/55 hover:bg-white/70 border border-white/60 hover:border-[#5500ff]/50 shadow-[0_8px_30px_rgba(90,40,160,0.06)] hover:shadow-[0_16px_40px_rgba(85,0,255,0.14)] backdrop-blur-md"
                    : "bg-gradient-to-b from-[#160f38] to-[#0d0724] border border-purple-500/20 hover:border-purple-400/50 shadow-lg hover:shadow-[0_12px_40px_rgba(147,51,234,0.22)]"
                }`}
              >
                {/* Card Top: Date & Show Type Tag */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        isLilac
                          ? "bg-[#5500ff]/10 border border-[#5500ff]/30 text-[#5500ff]"
                          : "bg-purple-950/70 border border-purple-400/30 text-purple-300"
                      }`}
                    >
                      <Calendar className={`w-3.5 h-3.5 ${isLilac ? "text-[#5500ff]" : "text-purple-400"}`} />
                      {show.day ? `${show.day}, ` : ""}{show.date}
                    </div>
                    <div
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border border-[var(--badge-color)]/40 bg-[var(--badge-color)]/20 text-[var(--badge-color)]"
                      style={{
                        "--badge-color": badgeMeta.color,
                      } as React.CSSProperties}
                    >
                      {badgeMeta.label}
                    </div>
                  </div>

                  {/* Venue Headline */}
                  <h3
                    className={`text-xl font-black transition-colors tracking-tight line-clamp-1 ${
                      isLilac ? "text-black group-hover:text-[#5500ff]" : "text-white group-hover:text-purple-300"
                    }`}
                  >
                    {show.venue}
                  </h3>

                  {/* Location & Time */}
                  <div className={`mt-3 space-y-1.5 text-sm ${isLilac ? "text-[#3b3260]" : "text-indigo-200/70"}`}>
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-4 h-4 shrink-0 ${isLilac ? "text-[#5500ff]" : "text-purple-400"}`} />
                      {show.city}, {show.state}
                    </div>
                    {show.time && (
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 shrink-0 ${isLilac ? "text-[#5500ff]" : "text-purple-400"}`} />
                        {show.time}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom CTA */}
                <div
                  className={`mt-6 pt-4 border-t flex items-center justify-between ${
                    isLilac ? "border-purple-200/60" : "border-purple-500/15"
                  }`}
                >
                  <p className={`text-xs font-semibold ${isLilac ? "text-[#5e5388]" : "text-purple-300/60"}`}>
                    {show.info || "Live Performance"}
                  </p>
                  <a
                    href={show.websiteUrl || `/shows`}
                    target={show.websiteUrl?.startsWith("http") ? "_blank" : undefined}
                    rel={show.websiteUrl?.startsWith("http") ? "noopener noreferrer" : undefined}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                      isLilac
                        ? "bg-black hover:bg-[#5500ff] text-white"
                        : "bg-purple-600/50 hover:bg-purple-600 border border-purple-400/40 text-white"
                    }`}
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    GET TICKETS
                  </a>
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Banner inside Tour Section */}
        <div
          className={`mt-12 p-8 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl ${
            isLilac
              ? "bg-white/60 border border-white/60 shadow-[0_10px_35px_rgba(90,40,160,0.08)] backdrop-blur-lg"
              : "bg-gradient-to-r from-purple-950/60 via-[#1b1242] to-indigo-950/60 border-purple-500/30"
          }`}
        >
          <div>
            <h4 className={`text-xl sm:text-2xl font-black ${isLilac ? "text-black" : "text-white"}`}>
              Want 7th Heaven in your city?
            </h4>
            <p className={`text-sm sm:text-base mt-1 ${isLilac ? "text-[#2b2456]" : "text-indigo-200/70"}`}>
              Join 40,000+ fans on our tour notifications and never miss a concert near you.
            </p>
          </div>
          <Link
            href="/fans"
            className={`shrink-0 px-6 py-3 rounded-full font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all ${
              isLilac
                ? "bg-[#5500ff] hover:bg-[#4800e0] text-white"
                : "bg-white hover:bg-neutral-100 text-neutral-950"
            }`}
          >
            GET TOUR NOTIFICATIONS
          </Link>
        </div>

      </div>
    </section>
  );
}
