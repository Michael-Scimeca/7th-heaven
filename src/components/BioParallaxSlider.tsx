"use client";

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
      vid.play().catch(() => {});
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
      className={`${className} transition-all duration-500 ${isActive ? "opacity-100 brightness-100" : "opacity-40 brightness-75 group-hover:opacity-80"}`}
    />
  );
}

interface BioParallaxSliderProps {
  members?: Partial<SanityBandMember>[];
}

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
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 80);
    return () => clearTimeout(timer);
  }, []);

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
  
  // Smooothy Physics & Tuned UI Configuration
  const [physicsMode, setPhysicsMode] = useState<"snap" | "free">("free");
  const [lerpSpeed, setLerpSpeed] = useState<number>(0.10);
  const [dragSens, setDragSens] = useState<number>(1.15);
  const [dragThreshold, setDragThreshold] = useState<number>(12);

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
  const [textPos, setTextPos] = useState<"left" | "left-glass" | "left-accent" | "right" | "right-glass" | "right-accent">("left");

  // 🎭 Bottom Clipping Mask & Gradient UI Control State
  const [maskEnabled, setMaskEnabled] = useState<boolean>(true);
  const [gradientStart, setGradientStart] = useState<number>(16);  // % height where solid black stops
  const [gradientEnd, setGradientEnd] = useState<number>(58);      // % height where transparency occurs
  const [overlayWidth, setOverlayWidth] = useState<number>(100);    // vw
  const [overlayLeft, setOverlayLeft] = useState<number>(-25);      // vw
  const [overlayHeight, setOverlayHeight] = useState<number>(48);   // vh
  const [overlayBottom, setOverlayBottom] = useState<number>(-70);  // px

  // 🎬 Video Pagination Layout Style Options (10 Designs)
  const [paginationStyle, setPaginationStyle] = useState<
    "glass-dock" | "circular" | "cyber-hud" | "film-strip" | "minimal" | "left-spine" | "right-spine" | "full-bottom" | "expanded-active" | "diamond"
  >("left-spine");
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
  const [copied, setCopied] = useState<boolean>(false);

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

