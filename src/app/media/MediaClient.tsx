/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";
import Image from "next/image";
import staticVideoCategories from "../../../public/data/videos.json";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  X,
  Video as VideoIcon,
  CheckCircle2,
  Play,
  Search,
} from "lucide-react";
import SearchInput from "@/components/SearchInput";
import dynamic from "next/dynamic";
import { useMember } from "@/context/MemberContext";
import SeventhButton from "@/components/SeventhButton";
import PageHero from "@/components/PageHero";
import GlassPlayButton from "@/components/GlassPlayButton";
import AddCmsButton from "@/components/AddCmsButton";
import { SectionHeader } from "@/components/SectionHeader";
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

const GRADIENT_PALETTES = [
  {
    bg: "from-[#1e0b36] via-[#0d061c] to-[#05020a]",
    accent: "from-purple-500 to-indigo-500",
    glow: "rgba(168,85,247,0.3)",
  },
  {
    bg: "from-[#0b1b36] via-[#060c1c] to-[#02050a]",
    accent: "from-blue-500 to-cyan-500",
    glow: "rgba(59,130,246,0.3)",
  },
  {
    bg: "from-[#360b24] via-[#1c0613] to-[#0a0207]",
    accent: "from-pink-500 to-rose-500",
    glow: "rgba(244,63,94,0.3)",
  },
  {
    bg: "from-[#29170b] via-[#140b05] to-[#080402]",
    accent: "from-amber-500 to-orange-500",
    glow: "rgba(245,158,11,0.3)",
  },
  {
    bg: "from-[#0b3620] via-[#051c10] to-[#020a05]",
    accent: "from-emerald-500 to-teal-500",
    glow: "rgba(16,185,129,0.3)",
  },
  {
    bg: "from-[#250b36] via-[#12051c] to-[#07020a]",
    accent: "from-violet-500 to-fuchsia-500",
    glow: "rgba(217,70,239,0.3)",
  },
];

