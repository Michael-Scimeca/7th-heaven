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

// Organic varied wide aspect-ratios matching House of Yellow collage
const VARIANTS: CardVariant[] = [
  { aspectClass: "aspect-[16/9]" },   // Standard wide video
  { aspectClass: "aspect-[16/10]" },  // Rich wide
  { aspectClass: "aspect-[4/3]" },    // Classic wide
  { aspectClass: "aspect-[21/9]" },   // Cinematic ultra-wide
  { aspectClass: "aspect-[16/9]" },   // Standard wide
  { aspectClass: "aspect-square" },   // Square
  { aspectClass: "aspect-[16/10]" },  // Rich wide
  { aspectClass: "aspect-[4/5]" },    // Soft portrait
];

const COLUMN_TOP_STAGGERS = [
  "pt-0",
  "pt-14 md:pt-20 lg:pt-24",
  "pt-6 md:pt-10 lg:pt-12",
  "pt-16 md:pt-24 lg:pt-28",
];

export type MediaColumnItem =
  | {
      type: "video";
      video: Video;
      aspectClass: string;
      key: string;
      priority: boolean;
    }
  | {
      type: "spacer";
      aspectClass: string;
      key: string;
    };

// Deterministic organic patterns for blank slots across columns so lines of four in a row are broken up with airy negative space
const BLANK_COLUMNS_4: number[][] = [
  [2],        // Row 0: col 2 is blank (cols 0, 1, 3 have videos)
  [0],        // Row 1: col 0 is blank (cols 1, 2, 3 have videos)
  [3],        // Row 2: col 3 is blank (cols 0, 1, 2 have videos)
  [1],        // Row 3: col 1 is blank (cols 0, 2, 3 have videos)
  [0, 2],     // Row 4: cols 0 & 2 are blank (cols 1, 3 have videos - airy pause)
  [3],        // Row 5: col 3 is blank (cols 0, 1, 2 have videos)
  [1],        // Row 6: col 1 is blank (cols 0, 2, 3 have videos)
  [0],        // Row 7: col 0 is blank (cols 1, 2, 3 have videos)
  [2],        // Row 8: col 2 is blank (cols 0, 1, 3 have videos)
  [1, 3],     // Row 9: cols 1 & 3 are blank (cols 0, 2 have videos - airy pause)
  [0],        // Row 10: col 0 is blank (cols 1, 2, 3 have videos)
  [2],        // Row 11: col 2 is blank (cols 0, 1, 3 have videos)
  [1],        // Row 12: col 1 is blank (cols 0, 2, 3 have videos)
  [3],        // Row 13: col 3 is blank (cols 0, 1, 2 have videos)
];

const BLANK_COLUMNS_3: number[][] = [
  [1],        // Row 0: col 1 is blank
  [2],        // Row 1: col 2 is blank
  [0],        // Row 2: col 0 is blank
  [1],        // Row 3: col 1 is blank
  [0],        // Row 4: col 0 is blank
  [2],        // Row 5: col 2 is blank
];

