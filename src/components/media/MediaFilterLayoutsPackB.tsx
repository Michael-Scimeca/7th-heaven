"use client";

import React, { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Film,
  Camera,
  Check,
  X,
  Disc3,
  Radio,
  Sparkles,
  ArrowRight,
  Tag,
} from "lucide-react";
import { Toggle } from "@/components/Toggle";
import {
  DEFAULT_VAULT_FILTER_STATE,
  ERA_OPTIONS,
  RUNTIME_OPTIONS,
  SMART_MOOD_PRESETS,
  SORT_OPTIONS,
  type EraFilter,
  type FilterLayoutRendererProps,
  type MediaFormatFilter,
  type RuntimeFilter,
  type SmartMoodPreset,
  type SortFilter,
  type VaultFilterState,
} from "./MediaFilterLayoutsTypes";

const subscribeNoop = () => () => {};

/* ── Shared Vault Title & Live Count Header ── */
function VaultTitleRow({
  format,
  videoItems,
  photoItems,
  rightSlot,
}: {
  format: MediaFormatFilter;
  videoItems: number;
  photoItems: number;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/10">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase tracking-widest text-amber-400 font-bold">
          Archival Directory
        </span>
        <h2 className="text-white uppercase font-heading">
          {format === "all"
            ? "Videos & Photography Vault"
            : format === "video"
              ? "Concert & Music Videos"
              : "Archival Photography"}
        </h2>
      </div>
      {rightSlot ?? (
        <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-purple-500 animate-pulse" />
            <strong className="text-white font-bold">{videoItems}</strong> Videos
          </span>
          <span className="text-zinc-600">•</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-400" />
            <strong className="text-white font-bold">{photoItems}</strong> Photos
          </span>
        </div>
      )}
    </div>
  );
}

/* ========================================================================== */
/* #11 — VINYL RECORD-CRATE DIVIDER TABS                                      */
/* ========================================================================== */
interface CrateDivider {
  id: string;
  label: string;
  code: string;
  format: MediaFormatFilter;
  categories: string[];
}

const CRATE_DIVIDERS: readonly CrateDivider[] = [
  { id: "all", label: "All Crates", code: "70", format: "all", categories: [] },
  {
    id: "singles",
    label: "Official Videos",
    code: "A1",
    format: "video",
    categories: ["official-music-videos"],
  },
  {
    id: "concerts",
    label: "Arena Concerts",
    code: "A2",
    format: "video",
    categories: ["full-concerts"],
  },
  {
    id: "medleys",
    label: "30-in-30",
    code: "B1",
    format: "video",
    categories: ["medleys-marathons"],
  },
  {
    id: "tv",
    label: "TV & Press",
    code: "B2",
    format: "video",
    categories: ["tv-broadcasts"],
  },
  {
    id: "cruise",
    label: "Cruise Vault",
    code: "C1",
    format: "all",
    categories: ["caribbean-cruise-video", "caribbean-cruise-photos"],
  },
  { id: "photos", label: "Photography", code: "P1", format: "photo", categories: [] },
];

function isCrateActive(
  crate: CrateDivider,
  state: VaultFilterState,
  selectedCategorySet: ReadonlySet<string>
): boolean {
  if (crate.format !== state.format) return false;
  if (crate.categories.length !== state.categories.length) return false;
  return crate.categories.every((id) => selectedCategorySet.has(id));
}

