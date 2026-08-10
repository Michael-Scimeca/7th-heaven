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
  title = "",
  badge = "",
  placeholder = "Select Customer",
  customers = DEFAULT_CUSTOMERS,
  defaultSelectedId,
  onSelect,
  className = "",
  activeBg = "bg-[#2f2f3c]",
  defaultBg = "bg-[#2f2f3c]",
}: GooeyMessagesDropdownProps) {
  const [open, setOpen] = useState(false);
  const [isMorphComplete, setIsMorphComplete] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(defaultSelectedId);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      setIsMorphComplete(true);
    }, 420);
    return () => {
      clearTimeout(timer);
      setIsMorphComplete(false);
    };
  }, [open]);
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
  const innerContentRef = useRef<HTMLDivElement>(null);

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

  // The inner content is measured (unclipped) so panelWidth and panelHeight
  // adapt perfectly, while panelContentRef acts as the scrolling viewport.
  useLayoutEffect(() => {
    const el = innerContentRef.current;
    if (!el) return;
    const measure = () => {
      const measuredW = Math.max(el.offsetWidth + 28, triggerWidth);
      const measuredH = Math.min(el.offsetHeight + 8, 280);
      setPanelWidth(measuredW);
      setPanelHeight(measuredH);
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

  // Prevent background window scroll when hovering and scrolling the dropdown list
  useEffect(() => {
    const el = panelContentRef.current;
    if (!open || !el) return;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      const { scrollTop, scrollHeight, clientHeight } = el;
      const delta = e.deltaY;
      const isUp = delta < 0;
      const isDown = delta > 0;

      if ((isUp && scrollTop <= 0) || (isDown && scrollTop + clientHeight >= scrollHeight - 1)) {
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
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
          <div style={{ filter: open ? `url(#${filterId})` : "none" }}>
            <div
              className={`absolute ${currentBg} transition-[width,height,left,top,border-radius,background-color] duration-[420ms] ease-[cubic-bezier(0.65,0,0.35,1)]`}
              style={shapeStyle}
              onTransitionEnd={(e) => {
                if (open && (e.propertyName === "height" || e.propertyName === "width")) {
                  setIsMorphComplete(true);
                }
              }}
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
          className={`absolute bg-transparent py-1 px-3 custom-scrollbar opacity-0 -translate-y-1 transition-opacity duration-200 ease ${open && isMorphComplete ? "!opacity-100 !translate-y-0 pointer-events-auto" : "pointer-events-none"
            }`}
          role="listbox"
          aria-hidden={!open || !isMorphComplete}
          style={{
            width: panelWidth,
            maxHeight: panelHeight,
            overflowY: open && isMorphComplete ? "auto" : "hidden",
            left: -triggerWidth / 2,
            top: triggerHeight + GAP_BELOW_BUTTON,
          }}
        >
          <div ref={innerContentRef} className="w-max">
            {(title || badge) && (
              <div className="flex items-center justify-between mb-2">
                {title && <span className="text-base font-medium text-white leading-[1.2]">{title}</span>}
                {badge && <span className="text-[10px] font-medium text-[#787878] leading-[1.2]">{badge}</span>}
              </div>
            )}

            <ul className={`list-none m-0 p-0 flex flex-col pr-1 transition-opacity duration-200 ease-out ${open && isMorphComplete ? "opacity-100" : "opacity-0"
              }`}>
              {customers.map((c) => (
                <li key={c.id} className="border-b border-white/10 last:border-b-0">
                  <button
                    type="button"
                    role="option"
                    aria-selected={c.id === selectedId}
                    tabIndex={open && isMorphComplete ? 0 : -1}
                    className={`block w-full text-left pt-0 pb-1 px-3 -mx-2 rounded-lg !text-[19px] font-[600] whitespace-nowrap cursor-pointer transition-colors duration-150 ${c.id === selectedId ? "text-purple-400 font-bold" : "text-[#d1d1d1]"
                      }`}
                    onClick={() => {
                      const isSelected = c.id === selectedId;
                      const nextId = isSelected ? undefined : c.id;
                      setSelectedId(nextId);
                      onSelect?.(isSelected ? { id: "All", name: placeholder } : c);
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
      </div>

      <button
        ref={triggerRef}
        type="button"
        className={`relative z-50 min-w-[52px] px-4 py-4 rounded-full ${currentBg} flex items-center justify-center gap-1.5 cursor-pointer`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={triggerText}
      >
        <span className="text-[17px] font-[800] uppercase tracking-wide text-white leading-none text-center whitespace-nowrap">
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
