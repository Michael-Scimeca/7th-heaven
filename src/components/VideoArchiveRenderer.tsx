"use client";

import React from "react";
import Image from "next/image";
import { videoThumb } from "@/lib/videoThumb";
import {
  Film,
  Play,
  Layers,
  Sparkles,
  Tv,
  List,
  Flame,
  Compass,
  LayoutGrid,
  Columns,
  Maximize2,
  Calendar,
  Radio,
  Sliders,
  Eye,
  Bookmark,
  Disc,
  Video as VideoIcon,
  Camera,
} from "lucide-react";
import GlassPlayButton from "@/components/GlassPlayButton";

export interface VideoItem {
  id: string;
  title: string;
  category?: string;
  year?: number;
  duration?: string;
  description?: string;
  viewCount?: string;
  mediaType?: "video" | "photo";
  photoSrc?: string;
  photographer?: string;
  venue?: string;
  city?: string;
}

export interface VideoLayoutPreset {
  id: number;
  name: string;
  badge: string;
  desc: string;
}

export const VIDEO_LAYOUT_PRESETS: VideoLayoutPreset[] = [
  { id: 1, name: "Editorial 3-Col", badge: "Balanced", desc: "Clean responsive 3-column cards with bold titles & release tags" },
  { id: 2, name: "Cinema Hero + Queue", badge: "Featured", desc: "Massive 16:9 stage spotlight followed by quick-browse cards" },
  { id: 3, name: "Category Rails", badge: "Streaming", desc: "Netflix-style horizontal categorized rows with quick view" },
  { id: 4, name: "Bento Feature Box", badge: "Modern", desc: "Asymmetric 2x2 highlight tile flanked by compact discovery slots" },
  { id: 5, name: "Compact Broadcast List", badge: "Dense", desc: "Broadcast-style high-density list with runtimes and instant preview" },
  { id: 6, name: "Split Screen Cinema", badge: "Spotlight", desc: "50/50 dual view: active video preview left, category queue right" },
  { id: 7, name: "Decade Timeline", badge: "Chronological", desc: "Time-grouped eras (2025+, 2020-2024, Classics) with year badges" },
  { id: 8, name: "Broadsheet Magazine", badge: "Editorial", desc: "Newspaper broadsheet layout with lead feature and headline dispatches" },
  { id: 9, name: "Live Concert Marquee", badge: "Arena", desc: "Ultra-wide live performance showcase with glowing stage badges" },
  { id: 10, name: "Video Jukebox", badge: "Quick Pick", desc: "Square-tile tactile cards focusing on song titles and album singles" },
  { id: 11, name: "TV Studio Broadcast", badge: "Media", desc: "Television appearance monitor styling with broadcast scanline flair" },
  { id: 12, name: "Dense 4-Column Matrix", badge: "Efficiency", desc: "Maximum videos visible per screen with fast scan hover controls" },
  { id: 13, name: "Cruise Vault Panorama", badge: "Annual Tour", desc: "Panoramic widescreen cards curated for travel & cruise specials" },
  { id: 14, name: "Hero Accordion Strip", badge: "Interactive", desc: "Full-width category banners that open into rich video showcases" },
  { id: 15, name: "Minimalist Cards", badge: "Ultra Clean", desc: "Border-free minimal photo cards focusing solely on imagery & title" },
  { id: 16, name: "Lead Story & 2-Col Grid", badge: "Curated", desc: "Top single headline card over balanced 2-column video archive" },
  { id: 17, name: "Cover Song Acoustic Loft", badge: "Covers", desc: "Warm spotlight on acoustic cover performances and live session tapes" },
  { id: 18, name: "Film Reel Strips", badge: "Classic", desc: "Sprocket-accented horizontal film strips across each category" },
  { id: 19, name: "High-Contrast Brutalist", badge: "Bold", desc: "Sharp borders, high-contrast monospace metadata and raw rock energy" },
  { id: 20, name: "Curator's Top Picks", badge: "Hall of Fame", desc: "Ranked numbered cards (#1 through #20) highlighting essential band cuts" },
];

interface VideoArchiveRendererProps {
  layoutId: number;
  videos: VideoItem[];
  allVideos: VideoItem[];
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  onPlayVideo: (video: VideoItem) => void;
  renderStandardCard: (video: VideoItem, isPriority?: boolean) => React.ReactNode;
}

