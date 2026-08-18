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

export interface DropdownOption {
  label: string;
  value: string;
}

export interface GooeyCustomer {
  id: string;
  name: string;
}

export interface GooeyMessagesDropdownProps {
  /** Generic array of options: [{ label, value }] or string[] */
  options?: (DropdownOption | string)[];
  /** Currently selected value */
  selected?: string;
  /** Callback fired when selected value changes */
  onChange?: (value: string) => void;
  /** Label text for form field */
  label?: string;
  /** Panel header title. Defaults to "". */
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
  triggerTextClassName?: string;
  /** Background class when open/active. Defaults to "bg-[#2f2f3c]". */
  activeBg?: string;
  /** Background class when closed/default. Defaults to "bg-[#2f2f3c]". */
  defaultBg?: string;
  /** Expand trigger to full width of parent container with input box styling. */
  fullWidth?: boolean;
  /** Remove border outline from trigger. */
  noBorder?: boolean;
  /** Make default background transparent. */
  transparentBg?: boolean;
  /** Remove horizontal padding from trigger button. */
  noPadding?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
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
const BUTTON_FALLBACK_HEIGHT = 52;
const GAP_BELOW_BUTTON = 2;
const FALLBACK_PANEL_WIDTH = 0;
const FALLBACK_PANEL_HEIGHT = 160;

export default function GooeyMessagesDropdown({
  options,
  selected,
  onChange,
  label,
  title = "",
  badge = "",
  placeholder = "Select Customer",
  customers = DEFAULT_CUSTOMERS,
  defaultSelectedId,
  onSelect,
  className = "",
  triggerTextClassName = "",
  activeBg = "bg-[#a855f71f]",
  defaultBg = "bg-[#a855f71f]",
  fullWidth = false,
  noBorder = false,
  transparentBg = false,
  noPadding = false,
  disabled = false,
  id,
  name,
}: GooeyMessagesDropdownProps) {
  const [open, setOpen] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const handleToggle = () => {
    setIsClicking(true);
    setOpen((o) => !o);
    setTimeout(() => setIsClicking(false), 500);
  };
  const [isMorphComplete, setIsMorphComplete] = useState(false);
  const [selectedIdState, setSelectedIdState] = useState<string | undefined>(defaultSelectedId);

  const normalizedCustomers: GooeyCustomer[] = options && options.length > 0
    ? options.map((opt) => typeof opt === "string" ? { id: opt, name: opt } : { id: opt.value, name: opt.label })
    : customers;

  const activeSelectedId = selected !== undefined ? selected : selectedIdState;

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

  const [triggerWidth, setTriggerWidth] = useState(BUTTON_MIN_WIDTH);
  const [triggerHeight, setTriggerHeight] = useState(BUTTON_FALLBACK_HEIGHT);
  const [panelWidth, setPanelWidth] = useState(FALLBACK_PANEL_WIDTH);
  const [panelHeight, setPanelHeight] = useState(FALLBACK_PANEL_HEIGHT);

  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const filterId = `goo-${rawId}`;

  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelContentRef = useRef<HTMLDivElement>(null);
  const innerContentRef = useRef<HTMLDivElement>(null);

  const selectedItem = normalizedCustomers.find((c) => c.id === activeSelectedId);
  const triggerText = selectedItem ? selectedItem.name : placeholder;
  const currentBg = transparentBg ? (open ? activeBg : "bg-transparent") : (open ? activeBg : defaultBg);

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

  useLayoutEffect(() => {
    if (!open) return;
    const el = innerContentRef.current;
    if (!el) return;

    const optionSpans = el.querySelectorAll(".gooey-option-text");
    let maxTextW = 0;
    optionSpans.forEach((span: any) => {
      if (span.offsetWidth) maxTextW = Math.max(maxTextW, span.offsetWidth);
    });
    const textNeededW = maxTextW > 0 ? maxTextW + 28 : 0;
    const measuredW = fullWidth
      ? triggerWidth
      : Math.max(triggerWidth, textNeededW);
    const measuredH = Math.min(el.offsetHeight + 6, 280);

    setPanelWidth((prev) => (prev !== measuredW ? measuredW : prev));
    setPanelHeight((prev) => (prev !== measuredH ? measuredH : prev));
  }, [open, triggerWidth, fullWidth]);

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

  const targetPanelWidth = fullWidth ? triggerWidth : Math.max(triggerWidth, panelWidth || triggerWidth);

  const shapeStyle = open
    ? {
      width: targetPanelWidth,
      height: panelHeight,
      left: 0,
      top: triggerHeight + GAP_BELOW_BUTTON,
      borderRadius: 16,
    }
    : {
      width: triggerWidth,
      height: triggerHeight,
      left: 0,
      top: 0,
      borderRadius: 999,
    };

  return (
    <div
      ref={wrapRef}
      className={`relative ${fullWidth ? "w-full block" : "inline-block"} ${open ? "z-[9999]" : "z-10"} [font-family:Inter,var(--font-inter,sans-serif)] ${className}`}
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

      <div className={`absolute left-0 top-0 z-40 pointer-events-none transition-opacity duration-200 ${open || isClicking ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute pointer-events-none drop-shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
          <div style={{ filter: open ? `url(#${filterId})` : "none" }}>
            <div
              className={`absolute ${currentBg}`}
              style={{
                ...shapeStyle,
                backgroundColor: open ? '#242630' : '#a855f71f',
                transition: isClicking
                  ? 'width 420ms cubic-bezier(0.65,0,0.35,1), height 420ms cubic-bezier(0.65,0,0.35,1), left 420ms cubic-bezier(0.65,0,0.35,1), top 420ms cubic-bezier(0.65,0,0.35,1), border-radius 420ms cubic-bezier(0.65,0,0.35,1), background-color 300ms'
                  : 'none',
              }}
              onTransitionEnd={(e) => {
                if (open && (e.propertyName === "height" || e.propertyName === "width")) {
                  setIsMorphComplete(true);
                }
              }}
            />
          </div>
        </div>

        <div
          ref={panelContentRef}
          className={`absolute bg-transparent py-2 pl-3 pr-1.5 no-scrollbar opacity-0 -translate-y-1 transition-opacity duration-200 ease ${open && isMorphComplete ? "!opacity-100 !translate-y-0 pointer-events-auto" : "pointer-events-none"
            }`}
          role="listbox"
          aria-hidden={!open || !isMorphComplete}
          style={{
            width: targetPanelWidth,
            maxHeight: panelHeight,
            overflowY: open ? "auto" : "hidden",
            left: 0,
            top: triggerHeight + GAP_BELOW_BUTTON,
          }}
        >
          <div ref={innerContentRef} className="w-full">
            {(title || badge) && (
              <div className="flex items-center justify-between mb-2">
                {title && <span className="text-sm font-medium text-white leading-[1.2]">{title}</span>}
                {badge && <span className="text-[10px] font-medium text-[#787878] leading-[1.2]">{badge}</span>}
              </div>
            )}

            <ul className={`list-none m-0 pb-3 flex flex-col pr-1 transition-opacity duration-200 ease-out ${open && isMorphComplete ? "opacity-100" : "opacity-0"
              }`}>
              {normalizedCustomers.map((c) => (
                <li key={c.id} className="border-b border-white/10 last:border-b-0">
                  <button
                    type="button"
                    role="option"
                    aria-selected={c.id === activeSelectedId}
                    tabIndex={open && isMorphComplete ? 0 : -1}
                    className={`block w-full text-left pt-2 pb-1 pr-1 rounded-lg text-xs font-bold whitespace-normal cursor-pointer transition-colors duration-150 ${c.id === activeSelectedId ? "text-purple-300 font-extrabold" : "text-[#d1d1d1] hover:text-white"
                      }`}
                    onClick={() => {
                      const isSelected = c.id === activeSelectedId;
                      const nextId = isSelected ? undefined : c.id;
                      setSelectedIdState(nextId);
                      onSelect?.(c);
                      if (nextId !== undefined) {
                        onChange?.(nextId);
                      } else {
                        onChange?.("");
                      }
                      setOpen(false);
                    }}
                  >
                    <span className="gooey-option-text inline-block whitespace-nowrap">{c.name}</span>
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
        disabled={disabled}
        style={{ backgroundColor: open ? '#242630' : '#a855f71f' }}
        className={`relative z-50 ${fullWidth
          ? "w-full justify-between text-left"
          : "min-w-fit justify-center text-center"
          } ${noPadding ? "p-0" : fullWidth ? "px-5 py-3" : "px-3.5 py-2"} rounded-full ${currentBg} ${noBorder ? "border-none" : ""} flex items-center gap-2 cursor-pointer transition-colors hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed`}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={triggerText}
      >
        <span className={`text-xs font-black uppercase tracking-wider text-white truncate ${fullWidth ? "text-left flex-1" : "text-center whitespace-nowrap"} ${triggerTextClassName}`}>
          {triggerText}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-white/70 transition-transform duration-200 ${open ? "rotate-180 text-purple-400" : ""}`}
          aria-hidden="true"
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>
    </div>
  );
}
