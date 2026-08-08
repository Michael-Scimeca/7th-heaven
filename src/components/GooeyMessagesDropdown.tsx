"use client";

/**
 * GooeyMessagesDropdown
 * ---------------------------------------------------------------------------
 * A customer selector built on the "Gooey Dropdown" visual technique from
 * https://goo-drop.learnframer.site/ (Framer University). Button size,
 * panel width, colors, and filter constants were measured directly from
 * that live page's computed styles.
 *
 * Built with Tailwind utility classes for all static styling. Only truly
 * dynamic values (the trigger's measured width and the panel's open/closed
 * size) are inline styles, since those change per render and can't be
 * expressed as static Tailwind classes.
 *
 * Positioning: everything lives in normal document flow as a plain CSS
 * `position: absolute` child of the trigger's own wrapper (`left: 50%`,
 * `top: 0`, anchored via translateX) — NOT a portal with JS-computed fixed
 * coordinates. That earlier approach had to re-measure the trigger's
 * on-screen position via JS on every scroll frame, and on this site (which
 * uses Lenis for smooth scrolling) that sync could never be made airtight —
 * it would visibly lag or detach from the button during scroll. Plain CSS
 * positioning moves in perfect lockstep with the page by construction,
 * under any scroll mechanism, with no JS involved at all.
 *
 * How the goo effect works:
 * 1. A pill-shaped trigger button sits wherever you place it in the page.
 * 2. Behind/around it, two colored "goo" shapes (button-match + expanding
 *    panel) sit in a layer with an SVG "goo" filter applied (blur ->
 *    high-contrast alpha matrix -> composite). While the panel shape
 *    animates from the trigger's exact size up to the full panel size, the
 *    blur+contrast makes the growing edges look soft and fluid instead of a
 *    plain CSS resize.
 * 3. The actual header/list text lives in a separate, unfiltered layer
 *    stacked on top, so text never gets blurred — only the shapes do.
 * 4. The shapes layer is placed before the trigger button in markup (so the
 *    button naturally paints on top and keeps its label visible when
 *    closed), while the whole group gets a z-index high enough to clear
 *    normal page content once open.
 *
 * Interaction: click-to-open/close (like a normal <select>), not
 * hover-to-open — since this is now a real selector, clicking an option
 * both selects it and closes the panel, and the trigger then displays the
 * selected customer's name.
 */

import { useState, useRef, useId, useEffect, useLayoutEffect } from "react";

export interface GooeyCustomer {
  id: string;
  name: string;
}

export interface GooeyMessagesDropdownProps {
  /** Panel header title. Defaults to "Customers". */
  title?: string;
  /** Badge text, e.g. a count. Pass "" to hide it. */
  badge?: string;
  /** Text shown on the trigger before anything is selected. Defaults to "Select Customer". */
  placeholder?: string;
  customers?: GooeyCustomer[];
  /** Pre-select a customer by id. */
  defaultSelectedId?: string;
  /** Called when the user picks a customer from the list. */
  onSelect?: (customer: GooeyCustomer) => void;
  className?: string;
  /** Background class when open/active. Defaults to "bg-[rgb(127,20,198)]". */
  activeBg?: string;
  /** Background class when closed/default. Defaults to "bg-[#1a1a1a]". */
  defaultBg?: string;
}

const DEFAULT_CUSTOMERS: GooeyCustomer[] = [
  { id: "bob-smith", name: "Bob Smith" },
  { id: "alice-johnson", name: "Alice Johnson" },
  { id: "charlie-davis", name: "Charlie Davis" },
  { id: "elizabeth-montgomery", name: "Elizabeth Montgomery" },
  { id: "david-lee", name: "David Lee" },
  { id: "alexander-von-homburg", name: "Alexander Von Homburg" },
];

const BUTTON_MIN_WIDTH = 52;
// Fallback only used for the very first paint before the button's real
// height (now driven by its own py-4 padding, not a fixed height) has
// been measured.
const BUTTON_FALLBACK_HEIGHT = 52;
const GAP_BELOW_BUTTON = 2;
// Rough fallbacks only used for the very first paint before the real
// content has been measured (see panelContentRef below).
const FALLBACK_PANEL_WIDTH = 220;
const FALLBACK_PANEL_HEIGHT = 160;

