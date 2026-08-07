"use client";

import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";

interface CustomScrollbarProps {
  children: ReactNode;
  className?: string;
  thumbColor?: string;
  trackColor?: string;
  thumbWidth?: number;
}

export default function CustomScrollbar({
  children,
  className = "",
  thumbColor = "var(--color-accent, #851DEF)",
  trackColor = "rgba(255,255,255,0.04)",
  thumbWidth = 6,
}: CustomScrollbarProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const dragStartY = useRef(0);
  const dragStartScrollTop = useRef(0);
  const rafRef = useRef<number>(0);

  const updateThumb = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollHeight, clientHeight, scrollTop } = el;
    const scrollable = scrollHeight > clientHeight + 2;
    setIsScrollable(scrollable);
    if (!scrollable) return;
    const ratio = clientHeight / scrollHeight;
    const minThumb = 30;
    const h = Math.max(minThumb, ratio * clientHeight);
    const trackSpace = clientHeight - h;
    const scrollRange = scrollHeight - clientHeight;
    const top = scrollRange > 0 ? (scrollTop / scrollRange) * trackSpace : 0;
    setThumbHeight(h);
    setThumbTop(top);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Small delay to let layout settle
    const timer = setTimeout(updateThumb, 100);

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
    // Watch for children changes (filtering, etc)
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

  // Drag handling
  const onThumbMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      dragStartY.current = e.clientY;
      dragStartScrollTop.current = containerRef.current?.scrollTop || 0;
    },
    []
  );

  useEffect(() => {
    if (!isDragging) return;
    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const el = containerRef.current;
      if (!el) return;
      const dy = e.clientY - dragStartY.current;
      const { scrollHeight, clientHeight } = el;
      const trackSpace = clientHeight - thumbHeight;
      if (trackSpace <= 0) return;
      const scrollRange = scrollHeight - clientHeight;
      el.scrollTop = dragStartScrollTop.current + (dy / trackSpace) * scrollRange;
    };
    const onMouseUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, thumbHeight]);

  // Click on track to jump
  const onTrackClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const el = containerRef.current;
      if (!el) return;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const { scrollHeight, clientHeight } = el;
      const scrollRatio = clickY / rect.height;
      el.scrollTop = scrollRatio * (scrollHeight - clientHeight);
    },
    []
  );

  const thumbOpacity = isDragging ? 1 : isHovering ? 0.9 : 0.7;

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
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
          overflowY: "scroll",
          overflowX: "hidden",
          paddingRight: isScrollable ? thumbWidth + 12 : undefined,
          /* Hide native scrollbar */
          scrollbarWidth: "none",
          // @ts-ignore
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {children}
      </div>

      {/* Inject CSS to hide webkit scrollbar on the container */}
      <style>{`
        [data-lenis-prevent]::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}</style>

      {/* Custom purple scrollbar track — always visible */}
      {isScrollable && (
        <div
          role="region"
          aria-label="Scrollbar track"
          onClick={onTrackClick}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: 0,
            right: 2,
            bottom: 0,
            width: thumbWidth + 6,
            background: trackColor,
            borderRadius: 9999,
            cursor: "pointer",
            zIndex: 999,
            pointerEvents: "auto",
          }}
        >
          {/* Glowing purple thumb */}
          <button
            type="button"
            aria-label="Scrollbar thumb"
            onMouseDown={onThumbMouseDown}
            style={{
              position: "absolute",
              top: thumbTop,
              left: "50%",
              transform: "translateX(-50%)",
              width: thumbWidth,
              height: thumbHeight,
              background: thumbColor,
              borderRadius: 9999,
              opacity: thumbOpacity,
              transition: isDragging ? "none" : "opacity 0.2s ease, box-shadow 0.2s ease",
              cursor: isDragging ? "grabbing" : "grab",
              boxShadow: isDragging || isHovering
                ? `0 0 12px rgba(133, 29, 239, 0.6), 0 0 4px rgba(133, 29, 239, 0.3)`
                : `0 0 8px rgba(133, 29, 239, 0.3)`,
              pointerEvents: "auto",
            }}
          />
        </div>
      )}
    </div>
  );
}
