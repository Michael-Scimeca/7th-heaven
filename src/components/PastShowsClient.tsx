/* eslint-disable react-doctor/no-giant-component */
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Music } from "lucide-react";
import SearchInput from "@/components/SearchInput";

export interface PastShowItem {
  raw: string;
  date: string;
  venue: string;
}

export interface YearGroup {
  year: string;
  shows: PastShowItem[];
}

interface PastShowsClientProps {
  years: YearGroup[];
  totalShowsCount: number;
}

const CATEGORIES = [
  { id: "ALL", label: "All Shows" },
  { id: "FEST", label: "Festivals & Fairs" },
  { id: "CASINO", label: "Casinos & Resorts" },
  { id: "CLUB", label: "Clubs & Saloons" },
  { id: "UNPLUGGED", label: "Unplugged" },
  { id: "PRIVATE", label: "Private & Corp" },
  { id: "CRUISE", label: "Cruises & Overseas" },
];

const matchesCategory = (show: PastShowItem, categoryId: string) => {
  if (categoryId === "ALL") return true;
  const venueLower = show.venue.toLowerCase();
  if (categoryId === "FEST") return venueLower.includes("fest") || venueLower.includes("fair") || venueLower.includes("oktoberfest") || venueLower.includes("jubilee") || venueLower.includes("days");
  if (categoryId === "CASINO") return venueLower.includes("casino") || venueLower.includes("resort") || venueLower.includes("wind creek") || venueLower.includes("hard rock") || venueLower.includes("rivers");
  if (categoryId === "CLUB") return venueLower.includes("saloon") || venueLower.includes("pub") || venueLower.includes("bar") || venueLower.includes("tavern") || venueLower.includes("live") || venueLower.includes("nellie");
  if (categoryId === "UNPLUGGED") return venueLower.includes("unplugged") || venueLower.includes("acoustic");
  if (categoryId === "PRIVATE") return venueLower.includes("private") || venueLower.includes("corporate") || venueLower.includes("gala") || venueLower.includes("party");
  if (categoryId === "CRUISE") return venueLower.includes("cruise") || venueLower.includes("greece") || venueLower.includes("london") || venueLower.includes("amsterdam") || venueLower.includes("seas");
  return true;
};

