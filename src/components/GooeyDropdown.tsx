"use client";

/**
 * GooeyDropdown
 * ---------------------------------------------------------------------------
 * A recreation of the "gooey dropdown" interaction from Framer University
 * (https://framer.university/resources/gooey-dropdown-in-framer), rebuilt as
 * a plain React/Next.js component.
 *
 * How it works (same technique as the Framer original):
 * 1. A pill-shaped trigger button sits in normal flow, wherever you put it.
 * 2. The colored "goo" shapes (trigger-match + expanding panel) and the menu
 *    list are rendered in a React portal attached to document.body, position
 *    -fixed at the trigger's real screen coordinates. This is what lets the
 *    panel expand freely even when the trigger lives inside a container that
 *    clips or masks overflow (e.g. a fixed header with a fade mask) — since
 *    the portal isn't a DOM descendant of that container, it isn't clipped.
 * 3. Behind the trigger, two colored shapes live in a layer that has an SVG
 *    "goo" filter applied (blur -> high-contrast alpha matrix). While the
 *    panel shape animates from the trigger's exact size up to the full menu
 *    size, the blur+contrast makes the growing edges look soft and fluid
 *    instead of a plain CSS resize.
 * 4. The actual button label and menu items live in a separate, unfiltered
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
import { createPortal } from "react-dom";
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
  const [triggerSize, setTriggerSize] = useState({ width: 120, height: 46 });
  const [anchor, setAnchor] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const filterId = `gooey-filter-${rawId}`;

  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  // Portals need a browser document, so only render them after mount.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Translucent background color for glass backdrop-blur (transparent when closed)
  const bgGlassColor = open
    ? (transparent ? "rgba(20, 12, 36, 0.90)" : hexToRgba(accentColor, glassOpacity))
    : (transparent ? "rgba(255, 255, 255, 0.08)" : hexToRgba(accentColor, glassOpacity));

  // Keep the trigger-shape / closed-panel size AND screen position in sync
  // with the real button, so the portaled blob sits exactly behind the
  // label with no gap or overhang, wherever the trigger actually is.
  useLayoutEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setTriggerSize({ width: el.offsetWidth, height: el.offsetHeight });
      setAnchor({ top: rect.top, left: rect.left });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [label]);

  useEffect(() => {
    if (!open) return;
    function handlePointer(e: MouseEvent) {
      const target = e.target as Node;
      const insideWrap = wrapRef.current?.contains(target);
      const insidePortal = portalRef.current?.contains(target);
      if (!insideWrap && !insidePortal) setOpen(false);
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

  const toggle = useCallback(() => {
    // Re-measure right before opening so scroll/layout shifts since the last
    // resize observation don't leave the portal misaligned.
    const el = triggerRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      setAnchor({ top: rect.top, left: rect.left });
    }
    setOpen((o) => !o);
  }, []);

  // Keep the panel exactly as wide as the trigger pill — it should only grow
  // downward, never bulge past the trigger's left/right edges.
  const panelWidth = triggerSize.width;
  const panelHeight = PANEL_PADDING_Y * 2 + items.length * ROW_HEIGHT;

  const panelStyle = open
    ? { width: panelWidth, height: triggerSize.height + panelHeight, borderRadius: 22 }
    : { width: triggerSize.width, height: triggerSize.height, borderRadius: 999 };

  const portalContent = (
    <div
      ref={portalRef}
      className={styles.portalRoot}
      style={{ top: anchor.top, left: anchor.left }}
    >
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

      <ul
        className={styles.menu}
        data-open={open}
        role="menu"
        aria-hidden={!open}
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
  );

  return (
    <div ref={wrapRef} className={`${styles.wrap} ${className}`}>
      <div className={styles.content}>
        <button
          ref={triggerRef}
          type="button"
          className={styles.trigger}
          style={{
            color: textColor,
            // The button carries its own closed-state background so the
            // label always stays legible regardless of how the portaled
            // goo shapes (rendered separately, see below) happen to stack.
            background: bgGlassColor,
            backdropFilter: `blur(${backdropBlur}px) saturate(180%)`,
            WebkitBackdropFilter: `blur(${backdropBlur}px) saturate(180%)`,
          }}
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
      </div>

      {mounted && createPortal(portalContent, document.body)}
    </div>
  );
}
