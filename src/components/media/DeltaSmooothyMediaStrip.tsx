"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Play } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { useSmooothy } from "@/hooks/useSmooothy";
import { registerSyncedVideo } from "@/lib/videoFrameSync";
import {
  DELTA_SMOOOTHY_CARDS,
  SMOOOTHY_PAGINATION_SLIDES,
  type DeltaSmooothyCardItem,
} from "./deltaSmooothySlides";
import type { VideoTrack } from "./TbwaPillHero";

export {
  DELTA_SMOOOTHY_CARDS,
  SMOOOTHY_PAGINATION_SLIDES,
  type DeltaSmooothyCardItem,
};

export type SmooothyExampleMode =
  | "auto-scroll"
  | "parallax-speed"
  | "parallax-wave"
  | "controls-snap"
  | "variable-width";

// Triple the 10-video sequence (30 slides = 9,600px) with centered Smooothy origin
// so symmetricMod wraps >3,400px offscreen on both sides even on 5K ultra-wide displays.
const SMOOOTHY_INFINITE_SLIDES = [0, 1, 2].flatMap((cycleIdx) =>
  DELTA_SMOOOTHY_CARDS.map((card, index) => ({
    card,
    baseIndex: index,
    rawIndex: cycleIdx * DELTA_SMOOOTHY_CARDS.length + index,
    slideKey: `${card.id}-c${cycleIdx}`,
    isClone: cycleIdx !== 0,
  }))
);

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

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

export interface DeltaSmooothyMediaStripProps {
  activeTrackId?: string;
  isMusicPlaying?: boolean;
  onSelectTrack: (track: VideoTrack) => void;
  onPreviewTrack?: (track: VideoTrack) => void;
  onStopTrack?: () => void;
}

