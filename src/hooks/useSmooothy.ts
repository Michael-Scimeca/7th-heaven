"use client";

import { useCallback, useEffect, useEffectEvent, useRef } from "react";
import Core, { damp, lerp, type CoreConfig } from "smooothy";
import gsap from "gsap";

export interface SmooothyFramePayload {
  instance: Core;
  dt: number;
  /** Signed velocity in normalized slide-units per second (continuous across infinite wraps). */
  normalizedVelocity: number;
  /** Frame-rate independent exponentially damped velocity (`damp` from `smooothy`). */
  dampedSpeed: number;
  /** Smoothly eased 0..1 progress across the unique item set. */
  easedProgress: number;
}

export interface UseSmooothyOptions {
  config?: Partial<CoreConfig>;
  /** Number of unique logical cards (used for shortest-path infinite index navigation). */
  uniqueCount: number;
  /** Auto-scroll speed in slide-units/sec (0 disables continuous auto-scroll). */
  autoScrollSpeed?: number;
  /** User-controlled pause state for auto-scroll. */
  isPaused?: boolean;
  /** Respect OS reduced-motion preference. */
  prefersReducedMotion?: boolean;
  /** Project drag velocity onto `slider.target` on pointer release for fluid flick inertia. */
  enableMomentumThrow?: boolean;
  /** Key that triggers clean Core teardown & re-initialization when structural layout changes. */
  reinitKey?: string;
  onSlideChange?: (normalizedIndex: number, rawIndex: number) => void;
  onFrameUpdate?: (payload: SmooothyFramePayload) => void;
}

/**
 * Official Smooothy React integration hook modeled on https://smooothy.federic.ooo/examples
 * (`ReactSlider`, `AutoScrollSlider`, `ParallaxSpeed`, `ControlsSlider`, `VariableWidthSlider`).
 */
