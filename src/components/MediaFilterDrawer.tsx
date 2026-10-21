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
import { X } from "lucide-react";
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
              className="mfd-panel relative z-10 flex h-[100dvh] w-full flex-col bg-[#0c0a14]/45 text-white shadow-[-12px_0_36px_rgba(0,0,0,0.8),0_0_45px_rgba(168,85,247,0.15)] backdrop-blur-2xl sm:w-[400px]"
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
                <RadioGroup
                  legend="Category"
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

  // Decade quick picks for every decade the current bounds touch
  const decades: { label: string; range: [number, number] }[] = [];
  for (let d = Math.floor(min / 10) * 10; d <= max; d += 10) {
    decades.push({
      label: `${String(d).slice(2)}s`,
      range: [Math.max(d, min), Math.min(d + 9, max)],
    });
  }

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
        {lo} – {hi}
      </m.span>
      <m.div variants={ITEM} className="mfd-range">
        <span className="mfd-range-track" aria-hidden="true" />
        <span
          className="mfd-range-fill"
          aria-hidden="true"
          style={{
            left: `calc(7px + (100% - 14px) * ${(lo - min) / (max - min)})`,
            right: `calc(7px + (100% - 14px) * ${(max - hi) / (max - min)})`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={lo}
          aria-label="Earliest year"
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])}
          style={{ zIndex: lo >= max - (max - min) * 0.05 ? 3 : 2 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={hi}
          aria-label="Latest year"
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])}
        />
      </m.div>
      <m.div variants={ITEM} className="mfd-range-labels">
        <span>{min}</span>
        <span>{max}</span>
      </m.div>
    </m.fieldset>
  );
}

const DRAWER_CSS = `
.mfd-panel { font-family: var(--font-body); }
.mfd-panel .mfd-header { padding: 20px 24px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
.mfd-panel .mfd-title { font-family: var(--font-heading); font-size: var(--font-size-h4); font-weight: 400; line-height: 1; text-transform: uppercase; letter-spacing: 0.01em; color: #ffffff; margin: 0; }
.mfd-panel .mfd-body { padding: 24px; display: flex; flex-direction: column; gap: 32px; overscroll-behavior: contain; }
.mfd-panel .mfd-group { border: 0; margin: 0; padding: 0; min-width: 0; }
.mfd-panel .mfd-legend { font-family: var(--font-body); font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255, 255, 255, 0.5); margin: 0 0 14px; padding: 0; }
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
.mfd-panel .mfd-range { position: relative; height: 20px; }
.mfd-panel .mfd-range-track, .mfd-panel .mfd-range-fill { position: absolute; top: 50%; height: 2px; transform: translateY(-50%); border-radius: 2px; }
.mfd-panel .mfd-range-track { left: 7px; right: 7px; background: rgba(255, 255, 255, 0.15); }
.mfd-panel .mfd-range-fill { background: #a855f7; box-shadow: 0 0 10px rgba(147, 51, 234, 0.5); }
.mfd-panel .mfd-range input[type=range] { position: absolute; inset: 0; width: 100%; height: 20px; margin: 0; background: transparent; pointer-events: none; -webkit-appearance: none; appearance: none; z-index: 2; }
.mfd-panel .mfd-range input[type=range]::-webkit-slider-runnable-track { background: transparent; height: 20px; }
.mfd-panel .mfd-range input[type=range]::-moz-range-track { background: transparent; height: 20px; }
.mfd-panel .mfd-range input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; pointer-events: auto; width: 16px; height: 16px; margin-top: 2px; border-radius: 50%; background: #9333ea; border: 2px solid #ffffff; box-shadow: 0 0 10px rgba(147, 51, 234, 0.6); cursor: grab; }
.mfd-panel .mfd-range input[type=range]::-moz-range-thumb { pointer-events: auto; width: 12px; height: 12px; border-radius: 50%; background: #9333ea; border: 2px solid #ffffff; box-shadow: 0 0 10px rgba(147, 51, 234, 0.6); cursor: grab; }
.mfd-panel .mfd-range input[type=range]:focus-visible::-webkit-slider-thumb { outline: 2px solid #c084fc; outline-offset: 2px; }
.mfd-panel .mfd-range input[type=range]:focus-visible::-moz-range-thumb { outline: 2px solid #c084fc; outline-offset: 2px; }
.mfd-panel .mfd-range-labels { display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; color: rgba(255, 255, 255, 0.4); font-variant-numeric: tabular-nums; }
.mfd-panel .mfd-footer { padding: 16px 24px; padding-bottom: max(16px, env(safe-area-inset-bottom)); border-top: 1px solid rgba(255, 255, 255, 0.1); }
`;