export default function PastShowsClient({ years, totalShowsCount }: PastShowsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [openYears, setOpenYears] = useState<Record<string, boolean>>({});



  // Filtered shows logic
  const filteredYears = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return years.flatMap((yGroup) => {
      if (selectedYear !== "ALL" && yGroup.year !== selectedYear) return [];

      const filteredShows = yGroup.shows.filter((show) => {
        if (!matchesCategory(show, selectedCategory)) return false;
        if (!query) return true;
        return (
          show.venue.toLowerCase().includes(query) ||
          show.date.toLowerCase().includes(query) ||
          yGroup.year.includes(query)
        );
      });

      if (filteredShows.length === 0) return [];

      return [{
        year: yGroup.year,
        shows: filteredShows,
      }];
    });
  }, [years, searchQuery, selectedYear, selectedCategory]);

  const displayedCount = useMemo(() => {
    return filteredYears.reduce((acc, y) => acc + y.shows.length, 0);
  }, [filteredYears]);

  const toggleYear = (year: string) => {
    setOpenYears((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    years.forEach((y) => (next[y.year] = true));
    setOpenYears(next);
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    years.forEach((y) => (next[y.year] = false));
    setOpenYears(next);
  };

  return (
    <div>

      {/* ── BREADCRUMB & HEADER SECTION ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-[var(--muted-text)] mb-3">
          <Link href="/" className="hover: text-[var(--color-accent)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/#tour" className="hover: text-[var(--color-accent)] transition-colors">Upcoming Shows</Link>
          <span>/</span>
          <span className=" text-[var(--color-accent)]">Past Shows Archive</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
          <div>
            <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold uppercase tracking-tight text-[var(--text-color)] leading-tight mb-3">
              Past Shows <span className=" text-[var(--color-accent)]">Archive</span>
            </h1>
            <p className="max-w-2xl font-medium">
              A comprehensive history of 7th Heaven performances, festivals, club dates, and concert events played since 1985.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div className="flex flex-wrap items-center justify-start gap-8 md:gap-14 mb-8">
        <div className="flex flex-col items-start text-left">
          <span className="text-3xl sm:text-4xl font-bold text-[var(--color-accent)]">{totalShowsCount}+</span>
          <span className="font-bold uppercase tracking-wider text-[var(--muted-text)] mt-1">Concerts Cataloged</span>
        </div>
        <div className="flex flex-col items-start text-left">
          <span className="text-3xl sm:text-4xl font-bold text-[var(--color-accent)]">40+</span>
          <span className="font-bold uppercase tracking-wider text-[var(--muted-text)] mt-1">Years of Live Rock</span>
        </div>
        <div className="flex flex-col items-start text-left">
          <span className="text-3xl sm:text-4xl font-bold text-[var(--color-accent)]">500+</span>
          <span className="font-bold uppercase tracking-wider text-[var(--muted-text)] mt-1">Unique Venues</span>
        </div>
        <div className="flex flex-col items-start text-left">
          <span className="text-3xl sm:text-4xl font-bold text-[var(--color-accent)]">5+</span>
          <span className="font-bold uppercase tracking-wider text-[var(--muted-text)] mt-1">Countries Played</span>
        </div>
      </div>

      {/* ── FILTER & SEARCH CONTROLS ── */}
      <div className="bg-transparent p-0 border-0 mb-8">
        <div className="flex flex-col lg:flex-row items-start gap-4">
          {/* Search Input Bar */}
          <div className="w-full lg:w-72 shrink-0">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search venue, city, year..."
              containerClassName="w-full"
            />
          </div>

          {/* Years Pill List Next to Search Input */}
          <div className="flex items-center gap-2 flex-wrap max-w-[900px]">
            <span className="font-bold uppercase tracking-widest text-[var(--muted-text)] shrink-0 mr-1">
              Jump to Year:
            </span>
            <button aria-label="Action button"
              onClick={() => setSelectedYear("ALL")}
              className={`px-3 py-1.5 rounded-lg font-bold tracking-wider uppercase transition-colors cursor-pointer ${selectedYear ==="ALL"
                ? "bg-[var(--color-accent)] text-white  "
                : " bg-[#00000029]    text-white/70 hover:text-white border-0"
                }`}
            >
              All Years
            </button>
            {years.map((y) => (
              <button aria-label="Previous"
                key={y.year}
                onClick={() => {
                  setSelectedYear(y.year);
                  setOpenYears((prev) => ({ ...prev, [y.year]: true }));
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${selectedYear === y.year ?"bg-[var(--color-accent)] text-white  font-bold   "
                  : " bg-[#00000029]    text-white/70 hover:text-white border-0"
                  }`}
              >
                {y.year}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[var(--muted-text)] font-semibold mt-3">
          Showing <span className="font-bold text-[var(--text-color)]">{displayedCount}</span> of {totalShowsCount} shows
        </div>
      </div>

      {/* ── SHOWS LIST GROUPED BY YEAR ── */}
      {filteredYears.length === 0 ? (
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-12 text-center my-8">
          <Music className="w-10 h-10 text-purple-400mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[var(--text-color)] mb-2">No Past Shows Found</h3>
          <p className="max-w-md mx-auto mb-6">
            We couldn&apos;t find any shows matching &quot;{searchQuery}&quot;. Try adjusting your search query or selecting a different year/category.
          </p>
          <button aria-label="Search"
            onClick={() => {
              setSearchQuery("");
              setSelectedYear("ALL");
              setSelectedCategory("ALL");
            }}
            className="px-6 py-2.5 bg-[var(--color-accent)] text-white font-bold uppercase tracking-wider hover:bg-[#851de7] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-0">
          {filteredYears.map((yGroup) => {
            const isOpen = !!openYears[yGroup.year];
            return (
              <div
                key={yGroup.year}
                className="overflow-hidden"
              >
                {/* Year Header Accordion Bar */}
                <button aria-label="Action button"
                  onClick={() => toggleYear(yGroup.year)}
                  className="w-full pr-6 py-2.5 flex items-center justify-between cursor-pointer text-left hover: bg-[#00000029] transition-colors"
                  style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.15)" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-[var(--color-accent)] text-white font-bold rounded-lg">
                      {yGroup.year}
                    </span>
                    <span className="font-bold text-[var(--text-color)]">
                      {yGroup.shows.length} {yGroup.shows.length === 1 ? "Show" : "Shows"}
                    </span>
                  </div>
                </button>

                {/* Shows Table / Grid */}
                {isOpen && (
                  <div className="divide-y divide-[var(--border-color)]">
                    {yGroup.shows.map((show, idx) => {
                      const isCancelled = show.venue.toLowerCase().includes("cancelled");
                      const isUnplugged = show.venue.toLowerCase().includes("unplugged");
                      const isPrivate = show.venue.toLowerCase().includes("private");
                      const isCruise = show.venue.toLowerCase().includes("cruise") || show.venue.toLowerCase().includes("greece") || show.venue.toLowerCase().includes("london") || show.venue.toLowerCase().includes("amsterdam");

                      return (
                        <div
                          key={`${yGroup.year}-${idx}`}
                          className=" py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[var(--color-accent)]/10 transition-colors group"
                          style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.12)" }}
                        >
                          {/* Date & Day */}
                          <div className="w-full sm:w-48 shrink-0 font-semibold text-[var(--muted-text)] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-lg bg-[var(--color-accent)]/50 group-hover:bg-[var(--color-accent)] transition-colors"></span>
                            {show.date || yGroup.year}
                          </div>

                          {/* Venue Name */}
                          <div className="flex-1 font-bold sm:text-base text-[var(--text-color)] leading-snug">
                            {show.venue}
                          </div>

                          {/* Badges */}
                          <div className="flex items-center gap-1.5 shrink-0 pt-1 sm:pt-0">
                            {isCancelled && (
                              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-600 rounded-lg border border-rose-500/30">
                                Cancelled
                              </span>
                            )}
                            {isUnplugged && (
                              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-600/20 text-[var(--color-accent)] rounded-lg border border-purple-500/30">
                                Unplugged
                              </span>
                            )}
                            {isPrivate && (
                              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[var(--color-accent)]/20 text-[var(--color-accent)] rounded-lg border border-[var(--color-accent)]/30">
                                Private Event
                              </span>
                            )}
                            {isCruise && (
                              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-600 rounded-lg border border-sky-500/30">
                                Special Tour
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