function FilterLayout11RecordCrateTabs(props: FilterLayoutRendererProps) {
  const {
    state,
    selectedCategorySet,
    onChange,
    onReset,
    totalItems,
    videoItems,
    photoItems,
    activeFilterCount,
    children,
  } = props;

  return (
    <div className="flex flex-col gap-6">
      <VaultTitleRow format={state.format} videoItems={videoItems} photoItems={photoItems} />

      <div className="flex flex-col">
        {/* Physical Raised Crate Tabs Flush Along Bottom Rail */}
        <div
          role="tablist"
          aria-label="Vinyl record crate dividers"
          className="flex items-end gap-1.5 overflow-x-auto no-scrollbar px-2 border-b-2 border-amber-400/70"
        >
          {CRATE_DIVIDERS.map((crate) => {
            const active = isCrateActive(crate, state, selectedCategorySet);
            return (
              <button
                key={crate.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() =>
                  onChange({
                    format: crate.format,
                    categories: [...crate.categories],
                  })
                }
                className={`flex items-center gap-2 rounded-t-xl border-x border-t px-4 transition-colors shrink-0 cursor-pointer ${
                  active
                    ? "border-amber-300 bg-amber-400 py-2.5 text-zinc-950 font-extrabold shadow-lg"
                    : "border-white/15 bg-zinc-900/90 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Disc3 className={`size-3.5 ${active ? "text-zinc-950" : "text-amber-400"}`} />
                <span className="font-mono text-xs uppercase tracking-wider">{crate.label}</span>
                <span
                  className={`rounded px-1.5 py-0.5 font-mono text-xs ${
                    active ? "bg-zinc-950/15 text-zinc-950 font-bold" : "bg-white/10 text-zinc-400"
                  }`}
                >
                  {crate.code}
                </span>
              </button>
            );
          })}
        </div>

        {/* Recessed Crate Shelf Utility Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-[var(--radius-box)] border-x border-b border-white/15 bg-zinc-950/90 p-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 pr-1">
              Pressing Era:
            </span>
            {ERA_OPTIONS.map((era) => (
              <button
                key={era.value}
                type="button"
                onClick={() => onChange({ era: era.value })}
                className={`rounded-full px-3 py-1 font-mono text-xs transition-colors cursor-pointer ${
                  state.era === era.value
                    ? "bg-purple-600 text-white font-bold"
                    : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {era.short}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
              <input
                type="search"
                value={state.search}
                onChange={(e) => onChange({ search: e.target.value })}
                placeholder="Sleeve search..."
                aria-label="Search record crate"
                className="w-44 sm:w-52 rounded-full border border-white/15 bg-black/70 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <select
              aria-label="Sort crate records"
              value={state.sort}
              onChange={(e) => onChange({ sort: e.target.value as SortFilter })}
              className="rounded-full border border-white/15 bg-black/70 px-3 py-1.5 font-mono text-xs text-zinc-200 focus:border-amber-400 focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-zinc-950">
                  {opt.label}
                </option>
              ))}
            </select>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-zinc-300">
              {totalItems} sleeves
            </span>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 font-mono text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}

/* ========================================================================== */
/* #12 — FLOATING BOTTOM GLASS ISLAND (PURE TOP GALLERY)                      */
/* ========================================================================== */
function FilterLayout12FloatingBottomIsland(props: FilterLayoutRendererProps) {
  const {
    allCategories,
    state,
    onChange,
    onToggleCategory,
    onReset,
    totalItems,
    videoItems,
    photoItems,
    activeFilterCount,
    children,
  } = props;

  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Pure Gallery Header — Zero Filter Controls Cluttering Top */}
      <VaultTitleRow
        format={state.format}
        videoItems={videoItems}
        photoItems={photoItems}
        rightSlot={
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-400">
            <span className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-purple-300">
              Floating Bottom Dock Active ↓
            </span>
            <span>
              <strong className="text-white">{totalItems}</strong> items visible
            </span>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 py-1 font-bold text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
              >
                Clear ({activeFilterCount})
              </button>
            )}
          </div>
        }
      />

      {children}

      {mounted &&
        createPortal(
          <aside
            aria-label="Floating Bottom Vault Filter Island"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4 pointer-events-auto"
          >
            <div className="flex flex-col gap-2">
              {/* Upward Expandable Facet Popover */}
              {isTrayOpen && (
                <div className="flex flex-col gap-4 rounded-[var(--radius-box)] border border-white/20 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-amber-400">
                      Floating Island Facet Drawer ({totalItems} Matches)
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsTrayOpen(false)}
                      aria-label="Collapse facet drawer"
                      className="flex size-7 items-center justify-center rounded-full bg-white/10 text-zinc-300 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <span className="font-mono text-xs uppercase text-zinc-400">Collections</span>
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                        {allCategories.map((cat) => {
                          const selected = props.selectedCategorySet.has(cat.id);
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => onToggleCategory(cat.id)}
                              className={`rounded-full px-2.5 py-1 font-mono text-xs cursor-pointer ${
                                selected
                                  ? "bg-amber-400 text-zinc-950 font-bold"
                                  : "bg-white/10 text-zinc-300 hover:bg-white/20"
                              }`}
                            >
                              {cat.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-mono text-xs uppercase text-zinc-400">
                          Runtime &amp; Sort
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {RUNTIME_OPTIONS.map((rt) => (
                            <button
                              key={rt.value}
                              type="button"
                              onClick={() => onChange({ runtime: rt.value })}
                              className={`rounded-full px-2.5 py-1 font-mono text-xs cursor-pointer ${
                                state.runtime === rt.value
                                  ? "bg-purple-600 text-white font-bold"
                                  : "bg-white/10 text-zinc-300 hover:bg-white/20"
                              }`}
                            >
                              {rt.short}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <Toggle
                          size="sm"
                          checked={state.hdRecentOnly}
                          onChange={(checked) => onChange({ hdRecentOnly: checked })}
                          label="2023+ 4K Era"
                        />
                        <select
                          aria-label="Sort vault"
                          value={state.sort}
                          onChange={(e) => onChange({ sort: e.target.value as SortFilter })}
                          className="rounded-full border border-white/15 bg-black/70 px-3 py-1 font-mono text-xs text-zinc-200 focus:outline-none cursor-pointer"
                        >
                          {SORT_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value} className="bg-zinc-950">
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Floating Glass Island Capsule */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-full border border-white/25 bg-zinc-950/90 p-2 shadow-2xl backdrop-blur-2xl">
                <div className="flex items-center gap-1 rounded-full bg-white/5 p-1">
                  {(["all", "video", "photo"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => onChange({ format: fmt })}
                      className={`rounded-full px-3 py-1 font-mono text-xs font-bold uppercase transition-colors cursor-pointer ${
                        state.format === fmt
                          ? "bg-white text-zinc-950"
                          : "text-zinc-300 hover:text-white"
                      }`}
                    >
                      {fmt === "all" ? "All" : fmt === "video" ? "Videos" : "Photos"}
                    </button>
                  ))}
                </div>

                <div className="relative flex-1 min-w-[140px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
                  <input
                    type="search"
                    value={state.search}
                    onChange={(e) => onChange({ search: e.target.value })}
                    placeholder="Filter vault..."
                    aria-label="Search from floating bottom dock"
                    className="w-full rounded-full border border-white/15 bg-black/60 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <select
                    aria-label="Era filter"
                    value={state.era}
                    onChange={(e) => onChange({ era: e.target.value as EraFilter })}
                    className="hidden sm:block rounded-full border border-white/15 bg-black/60 px-3 py-1.5 font-mono text-xs text-zinc-200 focus:outline-none cursor-pointer"
                  >
                    {ERA_OPTIONS.map((era) => (
                      <option key={era.value} value={era.value} className="bg-zinc-950">
                        {era.short}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setIsTrayOpen((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-xs font-bold uppercase cursor-pointer ${
                      isTrayOpen || activeFilterCount > 0
                        ? "bg-amber-400 text-zinc-950"
                        : "bg-purple-600 text-white hover:bg-purple-500"
                    }`}
                  >
                    <SlidersHorizontal className="size-3.5" />
                    <span>Facets{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>,
          document.body
        )}
    </div>
  );
}

/* ========================================================================== */
/* #13 — SWISS NUMBERED DIRECTORY MATRIX                                      */
/* ========================================================================== */
function FilterLayout13SwissNumberedMatrix(props: FilterLayoutRendererProps) {
  const {
    allCategories,
    state,
    onChange,
    onToggleCategory,
    onReset,
    totalItems,
    videoItems,
    photoItems,
    activeFilterCount,
    children,
  } = props;

  return (
    <div className="flex flex-col gap-6">
      <VaultTitleRow format={state.format} videoItems={videoItems} photoItems={photoItems} />

      <div className="overflow-hidden rounded-[var(--radius-box)] border border-white/20 bg-zinc-950/85">
        {/* Swiss Monospace Control Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/15 border-b border-white/20">
          <div className="flex items-center justify-between gap-2 p-3">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
              00 / MEDIUM
            </span>
            <div className="flex items-center gap-1">
              {(["all", "video", "photo"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => onChange({ format: fmt })}
                  className={`px-2.5 py-1 font-mono text-xs uppercase cursor-pointer ${
                    state.format === fmt
                      ? "bg-white text-zinc-950 font-extrabold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 p-3">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
              ERA / SORT
            </span>
            <div className="flex items-center gap-2">
              <select
                aria-label="Swiss grid era"
                value={state.era}
                onChange={(e) => onChange({ era: e.target.value as EraFilter })}
                className="bg-transparent font-mono text-xs uppercase text-amber-400 focus:outline-none cursor-pointer"
              >
                {ERA_OPTIONS.map((era) => (
                  <option key={era.value} value={era.value} className="bg-zinc-950 text-white">
                    {era.short}
                  </option>
                ))}
              </select>
              <span className="text-zinc-600">/</span>
              <select
                aria-label="Swiss grid sort"
                value={state.sort}
                onChange={(e) => onChange({ sort: e.target.value as SortFilter })}
                className="bg-transparent font-mono text-xs uppercase text-zinc-200 focus:outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-zinc-950 text-white">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 p-3">
            <div className="flex items-center gap-2 flex-1">
              <Search className="size-3.5 text-zinc-500 shrink-0" />
              <input
                type="search"
                value={state.search}
                onChange={(e) => onChange({ search: e.target.value })}
                placeholder="INDEX QUERY..."
                aria-label="Swiss index search"
                className="w-full bg-transparent font-mono text-xs uppercase text-white placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
            {activeFilterCount > 0 ? (
              <button
                type="button"
                onClick={onReset}
                className="font-mono text-xs font-bold uppercase text-amber-400 hover:underline shrink-0 cursor-pointer"
              >
                CLR [{activeFilterCount}]
              </button>
            ) : (
              <span className="font-mono text-xs text-zinc-500 shrink-0">[{totalItems}]</span>
            )}
          </div>
        </div>

        {/* 11-Cell Numbered Punch-Card Index Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-y sm:divide-x divide-white/10">
          {allCategories.map((cat, index) => {
            const num = String(index + 1).padStart(2, "0");
            const selected = props.selectedCategorySet.has(cat.id);
            const dimmed = state.format !== "all" && state.format !== cat.categoryType;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onToggleCategory(cat.id)}
                className={`flex items-center justify-between gap-3 p-3.5 text-left transition-colors cursor-pointer ${
                  selected
                    ? "bg-amber-400 text-zinc-950"
                    : dimmed
                      ? "bg-black/40 text-zinc-600 hover:text-zinc-300"
                      : "hover:bg-white/5 text-zinc-200"
                }`}
              >
                <div className="flex items-baseline gap-2.5 min-w-0">
                  <span
                    className={`font-mono text-xs font-extrabold ${
                      selected ? "text-zinc-950" : "text-amber-400"
                    }`}
                  >
                    {num}
                  </span>
                  <span className="font-mono text-xs font-bold uppercase truncate">
                    {cat.title}
                  </span>
                </div>
                <span
                  className={`font-mono text-xs shrink-0 ${
                    selected ? "text-zinc-900 font-bold" : "text-zinc-500"
                  }`}
                >
                  {cat.categoryType === "video" ? "VID" : "PHO"}·{cat.itemsCount}
                </span>
              </button>
            );
          })}

          {/* Cell 12: Show All / Summary Cell */}
          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-between gap-3 p-3.5 text-left bg-purple-950/30 hover:bg-purple-900/40 text-purple-200 transition-colors cursor-pointer"
          >
            <div className="flex items-baseline gap-2.5">
              <span className="font-mono text-xs font-extrabold text-purple-300">ALL</span>
              <span className="font-mono text-xs font-bold uppercase">Full Index Reset</span>
            </div>
            <span className="font-mono text-xs font-bold text-amber-400">{totalItems}/70</span>
          </button>
        </div>
      </div>

      {children}
    </div>
  );
}

/* ========================================================================== */
/* #14 — MULTI-TAG PILL CLOUD & ACTIVE SELECTION BASKET                       */
/* ========================================================================== */
function FilterLayout14MultiTagCloudBasket(props: FilterLayoutRendererProps) {
  const {
    allCategories,
    state,
    onChange,
    onToggleCategory,
    onReset,
    totalItems,
    videoItems,
    photoItems,
    activeFilterCount,
    children,
  } = props;

  const videoCats = allCategories.filter((c) => c.categoryType === "video");
  const photoCats = allCategories.filter((c) => c.categoryType === "photo");
  const categoryById = new Map(allCategories.map((c) => [c.id, c]));

  return (
    <div className="flex flex-col gap-6">
      <VaultTitleRow format={state.format} videoItems={videoItems} photoItems={photoItems} />

      <div className="flex flex-col gap-4 rounded-[var(--radius-box)] border border-white/15 bg-white/5 p-4 sm:p-5">
        {/* Cluster 1: Purple Video Reels + Amber Photo Rolls + Emerald Eras */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 font-mono text-xs font-bold uppercase text-purple-300 pr-1">
            <Film className="size-3.5" /> Reels:
          </span>
          {videoCats.map((cat) => {
            const active = props.selectedCategorySet.has(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onToggleCategory(cat.id)}
                className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors cursor-pointer ${
                  active
                    ? "border-purple-300 bg-purple-500 text-white font-bold shadow-md"
                    : "border-purple-500/30 bg-purple-500/10 text-purple-200 hover:bg-purple-500/25"
                }`}
              >
                #{cat.title}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 font-mono text-xs font-bold uppercase text-amber-400 pr-1">
            <Camera className="size-3.5" /> Stills:
          </span>
          {photoCats.map((cat) => {
            const active = props.selectedCategorySet.has(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onToggleCategory(cat.id)}
                className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors cursor-pointer ${
                  active
                    ? "border-amber-300 bg-amber-400 text-zinc-950 font-bold shadow-md"
                    : "border-amber-400/30 bg-amber-500/10 text-amber-200 hover:bg-amber-500/25"
                }`}
              >
                #{cat.title}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 font-mono text-xs font-bold uppercase text-emerald-300 pr-1">
              <Tag className="size-3.5" /> Era &amp; Cut:
            </span>
            {ERA_OPTIONS.filter((e) => e.value !== "all").map((era) => {
              const active = state.era === era.value;
              return (
                <button
                  key={era.value}
                  type="button"
                  onClick={() => onChange({ era: active ? "all" : era.value })}
                  className={`rounded-full border px-3 py-1 font-mono text-xs cursor-pointer ${
                    active
                      ? "border-emerald-300 bg-emerald-400 text-zinc-950 font-bold"
                      : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
                  }`}
                >
                  {era.short}
                </button>
              );
            })}
            {RUNTIME_OPTIONS.filter((r) => r.value !== "all").map((rt) => {
              const active = state.runtime === rt.value;
              return (
                <button
                  key={rt.value}
                  type="button"
                  onClick={() => onChange({ runtime: active ? "all" : rt.value })}
                  className={`rounded-full border px-3 py-1 font-mono text-xs cursor-pointer ${
                    active
                      ? "border-sky-300 bg-sky-400 text-zinc-950 font-bold"
                      : "border-sky-400/30 bg-sky-500/10 text-sky-200 hover:bg-sky-500/20"
                  }`}
                >
                  {rt.short}
                </button>
              );
            })}
          </div>

          <div className="relative min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
            <input
              type="search"
              value={state.search}
              onChange={(e) => onChange({ search: e.target.value })}
              placeholder="Add keyword tag..."
              aria-label="Search tag cloud"
              className="w-full rounded-full border border-white/15 bg-black/60 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Active Selection Basket */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs font-bold uppercase text-zinc-400">
              Active Basket ({totalItems} items):
            </span>
            {activeFilterCount === 0 && (
              <span className="font-mono text-xs text-zinc-500">
                All 70 vault items included — click any colored tag above to narrow
              </span>
            )}
            {state.format !== "all" && (
              <button
                type="button"
                onClick={() => onChange({ format: "all" })}
                className="inline-flex items-center gap-1 rounded-full bg-white text-zinc-950 px-2.5 py-0.5 font-mono text-xs font-bold cursor-pointer"
              >
                <span>Format: {state.format}</span>
                <X className="size-3" />
              </button>
            )}
            {state.categories.map((catId) => {
              const found = categoryById.get(catId);
              return (
                <button
                  key={catId}
                  type="button"
                  onClick={() => onToggleCategory(catId)}
                  className="inline-flex items-center gap-1 rounded-full bg-amber-400 text-zinc-950 px-2.5 py-0.5 font-mono text-xs font-bold cursor-pointer"
                >
                  <span>{found?.title ?? catId}</span>
                  <X className="size-3" />
                </button>
              );
            })}
            {state.era !== "all" && (
              <button
                type="button"
                onClick={() => onChange({ era: "all" })}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-400 text-zinc-950 px-2.5 py-0.5 font-mono text-xs font-bold cursor-pointer"
              >
                <span>Era: {state.era}</span>
                <X className="size-3" />
              </button>
            )}
            {state.runtime !== "all" && (
              <button
                type="button"
                onClick={() => onChange({ runtime: "all" })}
                className="inline-flex items-center gap-1 rounded-full bg-sky-400 text-zinc-950 px-2.5 py-0.5 font-mono text-xs font-bold cursor-pointer"
              >
                <span>Length: {state.runtime}</span>
                <X className="size-3" />
              </button>
            )}
            {state.search.trim().length > 0 && (
              <button
                type="button"
                onClick={() => onChange({ search: "" })}
                className="inline-flex items-center gap-1 rounded-full bg-purple-500 text-white px-2.5 py-0.5 font-mono text-xs font-bold cursor-pointer"
              >
                <span>&ldquo;{state.search}&rdquo;</span>
                <X className="size-3" />
              </button>
            )}
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="font-mono text-xs font-bold uppercase text-amber-400 hover:underline cursor-pointer"
            >
              Empty Basket
            </button>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

/* ========================================================================== */
/* #15 — 3-STEP GUIDED DRILLDOWN FUNNEL                                       */
/* ========================================================================== */
function FilterLayout15GuidedFunnel(props: FilterLayoutRendererProps) {
  const {
    allCategories,
    state,
    onChange,
    onToggleCategory,
    onReset,
    totalItems,
    videoItems,
    photoItems,
    activeFilterCount,
    children,
  } = props;

  const visibleStep3Cats = allCategories.filter(
    (c) => state.format === "all" || c.categoryType === state.format
  );

  return (
    <div className="flex flex-col gap-6">
      <VaultTitleRow format={state.format} videoItems={videoItems} photoItems={photoItems} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* STEP 01: MEDIUM */}
        <div className="flex flex-col justify-between gap-3 rounded-[var(--radius-box)] border border-white/15 bg-zinc-950/80 p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-purple-600/30 border border-purple-400/40 px-2.5 py-0.5 font-mono text-xs font-extrabold text-purple-200">
                STEP 01
              </span>
              <ArrowRight className="hidden lg:block size-4 text-zinc-500" />
            </div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-white">
              Choose Media Format
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "all", label: "All", sub: "70" },
                  { id: "video", label: "Videos", sub: "40" },
                  { id: "photo", label: "Photos", sub: "30" },
                ] as const
              ).map((item) => {
                const active = state.format === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onChange({ format: item.id, categories: [] })}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center transition-colors cursor-pointer ${
                      active
                        ? "border-amber-400 bg-amber-400 text-zinc-950 font-extrabold"
                        : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    <span className="font-mono text-xs uppercase">{item.label}</span>
                    <span className="font-mono text-xs opacity-75">{item.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Toggle
            size="sm"
            checked={state.hdRecentOnly}
            onChange={(checked) => onChange({ hdRecentOnly: checked })}
            label="2023–2025 4K Era Only"
          />
        </div>

        {/* STEP 02: ERA & RUNTIME */}
        <div className="flex flex-col justify-between gap-3 rounded-[var(--radius-box)] border border-white/15 bg-zinc-950/80 p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-purple-600/30 border border-purple-400/40 px-2.5 py-0.5 font-mono text-xs font-extrabold text-purple-200">
                STEP 02
              </span>
              <ArrowRight className="hidden lg:block size-4 text-zinc-500" />
            </div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-white">
              Select Era &amp; Runtime
            </p>

            <div className="flex flex-wrap gap-1.5">
              {ERA_OPTIONS.map((era) => (
                <button
                  key={era.value}
                  type="button"
                  onClick={() => onChange({ era: era.value })}
                  className={`rounded-full px-3 py-1 font-mono text-xs cursor-pointer ${
                    state.era === era.value
                      ? "bg-purple-600 text-white font-bold"
                      : "bg-white/5 text-zinc-300 hover:bg-white/15"
                  }`}
                >
                  {era.short}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
            {RUNTIME_OPTIONS.map((rt) => (
              <button
                key={rt.value}
                type="button"
                onClick={() => onChange({ runtime: rt.value })}
                className={`rounded-full px-2.5 py-1 font-mono text-xs cursor-pointer ${
                  state.runtime === rt.value
                    ? "bg-white text-zinc-950 font-bold"
                    : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                {rt.short}
              </button>
            ))}
          </div>
        </div>

        {/* STEP 03: COLLECTION & KEYWORD */}
        <div className="flex flex-col justify-between gap-3 rounded-[var(--radius-box)] border border-amber-400/30 bg-zinc-950/90 p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-2.5 py-0.5 font-mono text-xs font-extrabold text-amber-300">
                STEP 03
              </span>
              <span className="font-mono text-xs font-bold text-amber-400">
                {totalItems} MATCHED
              </span>
            </div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-white">
              Pinpoint Collection &amp; Search
            </p>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
              <input
                type="search"
                value={state.search}
                onChange={(e) => onChange({ search: e.target.value })}
                placeholder="Song, venue, tour..."
                aria-label="Funnel step 3 search"
                className="w-full rounded-full border border-white/15 bg-black/70 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {visibleStep3Cats.map((cat) => {
                const selected = props.selectedCategorySet.has(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onToggleCategory(cat.id)}
                    className={`rounded-full px-2.5 py-0.5 font-mono text-xs cursor-pointer ${
                      selected
                        ? "bg-amber-400 text-zinc-950 font-bold"
                        : "bg-white/10 text-zinc-300 hover:bg-white/20"
                    }`}
                  >
                    {cat.title}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
            <select
              aria-label="Sort results"
              value={state.sort}
              onChange={(e) => onChange({ sort: e.target.value as SortFilter })}
              className="rounded-full border border-white/15 bg-black/60 px-3 py-1 font-mono text-xs text-zinc-200 focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value} className="bg-zinc-950">
                  {s.label}
                </option>
              ))}
            </select>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1 font-mono text-xs font-bold text-amber-400 hover:underline cursor-pointer"
              >
                <RotateCcw className="size-3" />
                <span>Start Over</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}

/* ========================================================================== */
/* #16 — MULTI-POPOVER FILTER CHIP BAR (LINEAR-STYLE ANCHORED POPOVERS)       */
/* ========================================================================== */
type PopoverKey = "format" | "categories" | "era" | "runtime" | "sort" | null;

function FilterLayout16MultiPopoverChips(props: FilterLayoutRendererProps) {
  const {
    allCategories,
    state,
    onChange,
    onToggleCategory,
    onReset,
    totalItems,
    videoItems,
    photoItems,
    activeFilterCount,
    children,
  } = props;

  const [openMenu, setOpenMenu] = useState<PopoverKey>(null);

  const toggleMenu = (key: Exclude<PopoverKey, null>) => {
    setOpenMenu((prev) => (prev === key ? null : key));
  };

  return (
    <div className="flex flex-col gap-6">
      <VaultTitleRow format={state.format} videoItems={videoItems} photoItems={photoItems} />

      {openMenu !== null && (
        <button
          type="button"
          aria-label="Close open filter popover"
          onClick={() => setOpenMenu(null)}
          className="fixed inset-0 z-30 bg-transparent cursor-default"
        />
      )}

      <div className="relative z-40 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/15 bg-zinc-950/80 p-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Format Chip */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu("format")}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs cursor-pointer ${
                state.format !== "all"
                  ? "border-amber-400 bg-amber-400/15 text-amber-300 font-bold"
                  : "border-dashed border-white/25 bg-white/5 text-zinc-200 hover:border-white/50"
              }`}
            >
              <span>+ Format{state.format !== "all" ? `: ${state.format}` : ""}</span>
              <ChevronDown className="size-3.5" />
            </button>

            {openMenu === "format" && (
              <div className="absolute left-0 top-full z-50 pt-2 w-56">
                <div className="flex flex-col gap-1 rounded-xl border border-white/20 bg-zinc-950 p-2 shadow-2xl">
                  {(["all", "video", "photo"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => {
                        onChange({ format: fmt });
                        setOpenMenu(null);
                      }}
                      className="flex items-center justify-between rounded-lg px-3 py-2 font-mono text-xs uppercase text-zinc-200 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <span>{fmt === "all" ? "All Formats (70)" : fmt}</span>
                      {state.format === fmt && <Check className="size-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Collections Chip */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu("categories")}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs cursor-pointer ${
                state.categories.length > 0
                  ? "border-amber-400 bg-amber-400/15 text-amber-300 font-bold"
                  : "border-dashed border-white/25 bg-white/5 text-zinc-200 hover:border-white/50"
              }`}
            >
              <span>
                + Collections
                {state.categories.length > 0 ? ` (${state.categories.length})` : ""}
              </span>
              <ChevronDown className="size-3.5" />
            </button>

            {openMenu === "categories" && (
              <div className="absolute left-0 top-full z-50 pt-2 w-72">
                <div className="flex flex-col gap-1 max-h-72 overflow-y-auto rounded-xl border border-white/20 bg-zinc-950 p-2 shadow-2xl">
                  {allCategories.map((cat) => {
                    const checked = props.selectedCategorySet.has(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => onToggleCategory(cat.id)}
                        className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left font-mono text-xs text-zinc-200 hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <span className="truncate">{cat.title}</span>
                        {checked && <Check className="size-3.5 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Era Chip */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu("era")}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs cursor-pointer ${
                state.era !== "all"
                  ? "border-amber-400 bg-amber-400/15 text-amber-300 font-bold"
                  : "border-dashed border-white/25 bg-white/5 text-zinc-200 hover:border-white/50"
              }`}
            >
              <span>+ Era{state.era !== "all" ? `: ${state.era}` : ""}</span>
              <ChevronDown className="size-3.5" />
            </button>

            {openMenu === "era" && (
              <div className="absolute left-0 top-full z-50 pt-2 w-64">
                <div className="flex flex-col gap-1 rounded-xl border border-white/20 bg-zinc-950 p-2 shadow-2xl">
                  {ERA_OPTIONS.map((era) => (
                    <button
                      key={era.value}
                      type="button"
                      onClick={() => {
                        onChange({ era: era.value });
                        setOpenMenu(null);
                      }}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-left font-mono text-xs text-zinc-200 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <span>{era.label}</span>
                      {state.era === era.value && <Check className="size-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Runtime Chip */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu("runtime")}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs cursor-pointer ${
                state.runtime !== "all"
                  ? "border-amber-400 bg-amber-400/15 text-amber-300 font-bold"
                  : "border-dashed border-white/25 bg-white/5 text-zinc-200 hover:border-white/50"
              }`}
            >
              <span>+ Runtime{state.runtime !== "all" ? `: ${state.runtime}` : ""}</span>
              <ChevronDown className="size-3.5" />
            </button>

            {openMenu === "runtime" && (
              <div className="absolute left-0 top-full z-50 pt-2 w-64">
                <div className="flex flex-col gap-1 rounded-xl border border-white/20 bg-zinc-950 p-2 shadow-2xl">
                  {RUNTIME_OPTIONS.map((rt) => (
                    <button
                      key={rt.value}
                      type="button"
                      onClick={() => {
                        onChange({ runtime: rt.value });
                        setOpenMenu(null);
                      }}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-left font-mono text-xs text-zinc-200 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <span>{rt.label}</span>
                      {state.runtime === rt.value && <Check className="size-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sort Chip */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu("sort")}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs cursor-pointer ${
                state.sort !== "curated"
                  ? "border-purple-400 bg-purple-500/20 text-purple-200 font-bold"
                  : "border-white/15 bg-white/5 text-zinc-300 hover:border-white/40"
              }`}
            >
              <span>Sort: {SORT_OPTIONS.find((s) => s.value === state.sort)?.label}</span>
              <ChevronDown className="size-3.5" />
            </button>

            {openMenu === "sort" && (
              <div className="absolute left-0 top-full z-50 pt-2 w-52">
                <div className="flex flex-col gap-1 rounded-xl border border-white/20 bg-zinc-950 p-2 shadow-2xl">
                  {SORT_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => {
                        onChange({ sort: s.value });
                        setOpenMenu(null);
                      }}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-left font-mono text-xs text-zinc-200 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <span>{s.label}</span>
                      {state.sort === s.value && <Check className="size-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Inline Search & Reset */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
            <input
              type="search"
              value={state.search}
              onChange={(e) => onChange({ search: e.target.value })}
              placeholder={`Filter ${totalItems} items...`}
              aria-label="Filter items"
              className="w-44 sm:w-52 rounded-full border border-white/15 bg-black/70 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
            />
          </div>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 font-mono text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

/* ========================================================================== */
/* #17 — CURATED MOOD & SMART PLAYLISTS                                       */
/* ========================================================================== */
function isPresetSelected(
  preset: SmartMoodPreset,
  state: VaultFilterState,
  selectedCategorySet: ReadonlySet<string>
): boolean {
  if (preset.patch.format !== state.format) return false;
  if (preset.patch.categories.length !== state.categories.length) return false;
  return preset.patch.categories.every((c) => selectedCategorySet.has(c));
}

function FilterLayout17CuratedMoodPlaylists(props: FilterLayoutRendererProps) {
  const {
    state,
    selectedCategorySet,
    onChange,
    onReset,
    totalItems,
    videoItems,
    photoItems,
    activeFilterCount,
    children,
  } = props;

  return (
    <div className="flex flex-col gap-6">
      <VaultTitleRow format={state.format} videoItems={videoItems} photoItems={photoItems} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SMART_MOOD_PRESETS.map((preset) => {
          const active = isPresetSelected(preset, state, selectedCategorySet);
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() =>
                onChange({
                  ...preset.patch,
                  search: state.search,
                })
              }
              className={`flex flex-col justify-between gap-3 rounded-[var(--radius-box)] border p-4 text-left transition-colors cursor-pointer ${
                active
                  ? "border-amber-400 bg-gradient-to-br from-purple-900/60 via-zinc-950 to-amber-950/40 shadow-xl"
                  : "border-white/10 bg-white/5 hover:border-purple-400/40 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-xs font-bold ${
                    active ? "bg-amber-400 text-zinc-950" : "bg-white/10 text-purple-300"
                  }`}
                >
                  {preset.tag}
                </span>
                <Sparkles className={`size-4 ${active ? "text-amber-400" : "text-zinc-600"}`} />
              </div>

              <div className="flex items-end justify-between gap-2">
                <span className="text-sm font-extrabold uppercase tracking-wide text-white">
                  {preset.title}
                </span>
                <span className="font-mono text-xs text-amber-400 shrink-0">
                  {active ? "LOADED" : "Play →"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Subtle Secondary Search & Era Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <input
            type="search"
            value={state.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search within active playlist..."
            aria-label="Search within active playlist"
            className="w-full rounded-full border border-white/15 bg-black/60 pl-10 pr-4 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-zinc-400">{totalItems} items queued</span>
          <select
            aria-label="Playlist era filter"
            value={state.era}
            onChange={(e) => onChange({ era: e.target.value as EraFilter })}
            className="rounded-full border border-white/15 bg-black/60 px-3 py-1.5 font-mono text-xs text-zinc-200 focus:outline-none cursor-pointer"
          >
            {ERA_OPTIONS.map((era) => (
              <option key={era.value} value={era.value} className="bg-zinc-950">
                {era.short}
              </option>
            ))}
          </select>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 font-mono text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
            >
              All 70
            </button>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

/* ========================================================================== */
/* #18 — ASSET MANAGER FOLDER TREE COCKPIT (2-COL LEFT DIRECTORY TREE)        */
/* ========================================================================== */
function FilterLayout18FolderTreeCockpit(props: FilterLayoutRendererProps) {
  const {
    allCategories,
    state,
    onChange,
    onToggleCategory,
    onReset,
    totalItems,
    videoItems,
    photoItems,
    activeFilterCount,
    onSelectRow,
    children,
  } = props;

  const [videosOpen, setVideosOpen] = useState(true);
  const [photosOpen, setPhotosOpen] = useState(true);

  const videoCats = allCategories.filter((c) => c.categoryType === "video");
  const photoCats = allCategories.filter((c) => c.categoryType === "photo");

  return (
    <div className="flex flex-col gap-5">
      {/* Top Broadcast LED Transport Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-box)] border border-white/20 bg-zinc-950 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="size-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-white">
            VAULT://7TH_HEAVEN_MASTER
          </span>
          <span className="hidden sm:inline font-mono text-xs text-amber-400">
            [VID:{videoItems} | PHO:{photoItems} | TOT:{totalItems}]
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
            <input
              type="search"
              value={state.search}
              onChange={(e) => onChange({ search: e.target.value })}
              placeholder="grep filename / venue..."
              aria-label="Search asset folder tree"
              className="w-48 sm:w-56 rounded-lg border border-white/15 bg-black pl-8 pr-3 py-1.5 font-mono text-xs text-white placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <select
            aria-label="Asset era"
            value={state.era}
            onChange={(e) => onChange({ era: e.target.value as EraFilter })}
            className="rounded-lg border border-white/15 bg-black px-2.5 py-1.5 font-mono text-xs text-zinc-200 focus:outline-none cursor-pointer"
          >
            {ERA_OPTIONS.map((e) => (
              <option key={e.value} value={e.value} className="bg-zinc-950">
                {e.short}
              </option>
            ))}
          </select>

          <select
            aria-label="Asset sort"
            value={state.sort}
            onChange={(e) => onChange({ sort: e.target.value as SortFilter })}
            className="rounded-lg border border-white/15 bg-black px-2.5 py-1.5 font-mono text-xs text-zinc-200 focus:outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value} className="bg-zinc-950">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2-Column Finder / Premiere Tree Split */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 items-start">
        <aside
          aria-label="Vault Directory Tree"
          className="flex flex-col gap-3 rounded-[var(--radius-box)] border border-white/15 bg-zinc-950/90 p-3.5 lg:sticky lg:top-32"
        >
          <button
            type="button"
            onClick={() => onChange(DEFAULT_VAULT_FILTER_STATE)}
            className={`flex items-center justify-between rounded-lg px-2.5 py-2 font-mono text-xs font-bold uppercase cursor-pointer ${
              activeFilterCount === 0
                ? "bg-amber-400 text-zinc-950"
                : "text-zinc-200 hover:bg-white/10"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <FolderOpen className="size-4" />
              <span>/ALL_VAULT_ROOT</span>
            </span>
            <span>70</span>
          </button>

          {/* VIDEO_REELS Branch */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1.5">
              <button
                type="button"
                onClick={() => setVideosOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-purple-300 cursor-pointer"
              >
                {videosOpen ? (
                  <ChevronDown className="size-3.5" />
                ) : (
                  <ChevronRight className="size-3.5" />
                )}
                <Folder className="size-3.5" />
                <span>VIDEO_REELS/</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    format: state.format === "video" ? "all" : "video",
                    categories: [],
                  })
                }
                className={`rounded px-1.5 py-0.5 font-mono text-xs cursor-pointer ${
                  state.format === "video"
                    ? "bg-purple-500 text-white font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                ONLY
              </button>
            </div>

            {videosOpen && (
              <div className="flex flex-col gap-0.5 pl-4 border-l border-white/10">
                {videoCats.map((cat) => {
                  const selected = props.selectedCategorySet.has(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        onToggleCategory(cat.id);
                        onSelectRow(cat.id);
                      }}
                      className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left font-mono text-xs cursor-pointer ${
                        selected
                          ? "bg-purple-600 text-white font-bold"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="truncate">{cat.title}</span>
                      <span className="opacity-70">{cat.itemsCount}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* PHOTO_ARCHIVE Branch */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1.5">
              <button
                type="button"
                onClick={() => setPhotosOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-amber-300 cursor-pointer"
              >
                {photosOpen ? (
                  <ChevronDown className="size-3.5" />
                ) : (
                  <ChevronRight className="size-3.5" />
                )}
                <Folder className="size-3.5" />
                <span>PHOTO_ARCHIVE/</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    format: state.format === "photo" ? "all" : "photo",
                    categories: [],
                  })
                }
                className={`rounded px-1.5 py-0.5 font-mono text-xs cursor-pointer ${
                  state.format === "photo"
                    ? "bg-amber-400 text-zinc-950 font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                ONLY
              </button>
            </div>

            {photosOpen && (
              <div className="flex flex-col gap-0.5 pl-4 border-l border-white/10">
                {photoCats.map((cat) => {
                  const selected = props.selectedCategorySet.has(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        onToggleCategory(cat.id);
                        onSelectRow(cat.id);
                      }}
                      className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left font-mono text-xs cursor-pointer ${
                        selected
                          ? "bg-amber-400 text-zinc-950 font-bold"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="truncate">{cat.title}</span>
                      <span className="opacity-70">{cat.itemsCount}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
            <Toggle
              size="sm"
              checked={state.hdRecentOnly}
              onChange={(checked) => onChange({ hdRecentOnly: checked })}
              label="2023+ 4K Masters"
            />
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="w-full rounded-lg border border-amber-400/40 bg-amber-500/15 py-1.5 font-mono text-xs font-bold uppercase text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
              >
                Reset Tree ({activeFilterCount})
              </button>
            )}
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* #19 — LUXURY HAIRLINE TABS & SLIDE-DOWN SEARCH CURTAIN                     */
/* ========================================================================== */
interface EditorialHairlineTab {
  id: string;
  label: string;
  count: string;
  apply: (onChange: (patch: Partial<VaultFilterState>) => void) => void;
  isActive: (state: VaultFilterState) => boolean;
}

const HAIRLINE_TABS: readonly EditorialHairlineTab[] = [
  {
    id: "all",
    label: "All Works",
    count: "70",
    apply: (onChange) => onChange({ format: "all", categories: [], era: "all" }),
    isActive: (s) => s.format === "all" && s.categories.length === 0 && s.era === "all",
  },
  {
    id: "music-videos",
    label: "Music Videos",
    count: "08",
    apply: (onChange) =>
      onChange({ format: "video", categories: ["official-music-videos"], era: "all" }),
    isActive: (s) =>
      s.categories.length === 1 && s.categories[0] === "official-music-videos",
  },
  {
    id: "concerts",
    label: "Full Concerts",
    count: "08",
    apply: (onChange) => onChange({ format: "video", categories: ["full-concerts"], era: "all" }),
    isActive: (s) => s.categories.length === 1 && s.categories[0] === "full-concerts",
  },
  {
    id: "medleys",
    label: "30-in-30 Medleys",
    count: "06",
    apply: (onChange) =>
      onChange({ format: "video", categories: ["medleys-marathons"], era: "all" }),
    isActive: (s) => s.categories.length === 1 && s.categories[0] === "medleys-marathons",
  },
  {
    id: "photography",
    label: "Photography",
    count: "30",
    apply: (onChange) => onChange({ format: "photo", categories: [], era: "all" }),
    isActive: (s) => s.format === "photo" && s.categories.length === 0,
  },
  {
    id: "era-2024",
    label: "2024–25 Tour",
    count: "4K",
    apply: (onChange) => onChange({ format: "all", categories: [], era: "2024-2025" }),
    isActive: (s) => s.era === "2024-2025",
  },
];

function FilterLayout19LuxuryHairlineCurtain(props: FilterLayoutRendererProps) {
  const {
    state,
    onChange,
    onReset,
    totalItems,
    videoItems,
    photoItems,
    activeFilterCount,
    children,
  } = props;

  const [curtainOpen, setCurtainOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <VaultTitleRow format={state.format} videoItems={videoItems} photoItems={photoItems} />

      <div className="flex flex-col gap-4">
        {/* Minimal Hairline Underline Nav */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            {HAIRLINE_TABS.map((tab) => {
              const active = tab.isActive(state);
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => tab.apply(onChange)}
                  className={`flex items-start gap-1 border-b-2 pb-3 text-sm tracking-wide transition-colors shrink-0 cursor-pointer ${
                    active
                      ? "border-amber-400 text-white font-bold"
                      : "border-transparent text-zinc-400 hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="font-mono text-xs text-amber-400/80">{tab.count}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pb-3">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="font-mono text-xs uppercase text-amber-400 hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={() => setCurtainOpen((v) => !v)}
              aria-expanded={curtainOpen}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-200 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <Search className="size-3.5" />
              <span>{curtainOpen ? "Close Search" : "Search & Era"}</span>
            </button>
          </div>
        </div>

        {/* Unfolding Editorial Search Curtain */}
        {curtainOpen && (
          <div className="flex flex-col gap-4 border-b border-white/15 bg-white/5 p-6 rounded-[var(--radius-box)]">
            <div className="flex items-center gap-3 border-b border-white/25 pb-3">
              <Search className="size-5 text-amber-400 shrink-0" />
              <input
                type="search"
                value={state.search}
                onChange={(e) => onChange({ search: e.target.value })}
                placeholder="Type a song title, stadium, broadcast network, or year..."
                aria-label="Editorial curtain search"
                className="w-full bg-transparent text-base sm:text-lg text-white placeholder:text-zinc-500 focus:outline-none"
              />
              <span className="font-mono text-xs text-zinc-400 shrink-0">
                {totalItems} results
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
                  Decade:
                </span>
                {ERA_OPTIONS.map((era) => (
                  <button
                    key={era.value}
                    type="button"
                    onClick={() => onChange({ era: era.value })}
                    className={`font-mono text-xs uppercase cursor-pointer ${
                      state.era === era.value
                        ? "text-amber-400 font-bold underline underline-offset-4"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {era.short}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
                  Order:
                </span>
                {SORT_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => onChange({ sort: s.value })}
                    className={`font-mono text-xs uppercase cursor-pointer ${
                      state.sort === s.value
                        ? "text-purple-300 font-bold underline underline-offset-4"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {children}
    </div>
  );
}

/* ========================================================================== */
/* #20 — LIVE SOUNDBOARD MIXING RACK (STAGE CONSOLE WITH UNIFIED TOGGLES)     */
/* ========================================================================== */
function FilterLayout20SoundboardMixingRack(props: FilterLayoutRendererProps) {
  const {
    allCategories,
    state,
    onChange,
    onToggleCategory,
    onReset,
    totalItems,
    videoItems,
    photoItems,
    activeFilterCount,
    children,
  } = props;

  const videosEnabled = state.format === "all" || state.format === "video";
  const photosEnabled = state.format === "all" || state.format === "photo";

  const handleVideoBusToggle = (checked: boolean) => {
    if (checked && photosEnabled) {
      onChange({ format: "all" });
    } else if (checked && !photosEnabled) {
      onChange({ format: "video" });
    } else if (!checked && photosEnabled) {
      onChange({ format: "photo" });
    } else {
      onChange({ format: "photo" });
    }
  };

  const handlePhotoBusToggle = (checked: boolean) => {
    if (checked && videosEnabled) {
      onChange({ format: "all" });
    } else if (checked && !videosEnabled) {
      onChange({ format: "photo" });
    } else if (!checked && videosEnabled) {
      onChange({ format: "video" });
    } else {
      onChange({ format: "video" });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <VaultTitleRow format={state.format} videoItems={videoItems} photoItems={photoItems} />

      <div className="flex flex-col gap-4 rounded-[var(--radius-box)] border border-purple-500/35 bg-zinc-950/95 p-4 sm:p-5 shadow-2xl">
        {/* Console Rack Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <Radio className="size-4 text-amber-400" />
            <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-white">
              FOHVAULT-20 // STAGE MIXING MATRIX
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="rounded bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 text-emerald-300 font-bold">
              SIGNAL: {totalItems} CHANNELS LIVE
            </span>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1 rounded bg-amber-400 px-2.5 py-0.5 font-bold text-zinc-950 cursor-pointer"
              >
                <RotateCcw className="size-3" />
                <span>ZERO CONSOLE</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Channel Bus Modules Using Mandatory Unified <Toggle /> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-purple-300 font-bold">BUS 01 // VIDEO</span>
              <span className="text-zinc-400">{videoItems} OUT</span>
            </div>
            <Toggle
              size="sm"
              checked={videosEnabled}
              onChange={handleVideoBusToggle}
              label="Video Reels Bus"
            />
          </div>

          <div className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-amber-300 font-bold">BUS 02 // PHOTO</span>
              <span className="text-zinc-400">{photoItems} OUT</span>
            </div>
            <Toggle
              size="sm"
              checked={photosEnabled}
              onChange={handlePhotoBusToggle}
              label="Photography Bus"
            />
          </div>

          <div className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-emerald-300 font-bold">BUS 03 // 4K CUT</span>
              <span className="text-zinc-400">2023+</span>
            </div>
            <Toggle
              size="sm"
              checked={state.hdRecentOnly}
              onChange={(checked) => onChange({ hdRecentOnly: checked })}
              label="4K Tour Remasters"
            />
          </div>

          <div className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-sky-300 font-bold">BUS 04 // 25M+</span>
              <span className="text-zinc-400">FULL SET</span>
            </div>
            <Toggle
              size="sm"
              checked={state.runtime === "long"}
              onChange={(checked) =>
                onChange({
                  runtime: checked ? ("long" as RuntimeFilter) : "all",
                })
              }
              label="Full Concerts Only"
            />
          </div>
        </div>

        {/* 11 Illuminated SOLO Punch Pads */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">
            Channel Solo Pads (Multi-Select Collections):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {allCategories.map((cat, idx) => {
              const soloed = props.selectedCategorySet.has(cat.id);
              const ch = String(idx + 1).padStart(2, "0");
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onToggleCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs uppercase transition-colors cursor-pointer ${
                    soloed
                      ? "border-amber-300 bg-amber-400 text-zinc-950 font-extrabold shadow-md"
                      : "border-white/15 bg-black/70 text-zinc-300 hover:border-purple-400/50 hover:text-white"
                  }`}
                >
                  <span className={soloed ? "text-zinc-950" : "text-amber-400"}>CH{ch}</span>
                  <span>{cat.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Master Monitor Strip: Era + Sort + Console Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Console era selector"
              value={state.era}
              onChange={(e) => onChange({ era: e.target.value as EraFilter })}
              className="rounded-lg border border-white/15 bg-black px-3 py-1.5 font-mono text-xs text-zinc-200 focus:outline-none cursor-pointer"
            >
              {ERA_OPTIONS.map((era) => (
                <option key={era.value} value={era.value} className="bg-zinc-950">
                  ERA: {era.short}
                </option>
              ))}
            </select>

            <select
              aria-label="Console sort selector"
              value={state.sort}
              onChange={(e) => onChange({ sort: e.target.value as SortFilter })}
              className="rounded-lg border border-white/15 bg-black px-3 py-1.5 font-mono text-xs text-zinc-200 focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value} className="bg-zinc-950">
                  ORDER: {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
            <input
              type="search"
              value={state.search}
              onChange={(e) => onChange({ search: e.target.value })}
              placeholder="Master console cue search..."
              aria-label="Master console cue search"
              className="w-full rounded-lg border border-white/15 bg-black pl-8 pr-3 py-1.5 font-mono text-xs text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}

export function renderFilterLayoutsPackB(
  layoutId: number,
  props: FilterLayoutRendererProps
): React.ReactNode {
  switch (layoutId) {
    case 11:
      return <FilterLayout11RecordCrateTabs {...props} />;
    case 12:
      return <FilterLayout12FloatingBottomIsland {...props} />;
    case 13:
      return <FilterLayout13SwissNumberedMatrix {...props} />;
    case 14:
      return <FilterLayout14MultiTagCloudBasket {...props} />;
    case 15:
      return <FilterLayout15GuidedFunnel {...props} />;
    case 16:
      return <FilterLayout16MultiPopoverChips {...props} />;
    case 17:
      return <FilterLayout17CuratedMoodPlaylists {...props} />;
    case 18:
      return <FilterLayout18FolderTreeCockpit {...props} />;
    case 19:
      return <FilterLayout19LuxuryHairlineCurtain {...props} />;
    case 20:
      return <FilterLayout20SoundboardMixingRack {...props} />;
    default:
      return null;
  }
}
