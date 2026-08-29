"use client";
import Image from 'next/image';
import staticVideoCategories from "../../../public/data/videos.json";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, X, Video as VideoIcon, CheckCircle2, Play, Search } from "lucide-react";
import SearchInput from "@/components/SearchInput";
import dynamic from "next/dynamic";
import { useMember } from "@/context/MemberContext";
import CosmicRadialButton from "@/components/CosmicRadialButton";

const CustomVideoPlayer = dynamic(() => import("@/components/CustomVideoPlayer"), { ssr: false });

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

const PREVIEW_VIDEO_CLIPS = [
  "/movie/be-here-clip.mp4",
  "/movie/color-in-motion-clip.mp4",
  "/movie/luminous-clip.mp4",
  "/movie/fest1-clip.mp4",
  "/movie/spectrum.mp4",
  "/movie/hero-colorinmostion.mp4",
  "/movie/next.mp4",
  "/movie/Adam.mp4",
  "/movie/Nick.mp4",
  "/movie/Rich.mp4",
  "/movie/Frankie.mp4",
  "/movie/Mark.mp4",
  "/movie/cruise.mp4",
  "/movie/ship-sea.mp4",
  "/movie/ship-port.mp4",
];

function VideoCardVisual({ videoId, title, isHovered, index = 0 }: { videoId: string; title: string; isHovered: boolean; index?: number }) {
  const palette = GRADIENT_PALETTES[index % GRADIENT_PALETTES.length];
  const [imgSrc, setImgSrc] = useState<string>(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
  const [imgFailed, setImgFailed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const clipUrl = PREVIEW_VIDEO_CLIPS[index % PREVIEW_VIDEO_CLIPS.length];

  // Instant 0ms HTML5 Video Playback on Hover
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isHovered) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [isHovered]);

  const handleImageError = () => {
    if (imgSrc.includes('hqdefault.jpg')) {
      setImgSrc(`https://i.ytimg.com/vi/${videoId}/0.jpg`);
    } else {
      setImgFailed(true);
    }
  };

  return (
    <div className={`relative w-full h-full bg-gradient-to-b ${palette.bg} overflow-hidden`}>
      {/* 1. Base Stylized Poster Layer (Paints immediately on frame 0) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{ background: palette.glow }}
        />
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 p-0.5 shadow-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
          <div className="w-full h-full rounded-full bg-black/80 backdrop-blur-md flex items-center justify-center border border-white/10">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        </div>
        <h4 className="text-white/90 font-bold uppercase tracking-wider line-clamp-2 px-2 drop-shadow-md">
          {title}
        </h4>
      </div>

      {/* 2. Cover Image Layer (Overlays base poster when available with smooth fade-in) */}
      {!imgFailed && (
        <Image
          src={imgSrc}
          alt={title}
          fill
          loading="eager"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-all duration-300 ease-out ${isLoaded ? "opacity-100" : "opacity-0"} ${isHovered ? "scale-105" : "scale-100"}`}
          unoptimized
          onLoad={() => setIsLoaded(true)}
          onError={handleImageError}
        />
      )}

      {/* 3. Native HTML5 Hover Video Preview Clip (Instant 0ms Latency — EverWonder Studio Architecture) */}
      <video
        ref={videoRef}
        src={clipUrl}
        muted
        loop
        playsInline
        preload="auto"
        className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300 pointer-events-none ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* 4. Hover Active Card Overlay */}
      <div
        className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-300 flex items-center justify-center bg-black/30 ${isHovered ? "opacity-100" : "opacity-0"}`}
      >
        <div className="w-16 h-16 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-2xl scale-100 group-hover:scale-110 transition-transform duration-300 border border-white/20">
          <Play className="w-7 h-7 fill-white ml-1 text-white" />
        </div>
      </div>
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

export default function MediaPage() {
  const { member } = useMember();
  const isAdmin = member?.role === 'admin' || member?.role === 'crew';

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
  const [newYear, setNewYear] = useState(() => new Date().getFullYear().toString());
  const [newDuration, setNewDuration] = useState("3:30");
  const [newDesc, setNewDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  useEffect(() => {
    fetchCategories();
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

  const handleAddVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const parsedId = extractYouTubeId(newUrl);
    if (!parsedId || parsedId.length !== 11) {
      alert("Please enter a valid 11-character YouTube video URL or ID.");
      return;
    }
    setSubmitting(true);

    const videoObj = {
      id: parsedId,
      title: newTitle.trim() || "Untitled Video",
      year: parseInt(newYear, 10) || new Date().getFullYear(),
      duration: newDuration.trim() || "3:30",
      description: newDesc.trim(),
      category: newCategory,
    };

    try {
      await fetch("/api/videos", {
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

      const rawLocal = localStorage.getItem("7th_heaven_custom_videos_v1");
      const existing: any[] = rawLocal ? JSON.parse(rawLocal) : [];
      const updated = [videoObj, ...existing.filter((v: any) => v.id !== videoObj.id)];
      localStorage.setItem("7th_heaven_custom_videos_v1", JSON.stringify(updated));

      setCategories((prev) => {
        const next = [...prev];
        let cat = next.find((c) => c.category === videoObj.category);
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
      setNewTitle("");
      setNewUrl("");
      setNewDesc("");
      setToastMessage(`🎉 Video "${videoObj.title}" successfully added!`);
      setTimeout(() => setToastMessage(null), 4500);
    } catch {
      alert("Failed to save video.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090514] text-white pt-20 pb-24 relative overflow-hidden">

      <div className="site-container relative z-10">
        {/* ── TOP UTILITY BAR (Search & Add Video) ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pt-4">
          <div className="flex items-center gap-2">
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto min-h-[38px] justify-end">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="SEARCH MEDIA..."
              containerClassName="w-full sm:w-[260px]"
            />
            {isAdmin && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold uppercase tracking-wider rounded-md transition-all hover:scale-105 cursor-pointer shrink-0 shadow-md animate-[fade-in_0.2s_ease-out]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Video</span>
              </button>
            )}
          </div>
        </div>

        {/* ── CENTERED CATEGORY FILTER PILLS BAR ── */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-5xl mx-auto mb-12">
          <button
            onClick={() => handleFilterChange("ALL")}
            className={`px-5 py-2.5 !rounded-lg font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer border ${activeFilter === "ALL"
              ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]"
              : "bg-[#18112b] text-white/90 hover:text-white hover:bg-purple-900/40 border-purple-500/20"
              }`}
          >
            ALL
          </button>

          {categories.map((cat) => {
            if (!cat.category || !cat.category.trim() || cat.videos.length === 0) return null;
            const catUpper = cat.category.toUpperCase();
            const isActive = activeFilter.toUpperCase() === catUpper;
            return (
              <button
                key={cat.category}
                onClick={() => handleFilterChange(catUpper)}
                className={`px-5 py-2.5 !rounded-lg font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer border ${isActive
                  ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                  : "bg-[#18112b] text-white/90 hover:text-white hover:bg-purple-900/40 border-purple-500/20"
                  }`}
              >
                {catUpper}
              </button>
            );
          })}
        </div>

        {/* ── TALL VERTICAL POSTER CARD GRID (Staggered Column Elevation Layout) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch pt-6 pb-6">
          {filteredVideos.map((video, index) => {
            const isHovered = hoveredVideoId === video.id;
            const isMiddleCol = index % 3 === 1;

            return (
              <div
                key={`${activeFilter}-${video.id}`}
                onMouseEnter={() => setHoveredVideoId(video.id)}
                onMouseLeave={() => setHoveredVideoId(null)}
                onClick={() => setPlayingVideo(video)}
                className={`group relative flex flex-col aspect-[16/10] sm:aspect-[3/4.2] rounded-lg overflow-hidden  transition-all duration-500  bg-[#0c071a] animate-[fade-in_0.35s_ease-out_both] ${isMiddleCol ? "lg:-translate-y-6 lg:z-10" : "lg:translate-y-4"
                  }`}
                style={{ animationDelay: `${Math.min(index, 9) * 30}ms` }}
              >
                {/* Full Bleed Visual Media Player Preview */}
                <div className="absolute inset-0 w-full h-full">
                  <VideoCardVisual key={video.id} videoId={video.id} title={video.title} isHovered={isHovered} index={index} />
                </div>

                {/* Dark Gradient Overlay at Bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 group-hover:opacity-75 transition-opacity pointer-events-none z-10" />

                {/* Hover Radial Play Icon Button */}
                <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <CosmicRadialButton
                    icon={false}
                    className="w-12 h-12 sm:w-16 sm:h-16 ! rounded-lg !p-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-purple-300/40 shadow-2xl"
                  >
                    <Play className="w-5 h-5 sm:w-7 sm:h-7 text-white fill-white ml-1" />
                  </CosmicRadialButton>
                </div>

                {/* Bottom Overlay Info (Category Tag + Title + Metadata with Responsive Fixed Padding) */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8 z-20 flex flex-col items-center text-center justify-end pointer-events-none">
                  {/* Category Pill Tag */}
                  <span className="inline-flex items-center justify-center leading-none text-center px-3 py-1.5 !rounded-lg bg-white/20 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border border-white/10 mb-1.5 sm:mb-3 shrink-0">
                    {video.category || "7TH HEAVEN"}
                  </span>

                  {/* Poster Title Container with Responsive Height */}
                  <div className="h-10 sm:h-14 flex items-center justify-center mb-1">
                    <h3
                      className="font-bold uppercase tracking-tight text-white drop-shadow-md leading-tight line-clamp-2"
                      style={{ fontFamily: "'Switzer', var(--font-barlow-condensed), sans-serif" }}
                    >
                      {video.title}
                    </h3>
                  </div>

                  {/* Year / Duration Metadata */}
                  <span className="text-[10px] sm:text-[11px] font-mono font-semibold text-purple-300/80 uppercase tracking-widest shrink-0">
                    {video.year || "2026"} {video.duration ? `• ${video.duration}` : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredVideos.length === 0 && (
          <div className="py-24 text-center bg-white/5 rounded-3xl border border-white/10">
            <Search className="w-12 h-12 text-purple-400/50 mx-auto mb-4" />
            <p className="font-semibold">No media found matching &quot;{searchQuery}&quot;</p>
            <button
              onClick={() => { setSearchQuery(""); setActiveFilter("ALL"); }}
              className="mt-4 px-6 py-2.5 rounded-lg bg-purple-600 text-white font-bold uppercase tracking-wider hover:bg-purple-500 transition-colors cursor-pointer"
            >
              Clear Filters & Search
            </button>
          </div>
        )}
      </div>

      {/* ── VIDEO PLAYER LIGHTBOX OVERLAY ── */}
      {playingVideo && (
        <div
          onClick={() => setPlayingVideo(null)}
          style={{ backdropFilter: "blur(45px)", WebkitBackdropFilter: "blur(45px)" }}
          className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-[45px] flex items-center justify-center p-4 sm:p-8 animate-[fade-in_0.2s_ease-out]"
        >
          <div className="relative w-full max-w-5xl aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl border border-purple-500/30">
            <CustomVideoPlayer
              videoId={playingVideo.id}
              title={playingVideo.title}
              onClose={() => setPlayingVideo(null)}
            />
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999999] bg-gradient-to-r from-purple-950 to-black border border-purple-500/50 text-white px-5 py-3.5 rounded-lg flex items-center gap-3 shadow-2xl">
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Add Video Modal */}
      {isAdmin && isAddModalOpen && (
        <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-[fade-in_0.15s_ease-out]">
          <div className="bg-[#0f0921] border border-purple-500/40 rounded-2xl w-full max-w-lg overflow-hidden p-6 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                  <VideoIcon className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <h3 className="font-bold uppercase tracking-wider text-white">Add Video to Media Vault</h3>
                  <p className="uppercase tracking-widest font-mono">Syncs to Sanity CMS & Media Hub</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVideoSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-300 mb-1">
                  Video URL or ID <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="Paste video link or ID..."
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400"
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
                        <div className="flex items-center gap-1.5 font-bold text-purple-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Valid Video Link Detected</span>
                        </div>
                        <p className="font-mono mt-0.5">ID: {parsed}</p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-300 mb-1">
                  Video Title <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Ain't That Just Beautiful (Official Video)"
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-300 mb-1">
                    Category <span className="text-pink-400">*</span>
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="Official Music Videos">Official Music Videos</option>
                    <option value="TV Appearances">TV Appearances</option>
                    <option value="Full Concerts">Full Concerts</option>
                    <option value="Cover Songs">Cover Songs</option>
                    <option value="Songs In Movies & TV">Songs In Movies & TV</option>
                    <option value="Cruise Videos">Cruise Videos</option>
                    <option value="College Shows">College Shows</option>
                    <option value="Misc. / Various">Misc. / Various</option>
                    <option value="Live Footage">Live Footage</option>
                    <option value="Medley's">Medley's</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-300 mb-1">
                    Release Year
                  </label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    placeholder="2026"
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-300 mb-1">
                  Description / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Filmed live at Frontier Days..."
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-bold text-white/70 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? "Saving to Sanity..." : "Publish Video to Vault"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
