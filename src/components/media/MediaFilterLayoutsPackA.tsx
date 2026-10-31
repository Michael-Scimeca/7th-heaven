"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  Command,
  Film,
  Camera,
  Sparkles,
  Clock,
  Calendar,
  X,
  Check,
} from "lucide-react";
import { Toggle } from "@/components/Toggle";
import TopLayerDialog from "./TopLayerDialog";
import {
  ERA_OPTIONS,
  RUNTIME_OPTIONS,
  SORT_OPTIONS,
  type EraFilter,
  type FilterLayoutRendererProps,
  type MediaFormatFilter,
  type RuntimeFilter,
  type SortFilter,
} from "./MediaFilterLayoutsTypes";

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
/* #01 — SINGLE-ROW PRECISION COMMAND TOOLBAR                                 */
/* ========================================================================== */
function FilterLayout01CommandBar(props: FilterLayoutRendererProps) {
  const { state, onChange, onReset, videoItems, photoItems, activeFilterCount, children } = props;

  return (
    <div className="flex flex-col gap-6">
      <VaultTitleRow format={state.format} videoItems={videoItems} photoItems={photoItems} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 p-2.5">
        {/* Segmented Format Capsule */}
        <div className="flex items-center gap-1 rounded-full bg-black/60 p-1 border border-white/10">
          {(["all", "video", "photo"] as const).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => onChange({ format: fmt })}
              className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-bold uppercase transition-colors cursor-pointer ${
                state.format === fmt
                  ? "bg-amber-400 text-zinc-950"
                  : "text-zinc-300 hover:text-white"
              }`}
            >
              {fmt === "all" ? "All (70)" : fmt === "video" ? "Videos" : "Photos"}
            </button>
          ))}
        </div>

        {/* Inline Live Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <input
            type="search"
            value={state.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search songs, venues, years..."
            aria-label="Search vault items"
            className="w-full rounded-full border border-white/15 bg-black/60 pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
          />
        </div>

        {/* Era, Runtime, Sort Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter by era"
            value={state.era}
            onChange={(e) => onChange({ era: e.target.value as EraFilter })}
            className="rounded-full border border-white/15 bg-black/70 px-3 py-1.5 font-mono text-xs text-zinc-200 focus:border-purple-400 focus:outline-none cursor-pointer"
          >
            {ERA_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.short}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by runtime"
            value={state.runtime}
            onChange={(e) => onChange({ runtime: e.target.value as RuntimeFilter })}
            className="rounded-full border border-white/15 bg-black/70 px-3 py-1.5 font-mono text-xs text-zinc-200 focus:border-purple-400 focus:outline-none cursor-pointer"
          >
            {RUNTIME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Runtime: {opt.short}
              </option>
            ))}
          </select>

          <select
            aria-label="Sort vault items"
            value={state.sort}
            onChange={(e) => onChange({ sort: e.target.value as SortFilter })}
            className="rounded-full border border-white/15 bg-black/70 px-3 py-1.5 font-mono text-xs text-zinc-200 focus:border-purple-400 focus:outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 font-mono text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
            >
              <RotateCcw className="size-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

/* ========================================================================== */
/* #02 — LEFT FACETED SIDEBAR SPLIT (2-COLUMN MASTER SIDEBAR + RIGHT VAULT)   */
/* ========================================================================== */
function FilterLayout02LeftSidebarSplit(props: FilterLayoutRendererProps) {
  const {
    allCategories,
    state,
    onChange,
    onToggleCategory,
    onReset,
    videoItems,
    photoItems,
    activeFilterCount,
    children,
  } = props;

  return (
    <div className="flex flex-col gap-6">
      <VaultTitleRow format={state.format} videoItems={videoItems} photoItems={photoItems} />

      <div className="grid grid-cols-1 lg:grid-cols-[264px_minmax(0,1fr)] gap-6 items-start">
        <aside
          aria-label="Faceted Vault Filters"
          className="flex flex-col gap-4 rounded-[var(--radius-box)] border border-white/15 bg-black/50 p-4 lg:sticky lg:top-28"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-purple-300">
              Faceted Filters
            </span>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="font-mono text-xs font-bold text-amber-400 hover:underline cursor-pointer"
              >
                Reset ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
            <input
              type="search"
              value={state.search}
              onChange={(e) => onChange({ search: e.target.value })}
              placeholder="Filter keyword..."
              aria-label="Filter keyword"
              className="w-full rounded-lg border border-white/15 bg-white/5 pl-8 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
            />
          </div>

          {/* Media Type */}
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase text-zinc-400">Media Format</span>
            {(
              [
                { id: "all", label: "All Archive Media" },
                { id: "video", label: "Concert & Music Videos" },
                { id: "photo", label: "Archival Photography" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange({ format: opt.id })}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  state.format === opt.id
                    ? "bg-purple-600/30 border border-purple-400/50 text-white"
                    : "bg-white/5 text-zinc-300 hover:bg-white/10"
                }`}
              >
                <span>{opt.label}</span>
                {state.format === opt.id && <Check className="size-3.5 text-amber-400" />}
              </button>
            ))}
          </div>

          {/* Era Radios */}
          <div className="flex flex-col gap-1.5 border-t border-white/10 pt-3">
            <span className="font-mono text-xs uppercase text-zinc-400">Decade / Era</span>
            <div className="flex flex-wrap gap-1.5">
              {ERA_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ era: opt.value })}
                  className={`rounded-md px-2.5 py-1 font-mono text-xs transition-colors cursor-pointer ${
                    state.era === opt.value
                      ? "bg-amber-400 text-zinc-950 font-bold"
                      : "bg-white/5 text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  {opt.short}
                </button>
              ))}
            </div>
          </div>

          {/* Unified Toggle Switch */}
          <div className="border-t border-white/10 pt-3">
            <Toggle
              size="sm"
              checked={state.hdRecentOnly}
              onChange={(checked) => onChange({ hdRecentOnly: checked })}
              label="2023+ 4K Remasters Only"
            />
          </div>

          {/* Category Multi-Checklist */}
          <div className="flex flex-col gap-1.5 border-t border-white/10 pt-3">
            <span className="font-mono text-xs uppercase text-zinc-400">Collections</span>
            <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
              {allCategories.map((cat) => {
                const checked = props.selectedCategorySet.has(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onToggleCategory(cat.id)}
                    className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                      checked
                        ? "bg-amber-400/20 text-amber-300 font-bold"
                        : "text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    <span className="truncate">{cat.title}</span>
                    <span className="font-mono text-xs text-zinc-500 shrink-0">
                      {cat.itemsCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* #03 — RIGHT STUDIO INSPECTOR RAIL (LEFT VAULT + RIGHT BROADCAST CONSOLE)   */
/* ========================================================================== */
function FilterLayout03RightInspectorRail(props: FilterLayoutRendererProps) {
  const {
    allCategories,
    state,
    onChange,
    onReset,
    totalItems,
    videoItems,
    photoItems,
    activeFilterCount,
    onSelectRow,
    children,
  } = props;

  return (
    <div className="flex flex-col gap-6">
      <VaultTitleRow format={state.format} videoItems={videoItems} photoItems={photoItems} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6 items-start">
        <div className="min-w-0">{children}</div>

        <aside
          aria-label="Broadcast Filter Inspector"
          className="flex flex-col gap-4 rounded-[var(--radius-box)] border border-purple-500/30 bg-zinc-950/80 p-4 lg:sticky lg:top-28"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-amber-400">
              Inspector Rack
            </span>
            <span className="rounded-full bg-purple-500/20 px-2 py-0.5 font-mono text-xs font-bold text-purple-300">
              {totalItems} LIVE
            </span>
          </div>

          {/* Broadcast Signal Ratio Readout */}
          <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-white/5 p-1.5">
            {(
              [
                { id: "all", label: "ALL", count: videoItems + photoItems },
                { id: "video", label: "VID", count: videoItems },
                { id: "photo", label: "IMG", count: photoItems },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange({ format: tab.id })}
                className={`flex flex-col items-center rounded-lg py-2 font-mono transition-colors cursor-pointer ${
                  state.format === tab.id
                    ? "bg-purple-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span className="text-sm font-extrabold">{tab.count}</span>
                <span className="text-xs">{tab.label}</span>
              </button>
            ))}
          </div>

          <input
            type="search"
            value={state.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Quick search inspector..."
            aria-label="Quick search inspector"
            className="w-full rounded-lg border border-white/15 bg-black/70 px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
          />

          {/* 2x2 Era Pad Matrix */}
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase text-zinc-400">Era Matrix</span>
            <div className="grid grid-cols-2 gap-1.5">
              {ERA_OPTIONS.slice(1).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    onChange({ era: state.era === opt.value ? "all" : opt.value })
                  }
                  className={`rounded-lg border px-2.5 py-2 font-mono text-xs font-bold transition-colors cursor-pointer ${
                    state.era === opt.value
                      ? "border-amber-400 bg-amber-400/20 text-amber-300"
                      : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/25"
                  }`}
                >
                  {opt.short}
                </button>
              ))}
            </div>
          </div>

          {/* Runtime & Sort */}
          <div className="grid grid-cols-2 gap-2">
            <select
              aria-label="Runtime filter"
              value={state.runtime}
              onChange={(e) => onChange({ runtime: e.target.value as RuntimeFilter })}
              className="rounded-lg border border-white/15 bg-black/70 px-2.5 py-2 font-mono text-xs text-zinc-200 cursor-pointer"
            >
              {RUNTIME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.short}
                </option>
              ))}
            </select>
            <select
              aria-label="Sort order"
              value={state.sort}
              onChange={(e) => onChange({ sort: e.target.value as SortFilter })}
              className="rounded-lg border border-white/15 bg-black/70 px-2.5 py-2 font-mono text-xs text-zinc-200 cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <Toggle
            size="sm"
            checked={state.hdRecentOnly}
            onChange={(checked) => onChange({ hdRecentOnly: checked })}
            label="Lock to 2023+ Releases"
          />

          {/* Quick Jump Reels */}
          <div className="flex flex-col gap-1 border-t border-white/10 pt-3">
            <span className="font-mono text-xs uppercase text-zinc-400">Jump to Reel</span>
            <div className="flex flex-wrap gap-1">
              {allCategories.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectRow(c.id)}
                  className="rounded-md bg-white/5 hover:bg-purple-500/25 px-2 py-1 font-mono text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  {c.title.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="w-full rounded-lg border border-amber-400/40 bg-amber-500/15 py-2 font-mono text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
            >
              Reset All ({activeFilterCount})
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* #04 — NATURAL LANGUAGE "MAD-LIBS" EDITORIAL SENTENCE FILTER                */
/* ========================================================================== */
function FilterLayout04NaturalSentence(props: FilterLayoutRendererProps) {
  const { allCategories, state, onChange, onReset, totalItems, activeFilterCount, children } =
    props;

  const selectedCatId = state.categories[0] ?? "all";

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[var(--radius-box)] border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-zinc-950/70 to-black/80 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest text-purple-300">
            Conversational Vault Query • {totalItems} Matches
          </span>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="font-mono text-xs font-bold text-amber-400 hover:underline cursor-pointer"
            >
              Reset Sentence
            </button>
          )}
        </div>

        <p className="text-lg sm:text-2xl font-bold leading-relaxed text-zinc-300">
          <span>Show me </span>
          <label className="inline-flex items-center">
            <select
              aria-label="Choose media format"
              value={state.format}
              onChange={(e) =>
                onChange({ format: e.target.value as MediaFormatFilter, categories: [] })
              }
              className="appearance-none border-b-2 border-amber-400 bg-transparent px-1 font-extrabold text-amber-300 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-950 text-white">
                everything in the vault
              </option>
              <option value="video" className="bg-zinc-950 text-white">
                concert &amp; music videos
              </option>
              <option value="photo" className="bg-zinc-950 text-white">
                archival photography
              </option>
            </select>
          </label>
          <span> from </span>
          <label className="inline-flex items-center">
            <select
              aria-label="Choose era"
              value={state.era}
              onChange={(e) => onChange({ era: e.target.value as EraFilter })}
              className="appearance-none border-b-2 border-purple-400 bg-transparent px-1 font-extrabold text-purple-300 focus:outline-none cursor-pointer"
            >
              {ERA_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-zinc-950 text-white">
                  {o.label.toLowerCase()}
                </option>
              ))}
            </select>
          </label>
          <span> inside </span>
          <label className="inline-flex items-center">
            <select
              aria-label="Choose collection"
              value={selectedCatId}
              onChange={(e) =>
                onChange({
                  categories: e.target.value === "all" ? [] : [e.target.value],
                })
              }
              className="appearance-none border-b-2 border-amber-400 bg-transparent px-1 font-extrabold text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-950 text-white">
                all 11 collections
              </option>
              {allCategories.map((c) => (
                <option key={c.id} value={c.id} className="bg-zinc-950 text-white">
                  {c.title.toLowerCase()}
                </option>
              ))}
            </select>
          </label>
          <span> sorted by </span>
          <label className="inline-flex items-center">
            <select
              aria-label="Choose sort order"
              value={state.sort}
              onChange={(e) => onChange({ sort: e.target.value as SortFilter })}
              className="appearance-none border-b-2 border-purple-400 bg-transparent px-1 font-extrabold text-purple-300 focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-zinc-950 text-white">
                  {o.label.toLowerCase()}
                </option>
              ))}
            </select>
          </label>
          <span>.</span>
        </p>

        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
          <input
            type="search"
            value={state.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Optional: mention a song title or city..."
            aria-label="Optional keyword filter"
            className="w-full rounded-full border border-white/15 bg-black/50 pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {children}
    </div>
  );
}