// Gradient Overlay Settings
background: linear-gradient(to top, rgb(0, 0, 0) ${gradientStart}%, rgba(0, 0, 0, 0) ${gradientEnd}%)
width: ${overlayWidth}vw
left: ${overlayLeft}vw
bottom: ${overlayBottom}px
height: ${overlayHeight}vh`;
    navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
  }, [itemTotalWidth, displayMembers.length, cardWidth, imageScale]);

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
    <div className="w-full max-w-full overflow-visible h-[calc(100vh-95px)] min-h-[calc(100vh-95px)] flex flex-col justify-end select-none font-sans relative bg-black pt-0 pb-0">
      
      {/* 🎬 LEFT SPINE VIDEO PAGINATION (Top video locked at blue line top-[36px], gap & height scale down as screen height shrinks) */}
      {paginationStyle === "left-spine" && (
        <div className="absolute left-2 sm:left-6 md:left-8 top-[36px] z-30 flex flex-col items-start select-none">
          <div className="flex flex-col z-10" style={{ gap: `${spineGap}px` }}>
            {displayMembers.map((m, idx) => {
              const isActive = activeIndex === idx;
              const videoSrc = getMemberVideo(m?.name);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToSlide(idx); }}
                  className={`relative group flex items-center gap-2 sm:gap-3.5 cursor-pointer transition-all duration-300 ${
                    isActive ? "z-20" : ""
                  }`}
                >
                  {/* Video Card (Height & gap scale down dynamically with window height) */}
                  <div
                    className="sm: overflow-hidden relative transition-all duration-300 shadow-xl shrink-0"
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
                  <div className={`transition-all duration-300 whitespace-nowrap block text-left ${
                    isActive
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                  }`}>
                    <p className="text-xs sm:text-sm md:text-base font-black text-white leading-none tracking-tight drop-shadow-md">
                      {m?.name || "Band Member"}
                    </p>
                    <p className="text-[10px] sm:text-xs font-bold text-[var(--color-accent)] mt-0.5 sm:mt-1 tracking-wide">
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
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToSlide(idx); }}
                  className={`relative group flex items-center justify-end gap-2 sm:gap-3.5 cursor-pointer transition-all duration-300 ${
                    isActive ? "z-20" : ""
                  }`}
                >
                  {/* Member Name & Role Display (Responsive text sizing) */}
                  <div className={`transition-all duration-300 whitespace-nowrap block text-right ${
                    isActive
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                  }`}>
                    <p className="text-xs sm:text-sm md:text-base font-black text-white leading-none tracking-tight drop-shadow-md">
                      {m?.name || "Band Member"}
                    </p>
                    <p className="text-[10px] sm:text-xs font-bold text-[var(--color-accent)] mt-0.5 sm:mt-1 tracking-wide">
                      {m?.role || "Musician"}
                    </p>
                  </div>

                  {/* Video Card (Height & gap scale down dynamically with window height) */}
                  <div
                    className="sm: overflow-hidden relative transition-all duration-300 shadow-xl shrink-0"
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
            className="will-change-transform flex items-end pt-2 pb-0"
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
                <div
                  key={i}
                  onClick={() => goToSlide(i)}
                  style={{ width: `${cardWidth}px` }}
                  className="shrink-0 bg-transparent rounded-3xl px-2 pt-0 pb-0 relative overflow-visible cursor-pointer flex flex-col justify-end origin-bottom"
                >
                  <div className="relative z-10 flex flex-col justify-end h-full overflow-visible">
                    <div className="overflow-visible relative">
                      
                      {/* Dynamic Sized Member Photo Cutout Container */}
                      <div
                        className="relative flex items-end justify-center overflow-visible bg-transparent transition-all duration-150 origin-bottom"
                        style={{
                          height: `${imageHeight}px`,
                          transform: `translateY(${imageOffsetY}px)`
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageSrc}
                          alt={m?.name}
                          draggable={false}
                          className="smooothy-img w-auto max-w-none object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)] pointer-events-none select-none origin-bottom relative z-0"
                          style={{
                            maxHeight: `${imageHeight}px`,
                            transform: `scale(${imageScale})`
                          }}
                        />

                        {/* Div that overlays the img tag (Full Control UI Tunable) */}
                        {maskEnabled && (
                          <div 
                            className="pointer-events-none z-10"
                            style={{
                              background: `linear-gradient(to top, rgb(0, 0, 0) ${gradientStart}%, rgba(0, 0, 0, 0) ${gradientEnd}%)`,
                              width: `${overlayWidth}vw`,
                              position: "fixed",
                              left: `${overlayLeft}vw`,
                              bottom: `${overlayBottom}px`,
                              height: `${overlayHeight}vh`
                            }}
                          />
                        )}
                      </div>

                      {/* Dynamic Member Info Overlay (z-50 - Pure White & Bright Purple Text) */}
                      {textPos === "left" && (
                        <div className="absolute bottom-4 left-4 z-50 flex flex-col items-start text-left pointer-events-none max-w-[90%]">
                          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,1)]">
                            {m?.name}
                          </h3>
                          <span className="text-sm md:text-base font-extrabold text-[#c084fc] tracking-wide block drop-shadow-[0_2px_8px_rgba(0,0,0,1)] mt-0.5">
                            {m?.role}
                          </span>
                        </div>
                      )}

                      {textPos === "left-glass" && (
                        <div className="absolute bottom-4 left-4 z-50 flex flex-col items-start text-left pointer-events-none max-w-[90%] bg-black/85 backdrop-blur-xl border border-white/15 px-4 py-3">
                          <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                            {m?.name}
                          </h3>
                          <span className="text-sm md:text-base font-bold text-[var(--color-accent)] tracking-wide block mt-0.5">
                            {m?.role}
                          </span>
                        </div>
                      )}

                      {textPos === "left-accent" && (
                        <div className="absolute bottom-4 left-4 z-50 flex flex-col items-start text-left pointer-events-none max-w-[90%] border-l-2 border-[var(--color-accent)] pl-3 py-1">
                          <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight drop-">
                            {m?.name}
                          </h3>
                          <span className="text-sm md:text-base font-bold text-[var(--color-accent)] tracking-wide block drop-shadow-md mt-0.5">
                            {m?.role}
                          </span>
                        </div>
                      )}

                      {textPos === "right" && (
                        <div className="absolute bottom-4 right-4 z-50 flex flex-col items-end text-right pointer-events-none max-w-[90%]">
                          <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight drop-">
                            {m?.name}
                          </h3>
                          <span className="text-sm md:text-base font-bold text-[var(--color-accent)] tracking-wide block drop-shadow-md mt-0.5">
                            {m?.role}
                          </span>
                        </div>
                      )}

                      {textPos === "right-glass" && (
                        <div className="absolute bottom-4 right-4 z-50 flex flex-col items-end text-right pointer-events-none max-w-[90%] bg-black/85 backdrop-blur-xl border border-white/15 px-4 py-3">
                          <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                            {m?.name}
                          </h3>
                          <span className="text-sm md:text-base font-bold text-[var(--color-accent)] tracking-wide block mt-0.5">
                            {m?.role}
                          </span>
                        </div>
                      )}

                      {textPos === "right-accent" && (
                        <div className="absolute bottom-4 right-4 z-50 flex flex-col items-end text-right pointer-events-none max-w-[90%] border-r-2 border-[var(--color-accent)] pr-3 py-1">
                          <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight drop-">
                            {m?.name}
                          </h3>
                          <span className="text-sm md:text-base font-bold text-[var(--color-accent)] tracking-wide block drop-shadow-md mt-0.5">
                            {m?.role}
                          </span>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🎬 DYNAMIC 10-STYLE VIDEO MINI SLIDER PAGINATION BAR */}
        {paginationStyle === "glass-dock" && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 sm:gap-3.5 bg-black/80 backdrop-blur-2xl border border-white/20 px-3.5 sm:px-5 py-2.5 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] max-w-[95vw] overflow-x-auto select-none">
            {displayMembers.map((m, idx) => {
              const isActive = activeIndex === idx;
              const videoSrc = getMemberVideo(m?.name);
              const firstName = m?.name?.split(" ")[0] || "";

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToSlide(idx); }}
                  className={`relative group flex flex-col items-center cursor-pointer transition-all duration-300 ${
                    isActive ? "scale-110" : "opacity-60 hover:opacity-100 hover:scale-105"
                  }`}
                >
                  <div
                    className={`w-12 h-16 sm:w-16 sm:h-20  overflow-hidden relative transition-all duration-300 ${
                      isActive
                        ? "ring-2 ring-purple-500 shadow-[0_0_25px_rgba(255,10,61,0.9)] border border-[var(--color-accent)]"
                        : "border border-white/20 group-hover:border-white/50"
                    }`}
                  >
                    <video src={videoSrc} autoPlay loop muted playsInline className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                    <span className="absolute bottom-1 inset-x-0 text-center text-[9px] sm:text-[10px] font-black uppercase text-white tracking-wider drop-shadow-md truncate px-0.5 z-10">
                      {firstName}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {paginationStyle === "circular" && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-black/85 backdrop-blur-2xl border border-white/20 px-5 py-3 rounded-full max-w-[95vw] overflow-x-auto select-none">
            {displayMembers.map((m, idx) => {
              const isActive = activeIndex === idx;
              const videoSrc = getMemberVideo(m?.name);
              const firstName = m?.name?.split(" ")[0] || "";

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToSlide(idx); }}
                  className={`relative group flex flex-col items-center cursor-pointer transition-all duration-300 ${
                    isActive ? "scale-115 z-10" : "opacity-50 hover:opacity-100 hover:scale-105"
                  }`}
                >
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden relative border-2 transition-all duration-300 ${
                    isActive ? "border-[var(--color-accent)] shadow-[0_0_30px_rgba(255,10,61,0.9)]" : "border-white/20 group-hover:border-white/60"
                  }`}>
                    <video src={videoSrc} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                    {isActive && <div className="absolute inset-0 border-2 border-[var(--color-accent)] rounded-full animate-ping opacity-40" />}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider mt-1 transition-colors ${isActive ? "text-[var(--color-accent)]" : "text-white/60 group-hover:text-white"}`}>
                    {firstName}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {paginationStyle === "cyber-hud" && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 bg-[var(--color-accent)]/90 backdrop-blur-2xl border-2 border-[var(--color-accent)]/60 p-2.5 shadow-[0_0_40px_rgba(255,10,61,0.6)] select-none">
            {displayMembers.map((m, idx) => {
              const isActive = activeIndex === idx;
              const videoSrc = getMemberVideo(m?.name);
              const firstName = m?.name?.split(" ")[0] || "";

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToSlide(idx); }}
                  className={`relative flex flex-col items-center cursor-pointer transition-all duration-200 ${
                    isActive ? "scale-105" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className={`w-13 h-16 sm:w-15 sm:h-18 rounded-lg overflow-hidden relative border-2 transition-all ${
                    isActive ? "border-cyan-400 bg-cyan-500/20 shadow-[0_0_20px_#06b6d4]" : "border-[var(--color-accent)]/40"
                  }`}>
                    <video src={videoSrc} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
                    <span className="absolute top-1 left-1 text-[8px] font-mono font-bold text-cyan-300">0{idx+1}</span>
                    <span className="absolute bottom-1 inset-x-0 text-center text-[9px] font-mono font-bold uppercase text-white truncate px-0.5">
                      {firstName}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {paginationStyle === "film-strip" && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center bg-black/95 border-y-2 border-purple-500/60 px-6 py-2 select-none">
            <div className="flex items-center gap-3">
              {displayMembers.map((m, idx) => {
                const isActive = activeIndex === idx;
                const videoSrc = getMemberVideo(m?.name);
                const firstName = m?.name?.split(" ")[0] || "";

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); goToSlide(idx); }}
                    className={`relative group flex flex-col items-center cursor-pointer transition-all ${
                      isActive ? "scale-110 z-10" : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    <div className={`w-14 h-18 sm:w-16 sm:h-20 rounded-md overflow-hidden relative border-2 transition-all ${
                      isActive ? "border-purple-400 shadow-[0_0_25px_rgba(147, 51, 234,0.8)]" : "border-purple-500/30"
                    }`}>
                      <video src={videoSrc} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
                      <span className="absolute bottom-1 inset-x-0 text-center text-[9px] font-black uppercase text-purple-100 tracking-widest truncate">
                        {firstName}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {paginationStyle === "minimal" && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/15 select-none">
            {displayMembers.map((m, idx) => {
              const isActive = activeIndex === idx;
              const videoSrc = getMemberVideo(m?.name);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToSlide(idx); }}
                  className={`relative flex flex-col items-center cursor-pointer transition-all duration-300 ${
                    isActive ? "scale-110" : "opacity-50 hover:opacity-100"
                  }`}
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden relative border transition-all ${
                    isActive ? "border-white " : "border-transparent"
                  }`}>
                    <video src={videoSrc} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  </div>
                  {isActive && <div className="w-4 h-1 bg-white rounded-full mt-1.5 animate-pulse" />}
                </button>
              );
            })}
          </div>
        )}


        {paginationStyle === "full-bottom" && (
          <div className="absolute inset-x-0 bottom-0 z-[100] flex items-center justify-center gap-4 sm:gap-6 bg-black/90 backdrop-blur-2xl border-t border-white/15 px-6 py-3 select-none">
            {displayMembers.map((m, idx) => {
              const isActive = activeIndex === idx;
              const videoSrc = getMemberVideo(m?.name);
              const firstName = m?.name?.split(" ")[0] || "";

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToSlide(idx); }}
                  className={`relative group flex flex-col items-center cursor-pointer transition-all duration-300 ${
                    isActive ? "scale-110 z-10" : "opacity-50 hover:opacity-100"
                  }`}
                >
                  <div className={`w-14 h-16 sm:w-18 sm:h-20  overflow-hidden relative border-2 transition-all ${
                    isActive ? "border-[var(--color-accent)] shadow-[0_0_25px_#a855f7]" : "border-white/20"
                  }`}>
                    <video src={videoSrc} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="absolute bottom-1 inset-x-0 text-center text-[10px] font-black uppercase text-white tracking-widest truncate">
                      {firstName}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {paginationStyle === "expanded-active" && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-black/85 backdrop-blur-2xl border border-white/20 p-2.5 rounded-3xl max-w-[95vw] overflow-x-auto select-none">
            {displayMembers.map((m, idx) => {
              const isActive = activeIndex === idx;
              const videoSrc = getMemberVideo(m?.name);
              const firstName = m?.name?.split(" ")[0] || "";

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToSlide(idx); }}
                  className={`relative flex items-center gap-2 cursor-pointer transition-all duration-300 ${
                    isActive ? "bg-[var(--color-accent)]/30 border border-[var(--color-accent)]/60 p-1.5 " : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className={`w-12 h-14 sm:w-14 sm:h-16  overflow-hidden relative border transition-all ${
                    isActive ? "border-[var(--color-accent)] shadow-[0_0_20px_#a855f7]" : "border-white/20"
                  }`}>
                    <video src={videoSrc} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  </div>
                  {isActive && (
                    <div className="flex flex-col items-start pr-3">
                      <span className="text-xs font-black uppercase text-white tracking-wider">{firstName}</span>
                      <span className="text-[9px] font-bold text-[var(--color-accent)] truncate max-w-[90px]">{m?.role}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {paginationStyle === "diamond" && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-6 bg-black/80 backdrop-blur-2xl border border-white/20 px-8 py-3 rounded-full max-w-[95vw] overflow-x-auto select-none">
            {displayMembers.map((m, idx) => {
              const isActive = activeIndex === idx;
              const videoSrc = getMemberVideo(m?.name);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToSlide(idx); }}
                  className={`relative group cursor-pointer transition-all duration-300 ${
                    isActive ? "scale-125 z-10" : "opacity-50 hover:opacity-100 hover:scale-110"
                  }`}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rotate-45  overflow-hidden relative border-2 transition-all ${
                    isActive ? "border-[var(--color-accent)] shadow-[0_0_25px_#a855f7]" : "border-white/30"
                  }`}>
                    <video src={videoSrc} autoPlay loop muted playsInline className="w-full h-full object-cover -rotate-45 scale-125" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
