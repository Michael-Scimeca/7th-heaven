/* eslint-disable react-doctor/nextjs-no-client-fetch-for-server-data */
/* eslint-disable react-doctor/no-giant-component */
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Music } from "lucide-react";
import SearchInput from "@/components/SearchInput";
import PageHero from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";

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
  sanityContent?: any;
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
  if (categoryId === "FEST")
    return (
      venueLower.includes("fest") ||
      venueLower.includes("fair") ||
      venueLower.includes("oktoberfest") ||
      venueLower.includes("jubilee") ||
      venueLower.includes("days")
    );
  if (categoryId === "CASINO")
    return (
      venueLower.includes("casino") ||
      venueLower.includes("resort") ||
      venueLower.includes("wind creek") ||
      venueLower.includes("hard rock") ||
      venueLower.includes("rivers")
    );
  if (categoryId === "CLUB")
    return (
      venueLower.includes("saloon") ||
      venueLower.includes("pub") ||
      venueLower.includes("bar") ||
      venueLower.includes("tavern") ||
      venueLower.includes("live") ||
      venueLower.includes("nellie")
    );
  if (categoryId === "UNPLUGGED")
    return venueLower.includes("unplugged") || venueLower.includes("acoustic");
  if (categoryId === "PRIVATE")
    return (
      venueLower.includes("private") ||
      venueLower.includes("corporate") ||
      venueLower.includes("gala") ||
      venueLower.includes("party")
    );
  if (categoryId === "CRUISE")
    return (
      venueLower.includes("cruise") ||
      venueLower.includes("greece") ||
      venueLower.includes("london") ||
      venueLower.includes("amsterdam") ||
      venueLower.includes("seas")
    );
  return true;
};

