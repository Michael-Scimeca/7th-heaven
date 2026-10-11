"use client";

import Image from "next/image";
import staticVideoCategories from "../../../public/data/videos.json";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { X, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { useScrollLock } from "@/lib/useScrollLock";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const CustomVideoPlayer = dynamic(
  () => import("@/components/CustomVideoPlayer"),
  { ssr: false },
);

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
  }
  | {
    type: "spacer";
    aspectClass: string;
    key: string;
  };

const BLANK_COLUMNS_4: number[][] = [
  [2],
  [0],
  [3],
  [1],
  [0, 2],
  [3],
  [1],
  [0],
  [2],
  [1, 3],
  [0],
  [2],
  [1],
  [3],
];

const BLANK_COLUMNS_3: number[][] = [
  [1],
  [2],
  [0],
  [1],
  [0],
  [2],
];

const BLANK_COLUMNS_2: number[][] = [
  [],
  [1],
  [],
  [0],
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
}

function CardVideoEmbed({ videoId, title, aspectClass }: CardVideoEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { rootMargin: "350px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  // 5-second lightweight loop playing 20 seconds in (20s to 25s) to capture the song's energy while conserving memory & bandwidth
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}&start=20&end=25&playsinline=1&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&enablejsapi=1&vq=medium`;

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 z-10 overflow-hidden transition-opacity duration-700 ${inView && isLoaded ? "opacity-100" : "opacity-0"
        }`}
    >
      {inView && (
        <iframe
          src={embedUrl}
          title={title}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-0 transform-gpu ${sizeClasses}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; compute-pressure"
        />
      )}
    </div>
  );
}