export function useSmooothy({
  config,
  uniqueCount,
  autoScrollSpeed = 0,
  isPaused = false,
  prefersReducedMotion = false,
  enableMomentumThrow = true,
  reinitKey = "default",
  onSlideChange,
  onFrameUpdate,
}: UseSmooothyOptions) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<Core | null>(null);

  // Latest reactive flags read inside the 60fps/120fps GSAP ticker without tearing down Core
  const autoScrollSpeedRef = useRef(autoScrollSpeed);
  const isPausedRef = useRef(isPaused);
  const reducedMotionRef = useRef(prefersReducedMotion);
  const momentumThrowRef = useRef(enableMomentumThrow);

  useEffect(() => {
    autoScrollSpeedRef.current = autoScrollSpeed;
    isPausedRef.current = isPaused;
    reducedMotionRef.current = prefersReducedMotion;
    momentumThrowRef.current = enableMomentumThrow;
  }, [autoScrollSpeed, isPaused, prefersReducedMotion, enableMomentumThrow]);

  const emitSlideChange = useEffectEvent((rawCurrent: number) => {
    if (!onSlideChange || uniqueCount <= 0) return;
    const normalized = ((rawCurrent % uniqueCount) + uniqueCount) % uniqueCount;
    onSlideChange(normalized, rawCurrent);
  });

  const emitFrameUpdate = useEffectEvent((payload: SmooothyFramePayload) => {
    onFrameUpdate?.(payload);
  });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let interactionPaused = false;
    let wasDragging = false;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;

    let prevCurrent = 0;
    let prevTarget = 0;
    let hasFirstFrame = false;
    let dampedSpeed = 0;
    let dragTargetVelocity = 0;
    let easedProgress = 0;

    const slider = new Core(wrapper, {
      infinite: true,
      snap: true,
      lerpFactor: 0.3,
      dragSensitivity: 0.0055,
      speedDecay: 0.9,
      snapStrength: 0.11,
      scrollSensitivity: 2.2,
      virtualScroll: {
        mouseMultiplier: 0.85,
        touchMultiplier: 2,
        firefoxMultiplier: 30,
        useKeyboard: false,
        passive: true,
      },
      ...config,
      onSlideChange: (current) => {
        emitSlideChange(current);
      },
      onUpdate: (instance) => {
        const rawDt = instance.deltaTime;
        const dt = rawDt > 0 && rawDt < 0.1 ? rawDt : 0.016;
        const unitScale = instance.config.variableWidth
          ? Math.max(instance.viewport.itemWidth || 288, 1)
          : 1;

        if (!hasFirstFrame) {
          prevCurrent = instance.current;
          prevTarget = instance.target;
          hasFirstFrame = true;
        }

        const normalizedVelocity =
          (instance.current - prevCurrent) / unitScale / dt;
        const targetVelocity =
          (instance.target - prevTarget) / unitScale / dt;

        prevCurrent = instance.current;
        prevTarget = instance.target;

        if (instance.isDragging) {
          dragTargetVelocity = damp(dragTargetVelocity, targetVelocity, 14, dt);
        }

        // Official ParallaxSpeed formula (smooothy.federic.ooo/examples):
        // Uses Core's native `instance.speed` during pointer drag / wheel swipe,
        // with scaled travel velocity fallback during arrow / dot / auto-scroll transitions.
        const effectiveSpeed =
          Math.abs(instance.speed) > 0.001
            ? instance.speed
            : normalizedVelocity * 0.38;
        dampedSpeed = damp(dampedSpeed, effectiveSpeed, 5, dt);

        // Compute normalized 0..1 progress over uniqueCount (callbacks.md Progress bar)
        let cycleProgress = instance.getProgress();
        if (!instance.config.variableWidth && uniqueCount > 0) {
          const slidePos = -instance.current;
          cycleProgress =
            (((slidePos % uniqueCount) + uniqueCount) % uniqueCount) /
            uniqueCount;
        }
        easedProgress = lerp(easedProgress, cycleProgress, 0.14);

        emitFrameUpdate({
          instance,
          dt,
          normalizedVelocity,
          dampedSpeed,
          easedProgress,
        });
      },
    });

    // Reset Core's internal timestamp (#Y = performance.now()) so frame 1 deltaTime doesn't spike
    slider.init();
    sliderRef.current = slider;
    emitSlideChange(slider.currentSlide);

    const clearResumeTimer = () => {
      if (resumeTimer) {
        clearTimeout(resumeTimer);
        resumeTimer = null;
      }
    };

    // Official AutoScrollSlider 2000ms post-interaction resume delay
    const scheduleResume = () => {
      clearResumeTimer();
      resumeTimer = setTimeout(() => {
        interactionPaused = false;
      }, 2000);
    };

    const onMouseEnter = () => {
      clearResumeTimer();
      interactionPaused = true;
    };
    const onMouseLeave = () => {
      interactionPaused = false;
    };
    const onFocusIn = () => {
      clearResumeTimer();
      interactionPaused = true;
    };
    const onFocusOut = () => {
      interactionPaused = false;
    };
    const onTouchStart = () => {
      clearResumeTimer();
      interactionPaused = true;
    };
    const onTouchEnd = () => {
      scheduleResume();
    };

    wrapper.addEventListener("mouseenter", onMouseEnter);
    wrapper.addEventListener("mouseleave", onMouseLeave);
    wrapper.addEventListener("focusin", onFocusIn);
    wrapper.addEventListener("focusout", onFocusOut);
    wrapper.addEventListener("touchstart", onTouchStart, { passive: true });
    wrapper.addEventListener("touchend", onTouchEnd, { passive: true });

    const tick = () => {
      if (document.hidden) return;

      // Detect drag start / release before Core.update() for momentum throw & auto-scroll pause
      if (slider.isDragging && !wasDragging) {
        clearResumeTimer();
        interactionPaused = true;
        wasDragging = true;
        dragTargetVelocity = 0;
      } else if (!slider.isDragging && wasDragging) {
        wasDragging = false;
        if (
          momentumThrowRef.current &&
          !reducedMotionRef.current &&
          Math.abs(dragTargetVelocity) > 0.55
        ) {
          const unitScale = slider.config.variableWidth
            ? Math.max(slider.viewport.itemWidth || 288, 1)
            : 1;
          const clampedSlidesThrow = Math.max(
            -4.5,
            Math.min(4.5, dragTargetVelocity * 0.18)
          );
          const nextTarget = slider.target + clampedSlidesThrow * unitScale;
          slider.target =
            slider.config.snap && !slider.config.variableWidth
              ? Math.round(nextTarget)
              : nextTarget;
        }
        dragTargetVelocity = 0;
        scheduleResume();
      }

      // Official AutoScrollSlider continuous target advance before Core.update()
      const speed = autoScrollSpeedRef.current;
      const safeDt =
        slider.deltaTime > 0 && slider.deltaTime < 0.1
          ? slider.deltaTime
          : 0.016;
      if (
        speed > 0 &&
        !isPausedRef.current &&
        !reducedMotionRef.current &&
        !interactionPaused &&
        slider.isVisible &&
        !slider.isDragging
      ) {
        const unitScale = slider.config.variableWidth
          ? Math.max(slider.viewport.itemWidth || 288, 1)
          : 1;
        slider.target -= speed * unitScale * safeDt;
      }

      slider.update();
    };

    gsap.ticker.add(tick);

    return () => {
      clearResumeTimer();
      gsap.ticker.remove(tick);
      wrapper.removeEventListener("mouseenter", onMouseEnter);
      wrapper.removeEventListener("mouseleave", onMouseLeave);
      wrapper.removeEventListener("focusin", onFocusIn);
      wrapper.removeEventListener("focusout", onFocusOut);
      wrapper.removeEventListener("touchstart", onTouchStart);
      wrapper.removeEventListener("touchend", onTouchEnd);
      slider.paused = true;
      (
        slider as Core & { virtualScroll?: { destroy?: () => void } }
      ).virtualScroll?.destroy?.();
      slider.destroy();
      sliderRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reinitKey, uniqueCount]);

  const goToNext = useCallback(() => {
    sliderRef.current?.goToNext();
  }, []);

  const goToPrev = useCallback(() => {
    sliderRef.current?.goToPrev();
  }, []);

  /** Shortest-path infinite navigation to a logical card index `0..uniqueCount-1`. */
  const goToIndex = useCallback(
    (baseIndex: number) => {
      const slider = sliderRef.current;
      if (!slider || uniqueCount <= 0) return;
      const normalizedTarget =
        ((baseIndex % uniqueCount) + uniqueCount) % uniqueCount;

      if (slider.config.variableWidth) {
        const totalItems = slider.items.length;
        const curRaw = slider.currentSlide;
        let bestIdx = normalizedTarget;
        let bestDist = Number.POSITIVE_INFINITY;
        for (let k = normalizedTarget; k < totalItems; k += uniqueCount) {
          const direct = Math.abs(k - curRaw);
          const wrapped = totalItems - direct;
          const dist = Math.min(direct, wrapped);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = k;
          }
        }
        slider.goToIndex(bestIdx);
        return;
      }

      if (slider.config.infinite) {
        const curSlidePos = -slider.target;
        const curBase =
          ((curSlidePos % uniqueCount) + uniqueCount) % uniqueCount;
        let delta = normalizedTarget - curBase;
        if (delta > uniqueCount / 2) delta -= uniqueCount;
        if (delta < -uniqueCount / 2) delta += uniqueCount;
        slider.target = slider.config.snap
          ? Math.round(-(curSlidePos + delta))
          : -(curSlidePos + delta);
      } else {
        slider.goToIndex(normalizedTarget);
      }
    },
    [uniqueCount]
  );

  return {
    wrapperRef,
    sliderRef,
    goToNext,
    goToPrev,
    goToIndex,
  };
}

