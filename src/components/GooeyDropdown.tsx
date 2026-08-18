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
  useId,
  useLayoutEffect,
  useEffect,
  useCallback,
} from "react";

export interface GooeyDropdownItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface GooeyDropdownProps {
  /** Text shown on the closed trigger pill. */
  label: string;
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
  /** Opacity for the glass background (0.1 to 1.0, defaults to 0.75). */
  glassOpacity?: number;
  /** Backdrop blur strength in px (defaults to 24). */
  backdropBlur?: number;
  /** Extra classes on the outer wrapper. */
  className?: string;
  /** Extra classes on the trigger button. */
  buttonClassName?: string;
  /** Optional max height for scrollable items list (in px). */
  maxHeight?: number;
}

function hexToRgba(color: string, alpha: number = 1.0): string {
  if (!color) return "rgba(168, 85, 247, 0.12)";
  if (color.startsWith("rgba") || color.startsWith("hsla")) return color;
  let c = color.replace("#", "");
  if (c.length === 8) {
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    const a = parseInt(c.slice(6, 8), 16) / 255;
    return `rgba(${r}, ${g}, ${b}, ${a * alpha})`;
  }
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  if (isNaN(num)) return color;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const ROW_HEIGHT = 36;
const PANEL_PADDING_Y = 6;

export default function GooeyDropdown({
  label,
  items,
  accentColor = "#a855f71f",
  textColor = "#ffffff",
  panelTextColor,
  chevronColor,
  showChevron = true,
  transparent = true,
  glassOpacity = 1.0,
  backdropBlur = 0,
  className = "",
  buttonClassName = "",
  maxHeight,
}: GooeyDropdownProps) {
  const [open, setOpen] = useState(false);
  const [isMorphComplete, setIsMorphComplete] = useState(false);
  const [triggerSize, setTriggerSize] = useState({ width: 120, height: 46 });

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      setIsMorphComplete(true);
    }, 480);
    return () => {
      clearTimeout(timer);
      setIsMorphComplete(false);
    };
  }, [open]);

  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const filterId = `gooey-filter-${rawId}`;

  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Translucent background color for glass backdrop-blur
  const bgGlassColor = hexToRgba(accentColor, glassOpacity);

  // Keep the trigger-shape / closed-panel size in sync with the real button,
  // so the blob sits exactly behind the label with no gap or overhang.
  useLayoutEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const measure = () =>
      setTriggerSize({ width: el.offsetWidth, height: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [label]);

  useEffect(() => {
    if (!open) return;
    function handlePointer(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
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

  const [isClicking, setIsClicking] = useState(false);

  const toggle = useCallback(() => {
    setIsClicking(true);
    setOpen((o) => !o);
    setTimeout(() => {
      setIsClicking(false);
    }, 500);
  }, []);

  // Keep the panel exactly as wide as the trigger pill — it should only grow
  // downward, never bulge past the trigger's left/right edges.
  const panelWidth = triggerSize.width;
  const contentHeight = PANEL_PADDING_Y * 2 + items.length * ROW_HEIGHT;
  const targetHeight = maxHeight ? Math.min(contentHeight, maxHeight) : contentHeight;

  const panelStyle = open
    ? { width: panelWidth, height: triggerSize.height + targetHeight, borderRadius: 16 }
    : { width: triggerSize.width, height: triggerSize.height, borderRadius: 999 };

  return (
    <div ref={wrapRef} className={`gooey-drop-wrap ${className}`} data-open={open}>
      {/* Filter lives once per instance so multiple dropdowns don't fight
          over the same id. Zero-size + hidden so it renders nothing itself. */}
      <svg width="0" height="0" aria-hidden="true" focusable="false" className="gooey-drop-svgDefs">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div className="gooey-drop-shapes" style={{ filter: `url(#${filterId})` }}>
        <div
          className="gooey-drop-panelShape"
          style={{
            ...panelStyle,
            background: bgGlassColor,
            backdropFilter: `blur(${backdropBlur}px) saturate(180%)`,
            WebkitBackdropFilter: `blur(${backdropBlur}px) saturate(180%)`,
            transition: isClicking
              ? "width 480ms cubic-bezier(0.65, 0, 0.35, 1), height 480ms cubic-bezier(0.65, 0, 0.35, 1), border-radius 480ms cubic-bezier(0.65, 0, 0.35, 1)"
              : "none",
          }}
          onTransitionEnd={(e) => {
            if (open && (e.propertyName === "height" || e.propertyName === "width")) {
              setIsMorphComplete(true);
            }
          }}
        />
        <div
          className="gooey-drop-triggerShape"
          style={{
            width: triggerSize.width,
            height: triggerSize.height,
            background: bgGlassColor,
            backdropFilter: `blur(${backdropBlur}px) saturate(180%)`,
            WebkitBackdropFilter: `blur(${backdropBlur}px) saturate(180%)`,
            transition: "none",
          }}
        />
      </div>

      <div className="gooey-drop-content">
        <button
          ref={triggerRef}
          type="button"
          className={`gooey-drop-trigger ${buttonClassName}`}
          style={{ color: textColor }}
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <span>{label}</span>
          {showChevron && (
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              className="gooey-drop-chevron"
              data-open={open}
            >
              <path
                d="M1 1L5 5L9 1"
                stroke={chevronColor}
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <ul
          className="gooey-drop-menu"
          data-open={open && isMorphComplete}
          role="menu"
          aria-hidden={!open || !isMorphComplete}
          style={{
            width: panelWidth,
            paddingTop: triggerSize.height + 6,
            maxHeight: maxHeight ? targetHeight + triggerSize.height : undefined,
            overflowY: maxHeight && contentHeight > maxHeight ? "auto" : "visible",
          }}
        >
          {items.map((item, i) => {
            const delay = open ? 70 + i * 45 : 0;
            return (
              <li key={item.label + i} style={{ transitionDelay: `${delay}ms` }}>
                {item.href ? (
                  <a
                    href={item.href}
                    role="menuitem"
                    tabIndex={open ? 0 : -1}
                    style={{ color: panelTextColor ?? textColor }}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    tabIndex={open ? 0 : -1}
                    style={{ color: panelTextColor ?? textColor }}
                    onClick={() => {
                      item.onClick?.();
                      setOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
