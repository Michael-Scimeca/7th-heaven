/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";
import Image from 'next/image';
import staticVideoCategories from "../../../public/data/videos.json";

import React, { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Plus, X, Video as VideoIcon, CheckCircle2, Play, Search } from "lucide-react";
import SearchInput from "@/components/SearchInput";
import dynamic from "next/dynamic";
import { useMember } from "@/context/MemberContext";
import SeventhButton from "@/components/SeventhButton";
import GlassPlayButton from "@/components/GlassPlayButton";
import AddCmsButton from "@/components/AddCmsButton";

const CustomVideoPlayer = dynamic(() => import("@/components/CustomVideoPlayer"), { ssr: false });
const AudioPlayer = dynamic(() => import("@/components/AudioPlayer"), { ssr: false });

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
  { bg: "from-[#1e0b36] via-[#0d061c] to-[#05020a]", accent: "from-purple-500 to-indigo-500", glow: "rgba(168,85,247,0.3)" },
  { bg: "from-[#0b1b36] via-[#060c1c] to-[#02050a]", accent: "from-blue-500 to-cyan-500", glow: "rgba(59,130,246,0.3)" },
  { bg: "from-[#360b24] via-[#1c0613] to-[#0a0207]", accent: "from-pink-500 to-rose-500", glow: "rgba(244,63,94,0.3)" },
  { bg: "from-[#29170b] via-[#140b05] to-[#080402]", accent: "from-amber-500 to-orange-500", glow: "rgba(245,158,11,0.3)" },
  { bg: "from-[#0b3620] via-[#051c10] to-[#020a05]", accent: "from-emerald-500 to-teal-500", glow: "rgba(16,185,129,0.3)" },
  { bg: "from-[#250b36] via-[#12051c] to-[#07020a]", accent: "from-violet-500 to-fuchsia-500", glow: "rgba(217,70,239,0.3)" },
];

function VideoCardVisual({
  videoId,
  title,
  isHovered,
  index = 0,
  shouldPrefetch = index < 6,
}: {
  videoId: string;
  title: string;
  isHovered: boolean;
  index?: number;
  shouldPrefetch?: boolean;
}) {
  const palette = GRADIENT_PALETTES[index % GRADIENT_PALETTES.length];
  const [imgSrc, setImgSrc] = useState<string>(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
  const [imgFailed, setImgFailed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const handleImageError = () => {
    if (imgSrc.includes('hqdefault.jpg')) {
      setImgSrc(`https://i.ytimg.com/vi/${videoId}/0.jpg`);
    } else {
      setImgFailed(true);
    }
  };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  // 5-Second snippet clip of this specific video (loops between 10s and 15s)
  const embedSnippetUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}&start=10&end=15&playsinline=1&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(originUrl)}`;

  // Preload top 6 video iframe snippets so hover video plays immediately with zero delay
  const isTop6 = index < 6 || shouldPrefetch;
  const shouldRenderIframe = isHovered || isTop6;

  return (
    <div className={`relative w-full h-full bg-gradient-to-b ${palette.bg} overflow-hidden`}>
      {/* 1. Base Stylized Poster Layer */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{ background: palette.glow }}
        />
        <div className="w-20 h-20 flex items-center justify-center mb-6">
          <GlassPlayButton size="lg" />
        </div>
        <h4 className="/90 line-clamp-2 px-2 drop-shadow-md">
          {title}
        </h4>
      </div>

      {/* 2. Cover Image Layer */}
      {!imgFailed && (
        <Image
          src={imgSrc}
          alt={title}
          fill
          loading={isTop6 ? "eager" : "lazy"}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-all duration-300 ease-out ${isLoaded ? "opacity-100" : "opacity-0"} ${isHovered ? "scale-105" : "scale-100"}`}
          unoptimized
          onLoad={() => setIsLoaded(true)}
          onError={handleImageError}
        />
      )}

      {/* 3. 5-Second Video Hover Snippet (Pre-buffered for top 6, instant playback on hover) */}
      {shouldRenderIframe && (
        <div className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-10 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}>
          <iframe
            src={embedSnippetUrl}
            title={title}
            loading={isTop6 ? "eager" : "lazy"}
            onLoad={() => setIframeLoaded(true)}
            className="w-[300%] h-[300%] -top-[100%] -left-[100%] absolute object-cover pointer-events-none border-0 z-10 transform-gpu"
            allow="autoplay; encrypted-media"
          />
        </div>
      )}

    </div>
  );
}

