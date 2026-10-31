"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { videoThumb } from "@/lib/videoThumb";
import { useSmooothy } from "@/hooks/useSmooothy";
import type { VideoTrack } from "./TbwaPillHero";
import type { HeroLayoutId } from "./TbwaHeroOverlays";

export type SmooothyExampleMode =
  | "auto-scroll"
  | "parallax-speed"
  | "parallax-wave"
  | "controls-snap"
  | "variable-width";

export interface DeltaSmooothyCardItem {
  id: string;
  tileClass: string;
  packTitle: string;
  originSubtitle: string;
  scriptColorClass: string;
  previewVideoSrc: string;
  coverSrc: string;
  wideFeature?: boolean;
  track: VideoTrack;
}

export const DELTA_SMOOOTHY_CARDS: readonly DeltaSmooothyCardItem[] = [
  {
    id: "delta-better-this-way",
    tileClass: "delta-tile-taupe",
    packTitle: "CHICAGO",
    originSubtitle: "Billboard #1",
    scriptColorClass: "text-amber-300",
    previewVideoSrc: "/movie/previews/FMo5aARV1MA.mp4",
    coverSrc: videoThumb("FMo5aARV1MA"),
    wideFeature: true,
    track: {
      id: "better-this-way",
      name: "Better This Way",
      badge: "BILLBOARD #1",
      subtitle: "Billboard Top 40 Single • #1 on Midwest Radio Charts",
      src: "/movie/color-in-motion-clip.mp4",
      youtubeId: "FMo5aARV1MA",
      year: "2019",
      duration: "4:54",
    },
  },
  {
    id: "delta-aint-that-just-beautiful",
    tileClass: "delta-tile-emerald",
    packTitle: "STUDIO 4K",
    originSubtitle: "2025 Release",
    scriptColorClass: "text-emerald-300",
    previewVideoSrc: "/movie/previews/BzHUNTZ66zY.mp4",
    coverSrc: videoThumb("BzHUNTZ66zY"),
    track: {
      id: "aint-that-just-beautiful",
      name: "Ain't That Just Beautiful",
      badge: "OFFICIAL 4K RELEASE",
      subtitle: "Official Studio Music Video • Worldwide 4K Release",
      src: "/movie/loops/aint-that-just-beautiful-30s.mp4",
      youtubeId: "BzHUNTZ66zY",
      year: "2025",
      duration: "3:35",
    },
  },
  {
    id: "delta-are-we-there-yet",
    tileClass: "delta-tile-cobalt",
    packTitle: "TOP 40 HIT",
    originSubtitle: "Billboard Single",
    scriptColorClass: "text-sky-300",
    previewVideoSrc: "/movie/previews/Es4TIoA2Emg.mp4",
    coverSrc: videoThumb("Es4TIoA2Emg"),
    wideFeature: true,
    track: {
      id: "Es4TIoA2Emg",
      name: "Are We There Yet",
      badge: "BILLBOARD TOP 40",
      subtitle: "Billboard Top 40 Radio Single • Official Music Video",
      src: "/movie/loops/are-we-there-yet-30s.mp4",
      youtubeId: "Es4TIoA2Emg",
      year: "2021",
      duration: "3:57",
    },
  },
  {
    id: "delta-monster",
    tileClass: "delta-tile-plum",
    packTitle: "MONSTER",
    originSubtitle: "Studio Cut",
    scriptColorClass: "text-purple-300",
    previewVideoSrc: "/movie/previews/SWV7-pmtoA8.mp4",
    coverSrc: videoThumb("SWV7-pmtoA8"),
    track: {
      id: "monster-rock",
      name: "Monster",
      badge: "STUDIO CUT",
      subtitle: "High-Energy Hard Rock Single • Official Video",
      src: "/movie/loops/monster-30s.mp4",
      youtubeId: "SWV7-pmtoA8",
      year: "2021",
      duration: "4:48",
    },
  },
  {
    id: "delta-sing",
    tileClass: "delta-tile-cerulean",
    packTitle: "MIDWEST",
    originSubtitle: "Fan Anthem",
    scriptColorClass: "text-cyan-300",
    previewVideoSrc: "/movie/previews/wDEXG3kHjqk.mp4",
    coverSrc: videoThumb("wDEXG3kHjqk"),
    track: {
      id: "sing-anthem",
      name: "Sing",
      badge: "FAN FAVORITE",
      subtitle: "Signature Live Radio Single & Fan Anthem",
      src: "/movie/luminous-clip.mp4",
      youtubeId: "wDEXG3kHjqk",
      year: "2017",
      duration: "3:38",
    },
  },
  {
    id: "delta-taste-of-chicago",
    tileClass: "delta-tile-crimson",
    packTitle: "GRANT PARK",
    originSubtitle: "Full Concert",
    scriptColorClass: "text-rose-300",
    previewVideoSrc: "/movie/previews/8QJ7XfltJIM.mp4",
    coverSrc: videoThumb("8QJ7XfltJIM"),
    wideFeature: true,
    track: {
      id: "taste-of-chicago-live",
      name: "Taste of Chicago Headline",
      badge: "LIVE ARENA TOUR",
      subtitle: "Grant Park Main Stage • 35,000+ Festival Goers",
      src: "/movie/previews/8QJ7XfltJIM.mp4",
      youtubeId: "8QJ7XfltJIM",
      year: "2024",
      duration: "45:20",
    },
  },
  {
    id: "delta-30-in-30",
    tileClass: "delta-tile-forest",
    packTitle: "30-IN-30",
    originSubtitle: "Speed Medley",
    scriptColorClass: "text-lime-300",
    previewVideoSrc: "/movie/previews/1XViDUo1FvI.mp4",
    coverSrc: videoThumb("1XViDUo1FvI"),
    track: {
      id: "1XViDUo1FvI",
      name: "80s Rock Anthem Medley",
      badge: "THE 30-IN-30 MEDLEYS",
      subtitle: "Signature 7th Heaven Marathon • 30 Songs in 30 Minutes",
      src: "/movie/previews/1XViDUo1FvI.mp4",
      youtubeId: "1XViDUo1FvI",
      year: "2024",
      duration: "30:00",
    },
  },
  {
    id: "delta-wgn-live",
    tileClass: "delta-tile-terracotta",
    packTitle: "WGN 9 TV",
    originSubtitle: "Broadcast",
    scriptColorClass: "text-orange-300",
    previewVideoSrc: "/movie/previews/UXexWLnSI_w.mp4",
    coverSrc: videoThumb("UXexWLnSI_w"),
    track: {
      id: "UXexWLnSI_w",
      name: "WGN Morning News Live Set",
      badge: "TV & NATIONAL PRESS",
      subtitle: "WGN Studios Chicago • Live Morning Broadcast",
      src: "/movie/previews/UXexWLnSI_w.mp4",
      youtubeId: "UXexWLnSI_w",
      year: "2024",
      duration: "3:28",
    },
  },
  {
    id: "delta-caribbean-cruise",
    tileClass: "delta-tile-amber",
    packTitle: "CARIBBEAN",
    originSubtitle: "At Sea",
    scriptColorClass: "text-yellow-300",
    previewVideoSrc: "/movie/previews/OGV1oXbHwUw.mp4",
    coverSrc: videoThumb("OGV1oXbHwUw"),
    wideFeature: true,
    track: {
      id: "OGV1oXbHwUw",
      name: "Cozumel Sailaway Party",
      badge: "CARIBBEAN CRUISE",
      subtitle: "Royal Caribbean Concert Series • Pool Deck Main Stage",
      src: "/movie/cruise-desktop.mp4",
      youtubeId: "OGV1oXbHwUw",
      year: "2024",
      duration: "22:15",
    },
  },
  {
    id: "delta-arcada-4k",
    tileClass: "delta-tile-botanical",
    packTitle: "ARCADA 4K",
    originSubtitle: "Proscenium",
    scriptColorClass: "text-emerald-300",
    previewVideoSrc: "/movie/previews/3ZhqLJDRxQ8.mp4",
    coverSrc: videoThumb("3ZhqLJDRxQ8"),
    track: {
      id: "3ZhqLJDRxQ8",
      name: "Arcada Theatre 4K Concert",
      badge: "HISTORIC THEATRE",
      subtitle: "Complete Multi-Camera 4K Theater Broadcast",
      src: "/movie/previews/3ZhqLJDRxQ8.mp4",
      youtubeId: "3ZhqLJDRxQ8",
      year: "2023",
      duration: "1:12:00",
    },
  },
];

