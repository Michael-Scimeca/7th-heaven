"use client";

/**
 * MediaFilterDrawer
 * Slide-in "Filters" panel modelled on fluxtheory.in/shop:
 * frosted-glass panel from the right (same treatment as MemberFactSheetDrawer),
 * grouped radio facets, a dual-handle
 * year range that re-scopes to the current selection, and a sticky footer
 * with "Clear all" + "Show N items". Filters apply live.
 *
 * Uses the site's global purple radios, Anton headings, Inter body and the
 * shared <Button> primary/secondary variants.
 */

import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion, type Variants } from "framer-motion";
import { X, Search } from "lucide-react";
import { useScrollLock } from "@/lib/useScrollLock";
import { Button } from "@/components/Button";

export interface MediaFilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface MediaFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Element to return focus to when the drawer closes (the Filters trigger). */
  returnFocusRef?: RefObject<HTMLElement | null>;

  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  sortOptions?: MediaFilterOption[];
  sort?: string;
  onSortChange?: (value: string) => void;

  categoryLabel?: string;
  categoryOptions: MediaFilterOption[];
  category: string;
  onCategoryChange: (value: string) => void;

  mediaTypeOptions: MediaFilterOption[];
  mediaType: string;
  onMediaTypeChange: (value: string) => void;

  /** Optional running-time facet (e.g. Short / Mid / Full shows). Empty array hides it. */
  lengthOptions?: MediaFilterOption[];
  length?: string;
  onLengthChange?: (value: string) => void;

  /** Min/max year of items matching the current category + media type. Null hides the group. */
  yearBounds: [number, number] | null;
  /** Effective (already clamped) selected range. */
  yearRange: [number, number] | null;
  onYearRangeChange: (range: [number, number]) => void;

  resultCount: number;
  onClearAll: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/* Symmetrical drawer transition:
   Transition in: panel slides in from 100% to 0, backdrop fades 0 to 1.
   Transition out: exact reverse — panel slides from 0 to 100%, backdrop fades 1 to 0. */
const PANEL: Variants = {
  hidden: { x: "100%" },
  show: {
    x: 0,
    transition: {
      duration: 0.42,
      ease: EASE,
      staggerChildren: 0.03,
      delayChildren: 0.06,
    },
  },
  exit: {
    x: "100%",
    transition: {
      duration: 0.36,
      ease: EASE,
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

const HEADER: Variants = {
  hidden: { opacity: 0, y: -12, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.32, ease: EASE },
    transitionEnd: { filter: "none" },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(6px)",
    transition: { duration: 0.2, ease: EASE },
  },
};

const BODY: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.22,
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

const GROUP: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: EASE,
      staggerChildren: 0.025,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.2,
      ease: EASE,
      staggerChildren: 0.015,
      staggerDirection: -1,
    },
  },
};

/* Content / data elements inside drawer have distinct in and out transition effects */
const ITEM: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
    filter: "blur(6px)",
  },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.32,
      ease: EASE,
    },
    transitionEnd: {
      filter: "none",
    },
  },
  exit: {
    opacity: 0,
    x: 18,
    filter: "blur(6px)",
    transition: {
      duration: 0.2,
      ease: EASE,
    },
  },
};

const FOOTER: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(4px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.35,
      ease: EASE,
      delay: 0.1,
    },
    transitionEnd: {
      filter: "none",
    },
  },
  exit: {
    opacity: 0,
    y: 16,
    filter: "blur(4px)",
    transition: {
      duration: 0.2,
      ease: EASE,
    },
  },
};