function extractYouTubeId(urlOrId: string): string {
  const match = urlOrId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) return match[1];
  const clean = urlOrId.trim();
  if (clean.length === 11 && /^[\w-]+$/.test(clean)) return clean;
  return clean;
}

export default function MediaClient({ sanityContent }: { sanityContent?: any }) {
  const { member, isLoggedIn } = useMember();
  const isAdmin = Boolean(isLoggedIn && (member?.role === 'admin' || member?.role === 'crew' || (member as any)?.isAdmin === true));
  const mounted = useSyncExternalStore(
    () => () => { },
    () => true,
    () => false
  );

  const [categories, setCategories] = useState<VideoCategory[]>(staticVideoCategories as VideoCategory[]);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const handleFilterChange = useCallback((newFilter: string) => {
    setActiveFilter(newFilter.toUpperCase());
  }, []);

  // Add Video Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState("Official Music Videos");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [newYear, setNewYear] = useState(() => new Date().getFullYear().toString());
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
    return Array.from(new Set([...defaults, ...fromCategories, ...customCategories]));
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
              const targetCat = baseCategories.find((c) => c.category.toLowerCase() === sv.category?.toLowerCase());
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
            const targetCat = baseCategories.find((c) => c.category.toLowerCase() === cv.category?.toLowerCase());
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
      const matchesCategory = activeFilter === "ALL" || v.category?.toUpperCase() === activeFilter.toUpperCase();
      const matchesSearch = !searchQuery.trim() ||
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()));
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
          setVisibleCount((prev) => Math.min(prev + CARDS_PER_BATCH, filteredVideos.length));
        }
      },
      { rootMargin: "600px" }
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

    const targetCategory = (isCustomCategory ? customCategoryInput : newCategory).trim();
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
      const updated = [videoObj, ...existing.filter((v: any) => v.id !== videoObj.id)];
      localStorage.setItem("7th_heaven_custom_videos_v1", JSON.stringify(updated));

      if (isCustomCategory && customCategoryInput.trim()) {
        setCustomCategories((prev) => Array.from(new Set([...prev, customCategoryInput.trim()])));
      }

      setCategories((prev) => {
        const next = [...prev];
        let cat = next.find((c) => c.category.toLowerCase() === videoObj.category.toLowerCase());
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
      setToastMessage(`🎉 Video "${videoObj.title}" successfully added under "${videoObj.category}"!`);
      setTimeout(() => setToastMessage(null), 4500);
    } catch (err: any) {
      alert(err?.message || "Failed to save video.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen page-container relative overflow-hidden" id="media-page">
      <div className="site-container relative z-10">
        {/* ── CENTERED PAGE TITLE ── */}
        <header className="text-center mb-6">
          <h1>
            {sanityContent?.heroHeading || sanityContent?.title || "7TH HEAVEN MEDIA VAULT"}
          </h1>
          <p className="mt-2 max-w-xl mx-auto">
            {sanityContent?.heroSubheading || sanityContent?.subtitle || "40 years of music, live performances, official music videos, and press highlights."}
          </p>
        </header>

        {/* ── 700+ SONG MP3/CD AUDIO VAULT PLAYER (TOP OF MEDIA PAGE) ── */}
        <section aria-label="Audio Vault Player" className="pb-6">
          <AudioPlayer />
        </section>

        <section className="mb-6">
          {/* ── SEARCH & ADD VIDEO UTILITY BAR ── */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={sanityContent?.searchPlaceholder || "Search Media..."}
              containerClassName="w-full sm:w-[320px]"
            />
            <AddCmsButton
              label={sanityContent?.addVideoButtonText || "ADD VIDEO / MEDIA IN SANITY CMS"}
              onClick={() => setIsAddModalOpen(true)}
            />
          </div>

          {/* ── CENTERED CATEGORY FILTER PILLS BAR ── */}
          <nav aria-label="Media Categories" className="flex flex-wrap items-center justify-center gap-2.5 max-w-5xl mx-auto">
            <SeventhButton
              type="button"
              onClick={() => handleFilterChange("ALL")}
              isActive={activeFilter === "ALL"}
              className="!w-auto  [&>span]:!px-4 [&>span]:!py-2 [&>span]:!min-w-0"
            >
              ALL
            </SeventhButton>

            {categories.map((cat) => {
              if (!cat.category || !cat.category.trim() || cat.videos.length === 0) return null;
              const catUpper = cat.category.toUpperCase();
              const isActive = activeFilter.toUpperCase() === catUpper;
              return (
                <SeventhButton
                  key={cat.category}
                  type="button"
                  onClick={() => handleFilterChange(catUpper)}
                  isActive={isActive}
                  className="!w-auto [&>span]:!px-4 [&>span]:!py-2 [&>span]:!min-w-0"
                >
                  {catUpper}
                </SeventhButton>
              );
            })}
          </nav>

        </section>

        {/* ── TALL VERTICAL POSTER CARD GRID (Staggered Column Elevation Layout) ── */}
        <section aria-label="Media Gallery" key={activeFilter}>
          <ul className="py-section-fluid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {visibleVideos.map((video, index) => {
              const isHovered = hoveredVideoId === video.id;
              const isMiddleCol = index % 3 === 1;

              return (
                <li key={`${activeFilter}-${video.id}`}>
                  <article
                    className={`group relative flex flex-col aspect-[16/10] sm:aspect-[3/4.2] overflow-hidden transition-all duration-500 bg-[#0c071a] animate-[fade-in_0.35s_ease-out_both] ${isMiddleCol ? "lg:-translate-y-6 lg:z-10" : "lg:translate-y-4"}`}
                    style={{ animationDelay: `${Math.min(index, 9) * 30}ms` }}>
                    <button
                      type="button"
                      aria-label={`Play ${video.title}`}
                      onMouseEnter={() => setHoveredVideoId(video.id)}
                      onMouseLeave={() => setHoveredVideoId(null)}
                      onClick={() => setPlayingVideo(video)}
                      className="w-full h-full text-left relative focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer">
                      {/* Full Bleed Visual Media Player Preview */}
                      <div className="absolute inset-0 w-full h-full">
                        <VideoCardVisual key={video.id} videoId={video.id} title={video.title} isHovered={isHovered} index={index} shouldPrefetch={index < prefetchLimit} />
                      </div>

                      {/* Dark Gradient Overlay at Bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none z-10" />

                      {/* Centered Glass Play Button Above Dark Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none group-hover:scale-110 group-hover:opacity-0 transition-all duration-300">
                        <GlassPlayButton size="lg" />
                      </div>

                      {/* Bottom Overlay Info (Category Tag + Title + Metadata with Responsive Fixed Padding) */}
                      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8 z-20 flex flex-col items-center text-center justify-end pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
                        {/* Category Pill Tag */}
                        <span className="inline-flex items-center justify-center text-center px-3 py-1.5 !rounded-lg bg-white/20 backdrop-blur-md border border-white/10 shrink-0 mb-2">
                          {video.category || "7TH HEAVEN"}
                        </span>

                        {/* Poster Title Container with Responsive Height */}
                        <div className="h-10 sm:h-14 flex items-center justify-center">
                          <h3 className="drop-shadow-md line-clamp-2 font-bold">
                            {video.title}
                          </h3>
                        </div>

                        {/* Year / Duration Metadata */}
                        <span className="shrink-0 text-white/70 text-xs">
                          {video.year || "2026"} {video.duration ? `• ${video.duration}` : ""}
                        </span>
                      </div>
                    </button>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>

        {hasMoreVideos && (
          <div ref={loadMoreRef} className="flex justify-center py-10">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => Math.min(prev + CARDS_PER_BATCH, filteredVideos.length))}
              className="btn-secondary rounded-full px-6 py-2.5 text-sm cursor-pointer">
              {sanityContent?.loadMoreText || "Load more"} ({filteredVideos.length - visibleCount} more)
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredVideos.length === 0 && (
          <div className="py-24 text-center bg-white/5 rounded-3xl border border-white/10">
            <Search className="w-12 h-12 text-purple-400/50 mx-auto mb-6" />
            <p className=" ">{sanityContent?.noResultsTitle || "No media found matching"} &quot;{searchQuery}&quot;</p>
            <button
              onClick={() => { setSearchQuery(""); setActiveFilter("ALL"); }}
              className="btn-primary mt-4 px-6 py-2.5 rounded-lg cursor-pointer">
              {sanityContent?.clearFiltersText || "Clear Filters & Search"}
            </button>
          </div>
        )}
      </div>

      {/* ── CENTERED VIDEO MODAL ── */}
      {mounted && playingVideo && createPortal(
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/85 backdrop-blur-md animate-[fade-in_0.2s_ease-out]"
          onClick={() => setPlayingVideo(null)}
        >
          <div
            className="relative w-full max-w-5xl bg-[#090414] border border-purple-500/30 rounded-2xl overflow-hidden] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/60">
              <div className="flex items-center gap-3">
                <span className="text-xs    px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  {playingVideo.category || "7TH HEAVEN"}
                </span>
                <h3 className=" sm:text-lg    line-clamp-1">
                  {playingVideo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPlayingVideo(null)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20   hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player 16:9 Aspect Ratio Container */}
            <div className="relative w-full aspect-video bg-black overflow-hidden">
              <CustomVideoPlayer
                videoId={playingVideo.id}
                title={playingVideo.title}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999999] bg-gradient-to-r from-purple-950 to-black border border-purple-500/50 px-5 py-3.5 rounded-lg flex items-center gap-3 shadow-2xl">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Add Video Modal */}
      {mounted && isAddModalOpen && createPortal(
        <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-[fade-in_0.15s_ease-out]">
          <div className="bg-[#0f0921] border border-purple-500/40 rounded-2xl w-full max-w-lg overflow-hidden p-6 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                  <VideoIcon className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <h3 className="  ">{sanityContent?.modalTitle || "Add Video to Media Vault"}</h3>
                  <p className="text-xs text-purple-300/70">{sanityContent?.modalSubtitle || "Syncs to Sanity CMS & Media Hub"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="btn-ghost p-1 cursor-pointer">
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <form onSubmit={handleAddVideoSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-purple-300">
                  Video URL or ID <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="Paste video link or ID..."
                  className="interactive-input w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {(() => {
                const parsed = extractYouTubeId(newUrl);
                if (parsed && parsed.length === 11) {
                  return (
                    <div className="p-3 bg-purple-950/40 border border-purple-500/40 rounded-lg flex items-center gap-4">
                      <div className="relative w-24 h-14 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-black">
                        <Image
                          src={`https://img.youtube.com/vi/${parsed}/hqdefault.jpg`}
                          alt="Thumbnail preview"
                          fill
                          sizes="96px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-purple-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Valid Video Link Detected</span>
                        </div>
                        <p className="mt-0.5 text-xs text-purple-200/80">ID: {parsed}</p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div>
                <label className="block text-[10px] text-purple-300">
                  Video Title <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Ain't That Just Beautiful (Official Video)"
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2.5 placeholder: text-white/30 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] text-purple-300">
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
                      className="text-[10px]   text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                    >
                      {isCustomCategory ? "← Select List" : "+ New Category"}
                    </button>
                  </div>

                  {isCustomCategory ? (
                    <input
                      type="text"
                      required
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      placeholder="e.g. Acoustic Sessions"
                      className="w-full bg-black/60 border border-purple-500/50 rounded-lg px-3 py-2.5 placeholder: text-white/30 focus:outline-none focus:border-purple-400 text-sm"
                    />
                  ) : (
                    <select
                      value={newCategory}
                      onChange={(e) => {
                        if (e.target.value === "__CUSTOM__") {
                          setIsCustomCategory(true);
                          setCustomCategoryInput("");
                        } else {
                          setNewCategory(e.target.value);
                        }
                      }}
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2.5 focus:outline-none focus:border-purple-400 cursor-pointer text-sm"
                    >
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__CUSTOM__">✨ + Add Custom Category...</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] text-purple-300">
                    Release Year
                  </label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    placeholder="2026"
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2.5 placeholder: text-white/30 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-purple-300">
                  Description / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Filmed live at Frontier Days..."
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 placeholder: text-white/30 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-white/70 hover:text-white transition-colors cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 rounded-lg    text-xs transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)] cursor-pointer disabled:opacity-50 flex items-center gap-2">
                  {submitting
                    ? (sanityContent?.modalSavingText || "Saving to Sanity...")
                    : (sanityContent?.modalSubmitText || "+ PUBLISH VIDEO TO SANITY")}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </main>
  );
}
