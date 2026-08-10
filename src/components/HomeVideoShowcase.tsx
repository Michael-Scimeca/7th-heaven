"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import {
  X,
  Play,
  Pause,
  Layers,
  Settings,
  RotateCcw,
  Check,
  LayoutGrid,
  Zap,
  Film,
  Palette,
  Eye,
  SlidersHorizontal,
  Gauge,
  Activity,
  Code,
  Sparkles,
} from "lucide-react";
import Smooothy from "smooothy";

const InlineYTPlayer = dynamic(() => import("./InlineYTPlayer"), { ssr: false });

export interface ShowcaseCategoryVideo {
  id: string;
  title: string;
  category: string;
  badges: string[];
  viewCount: string;
  year: number;
  duration: string;
  previewStart?: number;
  previewEnd?: number;
}

const CATEGORY_SHOWCASE: ShowcaseCategoryVideo[] = [
  {
    id: "BzHUNTZ66zY",
    title: "7th Heaven – Ain't That Just Beautiful",
    category: "Official Music Videos",
    badges: ["ARTISTS", "MUSIC VIDEOS"],
    viewCount: "2.4K",
    year: 2025,
    duration: "3:35",
    previewStart: 0,
    previewEnd: 30,
  },
  {
    id: "hotaa5NZ_4o",
    title: "7th Heaven – Live on FOX Chicago",
    category: "TV Appearances",
    badges: ["BROADCAST", "TV APPEARANCES"],
    viewCount: "18.3K",
    year: 2024,
    duration: "2:55",
    previewStart: 5,
    previewEnd: 35,
  },
  {
    id: "UQBvl_wZ0ak",
    title: "7th Heaven – Addison Rock N' Wheels Live",
    category: "Full Concerts",
    badges: ["CONCERTS", "LIVE SHOWS", "+1"],
    viewCount: "30.8K",
    year: 2023,
    duration: "1:51:53",
    previewStart: 10,
    previewEnd: 40,
  },
  {
    id: "rTZI2YYtUxY",
    title: "7th Heaven – Always (Acoustic & Cover)",
    category: "Cover Songs",
    badges: ["COVERS", "ACOUSTIC MEDLEYS"],
    viewCount: "14.5K",
    year: 2022,
    duration: "3:18",
    previewStart: 0,
    previewEnd: 30,
  },
  {
    id: "SRxUiTqwaZs",
    title: "7th Heaven – Royal Caribbean Cruise Live",
    category: "Cruise Videos",
    badges: ["CRUISE", "VACATION SHOWS"],
    viewCount: "28.2K",
    year: 2021,
    duration: "3:03",
    previewStart: 5,
    previewEnd: 35,
  },
  {
    id: "Fw9RruU3dT0",
    title: "7th Heaven – Midwest Girl Festival Live",
    category: "Live Footage",
    badges: ["FESTIVALS", "LIVE FOOTAGE"],
    viewCount: "22.6K",
    year: 2020,
    duration: "3:38",
    previewStart: 0,
    previewEnd: 30,
  },
];

interface SmooothyInstance {
  goToNext?: () => void;
  goToPrev?: () => void;
  goToIndex?: (idx: number) => void;
  destroy?: () => void;
  update?: () => void;
}