export default function DeltaSmooothyMediaStrip({
  activeTrackId,
  isMusicPlaying = false,
  onSelectTrack,
  onPreviewTrack,
  onStopTrack,
}: DeltaSmooothyMediaStripProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardBounceTargetsRef = useRef<HTMLElement[]>([]);
  const parallaxTargetsRef = useRef<HTMLElement[]>([]);

  // LinkSlider drag-vs-click state (matching https://smooothy.federic.ooo/examples LinkSlider)
  const linkPressRef = useRef<{
    x: number;
    y: number;
    time: number;
    dragged: boolean;
  }>({
    x: 0,
    y: 0,
    time: 0,
    dragged: false,
  });

  const mode = "parallax-speed" as SmooothyExampleMode;
  const isUserPaused = false;
  const [rawActiveSlide, setRawActiveSlide] = useState(0);
  const [pausedCardId, setPausedCardId] = useState<string | null>(null);
  const effectivePausedCardId = isMusicPlaying ? null : pausedCardId;

  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const isAutoScrollMode = mode === "auto-scroll";
  const isVariableWidth = mode === "variable-width";
  const isFullVideoCard = true;
  const isSnapHighlighted = !isAutoScrollMode;
  const reinitKey = mode;

  // Clamp full-bleed inner video parallax within the 1.24x overscan envelope (±11.5%)
  // so no black edge ever shows inside the rounded overflow-hidden video window.
  const maxParallaxPct = isFullVideoCard ? 11.2 : 22;

  const { wrapperRef, goToNext, goToPrev, goToIndex } = useSmooothy({
    uniqueCount: DELTA_SMOOOTHY_CARDS.length,
    autoScrollSpeed: isAutoScrollMode ? 0.36 : 0,
    isPaused: isUserPaused,
    prefersReducedMotion,
    enableMomentumThrow: true,
    reinitKey,
    config: {
      infinite: true,
      snap: !isAutoScrollMode,
      variableWidth: isVariableWidth,
      lerpFactor: 0.3,
      dragSensitivity: 0.005,
      speedDecay: 0.9,
      snapStrength: 0.1,
      scrollInput: isVariableWidth,
      scrollSensitivity: isVariableWidth ? 2.2 : 1.4,
    },
    onSlideChange: (_normalized, raw) => {
      setRawActiveSlide(raw);
    },
    onFrameUpdate: ({ instance, dampedSpeed }) => {
      const cardTargets = cardBounceTargetsRef.current;
      const targets = parallaxTargetsRef.current;
      const pValues = instance.parallaxValues;
      if (!pValues || (targets.length === 0 && cardTargets.length === 0)) return;

      const count = Math.max(targets.length, cardTargets.length);

      if (prefersReducedMotion) {
        for (let i = 0; i < count; i += 1) {
          cardTargets[i]?.style.setProperty("--smooothy-card-x", "0%");
          cardTargets[i]?.style.setProperty("--smooothy-card-y", "0%");
          targets[i]?.style.setProperty("--smooothy-px", "0%");
          targets[i]?.style.setProperty("--smooothy-py", "0%");
        }
        return;
      }

      const itemW = Math.max(instance.viewport.itemWidth || 320, 1);
      const halfWrapper = (instance.viewport.wrapperWidth || 1200) / 2;
      const absSpeed = Math.abs(dampedSpeed);

      for (let i = 0; i < count; i += 1) {
        const rawPv = pValues[i] ?? 0;
        const pv = instance.config.variableWidth
          ? (rawPv - halfWrapper) / itemW
          : rawPv;

        // 1. Official Smooothy `Parallax + speed.` outer card-spread bounce (`[data-smooothy-card]`):
        //    `offset = parallaxValues[i] * Math.abs(this.lspeed) * 20` (%)
        const cardEl = cardTargets[i];
        if (cardEl) {
          let cardX = 0;
          let cardY = 0;

          if (mode === "parallax-speed") {
            cardX = clamp(pv * absSpeed * 20, -160, 160);
          } else if (mode === "parallax-wave") {
            cardX = clamp(pv * absSpeed * 10, -120, 120);
            cardY = clamp(Math.sin(pv * 1.35) * 14, -22, 22);
          } else {
            cardX = clamp(pv * absSpeed * 14, -140, 140);
          }

          cardEl.style.setProperty("--smooothy-card-x", `${cardX.toFixed(2)}%`);
          cardEl.style.setProperty("--smooothy-card-y", `${cardY.toFixed(2)}%`);
        }

        // 2. Inner-window optical video parallax (`[data-smooothy-p]` inside overflow-hidden frame)
        const el = targets[i];
        if (el) {
          let shiftX = 0;
          let shiftY = 0;

          if (mode === "parallax-wave") {
            shiftY = clamp(
              Math.sin(pv * 1.45) * 7.5,
              -maxParallaxPct,
              maxParallaxPct
            );
            shiftX = clamp(-pv * 2.2, -maxParallaxPct, maxParallaxPct);
          } else {
            shiftX = clamp(
              -pv * 3.0 + pv * absSpeed * 2.4,
              -maxParallaxPct,
              maxParallaxPct
            );
          }

          el.style.setProperty("--smooothy-px", `${shiftX.toFixed(2)}%`);
          el.style.setProperty("--smooothy-py", `${shiftY.toFixed(2)}%`);
        }
      }
    },
  });

  // Cache [data-smooothy-card] & [data-smooothy-p] targets whenever structural layout re-initializes
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const cardElements = Array.from(
      wrapper.querySelectorAll<HTMLElement>("[data-smooothy-card]")
    );
    const elements = Array.from(
      wrapper.querySelectorAll<HTMLElement>("[data-smooothy-p]")
    );
    cardBounceTargetsRef.current = cardElements;
    parallaxTargetsRef.current = elements;
    return () => {
      for (const cardEl of cardElements) {
        cardEl.style.removeProperty("--smooothy-card-x");
        cardEl.style.removeProperty("--smooothy-card-y");
      }
      for (const el of elements) {
        el.style.removeProperty("--smooothy-px");
        el.style.removeProperty("--smooothy-py");
      }
      cardBounceTargetsRef.current = [];
      parallaxTargetsRef.current = [];
    };
  }, [reinitKey, wrapperRef]);

  // Viewport-gated playback for the 30 infinite <video> slides:
  // Plays visible/incoming videos smoothly and pauses offscreen buffer clones & reduced-motion sessions.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const videos = Array.from(wrapper.querySelectorAll<HTMLVideoElement>("video"));
    if (videos.length === 0) return;

    if (prefersReducedMotion) {
      for (const v of videos) {
        v.pause();
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && video.dataset.cardPaused !== "true") {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      {
        root: null,
        rootMargin: "240px 420px",
        threshold: 0.01,
      }
    );

    const unregisters = videos.map((v) =>
      registerSyncedVideo(v, v.getAttribute("src") ?? v.src, "card")
    );

    for (const v of videos) {
      observer.observe(v);
    }

    return () => {
      observer.disconnect();
      for (const unregister of unregisters) {
        unregister();
      }
      for (const v of videos) {
        v.pause();
      }
    };
  }, [reinitKey, prefersReducedMotion, wrapperRef]);

  // Keep user-stopped card preview video paused until resumed
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || prefersReducedMotion) return;
    const videos = Array.from(wrapper.querySelectorAll<HTMLVideoElement>("video"));
    for (const v of videos) {
      if (effectivePausedCardId && v.dataset.cardId === effectivePausedCardId) {
        v.pause();
      } else if (v.paused) {
        const rect = v.getBoundingClientRect();
        const inViewportWindow =
          rect.right >= -420 &&
          rect.left <= window.innerWidth + 420 &&
          rect.bottom >= -240 &&
          rect.top <= window.innerHeight + 240;
        if (inViewportWindow) {
          v.play().catch(() => {});
        }
      }
    }
  }, [effectivePausedCardId, prefersReducedMotion, wrapperRef]);

  // Sync carousel position when activeTrackId switches externally (e.g. hero chapters or vault)
  useEffect(() => {
    if (!activeTrackId) return;
    const matchedIdx = DELTA_SMOOOTHY_CARDS.findIndex(
      (c) => c.track.id === activeTrackId || c.track.youtubeId === activeTrackId
    );
    if (matchedIdx >= 0) {
      goToIndex(matchedIdx);
    }
  }, [activeTrackId, goToIndex]);

  const snapCarouselTo = (idx: number) => {
    goToIndex(idx);
  };

  const handleSelectDot = (idx: number) => {
    snapCarouselTo(idx);
    const targetCard = DELTA_SMOOOTHY_CARDS[idx];
    if (targetCard) {
      onPreviewTrack?.(targetCard.track);
    }
  };

  const handleCardToggle = (
    card: DeltaSmooothyCardItem,
    baseIndex: number,
    isSnappedCenter: boolean,
    isTrackPlayingMusic: boolean
  ) => {
    if (isTrackPlayingMusic) {
      setPausedCardId(card.id);
      const wrapper = wrapperRef.current;
      if (wrapper) {
        const cardVideos = wrapper.querySelectorAll<HTMLVideoElement>(
          `video[data-card-id="${card.id}"]`
        );
        for (const v of cardVideos) {
          v.pause();
        }
      }
      onStopTrack?.();
      return;
    }

    setPausedCardId(null);
    const wrapper = wrapperRef.current;
    if (wrapper && !prefersReducedMotion) {
      const cardVideos = wrapper.querySelectorAll<HTMLVideoElement>(
        `video[data-card-id="${card.id}"]`
      );
      for (const v of cardVideos) {
        v.play().catch(() => {});
      }
    }
    if (!isSnappedCenter) {
      snapCarouselTo(baseIndex);
    }
    onSelectTrack(card.track);
  };

  // Official KeyboardControls (smooothy.federic.ooo/examples): ArrowLeft, ArrowRight, 0–9
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goToPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goToNext();
    } else if (/^[0-9]$/.test(e.key)) {
      const digit = Number(e.key);
      const targetIdx = digit === 0 ? 9 : digit - 1;
      if (targetIdx < DELTA_SMOOOTHY_CARDS.length) {
        e.preventDefault();
        handleSelectDot(targetIdx);
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="delta-smooothy-heading"
      onKeyDown={handleKeyDown}
      className="relative flex w-full flex-col gap-4 pt-8 pb-8 select-none"
    >
      <SectionHeader
        id="delta-smooothy-heading"
        as="h2"
        srOnly
        title="Music Videos, Full Concerts & Live Broadcasts"
      />

      {/* ── OFFICIAL SMOOOTHY INFINITE VIDEO TRACK (https://smooothy.federic.ooo/examples) ── */}
      {/* Centered origin px-[calc(50%-halfSlide)] places currentSlide & parallaxValues=0 dead-center */}
      <div
        ref={wrapperRef}
        data-slider=""
        className={`flex w-full flex-nowrap overflow-x-clip py-4 cursor-grab active:cursor-grabbing transition-opacity ${
          isVariableWidth
            ? "px-0"
            : "px-[calc(50%-10rem)] sm:px-[calc(50%-11.25rem)] lg:px-[calc(50%-12.5rem)]"
        }`}
      >
        {SMOOOTHY_INFINITE_SLIDES.map(
          ({ card, baseIndex, rawIndex, slideKey, isClone }) => {
            const isActiveTrack =
              activeTrackId === card.track.id ||
              activeTrackId === card.track.youtubeId;
            const isTrackPlayingMusic = isActiveTrack && isMusicPlaying;
            const isSnappedCenter = rawActiveSlide === rawIndex;
            const isSpotlighted = !isSnapHighlighted || isSnappedCenter;

            const widthClass =
              isVariableWidth && card.wideFeature
                ? "w-100 sm:w-120 lg:w-140"
                : "w-80 sm:w-90 lg:w-100";

            return (
              <div
                key={slideKey}
                className={`group shrink-0 px-2 transition-opacity duration-300 ${widthClass} ${
                  isSpotlighted
                    ? "relative z-10 opacity-100"
                    : "opacity-40 hover:opacity-80 focus-within:opacity-100"
                }`}
              >
                <div
                  data-smooothy-card=""
                  onPointerDown={(e) => {
                    linkPressRef.current = {
                      x: e.clientX,
                      y: e.clientY,
                      time: performance.now(),
                      dragged: false,
                    };
                  }}
                  onPointerMove={(e) => {
                    if (!linkPressRef.current.time) return;
                    const dx = Math.abs(e.clientX - linkPressRef.current.x);
                    const dy = Math.abs(e.clientY - linkPressRef.current.y);
                    if (dx > 6 || dy > 6) {
                      linkPressRef.current.dragged = true;
                    }
                  }}
                  onPointerUp={(e) => {
                    const elapsed = performance.now() - linkPressRef.current.time;
                    const isPrimaryAction = e.pointerType !== "mouse" || e.button === 0;
                    const wasTap =
                      !linkPressRef.current.dragged &&
                      linkPressRef.current.time > 0 &&
                      elapsed < 750 &&
                      isPrimaryAction;
                    linkPressRef.current.time = 0;
                    linkPressRef.current.dragged = false;
                    if (wasTap) {
                      handleCardToggle(
                        card,
                        baseIndex,
                        isSnappedCenter,
                        isTrackPlayingMusic
                      );
                    }
                  }}
                  className="smooothy-card-bounce w-full"
                >
                  {/* LinkSlider pattern: pointer-events-none on button keeps drag 100% frictionless while preserving keyboard Tab + Enter/Space */}
                  <button
                    type="button"
                    tabIndex={isClone ? -1 : 0}
                    onClick={() => {
                      handleCardToggle(
                        card,
                        baseIndex,
                        isSnappedCenter,
                        isTrackPlayingMusic
                      );
                    }}
                    aria-pressed={isTrackPlayingMusic}
                    aria-current={
                      isSnappedCenter || isTrackPlayingMusic ? "true" : undefined
                    }
                    aria-label={`${card.track.name} — ${card.videoType}, ${card.originSubtitle} (${card.track.duration}), ${
                      isTrackPlayingMusic ? "stop playback" : "play music"
                    }`}
                    className={`pointer-events-none flex w-full flex-col items-center gap-3 text-center transition-transform duration-300 ease-out motion-reduce:scale-100 focus-visible:outline-none ${
                      isSpotlighted
                        ? "scale-103"
                        : "scale-94 group-hover:scale-97 group-focus-within:scale-100"
                    }`}
                  >
                  {isFullVideoCard ? (
                    /* Full-Bleed Rounded Live Video Card with Smooothy Inner-Window Parallax */
                    <div
                      className={`relative flex h-46 sm:h-50 lg:h-56 w-full items-center justify-center overflow-hidden rounded-lg bg-zinc-950 transition-all duration-300 group-focus-within:ring-2 group-focus-within:ring-purple-400 ${
                        isSnappedCenter
                          ? "ring-2 ring-purple-400 shadow-2xl shadow-purple-500/45"
                          : isTrackPlayingMusic
                            ? "ring-2 ring-purple-400/80 shadow-lg"
                            : "ring-1 ring-white/10 shadow-lg group-hover:ring-purple-400/50"
                      }`}
                    >
                      <div
                        data-smooothy-p=""
                        className="smooothy-delta-parallax smooothy-video-bleed relative size-full"
                      >
                        <video
                          src={card.previewVideoSrc}
                          poster={card.coverSrc}
                          data-card-id={card.id}
                          data-card-center={isSnappedCenter ? "true" : undefined}
                          data-card-paused={
                            effectivePausedCardId === card.id ? "true" : undefined
                          }
                          width={640}
                          height={360}
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          className="pointer-events-none size-full object-cover"
                        />
                      </div>

                      {/* Subtle Bottom Cinema Scrim + Duration & Active Music Indicator */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"
                      />

                      <div className="pointer-events-none absolute inset-x-3 bottom-2.5 z-10 flex items-center justify-between gap-2">
                        <span className="inline-flex min-w-0 items-center gap-1.5 font-sans text-xs font-medium text-white/95 drop-shadow-xs">
                          {isTrackPlayingMusic ? (
                            <>
                              <span className="size-1.5 shrink-0 rounded-full bg-purple-400 animate-pulse" />
                              <span className="font-semibold text-purple-200">
                                PLAYING • {card.videoType}
                              </span>
                            </>
                          ) : (
                            <>
                              <Play className="size-3 shrink-0 fill-white text-white opacity-85 group-hover:opacity-100 transition-opacity" />
                              <span className="truncate font-medium">
                                {card.videoType}
                              </span>
                            </>
                          )}
                        </span>

                        {card.track.duration && (
                          <span className="rounded-full bg-black/60 px-2 py-0.5 font-sans text-xs font-medium tabular-nums text-white/90 ring-1 ring-white/15 backdrop-blur-xs">
                            {card.track.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Jewel-Toned Delta Tile Framing a Live 16:9 Playing Video */
                    <div
                      className={`relative flex h-46 sm:h-56 lg:h-60 w-full items-center justify-center overflow-hidden rounded-lg transition-all duration-300 ${card.tileClass} group-focus-within:ring-2 group-focus-within:ring-purple-400 ${
                        isSnappedCenter
                          ? "ring-2 ring-purple-400 shadow-2xl shadow-purple-500/45"
                          : isTrackPlayingMusic
                            ? "ring-2 ring-purple-400/80"
                            : ""
                      }`}
                    >
                      <div
                        data-smooothy-p=""
                        className="smooothy-delta-parallax delta-expo-media relative z-10 flex h-[78%] aspect-video items-center justify-center overflow-hidden rounded-md bg-zinc-950 shadow-[0_12px_22px_rgba(0,0,0,0.5)] ring-1 ring-white/20"
                      >
                        <video
                          src={card.previewVideoSrc}
                          poster={card.coverSrc}
                          data-card-id={card.id}
                          data-card-center={isSnappedCenter ? "true" : undefined}
                          data-card-paused={
                            effectivePausedCardId === card.id ? "true" : undefined
                          }
                          width={640}
                          height={360}
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          className="pointer-events-none size-full object-cover"
                        />
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent"
                        />
                        {isTrackPlayingMusic && (
                          <span className="pointer-events-none absolute left-2 bottom-1.5 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 font-sans text-xs font-semibold text-purple-200">
                            <span className="size-1.5 rounded-full bg-purple-400 animate-pulse" />
                            <span>PLAYING</span>
                          </span>
                        )}
                        {card.track.duration && (
                          <span className="pointer-events-none absolute right-2 bottom-1.5 rounded-full bg-black/65 px-1.5 py-0.5 font-sans text-xs tabular-nums text-white/90">
                            {card.track.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Readable Site-Font Subtitle + Bold Display Title */}
                  <div className="delta-expo-caption flex flex-col items-center gap-1 px-1">
                    <span
                      className={`font-sans text-sm sm:text-base font-medium leading-snug transition-colors ${
                        isSpotlighted
                          ? "text-purple-200"
                          : "text-purple-200/65 group-hover:text-purple-200/90"
                      }`}
                    >
                      {card.originSubtitle}
                    </span>
                    <span
                      className={`font-heading text-xl sm:text-2xl uppercase leading-tight line-clamp-1 transition-colors ${
                        isTrackPlayingMusic
                          ? "text-purple-300"
                          : isSpotlighted
                            ? "text-white"
                            : "text-white/75 group-hover:text-purple-200"
                      }`}
                    >
                      {card.track.name}
                    </span>
                  </div>
                  </button>
                </div>
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}