/* ========================================================================== */
/* #05 — MINIMAL HEADER + SLIDE-OUT RIGHT OFF-CANVAS FILTER SHEET             */
/* ========================================================================== */
function FilterLayout05SlideOutDrawer(props: FilterLayoutRendererProps) {
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <VaultTitleRow
        format={state.format}
        videoItems={videoItems}
        photoItems={photoItems}
        rightSlot={
          <div className="flex flex-wrap items-center gap-2">
            {state.format !== "all" && (
              <button
                type="button"
                onClick={() => onChange({ format: "all" })}
                className="flex items-center gap-1 rounded-full bg-purple-500/25 border border-purple-400/40 px-3 py-1 font-mono text-xs text-purple-200 cursor-pointer"
              >
                <span>{state.format}</span>
                <X className="size-3" />
              </button>
            )}
            {state.era !== "all" && (
              <button
                type="button"
                onClick={() => onChange({ era: "all" })}
                className="flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-1 font-mono text-xs text-amber-200 cursor-pointer"
              >
                <span>{state.era}</span>
                <X className="size-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 rounded-full bg-amber-400 hover:bg-amber-300 px-4 py-2 font-mono text-xs font-extrabold uppercase tracking-wider text-zinc-950 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="size-3.5" />
              <span>Filter &amp; Sort</span>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-zinc-950 px-1.5 py-0.5 text-xs text-amber-300">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        }
      />

      {children}

      <TopLayerDialog
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ariaLabel="Off-Canvas Vault Filter Drawer"
        className="ml-auto mr-0 my-0 h-dvh max-h-dvh w-full max-w-md"
      >
        <div className="flex h-dvh w-full flex-col justify-between border-l border-white/20 bg-zinc-950 p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="font-mono text-xs uppercase text-amber-400">Filter Studio</span>
              <h3 className="uppercase text-white">Refine Media Vault</h3>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close filter drawer"
              className="flex size-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="drawer-search" className="font-mono text-xs uppercase text-zinc-400">
                Keyword Search
              </label>
              <input
                id="drawer-search"
                type="search"
                value={state.search}
                onChange={(e) => onChange({ search: e.target.value })}
                placeholder="Song title, city, venue..."
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs uppercase text-zinc-400">Format</span>
              <div className="grid grid-cols-3 gap-2">
                {(["all", "video", "photo"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => onChange({ format: fmt })}
                    className={`rounded-xl border py-2.5 font-mono text-xs font-bold uppercase cursor-pointer ${
                      state.format === fmt
                        ? "border-amber-400 bg-amber-400 text-zinc-950"
                        : "border-white/15 bg-white/5 text-zinc-300"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs uppercase text-zinc-400">Era</span>
              <div className="flex flex-wrap gap-2">
                {ERA_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange({ era: opt.value })}
                    className={`rounded-full border px-3 py-1.5 font-mono text-xs cursor-pointer ${
                      state.era === opt.value
                        ? "border-purple-400 bg-purple-600 text-white font-bold"
                        : "border-white/15 bg-white/5 text-zinc-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs uppercase text-zinc-400">
                Collections (Multi-Select)
              </span>
              <div className="flex flex-col gap-1.5">
                {allCategories.map((cat) => {
                  const selected = props.selectedCategorySet.has(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => onToggleCategory(cat.id)}
                      className={`flex items-center justify-between rounded-xl border px-3.5 py-2 text-xs font-semibold cursor-pointer ${
                        selected
                          ? "border-amber-400/60 bg-amber-400/15 text-amber-300"
                          : "border-white/10 bg-white/5 text-zinc-300"
                      }`}
                    >
                      <span>{cat.title}</span>
                      <span className="font-mono text-xs">{cat.itemsCount}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onReset}
              className="rounded-xl border border-white/20 px-4 py-3 font-mono text-xs font-bold uppercase text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-500 py-3 font-mono text-xs font-extrabold uppercase tracking-wider text-white transition-colors cursor-pointer"
            >
              View {totalItems} Results
            </button>
          </div>
        </div>
      </TopLayerDialog>
    </div>
  );
}

/* ========================================================================== */
/* #06 — COLLAPSIBLE 4-COLUMN MEGA-FILTER ACCORDION TRAY                      */
/* ========================================================================== */
function FilterLayout06MegaTray(props: FilterLayoutRendererProps) {
  const {
    allCategories,
    state,
    onChange,
    onToggleCategory,
    onReset,
    videoItems,
    photoItems,
    activeFilterCount,
    children,
  } = props;
  const [trayOpen, setTrayOpen] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <VaultTitleRow
        format={state.format}
        videoItems={videoItems}
        photoItems={photoItems}
        rightSlot={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
              <input
                type="search"
                value={state.search}
                onChange={(e) => onChange({ search: e.target.value })}
                placeholder="Search vault..."
                aria-label="Search vault"
                className="w-44 sm:w-56 rounded-full border border-white/15 bg-black/60 pl-8 pr-3 py-1.5 text-xs text-white focus:border-purple-400 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setTrayOpen((prev) => !prev)}
              aria-expanded={trayOpen}
              className="flex items-center gap-2 rounded-full border border-purple-400/50 bg-purple-600/25 hover:bg-purple-600/40 px-4 py-1.5 font-mono text-xs font-bold text-white transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="size-3.5 text-amber-400" />
              <span>Mega-Filter {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}</span>
              <ChevronDown
                className={`size-3.5 transition-transform ${trayOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        }
      />

      {trayOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 rounded-[var(--radius-box)] border border-white/15 bg-black/60 p-4">
          {/* Col 1: Format & Sort */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs font-bold uppercase text-amber-400">
              01 / Format &amp; Sort
            </span>
            <div className="flex flex-col gap-1.5">
              {(["all", "video", "photo"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => onChange({ format: fmt })}
                  className={`rounded-lg px-3 py-2 text-left font-mono text-xs font-bold uppercase cursor-pointer ${
                    state.format === fmt
                      ? "bg-amber-400 text-zinc-950"
                      : "bg-white/5 text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  {fmt === "all" ? "All Media (70)" : fmt === "video" ? "Videos (40)" : "Photos (30)"}
                </button>
              ))}
              <select
                aria-label="Sort order"
                value={state.sort}
                onChange={(e) => onChange({ sort: e.target.value as SortFilter })}
                className="rounded-lg border border-white/15 bg-zinc-900 px-3 py-2 font-mono text-xs text-white cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    Sort: {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Col 2: Era */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs font-bold uppercase text-amber-400">
              02 / Concert Era
            </span>
            <div className="flex flex-col gap-1.5">
              {ERA_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ era: opt.value })}
                  className={`rounded-lg px-3 py-1.5 text-left font-mono text-xs cursor-pointer ${
                    state.era === opt.value
                      ? "bg-purple-600 text-white font-bold"
                      : "bg-white/5 text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Col 3: Runtime & Toggle */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs font-bold uppercase text-amber-400">
              03 / Runtime &amp; Remaster
            </span>
            <div className="flex flex-col gap-1.5">
              {RUNTIME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ runtime: opt.value })}
                  className={`rounded-lg px-3 py-1.5 text-left font-mono text-xs cursor-pointer ${
                    state.runtime === opt.value
                      ? "bg-purple-600 text-white font-bold"
                      : "bg-white/5 text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <div className="pt-2">
                <Toggle
                  size="sm"
                  checked={state.hdRecentOnly}
                  onChange={(checked) => onChange({ hdRecentOnly: checked })}
                  label="2023+ 4K Cut"
                />
              </div>
            </div>
          </div>

          {/* Col 4: Collections */}
          <div className="flex flex-col justify-between gap-2">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs font-bold uppercase text-amber-400">
                04 / Collections
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {allCategories.map((c) => {
                  const active = props.selectedCategorySet.has(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onToggleCategory(c.id)}
                      className={`rounded-full px-2.5 py-1 font-mono text-xs cursor-pointer ${
                        active
                          ? "bg-amber-400 text-zinc-950 font-bold"
                          : "bg-white/10 text-zinc-300 hover:bg-white/20"
                      }`}
                    >
                      {c.title.split(" ").slice(0, 2).join(" ")}
                    </button>
                  );
                })}
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="rounded-lg border border-amber-400/40 bg-amber-500/15 py-1.5 font-mono text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
              >
                Clear All ({activeFilterCount})
              </button>
            )}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}

/* ========================================================================== */
/* #07 — VISUAL POSTER TILE CAROUSEL (APPLE TV / NETFLIX THUMBNAIL CARDS)     */
/* ========================================================================== */
function FilterLayout07VisualPosterCarousel(props: FilterLayoutRendererProps) {
  const {
    allCategories,
    state,
    onChange,
    onReset,
    videoItems,
    photoItems,
    onSelectRow,
    children,
  } = props;

  const activeCategory = state.categories[0] ?? "all";

  return (
    <div className="flex flex-col gap-6">
      <VaultTitleRow
        format={state.format}
        videoItems={videoItems}
        photoItems={photoItems}
        rightSlot={
          <div className="flex items-center gap-2">
            <input
              type="search"
              value={state.search}
              onChange={(e) => onChange({ search: e.target.value })}
              placeholder="Search titles..."
              aria-label="Search titles"
              className="w-44 rounded-full border border-white/15 bg-black/60 px-3.5 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
            {(["all", "video", "photo"] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => onChange({ format: fmt, categories: [] })}
                className={`rounded-full px-3 py-1.5 font-mono text-xs font-bold uppercase cursor-pointer ${
                  state.format === fmt
                    ? "bg-white text-zinc-950"
                    : "bg-white/10 text-zinc-300 hover:text-white"
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        }
      />

      {/* Visual Thumbnail Ribbon */}
      <div className="flex items-stretch gap-3 overflow-x-auto pb-2 no-scrollbar">
        <button
          type="button"
          onClick={onReset}
          className={`relative flex w-36 shrink-0 flex-col justify-end overflow-hidden rounded-xl border p-3 text-left aspect-video cursor-pointer ${
            activeCategory === "all"
              ? "border-amber-400 ring-2 ring-amber-400 bg-gradient-to-br from-purple-700 to-zinc-950"
              : "border-white/15 bg-zinc-900 hover:border-white/40"
          }`}
        >
          <Sparkles className="size-4 text-amber-300" />
          <span className="font-mono text-xs font-extrabold uppercase text-white">
            All 11 Reels
          </span>
          <span className="font-mono text-xs text-zinc-300">70 Items</span>
        </button>

        {allCategories.map((cat) => {
          const isSelected = activeCategory === cat.id;
          const cover = cat.items[0]?.src ?? "/images/hero/band-performance.webp";
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                onChange({ categories: isSelected ? [] : [cat.id] });
                onSelectRow(cat.id);
              }}
              className={`group relative flex w-44 shrink-0 flex-col justify-end overflow-hidden rounded-xl border p-3 text-left aspect-video cursor-pointer ${
                isSelected
                  ? "border-amber-400 ring-2 ring-amber-400"
                  : "border-white/15 hover:border-purple-400"
              }`}
            >
              <img
                src={cover}
                alt=""
                className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
              <span className="relative z-10 font-mono text-xs uppercase text-amber-300">
                {cat.categoryType} • {cat.itemsCount}
              </span>
              <span className="relative z-10 text-xs font-bold text-white line-clamp-1">
                {cat.title}
              </span>
            </button>
          );
        })}
      </div>

      {children}
    </div>
  );
}

/* ========================================================================== */
/* #08 — 40-YEAR CHRONOLOGICAL CONCERT TIMELINE SCRUBBER                      */
/* ========================================================================== */
function FilterLayout08TimelineScrubber(props: FilterLayoutRendererProps) {
  const { state, onChange, onReset, videoItems, photoItems, activeFilterCount, children } = props;

  const nodes: { era: EraFilter; yearRange: string; title: string }[] = [
    { era: "all", yearRange: "1985–2025", title: "All 40 Years" },
    { era: "classic", yearRange: "1985–2009", title: "Club & Vinyl Origins" },
    { era: "2010s", yearRange: "2010–2019", title: "Billboard Chart Era" },
    { era: "2020-2023", yearRange: "2020–2023", title: "Stadium Tour Surge" },
    { era: "2024-2025", yearRange: "2024–2025", title: "4K Arena & Cruise" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <VaultTitleRow format={state.format} videoItems={videoItems} photoItems={photoItems} />

      <div className="rounded-[var(--radius-box)] border border-white/15 bg-black/55 p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-purple-300">
            <Calendar className="size-3.5 text-amber-400" />
            <span>40-Year Chronological Timeline Filter</span>
          </span>
          <div className="flex items-center gap-1.5">
            {(["all", "video", "photo"] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => onChange({ format: fmt })}
                className={`rounded-full px-3 py-1 font-mono text-xs font-bold uppercase cursor-pointer ${
                  state.format === fmt
                    ? "bg-amber-400 text-zinc-950"
                    : "bg-white/10 text-zinc-300"
                }`}
              >
                {fmt}
              </button>
            ))}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-xs text-amber-300 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Connected Decade Nodes */}
        <div className="relative grid grid-cols-2 sm:grid-cols-5 gap-2">
          {nodes.map((node) => {
            const active = state.era === node.era;
            return (
              <button
                key={node.era}
                type="button"
                onClick={() => onChange({ era: node.era })}
                className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                  active
                    ? "border-amber-400 bg-gradient-to-br from-purple-900/60 to-amber-500/15"
                    : "border-white/10 bg-white/5 hover:border-purple-400/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2.5 rounded-full ${
                      active ? "bg-amber-400" : "bg-zinc-600"
                    }`}
                  />
                  <span className="font-mono text-xs font-extrabold text-amber-300">
                    {node.yearRange}
                  </span>
                </div>
                <span className="text-xs font-bold text-white">{node.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}

/* ========================================================================== */
/* #09 — SPOTLIGHT COMMAND PALETTE (CMD+K MODAL LAUNCHER)                     */
/* ========================================================================== */
function FilterLayout09SpotlightCommandPalette(props: FilterLayoutRendererProps) {
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
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <VaultTitleRow format={state.format} videoItems={videoItems} photoItems={photoItems} />

      {/* Centered Spotlight Command Trigger Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="flex flex-1 items-center justify-between rounded-2xl border border-purple-400/40 bg-black/70 hover:bg-black/90 px-4 py-3 text-left transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300">
            <Search className="size-4 text-purple-400" />
            <span>
              {state.search
                ? `Searching "${state.search}" (${totalItems} matches)`
                : `Launch Spotlight Filter Command Palette (${totalItems} items)...`}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 font-mono text-xs font-bold text-amber-300">
            <Command className="size-3" />
            <span>K</span>
          </span>
        </button>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-2xl border border-amber-400/40 bg-amber-500/15 px-4 py-3 font-mono text-xs font-bold text-amber-300 cursor-pointer"
          >
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {children}

      <TopLayerDialog
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        ariaLabel="Vault Spotlight Command Palette"
        className="m-auto w-full max-w-2xl rounded-[var(--radius-box)]"
      >
        <div className="flex max-h-[80dvh] w-full flex-col overflow-hidden rounded-[var(--radius-box)] border border-purple-400/40 bg-zinc-950 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
            <Search className="size-4 text-amber-400" />
            <input
              type="search"
              value={state.search}
              onChange={(e) => onChange({ search: e.target.value })}
              placeholder="Type a song, festival, city, or select a filter command..."
              aria-label="Command palette search"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setPaletteOpen(false)}
              className="rounded-lg bg-white/10 px-2.5 py-1 font-mono text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              ESC
            </button>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto p-4">
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-xs uppercase text-zinc-500">Quick Format</span>
              <div className="grid grid-cols-3 gap-2">
                {(["all", "video", "photo"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => onChange({ format: fmt })}
                    className={`rounded-xl border px-3 py-2 font-mono text-xs font-bold uppercase cursor-pointer ${
                      state.format === fmt
                        ? "border-amber-400 bg-amber-400 text-zinc-950"
                        : "border-white/10 bg-white/5 text-zinc-300"
                    }`}
                  >
                    {fmt === "all" ? "All Media" : fmt === "video" ? "Videos Only" : "Photos Only"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-xs uppercase text-zinc-500">Era Commands</span>
              <div className="flex flex-wrap gap-1.5">
                {ERA_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange({ era: opt.value })}
                    className={`rounded-lg px-3 py-1.5 font-mono text-xs cursor-pointer ${
                      state.era === opt.value
                        ? "bg-purple-600 text-white font-bold"
                        : "bg-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-xs uppercase text-zinc-500">Collection Reels</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {allCategories.map((c) => {
                  const active = props.selectedCategorySet.has(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onToggleCategory(c.id)}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs cursor-pointer ${
                        active
                          ? "bg-amber-400/20 border border-amber-400/50 text-amber-300 font-bold"
                          : "bg-white/5 text-zinc-300 hover:bg-white/10"
                      }`}
                    >
                      <span>{c.title}</span>
                      <span className="font-mono text-xs text-zinc-500">{c.itemsCount}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 bg-black/50 px-4 py-3 font-mono text-xs text-zinc-400">
            <span>{totalItems} matching vault items</span>
            <button
              type="button"
              onClick={() => setPaletteOpen(false)}
              className="rounded-lg bg-purple-600 px-3.5 py-1.5 font-bold text-white cursor-pointer"
            >
              Apply &amp; Close
            </button>
          </div>
        </div>
      </TopLayerDialog>
    </div>
  );
}

/* ========================================================================== */
/* #10 — 4-CARD BENTO KPI STAT-CARD MATRIX                                    */
/* ========================================================================== */
function FilterLayout10BentoStatMatrix(props: FilterLayoutRendererProps) {
  const { allCategories, state, onChange, onToggleCategory, onReset, totalItems, children } = props;

  return (
    <div className="flex flex-col gap-6">
      {/* 4 Clickable Bento KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={onReset}
          className={`flex flex-col justify-between gap-2 rounded-2xl border p-4 text-left transition-colors cursor-pointer ${
            state.format === "all" && state.era === "all" && state.runtime === "all"
              ? "border-amber-400 bg-amber-400/15"
              : "border-white/10 bg-white/5 hover:border-white/30"
          }`}
        >
          <Sparkles className="size-4 text-amber-400" />
          <div>
            <span className="block font-heading text-2xl font-extrabold text-white">70</span>
            <span className="font-mono text-xs uppercase text-zinc-300">Complete Archive</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange({ format: "video", era: "all" })}
          className={`flex flex-col justify-between gap-2 rounded-2xl border p-4 text-left transition-colors cursor-pointer ${
            state.format === "video" && state.runtime === "all"
              ? "border-purple-400 bg-purple-600/25"
              : "border-white/10 bg-white/5 hover:border-white/30"
          }`}
        >
          <Film className="size-4 text-purple-400" />
          <div>
            <span className="block font-heading text-2xl font-extrabold text-white">40</span>
            <span className="font-mono text-xs uppercase text-zinc-300">4K &amp; Live Videos</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange({ format: "photo", runtime: "all" })}
          className={`flex flex-col justify-between gap-2 rounded-2xl border p-4 text-left transition-colors cursor-pointer ${
            state.format === "photo"
              ? "border-amber-400 bg-amber-500/20"
              : "border-white/10 bg-white/5 hover:border-white/30"
          }`}
        >
          <Camera className="size-4 text-amber-300" />
          <div>
            <span className="block font-heading text-2xl font-extrabold text-white">30</span>
            <span className="font-mono text-xs uppercase text-zinc-300">Stage &amp; Fan Photos</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange({ format: "video", runtime: "long" })}
          className={`flex flex-col justify-between gap-2 rounded-2xl border p-4 text-left transition-colors cursor-pointer ${
            state.runtime === "long"
              ? "border-purple-400 bg-purple-600/25"
              : "border-white/10 bg-white/5 hover:border-white/30"
          }`}
        >
          <Clock className="size-4 text-purple-300" />
          <div>
            <span className="block font-heading text-2xl font-extrabold text-white">25m+</span>
            <span className="font-mono text-xs uppercase text-zinc-300">
              Full Shows &amp; 30-in-30
            </span>
          </div>
        </button>
      </div>

      {/* Sub-row: Search + Quick Collection Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {allCategories.slice(0, 7).map((c) => {
            const active = props.selectedCategorySet.has(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onToggleCategory(c.id)}
                className={`rounded-full px-3 py-1 font-mono text-xs cursor-pointer ${
                  active
                    ? "bg-white text-zinc-950 font-bold"
                    : "bg-white/5 text-zinc-300 hover:bg-white/15"
                }`}
              >
                {c.title}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-zinc-400">{totalItems} shown</span>
          <input
            type="search"
            value={state.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Filter..."
            aria-label="Filter items"
            className="w-40 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-xs text-white focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {children}
    </div>
  );
}

export function renderFilterLayoutsPackA(
  layoutId: number,
  props: FilterLayoutRendererProps
): React.ReactNode {
  switch (layoutId) {
    case 1:
      return <FilterLayout01CommandBar {...props} />;
    case 2:
      return <FilterLayout02LeftSidebarSplit {...props} />;
    case 3:
      return <FilterLayout03RightInspectorRail {...props} />;
    case 4:
      return <FilterLayout04NaturalSentence {...props} />;
    case 5:
      return <FilterLayout05SlideOutDrawer {...props} />;
    case 6:
      return <FilterLayout06MegaTray {...props} />;
    case 7:
      return <FilterLayout07VisualPosterCarousel {...props} />;
    case 8:
      return <FilterLayout08TimelineScrubber {...props} />;
    case 9:
      return <FilterLayout09SpotlightCommandPalette {...props} />;
    case 10:
      return <FilterLayout10BentoStatMatrix {...props} />;
    default:
      return null;
  }
}
