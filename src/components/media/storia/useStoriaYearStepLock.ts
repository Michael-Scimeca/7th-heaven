"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Minimum time (ms) each year remains locked on screen before wheel, touch,
 * or keyboard scrolling can advance to the adjacent year (~1 second).
 */
const YEAR_HOLD_MS = 950;
const WHEEL_STEP_THRESHOLD = 28;
const TOUCH_STEP_THRESHOLD = 28;
const EXIT_COOLDOWN_MS = 320;

interface LenisGlobalInstance {
  scrollTo: (
    target: number,
    options?: {
      duration?: number;
      immediate?: boolean;
      force?: boolean;
      lock?: boolean;
    }
  ) => void;
}

function getGlobalLenis(): LenisGlobalInstance | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { __lenis?: LenisGlobalInstance }).__lenis;
}

export interface UseStoriaYearStepLockOptions {
  total: number;
  activeIdx: number;
  onSelectIdx: (idx: number) => void;
  prefersReducedMotion: boolean;
}

export function useStoriaYearStepLock({
  total,
  activeIdx,
  onSelectIdx,
  prefersReducedMotion,
}: UseStoriaYearStepLockOptions) {
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const activeIdxRef = useRef<number>(activeIdx);
  const onSelectIdxRef = useRef(onSelectIdx);
  const prefersReducedMotionRef = useRef<boolean>(prefersReducedMotion);

  const wasPinnedRef = useRef<boolean>(false);
  const lastOutsideSideRef = useRef<"top" | "bottom">("top");
  const stepLockUntilRef = useRef<number>(0);
  const exitCooldownUntilRef = useRef<number>(0);
  const wheelAccumRef = useRef<number>(0);
  const lastWheelTimeRef = useRef<number>(0);
  const touchStartYRef = useRef<number | null>(null);
  const isPointerDownRef = useRef<boolean>(false);
  const recentGestureUntilRef = useRef<number>(0);

  const isProgrammaticScrollRef = useRef<boolean>(false);
  const programmaticTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    activeIdxRef.current = activeIdx;
  }, [activeIdx]);

  useEffect(() => {
    onSelectIdxRef.current = onSelectIdx;
  }, [onSelectIdx]);

  useEffect(() => {
    prefersReducedMotionRef.current = prefersReducedMotion;
  }, [prefersReducedMotion]);

  const scrollToYearIndex = useCallback(
    (targetIdx: number, immediate: boolean, armHoldLock: boolean) => {
      const clampedIdx = Math.max(0, Math.min(total - 1, targetIdx));
      activeIdxRef.current = clampedIdx;
      onSelectIdxRef.current(clampedIdx);

      if (armHoldLock) {
        stepLockUntilRef.current = performance.now() + YEAR_HOLD_MS;
      }
      wheelAccumRef.current = 0;

      const trackEl = scrollTrackRef.current;
      if (!trackEl || total <= 1) return;

      const rect = trackEl.getBoundingClientRect();
      const scrollable = Math.max(0, rect.height - window.innerHeight);
      if (scrollable <= 0) return;

      const progress = clampedIdx / (total - 1);
      trackEl.style.setProperty("--storia-scroll-progress", progress.toFixed(4));

      const trackDocTop = window.scrollY + rect.top;
      const targetScrollY = trackDocTop + progress * scrollable;

      const useImmediate = immediate || prefersReducedMotionRef.current;
      isProgrammaticScrollRef.current = true;
      if (programmaticTimerRef.current !== null) {
        clearTimeout(programmaticTimerRef.current);
      }
      programmaticTimerRef.current = setTimeout(
        () => {
          isProgrammaticScrollRef.current = false;
          programmaticTimerRef.current = null;
        },
        useImmediate ? 160 : 720
      );

      const lenis = getGlobalLenis();
      if (lenis) {
        lenis.scrollTo(
          targetScrollY,
          useImmediate
            ? { immediate: true, force: true }
            : { duration: 0.6, force: true }
        );
      } else {
        window.scrollTo({
          top: targetScrollY,
          behavior: useImmediate ? "auto" : "smooth",
        });
      }
    },
    [total]
  );

  useEffect(() => {
    if (total <= 1) return;
    let rafId: number | null = null;

    const handlePointerDown = () => {
      isPointerDownRef.current = true;
    };
    const handlePointerUp = () => {
      isPointerDownRef.current = false;
    };

    const syncEraFromScroll = () => {
      rafId = null;
      if (isProgrammaticScrollRef.current) return;

      const trackEl = scrollTrackRef.current;
      if (!trackEl) return;

      const rect = trackEl.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const scrollable = rect.height - viewportH;
      if (scrollable <= 0) return;

      if (rect.top > 1.5) {
        wasPinnedRef.current = false;
        lastOutsideSideRef.current = "top";
        trackEl.style.setProperty("--storia-scroll-progress", "0");
        if (rect.top < viewportH && activeIdxRef.current !== 0) {
          activeIdxRef.current = 0;
          onSelectIdxRef.current(0);
        }
        return;
      }

      if (rect.bottom < viewportH - 1.5) {
        wasPinnedRef.current = false;
        lastOutsideSideRef.current = "bottom";
        trackEl.style.setProperty("--storia-scroll-progress", "1");
        const lastIdx = total - 1;
        if (activeIdxRef.current !== lastIdx) {
          activeIdxRef.current = lastIdx;
          onSelectIdxRef.current(lastIdx);
        }
        return;
      }

      const now = performance.now();

      // Catch fast wheel/touch entry inertia so scrolling into the section
      // always lands on 1985 (from top) or 2026 (from bottom) for a full second.
      if (
        !wasPinnedRef.current &&
        now >= exitCooldownUntilRef.current &&
        now < recentGestureUntilRef.current &&
        !isPointerDownRef.current
      ) {
        wasPinnedRef.current = true;
        const entryIdx =
          lastOutsideSideRef.current === "bottom" ? total - 1 : 0;
        scrollToYearIndex(entryIdx, true, true);
        return;
      }

      wasPinnedRef.current = true;
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
      trackEl.style.setProperty("--storia-scroll-progress", progress.toFixed(4));
      const nextIdx = Math.min(
        total - 1,
        Math.max(0, Math.round(progress * (total - 1)))
      );
      if (nextIdx !== activeIdxRef.current) {
        activeIdxRef.current = nextIdx;
        onSelectIdxRef.current(nextIdx);
      }
    };

    const scheduleSync = () => {
      if (document.hidden) {
        syncEraFromScroll();
        return;
      }
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(syncEraFromScroll);
    };

    const isStagePinnedNow = (): boolean => {
      if (performance.now() < exitCooldownUntilRef.current) return false;
      const trackEl = scrollTrackRef.current;
      if (!trackEl) return false;
      const rect = trackEl.getBoundingClientRect();
      const viewportH = window.innerHeight;
      return rect.top <= 1.5 && rect.bottom >= viewportH - 1.5;
    };

    const tryStepByDirection = (dir: 1 | -1, event: Event): boolean => {
      const now = performance.now();
      const isLocked = now < stepLockUntilRef.current;
      const currentIdx = activeIdxRef.current;

      // Top boundary (1985) scrolling upward
      if (currentIdx <= 0 && dir === -1) {
        if (isLocked) {
          event.preventDefault();
          event.stopPropagation();
          return true;
        }
        wasPinnedRef.current = false;
        lastOutsideSideRef.current = "top";
        exitCooldownUntilRef.current = now + EXIT_COOLDOWN_MS;
        return false;
      }

      // Bottom boundary (2026) scrolling downward
      if (currentIdx >= total - 1 && dir === 1) {
        if (isLocked) {
          event.preventDefault();
          event.stopPropagation();
          return true;
        }
        wasPinnedRef.current = false;
        lastOutsideSideRef.current = "bottom";
        exitCooldownUntilRef.current = now + EXIT_COOLDOWN_MS;
        return false;
      }

      event.preventDefault();
      event.stopPropagation();

      if (isLocked) {
        wheelAccumRef.current = 0;
        return true;
      }

      scrollToYearIndex(currentIdx + dir, false, true);
      return true;
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      if (document.querySelector("dialog[open]")) return;

      const now = performance.now();
      recentGestureUntilRef.current = now + 1400;

      if (!isStagePinnedNow()) return;
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;

      const dir: 1 | -1 | 0 = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
      if (dir === 0) return;

      const currentIdx = activeIdxRef.current;
      const isAtExitEdgeUnlocked =
        now >= stepLockUntilRef.current &&
        ((currentIdx <= 0 && dir === -1) ||
          (currentIdx >= total - 1 && dir === 1));

      if (isAtExitEdgeUnlocked) {
        wasPinnedRef.current = false;
        lastOutsideSideRef.current = dir === -1 ? "top" : "bottom";
        exitCooldownUntilRef.current = now + EXIT_COOLDOWN_MS;
        wheelAccumRef.current = 0;
        return;
      }

      // Always intercept wheel inside the pinned timeline so fast scrolling
      // can never skip across multiple years.
      e.preventDefault();
      e.stopPropagation();

      if (now < stepLockUntilRef.current) {
        wheelAccumRef.current = 0;
        lastWheelTimeRef.current = now;
        return;
      }

      if (now - lastWheelTimeRef.current > 180) {
        wheelAccumRef.current = 0;
      }
      lastWheelTimeRef.current = now;

      if (
        (wheelAccumRef.current > 0 && dir === -1) ||
        (wheelAccumRef.current < 0 && dir === 1)
      ) {
        wheelAccumRef.current = 0;
      }

      wheelAccumRef.current += e.deltaY;

      if (Math.abs(wheelAccumRef.current) >= WHEEL_STEP_THRESHOLD) {
        wheelAccumRef.current = 0;
        scrollToYearIndex(currentIdx + dir, false, true);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      if ((e.target as HTMLElement | null)?.closest?.("[data-storia-scrubber]")) {
        touchStartYRef.current = null;
        return;
      }
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1 || touchStartYRef.current === null) return;
      if ((e.target as HTMLElement | null)?.closest?.("[data-storia-scrubber]")) {
        return;
      }
      if (document.querySelector("dialog[open]")) return;

      const now = performance.now();
      recentGestureUntilRef.current = now + 1400;

      if (!isStagePinnedNow()) return;

      const currentY = e.touches[0].clientY;
      const deltaY = touchStartYRef.current - currentY;
      if (Math.abs(deltaY) < 6) return;

      const dir: 1 | -1 = deltaY > 0 ? 1 : -1;
      const currentIdx = activeIdxRef.current;

      if (
        now >= stepLockUntilRef.current &&
        ((currentIdx <= 0 && dir === -1) ||
          (currentIdx >= total - 1 && dir === 1))
      ) {
        wasPinnedRef.current = false;
        lastOutsideSideRef.current = dir === -1 ? "top" : "bottom";
        exitCooldownUntilRef.current = now + EXIT_COOLDOWN_MS;
        touchStartYRef.current = currentY;
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      if (now < stepLockUntilRef.current) {
        touchStartYRef.current = currentY;
        return;
      }

      if (Math.abs(deltaY) >= TOUCH_STEP_THRESHOLD) {
        touchStartYRef.current = currentY;
        scrollToYearIndex(currentIdx + dir, false, true);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.querySelector("dialog[open]")) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("[data-storia-scrubber]")) return;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (!isStagePinnedNow()) return;

      if (e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)) {
        if (target?.tagName === "BUTTON" && e.key === " ") return;
        recentGestureUntilRef.current = performance.now() + 1400;
        tryStepByDirection(1, e);
      } else if (e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)) {
        recentGestureUntilRef.current = performance.now() + 1400;
        tryStepByDirection(-1, e);
      }
    };

    syncEraFromScroll();
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerUp, { passive: true });
    window.addEventListener("blur", handlePointerUp);
    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync, { passive: true });
    window.addEventListener("wheel", handleWheel, {
      capture: true,
      passive: false,
    });
    window.addEventListener("touchstart", handleTouchStart, {
      capture: true,
      passive: true,
    });
    window.addEventListener("touchmove", handleTouchMove, {
      capture: true,
      passive: false,
    });
    window.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("blur", handlePointerUp);
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      window.removeEventListener("wheel", handleWheel, { capture: true });
      window.removeEventListener("touchstart", handleTouchStart, {
        capture: true,
      });
      window.removeEventListener("touchmove", handleTouchMove, {
        capture: true,
      });
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      if (programmaticTimerRef.current !== null) {
        clearTimeout(programmaticTimerRef.current);
        programmaticTimerRef.current = null;
      }
    };
  }, [scrollToYearIndex, total]);

  const handleSelectMilestone = useCallback(
    (idx: number) => {
      scrollToYearIndex(idx, false, true);
    },
    [scrollToYearIndex]
  );

  const handleScrubMilestone = useCallback(
    (idx: number) => {
      scrollToYearIndex(idx, true, true);
    },
    [scrollToYearIndex]
  );

  return {
    scrollTrackRef,
    handleSelectMilestone,
    handleScrubMilestone,
  };
}