export default function MediaFilterDrawer(props: MediaFilterDrawerProps) {
  const { open, onClose, returnFocusRef } = props;
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => setMounted(true), []);
  useScrollLock(open);

  // Esc to close + focus trap
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  // Return focus to the trigger on close
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) returnFocusRef?.current?.focus();
    wasOpen.current = open;
  }, [open, returnFocusRef]);

  if (!mounted) return null;

  const n = props.resultCount;  return createPortal(
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {open && (
          <div className="mfd-root fixed inset-0 z-[100000] flex justify-end" data-scroll-lock="true">
            <m.button
              type="button"
              aria-label="Close filters"
              tabIndex={-1}
              className="absolute inset-0 h-full w-full cursor-default bg-black/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.4, ease: EASE } }}
              exit={{ opacity: 0, transition: { duration: 0.4, ease: EASE } }}
              onClick={onClose}
            />

            <m.aside
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="mfd-title"
              className="mfd-panel relative z-10 flex h-[100dvh] w-full flex-col text-white shadow-[-12px_0_36px_rgba(0,0,0,0.8),0_0_45px_rgba(168,85,247,0.15)] sm:w-[400px]"
              variants={PANEL}
              initial={reduceMotion ? false : "hidden"}
              animate="show"
              exit={reduceMotion ? undefined : "exit"}
            >
              {/* Header */}
              <m.div variants={HEADER} className="mfd-header flex items-center justify-between">
                <h2 id="mfd-title" className="mfd-title font-heading">
                  Filters
                </h2>
                <button
                  ref={closeBtnRef}
                  type="button"
                  aria-label="Close filters"
                  onClick={onClose}
                  className="rounded-full border border-white/10 bg-white/10 p-1.5 text-neutral-300 transition-colors hover:bg-white/20 hover:text-white"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </m.div>

              {/* Body */}
              <m.div variants={BODY} className="mfd-body custom-scrollbar flex-1 overflow-y-auto" data-lenis-prevent="true">
                {props.onSearchChange && (
                  <m.div variants={GROUP} className="mfd-group">
                    <m.label variants={ITEM} htmlFor="mfd-search-input" className="mfd-legend">
                      Search
                    </m.label>
                    <m.div
                      variants={ITEM}
                      className="relative flex h-11 w-full items-center rounded-none border border-white/15 bg-black/40 backdrop-blur-md shadow-[inset_0_0_10px_rgba(0,0,0,0.25)] transition-colors hover:border-white/30 focus-within:border-purple-400 focus-within:bg-black/60 focus-within:shadow-[0_0_12px_rgba(168,85,247,0.35)]"
                    >
                      <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-white/50">
                        <Search className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <input
                        id="mfd-search-input"
                        type="text"
                        value={props.searchQuery ?? ""}
                        onChange={(e) => props.onSearchChange?.(e.target.value)}
                        placeholder={props.searchPlaceholder || "Search by title, category, year..."}
                        aria-label={props.searchPlaceholder || "Search by title, category, year..."}
                        className="h-full w-full bg-transparent pl-10 pr-9 text-sm text-white placeholder:text-white/40 focus:outline-none"
                      />
                      {Boolean(props.searchQuery) && (
                        <button
                          type="button"
                          onClick={() => props.onSearchChange?.("")}
                          aria-label="Clear search"
                          className="absolute right-3 flex h-5 w-5 items-center justify-center text-white/40 transition-colors hover:text-white"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                    </m.div>
                  </m.div>
                )}
                {props.sortOptions && props.onSortChange && (
                  <RadioGroup
                    legend="Sort By"
                    name="mfd-sort"
                    options={props.sortOptions}
                    value={props.sort ?? "default"}
                    onChange={props.onSortChange}
                  />
                )}
                <RadioGroup
                  legend={props.categoryLabel ?? "Category"}
                  name="mfd-category"
                  options={props.categoryOptions}
                  value={props.category}
                  onChange={props.onCategoryChange}
                />
                <RadioGroup
                  legend="Media Type"
                  name="mfd-media-type"
                  options={props.mediaTypeOptions}
                  value={props.mediaType}
                  onChange={props.onMediaTypeChange}
                />
                {props.lengthOptions && props.onLengthChange && (
                  <RadioGroup
                    legend="Length"
                    name="mfd-length"
                    options={props.lengthOptions}
                    value={props.length ?? "all"}
                    onChange={props.onLengthChange}
                  />
                )}
                {props.yearBounds && props.yearRange && props.yearBounds[0] < props.yearBounds[1] && (
                  <YearRange
                    bounds={props.yearBounds}
                    value={props.yearRange}
                    onChange={props.onYearRangeChange}
                  />
                )}
              </m.div>

              {/* Footer */}
              <m.div variants={FOOTER} className="mfd-footer grid grid-cols-2 items-center gap-3">
                <Button variant="secondary" fullWidth onClick={props.onClearAll}>
                  Clear all
                </Button>
                <Button variant="primary" size="md" fullWidth onClick={onClose} className="uppercase tracking-wide">
                  <m.span
                    key={n}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: EASE }}
                  >
                    Show {n} {n === 1 ? "item" : "items"}
                  </m.span>
                </Button>
              </m.div>
            </m.aside>

            <style>{DRAWER_CSS}</style>
          </div>
        )}
      </AnimatePresence>
    </LazyMotion>,
    document.body,
  );
}

