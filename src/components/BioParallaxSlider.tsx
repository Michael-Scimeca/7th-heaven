/* eslint-disable react-doctor/no-giant-component, react-doctor/three-prefer-set-animation-loop */
/* oxlint-disable react-doctor/control-has-associated-label, react-doctor/label-has-associated-control, react-doctor/click-events-have-key-events, react-doctor/three-prefer-set-animation-loop */
/* eslint-disable react-doctor/control-has-associated-label, react-doctor/label-has-associated-control, react-doctor/click-events-have-key-events */
"use client";
/* eslint-disable react-doctor/prefer-useReducer */
import Image from 'next/image';

import React, { useState, useRef, useEffect, useCallback, useMemo, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Sliders, Eye, EyeOff, Sparkles, X, RotateCcw, Paintbrush, Scissors, Save, ChevronLeft, ChevronRight, Ticket, Plus } from "lucide-react";
import { SanityBandMember, urlFor } from "@/lib/sanity";
import MemberFactSheetDrawer, { BandMemberFactSheet } from "@/components/MemberFactSheetDrawer";
import { SectionBadge } from "@/components/SectionBadge";
import PixelFireplaceCanvas from "@/components/PixelFireplaceCanvas";

const emptySubscribe = () => () => { };

// Explicit member sequence: Frankie (0), Nick (1), Adam (2 - Center), Richard (3), Mark (4)
const FALLBACK_MEMBERS: (Partial<SanityBandMember> & {
  desktopImage?: string;
  mobileImage?: string;
  memberNo?: string;
  fullName?: string;
  luckyNo?: string;
  color?: string;
  favLoveSong?: string;
  favRockSong?: string;
  favSoundtrack?: string;
  firstSongLearned?: string;
  favPlaceToPlay?: string;
  bestConcertSeen?: string;
  favTvShow?: string;
  favCartoon?: string;
  favMagazine?: string;
  hobbyAwayFromBand?: string;
  bestFeelingInWorld?: string;
  influences?: string;
  favPet?: string;
  favFoods?: string;
  favDrink?: string;
  favCar?: string;
  favSportToWatch?: string;
  favBoardGame?: string;
  littleKnownFact?: string;
})[] = [
    {
      name: "Frankie Harchut",
      fullName: "FRANKIE HARCHUT",
      memberNo: "NO. 005",
      role: "Drums • Percussion",
      birthday: "May 31",
      zodiac: "Gemini",
      luckyNo: "5",
      color: "Crimson Red",
      bestTrait: "Care For Others",
      worstTrait: "Care For Others",
      favQuote: "Success is where preparation and opportunity meet.",
      favLoveSong: '"Everlong" — Foo Fighters',
      favRockSong: '"Denial" — Sevendust',
      favAlbum: "Throwing Copper — Live",
      favBands: "Sevendust, Korn, A Day To Remember",
      favSoundtrack: "My Cousin Vinny, Casino",
      favMovie: "My Cousin Vinny, Casino",
      fav7hSong: '"Midwest Girls In The Summertime"',
      firstSongLearned: "Wipe Out",
      favPlaceToPlay: "High-energy festival main stages",
      bestConcertSeen: "Korn & Sevendust live",
      favTvShow: "The Sopranos, Peaky Blinders",
      favCartoon: "The Simpsons",
      favMagazine: "Modern Drummer",
      hobbyAwayFromBand: "Cooking Polish feast recipes",
      bestFeelingInWorld: "Locking in a powerful drum beat with the crowd jumping",
      influences: "Morgan Rose, Ray Luzier, Dave Grohl",
      favPet: "French Bulldog named Pierogi",
      favFoods: "Authentic Polish pierogis, kielbasa, and steak",
      favDrink: "Sparkling Water with Lemon",
      favCar: "Dodge Challenger SRT Hellcat",
      favSportToWatch: "Chicago Blackhawk Hockey",
      favBoardGame: "Risk",
      littleKnownFact: "I'm Polish, or wait, everyone knows that :)",
      funFact: "I'm Polish, or wait, everyone knows that :)",
      image: "/images/members/desktop-frank.webp",
      desktopImage: "/images/members/desktop-frank.webp",
      mobileImage: "/images/members/frank-mobile.webp"
    },
    {
      name: "Nick Cox",
      fullName: "NICK COX",
      memberNo: "NO. 004",
      role: "Guitars • Vocals • Piano",
      birthday: "March 19",
      zodiac: "Pisces",
      luckyNo: "19",
      color: "Midnight Navy",
      bestTrait: "Great listener",
      worstTrait: "Overthinking everything",
      favQuote: "The universe is a pretty big place... seems like an awful waste of space.",
      favLoveSong: '"Love of My Life" — Queen',
      favRockSong: '"Kashmir" — Led Zeppelin',
      favAlbum: "Physical Graffiti — Led Zeppelin",
      favBands: "Kiss, Queen, Zeppelin, Avenged Sevenfold",
      favSoundtrack: "Interstellar, Inception",
      favMovie: "American History X, Interstellar",
      fav7hSong: '"Take Me With You"',
      firstSongLearned: "Stairway to Heaven",
      favPlaceToPlay: "Outdoor summer amphitheaters",
      bestConcertSeen: "Led Zeppelin reunion / Queen + Adam Lambert",
      favTvShow: "Stranger Things, Game of Thrones",
      favCartoon: "Batman: The Animated Series",
      favMagazine: "Vintage Guitar",
      hobbyAwayFromBand: "Chilling on the couch with vintage vinyl",
      bestFeelingInWorld: "A perfect guitar solo tone on stage",
      influences: "Jimmy Page, Brian May, Synyster Gates",
      favPet: "Rescue tabby cat named Zeppelin",
      favFoods: "Chicago deep dish pizza & pasta",
      favDrink: "Cold Brew Coffee",
      favCar: "1969 Chevrolet Camaro",
      favSportToWatch: "Formula 1",
      favBoardGame: "Scrabble",
      littleKnownFact: "I love just staying home on my couch",
      funFact: "I love just staying home on my couch",
      image: "/images/members/desktop-nick.webp",
      desktopImage: "/images/members/desktop-nick.webp",
      mobileImage: "/images/members/nick-mobile.webp"
    },
    {
      name: "Adam Heisler",
      fullName: "ADAM BLAIR HEISLER",
      memberNo: "NO. 001",
      role: "Lead Vocals",
      birthday: "March 13",
      zodiac: "Pisces",
      luckyNo: "3",
      color: "Black",
      bestTrait: "I CARE TOO MUCH",
      worstTrait: "I CARE TOO MUCH",
      favQuote: "I'm always happy and never satisfied.",
      favLoveSong: '"She\'s Always a Woman" — Billy Joel',
      favRockSong: '"I Don\'t Like Your Neighbors" — AM Taxi',
      favAlbum: "The Stranger — Billy Joel",
      favBands: "Can't choose one — but he loves Ben Rector",
      favSoundtrack: "Grease 2",
      favMovie: "Whatever's on — but a good rom-com and a box of tissues will do it",
      fav7hSong: '"You and I"',
      firstSongLearned: "One he wrote himself",
      favPlaceToPlay: 'Anywhere they don\'t "boo"',
      bestConcertSeen: "Doesn't usually go to concerts",
      favTvShow: "Changes a lot — mostly girly shows like HIMYM and New Girl",
      favCartoon: "Ask Jett (his son)",
      favMagazine: "Reading?!",
      hobbyAwayFromBand: "Being a dad",
      bestFeelingInWorld: "Making someone happy",
      influences: "God",
      favPet: "An alligator named Shoes",
      favFoods: "Healthy: kale & spinach salad with hard-boiled eggs. Not: pizza or burritos",
      favDrink: "Water",
      favCar: "Not a car guy",
      favSportToWatch: "Hahahahaha!!!!!!",
      favBoardGame: "Skip-Bo, as a kid",
      littleKnownFact: "Former Jr. black belt in Tae Kwon Do",
      funFact: "Former Jr. black belt in Tae Kwon Do",
      image: "/images/members/desktop-adam.webp",
      desktopImage: "/images/members/desktop-adam.webp",
      mobileImage: "/images/members/adam-mobile.webp"
    },
    {
      name: "Richard Hofherr",
      fullName: "RICHARD HOFHERR",
      memberNo: "NO. 003",
      role: "Guitars • Keys • Vocals",
      birthday: "May 17",
      zodiac: "Taurus",
      luckyNo: "77",
      color: "Electric Blue",
      bestTrait: "My Perspectives, Work Ethic, Loyalty",
      worstTrait: "Never sleeping",
      favQuote: "Life is all about perspectives. You can look at the glass half-empty and half-full.",
      favLoveSong: '"Love Bites" — Def Leppard',
      favRockSong: '"Photograph" — Def Leppard',
      favAlbum: "Hysteria — Def Leppard",
      favBands: "Def Leppard, Queen, Van Halen",
      favSoundtrack: "Blues Brothers, Star Wars",
      favMovie: "Blues Brothers, Star Wars",
      fav7hSong: '"Sing", "Diamonds", "Midwest Girls"',
      firstSongLearned: "Rock of Ages — Def Leppard",
      favPlaceToPlay: "Every festival stage with 10,000 screaming fans",
      bestConcertSeen: "Def Leppard & Queen — Wembley",
      favTvShow: "Seinfeld & Shark Tank",
      favCartoon: "Looney Tunes",
      favMagazine: "Guitar World & Forbes",
      hobbyAwayFromBand: "Audio engineering & songwriting",
      bestFeelingInWorld: "Hearing 20,000 fans sing your song word for word",
      influences: "Phil Collen, Steve Clark, Eddie Van Halen",
      favPet: "Golden Retriever named Gibson",
      favFoods: "Grilled steak & fresh fruit",
      favDrink: "Pure Mountain Spring Water",
      favCar: "Tesla Model S Plaid",
      favSportToWatch: "Chicago Bears & Bulls",
      favBoardGame: "Monopoly",
      littleKnownFact: "I have never had alcohol, drugs, cigarettes or a headache.",
      funFact: "I have never had alcohol, drugs, cigarettes or a headache.",
      image: "/images/members/desktop-richy.webp",
      desktopImage: "/images/members/desktop-richy.webp",
      mobileImage: "/images/members/dicky-mobile.webp"
    },
    {
      name: "Mark Kennetz",
      fullName: "MARK KENNETZ",
      memberNo: "NO. 002",
      role: "Bass • Vocals • Uke • Guitar",
      birthday: "October 19",
      zodiac: "Libra",
      luckyNo: "19",
      color: "Green",
      bestTrait: "Being a Ninja",
      worstTrait: "n/a",
      favQuote: "The past is in Our heads, the future is in Our hands",
      favLoveSong: '"Crystal Ship" — The Doors',
      favRockSong: "n/a",
      favAlbum: "Sublime — 40 oz to Freedom",
      favBands: "Sublime, Led Zeppelin, Muse",
      favSoundtrack: "Matrix",
      favMovie: "Hot Fuzz, Anchorman, Big Lebowski",
      fav7hSong: '"Ethereal"',
      firstSongLearned: '"People Are Strange" — The Doors',
      favPlaceToPlay: "High-energy festival stages",
      bestConcertSeen: "Red Hot Chili Peppers",
      favTvShow: "Game of Thrones, Boardwalk",
      favCartoon: "Family Guy",
      favMagazine: "ESPN",
      hobbyAwayFromBand: "Snowboarding, Blading, Biking, Motorcycle Riding, Saving Dolphins",
      bestFeelingInWorld: "Riding a motorcycle on an awesome day",
      influences: "The Doors, Sublime, Led Zeppelin",
      favPet: "Kellieface",
      favFoods: "Bacon",
      favDrink: "Capt. N Diet",
      favCar: "Lexus GSF",
      favSportToWatch: "Football",
      favBoardGame: "Madden Xbox",
      littleKnownFact: "I'm a stage 2 carnivore, which means I eat anything with 2 legs or less, except bacon :)",
      funFact: "I'm a stage 2 carnivore, which means I eat anything with 2 legs or less, except bacon :)",
      image: "/images/members/desktop-mark.webp",
      desktopImage: "/images/members/desktop-mark.webp",
      mobileImage: "/images/members/mark-mobile.webp"
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
  members?: (Partial<SanityBandMember> & { desktopImage?: string; mobileImage?: string })[];
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

const getMemberDesktopImage = (m?: Partial<SanityBandMember> & { desktopImage?: string }): string => {
  if (m?.desktopImage) return m.desktopImage.replace(/\.png$/, '.webp');
  const nameLower = (m?.name || "").toLowerCase();
  if (nameLower.includes("adam")) return "/images/members/desktop-adam.webp";
  if (nameLower.includes("richard") || nameLower.includes("rick") || nameLower.includes("dicky") || nameLower.includes("richy") || nameLower.includes("hofherr")) return "/images/members/desktop-richy.webp";
  if (nameLower.includes("frankie") || nameLower.includes("frank") || nameLower.includes("harchut")) return "/images/members/desktop-frank.webp";
  if (nameLower.includes("mark") || nameLower.includes("kennetz")) return "/images/members/desktop-mark.webp";
  if (nameLower.includes("nick") || nameLower.includes("cox")) return "/images/members/desktop-nick.webp";
  if (typeof m?.image === 'string' && m.image) return m.image.replace(/\.png$/, '.webp');
  return "/images/members/desktop-adam.webp";
};

const getMemberMobileImage = (m?: Partial<SanityBandMember> & { mobileImage?: string }): string => {
  if (m?.mobileImage) return m.mobileImage.replace(/\.png$/, '.webp');
  const nameLower = (m?.name || "").toLowerCase();
  if (nameLower.includes("adam")) return "/images/members/adam-mobile.webp";
  if (nameLower.includes("richard") || nameLower.includes("rick") || nameLower.includes("dicky") || nameLower.includes("richy") || nameLower.includes("hofherr")) return "/images/members/dicky-mobile.webp";
  if (nameLower.includes("frankie") || nameLower.includes("frank") || nameLower.includes("harchut")) return "/images/members/frank-mobile.webp";
  if (nameLower.includes("mark") || nameLower.includes("kennetz")) return "/images/members/mark-mobile.webp";
  if (nameLower.includes("nick") || nameLower.includes("cox")) return "/images/members/nick-mobile.webp";
  if (typeof m?.image === 'string' && m.image) return m.image.replace(/\.png$/, '.webp');
  return "/images/members/adam-mobile.webp";
};

const getMemberImage = (m?: Partial<SanityBandMember> & { desktopImage?: string; mobileImage?: string }, isMobile?: boolean): string => {
  return isMobile ? getMemberMobileImage(m) : getMemberDesktopImage(m);
};

export default function BioParallaxSlider({ members = FALLBACK_MEMBERS }: BioParallaxSliderProps) {
  // Construct 5-member stage explicitly: Frankie, Nick (Left), Adam (Center), Richard (Right), Mark
  const displayMembers = useMemo(() => {
    const list = members.length ? members : FALLBACK_MEMBERS;

    const findAndMerge = (query: string, fallbackIdx: number) => {
      const found = list.find((m) => m.name?.toLowerCase().includes(query));
      const fallback = FALLBACK_MEMBERS[fallbackIdx];
      if (!found) return fallback;
      return { ...fallback, ...found };
    };

    const adam = findAndMerge("adam", 2);
    const nick = findAndMerge("nick", 1);
    const richard = list.find((m) => m.name?.toLowerCase().includes("richard") || m.name?.toLowerCase().includes("rick") || m.name?.toLowerCase().includes("richy"))
      ? { ...FALLBACK_MEMBERS[3], ...list.find((m) => m.name?.toLowerCase().includes("richard") || m.name?.toLowerCase().includes("rick") || m.name?.toLowerCase().includes("richy")) }
      : FALLBACK_MEMBERS[3];
    const frankie = findAndMerge("frankie", 0);
    const mark = findAndMerge("mark", 4);

    return [frankie, nick, adam, richard, mark];
  }, [members]);

  const adamCenterIdx = 2; // Index 2 is Adam Heisler
  const [activeIndex, setActiveIndex] = useState<number>(adamCenterIdx);
  const [isFactSheetOpen, setIsFactSheetOpen] = useState<boolean>(false);
  const [selectedMemberForSheet, setSelectedMemberForSheet] = useState<BandMemberFactSheet | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Lock section into view and prevent background page scrolling when Fact Sheet drawer is open
  useEffect(() => {
    if (!isFactSheetOpen) return;

    const origHtmlOverflow = document.documentElement.style.overflow;
    const origBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    if (typeof window !== "undefined" && (window as any).__lenis) {
      try {
        (window as any).__lenis.stop();
      } catch { }
    }

    return () => {
      document.documentElement.style.overflow = origHtmlOverflow;
      document.body.style.overflow = origBodyOverflow;

      if (typeof window !== "undefined" && (window as any).__lenis) {
        try {
          (window as any).__lenis.start();
          (window as any).__lenis.resize();
        } catch { }
      }
    };
  }, [isFactSheetOpen]);

  // Smooothy Physics & Tuned UI Configuration
  const physicsMode: "snap" | "free" = "free";
  const [lerpSpeed, setLerpSpeed] = useState<number>(0.22);
  const [dragSens, setDragSens] = useState<number>(2.2);
  const [dragThreshold, setDragThreshold] = useState<number>(4);

  // Tunable Stage & Cutout Size Controls — Saved User Configuration
  const [cardWidth, setCardWidth] = useState<number>(458);
  const [imageHeight, setImageHeight] = useState<number>(610);
  const [imageScale, setImageScale] = useState<number>(1.42);
  const [imageOffsetY, setImageOffsetY] = useState<number>(-10);
  const [gap, setGap] = useState<number>(-69);
  const [parallaxDepth, setParallaxDepth] = useState<number>(0.00);
  const [maxSkew, setMaxSkew] = useState<number>(30);
  const [focalScale, setFocalScale] = useState<number>(1.36);
  const [maskStart, setMaskStart] = useState<number>(95);
  const [maskEnd, setMaskEnd] = useState<number>(98);
  const [paddingOffset, setPaddingOffset] = useState<number>(-38);
  const [activeYShift, setActiveYShift] = useState<number>(30);
  const [inactiveNameOpacity, setInactiveNameOpacity] = useState<number>(0);

  // Fireplace WebGL Shader Canvas & BioParallax UI Controls State
  const [isCanvasEnabled, setIsCanvasEnabled] = useState<boolean>(true);
  const [flameSpeed, setFlameSpeed] = useState<number>(0.3);
  const [flameHeight, setFlameHeight] = useState<number>(0.2);
  const [sparkDensity, setSparkDensity] = useState<number>(1.1);
  const [sparkScale, setSparkScale] = useState<number>(0.09);
  const [paletteTheme, setPaletteTheme] = useState<number>(1);
  const [canvasOpacity, setCanvasOpacity] = useState<number>(75);
  const [glowOpacity, setGlowOpacity] = useState<number>(75);
  const [useCustomColors, setUseCustomColors] = useState<boolean>(true);
  const [colorBaseHex, setColorBaseHex] = useState<string>("#330000");
  const [colorMidHex, setColorMidHex] = useState<string>("#CC1100");
  const [colorCoreHex, setColorCoreHex] = useState<string>("#FFAA00");
  const [colorSparkHex, setColorSparkHex] = useState<string>("#fdf7d8");
  const [isCanvasCustomizerOpen, setIsCanvasCustomizerOpen] = useState<boolean>(false);
  const [activeCustomizerTab, setActiveCustomizerTab] = useState<"canvas" | "stage">("canvas");
  const [copiedConfigNotification, setCopiedConfigNotification] = useState<boolean>(false);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const getGlowGradient = useCallback(() => {
    if (useCustomColors) {
      return `radial-gradient(ellipse 85% 80% at 50% 50%, ${colorCoreHex}cc 0%, ${colorMidHex}88 45%, ${colorBaseHex}00 80%)`;
    }
    switch (paletteTheme) {
      case 1:
        return "radial-gradient(ellipse 85% 80% at 50% 50%, rgba(255, 122, 41, 0.85) 0%, rgba(217, 43, 0, 0.55) 45%, rgba(100, 10, 0, 0) 80%)";
      case 2:
        return "radial-gradient(ellipse 85% 80% at 50% 50%, rgba(0, 217, 255, 0.85) 0%, rgba(0, 90, 220, 0.55) 45%, rgba(0, 20, 70, 0) 80%)";
      case 3:
        return "radial-gradient(ellipse 85% 80% at 50% 50%, rgba(50, 255, 90, 0.85) 0%, rgba(10, 180, 50, 0.55) 45%, rgba(0, 50, 10, 0) 80%)";
      case 4:
        return "radial-gradient(ellipse 85% 80% at 50% 50%, rgba(240, 240, 255, 0.75) 0%, rgba(140, 150, 180, 0.45) 45%, rgba(20, 25, 40, 0) 80%)";
      default:
        // Theme 0: Deep Violet / Burnt Orange / Neon Glow
        return "radial-gradient(ellipse 85% 80% at 50% 50%, rgba(168, 85, 247, 0.85) 0%, rgba(126, 34, 206, 0.55) 45%, rgba(21, 17, 80, 0) 80%)";
    }
  }, [useCustomColors, colorCoreHex, colorMidHex, colorBaseHex, paletteTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedCanvas = localStorage.getItem("bioparallax_canvas_config_v1");
      if (savedCanvas) {
        const cfg = JSON.parse(savedCanvas);
        if (cfg.isCanvasEnabled !== undefined) setIsCanvasEnabled(cfg.isCanvasEnabled);
        if (cfg.flameSpeed !== undefined) setFlameSpeed(cfg.flameSpeed);
        if (cfg.flameHeight !== undefined) setFlameHeight(cfg.flameHeight);
        if (cfg.sparkDensity !== undefined) setSparkDensity(cfg.sparkDensity);
        if (cfg.sparkScale !== undefined) setSparkScale(cfg.sparkScale);
        if (cfg.paletteTheme !== undefined) setPaletteTheme(cfg.paletteTheme);
        if (cfg.canvasOpacity !== undefined) setCanvasOpacity(cfg.canvasOpacity);
        if (cfg.glowOpacity !== undefined) setGlowOpacity(cfg.glowOpacity);
        if (cfg.useCustomColors !== undefined) setUseCustomColors(cfg.useCustomColors);
        if (cfg.colorBaseHex !== undefined) setColorBaseHex(cfg.colorBaseHex);
        if (cfg.colorMidHex !== undefined) setColorMidHex(cfg.colorMidHex);
        if (cfg.colorCoreHex !== undefined) setColorCoreHex(cfg.colorCoreHex);
        if (cfg.colorSparkHex !== undefined) setColorSparkHex(cfg.colorSparkHex);
      }
      const saved = localStorage.getItem("smooothy_css_tuner_config_v2");
      if (saved) {
        const cfg = JSON.parse(saved);
        if (cfg.maskStart !== undefined) setMaskStart(cfg.maskStart);
        if (cfg.maskEnd !== undefined) setMaskEnd(cfg.maskEnd);
        if (cfg.paddingOffset !== undefined) setPaddingOffset(cfg.paddingOffset);
        if (cfg.focalScale !== undefined) setFocalScale(cfg.focalScale);
        if (cfg.imageOffsetY !== undefined) setImageOffsetY(cfg.imageOffsetY);
        if (cfg.activeYShift !== undefined) setActiveYShift(cfg.activeYShift);
        if (cfg.inactiveNameOpacity !== undefined) setInactiveNameOpacity(cfg.inactiveNameOpacity);
      }
    } catch (e) {
      console.error("Failed to load tuner config:", e);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        "bioparallax_canvas_config_v1",
        JSON.stringify({
          isCanvasEnabled,
          flameSpeed,
          flameHeight,
          sparkDensity,
          sparkScale,
          paletteTheme,
          canvasOpacity,
          glowOpacity,
          useCustomColors,
          colorBaseHex,
          colorMidHex,
          colorCoreHex,
          colorSparkHex,
        })
      );
    } catch (e) {
      console.error("Failed to save canvas config:", e);
    }
  }, [
    isCanvasEnabled,
    flameSpeed,
    flameHeight,
    sparkDensity,
    sparkScale,
    paletteTheme,
    canvasOpacity,
    glowOpacity,
    useCustomColors,
    colorBaseHex,
    colorMidHex,
    colorCoreHex,
    colorSparkHex,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        "smooothy_css_tuner_config_v2",
        JSON.stringify({ maskStart, maskEnd, paddingOffset, focalScale, imageOffsetY, activeYShift, inactiveNameOpacity })
      );
    } catch (e) {
      console.error("Failed to save css tuner config:", e);
    }
  }, [maskStart, maskEnd, paddingOffset, focalScale, imageOffsetY, activeYShift, inactiveNameOpacity]);

  const handleResetCanvasDefaults = () => {
    setIsCanvasEnabled(true);
    setFlameSpeed(0.2);
    setFlameHeight(1.3);
    setSparkDensity(2.3);
    setSparkScale(0.1);
    setPaletteTheme(1);
    setCanvasOpacity(60);
    setGlowOpacity(75);
    setUseCustomColors(true);
    setColorBaseHex("#330000");
    setColorMidHex("#CC1100");
    setColorCoreHex("#FFAA00");
    setColorSparkHex("#FFD700");
    setCardWidth(303);
    setImageHeight(404);
    setImageScale(1.42);
    setImageOffsetY(-10);
    setGap(-30);
    setActiveYShift(30);
    setTextBackdropOpacity(0);
  };

  const handleCopyConfig = () => {
    const config = {
      canvas: {
        isCanvasEnabled,
        flameSpeed,
        flameHeight,
        sparkDensity,
        sparkScale,
        paletteTheme,
        canvasOpacity,
        useCustomColors,
        colorBaseHex,
        colorMidHex,
        colorCoreHex,
        colorSparkHex,
      },
      stage: { cardWidth, imageHeight, imageScale, imageOffsetY, gap, activeYShift, textBackdropOpacity },
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopiedConfigNotification(true);
    setTimeout(() => setCopiedConfigNotification(false), 2000);
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--smooothy-mask-start", `${maskStart}%`);
      document.documentElement.style.setProperty("--smooothy-mask-end", `${maskEnd}%`);
    }
  }, [maskStart, maskEnd]);

  const [textLayout, setTextLayout] = useState<"pill" | "top" | "spotlight" | "spine">("pill");
  const [textPos, setTextPos] = useState<"left" | "left-glass" | "left-accent" | "center" | "center-glass" | "right" | "right-glass" | "right-accent">("left");
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [nameFontSize, setNameFontSize] = useState<string | number>("clamp(14px, 8.5px + 0.75vw, 20px)");
  const [roleFontSize, setRoleFontSize] = useState<number>(12); // px
  const [textBottomOffset, setTextBottomOffset] = useState<number>(16); // px
  const [textBackdropOpacity, setTextBackdropOpacity] = useState<number>(0); // % opacity for text background backdrop mask

  const computedNameFontSize = useMemo(() => {
    if (isMobileView) {
      if (typeof nameFontSize === "number") {
        return `${Math.max(10, nameFontSize - 3)}px`;
      }
      if (typeof nameFontSize === "string" && nameFontSize.includes("clamp(")) {
        return "clamp(12px, 6.5px + 0.75vw, 17px)";
      }
      return `calc(${nameFontSize} - 3px)`;
    }
    return typeof nameFontSize === "number" ? `${nameFontSize}px` : nameFontSize;
  }, [nameFontSize, isMobileView]);

  const computedRoleFontSize = useMemo(() => {
    if (isMobileView) {
      return `${Math.max(9, roleFontSize - 2)}px`;
    }
    return `${roleFontSize}px`;
  }, [roleFontSize, isMobileView]);

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
    "glass-dock" | "circular" | "cyber-hud" | "film-strip" | "minimal" | "left-spine" | "right-spine" | "full-bottom" | "expanded-active" | "diamond">("minimal");
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
      const isMobile = vw < 768;
      const isTablet = vw >= 768 && vw < 1024;
      setIsMobileView(isMobile);
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

      // Constrain targetHeight so the 1.48x scaled active card fits 100% inside window without cutting off head
      const currentFocal = focalScaleRef.current || 1.48;
      const maxAllowedScaledHeight = Math.round(vh * (isMobile ? 0.65 : 0.70));
      const maxBaseHeight = Math.round(maxAllowedScaledHeight / currentFocal);

      if (targetHeight > maxBaseHeight) {
        targetHeight = maxBaseHeight;
        targetWidth = Math.round(targetHeight / 1.3333);
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
  const activeIndexRef = useRef<number>(adamCenterIdx);
  const velocityRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const lerpSpeedRef = useRef<number>(lerpSpeed);
  useEffect(() => { lerpSpeedRef.current = lerpSpeed; }, [lerpSpeed]);

  const parallaxDepthRef = useRef<number>(parallaxDepth);
  useEffect(() => { parallaxDepthRef.current = parallaxDepth; }, [parallaxDepth]);

  const maxSkewRef = useRef<number>(maxSkew);
  useEffect(() => { maxSkewRef.current = maxSkew; }, [maxSkew]);

  const focalScaleRef = useRef<number>(focalScale);
  useEffect(() => { focalScaleRef.current = focalScale; }, [focalScale]);

  const activeYShiftRef = useRef<number>(activeYShift);
  useEffect(() => { activeYShiftRef.current = activeYShift; }, [activeYShift]);

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
  const updatePhysicsRef = useRef<() => void>(() => { });

  useEffect(() => {
    let frameId: number;
    let isCancelled = false;
    let lastX = currentXRef.current;

    const loop = () => {
      if (isCancelled) return;
      // Lerp current position to target position using Smooothy inertia factor
      const diff = targetXRef.current - currentXRef.current;
      if (Math.abs(diff) < 0.2) {
        currentXRef.current = targetXRef.current;
      } else {
        currentXRef.current += diff * Math.max(0.18, lerpSpeedRef.current);
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

        // Loop through all member cards to calculate Smooothy lerp position, focal scaling, opacity & dynamic zIndex
        const cardEls = trackRef.current.children;
        for (let i = 0; i < cardEls.length; i++) {
          const card = cardEls[i] as HTMLElement;
          if (!card) continue;

          const imgEl = (card.querySelector(".smooothy-img-wrapper") || card.querySelector(".smooothy-img")) as HTMLElement | null;

          // Position of this card relative to current center position in units of itemTotalWidth
          const cardCenterX = i * itemTotalWidth;
          const distFromCenter = Math.abs(cardCenterX - currentXRef.current) / itemTotalWidth;

          // Continuous smooth scale & opacity: 3 visible members max (Center + 1 Left + 1 Right)
          const focalVal = Math.max(0, 1 - Math.min(distFromCenter, 1.4) / 1.4);
          const scale = 0.84 + focalVal * (focalScaleRef.current - 0.84);

          // Keep all 5 member cards visible with smooth focal center weighting
          const cardOpacity = Math.max(0.70, 1 - distFromCenter * 0.12);

          // Active Y lift
          const activeY = activeYShiftRef.current * focalVal;

          card.style.transformOrigin = "bottom center";
          card.style.transform = `translate3d(0, ${activeY}px, 0) scale(${scale})`;
          card.style.opacity = "1";
          card.style.zIndex = distFromCenter < 0.75 ? "40" : distFromCenter < 1.5 ? "30" : "20";

          // Parallax cutout translate effect inside member card
          if (imgEl) {
            const cardOffset = i * itemTotalWidth - currentXRef.current;
            const parallaxX = cardOffset * parallaxDepthRef.current;
            const transformStr = `translate3d(${parallaxX}px, ${imageOffsetY}px, 0) scale(${imageScale})`;

            imgEl.style.transformOrigin = "bottom center";
            imgEl.style.transform = transformStr;
            imgEl.style.opacity = "1";
            imgEl.style.filter = "none";
          }
        }
      }

      // Compute active centered slide index (non-blocking transition to prevent frame freeze)
      const rawIdx = Math.round(currentXRef.current / itemTotalWidth);
      const safeIdx = Math.max(0, Math.min(displayMembers.length - 1, rawIdx));
      if (activeIndexRef.current !== safeIdx) {
        activeIndexRef.current = safeIdx;
        React.startTransition(() => {
          setActiveIndex(safeIdx);
        });
      }

      // Continue loop if still moving, else pause RAF loop cleanly
      if (Math.abs(targetXRef.current - currentXRef.current) > 0.2 || Math.abs(velocityRef.current) > 0.2) {
        frameId = requestAnimationFrame(loop);
        animFrameRef.current = frameId;
      } else {
        frameId = 0;
        animFrameRef.current = 0;
      }
    };

    updatePhysicsRef.current = loop;
    frameId = requestAnimationFrame(loop);
    animFrameRef.current = frameId;

    return () => {
      isCancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, [itemTotalWidth, displayMembers.length, cardWidth, imageScale, imageOffsetY, isTabletView]);

  const requestPhysicsUpdate = () => {
    if (!animFrameRef.current && updatePhysicsRef.current) {
      animFrameRef.current = requestAnimationFrame(updatePhysicsRef.current);
    }
  };

  // Go to slide
  const goToSlide = (idx: number) => {
    const safeIdx = Math.max(0, Math.min(displayMembers.length - 1, idx));
    targetXRef.current = safeIdx * itemTotalWidth;
    requestPhysicsUpdate();
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
        requestPhysicsUpdate();
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        const safeIdx = Math.max(0, Math.min(displayMembers.length - 1, activeIndex + 1));
        targetXRef.current = safeIdx * itemTotalWidth;
        requestPhysicsUpdate();
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
    requestPhysicsUpdate();
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
    requestPhysicsUpdate();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    requestPhysicsUpdate();

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

  const scaledHeadroomPadding = useMemo(() => {
    const currentFocal = focalScale || 1.48;
    return Math.max(8, Math.ceil(imageHeight * (currentFocal - 1) + paddingOffset));
  }, [imageHeight, focalScale, paddingOffset]);

  return (
    <section
      id="band"
      ref={sectionRef}
      className="w-full max-w-full overflow-x-clip h-auto flex flex-col justify-end select-none relative"
    >


      {/* Live Canvas & Stage UI Customizer Drawer Panel */}
      {isCanvasCustomizerOpen && mounted && typeof document !== "undefined" && createPortal(
        <>

          <div className="fixed inset-y-0 right-0 z-[9999] w-[360px] max-w-[92vw] h-screen max-h-screen bg-black/95 backdrop-blur-2xl border-l border-white/15 p-5 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div>
                  <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <span>🔥</span> Canvas & Stage Control
                  </h4>
                  <p className="text-[11px] text-white/50">Tune WebGL Fireplace & Bio Parallax Slider</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCanvasCustomizerOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close UI Controls"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-4 p-1 bg-white/5 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveCustomizerTab("canvas")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeCustomizerTab === "canvas" ? "bg-amber-500 text-black shadow-md" : " text-white/70 hover:text-white hover:bg-white/5" }`}
                >
                  🔥 Shader Canvas
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCustomizerTab("stage")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeCustomizerTab === "stage" ? "bg-amber-500 text-black shadow-md" : " text-white/70 hover:text-white hover:bg-white/5" }`}
                >
                  📐 Bio Stage
                </button>
              </div>

              {activeCustomizerTab === "canvas" && (
                <div className="space-y-4 text-xs">
                  {/* Enable Shader Canvas Toggle */}
                  <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg border border-white/10">
                    <span className="font-medium /90">Enable Fireplace Shader</span>
                    <button
                      type="button"
                      onClick={() => setIsCanvasEnabled((prev) => !prev)}
                      className={`px-3 py-1 rounded-full font-bold text-[11px] transition-colors cursor-pointer ${isCanvasEnabled ? "bg-emerald-500 text-black" : "bg-white/20 text-white/70" }`}
                    >
                      {isCanvasEnabled ? "ON" : "OFF"}
                    </button>
                  </div>

                  {/* Palette Theme Presets */}
                  <div>
                    <span className="block text-white/70 font-medium mb-1.5">Fireplace Palette Preset</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 0, label: "💜 Deep Violet" },
                        { id: 1, label: "🔥 Classic Red" },
                        { id: 2, label: "🩵 Cyber Cyan" },
                        { id: 3, label: "💚 Toxic Lime" },
                        { id: 4, label: "🤍 Silver White" },
                      ].map((theme) => (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => {
                            setPaletteTheme(theme.id);
                            setUseCustomColors(false);
                          }}
                          className={`p-2 rounded-lg text-left text-[11px] font-semibold border transition-all cursor-pointer ${!useCustomColors && paletteTheme === theme.id ? "bg-amber-500 text-black border-amber-400 font-bold shadow-sm" : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10" }`}
                        >
                          {theme.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Color Swatches & Toggle */}
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="/90 font-semibold text-xs flex items-center gap-1.5">
                        <span>🎨</span> Custom Palette Swatches
                      </span>
                      <button
                        type="button"
                        onClick={() => setUseCustomColors((prev) => !prev)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${useCustomColors ? "bg-amber-500 text-black" : "bg-white/20 text-white/70" }`}
                      >
                        {useCustomColors ? "CUSTOM" : "PRESET"}
                      </button>
                    </div>

                    {/* Preset Swatch Shortcuts */}
                    <div className="pt-2 border-t border-white/10">
                      <span className="block text-[10px] font-semibold text-white/50 mb-1.5">Quick Swatch Presets</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: "💜 Violet", base: "#151150", mid: "#611EBD", core: "#FF7A29", spark: "#FF6124" },
                          { label: "🔥 Magma", base: "#330000", mid: "#CC1100", core: "#FFAA00", spark: "#FFD700" },
                          { label: "🩵 Cyber", base: "#001533", mid: "#0088CC", core: "#00FFFF", spark: "#80FFFF" },
                          { label: "💖 Pink", base: "#220015", mid: "#CC0066", core: "#FF3399", spark: "#FF99DD" },
                          { label: "💚 Lime", base: "#002200", mid: "#00AA33", core: "#88FF00", spark: "#D4FF80" },
                        ].map((s) => (
                          <button
                            key={s.label}
                            type="button"
                            onClick={() => {
                              setUseCustomColors(true);
                              setColorBaseHex(s.base);
                              setColorMidHex(s.mid);
                              setColorCoreHex(s.core);
                              setColorSparkHex(s.spark);
                            }}
                            className="px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/15 rounded text-[10px] font-semibold transition-all cursor-pointer"
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <div>
                        <div className="flex justify-between text-[10px] text-white/60 mb-1">
                          <span>Base Sky</span>
                          <span className="font-mono text-amber-300">{colorBaseHex}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={colorBaseHex}
                            onChange={(e) => {
                              setColorBaseHex(e.target.value);
                              setUseCustomColors(true);
                            }}
                            className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={colorBaseHex}
                            onChange={(e) => {
                              setColorBaseHex(e.target.value);
                              setUseCustomColors(true);
                            }}
                            className="w-full bg-black/50 border border-white/15 rounded px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-white/60 mb-1">
                          <span>Mid Flame</span>
                          <span className="font-mono text-amber-300">{colorMidHex}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={colorMidHex}
                            onChange={(e) => {
                              setColorMidHex(e.target.value);
                              setUseCustomColors(true);
                            }}
                            className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={colorMidHex}
                            onChange={(e) => {
                              setColorMidHex(e.target.value);
                              setUseCustomColors(true);
                            }}
                            className="w-full bg-black/50 border border-white/15 rounded px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-white/60 mb-1">
                          <span>Core Fire</span>
                          <span className="font-mono text-amber-300">{colorCoreHex}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={colorCoreHex}
                            onChange={(e) => {
                              setColorCoreHex(e.target.value);
                              setUseCustomColors(true);
                            }}
                            className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={colorCoreHex}
                            onChange={(e) => {
                              setColorCoreHex(e.target.value);
                              setUseCustomColors(true);
                            }}
                            className="w-full bg-black/50 border border-white/15 rounded px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-white/60 mb-1">
                          <span>Spark Embers</span>
                          <span className="font-mono text-amber-300">{colorSparkHex}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={colorSparkHex}
                            onChange={(e) => {
                              setColorSparkHex(e.target.value);
                              setUseCustomColors(true);
                            }}
                            className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={colorSparkHex}
                            onChange={(e) => {
                              setColorSparkHex(e.target.value);
                              setUseCustomColors(true);
                            }}
                            className="w-full bg-black/50 border border-white/15 rounded px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Flame Animation Speed */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/70 font-medium">Flame Speed</span>
                      <span className="font-mono text-amber-400">{flameSpeed.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="2.5"
                      step="0.1"
                      value={flameSpeed}
                      onChange={(e) => setFlameSpeed(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                      aria-label="Flame Speed"
                    />
                  </div>

                  {/* Flame Scale / Height */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/70 font-medium">Flame Height Scale</span>
                      <span className="font-mono text-amber-400">{flameHeight.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="3.0"
                      step="0.1"
                      value={flameHeight}
                      onChange={(e) => setFlameHeight(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                      aria-label="Flame Height Scale"
                    />
                  </div>

                  {/* Ember / Spark Density */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/70 font-medium">Ember Density</span>
                      <span className="font-mono text-amber-400">{sparkDensity.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="3.0"
                      step="0.1"
                      value={sparkDensity}
                      onChange={(e) => setSparkDensity(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                      aria-label="Ember Density"
                    />
                  </div>

                  {/* Spark Particle Size */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/70 font-medium">Spark Size</span>
                      <span className="font-mono text-amber-400">{sparkScale.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.02"
                      max="0.20"
                      step="0.01"
                      value={sparkScale}
                      onChange={(e) => setSparkScale(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                      aria-label="Spark Size"
                    />
                  </div>

                  {/* Canvas Opacity */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/70 font-medium">Canvas Opacity</span>
                      <span className="font-mono text-amber-400">{canvasOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={canvasOpacity}
                      onChange={(e) => setCanvasOpacity(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 cursor-pointer"
                      aria-label="Canvas Opacity"
                    />
                  </div>

                  {/* Backdrop Glow Opacity */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/70 font-medium">Image Glow Opacity</span>
                      <span className="font-mono text-amber-400">{glowOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={glowOpacity}
                      onChange={(e) => setGlowOpacity(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 cursor-pointer"
                      aria-label="Image Glow Opacity"
                    />
                  </div>
                </div>
              )}

              {activeCustomizerTab === "stage" && (
                <div className="space-y-4 text-xs">
                  {/* Card Width */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/70 font-medium">Card Width</span>
                      <span className="font-mono text-amber-400">{cardWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="240"
                      max="480"
                      step="10"
                      value={cardWidth}
                      onChange={(e) => setCardWidth(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 cursor-pointer"
                      aria-label="Card Width"
                    />
                  </div>

                  {/* Image Height */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/70 font-medium">Cutout Height</span>
                      <span className="font-mono text-amber-400">{imageHeight}px</span>
                    </div>
                    <input
                      type="range"
                      min="300"
                      max="600"
                      step="10"
                      value={imageHeight}
                      onChange={(e) => setImageHeight(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 cursor-pointer"
                      aria-label="Cutout Height"
                    />
                  </div>

                  {/* Image Scale */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/70 font-medium">Member Image Scale</span>
                      <span className="font-mono text-amber-400">{imageScale.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="2.2"
                      step="0.02"
                      value={imageScale}
                      onChange={(e) => setImageScale(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                      aria-label="Member Image Scale"
                    />
                  </div>

                  {/* Image Y Offset */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/70 font-medium">Image Y Offset</span>
                      <span className="font-mono text-amber-400">{imageOffsetY}px</span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      step="2"
                      value={imageOffsetY}
                      onChange={(e) => setImageOffsetY(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 cursor-pointer"
                      aria-label="Image Y Offset"
                    />
                  </div>

                  {/* Gap */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/70 font-medium">Card Spacing Gap</span>
                      <span className="font-mono text-amber-400">{gap}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="2"
                      value={gap}
                      onChange={(e) => setGap(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 cursor-pointer"
                      aria-label="Card Spacing Gap"
                    />
                  </div>

                  {/* Active Y Shift */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/70 font-medium">Active Card Y-Elevation</span>
                      <span className="font-mono text-amber-400">{activeYShift}px</span>
                    </div>
                    <input
                      type="range"
                      min="-20"
                      max="60"
                      step="2"
                      value={activeYShift}
                      onChange={(e) => setActiveYShift(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 cursor-pointer"
                      aria-label="Active Card Y-Elevation"
                    />
                  </div>

                  {/* Text Backdrop Opacity */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/70 font-medium">Text Backdrop Opacity</span>
                      <span className="font-mono text-amber-400">{textBackdropOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={textBackdropOpacity}
                      onChange={(e) => setTextBackdropOpacity(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 cursor-pointer"
                      aria-label="Text Backdrop Opacity"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-2 mt-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleResetCanvasDefaults}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  🔄 Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={handleCopyConfig}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  {copiedConfigNotification ? "✓ Copied!" : "📋 Copy Config"}
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}


      {/* 🎬 LEFT SPINE PAGINATION (Top image locked at top-[36px], gap & height scale down as screen height shrinks) */}
      {
        paginationStyle === "left-spine" && (
          <div className="absolute left-2 sm:left-6 md:left-8 top-[36px] z-30 flex flex-col items-start select-none">
            <div className="flex flex-col z-10" style={{ gap: `${spineGap}px` }}>
              {displayMembers.map((m, idx) => {
                const isActive = activeIndex === idx;
                const imageSrc = getMemberImage(m, isMobileView);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); goToSlide(idx); }}
                    className={`relative group flex items-center gap-2 sm:gap-3.5 cursor-pointer transition-colors duration-300 ${isActive ? "z-20" : "" }`}>
                    {/* Member Card Thumbnail */}
                    <div
                      className="sm: overflow-hidden relative transition-colors duration-300 rounded-lg shrink-0 spine-thumb-mask"
                      style={{
                        height: `${spineVideoHeight}px`,
                        width: `${Math.round(spineVideoHeight * 0.78)}px`,
                      }}>
                      <Image src={imageSrc} alt={m?.name || "Band Member"} fill sizes="100px" className={`object-cover transition-all duration-300 ${isActive ? "brightness-110 scale-105" : "brightness-75 opacity-70 group-hover:opacity-100 group-hover:brightness-100"}`} />
                    </div>

                    {/* Member Name & Role Display (Responsive text sizing) */}
                    <div className={`transition-colors duration-300 whitespace-nowrap block text-left ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0" }`}>
                      <p className="drop-">
                        {m?.name || "Band Member"}
                      </p>
                      <p className="mt-0.5 sm:">
                        {m?.role || "Musician"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )
      }

      {/* 🎬 RIGHT SPINE PAGINATION (Top image locked at top-[36px], gap & height scale down as screen height shrinks) */}
      {
        paginationStyle === "right-spine" && (
          <div className="absolute right-2 sm:right-6 md:right-8 top-[36px] z-30 flex flex-col items-end select-none">
            <div className="flex flex-col z-10" style={{ gap: `${spineGap}px` }}>
              {displayMembers.map((m, idx) => {
                const isActive = activeIndex === idx;
                const imageSrc = getMemberImage(m, isMobileView);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToSlide(idx);
                      setSelectedMemberForSheet(m as BandMemberFactSheet);
                      setIsFactSheetOpen(true);
                    }}
                    className={`relative group flex items-center justify-end gap-2 sm:gap-3.5 cursor-pointer transition-colors duration-300 ${isActive ? "z-20" : "" }`}>
                    {/* Member Name & Role Display (Responsive text sizing) */}
                    <div className={`transition-colors duration-300 whitespace-nowrap block text-right ${isActive ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0" }`}>
                      <p className="drop-">
                        {m?.name || "Band Member"}
                      </p>
                      <p className="mt-0.5 sm:">
                        {m?.role || "Musician"}
                      </p>
                    </div>

                    {/* Member Card Thumbnail */}
                    <div
                      className="sm: overflow-hidden relative transition-colors duration-300 rounded-lg shrink-0 spine-thumb-mask"
                      style={{
                        height: `${spineVideoHeight}px`,
                        width: `${Math.round(spineVideoHeight * 0.78)}px`,
                      }}>
                      <Image src={imageSrc} alt={m?.name || "Band Member"} fill sizes="100px" className={`object-cover transition-all duration-300 ${isActive ? "brightness-110 scale-105" : "brightness-75 opacity-70 group-hover:opacity-100 group-hover:brightness-100"}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )
      }

      {/* 100VW FULL-SCREEN STAGE CONTAINER */}
      <div className="w-full relative z-[100] overflow-x-clip">



        {/* 5-CARD FULL-SCREEN CANVAS */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            touchAction: "pan-y",
            paddingTop: `${scaledHeadroomPadding}px`,
            paddingBottom: "24px",
          }}
          className="w-full overflow-visible cursor-grab active:cursor-grabbing relative">
          {/* TRACK ELEMENT (GPU accelerated with Smooothy parallax & speed lerp) */}
          <div
            ref={trackRef}
            className="flex items-end pt-0 pb-0"
            style={{ width: `${displayMembers.length * itemTotalWidth}px` }}>
            {displayMembers.map((m, i) => {
              const imageSrc = getMemberImage(m, isMobileView);
              const desktopSrc = getMemberDesktopImage(m);
              const mobileSrc = getMemberMobileImage(m);
              const isActive = activeIndex === i;

              return (
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${m?.name || "Band Member"}`}
                  key={i}
                  onClick={(e) => {
                    if (hasTriggeredRef.current) {
                      e.preventDefault();
                      return;
                    }
                    goToSlide(i);
                    setSelectedMemberForSheet(m as BandMemberFactSheet);
                    setIsFactSheetOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goToSlide(i);
                      setSelectedMemberForSheet(m as BandMemberFactSheet);
                      setIsFactSheetOpen(true);
                    }
                  }}
                  style={{
                    width: `${cardWidth}px`,
                    height: `${imageHeight}px`,
                    marginRight: i < displayMembers.length - 1 ? `${gap}px` : "0px",
                    isolation: "isolate"
                  }}
                  className="shrink-0 rounded-lg px-2 pt-0 pb-0 relative overflow-visible cursor-pointer flex flex-col justify-end origin-bottom border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ring-0 active:outline-none text-left">
                  <div className="relative z-10 flex flex-col justify-end h-full overflow-visible">
                    <div className="overflow-visible relative">

                      {/* Dynamic Sized Member Photo Cutout Container */}
                      <div
                        className="smooothy-img-container relative flex items-end justify-center overflow-visible transition-colors duration-150 origin-bottom w-full"
                        style={{
                          height: `${imageHeight}px`,
                          transform: `translateY(${imageOffsetY}px)`,
                        }}>
                        {/* WebGL Pixel Fireplace Shader Canvas behind Active Band Member */}
                        {isCanvasEnabled && Math.abs(activeIndex - i) <= 1 && (
                          <div
                            className="absolute inset-x-[-20%] bottom-[60px] md:bottom-[80px] top-[-10%] pointer-events-none z-[-1] overflow-hidden rounded-3xl transition-opacity duration-700 ease-out"
                            style={{ opacity: isActive ? canvasOpacity / 100 : 0 }}
                          >
                            <PixelFireplaceCanvas
                              className="block pointer-events-none w-full h-full object-cover"
                              flameSpeed={flameSpeed}
                              flameHeight={flameHeight}
                              sparkDensity={sparkDensity}
                              sparkScale={sparkScale}
                              paletteTheme={paletteTheme}
                              useCustomColors={useCustomColors}
                              colorBaseHex={colorBaseHex}
                              colorMidHex={colorMidHex}
                              colorCoreHex={colorCoreHex}
                              colorSparkHex={colorSparkHex}
                            />
                          </div>
                        )}
                        {/* Radiant Gradient Glow behind Active Image Cutout */}
                        <div
                          className="absolute inset-x-[-15%] top-[-10%] bottom-[40px] pointer-events-none z-[0] rounded-full blur-2xl md:blur-3xl transition-opacity duration-300 ease-out origin-center mix-blend-screen"
                          style={{
                            background: getGlowGradient(),
                            opacity: isActive ? glowOpacity / 100 : 0,
                            transform: isActive ? "scale(1)" : "scale(0.75)",
                          }}
                        />
                        <picture className="w-full h-full flex items-end justify-center relative z-10">
                          <source media="(max-width: 767px)" srcSet={mobileSrc} />
                          <source media="(min-width: 768px)" srcSet={desktopSrc} />
                          <Image
                            src={imageSrc}
                            alt={m?.name || "Member Photo"}
                            width={1200}
                            height={1600}
                            quality={100}
                            unoptimized
                            loading="lazy"
                            draggable={false}
                            className="smooothy-img w-full h-full object-contain object-bottom pointer-events-none select-none origin-bottom relative z-0"
                            style={{
                              transform: `scale(${imageScale})`,
                              opacity: 1,
                            }}
                          />
                          {/* Glare Masked strictly to Non-Transparent Pixels of the Member Photo Cutout */}
                          <div
                            key={`glare-${i}-${isActive ? "active" : "inactive"}`}
                            className={`glarer-mask absolute inset-0 pointer-events-none z-20 overflow-hidden glarer ${isActive ? "active-glare" : "" }`}
                            style={{
                              maskImage: `url(${imageSrc})`,
                              WebkitMaskImage: `url(${imageSrc})`,
                              WebkitMaskSize: "contain",
                              maskSize: "contain",
                              WebkitMaskPosition: "bottom center",
                              maskPosition: "bottom center",
                              WebkitMaskRepeat: "no-repeat",
                              maskRepeat: "no-repeat",
                              transform: `scale(1.41) translate(0px, -10px)`,
                              transformOrigin: "bottom center",
                            }}
                          />
                        </picture>

                        {/* Orb Button Glass Stack — Toggle Bio Fact Sheet (Active Member Only) */}
                        {/* {isActive && (
                          <div className="btn-wrapper absolute top-2 right-2 md:top-4 md:right-4 z-0 text-[7.5px] md:text-[8.5px] transition-all duration-300 pointer-events-auto animate-orb-pop">
                            <button
                              type="button"
                              aria-label={isFactSheetOpen ? `Close bio details for ${m?.name || "Band Member"}` : `View bio details for ${m?.name || "Band Member"}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isFactSheetOpen) {
                                  setIsFactSheetOpen(false);
                                } else {
                                  goToSlide(i);
                                  setSelectedMemberForSheet(m as BandMemberFactSheet);
                                  setIsFactSheetOpen(true);
                                }
                              }}
                              className="orb-btn btn-violet"
                            >
                              {isFactSheetOpen ? (
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              ) : (
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                  <line x1="12" y1="4" x2="12" y2="20"></line>
                                  <line x1="4" y1="12" x2="20" y2="12"></line>
                                </svg>
                              )}
                            </button>
                          </div>
                        )} */}

                        {/* Bottom Gradient Fade Overlay for Mobile & Tablet */}
                      </div>

                      {/* Dynamic Member Info Overlay (z-30 - Pure White & Bright Purple Text with Live Control) */}
                      {textPos === "left" && (
                        <div
                          id="names"
                          className="absolute left-4 z-30 flex flex-col items-start text-left pointer-events-none max-w-[90%] transition-opacity duration-300"
                          style={{
                            bottom: `1px`,
                            opacity: activeIndex === i ? 1 : inactiveNameOpacity,
                            ...(textBackdropOpacity > 0 ? { backgroundColor: `rgba(0,0,0,${textBackdropOpacity / 100})`, padding: "8px 12px", borderRadius: "8px" } : {})
                          }}>
                          <h3 className="sm:bg-black/60 bg-black/40 pt-1 pr-2 pl-2" style={{ fontSize: computedNameFontSize }}>
                            {m?.name}
                          </h3>
                          <span className="sm:bg-black/60 bg-black/40 md:pb-1 pb-1 pt-1 pr-2 pl-2 text-[#c084fc] block font-bold" style={{ fontSize: computedRoleFontSize }}>
                            {m?.role}
                          </span>

                        </div>
                      )}

                      {textPos === "left-glass" && (
                        <div
                          className="absolute left-4 z-30 flex flex-col items-start text-left pointer-events-none max-w-[90%] bg-black/85 backdrop-blur-xl border border-white/10 px-4 py-3 transition-opacity duration-300"
                          style={{ bottom: `${textBottomOffset}px`, opacity: activeIndex === i ? 1 : inactiveNameOpacity }}>
                          <h3 className="" style={{ fontSize: computedNameFontSize }}>
                            {m?.name}
                          </h3>
                          <span className="text-[var(--color-accent)] block mt-0.5" style={{ fontSize: computedRoleFontSize }}>
                            {m?.role}
                          </span>
                        </div>
                      )}

                      {textPos === "left-accent" && (
                        <div
                          className="absolute left-4 z-30 flex flex-col items-start text-left pointer-events-none max-w-[90%] pl-0 py-1 transition-opacity duration-300"
                          style={{ bottom: `${textBottomOffset}px`, opacity: activeIndex === i ? 1 : inactiveNameOpacity }}>
                          <h3 className="drop-" style={{ fontSize: computedNameFontSize }}>
                            {m?.name}
                          </h3>
                          <span className="text-[var(--color-accent)] block drop- mt-0.5" style={{ fontSize: computedRoleFontSize }}>
                            {m?.role}
                          </span>
                        </div>
                      )}

                      {textPos === "center" && (
                        <div
                          className="absolute left-1/2 -translate-x-1/2 z-30 flex flex-col items-center text-center pointer-events-none w-full px-2 transition-opacity duration-300"
                          style={{
                            bottom: `${textBottomOffset}px`,
                            opacity: activeIndex === i ? 1 : inactiveNameOpacity,
                            ...(textBackdropOpacity > 0 ? { backgroundColor: `rgba(0,0,0,${textBackdropOpacity / 100})`, padding: "8px 12px" } : {})
                          }}>
                          <h3 className="" style={{ fontSize: computedNameFontSize }}>
                            {m?.name}
                          </h3>
                          <span className="text-[#c084fc] block drop-shadow-[0_2px_8px_rgba(0,0,0,1)] mt-0.5" style={{ fontSize: computedRoleFontSize }}>
                            {m?.role}
                          </span>
                        </div>
                      )}

                      {textPos === "center-glass" && (
                        <div
                          className="absolute left-1/2 -translate-x-1/2 z-30 flex flex-col items-center text-center pointer-events-none max-w-[90%] bg-black/85 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-lg transition-opacity duration-300"
                          style={{ bottom: `${textBottomOffset}px`, opacity: activeIndex === i ? 1 : inactiveNameOpacity }}>
                          <h3 className="" style={{ fontSize: computedNameFontSize }}>
                            {m?.name}
                          </h3>
                          <span className="text-[#c084fc] block mt-0.5" style={{ fontSize: computedRoleFontSize }}>
                            {m?.role}
                          </span>
                        </div>
                      )}

                      {textPos === "right" && (
                        <div
                          className="absolute right-4 z-30 flex flex-col items-end text-right pointer-events-none max-w-[90%] transition-opacity duration-300"
                          style={{
                            bottom: `${textBottomOffset}px`,
                            opacity: activeIndex === i ? 1 : inactiveNameOpacity,
                            ...(textBackdropOpacity > 0 ? { backgroundColor: `rgba(0,0,0,${textBackdropOpacity / 100})`, padding: "8px 12px", borderRadius: "8px" } : {})
                          }}>
                          <h3 className="drop-" style={{ fontSize: computedNameFontSize }}>
                            {m?.name}
                          </h3>
                          <span className="text-[var(--color-accent)] block drop- mt-0.5" style={{ fontSize: computedRoleFontSize }}>
                            {m?.role}
                          </span>
                        </div>
                      )}

                      {textPos === "right-glass" && (
                        <div
                          className="absolute right-4 z-30 flex flex-col items-end text-right pointer-events-none max-w-[90%] bg-black/85 backdrop-blur-xl border border-white/10 px-4 py-3 transition-opacity duration-300"
                          style={{ bottom: `${textBottomOffset}px`, opacity: activeIndex === i ? 1 : inactiveNameOpacity }}>
                          <h3 className="" style={{ fontSize: computedNameFontSize }}>
                            {m?.name}
                          </h3>
                          <span className="text-[var(--color-accent)] block mt-0.5" style={{ fontSize: computedRoleFontSize }}>
                            {m?.role}
                          </span>
                        </div>
                      )}

                      {textPos === "right-accent" && (
                        <div
                          className="absolute right-4 z-30 flex flex-col items-end text-right pointer-events-none max-w-[90%] border-r-2 border-[var(--color-accent)] pr-3 py-1 transition-opacity duration-300"
                          style={{ bottom: `${textBottomOffset}px`, opacity: activeIndex === i ? 1 : inactiveNameOpacity }}>
                          <h3 className="drop-" style={{ fontSize: computedNameFontSize }}>
                            {m?.name}
                          </h3>
                          <span className="text-[var(--color-accent)] block drop- mt-0.5" style={{ fontSize: computedRoleFontSize }}>
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
      </div>

      <MemberFactSheetDrawer
        isOpen={isFactSheetOpen}
        onClose={() => setIsFactSheetOpen(false)}
        member={selectedMemberForSheet}
        allMembers={displayMembers as BandMemberFactSheet[]}
        onSelectMember={(m) => {
          setSelectedMemberForSheet(m);
          const idx = displayMembers.findIndex((x) => x.name === m.name);
          if (idx !== -1) goToSlide(idx);
        }}
      />
    </section>
  );
}
