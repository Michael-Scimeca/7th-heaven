/* eslint-disable react-doctor/nextjs-no-client-fetch-for-server-data */
"use client";
/* oxlint-disable react-doctor/control-has-associated-label, react-doctor/label-has-associated-control, react-doctor/prefer-useReducer, react-doctor/no-high-complexity-react-function, react-doctor/js-flatmap-filter */
/* eslint-disable react-doctor/control-has-associated-label, react-doctor/label-has-associated-control, react-doctor/prefer-useReducer, react-doctor/no-high-complexity-react-function, react-doctor/js-flatmap-filter */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  X,
  Play,
  Plus,
  Video as VideoIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Smooothy, { damp } from "smooothy";
import SeventhButton from "./SeventhButton";
import GlassPlayButton from "./GlassPlayButton";
import { SectionBadge } from "./SectionBadge";
import { useMember } from "@/context/MemberContext";
import AddCmsButton from "./AddCmsButton";

const InlineYTPlayer = dynamic(() => import("./InlineYTPlayer"), {
  ssr: false,
});

function ShowcaseMedia({
  videoId,
  videoTitle,
  start,
  end,
}: {
  videoId: string;
  videoTitle: string;
  start: number;
  end: number;
  previewZoomPercent: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="smooothy-parallax-media absolute inset-0 h-full w-full transform-gpu overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&start=${start}&end=${end}&playsinline=1&enablejsapi=1&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1`}
          title={videoTitle}
          className="pointer-events-none absolute -top-[100%] -left-[100%] z-10 h-[300%] w-[300%] transform-gpu border-0 object-cover"
          allow="autoplay; encrypted-media"
        />
      ) : (
        <Image
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt={videoTitle}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="pointer-events-none transform-gpu object-cover"
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
    id: "88TOdJ24Re0",
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
  resize?: () => void;
  isDragging?: boolean;
}

function extractYouTubeId(urlOrId: string): string {
  const match = urlOrId.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
  );
  if (match && match[1]) return match[1];
  const clean = urlOrId.trim();
  if (clean.length === 11 && /^[\w-]+$/.test(clean)) return clean;
  return clean;
}