export default function VideoArchiveRenderer({
  layoutId,
  videos,
  allVideos,
  activeCategory,
  onSelectCategory,
  onPlayVideo,
  renderStandardCard,
}: VideoArchiveRendererProps) {
  // Group videos by category for category-aware layouts
  const categoryGroups = React.useMemo(() => {
    const map = new Map<string, VideoItem[]>();
    allVideos.forEach((v) => {
      const cat = v.category || "Official Release";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(v);
    });
    return Array.from(map.entries()).map(([cat, vids]) => ({
      category: cat,
      videos: vids,
    }));
  }, [allVideos]);

  // Group videos by era for timeline layout
  const eraGroups = React.useMemo(() => {
    const eras: { era: string; videos: VideoItem[] }[] = [
      { era: "2024 – Present // New Releases", videos: [] },
      { era: "2020 – 2023 // Anthem Era", videos: [] },
      { era: "2015 – 2019 // Rock & Festival Highlights", videos: [] },
      { era: "Classic Vault // Heritage Performances", videos: [] },
    ];
    videos.forEach((v) => {
      const year = Number(v.year) || 2020;
      if (year >= 2024) eras[0].videos.push(v);
      else if (year >= 2020) eras[1].videos.push(v);
      else if (year >= 2015) eras[2].videos.push(v);
      else eras[3].videos.push(v);
    });
    return eras.filter((e) => e.videos.length > 0);
  }, [videos]);

  if (videos.length === 0) {
    return null;
  }

  const firstVideo = videos[0];
  const remainingVideos = videos.slice(1);

  /* -------------------------------------------------------------
     LAYOUT 1: EDITORIAL 3-COLUMN (Standard Responsive Showcase)
     ------------------------------------------------------------- */
  if (layoutId === 1) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:gap-x-6 lg:gap-y-12 items-start">
        {videos.map((v, i) => (
          <div key={v.id}>{renderStandardCard(v, i < 6)}</div>
        ))}
      </div>
    );
  }

  /* -------------------------------------------------------------
     LAYOUT 2: CINEMA HERO + QUEUE (Featured Stage Video Top)
     ------------------------------------------------------------- */
  if (layoutId === 2) {
    const isFirstPhoto = firstVideo?.mediaType === "photo";
    const firstImgSrc = isFirstPhoto && firstVideo?.photoSrc
      ? firstVideo.photoSrc
      : videoThumb(firstVideo?.id ?? "");

    const sideVideos = remainingVideos.slice(0, 3);
    const gridVideos = remainingVideos.slice(3);

    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {firstVideo && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => onPlayVideo(firstVideo)}
            className="group relative w-full overflow-hidden rounded-2xl shadow-2xl cursor-pointer lg:col-span-2 bg-black/60"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-black lg:absolute lg:inset-0 lg:aspect-auto">
              <Image
                src={firstImgSrc}
                alt={firstVideo.title}
                fill
                sizes="(min-width: 1024px) 66vw, 100vw"
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {/* Prominent Format Badge (Top-Left: VIDEO or PHOTO indicator) */}
              {isFirstPhoto ? (
                <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-20 flex items-center gap-2 rounded-full border border-purple-400/40 bg-black/80 backdrop-blur-md px-3 py-1.5 text-xs font-mono font-bold tracking-wider text-purple-200 shadow-xl shadow-black/80">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <Camera className="h-3.5 w-3.5 text-purple-300" />
                  <span>FEATURED PHOTO</span>
                  <span className="ml-1 border-l border-white/20 pl-2 text-white/80">
                    HIGH-RES
                  </span>
                </div>
              ) : (
                <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-20 flex items-center gap-2 rounded-full border border-purple-400/40 bg-black/80 backdrop-blur-md px-3 py-1.5 text-xs font-mono font-bold tracking-wider text-purple-200 shadow-xl shadow-black/80">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <VideoIcon className="h-3.5 w-3.5 text-purple-300" />
                  <span>OFFICIAL VIDEO</span>
                  {firstVideo.duration && (
                    <span className="ml-1 border-l border-white/20 pl-2 text-white/80">
                      {firstVideo.duration}
                    </span>
                  )}
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-6 sm:p-10 flex flex-col justify-end">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-3 w-3 rounded-full animate-pulse bg-rose-500"
                  />
                  <span className="text-xs uppercase font-mono tracking-widest text-[#f2efa3] font-bold">
                    {isFirstPhoto ? "Featured Band Photography" : "Featured Spotlight Video"}
                  </span>
                </div>
                <h3 className="font-heading text-3xl sm:text-5xl uppercase text-white mt-2 group-hover:text-[#f2efa3] transition-colors">
                  {firstVideo.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
                  {firstVideo.category} • {firstVideo.year}
                  {firstVideo.duration ? ` • ${firstVideo.duration}` : ""}
                </p>
              </div>
              {!isFirstPhoto && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <GlassPlayButton size="lg" as="div" glow className="transition-transform duration-300 transform scale-90 group-hover:scale-100" />
                </div>
              )}
            </div>
          </div>
        )}

        {sideVideos.length > 0 && (
          <div className="flex flex-col gap-4 lg:col-span-1">
            {sideVideos.map((v) => {
              const isPhoto = v.mediaType === "photo";
              const src = isPhoto && v.photoSrc ? v.photoSrc : videoThumb(v.id);
              return (
                <div
                  key={v.id}
                  role="button"
                  tabIndex={0}
                  aria-label={isPhoto ? `View photo: ${v.title}` : `Play video: ${v.title}`}
                  onClick={() => onPlayVideo(v)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onPlayVideo(v);
                    }
                  }}
                  className="group relative aspect-video w-full cursor-pointer overflow-hidden rounded-2xl bg-black/60"
                >
                  <Image
                    src={src}
                    alt={v.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/30 to-transparent p-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#f2efa3]">
                      {isPhoto ? "Photo" : "Video"}
                      {v.duration ? ` • ${v.duration}` : ""}
                    </span>
                    <h3 className="line-clamp-2 text-sm font-bold uppercase leading-tight text-white transition-colors group-hover:text-[#f2efa3]">
                      {v.title}
                    </h3>
                  </div>
                  {!isPhoto && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <GlassPlayButton size="sm" as="div" className="transition-transform duration-300 transform scale-90 group-hover:scale-100" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3">
          {gridVideos.map((v, i) => (
            <div key={v.id}>{renderStandardCard(v, i < 4)}</div>
          ))}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
     LAYOUT 3: CATEGORY RAILS (Streaming Rows by Category)
     ------------------------------------------------------------- */
  if (layoutId === 3) {
    return (
      <div className="flex flex-col gap-12">
        {categoryGroups.map((group) => (
          <div key={group.category} className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#f2efa3]" />
                <h3 className="font-heading text-xl sm:text-2xl uppercase tracking-wider text-white">
                  {group.category}
                </h3>
                <span className="text-xs text-white/50 font-mono">({group.videos.length})</span>
              </div>
              <button
                type="button"
                onClick={() => onSelectCategory(group.category.toUpperCase())}
                className="text-xs font-semibold text-[#f2efa3] hover:underline cursor-pointer"
              >
                View all {group.category} →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {group.videos.slice(0, 4).map((v) => (
                <div key={v.id}>{renderStandardCard(v)}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* -------------------------------------------------------------
     LAYOUT 4: BENTO FEATURE BOX (Asymmetric 2x2 Feature + Grid)
     ------------------------------------------------------------- */
  if (layoutId === 4) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {firstVideo && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => onPlayVideo(firstVideo)}
            className="md:col-span-2 relative group overflow-hidden rounded-2xl border border-white/15 bg-black/40 p-4 cursor-pointer"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-black">
              <Image
                src={videoThumb(firstVideo.id)}
                alt={firstVideo.title}
                fill
                sizes="(min-width: 768px) 66vw, 100vw"
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-6 flex flex-col justify-end">
                <span className="text-xs font-mono uppercase text-[#f2efa3] font-bold">Bento Headliner</span>
                <h3 className="font-heading text-3xl sm:text-4xl text-white uppercase group-hover:text-[#f2efa3] transition-colors">
                  {firstVideo.title}
                </h3>
                <span className="text-xs text-white/70">{firstVideo.category} • {firstVideo.year}</span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300">
                <GlassPlayButton size="lg" as="div" glow className="transition-transform duration-300 transform scale-90 group-hover:scale-100" />
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {remainingVideos.slice(0, 2).map((v) => (
            <div key={v.id}>{renderStandardCard(v)}</div>
          ))}
        </div>
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {remainingVideos.slice(2).map((v) => (
            <div key={v.id}>{renderStandardCard(v)}</div>
          ))}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
     LAYOUT 5: COMPACT BROADCAST LIST (Dense Runtimes & Fast Browsing)
     ------------------------------------------------------------- */
  if (layoutId === 5) {
    return (
      <div className="divide-y divide-white/10 border-y border-white/10">
        {videos.map((video, idx) => (
          <div
            key={video.id}
            role="button"
            tabIndex={0}
            onClick={() => onPlayVideo(video)}
            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 px-3 hover:bg-white/[0.03] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4 min-w-0">
              <span className="font-mono text-xs text-white/40 w-6">{(idx + 1).toString().padStart(2, "0")}</span>
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded bg-black">
                <Image
                  src={videoThumb(video.id)}
                  alt={video.title}
                  fill
                  sizes="112px"
                  className="object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Play className="h-4 w-4 fill-white text-white drop-shadow transition-transform duration-300 transform scale-90 group-hover:scale-100" />
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="font-heading text-lg sm:text-xl text-white uppercase group-hover:text-[#f2efa3] transition-colors truncate">
                  {video.title}
                </h3>
                <p className="text-xs text-white/50">{video.category} • {video.year || "Official Release"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-white/60 shrink-0 self-end sm:self-center">
              <span className="rounded bg-white/10 px-2 py-1">{video.duration || "Video"}</span>
              <span className="text-[#f2efa3] group-hover:underline">Play Now ▶</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* -------------------------------------------------------------
     LAYOUT 6: SPLIT SCREEN CINEMA (50/50 Stage & Scrollable Queue)
     ------------------------------------------------------------- */
  if (layoutId === 6) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {firstVideo && (
          <div className="lg:col-span-7 sticky top-24">
            <div
              role="button"
              tabIndex={0}
              onClick={() => onPlayVideo(firstVideo)}
              className="group relative overflow-hidden rounded-2xl border border-white/20 bg-black cursor-pointer shadow-2xl"
            >
              <div className="relative aspect-video w-full">
                <Image
                  src={videoThumb(firstVideo.id)}
                  alt={firstVideo.title}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <GlassPlayButton size="lg" as="div" glow className="transition-transform duration-300 transform scale-90 group-hover:scale-100" />
                </div>
              </div>
              <div className="p-6">
                <span className="text-xs font-mono text-[#f2efa3] uppercase">{firstVideo.category}</span>
                <h3 className="font-heading text-3xl uppercase text-white mt-1">{firstVideo.title}</h3>
                <p className="text-sm text-white/70 mt-2">{firstVideo.description || "7th Heaven Official Performance"}</p>
              </div>
            </div>
          </div>
        )}
        <div className="lg:col-span-5 flex flex-col gap-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
          <span className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1">Upcoming in Queue</span>
          {remainingVideos.map((v) => (
            <div
              key={v.id}
              role="button"
              tabIndex={0}
              onClick={() => onPlayVideo(v)}
              className="group flex gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-2 hover:border-[#f2efa3] hover:bg-white/[0.05] transition-all cursor-pointer"
            >
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded bg-black">
                <Image
                  src={videoThumb(v.id)}
                  alt={v.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <h4 className="font-heading text-sm text-white uppercase truncate group-hover:text-[#f2efa3]">{v.title}</h4>
                <span className="text-[11px] text-white/50">{v.category} • {v.duration || "Watch"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
     LAYOUT 7: DECADE TIMELINE (Chronological Groupings)
     ------------------------------------------------------------- */
  if (layoutId === 7) {
    return (
      <div className="flex flex-col gap-12">
        {eraGroups.map((group) => (
          <div key={group.era} className="relative pl-6 sm:pl-8 border-l-2 border-purple-500/40">
            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-purple-500 border-4 border-black" />
            <h3 className="font-heading text-2xl uppercase tracking-wider text-[#f2efa3] mb-6">
              {group.era}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.videos.map((v) => (
                <div key={v.id}>{renderStandardCard(v)}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* -------------------------------------------------------------
     LAYOUT 8: BROADSHEET MAGAZINE (Newsprint Headline Flow)
     ------------------------------------------------------------- */
  if (layoutId === 8) {
    return (
      <div className="border-t-2 border-b-2 border-white/20 py-8 space-y-8">
        <div className="text-center border-b border-white/10 pb-4">
          <span className="text-[11px] font-mono tracking-widest text-[#f2efa3] uppercase font-bold">
            The 7th Heaven Dispatch // Official Media Release
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {firstVideo && (
            <div className="lg:col-span-8">
              <div
                role="button"
                tabIndex={0}
                onClick={() => onPlayVideo(firstVideo)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black rounded-lg">
                  <Image
                    src={videoThumb(firstVideo.id)}
                    alt={firstVideo.title}
                    fill
                    sizes="(min-width: 1024px) 66vw, 100vw"
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <GlassPlayButton size="lg" as="div" glow className="transition-transform duration-300 transform scale-90 group-hover:scale-100" />
                  </div>
                </div>
                <h3 className="font-heading text-3xl sm:text-5xl uppercase text-white mt-4 group-hover:text-[#f2efa3] transition-colors leading-tight">
                  {firstVideo.title}
                </h3>
                <p className="font-quisas text-base text-white/80 mt-2">{firstVideo.category} — Released {firstVideo.year}</p>
              </div>
            </div>
          )}
          <div className="lg:col-span-4 flex flex-col gap-6 divide-y divide-white/10">
            {remainingVideos.slice(0, 3).map((v) => (
              <div
                key={v.id}
                role="button"
                tabIndex={0}
                onClick={() => onPlayVideo(v)}
                className="group pt-4 first:pt-0 cursor-pointer"
              >
                <span className="text-[10px] font-mono uppercase text-[#f2efa3]">{v.category}</span>
                <h4 className="font-heading text-xl text-white uppercase group-hover:text-[#f2efa3] transition-colors">
                  {v.title}
                </h4>
                <span className="text-xs text-white/50">{v.duration || "Watch"} • {v.year}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-white/10">
          {remainingVideos.slice(3).map((v) => (
            <div key={v.id}>{renderStandardCard(v)}</div>
          ))}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
     LAYOUT 9: LIVE CONCERT MARQUEE (Ultra-Wide Arena Focus)
     ------------------------------------------------------------- */
  if (layoutId === 9) {
    return (
      <div className="space-y-10">
        <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-black p-6 sm:p-8">
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase mb-3">
            <Flame className="h-4 w-4" />
            <span>Arena Concert Experience Archive</span>
          </div>
          <h3 className="font-heading text-3xl sm:text-4xl uppercase text-white mb-6">
            Live Stages, Festivals & Tour Broadcasts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {videos.slice(0, 2).map((v) => (
              <div key={v.id}>{renderStandardCard(v, true)}</div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {videos.slice(2).map((v) => (
            <div key={v.id}>{renderStandardCard(v)}</div>
          ))}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
     LAYOUT 10: VIDEO JUKEBOX (Square-Tile Album Single Focus)
     ------------------------------------------------------------- */
  if (layoutId === 10) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {videos.map((v) => (
          <div
            key={v.id}
            role="button"
            tabIndex={0}
            onClick={() => onPlayVideo(v)}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-zinc-950 p-2 hover:border-[#f2efa3] transition-all cursor-pointer"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black">
              <Image
                src={videoThumb(v.id)}
                alt={v.title}
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <Play className="h-8 w-8 fill-[#f2efa3] text-[#f2efa3]" />
              </div>
            </div>
            <div className="mt-2">
              <h4 className="font-heading text-sm text-white uppercase truncate group-hover:text-[#f2efa3]">{v.title}</h4>
              <span className="text-[10px] text-white/50 block truncate">{v.category}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* -------------------------------------------------------------
     LAYOUT 11: TV STUDIO BROADCAST (Monitor Scanlines & Tags)
     ------------------------------------------------------------- */
  if (layoutId === 11) {
    return (
      <div className="space-y-8 font-mono">
        <div className="border border-green-500/30 bg-black/80 p-4 rounded-xl flex items-center justify-between text-xs text-green-400">
          <span>● ON AIR // CHANNEL 7TH HEAVEN</span>
          <span>NTSC 1080P BROADCAST STREAM</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v, i) => (
            <div
              key={v.id}
              role="button"
              tabIndex={0}
              onClick={() => onPlayVideo(v)}
              className="group border border-white/20 bg-black p-3 hover:border-green-400 transition-colors cursor-pointer"
            >
              <div className="flex justify-between text-[11px] text-green-400/80 mb-2">
                <span>REC [{String(i + 1).padStart(2, "0")}]</span>
                <span>{v.duration || "LIVE"}</span>
              </div>
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                <Image
                  src={videoThumb(v.id)}
                  alt={v.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="object-cover"
                />
              </div>
              <h4 className="font-bold text-sm text-white uppercase mt-3 truncate group-hover:text-green-400">
                {v.title}
              </h4>
              <span className="text-xs text-white/50">{v.category}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
     LAYOUT 12: DENSE 4-COLUMN MATRIX (Max Screen Utilization)
     ------------------------------------------------------------- */
  if (layoutId === 12) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((v) => (
          <div key={v.id}>{renderStandardCard(v)}</div>
        ))}
      </div>
    );
  }

  /* -------------------------------------------------------------
     LAYOUT 13: CRUISE VAULT PANORAMA (Travel & Tour Specials)
     ------------------------------------------------------------- */
  if (layoutId === 13) {
    return (
      <div className="space-y-8">
        <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-blue-950/30 to-black p-6">
          <span className="text-xs font-mono text-sky-400 uppercase font-bold">Annual Band Cruise & Destination Tours</span>
          <h3 className="font-heading text-3xl uppercase text-white mt-1">Ocean Stage & Caribbean Concerts</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {videos.map((v) => (
            <div key={v.id}>{renderStandardCard(v)}</div>
          ))}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
     LAYOUT 14: HERO ACCORDION STRIP (Category Expanders)
     ------------------------------------------------------------- */
  if (layoutId === 14) {
    return (
      <div className="space-y-6">
        {categoryGroups.map((group) => {
          const isSelected = activeCategory === group.category.toUpperCase();
          return (
            <div key={group.category} className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <button
                type="button"
                onClick={() => onSelectCategory(isSelected ? "ALL" : group.category.toUpperCase())}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="font-heading text-2xl uppercase text-white">{group.category}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-[#f2efa3] font-mono">
                    {group.videos.length} videos
                  </span>
                </div>
                <span className="text-xs font-mono text-[#f2efa3]">
                  {isSelected ? "Collapse ✕" : "Expand Shelf ▶"}
                </span>
              </button>
              {isSelected && (
                <div className="p-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-black/40">
                  {group.videos.map((v) => (
                    <div key={v.id}>{renderStandardCard(v)}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  /* -------------------------------------------------------------
     LAYOUT 15: MINIMALIST CARDS (Zero Frame Clean Image Focus)
     ------------------------------------------------------------- */
  if (layoutId === 15) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map((v) => (
          <div
            key={v.id}
            role="button"
            tabIndex={0}
            onClick={() => onPlayVideo(v)}
            className="group cursor-pointer"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              <Image
                src={videoThumb(v.id)}
                alt={v.title}
                fill
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300">
                <GlassPlayButton size="md" as="div" className="transition-transform duration-300 transform scale-90 group-hover:scale-100" />
              </div>
            </div>
            <h4 className="font-heading text-2xl uppercase text-white mt-3 group-hover:text-[#f2efa3] transition-colors">
              {v.title}
            </h4>
            <span className="text-xs text-white/50">{v.category}</span>
          </div>
        ))}
      </div>
    );
  }

  /* -------------------------------------------------------------
     LAYOUT 16: LEAD STORY & 2-COLUMN GRID (Feature + Dual Col)
     ------------------------------------------------------------- */
  if (layoutId === 16) {
    return (
      <div className="space-y-10">
        {firstVideo && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => onPlayVideo(firstVideo)}
            className="group relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-white/15 bg-black cursor-pointer shadow-2xl"
          >
            <Image
              src={videoThumb(firstVideo.id)}
              alt={firstVideo.title}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent p-8 flex flex-col justify-end">
              <span className="text-xs font-mono text-[#f2efa3] uppercase font-bold">Featured Video of the Week</span>
              <h3 className="font-heading text-4xl sm:text-6xl text-white uppercase">{firstVideo.title}</h3>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300">
              <GlassPlayButton size="lg" as="div" glow className="transition-transform duration-300 transform scale-90 group-hover:scale-100" />
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {remainingVideos.map((v) => (
            <div key={v.id}>{renderStandardCard(v)}</div>
          ))}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
     LAYOUT 17: COVER SONG ACOUSTIC LOFT (Covers & Tributes)
     ------------------------------------------------------------- */
  if (layoutId === 17) {
    return (
      <div className="space-y-8">
        <div className="border-l-4 border-[#f2efa3] pl-4">
          <h3 className="font-heading text-3xl uppercase text-white">Cover Songs & Fan Favorite Medleys</h3>
          <p className="text-sm text-white/60">Signature 7th Heaven interpretations of iconic rock anthems.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v) => (
            <div key={v.id}>{renderStandardCard(v)}</div>
          ))}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
     LAYOUT 18: FILM REEL STRIPS (Horizontal Categorized Strips)
     ------------------------------------------------------------- */
  if (layoutId === 18) {
    return (
      <div className="space-y-12">
        {categoryGroups.slice(0, 4).map((group) => (
          <div key={group.category} className="space-y-3">
            <h4 className="font-heading text-xl uppercase tracking-wider text-[#f2efa3]">{group.category}</h4>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {group.videos.map((v) => (
                <div
                  key={v.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onPlayVideo(v)}
                  className="group min-w-[260px] sm:min-w-[300px] shrink-0 cursor-pointer"
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black border border-white/10">
                    <Image
                      src={videoThumb(v.id)}
                      alt={v.title}
                      fill
                      sizes="300px"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40">
                      <Play className="h-6 w-6 fill-white text-white drop-shadow transition-transform duration-300 transform scale-90 group-hover:scale-100" />
                    </div>
                  </div>
                  <h5 className="font-heading text-base uppercase text-white mt-2 truncate group-hover:text-[#f2efa3]">{v.title}</h5>
                  <span className="text-xs text-white/50">{v.duration || "Watch"}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* -------------------------------------------------------------
     LAYOUT 19: HIGH-CONTRAST BRUTALIST (Sharp Borders & Yellow)
     ------------------------------------------------------------- */
  if (layoutId === 19) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono">
        {videos.map((v, i) => (
          <div
            key={v.id}
            role="button"
            tabIndex={0}
            onClick={() => onPlayVideo(v)}
            className="group border-2 border-amber-400 bg-black p-4 shadow-[6px_6px_0px_0px_rgba(251,191,36,0.8)] hover:shadow-[10px_10px_0px_0px_rgba(251,191,36,1)] transition-all cursor-pointer"
          >
            <div className="flex justify-between border-b-2 border-amber-400 pb-2 mb-3 text-xs">
              <span className="bg-amber-400 text-black px-2 py-0.5 font-black">SYS.VIDEO.{String(i + 1).padStart(2, "0")}</span>
              <span className="text-amber-300 font-bold">{v.year || "ARCHIVE"}</span>
            </div>
            <div className="relative aspect-video w-full overflow-hidden border border-amber-400/50 bg-black">
              <Image
                src={videoThumb(v.id)}
                alt={v.title}
                fill
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
              />
            </div>
            <h4 className="font-black text-lg uppercase text-white group-hover:text-amber-400 mt-3 truncate">
              {v.title}
            </h4>
            <span className="text-xs text-amber-300/80">&gt; {v.category}</span>
          </div>
        ))}
      </div>
    );
  }

  /* -------------------------------------------------------------
     LAYOUT 20: CURATOR'S TOP PICKS (Ranked #1 through #20)
     ------------------------------------------------------------- */
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((v, i) => (
        <div
          key={v.id}
          role="button"
          tabIndex={0}
          onClick={() => onPlayVideo(v)}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4 hover:border-purple-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <span className="font-mono text-2xl font-black text-purple-400">#{(i + 1).toString().padStart(2, "0")}</span>
            <span className="text-xs font-semibold text-white/50">{v.category}</span>
          </div>
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
            <Image
              src={videoThumb(v.id)}
              alt={v.title}
              fill
              sizes="(min-width: 1024px) 33vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300">
              <GlassPlayButton size="md" as="div" glow className="transition-transform duration-300 transform scale-90 group-hover:scale-100" />
            </div>
          </div>
          <h4 className="font-heading text-xl uppercase text-white mt-3 truncate group-hover:text-[#f2efa3]">
            {v.title}
          </h4>
          <span className="text-xs text-white/60">{v.duration || "Video"} • {v.year}</span>
        </div>
      ))}
    </div>
  );
}
