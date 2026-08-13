"use client";

import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";

interface CustomScrollbarProps {
  children: ReactNode;
  className?: string;
  thumbColor?: string;
  trackColor?: string;
  thumbWidth?: number;
  direction?: "vertical" | "horizontal" | "both";
  /** If set, wraps content in a bounded flex container of this height (px or any CSS value) */
  height?: number | string;
  /** Offset in px from the top for vertical scrollbars (e.g. to start below headers) */
  topOffset?: number;
}

export default function CustomScrollbar({
  children,
  className = "",
  thumbColor = "var(--color-accent, #851DEF)",
  trackColor = "rgba(88,28,135,0.35)",
  thumbWidth = 10,
  direction = "vertical",
  height,
  topOffset = 0,
}: CustomScrollbarProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [thumbSize, setThumbSize] = useState(48);
  const [thumbPos, setThumbPos] = useState(topOffset);
  const [hThumbSize, setHThumbSize] = useState(48);
  const [hThumbPos, setHThumbPos] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const dragStartPos = useRef(0);
  const dragStartScrollPos = useRef(0);
  const rafRef = useRef<number>(0);

  const showVertical = direction === "vertical" || direction === "both";
  const showHorizontal = direction === "horizontal" || direction === "both";

  const updateThumb = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    if (showHorizontal) {
      const { scrollWidth, clientWidth, scrollLeft } = el;
      const scrollable = scrollWidth > clientWidth + 2;
      const minThumb = 48;
      const ratio = clientWidth / Math.max(clientWidth, scrollWidth);
      const maxThumb = Math.max(minThumb, clientWidth - 16);
      const size = scrollable ? Math.min(maxThumb, Math.max(minThumb, ratio * clientWidth)) : minThumb;
      const trackSpace = Math.max(0, clientWidth - size);
      const scrollRange = scrollWidth - clientWidth;
      const pos = scrollable && scrollRange > 0 ? (scrollLeft / scrollRange) * trackSpace : 0;
      setHThumbSize(size);
      setHThumbPos(pos);
    }

    if (showVertical) {
      const { scrollHeight, clientHeight, scrollTop } = el;
      const scrollable = scrollHeight > clientHeight + 2;
      const minThumb = 48;
      const trackBottom = showHorizontal ? thumbWidth + 8 : 4;
      const availableHeight = Math.max(0, clientHeight - (4 + topOffset) - trackBottom);
      const ratio = availableHeight / Math.max(availableHeight, scrollHeight);
      const maxThumb = Math.max(minThumb, availableHeight - 16);
      const size = scrollable ? Math.min(maxThumb, Math.max(minThumb, ratio * availableHeight)) : minThumb;
      const trackSpace = Math.max(0, availableHeight - size);
      const scrollRange = scrollHeight - clientHeight;
      const pos = scrollable && scrollRange > 0 ? (scrollTop / scrollRange) * trackSpace : 0;
      setThumbSize(size);
      setThumbPos(pos);
    }
  }, [showVertical, showHorizontal, topOffset, thumbWidth]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateThumb();
    const timer = setTimeout(updateThumb, 50);

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateThumb);
    };
    el.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateThumb);
    });
    ro.observe(el);

    const mo = new MutationObserver(() => {
      setTimeout(updateThumb, 50);
    });
    mo.observe(el, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      mo.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [updateThumb]);

  const [activeDragAxis, setActiveDragAxis] = useState<"vertical" | "horizontal" | null>(null);

  const onThumbMouseDownVertical = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setActiveDragAxis("vertical");
    dragStartPos.current = e.clientY;
    dragStartScrollPos.current = containerRef.current?.scrollTop || 0;
  }, []);

  const onThumbMouseDownHorizontal = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setActiveDragAxis("horizontal");
    dragStartPos.current = e.clientX;
    dragStartScrollPos.current = containerRef.current?.scrollLeft || 0;
  }, []);

  useEffect(() => {
    if (!isDragging || !activeDragAxis) return;
    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const el = containerRef.current;
      if (!el) return;

      if (activeDragAxis === "horizontal") {
        const dx = e.clientX - dragStartPos.current;
        const { scrollWidth, clientWidth } = el;
        const trackSpace = clientWidth - hThumbSize;
        if (trackSpace <= 0) return;
        const scrollRange = scrollWidth - clientWidth;
        el.scrollLeft = dragStartScrollPos.current + (dx / trackSpace) * scrollRange;
      } else {
        const dy = e.clientY - dragStartPos.current;
        const { scrollHeight, clientHeight } = el;
        const trackBottom = showHorizontal ? thumbWidth + 8 : 4;
        const availableHeight = Math.max(0, clientHeight - (4 + topOffset) - trackBottom);
        const trackSpace = availableHeight - thumbSize;
        if (trackSpace <= 0) return;
        const scrollRange = scrollHeight - clientHeight;
        el.scrollTop = dragStartScrollPos.current + (dy / trackSpace) * scrollRange;
      }
    };
    const onMouseUp = () => {
      setIsDragging(false);
      setActiveDragAxis(null);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, activeDragAxis, thumbSize, hThumbSize, topOffset, thumbWidth, showHorizontal]);

  const onVerticalTrackClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const el = containerRef.current;
    if (!el) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const { scrollHeight, clientHeight } = el;
    const scrollRatio = Math.max(0, Math.min(1, clickY / rect.height));
    el.scrollTop = scrollRatio * (scrollHeight - clientHeight);
  }, []);

  const onHorizontalTrackClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const el = containerRef.current;
    if (!el) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const { scrollWidth, clientWidth } = el;
    const scrollRatio = clickX / rect.width;
    el.scrollLeft = scrollRatio * (scrollWidth - clientWidth);
  }, []);

  const thumbOpacity = isDragging ? 1 : isHovering ? 0.95 : 0.75;

  const inner = (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Scrollable content with hidden native scrollbar */}
      <div
        ref={containerRef}
        className={className}
        data-lenis-prevent
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflowY: showVertical ? "scroll" : "hidden",
          overflowX: showHorizontal ? "auto" : "hidden",
          paddingBottom: showHorizontal ? 0 : undefined,
          scrollbarWidth: "none",
          // @ts-ignore
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {children}
      </div>

      {/* Suppress native webkit scrollbar */}
      <style>{`
        [data-lenis-prevent]::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}</style>

      {/* Vertical Track — rendered if showVertical */}
      {showVertical && (
        <div
          role="region"
          aria-label="Vertical scrollbar track"
          onClick={onVerticalTrackClick}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: 4 + topOffset,
            right: 1,
            bottom: showHorizontal ? thumbWidth + 8 : 4,
            width: thumbWidth + 2,
            backdropFilter: "blur(12px)",
            borderRadius: 9999,
            cursor: "pointer",
            zIndex: 100,
            boxShadow: "inset 0 0 8px rgba(88,28,135,0.3)",
          }}
        >
          <button
            type="button"
            aria-label="Vertical scrollbar thumb"
            onMouseDown={onThumbMouseDownVertical}
            style={{
              position: "absolute",
              top: thumbPos,
              left: "50%",
              transform: "translateX(-50%)",
              width: thumbWidth,
              height: thumbSize,
              background: "linear-gradient(180deg, #d8b4fe 0%, #9333ea 100%)",
              borderRadius: 9999,
              opacity: thumbOpacity,
              transition: isDragging ? "none" : "opacity 0.2s ease, box-shadow 0.2s ease",
              cursor: isDragging ? "grabbing" : "grab",
              pointerEvents: "auto",
            }}
          />
        </div>
      )}

      {/* Horizontal Mask Strip — hides content scrolling underneath the horizontal scrollbar */}
      {showHorizontal && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: thumbWidth + 10,

            zIndex: 90,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Horizontal Track — rendered if showHorizontal */}
      {showHorizontal && (
        <div
          role="region"
          aria-label="Horizontal scrollbar track"
          onClick={onHorizontalTrackClick}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            left: 4,
            right: showVertical ? thumbWidth + 8 : 4,
            bottom: 0,
            height: thumbWidth,
            backdropFilter: "blur(12px)",
            borderRadius: 9999,
            cursor: "pointer",
            zIndex: 100,
            boxShadow: "inset 0 0 8px rgba(88,28,135,0.3)",
          }}
        >
          <button
            type="button"
            aria-label="Horizontal scrollbar thumb"
            onMouseDown={onThumbMouseDownHorizontal}
            style={{
              position: "absolute",
              left: hThumbPos,
              top: "50%",
              transform: "translateY(-50%)",
              width: hThumbSize,
              height: thumbWidth,
              background: "linear-gradient(90deg, #d8b4fe 0%, #9333ea 100%)",
              borderRadius: 9999,
              opacity: thumbOpacity,
              transition: isDragging ? "none" : "opacity 0.2s ease, box-shadow 0.2s ease",
              cursor: isDragging ? "grabbing" : "grab",
              pointerEvents: "auto",
            }}
          />
        </div>
      )}
    </div>
  );

  if (height !== undefined) {
    return (
      <div
        style={{
          height: typeof height === "number" ? `${height}px` : height,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {inner}
      </div>
    );
  }

  return inner;
}
