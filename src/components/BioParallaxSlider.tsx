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

  // Smooothy Default Physics Parameters (Federico Valla Smooothy style)
  const [physicsMode, setPhysicsMode] = useState<"snap" | "free">("free");
  const [lerpSpeed, setLerpSpeed] = useState<number>(0.12);
  const [dragSens, setDragSens] = useState<number>(1.15);
  const [dragThreshold, setDragThreshold] = useState<number>(12);
  const [cardWidth, setCardWidth] = useState<number>(400);
  const [gap, setGap] = useState<number>(28);
  const [parallaxDepth, setParallaxDepth] = useState<number>(0.14);
  const [maxSkew, setMaxSkew] = useState<number>(12);
  const [focalScale, setFocalScale] = useState<number>(1.22);

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
  const lastClientXRef = useRef<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

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

          card.style.transform = `scale(${scale}) skewX(${skewX}deg)`;
          card.style.opacity = `${opacity}`;

          // Dynamic z-index depth layering elevates as card glides into focal center
          if (distFromCenter < 0.75) {
            card.classList.add("z-30");
            card.classList.remove("z-10", "z-20");
          } else if (distFromCenter < 1.5) {
            card.classList.add("z-20");
            card.classList.remove("z-10", "z-30");
          } else {
            card.classList.add("z-10");
            card.classList.remove("z-20", "z-30");
          }

          // Parallax cutout translate + speed scale effect inside member card
          if (imgEl) {
            const cardOffset = i * itemTotalWidth - currentXRef.current;
            const parallaxX = cardOffset * parallaxDepthRef.current;
            const speedScale = 1.25 + Math.min(Math.abs(vel) * 0.006, 0.08);
            imgEl.style.transform = `translate3d(${parallaxX}px, 0, 0) scale(${speedScale})`;

            if (focalVal > 0.05) {
              const shadowAlpha = (focalVal * 0.60).toFixed(2);
              imgEl.style.filter = `drop-shadow(0 25px 50px rgba(168, 85, 247, ${shadowAlpha})) drop-shadow(0 15px 30px rgba(0,0,0,0.95))`;
            } else {
              imgEl.style.filter = "drop-shadow(0 10px 20px rgba(0,0,0,0.95))";
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
  }, [itemTotalWidth, cardWidth, displayMembers.length]);

  // Go to slide
  const goToSlide = useCallback((index: number) => {
    const safeIdx = Math.max(0, Math.min(displayMembers.length - 1, index));
    targetXRef.current = safeIdx * itemTotalWidth;
  }, [displayMembers.length, itemTotalWidth]);



  const physicsModeRef = useRef<"snap" | "free">(physicsMode);
  useEffect(() => { physicsModeRef.current = physicsMode; }, [physicsMode]);

  const hasTriggeredRef = useRef<boolean>(false);
  const dragStartIdxRef = useRef<number>(2);

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

    // Trigger slide change immediately as soon as drag reaches 20px threshold in either direction!
    if (totalDelta >= dragThresholdRef.current) {
      hasTriggeredRef.current = true;
      goToSlide(dragStartIdxRef.current + 1);
      return;
    } else if (totalDelta <= -dragThresholdRef.current) {
      hasTriggeredRef.current = true;
      goToSlide(dragStartIdxRef.current - 1);
      return;
    }

    // Physical 1:1 visual dragging while under 20px threshold
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
    <div className="w-full max-w-full overflow-visible min-h-[calc(100vh-80px)] flex flex-col justify-start select-none font-sans relative bg-black pt-2 pb-4">
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
          className="w-full overflow-visible cursor-grab active:cursor-grabbing relative py-4"
        >
          {/* TRACK ELEMENT */}
          <div
            ref={trackRef}
            className="will-change-transform flex items-center py-2"
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
                  className="shrink-0 h-[540px] md:h-[620px] bg-transparent rounded-3xl p-6 md:p-8 relative overflow-visible cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative z-10 flex flex-col justify-between h-full overflow-visible">
                    <div className="overflow-visible">
                      <div className="flex justify-between items-start mb-6 md:mb-10 overflow-visible relative z-30 pointer-events-none">
                        <div className="whitespace-nowrap overflow-visible">
                          <span className="text-[var(--font-size-4xs)] font-bold uppercase text-cyan-400 tracking-wider block mb-0.5 whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,1)] [text-shadow:_0_2px_12px_rgb(0_0_0_/_100%),_0_1px_4px_rgb(0_0_0_/_100%)]">
                            {m?.role}
                          </span>
                          <h3 className="text-xs md:text-sm font-black uppercase text-white tracking-wide whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,1)] [text-shadow:_0_2px_12px_rgb(0_0_0_/_100%),_0_1px_4px_rgb(0_0_0_/_100%)]">
                            {m?.name}
                          </h3>
                        </div>
                        {m?.birthday && (
                          <span className="text-[var(--font-size-4xs)] font-bold text-white bg-black/80 border border-white/20 px-2.5 py-1 rounded-full uppercase shrink-0 shadow-xl drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
                            🎂 {m.birthday}
                          </span>
                        )}
                      </div>

                      {/* 1.25x Member Photo Cutout — Completely Unclipped (overflow-visible) */}
                      <div className="h-[400px] md:h-[460px] relative flex items-end justify-center mt-4 md:mt-8 overflow-visible bg-transparent">
                        <img
                          src={imageSrc}
                          alt={m?.name}
                          draggable={false}
                          className="smooothy-img max-h-[400px] md:max-h-[460px] w-auto max-w-none object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)] pointer-events-none select-none scale-[1.25] origin-bottom"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
