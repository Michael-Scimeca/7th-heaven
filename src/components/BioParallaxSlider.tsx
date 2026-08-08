/* eslint-disable react-doctor/no-giant-component */
"use client";
/* eslint-disable react-doctor/prefer-useReducer */
import Image from 'next/image';

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
    image: "/images/band-memebers/Frankie.png"
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
    image: "/images/band-memebers/Nick.png"
  },
  {
    name: "Adam Heisler", role: "Lead Vocals",
    birthday: "March 13", zodiac: "Pisces",
    bestTrait: "I care too much",
    favBands: "Ben Rector, Billy Joel", favAlbum: "The Stranger — Billy Joel",
    favMovie: "Give me a good romantic comedy",
    fav7hSong: "You and I", favQuote: "I'm always happy and never satisfied",
    funFact: "I used to be a Jr. Black belt in Tae Kwon Do",
    image: "/images/band-memebers/Adam.png"
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
    image: "/images/band-memebers/Dicky.png"
  },
  {
    name: "Mark Kennetz", role: "Bass • Vocals • Uke • Guitar",
    birthday: "October 19", zodiac: "Libra",
    bestTrait: "Being a Ninja",
    favBands: "Sublime, Led Zeppelin, Muse", favAlbum: "40 oz to Freedom — Sublime",
    favMovie: "Hot Fuzz, Anchorman", fav7hSong: "Ethereal",
    favQuote: "The past is in our heads, the future is in our hands",
    funFact: "Stage 2 carnivore — eat anything with 2 legs or less!",
    image: "/images/band-memebers/Mark.png"
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
      className={`${className} transition-colors duration-500 ${isActive ? "opacity-100 brightness-100" : "opacity-40 brightness-75 group-hover:opacity-80"}`}
    >
      <track kind="captions" />
    </video>
  );
}

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
  if (idx === 4) return 360;  // Mark
  return idx * 100;
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
  const [imageOffsetY, setImageOffsetY] = useState<number>(22);
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

  // 🎭 Section Fading Clipping Mask States — Professional Studio Suite
  const [sectionMaskEnabled, setSectionMaskEnabled] = useState<boolean>(true);
  const [topMaskEnabled, setTopMaskEnabled] = useState<boolean>(false); // false by default = ZERO top head clipping
  const [topMaskDistance, setTopMaskDistance] = useState<number>(80); // px top fade length
  const [topMaskMinOpacity, setTopMaskMinOpacity] = useState<number>(0); // % top min opacity floor
  const [bottomMaskEnabled, setBottomMaskEnabled] = useState<boolean>(true);
  const [bottomFadeMode, setBottomFadeMode] = useState<"screen-fixed" | "image-relative">("screen-fixed");
  const [screenBottomFadeHeight, setScreenBottomFadeHeight] = useState<number>(180); // px from bottom of screen
  const [screenBottomFadeEasing, setScreenBottomFadeEasing] = useState<"smooth" | "soft" | "linear" | "sharp">("smooth");
  const [maskStudioTab, setMaskStudioTab] = useState<"preset" | "stops" | "member" | "raw">("preset");
  const [sectionMaskBottom, setSectionMaskBottom] = useState<number>(180); // px
  const [sectionMaskTop, setSectionMaskTop] = useState<number>(0); // px - Top fade distance
  const [topFadeStyle, setTopFadeStyle] = useState<"smooth" | "soft" | "linear" | "sharp">("smooth"); // Smooth top fade curve
  const [sectionMaskStart, setSectionMaskStart] = useState<number>(35); // % start down image - Bottom smooth fade out (35% chest level)
  const [sectionMaskEnd, setSectionMaskEnd] = useState<number>(75); // % end down image - Bottom smooth fade out (75% waist level)
  const [sectionMaskMidpoint, setSectionMaskMidpoint] = useState<number>(50); // % curve midpoint
  const [sectionMaskMinOpacity, setSectionMaskMinOpacity] = useState<number>(0); // % min opacity floor (0% = transparent bottom)
  const [sectionMaskDirection, setSectionMaskDirection] = useState<string>("to bottom");
  const [sectionMaskSideFeather, setSectionMaskSideFeather] = useState<number>(0); // px left/right side feathering
  const [sectionMaskStrength, setSectionMaskStrength] = useState<number>(75); // % mask strength / drop speed
  const [sectionMaskFeather, setSectionMaskFeather] = useState<"smooth" | "linear" | "sharp" | "radial">("linear");
  const [isMaskEditorOpen, setIsMaskEditorOpen] = useState<boolean>(false);
  const [isDrawerExpanded, setIsDrawerExpanded] = useState<boolean>(false);
  const [maskCopied, setMaskCopied] = useState<boolean>(false);

  // 🎛️ 5-Stop Custom Gradient Point Editor States
  const [gradientStops, setGradientStops] = useState<Array<{ pos: number; opacity: number }>>([
    { pos: 0, opacity: 100 },
    { pos: 60, opacity: 100 },
    { pos: 80, opacity: 50 },
    { pos: 92, opacity: 15 },
    { pos: 100, opacity: 0 },
  ]);

  // 👤 Per-Member Override States
  const [selectedMemberTarget, setSelectedMemberTarget] = useState<"all" | "adam" | "richard" | "frankie" | "mark" | "nick">("all");
  const [perMemberMaskStart, setPerMemberMaskStart] = useState<Record<string, number>>({
    adam: 70,
    richard: 70,
    frankie: 70,
    mark: 70,
    nick: 70,
  });

  // 📝 Raw Custom CSS Injection Input State
  const [customRawMask, setCustomRawMask] = useState<string>("");
  const [useRawMask, setUseRawMask] = useState<boolean>(false);

  useEffect(() => {
    const savedEnabled = localStorage.getItem("7h_band_section_mask_enabled");
    const savedTopEnabled = localStorage.getItem("7h_band_top_mask_enabled");
    const savedTopDist = localStorage.getItem("7h_band_top_mask_dist");
    const savedTopMinOp = localStorage.getItem("7h_band_top_mask_min_op");
    const savedBottomEnabled = localStorage.getItem("7h_band_bottom_mask_enabled");
    const savedFadeMode = localStorage.getItem("7h_band_bottom_fade_mode");
    const savedScreenHeight = localStorage.getItem("7h_band_screen_bottom_height");
    const savedScreenEasing = localStorage.getItem("7h_band_screen_bottom_easing");
    const savedBottom = localStorage.getItem("7h_band_section_mask_bottom");
    const savedTop = localStorage.getItem("7h_band_section_mask_top");
    const savedTopStyle = localStorage.getItem("7h_band_top_fade_style");
    const savedStart = localStorage.getItem("7h_band_section_mask_start");
    const savedEnd = localStorage.getItem("7h_band_section_mask_end");
    const savedMid = localStorage.getItem("7h_band_section_mask_mid");
    const savedMinOp = localStorage.getItem("7h_band_section_mask_min_op");
    const savedDir = localStorage.getItem("7h_band_section_mask_dir");
    const savedSide = localStorage.getItem("7h_band_section_mask_side");
    const savedStrength = localStorage.getItem("7h_band_section_mask_strength");
    const savedFeather = localStorage.getItem("7h_band_section_mask_feather");
    const savedRaw = localStorage.getItem("7h_band_section_mask_raw");
    const savedStops = localStorage.getItem("7h_band_section_mask_stops");

    if (savedEnabled !== null) setSectionMaskEnabled(savedEnabled === "true");
    if (savedTopEnabled !== null) setTopMaskEnabled(savedTopEnabled === "true");
    if (savedTopDist) setTopMaskDistance(parseInt(savedTopDist, 10) || 80);
    if (savedTopMinOp) setTopMaskMinOpacity(parseInt(savedTopMinOp, 10) || 0);
    if (savedBottomEnabled !== null) setBottomMaskEnabled(savedBottomEnabled === "true");
    if (savedFadeMode) setBottomFadeMode((savedFadeMode as any) || "screen-fixed");
    if (savedScreenHeight) setScreenBottomFadeHeight(parseInt(savedScreenHeight, 10) || 180);
    if (savedScreenEasing) setScreenBottomFadeEasing((savedScreenEasing as any) || "smooth");
    if (savedBottom) setSectionMaskBottom(parseInt(savedBottom, 10) || 180);
    if (savedTop !== null) setSectionMaskTop(parseInt(savedTop, 10) || 0);
    if (savedTopStyle) setTopFadeStyle((savedTopStyle as any) || "smooth");
    if (savedStart) setSectionMaskStart(parseInt(savedStart, 10) || 70);
    if (savedEnd) setSectionMaskEnd(parseInt(savedEnd, 10) || 100);
    if (savedMid) setSectionMaskMidpoint(parseInt(savedMid, 10) || 50);
    if (savedMinOp) setSectionMaskMinOpacity(parseInt(savedMinOp, 10) || 0);
    if (savedDir) setSectionMaskDirection((savedDir as any) || "to bottom");
    if (savedSide) setSectionMaskSideFeather(parseInt(savedSide, 10) || 0);
    if (savedStrength) setSectionMaskStrength(parseInt(savedStrength, 10) || 75);
    if (savedFeather) setSectionMaskFeather((savedFeather as any) || "linear");
    if (savedRaw) { setCustomRawMask(savedRaw); setUseRawMask(true); }
    if (savedStops) { try { setGradientStops(JSON.parse(savedStops)); } catch (_) {} }
  }, []);

  // 🎬 Video Pagination Layout Style Options (10 Designs)
  const [paginationStyle, setPaginationStyle] = useState<
    "glass-dock" | "circular" | "cyber-hud" | "film-strip" | "minimal" | "left-spine" | "right-spine" | "full-bottom" | "expanded-active" | "diamond"
  >("minimal");
  const [spineTopOffset, setSpineTopOffset] = useState<number>(0); // px from top of slider section



  const [spineGap, setSpineGap] = useState<number>(32);
  const [spineVideoHeight, setSpineVideoHeight] = useState<number>(85);

  // Dynamic window height & width scaling — makes slider images & video spine gap scale smoothly across all device sizes
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const isMobile = vw < 640;

      const targetHeight = isMobile
        ? Math.max(300, Math.min(520, Math.round((vh - 80) * 0.52)))
        : Math.max(360, Math.min(730, Math.round((vh - 100) * 0.57)));

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
      setImageOffsetY(22);
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
lerpSpeed: ${lerpSpeed}

