"use client";

/**
 * Sandbox for the Flux-Theory-style filter drawer before it goes on /media.
 * Uses the real video catalogue (public/data/videos.json) plus a few mock
 * photos so every facet has data.
 */

import { useCallback, useMemo, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import staticVideoCategories from "../../../public/data/videos.json";
import CustomDropdown from "@/components/CustomDropdown";
import { SearchInput } from "@/components/SearchInput";
import MediaFilterDrawer, { type MediaFilterOption } from "@/components/MediaFilterDrawer";

type MediaType = "all" | "videos" | "photos";
type SortKey = "default" | "newest" | "oldest" | "title" | "views";
type LengthKey = "all" | "short" | "mid" | "full";

interface Item {
  id: string;
  title: string;
  year: number;
  category: string;
  mediaType: "video" | "photo";
  thumb: string;
  /** Running time in seconds (videos only) */
  seconds?: number;
  views?: number;
}

const toSeconds = (d?: string) =>
  d ? String(d).split(":").map(Number).reduce((a, b) => a * 60 + b, 0) : undefined;

const toViews = (v?: string) => {
  if (!v) return undefined;
  const n = parseFloat(v);
  if (/m/i.test(v)) return n * 1_000_000;
  if (/k/i.test(v)) return n * 1_000;
  return n;
};

const LENGTH_BUCKETS: { value: Exclude<LengthKey, "all">; label: string; test: (s: number) => boolean }[] = [
  { value: "short", label: "Short clips (under 5 min)", test: (s) => s < 300 },
  { value: "mid", label: "Mid-length (5–20 min)", test: (s) => s >= 300 && s < 1200 },
  { value: "full", label: "Full shows (20 min +)", test: (s) => s >= 1200 },
];

const matchesLength = (i: Item, l: LengthKey) => {
  if (l === "all") return true;
  if (i.seconds === undefined) return false; // photos have no running time
  return LENGTH_BUCKETS.find((b) => b.value === l)!.test(i.seconds);
};

const MOCK_PHOTOS: Item[] = [
  { id: "p1", title: "Summer Stage Lights", year: 2024, category: "Live Photography", mediaType: "photo", thumb: "/images/hero/band-performance.webp" },
  { id: "p2", title: "Hometown Crowd", year: 2023, category: "Live Photography", mediaType: "photo", thumb: "/images/fans/fan-photo-featured.jpg" },
  { id: "p3", title: "Band Portrait", year: 2022, category: "Band Portraits", mediaType: "photo", thumb: "/images/band/band-cutout.png" },
  { id: "p4", title: "Festival Night", year: 2019, category: "Live Photography", mediaType: "photo", thumb: "/images/hero/hero-desktop-poster.webp" },
  { id: "p5", title: "Backstage Classic", year: 1998, category: "Band Portraits", mediaType: "photo", thumb: "/images/hero/hero-mobile-poster.webp" },
  { id: "p6", title: "Arena Wide Shot", year: 2016, category: "Live Photography", mediaType: "photo", thumb: "/images/hero/hero-banner.png" },
];

const ALL_ITEMS: Item[] = [
  ...(
    staticVideoCategories as {
      category: string;
      videos: { id: string; title: string; year: number; duration?: string; viewCount?: string }[];
    }[]
  ).flatMap(
    (cat) =>
      cat.videos.map((v) => ({
        id: v.id,
        title: v.title,
        year: Number(v.year) || 0,
        category: cat.category,
        mediaType: "video" as const,
        thumb: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
        seconds: toSeconds(v.duration),
        views: toViews(v.viewCount),
      })),
  ),
  ...MOCK_PHOTOS,
];

const toTitle = (s: string) => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));

const matchesType = (i: Item, t: MediaType) =>
  t === "all" || (t === "videos" ? i.mediaType === "video" : i.mediaType === "photo");

