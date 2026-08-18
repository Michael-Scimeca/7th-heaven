/* eslint-disable react-doctor/no-giant-component */
/* oxlint-disable react-doctor/control-has-associated-label, react-doctor/label-has-associated-control, react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/control-has-associated-label, react-doctor/label-has-associated-control, react-doctor/click-events-have-key-events */
"use client";
/* eslint-disable react-doctor/prefer-useReducer */
import Image from 'next/image';

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Sliders, Eye, EyeOff, Sparkles, X, RotateCcw, Paintbrush, Scissors, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { SanityBandMember, urlFor } from "@/lib/sanity";

// Explicit member sequence: Frankie (0), Nick (1), Adam (2 - Center), Richard (3), Mark (4)
const FALLBACK_MEMBERS: Partial<SanityBandMember>[] = [
  {
    name: "Frankie Harchut", role: "Drums",
    birthday: "May 31", zodiac: "Gemini",
    bestTrait: "Care For Others",
    favBands: "Sevendust, Korn, A Day To Remember",
    favAlbum: "Throwing Copper",
    favMovie: "My Cousin Vinny, Casino",
    fav7hSong: "Midwest Girls In The Summertime",
    favQuote: "Success is where preparation and opportunity meet",
    funFact: "I'm Polish, or wait, everyone knows that :)",
    image: "/images/members/frankie.png"
  },
  {
    name: "Nick Cox", role: "Guitars • Vocals • Piano",
    birthday: "March 19", zodiac: "Pisces",
    bestTrait: "Great listener",
    favBands: "Kiss, Queen, Zeppelin, Avenged Sevenfold",
    favAlbum: "Physical Graffiti — Led Zeppelin",
    favMovie: "American History X", fav7hSong: "Take Me With You",
    favQuote: "The universe is a pretty big place... seems like an awful waste of space.",
    funFact: "I love just staying home on my couch",
    image: "/images/members/nick.png"
  },
  {
    name: "Adam Heisler", role: "Lead Vocals",
    birthday: "March 13", zodiac: "Pisces",
    bestTrait: "I care too much",
    favBands: "Ben Rector, Billy Joel", favAlbum: "The Stranger — Billy Joel",
    favMovie: "Give me a good romantic comedy",
    fav7hSong: "You and I", favQuote: "I'm always happy and never satisfied",
    funFact: "I used to be a Jr. Black belt in Tae Kwon Do",
    image: "/images/members/adam.png"
  },
  {
    name: "Richard Hofherr", role: "Guitars • Keys • Vocals",
    birthday: "May 17", zodiac: "Taurus",
    bestTrait: "My Perspectives, Work Ethic, Loyalty",
    favBands: "Def Leppard, Queen, Van Halen",
    favAlbum: "Hysteria — Def Leppard",
    favMovie: "Blues Brothers, Star Wars",
    fav7hSong: "Sing, Diamonds, Midwest Girls",
    favQuote: "Life is all about perspectives. You can look at the glass half-empty and half-full.",
    funFact: "I have never had alcohol, drugs, cigarettes or a headache.",
    image: "/images/members/dicky.png"
  },
  {
    name: "Mark Kennetz", role: "Bass • Vocals • Uke • Guitar",
    birthday: "October 19", zodiac: "Libra",
    bestTrait: "Being a Ninja",
    favBands: "Sublime, Led Zeppelin, Muse", favAlbum: "40 oz to Freedom — Sublime",
    favMovie: "Hot Fuzz, Anchorman", fav7hSong: "Ethereal",
    favQuote: "The past is in our heads, the future is in our hands",
    funFact: "Stage 2 carnivore — eat anything with 2 legs or less!",
    image: "/images/members/mark.png"
  },
];

const getMemberVideo = (name: string = "") => {
  const n = name.toLowerCase();
  if (n.includes("adam")) return "/movie/Adam.mp4";
  if (n.includes("richard") || n.includes("rick") || n.includes("dicky") || n.includes("rich")) return "/movie/Rich.mp4";
  if (n.includes("frankie")) return "/movie/Frankie.mp4";
  if (n.includes("mark")) return "/movie/Mark.mp4";
  if (n.includes("nick")) return "/movie/Nick.mp4";
  return "/movie/Adam.mp4";
};

function MemberVideoThumbnail({
  src,
  isActive,
  className = ""
}: {
  src: string;
  isActive: boolean;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (isActive) {
      vid.play().catch(() => { });
    } else {
      vid.pause();
      vid.currentTime = 0;
    }
  }, [isActive]);

  return (
    <video
      ref={videoRef}
      src={src}
      loop
      muted
      playsInline
      className={`${className} transition-colors duration-500 opacity-100 brightness-100`}
    >
      <track kind="captions" />
    </video>
  );
}

// Helper to generate smooth math-based mask gradients
function generateSmoothMaskGradient(
  startPct: number,
  endPct: number,
  floorOpacityPct: number = 0,
  direction: "to bottom" | "to top" = "to bottom",
  easing: "cosine" | "linear" | "ease-in" | "ease-out" | "ease-in-out" = "cosine"
): string {
  const steps = 16;
  const stops: string[] = [];
  const minAlpha = Math.max(0, Math.min(1, floorOpacityPct / 100));

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    let easedT = t;
    if (easing === "cosine") {
      easedT = (1 - Math.cos(t * Math.PI)) / 2;
    } else if (easing === "ease-in") {
      easedT = t * t;
    } else if (easing === "ease-out") {
      easedT = t * (2 - t);
    } else if (easing === "ease-in-out") {
      easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    const pos = startPct + (endPct - startPct) * t;
    const alpha = (1 - easedT) * (1 - minAlpha) + minAlpha;
    stops.push(`rgba(0,0,0,${alpha.toFixed(3)}) ${pos.toFixed(1)}%`);
  }

  return `linear-gradient(${direction}, ${stops.join(", ")})`;
}

export type PositionSlideMaskConfig = {
  positionIndex: number;
  slideLabel: string;
  gradient: {
    enabled: boolean;
    color: string;
    startHeight: number; // 0-100%
    endHeight: number;   // 0-100%
    opacity: number;     // 0-100%
    blendMode: string;
  };
  clippingMask: {
    enabled: boolean;
    startHeight: number; // 0-100%
    endHeight: number;   // 0-100%
    easing: "cosine" | "linear" | "ease-in" | "ease-out" | "ease-in-out";
    floorOpacity: number; // 0-100%
  };
};

