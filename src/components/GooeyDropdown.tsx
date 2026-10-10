"use client";

/**
 * GooeyDropdown
 * ---------------------------------------------------------------------------
 * A recreation of the "gooey dropdown" interaction from Framer University
 * (https://framer.university/resources/gooey-dropdown-in-framer), rebuilt as
 * a plain React/Next.js component.
 *
 * How it works (same technique as the Framer original):
 * 1. A pill-shaped trigger button sits in normal flow.
 * 2. Behind it, two colored shapes (`triggerShape` + `panelShape`) live in a
 *    layer that has an SVG "goo" filter applied (blur -> high-contrast alpha
 *    matrix). While `panelShape` animates from the trigger's exact size up to
 *    the full menu size, the blur+contrast makes the growing edges look soft
 *    and fluid instead of a plain CSS resize.
 * 3. The actual button label and menu items live in a separate, unfiltered
 *    layer stacked on top, so text never gets blurred — only the background
 *    blob does.
 *
 * No animation library required (framer-motion / gsap aren't dependencies
 * here) — everything is driven by CSS transitions + React state.
 */

import {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { DotChevronDown } from "@/components/ui/DotArrow";
import { Check, Search } from "lucide-react";

export type DropdownLayout = "unified" | "spotlight" | "bento" | "minimal";

export interface GooeyDropdownItem {
  id?: string;
  label: React.ReactNode;
  badge?: string | number;
  icon?: React.ReactNode;
  selected?: boolean;
  href?: string;
  onClick?: () => void;
}

export interface GooeyDropdownProps {
  id?: string;
  ariaLabel?: string;
  /** Dropdown layout style variant. Defaults to "unified". */
  layout?: DropdownLayout;
  /** Text shown on the closed trigger pill. */
  label: React.ReactNode;
  /** Menu items revealed when the dropdown opens. */
  items: GooeyDropdownItem[];
  /** Fill color for the gooey blob (trigger + panel). */
  accentColor?: string;
  /** Text color for the trigger label. */
  textColor?: string;
  /** Text color for menu items (defaults to textColor). */
  panelTextColor?: string;
  /** Color for the dropdown chevron arrow. */
  chevronColor?: string;
  /** Whether to show the chevron arrow (defaults to true). */
  showChevron?: boolean;
  /** Keep closed trigger pill transparent (defaults to true). */
  transparent?: boolean;
  /** Opacity for the glass background (0.1 to 1.0, defaults to 0.96). */
  glassOpacity?: number;
  /** Backdrop blur strength in px (defaults to 24). */
  backdropBlur?: number;
  /** Extra classes on the outer wrapper. */
  className?: string;
  /** Extra classes on the trigger button. */
  buttonClassName?: string;
  /** Optional max height for scrollable items list (in px). */
  maxHeight?: number;
  /** Optional minimum width for the open menu panel (in px). */
  minWidth?: number;
  /** Expand full width of parent container. */
  fullWidth?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

function hexToRgba(color: string, alpha: number = 1.0): string {
  if (!color) return "rgba(30, 24, 58, 0.96)";
  if (color.startsWith("rgba") || color.startsWith("hsla")) return color;
  let c = color.replace("#", "");
  if (c.length === 8) {
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    const a = parseInt(c.slice(6, 8), 16) / 255;
    return `rgba(${r}, ${g}, ${b}, ${a * alpha})`;
  }
  if (c.length === 3)
    c = c
      .split("")
      .map((x) => x + x)
      .join("");
  const num = parseInt(c, 16);
  if (isNaN(num)) return color;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const ROW_HEIGHT = 40;
const PANEL_PADDING_Y = 8;

export default function GooeyDropdown({
  label,
  items,
  accentColor = "#1e183a",
  textColor = "#ffffff",
  panelTextColor,
  chevronColor = "#c084fc",
  showChevron = true,
  transparent = true,
  glassOpacity = 0.96,
  backdropBlur = 24,
  className = "",
  buttonClassName = "",
  maxHeight,
  minWidth,
  fullWidth = false,
  disabled = false,
  id,
  ariaLabel,
  layout = "unified",
}: GooeyDropdownProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [triggerSize, setTriggerSize] = useState({ width: 120, height: 46 });

  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Reset search when opening/closing
  useEffect(() => {
    if (!open) setSearchQuery("");
  }, [open]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      const labelStr =
        typeof item.label === "string"
          ? item.label
          : typeof item.id === "string"
            ? item.id
            : "";
      return labelStr.toLowerCase().includes(q);
    });
  }, [items, searchQuery]);

  // Translucent background color for glass backdrop-blur
  const bgGlassColor = hexToRgba(accentColor, glassOpacity);

  // Keep the size in sync with the real button
  useLayoutEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const measure = () => {
      setTriggerSize((prev) => {
        const nextW = el.offsetWidth;
        const nextH = el.offsetHeight;
        if (prev.width === nextW && prev.height === nextH) return prev;
        return { width: nextW, height: nextH };
      });
    };
    measure();
    const ro = new ResizeObserver(() => {
      if (!open) {
        measure();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [label, open]);

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setOpen(false);
  }, []);

  const closeDropdownRef = useRef(closeDropdown);
  useEffect(() => {
    closeDropdownRef.current = closeDropdown;
  });

  useEffect(() => {
    if (!open) return;
    function handlePointer(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        closeDropdownRef.current();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeDropdownRef.current();
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // Keep the panel as wide as the trigger pill or minWidth
  const panelWidth = Math.max(triggerSize.width, minWidth ?? 0);
  const contentHeight = PANEL_PADDING_Y * 2 + items.length * ROW_HEIGHT;
  const targetHeight = maxHeight
    ? Math.min(contentHeight, maxHeight)
    : contentHeight;

  const customVars: Record<string, string> = {
    "--drop-bg-color": bgGlassColor,
    "--trigger-height": triggerSize.height ? `${triggerSize.height}px` : "37px",
    "--trigger-width": triggerSize.width ? `${triggerSize.width}px` : "auto",
    "--container-width": fullWidth
      ? "100%"
      : open
        ? `${panelWidth}px`
        : `${triggerSize.width || 120}px`,
    "--menu-max-height": `${targetHeight}px`,
  };
  if (textColor && textColor !== "#ffffff") {
    customVars["--drop-text-color"] = textColor;
  }
  if (chevronColor && chevronColor !== "#c084fc") {
    customVars["--drop-chevron-color"] = chevronColor;
  }
  if (panelTextColor) {
    customVars["--drop-menu-color"] = panelTextColor;
  }

  // --- LAYOUT 2: Glass Spotlight (Search bar on top + Neon glow active pill) ---
  if (layout === "spotlight") {
    return (
      <div
        ref={wrapRef}
        className={`relative ${fullWidth ? "w-full block" : "inline-block"} ${className}`}
        data-open={open}
      >
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={ariaLabel}
          className={`relative flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-full px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
            open
              ? "border border-purple-400 bg-purple-600/35 text-white shadow-[0_0_15px_rgba(192,132,252,0.45)]"
              : "border border-white/15 bg-white/10 text-white/90 hover:border-white/30 hover:bg-white/15 hover:text-white"
          } ${buttonClassName}`}
        >
          <span className="truncate">{label}</span>
          {showChevron && (
            <DotChevronDown
              className={`h-3 w-3 shrink-0 text-purple-300 transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {open && (
          <div
            data-lenis-prevent
            className="absolute top-[calc(100%+8px)] left-0 z-[9999] w-full min-w-[260px] max-w-[340px] rounded-2xl border border-white/20 bg-[#170a2c]/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_20px_rgba(168,85,247,0.25)] backdrop-blur-2xl duration-150 animate-in fade-in zoom-in-95"
          >
            {items.length > 5 && (
              <div className="relative mb-2 px-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Filter options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-1.5 pr-3 pl-8 text-xs text-white placeholder-white/40 outline-none transition-colors focus:border-purple-400/60 focus:bg-white/10"
                />
              </div>
            )}
            <ul
              role="menu"
              className="gooey-drop-menu flex max-h-[300px] flex-col gap-1 overflow-y-auto overscroll-contain pr-0.5"
            >
              {filteredItems.map((item) => (
                <li
                  key={
                    item.id ||
                    (typeof item.label === "string"
                      ? item.label
                      : item.href || "item")
                  }
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      item.onClick?.();
                      closeDropdown();
                    }}
                    className={`group flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition-all ${
                      item.selected
                        ? "border border-purple-400/50 bg-gradient-to-r from-purple-600/40 to-indigo-600/30 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {item.icon}
                      <span>{item.label}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {item.badge !== undefined && (
                        <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                          {item.badge}
                        </span>
                      )}
                      {item.selected && (
                        <Check className="h-3.5 w-3.5 text-purple-300 drop-shadow-[0_0_6px_rgba(192,132,252,0.8)]" />
                      )}
                    </span>
                  </button>
                </li>
              ))}
              {filteredItems.length === 0 && (
                <li className="py-4 text-center text-xs text-white/40">
                  No matching options
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // --- LAYOUT 3: Bento Matrix Grid (Multi-column chip cards) ---
  if (layout === "bento") {
    return (
      <div
        ref={wrapRef}
        className={`relative ${fullWidth ? "w-full block" : "inline-block"} ${className}`}
        data-open={open}
      >
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={ariaLabel}
          className={`relative flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-full px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
            open
              ? "border border-purple-400 bg-purple-600/35 text-white shadow-[0_0_15px_rgba(192,132,252,0.45)]"
              : "border border-white/15 bg-white/10 text-white/90 hover:border-white/30 hover:bg-white/15 hover:text-white"
          } ${buttonClassName}`}
        >
          <span className="truncate">{label}</span>
          {showChevron && (
            <DotChevronDown
              className={`h-3 w-3 shrink-0 text-purple-300 transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {open && (
          <div
            data-lenis-prevent
            className="absolute top-[calc(100%+8px)] left-0 z-[9999] min-w-[300px] rounded-2xl border border-white/20 bg-[#160a28]/95 p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_25px_rgba(192,132,252,0.25)] backdrop-blur-2xl duration-150 animate-in fade-in zoom-in-95 sm:min-w-[380px]"
          >
            <div className="mb-2.5 flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[11px] font-bold tracking-wider text-purple-300 uppercase">
                Quick Select ({items.length})
              </span>
              <span className="text-[10px] text-white/40">Bento Grid</span>
            </div>
            <div className="gooey-drop-menu grid max-h-[320px] grid-cols-2 gap-1.5 overflow-y-auto overscroll-contain p-0.5 sm:grid-cols-3">
              {items.map((item) => (
                <button
                  key={
                    item.id ||
                    (typeof item.label === "string"
                      ? item.label
                      : item.href || "item")
                  }
                  type="button"
                  onClick={() => {
                    item.onClick?.();
                    closeDropdown();
                  }}
                  className={`flex cursor-pointer items-center justify-between gap-1.5 rounded-xl px-2.5 py-2 text-left text-xs font-bold transition-all ${
                    item.selected
                      ? "border border-purple-400 bg-purple-600/50 text-white shadow-[0_0_12px_rgba(192,132,252,0.5)]"
                      : "border border-white/10 bg-white/5 text-white/80 hover:border-white/20 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined ? (
                    <span className="shrink-0 rounded-full bg-black/40 px-1.5 py-0.5 text-[9px] text-purple-200">
                      {item.badge}
                    </span>
                  ) : item.selected ? (
                    <Check className="h-3 w-3 shrink-0 text-purple-200" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- LAYOUT 4: Minimal HUD (Hairline Drawer with Neon Accent Stripe) ---
  if (layout === "minimal") {
    return (
      <div
        ref={wrapRef}
        className={`relative ${fullWidth ? "w-full block" : "inline-block"} ${className}`}
        data-open={open}
      >
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={ariaLabel}
          className={`relative flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
            open
              ? "border-b-2 border-purple-400 bg-white/15 text-white"
              : "border border-white/10 bg-black/40 text-white/80 hover:border-white/25 hover:text-white"
          } ${buttonClassName}`}
        >
          <span className="flex items-center gap-2 truncate">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc]" />
            <span>{label}</span>
          </span>
          {showChevron && (
            <DotChevronDown
              className={`h-3 w-3 shrink-0 text-purple-300 transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {open && (
          <div
            data-lenis-prevent
            className="absolute top-[calc(100%+6px)] left-0 z-[9999] w-full min-w-[240px] rounded-xl border border-white/15 bg-black/90 p-1 shadow-2xl backdrop-blur-xl duration-100 animate-in fade-in"
          >
            <ul
              role="menu"
              className="gooey-drop-menu flex max-h-[300px] flex-col divide-y divide-white/5 overflow-y-auto overscroll-contain"
            >
              {items.map((item) => (
                <li
                  key={
                    item.id ||
                    (typeof item.label === "string"
                      ? item.label
                      : item.href || "item")
                  }
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      item.onClick?.();
                      closeDropdown();
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                      item.selected
                        ? "border-l-2 border-purple-400 bg-purple-500/15 font-extrabold text-white"
                        : "font-medium text-white/75 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="text-[10px] text-white/40">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // --- LAYOUT 1: Unified Container (Karen Avetisyan Morphing Glass Dropdown) ---
  return (
    <div
      ref={wrapRef}
      data-lenis-prevent={open ? "" : undefined}
      className={`gooey-drop-wrap ${fullWidth ? "w-full block" : "inline-block"} ${className}`}
      data-open={open}
      style={customVars as React.CSSProperties}
    >
      {/* ONE unified container div that owns the background, blur, shadow, and border-radius */}
      <div className="gooey-drop-container" data-open={open}>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          className={`gooey-drop-trigger ${buttonClassName}`}
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={ariaLabel}
        >
          <span>{label}</span>
          {showChevron && (
            <DotChevronDown
              className="gooey-drop-chevron h-3 w-3 shrink-0"
              data-open={open}
            />
          )}
        </button>

        <div className="gooey-drop-content-wrap">
          <ul
            data-lenis-prevent
            className="gooey-drop-menu gooey-dropdown-scrollbar overflow-x-hidden overscroll-contain"
            data-open={open}
            role="menu"
            aria-hidden={!open}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeDropdown();
              }
            }}
          >
            {items.map((item) => {
              return (
                <li
                  key={
                    item.id ||
                    (typeof item.label === "string"
                      ? item.label
                      : item.href || "item")
                  }
                  className={item.selected ? "is-selected" : ""}
                  data-selected={item.selected}
                >
                  {(() => {
                    const content =
                      typeof item.label !== "string" &&
                      !item.badge &&
                      !item.icon &&
                      item.selected === undefined ? (
                        item.label
                      ) : (
                        <span className="flex w-full items-center justify-between gap-3 text-xs font-semibold tracking-wide">
                          <span className="flex items-center gap-2 truncate">
                            {item.icon}
                            <span
                              className={
                                item.selected
                                  ? "font-extrabold text-white"
                                  : "text-white/80"
                              }
                            >
                              {item.label}
                            </span>
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            {item.badge !== undefined && (
                              <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                                {item.badge}
                              </span>
                            )}
                            {item.selected && (
                              <Check className="h-3.5 w-3.5 text-purple-300 drop-shadow-[0_0_6px_rgba(192,132,252,0.8)]" />
                            )}
                          </span>
                        </span>
                      );

                    return item.href ? (
                      <a
                        href={item.href}
                        role="menuitem"
                        tabIndex={open ? 0 : -1}
                        data-selected={item.selected}
                        className={item.selected ? "is-selected" : ""}
                        onClick={() => closeDropdown()}
                      >
                        {content}
                      </a>
                    ) : (
                      <button
                        type="button"
                        role="menuitem"
                        tabIndex={open ? 0 : -1}
                        data-selected={item.selected}
                        className={item.selected ? "is-selected" : ""}
                        onClick={() => {
                          item.onClick?.();
                          closeDropdown();
                        }}
                      >
                        {content}
                      </button>
                    );
                  })()}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
