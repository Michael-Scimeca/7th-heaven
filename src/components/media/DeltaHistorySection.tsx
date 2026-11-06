/* eslint-disable react-doctor/no-event-handler, react-doctor/no-pass-data-to-parent, react-doctor/no-pass-live-state-to-parent */
"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  StoriaLeftMeridianLayout,
  type StoriaStageLayoutProps,
} from "./storia/StoriaArcLayouts";
import { STORIA_ALL_YEARS_MILESTONES } from "./storia/storiaAllYearsData";

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export interface StoriaBackdropSyncState {
  isActive: boolean;
  activeIdx: number;
  prevIdx?: number | null;
}

export interface DeltaHistorySectionProps {
  onExploreArchive?: () => void;
  onSectionBackdropChange?: (state: StoriaBackdropSyncState) => void;
}

export default function DeltaHistorySection({
  onExploreArchive,
  onSectionBackdropChange,
}: DeltaHistorySectionProps) {
  const [eraState, setEraState] = useState<{
    activeIdx: number;
    prevIdx: number | null;
  }>({
    activeIdx: 0,
    prevIdx: null,
  });
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);

  const sectionRef = useRef<HTMLElement>(null);
  const backdropCallbackRef = useRef(onSectionBackdropChange);
  const eraIdxPairRef = useRef<{ activeIdx: number; prevIdx: number | null }>({
    activeIdx: 0,
    prevIdx: null,
  });
  const lastEmittedRef = useRef<{
    isActive: boolean;
    activeIdx: number;
    prevIdx: number | null;
  }>({
    isActive: false,
    activeIdx: -1,
    prevIdx: null,
  });

  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const maxIdx = STORIA_ALL_YEARS_MILESTONES.length - 1;
  const safeActiveIdx = Math.min(eraState.activeIdx, maxIdx);
  const safePrevIdx =
    eraState.prevIdx !== null ? Math.min(eraState.prevIdx, maxIdx) : null;

  const handleSelectIdx = useCallback(
    (nextIdx: number) => {
      const clampedNext = Math.max(0, Math.min(maxIdx, nextIdx));
      const currentActive = eraIdxPairRef.current.activeIdx;
      if (currentActive === clampedNext) return;

      eraIdxPairRef.current = {
        activeIdx: clampedNext,
        prevIdx: currentActive,
      };
      setEraState({
        activeIdx: clampedNext,
        prevIdx: currentActive,
      });

      const cb = backdropCallbackRef.current;
      const sectionEl = sectionRef.current;
      if (cb && sectionEl) {
        const rect = sectionEl.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const isActive =
          rect.top <= viewportH * 0.5 && rect.bottom >= viewportH * 0.42;
        lastEmittedRef.current = {
          isActive,
          activeIdx: clampedNext,
          prevIdx: currentActive,
        };
        cb({
          isActive,
          activeIdx: clampedNext,
          prevIdx: currentActive,
        });
      }
    },
    [maxIdx]
  );

  useEffect(() => {
    backdropCallbackRef.current = onSectionBackdropChange;
  }, [onSectionBackdropChange]);

  useEffect(() => {
    eraIdxPairRef.current = {
      activeIdx: safeActiveIdx,
      prevIdx: safePrevIdx,
    };
    const cb = backdropCallbackRef.current;
    const sectionEl = sectionRef.current;
    if (!cb || !sectionEl) return;

    const rect = sectionEl.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const isActive = rect.top <= viewportH * 0.5 && rect.bottom >= viewportH * 0.42;

    if (
      lastEmittedRef.current.isActive !== isActive ||
      lastEmittedRef.current.activeIdx !== safeActiveIdx ||
      lastEmittedRef.current.prevIdx !== safePrevIdx
    ) {
      lastEmittedRef.current = {
        isActive,
        activeIdx: safeActiveIdx,
        prevIdx: safePrevIdx,
      };
      cb({
        isActive,
        activeIdx: safeActiveIdx,
        prevIdx: safePrevIdx,
      });
    }
  }, [safeActiveIdx, safePrevIdx]);

  useEffect(() => {
    let rafId: number | null = null;

    const evaluateVisibility = () => {
      rafId = null;
      const sectionEl = sectionRef.current;
      if (!sectionEl) return;

      const rect = sectionEl.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const isTopPinned = rect.top <= 120 && rect.bottom >= viewportH * 0.5;
      document.body.dataset.storiaPinned = isTopPinned ? "true" : "false";

      const cb = backdropCallbackRef.current;
      if (!cb) return;

      const isActive =
        rect.top <= viewportH * 0.5 && rect.bottom >= viewportH * 0.42;
      const { activeIdx: idx, prevIdx } = eraIdxPairRef.current;

      if (
        lastEmittedRef.current.isActive !== isActive ||
        (isActive &&
          (lastEmittedRef.current.activeIdx !== idx ||
            lastEmittedRef.current.prevIdx !== prevIdx))
      ) {
        lastEmittedRef.current = { isActive, activeIdx: idx, prevIdx };
        cb({ isActive, activeIdx: idx, prevIdx });
      }
    };

    const scheduleCheck = () => {
      if (document.hidden) {
        evaluateVisibility();
        return;
      }
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(evaluateVisibility);
    };

    evaluateVisibility();
    window.addEventListener("scroll", scheduleCheck, { passive: true });
    window.addEventListener("resize", scheduleCheck, { passive: true });

    return () => {
      window.removeEventListener("scroll", scheduleCheck);
      window.removeEventListener("resize", scheduleCheck);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      delete document.body.dataset.storiaPinned;
      backdropCallbackRef.current?.({
        isActive: false,
        activeIdx: 0,
        prevIdx: null,
      });
    };
  }, []);

  const handleExploreClick = () => {
    if (onExploreArchive) {
      onExploreArchive();
      return;
    }
    const vaultEl = document.getElementById("partnerships-vault");
    vaultEl?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const stageProps: StoriaStageLayoutProps = {
    milestones: STORIA_ALL_YEARS_MILESTONES,
    activeIdx: safeActiveIdx,
    prevIdx: safePrevIdx,
    onSelectIdx: handleSelectIdx,
    isDossierOpen,
    onToggleDossier: () => setIsDossierOpen((prev) => !prev),
    onExploreArchive: handleExploreClick,
    prefersReducedMotion,
    hasExternalBackdrop: Boolean(onSectionBackdropChange),
  };

  return (
    <section
      ref={sectionRef}
      id="delta-history"
      aria-labelledby="delta-history-heading"
      className="delta-history-section relative flex w-full flex-col overflow-x-clip select-none"
    >
      {/* ── SCROLL-DRIVEN 42-YEAR LEFT MERIDIAN TIMELINE & MEDIA MOSAIC ── */}
      <div data-no-text-anim className="relative z-10 w-full">
        <StoriaLeftMeridianLayout {...stageProps} />
      </div>
    </section>
  );
}