function VideoCardVisual({
  videoId,
  title,
  isHovered,
  index = 0,
}: {
  videoId: string;
  title: string;
  isHovered: boolean;
  index?: number;
}) {
  const palette = GRADIENT_PALETTES[index % GRADIENT_PALETTES.length];
  const [imgSrc, setImgSrc] = useState<string>(
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  );
  const [imgFailed, setImgFailed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [imgSrc]);

  const handleImageError = () => {
    if (imgSrc.includes("hqdefault.jpg")) {
      setImgSrc(`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`);
    } else if (imgSrc.includes("mqdefault.jpg")) {
      setImgSrc(`https://img.youtube.com/vi/${videoId}/0.jpg`);
    } else {
      setImgFailed(true);
    }
  };

  const originUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";
  const embedSnippetUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}&start=10&end=15&playsinline=1&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(originUrl)}`;

  return (
    <div
      className={`relative h-full w-full bg-gradient-to-b ${palette.bg} overflow-hidden`}
    >
      {/* 1. Base Stylized Poster Layer */}
      <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden p-6 text-center select-none">
        <div
          className="pointer-events-none absolute top-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{ background: palette.glow }}
        />
        <span className="line-clamp-2 px-2 text-white/90 font-semibold drop-shadow-md">{title}</span>
      </div>

      {/* 2. Cover Image Layer */}
      {!imgFailed && (
        <Image
          ref={imgRef}
          src={imgSrc}
          alt={title}
          fill
          loading={index < 6 ? "eager" : "lazy"}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-90"} ${isHovered ? "scale-105" : "scale-100"}`}
          onLoad={() => setIsLoaded(true)}
          onError={handleImageError}
        />
      )}

      {/* 3. 5-Second Video Hover Snippet */}
      {isHovered && (
        <div className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-hidden animate-[fade-in_0.2s_ease-out]">
          <iframe
            src={embedSnippetUrl}
            title={title}
            className="pointer-events-none absolute -top-[100%] -left-[100%] z-10 h-[300%] w-[300%] transform-gpu border-0 object-cover"
            allow="autoplay; encrypted-media"
          />
        </div>
      )}
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
    (member?.role === "admin" ||
      member?.role === "crew" ||
      (member as any)?.isAdmin === true),
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

  const handleFilterChange = useCallback((newFilter: string) => {
    setActiveFilter(newFilter.toUpperCase());
  }, []);

  // Add Video Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  useScrollLock(Boolean(playingVideo || isAddModalOpen));
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const availableCategories = React.useMemo(() => {
    const defaults = [
      "Official Music Videos",
      "TV Appearances",
      "Full Concerts",
      "Cover Songs",
      "Songs In Movies & TV",
      "Cruise Videos",
      "College Shows",
      "Misc. / Various",
      "Live Footage",
      "Medley's",
      "Live Feeds",
    ];
    const fromCategories: string[] = [];
    for (let i = 0; i < categories.length; i++) {
      if (categories[i].category) fromCategories.push(categories[i].category);
    }
    return Array.from(
      new Set([...defaults, ...fromCategories, ...customCategories]),
    );
  }, [categories, customCategories]);

  const fetchCategories = useCallback(async () => {
    try {
      const r = await fetch("/data/videos.json");
      let baseCategories: VideoCategory[] = [];
      if (r.ok) {
        baseCategories = await r.json();
      }

      let hasExtraVideos = false;
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
                  hasExtraVideos = true;
                }
              } else {
                baseCategories.push({
                  category: sv.category || "Misc. / Various",
                  videos: [formattedVideo],
                });
                hasExtraVideos = true;
              }
            });
          }
        }
      } catch { }

      try {
        const rawLocal = localStorage.getItem("7th_heaven_custom_videos_v1");
        if (rawLocal) {
          const customVids: any[] = JSON.parse(rawLocal);
          customVids.forEach((cv) => {
            const targetCat = baseCategories.find(
              (c) => c.category.toLowerCase() === cv.category?.toLowerCase(),
            );
            const formattedVideo: Video = {
              id: cv.id,
              title: cv.title,
              year: cv.year,
              duration: cv.duration,
              description: cv.description,
              category: cv.category,
            };
            if (targetCat) {
              if (!targetCat.videos.some((v) => v.id === formattedVideo.id)) {
                targetCat.videos.unshift(formattedVideo);
                hasExtraVideos = true;
              }
            } else {
              baseCategories.push({
                category: cv.category,
                videos: [formattedVideo],
              });
              hasExtraVideos = true;
            }
          });
        }
      } catch { }

      if (hasExtraVideos) {
        setCategories(baseCategories);
      }
    } catch { }
  }, []);

  const [prefetchLimit, setPrefetchLimit] = useState<number>(6);

  useEffect(() => {
    fetchCategories();

    // After top 6 initial videos load, start downloading remaining videos in the background
    const bgPreloadTimer = setTimeout(() => {
      setPrefetchLimit(100);
    }, 2000);

    return () => clearTimeout(bgPreloadTimer);
  }, [fetchCategories]);

  // Flatten all videos with their category attached
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

  // Filtered videos array based on active filter tab & search query
  const filteredVideos = React.useMemo(() => {
    return allVideos.filter((v) => {
      const matchesCategory =
        activeFilter === "ALL" ||
        v.category?.toUpperCase() === activeFilter.toUpperCase();
      const matchesSearch =
        !searchQuery.trim() ||
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.description &&
          v.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [allVideos, activeFilter, searchQuery]);

  const CARDS_PER_BATCH = 12;
  const [visibleCount, setVisibleCount] = useState(CARDS_PER_BATCH);
  useEffect(() => {
    setVisibleCount(CARDS_PER_BATCH);
  }, [activeFilter, searchQuery]);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + CARDS_PER_BATCH, filteredVideos.length),
          );
        }
      },
      { rootMargin: "600px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredVideos.length]);

  const visibleVideos = filteredVideos.slice(0, visibleCount);
  const hasMoreVideos = visibleCount < filteredVideos.length;

  const handleAddVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedId = extractYouTubeId(newUrl);
    if (!parsedId || parsedId.length !== 11) {
      alert("Please enter a valid 11-character YouTube video URL or ID.");
      return;
    }

    const targetCategory = (
      isCustomCategory ? customCategoryInput : newCategory
    ).trim();
    if (!targetCategory) {
      alert("Please select or enter a video category.");
      return;
    }

    setSubmitting(true);

    const videoObj = {
      id: parsedId,
      title: newTitle.trim() || "Untitled Video",
      year: parseInt(newYear, 10) || new Date().getFullYear(),
      duration: newDuration.trim() || "3:30",
      description: newDesc.trim(),
      category: targetCategory,
    };

    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: videoObj.title,
          youtubeUrl: videoObj.id,
          category: videoObj.category,
          year: videoObj.year,
          duration: videoObj.duration,
          description: videoObj.description,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save video to Sanity.");
      }

      const rawLocal = localStorage.getItem("7th_heaven_custom_videos_v1");
      const existing: any[] = rawLocal ? JSON.parse(rawLocal) : [];
      const updated = [
        videoObj,
        ...existing.filter((v: any) => v.id !== videoObj.id),
      ];
      localStorage.setItem(
        "7th_heaven_custom_videos_v1",
        JSON.stringify(updated),
      );

      if (isCustomCategory && customCategoryInput.trim()) {
        setCustomCategories((prev) =>
          Array.from(new Set([...prev, customCategoryInput.trim()])),
        );
      }

      setCategories((prev) => {
        const next = [...prev];
        let cat = next.find(
          (c) => c.category.toLowerCase() === videoObj.category.toLowerCase(),
        );
        if (!cat) {
          cat = { category: videoObj.category, videos: [] };
          next.push(cat);
        }
        if (!cat.videos.some((v) => v.id === videoObj.id)) {
          cat.videos.unshift(videoObj);
        }
        return next;
      });

      setActiveFilter(videoObj.category.toUpperCase());
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

  return (
    <main
      className="page-container relative min-h-screen overflow-hidden"
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
          className=""
        />

        {/* ── 700+ SONG MP3/CD AUDIO VAULT PLAYER (TOP OF MEDIA PAGE) ── */}
        <section id="audio-vault" aria-labelledby="audio-vault-heading" className="section">
          <SectionHeader id="audio-vault-heading" title="Audio Vault Player" visuallyHidden />
          <div>
            <AudioPlayer />
          </div>
        </section>

        {/* ── TALL VERTICAL POSTER CARD GRID (Staggered Column Elevation Layout) ── */}
        {/* min-h prevents CLS when filter switch remounts section with fewer cards */}
        <section id="media-gallery" aria-labelledby="media-gallery-heading" className="section">
          <SectionHeader id="media-gallery-heading" title="Media Gallery" visuallyHidden />

          <div role="toolbar" aria-label="Media Filters" className="mb-10 lg:mb-12">
            {/* ── SEARCH & ADD VIDEO UTILITY BAR ── */}
            <div className="mb-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
            </div>

            {/* ── CENTERED CATEGORY FILTER PILLS BAR ── */}
            <nav
              aria-label="Media Categories"
              className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2.5"
            >
              <SeventhButton
                type="button"
                onClick={() => handleFilterChange("ALL")}
                isActive={activeFilter === "ALL"}
                className="!w-auto [&>span]:!min-w-0"
              >
                ALL
              </SeventhButton>

              {categories.map((cat) => {
                if (
                  !cat.category ||
                  !cat.category.trim() ||
                  cat.videos.length === 0
                )
                  return null;
                const catUpper = cat.category.toUpperCase();
                const isActive = activeFilter.toUpperCase() === catUpper;
                return (
                  <SeventhButton
                    key={cat.category}
                    type="button"
                    onClick={() => handleFilterChange(catUpper)}
                    isActive={isActive}
                    className="!w-auto [&>span]:!min-w-0"
                  >
                    {catUpper}
                  </SeventhButton>
                );
              })}
            </nav>
          </div>

          <div className="min-h-[60vh] [overflow-anchor:auto] pt-2 lg:pt-4">
            <ul key={activeFilter} className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleVideos.map((video, index) => {
                const isHovered = hoveredVideoId === video.id;
                const isMiddleCol = index % 3 === 1;

                return (
                  <li key={`${activeFilter}-${video.id}`}>
                    <article
                      className={`group relative flex aspect-[16/10] animate-[fade-in_0.35s_ease-out_both] stagger-item flex-col overflow-hidden rounded-[var(--radius-box)] bg-[#0c071a] sm:aspect-[3/4.2] ${isMiddleCol ? "lg:z-10 lg:-translate-y-4" : "lg:translate-y-4"}`}
                      style={{ "--i": Math.min(index, 9) } as React.CSSProperties}
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={`Play ${video.title}`}
                        onMouseEnter={() => setHoveredVideoId(video.id)}
                        onMouseLeave={() => setHoveredVideoId(null)}
                        onClick={() => setPlayingVideo(video)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setPlayingVideo(video);
                          }
                        }}
                        className="focus-ring relative h-full w-full cursor-pointer text-left select-none"
                      >
                        {/* Full Bleed Visual Media Player Preview */}
                        <div className="absolute inset-0 h-full w-full">
                          <VideoCardVisual
                            key={video.id}
                            videoId={video.id}
                            title={video.title}
                            isHovered={isHovered}
                            index={index}
                          />
                        </div>

                        {/* Dark Gradient Overlay at Bottom */}
                        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 group-hover:opacity-0" />

                        {/* Centered Glass Play Button Above Dark Overlay */}
                        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center group-hover:scale-110 group-hover:opacity-0">
                          <GlassPlayButton size="lg" as="div" />
                        </div>

                        {/* Bottom Overlay Info (Category Tag + Title + Metadata with Responsive Fixed Padding) */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center justify-end p-4 text-center group-hover:opacity-0 sm:p-8">
                          {/* Category Pill Tag */}
                          <span className="mb-2 inline-flex shrink-0 items-center justify-center !rounded-lg border border-white/10 bg-white/20 px-3 py-1.5 text-center">
                            {video.category || "7TH HEAVEN"}
                          </span>

                          {/* Poster Title Container with Responsive Height */}
                          <div className="flex h-10 items-center justify-center sm:h-14">
                            <span className="block line-clamp-2 font-bold drop-shadow-md   sm:text-lg">
                              {video.title}
                            </span>
                          </div>

                          {/* Year / Duration Metadata */}
                          <span className="shrink-0">
                            {video.year || "2026"}{" "}
                            {video.duration ? `• ${video.duration}` : ""}
                          </span>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>

          {hasMoreVideos && (
            <div ref={loadMoreRef} className="flex justify-center py-10">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((prev) =>
                    Math.min(prev + CARDS_PER_BATCH, filteredVideos.length),
                  )
                }
                className="btn-secondary cursor-pointer rounded-full px-6 py-2.5"
              >
                {sanityContent?.loadMoreText || "Load more"} (
                {filteredVideos.length - visibleCount} more)
              </button>
            </div>
          )}

          {/* Empty State */}
          {filteredVideos.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/5 py-24 text-center">
              <Search className="mx-auto mb-6 h-12 w-12 text-purple-400/50" />
              <p>
                {sanityContent?.noResultsTitle || "No media found matching"}{" "}
                &quot;{searchQuery}&quot;
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("ALL");
                }}
                className="btn-primary mt-4 cursor-pointer  px-6 py-2.5"
              >
                {sanityContent?.clearFiltersText || "Clear Filters & Search"}
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ── FULL SCREEN VIDEO MODAL ── */}
      {mounted &&
        playingVideo &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] flex h-full h-dvh w-full cursor-pointer animate-[fade-in_0.2s_ease-out] flex-col bg-black p-0"
            onClick={() => setPlayingVideo(null)}
          >
            <div
              className="relative flex h-full w-full flex-col overflow-hidden bg-black"
            >
              {/* Modal Header Bar */}
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-black/90 px-4 pt-safe sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-purple-400/30 bg-purple-500/20 px-3 py-1 font-bold text-purple-300">
                    {playingVideo.category || "7TH HEAVEN"}
                  </span>
                  <span className="line-clamp-1 font-bold text-white sm:text-lg">
                    {playingVideo.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPlayingVideo(null)}
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
                  onClose={() => setPlayingVideo(null)}
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
                  <div className="flex h-8 w-8 items-center justify-center  border border-purple-500/40 bg-purple-500/20">
                    <VideoIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3>
                      {sanityContent?.modalTitle || "Add Video to Media Vault"}
                    </h3>
                    <p className="/70">
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
                            <span>Valid Video Link Detected</span>
                          </div>
                          <p className="mt-0.5 text-purple-200/80">
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
                      <label className="block ">
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
                        className="hover: cursor-pointer text-[10px] text-purple-400"
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
                    className="cursor-pointer  hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex cursor-pointer items-center gap-2  bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-6 py-2.5 shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:from-purple-500 hover:to-pink-500 disabled:opacity-50"
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