function RadioGroup({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: MediaFilterOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  if (options.length === 0) return null; // never render an empty facet
  return (
    <m.fieldset variants={GROUP} className="mfd-group">
      <m.legend variants={ITEM} className="mfd-legend">
        {legend}
      </m.legend>
      <m.div variants={GROUP} className="flex flex-col gap-[10px]">
        {options.map((opt) => (
          <m.label
            key={opt.value}
            variants={ITEM}
            className={`mfd-option${value === opt.value ? " is-selected" : ""}`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            <span className="mfd-label">{opt.label}</span>
            {typeof opt.count === "number" && (
              <m.span
                key={`${opt.value}-${opt.count}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="mfd-count"
              >
                {opt.count}
              </m.span>
            )}
          </m.label>
        ))}
      </m.div>
    </m.fieldset>
  );
}

function YearRange({
  bounds,
  value,
  onChange,
}: {
  bounds: [number, number];
  value: [number, number];
  onChange: (r: [number, number]) => void;
}) {
  const [min, max] = bounds;
  const [lo, hi] = value;
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeHandle, setActiveHandle] = useState<"lo" | "hi" | "range" | "collided" | null>(null);
  const [lastInteracted, setLastInteracted] = useState<"lo" | "hi">("lo");
  const dragStartRef = useRef<{ startX: number; startLo: number; startHi: number }>({
    startX: 0,
    startLo: lo,
    startHi: hi,
  });

  // Decade quick picks for every decade the current bounds touch
  const decades: { label: string; range: [number, number] }[] = [];
  for (let d = Math.floor(min / 10) * 10; d <= max; d += 10) {
    decades.push({
      label: `${String(d).slice(2)}s`,
      range: [Math.max(d, min), Math.min(d + 9, max)],
    });
  }

  const rangeSpan = Math.max(1, max - min);
  const loPct = Math.max(0, Math.min(100, ((lo - min) / rangeSpan) * 100));
  const hiPct = Math.max(0, Math.min(100, ((hi - min) / rangeSpan) * 100));

  const getYearFromPointer = (clientX: number): number => {
    if (!trackRef.current) return min;
    const rect = trackRef.current.getBoundingClientRect();
    if (rect.width <= 0) return min;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(min + pct * rangeSpan);
  };

  const handlePointerDownTrack = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;

    // Direct handle: lo thumb
    if (target.closest(".mfd-thumb-lo")) {
      e.stopPropagation();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
      if (lo === hi) {
        dragStartRef.current = { startX: e.clientX, startLo: lo, startHi: hi };
        setActiveHandle("collided");
      } else {
        setActiveHandle("lo");
        setLastInteracted("lo");
      }
      return;
    }

    // Direct handle: hi thumb
    if (target.closest(".mfd-thumb-hi")) {
      e.stopPropagation();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
      if (lo === hi) {
        dragStartRef.current = { startX: e.clientX, startLo: lo, startHi: hi };
        setActiveHandle("collided");
      } else {
        setActiveHandle("hi");
        setLastInteracted("hi");
      }
      return;
    }

    // Direct handle: connecting range bar (slides the whole window)
    if (target.closest(".mfd-range-fill")) {
      e.stopPropagation();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
      dragStartRef.current = { startX: e.clientX, startLo: lo, startHi: hi };
      setActiveHandle("range");
      return;
    }

    // Track click outside handles: snap closest handle to pointer and begin drag
    const year = getYearFromPointer(e.clientX);
    const distLo = Math.abs(year - lo);
    const distHi = Math.abs(year - hi);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    if (distLo < distHi || (distLo === distHi && year < lo)) {
      onChange([year, hi]);
      setActiveHandle("lo");
      setLastInteracted("lo");
    } else {
      onChange([lo, year]);
      setActiveHandle("hi");
      setLastInteracted("hi");
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeHandle || !trackRef.current) return;

    if (activeHandle === "collided") {
      const delta = e.clientX - dragStartRef.current.startX;
      if (Math.abs(delta) > 3) {
        if (delta < 0) {
          setActiveHandle("lo");
          setLastInteracted("lo");
        } else {
          setActiveHandle("hi");
          setLastInteracted("hi");
        }
      }
      return;
    }

    if (activeHandle === "lo") {
      const year = getYearFromPointer(e.clientX);
      const nextLo = Math.max(min, Math.min(year, hi));
      if (nextLo !== lo) {
        onChange([nextLo, hi]);
      }
    } else if (activeHandle === "hi") {
      const year = getYearFromPointer(e.clientX);
      const nextHi = Math.max(lo, Math.min(year, max));
      if (nextHi !== hi) {
        onChange([lo, nextHi]);
      }
    } else if (activeHandle === "range") {
      const rect = trackRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;
      const span = dragStartRef.current.startHi - dragStartRef.current.startLo;
      const deltaYears = Math.round(((e.clientX - dragStartRef.current.startX) / rect.width) * rangeSpan);
      let nextLo = dragStartRef.current.startLo + deltaYears;
      let nextHi = nextLo + span;

      if (nextLo < min) {
        nextLo = min;
        nextHi = min + span;
      }
      if (nextHi > max) {
        nextHi = max;
        nextLo = max - span;
      }

      if (nextLo !== lo || nextHi !== hi) {
        onChange([nextLo, nextHi]);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeHandle) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      setActiveHandle(null);
    }
  };

  const handleKeyDown = (handle: "lo" | "hi", e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 5 : 1;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      if (handle === "lo") {
        onChange([Math.max(min, lo - step), hi]);
        setLastInteracted("lo");
      } else {
        onChange([lo, Math.max(lo, hi - step)]);
        setLastInteracted("hi");
      }
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      if (handle === "lo") {
        onChange([Math.min(hi, lo + step), hi]);
        setLastInteracted("lo");
      } else {
        onChange([lo, Math.min(max, hi + step)]);
        setLastInteracted("hi");
      }
    } else if (e.key === "Home") {
      e.preventDefault();
      if (handle === "lo") {
        onChange([min, hi]);
        setLastInteracted("lo");
      } else {
        onChange([lo, lo]);
        setLastInteracted("hi");
      }
    } else if (e.key === "End") {
      e.preventDefault();
      if (handle === "lo") {
        onChange([hi, hi]);
        setLastInteracted("lo");
      } else {
        onChange([lo, max]);
        setLastInteracted("hi");
      }
    }
  };

  return (
    <m.fieldset variants={GROUP} className="mfd-group">
      <m.legend variants={ITEM} className="mfd-legend">
        Year
      </m.legend>
      {decades.length > 1 && (
        <m.div variants={ITEM} className="mfd-decades" role="group" aria-label="Jump to decade">
          {decades.map((dec) => {
            const active = lo === dec.range[0] && hi === dec.range[1];
            return (
              <button
                key={dec.label}
                type="button"
                aria-pressed={active}
                onClick={() => onChange(active ? [min, max] : dec.range)}
                className={`mfd-decade transition-colors${active ? " is-active" : ""}`}
              >
                {dec.label}
              </button>
            );
          })}
        </m.div>
      )}
      <m.span
        key={`${lo}-${hi}`}
        variants={ITEM}
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: EASE }}
        className="mfd-range-value"
      >
        {lo === hi ? lo : `${lo} – ${hi}`}
      </m.span>
      <div className="mfd-range-wrap">
        <m.div
          ref={trackRef}
          variants={ITEM}
          className={`mfd-range${activeHandle ? " is-active" : ""}`}
          onPointerDown={handlePointerDownTrack}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            "--lo-pct": `${loPct}%`,
            "--hi-pct": `${hiPct}%`,
            "--lo-z": lastInteracted === "lo" ? 10 : 5,
            "--hi-z": lastInteracted === "hi" ? 10 : 5,
          } as React.CSSProperties}
        >
          <div className="mfd-range-track" aria-hidden="true" />
          <div
            className={`mfd-range-fill${activeHandle === "range" ? " is-dragging" : ""}`}
            aria-hidden="true"
            title="Drag to slide year window"
          />
          <div
            role="slider"
            tabIndex={0}
            aria-label="Earliest year"
            aria-valuemin={min}
            aria-valuemax={hi}
            aria-valuenow={lo}
            aria-valuetext={`${lo}`}
            className={`mfd-thumb mfd-thumb-lo${activeHandle === "lo" ? " is-dragging" : ""}`}
            onKeyDown={(e) => handleKeyDown("lo", e)}
            onFocus={() => setLastInteracted("lo")}
          >
            <span className="mfd-thumb-visual" aria-hidden="true" />
          </div>
          <div
            role="slider"
            tabIndex={0}
            aria-label="Latest year"
            aria-valuemin={lo}
            aria-valuemax={max}
            aria-valuenow={hi}
            aria-valuetext={`${hi}`}
            className={`mfd-thumb mfd-thumb-hi${activeHandle === "hi" ? " is-dragging" : ""}`}
            onKeyDown={(e) => handleKeyDown("hi", e)}
            onFocus={() => setLastInteracted("hi")}
          >
            <span className="mfd-thumb-visual" aria-hidden="true" />
          </div>
        </m.div>
      </div>
      <m.div variants={ITEM} className="mfd-range-labels">
        <span>{min}</span>
        <span>{max}</span>
      </m.div>
    </m.fieldset>
  );
}

const DRAWER_CSS = `
.mfd-panel {
  font-family: var(--font-body);
  background: rgba(15, 8, 28, 0.68) !important;
  background-image: radial-gradient(120% 45% at 50% 0%, rgba(140, 25, 170, 0.35) 0%, transparent 70%),
    linear-gradient(180deg, rgba(50, 15, 65, 0.35) 0%, rgba(12, 7, 22, 0.72) 100%) !important;
  -webkit-backdrop-filter: blur(32px) saturate(180%) !important;
  backdrop-filter: blur(32px) saturate(180%) !important;
  isolation: auto !important;
}
.mfd-panel .mfd-header { padding: 20px 24px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
.mfd-panel .mfd-title { font-family: var(--font-heading); font-size: var(--font-size-h4); font-weight: 400; line-height: 1; text-transform: uppercase; letter-spacing: 0.01em; color: #ffffff; margin: 0; }
.mfd-panel .mfd-body { padding: 24px; display: flex; flex-direction: column; gap: 32px; overscroll-behavior: contain; }
.mfd-panel .mfd-group { border: 0; margin: 0; padding: 0; min-width: 0; }
.mfd-panel .mfd-legend, .mfd-panel label.mfd-legend { font-family: var(--font-body); font-size: 11px !important; font-weight: 600 !important; letter-spacing: 0.15em !important; text-transform: uppercase !important; color: rgba(255, 255, 255, 0.5) !important; margin: 0 0 14px !important; padding: 0 !important; display: block; }
/* beat the global label:not(.sr-only):not(.toggle) { display:block; margin-bottom } rule */
.mfd-panel .mfd-group label.mfd-option { display: flex; align-items: center; gap: 12px; margin: 0; font-size: 15px; font-weight: 500; white-space: normal; color: rgba(255, 255, 255, 0.72); cursor: pointer; z-index: auto; transition: color 0.2s ease; }
.mfd-panel .mfd-group label.mfd-option:hover, .mfd-panel .mfd-group label.mfd-option.is-selected { color: #ffffff; }
.mfd-panel .mfd-group label.mfd-option input { flex-shrink: 0; margin: 0; }
.mfd-panel .mfd-label { font-family: var(--font-body); }
.mfd-panel .mfd-count { margin-left: auto; font-size: 12px; font-weight: 500; color: rgba(255, 255, 255, 0.4); font-variant-numeric: tabular-nums; }
.mfd-panel .mfd-decades { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 20px; }
.mfd-panel .mfd-decade { font-family: var(--font-body); font-size: 12px; font-weight: 600; letter-spacing: 0.04em; padding: 6px 12px; border-radius: 9999px; border: 1px solid rgba(255, 255, 255, 0.15); background: rgba(255, 255, 255, 0.05); color: rgba(255, 255, 255, 0.72); cursor: pointer; }
.mfd-panel .mfd-decade:hover { background: rgba(255, 255, 255, 0.1); color: #ffffff; }
.mfd-panel .mfd-decade.is-active { background: #9333ea; border-color: #a855f7; color: #ffffff; box-shadow: 0 0 10px rgba(147, 51, 234, 0.5); }
.mfd-panel .mfd-range-value { display: block; font-size: 15px; font-weight: 600; color: #ffffff; margin: 0 0 14px; font-variant-numeric: tabular-nums; }
.mfd-panel .mfd-range-wrap { padding: 0 10px; margin: 0 -10px; }
.mfd-panel .mfd-range { position: relative; height: 36px; display: flex; align-items: center; touch-action: none; cursor: pointer; user-select: none; }
.mfd-panel .mfd-range-track { position: absolute; left: 0; right: 0; top: 50%; height: 4px; transform: translateY(-50%); border-radius: 9999px; background: rgba(255, 255, 255, 0.16); pointer-events: none; }
.mfd-panel .mfd-range-fill { position: absolute; top: 50%; transform: translateY(-50%); left: var(--lo-pct); width: calc(var(--hi-pct) - var(--lo-pct)); height: 4px; border-radius: 9999px; background: linear-gradient(90deg, #9333ea, #c084fc, #9333ea); box-shadow: 0 0 10px rgba(147, 51, 234, 0.6); cursor: grab; z-index: 3; touch-action: none; transition: height 0.15s ease, box-shadow 0.15s ease; }
.mfd-panel .mfd-range-fill:hover { height: 6px; box-shadow: 0 0 14px rgba(168, 85, 247, 0.85); }
.mfd-panel .mfd-range-fill.is-dragging { cursor: grabbing; height: 6px; box-shadow: 0 0 18px rgba(168, 85, 247, 1); }
.mfd-panel .mfd-thumb { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: grab; touch-action: none; outline: none; -webkit-tap-highlight-color: transparent; }
.mfd-panel .mfd-thumb-lo { left: var(--lo-pct); z-index: var(--lo-z, 5); }
.mfd-panel .mfd-thumb-hi { left: var(--hi-pct); z-index: var(--hi-z, 5); }
.mfd-panel .mfd-thumb:active, .mfd-panel .mfd-thumb.is-dragging { cursor: grabbing; }
.mfd-panel .mfd-thumb-visual { width: 20px; height: 20px; border-radius: 50%; background: #9333ea; border: 2.5px solid #ffffff; box-shadow: 0 0 12px rgba(147, 51, 234, 0.7); transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease; pointer-events: none; }
.mfd-panel .mfd-thumb:hover .mfd-thumb-visual { transform: scale(1.15); box-shadow: 0 0 16px rgba(168, 85, 247, 0.95); }
.mfd-panel .mfd-thumb:focus-visible .mfd-thumb-visual { outline: 2px solid #c084fc; outline-offset: 3px; }
.mfd-panel .mfd-thumb.is-dragging .mfd-thumb-visual { transform: scale(1.25); background: #a855f7; box-shadow: 0 0 20px rgba(168, 85, 247, 1); }
.mfd-panel .mfd-range-labels { display: flex; justify-content: space-between; margin-top: 6px; font-size: 12px; color: rgba(255, 255, 255, 0.4); font-variant-numeric: tabular-nums; }
.mfd-panel .mfd-footer { padding: 16px 24px; padding-bottom: max(16px, env(safe-area-inset-bottom)); border-top: 1px solid rgba(255, 255, 255, 0.1); }
`;