// Band Section Fade Mask Settings
maskEnabled: ${sectionMaskEnabled}
maskBottom: ${sectionMaskBottom}px
maskTop: ${sectionMaskTop}px`;
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
          const imgEl = card.querySelector(".smooothy-img") as HTMLElement | null;

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
            const speedScale = imageScale + Math.min(Math.abs(vel) * 0.005, 0.06);
            imgEl.style.transformOrigin = "bottom center";
            imgEl.style.transform = `translate3d(${parallaxX}px, ${imageOffsetY}px, 0) scale(${speedScale})`;
            imgEl.style.opacity = `${opacity}`;

            if (focalVal > 0.05) {
              const shadowAlpha = (focalVal * 0.60).toFixed(2);
              imgEl.style.filter = `drop-shadow(0 25px 50px rgba(0, 0, 0, ${shadowAlpha})) drop-shadow(0 15px 30px rgba(0, 0, 0, 0.45))`;
            } else {
              imgEl.style.filter = "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.35))";
            }
          }
        }
      }

      // Compute active centered slide index
      const rawIdx = Math.round(currentXRef.current / itemTotalWidth);
      const safeIdx = Math.max(0, Math.min(displayMembers.length - 1, rawIdx));
      setActiveIndex(safeIdx);

      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [itemTotalWidth, displayMembers.length, cardWidth, imageScale, imageOffsetY]);

  // Go to slide
  const goToSlide = (idx: number) => {
    const safeIdx = Math.max(0, Math.min(displayMembers.length - 1, idx));
    targetXRef.current = safeIdx * itemTotalWidth;
  };

  // Pointer drag handlers — Live 1:1 visual dragging during move, slide transition on release
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
    if (!isDraggingRef.current || hasTriggeredRef.current) return;

    const deltaX = lastClientXRef.current - e.clientX;
    lastClientXRef.current = e.clientX;
    velocityRef.current = deltaX;

    const maxTarget = (displayMembers.length - 1) * itemTotalWidth;
    const totalDelta = dragStartXRef.current - e.clientX;

    // Trigger slide change immediately as soon as drag reaches threshold in either direction
    if (totalDelta >= dragThresholdRef.current) {
      hasTriggeredRef.current = true;
      goToSlide(dragStartIdxRef.current + 1);
      return;
    } else if (totalDelta <= -dragThresholdRef.current) {
      hasTriggeredRef.current = true;
      goToSlide(dragStartIdxRef.current - 1);
      return;
    }

    // Physical 1:1 visual dragging while under threshold
    const totalDragOffset = totalDelta * dragSens;
    const newX = Math.max(0, Math.min(maxTarget, dragStartTargetRef.current + totalDragOffset));
    targetXRef.current = newX;
    currentXRef.current = newX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (!hasTriggeredRef.current) {
      const totalDelta = dragStartXRef.current - e.clientX;
      if (totalDelta >= dragThresholdRef.current) {
        goToSlide(dragStartIdxRef.current + 1);
      } else if (totalDelta <= -dragThresholdRef.current) {
        goToSlide(dragStartIdxRef.current - 1);
      } else {
        const nearestIdx = Math.round(currentXRef.current / itemTotalWidth);
        goToSlide(nearestIdx);
      }
    }
    hasTriggeredRef.current = false;
  };

  return (
    <div
      className="w-full max-w-full overflow-visible h-[calc(100vh-95px)] min-h-[calc(100vh-95px)] flex flex-col justify-end select-none font-sans relative bg-transparent pt-0 pb-0"
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
      <div className="w-full relative overflow-visible">

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
              if (nameLower.includes("adam")) imageSrc = "/images/band-memebers/Adam.png";
              else if (nameLower.includes("richard") || nameLower.includes("rick") || nameLower.includes("dicky")) imageSrc = "/images/band-memebers/Dicky.png";
              else if (nameLower.includes("frankie")) imageSrc = "/images/band-memebers/Frankie.png";
              else if (nameLower.includes("mark")) imageSrc = "/images/band-memebers/Mark.png";
              else if (nameLower.includes("nick")) imageSrc = "/images/band-memebers/Nick.png";
              else imageSrc = m?.image ? (typeof m.image === 'string' ? m.image : urlFor(m.image).url()) : "/images/band-memebers/Adam.png";

              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => goToSlide(i)}
                  style={{ width: `${cardWidth}px` }}
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
                        <img
                          src={imageSrc}
                          alt={m?.name || "Member Photo"}
                          draggable={false}
                          className="smooothy-img h-full w-auto max-w-none object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)] pointer-events-none select-none origin-bottom relative z-0"
                          style={{
                            maxHeight: `${imageHeight}px`,
                            transform: `scale(${imageScale})`,
                            ...(sectionMaskEnabled
                              ? (() => {
                                  const maskStr = useRawMask && customRawMask.trim()
                                    ? customRawMask.trim()
                                    : `linear-gradient(${sectionMaskDirection}, black 0%, black ${sectionMaskStart}%, rgba(0,0,0,${sectionMaskMinOpacity / 100}) ${sectionMaskEnd}%)`;

                                  return {
                                    WebkitMaskImage: maskStr,
                                    maskImage: maskStr,
                                    WebkitMaskSize: "100% 100%",
                                    maskSize: "100% 100%",
                                    WebkitMaskRepeat: "no-repeat",
                                    maskRepeat: "no-repeat",
                                  };
                                })()
                              : {})
                          }}
                        />
                      </div>

                      {/* Dynamic Member Info Overlay (z-[100] - Pure White & Bright Purple Text with Live Control) */}
                      {textPos === "left" && (
                        <div
                          className="absolute left-4 z-[100] flex flex-col items-start text-left pointer-events-none max-w-[90%]"
                          style={{
                            bottom: `${textBottomOffset}px`,
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
                          className="absolute left-4 z-[100] flex flex-col items-start text-left pointer-events-none max-w-[90%] bg-black/85 backdrop-blur-xl border border-white/15 px-4 py-3"
                          style={{ bottom: `${textBottomOffset}px` }}
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
                          className="absolute left-4 z-[100] flex flex-col items-start text-left pointer-events-none max-w-[90%] pl-0 py-1"
                          style={{ bottom: `${textBottomOffset}px` }}
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
                          className="absolute left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center text-center pointer-events-none w-full px-2"
                          style={{
                            bottom: `${textBottomOffset}px`,
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
                          className="absolute left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center text-center pointer-events-none max-w-[90%] bg-black/85 backdrop-blur-xl border border-white/15 px-4 py-2.5 rounded-xl shadow-2xl"
                          style={{ bottom: `${textBottomOffset}px` }}
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
                          className="absolute right-4 z-[100] flex flex-col items-end text-right pointer-events-none max-w-[90%]"
                          style={{
                            bottom: `${textBottomOffset}px`,
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
                          className="absolute right-4 z-50 flex flex-col items-end text-right pointer-events-none max-w-[90%] bg-black/85 backdrop-blur-xl border border-white/15 px-4 py-3"
                          style={{ bottom: `${textBottomOffset}px` }}
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
                          className="absolute right-4 z-50 flex flex-col items-end text-right pointer-events-none max-w-[90%] border-r-2 border-[var(--color-accent)] pr-3 py-1"
                          style={{ bottom: `${textBottomOffset}px` }}
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
      </div>

      {/* ── Floating Mask Gradient Editor Button ── */}
      <button
        type="button"
        onClick={() => setIsMaskEditorOpen(!isMaskEditorOpen)}
        className="fixed bottom-6 right-6 z-[9999] px-4 py-2.5 bg-[#090514]/95 hover:bg-[#120a26] text-white border border-purple-500/40 rounded-full shadow-[0_10px_35px_rgba(168,85,247,0.4)] backdrop-blur-md text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
      >
        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
        🎭 Mask Gradient Editor
      </button>

      {/* ── Mask Gradient Editor Drawer / Modal ── */}
      {isMaskEditorOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-end bg-black/60 backdrop-blur-sm p-4 sm:p-6 transition-all animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-md bg-[#0c0817] border border-purple-500/30 rounded-2xl p-6 text-white shadow-[0_25px_80px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto relative flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-black text-lg text-white tracking-wide flex items-center gap-2">
                  <span>🎭 Mask Gradient Editor</span>
                </h3>
                <p className="text-xs text-white/50 mt-0.5">Control image bottom/top fade out & opacity</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMaskEditorOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Enable / Disable Mask Toggle */}
            <div className="flex items-center justify-between bg-white/[0.04] p-3 rounded-xl border border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">Enable Section Mask</span>
              <button
                type="button"
                onClick={() => setSectionMaskEnabled(!sectionMaskEnabled)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                  sectionMaskEnabled ? "bg-purple-600 text-white" : "bg-white/10 text-white/40"
                }`}
              >
                {sectionMaskEnabled ? "Active" : "Disabled"}
              </button>
            </div>

            {/* Presets */}
            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">Fade Presets</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUseRawMask(false);
                    setSectionMaskDirection("to bottom");
                    setSectionMaskStart(67);
                    setSectionMaskEnd(91);
                    setSectionMaskMinOpacity(0);
                  }}
                  className="px-3 py-2 bg-white/5 hover:bg-purple-600/30 border border-white/10 rounded-lg text-xs font-bold text-white/80 text-left transition-colors cursor-pointer"
                >
                  📉 Bottom Soft Fade (67%-91%)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUseRawMask(false);
                    setSectionMaskDirection("to bottom");
                    setSectionMaskStart(45);
                    setSectionMaskEnd(85);
                    setSectionMaskMinOpacity(0);
                  }}
                  className="px-3 py-2 bg-white/5 hover:bg-purple-600/30 border border-white/10 rounded-lg text-xs font-bold text-white/80 text-left transition-colors cursor-pointer"
                >
                  📉 Bottom High Fade (45%-85%)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUseRawMask(false);
                    setSectionMaskDirection("to top");
                    setSectionMaskStart(60);
                    setSectionMaskEnd(95);
                    setSectionMaskMinOpacity(0);
                  }}
                  className="px-3 py-2 bg-white/5 hover:bg-purple-600/30 border border-white/10 rounded-lg text-xs font-bold text-white/80 text-left transition-colors cursor-pointer"
                >
                  📈 Top Fade (60%-95%)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUseRawMask(true);
                    setCustomRawMask("linear-gradient(to bottom, transparent 0%, black 15%, black 70%, transparent 95%)");
                  }}
                  className="px-3 py-2 bg-white/5 hover:bg-purple-600/30 border border-white/10 rounded-lg text-xs font-bold text-white/80 text-left transition-colors cursor-pointer"
                >
                  ↔️ Top & Bottom Dual Fade
                </button>
              </div>
            </div>

            {/* Mask Direction */}
            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">Gradient Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setUseRawMask(false); setSectionMaskDirection("to bottom"); }}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    !useRawMask && sectionMaskDirection === "to bottom"
                      ? "bg-purple-600 text-white border border-purple-400/50"
                      : "bg-white/5 text-white/60 border border-white/10"
                  }`}
                >
                  ⬇️ To Bottom (Fade at Bottom)
                </button>
                <button
                  type="button"
                  onClick={() => { setUseRawMask(false); setSectionMaskDirection("to top"); }}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    !useRawMask && sectionMaskDirection === "to top"
                      ? "bg-purple-600 text-white border border-purple-400/50"
                      : "bg-white/5 text-white/60 border border-white/10"
                  }`}
                >
                  ⬆️ To Top (Fade at Top)
                </button>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 bg-white/[0.03] p-4 rounded-xl border border-white/10">
              {/* Fade Start Position */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-white/80 mb-1">
                  <span>Fade Start Position (Solid Cutoff)</span>
                  <span className="text-purple-400 font-mono">{sectionMaskStart}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sectionMaskStart}
                  onChange={(e) => { setUseRawMask(false); setSectionMaskStart(Number(e.target.value)); }}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              {/* Fade End Position */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-white/80 mb-1">
                  <span>Fade End Position (Complete Fade)</span>
                  <span className="text-purple-400 font-mono">{sectionMaskEnd}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sectionMaskEnd}
                  onChange={(e) => { setUseRawMask(false); setSectionMaskEnd(Number(e.target.value)); }}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              {/* Bottom Opacity Floor */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-white/80 mb-1">
                  <span>Fade Min Opacity (Floor)</span>
                  <span className="text-purple-400 font-mono">{sectionMaskMinOpacity}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sectionMaskMinOpacity}
                  onChange={(e) => { setUseRawMask(false); setSectionMaskMinOpacity(Number(e.target.value)); }}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Raw Custom CSS Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Custom CSS Mask String</label>
                <button
                  type="button"
                  onClick={() => setUseRawMask(!useRawMask)}
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    useRawMask ? "bg-purple-500 text-white" : "bg-white/10 text-white/40"
                  }`}
                >
                  {useRawMask ? "Using Custom CSS" : "Use Custom CSS"}
                </button>
              </div>
              <input
                type="text"
                value={customRawMask}
                placeholder="linear-gradient(to bottom, black 0%, black 67%, transparent 91%)"
                onChange={(e) => {
                  setCustomRawMask(e.target.value);
                  setUseRawMask(true);
                }}
                className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-purple-300 focus:outline-none focus:border-purple-400 placeholder:text-white/20"
              />
            </div>

            {/* Current CSS Value Preview */}
            <div className="bg-black/80 border border-white/10 p-3 rounded-lg text-[11px] font-mono text-white/70">
              <span className="text-white/40 block text-[9px] uppercase font-bold tracking-wider mb-1">Active mask-image:</span>
              <span className="text-purple-300 break-all">
                {useRawMask && customRawMask.trim()
                  ? customRawMask.trim()
                  : `linear-gradient(${sectionMaskDirection}, black 0%, black ${sectionMaskStart}%, rgba(0,0,0,${sectionMaskMinOpacity / 100}) ${sectionMaskEnd}%)`}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  const currentMaskStr = useRawMask && customRawMask.trim()
                    ? customRawMask.trim()
                    : `linear-gradient(${sectionMaskDirection}, black 0%, black ${sectionMaskStart}%, rgba(0,0,0,${sectionMaskMinOpacity / 100}) ${sectionMaskEnd}%)`;
                  navigator.clipboard.writeText(`mask-image: ${currentMaskStr};`);
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                📋 Copy CSS
              </button>
              <button
                type="button"
                onClick={() => setIsMaskEditorOpen(false)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-md shadow-purple-600/30"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