export default function MediaFilterPreviewPage() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [category, setCategory] = useState("ALL");
  const [mediaType, setMediaType] = useState<MediaType>("all");
  const [length, setLength] = useState<LengthKey>("all");
  const [yearRange, setYearRange] = useState<[number, number] | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("default");

  // Year bounds re-scope to category + media type (like Flux's price slider)
  const yearBounds = useMemo<[number, number] | null>(() => {
    const years = ALL_ITEMS.filter(
      (i) =>
        matchesType(i, mediaType) &&
        matchesLength(i, length) &&
        (category === "ALL" || i.category === category) &&
        i.year > 0,
    ).map((i) => i.year);
    return years.length ? [Math.min(...years), Math.max(...years)] : null;
  }, [category, mediaType, length]);

  // Clamp the chosen range into the current bounds
  const effectiveRange = useMemo<[number, number] | null>(() => {
    if (!yearBounds) return null;
    if (!yearRange) return yearBounds;
    const lo = Math.min(Math.max(yearRange[0], yearBounds[0]), yearBounds[1]);
    const hi = Math.max(Math.min(yearRange[1], yearBounds[1]), lo);
    return [lo, hi];
  }, [yearRange, yearBounds]);

  const results = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = ALL_ITEMS.filter((i) => {
      if (!matchesType(i, mediaType)) return false;
      if (!matchesLength(i, length)) return false;
      if (category !== "ALL" && i.category !== category) return false;
      if (effectiveRange && (i.year < effectiveRange[0] || i.year > effectiveRange[1])) return false;
      if (q && !`${i.title} ${i.category} ${i.year}`.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sortBy === "newest") return [...list].sort((a, b) => b.year - a.year);
    if (sortBy === "oldest") return [...list].sort((a, b) => a.year - b.year);
    if (sortBy === "title") return [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === "views") return [...list].sort((a, b) => (b.views ?? -1) - (a.views ?? -1));
    return list;
  }, [mediaType, length, category, effectiveRange, search, sortBy]);

  // Category counts respect the media type; hide empty ones (except the selected one)
  const categoryOptions = useMemo<MediaFilterOption[]>(() => {
    const scoped = ALL_ITEMS.filter((i) => matchesType(i, mediaType));
    const counts = new Map<string, number>();
    scoped.forEach((i) => counts.set(i.category, (counts.get(i.category) || 0) + 1));
    const cats = Array.from(new Set(ALL_ITEMS.map((i) => i.category)))
      .filter((c) => (counts.get(c) || 0) > 0 || c === category)
      .map((c) => ({ value: c, label: toTitle(c), count: counts.get(c) || 0 }));
    return [{ value: "ALL", label: "All", count: scoped.length }, ...cats];
  }, [mediaType, category]);

  const mediaTypeOptions = useMemo<MediaFilterOption[]>(() => {
    const inCat = ALL_ITEMS.filter((i) => category === "ALL" || i.category === category);
    return [
      { value: "all", label: "All", count: inCat.length },
      { value: "videos", label: "Videos", count: inCat.filter((i) => i.mediaType === "video").length },
      { value: "photos", label: "Photos", count: inCat.filter((i) => i.mediaType === "photo").length },
    ];
  }, [category]);

  // Length counts respect category + media type; hidden entirely when only photos are in view
  const lengthOptions = useMemo<MediaFilterOption[]>(() => {
    const scoped = ALL_ITEMS.filter(
      (i) => matchesType(i, mediaType) && (category === "ALL" || i.category === category) && i.seconds !== undefined,
    );
    if (scoped.length === 0) return [];
    return [
      { value: "all", label: "Any length", count: scoped.length },
      ...LENGTH_BUCKETS.map((b) => ({
        value: b.value,
        label: b.label,
        count: scoped.filter((i) => b.test(i.seconds!)).length,
      })),
    ];
  }, [category, mediaType]);

  const yearActive =
    !!yearBounds && !!effectiveRange && (effectiveRange[0] !== yearBounds[0] || effectiveRange[1] !== yearBounds[1]);
  const activeCount =
    (category !== "ALL" ? 1 : 0) +
    (mediaType !== "all" ? 1 : 0) +
    (length !== "all" ? 1 : 0) +
    (yearActive ? 1 : 0);

  const clearAll = useCallback(() => {
    setCategory("ALL");
    setMediaType("all");
    setLength("all");
    setYearRange(null);
  }, []);
  const closeDrawer = useCallback(() => setOpen(false), []);

  return (
    <main className="min-h-screen bg-[#07060b] px-4 pb-24 pt-32 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Internal preview</p>
        <h1 className="font-heading mb-10 text-[length:var(--font-size-h2)] uppercase leading-none">Media Filter Drawer</h1>

        {/* Toolbar: count left — search, sort, filters right */}
        <div
          role="toolbar"
          aria-label="Media filters"
          className="mb-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-white/10 pb-4"
        >
          <p className="text-[13px] text-[color:var(--color-text-muted,rgba(255,255,255,0.55))]" aria-live="polite">
            {results.length} {results.length === 1 ? "item" : "items"}
          </p>

          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search title, category, year..."
              containerClassName="order-last w-full sm:order-none sm:w-[260px]"
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/50">Sort by</span>
            <CustomDropdown
              ariaLabel="Sort media"
              value={sortBy}
              options={[
                { value: "default", label: "Featured" },
                { value: "newest", label: "Newest first" },
                { value: "oldest", label: "Oldest first" },
                { value: "views", label: "Most viewed" },
                { value: "title", label: "A – Z" },
              ]}
              onChange={(v) => setSortBy(v as SortKey)}
              minWidth={150}
              buttonClassName="rounded-none border border-white/20 bg-transparent px-3 py-2 text-[13px] transition-colors hover:border-white/40"
            />
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={open}
              className="ml-auto flex items-center gap-2 border border-white/20 px-4 py-2 text-[13px] text-white transition-colors hover:border-white/50 hover:bg-white/5 sm:ml-0"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              Filters
              {activeCount > 0 && (
                <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--color-action,#f5b942)] px-1 text-[11px] font-bold text-black">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Grid */}
        {results.length === 0 ? (
          <div className="flex flex-col items-start gap-4 py-24">
            <p className="text-white/70">Nothing matches those filters.</p>
            <button
              type="button"
              onClick={clearAll}
              className="text-[var(--color-action,#f5b942)] underline underline-offset-4 transition-colors hover:text-white"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-5 lg:grid-cols-3 lg:gap-x-6">
            {results.map((item) => (
              <li key={`${item.mediaType}-${item.id}`} className="flex flex-col gap-3">
                <div className="relative aspect-video overflow-hidden bg-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute left-2 top-2 bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80">
                    {item.mediaType === "photo" ? "Photo" : "Video"}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-semibold leading-snug text-white">{item.title}</h3>
                  <p className="text-xs text-white/55">
                    {toTitle(item.category)} · {item.year}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <MediaFilterDrawer
        open={open}
        onClose={closeDrawer}
        returnFocusRef={triggerRef}
        categoryOptions={categoryOptions}
        category={category}
        onCategoryChange={setCategory}
        mediaTypeOptions={mediaTypeOptions}
        mediaType={mediaType}
        onMediaTypeChange={(v) => {
          setMediaType(v as MediaType);
          if (v === "photos") setLength("all");
        }}
        lengthOptions={lengthOptions}
        length={length}
        onLengthChange={(v) => setLength(v as LengthKey)}
        yearBounds={yearBounds}
        yearRange={effectiveRange}
        onYearRangeChange={setYearRange}
        resultCount={results.length}
        onClearAll={clearAll}
      />
    </main>
  );
}