const BLANK_COLUMNS_2: number[][] = [
  [],         // Row 0: 2 videos
  [1],        // Row 1: col 1 is blank
  [],         // Row 2: 2 videos
  [0],        // Row 3: col 0 is blank
];

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
        } else {
          if (bufferTimerRef.current) {
            clearTimeout(bufferTimerRef.current);
            bufferTimerRef.current = null;
          }
          setInView(false);
          setIsLoaded(false);
        }
      },
      {
        rootMargin: "300px 0px",
      },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [isHovered]);

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
  } else if (aspectClass.includes("4/3")) {
    sizeClasses = "w-[160%] h-[140%] min-w-[160%] min-h-[140%]";
  } else if (aspectClass.includes("21/9")) {
    sizeClasses = "w-[140%] h-[165%] min-w-[140%] min-h-[165%]";
  }

  const hasLocalPreview = AVAILABLE_PREVIEWS.has(videoId);

  // 5-second lightweight loop playing 20 seconds in (20s to 25s) to capture song's energy
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}&start=20&end=25&playsinline=1&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&vq=medium`;

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 z-10 overflow-hidden transition-opacity duration-700 ease-out ${
        inView && isLoaded ? "opacity-100" : "opacity-0"
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
    () => () => {},
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
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);

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
      } catch {}
    } catch {}
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Flatten all videos
  const allVideos = useMemo(() => {
    const list: Video[] = [];
    const seen = new Set<string>();

    categories.forEach((cat) => {
      cat.videos.forEach((v) => {
        if (!seen.has(v.id)) {
          seen.add(v.id);
          list.push({ ...v, category: v.category || cat.category });
        }
      });
    });
    return list;
  }, [categories]);

  // Filtered videos based on active filter & search query
  const filteredVideos = useMemo(() => {
    return allVideos.filter((v) => {
      const matchesCategory =
        activeFilter === "ALL" ||
        (v.category &&
          v.category.toUpperCase() === activeFilter.toUpperCase());

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        v.title.toLowerCase().includes(q) ||
        (v.category && v.category.toLowerCase().includes(q)) ||
        (v.description && v.description.toLowerCase().includes(q)) ||
        String(v.year).includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [allVideos, activeFilter, searchQuery]);


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

  // Responsive column streams partitioning with organic negative-space blank slots
  const columns = useMemo(() => {
    const cols: MediaColumnItem[][] = Array.from(
      { length: columnCount },
      () => [],
    );

    const shouldAddBlanks =
      airyLayout &&
      columnCount >= 2 &&
      filteredVideos.length >= columnCount * 2;

    let videoIdx = 0;
    let rowIdx = 0;

    while (videoIdx < filteredVideos.length) {
      let blankCols: number[] = [];
      if (shouldAddBlanks) {
        const patternSource =
          columnCount === 4
            ? BLANK_COLUMNS_4
            : columnCount === 3
              ? BLANK_COLUMNS_3
              : BLANK_COLUMNS_2;
        blankCols = patternSource[rowIdx % patternSource.length] || [];
      }

      const blankSet = new Set(blankCols);

      for (let c = 0; c < columnCount; c++) {
        if (videoIdx >= filteredVideos.length) break;

        const isBlank = blankSet.has(c);
        const variant = VARIANTS[(c * 3 + cols[c].length) % VARIANTS.length];

        if (isBlank) {
          cols[c].push({
            type: "spacer",
            aspectClass: variant.aspectClass,
            key: `spacer-r${rowIdx}-c${c}`,
          });
        } else {
          const video = filteredVideos[videoIdx];
          cols[c].push({
            type: "video",
            video,
            aspectClass: variant.aspectClass,
            key: `video-${video.id}-r${rowIdx}-c${c}`,
            priority: rowIdx === 0 && cols[c].length === 0,
          });
          videoIdx++;
        }
      }
      rowIdx++;
    }

    return cols;
  }, [filteredVideos, columnCount, airyLayout]);

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
    aspectClass: string,
    keySuffix?: string,
    sizeClass?: string,
    priority?: boolean,
  ) => {
    const isHovered = !playingVideo && hoveredVideoId === video.id;

    return (
      <div
        key={`${activeFilter}-${video.id}${keySuffix ? `-${keySuffix}` : ""}`}
        className={`w-full ${sizeClass || ""} transition-transform duration-500`}
      >
        <div
          role="button"
          tabIndex={0}
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
            className={`relative block w-full overflow-hidden rounded-[20px] bg-[#1a1a1a] border border-white/10 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.85),0_12px_24px_-8px_rgba(0,0,0,0.6)] transition-[transform,box-shadow,border-color] duration-300 group-hover:scale-[1.015] group-hover:shadow-[0_36px_70px_-15px_rgba(0,0,0,0.95),0_16px_32px_-8px_rgba(0,0,0,0.75)] group-hover:border-white/20 ${aspectClass}`}
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
                aspectClass={aspectClass}
                isHovered={isHovered}
                priority={priority}
              />
            </div>
          </div>

          {/* Title and Other Info OUTSIDE of the video */}
          <div className="mt-4 flex flex-col gap-1.5 px-0.5">
            <div className="flex items-center gap-2.5">
              <span className="h-3 w-3 shrink-0 rounded-[2px] bg-[#f2efa3] shadow-[0_0_8px_#f2efa3]" />
              {/* heading-size-ok: card title outside video */}
              <h2 className="line-clamp-2 text-base font-bold tracking-tight text-white group-hover:text-[#f2efa3] transition-colors duration-150 drop-shadow-sm sm:text-lg">
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
            <div className="flex gap-6 items-start w-full">
              {columns.map((colItems, colIndex) => {
                const topPadding =
                  columnCount > 1
                    ? COLUMN_TOP_STAGGERS[colIndex % COLUMN_TOP_STAGGERS.length]
                    : "pt-0";

                return (
                  <div
                    key={`col-${colIndex}-${columnCount}`}
                    ref={(el) => {
                      columnRefs.current[colIndex] = el;
                    }}
                    className={`flex-1 min-w-0 flex flex-col gap-6 md:gap-8 ${topPadding}`}
                  >
                    {colItems.map((item) => {
                      if (item.type === "spacer") {
                        return (
                          <div
                            key={item.key}
                            aria-hidden="true"
                            className="w-full select-none pointer-events-none"
                          >
                            <div className={`w-full ${item.aspectClass}`} />
                            <div className="mt-4 h-14 sm:h-16" />
                          </div>
                        );
                      }

                      return renderCard(
                        item.video,
                        item.aspectClass,
                        item.key,
                        undefined,
                        item.priority,
                      );
                    })}
                  </div>
                );
              })}
            </div>
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
