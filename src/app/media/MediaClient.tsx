/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";

import Image from "next/image";
import staticVideoCategories from "../../../public/data/videos.json";
import availablePreviewsList from "../../../public/data/available-previews.json";

const AVAILABLE_PREVIEWS = new Set<string>(availablePreviewsList as string[]);

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import {
  X,
  Video as VideoIcon,
  CheckCircle2,
  Check,
  Filter,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useMember } from "@/context/MemberContext";
import PageHero from "@/components/PageHero";
import AddCmsButton from "@/components/AddCmsButton";
import SegmentedTabs from "@/components/SegmentedTabs";
import CustomDropdown from "@/components/CustomDropdown";
import { SearchInput } from "@/components/SearchInput";
import { SectionHeader } from "@/components/SectionHeader";
import { Toggle } from "@/components/Toggle";
import GlowInput, { GlowSelect, GlowTextarea } from "@/components/GlowInput";
import { useScrollLock } from "@/lib/useScrollLock";

const CustomVideoPlayer = dynamic(
  () => import("@/components/CustomVideoPlayer"),
  { ssr: false },
);
const AudioPlayer = dynamic(() => import("@/components/AudioPlayer"), {
  ssr: false,
});

interface Video {
  id: string;
  title: string;
  year: number;
  duration?: string;
  description?: string;
  viewCount?: string;
  category?: string;
}

interface VideoCategory {
  category: string;
  videos: Video[];
}

interface CardVariant {
  aspectClass: string;
}

export type MediaColumnItem =
  | {
    type: "video";
    video: Video;
    aspectClass: string;
    widthClass: string;
    alignClass: string;
    marginClass: string;
    offsetClass: string;
    key: string;
    priority: boolean;
  }
  | {
    type: "spacer";
    heightClass: string;
    key: string;
  };

// Organic varied aspect-ratios matching high-fashion editorial collage / House of Yellow
const ORGANIC_ASPECTS = [
  "aspect-[16/9]",    // Standard widescreen
  "aspect-[4/3]",     // Vintage broadcast / classic CRT
  "aspect-[16/10]",   // Cinematic golden
  "aspect-square",    // Album square
  "aspect-[4/5]",     // Tall editorial portrait
  "aspect-[21/9]",    // Cinematic ultra-wide letterbox
  "aspect-[3/4]",     // Subtle vertical frame
  "aspect-[3/2]",     // Classic 35mm photography
  "aspect-[1.18/1]",  // Soft square
  "aspect-[1.85/1]",  // Flat widescreen
];

// Varied card widths, alignments & horizontal drift to shatter the rigid column grid
const ORGANIC_LAYOUTS = [
  { width: "w-full", align: "self-stretch", offset: "translate-x-0" },
  { width: "w-[94%] sm:w-[92%]", align: "self-start", offset: "md:translate-x-1" },
  { width: "w-[92%] sm:w-[90%]", align: "self-end", offset: "md:-translate-x-1" },
  { width: "w-[88%] sm:w-[86%]", align: "self-center", offset: "translate-x-0" },
  { width: "w-full", align: "self-stretch", offset: "translate-x-0" },
  { width: "w-[96%] sm:w-[94%]", align: "self-start", offset: "md:translate-x-2" },
  { width: "w-[90%] sm:w-[88%]", align: "self-end", offset: "md:-translate-x-2" },
  { width: "w-[95%] sm:w-[92%]", align: "self-center", offset: "translate-x-0" },
  { width: "w-[86%] sm:w-[84%]", align: "self-start", offset: "md:translate-x-3" },
  { width: "w-full", align: "self-stretch", offset: "translate-x-0" },
];

// Dynamic vertical rhythm: varied margin-bottom to create artistic syncopation
const ORGANIC_MARGINS = [
  "mb-4 md:mb-6",
  "mb-8 md:mb-12",
  "mb-12 md:mb-18",
  "mb-6 md:mb-10",
  "mb-16 md:mb-24",
  "mb-4 md:mb-8",
  "mb-10 md:mb-14",
  "mb-14 md:mb-20",
];

// Dynamic airy pause heights
const AIRY_SPACER_HEIGHTS = [
  "h-16 md:h-24",
  "h-24 md:h-36",
  "h-14 md:h-20",
  "h-32 md:h-48",
  "h-20 md:h-30",
];

