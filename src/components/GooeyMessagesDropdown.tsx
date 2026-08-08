"use client";

/**
 * GooeyMessagesDropdown
 * ---------------------------------------------------------------------------
 * A close visual match for the "Gooey Dropdown" reference at
 * https://goo-drop.learnframer.site/ (Framer University). Values below
 * (button size, panel size, colors, filter constants, type scale, avatar
 * gradients) were measured directly from that live page's computed styles.
 *
 * Built with Tailwind utility classes for all static styling. Only truly
 * dynamic values (the trigger's live screen position, the panel's open/
 * closed size, and each avatar's gradient) are inline styles, since those
 * change per render and can't be expressed as static Tailwind classes.
 *
 * How the goo effect works:
 * 1. A pill-shaped trigger button sits wherever you place it in the page.
 * 2. The colored "goo" shapes (button-match + expanding panel) and the menu
 *    list are rendered in a React portal attached to document.body,
 *    position-fixed at the trigger's real screen coordinates. This lets the
 *    panel expand freely even if the trigger lives inside a container that
 *    clips or masks overflow (e.g. a fixed header with a fade mask).
 * 3. The shapes layer has an SVG "goo" filter applied (blur -> high-contrast
 *    alpha matrix -> composite). While the panel shape animates from the
 *    trigger's exact size up to the full panel size, the blur+contrast makes
 *    the growing edges look soft and fluid instead of a plain CSS resize.
 * 4. The actual header/list/footer text lives in a separate, unfiltered
 *    layer stacked on top, so text never gets blurred — only the shapes do.
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
import { MessageCircle } from "lucide-react";

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
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  // Hover opens it (matching the reference), with a short grace period on
  // leave so moving the cursor from the button down into the panel doesn't
  // close it. A direct click always toggles immediately, which is what lets
  // the icon close the panel again on a second click, and keeps this usable
  // on touch devices where hover never fires.
  const handleEnter = useCallback(() => {
    clearCloseTimer();
    setOpen(true);
  }, [clearCloseTimer]);

  const handleLeave = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 250);
  }, [clearCloseTimer]);

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
    return () => clearCloseTimer();
  }, [clearCloseTimer]);

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
    <div
      ref={portalRef}
      className="fixed inset-0 z-[9999] pointer-events-none [font-family:Inter,var(--font-inter,sans-serif)]"
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

      {/* Two overlapping shapes (button-match + panel) under the goo filter
          give the classic liquid pinch/merge look as the panel grows. The
          drop-shadow lives on this OUTER layer (applied after the goo
          filter has already composited) so the subtle soft shadow reads
          cleanly instead of getting clipped by the goo color matrix. */}
      <div className="absolute inset-0 pointer-events-none drop-shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
        <div className="absolute inset-0" style={{ filter: `url(#${filterId})` }}>
          <div
            className="absolute bg-[#1a1a1a] transition-[width,height,left,top,border-radius] duration-[420ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
            style={shapeStyle}
          />
          <div
            className="absolute bg-[#1a1a1a] rounded-full"
            style={{
              width: BUTTON_SIZE,
              height: BUTTON_SIZE,
              left: anchor.centerX - BUTTON_SIZE / 2,
              top: anchor.top,
            }}
          />
        </div>
      </div>

      <div
        className={`absolute bg-transparent px-5 pt-3 pb-5 opacity-0 -translate-y-1 pointer-events-none transition-[opacity,transform] duration-[220ms] ease delay-[80ms] ${
          open ? "!opacity-100 !translate-y-0 !pointer-events-auto" : ""
        }`}
        role="menu"
        aria-hidden={!open}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        style={{
          width: PANEL_WIDTH,
          left: anchor.centerX - PANEL_WIDTH / 2,
          top: anchor.top + BUTTON_SIZE + GAP_BELOW_BUTTON,
        }}
      >
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-base font-medium text-white leading-[1.2]">{title}</span>
          {badge && <span className="text-[10px] font-medium text-[#787878] leading-[1.2]">{badge}</span>}
        </div>

        <ul className="list-none m-0 p-0 flex flex-col gap-[18px]">
          {messages.map((m, i) => (
            <li key={m.name + i} className="flex items-start gap-3 cursor-default" role="menuitem" tabIndex={open ? 0 : -1}>
              <span
                className="shrink-0 w-10 h-10 rounded-full bg-cover"
                style={{ backgroundImage: m.gradient }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-normal text-[#d1d1d1] whitespace-nowrap overflow-hidden text-ellipsis">
                    {m.name}
                  </span>
                  <span className="text-[10px] font-medium text-[#787878] whitespace-nowrap shrink-0">
                    {m.time}
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-normal text-[#a3a3a3] whitespace-nowrap overflow-hidden text-ellipsis">
                  {m.snippet}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="block w-full mt-[18px] pt-4 border-0 bg-transparent text-xs font-normal text-[#787878] text-center cursor-pointer transition-colors duration-150 hover:text-[#b3b3b3] font-[inherit]"
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
    <div ref={wrapRef} className={`relative inline-block ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        className="relative z-[1] w-[52px] h-[52px] rounded-full bg-[#1a1a1a] shadow-[0_4px_14px_rgba(0,0,0,0.18)] flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-105"
        onMouseEnter={() => {
          measure();
          handleEnter();
        }}
        onMouseLeave={handleLeave}
        onClick={() => {
          measure();
          clearCloseTimer();
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
