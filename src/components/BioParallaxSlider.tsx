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
  
  // Smooothy Physics & Tuned UI Configuration
  const [physicsMode, setPhysicsMode] = useState<"snap" | "free">("free");
  const [lerpSpeed, setLerpSpeed] = useState<number>(0.10);
  const [dragSens, setDragSens] = useState<number>(1.15);
  const [dragThreshold, setDragThreshold] = useState<number>(12);

  // Tunable Stage & Cutout Size Controls — Saved User Configuration
  const [cardWidth, setCardWidth] = useState<number>(355);
  const [imageHeight, setImageHeight] = useState<number>(480);
  const [imageScale, setImageScale] = useState<number>(1.15);
  const [imageOffsetY, setImageOffsetY] = useState<number>(16);
  const [gap, setGap] = useState<number>(24);
  const [parallaxDepth, setParallaxDepth] = useState<number>(0.14);
  const [maxSkew, setMaxSkew] = useState<number>(11);
  const [focalScale, setFocalScale] = useState<number>(1.28);

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
      setImageHeight(480);
      setImageScale(1.15);
      setImageOffsetY(16);
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
            const speedScale = imageScale + Math.min(Math.abs(vel) * 0.005, 0.06);
            imgEl.style.transformOrigin = "bottom center";
            imgEl.style.transform = `translate3d(${parallaxX}px, ${imageOffsetY}px, 0) scale(${speedScale})`;

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
    <div className="w-full max-w-full overflow-visible min-h-[calc(100vh-180px)] flex flex-col justify-end select-none font-sans relative bg-black pt-16 md:pt-24 pb-0">
      
      {/* ── FLOATING LIVE STAGE & SLIDER UI TUNER CONTROLS ── */}
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end">
        {!showTuner ? (
          <button
            onClick={() => setShowTuner(true)}
            className="px-5 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-[0_0_40px_rgba(133,29,239,0.6)] transition-all hover:scale-105 flex items-center gap-2 cursor-pointer border border-white/20"
          >
            <span>⚙️ Slider UI Tuner</span>
          </button>
        ) : (
          <div className="w-[340px] max-h-[80vh] overflow-y-auto bg-black/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-white text-xs font-sans">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
                <h4 className="font-black uppercase tracking-widest text-sm text-white">Slider UI System</h4>
              </div>
              <button
                onClick={() => setShowTuner(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Presets */}
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Quick Presets</p>
              <div className="grid grid-cols-2 gap-1.5">
                <button onClick={() => applyPreset("default")} className="px-3 py-1.5 bg-white/10 hover:bg-[var(--color-accent)] rounded-xl font-bold text-[11px] text-white/80 hover:text-white transition-all text-left">🎯 Default Hero</button>
                <button onClick={() => applyPreset("compact")} className="px-3 py-1.5 bg-white/10 hover:bg-[var(--color-accent)] rounded-xl font-bold text-[11px] text-white/80 hover:text-white transition-all text-left">⚡ Compact</button>
                <button onClick={() => applyPreset("giant")} className="px-3 py-1.5 bg-white/10 hover:bg-[var(--color-accent)] rounded-xl font-bold text-[11px] text-white/80 hover:text-white transition-all text-left">🚀 Giant Cutout</button>
                <button onClick={() => applyPreset("grounded")} className="px-3 py-1.5 bg-white/10 hover:bg-[var(--color-accent)] rounded-xl font-bold text-[11px] text-white/80 hover:text-white transition-all text-left">⚓ Grounded</button>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-3.5 mb-5 border-t border-white/10 pt-4">
              {/* Card Width */}
              <div>
                <div className="flex justify-between font-bold text-white/80 mb-1">
                  <span>Card Width</span>
                  <span className="text-[var(--color-accent)]">{cardWidth}px</span>
                </div>
                <input type="range" min="260" max="520" step="5" value={cardWidth} onChange={e => setCardWidth(Number(e.target.value))} className="w-full accent-[var(--color-accent)] cursor-pointer" />
              </div>

              {/* Cutout Image Height */}
              <div>
                <div className="flex justify-between font-bold text-white/80 mb-1">
                  <span>Photo Cutout Height</span>
                  <span className="text-[var(--color-accent)]">{imageHeight}px</span>
                </div>
                <input type="range" min="260" max="540" step="5" value={imageHeight} onChange={e => setImageHeight(Number(e.target.value))} className="w-full accent-[var(--color-accent)] cursor-pointer" />
              </div>

              {/* Photo Zoom / Scale */}
              <div>
                <div className="flex justify-between font-bold text-white/80 mb-1">
                  <span>Photo Zoom Scale</span>
                  <span className="text-[var(--color-accent)]">{imageScale.toFixed(2)}x</span>
                </div>
                <input type="range" min="0.80" max="1.45" step="0.01" value={imageScale} onChange={e => setImageScale(Number(e.target.value))} className="w-full accent-[var(--color-accent)] cursor-pointer" />
              </div>

              {/* Photo Offset Y */}
              <div>
                <div className="flex justify-between font-bold text-white/80 mb-1">
                  <span>Photo Y-Offset (Up/Down)</span>
                  <span className="text-[var(--color-accent)]">{imageOffsetY}px</span>
                </div>
                <input type="range" min="-80" max="80" step="2" value={imageOffsetY} onChange={e => setImageOffsetY(Number(e.target.value))} className="w-full accent-[var(--color-accent)] cursor-pointer" />
              </div>

              {/* Focal Scale */}
              <div>
                <div className="flex justify-between font-bold text-white/80 mb-1">
                  <span>Center Focal Zoom</span>
                  <span className="text-[var(--color-accent)]">{focalScale.toFixed(2)}x</span>
                </div>
                <input type="range" min="1.00" max="1.40" step="0.01" value={focalScale} onChange={e => setFocalScale(Number(e.target.value))} className="w-full accent-[var(--color-accent)] cursor-pointer" />
              </div>

              {/* Parallax Depth */}
              <div>
                <div className="flex justify-between font-bold text-white/80 mb-1">
                  <span>3D Parallax Depth</span>
                  <span className="text-[var(--color-accent)]">{parallaxDepth.toFixed(2)}</span>
                </div>
                <input type="range" min="0.00" max="0.30" step="0.01" value={parallaxDepth} onChange={e => setParallaxDepth(Number(e.target.value))} className="w-full accent-[var(--color-accent)] cursor-pointer" />
              </div>

              {/* Speed Skew */}
              <div>
                <div className="flex justify-between font-bold text-white/80 mb-1">
                  <span>Velocity Skew Angle</span>
                  <span className="text-[var(--color-accent)]">{maxSkew}°</span>
                </div>
                <input type="range" min="0" max="25" step="1" value={maxSkew} onChange={e => setMaxSkew(Number(e.target.value))} className="w-full accent-[var(--color-accent)] cursor-pointer" />
              </div>

              {/* Lerp Speed */}
              <div>
                <div className="flex justify-between font-bold text-white/80 mb-1">
                  <span>Inertia Speed (Lerp)</span>
                  <span className="text-[var(--color-accent)]">{lerpSpeed.toFixed(2)}</span>
                </div>
                <input type="range" min="0.04" max="0.30" step="0.01" value={lerpSpeed} onChange={e => setLerpSpeed(Number(e.target.value))} className="w-full accent-[var(--color-accent)] cursor-pointer" />
              </div>

              {/* Gap Spacing */}
              <div>
                <div className="flex justify-between font-bold text-white/80 mb-1">
                  <span>Card Gap Spacing</span>
                  <span className="text-[var(--color-accent)]">{gap}px</span>
                </div>
                <input type="range" min="10" max="60" step="2" value={gap} onChange={e => setGap(Number(e.target.value))} className="w-full accent-[var(--color-accent)] cursor-pointer" />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={copyConfig}
                className="w-full py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] font-black uppercase tracking-widest text-white rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {copied ? "✓ Configuration Copied!" : "📋 Copy Settings"}
              </button>
            </div>
          </div>
        )}
      </div>

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
                  className="shrink-0 bg-transparent rounded-3xl px-4 md:px-6 pt-4 md:pt-6 pb-0 relative overflow-visible cursor-pointer flex flex-col justify-end origin-bottom"
                >
                  <div className="relative z-10 flex flex-col justify-end h-full overflow-visible">
                    <div className="overflow-visible">
                      <div className="flex justify-between items-start mb-4 overflow-visible relative z-30 pointer-events-none">
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

                      {/* Dynamic Sized Member Photo Cutout */}
                      <div
                        className="relative flex items-end justify-center overflow-visible bg-transparent transition-all duration-150 origin-bottom"
                        style={{
                          height: `${imageHeight}px`,
                          transform: `translateY(${imageOffsetY}px)`
                        }}
                      >
                        <img
                          src={imageSrc}
                          alt={m?.name}
                          draggable={false}
                          className="smooothy-img w-auto max-w-none object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)] pointer-events-none select-none origin-bottom"
                          style={{
                            maxHeight: `${imageHeight}px`,
                            transform: `scale(${imageScale})`
                          }}
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