// Official interactive examples from https://smooothy.federic.ooo/examples
const EXAMPLE_MODES: readonly {
  id: SmooothyExampleMode;
  label: string;
}[] = [
  { id: "parallax-speed", label: "Parallax + Speed" },
  { id: "auto-scroll", label: "Auto-Scroll" },
  { id: "parallax-wave", label: "Parallax" },
  { id: "controls-snap", label: "Controls & Snap" },
  { id: "variable-width", label: "Variable Width" },
];

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
  heroVariant?: HeroLayoutId;
  onSelectHeroVariant?: (id: HeroLayoutId) => void;
}

export default function DeltaSmooothyMediaStrip({
  activeTrackId,
  isMusicPlaying = false,
  onSelectTrack,
  heroVariant = 0,
  onSelectHeroVariant,
}: DeltaSmooothyMediaStripProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
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

  const [mode, setMode] = useState<SmooothyExampleMode>("parallax-speed");
  const [cardVisualStyle, setCardVisualStyle] = useState<"full-video" | "color-mat">(
    "full-video"
  );
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [rawActiveSlide, setRawActiveSlide] = useState(0);

  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const isAutoScrollMode = mode === "auto-scroll";
  const isVariableWidth = mode === "variable-width";
  const isFullVideoCard = cardVisualStyle === "full-video";
  const isSnapHighlighted =
    mode === "controls-snap" || mode === "variable-width";
  const reinitKey = `${mode}-${cardVisualStyle}`;

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
    onSlideChange: (normalized, raw) => {
      setCurrentSlide(normalized);
      setRawActiveSlide(raw);
    },
    onFrameUpdate: ({ instance, dampedSpeed, easedProgress }) => {
      if (progressFillRef.current) {
        progressFillRef.current.style.setProperty(
          "--smooothy-progress",
          easedProgress.toFixed(4)
        );
      }

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
          if (entry.isIntersecting) {
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

    for (const v of videos) {
      observer.observe(v);
    }

    return () => {
      observer.disconnect();
      for (const v of videos) {
        v.pause();
      }
    };
  }, [reinitKey, prefersReducedMotion, wrapperRef]);

  const handleSelectDot = (idx: number) => {
    goToIndex(idx);
    setCurrentSlide(idx);
  };

  // Official KeyboardControls (smooothy.federic.ooo/examples): ArrowLeft, ArrowRight, Space, 0–9
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goToPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goToNext();
    } else if (e.key === " " && e.target === wrapperRef.current) {
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

  const isAutoRunning =
    isAutoScrollMode && !isUserPaused && !prefersReducedMotion;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="delta-smooothy-heading"
      onKeyDown={handleKeyDown}
      className="relative w-full pt-4 pb-6 select-none"
    >
      <h2 id="delta-smooothy-heading" className="sr-only">
        Featured Vault Videos Smooothy Carousel
      </h2>

      {/* ── OFFICIAL SMOOOTHY INFINITE VIDEO TRACK (https://smooothy.federic.ooo/examples) ── */}
      {/* Centered origin px-[calc(50%-halfSlide)] places currentSlide & parallaxValues=0 dead-center */}
      <div
        ref={wrapperRef}
        data-slider=""
        tabIndex={0}
        aria-label="Featured 7th Heaven videos carousel — drag, swipe, or use arrow and number keys"
        className={`flex w-full flex-nowrap overflow-x-clip py-2 cursor-grab active:cursor-grabbing transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-200/40 ${
          isVariableWidth
            ? "px-0"
            : "px-[calc(50%-8rem)] sm:px-[calc(50%-9rem)] lg:px-[calc(50%-10rem)]"
        }`}
      >
        {SMOOOTHY_INFINITE_SLIDES.map(
          ({ card, rawIndex, slideKey, isClone }) => {
            const isActiveTrack =
              activeTrackId === card.track.id ||
              activeTrackId === card.track.youtubeId;
            const isTrackPlayingMusic = isActiveTrack && isMusicPlaying;
            const isSnappedCenter = rawActiveSlide === rawIndex;

            const widthClass =
              isVariableWidth && card.wideFeature
                ? "w-80 sm:w-96 lg:w-[28rem]"
                : "w-64 sm:w-72 lg:w-80";

            return (
              <div
                key={slideKey}
                className={`group shrink-0 px-2 transition-opacity duration-500 ${widthClass} ${
                  isSnapHighlighted && !isSnappedCenter
                    ? "opacity-75 hover:opacity-100"
                    : "opacity-100"
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
                      onSelectTrack(card.track);
                    }
                  }}
                  className="smooothy-card-bounce w-full"
                >
                  {/* LinkSlider pattern: pointer-events-none on button keeps drag 100% frictionless while preserving keyboard Tab + Enter/Space */}
                  <button
                    type="button"
                    tabIndex={isClone ? -1 : 0}
                    onClick={() => onSelectTrack(card.track)}
                    aria-current={isTrackPlayingMusic ? "true" : undefined}
                    aria-label={`${card.track.name} — ${card.originSubtitle} (${card.track.duration}), play music`}
                    className="pointer-events-none flex w-full flex-col items-center gap-3 text-center transition-opacity focus-visible:outline-none"
                  >
                  {isFullVideoCard ? (
                    /* Full-Bleed Rounded Live Video Card with Smooothy Inner-Window Parallax */
                    <div
                      className={`relative flex h-36 sm:h-40 lg:h-44 w-full items-center justify-center overflow-hidden rounded-lg bg-zinc-950 shadow-lg transition-colors duration-500 group-focus-within:ring-2 group-focus-within:ring-amber-200 ${
                        isTrackPlayingMusic
                          ? "ring-2 ring-amber-200"
                          : isActiveTrack
                            ? "ring-1 ring-amber-200/55 group-hover:ring-amber-200"
                            : isSnapHighlighted && isSnappedCenter
                              ? "ring-2 ring-amber-100/90"
                              : "ring-1 ring-white/15 group-hover:ring-white/35"
                      }`}
                    >
                      <div
                        data-smooothy-p=""
                        className="smooothy-delta-parallax smooothy-video-bleed relative size-full"
                      >
                        <video
                          src={card.previewVideoSrc}
                          poster={card.coverSrc}
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
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-amber-50/90 drop-shadow-xs">
                          {isTrackPlayingMusic ? (
                            <>
                              <span className="size-1.5 rounded-full bg-amber-300 animate-pulse" />
                              <span className="font-semibold text-amber-200">
                                PLAYING
                              </span>
                            </>
                          ) : (
                            <>
                              <Play className="size-3 fill-white text-white opacity-85 group-hover:opacity-100 transition-opacity" />
                              <span className="truncate font-medium">
                                {card.packTitle}
                              </span>
                            </>
                          )}
                        </span>

                        {card.track.duration && (
                          <span className="rounded-full bg-black/60 px-2 py-0.5 font-mono text-xs text-white/90 ring-1 ring-white/15 backdrop-blur-xs">
                            {card.track.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Jewel-Toned Delta Tile Framing a Live 16:9 Playing Video */
                    <div
                      className={`relative flex h-36 sm:h-44 lg:h-48 w-full items-center justify-center overflow-hidden rounded-lg transition-colors duration-500 ${card.tileClass} group-focus-within:ring-2 group-focus-within:ring-amber-200 ${
                        isTrackPlayingMusic
                          ? "ring-2 ring-amber-200"
                          : isActiveTrack
                            ? "ring-1 ring-amber-200/55"
                            : isSnapHighlighted && isSnappedCenter
                              ? "ring-2 ring-amber-100/90"
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
                          <span className="pointer-events-none absolute left-2 bottom-1.5 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 font-mono text-xs font-semibold text-amber-200">
                            <span className="size-1.5 rounded-full bg-amber-300 animate-pulse" />
                            <span>PLAYING</span>
                          </span>
                        )}
                        {card.track.duration && (
                          <span className="pointer-events-none absolute right-2 bottom-1.5 rounded-full bg-black/65 px-1.5 py-0.5 font-mono text-xs text-white/90">
                            {card.track.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Always-Visible Cursive Flourish + Bold Condensed Title */}
                  <div className="delta-expo-caption flex flex-col items-center gap-1 px-1">
                    <span
                      className={`font-quisas text-sm sm:text-base leading-none ${card.scriptColorClass}`}
                    >
                      {card.originSubtitle}
                    </span>
                    <span
                      className={`font-heading text-xl sm:text-2xl uppercase leading-none line-clamp-1 transition-colors ${
                        isTrackPlayingMusic
                          ? "text-amber-200"
                          : "text-amber-50/90 group-hover:text-amber-50"
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

      {/* Clickable [data-dots] Pagination Dots (ControlsSlider pattern from smooothy.federic.ooo/examples) */}
      {!isAutoScrollMode && (
        <div
          data-dots=""
          role="group"
          aria-label="Choose slide"
          className="mt-1 flex items-center justify-center gap-1.5"
        >
          {DELTA_SMOOOTHY_CARDS.map((card, idx) => {
            const isDotActive = currentSlide === idx;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleSelectDot(idx)}
                aria-label={`Go to slide ${idx + 1}: ${card.track.name}`}
                aria-current={isDotActive ? "true" : undefined}
                className="flex size-5 items-center justify-center transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-200 rounded-full cursor-pointer"
              >
                <span
                  className={`h-1.5 rounded-full transition-colors duration-300 ${
                    isDotActive ? "w-5 bg-amber-200" : "w-1.5 bg-white/25"
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Discreet Bottom-Left Smooothy ∞ Controls + Eased Progress Hairline + Official Examples Switcher */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 px-6">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (!isAutoScrollMode) {
                setMode("auto-scroll");
                setIsUserPaused(false);
                return;
              }
              setIsUserPaused((prev) => !prev);
            }}
            aria-pressed={isAutoRunning}
            aria-label={
              isAutoRunning
                ? "Pause infinite auto-scroll carousel"
                : "Start infinite auto-scroll carousel"
            }
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-950/60 hover:bg-zinc-950/90 px-3.5 py-1.5 font-mono text-xs text-amber-100/80 hover:text-amber-50 transition-colors cursor-pointer"
          >
            <span aria-hidden="true" className="text-sm leading-none text-amber-200">
              ∞
            </span>
            {isAutoRunning ? (
              <Pause className="size-3 text-amber-200/80" />
            ) : (
              <Play className="size-3 text-amber-200/80" />
            )}
            <span className="hidden sm:inline">
              {isAutoRunning
                ? "Auto-Scroll"
                : isAutoScrollMode
                  ? "Paused"
                  : mode === "parallax-speed"
                    ? "Parallax + Speed"
                    : "Snap Mode"}
            </span>
          </button>

          <div data-arrows="" className="flex items-center gap-1">
            <button
              type="button"
              onClick={goToPrev}
              aria-label="Previous slide"
              className="flex size-7 items-center justify-center rounded-full border border-white/10 bg-zinc-950/55 hover:bg-zinc-950/90 text-amber-100/75 hover:text-amber-50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Next slide"
              className="flex size-7 items-center justify-center rounded-full border border-white/10 bg-zinc-950/55 hover:bg-zinc-950/90 text-amber-100/75 hover:text-amber-50 transition-colors cursor-pointer"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>

          {/* Official Smooothy Eased Progress Bar (callbacks.md) */}
          <div
            aria-hidden="true"
            className="hidden md:block h-1 w-20 overflow-hidden rounded-full bg-white/10"
          >
            <div
              ref={progressFillRef}
              className="smooothy-progress-fill h-full w-full rounded-full bg-amber-200/75"
            />
          </div>
        </div>

        {/* Official smooothy.federic.ooo/examples Mode Switcher & Hero View Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 opacity-70 hover:opacity-100 focus-within:opacity-100 transition-opacity">
          {EXAMPLE_MODES.map((m) => {
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                aria-pressed={active}
                className={`rounded-full border px-2.5 py-1 font-mono text-xs transition-colors cursor-pointer ${
                  active
                    ? "border-amber-200/50 bg-delta-cream text-zinc-950 font-semibold"
                    : "border-white/10 bg-zinc-950/50 text-amber-100/75 hover:border-white/25 hover:text-amber-50"
                }`}
              >
                {m.label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() =>
              setCardVisualStyle((prev) =>
                prev === "full-video" ? "color-mat" : "full-video"
              )
            }
            className="rounded-full border border-white/10 bg-zinc-950/50 hover:border-white/25 px-2.5 py-1 font-mono text-xs text-amber-100/75 hover:text-amber-50 transition-colors cursor-pointer"
          >
            {isFullVideoCard ? "Color Frames" : "Full Video"}
          </button>

          {onSelectHeroVariant && (
            <>
              <span aria-hidden="true" className="mx-1 h-3 w-px bg-white/15" />
              <button
                type="button"
                onClick={() => onSelectHeroVariant(0)}
                aria-pressed={heroVariant === 0}
                className={`rounded-full border px-2.5 py-1 font-mono text-xs transition-colors cursor-pointer ${
                  heroVariant === 0
                    ? "border-amber-200/50 bg-amber-100/15 text-amber-100 font-semibold"
                    : "border-white/10 bg-zinc-950/50 text-amber-100/75 hover:text-amber-50"
                }`}
              >
                Delta Cafés
              </button>
              <button
                type="button"
                onClick={() => onSelectHeroVariant(1)}
                aria-pressed={heroVariant === 1}
                className={`rounded-full border px-2.5 py-1 font-mono text-xs transition-colors cursor-pointer ${
                  heroVariant === 1
                    ? "border-amber-200/50 bg-amber-100/15 text-amber-100 font-semibold"
                    : "border-white/10 bg-zinc-950/50 text-amber-100/75 hover:text-amber-50"
                }`}
              >
                1600px Stage
              </button>
              <button
                type="button"
                onClick={() => onSelectHeroVariant(2)}
                aria-pressed={heroVariant >= 2}
                className={`rounded-full border px-2.5 py-1 font-mono text-xs transition-colors cursor-pointer ${
                  heroVariant >= 2
                    ? "border-lime-300/60 bg-lime-300/20 text-lime-300 font-semibold"
                    : "border-white/10 bg-zinc-950/50 text-amber-100/75 hover:text-lime-300"
                }`}
              >
                TBWA\Hakuhodo
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
