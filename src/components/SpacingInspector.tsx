"use client";

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

type Mode = "HOVER" | "PIN" | "OUTLINE" | "ALL_MARGIN" | "ALL_PADDING" | "MEASURE" | "NONE";

const STANDARD_TOKENS: Record<number, string> = {
  0: "0 / 0px",
  1: "px / 1px",
  2: "0.5 / 2px",
  4: "1 / 4px",
  6: "1.5 / 6px",
  8: "2 / 8px",
  10: "2.5 / 10px",
  12: "3 / 12px",
  14: "3.5 / 14px",
  16: "4 / 16px",
  20: "5 / 20px",
  24: "6 / 24px",
  28: "7 / 28px",
  32: "8 / 32px",
  36: "9 / 36px",
  40: "10 / 40px",
  44: "11 / 44px",
  48: "12 / 48px",
  52: "13 / 52px",
  56: "14 / 56px",
  60: "15 / 60px",
  64: "16 / 64px",
  72: "18 / 72px",
  80: "20 / 80px",
  88: "22 / 88px",
  96: "24 / 96px",
  112: "28 / 112px",
  128: "32 / 128px",
  144: "36 / 144px",
  160: "40 / 160px",
  192: "48 / 192px",
  224: "56 / 224px",
  256: "64 / 256px",
  288: "72 / 288px",
  320: "80 / 320px",
  384: "96 / 384px",
  448: "112 / 448px",
  512: "128 / 512px",
};

function checkSpacingValue(val: number): { valid: boolean; token?: string } {
  if (val === 0) return { valid: true, token: "0px" };
  const rounded = Math.round(val);
  if (STANDARD_TOKENS[rounded] && Math.abs(val - rounded) < 1.5) {
    return { valid: true, token: STANDARD_TOKENS[rounded] };
  }
  if (rounded >= 4 && rounded % 4 === 0 && Math.abs(val - rounded) < 1.5) {
    return { valid: true, token: `${rounded}px (${rounded / 4} / ${rounded}px)` };
  }
  return { valid: false };
}

function getReactComponentInfo(el: HTMLElement): { name?: string; file?: string; line?: number } {
  if (!el) return {};
  try {
    const fiberKey = Object.keys(el).find(
      (key) => key.startsWith("__reactFiber$") || key.startsWith("__reactInternalInstance$")
    );
    if (!fiberKey) return {};
    let fiber = (el as any)[fiberKey];
    while (fiber) {
      if (typeof fiber.type === "function") {
        const compName = fiber.type.displayName || fiber.type.name;
        const source = fiber._debugSource || fiber._debugOwner?._debugSource;
        if (compName && compName !== "Link" && compName !== "Image" && compName !== "ClientOnlyExtras") {
          return {
            name: compName,
            file: source?.fileName ? source.fileName.split("/").slice(-2).join("/") : undefined,
            line: source?.lineNumber,
          };
        }
      }
      fiber = fiber.return;
    }
  } catch (e) {
    // Ignore fiber parsing errors
  }
  return {};
}

interface BoxMetrics {
  rect: DOMRect;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  borderTop: number;
  borderRight: number;
  borderBottom: number;
  borderLeft: number;
  width: number;
  height: number;
  fontSize: string;
  lineHeight: string;
  display: string;
  gap: string;
  rowGap: number;
  columnGap: number;
  isFlexOrGrid: boolean;
  tagName: string;
  id: string;
  className: string;
  componentInfo: { name?: string; file?: string; line?: number };
}

function getMetrics(el: HTMLElement): BoxMetrics | null {
  if (!el || !el.getBoundingClientRect) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  const cs = window.getComputedStyle(el);

  const marginTop = parseFloat(cs.marginTop) || 0;
  const marginRight = parseFloat(cs.marginRight) || 0;
  const marginBottom = parseFloat(cs.marginBottom) || 0;
  const marginLeft = parseFloat(cs.marginLeft) || 0;

  const paddingTop = parseFloat(cs.paddingTop) || 0;
  const paddingRight = parseFloat(cs.paddingRight) || 0;
  const paddingBottom = parseFloat(cs.paddingBottom) || 0;
  const paddingLeft = parseFloat(cs.paddingLeft) || 0;

  const borderTop = parseFloat(cs.borderTopWidth) || 0;
  const borderRight = parseFloat(cs.borderRightWidth) || 0;
  const borderBottom = parseFloat(cs.borderBottomWidth) || 0;
  const borderLeft = parseFloat(cs.borderLeftWidth) || 0;

  const display = cs.display;
  const isFlexOrGrid = display.includes("flex") || display.includes("grid");
  const rowGap = parseFloat(cs.rowGap) || parseFloat(cs.gap) || 0;
  const columnGap = parseFloat(cs.columnGap) || parseFloat(cs.gap) || 0;

  return {
    rect,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    borderTop,
    borderRight,
    borderBottom,
    borderLeft,
    width: rect.width,
    height: rect.height,
    fontSize: cs.fontSize,
    lineHeight: cs.lineHeight,
    display,
    gap: cs.gap,
    rowGap,
    columnGap,
    isFlexOrGrid,
    tagName: el.tagName.toLowerCase(),
    id: el.id,
    className: typeof el.className === "string" ? el.className : "",
    componentInfo: getReactComponentInfo(el),
  };
}

interface OffScaleItem {
  element: HTMLElement;
  tagName: string;
  id: string;
  className: string;
  componentInfo: { name?: string; file?: string; line?: number };
  offScaleProperties: { prop: string; val: number }[];
  rect: DOMRect;
}

interface HighlightSpacingItem {
  rect: DOMRect;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  borderTop: number;
  borderRight: number;
  borderBottom: number;
  borderLeft: number;
  tagName: string;
}

const IGNORED_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "HEAD",
  "SVG",
  "PATH",
  "G",
  "BR",
  "HR",
  "OPTION",
  "SELECT",
]);

