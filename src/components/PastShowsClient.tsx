"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

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

export default function PastShowsClient({ years, totalShowsCount }: PastShowsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [openYears, setOpenYears] = useState<Record<string, boolean>>(() => {
    // Default open first 3 years
    const initial: Record<string, boolean> = {};
    years.forEach((y, i) => {
      initial[y.year] = i < 3;
    });
    return initial;
  });

  const categories = [
    { id: "ALL", label: "All Shows" },
    { id: "FEST", label: "Festivals & Fairs" },
    { id: "CASINO", label: "Casinos & Resorts" },
    { id: "CLUB", label: "Clubs & Saloons" },
    { id: "UNPLUGGED", label: "Unplugged" },
    { id: "PRIVATE", label: "Private & Corp" },
    { id: "CRUISE", label: "Cruises & Overseas" },
  ];

  // Helper to categorize venue/event
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-[family-name:var(--font-barlow)]">

      {/* ── BREADCRUMB & HEADER SECTION ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--muted-text)] mb-3">
          <Link href="/" className="hover: text-[var(--color-accent)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shows" className="hover: text-[var(--color-accent)] transition-colors">Upcoming Shows</Link>
          <span>/</span>
          <span className=" text-[var(--color-accent)]">Past Shows Archive</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border-color)]">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[var(--text-color)] leading-none mb-3">
              Past Shows <span className=" text-[var(--color-accent)]">Archive</span>
            </h1>
            <p className="text-base sm:text-lg text-[var(--muted-text)] max-w-2xl font-medium">
              A comprehensive history of 7th Heaven performances, festivals, club dates, and concert events played since 1985.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/shows"
              className="px-5 py-3 bg-[var(--color-accent)] hover:bg-[#851de7] text-white text-xs font-black uppercase tracking-wider transition-colors shadow-md flex items-center gap-2 cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Upcoming Shows
            </Link>
          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-4xl font-black  text-[var(--color-accent)]">{totalShowsCount}+</span>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-text)] mt-1">Concerts Cataloged</span>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-4xl font-black  text-[var(--color-accent)]">40+</span>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-text)] mt-1">Years of Live Rock</span>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-4xl font-black  text-[var(--color-accent)]">500+</span>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-text)] mt-1">Unique Venues</span>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-4xl font-black  text-[var(--color-accent)]">5+</span>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-text)] mt-1">Countries Played</span>
        </div>
      </div>

      {/* ── FILTER & SEARCH CONTROLS ── */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-3xl shadow-sm mb-8 space-y-6">

        {/* Search input */}
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-text)] w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search venue, festival, city, date, or event name (e.g. Durty Nellies, Hard Rock, Halloween, Cruise)..."
            className="w-full pl-12 pr-10 py-3.5 bg-[var(--bg-color)] border border-[var(--border-color)] text-sm font-semibold text-[var(--text-color)] placeholder:text-[var(--placeholder-color)] outline-none focus:border-[var(--color-accent)] transition-colors shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--muted-text)] hover:text-[var(--text-color)]"
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div>
          <span className="block text-xs font-black uppercase tracking-widest text-[var(--muted-text)] mb-2.5">
            Filter by Event Type:
          </span>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5  text-xs font-bold transition-colors cursor-pointer ${selectedCategory === cat.id
                  ? "bg-[var(--color-accent)] text-white shadow-md scale-105"
                  : "bg-[var(--bg-color)] text-[var(--muted-text)] hover:text-[var(--text-color)] border border-[var(--border-color)]"
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Year Filter Pills */}
        <div>
          <span className="block text-xs font-black uppercase tracking-widest text-[var(--muted-text)] mb-2.5">
            Jump to Year:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedYear("ALL")}
              className={`px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase transition-colors cursor-pointer ${selectedYear === "ALL"
                ? "bg-[var(--color-accent)] text-white shadow-sm"
                : "bg-[var(--bg-color)] text-[var(--muted-text)] hover:text-[var(--text-color)] border border-[var(--border-color)]"
                }`}
            >
              All Years
            </button>
            {years.map((y) => (
              <button
                key={y.year}
                onClick={() => {
                  setSelectedYear(y.year);
                  setOpenYears((prev) => ({ ...prev, [y.year]: true }));
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${selectedYear === y.year
                  ? "bg-[var(--color-accent)] text-white font-black shadow-sm"
                  : "bg-[var(--bg-color)] text-[var(--muted-text)] hover:text-[var(--text-color)] border border-[var(--border-color)]"
                  }`}
              >
                {y.year}
              </button>
            ))}
          </div>
        </div>

        {/* Actions & Result Count */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)] text-xs text-[var(--muted-text)] font-semibold">
          <div>
            Showing <span className="font-bold text-[var(--text-color)]">{displayedCount}</span> of {totalShowsCount} shows
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={expandAll}
              className="hover: text-[var(--color-accent)] transition-colors underline"
            >
              Expand All
            </button>
            <span>•</span>
            <button
              onClick={collapseAll}
              className="hover: text-[var(--color-accent)] transition-colors underline"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* ── SHOWS LIST GROUPED BY YEAR ── */}
      {filteredYears.length === 0 ? (
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-12 text-center my-8">
          <span className="text-4xl mb-4 block">🎸</span>
          <h3 className="text-xl font-bold text-[var(--text-color)] mb-2">No Past Shows Found</h3>
          <p className="text-sm text-[var(--muted-text)] max-w-md mx-auto mb-6">
            We couldn&apos;t find any shows matching &quot;{searchQuery}&quot;. Try adjusting your search query or selecting a different year/category.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedYear("ALL");
              setSelectedCategory("ALL");
            }}
            className="px-6 py-2.5 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#851de7] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredYears.map((yGroup) => {
            const isOpen = !!openYears[yGroup.year];
            return (
              <div
                key={yGroup.year}
                className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm transition-colors"
              >
                {/* Year Header Accordion Bar */}
                <button
                  onClick={() => toggleYear(yGroup.year)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[var(--bg-color)] to-[var(--card-bg)] border-b border-[var(--border-color)] hover:bg-[var(--color-accent)]/10 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-[var(--color-accent)] text-white text-sm font-black rounded-lg shadow-sm">
                      {yGroup.year}
                    </span>
                    <span className="text-sm font-bold text-[var(--text-color)]">
                      {yGroup.shows.length} {yGroup.shows.length === 1 ? "Show" : "Shows"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted-text)]">
                    <span>{isOpen ? "Hide" : "Show"}</span>
                    <svg
                      className={`w-4 h-4 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
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
                          className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[var(--color-accent)]/10 transition-colors group"
                        >
                          {/* Date & Day */}
                          <div className="w-full sm:w-48 shrink-0 font-semibold text-xs sm:text-sm text-[var(--muted-text)] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]/50 group-hover:bg-[var(--color-accent)] transition-colors"></span>
                            {show.date || yGroup.year}
                          </div>

                          {/* Venue Name */}
                          <div className="flex-1 font-bold text-sm sm:text-base text-[var(--text-color)] leading-snug">
                            {show.venue}
                          </div>

                          {/* Badges */}
                          <div className="flex items-center gap-1.5 shrink-0 pt-1 sm:pt-0">
                            {isCancelled && (
                              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-600 rounded-md border border-rose-500/30">
                                Cancelled
                              </span>
                            )}
                            {isUnplugged && (
                              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-purple-600/20  text-[var(--color-accent)] rounded-md border border-purple-500/30">
                                Unplugged
                              </span>
                            )}
                            {isPrivate && (
                              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-[var(--color-accent)]/20  text-[var(--color-accent)] rounded-md border border-[var(--color-accent)]/30">
                                Private Event
                              </span>
                            )}
                            {isCruise && (
                              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-600 rounded-md border border-sky-500/30">
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