const DEFAULT_POSITION_CONFIGS: PositionSlideMaskConfig[] = [
  {
    positionIndex: 0,
    slideLabel: "Slide 1",
    gradient: { enabled: true, color: "#000000", startHeight: 75, endHeight: 100, opacity: 35, blendMode: "normal" },
    clippingMask: { enabled: true, startHeight: 75, endHeight: 98, easing: "linear", floorOpacity: 0 },
  },
  {
    positionIndex: 1,
    slideLabel: "Slide 2",
    gradient: { enabled: true, color: "#000000", startHeight: 75, endHeight: 100, opacity: 35, blendMode: "normal" },
    clippingMask: { enabled: true, startHeight: 75, endHeight: 98, easing: "linear", floorOpacity: 0 },
  },
  {
    positionIndex: 2,
    slideLabel: "Slide 3",
    gradient: { enabled: true, color: "#000000", startHeight: 75, endHeight: 100, opacity: 35, blendMode: "normal" },
    clippingMask: { enabled: true, startHeight: 75, endHeight: 98, easing: "linear", floorOpacity: 0 },
  },
  {
    positionIndex: 3,
    slideLabel: "Slide 4",
    gradient: { enabled: true, color: "#000000", startHeight: 75, endHeight: 100, opacity: 35, blendMode: "normal" },
    clippingMask: { enabled: true, startHeight: 75, endHeight: 98, easing: "linear", floorOpacity: 0 },
  },
  {
    positionIndex: 4,
    slideLabel: "Slide 5",
    gradient: { enabled: true, color: "#000000", startHeight: 75, endHeight: 100, opacity: 35, blendMode: "normal" },
    clippingMask: { enabled: true, startHeight: 75, endHeight: 98, easing: "linear", floorOpacity: 0 },
  },
];

interface BioParallaxSliderProps {
  members?: Partial<SanityBandMember>[];
}

// Fast Staggered load animation delays:
// Adam (idx 2, Lead singer) fades in first (40ms)
// Then Nick (idx 1), Richard (idx 3), Frankie (idx 0), Mark (idx 4)
const getStaggerDelay = (idx: number) => {
  if (idx === 2) return 40;   // Adam
  if (idx === 1) return 120;  // Nick
  if (idx === 3) return 200;  // Richard
  if (idx === 0) return 280;  // Frankie
  return 360;                 // Mark
};