const COLUMN_TOP_STAGGERS = [
  "pt-0",
  "pt-14 md:pt-24 lg:pt-32",
  "pt-6 md:pt-10 lg:pt-14",
  "pt-20 md:pt-36 lg:pt-48",
];

// Deterministic seed hash from string so SSR and client always produce identical layout
function getDeterministicHash(str: string, salt: number = 0): number {
  let hash = 0;
  const combined = `${str}_${salt}`;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash + combined.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getOrganicItemStyle(videoId: string, index: number) {
  const hash = getDeterministicHash(videoId, index);
  const aspectClass = ORGANIC_ASPECTS[hash % ORGANIC_ASPECTS.length];
  const layout = ORGANIC_LAYOUTS[(hash >> 2) % ORGANIC_LAYOUTS.length];
  const marginClass = ORGANIC_MARGINS[(hash >> 4) % ORGANIC_MARGINS.length];

  // Rough aspect ratio multipliers for height estimation
  let ratio = 0.5625; // 16/9
  if (aspectClass.includes("4/3")) ratio = 0.75;
  else if (aspectClass.includes("16/10")) ratio = 0.625;
  else if (aspectClass.includes("square")) ratio = 1.0;
  else if (aspectClass.includes("4/5")) ratio = 1.25;
  else if (aspectClass.includes("21/9")) ratio = 0.428;
  else if (aspectClass.includes("3/4")) ratio = 1.333;
  else if (aspectClass.includes("3/2")) ratio = 0.667;
  else if (aspectClass.includes("1.18/1")) ratio = 0.847;
  else if (aspectClass.includes("1.85/1")) ratio = 0.54;

  return {
    aspectClass,
    widthClass: layout.width,
    alignClass: layout.align,
    offsetClass: layout.offset,
    marginClass,
    ratio,
  };
}

function getTargetColumnCount(width: number): number {
  if (width >= 2000) return 4;
  if (width >= 1380) return 3;
  if (width >= 640) return 2;
  return 1;
}

interface CardVideoEmbedProps {
  videoId: string;
  title: string;
  aspectClass: string;
  isHovered?: boolean;
  priority?: boolean;
}

function CardVideoEmbed({
  videoId,
  title,
  aspectClass,
  isHovered,
  priority = false,
}: CardVideoEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(priority || Boolean(isHovered));
  const [isLoaded, setIsLoaded] = useState(false);
  const bufferTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (inView) return;

    if (isHovered) {
      setInView(true);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "400px 0px",
      },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [isHovered, inView]);

  const handleIframeLoad = () => {
    if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
    // YouTube takes ~1.2s to seek to 20s and buffer the first video frame.
    // We hold opacity-0 while seeking/buffering so the crisp thumbnail stays visible
    // and NO black screen/spinner is ever exposed to the user.
    bufferTimerRef.current = setTimeout(() => {
      setIsLoaded(true);
      if (priority && typeof window !== "undefined") {
        (window as any).__7hMediaVideosReady = true;
        window.dispatchEvent(new CustomEvent("7h-media-videos-ready"));
      }
    }, priority ? 600 : 1300);
  };

  let sizeClasses = "w-[140%] h-[140%] min-w-[140%] min-h-[140%]";
  if (
    aspectClass.includes("4/5") ||
    aspectClass.includes("3/4") ||
    aspectClass.includes("3/4.2")
  ) {
    sizeClasses = "w-[250%] h-[140%] min-w-[250%] min-h-[140%]";
  } else if (aspectClass.includes("square")) {
    sizeClasses = "w-[195%] h-[140%] min-w-[195%] min-h-[140%]";
  } else if (aspectClass.includes("1.18/1")) {
    sizeClasses = "w-[185%] h-[140%] min-w-[185%] min-h-[140%]";
  } else if (aspectClass.includes("4/3")) {
    sizeClasses = "w-[160%] h-[140%] min-w-[160%] min-h-[140%]";
  } else if (aspectClass.includes("3/2")) {
    sizeClasses = "w-[150%] h-[140%] min-w-[150%] min-h-[140%]";
  } else if (aspectClass.includes("21/9")) {
    sizeClasses = "w-[140%] h-[165%] min-w-[140%] min-h-[165%]";
  } else if (aspectClass.includes("1.85/1")) {
    sizeClasses = "w-[140%] h-[145%] min-w-[140%] min-h-[145%]";
  }

  const hasLocalPreview = AVAILABLE_PREVIEWS.has(videoId);

  // 5-second lightweight loop playing 20 seconds in (20s to 25s) to capture song's energy
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}&start=20&end=25&playsinline=1&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&vq=medium`;

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 z-10 overflow-hidden transition-opacity duration-700 ease-out ${inView && isLoaded ? "opacity-100" : "opacity-0"
        }`}
    >
      {inView && hasLocalPreview ? (
        <video
          src={`/movie/previews/${videoId}.mp4`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => {
            setIsLoaded(true);
            if (priority && typeof window !== "undefined") {
              (window as any).__7hMediaVideosReady = true;
              window.dispatchEvent(new CustomEvent("7h-media-videos-ready"));
            }
          }}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      ) : inView ? (
        <iframe
          src={embedUrl}
          title={title}
          loading="eager"
          onLoad={handleIframeLoad}
          className={`pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-0 transform-gpu ${sizeClasses}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; compute-pressure"
        />
      ) : null}
    </div>
  );
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

export default function MediaClient({
  sanityContent,
}: {
  sanityContent?: any;
}) {
  const { member, isLoggedIn } = useMember();
  const isAdmin = Boolean(
    isLoggedIn &&
    (member?.role === "admin" || member?.role === "crew"),
  );

  const mounted = useSyncExternalStore(
    () => () => { },
    () => true,
    () => false,
  );

  const [categories, setCategories] = useState<VideoCategory[]>(
    staticVideoCategories as VideoCategory[],
  );
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [airyLayout, setAiryLayout] = useState(true);

  // Category responsive dropdown state (when tabs start getting cut off)
  const [isCategoryCutOff, setIsCategoryCutOff] = useState(false);
  const categoryContainerRef = useRef<HTMLDivElement>(null);
  const tabsMeasureRef = useRef<HTMLDivElement>(null);
  const requiredTabsWidthRef = useRef<number>(0);

  // Add video modal state (for Sanity CMS admins)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState("OFFICIAL MUSIC VIDEOS");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [newYear, setNewYear] = useState<string>(
    String(new Date().getFullYear()),
  );
  const [newDesc, setNewDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const projectsContainerRef = useRef<HTMLElement>(null);

  // Fixed initial column count to match SSR (3 columns) and prevent hydration mismatch.
  // The actual viewport measurement is applied on client mount in useEffect below.
  const [columnCount, setColumnCount] = useState<number>(3);

  useEffect(() => {
    const updateCols = () => {
      const next = getTargetColumnCount(window.innerWidth);
      setColumnCount((prev) => (prev !== next ? next : prev));
    };
    updateCols();
    window.addEventListener("resize", updateCols, { passive: true });
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  useScrollLock(Boolean(playingVideo || isAddModalOpen));

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (playingVideo) setPlayingVideo(null);
        if (isAddModalOpen) setIsAddModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playingVideo, isAddModalOpen]);

  // Fetch updated videos from Sanity and localStorage
  const fetchCategories = useCallback(async () => {
    try {
      const r = await fetch("/data/videos.json");
      let baseCategories: VideoCategory[] = [];
      if (r.ok) {
        baseCategories = await r.json();
      }

      try {
        const sanityRes = await fetch("/api/videos");
        if (sanityRes.ok) {
          const { videos: sanityVids } = await sanityRes.json();
          if (Array.isArray(sanityVids) && sanityVids.length > 0) {
            sanityVids.forEach((sv: any) => {
              const targetCat = baseCategories.find(
                (c) => c.category.toLowerCase() === sv.category?.toLowerCase(),
              );
              const formattedVideo: Video = {
                id: sv.youtubeId,
                title: sv.title,
                year: sv.year || new Date().getFullYear(),
                duration: sv.duration || "3:30",
                description: sv.description || "",
                category: sv.category,
              };
              if (targetCat) {
                if (!targetCat.videos.some((v) => v.id === formattedVideo.id)) {
                  targetCat.videos.unshift(formattedVideo);
                }
              } else {
                baseCategories.push({
                  category: sv.category || "Misc. / Various",
                  videos: [formattedVideo],
                });
              }
            });
            setCategories(baseCategories);
          }
        }
      } catch { }
    } catch { }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Flatten and organically interleave all videos across categories for an eclectic mix in ALL mode
  const allVideos = useMemo(() => {
    const list: Video[] = [];
    const seen = new Set<string>();

    // Prepare queues per category
    const categoryQueues = categories.map((cat) =>
      cat.videos.map((v) => ({ ...v, category: v.category || cat.category }))
    );

    let hasRemaining = true;
    let round = 0;

    while (hasRemaining) {
      hasRemaining = false;
      for (const queue of categoryQueues) {
        if (round < queue.length) {
          const v = queue[round];
          if (!seen.has(v.id)) {
            seen.add(v.id);
            list.push(v);
          }
          hasRemaining = true;
        }
      }
      round++;
    }

    return list;
  }, [categories]);

  // Set of video IDs matching the active filter and search query (for O(1) instant visibility checks)
  const visibleVideoIds = useMemo(() => {
    const ids = new Set<string>();
    const q = searchQuery.toLowerCase().trim();
    const activeUpper = activeFilter.toUpperCase();

    allVideos.forEach((v) => {
      const matchesCategory =
        activeUpper === "ALL" ||
        (v.category && v.category.toUpperCase() === activeUpper);

      const matchesSearch =
        !q ||
        v.title.toLowerCase().includes(q) ||
        (v.category && v.category.toLowerCase().includes(q)) ||
        (v.description && v.description.toLowerCase().includes(q)) ||
        String(v.year).includes(q);

      if (matchesCategory && matchesSearch) {
        ids.add(v.id);
      }
    });
    return ids;
  }, [allVideos, activeFilter, searchQuery]);

  // Filtered videos based on active filter & search query
  const filteredVideos = useMemo(() => {
    return allVideos.filter((v) => visibleVideoIds.has(v.id));
  }, [allVideos, visibleVideoIds]);

  // Stable pre-computed organic styles per video so style calculation is memoized
  const videoStyles = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getOrganicItemStyle>>();
    allVideos.forEach((v, idx) => {
      map.set(v.id, getOrganicItemStyle(v.id, idx));
    });
    return map;
  }, [allVideos]);

  // Responsive balanced grid layout based on number of visible items
  const containerColumnClass = useMemo(() => {
    const count = visibleVideoIds.size;
    if (count <= 1) {
      return "grid grid-cols-1 max-w-xl mx-auto items-start";
    }
    if (count === 2) {
      return "grid grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto items-start";
    }
    if (count === 3) {
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto items-start";
    }
    return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 items-start";
  }, [visibleVideoIds.size]);


  // Segmented Tabs options for single-row sliding category toggle
  const categoryTabs = useMemo(() => {
    const list: Array<{ id: string; label: string; badge?: number | string }> =
      [
        {
          id: "ALL",
          label: "ALL",
        },
      ];

    categories.forEach((cat) => {
      if (!cat.category || !cat.category.trim() || cat.videos.length === 0) {
        return;
      }
      const catUpper = cat.category.toUpperCase();
      list.push({
        id: catUpper,
        label: catUpper,
        badge: cat.videos.length,
      });
    });

    return list;
  }, [categories, allVideos.length]);

  // Dropdown options for responsive category filter
  const categoryDropdownOptions = useMemo(() => {
    return categoryTabs.map((tab) => ({
      value: String(tab.id),
      label: tab.label,
      badge: tab.badge,
    }));
  }, [categoryTabs]);

  const categoryTriggerPrefix = useMemo(
    () => (
      <span className="flex items-center gap-2 min-w-0">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-sm shadow-purple-600/40">
          <Filter className="h-2.5 w-2.5 text-white" />
        </span>
        <span className="text-[11px] font-semibold text-white/50 tracking-wider uppercase">
          Category:
        </span>
      </span>
    ),
    [],
  );

  // Monitor container width vs required tabs width to toggle between tabs row and dropdown
  useEffect(() => {
    const el = categoryContainerRef.current;
    if (!el) return;

    const checkOverflow = () => {
      if (!categoryContainerRef.current) return;
      const containerWidth = categoryContainerRef.current.clientWidth;
      if (containerWidth <= 0) return;

      if (tabsMeasureRef.current && !isCategoryCutOff) {
        const sw = tabsMeasureRef.current.scrollWidth;
        if (sw > 0) {
          requiredTabsWidthRef.current = sw;
        }
      }

      // Estimate fallback width from tab labels if not yet measured
      const fallbackWidth = categoryTabs.reduce((acc, tab) => {
        const len = typeof tab.label === "string" ? tab.label.length : 10;
        return acc + len * 9 + 48;
      }, 32);

      const threshold = requiredTabsWidthRef.current || fallbackWidth;
      // When container width is less than required width + padding, tabs start cutting off
      const cutOff = containerWidth < threshold + 12;
      setIsCategoryCutOff((prev) => (prev !== cutOff ? cutOff : prev));
    };

    checkOverflow();

    const ro = new ResizeObserver(() => {
      checkOverflow();
    });
    ro.observe(el);

    window.addEventListener("resize", checkOverflow, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, [isCategoryCutOff, categoryTabs]);

  // Available categories for add form
  const availableCategories = useMemo(() => {
    return Array.from(
      new Set(
        categories
          .map((c) => c.category)
          .filter((cat) => cat && cat.trim() !== ""),
      ),
    );
  }, [categories]);



  const handleFilterChange = (cat: string) => {
    setActiveFilter(cat);
  };

  const handleCloseVideo = () => {
    setPlayingVideo(null);
  };

  const handleAddVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ytId = extractYouTubeId(newUrl);
    if (!ytId || ytId.length !== 11) {
      alert("Please enter a valid YouTube Video URL or 11-character ID.");
      return;
    }
    if (!newTitle.trim()) {
      alert("Please enter a video title.");
      return;
    }
    const finalCategory = isCustomCategory
      ? customCategoryInput.trim() || "Official Music Videos"
      : newCategory;

    setSubmitting(true);
    try {
      const videoObj: Video = {
        id: ytId,
        title: newTitle.trim(),
        year: Number(newYear) || new Date().getFullYear(),
        duration: "3:30",
        description: newDesc.trim(),
        category: finalCategory,
      };

      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeId: videoObj.id,
          title: videoObj.title,
          year: videoObj.year,
          duration: videoObj.duration,
          description: videoObj.description,
          category: videoObj.category,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Failed to publish video to Sanity");
      }

      setCategories((prev) => {
        const next = [...prev];
        let cat = next.find(
          (c) => c.category.toLowerCase() === videoObj.category?.toLowerCase(),
        );
        if (!cat) {
          cat = { category: videoObj.category || "Misc", videos: [] };
          next.push(cat);
        }
        if (!cat.videos.some((v) => v.id === videoObj.id)) {
          cat.videos.unshift(videoObj);
        }
        return next;
      });

      setActiveFilter(videoObj.category ? videoObj.category.toUpperCase() : "ALL");
      setIsAddModalOpen(false);
      setIsCustomCategory(false);
      setCustomCategoryInput("");
      setNewTitle("");
      setNewUrl("");
      setNewDesc("");
      setToastMessage(
        `🎉 Video "${videoObj.title}" successfully added under "${videoObj.category}"!`,
      );
      setTimeout(() => setToastMessage(null), 4500);
    } catch (err: any) {
      alert(err?.message || "Failed to save video.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderCard = (
    video: Video,
    style: ReturnType<typeof getOrganicItemStyle>,
    isVisible: boolean,
    priority: boolean = false,
  ) => {
    const isHovered = !playingVideo && hoveredVideoId === video.id;

    return (
      <div
        key={`video-card-${video.id}`}
        className={`w-full transition-opacity duration-300 ${
          isVisible ? "block" : "!hidden pointer-events-none select-none"
        }`}
      >
        <div
          className={`${style.widthClass} ${style.alignClass} ${
            airyLayout ? style.marginClass : "mb-8 md:mb-12"
          } ${style.offsetClass} transition-transform duration-500`}
        >
          <div
            role="button"
            tabIndex={isVisible ? 0 : -1}
            aria-label={`Play ${video.title}`}
            onMouseEnter={() => {
              if (!playingVideo) setHoveredVideoId(video.id);
            }}
            onMouseLeave={() => setHoveredVideoId(null)}
            onClick={() => {
              setHoveredVideoId(null);
              setPlayingVideo(video);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setHoveredVideoId(null);
                setPlayingVideo(video);
              }
            }}
            className="group block w-full cursor-pointer text-left select-none"
          >
            {/* Media Video Box */}
            <div
              className={`relative block w-full overflow-hidden rounded-[20px] bg-[#1a1a1a] border border-white/10 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.85),0_12px_24px_-8px_rgba(0,0,0,0.6)] transition-[transform,box-shadow,border-color] duration-300 group-hover:scale-[1.015] group-hover:shadow-[0_36px_70px_-15px_rgba(0,0,0,0.95),0_16px_32px_-8px_rgba(0,0,0,0.75)] group-hover:border-white/20 ${style.aspectClass}`}
            >
              {/* Media Thumbnail Image & Video Preview on Hover */}
              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                  alt={video.title}
                  fill
                  priority={priority}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                  className={`object-cover transition-transform duration-500 ease-out ${
                    isHovered ? "scale-[1.08]" : "scale-100"
                  }`}
                />

                {/* Autoplaying video 20s in (eager loaded before reveal for top priority cards) */}
                <CardVideoEmbed
                  videoId={video.id}
                  title={video.title}
                  aspectClass={style.aspectClass}
                  isHovered={isHovered}
                  priority={priority}
                />
              </div>
            </div>

            {/* Title and Other Info OUTSIDE of the video */}
            <div className="mt-4 flex flex-col gap-1.5 px-0.5">
              <div className="flex items-center gap-2.5">
                <h2 className="line-clamp-2 text-base tracking-tight text-white group-hover:text-[#f2efa3] transition-colors duration-150 drop-shadow-sm sm:text-lg">
                  {video.title}
                </h2>
              </div>
              <div className="text-xs font-medium tracking-wider text-white/60 uppercase">
                {video.category || "7th Heaven"}
                {video.year ? ` • ${video.year}` : ""}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main
      className="page-container relative min-h-screen overflow-x-hidden selection:bg-[#f2efa3] selection:text-[#1d1d1b]"
      id="media-page"
    >
      <div className="site-container page-stack relative z-10">
        {/* ── PAGE TITLE HERO ── */}
        <PageHero
          title={
            sanityContent?.heroHeading ||
            sanityContent?.title ||
            "7TH HEAVEN MEDIA VAULT"
          }
          titleId="media-heading"
          subtitle={
            sanityContent?.heroSubheading ||
            sanityContent?.subtitle ||
            "40 years of music, live performances, official music videos, and press highlights."
          }
          align="left"
          className="max-w-[800px]"
        />

        {/* ── 700+ SONG MP3/CD AUDIO VAULT PLAYER (TOP OF MEDIA PAGE) ── */}
        <section
          id="audio-vault"
          aria-labelledby="audio-vault-heading"
          className="section"
        >
          <SectionHeader
            id="audio-vault-heading"
            title="Audio Vault Player"
            visuallyHidden
          />
          <div>
            <AudioPlayer />
          </div>
        </section>

        {/* ── NEW HOUSE OF YELLOW SPREAD MEDIA SECTION ── */}
        <section
          ref={projectsContainerRef}
          id="media-gallery"
          aria-labelledby="media-gallery-heading"
          className="section relative min-h-screen pt-4 pb-36"
        >
          <SectionHeader
            id="media-gallery-heading"
            title="Media Gallery"
            visuallyHidden
          />

          {/* ── MEDIA TOOLBAR: SEARCH, CMS BUTTON, VIEW MODE & CATEGORY TOGGLE PILLS ── */}
          <div role="toolbar" aria-label="Media Filters" className="mb-8 lg:mb-10">
            {/* Search & Add Video Controls */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={
                  sanityContent?.searchPlaceholder || "Search Media..."
                }
                containerClassName="w-full sm:w-[320px]"
              />
              <AddCmsButton
                label={
                  sanityContent?.addVideoButtonText ||
                  "ADD VIDEO / MEDIA IN SANITY CMS"
                }
                onClick={() => setIsAddModalOpen(true)}
              />
              {columnCount >= 2 && (
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 backdrop-blur-md">
                  <Toggle
                    size="sm"
                    checked={airyLayout}
                    onChange={setAiryLayout}
                    label={
                      <span className="text-2xs font-bold uppercase tracking-wider text-white/70">
                        Airy Spacing
                      </span>
                    }
                  />
                </div>
              )}
            </div>

            {/* Category Navigation (Sliding Single-Row Toggle when wide, or GooeyDropdown when cut off) */}
            <div ref={categoryContainerRef} className="relative w-full py-1">
              {isCategoryCutOff ? (
                <div className="inline-block">
                  <CustomDropdown
                    ariaLabel="Media categories"
                    value={activeFilter.toUpperCase()}
                    options={categoryDropdownOptions}
                    onChange={(val) => handleFilterChange(String(val))}
                    accentColor="#1e183a"
                    minWidth={280}
                    maxHeight={360}
                    triggerPrefix={categoryTriggerPrefix}
                    buttonClassName="rounded-full border border-white/15 bg-black/35 px-4 py-2 text-xs backdrop-blur-md shadow-[inset_0_0_10px_rgba(0,0,0,0.25)] hover:border-white/30 hover:bg-black/50"
                  />
                </div>
              ) : (
                <div
                  ref={tabsMeasureRef}
                  className="hide-scrollbar max-w-full overflow-x-auto select-none"
                >
                  <SegmentedTabs
                    layout="flex"
                    shape="full"
                    size="sm"
                    variant="glass"
                    ariaLabel="Media categories"
                    className="inline-flex w-max shrink-0 flex-nowrap"
                    tabs={categoryTabs}
                    activeTab={activeFilter.toUpperCase()}
                    onChange={(id) => handleFilterChange(String(id))}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Active Filter Indicator banner if filter is active */}
          {activeFilter !== "ALL" && (
            <div className="mb-8 flex items-center justify-between rounded-2xl border border-[#f2efa3]/30 bg-[#f2efa3]/10 px-5 py-3">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-[#f2efa3]" />
                <span className="text-xs font-bold tracking-wider text-[#f2efa3] uppercase">
                  Active Filter: {activeFilter}
                </span>
                <span className="text-xs text-white/50">
                  ({filteredVideos.length} projects)
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveFilter("ALL");
                  setSearchQuery("");
                }}
                className="cursor-pointer text-xs font-semibold text-white/80 transition-colors duration-150 hover:text-white"
              >
                Reset to All ✕
              </button>
            </div>
          )}

          {/* =================== HOUSE OF YELLOW SPREAD MULTI-STREAM COLLAGE =================== */}
          <div className="relative mx-auto w-full max-w-[2400px]">
            <div
              className={`transition-all duration-300 gap-6 ${containerColumnClass}`}
            >
              {allVideos.map((video, idx) => {
                const isVisible = visibleVideoIds.has(video.id);
                const style =
                  videoStyles.get(video.id) ||
                  getOrganicItemStyle(video.id, idx);
                return renderCard(video, style, isVisible, idx < 6);
              })}
            </div>

            {visibleVideoIds.size === 0 && (
              <div className="py-20 text-center">
                <p className="text-lg text-white/60 font-medium">
                  No videos found matching your filter
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("ALL");
                    setSearchQuery("");
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>


        </section>
      </div>


      {/* FULL SCREEN VIDEO MODAL */}
      {mounted &&
        playingVideo &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] flex h-full h-dvh w-full cursor-pointer animate-[fade-in_0.2s_ease-out] flex-col bg-black p-0"
            onClick={handleCloseVideo}
          >
            <div className="relative flex h-full w-full flex-col overflow-hidden bg-black">
              {/* Modal Header Bar */}
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-black/90 px-4 pt-safe sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-[#f2efa3]/30 bg-[#f2efa3]/20 px-3 py-1 text-xs font-bold tracking-wider text-[#f2efa3] uppercase">
                    {playingVideo.category || "7TH HEAVEN"}
                  </span>
                  <span className="line-clamp-1 text-white sm:text-lg">
                    {playingVideo.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCloseVideo}
                  className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  aria-label="Close modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Full-Screen Edge-to-Edge Video Player Stage */}
              <div className="relative flex-1 w-full h-[calc(100vh-3.5rem)] h-[calc(100dvh-3.5rem)] overflow-hidden bg-black pb-safe">
                <CustomVideoPlayer
                  videoId={playingVideo.id}
                  title={playingVideo.title}
                  onClose={handleCloseVideo}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed right-6 bottom-6 z-[999999] flex items-center gap-3 rounded-[var(--radius-box)] border border-purple-500/50 bg-gradient-to-r from-purple-950 to-black px-5 py-3.5 shadow-2xl">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Add Video Modal */}
      {mounted &&
        isAddModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[999999] flex animate-[fade-in_0.15s_ease-out] items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-purple-500/40 bg-[#0f0921] p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center border border-purple-500/40 bg-purple-500/20">
                    <VideoIcon className="h-4 w-4" />
                  </div>
                  <div>
                    {/* heading-size-ok: admin modal title */}
                    <h3 className="text-base font-bold text-white">
                      {sanityContent?.modalTitle || "Add Video to Media Vault"}
                    </h3>
                    <p className="text-xs text-purple-300/70">
                      {sanityContent?.modalSubtitle ||
                        "Syncs to Sanity CMS & Media Hub"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-ghost cursor-pointer p-1"
                >
                  <X className="h-5 w-5 text-white/60" />
                </button>
              </div>

              <form onSubmit={handleAddVideoSubmit} className="space-y-4">
                <div>
                  <GlowInput
                    label="Video URL or ID *"
                    type="text"
                    required
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="Paste video link or ID..."
                    wrapperClassName="w-full"
                  />
                </div>

                {(() => {
                  const parsed = extractYouTubeId(newUrl);
                  if (parsed && parsed.length === 11) {
                    return (
                      <div className="flex items-center gap-4 rounded-[var(--radius-box)] border border-purple-500/40 bg-purple-950/40 p-3">
                        <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-black">
                          <Image
                            src={`https://img.youtube.com/vi/${parsed}/hqdefault.jpg`}
                            alt="Thumbnail preview"
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-xs font-semibold text-emerald-400">Valid Video Link Detected</span>
                          </div>
                          <p className="mt-0.5 text-xs text-purple-200/80 font-mono">
                            ID: {parsed}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div>
                  <GlowInput
                    label="Video Title *"
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Ain't That Just Beautiful (Official Video)"
                    wrapperClassName="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label className="block text-xs font-medium text-white/80">
                        Category <span className="text-pink-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(!isCustomCategory);
                          if (!isCustomCategory) {
                            setCustomCategoryInput("");
                          }
                        }}
                        className="cursor-pointer text-[10px] text-purple-400"
                      >
                        {isCustomCategory ? "← Select List" : "+ New Category"}
                      </button>
                    </div>

                    {isCustomCategory ? (
                      <GlowInput
                        type="text"
                        required
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        placeholder="e.g. Acoustic Sessions"
                        wrapperClassName="w-full"
                      />
                    ) : (
                      <GlowSelect
                        value={newCategory}
                        onChange={(e: any) => {
                          const val = typeof e === "string" ? e : e.target.value;
                          if (val === "__CUSTOM__") {
                            setIsCustomCategory(true);
                            setCustomCategoryInput("");
                          } else {
                            setNewCategory(val);
                          }
                        }}
                        wrapperClassName="w-full"
                      >
                        {availableCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        <option value="__CUSTOM__">
                          ✨ + Add Custom Category...
                        </option>
                      </GlowSelect>
                    )}
                  </div>

                  <div>
                    <GlowInput
                      label="Release Year"
                      type="number"
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      placeholder="2026"
                      wrapperClassName="w-full"
                    />
                  </div>
                </div>

                <div>
                  <GlowTextarea
                    label="Description / Notes (Optional)"
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="e.g. Filmed live at Frontier Days..."
                    wrapperClassName="w-full"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="transition-colors cursor-pointer text-xs text-white/70 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="transition-colors flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:from-purple-500 hover:to-pink-500 disabled:opacity-50"
                  >
                    {submitting
                      ? sanityContent?.modalSavingText || "Saving to Sanity..."
                      : sanityContent?.modalSubmitText ||
                      "+ PUBLISH VIDEO TO SANITY"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </main>
  );
}