export default function HomeVideoShowcase() {
  const [activeModalVideo, setActiveModalVideo] = useState<ShowcaseCategoryVideo | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<"smooothy" | "layout" | "motion" | "video" | "style" | "ui">("smooothy");

  const trackRef = useRef<HTMLDivElement>(null);
  const smooothyInstanceRef = useRef<SmooothyInstance | null>(null);

  // ── PARALLAX + SPEED BOUNCY EFFECT STATE ──
  const [isParallaxEnabled, setIsParallaxEnabled] = useState<boolean>(true);
  const [isSpeedBouncyEnabled, setIsSpeedBouncyEnabled] = useState<boolean>(true);
  const lerpedSpeedRef = useRef<number>(0);

  // ── ALL 16 OFFICIAL SMOOOTHY ENGINE CONFIGURATION OPTIONS ──
  const [smooothyInfinite, setSmooothyInfinite] = useState<boolean>(true);
  const [smooothySnap, setSmooothySnap] = useState<boolean>(false); // false = Free Mode continuous parallax scrolling
  const [smooothyVariableWidth, setSmooothyVariableWidth] = useState<boolean>(false);
  const [smooothyVertical, setSmooothyVertical] = useState<boolean>(false);
  const [smooothyScrollInput, setSmooothyScrollInput] = useState<boolean>(false);
  const [smooothyDragSensitivity, setSmooothyDragSensitivity] = useState<number>(0.002);
  const [smooothyLerpFactor, setSmooothyLerpFactor] = useState<number>(0.070);
  const [smooothyScrollSensitivity, setSmooothyScrollSensitivity] = useState<number>(1.20);
  const [smooothySnapStrength, setSmooothySnapStrength] = useState<number>(0.00);
  const [smooothySpeedDecay, setSmooothySpeedDecay] = useState<number>(0.68);
  const [smooothyBounceLimit, setSmooothyBounceLimit] = useState<number>(2.5);
  const [smooothyOffsetPreset, setSmooothyOffsetPreset] = useState<"standard" | "center" | "full">("standard");
  const [smooothyVirtualScroll, setSmooothyVirtualScroll] = useState<boolean>(false);

  // Callback event logs (onSlideChange, onResize, onUpdate)
  const [lastSlideChangeEvent, setLastSlideChangeEvent] = useState<string>("Index #0 Active");
  const [lastResizeEvent, setLastResizeEvent] = useState<string>("Observer Ready");
  const [lastUpdateEvent, setLastUpdateEvent] = useState<string>("60 FPS Engine");

  // ── ULTIMATE SLIDER CONFIGURATION ENGINE STATE ──
  // 1. Layout & Grid Settings
  const [cardsVisible, setCardsVisible] = useState<number>(3);
  const [aspectRatio, setAspectRatio] = useState<string>("aspect-[4/5]");
  const [cardGap, setCardGap] = useState<string>("gap-6");
  const [borderRadius, setBorderRadius] = useState<string>("rounded-3xl");
  const [borderStyle, setBorderStyle] = useState<string>("");

  // 2. Motion & Auto-Advance
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState<boolean>(false);
  const [autoAdvanceSpeed, setAutoAdvanceSpeed] = useState<number>(8); // seconds
  const [autoAdvanceDirection, setAutoAdvanceDirection] = useState<"forward" | "reverse">("forward");
  const [transitionSpeed, setTransitionSpeed] = useState<number>(200); // ms
  const [hoverAnimation, setHoverAnimation] = useState<string>("transition-none");

  // 3. YouTube Preview Engine
  const [previewStartSec, setPreviewStartSec] = useState<number>(0);
  const [previewDurationSec, setPreviewDurationSec] = useState<number>(30);
  const [previewZoomPercent, setPreviewZoomPercent] = useState<number>(130); // %
  const [playButtonVisibility, setPlayButtonVisibility] = useState<"hover" | "always" | "hidden">("hover");

  // 4. Styling, Colors & Buttons
  const [playButtonColor, setPlayButtonColor] = useState<string>("bg-purple-600 hover:bg-purple-500");
  const [playButtonSize, setPlayButtonSize] = useState<string>("w-14 h-14");
  const [titleFontSize, setTitleFontSize] = useState<string>("text-[18px]");
  const [sectionTheme, setSectionTheme] = useState<string>("");

  // 5. Navigation & UI Elements
  const [showBadges, setShowBadges] = useState<boolean>(true);
  const [showMetadata, setShowMetadata] = useState<boolean>(true);
  const [showBottomCategoryTabs, setShowBottomCategoryTabs] = useState<boolean>(true);

  const totalVideos = CATEGORY_SHOWCASE.length;

  // Initialize and dynamically update Smooothy Instance live with ALL 16 Smooothy API options
  useEffect(() => {
    if (!trackRef.current) return;

    try {
      smooothyInstanceRef.current?.destroy?.();
    } catch { }

    try {
      const SmooothyClass = Smooothy as unknown as new (
        elem: HTMLElement,
        options: Record<string, unknown>
      ) => SmooothyInstance;

      const instance = new SmooothyClass(trackRef.current, {
        infinite: smooothyInfinite,
        snap: smooothySnap,
        variableWidth: smooothyVariableWidth,
        vertical: smooothyVertical,
        scrollInput: false, // false = Do not trap vertical browser page scroll!
        dragSensitivity: smooothyDragSensitivity,
        lerpFactor: smooothyLerpFactor,
        scrollSensitivity: smooothyScrollSensitivity,
        snapStrength: smooothySnapStrength,
        speedDecay: smooothySpeedDecay,
        bounceLimit: smooothyBounceLimit,
        virtualScroll: smooothyVirtualScroll ? { enabled: true } : false,
        setOffset:
          smooothyOffsetPreset === "center"
            ? ({ itemWidth, wrapperWidth }: { itemWidth: number; wrapperWidth: number }) => wrapperWidth / 2 - itemWidth / 2
            : smooothyOffsetPreset === "full"
              ? ({ itemWidth }: { itemWidth: number }) => itemWidth
              : () => 0,
        onSlideChange: (idx: number) => {
          const safeIndex = (idx % totalVideos + totalVideos) % totalVideos;
          setStartIndex(safeIndex);
          setLastSlideChangeEvent(`Index #${safeIndex}`);
        },
        onResize: () => {
          setLastResizeEvent(`Resized @ ${new Date().toLocaleTimeString()}`);
        },
        onUpdate: (instance: Record<string, unknown> | undefined) => {
          setLastUpdateEvent(`Frame Syncing`);

          const spd = (instance?.speed as number) ?? (instance?.velocity as number) ?? velocityRef.current;
          velocityRef.current *= 0.88;
          const dt = (instance?.deltaTime as number) ?? 0.016;
          const parallax = (instance?.parallaxValues as number[]) || [];
          const currentSlide = (instance?.currentSlide as number) || startIndex;

          // Smooth out speed using ultra responsive lerp dampening
          lerpedSpeedRef.current += (spd - lerpedSpeedRef.current) * Math.min(1, dt * 12);

          if (trackRef.current) {
            const slides = trackRef.current.querySelectorAll(".smooothy-slide");
            slides.forEach((slide, i) => {
              const pVal = parallax[i] ?? (i - currentSlide);
              const innerMedia = slide.querySelector(".smooothy-parallax-media") as HTMLElement | null;

              if (innerMedia) {
                const offset = isParallaxEnabled ? pVal * 65 + lerpedSpeedRef.current * 110 : 0;
                const skew = isSpeedBouncyEnabled ? Math.min(25, Math.max(-25, lerpedSpeedRef.current * -6)) : 0;
                const scale = 1.22 + Math.min(0.3, Math.abs(lerpedSpeedRef.current) * 0.06);

                if (smooothyVertical) {
                  innerMedia.style.transform = `scale(${scale}) translate3d(0, ${offset}px, 0) skewY(${skew}deg)`;
                } else {
                  innerMedia.style.transform = `scale(${scale}) translate3d(${offset}px, 0, 0) skewX(${skew}deg)`;
                }
              }
            });
          }
        },
      });

      smooothyInstanceRef.current = instance;

      // Handle wheel and trackpad momentum scrolling
      const trackElem = trackRef.current;
      const handleWheel = (e: WheelEvent) => {
        if (!smooothyScrollInput) return;
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (Math.abs(delta) > 1) {
          if (smooothyInstanceRef.current) {
            const inst = smooothyInstanceRef.current as unknown as { target?: number };
            if (typeof inst.target === "number") {
              inst.target += delta * smooothyScrollSensitivity * 0.8;
            }
          }
        }
      };
      trackElem.addEventListener("wheel", handleWheel, { passive: true });

      // Official Smooothy animation frame update loop
      let animId: number;
      const renderLoop = () => {
        if (smooothyInstanceRef.current?.update) {
          smooothyInstanceRef.current.update();
        }
        animId = requestAnimationFrame(renderLoop);
      };
      animId = requestAnimationFrame(renderLoop);

      return () => {
        if (animId) cancelAnimationFrame(animId);
        trackElem.removeEventListener("wheel", handleWheel);
        try {
          smooothyInstanceRef.current?.destroy?.();
        } catch { }
      };
    } catch (err) {
      console.error("Smooothy initialization error:", err);
    }

    return () => {
      try {
        smooothyInstanceRef.current?.destroy?.();
      } catch { }
    };
  }, [
    smooothyInfinite,
    smooothySnap,
    smooothyVariableWidth,
    smooothyVertical,
    smooothyScrollInput,
    smooothyDragSensitivity,
    smooothyLerpFactor,
    smooothyScrollSensitivity,
    smooothySnapStrength,
    smooothySpeedDecay,
    smooothyBounceLimit,
    smooothyOffsetPreset,
    smooothyVirtualScroll,
    isParallaxEnabled,
    isSpeedBouncyEnabled,
    cardsVisible,
    totalVideos,
    startIndex,
  ]);

  // Step next slide via Smooothy or state fallback
  const handleNext = useCallback(() => {
    if (smooothyInstanceRef.current?.goToNext) {
      smooothyInstanceRef.current.goToNext();
    } else if (trackRef.current) {
      const slideWidth = trackRef.current.clientWidth / cardsVisible;
      trackRef.current.scrollBy({ left: slideWidth, behavior: "smooth" });
    } else {
      if (autoAdvanceDirection === "forward") {
        setStartIndex((prev) => (prev + 1) % totalVideos);
      } else {
        setStartIndex((prev) => (prev - 1 + totalVideos) % totalVideos);
      }
    }
  }, [totalVideos, autoAdvanceDirection, cardsVisible]);

  // Step prev slide via Smooothy or state fallback
  const handlePrev = useCallback(() => {
    if (smooothyInstanceRef.current?.goToPrev) {
      smooothyInstanceRef.current.goToPrev();
    } else if (trackRef.current) {
      const slideWidth = trackRef.current.clientWidth / cardsVisible;
      trackRef.current.scrollBy({ left: -slideWidth, behavior: "smooth" });
    } else {
      if (autoAdvanceDirection === "forward") {
        setStartIndex((prev) => (prev - 1 + totalVideos) % totalVideos);
      } else {
        setStartIndex((prev) => (prev + 1) % totalVideos);
      }
    }
  }, [totalVideos, autoAdvanceDirection, cardsVisible]);

  const handleGoToIndex = useCallback((idx: number) => {
    if (smooothyInstanceRef.current?.goToIndex) {
      smooothyInstanceRef.current.goToIndex(idx);
    } else if (trackRef.current) {
      const slideWidth = trackRef.current.clientWidth / cardsVisible;
      trackRef.current.scrollTo({ left: idx * slideWidth, behavior: "smooth" });
    } else {
      setStartIndex(idx);
    }
  }, [cardsVisible]);

  // Robust 60 FPS Pointer Drag & Speed Parallax Handler
  const dragStartRef = useRef<{ startX: number; lastX: number; target: number; time: number } | null>(null);
  const velocityRef = useRef<number>(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const targetEl = e.currentTarget;
    try {
      targetEl.setPointerCapture(e.pointerId);
    } catch { }
    if (smooothyInstanceRef.current) {
      const inst = smooothyInstanceRef.current as unknown as { target?: number; current?: number };
      const currentVal = inst.target ?? inst.current ?? 0;
      dragStartRef.current = {
        startX: e.clientX,
        lastX: e.clientX,
        target: currentVal,
        time: performance.now(),
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current || !smooothyInstanceRef.current) return;
    const now = performance.now();
    const dt = Math.max(0.008, (now - dragStartRef.current.time) / 1000);
    const stepDx = dragStartRef.current.lastX - e.clientX;
    const totalDx = dragStartRef.current.startX - e.clientX;

    dragStartRef.current.lastX = e.clientX;
    dragStartRef.current.time = now;

    // Velocity is delta step per second normalized
    velocityRef.current = stepDx / (dt * 100);

    const inst = smooothyInstanceRef.current as unknown as { target?: number };
    if (typeof inst.target === "number") {
      inst.target = dragStartRef.current.target + totalDx * 1.25;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch { }
    dragStartRef.current = null;
  };

  // Auto-rotation timer based on user speed setting
  const handleNextRef = useRef(handleNext);
  useEffect(() => {
    handleNextRef.current = handleNext;
  });

  useEffect(() => {
    if (!isAutoPlayEnabled) return;
    const intervalMs = Math.max(2, autoAdvanceSpeed) * 1000;
    const timer = setInterval(() => {
      handleNextRef.current();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isAutoPlayEnabled, autoAdvanceSpeed]);

  const getGapPx = () => {
    if (cardGap === "gap-2") return 8;
    if (cardGap === "gap-4") return 16;
    if (cardGap === "gap-8") return 32;
    if (cardGap === "gap-10") return 40;
    return 24;
  };

  const handleResetDefaults = () => {
    // Smooothy defaults
    setSmooothyInfinite(true);
    setSmooothySnap(false);
    setSmooothyVariableWidth(false);
    setSmooothyVertical(false);
    setSmooothyScrollInput(false);
    setSmooothyDragSensitivity(0.002);
    setSmooothyLerpFactor(0.070);
    setSmooothyScrollSensitivity(1.20);
    setSmooothySnapStrength(0.00);
    setSmooothySpeedDecay(0.68);
    setSmooothyBounceLimit(2.5);
    setSmooothyOffsetPreset("center");
    setSmooothyVirtualScroll(false);

    setIsParallaxEnabled(true);
    setIsSpeedBouncyEnabled(true);

    // General defaults
    setCardsVisible(3);
    setAspectRatio("aspect-[4/5]");
    setCardGap("gap-6");
    setBorderRadius("rounded-3xl");
    setBorderStyle("");

    setIsAutoPlayEnabled(false);
    setAutoAdvanceSpeed(8);
    setAutoAdvanceDirection("forward");
    setTransitionSpeed(200);
    setHoverAnimation("transition-none");

    setPreviewStartSec(0);
    setPreviewDurationSec(30);
    setPreviewZoomPercent(240);
    setPlayButtonVisibility("hover");

    setPlayButtonColor("bg-purple-600 hover:bg-purple-500");
    setPlayButtonSize("w-14 h-14");
    setTitleFontSize("text-[18px]");
    setSectionTheme("");

    setShowBadges(true);
    setShowMetadata(true);
    setShowBottomCategoryTabs(true);
  };

  const gapPx = getGapPx();

  return (
    <section className={`py-16 md:py-24 bg-gradient-to-b ${sectionTheme} relative overflow-hidden w-screen left-1/2 -translate-x-1/2 select-none`}>
      {/* Background glow accents */}

      <div className="w-full relative z-10">
        {/* Section Header with Container Padding */}
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2.5 font-sans">
              <span className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                Video & Live Media
              </span>
            </h2>
            <p className="text-purple-200/75 text-sm sm:text-base md:text-lg font-normal mb-5 leading-relaxed">
              Explore 7th Heaven&apos;s live concert highlights, festival performances, television broadcasts, and official music videos in smooth interactive parallax.
            </p>


          </div>


        </div>

        {/* Pure Smooothy Engine DOM Slider Track with Native Lerp & Snap Physics */}
        <div
          ref={trackRef}
          data-slider="true"
          data-vertical={smooothyVertical}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`w-full overflow-hidden py-4 select-none cursor-grab active:cursor-grabbing ${smooothyVertical ? "flex flex-col h-[750px]" : "flex flex-nowrap"
            }`}
          style={{
            touchAction: "pan-y",
            ...(smooothyVertical
              ? {}
              : { marginLeft: `-${gapPx / 2}px`, marginRight: `-${gapPx / 2}px`, width: `calc(100% + ${gapPx}px)` })
          }}
        >
          {CATEGORY_SHOWCASE.map((video, idx) => {
            const start = video.previewStart ?? previewStartSec;
            const end = start + previewDurationSec;

            return (
              <div
                key={video.id}
                className={`smooothy-slide group flex flex-col shrink-0 max-h-[500px] ${hoverAnimation}`}
                style={{
                  maxHeight: "500px",
                  width: smooothyVertical
                    ? "100%"
                    : `${100 / cardsVisible}%`,
                  paddingLeft: smooothyVertical ? 0 : `${gapPx / 2}px`,
                  paddingRight: smooothyVertical ? 0 : `${gapPx / 2}px`,
                  paddingTop: smooothyVertical ? `${gapPx / 2}px` : 0,
                  paddingBottom: smooothyVertical ? `${gapPx / 2}px` : 0,
                }}
              >
                {/* Video Card Container */}
                <div
                  style={{ maxHeight: "500px" }}
                  className={`relative max-h-[500px] ${aspectRatio} ${borderRadius} ${borderStyle} overflow-hidden bg-black/60 shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-300`}
                >
                  {/* Transparent Drag Capture Layer (Ensures YouTube iframes never intercept drag events) */}
                  <div className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing bg-transparent" />

                  {/* YouTube 30-Second Autoplay Preview Frame */}
                  <div className="smooothy-parallax-media absolute inset-0 w-full h-full pointer-events-none overflow-hidden transform-gpu transition-transform duration-75 ease-out">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${video.id}&start=${start}&end=${end}&playsinline=1&enablejsapi=1&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1`}
                      title={video.title}
                      style={{
                        height: `max(${previewZoomPercent}%, 300%)`,
                        width: `calc(max(${previewZoomPercent}%, 300%) * 1.77778)`,
                        minHeight: "300%",
                        minWidth: "533.33%",
                        aspectRatio: "16 / 9",
                      }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-none opacity-85 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none scale-105"
                      allow="autoplay; encrypted-media"
                    />
                  </div>

                  {/* Top Badge Overlay */}
                  {showBadges && (
                    <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                      <div className="flex items-center gap-2 flex-wrap">
                        {video.badges.map((badge, bIdx) => (
                          <span
                            key={badge + bIdx}
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-md ${bIdx === 0
                              ? "bg-white text-black font-black"
                              : "bg-white/80 text-black border border-white/30"
                              }`}
                          >
                            {badge}
                          </span>
                        ))}
                      </div>

                      <span className="text-[10px] font-mono font-bold bg-black/60 text-white/80 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
                        Card {idx + 1} / {totalVideos}
                      </span>
                    </div>
                  )}

                  {/* Interactive Play Button Overlay */}
                  {playButtonVisibility !== "hidden" && (
                    <div
                      className={`absolute inset-0 z-30 flex items-center justify-center bg-black/20 transition-opacity duration-300 pointer-events-none ${playButtonVisibility === "always"
                        ? "opacity-100"
                        : "opacity-90 sm:opacity-0 group-hover:opacity-100"
                        }`}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalVideo(video);
                        }}
                        className={`${playButtonSize} rounded-full ${playButtonColor} active:scale-95 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-2xl transition-all cursor-pointer pointer-events-auto hover:scale-110`}
                        aria-label={`Play full video for ${video.title}`}
                        title="Play Full Video"
                      >
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      </button>
                    </div>
                  )}

                  {/* Gradient shadow overlay for legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none z-10" />
                </div>

                {/* Below Card Details */}
                <div className="pt-4 flex flex-col pointer-events-none">
                  <h3 className={`${titleFontSize} font-black text-white tracking-tight line-clamp-1 group-hover:text-purple-300 transition-colors`}>
                    {video.title}
                  </h3>

                  {showMetadata && (
                    <>
                      {/* Divider line matching design */}
                      <div className="w-full border-b border-white/15 my-3" />

                      {/* Sub-metadata row */}
                      <div className="flex items-center justify-between text-xs text-white/50 font-medium">
                        <span className="flex items-center gap-1">
                          Views <strong className="text-white font-mono">{video.viewCount}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          Preview <strong className="text-purple-300">{previewDurationSec}s Loop</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          Year <strong className="text-white font-mono">{video.year}</strong>
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>


      </div>

      {/* ── MASTER SLIDER CONFIGURATION DRAWER CONTROL PANEL (NON-BLURRED LIVE PANEL) ── */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-end p-3 sm:p-6 pointer-events-none transition-all animate-[fadeIn_0.2s_ease-out]">
          <div
            className="w-full max-w-xl bg-[#0b0618]/95 border border-purple-500/40 rounded-3xl p-5 md:p-7 text-white shadow-[0_25px_80px_rgba(0,0,0,0.95)] max-h-[90vh] flex flex-col gap-4 select-none pointer-events-auto border-t-purple-400 overscroll-contain"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <div>
                <h3 className="font-black text-xl text-white tracking-wide flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-purple-400" />
                  <span>Master Slider Settings Engine</span>
                </h3>
                <p className="text-xs text-white/50 mt-1">
                  Full real-time control over all 16 Smooothy API options, layout, motion, and theme.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 6 Category Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10 overflow-x-auto scrollbar-hide shrink-0">
              {[
                { id: "smooothy", label: "🚀 16 Smooothy API Options", icon: Gauge },
                { id: "layout", label: "Grid & Cards", icon: LayoutGrid },
                { id: "motion", label: "Motion & Speed", icon: Zap },
                { id: "video", label: "Video Preview", icon: Film },
                { id: "style", label: "Style & Colors", icon: Palette },
                { id: "ui", label: "UI Toggles", icon: Eye },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setActiveSettingsTab(tab.id as typeof activeSettingsTab)}
                    className={`flex-1 min-w-[130px] py-2 px-2.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeSettingsTab === tab.id
                      ? "bg-purple-600 text-white shadow-md font-black"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dedicated Scrollable Body Container */}
            <div className="flex-1 overflow-y-auto max-h-[calc(90vh-180px)] pr-2 space-y-4 overscroll-contain scrollbar-thin scrollbar-thumb-purple-600/60 scrollbar-track-white/5">
              {/* ── TAB 0: ALL 16 OFFICIAL SMOOOTHY PHYSICS & API ENGINE OPTIONS ── */}
              {activeSettingsTab === "smooothy" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="p-3 bg-purple-900/20 rounded-2xl border border-purple-500/30 text-xs text-purple-300 font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400 shrink-0" />
                    <span><strong>16 Official Smooothy API Options</strong> — Complete real-time control over infinite looping, snaps, offsets, callbacks, and lerp physics.</span>
                  </div>

                  {/* Parallax + Speed Presets Row */}
                  <div className="p-3.5 bg-black/60 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Parallax + Speed Bouncy Effect
                      </span>
                      <p className="text-[10px] text-white/50 mt-0.5">Applies speed dampening physics and slide offset bouncy motion.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsParallaxEnabled(true);
                        setIsSpeedBouncyEnabled(true);
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-black uppercase rounded-lg transition-colors cursor-pointer"
                    >
                      Enable Effect
                    </button>
                  </div>

                  {/* 1-5. Smooothy Booleans / Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* 1. infinite */}
                    <button
                      type="button"
                      onClick={() => setSmooothyInfinite(!smooothyInfinite)}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer text-xs font-bold text-white/90"
                    >
                      <span>1. infinite (Loop Slides)</span>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${smooothyInfinite ? "bg-purple-600 border-purple-400 text-white" : "border-white/20"}`}>
                        {smooothyInfinite && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {/* 2. snap */}
                    <button
                      type="button"
                      onClick={() => setSmooothySnap(!smooothySnap)}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer text-xs font-bold text-white/90"
                    >
                      <span>2. snap (Position Snap)</span>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${smooothySnap ? "bg-purple-600 border-purple-400 text-white" : "border-white/20"}`}>
                        {smooothySnap && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {/* 3. variableWidth */}
                    <button
                      type="button"
                      onClick={() => setSmooothyVariableWidth(!smooothyVariableWidth)}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer text-xs font-bold text-white/90"
                    >
                      <span>3. variableWidth</span>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${smooothyVariableWidth ? "bg-purple-600 border-purple-400 text-white" : "border-white/20"}`}>
                        {smooothyVariableWidth && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {/* 4. vertical */}
                    <button
                      type="button"
                      onClick={() => setSmooothyVertical(!smooothyVertical)}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer text-xs font-bold text-white/90"
                    >
                      <span>4. vertical Scroll</span>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${smooothyVertical ? "bg-purple-600 border-purple-400 text-white" : "border-white/20"}`}>
                        {smooothyVertical && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {/* 11. scrollInput */}
                    <button
                      type="button"
                      onClick={() => setSmooothyScrollInput(!smooothyScrollInput)}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer text-xs font-bold text-white/90 col-span-1 sm:col-span-2"
                    >
                      <span>11. scrollInput (Mouse Wheel / Trackpad Scroll)</span>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${smooothyScrollInput ? "bg-purple-600 border-purple-400 text-white" : "border-white/20"}`}>
                        {smooothyScrollInput && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {/* 13. virtualScroll */}
                    <button
                      type="button"
                      onClick={() => setSmooothyVirtualScroll(!smooothyVirtualScroll)}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer text-xs font-bold text-white/90 col-span-1 sm:col-span-2"
                    >
                      <span>13. virtualScroll (Virtual Scroll Windowing)</span>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${smooothyVirtualScroll ? "bg-purple-600 border-purple-400 text-white" : "border-white/20"}`}>
                        {smooothyVirtualScroll && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  </div>

                  {/* 6-10. Smooothy Physics Sliders */}
                  <div className="space-y-4 bg-white/[0.03] p-4 rounded-2xl border border-white/10 mt-1">
                    {/* 5. dragSensitivity */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-extrabold uppercase tracking-wider text-purple-300 mb-1.5">
                        <span>5. dragSensitivity (Drag Multiplier)</span>
                        <span className="font-mono text-white bg-purple-600/30 px-2 py-0.5 rounded text-[11px]">{smooothyDragSensitivity.toFixed(3)}</span>
                      </div>
                      <input
                        type="range"
                        aria-label="Drag Sensitivity"
                        min={0.001}
                        max={0.05}
                        step={0.001}
                        value={smooothyDragSensitivity}
                        onChange={(e) => setSmooothyDragSensitivity(Number(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                      />
                    </div>

                    {/* 6. lerpFactor */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-extrabold uppercase tracking-wider text-purple-300 mb-1.5">
                        <span>6. lerpFactor (Inertia Smoothness)</span>
                        <span className="font-mono text-white bg-purple-600/30 px-2 py-0.5 rounded text-[11px]">{smooothyLerpFactor.toFixed(3)}</span>
                      </div>
                      <input
                        type="range"
                        aria-label="Inertia Smoothness"
                        min={0.01}
                        max={0.5}
                        step={0.01}
                        value={smooothyLerpFactor}
                        onChange={(e) => setSmooothyLerpFactor(Number(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-white/40 font-mono mt-1">
                        <span>Ultra Smooth (0.01)</span>
                        <span>Default (0.30)</span>
                        <span>Stiff (0.50)</span>
                      </div>
                    </div>

                    {/* 7. scrollSensitivity */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-extrabold uppercase tracking-wider text-purple-300 mb-1.5">
                        <span>7. scrollSensitivity (Wheel Multiplier)</span>
                        <span className="font-mono text-white bg-purple-600/30 px-2 py-0.5 rounded text-[11px]">{smooothyScrollSensitivity.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        aria-label="Scroll Sensitivity"
                        min={0.2}
                        max={3.0}
                        step={0.1}
                        value={smooothyScrollSensitivity}
                        onChange={(e) => setSmooothyScrollSensitivity(Number(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                      />
                    </div>

                    {/* 8. snapStrength */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-extrabold uppercase tracking-wider text-purple-300 mb-1.5">
                        <span>8. snapStrength (Magnetic Snap Pull)</span>
                        <span className="font-mono text-white bg-purple-600/30 px-2 py-0.5 rounded text-[11px]">{smooothySnapStrength.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        aria-label="Snap Strength"
                        min={0.0}
                        max={0.5}
                        step={0.01}
                        value={smooothySnapStrength}
                        onChange={(e) => setSmooothySnapStrength(Number(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                      />
                    </div>

                    {/* 9. speedDecay */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-extrabold uppercase tracking-wider text-purple-300 mb-1.5">
                        <span>9. speedDecay (Friction Decay Rate)</span>
                        <span className="font-mono text-white bg-purple-600/30 px-2 py-0.5 rounded text-[11px]">{smooothySpeedDecay.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        aria-label="Friction Decay Rate"
                        min={0.5}
                        max={0.99}
                        step={0.01}
                        value={smooothySpeedDecay}
                        onChange={(e) => setSmooothySpeedDecay(Number(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                      />
                    </div>

                    {/* 10. bounceLimit */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-extrabold uppercase tracking-wider text-purple-300 mb-1.5">
                        <span>10. bounceLimit (Overscroll Elasticity)</span>
                        <span className="font-mono text-white bg-purple-600/30 px-2 py-0.5 rounded text-[11px]">{smooothyBounceLimit.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        aria-label="Overscroll Elasticity"
                        min={0}
                        max={3.0}
                        step={0.1}
                        value={smooothyBounceLimit}
                        onChange={(e) => setSmooothyBounceLimit(Number(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* 12. setOffset Custom Function Preset */}
                  <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/10">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-purple-300 block mb-2">
                      12. setOffset (Custom Slide End Offset Function)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "standard", label: "Standard Offset" },
                        { id: "center", label: "Center Snap Offset" },
                        { id: "full", label: "Full Width Offset" },
                      ].map((opt) => (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => setSmooothyOffsetPreset(opt.id as typeof smooothyOffsetPreset)}
                          className={`py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${smooothyOffsetPreset === opt.id
                            ? "bg-purple-600 border-purple-400 text-white shadow-md"
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 14, 15, 16. Smooothy Callbacks Event Status Badges */}
                  <div className="bg-black/60 p-4 rounded-2xl border border-white/10 space-y-2 font-mono text-[11px]">
                    <div className="flex items-center justify-between text-white/70">
                      <span className="flex items-center gap-1.5 text-purple-300">
                        <Code className="w-3.5 h-3.5" /> 14. onSlideChange callback:
                      </span>
                      <span className="text-white font-bold bg-purple-600/30 px-2 py-0.5 rounded border border-purple-400/30">
                        {lastSlideChangeEvent}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-white/70">
                      <span className="flex items-center gap-1.5 text-purple-300">
                        <Code className="w-3.5 h-3.5" /> 15. onResize callback:
                      </span>
                      <span className="text-white font-bold bg-purple-600/30 px-2 py-0.5 rounded border border-purple-400/30">
                        {lastResizeEvent}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-white/70">
                      <span className="flex items-center gap-1.5 text-purple-300">
                        <Code className="w-3.5 h-3.5" /> 16. onUpdate callback:
                      </span>
                      <span className="text-white font-bold bg-purple-600/30 px-2 py-0.5 rounded border border-purple-400/30">
                        {lastUpdateEvent}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 1: LAYOUT & CARDS ── */}
              {activeSettingsTab === "layout" && (
                <div className="flex flex-col gap-5 animate-in fade-in duration-200">
                  {/* Cards Visible Count */}
                  <div>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-purple-300 block mb-2">
                      Cards Visible Per View (1 to 6)
                    </label>
                    <div className="grid grid-cols-6 gap-1.5">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <button
                          type="button"
                          key={num}
                          onClick={() => setCardsVisible(num)}
                          className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${cardsVisible === num
                            ? "bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                            }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Aspect Ratio */}
                  <div>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-purple-300 block mb-2">
                      Card Aspect Ratio
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: "4:5 Portrait", value: "aspect-[4/5]" },
                        { label: "16:9 Wide", value: "aspect-video" },
                        { label: "1:1 Square", value: "aspect-square" },
                        { label: "3:4 Tall", value: "aspect-[3/4]" },
                      ].map((item) => (
                        <button
                          type="button"
                          key={item.value}
                          onClick={() => setAspectRatio(item.value)}
                          className={`py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${aspectRatio === item.value
                            ? "bg-purple-600 border-purple-400 text-white shadow-md"
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                            }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card Spacing Gap */}
                  <div>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-purple-300 block mb-2">
                      Card Spacing Gap
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: "Tight (8px)", value: "gap-2" },
                        { label: "Compact (16px)", value: "gap-4" },
                        { label: "Normal (24px)", value: "gap-6" },
                        { label: "Wide (32px)", value: "gap-8" },
                      ].map((gap) => (
                        <button
                          type="button"
                          key={gap.value}
                          onClick={() => setCardGap(gap.value)}
                          className={`py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${cardGap === gap.value
                            ? "bg-purple-600 border-purple-400 text-white shadow-md"
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                            }`}
                        >
                          {gap.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Corner Rounding */}
                  <div>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-purple-300 block mb-2">
                      Card Corner Rounding
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: "Sharp", value: "rounded-none" },
                        { label: "Rounded", value: "rounded-xl" },
                        { label: "Soft 3X", value: "rounded-3xl" },
                        { label: "Full Pill", value: "rounded-[40px]" },
                      ].map((radius) => (
                        <button
                          type="button"
                          key={radius.value}
                          onClick={() => setBorderRadius(radius.value)}
                          className={`py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${borderRadius === radius.value
                            ? "bg-purple-600 border-purple-400 text-white shadow-md"
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                            }`}
                        >
                          {radius.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Border Style */}
                  <div>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-purple-300 block mb-2">
                      Card Border Accent Style
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Purple Glow Border", value: "" },
                        { label: "Gold Metallic Border", value: "border border-amber-500/40 group-hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]" },
                        { label: "Cyan Electric Border", value: "border border-cyan-500/40 group-hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]" },
                        { label: "No Border (Clean Glass)", value: "border-none" },
                      ].map((b) => (
                        <button
                          type="button"
                          key={b.label}
                          onClick={() => setBorderStyle(b.value)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${borderStyle === b.value
                            ? "bg-purple-600 border-purple-400 text-white shadow-md"
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                            }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: MOTION & SPEED ── */}
              {activeSettingsTab === "motion" && (
                <div className="flex flex-col gap-5 animate-in fade-in duration-200">
                  {/* Auto-Advance Speed */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-extrabold uppercase tracking-wider text-purple-300 mb-2">
                      <span>Auto-Advance Interval (2s to 20s)</span>
                      <span className="font-mono text-white bg-purple-600/30 px-2.5 py-0.5 rounded-full border border-purple-400/30">
                        {autoAdvanceSpeed}s
                      </span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={20}
                      value={autoAdvanceSpeed}
                      onChange={(e) => setAutoAdvanceSpeed(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-white/40 font-mono mt-1">
                      <span>Fast (2s)</span>
                      <span>Normal (8s)</span>
                      <span>Slow (20s)</span>
                    </div>
                  </div>

                  {/* Auto-Advance Direction */}
                  <div>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-purple-300 block mb-2">
                      Auto-Advance Direction
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAutoAdvanceDirection("forward")}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${autoAdvanceDirection === "forward"
                          ? "bg-purple-600 border-purple-400 text-white shadow-md"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                          }`}
                      >
                        Forward (Left → Right)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAutoAdvanceDirection("reverse")}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${autoAdvanceDirection === "reverse"
                          ? "bg-purple-600 border-purple-400 text-white shadow-md"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                          }`}
                      >
                        Reverse (Right → Left)
                      </button>
                    </div>
                  </div>

                  {/* Transition Speed */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-extrabold uppercase tracking-wider text-purple-300 mb-2">
                      <span>Transition Animation Speed (ms)</span>
                      <span className="font-mono text-white bg-purple-600/30 px-2.5 py-0.5 rounded-full border border-purple-400/30">
                        {transitionSpeed}ms
                      </span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={800}
                      step={50}
                      value={transitionSpeed}
                      onChange={(e) => setTransitionSpeed(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                    />
                  </div>

                  {/* Hover Card Animation */}
                  <div>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-purple-300 block mb-2">
                      Card Hover Animation
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Subtle Lift (Scale 1.02)", value: "hover:scale-[1.02] transition-transform duration-300" },
                        { label: "High Scale (Scale 1.05)", value: "hover:scale-105 transition-transform duration-300" },
                        { label: "Glow & Lift", value: "hover:-translate-y-2 transition-all duration-300 shadow-purple-500/50" },
                        { label: "No Hover Animation", value: "transition-none" },
                      ].map((h) => (
                        <button
                          type="button"
                          key={h.label}
                          onClick={() => setHoverAnimation(h.value)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${hoverAnimation === h.value
                            ? "bg-purple-600 border-purple-400 text-white shadow-md"
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                            }`}
                        >
                          {h.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 3: VIDEO PREVIEW ENGINE ── */}
              {activeSettingsTab === "video" && (
                <div className="flex flex-col gap-5 animate-in fade-in duration-200">
                  {/* Preview Start Second */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-extrabold uppercase tracking-wider text-purple-300 mb-2">
                      <span>Preview Start Timestamp</span>
                      <span className="font-mono text-white bg-purple-600/30 px-2.5 py-0.5 rounded-full border border-purple-400/30">
                        {previewStartSec}s
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={30}
                      value={previewStartSec}
                      onChange={(e) => setPreviewStartSec(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                    />
                  </div>

                  {/* Preview Duration Second */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-extrabold uppercase tracking-wider text-purple-300 mb-2">
                      <span>Preview Loop Duration</span>
                      <span className="font-mono text-white bg-purple-600/30 px-2.5 py-0.5 rounded-full border border-purple-400/30">
                        {previewDurationSec}s
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={60}
                      step={5}
                      value={previewDurationSec}
                      onChange={(e) => setPreviewDurationSec(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                    />
                  </div>

                  {/* Preview Zoom Percent (Crop Letterboxes) */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-extrabold uppercase tracking-wider text-purple-300 mb-2">
                      <span>YouTube Video Frame Scale / Crop %</span>
                      <span className="font-mono text-white bg-purple-600/30 px-2.5 py-0.5 rounded-full border border-purple-400/30">
                        {previewZoomPercent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={120}
                      max={300}
                      step={10}
                      value={previewZoomPercent}
                      onChange={(e) => setPreviewZoomPercent(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                    />
                    <span className="text-[10px] text-white/40 block mt-1">
                      Higher scale removes black top/bottom letterbox bars inside vertical cards.
                    </span>
                  </div>

                  {/* Play Button Overlay Visibility */}
                  <div>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-purple-300 block mb-2">
                      Play Button Overlay Mode
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "On Hover Only", value: "hover" },
                        { label: "Always Visible", value: "always" },
                        { label: "Hidden", value: "hidden" },
                      ].map((mode) => (
                        <button
                          type="button"
                          key={mode.value}
                          onClick={() => setPlayButtonVisibility(mode.value as typeof playButtonVisibility)}
                          className={`py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${playButtonVisibility === mode.value
                            ? "bg-purple-600 border-purple-400 text-white shadow-md"
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                            }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 4: STYLE & COLORS ── */}
              {activeSettingsTab === "style" && (
                <div className="flex flex-col gap-5 animate-in fade-in duration-200">
                  {/* Play Button Theme Color */}
                  <div>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-purple-300 block mb-2">
                      Play Button Theme Accent Color
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Purple Glass", value: "bg-purple-600 hover:bg-purple-500" },
                        { label: "Gold Metallic", value: "bg-amber-500 hover:bg-amber-400" },
                        { label: "Cyan Electric", value: "bg-cyan-500 hover:bg-cyan-400" },
                        { label: "Rose Neon", value: "bg-rose-600 hover:bg-rose-500" },
                      ].map((color) => (
                        <button
                          type="button"
                          key={color.label}
                          onClick={() => setPlayButtonColor(color.value)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${playButtonColor === color.value
                            ? "bg-purple-600 border-purple-400 text-white shadow-md"
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                            }`}
                        >
                          {color.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Play Button Size */}
                  <div>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-purple-300 block mb-2">
                      Play Button Size
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Compact (44px)", value: "w-11 h-11" },
                        { label: "Medium (56px)", value: "w-14 h-14" },
                        { label: "Large (64px)", value: "w-16 h-16" },
                      ].map((s) => (
                        <button
                          type="button"
                          key={s.value}
                          onClick={() => setPlayButtonSize(s.value)}
                          className={`py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${playButtonSize === s.value
                            ? "bg-purple-600 border-purple-400 text-white shadow-md"
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                            }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card Title Font Size */}
                  <div>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-purple-300 block mb-2">
                      Card Title Typography Size
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Compact (14px)", value: "text-sm font-bold" },
                        { label: "Standard (18px)", value: "text-[18px]" },
                        { label: "Medium (20px)", value: "text-lg md:text-xl" },
                        { label: "Large (24px)", value: "text-xl md:text-2xl" },
                      ].map((font) => (
                        <button
                          type="button"
                          key={font.value}
                          onClick={() => setTitleFontSize(font.value)}
                          className={`py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${titleFontSize === font.value
                            ? "bg-purple-600 border-purple-400 text-white shadow-md"
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                            }`}
                        >
                          {font.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section Theme Background */}
                  <div>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-purple-300 block mb-2">
                      Section Background Theme Gradient
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Deep Purple Night", value: "" },
                        { label: "Midnight Obsidian", value: "from-[#05050a] via-[#0b0c14] to-[#05050a]" },
                        { label: "Rose Neon Sunset", value: "from-[#170811] via-[#240b19] to-[#170811]" },
                        { label: "Cyan Electric Theme", value: "" },
                      ].map((theme) => (
                        <button
                          type="button"
                          key={theme.label}
                          onClick={() => setSectionTheme(theme.value)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${sectionTheme === theme.value
                            ? "bg-purple-600 border-purple-400 text-white shadow-md"
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                            }`}
                        >
                          {theme.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 5: UI TOGGLES ── */}
              {activeSettingsTab === "ui" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="space-y-3 bg-white/[0.03] p-4 rounded-2xl border border-white/10">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-purple-300 block">
                      UI Visibility Controls
                    </label>

                    {/* Show Badges */}
                    <button
                      type="button"
                      onClick={() => setShowBadges(!showBadges)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer text-xs font-bold text-white/90"
                    >
                      <span>Show Top Category Badges & Card Counter</span>
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border ${showBadges ? "bg-purple-600 border-purple-400 text-white" : "border-white/20"
                          }`}
                      >
                        {showBadges && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {/* Show Metadata */}
                    <button
                      type="button"
                      onClick={() => setShowMetadata(!showMetadata)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer text-xs font-bold text-white/90"
                    >
                      <span>Show Bottom Sub-Metadata (Views & Year)</span>
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border ${showMetadata ? "bg-purple-600 border-purple-400 text-white" : "border-white/20"
                          }`}
                      >
                        {showMetadata && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {/* Show Bottom Category Tabs */}
                    <button
                      type="button"
                      onClick={() => setShowBottomCategoryTabs(!showBottomCategoryTabs)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer text-xs font-bold text-white/90"
                    >
                      <span>Show Bottom Category Filter Selector Bar</span>
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border ${showBottomCategoryTabs ? "bg-purple-600 border-purple-400 text-white" : "border-white/20"
                          }`}
                      >
                        {showBottomCategoryTabs && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10 mt-1 shrink-0">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Defaults</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-lg shadow-purple-600/30"
              >
                Done & Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Video Modal Lightbox */}
      {activeModalVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <button
              onClick={() => setActiveModalVideo(null)}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
            <InlineYTPlayer
              videoId={activeModalVideo.id}
              title={activeModalVideo.title}
              onClose={() => setActiveModalVideo(null)}
            />
          </div>
        </div>
      )}
    </section>
  );
}