export default function HomeVideoShowcase({
  sanityContent,
}: {
  sanityContent?: any;
}) {
  const { member, isLoggedIn } = useMember();
  const isAdmin = Boolean(
    isLoggedIn &&
    (member?.role === "admin" ||
      member?.role === "crew" ||
      (member as any)?.isAdmin === true),
  );

  const [videos, setVideos] =
    useState<ShowcaseCategoryVideo[]>(CATEGORY_SHOWCASE);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<
    "smooothy" | "layout" | "motion" | "video" | "style" | "ui"
  >("smooothy");

  // Add Video Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState("Official Music Videos");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [newYear, setNewYear] = useState(() =>
    new Date().getFullYear().toString(),
  );
  const [newDuration, setNewDuration] = useState("3:30");
  const [newDesc, setNewDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const availableCategories = useMemo(() => {
    const defaults = [
      "Official Music Videos",
      "TV Appearances",
      "Full Concerts",
      "Cover Songs",
      "Songs In Movies & TV",
      "Cruise Videos",
      "College Shows",
      "Live Footage",
      "Medley's",
      "Misc. / Various",
      "Live Feeds",
    ];
    const fromVideos: string[] = [];
    for (let i = 0; i < videos.length; i++) {
      if (videos[i].category) fromVideos.push(videos[i].category);
    }
    return Array.from(
      new Set([...defaults, ...fromVideos, ...customCategories]),
    );
  }, [videos, customCategories]);

  // Hydrate live videos from Sanity
  useEffect(() => {
    fetch("/api/videos")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (
          data?.success &&
          Array.isArray(data.videos) &&
          data.videos.length > 0
        ) {
          const sanityItems: ShowcaseCategoryVideo[] = data.videos.map(
            (sv: any) => ({
              id: sv.youtubeId,
              title: sv.title,
              category: sv.category || "Official Music Videos",
              badges: [sv.category?.toUpperCase() || "FEATURED", "SANITY"],
              viewCount: "Sanity",
              year: sv.year || new Date().getFullYear(),
              duration: sv.duration || "3:30",
              previewStart: 0,
              previewEnd: 30,
            }),
          );

          setVideos((prev) => {
            const existingIds = new Set(sanityItems.map((v) => v.id));
            const remainingDefault = prev.filter((v) => !existingIds.has(v.id));
            return [...sanityItems, ...remainingDefault];
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleAddVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const parsedId = extractYouTubeId(newUrl);
    if (!parsedId || parsedId.length !== 11) {
      setModalError(
        "Please enter a valid 11-character YouTube video URL or ID.",
      );
      return;
    }

    const targetCategory = (
      isCustomCategory ? customCategoryInput : newCategory
    ).trim();
    if (!targetCategory) {
      setModalError("Please select or enter a video category.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          youtubeUrl: parsedId,
          category: targetCategory,
          year: parseInt(newYear, 10) || new Date().getFullYear(),
          duration: newDuration.trim() || "3:30",
          description: newDesc.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const addedVid: ShowcaseCategoryVideo = {
          id: data.video.id,
          title: data.video.title,
          category: data.video.category,
          badges: [data.video.category.toUpperCase(), "NEW"],
          viewCount: "New",
          year: data.video.year,
          duration: data.video.duration,
          previewStart: 0,
          previewEnd: 30,
        };

        if (isCustomCategory && customCategoryInput.trim()) {
          setCustomCategories((prev) =>
            Array.from(new Set([...prev, customCategoryInput.trim()])),
          );
        }

        setVideos((prev) => [
          addedVid,
          ...prev.filter((v) => v.id !== addedVid.id),
        ]);
        setIsAddModalOpen(false);
        setIsCustomCategory(false);
        setCustomCategoryInput("");
        setNewTitle("");
        setNewUrl("");
        setNewDesc("");
        setToastMessage(
          `🎉 Video "${addedVid.title}" successfully added under "${addedVid.category}"!`,
        );
        setTimeout(() => setToastMessage(null), 4500);
      } else {
        setModalError(data.error || "Failed to save video to Sanity.");
      }
    } catch {
      setModalError("Network error. Failed to save video.");
    } finally {
      setSubmitting(false);
    }
  };

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
  const [isParallaxEnabled, setIsParallaxEnabled] = useState<boolean>(false);
  const [isSpeedBouncyEnabled, setIsSpeedBouncyEnabled] =
    useState<boolean>(true);
  const lerpedSpeedRef = useRef<number>(0);

  // ── ALL 16 OFFICIAL SMOOOTHY ENGINE CONFIGURATION OPTIONS ──
  const [smooothyInfinite, setSmooothyInfinite] = useState<boolean>(true);
  const [smooothySnap, setSmooothySnap] = useState<boolean>(false); // false = Free Mode continuous parallax scrolling
  const [smooothyVariableWidth, setSmooothyVariableWidth] =
    useState<boolean>(false);
  const [smooothyVertical, setSmooothyVertical] = useState<boolean>(false);
  const [smooothyScrollInput, setSmooothyScrollInput] =
    useState<boolean>(false);
  const [smooothyDragSensitivity, setSmooothyDragSensitivity] =
    useState<number>(0.005);
  const [smooothyLerpFactor, setSmooothyLerpFactor] = useState<number>(0.3);
  const [smooothyScrollSensitivity, setSmooothyScrollSensitivity] =
    useState<number>(0);
  const [smooothySnapStrength, setSmooothySnapStrength] = useState<number>(0.0);
  const [smooothySpeedDecay, setSmooothySpeedDecay] = useState<number>(0.85);
  const [smooothyBounceLimit, setSmooothyBounceLimit] = useState<number>(2.5);
  const [smooothyOffsetPreset, setSmooothyOffsetPreset] = useState<
    "standard" | "center" | "full"
  >("standard");
  const [smooothyVirtualScroll, setSmooothyVirtualScroll] =
    useState<boolean>(false);

  // Callback event logs (onSlideChange, onResize, onUpdate)
  const [lastSlideChangeEvent, setLastSlideChangeEvent] =
    useState<string>("Index #0 Active");
  const [lastResizeEvent, setLastResizeEvent] =
    useState<string>("Observer Ready");
  const [lastUpdateEvent, setLastUpdateEvent] =
    useState<string>("60 FPS Engine");

  // ── ULTIMATE SLIDER CONFIGURATION ENGINE STATE ──
  // 1. Layout & Grid Settings
  const [cardsVisible, setCardsVisible] = useState<number>(3);
  const [aspectRatio, setAspectRatio] = useState<string>(
    "h-[300px] sm:h-[400px] md:h-[500px]",
  );
  const [cardGap, setCardGap] = useState<string>("gap-6");
  const [borderRadius, setBorderRadius] = useState<string>("");
  const [borderStyle, setBorderStyle] = useState<string>(
    "border border-white/10",
  );

  // 2. Motion & Auto-Advance
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState<boolean>(false);
  const [autoAdvanceSpeed, setAutoAdvanceSpeed] = useState<number>(8); // seconds
  const [autoAdvanceDirection, setAutoAdvanceDirection] = useState<
    "forward" | "reverse"
  >("forward");
  const [transitionSpeed, setTransitionSpeed] = useState<number>(200); // ms
  const [hoverAnimation, setHoverAnimation] = useState<string>(
    "transition-transform duration-300 hover:-translate-y-2",
  );

  // 3. YouTube Preview Engine
  const [previewStartSec, setPreviewStartSec] = useState<number>(0);
  const [previewDurationSec, setPreviewDurationSec] = useState<number>(30);
  const [previewZoomPercent, setPreviewZoomPercent] = useState<number>(130); // %
  const [playButtonVisibility, setPlayButtonVisibility] = useState<
    "hover" | "always" | "hidden"
  >("hover");

  // 4. Styling, Colors & Buttons
  const [playButtonColor, setPlayButtonColor] = useState<string>(
    "bg-purple-600 hover:bg-purple-500",
  );
  const [playButtonSize, setPlayButtonSize] = useState<string>("w-14 h-14");
  const [titleFontSize, setTitleFontSize] = useState<string>("text-[18px]");
  const [sectionTheme, setSectionTheme] = useState<string>("");

  // 5. Navigation & UI Elements
  const [showBadges, setShowBadges] = useState<boolean>(true);
  const [showMetadata, setShowMetadata] = useState<boolean>(true);
  const [showBottomCategoryTabs, setShowBottomCategoryTabs] =
    useState<boolean>(true);

  const startLoopRef = useRef<(() => void) | undefined>(undefined);
  const dragDistanceRef = useRef(0);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

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
      ([entry]) => {
        isInViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          startLoopRef.current?.();
          try {
            smooothyInstanceRef.current?.resize?.();
          } catch {}
        }
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const totalVideos = videos.length;

  // Initialize and dynamically update Smooothy Instance live with ALL 16 Smooothy API options
  useEffect(() => {
    if (!trackRef.current) return;

    try {
      smooothyInstanceRef.current?.destroy?.();
    } catch {}

    try {
      const SmooothyClass = Smooothy as unknown as new (
        elem: HTMLElement,
        options: Record<string, unknown>,
      ) => SmooothyInstance;

      const instance = new SmooothyClass(trackRef.current, {
        infinite: smooothyInfinite,
        snap: smooothySnap,
        variableWidth: smooothyVariableWidth,
        vertical: smooothyVertical,
        scrollInput: false,
        dragSensitivity: smooothyDragSensitivity,
        lerpFactor: smooothyLerpFactor,
        scrollSensitivity: 0,
        snapStrength: smooothySnapStrength,
        speedDecay: smooothySpeedDecay,
        bounceLimit: smooothyBounceLimit,
        virtualScroll: smooothyVirtualScroll ? { enabled: true } : false,
        setOffset:
          smooothyOffsetPreset === "center"
            ? ({
                itemWidth,
                wrapperWidth,
              }: {
                itemWidth: number;
                wrapperWidth: number;
              }) => wrapperWidth / 2 - itemWidth / 2
            : smooothyOffsetPreset === "full"
              ? ({ itemWidth }: { itemWidth: number }) => itemWidth
              : () => 0,
        onSlideChange: (idx: number) => {
          const safeIndex = ((idx % totalVideos) + totalVideos) % totalVideos;
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

          lerpedSpeedRef.current = damp(lerpedSpeedRef.current, spd, 5, dt);

          if (trackRef.current) {
            // Keep innerMedia stationary within rounded overflow-hidden container
          }
        },
      });

      smooothyInstanceRef.current = instance;

      // Official Smooothy animation frame update loop — paused while the
      // carousel is scrolled out of view (see isInViewRef above).
      let animId: number | null = null;
      const renderLoop = () => {
        if (!isInViewRef.current || document.hidden) {
          animId = null;
          return;
        }
        if (smooothyInstanceRef.current?.update) {
          smooothyInstanceRef.current.update();
        }
        // eslint-disable-next-line react-doctor/three-prefer-set-animation-loop
        animId = requestAnimationFrame(renderLoop);
      };

      const startLoopIfNeeded = () => {
        if (isInViewRef.current && !document.hidden && !animId) {
          // eslint-disable-next-line react-doctor/three-prefer-set-animation-loop
          animId = requestAnimationFrame(renderLoop);
        }
      };

      startLoopRef.current = startLoopIfNeeded;

      startLoopIfNeeded();

      const onVisChange = () => {
        if (!document.hidden && isInViewRef.current) startLoopIfNeeded();
      };
      document.addEventListener("visibilitychange", onVisChange);

      return () => {
        document.removeEventListener("visibilitychange", onVisChange);
        if (animId) cancelAnimationFrame(animId);
        try {
          smooothyInstanceRef.current?.destroy?.();
        } catch {}
      };
    } catch (err) {
      console.error("Smooothy initialization error:", err);
    }

    return () => {
      try {
        smooothyInstanceRef.current?.destroy?.();
      } catch {}
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

  const handleGoToIndex = useCallback(
    (idx: number) => {
      if (smooothyInstanceRef.current?.goToIndex) {
        smooothyInstanceRef.current.goToIndex(idx);
      } else if (trackRef.current) {
        const slideWidth = trackRef.current.clientWidth / cardsVisible;
        trackRef.current.scrollTo({
          left: idx * slideWidth,
          behavior: "smooth",
        });
      } else {
        setStartIndex(idx);
      }
    },
    [cardsVisible],
  );

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
    setSmooothyLerpFactor(0.3);
    setSmooothyScrollSensitivity(1.0);
    setSmooothySnapStrength(0.0);
    setSmooothySpeedDecay(0.85);
    setSmooothyBounceLimit(2.5);
    setSmooothyOffsetPreset("standard");
    setSmooothyVirtualScroll(false);

    setIsParallaxEnabled(true);
    setIsSpeedBouncyEnabled(true);

    // General defaults
    setCardsVisible(3);
    setAspectRatio("h-[300px] sm:h-[400px] md:h-[500px]");
    setCardGap("gap-6");
    setBorderRadius("");
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
    if (windowWidth < 640) return 1;
    if (windowWidth <= 1024) return 2;
    if (windowWidth <= 1200) return 3;
    return cardsVisible;
  }, [windowWidth, cardsVisible]);

  const gapPx = getGapPx();

  return (
    <section
      ref={sectionRef}
      id="video-slider"
      className="py-section-fluid relative w-full overflow-hidden border-b border-white/10 select-none"
    >
      {/* Section Header inside site-container */}
      <div className="site-container relative z-10">
        <div className="mb-6 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <h2 className="mb-2.5">
              {sanityContent?.videoShowcaseTitle || "Video & Live Media"}
            </h2>
            <p>
              {sanityContent?.videoShowcaseSubtitle ||
                "Explore 7th Heaven's live concert highlights, festival performances, television broadcasts, and official music videos in smooth interactive parallax."}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 self-start sm:self-auto">
            {isAdmin && (
              <AddCmsButton
                label="ADD VIDEO"
                onClick={() => setIsAddModalOpen(true)}
                className="ml-2"
              />
            )}
          </div>
        </div>
      </div>

      {/* Pure Smooothy Engine DOM Slider Track (Edge-to-Edge) */}
      <div className="group/track relative w-full">
        {/* Floating Side Arrow Controls */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Video Slide"
          className="absolute top-1/2 left-4 z-30 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/70 opacity-0 shadow-2xl backdrop-blur-md group-hover/track:opacity-100 hover:scale-110 hover:bg-purple-600 active:scale-95"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Video Slide"
          className="absolute top-1/2 right-4 z-30 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/70 opacity-0 shadow-2xl backdrop-blur-md group-hover/track:opacity-100 hover:scale-110 hover:bg-purple-600 active:scale-95"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div
          ref={trackRef}
          data-slider="true"
          data-vertical={smooothyVertical}
          className={`w-full cursor-grab overflow-hidden select-none active:cursor-grabbing ${smooothyVertical ? "flex h-[750px] flex-col" : "flex flex-nowrap"}`}
          style={{
            touchAction: "pan-y",
            ...(smooothyVertical
              ? {}
              : {
                  marginLeft: `-${gapPx / 2}px`,
                  marginRight: `-${gapPx / 2}px`,
                  width: `calc(100% + ${gapPx}px)`,
                }),
          }}
        >
          {videos.map((video, idx) => {
            const start = video.previewStart ?? previewStartSec;
            const end = start + previewDurationSec;

            return (
              <article
                key={video.id + idx}
                className="smooothy-slide group z-10 flex shrink-0 transform-gpu flex-col"
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
                {/* Video Card Container — Whole Card Clickable */}
                <div
                  style={{
                    WebkitMaskImage: "-webkit-radial-gradient(white, black)",
                    isolation: "isolate",
                  }}
                  onPointerDown={(e) => {
                    pointerStartRef.current = { x: e.clientX, y: e.clientY };
                    dragDistanceRef.current = 0;
                  }}
                  onPointerMove={(e) => {
                    if (pointerStartRef.current) {
                      const dx = e.clientX - pointerStartRef.current.x;
                      const dy = e.clientY - pointerStartRef.current.y;
                      dragDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
                    }
                  }}
                  onPointerUp={() => {
                    pointerStartRef.current = null;
                  }}
                  onClick={() => {
                    if (
                      dragDistanceRef.current > 8 ||
                      smooothyInstanceRef.current?.isDragging
                    ) {
                      return;
                    }
                    if (playingVideoId !== video.id) {
                      setPlayingVideoId(video.id);
                    }
                  }}
                  className={`relative h-[300px] w-full sm:h-[400px] md:h-[500px] ${borderRadius} cursor-pointer overflow-hidden bg-black/60 ${playingVideoId === video.id ? "shadow-[0_0_35px_rgba(217,70,239,0.6)] ring-2 ring-purple-400" : "group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]"}`}
                >
                  {playingVideoId === video.id ? (
                    <div className="relative z-30 h-full w-full bg-black">
                      <InlineYTPlayer
                        videoId={video.id}
                        title={video.title}
                        onClose={() => setPlayingVideoId(null)}
                      />
                    </div>
                  ) : (
                    <>
                      {/* Transparent Drag Capture Layer */}
                      <div className="absolute inset-0 z-10" />

                      {/* YouTube On-Demand Autoplay Preview Frame */}
                      <ShowcaseMedia
                        videoId={video.id}
                        videoTitle={video.title}
                        start={start}
                        end={end}
                        previewZoomPercent={previewZoomPercent}
                      />

                      {/* Gradient shadow overlay for legibility */}
                      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/30 to-black/20 group-hover:opacity-0" />

                      {/* Interactive Play Button Overlay (Centered in Middle of Video Card) */}
                      {playButtonVisibility !== "hidden" && (
                        <div
                          className={`media-hover-overlay z-20 group-hover:opacity-0 ${playButtonVisibility === "always" ? "is-always-visible" : ""}`}
                        >
                          <GlassPlayButton
                            size="lg"
                            aria-label={`Play full video for ${video.title}`}
                            title="Play Full Video"
                            className="pointer-events-auto"
                          />
                        </div>
                      )}

                      {/* Bottom Image Overlay: Small Category Tag Above + Large Title Over Image */}
                      <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 flex flex-col items-center justify-end p-5 text-center group-hover:opacity-0 sm:p-6 md:p-8">
                        {showBadges && (
                          <div className="mb-2.5 flex flex-wrap items-center justify-center gap-2">
                            {video.badges.map((badge, bIdx) => (
                              <SectionBadge
                                key={badge + bIdx}
                                label={badge}
                                className="mb-1"
                              />
                            ))}
                          </div>
                        )}

                        <h3 className="sm: line-clamp-2 text-base font-black md:text-xl">
                          {video.title}
                        </h3>
                      </div>
                    </>
                  )}
                </div>

                {/* Below Card Metadata */}
                {showMetadata && (
                  <div className="pointer-events-none flex w-full items-center justify-between gap-2 px-0.5 pt-2.5">
                    <span className="shrink-0">
                      Views <strong className="ml-1">{video.viewCount}</strong>
                    </span>

                    <span className="shrink-0">
                      Year <strong className="ml-1">{video.year}</strong>
                    </span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="animate-fade-in fixed right-6 bottom-6 z-[99999] flex items-center gap-3 rounded-xl border border-purple-400/50 bg-gradient-to-r from-purple-900/90 to-pink-900/90 px-6 py-3.5 shadow-2xl backdrop-blur-md">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Add Video Modal */}
      {isAddModalOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="animate-fade-in fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-purple-500/30 bg-neutral-900 p-6 shadow-2xl sm:p-8">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 cursor-pointer rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/40 bg-purple-600/20 text-purple-400">
                  <VideoIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl">Add Video to Sanity</h3>
                  <p className="/70">
                    Publish a new YouTube video directly to the Sanity database.
                  </p>
                </div>
              </div>

              {modalError && (
                <div className="mb-6 rounded-lg border border-red-500/50 bg-red-900/40 p-3 text-red-200">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleAddVideoSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="sanity-video-title"
                    className="mb-1.5 block text-purple-200/80"
                  >
                    Video Title *
                  </label>
                  <input
                    id="sanity-video-title"
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. 7th Heaven - Live at Summerfest"
                    className="focus-ring w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="sanity-video-url"
                    className="mb-1.5 block text-purple-200/80"
                  >
                    YouTube URL or Video ID *
                  </label>
                  <input
                    id="sanity-video-url"
                    type="text"
                    required
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="e.g. https://www.youtube.com/watch?v=BzHUNTZ66zY or BzHUNTZ66zY"
                    className="focus-ring w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 placeholder-gray-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="sanity-video-category"
                        className="block text-purple-200/80"
                      >
                        Category *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(!isCustomCategory);
                          if (!isCustomCategory) {
                            setCustomCategoryInput("");
                          }
                        }}
                        className="hover: cursor-pointer text-purple-400"
                      >
                        {isCustomCategory ? "← Select List" : "+ New Category"}
                      </button>
                    </div>

                    {isCustomCategory ? (
                      <input
                        id="sanity-video-category"
                        type="text"
                        required
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        placeholder="e.g. Acoustic Sessions"
                        className="focus-ring w-full rounded-xl border border-purple-500/50 bg-black/50 px-4 py-2.5 placeholder-gray-500"
                      />
                    ) : (
                      <select
                        id="sanity-video-category"
                        value={newCategory}
                        onChange={(e) => {
                          if (e.target.value === "__CUSTOM__") {
                            setIsCustomCategory(true);
                            setCustomCategoryInput("");
                          } else {
                            setNewCategory(e.target.value);
                          }
                        }}
                        className="focus-ring w-full cursor-pointer rounded-xl border border-white/15 bg-black/50 px-3 py-2.5"
                      >
                        {availableCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        <option value="__CUSTOM__">
                          ✨ + Add Custom Category...
                        </option>
                      </select>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="sanity-video-year"
                      className="mb-1.5 block text-purple-200/80"
                    >
                      Year
                    </label>
                    <input
                      id="sanity-video-year"
                      type="number"
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      className="focus-ring w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="sanity-video-duration"
                      className="mb-1.5 block text-purple-200/80"
                    >
                      Duration
                    </label>
                    <input
                      id="sanity-video-duration"
                      type="text"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      placeholder="3:30"
                      className="focus-ring w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="sanity-video-description"
                    className="mb-1.5 block text-purple-200/80"
                  >
                    Description
                  </label>
                  <textarea
                    id="sanity-video-description"
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Optional description or concert highlights..."
                    className="focus-ring w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 placeholder-gray-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="cursor-pointer rounded-xl bg-white/10 px-5 py-2.5 hover:bg-white/15"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="cursor-pointer rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:from-purple-500 hover:to-pink-500 disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "+ SAVE VIDEO TO SANITY"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