export default function GooeyMessagesDropdown({
  title = "Customers",
  badge = "",
  placeholder = "Select Customer",
  customers = DEFAULT_CUSTOMERS,
  defaultSelectedId,
  onSelect,
  className = "",
  activeBg = "bg-[rgb(127,20,198)]",
  defaultBg = "bg-[rgb(127,20,198)]",
}: GooeyMessagesDropdownProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(defaultSelectedId);
  // How wide the trigger button actually renders at, so the goo shape
  // sitting behind it (and the panel's horizontal center) can match it
  // exactly. Text labels longer than BUTTON_MIN_WIDTH make the button grow
  // into a pill instead of getting clipped inside a fixed circle.
  const [triggerWidth, setTriggerWidth] = useState(BUTTON_MIN_WIDTH);
  const [triggerHeight, setTriggerHeight] = useState(BUTTON_FALLBACK_HEIGHT);
  // Actual rendered dimensions of the panel's content (title/badge row, if any,
  // plus the option list). Measured directly so panel only grows as wide as needed.
  const [panelWidth, setPanelWidth] = useState(FALLBACK_PANEL_WIDTH);
  const [panelHeight, setPanelHeight] = useState(FALLBACK_PANEL_HEIGHT);

  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const filterId = `goo-${rawId}`;

  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelContentRef = useRef<HTMLDivElement>(null);

  const selected = customers.find((c) => c.id === selectedId);
  const triggerText = selected ? selected.name : placeholder;
  const currentBg = open ? activeBg : defaultBg;

  useLayoutEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const measure = () => {
      setTriggerWidth(el.offsetWidth);
      setTriggerHeight(el.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [triggerText]);

  // The panel content is always mounted (only its opacity/pointer-events
  // toggle with `open`), so its real width and height can be measured continuously.
  useLayoutEffect(() => {
    const el = panelContentRef.current;
    if (!el) return;
    const measure = () => {
      const measuredW = Math.max(el.offsetWidth, triggerWidth);
      setPanelWidth(measuredW);
      setPanelHeight(el.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [title, badge, customers, triggerWidth]);

  useEffect(() => {
    if (!open) return;
    function handlePointer(e: MouseEvent) {
      const target = e.target as Node;
      if (!wrapRef.current?.contains(target)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // Local coordinates, relative to the anchor point
  const shapeStyle = open
    ? {
      width: panelWidth,
      height: panelHeight,
      left: -triggerWidth / 2,
      top: triggerHeight + GAP_BELOW_BUTTON,
      borderRadius: 20,
    }
    : {
      width: triggerWidth,
      height: triggerHeight,
      left: -triggerWidth / 2,
      top: 0,
      borderRadius: 999,
    };

  return (
    <div
      ref={wrapRef}
      className={`relative inline-block [font-family:Inter,var(--font-inter,sans-serif)] ${className}`}
    >
      <svg width="0" height="0" aria-hidden="true" focusable="false" className="absolute w-0 h-0 overflow-hidden">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="absolute left-1/2 top-0 z-40 pointer-events-none">
        <div className="absolute pointer-events-none drop-shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
          <div style={{ filter: `url(#${filterId})` }}>
            <div
              className={`absolute ${currentBg} transition-[width,height,left,top,border-radius,background-color] duration-[420ms] ease-[cubic-bezier(0.65,0,0.35,1)]`}
              style={shapeStyle}
            />
            <div
              className={`absolute ${currentBg} rounded-full transition-colors duration-300`}
              style={{
                width: triggerWidth,
                height: triggerHeight,
                left: -triggerWidth / 2,
                top: 0,
              }}
            />
          </div>
        </div>

        <div
          ref={panelContentRef}
          className={`absolute bg-transparent py-[6px] px-[12px] w-max opacity-0 -translate-y-1 pointer-events-none transition-[opacity,transform] duration-150 ease ${open ? "!opacity-100 !translate-y-0 !pointer-events-auto !duration-200 !delay-[400ms]" : ""
            }`}
          role="listbox"
          aria-hidden={!open}
          style={{
            left: -triggerWidth / 2,
            top: triggerHeight + GAP_BELOW_BUTTON,
          }}
        >
          {(title || badge) && (
            <div className="flex items-center justify-between mb-2">
              {title && <span className="text-base font-medium text-white leading-[1.2]">{title}</span>}
              {badge && <span className="text-[10px] font-medium text-[#787878] leading-[1.2]">{badge}</span>}
            </div>
          )}

          <ul className="list-none m-0 p-0 flex flex-col">
            {customers.map((c) => (
              <li key={c.id} className="border-b border-white/10 last:border-b-0">
                <button
                  type="button"
                  role="option"
                  aria-selected={c.id === selectedId}
                  tabIndex={open ? 0 : -1}
                  className={`block w-full text-left py-2 px-2 -mx-2 rounded-lg text-[13px] sm:text-[14px] font-[800] whitespace-nowrap cursor-pointer transition-colors duration-150 ${c.id === selectedId ? "text-white" : "text-[#d1d1d1]"
                    }`}
                  onClick={() => {
                    setSelectedId(c.id);
                    onSelect?.(c);
                    setOpen(false);
                  }}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        ref={triggerRef}
        type="button"
        className={`relative z-50 min-w-[52px] px-4 py-4 rounded-full ${currentBg} shadow-[0_4px_14px_rgba(0,0,0,0.18)] flex items-center justify-center gap-1.5 cursor-pointer`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={triggerText}
      >
        <span className="text-[12px] font-[800] uppercase tracking-wide text-white leading-none text-center whitespace-nowrap">
          {triggerText}
        </span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
