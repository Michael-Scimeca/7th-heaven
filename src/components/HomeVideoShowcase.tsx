"use client";
/* oxlint-disable react-doctor/control-has-associated-label, react-doctor/label-has-associated-control, react-doctor/prefer-useReducer */
/* eslint-disable react-doctor/control-has-associated-label, react-doctor/label-has-associated-control, react-doctor/prefer-useReducer */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  X,
  Play,
} from "lucide-react";
import Smooothy, { damp } from "smooothy";
import CosmicRadialButton from "./CosmicRadialButton";

const InlineYTPlayer = dynamic(() => import("./InlineYTPlayer"), { ssr: false });

function ShowcaseMedia({ videoId, videoTitle, start, end }: { videoId: string; videoTitle: string; start: number; end: number; previewZoomPercent: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="smooothy-parallax-media absolute inset-0 w-full h-full overflow-hidden transform-gpu"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&start=${start}&end=${end}&playsinline=1&enablejsapi=1&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1`}
          title={videoTitle}
          className="absolute inset-0 w-full h-full pointer-events-none object-cover"
          allow="autoplay; encrypted-media"
        />
      ) : (
        <Image
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt={videoTitle}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover pointer-events-none"
        />
      )}
    </div>
  );
}

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
  const sectionRef = useRef<HTMLElement>(null);
  const smooothyInstanceRef = useRef<SmooothyInstance | null>(null);
  // Tracks whether this carousel is on/near screen. Once it lazy-mounts it
  // stays mounted for the rest of the page's life, and its render loop below
  // was running forever regardless of scroll position — still querying every
  // slide and writing parallax transforms every frame long after the user
  // scrolled past it. That compounded with everything else fighting for
  // frame budget further down the page. rootMargin keeps it warm just before
  // it scrolls into view so there's no pop-in.
  const isInViewRef = useRef(true);

  // ── PARALLAX + SPEED BOUNCY EFFECT STATE ──
  const [isParallaxEnabled, setIsParallaxEnabled] = useState<boolean>(true);
  const [isSpeedBouncyEnabled, setIsSpeedBouncyEnabled] = useState<boolean>(true);
  const lerpedSpeedRef = useRef<number>(0);

  // ── ALL 16 OFFICIAL SMOOOTHY ENGINE CONFIGURATION OPTIONS ──
  const [smooothyInfinite, setSmooothyInfinite] = useState<boolean>(true);
  const [smooothySnap, setSmooothySnap] = useState<boolean>(false); // false = Free Mode continuous parallax scrolling
  const [smooothyVariableWidth, setSmooothyVariableWidth] = useState<boolean>(false);
  const [smooothyVertical, setSmooothyVertical] = useState<boolean>(false);
  const [smooothyScrollInput, setSmooothyScrollInput] = useState<boolean>(false); // false = Vertical page scroll down passes through naturally without wheel trapping
  const [smooothyDragSensitivity, setSmooothyDragSensitivity] = useState<number>(0.005);
  const [smooothyLerpFactor, setSmooothyLerpFactor] = useState<number>(0.30);
  const [smooothyScrollSensitivity, setSmooothyScrollSensitivity] = useState<number>(1.00);
  const [smooothySnapStrength, setSmooothySnapStrength] = useState<number>(0.00);
  const [smooothySpeedDecay, setSmooothySpeedDecay] = useState<number>(0.85);
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
  const [aspectRatio, setAspectRatio] = useState<string>("aspect-video");
  const [cardGap, setCardGap] = useState<string>("gap-6");
  const [borderRadius, setBorderRadius] = useState<string>("rounded-3xl");
  const [borderStyle, setBorderStyle] = useState<string>("border border-white/10");

  // 2. Motion & Auto-Advance
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState<boolean>(false);
  const [autoAdvanceSpeed, setAutoAdvanceSpeed] = useState<number>(8); // seconds
  const [autoAdvanceDirection, setAutoAdvanceDirection] = useState<"forward" | "reverse">("forward");
  const [transitionSpeed, setTransitionSpeed] = useState<number>(200); // ms
  const [hoverAnimation, setHoverAnimation] = useState<string>("transition-transform duration-300 hover:-translate-y-2");

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

  const isParallaxEnabledRef = useRef(isParallaxEnabled);
  const isSpeedBouncyEnabledRef = useRef(isSpeedBouncyEnabled);
  useEffect(() => {
    isParallaxEnabledRef.current = isParallaxEnabled;
    isSpeedBouncyEnabledRef.current = isSpeedBouncyEnabled;
  }, [isParallaxEnabled, isSpeedBouncyEnabled]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => { isInViewRef.current = entry.isIntersecting; },
      { rootMargin: "300px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
        scrollInput: smooothyScrollInput,
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
          setLastUpdateEvent(`60 FPS Engine`);

          const spd = (instance?.speed as number) ?? 0;
          const dt = (instance?.deltaTime as number) ?? 0.016;
          const parallax = (instance?.parallaxValues as number[]) || [];

          lerpedSpeedRef.current = damp(
            lerpedSpeedRef.current,
            spd,
            5,
            dt
          );

          if (trackRef.current) {
            const slides = trackRef.current.querySelectorAll(".smooothy-slide");
            slides.forEach((slide, i) => {
              const pVal = parallax[i] || 0;
              const innerMedia = slide.querySelector(".smooothy-parallax-media") as HTMLElement | null;

              if (innerMedia) {
                const pOffset = isParallaxEnabledRef.current ? pVal * 12 : 0;
                const skew = isSpeedBouncyEnabledRef.current ? Math.max(-8, Math.min(8, lerpedSpeedRef.current * -2.5)) : 0;
                const scale = 1.22;

                if (smooothyVertical) {
                  innerMedia.style.transform = `scale(${scale}) translateY(${pOffset}%) skewY(${skew}deg)`;
                } else {
                  innerMedia.style.transform = `scale(${scale}) translateX(${pOffset}%) skewX(${skew}deg)`;
                }
              }
            });
          }
        },
      });

      smooothyInstanceRef.current = instance;

      // Official Smooothy animation frame update loop — paused while the
      // carousel is scrolled out of view (see isInViewRef above).
      let animId: number;
      const renderLoop = () => {
        if (isInViewRef.current && smooothyInstanceRef.current?.update) {
          smooothyInstanceRef.current.update();
        }
        animId = requestAnimationFrame(renderLoop);
      };
      animId = requestAnimationFrame(renderLoop);

      return () => {
        if (animId) cancelAnimationFrame(animId);
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
    cardsVisible,
    totalVideos,
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
    setSmooothyDragSensitivity(0.005);
    setSmooothyLerpFactor(0.30);
    setSmooothyScrollSensitivity(1.00);
    setSmooothySnapStrength(0.00);
    setSmooothySpeedDecay(0.85);
    setSmooothyBounceLimit(2.5);
    setSmooothyOffsetPreset("standard");
    setSmooothyVirtualScroll(false);

    setIsParallaxEnabled(true);
    setIsSpeedBouncyEnabled(true);

    // General defaults
    setCardsVisible(3);
    setAspectRatio("aspect-[4/5]");
    setCardGap("gap-6");
    setBorderRadius("rounded-3xl");
    setBorderStyle("border border-white/10");

    setIsAutoPlayEnabled(false);
    setAutoAdvanceSpeed(8);
    setAutoAdvanceDirection("forward");
    setTransitionSpeed(200);
    setHoverAnimation("transition-transform duration-300 hover:-translate-y-2");

    setPreviewStartSec(0);
    setPreviewDurationSec(30);
    setPreviewZoomPercent(200);
    setPlayButtonVisibility("hover");

    setPlayButtonColor("bg-purple-600 hover:bg-purple-500");
    setPlayButtonSize("w-14 h-14");
    setTitleFontSize("text-[18px]");
    setSectionTheme("");

    setShowBadges(true);
    setShowMetadata(true);
    setShowBottomCategoryTabs(true);
  };

  const [windowWidth, setWindowWidth] = useState<number>(1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const effectiveCardsVisible = useMemo(() => {
    if (windowWidth < 640) return 1.18;
    if (windowWidth < 1024) return 2.1;
    return cardsVisible;
  }, [windowWidth, cardsVisible]);

  const gapPx = getGapPx();

  return (
    <section ref={sectionRef} id="video-slider" className={`py-8 md:py-12 bg-gradient-to-b ${sectionTheme} relative overflow-hidden w-screen left-1/2 -translate-x-1/2 select-none`}>

      <div className="w-full relative z-10">
        {/* Section Header with Container Padding */}
        <div className="site-container flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
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
                className="smooothy-slide group flex flex-col shrink-0"
                style={{
                  width: smooothyVertical
                    ? "100%"
                    : `${100 / effectiveCardsVisible}%`,
                  paddingLeft: smooothyVertical ? 0 : `${gapPx / 2}px`,
                  paddingRight: smooothyVertical ? 0 : `${gapPx / 2}px`,
                  paddingTop: smooothyVertical ? `${gapPx / 2}px` : 0,
                  paddingBottom: smooothyVertical ? `${gapPx / 2}px` : 0,
                }}
              >
                {/* Video Card Container */}
                <div
                  style={{ height: "clamp(210px, 41vh, 410px)", maxHeight: "41vh" }}
                  className={`relative ${aspectRatio} ${borderRadius} ${borderStyle} overflow-hidden bg-black/60 shadow-xl`}
                >
                  {/* Transparent Drag Capture Layer (Ensures YouTube iframes never intercept drag events) */}
                  <div className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing bg-transparent" />

                  {/* YouTube On-Demand Autoplay Preview Frame — poster image by default, loads iframe on hover */}
                  <ShowcaseMedia
                    videoId={video.id}
                    videoTitle={video.title}
                    start={start}
                    end={end}
                    previewZoomPercent={previewZoomPercent}
                  />

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
                      <CosmicRadialButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalVideo(video);
                        }}
                        icon={false}
                        className={`${playButtonSize} !rounded-full !p-0 flex items-center justify-center border border-purple-300/40 shadow-2xl transition-all cursor-pointer pointer-events-auto hover:scale-110`}
                        aria-label={`Play full video for ${video.title}`}
                        title="Play Full Video"
                      >
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      </CosmicRadialButton>
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

      {/* Full Video Modal Lightbox */}
      {activeModalVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg  overflow-hidden border border-white/20 shadow-2xl">
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