export default function PastShowsClient({
  years,
  totalShowsCount,
  sanityContent,
}: PastShowsClientProps) {
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

      return [
        {
          year: yGroup.year,
          shows: filteredShows,
        },
      ];
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

  const handleYearClick = (year: string) => {
    setSelectedYear(year);
    if (year !== "ALL") {
      setOpenYears((prev) => ({ ...prev, [year]: true }));
    }
    setTimeout(() => {
      const el = document.getElementById("shows-archive-section");
      if (el) {
        const yOffset = -120;
        const yPos = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, yPos), behavior: "smooth" });
      }
    }, 20);
  };

  return (
    <>
      {/* ── BREADCRUMB & HEADER SECTION ── */}
      <PageHero
        badge={sanityContent?.badge || "ARCHIVE"}
        title={
          sanityContent?.heroHeading ||
          sanityContent?.title ||
          "Past Shows Archive"
        }
        titleId="past-shows-heading"
        subtitle={
          sanityContent?.heroSubheading ||
          sanityContent?.subtitle ||
          "A comprehensive history of 7th Heaven performances, festivals, club dates, and concert events played since 1985."
        }
        align="left"
        className=""
      />

      {/* ── STATS BAR ── */}
      <div
        role="region"
        aria-label="Archive Statistics"
        className="grid w-full grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-10 lg:gap-16"
      >
        <div className="title-group title-group--sub">
          <span className="text-3xl font-extrabold text-primary sm:text-4xl">{totalShowsCount}+</span>
          <span className="text-sm text-muted">Concerts Cataloged</span>
        </div>
        <div className="title-group title-group--sub">
          <span className="text-3xl font-extrabold text-primary sm:text-4xl">40+</span>
          <span className="text-sm text-muted">Years of Live Rock</span>
        </div>
        <div className="title-group title-group--sub">
          <span className="text-3xl font-extrabold text-primary sm:text-4xl">500+</span>
          <span className="text-sm text-muted">Unique Venues</span>
        </div>
        <div className="title-group title-group--sub">
          <span className="text-3xl font-extrabold text-primary sm:text-4xl">5+</span>
          <span className="text-sm text-muted">Countries Played</span>
        </div>
      </div>

      {/* ── FILTER & SEARCH CONTROLS ── */}
      <nav
        aria-label="Archive Search and Year Filters"
        className="flex flex-col border-0 p-0"
      >
        {/* Search Input Bar */}
        <div className="mb-6 w-full max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={
              sanityContent?.searchPlaceholder || "Search venue, city, year..."
            }
            containerClassName="w-full"
          />
        </div>

        {/* Years Pill List Stacked Below Search */}
        <div className="flex w-full max-w-5xl flex-wrap items-center gap-2">
          <span className="mr-1 shrink-0 font-medium text-white/90">
            {sanityContent?.jumpToYearLabel || "Jump to Year:"}
          </span>
          <button
            type="button"
            onClick={() => handleYearClick("ALL")}
            className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition-[background-color,color,border-color,box-shadow,transform] ${selectedYear === "ALL" || selectedYear === "All"
              ? "bg-[var(--color-accent)] text-white shadow-[0_0_12px_rgba(147,51,234,0.4)] hover:bg-purple-500 hover:scale-105"
              : "bg-white/10 text-white/80 border border-transparent hover:bg-purple-600/50 hover:text-white hover:border-purple-400/40 hover:scale-105"
              } `}
          >
            {sanityContent?.allYearsLabel || "All Years"}
          </button>
          {years.map((y) => (
            <button
              key={y.year}
              type="button"
              onClick={() => handleYearClick(y.year)}
              className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition-[background-color,color,border-color,box-shadow,transform] ${selectedYear === y.year
                ? "bg-[var(--color-accent)] text-white shadow-[0_0_12px_rgba(147,51,234,0.4)] hover:bg-purple-500 hover:scale-105"
                : "bg-white/10 text-white/80 border border-transparent hover:bg-purple-600/50 hover:text-white hover:border-purple-400/40 hover:scale-105"
                } `}
            >
              {y.year}
            </button>
          ))}
        </div>

        <div className="mt-6 text-white/60">
          Showing <span>{displayedCount}</span> of {totalShowsCount} shows
        </div>
      </nav>

      {/* ── SHOWS LIST GROUPED BY YEAR ── */}
      {filteredYears.length === 0 ? (
        <div className="my-8 rounded-[var(--radius-box)] border border-[var(--border-color)] p-12 text-center">
          <Music className="mx-auto mb-6 h-11 w-11 text-purple-400" />
          <h3 className="mb-2">
            {sanityContent?.noShowsTitle || "No Past Shows Found"}
          </h3>
          <p className="mx-auto mb-6 max-w-md">
            We couldn&apos;t find any shows matching &quot;{searchQuery}&quot;.
            Try adjusting your search query or selecting a different
            year/category.
          </p>
          <button
            aria-label="Reset filters"
            onClick={() => {
              setSearchQuery("");
              handleYearClick("ALL");
              setSelectedCategory("ALL");
            }}
            className="btn-accent cursor-pointer rounded-[var(--radius-box)] bg-[var(--color-accent)] px-6 py-2.5"
          >
            {sanityContent?.resetFiltersText || "Reset Filters"}
          </button>
        </div>
      ) : (
        <section
          id="past-shows-archive"
          aria-labelledby="past-shows-archive-heading"
          className="section"
        >
          <SectionHeader id="past-shows-archive-heading" title="Past Shows Archive" visuallyHidden />
          <div className="min-h-[60vh] space-y-0">
            {filteredYears.map((yGroup) => {
              const isOpen = !!openYears[yGroup.year];
              const accordionContentId = `year-shows-${yGroup.year}`;
              return (
                <article key={yGroup.year} className="overflow-hidden">
                  {/* Year Header Accordion Bar */}
                  <button
                    type="button"
                    onClick={() => toggleYear(yGroup.year)}
                    aria-expanded={isOpen}
                    aria-controls={accordionContentId}
                    className="accordion-trigger flex w-full cursor-pointer items-center justify-between !rounded-none border-b border-white/15 py-2.5 pr-6 text-left"
                  >
                    <h2 className="flex items-center gap-3">
                      <span className="rounded-lg bg-[var(--color-accent)] px-3 py-1">
                        {yGroup.year}
                      </span>
                      <span>
                        {yGroup.shows.length}{" "}
                        {yGroup.shows.length === 1 ? "Show" : "Shows"}
                      </span>
                    </h2>
                  </button>

                  {/* Shows Table / Grid */}
                  {isOpen && (
                    <ul
                      id={accordionContentId}
                      className="divide-y divide-[var(--border-color)]"
                    >
                      {yGroup.shows.map((show, idx) => {
                        const isCancelled = show.venue
                          .toLowerCase()
                          .includes("cancelled");
                        const isUnplugged = show.venue
                          .toLowerCase()
                          .includes("unplugged");
                        const isPrivate = show.venue
                          .toLowerCase()
                          .includes("private");
                        const isCruise =
                          show.venue.toLowerCase().includes("cruise") ||
                          show.venue.toLowerCase().includes("greece") ||
                          show.venue.toLowerCase().includes("london") ||
                          show.venue.toLowerCase().includes("amsterdam");

                        return (
                          <li
                            key={`${yGroup.year}-${idx}`}
                            className="text-link group flex flex-col justify-between gap-2 border-b border-white/[0.12] stagger-item py-3.5 sm:flex-row sm:items-center"
                            style={{ "--i": Math.min(idx, 9) } as React.CSSProperties}
                          >
                            {/* Date & Day */}
                            <time className="flex w-full shrink-0 items-center gap-2 font-medium sm:w-48">
                              <span className="transition-colors h-2 w-2 rounded-full bg-[var(--color-accent)]/50 group-hover:bg-[var(--color-accent)]"></span>
                              {show.date || yGroup.year}
                            </time>

                            {/* Venue Name */}
                            <span className="flex-1 font-medium">
                              {show.venue}
                            </span>

                            {/* Badges */}
                            <div className="flex shrink-0 items-center gap-1.5 pt-1 sm:pt-0">
                              {isCancelled && (
                                <span className="rounded-lg border border-rose-500/30 bg-rose-500/20 px-2 py-0.5 text-rose-600">
                                  Cancelled
                                </span>
                              )}
                              {isUnplugged && (
                                <span className="rounded-lg border border-purple-500/30 bg-purple-600/20 px-2 py-0.5">
                                  Unplugged
                                </span>
                              )}
                              {isPrivate && (
                                <span className="rounded-lg border border-[var(--color-accent)]/30 bg-purple-600/20 px-2 py-0.5">
                                  Private Event
                                </span>
                              )}
                              {isCruise && (
                                <span className="rounded-lg border border-[var(--color-accent)]/30 bg-purple-600/20 px-2 py-0.5">
                                  Special Tour
                                </span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
