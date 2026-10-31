"use client";

import React, { useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import {
  ERA_OPTIONS,
  RUNTIME_OPTIONS,
  SORT_OPTIONS,
  type FilterLayoutRendererProps,
} from "./MediaFilterLayoutsTypes";
import { TbwaCircledDigits } from "./TbwaHeroOverlays";

const STAIRCASE_INDENTS = [
  "translate-x-0",
  "translate-x-1",
  "translate-x-2",
  "translate-x-3",
  "translate-x-4",
  "translate-x-5",
  "translate-x-6",
  "translate-x-7",
  "translate-x-8",
  "translate-x-9",
  "translate-x-10",
] as const;

/* -------------------------------------------------------------------------- */
/*    #21 — TBWA\HAKUHODO CHAMFERED VIEW ALL & DIAGONAL INDEX (CANONICAL)     */
/* -------------------------------------------------------------------------- */
function FilterLayout21TbwaCanonical(props: FilterLayoutRendererProps) {
  const {
    allCategories,
    state,
    selectedCategorySet,
    onChange,
    onToggleCategory,
    onReset,
    totalItems,
    videoItems,
    photoItems,
    activeFilterCount,
    children,
  } = props;

  const categoryTitleMap = new Map(allCategories.map((c) => [c.id, c.title]));
  const activeHeadlineTitle =
    state.categories.length === 1
      ? categoryTitleMap.get(state.categories[0]) ?? "ALL ARCHIVES"
      : state.categories.length > 1
        ? `${state.categories.length} COLLECTIONS`
        : "COMPLETE VAULT";

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden border border-white/15 bg-zinc-950/90 p-5 sm:p-7">
        {/* Top-Left Acid-Lime Architectural Wireframe */}
        <svg
          aria-hidden="true"
          viewBox="0 0 220 180"
          className="pointer-events-none absolute top-0 left-0 w-44 h-auto text-lime-300/45 select-none"
        >
          <line x1="18" y1="0" x2="18" y2="170" stroke="currentColor" strokeWidth="0.9" />
          <line x1="82" y1="0" x2="82" y2="135" stroke="currentColor" strokeWidth="0.9" />
          <line x1="0" y1="58" x2="180" y2="58" stroke="currentColor" strokeWidth="0.9" />
          <line x1="0" y1="0" x2="155" y2="175" stroke="currentColor" strokeWidth="0.9" />
          <line x1="82" y1="58" x2="18" y2="130" stroke="currentColor" strokeWidth="0.9" />
        </svg>

        {/* Top Bar: Backslash + Chamfered VIEW ALL (7)(0) + Format Polygons */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-extrabold text-white select-none">\</span>
            <span className="font-mono text-xs uppercase tracking-wider text-white/70">
              7TH HEAVEN • 40-YEAR ARCHIVE INDEX
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onReset}
              className={`clip-tbwa-pill inline-flex items-center gap-5 px-5 py-1.5 text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${
                state.format === "all" && activeFilterCount === 0
                  ? "bg-white text-zinc-950 hover:bg-lime-300"
                  : "bg-white/90 text-zinc-950 hover:bg-lime-300"
              }`}
            >
              <span>VIEW ALL</span>
              <TbwaCircledDigits value={totalItems} dark />
            </button>

            <button
              type="button"
              onClick={() => onChange({ format: state.format === "video" ? "all" : "video" })}
              aria-pressed={state.format === "video"}
              className={`clip-tbwa-pill inline-flex items-center gap-4 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${
                state.format === "video"
                  ? "bg-lime-300 text-zinc-950 hover:bg-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <span>VIDEOS</span>
              <TbwaCircledDigits value={videoItems} dark={state.format === "video"} />
            </button>

            <button
              type="button"
              onClick={() => onChange({ format: state.format === "photo" ? "all" : "photo" })}
              aria-pressed={state.format === "photo"}
              className={`clip-tbwa-pill inline-flex items-center gap-4 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${
                state.format === "photo"
                  ? "bg-lime-300 text-zinc-950 hover:bg-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <span>PHOTOS</span>
              <TbwaCircledDigits value={photoItems} dark={state.format === "photo"} />
            </button>
          </div>
        </div>

        {/* Main TBWA Split: Left Oversized Title + Swiss Controls | Right Diagonal 01–11 Staircase */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <div className="flex flex-col leading-none">
              <div className="text-2xl sm:text-4xl font-medium tracking-tight text-white">
                <span>7th</span>
                <span className="inline-block mx-1 px-1 border border-lime-300">H</span>
                <span>eaven Media</span>
              </div>
              <div className="pl-4 text-2xl sm:text-4xl font-medium tracking-tight text-white/90">
                Archival Directory
              </div>
              <div className="pl-8 pt-1 text-2xl sm:text-4xl font-semibold uppercase tracking-tight text-lime-300">
                {activeHeadlineTitle}
              </div>
            </div>

            {/* Swiss Metadata Filter Pairs (CATEGORY / DATE / RUNTIME / INFORMATION) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-5 text-xs">
              <div className="flex flex-col gap-2">
                <span className="font-mono uppercase text-white/55">DATE / ERA</span>
                <div className="flex flex-wrap gap-1.5">
                  {ERA_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onChange({ era: opt.value })}
                      className={`px-2.5 py-1 font-mono text-xs transition-colors cursor-pointer ${
                        state.era === opt.value
                          ? "bg-lime-300 text-zinc-950 font-bold"
                          : "bg-white/5 text-white/75 hover:bg-white/15 hover:text-white"
                      }`}
                    >
                      {opt.short}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-mono uppercase text-white/55">RUNTIME &amp; SORT</span>
                <div className="flex flex-wrap gap-1.5">
                  {RUNTIME_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onChange({ runtime: opt.value })}
                      className={`px-2.5 py-1 font-mono text-xs transition-colors cursor-pointer ${
                        state.runtime === opt.value
                          ? "bg-white text-zinc-950 font-bold"
                          : "bg-white/5 text-white/75 hover:bg-white/15 hover:text-white"
                      }`}
                    >
                      {opt.short}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                <span className="font-mono uppercase text-white/55 shrink-0">INFORMATION</span>
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-lime-300" />
                  <input
                    type="search"
                    value={state.search}
                    onChange={(e) => onChange({ search: e.target.value })}
                    placeholder="Search song titles, venues, festivals, eras..."
                    aria-label="Search vault catalog"
                    className="w-full border border-white/15 bg-black/70 pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-lime-300 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Diagonal-Stepped 01–11 Collection Staircase */}
          <div className="lg:col-span-5 flex flex-col gap-1 border-t lg:border-t-0 lg:border-l border-white/10 pt-5 lg:pt-0 lg:pl-6 overflow-x-clip">
            <span className="font-mono text-xs uppercase text-lime-300 pb-2">
              \ DIAGONAL COLLECTION INDEX (01–{String(allCategories.length).padStart(2, "0")})
            </span>
            {allCategories.map((cat, idx) => {
              const isSelected = selectedCategorySet.has(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onToggleCategory(cat.id)}
                  className={`flex items-center justify-between gap-4 py-1 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? "text-lime-300 font-bold"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <span
                    className={`font-mono ${STAIRCASE_INDENTS[idx] ?? "translate-x-8"}`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="uppercase tracking-wide text-right truncate">
                    {cat.title} ({cat.items.length})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Chamfered White MENU \\ Reset Bar */}
        {activeFilterCount > 0 && (
          <div className="relative z-10 flex justify-center pt-6">
            <button
              type="button"
              onClick={onReset}
              className="clip-tbwa-trapezoid inline-flex min-w-60 items-center justify-between gap-8 bg-white hover:bg-lime-300 px-6 py-2 text-xs font-extrabold uppercase tracking-wider text-zinc-950 transition-colors cursor-pointer"
            >
              <span>MENU • RESET ({activeFilterCount})</span>
              <span className="font-mono font-black">\\</span>
            </button>
          </div>
        )}
      </div>

      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*          #22 — TBWA SWISS CASE-STUDY METADATA LEDGER (DOSSIER)             */
/* -------------------------------------------------------------------------- */
function FilterLayout22TbwaSwissLedger(props: FilterLayoutRendererProps) {
  const {
    allCategories,
    state,
    selectedCategorySet,
    onChange,
    onToggleCategory,
    onReset,
    totalItems,
    activeFilterCount,
    children,
  } = props;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 border-y border-white/20 py-6 text-xs">
        {/* Col 1: \ CATEGORY */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-white/15 pb-2">
            <span className="font-mono font-bold uppercase text-lime-300">\ CATEGORY</span>
            <span className="font-mono text-zinc-400">
              {selectedCategorySet.size === 0 ? "ALL 11" : `${selectedCategorySet.size} ACTIVE`}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            {allCategories.map((cat, idx) => {
              const isSelected = selectedCategorySet.has(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onToggleCategory(cat.id)}
                  className={`flex items-center justify-between gap-2 py-0.5 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "text-lime-300 font-bold"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <span className="truncate">
                    {String(idx + 1).padStart(2, "0")}. {cat.title}
                  </span>
                  <span className="font-mono text-zinc-500">{cat.items.length}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Col 2: \ DATE & ERA */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <div className="border-b border-white/15 pb-2 font-mono font-bold uppercase text-lime-300">
            \ DATE &amp; ERA
          </div>
          <div className="flex flex-col gap-1">
            {ERA_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ era: opt.value })}
                className={`flex items-center justify-between py-0.5 text-left transition-colors cursor-pointer ${
                  state.era === opt.value
                    ? "text-lime-300 font-bold"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <span>{opt.label}</span>
                {state.era === opt.value && <span className="font-mono">\</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Col 3: \ CREDITS-STYLE RIGHT/LEFT SPECIFICATION PAIRS */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <div className="border-b border-white/15 pb-2 font-mono font-bold uppercase text-lime-300">
            \ SPECIFICATIONS
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 items-center">
            <span className="text-right text-white/60">Media Type</span>
            <div className="flex gap-1.5">
              {(["all", "video", "photo"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => onChange({ format: fmt })}
                  className={`uppercase font-mono transition-colors cursor-pointer ${
                    state.format === fmt
                      ? "text-lime-300 font-bold underline"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <span className="text-right text-white/60">Duration</span>
            <select
              value={state.runtime}
              onChange={(e) =>
                onChange({ runtime: e.target.value as FilterLayoutRendererProps["state"]["runtime"] })
              }
              aria-label="Filter by runtime"
              className="border border-white/15 bg-zinc-950 px-2 py-1 text-xs text-white focus:border-lime-300 focus:outline-none"
            >
              {RUNTIME_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.short}
                </option>
              ))}
            </select>

            <span className="text-right text-white/60">Sort Order</span>
            <select
              value={state.sort}
              onChange={(e) =>
                onChange({ sort: e.target.value as FilterLayoutRendererProps["state"]["sort"] })
              }
              aria-label="Sort media items"
              className="border border-white/15 bg-zinc-950 px-2 py-1 text-xs text-white focus:border-lime-300 focus:outline-none"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <span className="text-right text-white/60">2023+ 4K</span>
            <button
              type="button"
              onClick={() => onChange({ hdRecentOnly: !state.hdRecentOnly })}
              aria-pressed={state.hdRecentOnly}
              className={`text-left font-mono uppercase transition-colors cursor-pointer ${
                state.hdRecentOnly ? "text-lime-300 font-bold" : "text-white/70 hover:text-white"
              }`}
            >
              {state.hdRecentOnly ? "ENABLED \\" : "ALL YEARS"}
            </button>
          </div>
        </div>

        {/* Col 4: \ INFORMATION & QUERY */}
        <div className="lg:col-span-2 flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="border-b border-white/15 pb-2 font-mono font-bold uppercase text-lime-300">
              \ INFORMATION
            </div>
            <input
              type="search"
              value={state.search}
              onChange={(e) => onChange({ search: e.target.value })}
              placeholder="Keyword query..."
              aria-label="Keyword query"
              className="w-full border-b border-white/30 bg-transparent py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-lime-300 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={onReset}
            className="clip-tbwa-pill flex items-center justify-between gap-3 bg-white hover:bg-lime-300 px-4 py-2 text-xs font-extrabold uppercase text-zinc-950 transition-colors cursor-pointer"
          >
            <span>{activeFilterCount > 0 ? "RESET ALL" : "VIEW ALL"}</span>
            <TbwaCircledDigits value={totalItems} dark />
          </button>
        </div>
      </div>

      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*        #23 — TBWA ACID-LIME WIREFRAME BLUEPRINT MATRIX (WIREFRAME)         */
/* -------------------------------------------------------------------------- */
function FilterLayout23TbwaWireframe(props: FilterLayoutRendererProps) {
  const {
    allCategories,
    state,
    selectedCategorySet,
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
      <div className="relative overflow-hidden border border-lime-300/35 bg-zinc-950 p-5">
        <svg
          aria-hidden="true"
          viewBox="0 0 800 220"
          className="pointer-events-none absolute inset-0 size-full text-lime-300/20 select-none"
          preserveAspectRatio="none"
        >
          <line x1="0" y1="0" x2="260" y2="220" stroke="currentColor" strokeWidth="1" />
          <line x1="200" y1="0" x2="460" y2="220" stroke="currentColor" strokeWidth="1" />
          <line x1="540" y1="0" x2="800" y2="220" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="110" x2="800" y2="110" stroke="currentColor" strokeWidth="1" />
        </svg>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-lime-300/25">
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-lime-300 font-extrabold">\ WIREFRAME MATRIX</span>
            <span className="text-white/60">
              X:{videoItems}-VID • Y:{photoItems}-PHOTO
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={state.search}
              onChange={(e) => onChange({ search: e.target.value })}
              placeholder="\ Search coordinates..."
              aria-label="Search wireframe matrix"
              className="border border-lime-300/35 bg-black/80 px-3 py-1 font-mono text-xs text-white placeholder:text-zinc-500 focus:border-lime-300 focus:outline-none"
            />
            <button
              type="button"
              onClick={onReset}
              className="clip-tbwa-pill inline-flex items-center gap-3 bg-lime-300 hover:bg-white px-4 py-1 font-mono text-xs font-extrabold uppercase text-zinc-950 transition-colors cursor-pointer"
            >
              <span>{activeFilterCount > 0 ? `CLEAR (${activeFilterCount})` : "VIEW ALL"}</span>
              <TbwaCircledDigits value={totalItems} dark />
            </button>
          </div>
        </div>

        {/* 4-Column Wireframe Coordinate Cells */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-4">
          {allCategories.map((cat, idx) => {
            const isSelected = selectedCategorySet.has(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onToggleCategory(cat.id)}
                className={`relative flex items-center justify-between gap-2 border px-3 py-2.5 text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "border-lime-300 bg-lime-300/15 text-white"
                    : "border-white/15 bg-black/70 text-white/75 hover:border-lime-300/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs font-bold text-lime-300 shrink-0">
                    \{String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs font-semibold uppercase truncate">{cat.title}</span>
                </div>
                <TbwaCircledDigits value={cat.items.length} dark={false} />
              </button>
            );
          })}
        </div>

        {/* Bottom Coordinate Bar: Format + Era */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-4 mt-4 border-t border-lime-300/20 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            {(["all", "video", "photo"] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => onChange({ format: fmt })}
                className={`px-3 py-1 uppercase transition-colors cursor-pointer ${
                  state.format === fmt
                    ? "bg-lime-300 text-zinc-950 font-bold"
                    : "border border-white/15 bg-black/60 text-white/70 hover:text-white"
                }`}
              >
                \{fmt}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {ERA_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ era: opt.value })}
                className={`px-2.5 py-1 transition-colors cursor-pointer ${
                  state.era === opt.value
                    ? "border border-lime-300 text-lime-300 font-bold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {opt.short}
              </button>
            ))}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*        #24 — TBWA KINETIC MARQUEE & CHAMFERED CURTAIN (CURTAIN)            */
/* -------------------------------------------------------------------------- */
function FilterLayout24TbwaCurtain(props: FilterLayoutRendererProps) {
  const {
    allCategories,
    state,
    selectedCategorySet,
    onChange,
    onToggleCategory,
    onReset,
    totalItems,
    activeFilterCount,
    children,
  } = props;

  const [curtainOpen, setCurtainOpen] = useState(true);

  return (
    <div className="flex flex-col gap-5">
      <div className="border-y border-white/15 bg-zinc-950/90 py-4 px-4 flex flex-col gap-4">
        {/* Kinetic Marquee Header */}
        <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_6%,black_94%,transparent_100%)]">
          <div className="tbwa-marquee-track items-center gap-12 text-xl sm:text-3xl font-medium tracking-tight text-white select-none">
            <span className="shrink-0">
              \ 7th <span className="px-1 border border-lime-300">H</span>eaven Official Media &amp; Photography Vault
            </span>
            <span className="shrink-0 text-white/75">
              \ 40-Year Concert &amp; Studio Archive
            </span>
            <span className="shrink-0">
              \ 7th <span className="px-1 border border-lime-300">H</span>eaven Official Media &amp; Photography Vault
            </span>
            <span className="shrink-0 text-white/75">
              \ 40-Year Concert &amp; Studio Archive
            </span>
          </div>
        </div>

        {/* Centered Chamfered White MENU \\ Curtain Toggle */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setCurtainOpen((prev) => !prev)}
            aria-expanded={curtainOpen}
            className="clip-tbwa-trapezoid inline-flex min-w-64 items-center justify-between gap-8 bg-white hover:bg-lime-300 px-6 py-2 text-xs font-extrabold uppercase tracking-wider text-zinc-950 transition-colors cursor-pointer"
          >
            <span>{curtainOpen ? "MENU • CLOSE INDEX" : "MENU • OPEN FILTER INDEX"}</span>
            <span className="inline-flex items-center gap-2">
              <TbwaCircledDigits value={totalItems} dark />
              <span className="font-mono font-black">\\</span>
            </span>
          </button>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="clip-tbwa-pill inline-flex items-center gap-2 bg-lime-300 hover:bg-white px-4 py-2 font-mono text-xs font-extrabold uppercase text-zinc-950 transition-colors cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>RESET ({activeFilterCount})</span>
            </button>
          )}
        </div>

        {/* Unfolded Agency Index Curtain */}
        {curtainOpen && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-t border-white/15 pt-5 text-xs">
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {allCategories.map((cat, idx) => {
                const isSelected = selectedCategorySet.has(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onToggleCategory(cat.id)}
                    className={`flex items-center justify-between px-3 py-1.5 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-white text-zinc-950 font-bold"
                        : "bg-white/5 text-white/75 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    <span className="truncate">
                      \{String(idx + 1).padStart(2, "0")} {cat.title}
                    </span>
                    <span className="font-mono">{cat.items.length}</span>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-5 flex flex-col gap-3">
              <input
                type="search"
                value={state.search}
                onChange={(e) => onChange({ search: e.target.value })}
                placeholder="Search titles, venues, years..."
                aria-label="Search curtain catalog"
                className="w-full border border-white/20 bg-black px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-lime-300 focus:outline-none"
              />
              <div className="flex flex-wrap gap-1.5">
                {(["all", "video", "photo"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => onChange({ format: fmt })}
                    className={`clip-tbwa-pill px-4 py-1 font-mono uppercase transition-colors cursor-pointer ${
                      state.format === fmt
                        ? "bg-lime-300 text-zinc-950 font-bold"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
                {ERA_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange({ era: opt.value })}
                    className={`px-2.5 py-1 font-mono transition-colors cursor-pointer ${
                      state.era === opt.value
                        ? "bg-white text-zinc-950 font-bold"
                        : "bg-white/5 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    {opt.short}
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

/* -------------------------------------------------------------------------- */
/*       #25 — TBWA DIAGONAL STAIRCASE 2-COLUMN SPLIT (2-COL STAIRCASE)       */
/* -------------------------------------------------------------------------- */
function FilterLayout25TbwaStaircaseSplit(props: FilterLayoutRendererProps) {
  const {
    allCategories,
    state,
    selectedCategorySet,
    onChange,
    onToggleCategory,
    onReset,
    totalItems,
    activeFilterCount,
    children,
  } = props;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <aside
        aria-label="TBWA Diagonal Staircase Filter Rail"
        className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 flex flex-col gap-4 border border-white/15 bg-zinc-950/90 p-5 overflow-x-clip"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xl font-extrabold text-lime-300">\</span>
          <button
            type="button"
            onClick={onReset}
            className="clip-tbwa-pill inline-flex items-center gap-4 bg-white hover:bg-lime-300 px-4 py-1.5 text-xs font-extrabold uppercase text-zinc-950 transition-colors cursor-pointer"
          >
            <span>{activeFilterCount > 0 ? `RESET (${activeFilterCount})` : "VIEW ALL"}</span>
            <TbwaCircledDigits value={totalItems} dark />
          </button>
        </div>

        <input
          type="search"
          value={state.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="\ Filter titles..."
          aria-label="Filter titles in staircase rail"
          className="w-full border border-white/15 bg-black px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-lime-300 focus:outline-none"
        />

        <div className="grid grid-cols-3 gap-1 font-mono text-xs">
          {(["all", "video", "photo"] as const).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => onChange({ format: fmt })}
              className={`py-1.5 uppercase transition-colors cursor-pointer ${
                state.format === fmt
                  ? "bg-lime-300 text-zinc-950 font-bold"
                  : "bg-white/5 text-white/70 hover:bg-white/15 hover:text-white"
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>

        {/* Diagonal Staircase 01–11 */}
        <div className="flex flex-col gap-1 border-y border-white/10 py-3">
          {allCategories.map((cat, idx) => {
            const isSelected = selectedCategorySet.has(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onToggleCategory(cat.id)}
                className={`flex items-center justify-between gap-3 py-1 text-xs transition-colors cursor-pointer ${
                  isSelected ? "text-lime-300 font-bold" : "text-white/70 hover:text-white"
                }`}
              >
                <span className={`font-mono ${STAIRCASE_INDENTS[idx] ?? "translate-x-8"}`}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="uppercase text-right truncate">{cat.title}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-1">
          {ERA_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ era: opt.value })}
              className={`px-2 py-1 font-mono text-xs transition-colors cursor-pointer ${
                state.era === opt.value
                  ? "bg-white text-zinc-950 font-bold"
                  : "bg-white/5 text-white/65 hover:bg-white/15"
              }`}
            >
              {opt.short}
            </button>
          ))}
        </div>
      </aside>

      <div className="lg:col-span-8 xl:col-span-9 min-w-0">{children}</div>
    </div>
  );
}

export function renderFilterLayoutsPackC(
  layoutId: number,
  props: FilterLayoutRendererProps
): React.ReactNode | null {
  switch (layoutId) {
    case 21:
      return <FilterLayout21TbwaCanonical {...props} />;
    case 22:
      return <FilterLayout22TbwaSwissLedger {...props} />;
    case 23:
      return <FilterLayout23TbwaWireframe {...props} />;
    case 24:
      return <FilterLayout24TbwaCurtain {...props} />;
    case 25:
      return <FilterLayout25TbwaStaircaseSplit {...props} />;
    default:
      return null;
  }
}

