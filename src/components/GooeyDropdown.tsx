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
import styles from "./GooeyDropdown.module.css";

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
  /** Keep closed trigger pill transparent (defaults to true). */
  transparent?: boolean;
  /** Opacity for the glass background (0.1 to 1.0, defaults to 0.75). */
  glassOpacity?: number;
  /** Backdrop blur strength in px (defaults to 24). */
  backdropBlur?: number;
  /** Extra classes on the outer wrapper. */
  className?: string;
}

function hexToRgba(color: string, alpha: number = 0.75): string {
  if (!color) return `rgba(147, 51, 234, ${alpha})`;
  if (color.startsWith("rgba") || color.startsWith("hsla")) return color;
  let c = color.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  if (isNaN(num)) return color;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const ROW_HEIGHT = 42;
const PANEL_PADDING_Y = 14;

export default function GooeyDropdown({
  label,
  items,
  accentColor = "#9333ea",
  textColor = "#ffffff",
  panelTextColor,
  transparent = true,
  glassOpacity = 0.75,
  backdropBlur = 24,
  className = "",
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

  // Translucent background color for glass backdrop-blur (transparent when closed)
  const bgGlassColor = open
    ? hexToRgba(accentColor, glassOpacity)
    : (transparent ? "rgba(255, 255, 255, 0.08)" : hexToRgba(accentColor, glassOpacity));

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

  const toggle = useCallback(() => setOpen((o) => !o), []);

  // Keep the panel exactly as wide as the trigger pill — it should only grow
  // downward, never bulge past the trigger's left/right edges.
  const panelWidth = triggerSize.width;
  const panelHeight = PANEL_PADDING_Y * 2 + items.length * ROW_HEIGHT;

  const panelStyle = open
    ? { width: panelWidth, height: triggerSize.height + panelHeight, borderRadius: 22 }
    : { width: triggerSize.width, height: triggerSize.height, borderRadius: 999 };

  return (
    <div ref={wrapRef} className={`${styles.wrap} ${className}`}>
      {/* Filter lives once per instance so multiple dropdowns don't fight
          over the same id. Zero-size + hidden so it renders nothing itself. */}
      <svg width="0" height="0" aria-hidden="true" focusable="false" className={styles.svgDefs}>
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

      <div className={styles.shapes} style={{ filter: `url(#${filterId})` }}>
        <div
          className={styles.panelShape}
          style={{
            ...panelStyle,
            background: bgGlassColor,
            backdropFilter: `blur(${backdropBlur}px) saturate(180%)`,
            WebkitBackdropFilter: `blur(${backdropBlur}px) saturate(180%)`,
          }}
          onTransitionEnd={(e) => {
            if (open && (e.propertyName === "height" || e.propertyName === "width")) {
              setIsMorphComplete(true);
            }
          }}
        />
        <div
          className={styles.triggerShape}
          style={{
            width: triggerSize.width,
            height: triggerSize.height,
            background: bgGlassColor,
            backdropFilter: `blur(${backdropBlur}px) saturate(180%)`,
            WebkitBackdropFilter: `blur(${backdropBlur}px) saturate(180%)`,
          }}
        />
      </div>

      <div className={styles.content}>
        <button
          ref={triggerRef}
          type="button"
          className={styles.trigger}
          style={{ color: textColor }}
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {label}
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            className={styles.chevron}
            data-open={open}
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <ul
          className={styles.menu}
          data-open={open && isMorphComplete}
          role="menu"
          aria-hidden={!open || !isMorphComplete}
          style={{ width: panelWidth, paddingTop: triggerSize.height + 6 }}
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
