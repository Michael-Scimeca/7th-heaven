"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Disc3,
  SkipBack,
  SkipForward,
} from "lucide-react";
import SeventhButton from "@/components/SeventhButton";

/* ------------------------------------------------------------------ */
/*  Variants                                                           */
/* ------------------------------------------------------------------ */
export const PAGINATION_VARIANTS = [
  "classic",
  "pills",
  "text",
  "dots",
  "segmented",
  "counter",
  "progress",
  "load-more",
  "ellipsis",
  "jump",
  "split",
  "tracklist",
  "discs",
  "neon",
  "glass-dock",
  "range-cards",
  "slider",
  "stepper",
  "select",
  "editorial",
] as const;
export type PaginationVariant = (typeof PAGINATION_VARIANTS)[number];

export const PAGINATION_INFO: Record<PaginationVariant, { name: string; desc: string }> = {
  classic: { name: "Classic (current)", desc: "Summary line, big Prev / Next buttons, numbered squares in between." },
  pills: { name: "Gradient Pills", desc: "Round arrow buttons and pill numbers; the current page glows purple." },
  text: { name: "Text Links", desc: "No boxes at all — plain text links, the current page gets a gold underline." },
  dots: { name: "Carousel Dots", desc: "Dots like a slideshow; the active dot stretches into a gold bar." },
  segmented: { name: "Segmented Bar", desc: "One joined capsule; the current page is a solid white key." },
  counter: { name: "Big Counter", desc: "Just “02 / 05” between two large round arrows. Very calm." },
  progress: { name: "Segmented Progress", desc: "Each page is a bar segment you can click; filled up to where you are." },
  "load-more": { name: "Load More", desc: "One button that brings in the next 20, with a progress line and count." },
  ellipsis: { name: "First / Last + Ellipsis", desc: "Jump to ends, with “…” collapsing long page lists. Scales to 100+ pages." },
  jump: { name: "Go To Page", desc: "Type a page number and jump straight there, plus arrows." },
  split: { name: "Split Bar", desc: "Count on the left, compact controls on the right, in one soft panel." },
  tracklist: { name: "Tracklist", desc: "Pages as track numbers with skip-back / skip-forward transport buttons." },
  discs: { name: "Spinning Discs", desc: "Each page is a CD; the current one spins and glows gold." },
  neon: { name: "Neon Sign", desc: "Glowing fuchsia outlines, like a club sign." },
  "glass-dock": { name: "Glass Dock", desc: "Frosted floating dock holding the count, arrows and pages together." },
  "range-cards": { name: "Range Cards", desc: "Each page shows the video range it holds (1–20, 21–40…)." },
  slider: { name: "Scrubber", desc: "Drag a slider through the pages, like scrubbing a track." },
  stepper: { name: "Stepper", desc: "Numbered circles joined by a line that fills as you go." },
  select: { name: "Dropdown", desc: "“Page [3 ▾] of 5” with Previous / Next. Smallest footprint." },
  editorial: { name: "Editorial", desc: "Huge page number with long Prev / Next links pushed to the edges." },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
type Item = number | "gap-start" | "gap-end";

/** 1 … 4 5 6 … 20 — always shows first, last and `siblings` around the current page */
export function pageItems(page: number, total: number, siblings = 1): Item[] {
  const max = siblings * 2 + 5;
  if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
  const start = Math.max(2, page - siblings);
  const end = Math.min(total - 1, page + siblings);
  const items: Item[] = [1];
  if (start > 2) items.push("gap-start");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push("gap-end");
  items.push(total);
  return items;
}

const pad = (n: number) => String(n).padStart(2, "0");

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-ring)]";
const disabledCls = "disabled:cursor-not-allowed disabled:opacity-40";

