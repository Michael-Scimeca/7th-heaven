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
    slideLabel: "Far Left (Pos 1)",
    gradient: { enabled: true, color: "#000000", startHeight: 70, endHeight: 100, opacity: 50, blendMode: "normal" },
    clippingMask: { enabled: true, startHeight: 75, endHeight: 98, easing: "linear", floorOpacity: 0 },
  },
  {
    positionIndex: 1,
    slideLabel: "Left (Pos 2)",
    gradient: { enabled: true, color: "#000000", startHeight: 65, endHeight: 100, opacity: 45, blendMode: "normal" },
    clippingMask: { enabled: true, startHeight: 75, endHeight: 98, easing: "linear", floorOpacity: 0 },
  },
  {
    positionIndex: 2,
    slideLabel: "Center (Pos 3 - Active)",
    gradient: { enabled: true, color: "#000000", startHeight: 60, endHeight: 100, opacity: 60, blendMode: "normal" },
    clippingMask: { enabled: true, startHeight: 75, endHeight: 98, easing: "linear", floorOpacity: 0 },
  },
  {
    positionIndex: 3,
    slideLabel: "Right (Pos 4)",
    gradient: { enabled: true, color: "#000000", startHeight: 65, endHeight: 100, opacity: 45, blendMode: "normal" },
    clippingMask: { enabled: true, startHeight: 75, endHeight: 98, easing: "linear", floorOpacity: 0 },
  },
  {
    positionIndex: 4,
    slideLabel: "Far Right (Pos 5)",
    gradient: { enabled: true, color: "#000000", startHeight: 70, endHeight: 100, opacity: 50, blendMode: "normal" },
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
  const [dragSens, setDragSens] = useState<number>(2.2);
  const [dragThreshold, setDragThreshold] = useState<number>(4);

  // Tunable Stage & Cutout Size Controls — Saved User Configuration
  const [cardWidth, setCardWidth] = useState<number>(450);
  const [imageHeight, setImageHeight] = useState<number>(648);
  const [imageScale, setImageScale] = useState<number>(1.42);
  const [imageOffsetY, setImageOffsetY] = useState<number>(0);
  const [gap, setGap] = useState<number>(0);
  const [parallaxDepth, setParallaxDepth] = useState<number>(0.00);
  const [maxSkew, setMaxSkew] = useState<number>(30);
  const [focalScale, setFocalScale] = useState<number>(1.48);

  const [textLayout, setTextLayout] = useState<"pill" | "top" | "spotlight" | "spine">("pill");
  const [textPos, setTextPos] = useState<"left" | "left-glass" | "left-accent" | "center" | "center-glass" | "right" | "right-glass" | "right-accent">("left");
  const [nameFontSize, setNameFontSize] = useState<string | number>("clamp(18px, 11.75px + 0.953vw, 27px)");
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

  // State for active tuner slot index (0 = Pos 1, 1 = Pos 2, 2 = Pos 3 Center, 3 = Pos 4, 4 = Pos 5)
  const [selectedTunerPos, setSelectedTunerPos] = useState<number>(2);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("smooothy_position_configs_v1", JSON.stringify(positionConfigs));
      } catch (e) {
        console.error("Failed to save position configs:", e);
      }
    }
  }, [positionConfigs]);

  // Load saved Tuner slider settings on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("band_slider_tuner_config_v1");
      if (saved) {
        const cfg = JSON.parse(saved);
        if (cfg.lerpSpeed !== undefined) setLerpSpeed(cfg.lerpSpeed);
        if (cfg.dragSens !== undefined) setDragSens(cfg.dragSens);
        if (cfg.dragThreshold !== undefined) setDragThreshold(cfg.dragThreshold);
        if (cfg.parallaxDepth !== undefined) setParallaxDepth(cfg.parallaxDepth);
        if (cfg.maxSkew !== undefined) setMaxSkew(cfg.maxSkew);
        if (cfg.imageOffsetY !== undefined) setImageOffsetY(cfg.imageOffsetY);
        if (cfg.gap !== undefined) setGap(cfg.gap);
        if (cfg.nameFontSize !== undefined) setNameFontSize(cfg.nameFontSize);
        if (cfg.roleFontSize !== undefined) setRoleFontSize(cfg.roleFontSize);
        if (cfg.textBottomOffset !== undefined) setTextBottomOffset(cfg.textBottomOffset);
        if (cfg.textLayout !== undefined) setTextLayout(cfg.textLayout);
        if (cfg.textPos !== undefined) setTextPos(cfg.textPos);
      }
    } catch (e) {
      console.error("Failed to load saved tuner config:", e);
    }
  }, []);

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
      let targetWidth: number;

      if (vw <= 1200) {
        // At 1200px and below: Exactly 3 band members span 100% of viewport width
        const overlapRatio = 0.10;
        const spanMultiplier = 2 * (1 - overlapRatio) + 1; // 2.8
        targetWidth = Math.round(vw / spanMultiplier);
        targetHeight = Math.round(targetWidth * 1.3333);
      } else {
        // Above 1200px: 5 band members span 100% of viewport width edge-to-edge
        const overlapRatio = 0.15;
        const spanMultiplier = 4 * (1 - overlapRatio) + 1; // 4.4
        targetWidth = Math.round(vw / spanMultiplier);
        targetHeight = Math.round(targetWidth * 1.3333);
      }

      // Card gap: Responsive overlap gap calculated directly from targetWidth
      const computedCardGap = vw <= 1200 ? Math.round(-targetWidth * 0.10) : Math.round(-targetWidth * 0.15);

      // Calculate available spine space so all 5 videos 100% fit inside the slider section without hitting the PAGES button
      const availableSpineHeight = Math.max(160, vh - 220);
      const computedGap = Math.max(4, Math.min(18, Math.round((availableSpineHeight - 200) * 0.035 + 6)));
      const totalGapSpace = 4 * computedGap;
      const maxVideoH = Math.floor((availableSpineHeight - totalGapSpace) / 5);
      const computedVideoHeight = Math.max(40, Math.min(96, maxVideoH));

      setImageHeight(targetHeight);
      setCardWidth(targetWidth);
      setGap(computedCardGap);
      setSpineGap(computedGap);
      setSpineVideoHeight(computedVideoHeight);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const dragSensRef = useRef<number>(dragSens);
  useEffect(() => { dragSensRef.current = dragSens; }, [dragSens]);

  const positionConfigsRef = useRef<PositionSlideMaskConfig[]>(positionConfigs);
  useEffect(() => { positionConfigsRef.current = positionConfigs; }, [positionConfigs]);

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

      // Calculate exact center padding offset for 100vw full-screen viewport alignment
      const containerWidth = typeof window !== "undefined" ? window.innerWidth : 1400;
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

          // Continuous smooth scale & opacity: 3 visible members max (Center + 1 Left + 1 Right)
          const focalVal = Math.max(0, 1 - Math.min(distFromCenter, 1.4) / 1.4);
          const scale = 0.84 + focalVal * (focalScaleRef.current - 0.84);

          // At 1200px and below: limit visibility to 3 members (Center + 1 Left + 1 Right); Above 1200px: all 5 members visible
          const isCompactViewport = containerWidth <= 1200;
          const cardOpacity = isCompactViewport
            ? (distFromCenter <= 0.85 ? 1 : Math.max(0, 1 - (distFromCenter - 0.85) / 0.35))
            : 1;

          // Smooothy speed-based dynamic skew
          const skewX = Math.max(-maxSkewRef.current, Math.min(maxSkewRef.current, vel * 0.35));

          card.style.transformOrigin = "bottom center";
          card.style.transform = `scale(${scale}) skewX(${skewX}deg)`;
          card.style.opacity = String(cardOpacity);

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
            const baseScale = imageScale;
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

            // Real-time 60fps photo cutout masking update per position slot
            const slotIndex = Math.max(0, Math.min(4, Math.round((i - activeIndex) + 2)));
            const slotCfg = (positionConfigsRef.current && positionConfigsRef.current[slotIndex]) || DEFAULT_POSITION_CONFIGS[slotIndex];

            if (slotCfg && slotCfg.clippingMask && slotCfg.clippingMask.enabled) {
              const maskStr = generateSmoothMaskGradient(
                slotCfg.clippingMask.startHeight,
                slotCfg.clippingMask.endHeight,
                slotCfg.clippingMask.floorOpacity,
                "to bottom",
                slotCfg.clippingMask.easing
              );
              imgEl.style.webkitMaskImage = maskStr;
              imgEl.style.maskImage = maskStr;
            } else {
              imgEl.style.webkitMaskImage = "none";
              imgEl.style.maskImage = "none";
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
  }, [itemTotalWidth, displayMembers.length, cardWidth, imageScale, imageOffsetY, isTabletView, activeIndex]);

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

    if (Math.abs(totalDelta) > 5) {
      hasTriggeredRef.current = true;
    }

    // Physical responsive visual dragging with smooth multiplier
    const newX = Math.max(0, Math.min(maxTarget, dragStartTargetRef.current + totalDelta * dragSensRef.current));
    targetXRef.current = newX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const totalDelta = dragStartXRef.current - e.clientX;
    const thresh = dragThresholdRef.current;
    const isSwipe = Math.abs(totalDelta) >= thresh || Math.abs(velocityRef.current) > 3;

    if (isSwipe) {
      hasTriggeredRef.current = true;
      if (totalDelta > 0 || velocityRef.current > 0) {
        goToSlide(dragStartIdxRef.current + 1);
      } else {
        goToSlide(dragStartIdxRef.current - 1);
      }
    } else {
      const momentumOffset = velocityRef.current * 12;
      const projectTarget = targetXRef.current + momentumOffset;
      const nearestIdx = Math.max(
        0,
        Math.min(displayMembers.length - 1, Math.round(projectTarget / itemTotalWidth))
      );
      goToSlide(nearestIdx);
    }

    // Keep hasTriggeredRef true for 150ms to suppress synthetic click event
    setTimeout(() => {
      hasTriggeredRef.current = false;
    }, 150);
  };

  return (
    <div
      className="w-full max-w-full overflow-x-clip h-auto flex flex-col justify-end select-none font-sans relative bg-transparent"
    >


      {/* 🎬 LEFT SPINE PAGINATION (Top image locked at top-[36px], gap & height scale down as screen height shrinks) */}
      {paginationStyle === "left-spine" && (
        <div className="absolute left-2 sm:left-6 md:left-8 top-[36px] z-30 flex flex-col items-start select-none">
          <div className="flex flex-col z-10" style={{ gap: `${spineGap}px` }}>
            {displayMembers.map((m, idx) => {
              const isActive = activeIndex === idx;
              const nameLower = (m?.name || "").toLowerCase();
              let imageSrc = "/images/members/adam.png";
              if (nameLower.includes("adam")) imageSrc = "/images/members/adam.png";
              else if (nameLower.includes("richard") || nameLower.includes("rick") || nameLower.includes("dicky")) imageSrc = "/images/members/dicky.png";
              else if (nameLower.includes("frankie")) imageSrc = "/images/members/frankie.png";
              else if (nameLower.includes("mark")) imageSrc = "/images/members/mark.png";
              else if (nameLower.includes("nick")) imageSrc = "/images/members/nick.png";
              else if (m?.image) imageSrc = typeof m.image === 'string' ? m.image : urlFor(m.image).url();

              return (
                <button aria-label="Action button"
                  key={idx}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToSlide(idx); }}
                  className={`relative group flex items-center gap-2 sm:gap-3.5 cursor-pointer transition-colors duration-300 ${isActive ? "z-20" : ""
                    }`}
                >
                  {/* Member Card Thumbnail */}
                  <div
                    className="sm: overflow-hidden relative transition-colors duration-300 rounded-lg shrink-0"
                    style={{
                      height: `${spineVideoHeight}px`,
                      width: `${Math.round(spineVideoHeight * 0.78)}px`,
                      WebkitMaskImage: "radial-gradient(ellipse at center, black 60%, transparent 100%)",
                      maskImage: "radial-gradient(ellipse at center, black 60%, transparent 100%)"
                    }}
                  >
                    <Image src={imageSrc} alt={m?.name || "Band Member"} fill sizes="100px" className={`object-cover transition-all duration-300 ${isActive ? "brightness-110 scale-105" : "brightness-75 opacity-70 group-hover:opacity-100 group-hover:brightness-100"}`} />
                  </div>

                  {/* Member Name & Role Display (Responsive text sizing) */}
                  <div className={`transition-colors duration-300 whitespace-nowrap block text-left ${isActive
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                    }`}>
                    <p className="text-xs sm:text-sm md:text-base  font-bold  text-white leading-none tracking-tight drop-shadow-md">
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

      {/* 🎬 RIGHT SPINE PAGINATION (Top image locked at top-[36px], gap & height scale down as screen height shrinks) */}
      {paginationStyle === "right-spine" && (
        <div className="absolute right-2 sm:right-6 md:right-8 top-[36px] z-30 flex flex-col items-end select-none">
          <div className="flex flex-col z-10" style={{ gap: `${spineGap}px` }}>
            {displayMembers.map((m, idx) => {
              const isActive = activeIndex === idx;
              const nameLower = (m?.name || "").toLowerCase();
              let imageSrc = "/images/members/adam.png";
              if (nameLower.includes("adam")) imageSrc = "/images/members/adam.png";
              else if (nameLower.includes("richard") || nameLower.includes("rick") || nameLower.includes("dicky")) imageSrc = "/images/members/dicky.png";
              else if (nameLower.includes("frankie")) imageSrc = "/images/members/frankie.png";
              else if (nameLower.includes("mark")) imageSrc = "/images/members/mark.png";
              else if (nameLower.includes("nick")) imageSrc = "/images/members/nick.png";
              else if (m?.image) imageSrc = typeof m.image === 'string' ? m.image : urlFor(m.image).url();

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
                    <p className="text-xs sm:text-sm md:text-base  font-bold  text-white leading-none tracking-tight drop-shadow-md">
                      {m?.name || "Band Member"}
                    </p>
                    <p className="text-[10px] sm:text-xs font-bold  text-[var(--color-accent)] mt-0.5 sm:mt-1 tracking-wide">
                      {m?.role || "Musician"}
                    </p>
                  </div>

                  {/* Member Card Thumbnail */}
                  <div
                    className="sm: overflow-hidden relative transition-colors duration-300 rounded-lg shrink-0"
                    style={{
                      height: `${spineVideoHeight}px`,
                      width: `${Math.round(spineVideoHeight * 0.78)}px`,
                      WebkitMaskImage: "radial-gradient(ellipse at center, black 60%, transparent 100%)",
                      maskImage: "radial-gradient(ellipse at center, black 60%, transparent 100%)"
                    }}
                  >
                    <Image src={imageSrc} alt={m?.name || "Band Member"} fill sizes="100px" className={`object-cover transition-all duration-300 ${isActive ? "brightness-110 scale-105" : "brightness-75 opacity-70 group-hover:opacity-100 group-hover:brightness-100"}`} />
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
          className="w-full overflow-visible cursor-grab active:cursor-grabbing relative pt-stage-fluid"
        >
          {/* TRACK ELEMENT (GPU accelerated with Smooothy parallax & speed lerp) */}
          <div
            ref={trackRef}
            className="flex items-end pt-0 pb-0"
            style={{ width: `${displayMembers.length * itemTotalWidth}px` }}
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
                  onClick={(e) => {
                    if (hasTriggeredRef.current) {
                      e.preventDefault();
                      return;
                    }
                    goToSlide(i);
                  }}
                  style={{
                    width: `${cardWidth}px`,
                    height: `${imageHeight}px`,
                    marginRight: i < displayMembers.length - 1 ? `${gap}px` : "0px",
                    isolation: "isolate"
                  }}
                  className="shrink-0 bg-transparent  rounded-lg px-2 pt-0 pb-0 relative overflow-visible cursor-pointer flex flex-col justify-end origin-bottom border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ring-0 active:outline-none text-left"
                >
                  <div className="relative z-10 flex flex-col justify-end h-full overflow-visible">
                    <div className="overflow-visible relative">

                      {/* Dynamic Sized Member Photo Cutout Container */}
                      <div
                        className="smooothy-img-container relative flex items-end justify-center overflow-visible bg-transparent transition-colors duration-150 origin-bottom w-full"
                        style={{
                          height: `${imageHeight}px`,
                          maxHeight: `${imageHeight}px`,
                          transform: `translateY(${imageOffsetY}px)`,
                        }}
                      >
                        <Image
                          src={imageSrc}
                          alt={m?.name || "Member Photo"}
                          width={1200}
                          height={1600}
                          quality={100}
                          unoptimized
                          loading="lazy"
                          draggable={false}
                          className="smooothy-img w-full h-full object-contain object-bottom drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)] pointer-events-none select-none origin-bottom relative z-0 transition-all duration-200"
                          style={{
                            transform: `scale(${imageScale})`,
                            opacity: 1,
                            ...(clipStyle ? { WebkitMaskImage: clipStyle, maskImage: clipStyle } : {}),
                          }}
                        />

                      </div>

                      {/* Dynamic Member Info Overlay (z-30 - Pure White & Bright Purple Text with Live Control & Active Slide Opacity Lock) */}
                      {textPos === "left" && (
                        <div
                          id="names"
                          className="absolute left-4 z-30 flex flex-col items-start text-left pointer-events-none max-w-[90%] transition-opacity duration-300"
                          style={{
                            bottom: `1px`,
                            opacity: activeIndex === i ? 1 : 0,
                            ...(textBackdropOpacity > 0 ? { backgroundColor: `rgba(0,0,0,${textBackdropOpacity / 100})`, padding: "8px 12px", borderRadius: "8px" } : {})
                          }}
                        >
                          <h3 className="font-bold bg-black/40 text-white  pr-2 pl-2 tracking-tight leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,1)]" style={{ fontSize: typeof nameFontSize === "number" ? `${nameFontSize}px` : nameFontSize }}>
                            {m?.name}
                          </h3>
                          <span className="font-bold bg-black/40 pb-1 pt-1 pr-2 pl-2  text-[#c084fc] tracking-wide block drop-shadow-[0_2px_8px_rgba(0,0,0,1)] " style={{ fontSize: `${roleFontSize}px` }}>
                            {m?.role}
                          </span>
                        </div>
                      )}

                      {textPos === "left-glass" && (
                        <div
                          className="absolute left-4 z-30 flex flex-col items-start text-left pointer-events-none max-w-[90%] bg-black/85 backdrop-blur-xl border  border-white/20  px-4 py-3 transition-opacity duration-300"
                          style={{ bottom: `${textBottomOffset}px`, opacity: activeIndex === i ? 1 : 0 }}
                        >
                          <h3 className="font-bold text-white tracking-tight leading-tight" style={{ fontSize: typeof nameFontSize === "number" ? `${nameFontSize}px` : nameFontSize }}>
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
                          <h3 className="font-bold text-white tracking-tight leading-tight drop-shadow-md" style={{ fontSize: typeof nameFontSize === "number" ? `${nameFontSize}px` : nameFontSize }}>
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
                          <h3 className=" font-bold  text-white tracking-tight leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,1)]" style={{ fontSize: typeof nameFontSize === "number" ? `${nameFontSize}px` : nameFontSize }}>
                            {m?.name}
                          </h3>
                          <span className="font-bold text-[#c084fc] tracking-wide block drop-shadow-[0_2px_8px_rgba(0,0,0,1)] mt-0.5" style={{ fontSize: `${roleFontSize}px` }}>
                            {m?.role}
                          </span>
                        </div>
                      )}

                      {textPos === "center-glass" && (
                        <div
                          className="absolute left-1/2 -translate-x-1/2 z-30 flex flex-col items-center text-center pointer-events-none max-w-[90%] bg-black/85 backdrop-blur-xl border  border-white/20  px-4 py-2.5  rounded-lg shadow-2xl transition-opacity duration-300"
                          style={{ bottom: `${textBottomOffset}px`, opacity: activeIndex === i ? 1 : 0 }}
                        >
                          <h3 className="font-bold text-white tracking-tight leading-tight" style={{ fontSize: typeof nameFontSize === "number" ? `${nameFontSize}px` : nameFontSize }}>
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
                          <h3 className="font-bold text-white tracking-tight leading-tight drop-shadow-md" style={{ fontSize: typeof nameFontSize === "number" ? `${nameFontSize}px` : nameFontSize }}>
                            {m?.name}
                          </h3>
                          <span className="font-bold text-[var(--color-accent)] tracking-wide block drop-shadow-md mt-0.5" style={{ fontSize: `${roleFontSize}px` }}>
                            {m?.role}
                          </span>
                        </div>
                      )}

                      {textPos === "right-glass" && (
                        <div
                          className="absolute right-4 z-30 flex flex-col items-end text-right pointer-events-none max-w-[90%] bg-black/85 backdrop-blur-xl border  border-white/20  px-4 py-3 transition-opacity duration-300"
                          style={{ bottom: `${textBottomOffset}px`, opacity: activeIndex === i ? 1 : 0 }}
                        >
                          <h3 className="font-bold text-white tracking-tight leading-tight" style={{ fontSize: typeof nameFontSize === "number" ? `${nameFontSize}px` : nameFontSize }}>
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
                          <h3 className="font-bold text-white tracking-tight leading-tight drop-shadow-md" style={{ fontSize: typeof nameFontSize === "number" ? `${nameFontSize}px` : nameFontSize }}>
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
      </div>
    </div>
  );
}