export default function BioParallaxSlider({ members = FALLBACK_MEMBERS }: BioParallaxSliderProps) {
  // Construct 5-member stage explicitly: Frankie, Nick (Left), Adam (Center), Richard (Right), Mark
  const displayMembers = useMemo(() => {
    const list = members.length ? members : FALLBACK_MEMBERS;

    const adam = list.find((m) => m.name?.toLowerCase().includes("adam")) || FALLBACK_MEMBERS[2];
    const nick = list.find((m) => m.name?.toLowerCase().includes("nick")) || FALLBACK_MEMBERS[1];
    const richard = list.find((m) => m.name?.toLowerCase().includes("richard") || m.name?.toLowerCase().includes("rick")) || FALLBACK_MEMBERS[3];
    const frankie = list.find((m) => m.name?.toLowerCase().includes("frankie")) || FALLBACK_MEMBERS[0];
    const mark = list.find((m) => m.name?.toLowerCase().includes("mark")) || FALLBACK_MEMBERS[4];

    return [frankie, nick, adam, richard, mark];
  }, [members]);

  const adamCenterIdx = 2; // Index 2 is Adam Heisler
  const [activeIndex, setActiveIndex] = useState<number>(adamCenterIdx);

  // Smooothy Physics & Tuned UI Configuration
  const physicsMode: "snap" | "free" = "free";
  const [lerpSpeed, setLerpSpeed] = useState<number>(0.10);
  const dragSens = 1.15;
  const dragThreshold = 12;

  // Tunable Stage & Cutout Size Controls — Saved User Configuration
  const [cardWidth, setCardWidth] = useState<number>(355);
  const [imageHeight, setImageHeight] = useState<number>(460);
  const [imageScale, setImageScale] = useState<number>(1.32);
  const [imageOffsetY, setImageOffsetY] = useState<number>(0);
  const [gap, setGap] = useState<number>(24);
  const [parallaxDepth, setParallaxDepth] = useState<number>(0.14);
  const [maxSkew, setMaxSkew] = useState<number>(11);
  const [focalScale, setFocalScale] = useState<number>(1.36);

  const [textLayout, setTextLayout] = useState<"pill" | "top" | "spotlight" | "spine">("pill");
  const [textPos, setTextPos] = useState<"left" | "left-glass" | "left-accent" | "center" | "center-glass" | "right" | "right-glass" | "right-accent">("left");
  const [nameFontSize, setNameFontSize] = useState<number>(28); // px
  const [roleFontSize, setRoleFontSize] = useState<number>(14); // px
  const [textBottomOffset, setTextBottomOffset] = useState<number>(16); // px
  const [textBackdropOpacity, setTextBackdropOpacity] = useState<number>(0); // % opacity for text background backdrop mask

  // 🎭 Position-Based Slide Masking Configurations (0 = Pos 1, 4 = Pos 5) with localStorage persistence
  const [positionConfigs, setPositionConfigs] = useState<PositionSlideMaskConfig[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("smooothy_position_configs_v1");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length === 5) {
            const isValid = parsed.every(
              (c: any) => c?.clippingMask && c.clippingMask.startHeight < c.clippingMask.endHeight
            );
            if (isValid) return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to parse saved position configs:", e);
      }
    }
    return DEFAULT_POSITION_CONFIGS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("smooothy_position_configs_v1", JSON.stringify(positionConfigs));
      } catch (e) {
        console.error("Failed to save position configs:", e);
      }
    }
  }, [positionConfigs]);

  // Default drawer selected slot index (2 = Pos 3 / Active Center)
  const [selectedPositionIdx, setSelectedPositionIdx] = useState<number>(2);
  const [isMaskEditorOpen, setIsMaskEditorOpen] = useState<boolean>(false);

  // 🎬 Video Pagination Layout Style Options (10 Designs)
  const [paginationStyle, setPaginationStyle] = useState<
    "glass-dock" | "circular" | "cyber-hud" | "film-strip" | "minimal" | "left-spine" | "right-spine" | "full-bottom" | "expanded-active" | "diamond"
  >("minimal");
  const [spineTopOffset, setSpineTopOffset] = useState<number>(0); // px from top of slider section



  const [spineGap, setSpineGap] = useState<number>(32);
  const [spineVideoHeight, setSpineVideoHeight] = useState<number>(85);
  const [isTabletView, setIsTabletView] = useState<boolean>(false);

  // Dynamic window height & width scaling — makes slider images & video spine gap scale smoothly across all device sizes
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const isMobile = vw < 640;
      const isTablet = vw >= 640 && vw < 1024;
      setIsTabletView(isTablet);

      let targetHeight: number;
      if (isMobile) {
        targetHeight = Math.max(300, Math.min(520, Math.round((vh - 80) * 0.52)));
      } else if (isTablet) {
        // Tablet view (iPad): scale member image heights down by 30%
        targetHeight = Math.max(250, Math.min(480, Math.round((vh - 100) * 0.57 * 0.70)));
      } else {
        targetHeight = Math.max(360, Math.min(730, Math.round((vh - 100) * 0.57)));
      }

      const targetWidth = isMobile
        ? Math.min(Math.round(vw * 0.72), Math.round(targetHeight * 0.72))
        : Math.round(targetHeight * 0.77);

      // Calculate available spine space so all 5 videos 100% fit inside the slider section without hitting the PAGES button
      const availableSpineHeight = Math.max(160, vh - 220);
      const computedGap = Math.max(4, Math.min(18, Math.round((availableSpineHeight - 200) * 0.035 + 6)));
      const totalGapSpace = 4 * computedGap;
      const maxVideoH = Math.floor((availableSpineHeight - totalGapSpace) / 5);
      const computedVideoHeight = Math.max(40, Math.min(96, maxVideoH));

      setImageHeight(targetHeight);
      setCardWidth(targetWidth);
      setSpineGap(computedGap);
      setSpineVideoHeight(computedVideoHeight);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Tuner UI state
  const [showTuner, setShowTuner] = useState<boolean>(false);
  const copiedRef = useRef<boolean>(false);

  const itemTotalWidth = cardWidth + gap;

  const currentXRef = useRef<number>(adamCenterIdx * itemTotalWidth);
  const targetXRef = useRef<number>(adamCenterIdx * itemTotalWidth);
  const velocityRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  const lerpSpeedRef = useRef<number>(lerpSpeed);
  useEffect(() => { lerpSpeedRef.current = lerpSpeed; }, [lerpSpeed]);

  const parallaxDepthRef = useRef<number>(parallaxDepth);
  useEffect(() => { parallaxDepthRef.current = parallaxDepth; }, [parallaxDepth]);

  const maxSkewRef = useRef<number>(maxSkew);
  useEffect(() => { maxSkewRef.current = maxSkew; }, [maxSkew]);

  const focalScaleRef = useRef<number>(focalScale);
  useEffect(() => { focalScaleRef.current = focalScale; }, [focalScale]);

  const dragThresholdRef = useRef<number>(dragThreshold);
  useEffect(() => { dragThresholdRef.current = dragThreshold; }, [dragThreshold]);

  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartTargetRef = useRef<number>(0);
  const dragStartIdxRef = useRef<number>(adamCenterIdx);
  const lastClientXRef = useRef<number>(0);
  const hasTriggeredRef = useRef<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Quick Presets
  const applyPreset = (preset: "default" | "compact" | "giant" | "grounded") => {
    if (preset === "default") {
      setCardWidth(355);
      setImageHeight(460);
      setImageScale(1.42);
      setImageOffsetY(52);
      setFocalScale(1.28);
      setGap(24);
      setParallaxDepth(0.14);
      setMaxSkew(11);
      setLerpSpeed(0.10);
    } else if (preset === "compact") {
      setCardWidth(310);
      setImageHeight(310);
      setImageScale(1.02);
      setImageOffsetY(0);
      setFocalScale(1.10);
      setGap(18);
      setParallaxDepth(0.10);
      setMaxSkew(8);
      setLerpSpeed(0.15);
    } else if (preset === "giant") {
      setCardWidth(450);
      setImageHeight(450);
      setImageScale(1.30);
      setImageOffsetY(-20);
      setFocalScale(1.25);
      setGap(32);
      setParallaxDepth(0.18);
      setMaxSkew(15);
      setLerpSpeed(0.10);
    } else if (preset === "grounded") {
      setCardWidth(360);
      setImageHeight(360);
      setImageScale(1.10);
      setImageOffsetY(20);
      setFocalScale(1.14);
      setGap(20);
      setParallaxDepth(0.12);
      setMaxSkew(10);
      setLerpSpeed(0.14);
    }
  };

  const copyConfig = () => {
    const config = `// Slider Configuration Settings
cardWidth: ${cardWidth}px
imageHeight: ${imageHeight}px
imageScale: ${imageScale}x
imageOffsetY: ${imageOffsetY}px
focalScale: ${focalScale}x
gap: ${gap}px
parallaxDepth: ${parallaxDepth}
maxSkew: ${maxSkew}°
lerpSpeed: ${lerpSpeed}`;
    navigator.clipboard.writeText(config);
    copiedRef.current = true;
    setTimeout(() => { copiedRef.current = false; }, 2000);
  };

  // Initialize position centered on Adam Heisler (index 2)
  useEffect(() => {
    targetXRef.current = adamCenterIdx * itemTotalWidth;
    currentXRef.current = adamCenterIdx * itemTotalWidth;
  }, [adamCenterIdx, itemTotalWidth]);

  // 60fps Smooothy Lerp physics loop
  useEffect(() => {
    let lastX = currentXRef.current;

    const updatePhysics = () => {
      // Lerp current position to target position using Smooothy inertia factor
      const diff = targetXRef.current - currentXRef.current;
      if (Math.abs(diff) < 0.1) {
        currentXRef.current = targetXRef.current;
      } else {
        currentXRef.current += diff * lerpSpeedRef.current;
      }

      // Velocity calculation
      const vel = currentXRef.current - lastX;
      lastX = currentXRef.current;
      velocityRef.current = vel;

      // Calculate center padding offset for 100vw full screen stage
      const containerWidth = containerRef.current ? containerRef.current.clientWidth : (typeof window !== "undefined" ? window.innerWidth : 1400);
      const centerPadding = (containerWidth - cardWidth) / 2;

      if (trackRef.current) {
        // Center active card in middle across full screen width
        const translateX = centerPadding - currentXRef.current;
        trackRef.current.style.transform = `translate3d(${translateX}px, 0, 0)`;

        // Apply dynamic scale, opacity, border, and parallax transforms to all cards
        const cardEls = trackRef.current.children;
        for (let i = 0; i < cardEls.length; i++) {
          const card = cardEls[i] as HTMLElement;
          const imgEl = (card.querySelector(".smooothy-img-wrapper") || card.querySelector(".smooothy-img")) as HTMLElement | null;

          // Distance in slide units from center focal point
          const distFromCenter = Math.abs((currentXRef.current - i * itemTotalWidth) / itemTotalWidth);

          // Continuous smooth scale & opacity: Active center member scales up continuously as it glides into center
          const focalVal = Math.max(0, 1 - Math.min(distFromCenter, 1.5) / 1.5);
          const scale = 0.82 + focalVal * (focalScaleRef.current - 0.82);
          const opacity = 0.40 + focalVal * 0.60;

          // Smooothy speed-based dynamic skew
          const skewX = Math.max(-maxSkewRef.current, Math.min(maxSkewRef.current, vel * 0.35));

          card.style.transformOrigin = "bottom center";
          card.style.transform = `scale(${scale}) skewX(${skewX}deg)`;
          card.style.opacity = "1";

          // Dynamic z-index depth layering elevates as card glides into focal center
          if (distFromCenter < 0.75) {
            card.classList.add("z-40");
            card.classList.remove("z-20", "z-30");
          } else if (distFromCenter < 1.5) {
            card.classList.add("z-30");
            card.classList.remove("z-20", "z-40");
          } else {
            card.classList.add("z-20");
            card.classList.remove("z-30", "z-40");
          }

          // Parallax cutout translate + speed scale effect inside member card
          if (imgEl) {
            const cardOffset = i * itemTotalWidth - currentXRef.current;
            const parallaxX = cardOffset * parallaxDepthRef.current;
            const baseScale = isTabletView ? imageScale * 0.70 : imageScale;
            const speedScale = baseScale + Math.min(Math.abs(vel) * 0.005, 0.06);
            const transformStr = `translate3d(${parallaxX}px, ${imageOffsetY}px, 0) scale(${speedScale})`;

            imgEl.style.transformOrigin = "bottom center";
            imgEl.style.transform = transformStr;
            imgEl.style.opacity = "1";

            if (focalVal > 0.05) {
              const shadowAlpha = (focalVal * 0.60).toFixed(2);
              imgEl.style.filter = `drop-shadow(0 25px 50px rgba(0, 0, 0, ${shadowAlpha})) drop-shadow(0 15px 30px rgba(0, 0, 0, 0.45))`;
            } else {
              imgEl.style.filter = "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.35))";
            }
          }
        }
      }

      // Compute active centered slide index (only trigger setState if index changed)
      const rawIdx = Math.round(currentXRef.current / itemTotalWidth);
      const safeIdx = Math.max(0, Math.min(displayMembers.length - 1, rawIdx));
      setActiveIndex((prev) => (prev !== safeIdx ? safeIdx : prev));

      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [itemTotalWidth, displayMembers.length, cardWidth, imageScale, imageOffsetY, isTabletView]);

  // Go to slide
  const goToSlide = (idx: number) => {
    const safeIdx = Math.max(0, Math.min(displayMembers.length - 1, idx));
    targetXRef.current = safeIdx * itemTotalWidth;
  };

  // Global Keyboard Arrow Navigation (Left / Right Arrow, A / D keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        const safeIdx = Math.max(0, Math.min(displayMembers.length - 1, activeIndex - 1));
        targetXRef.current = safeIdx * itemTotalWidth;
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        const safeIdx = Math.max(0, Math.min(displayMembers.length - 1, activeIndex + 1));
        targetXRef.current = safeIdx * itemTotalWidth;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, displayMembers.length, itemTotalWidth]);

  // Pointer drag handlers — Live 1:1 visual dragging during move, smooth momentum snap on release
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartTargetRef.current = targetXRef.current;
    dragStartIdxRef.current = Math.round(currentXRef.current / itemTotalWidth);
    lastClientXRef.current = e.clientX;
    velocityRef.current = 0;
    hasTriggeredRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = lastClientXRef.current - e.clientX;
    lastClientXRef.current = e.clientX;
    velocityRef.current = deltaX;

    const maxTarget = (displayMembers.length - 1) * itemTotalWidth;
    const totalDelta = dragStartXRef.current - e.clientX;

    // Physical 1:1 visual dragging with smooth boundary dampening
    const newX = Math.max(0, Math.min(maxTarget, dragStartTargetRef.current + totalDelta * 1.15));
    targetXRef.current = newX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    // Calculate inertia target based on drag release velocity
    const momentumOffset = velocityRef.current * 18;
    const projectTarget = targetXRef.current + momentumOffset;
    const nearestIdx = Math.max(
      0,
      Math.min(displayMembers.length - 1, Math.round(projectTarget / itemTotalWidth))
    );

    goToSlide(nearestIdx);
    hasTriggeredRef.current = false;
  };

  return (
    <div
      className="w-full max-w-full overflow-x-clip h-auto min-h-[400px] flex flex-col justify-end select-none font-sans relative bg-transparent pt-16 md:pt-24 lg:pt-28 pb-4 mt-8 md:mt-16 lg:mt-20"
    >


      {/* 🎬 LEFT SPINE VIDEO PAGINATION (Top video locked at blue line top-[36px], gap & height scale down as screen height shrinks) */}
      {paginationStyle === "left-spine" && (
        <div className="absolute left-2 sm:left-6 md:left-8 top-[36px] z-30 flex flex-col items-start select-none">
          <div className="flex flex-col z-10" style={{ gap: `${spineGap}px` }}>
            {displayMembers.map((m, idx) => {
              const isActive = activeIndex === idx;
              const videoSrc = getMemberVideo(m?.name);

              return (
                <button aria-label="Action button"
                  key={idx}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToSlide(idx); }}
                  className={`relative group flex items-center gap-2 sm:gap-3.5 cursor-pointer transition-colors duration-300 ${isActive ? "z-20" : ""
                    }`}
                >
                  {/* Video Card (Height & gap scale down dynamically with window height) */}
                  <div
                    className="sm: overflow-hidden relative transition-colors duration-300 shadow-xl shrink-0"
                    style={{
                      height: `${spineVideoHeight}px`,
                      width: `${Math.round(spineVideoHeight * 0.78)}px`,
                      WebkitMaskImage: "radial-gradient(ellipse at center, black 60%, transparent 100%)",
                      maskImage: "radial-gradient(ellipse at center, black 60%, transparent 100%)"
                    }}
                  >
                    <MemberVideoThumbnail src={videoSrc} isActive={isActive} className="w-full h-full object-cover" />
                  </div>

                  {/* Member Name & Role Display (Responsive text sizing) */}
                  <div className={`transition-colors duration-300 whitespace-nowrap block text-left ${isActive
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                    }`}>
                    <p className="text-xs sm:text-sm md:text-base font-black text-white leading-none tracking-tight drop-shadow-md">
                      {m?.name || "Band Member"}
                    </p>
                    <p className="text-[10px] sm:text-xs font-bold  text-[var(--color-accent)] mt-0.5 sm:mt-1 tracking-wide">
                      {m?.role || "Musician"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 🎬 RIGHT SPINE VIDEO PAGINATION (Top video locked at blue line top-[36px], gap & height scale down as screen height shrinks) */}
      {paginationStyle === "right-spine" && (
        <div className="absolute right-2 sm:right-6 md:right-8 top-[36px] z-30 flex flex-col items-end select-none">
          <div className="flex flex-col z-10" style={{ gap: `${spineGap}px` }}>
            {displayMembers.map((m, idx) => {
              const isActive = activeIndex === idx;
              const videoSrc = getMemberVideo(m?.name);

              return (
                <button aria-label="Action button"
                  key={idx}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToSlide(idx); }}
                  className={`relative group flex items-center justify-end gap-2 sm:gap-3.5 cursor-pointer transition-colors duration-300 ${isActive ? "z-20" : ""
                    }`}
                >
                  {/* Member Name & Role Display (Responsive text sizing) */}
                  <div className={`transition-colors duration-300 whitespace-nowrap block text-right ${isActive
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                    }`}>
                    <p className="text-xs sm:text-sm md:text-base font-black text-white leading-none tracking-tight drop-shadow-md">
                      {m?.name || "Band Member"}
                    </p>
                    <p className="text-[10px] sm:text-xs font-bold  text-[var(--color-accent)] mt-0.5 sm:mt-1 tracking-wide">
                      {m?.role || "Musician"}
                    </p>
                  </div>

                  {/* Video Card (Height & gap scale down dynamically with window height) */}
                  <div
                    className="sm: overflow-hidden relative transition-colors duration-300 shadow-xl shrink-0"
                    style={{
                      height: `${spineVideoHeight}px`,
                      width: `${Math.round(spineVideoHeight * 0.78)}px`,
                      WebkitMaskImage: "radial-gradient(ellipse at center, black 60%, transparent 100%)",
                      maskImage: "radial-gradient(ellipse at center, black 60%, transparent 100%)"
                    }}
                  >
                    <MemberVideoThumbnail src={videoSrc} isActive={isActive} className="w-full h-full object-cover" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 100VW FULL-SCREEN STAGE CONTAINER */}
      <div className="w-full relative overflow-x-clip">

        {/* 5-CARD FULL-SCREEN CANVAS */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: "pan-y" }}
          className="w-full overflow-visible cursor-grab active:cursor-grabbing relative pt-2 pb-0"
        >
          {/* TRACK ELEMENT */}
          <div
            ref={trackRef}
            className="flex items-end pt-2 pb-0"
            style={{ gap: `${gap}px`, width: `${displayMembers.length * itemTotalWidth}px` }}
          >
            {displayMembers.map((m, i) => {
              const nameLower = m?.name?.toLowerCase() || "";
              let imageSrc = "";
              if (nameLower.includes("adam")) imageSrc = "/images/members/adam.png";
              else if (nameLower.includes("richard") || nameLower.includes("rick") || nameLower.includes("dicky")) imageSrc = "/images/members/dicky.png";
              else if (nameLower.includes("frankie")) imageSrc = "/images/members/frankie.png";
              else if (nameLower.includes("mark")) imageSrc = "/images/members/mark.png";
              else if (nameLower.includes("nick")) imageSrc = "/images/members/nick.png";
              else imageSrc = m?.image ? (typeof m.image === 'string' ? m.image : urlFor(m.image).url()) : "/images/members/adam.png";

              // Stage slot index relative to current active centered slide (2 = Active Center, 1 = Left, 0 = Far Left, 3 = Right, 4 = Far Right)
              const slotIndex = Math.max(0, Math.min(4, Math.round((i - activeIndex) + 2)));
              const slideCfg = positionConfigs[slotIndex] || DEFAULT_POSITION_CONFIGS[slotIndex];

              const clipStyle = slideCfg.clippingMask.enabled
                ? generateSmoothMaskGradient(
                  slideCfg.clippingMask.startHeight,
                  slideCfg.clippingMask.endHeight,
                  slideCfg.clippingMask.floorOpacity,
                  "to bottom",
                  slideCfg.clippingMask.easing
                )
                : undefined;

              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => goToSlide(i)}
                  style={{ width: `${cardWidth}px`, isolation: "isolate" }}
                  className="shrink-0 bg-transparent rounded-3xl px-2 pt-0 pb-0 relative overflow-visible cursor-pointer flex flex-col justify-end origin-bottom border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ring-0 active:outline-none text-left"
                >
                  <div className="relative z-10 flex flex-col justify-end h-full overflow-visible">
                    <div className="overflow-visible relative">

                      {/* Dynamic Sized Member Photo Cutout Container */}
                      <div
                        className="smooothy-img-container relative flex items-end justify-center overflow-visible bg-transparent transition-colors duration-150 origin-bottom"
                        style={{
                          height: `${imageHeight}px`,
                          transform: `translateY(${imageOffsetY}px)`,
                        }}
                      >
                        <Image
                          src={imageSrc}
                          alt={m?.name || "Member Photo"}
                          width={600}
                          height={800}
                          draggable={false}
                          sizes="(max-width: 768px) 50vw, 600px"
                          className="smooothy-img h-full w-auto max-w-none object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)] pointer-events-none select-none origin-bottom relative z-0 transition-all duration-200"
                          style={{
                            maxHeight: `${imageHeight}px`,
                            transform: `scale(${imageScale})`,
                            opacity: 1,
                            ...(clipStyle ? { WebkitMaskImage: clipStyle, maskImage: clipStyle } : {}),
                          }}
                        />

                        {/* Layer 1: Sibling Overlay Div (Smooth 2D Feathered Radial Gradient Glow with Zero Edge Cuts) */}
                        {slideCfg.gradient.enabled && (
                          <div
                            className="smooothy-overlay-div absolute inset-0 pointer-events-none z-10 transition-all duration-200"
                            style={{
                              left: "-82%",
                              bottom: "0px",
                              width: "229%",
                              background: `radial-gradient(ellipse 75% 65% at 50% 100%, ${slideCfg.gradient.color} 0%, ${slideCfg.gradient.color} ${Math.max(0, slideCfg.gradient.startHeight - 15)}%, transparent 100%)`,
                              opacity: slideCfg.gradient.opacity / 100,
                              mixBlendMode: slideCfg.gradient.blendMode as any,
                              WebkitMaskImage: clipStyle
                                ? `${clipStyle}, linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)`
                                : "linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)",
                              maskImage: clipStyle
                                ? `${clipStyle}, linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)`
                                : "linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)",
                              WebkitMaskComposite: "source-in",
                              maskComposite: "intersect",
                            }}
                          />
                        )}
                      </div>

                      {/* Dynamic Member Info Overlay (z-30 - Pure White & Bright Purple Text with Live Control & Active Slide Opacity Lock) */}
                      {textPos === "left" && (
                        <div
                          className="absolute left-4 z-30 flex flex-col items-start text-left pointer-events-none max-w-[90%] transition-opacity duration-300"
                          style={{
                            bottom: `${textBottomOffset}px`,
                            opacity: activeIndex === i ? 1 : 0,
                            ...(textBackdropOpacity > 0 ? { backgroundColor: `rgba(0,0,0,${textBackdropOpacity / 100})`, padding: "8px 12px", borderRadius: "8px" } : {})
                          }}
                        >
                          <h3 className="font-black text-white tracking-tight leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,1)]" style={{ fontSize: `${nameFontSize}px` }}>
                            {m?.name}
                          </h3>
                          <span className="font-extrabold text-[#c084fc] tracking-wide block drop-shadow-[0_2px_8px_rgba(0,0,0,1)] mt-0.5" style={{ fontSize: `${roleFontSize}px` }}>
                            {m?.role}
                          </span>
                        </div>
                      )}

                      {textPos === "left-glass" && (
                        <div
                          className="absolute left-4 z-30 flex flex-col items-start text-left pointer-events-none max-w-[90%] bg-black/85 backdrop-blur-xl border border-white/15 px-4 py-3 transition-opacity duration-300"
                          style={{ bottom: `${textBottomOffset}px`, opacity: activeIndex === i ? 1 : 0 }}
                        >
                          <h3 className="font-extrabold text-white tracking-tight leading-tight" style={{ fontSize: `${nameFontSize}px` }}>
                            {m?.name}
                          </h3>
                          <span className="font-bold text-[var(--color-accent)] tracking-wide block mt-0.5" style={{ fontSize: `${roleFontSize}px` }}>
                            {m?.role}
                          </span>
                        </div>
                      )}

                      {textPos === "left-accent" && (
                        <div
                          className="absolute left-4 z-30 flex flex-col items-start text-left pointer-events-none max-w-[90%] pl-0 py-1 transition-opacity duration-300"
                          style={{ bottom: `${textBottomOffset}px`, opacity: activeIndex === i ? 1 : 0 }}
                        >
                          <h3 className="font-extrabold text-white tracking-tight leading-tight drop-shadow-md" style={{ fontSize: `${nameFontSize}px` }}>
                            {m?.name}
                          </h3>
                          <span className="font-bold text-[var(--color-accent)] tracking-wide block drop-shadow-md mt-0.5" style={{ fontSize: `${roleFontSize}px` }}>
                            {m?.role}
                          </span>
                        </div>
                      )}

                      {textPos === "center" && (
                        <div
                          className="absolute left-1/2 -translate-x-1/2 z-30 flex flex-col items-center text-center pointer-events-none w-full px-2 transition-opacity duration-300"
                          style={{
                            bottom: `${textBottomOffset}px`,
                            opacity: activeIndex === i ? 1 : 0,
                            ...(textBackdropOpacity > 0 ? { backgroundColor: `rgba(0,0,0,${textBackdropOpacity / 100})`, padding: "8px 12px" } : {})
                          }}
                        >
                          <h3 className="font-black text-white tracking-tight leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,1)]" style={{ fontSize: `${nameFontSize}px` }}>
                            {m?.name}
                          </h3>
                          <span className="font-extrabold text-[#c084fc] tracking-wide block drop-shadow-[0_2px_8px_rgba(0,0,0,1)] mt-0.5" style={{ fontSize: `${roleFontSize}px` }}>
                            {m?.role}
                          </span>
                        </div>
                      )}

                      {textPos === "center-glass" && (
                        <div
                          className="absolute left-1/2 -translate-x-1/2 z-30 flex flex-col items-center text-center pointer-events-none max-w-[90%] bg-black/85 backdrop-blur-xl border border-white/15 px-4 py-2.5 rounded-xl shadow-2xl transition-opacity duration-300"
                          style={{ bottom: `${textBottomOffset}px`, opacity: activeIndex === i ? 1 : 0 }}
                        >
                          <h3 className="font-extrabold text-white tracking-tight leading-tight" style={{ fontSize: `${nameFontSize}px` }}>
                            {m?.name}
                          </h3>
                          <span className="font-bold text-[#c084fc] tracking-wide block mt-0.5" style={{ fontSize: `${roleFontSize}px` }}>
                            {m?.role}
                          </span>
                        </div>
                      )}

                      {textPos === "right" && (
                        <div
                          className="absolute right-4 z-30 flex flex-col items-end text-right pointer-events-none max-w-[90%] transition-opacity duration-300"
                          style={{
                            bottom: `${textBottomOffset}px`,
                            opacity: activeIndex === i ? 1 : 0,
                            ...(textBackdropOpacity > 0 ? { backgroundColor: `rgba(0,0,0,${textBackdropOpacity / 100})`, padding: "8px 12px", borderRadius: "8px" } : {})
                          }}
                        >
                          <h3 className="font-extrabold text-white tracking-tight leading-tight drop-shadow-md" style={{ fontSize: `${nameFontSize}px` }}>
                            {m?.name}
                          </h3>
                          <span className="font-bold text-[var(--color-accent)] tracking-wide block drop-shadow-md mt-0.5" style={{ fontSize: `${roleFontSize}px` }}>
                            {m?.role}
                          </span>
                        </div>
                      )}

                      {textPos === "right-glass" && (
                        <div
                          className="absolute right-4 z-30 flex flex-col items-end text-right pointer-events-none max-w-[90%] bg-black/85 backdrop-blur-xl border border-white/15 px-4 py-3 transition-opacity duration-300"
                          style={{ bottom: `${textBottomOffset}px`, opacity: activeIndex === i ? 1 : 0 }}
                        >
                          <h3 className="font-extrabold text-white tracking-tight leading-tight" style={{ fontSize: `${nameFontSize}px` }}>
                            {m?.name}
                          </h3>
                          <span className="font-bold text-[var(--color-accent)] tracking-wide block mt-0.5" style={{ fontSize: `${roleFontSize}px` }}>
                            {m?.role}
                          </span>
                        </div>
                      )}

                      {textPos === "right-accent" && (
                        <div
                          className="absolute right-4 z-30 flex flex-col items-end text-right pointer-events-none max-w-[90%] border-r-2 border-[var(--color-accent)] pr-3 py-1 transition-opacity duration-300"
                          style={{ bottom: `${textBottomOffset}px`, opacity: activeIndex === i ? 1 : 0 }}
                        >
                          <h3 className="font-extrabold text-white tracking-tight leading-tight drop-shadow-md" style={{ fontSize: `${nameFontSize}px` }}>
                            {m?.name}
                          </h3>
                          <span className="font-bold text-[var(--color-accent)] tracking-wide block drop-shadow-md mt-0.5" style={{ fontSize: `${roleFontSize}px` }}>
                            {m?.role}
                          </span>
                        </div>
                      )}

                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 🎭 Floating Cutout Mask Studio Control Toggle & Panel */}
        <div className="fixed bottom-6 left-6 z-[200]">
          <button
            type="button"
            onClick={() => setIsMaskEditorOpen(!isMaskEditorOpen)}
            className="px-4 py-3 rounded-full bg-black/90 hover:bg-black backdrop-blur-2xl border border-purple-500/50 hover:border-purple-400 text-white text-xs font-mono font-extrabold tracking-wider flex items-center gap-2.5 shadow-[0_8px_32px_rgba(168,85,247,0.45)] transition-all transform hover:scale-105 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>Cutout Mask Studio</span>
          </button>

          {/* Expanded Studio Control Drawer */}
          {isMaskEditorOpen && (
            <div
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute bottom-16 left-0 w-80 sm:w-96 max-h-[85vh] overflow-y-auto custom-scrollbar bg-black/95 backdrop-blur-2xl border border-purple-500/40 rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.95)] text-white text-xs space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h4 className="font-extrabold uppercase tracking-wider text-sm text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-400">
                    Cutout Mask Studio
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMaskEditorOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Member Slide Selector Tabs */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                  <span className="uppercase text-purple-300/80">Select Stage Position</span>
                  <span className="text-white font-extrabold">
                    {["Pos 1 (Far Left)", "Pos 2 (Left)", "Pos 3 (Center)", "Pos 4 (Right)", "Pos 5 (Far Right)"][selectedPositionIdx]}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1 bg-white/5 p-1 rounded-xl border border-white/10 font-mono text-[9px]">
                  {[0, 1, 2, 3, 4].map((idx) => {
                    const isSel = selectedPositionIdx === idx;
                    const labels = ["Pos 1 (Far Left)", "Pos 2 (Left)", "Pos 3 (Center)", "Pos 4 (Right)", "Pos 5 (Far Right)"];
                    const shortLabels = ["Pos 1", "Pos 2", "Pos 3", "Pos 4", "Pos 5"];
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setSelectedPositionIdx(idx);
                        }}
                        title={labels[idx]}
                        className={`py-1.5 px-0.5 rounded-lg font-extrabold transition-all cursor-pointer text-center leading-tight ${isSel
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/40"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                          }`}
                      >
                        {shortLabels[idx]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 🎨 GROUP 1: COLOR GRADIENT LAYER */}
              <div className="space-y-2.5 bg-purple-950/40 p-3 rounded-2xl border border-purple-500/30">
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                  <div className="flex items-center gap-2 font-bold text-purple-200">
                    <Paintbrush className="w-3.5 h-3.5 text-purple-400" />
                    <span>1. Bottom-Up Color Gradient</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPositionConfigs((prev) =>
                        prev.map((cfg, idx) =>
                          idx === selectedPositionIdx
                            ? { ...cfg, gradient: { ...cfg.gradient, enabled: !cfg.gradient.enabled } }
                            : cfg
                        )
                      );
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider cursor-pointer transition-all ${positionConfigs[selectedPositionIdx]?.gradient.enabled
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-white/10 text-white/50 border border-white/10"
                      }`}
                  >
                    {positionConfigs[selectedPositionIdx]?.gradient.enabled ? "Active" : "Disabled"}
                  </button>
                </div>

                {positionConfigs[selectedPositionIdx]?.gradient.enabled && (
                  <div className="space-y-2 pt-1">
                    {/* Color Swatch & Custom Picker */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-white/80">Gradient Color</span>
                        <span className="font-mono text-purple-300 font-bold uppercase text-[10px]">
                          {positionConfigs[selectedPositionIdx]?.gradient.color}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={positionConfigs[selectedPositionIdx]?.gradient.color}
                          onChange={(e) => {
                            const col = e.target.value;
                            setPositionConfigs((prev) =>
                              prev.map((cfg, idx) =>
                                idx === selectedPositionIdx
                                  ? { ...cfg, gradient: { ...cfg.gradient, color: col } }
                                  : cfg
                              )
                            );
                          }}
                          className="w-7 h-7 rounded-lg bg-transparent border-0 cursor-pointer p-0"
                        />
                        <div className="flex items-center gap-1.5 flex-1">
                          {["#c084fc", "#9333ea", "#38bdf8", "#000000", "#120826"].map((hex) => (
                            <button
                              type="button"
                              key={hex}
                              onClick={() => {
                                setPositionConfigs((prev) =>
                                  prev.map((cfg, idx) =>
                                    idx === selectedPositionIdx
                                      ? { ...cfg, gradient: { ...cfg.gradient, color: hex } }
                                      : cfg
                                  )
                                );
                              }}
                              className="w-5 h-5 rounded-full border border-white/30 cursor-pointer transition-transform hover:scale-110 shadow-sm"
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Gradient Start Height */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-white/80">Start Height</span>
                        <span className="font-mono text-purple-300 font-bold">
                          {positionConfigs[selectedPositionIdx]?.gradient.startHeight}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={positionConfigs[selectedPositionIdx]?.gradient.startHeight}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPositionConfigs((prev) =>
                            prev.map((cfg, idx) =>
                              idx === selectedPositionIdx
                                ? { ...cfg, gradient: { ...cfg.gradient, startHeight: val } }
                                : cfg
                            )
                          );
                        }}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>

                    {/* Gradient Opacity */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-white/80">Gradient Opacity</span>
                        <span className="font-mono text-purple-300 font-bold">
                          {positionConfigs[selectedPositionIdx]?.gradient.opacity}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={positionConfigs[selectedPositionIdx]?.gradient.opacity}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPositionConfigs((prev) =>
                            prev.map((cfg, idx) =>
                              idx === selectedPositionIdx
                                ? { ...cfg, gradient: { ...cfg.gradient, opacity: val } }
                                : cfg
                            )
                          );
                        }}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ✂️ GROUP 2: CLIPPING MASK LAYER */}
              <div className="space-y-2.5 bg-purple-950/40 p-3 rounded-2xl border border-purple-500/30">
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                  <div className="flex items-center gap-2 font-bold text-purple-200">
                    <Scissors className="w-3.5 h-3.5 text-purple-400" />
                    <span>2. Bottom-Up Clipping Mask</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPositionConfigs((prev) =>
                        prev.map((cfg, idx) =>
                          idx === selectedPositionIdx
                            ? { ...cfg, clippingMask: { ...cfg.clippingMask, enabled: !cfg.clippingMask.enabled } }
                            : cfg
                        )
                      );
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider cursor-pointer transition-all ${positionConfigs[selectedPositionIdx]?.clippingMask.enabled
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-white/10 text-white/50 border border-white/10"
                      }`}
                  >
                    {positionConfigs[selectedPositionIdx]?.clippingMask.enabled ? "Active" : "Disabled"}
                  </button>
                </div>

                {positionConfigs[selectedPositionIdx]?.clippingMask.enabled && (
                  <div className="space-y-2 pt-1">
                    {/* Mask Start Height */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-white/80">Mask Fade Start</span>
                        <span className="font-mono text-purple-300 font-bold">
                          {positionConfigs[selectedPositionIdx]?.clippingMask.startHeight}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={positionConfigs[selectedPositionIdx]?.clippingMask.startHeight}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPositionConfigs((prev) =>
                            prev.map((cfg, idx) =>
                              idx === selectedPositionIdx
                                ? { ...cfg, clippingMask: { ...cfg.clippingMask, startHeight: val } }
                                : cfg
                            )
                          );
                        }}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>

                    {/* Easing Curve */}
                    <div className="space-y-1">
                      <span className="font-semibold text-white/80 block text-[11px]">Easing Curve</span>
                      <div className="grid grid-cols-3 gap-1">
                        {(["cosine", "linear", "ease-in", "ease-out", "ease-in-out"] as const).map((curve) => (
                          <button
                            type="button"
                            key={curve}
                            onClick={() => {
                              setPositionConfigs((prev) =>
                                prev.map((cfg, idx) =>
                                  idx === selectedPositionIdx
                                    ? { ...cfg, clippingMask: { ...cfg.clippingMask, easing: curve } }
                                    : cfg
                                )
                              );
                            }}
                            className={`py-1 px-1.5 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer text-center border ${positionConfigs[selectedPositionIdx]?.clippingMask.easing === curve
                              ? "bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/40"
                              : "bg-purple-950/40 text-purple-200/70 border-purple-500/20 hover:text-white hover:bg-purple-800/40"
                              }`}
                          >
                            {curve}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Floor Opacity */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-white/80">Floor Min Opacity</span>
                        <span className="font-mono text-purple-300 font-bold">
                          {positionConfigs[selectedPositionIdx]?.clippingMask.floorOpacity}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={positionConfigs[selectedPositionIdx]?.clippingMask.floorOpacity}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPositionConfigs((prev) =>
                            prev.map((cfg, idx) =>
                              idx === selectedPositionIdx
                                ? { ...cfg, clippingMask: { ...cfg.clippingMask, floorOpacity: val } }
                                : cfg
                            )
                          );
                        }}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Reset & Save/Copy CSS Buttons */}
              <div className="pt-2 border-t border-white/10 flex flex-col space-y-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem("smooothy_position_configs_v1", JSON.stringify(positionConfigs));
                    } catch (e) {
                      console.error("Failed to save position configs:", e);
                    }
                    const currentCfg = positionConfigs[selectedPositionIdx];
                    const verticalMaskCSS = generateSmoothMaskGradient(
                      currentCfg.clippingMask.startHeight,
                      currentCfg.clippingMask.endHeight,
                      currentCfg.clippingMask.floorOpacity,
                      "to bottom",
                      currentCfg.clippingMask.easing
                    );
                    const cssRules = `/* 🎭 7th Heaven Cutout Mask & Gradient CSS Styles (Pos ${selectedPositionIdx + 1}) */
.smooothy-overlay-div {
  background: radial-gradient(ellipse 75% 65% at 50% 100%, ${currentCfg.gradient.color} 0%, transparent 100%);
  opacity: ${(currentCfg.gradient.opacity / 100).toFixed(2)};
  mask-image: ${verticalMaskCSS}, linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%);
  -webkit-mask-image: ${verticalMaskCSS}, linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%);
  mask-composite: intersect;
  -webkit-mask-composite: source-in;
  bottom: 0px;
}`;
                    console.log("=== SAVED_CSS_STYLES ===");
                    console.log(cssRules);
                    navigator.clipboard?.writeText(cssRules);
                    alert("✅ CSS Styles Saved & Copied to Clipboard!\n\n" + cssRules);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Save CSS Styles</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const codeStr = JSON.stringify(positionConfigs, null, 2);
                    console.log("=== CURRENT_POSITION_CONFIGS_JSON ===");
                    console.log(codeStr);
                    navigator.clipboard?.writeText(codeStr);
                    alert("Current UI settings copied to clipboard! You can also paste them into our chat.");
                  }}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Copy Preset Code to Clipboard</span>
                </button>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPositionConfigs((prev) =>
                        prev.map((cfg, idx) =>
                          idx === selectedPositionIdx ? DEFAULT_POSITION_CONFIGS[selectedPositionIdx] : cfg
                        )
                      );
                    }}
                    className="flex items-center gap-1 font-mono text-purple-400 hover:text-white font-bold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Pos {selectedPositionIdx + 1}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPositionConfigs(DEFAULT_POSITION_CONFIGS)}
                    className="flex items-center gap-1 font-mono text-purple-400 hover:text-white font-bold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset All 5 Slides</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
