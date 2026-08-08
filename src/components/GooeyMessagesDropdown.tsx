"use client";

/**
 * GooeyMessagesDropdown
 * ---------------------------------------------------------------------------
 * A close visual match for the "Gooey Dropdown" reference at
 * https://goo-drop.learnframer.site/ (Framer University). Values below
 * (button size, panel size, colors, filter constants, type scale, avatar
 * gradients) were measured directly from that live page's computed styles.
 *
 * Same underlying technique as GooeyDropdown.tsx: an SVG blur + high-contrast
 * alpha-matrix filter applied only to a colored shape layer, so the circular
 * trigger visually melts into the message panel as it opens. The shapes and
 * panel are rendered through a React portal to document.body (position:
 * fixed, anchored to the trigger's real screen coordinates) so the panel can
 * expand freely even if the trigger sits inside a container that clips or
 * masks overflow.
 */

import {
  useState,
  useRef,
  useId,
  useLayoutEffect,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { MessageCircle } from "lucide-react";
import styles from "./GooeyMessagesDropdown.module.css";

export interface GooeyMessage {
  name: string;
  time: string;
  snippet: string;
  /** CSS gradient for the avatar circle. */
  gradient: string;
}

export interface GooeyMessagesDropdownProps {
  /** Panel header title. Defaults to "Messages". */
  title?: string;
  /** Badge text, e.g. "3 new". Pass "" to hide it. */
  badge?: string;
  messages?: GooeyMessage[];
  footerLabel?: string;
  onFooterClick?: () => void;
  className?: string;
}

const DEFAULT_MESSAGES: GooeyMessage[] = [
  {
    name: "Alice Johnson",
    time: "2h",
    snippet: "Hey! Are we still on for the meeting …",
    gradient: "linear-gradient(128deg, rgb(146, 139, 250) 0%, rgb(178, 133, 250) 100%)",
  },
  {
    name: "Bob Smith",
    time: "2h",
    snippet: "Dont forget to check out the new p...",
    gradient: "linear-gradient(128deg, rgb(251, 127, 153) 0%, rgb(251, 172, 76) 100%)",
  },
  {
    name: "Charlie Davis",
    time: "Yesterday",
    snippet: "Can you send me the files from last ...",
    gradient: "linear-gradient(128deg, rgb(56, 194, 173) 0%, rgb(55, 149, 229) 100%)",
  },
];

const BUTTON_SIZE = 52;
const PANEL_WIDTH = 306;
const GAP_BELOW_BUTTON = 22;

export default function GooeyMessagesDropdown({
  title = "Messages",
  badge = "3 new",
  messages = DEFAULT_MESSAGES,
  footerLabel = "View All Message",
  onFooterClick,
  className = "",
}: GooeyMessagesDropdownProps) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ top: 0, centerX: 0 });
  const [mounted, setMounted] = useState(false);

  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const filterId = `goo-${rawId}`;

  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const measure = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setAnchor({ top: rect.top, centerX: rect.left + rect.width / 2 });
  };

  useLayoutEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

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

  const panelHeight = 76 + messages.length * 58 + 56;

  const shapeStyle = open
    ? {
        width: PANEL_WIDTH,
        height: panelHeight,
        left: anchor.centerX - PANEL_WIDTH / 2,
        top: anchor.top + BUTTON_SIZE + GAP_BELOW_BUTTON,
        borderRadius: 20,
      }
    : {
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        left: anchor.centerX - BUTTON_SIZE / 2,
        top: anchor.top,
        borderRadius: 999,
      };

  const portalContent = (
    <div ref={portalRef} className={styles.portalRoot}>
      <svg width="0" height="0" aria-hidden="true" focusable="false" className={styles.svgDefs}>
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

      {/* Two overlapping shapes (button-match + panel) under the goo filter
          give the classic liquid pinch/merge look as the panel grows. */}
      <div className={styles.shapes} style={{ filter: `url(#${filterId})` }}>
        <div className={styles.panelShape} style={shapeStyle} />
        <div
          className={styles.buttonShape}
          style={{
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            left: anchor.centerX - BUTTON_SIZE / 2,
            top: anchor.top,
          }}
        />
      </div>

      <div
        className={styles.panel}
        data-open={open}
        role="menu"
        aria-hidden={!open}
        style={{
          width: PANEL_WIDTH,
          left: anchor.centerX - PANEL_WIDTH / 2,
          top: anchor.top + BUTTON_SIZE + GAP_BELOW_BUTTON,
        }}
      >
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          {badge && <span className={styles.badge}>{badge}</span>}
        </div>

        <ul className={styles.list}>
          {messages.map((m, i) => (
            <li key={m.name + i} className={styles.row} role="menuitem" tabIndex={open ? 0 : -1}>
              <span className={styles.avatar} style={{ backgroundImage: m.gradient }} />
              <div className={styles.rowText}>
                <div className={styles.rowTop}>
                  <span className={styles.name}>{m.name}</span>
                  <span className={styles.time}>{m.time}</span>
                </div>
                <p className={styles.snippet}>{m.snippet}</p>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className={styles.footer}
          tabIndex={open ? 0 : -1}
          onClick={() => {
            onFooterClick?.();
            setOpen(false);
          }}
        >
          {footerLabel}
        </button>
      </div>
    </div>
  );

  return (
    <div ref={wrapRef} className={`${styles.wrap} ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={() => {
          measure();
          setOpen((o) => !o);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={title}
      >
        <MessageCircle size={18} strokeWidth={2} color="#ffffff" />
      </button>

      {mounted && createPortal(portalContent, document.body)}
    </div>
  );
}