export default function MediaV2Client({
  sanityContent,
}: {
  sanityContent?: any;
}) {
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
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [listHoveredVideo, setListHoveredVideo] = useState<Video | null>(null);

  const projectsContainerRef = useRef<HTMLElement>(null);
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const imageRefs = useRef<Map<string, HTMLElement>>(new Map());

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

  useScrollLock(Boolean(playingVideo || isFilterOpen));

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (playingVideo) setPlayingVideo(null);
        if (isFilterOpen) setIsFilterOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playingVideo, isFilterOpen]);

  // Fetch updated videos from Sanity
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

  // Flatten all videos
  const allVideos = React.useMemo(() => {
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
  const filteredVideos = React.useMemo(() => {
    return allVideos.filter((v) => {
      const matchesCategory =
        activeFilter === "ALL" ||
        (v.category &&
          v.category.toUpperCase() === activeFilter.toUpperCase());
      const matchesSearch =
        !searchQuery.trim() ||
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.description &&
          v.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [allVideos, activeFilter, searchQuery]);

  const uniqueCategories = React.useMemo(() => {
    const cats = Array.from(
      new Set(allVideos.map((v) => v.category || "Misc. / Various")),
    );
    return ["ALL", ...cats];
  }, [allVideos]);

  // Pagination
  const CARDS_PER_BATCH = 18;
  const [visibleCount, setVisibleCount] = useState(CARDS_PER_BATCH);
  useEffect(() => {
    setVisibleCount(CARDS_PER_BATCH);
  }, [activeFilter, searchQuery]);

  const visibleVideos = filteredVideos.slice(0, visibleCount);
  const hasMoreVideos = visibleCount < filteredVideos.length;

  // Responsive column streams partitioning with organic negative-space blank slots
  const columns = React.useMemo(() => {
    const cols: MediaColumnItem[][] = Array.from(
      { length: columnCount },
      () => [],
    );

    const shouldAddBlanks =
      columnCount >= 2 && visibleVideos.length >= columnCount * 2;

    let videoIdx = 0;
    let rowIdx = 0;

    while (videoIdx < visibleVideos.length) {
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
        if (videoIdx >= visibleVideos.length) break;

        const isBlank = blankSet.has(c);
        const variant = VARIANTS[(c * 3 + cols[c].length) % VARIANTS.length];

        if (isBlank) {
          cols[c].push({
            type: "spacer",
            aspectClass: variant.aspectClass,
            key: `spacer-r${rowIdx}-c${c}`,
          });
        } else {
          const video = visibleVideos[videoIdx];
          cols[c].push({
            type: "video",
            video,
            aspectClass: variant.aspectClass,
            key: `video-${video.id}-r${rowIdx}-c${c}`,
          });
          videoIdx++;
        }
      }
      rowIdx++;
    }

    return cols;
  }, [visibleVideos, columnCount]);

  // Multi-speed stream parallax & card inner image parallax via GSAP ScrollTrigger
  useIsomorphicLayoutEffect(() => {
    if (
      typeof window === "undefined" ||
      viewMode !== "GRID" ||
      !projectsContainerRef.current
    ) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Column multi-speed stream drift (when columnCount > 1)
      if (columnCount > 1) {
        columnRefs.current.forEach((colEl, colIndex) => {
          if (!colEl) return;
          const isEven = colIndex % 2 === 0;
          const drift = 5;
          gsap.fromTo(
            colEl,
            { yPercent: isEven ? drift : -drift, force3D: true },
            {
              yPercent: isEven ? -drift : drift,
              ease: "none",
              scrollTrigger: {
                trigger: projectsContainerRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.2,
              },
            }
          );
        });
      }

      // 2. Card inner image parallax
      imageRefs.current.forEach((imgEl, id) => {
        const cardEl = cardRefs.current.get(id);
        if (!imgEl || !cardEl) return;

        gsap.fromTo(
          imgEl,
          { yPercent: -7, force3D: true },
          {
            yPercent: 7,
            ease: "none",
            scrollTrigger: {
              trigger: cardEl,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          }
        );
      });
    }, projectsContainerRef);

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, [visibleVideos, viewMode, activeFilter, columnCount]);

  const renderCard = (
    video: Video,
    aspectClass: string,
    sizeClass?: string,
  ) => {
    const isHovered = !playingVideo && hoveredVideoId === video.id;

    return (
      <div
        key={`${activeFilter}-${video.id}`}
        className={`w-full ${sizeClass || ""} transition-transform duration-500`}
      >
        <div
          ref={(el) => {
            if (el) cardRefs.current.set(video.id, el);
            else cardRefs.current.delete(video.id);
          }}
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
          {/* Media Video Box (with Shadows, Rounded Corners & Parallax) */}
          <div
            className={`relative block w-full overflow-hidden rounded-[20px] bg-[#1a1a1a] border border-white/10 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.85),0_12px_24px_-8px_rgba(0,0,0,0.6)] transition-[transform,box-shadow,border-color] duration-300 group-hover:scale-[1.015] group-hover:shadow-[0_36px_70px_-15px_rgba(0,0,0,0.95),0_16px_32px_-8px_rgba(0,0,0,0.75)] group-hover:border-white/20 ${aspectClass}`}
          >
            {/* Media Thumbnail Image & Autoplaying Video (with Smooth Parallax Shift) */}
            <div className="absolute -top-[10%] -bottom-[10%] left-0 right-0 h-[120%] w-full overflow-hidden">
              <div
                ref={(el) => {
                  if (el) imageRefs.current.set(video.id, el);
                  else imageRefs.current.delete(video.id);
                }}
                className="relative h-full w-full transform-gpu"
              >
                <Image
                  src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                  alt={video.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                  className={`object-cover transition-transform duration-700 ease-out ${isHovered ? "scale-[1.42]" : "scale-[1.35]"
                    }`}
                />

                {/* Autoplaying continuous video */}
                <CardVideoEmbed
                  videoId={video.id}
                  title={video.title}
                  aspectClass={aspectClass}
                />
              </div>
            </div>
          </div>

          {/* Title and Other Info OUTSIDE of the video */}
          <div className="mt-4 flex flex-col gap-1.5 px-0.5">
            <div className="flex items-center gap-2.5">
              {/* heading-size-ok: card title outside video */}
              <h2 className="line-clamp-2 text-base  tracking-tight text-white group-hover:text-[#f2efa3] transition-colors duration-150 drop-shadow-sm sm:text-lg">
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
    <main className="relative z-10 min-h-screen bg-transparent text-white selection:bg-[#f2efa3] selection:text-[#1d1d1b]">
      {/* Semantic Accessible Heading */}
      <h1 className="sr-only">7th Heaven — Made By Yellow Media Archive</h1>

      {/* Projects Container (Grid or List Mode) */}
      <section
        ref={projectsContainerRef}
        id="projects-display"
        aria-label="Media projects"
        className="relative z-10 min-h-screen px-3 pt-12 pb-36 sm:px-4 md:px-6 lg:px-8 xl:px-10"
      >
        {viewMode === "GRID" ? (
          /* =================== HOUSE OF YELLOW SPREAD MULTI-STREAM COLLAGE =================== */
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

                      return renderCard(item.video, item.aspectClass);
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* =================== HOUSE OF YELLOW MINIMALIST LIST VIEW =================== */
          <div className="mx-auto w-full max-w-6xl pt-8">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <tbody>
                  {visibleVideos.map((video) => {
                    const shortYear = video.year
                      ? `'${String(video.year).slice(-2)}`
                      : "'24";

                    return (
                      <tr
                        key={video.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`Play ${video.title}`}
                        onMouseEnter={() => setListHoveredVideo(video)}
                        onMouseLeave={() => setListHoveredVideo(null)}
                        onClick={() => setPlayingVideo(video)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setPlayingVideo(video);
                          }
                        }}
                        className="group cursor-pointer border-b border-white/10 transition-colors duration-150 hover:bg-white/[0.04]"
                      >
                        {/* Year */}
                        <td className="py-6 pr-6 pl-2 font-mono text-sm text-white/40 transition-colors duration-150 group-hover:text-white/80">
                          {shortYear}
                        </td>

                        {/* Title with yellow indicator on hover */}
                        <td className="py-6 pr-6">
                          <div className="flex items-center gap-3">
                            <span className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[#f2efa3] opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
                            <span className="text-lg font-semibold tracking-tight text-white transition-colors group-hover:text-[#f2efa3] sm:text-2xl">
                              {video.title}
                            </span>
                          </div>
                        </td>

                        {/* Metrics */}
                        <td className="hidden py-6 pr-6 text-sm text-white/50 md:table-cell">
                          {video.duration || "3:30"}
                          {video.viewCount ? ` • ${video.viewCount} views` : ""}
                        </td>

                        {/* Category */}
                        <td className="py-6 pr-2 text-right text-xs font-semibold tracking-wider text-white/60 uppercase">
                          {video.category || "Official"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Floating Live Thumbnail in List Mode */}
              {listHoveredVideo && (
                <aside
                  aria-label="Video preview"
                  className="pointer-events-none fixed right-12 bottom-28 z-40 hidden w-80 overflow-hidden rounded-[16px] border border-white/15 bg-black/80 shadow-2xl backdrop-blur-md animate-[fade-in_0.15s_ease-out] lg:block"
                >
                  <div className="relative aspect-[16/10] w-full">
                    <Image
                      src={`https://img.youtube.com/vi/${listHoveredVideo.id}/hqdefault.jpg`}
                      alt={listHoveredVideo.title}
                      fill
                      sizes="320px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute right-4 bottom-4 left-4">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-[2px] bg-[#f2efa3]" />
                        <span className="line-clamp-1 text-xs font-bold text-white">
                          {listHoveredVideo.title}
                        </span>
                      </div>
                    </div>
                  </div>
                </aside>
              )}
            </div>
          </div>
        )}

        {/* Giant 7TH HEAVEN Typography Below Videos */}
        <div
          id="hoy-watermark-logo"
          className="pointer-events-none my-24 md:my-36 flex w-full select-none flex-col items-center justify-center text-center font-black tracking-[-0.05em] text-white/[0.09] uppercase leading-[0.82] text-[18vw] sm:text-[16vw] lg:text-[14vw]"
          aria-hidden="true"
        >
          <span>7TH</span>
          <span>HEAVEN</span>
        </div>

        {/* Load More */}
        {hasMoreVideos && (
          <div className="flex justify-center pt-20 pb-10">
            <button
              type="button"
              onClick={() =>
                setVisibleCount((prev) =>
                  Math.min(prev + CARDS_PER_BATCH, filteredVideos.length),
                )}
              className="cursor-pointer rounded-full border border-white/20 bg-white/5 px-8 py-3 text-xs font-bold tracking-widest text-white uppercase transition-colors duration-200 hover:bg-white hover:text-black"
            >
              Load more ({filteredVideos.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </section>

      {/* 3. Fixed Bottom Floating Dock (House of Yellow Pill) */}
      <nav
        aria-label="Media controls and filters"
        className="fixed bottom-8 left-1/2 z-[90000] -translate-x-1/2"
      >
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/75 p-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          {/* + FILTER WORKS Button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex cursor-pointer items-center gap-2.5 rounded-full bg-white/10 py-2 pr-4 pl-2 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-white/20"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[#f2efa3]">
              ✦
            </span>
            <span>
              {activeFilter === "ALL"
                ? "+ Filter Works"
                : `Filter: ${activeFilter}`}
            </span>
          </button>

          {/* Divider */}
          <div className="h-4 w-px bg-white/20" />

          {/* View Mode Toggle: GRID */}
          <button
            type="button"
            onClick={() => setViewMode("GRID")}
            aria-label="Grid view"
            className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase transition-colors duration-150 ${viewMode === "GRID"
              ? "bg-white/20 text-white"
              : "text-white/60 hover:text-white"
              }`}
          >
            <span className="text-[10px]">⊞</span>
            <span>Grid</span>
          </button>

          {/* View Mode Toggle: LIST */}
          <button
            type="button"
            onClick={() => setViewMode("LIST")}
            aria-label="List view"
            className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase transition-colors duration-150 ${viewMode === "LIST"
              ? "bg-white/20 text-white"
              : "text-white/60 hover:text-white"
              }`}
          >
            <span className="text-[10px]">☰</span>
            <span>List</span>
          </button>
        </div>
      </nav>

      {/* 4. Filter Overlay (House of Yellow Frosted Overlay) */}
      {mounted &&
        isFilterOpen &&
        createPortal(
          <div className="fixed inset-0 z-[200000] flex flex-col justify-between bg-black/85 p-8 backdrop-blur-2xl animate-[fade-in_0.2s_ease-out]">
            {/* Top Bar with Search */}
            <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
              <span className="text-xs font-bold tracking-widest text-white/80 uppercase">
                Filter Works
              </span>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/15"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Central Categories Group */}
            <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 py-10">
              <div className="relative w-full max-w-md">
                <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-white/15 bg-white/10 py-3 pr-4 pl-11 text-sm text-white placeholder-white/40 shadow-sm focus:border-white/40 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {uniqueCategories.map((cat) => {
                  const isSelected =
                    activeFilter.toUpperCase() === cat.toUpperCase();

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setActiveFilter(cat);
                        setIsFilterOpen(false);
                      }}
                      className={`cursor-pointer rounded-full border px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors duration-150 ${isSelected
                        ? "border-[#f2efa3] bg-[#f2efa3] text-black shadow-md scale-105"
                        : "border-white/15 bg-white/5 text-white/80 hover:border-white/40 hover:bg-white/15"
                        }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Close Button (Circular Button matching House of Yellow) */}
            <div className="flex justify-center pb-4">
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-[#f2efa3] shadow-lg transition-transform hover:scale-110 hover:bg-white/20"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>,
          document.body,
        )}

      {/* 5. Cinema Video Modal */}
      {mounted &&
        playingVideo &&
        createPortal(
          <dialog
            open
            aria-label={playingVideo.title}
            onCancel={() => setPlayingVideo(null)}
            className="fixed inset-0 z-[200000] m-0 p-0 max-w-none max-h-none w-screen h-screen flex animate-[fade-in_0.2s_ease-out] items-center justify-center bg-black/95 backdrop-blur-2xl border-none"
          >
            <div className="relative flex h-full w-full max-w-7xl flex-col">
              {/* Modal Top Bar */}
              <div className="flex h-14 items-center justify-between border-b border-white/10 px-6">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-[#f2efa3] shadow-[0_0_8px_#f2efa3]" />
                  <span className="line-clamp-1 text-sm font-bold text-white">
                    {playingVideo.title}
                  </span>
                  <span className="hidden text-xs text-white/50 sm:inline">
                    ({playingVideo.year || "2024"})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPlayingVideo(null)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Player Body */}
              <div className="relative flex-1 w-full overflow-hidden bg-black">
                <CustomVideoPlayer
                  videoId={playingVideo.id}
                  title={playingVideo.title}
                  onClose={() => setPlayingVideo(null)}
                />
              </div>
            </div>
          </dialog>,
          document.body,
        )}
    </main>
  );
}