export default function SpacingInspector() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [isActive, setIsActive] = useState<boolean>(false);
  const [mode, setMode] = useState<Mode>("HOVER");
  const [flagOffScale, setFlagOffScale] = useState<boolean>(false);
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [showPadding, setShowPadding] = useState<boolean>(true);
  const [showMargin, setShowMargin] = useState<boolean>(true);

  const highlightPadding = mode === "ALL_PADDING";
  const highlightMargin = mode === "ALL_MARGIN";

  const [hoveredEl, setHoveredEl] = useState<HTMLElement | null>(null);
  const [pinnedEl, setPinnedEl] = useState<HTMLElement | null>(null);
  const [measureEl1, setMeasureEl1] = useState<HTMLElement | null>(null);
  const [measureEl2, setMeasureEl2] = useState<HTMLElement | null>(null);
  const [offScaleItems, setOffScaleItems] = useState<OffScaleItem[]>([]);
  const [allSpacingItems, setAllSpacingItems] = useState<HighlightSpacingItem[]>([]);
  const [outlineSections, setOutlineSections] = useState<{ el: HTMLElement; rect: DOMRect; pt: number; pb: number }[]>([]);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Floating pill draggable position
  const [pillPos, setPillPos] = useState<{ x: number; y: number }>({ x: 20, y: 600 });

  const isDraggingPillRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pillPosRef = useRef(pillPos);

  useEffect(() => {
    pillPosRef.current = pillPos;
  }, [pillPos]);

  useEffect(() => {
    try {
      if (localStorage.getItem("spacing_inspector_active") === "true") {
        setIsActive(true);
      }
      const storedMode = localStorage.getItem("spacing_inspector_mode") as Mode;
      if (
        storedMode === "HOVER" ||
        storedMode === "PIN" ||
        storedMode === "OUTLINE" ||
        storedMode === "ALL_MARGIN" ||
        storedMode === "ALL_PADDING" ||
        storedMode === "MEASURE" ||
        storedMode === "NONE"
      ) {
        setMode(storedMode);
      }
      if (localStorage.getItem("spacing_inspector_flag_offscale") === "true") {
        setFlagOffScale(true);
      }
      if (localStorage.getItem("spacing_inspector_show_overlays") === "false") {
        setShowOverlays(false);
      }
      if (localStorage.getItem("spacing_inspector_show_padding") === "false") {
        setShowPadding(false);
      }
      if (localStorage.getItem("spacing_inspector_show_margin") === "false") {
        setShowMargin(false);
      }
      const storedPos = localStorage.getItem("spacing_inspector_pill_pos");
      if (storedPos) {
        setPillPos(JSON.parse(storedPos));
      } else if (typeof window !== "undefined") {
        setPillPos({ x: 20, y: window.innerHeight - 80 });
      }
    } catch { }
  }, []);

  // Persist state changes
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("spacing_inspector_active", String(isActive));
    } catch { }
  }, [isActive, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("spacing_inspector_mode", mode);
    } catch { }
  }, [mode, mounted]);

  useEffect(() => {
    try {
      localStorage.setItem("spacing_inspector_flag_offscale", String(flagOffScale));
    } catch { }
  }, [flagOffScale]);

  useEffect(() => {
    try {
      localStorage.setItem("spacing_inspector_show_overlays", String(showOverlays));
    } catch { }
  }, [showOverlays]);

  useEffect(() => {
    try {
      localStorage.setItem("spacing_inspector_show_padding", String(showPadding));
    } catch { }
  }, [showPadding]);

  useEffect(() => {
    try {
      localStorage.setItem("spacing_inspector_show_margin", String(showMargin));
    } catch { }
  }, [showMargin]);

  // Keyboard shortcut Alt+S / Option+S & Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "s" || e.key === "S" || e.code === "KeyS")) {
        e.preventDefault();
        setIsActive((prev) => !prev);
      } else if (e.key === "Escape") {
        if (pinnedEl) setPinnedEl(null);
        if (measureEl1 || measureEl2) {
          setMeasureEl1(null);
          setMeasureEl2(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pinnedEl, measureEl1, measureEl2]);

  // Handle dragging pill
  const handlePillMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, input, a, label")) return;
    isDraggingPillRef.current = true;
    dragStartRef.current = {
      x: e.clientX - pillPosRef.current.x,
      y: e.clientY - pillPosRef.current.y,
    };

    const handleMouseMove = (moveEv: MouseEvent) => {
      if (!isDraggingPillRef.current) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 420, moveEv.clientX - dragStartRef.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 100, moveEv.clientY - dragStartRef.current.y));
      const nextPos = { x: newX, y: newY };
      setPillPos(nextPos);
      try {
        localStorage.setItem("spacing_inspector_pill_pos", JSON.stringify(nextPos));
      } catch { }
    };

    const handleMouseUp = () => {
      isDraggingPillRef.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Hover detection
  useEffect(() => {
    if (!isActive || mode === "OUTLINE" || mode === "ALL_MARGIN" || mode === "ALL_PADDING") return;

    let rAFId = 0;
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rAFId);
      rAFId = requestAnimationFrame(() => {
        const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
        if (!target) {
          setHoveredEl(null);
          return;
        }
        if (target.closest("[data-spacing-inspector]")) {
          return;
        }
        setHoveredEl(target);
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      cancelAnimationFrame(rAFId);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isActive, mode]);

  // Click capturing in PIN and MEASURE modes
  useEffect(() => {
    if (!isActive || (mode !== "PIN" && mode !== "MEASURE")) return;

    const handleCaptureClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || target.closest("[data-spacing-inspector]")) return;

      e.preventDefault();
      e.stopPropagation();

      if (mode === "PIN") {
        setPinnedEl(target);
      } else if (mode === "MEASURE") {
        if (!measureEl1) {
          setMeasureEl1(target);
        } else if (!measureEl2) {
          setMeasureEl2(target);
        } else {
          setMeasureEl1(target);
          setMeasureEl2(null);
        }
      }
    };

    window.addEventListener("click", handleCaptureClick, true);
    return () => window.removeEventListener("click", handleCaptureClick, true);
  }, [isActive, mode, measureEl1, measureEl2]);

  // Scan all padding and margin highlights across visible elements
  const scanAllSpacing = useCallback(() => {
    if (!isActive || (!highlightPadding && !highlightMargin)) {
      setAllSpacingItems([]);
      return;
    }
    const all = Array.from(document.body.querySelectorAll("*")) as HTMLElement[];
    const items: HighlightSpacingItem[] = [];

    for (const el of all) {
      if (
        el.closest("[data-spacing-inspector]") ||
        IGNORED_TAGS.has(el.tagName)
      ) {
        continue;
      }
      const rect = el.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10 || rect.bottom < 0 || rect.top > window.innerHeight) {
        continue;
      }

      const cs = window.getComputedStyle(el);
      const pt = parseFloat(cs.paddingTop) || 0;
      const pr = parseFloat(cs.paddingRight) || 0;
      const pb = parseFloat(cs.paddingBottom) || 0;
      const pl = parseFloat(cs.paddingLeft) || 0;

      const mt = parseFloat(cs.marginTop) || 0;
      const mr = parseFloat(cs.marginRight) || 0;
      const mb = parseFloat(cs.marginBottom) || 0;
      const ml = parseFloat(cs.marginLeft) || 0;

      const hasPadding = highlightPadding && (pt > 0 || pr > 0 || pb > 0 || pl > 0);
      const hasMargin = highlightMargin && (mt > 0 || mr > 0 || mb > 0 || ml > 0);

      if (hasPadding || hasMargin) {
        items.push({
          rect,
          paddingTop: pt,
          paddingRight: pr,
          paddingBottom: pb,
          paddingLeft: pl,
          marginTop: mt,
          marginRight: mr,
          marginBottom: mb,
          marginLeft: ml,
          borderTop: parseFloat(cs.borderTopWidth) || 0,
          borderRight: parseFloat(cs.borderRightWidth) || 0,
          borderBottom: parseFloat(cs.borderBottomWidth) || 0,
          borderLeft: parseFloat(cs.borderLeftWidth) || 0,
          tagName: el.tagName.toLowerCase(),
        });
      }
    }
    setAllSpacingItems(items);
  }, [isActive, highlightPadding, highlightMargin]);

  // Scan off-scale elements
  const scanOffScale = useCallback(() => {
    if (!isActive || !flagOffScale) {
      setOffScaleItems([]);
      return;
    }
    const all = Array.from(document.body.querySelectorAll("*")) as HTMLElement[];
    const flagged: OffScaleItem[] = [];

    for (const el of all) {
      if (
        el.closest("[data-spacing-inspector]") ||
        ["SCRIPT", "STYLE", "HEAD", "SVG", "PATH", "G"].includes(el.tagName)
      ) {
        continue;
      }
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0 || rect.bottom < 0 || rect.top > window.innerHeight) {
        continue;
      }

      const cs = window.getComputedStyle(el);
      const propsToCheck = [
        { prop: "paddingTop", val: parseFloat(cs.paddingTop) || 0 },
        { prop: "paddingRight", val: parseFloat(cs.paddingRight) || 0 },
        { prop: "paddingBottom", val: parseFloat(cs.paddingBottom) || 0 },
        { prop: "paddingLeft", val: parseFloat(cs.paddingLeft) || 0 },
        { prop: "marginTop", val: parseFloat(cs.marginTop) || 0 },
        { prop: "marginRight", val: parseFloat(cs.marginRight) || 0 },
        { prop: "marginBottom", val: parseFloat(cs.marginBottom) || 0 },
        { prop: "marginLeft", val: parseFloat(cs.marginLeft) || 0 },
      ];

      if (cs.display.includes("flex") || cs.display.includes("grid")) {
        propsToCheck.push({ prop: "rowGap", val: parseFloat(cs.rowGap) || parseFloat(cs.gap) || 0 });
        propsToCheck.push({ prop: "columnGap", val: parseFloat(cs.columnGap) || parseFloat(cs.gap) || 0 });
      }

      const offProps = propsToCheck.filter(({ val }) => val > 0 && !checkSpacingValue(val).valid);
      if (offProps.length > 0) {
        flagged.push({
          element: el,
          tagName: el.tagName.toLowerCase(),
          id: el.id,
          className: typeof el.className === "string" ? el.className : "",
          componentInfo: getReactComponentInfo(el),
          offScaleProperties: offProps,
          rect,
        });
      }
    }
    setOffScaleItems(flagged);
  }, [isActive, flagOffScale]);

  // Scan section outlines
  const scanSections = useCallback(() => {
    if (!isActive || mode !== "OUTLINE") {
      setOutlineSections([]);
      return;
    }
    const elements = Array.from(
      document.querySelectorAll("section, header, footer, main, .section, .section-sm, .section-lg, .site-container")
    ) as HTMLElement[];

    const result: { el: HTMLElement; rect: DOMRect; pt: number; pb: number }[] = [];
    for (const el of elements) {
      if (el.closest("[data-spacing-inspector]")) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const cs = window.getComputedStyle(el);
      result.push({
        el,
        rect,
        pt: parseFloat(cs.paddingTop) || 0,
        pb: parseFloat(cs.paddingBottom) || 0,
      });
    }
    setOutlineSections(result);
  }, [isActive, mode]);

  // Scroll / resize listener with rAF throttling
  useEffect(() => {
    if (!isActive) return;

    let rAFId = 0;
    const handleScrollOrResize = () => {
      cancelAnimationFrame(rAFId);
      rAFId = requestAnimationFrame(() => {
        if (flagOffScale) scanOffScale();
        if (mode === "OUTLINE") scanSections();
        if (highlightPadding || highlightMargin) scanAllSpacing();
      });
    };

    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });

    if (flagOffScale) scanOffScale();
    if (mode === "OUTLINE") scanSections();
    if (highlightPadding || highlightMargin) scanAllSpacing();

    return () => {
      cancelAnimationFrame(rAFId);
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isActive, mode, flagOffScale, highlightPadding, highlightMargin, scanOffScale, scanSections, scanAllSpacing]);

  // Copy report generator
  const copyReport = () => {
    if (offScaleItems.length === 0) {
      scanOffScale();
    }
    const lines = [
      `# 📐 Spacing Inspection Audit Report`,
      `Generated: ${new Date().toLocaleString()}`,
      `Total Off-Scale Elements Flagged: ${offScaleItems.length}`,
      ``,
    ];

    offScaleItems.forEach((item, i) => {
      const compStr = item.componentInfo.name
        ? `<${item.componentInfo.name} /> (${item.componentInfo.file || "unknown"}:${item.componentInfo.line || "?"})`
        : "Unknown Component";
      lines.push(`${i + 1}. <${item.tagName}${item.id ? ` id="${item.id}"` : ""}${item.className ? ` class="${item.className}"` : ""}>`);
      lines.push(`   - Component: ${compStr}`);
      item.offScaleProperties.forEach((p) => {
        lines.push(`   - ⚠️ ${p.prop}: ${p.val}px (Off-scale)`);
      });
      lines.push(``);
    });

    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    });
  };

  if (!isActive) {
    return (
      <div
        data-spacing-inspector
        className="fixed z-[9999999] transition-opacity"
        style={{ left: pillPos.x, top: pillPos.y }}
      >
        <button
          onClick={() => setIsActive(true)}
          title="Enable Spacing Inspector (Alt+S)"
          className="transition-colors flex items-center gap-2 rounded-full border border-purple-500/40 bg-zinc-950/90 px-3.5 py-2 font-mono text-xs text-purple-300 shadow-2xl backdrop-blur-xl hover:bg-purple-950/80 hover:text-white"
        >
          <span className="h-2 w-2 rounded-full bg-zinc-500" />
          <span>📐 Spacing</span>
        </button>
      </div>
    );
  }

  const activeTarget = mode === "PIN" ? pinnedEl || hoveredEl : hoveredEl;
  const metrics = activeTarget ? getMetrics(activeTarget) : null;

  // Calculate sibling distances for pinned mode
  let siblingInfo: { parentGap?: string; prevDistance?: number; nextDistance?: number } = {};
  if (pinnedEl && metrics) {
    const parent = pinnedEl.parentElement;
    if (parent) {
      const pcs = window.getComputedStyle(parent);
      siblingInfo.parentGap = pcs.gap;

      const prev = pinnedEl.previousElementSibling as HTMLElement | null;
      if (prev) {
        const prevRect = prev.getBoundingClientRect();
        siblingInfo.prevDistance = Math.round(metrics.rect.top - prevRect.bottom);
      }
      const next = pinnedEl.nextElementSibling as HTMLElement | null;
      if (next) {
        const nextRect = next.getBoundingClientRect();
        siblingInfo.nextDistance = Math.round(nextRect.top - metrics.rect.bottom);
      }
    }
  }

  // Calculate measure mode distance lines
  const mMetrics1 = measureEl1 ? getMetrics(measureEl1) : null;
  const mMetrics2 = measureEl2 ? getMetrics(measureEl2) : null;
  let measureDist: { dx: number; dy: number; vGap: number; hGap: number } | null = null;
  if (mMetrics1 && mMetrics2) {
    const r1 = mMetrics1.rect;
    const r2 = mMetrics2.rect;

    const dx = Math.round(Math.abs(r2.left - r1.left));
    const dy = Math.round(Math.abs(r2.top - r1.top));

    let vGap = 0;
    if (r2.top >= r1.bottom) vGap = Math.round(r2.top - r1.bottom);
    else if (r1.top >= r2.bottom) vGap = Math.round(r1.top - r2.bottom);

    let hGap = 0;
    if (r2.left >= r1.right) hGap = Math.round(r2.left - r1.right);
    else if (r1.left >= r2.right) hGap = Math.round(r1.left - r2.right);

    measureDist = { dx, dy, vGap, hGap };
  }

  return createPortal(
    <div data-spacing-inspector className="fixed inset-0 z-[9999999] pointer-events-none font-sans text-xs">
      {/* ── 1. BOX MODEL OVERLAY FOR ACTIVE/HOVERED ELEMENT ── */}
      {showOverlays && mode !== "NONE" && metrics && (mode === "HOVER" || mode === "PIN") && (
        <>
          {/* MARGIN FILL (Orange) */}
          {metrics.marginTop > 0 && (
            <div
              className="fixed bg-[rgba(249,115,22,0.35)] border-t border-b border-orange-500/60 pointer-events-none"
              style={{
                top: metrics.rect.top - metrics.marginTop,
                left: metrics.rect.left - metrics.marginLeft,
                width: metrics.rect.width + metrics.marginLeft + metrics.marginRight,
                height: metrics.marginTop,
              }}
            >
              <span className="absolute top-0.5 left-1 font-mono text-[10px] text-orange-200 bg-orange-950/80 px-1 rounded">
                mt {Math.round(metrics.marginTop)}px {checkSpacingValue(metrics.marginTop).valid ? "✅" : "⚠️"}
              </span>
            </div>
          )}
          {metrics.marginBottom > 0 && (
            <div
              className="fixed bg-[rgba(249,115,22,0.35)] border-t border-b border-orange-500/60 pointer-events-none"
              style={{
                top: metrics.rect.bottom,
                left: metrics.rect.left - metrics.marginLeft,
                width: metrics.rect.width + metrics.marginLeft + metrics.marginRight,
                height: metrics.marginBottom,
              }}
            >
              <span className="absolute bottom-0.5 left-1 font-mono text-[10px] text-orange-200 bg-orange-950/80 px-1 rounded">
                mb {Math.round(metrics.marginBottom)}px {checkSpacingValue(metrics.marginBottom).valid ? "✅" : "⚠️"}
              </span>
            </div>
          )}
          {metrics.marginLeft > 0 && (
            <div
              className="fixed bg-[rgba(249,115,22,0.35)] border-l border-r border-orange-500/60 pointer-events-none"
              style={{
                top: metrics.rect.top,
                left: metrics.rect.left - metrics.marginLeft,
                width: metrics.marginLeft,
                height: metrics.rect.height,
              }}
            />
          )}
          {metrics.marginRight > 0 && (
            <div
              className="fixed bg-[rgba(249,115,22,0.35)] border-l border-r border-orange-500/60 pointer-events-none"
              style={{
                top: metrics.rect.top,
                left: metrics.rect.right,
                width: metrics.marginRight,
                height: metrics.rect.height,
              }}
            />
          )}

          {/* PADDING FILL (Green) */}
          {metrics.paddingTop > 0 && (
            <div
              className="fixed bg-[rgba(34,197,94,0.35)] pointer-events-none"
              style={{
                top: metrics.rect.top + metrics.borderTop,
                left: metrics.rect.left + metrics.borderLeft,
                width: metrics.rect.width - metrics.borderLeft - metrics.borderRight,
                height: metrics.paddingTop,
              }}
            >
              <span className="absolute top-0.5 right-1 font-mono text-[10px] text-green-200 bg-green-950/80 px-1 rounded">
                pt {Math.round(metrics.paddingTop)}px {checkSpacingValue(metrics.paddingTop).valid ? "✅" : "⚠️"}
              </span>
            </div>
          )}
          {metrics.paddingBottom > 0 && (
            <div
              className="fixed bg-[rgba(34,197,94,0.35)] pointer-events-none"
              style={{
                top: metrics.rect.bottom - metrics.borderBottom - metrics.paddingBottom,
                left: metrics.rect.left + metrics.borderLeft,
                width: metrics.rect.width - metrics.borderLeft - metrics.borderRight,
                height: metrics.paddingBottom,
              }}
            >
              <span className="absolute bottom-0.5 right-1 font-mono text-[10px] text-green-200 bg-green-950/80 px-1 rounded">
                pb {Math.round(metrics.paddingBottom)}px {checkSpacingValue(metrics.paddingBottom).valid ? "✅" : "⚠️"}
              </span>
            </div>
          )}
          {metrics.paddingLeft > 0 && (
            <div
              className="fixed bg-[rgba(34,197,94,0.35)] pointer-events-none"
              style={{
                top: metrics.rect.top + metrics.borderTop + metrics.paddingTop,
                left: metrics.rect.left + metrics.borderLeft,
                width: metrics.paddingLeft,
                height: Math.max(0, metrics.rect.height - metrics.borderTop - metrics.borderBottom - metrics.paddingTop - metrics.paddingBottom),
              }}
            />
          )}
          {metrics.paddingRight > 0 && (
            <div
              className="fixed bg-[rgba(34,197,94,0.35)] pointer-events-none"
              style={{
                top: metrics.rect.top + metrics.borderTop + metrics.paddingTop,
                left: metrics.rect.right - metrics.borderRight - metrics.paddingRight,
                width: metrics.paddingRight,
                height: Math.max(0, metrics.rect.height - metrics.borderTop - metrics.borderBottom - metrics.paddingTop - metrics.paddingBottom),
              }}
            />
          )}

          {/* CONTENT BOX FILL (Blue) */}
          <div
            className="fixed bg-[rgba(59,130,246,0.25)] border border-blue-400/60 pointer-events-none flex items-center justify-center"
            style={{
              top: metrics.rect.top + metrics.borderTop + metrics.paddingTop,
              left: metrics.rect.left + metrics.borderLeft + metrics.paddingLeft,
              width: Math.max(0, metrics.rect.width - metrics.borderLeft - metrics.borderRight - metrics.paddingLeft - metrics.paddingRight),
              height: Math.max(0, metrics.rect.height - metrics.borderTop - metrics.borderBottom - metrics.paddingTop - metrics.paddingBottom),
            }}
          >
            <span className="font-mono text-[10px] font-semibold text-blue-200 bg-blue-950/90 px-1.5 py-0.5 rounded shadow">
              {Math.round(metrics.width)} × {Math.round(metrics.height)}px
            </span>
          </div>

          {/* GAP STRIPES (Purple) */}
          {metrics.isFlexOrGrid && (metrics.rowGap > 0 || metrics.columnGap > 0) && (
            <div
              className="fixed pointer-events-none border border-purple-500/80 bg-[rgba(168,85,247,0.25)]"
              style={{
                top: metrics.rect.top,
                left: metrics.rect.left,
                width: metrics.rect.width,
                height: metrics.rect.height,
              }}
            >
              <span className="absolute -top-5 left-0 font-mono text-[10px] text-purple-200 bg-purple-950/90 px-1.5 py-0.5 rounded">
                gap {metrics.gap || `${metrics.rowGap}px`} {checkSpacingValue(metrics.rowGap).valid ? "✅" : "⚠️"}
              </span>
            </div>
          )}
        </>
      )}

      {/* ── ALL PADDING AND ALL MARGIN HIGHLIGHT OVERLAYS ── */}
      {showOverlays && mode !== "NONE" && (highlightPadding || highlightMargin) &&
        allSpacingItems.map((item) => (
          <React.Fragment key={`spacing-${item.tagName}-${item.rect.top}-${item.rect.left}-${item.rect.width}-${item.rect.height}`}>
            {/* All Padding Highlights */}
            {highlightPadding && (
              <>
                {item.paddingTop > 0 && (
                  <div
                    className="fixed bg-[rgba(34,197,94,0.35)] border-t border-b border-green-500/80 pointer-events-none flex items-center justify-center"
                    style={{
                      top: item.rect.top + item.borderTop,
                      left: item.rect.left + item.borderLeft,
                      width: Math.max(40, item.rect.width - item.borderLeft - item.borderRight),
                      height: item.paddingTop,
                    }}
                  >
                    <span className="font-mono text-[9px] text-green-100 bg-green-950/90 px-1 py-0.5 rounded shadow border border-green-500/50">
                      pt {Math.round(item.paddingTop)}px
                    </span>
                  </div>
                )}
                {item.paddingBottom > 0 && (
                  <div
                    className="fixed bg-[rgba(34,197,94,0.35)] border-t border-b border-green-500/80 pointer-events-none flex items-center justify-center"
                    style={{
                      top: item.rect.bottom - item.borderBottom - item.paddingBottom,
                      left: item.rect.left + item.borderLeft,
                      width: Math.max(40, item.rect.width - item.borderLeft - item.borderRight),
                      height: item.paddingBottom,
                    }}
                  >
                    <span className="font-mono text-[9px] text-green-100 bg-green-950/90 px-1 py-0.5 rounded shadow border border-green-500/50">
                      pb {Math.round(item.paddingBottom)}px
                    </span>
                  </div>
                )}
                {item.paddingLeft > 0 && (
                  <div
                    className="fixed bg-[rgba(34,197,94,0.35)] border-l border-r border-green-500/80 pointer-events-none flex items-center justify-center"
                    style={{
                      top: item.rect.top + item.borderTop + item.paddingTop,
                      left: item.rect.left + item.borderLeft,
                      width: item.paddingLeft,
                      height: Math.max(0, item.rect.height - item.borderTop - item.borderBottom - item.paddingTop - item.paddingBottom),
                    }}
                  />
                )}
                {item.paddingRight > 0 && (
                  <div
                    className="fixed bg-[rgba(34,197,94,0.35)] border-l border-r border-green-500/80 pointer-events-none flex items-center justify-center"
                    style={{
                      top: item.rect.top + item.borderTop + item.paddingTop,
                      left: item.rect.right - item.borderRight - item.paddingRight,
                      width: item.paddingRight,
                      height: Math.max(0, item.rect.height - item.borderTop - item.borderBottom - item.paddingTop - item.paddingBottom),
                    }}
                  />
                )}
              </>
            )}

            {/* All Margin Highlights */}
            {highlightMargin && (
              <>
                {item.marginTop > 0 && (
                  <div
                    className="fixed bg-[rgba(249,115,22,0.35)] border-t border-b border-orange-500/80 pointer-events-none flex items-center justify-center"
                    style={{
                      top: item.rect.top - item.marginTop,
                      left: item.rect.left,
                      width: Math.max(40, item.rect.width),
                      height: item.marginTop,
                    }}
                  >
                    <span className="font-mono text-[9px] text-orange-100 bg-orange-950/90 px-1 py-0.5 rounded shadow border border-orange-500/50">
                      mt {Math.round(item.marginTop)}px
                    </span>
                  </div>
                )}
                {item.marginBottom > 0 && (
                  <div
                    className="fixed bg-[rgba(249,115,22,0.35)] border-t border-b border-orange-500/80 pointer-events-none flex items-center justify-center"
                    style={{
                      top: item.rect.bottom,
                      left: item.rect.left,
                      width: Math.max(40, item.rect.width),
                      height: item.marginBottom,
                    }}
                  >
                    <span className="font-mono text-[9px] text-orange-100 bg-orange-950/90 px-1 py-0.5 rounded shadow border border-orange-500/50">
                      mb {Math.round(item.marginBottom)}px
                    </span>
                  </div>
                )}
                {item.marginLeft > 0 && (
                  <div
                    className="fixed bg-[rgba(249,115,22,0.35)] border-l border-r border-orange-500/80 pointer-events-none flex items-center justify-center"
                    style={{
                      top: item.rect.top,
                      left: item.rect.left - item.marginLeft,
                      width: item.marginLeft,
                      height: item.rect.height,
                    }}
                  />
                )}
                {item.marginRight > 0 && (
                  <div
                    className="fixed bg-[rgba(249,115,22,0.35)] border-l border-r border-orange-500/80 pointer-events-none flex items-center justify-center"
                    style={{
                      top: item.rect.top,
                      left: item.rect.right,
                      width: item.marginRight,
                      height: item.rect.height,
                    }}
                  />
                )}
              </>
            )}
          </React.Fragment>
        ))}

      {/* ── 2. OUTLINE ALL SECTIONS MODE ── */}
      {mode === "OUTLINE" && (
        <>
          {outlineSections.map(({ rect, pt, pb }) => (
            <div
              key={`outline-${rect.top}-${rect.left}-${rect.width}-${rect.height}`}
              className="fixed border-2 border-cyan-400/80 bg-cyan-500/10 pointer-events-none"
              style={{
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
              }}
            >
              <span className="absolute top-1 left-2 font-mono text-[10px] text-cyan-200 bg-cyan-950/90 px-2 py-0.5 rounded">
                SECTION | pt: {pt}px | pb: {pb}px
              </span>
            </div>
          ))}
        </>
      )}

      {/* ── 3. FLAG OFF-SCALE RED OUTLINES ── */}
      {flagOffScale && (
        <>
          {offScaleItems.map((item) => (
            <div
              key={`offscale-${item.tagName}-${item.rect.top}-${item.rect.left}-${item.rect.width}-${item.rect.height}`}
              className="fixed border-2 border-red-500 bg-red-500/10 pointer-events-none shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              style={{
                top: item.rect.top,
                left: item.rect.left,
                width: item.rect.width,
                height: item.rect.height,
              }}
            >
              <span className="absolute -top-5 left-0 font-mono text-[10px] text-white bg-red-600 px-1.5 py-0.5 rounded shadow">
                ⚠️ Off-scale: {item.offScaleProperties.map((p) => `${p.prop} ${p.val}px`).join(", ")}
              </span>
            </div>
          ))}
        </>
      )}

      {/* ── 4. MEASURE MODE OVERLAY ── */}
      {mode === "MEASURE" && (
        <>
          {mMetrics1 && (
            <div
              className="fixed border-2 border-amber-400 bg-amber-400/20 pointer-events-none"
              style={{
                top: mMetrics1.rect.top,
                left: mMetrics1.rect.left,
                width: mMetrics1.rect.width,
                height: mMetrics1.rect.height,
              }}
            >
              <span className="absolute top-0 left-0 bg-amber-500 text-black font-mono text-[10px] px-1">
                A ({mMetrics1.tagName})
              </span>
            </div>
          )}
          {mMetrics2 && (
            <div
              className="fixed border-2 border-emerald-400 bg-emerald-400/20 pointer-events-none"
              style={{
                top: mMetrics2.rect.top,
                left: mMetrics2.rect.left,
                width: mMetrics2.rect.width,
                height: mMetrics2.rect.height,
              }}
            >
              <span className="absolute top-0 left-0 bg-emerald-500 text-black font-mono text-[10px] px-1">
                B ({mMetrics2.tagName})
              </span>
            </div>
          )}
          {measureDist && mMetrics1 && mMetrics2 && (
            <div className="fixed inset-0 pointer-events-none">
              {/* Vertical Distance Line */}
              {measureDist.vGap > 0 && (
                <div
                  className="absolute border-l-2 border-dashed border-amber-300 bg-amber-950/90 text-amber-200 font-mono text-xs px-2 py-0.5 rounded shadow"
                  style={{
                    top: Math.min(mMetrics1.rect.bottom, mMetrics2.rect.bottom),
                    left: Math.max(mMetrics1.rect.left, mMetrics2.rect.left) + 20,
                    height: measureDist.vGap,
                  }}
                >
                  Vertical Distance: {measureDist.vGap}px
                </div>
              )}
              {/* Horizontal Distance Line */}
              {measureDist.hGap > 0 && (
                <div
                  className="absolute border-t-2 border-dashed border-cyan-300 bg-cyan-950/90 text-cyan-200 font-mono text-xs px-2 py-0.5 rounded shadow"
                  style={{
                    top: Math.max(mMetrics1.rect.top, mMetrics2.rect.top) + 20,
                    left: Math.min(mMetrics1.rect.right, mMetrics2.rect.right),
                    width: measureDist.hGap,
                  }}
                >
                  Horizontal Distance: {measureDist.hGap}px
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── 5. PINNED ELEMENT DETAILS SIDE PANEL ── */}
      {pinnedEl && metrics && (
        <div
          className="pointer-events-auto fixed top-4 right-4 z-[9999999] flex w-[360px] max-w-[90vw] flex-col rounded-xl border border-purple-500/40 bg-zinc-950/95 p-4 text-white shadow-2xl backdrop-blur-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="min-w-0">
              <span className="font-mono text-purple-400">
                &lt;{metrics.tagName}
                {metrics.id ? `#${metrics.id}` : ""}&gt;
              </span>
              {metrics.componentInfo.name && (
                <p className="font-mono text-[11px] text-green-400 truncate">
                  ⚛️ &lt;{metrics.componentInfo.name} /&gt;
                  {metrics.componentInfo.file && ` (${metrics.componentInfo.file}:${metrics.componentInfo.line})`}
                </p>
              )}
            </div>
            <button
              onClick={() => setPinnedEl(null)}
              className="transition-colors rounded p-1 font-mono text-xs text-zinc-400 hover:bg-white/10 hover:text-white"
            >
              ✕ Esc
            </button>
          </div>

          <div className="mt-3 flex flex-col gap-2 font-mono text-[11px]">
            {/* Dimensions */}
            <div className="flex justify-between bg-zinc-900/80 px-2.5 py-1.5 rounded">
              <span className="text-zinc-400">Content Size:</span>
              <span className="text-blue-300">
                {Math.round(metrics.width)}px × {Math.round(metrics.height)}px
              </span>
            </div>

            {/* Padding */}
            <div className="bg-zinc-900/80 p-2 rounded">
              <span className="text-green-400 block mb-1">Padding:</span>
              <div className="grid grid-cols-2 gap-1 text-zinc-300">
                <span>Top: {Math.round(metrics.paddingTop)}px {checkSpacingValue(metrics.paddingTop).valid ? "✅" : "⚠️"}</span>
                <span>Right: {Math.round(metrics.paddingRight)}px {checkSpacingValue(metrics.paddingRight).valid ? "✅" : "⚠️"}</span>
                <span>Bottom: {Math.round(metrics.paddingBottom)}px {checkSpacingValue(metrics.paddingBottom).valid ? "✅" : "⚠️"}</span>
                <span>Left: {Math.round(metrics.paddingLeft)}px {checkSpacingValue(metrics.paddingLeft).valid ? "✅" : "⚠️"}</span>
              </div>
            </div>

            {/* Margin */}
            <div className="bg-zinc-900/80 p-2 rounded">
              <span className="text-orange-400 block mb-1">Margin:</span>
              <div className="grid grid-cols-2 gap-1 text-zinc-300">
                <span>Top: {Math.round(metrics.marginTop)}px {checkSpacingValue(metrics.marginTop).valid ? "✅" : "⚠️"}</span>
                <span>Right: {Math.round(metrics.marginRight)}px {checkSpacingValue(metrics.marginRight).valid ? "✅" : "⚠️"}</span>
                <span>Bottom: {Math.round(metrics.marginBottom)}px {checkSpacingValue(metrics.marginBottom).valid ? "✅" : "⚠️"}</span>
                <span>Left: {Math.round(metrics.marginLeft)}px {checkSpacingValue(metrics.marginLeft).valid ? "✅" : "⚠️"}</span>
              </div>
            </div>

            {/* Context Spacing */}
            <div className="bg-zinc-900/80 p-2 rounded text-zinc-300">
              <span className="text-purple-300 block mb-1">Context & Siblings:</span>
              <div>Parent Gap: {siblingInfo.parentGap || "none"}</div>
              {siblingInfo.prevDistance !== undefined && <div>Prev Sibling Gap: {siblingInfo.prevDistance}px</div>}
              {siblingInfo.nextDistance !== undefined && <div>Next Sibling Gap: {siblingInfo.nextDistance}px</div>}
            </div>

            {/* Class Name */}
            {metrics.className && (
              <div className="bg-zinc-900/80 p-2 rounded max-h-[80px] overflow-y-auto break-all text-[10px] text-zinc-400">
                class: {metrics.className}
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="mt-3 flex gap-1.5 border-t border-white/10 pt-3">
            <button
              onClick={() => {
                if (pinnedEl.parentElement) setPinnedEl(pinnedEl.parentElement);
              }}
              className="transition-colors flex-1 rounded border border-white/10 bg-zinc-900 py-1 font-mono text-[10px] text-zinc-300 hover:bg-white/10"
            >
              Select Parent
            </button>
            <button
              onClick={() => {
                if (pinnedEl.firstElementChild) setPinnedEl(pinnedEl.firstElementChild as HTMLElement);
              }}
              className="transition-colors flex-1 rounded border border-white/10 bg-zinc-900 py-1 font-mono text-[10px] text-zinc-300 hover:bg-white/10"
            >
              Select Child
            </button>
          </div>
        </div>
      )}

      {/* ── 6. FLOATING MAIN CONTROL TOOLBAR ── */}
      <div
        className="pointer-events-auto fixed flex flex-col gap-2 rounded-2xl border border-purple-500/40 bg-zinc-950/95 p-3 text-white shadow-2xl backdrop-blur-2xl"
        style={{ left: pillPos.x, top: pillPos.y }}
        onMouseDown={handlePillMouseDown}
      >
        <div className="flex items-center justify-between gap-3 cursor-grab active:cursor-grabbing border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-mono text-xs text-purple-300">📐 Spacing Inspector</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !showOverlays || (!showPadding && !showMargin);
                setShowOverlays(next);
                setShowPadding(next);
                setShowMargin(next);
                if (!next) setMode("NONE");
                else if (mode === "NONE") setMode("HOVER");
              }}
              className={`rounded border px-2 py-1 text-[11px] font-mono transition shadow ${showOverlays && (showPadding || showMargin)
                  ? "border-red-500/60 bg-red-950/90 text-red-200 hover:bg-red-900 hover:text-white"
                  : "border-emerald-500/60 bg-emerald-950/90 text-emerald-200 hover:bg-emerald-900 hover:text-white"
                } `}
            >
              {showOverlays && (showPadding || showMargin)
                ? "🚫 HIDE PADDING & MARGIN"
                : "👁️ SHOW PADDING & MARGIN"}
            </button>
            <button
              onClick={() => setIsActive(false)}
              className="transition-colors rounded px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 hover:bg-white/10 hover:text-white"
            >
              Off (Alt+S)
            </button>
          </div>
        </div>

        {/* Modes Bar */}
        <div className="flex flex-wrap gap-1 bg-zinc-900 p-1 rounded-lg">
          {(
            [
              { key: "HOVER", label: "HOVER" },
              { key: "PIN", label: "PIN" },
              { key: "OUTLINE", label: "OUTLINE" },
              { key: "ALL_MARGIN", label: "ALL MARGIN 🟠" },
              { key: "ALL_PADDING", label: "ALL PADDING 🟢" },
              { key: "MEASURE", label: "MEASURE" },
              { key: "NONE", label: "HIDE 🚫" },
            ] as { key: Mode; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => {
                setMode(key);
                if (key === "NONE") {
                  setShowOverlays(false);
                } else {
                  setShowOverlays(true);
                  if (!showPadding && !showMargin) {
                    setShowPadding(true);
                    setShowMargin(true);
                  }
                }
              }}
              className={`rounded px-2 py-1 font-mono text-[10px] font-semibold transition ${mode === key
                  ? key === "ALL_MARGIN"
                    ? "bg-orange-600 text-white shadow"
                    : key === "ALL_PADDING"
                      ? "bg-green-600 text-white shadow"
                      : key === "NONE"
                        ? "bg-red-600 text-white shadow"
                        : "bg-purple-600 text-white shadow"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
                } `}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Options */}
        <div className="flex items-center justify-between gap-3 pt-1 font-mono text-[11px]">
          <div className="flex items-center gap-3">
            <label className="transition-colors flex items-center gap-1.5 cursor-pointer text-zinc-300 hover:text-white">
              <input
                type="checkbox"
                checked={showPadding}
                onChange={(e) => {
                  setShowPadding(e.target.checked);
                  if (e.target.checked) setShowOverlays(true);
                }}
                className="accent-green-500"
              />
              <span className="text-green-400 font-semibold">🟢 Padding</span>
            </label>
            <label className="transition-colors flex items-center gap-1.5 cursor-pointer text-zinc-300 hover:text-white">
              <input
                type="checkbox"
                checked={showMargin}
                onChange={(e) => {
                  setShowMargin(e.target.checked);
                  if (e.target.checked) setShowOverlays(true);
                }}
                className="accent-orange-500"
              />
              <span className="text-orange-400 font-semibold">🟠 Margin</span>
            </label>
            <label className="transition-colors flex items-center gap-1.5 cursor-pointer text-zinc-300 hover:text-white">
              <input
                type="checkbox"
                checked={flagOffScale}
                onChange={(e) => setFlagOffScale(e.target.checked)}
                className="accent-purple-500"
              />
              <span>Flag Off-Scale</span>
              {flagOffScale && (
                <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-400">
                  {offScaleItems.length}
                </span>
              )}
            </label>
          </div>

          <button
            onClick={copyReport}
            className="transition-colors rounded border border-purple-500/30 bg-purple-950/60 px-2.5 py-1 text-[10px] font-mono text-purple-300 hover:bg-purple-900 hover:text-white shrink-0"
          >
            {copiedReport ? "Copied! ✅" : "Copy Report"}
          </button>
        </div>
      </div>
    </div>,
    mounted && typeof document !== "undefined" ? document.body : (null as any)
  );
}