function Gap() {
  return (
    <span aria-hidden="true" className="flex h-8 min-w-8 items-center justify-center font-mono text-xs text-white/40">
      …
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export interface MediaPaginationProps {
  variant?: PaginationVariant;
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** plural noun for the summary line, e.g. "videos" */
  label?: string;
  className?: string;
}

export default function MediaPagination({
  variant = "classic",
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  label = "videos",
  className = "",
}: MediaPaginationProps) {
  if (totalPages <= 1) return null;

  const go = (p: number) => {
    const next = Math.max(1, Math.min(totalPages, p));
    if (next !== page) onPageChange(next);
  };
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalItems);
  const isFirst = page <= 1;
  const isLast = page >= totalPages;
  const summary = `Showing ${first}–${last} of ${totalItems} ${label}`;
  const items = pageItems(page, totalPages);

  const body = (() => {
    switch (variant) {
      /* 1 ─────────────────────────────────────────────── */
      case "classic":
        return (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="font-mono text-xs uppercase tracking-wider text-white/60">
              {summary} · Page {page} of {totalPages}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <SeventhButton
                type="button"
                disabled={isFirst}
                onClick={() => go(page - 1)}
                icon={false}
                className={`px-6 py-2 text-xs sm:text-sm ${isFirst ? "pointer-events-none cursor-not-allowed opacity-40" : ""}`}
              >
                ◀ Previous {pageSize}
              </SeventhButton>
              <div className="flex items-center gap-2">
                {items.map((it) =>
                  typeof it === "number" ? (
                    <button
                      key={it}
                      type="button"
                      aria-current={it === page ? "page" : undefined}
                      onClick={() => go(it)}
                      className={`h-8 min-w-8 cursor-pointer px-2 font-mono text-xs font-bold transition-colors ${focusRing} ${
                        it === page
                          ? "border border-purple-400 bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                          : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/15 hover:text-white"
                      }`}
                    >
                      {it}
                    </button>
                  ) : (
                    <Gap key={it} />
                  ),
                )}
              </div>
              <SeventhButton
                type="button"
                disabled={isLast}
                onClick={() => go(page + 1)}
                icon={false}
                className={`px-6 py-2 text-xs sm:text-sm ${isLast ? "pointer-events-none cursor-not-allowed opacity-40" : ""}`}
              >
                Next {pageSize} {label} ▶
              </SeventhButton>
            </div>
          </div>
        );

      /* 2 ─────────────────────────────────────────────── */
      case "pills": {
        const round = `flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/5 text-white transition-[background-color,transform] duration-150 hover:scale-105 hover:bg-white/15 active:scale-95 ${focusRing} ${disabledCls}`;
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button type="button" aria-label="Previous page" disabled={isFirst} onClick={() => go(page - 1)} className={round}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              {items.map((it) =>
                typeof it === "number" ? (
                  <button
                    key={it}
                    type="button"
                    aria-current={it === page ? "page" : undefined}
                    onClick={() => go(it)}
                    className={`h-10 min-w-10 cursor-pointer rounded-full px-4 text-sm font-semibold transition-all duration-200 ${focusRing} ${
                      it === page
                        ? "bg-gradient-to-r from-[var(--color-accent-bold)] to-[var(--color-accent)] text-white shadow-[0_0_24px_rgba(168,85,247,0.55)]"
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {it}
                  </button>
                ) : (
                  <Gap key={it} />
                ),
              )}
              <button type="button" aria-label="Next page" disabled={isLast} onClick={() => go(page + 1)} className={round}>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-white/50">{summary}</p>
          </div>
        );
      }

      /* 3 ─────────────────────────────────────────────── */
      case "text": {
        const link = `cursor-pointer text-sm font-semibold text-white/70 transition-colors hover:text-white ${focusRing} ${disabledCls}`;
        return (
          <div className="flex flex-wrap items-center justify-center gap-8">
            <button type="button" disabled={isFirst} onClick={() => go(page - 1)} className={link}>
              ← Previous
            </button>
            <div className="flex items-center gap-4">
              {items.map((it) =>
                typeof it === "number" ? (
                  <button
                    key={it}
                    type="button"
                    aria-current={it === page ? "page" : undefined}
                    onClick={() => go(it)}
                    className={`cursor-pointer text-sm transition-colors ${focusRing} ${
                      it === page
                        ? "font-bold text-white underline decoration-[var(--color-action)] decoration-2 underline-offset-8"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    {it}
                  </button>
                ) : (
                  <Gap key={it} />
                ),
              )}
            </div>
            <button type="button" disabled={isLast} onClick={() => go(page + 1)} className={link}>
              Next →
            </button>
          </div>
        );
      }

      /* 4 ─────────────────────────────────────────────── */
      case "dots": {
        const arrow = `flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-[background-color,transform] duration-200 hover:bg-white/20 hover:scale-105 active:scale-95 ${focusRing} ${disabledCls}`;
        return (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-4">
              <button type="button" aria-label="Previous page" disabled={isFirst} onClick={() => go(page - 1)} className={arrow}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`Page ${n}`}
                    aria-current={n === page ? "page" : undefined}
                    onClick={() => go(n)}
                    className={`group relative flex h-8 items-center justify-center px-1 cursor-pointer ${focusRing}`}
                  >
                    <span
                      className={`h-2 rounded-full transition-all duration-300 ${
                        n === page
                          ? "w-8 bg-[#f2efa3] shadow-[0_0_14px_rgba(242,239,163,0.6)]"
                          : "w-2 bg-white/30 group-hover:bg-white/60"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <button type="button" aria-label="Next page" disabled={isLast} onClick={() => go(page + 1)} className={arrow}>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <p className="font-mono text-xs uppercase tracking-widest text-white/60">
              Page {page} of {totalPages}
            </p>
          </div>
        );
      }

      /* 5 ─────────────────────────────────────────────── */
      case "segmented": {
        const seg = `flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors ${focusRing} ${disabledCls}`;
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="inline-flex flex-wrap items-center justify-center gap-1 rounded-full bg-black/40 p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
              <button type="button" aria-label="Previous page" disabled={isFirst} onClick={() => go(page - 1)} className={`${seg} text-white/70 hover:text-white`}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              {items.map((it) =>
                typeof it === "number" ? (
                  <button
                    key={it}
                    type="button"
                    aria-current={it === page ? "page" : undefined}
                    onClick={() => go(it)}
                    className={`${seg} ${it === page ? "bg-white text-black shadow" : "text-white/60 hover:text-white"}`}
                  >
                    {it}
                  </button>
                ) : (
                  <Gap key={it} />
                ),
              )}
              <button type="button" aria-label="Next page" disabled={isLast} onClick={() => go(page + 1)} className={`${seg} text-white/70 hover:text-white`}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-white/50">{summary}</p>
          </div>
        );
      }

      /* 6 ─────────────────────────────────────────────── */
      case "counter": {
        const big = `flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-[background-color,transform] duration-150 hover:scale-105 hover:bg-white/20 active:scale-95 ${focusRing} ${disabledCls}`;
        return (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-8">
              <button type="button" aria-label="Previous page" disabled={isFirst} onClick={() => go(page - 1)} className={big}>
                <ChevronLeft className="h-6 w-6" />
              </button>
              <p className="font-mono text-h4 tabular-nums text-white" aria-live="polite">
                {pad(page)} <span className="text-white/30">/ {pad(totalPages)}</span>
              </p>
              <button type="button" aria-label="Next page" disabled={isLast} onClick={() => go(page + 1)} className={big}>
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
            <p className="text-xs text-white/50">{summary}</p>
          </div>
        );
      }

      /* 7 ─────────────────────────────────────────────── */
      case "progress": {
        const link = `flex cursor-pointer items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-white ${focusRing} ${disabledCls}`;
        return (
          <div className="flex w-full max-w-2xl flex-col gap-4">
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-white/50">
              <span>{summary}</span>
              <span>
                Page {page} / {totalPages}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button type="button" disabled={isFirst} onClick={() => go(page - 1)} className={link}>
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <div className="flex flex-1 items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`Page ${n}`}
                    aria-current={n === page ? "page" : undefined}
                    onClick={() => go(n)}
                    className={`h-2 flex-1 cursor-pointer rounded-full transition-colors duration-300 ${focusRing} ${
                      n <= page
                        ? "bg-gradient-to-r from-[var(--color-accent-bold)] to-[var(--color-accent)]"
                        : "bg-white/10 hover:bg-white/25"
                    }`}
                  />
                ))}
              </div>
              <button type="button" disabled={isLast} onClick={() => go(page + 1)} className={link}>
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      }

      /* 8 ─────────────────────────────────────────────── */
      case "load-more":
        return (
          <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
            <p className="text-sm text-white/70">
              You&apos;ve seen <span className="font-semibold text-white">{last}</span> of {totalItems} {label}
            </p>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full w-[var(--pct)] rounded-full bg-[var(--color-action)] transition-[width] duration-500"
                style={{ "--pct": `${(last / totalItems) * 100}%` } as React.CSSProperties}
              />
            </div>
            {isLast ? (
              <p className="text-sm font-semibold text-white">You&apos;ve reached the end 🎸</p>
            ) : (
              <SeventhButton type="button" onClick={() => go(page + 1)} icon={false} className="px-8 py-2 text-sm">
                Load {Math.min(pageSize, totalItems - last)} more
              </SeventhButton>
            )}
            {!isFirst && (
              <button type="button" onClick={() => go(1)} className={`cursor-pointer text-xs text-white/50 underline hover:text-white ${focusRing}`}>
                Back to start
              </button>
            )}
          </div>
        );

      /* 9 ─────────────────────────────────────────────── */
      case "ellipsis": {
        const chip = `flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-full px-2 text-xs font-semibold transition-colors ${focusRing} ${disabledCls}`;
        const idle = "bg-white/5 text-white/70 hover:bg-white/15 hover:text-white";
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button type="button" aria-label="First page" disabled={isFirst} onClick={() => go(1)} className={`${chip} ${idle}`}>
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Previous page" disabled={isFirst} onClick={() => go(page - 1)} className={`${chip} ${idle}`}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              {pageItems(page, totalPages, 1).map((it) =>
                typeof it === "number" ? (
                  <button
                    key={it}
                    type="button"
                    aria-current={it === page ? "page" : undefined}
                    onClick={() => go(it)}
                    className={`${chip} ${it === page ? "bg-[var(--color-accent-bold)] text-white ring-1 ring-[var(--color-accent)]" : idle}`}
                  >
                    {it}
                  </button>
                ) : (
                  <Gap key={it} />
                ),
              )}
              <button type="button" aria-label="Next page" disabled={isLast} onClick={() => go(page + 1)} className={`${chip} ${idle}`}>
                <ChevronRight className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Last page" disabled={isLast} onClick={() => go(totalPages)} className={`${chip} ${idle}`}>
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-white/50">{summary}</p>
          </div>
        );
      }

      /* 10 ────────────────────────────────────────────── */
      case "jump":
        return <JumpPagination page={page} totalPages={totalPages} go={go} summary={summary} isFirst={isFirst} isLast={isLast} />;

      /* 11 ────────────────────────────────────────────── */
      case "split": {
        const chip = `flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-full px-2 text-xs font-semibold transition-colors ${focusRing} ${disabledCls}`;
        return (
          <div className="flex w-full flex-col items-center justify-between gap-4 rounded-[var(--radius-box)] bg-white/5 px-6 py-4 sm:flex-row">
            <p className="text-sm text-white/70">
              <span className="font-semibold text-white">
                {first}–{last}
              </span>{" "}
              of {totalItems} {label}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" aria-label="Previous page" disabled={isFirst} onClick={() => go(page - 1)} className={`${chip} text-white/70 hover:bg-white/10`}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              {items.map((it) =>
                typeof it === "number" ? (
                  <button
                    key={it}
                    type="button"
                    aria-current={it === page ? "page" : undefined}
                    onClick={() => go(it)}
                    className={`${chip} ${it === page ? "bg-white text-black" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
                  >
                    {it}
                  </button>
                ) : (
                  <Gap key={it} />
                ),
              )}
              <button type="button" aria-label="Next page" disabled={isLast} onClick={() => go(page + 1)} className={`${chip} text-white/70 hover:bg-white/10`}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      }

      /* 12 ────────────────────────────────────────────── */
      case "tracklist": {
        const transport = `flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white ${focusRing} ${disabledCls}`;
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button type="button" aria-label="Previous page" disabled={isFirst} onClick={() => go(page - 1)} className={transport}>
                <SkipBack className="h-5 w-5 fill-current" />
              </button>
              <div className="flex flex-wrap items-center gap-4 font-mono text-sm">
                {items.map((it) =>
                  typeof it === "number" ? (
                    <button
                      key={it}
                      type="button"
                      aria-label={`Page ${it}`}
                      aria-current={it === page ? "page" : undefined}
                      onClick={() => go(it)}
                      className={`flex cursor-pointer items-center gap-1 tabular-nums transition-colors ${focusRing} ${
                        it === page ? "text-[var(--color-action)]" : "text-white/40 hover:text-white"
                      }`}
                    >
                      {it === page && <span aria-hidden="true">▶</span>}
                      {pad(it)}
                    </button>
                  ) : (
                    <Gap key={it} />
                  ),
                )}
              </div>
              <button type="button" aria-label="Next page" disabled={isLast} onClick={() => go(page + 1)} className={transport}>
                <SkipForward className="h-5 w-5 fill-current" />
              </button>
            </div>
            <p className="font-mono text-xs uppercase tracking-wider text-white/40">
              Track {pad(page)} · {summary}
            </p>
          </div>
        );
      }

      /* 13 ────────────────────────────────────────────── */
      case "discs":
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-end justify-center gap-4">
              {items.map((it) =>
                typeof it === "number" ? (
                  <button
                    key={it}
                    type="button"
                    aria-label={`Page ${it}`}
                    aria-current={it === page ? "page" : undefined}
                    onClick={() => go(it)}
                    className={`group flex cursor-pointer flex-col items-center gap-1 ${focusRing}`}
                  >
                    <Disc3
                      className={`transition-all duration-300 ${
                        it === page
                          ? "h-10 w-10 animate-[spin_2.4s_linear_infinite] text-[var(--color-action)] drop-shadow-[0_0_10px_rgba(245,185,66,0.6)] motion-reduce:animate-none"
                          : "h-8 w-8 text-white/40 group-hover:text-white/80"
                      }`}
                    />
                    <span className={`font-mono text-xs ${it === page ? "text-white" : "text-white/40"}`}>{it}</span>
                  </button>
                ) : (
                  <Gap key={it} />
                ),
              )}
            </div>
            <p className="text-xs text-white/50">{summary}</p>
          </div>
        );

      /* 14 ────────────────────────────────────────────── */
      case "neon": {
        const base = `flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-full border px-4 text-sm font-semibold transition-all duration-200 ${focusRing} ${disabledCls}`;
        const idle = "border-fuchsia-400/30 text-fuchsia-200/70 hover:border-fuchsia-300/70 hover:text-fuchsia-100";
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button type="button" disabled={isFirst} onClick={() => go(page - 1)} className={`${base} ${idle}`}>
                ‹ Prev
              </button>
              {items.map((it) =>
                typeof it === "number" ? (
                  <button
                    key={it}
                    type="button"
                    aria-current={it === page ? "page" : undefined}
                    onClick={() => go(it)}
                    className={`${base} ${
                      it === page
                        ? "border-fuchsia-300 text-white shadow-[0_0_16px_rgba(232,121,249,0.7),inset_0_0_10px_rgba(232,121,249,0.4)]"
                        : idle
                    }`}
                  >
                    {it}
                  </button>
                ) : (
                  <Gap key={it} />
                ),
              )}
              <button type="button" disabled={isLast} onClick={() => go(page + 1)} className={`${base} ${idle}`}>
                Next ›
              </button>
            </div>
            <p className="text-xs text-fuchsia-200/60">{summary}</p>
          </div>
        );
      }

      /* 15 ────────────────────────────────────────────── */
      case "glass-dock": {
        const round = `flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 ${focusRing} ${disabledCls}`;
        return (
          <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-white/10 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.45)] ring-1 ring-inset ring-white/15 backdrop-blur-xl">
            <span className="rounded-full bg-black/30 px-4 py-2 font-mono text-xs text-white/70">
              {first}–{last} / {totalItems}
            </span>
            <button type="button" aria-label="Previous page" disabled={isFirst} onClick={() => go(page - 1)} className={round}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            {items.map((it) =>
              typeof it === "number" ? (
                <button
                  key={it}
                  type="button"
                  aria-current={it === page ? "page" : undefined}
                  onClick={() => go(it)}
                  className={`h-10 min-w-10 cursor-pointer rounded-full px-2 text-sm font-semibold transition-colors ${focusRing} ${
                    it === page ? "bg-white/90 text-black" : "text-white/70 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  {it}
                </button>
              ) : (
                <Gap key={it} />
              ),
            )}
            <button type="button" aria-label="Next page" disabled={isLast} onClick={() => go(page + 1)} className={round}>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        );
      }

      /* 16 ────────────────────────────────────────────── */
      case "range-cards":
        return (
          <div className="flex w-full flex-col items-center gap-4">
            <div className="flex w-full max-w-full justify-start gap-2 overflow-x-auto pb-2 sm:justify-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
                const a = (n - 1) * pageSize + 1;
                const b = Math.min(n * pageSize, totalItems);
                return (
                  <button
                    key={n}
                    type="button"
                    aria-label={`Page ${n}, ${label} ${a} to ${b}`}
                    aria-current={n === page ? "page" : undefined}
                    onClick={() => go(n)}
                    className={`flex shrink-0 cursor-pointer flex-col items-start gap-1 rounded-[var(--radius-box)] px-4 py-2 text-left transition-all duration-200 ${focusRing} ${
                      n === page
                        ? "bg-gradient-to-br from-[var(--color-accent-bold)] to-[var(--color-accent)] text-white shadow-[0_8px_24px_rgba(168,85,247,0.4)]"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="font-mono text-xs uppercase tracking-wider opacity-70">Page {n}</span>
                    <span className="text-sm font-semibold tabular-nums">
                      {a}–{b}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      /* 17 ────────────────────────────────────────────── */
      case "slider": {
        const arrow = `flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 ${focusRing} ${disabledCls}`;
        return (
          <div className="flex w-full max-w-xl flex-col items-center gap-4">
            <div className="flex w-full items-center gap-4">
              <button type="button" aria-label="Previous page" disabled={isFirst} onClick={() => go(page - 1)} className={arrow}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <input
                type="range"
                min={1}
                max={totalPages}
                step={1}
                value={page}
                onChange={(e) => go(Number(e.target.value))}
                aria-label="Page"
                className={`w-full cursor-pointer accent-[var(--color-action)] ${focusRing}`}
              />
              <button type="button" aria-label="Next page" disabled={isLast} onClick={() => go(page + 1)} className={arrow}>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <p className="font-mono text-xs uppercase tracking-wider text-white/50">
              Page {page} of {totalPages} · {first}–{last} of {totalItems}
            </p>
          </div>
        );
      }

      /* 18 ────────────────────────────────────────────── */
      case "stepper":
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center">
              {items.map((it, idx) => (
                <React.Fragment key={String(it)}>
                  {idx > 0 && (
                    <span
                      aria-hidden="true"
                      className={`h-px w-8 transition-colors duration-300 ${
                        typeof it === "number" && it <= page ? "bg-[var(--color-action)]" : "bg-white/15"
                      }`}
                    />
                  )}
                  {typeof it === "number" ? (
                    <button
                      type="button"
                      aria-label={`Page ${it}`}
                      aria-current={it === page ? "page" : undefined}
                      onClick={() => go(it)}
                      className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${focusRing} ${
                        it === page
                          ? "scale-110 bg-[var(--color-action)] text-black shadow-[0_0_16px_rgba(245,185,66,0.5)]"
                          : it < page
                            ? "bg-[var(--color-action-soft)] text-[var(--color-action)]"
                            : "bg-white/5 text-white/50 hover:bg-white/15 hover:text-white"
                      }`}
                    >
                      {it}
                    </button>
                  ) : (
                    <Gap />
                  )}
                </React.Fragment>
              ))}
            </div>
            <p className="text-xs text-white/50">{summary}</p>
          </div>
        );

      /* 19 ────────────────────────────────────────────── */
      case "select": {
        const link = `flex cursor-pointer items-center gap-1 text-sm font-semibold text-white/70 transition-colors hover:text-white ${focusRing} ${disabledCls}`;
        return (
          <div className="flex flex-wrap items-center justify-center gap-6">
            <button type="button" disabled={isFirst} onClick={() => go(page - 1)} className={link}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <label className="flex items-center gap-2 text-sm text-white/70">
              Page
              <select
                value={page}
                onChange={(e) => go(Number(e.target.value))}
                className={`cursor-pointer rounded-full bg-black/40 px-4 py-2 text-sm font-semibold text-white ${focusRing}`}
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              of {totalPages}
            </label>
            <button type="button" disabled={isLast} onClick={() => go(page + 1)} className={link}>
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        );
      }

      /* 20 ────────────────────────────────────────────── */
      case "editorial": {
        const link = `group flex cursor-pointer items-center gap-4 font-mono text-xs uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white ${focusRing} ${disabledCls}`;
        return (
          <div className="flex w-full items-center justify-between gap-4">
            <button type="button" disabled={isFirst} onClick={() => go(page - 1)} className={link}>
              <span aria-hidden="true" className="h-px w-8 bg-current transition-[width] duration-300 group-hover:w-16" />
              Prev
            </button>
            <div className="flex flex-col items-center">
              <p className="font-display text-display leading-none tabular-nums text-white" aria-live="polite">
                {pad(page)}
              </p>
              <p className="font-mono text-xs uppercase tracking-wider text-white/40">
                of {pad(totalPages)} · {first}–{last}
              </p>
            </div>
            <button type="button" disabled={isLast} onClick={() => go(page + 1)} className={link}>
              Next
              <span aria-hidden="true" className="h-px w-8 bg-current transition-[width] duration-300 group-hover:w-16" />
            </button>
          </div>
        );
      }
    }
  })();

  return (
    <nav aria-label="Pagination" className={`flex w-full justify-center ${className}`}>
      {body}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  "Go to page" needs its own draft state                             */
/* ------------------------------------------------------------------ */
function JumpPagination({
  page,
  totalPages,
  go,
  summary,
  isFirst,
  isLast,
}: {
  page: number;
  totalPages: number;
  go: (p: number) => void;
  summary: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [draft, setDraft] = useState("");
  const arrow = `flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 ${focusRing} ${disabledCls}`;
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button type="button" aria-label="Previous page" disabled={isFirst} onClick={() => go(page - 1)} className={arrow}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <form
          className="flex items-center gap-2 text-sm text-white/70"
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(draft);
            if (Number.isFinite(n) && n > 0) go(Math.round(n));
            setDraft("");
          }}
        >
          <label htmlFor="pagination-jump">Page</label>
          <input
            id="pagination-jump"
            inputMode="numeric"
            value={draft}
            placeholder={String(page)}
            onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
            className={`w-16 rounded-full bg-black/40 px-4 py-2 text-center text-sm font-semibold text-white placeholder:text-white ${focusRing}`}
          />
          <span>of {totalPages}</span>
          <button
            type="submit"
            className={`cursor-pointer rounded-full bg-[var(--color-action)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-[var(--color-action-hover)] ${focusRing}`}
          >
            Go
          </button>
        </form>
        <button type="button" aria-label="Next page" disabled={isLast} onClick={() => go(page + 1)} className={arrow}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <p className="text-xs text-white/50">{summary}</p>
    </div>
  );
}
