"use client";
import Image from "next/image";
import { Play, X } from "lucide-react";
import SeventhButton from "./SeventhButton";
import GlassPlayButton from "./GlassPlayButton";
import { SectionBadge } from "./SectionBadge";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { CruiseVideoItem } from "@/app/api/cruise/videos/route";

const FALLBACK_VIDEOS: CruiseVideoItem[] = [
  {
    id: "vid-cmc-1",
    title: "Star of the Seas 2027 — Official Promo Video",
    category: "Promo & Announcements",
    url: "https://www.youtube.com/watch?v=vaMRyPbgAz4",
    youtubeId: "vaMRyPbgAz4",
    poster: "https://img.youtube.com/vi/vaMRyPbgAz4/hqdefault.jpg",
    description:
      "Official promo video for the 2027 Chicago Music Cruise aboard Royal Caribbean's Star of the Seas (Jan 10, 2027).",
    featured: true,
    createdAt: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "vid-cmc-2",
    title: "Pre-Cruise Speech — Oasis of the Seas (2025)",
    category: "Pre-Cruise Speeches",
    url: "https://www.youtube.com/watch?v=N3xFvQPXfqk",
    youtubeId: "N3xFvQPXfqk",
    poster: "https://img.youtube.com/vi/N3xFvQPXfqk/hqdefault.jpg",
    description:
      "Exclusive pre-cruise address & announcements for Oasis of the Seas passengers (March 12, 2025).",
    featured: false,
    createdAt: "2025-03-12T00:00:00.000Z",
  },
  {
    id: "vid-cmc-3",
    title: "Pre-Cruise Speech — Icon of the Seas (2025)",
    category: "Pre-Cruise Speeches",
    url: "https://www.youtube.com/watch?v=P4j-2p-qLZE",
    youtubeId: "P4j-2p-qLZE",
    poster: "https://img.youtube.com/vi/P4j-2p-qLZE/hqdefault.jpg",
    description:
      "Official pre-cruise briefing and group activity overview on Icon of the Seas (January 5, 2025).",
    featured: false,
    createdAt: "2025-01-05T00:00:00.000Z",
  },
  {
    id: "vid-cmc-4",
    title: "Pre-Cruise Speech — Wonder of the Seas (2023)",
    category: "Pre-Cruise Speeches",
    url: "https://www.youtube.com/watch?v=bduMR3nhxnA",
    youtubeId: "bduMR3nhxnA",
    poster: "https://img.youtube.com/vi/bduMR3nhxnA/hqdefault.jpg",
    description:
      "Pre-cruise speech and band performance highlights aboard Wonder of the Seas (December 5, 2023).",
    featured: false,
    createdAt: "2023-12-05T00:00:00.000Z",
  },
  {
    id: "vid-cmc-5",
    title: "Pre-Cruise Speech — Wonder of the Seas (2022)",
    category: "Pre-Cruise Speeches",
    url: "https://www.youtube.com/watch?v=55C64kqfR9I",
    youtubeId: "55C64kqfR9I",
    poster: "https://img.youtube.com/vi/55C64kqfR9I/hqdefault.jpg",
    description:
      "Pre-cruise speech and itinerary preview for Wonder of the Seas (December 11, 2022).",
    featured: false,
    createdAt: "2022-12-11T00:00:00.000Z",
  },
  {
    id: "vid-cmc-6",
    title: "Pre-Cruise Video Cast — Wonder of the Seas (2022)",
    category: "Behind the Scenes",
    url: "https://www.youtube.com/watch?v=Tj-gK_g5g1I",
    youtubeId: "Tj-gK_g5g1I",
    poster: "https://img.youtube.com/vi/Tj-gK_g5g1I/hqdefault.jpg",
    description:
      "Special video cast with band members previewing the upcoming cruise season (March 11, 2022).",
    featured: false,
    createdAt: "2022-03-11T00:00:00.000Z",
  },
  {
    id: "vid-cmc-7",
    title: "Pre-Cruise Speech — Allure of the Seas (2020)",
    category: "Pre-Cruise Speeches",
    url: "https://www.youtube.com/watch?v=If2QYmT7AV4",
    youtubeId: "If2QYmT7AV4",
    poster: "https://img.youtube.com/vi/If2QYmT7AV4/hqdefault.jpg",
    description:
      "Pre-cruise speech for the 2020 Allure of the Seas Eastern Caribbean voyage (January 9, 2020).",
    featured: false,
    createdAt: "2020-01-09T00:00:00.000Z",
  },
  {
    id: "vid-cmc-8",
    title: "Chicago Music Cruise — Video Blog #2 (2019)",
    category: "Vlogs & Recaps",
    url: "https://www.youtube.com/watch?v=jXSyCd_siAA",
    youtubeId: "jXSyCd_siAA",
    poster: "https://img.youtube.com/vi/jXSyCd_siAA/hqdefault.jpg",
    description:
      "Video blog recap detailing cruise preparations and concert schedules (April 2, 2019).",
    featured: false,
    createdAt: "2019-04-02T00:00:00.000Z",
  },
  {
    id: "vid-cmc-9",
    title: "Chicago Music Cruise — Video Blog #1 (2019)",
    category: "Vlogs & Recaps",
    url: "https://www.youtube.com/watch?v=88TOdJ24Re0",
    youtubeId: "88TOdJ24Re0",
    poster: "https://img.youtube.com/vi/88TOdJ24Re0/hqdefault.jpg",
    description:
      "Inaugural 2019 video blog with behind-the-scenes cruise announcements (March 5, 2019).",
    featured: false,
    createdAt: "2019-03-05T00:00:00.000Z",
  },
  {
    id: "vid-cmc-10",
    title: "Pre-Cruise Speech 2019 — Symphony of the Seas",
    category: "Pre-Cruise Speeches",
    url: "https://www.youtube.com/watch?v=6NJKIpsC7bs",
    youtubeId: "6NJKIpsC7bs",
    poster: "https://img.youtube.com/vi/6NJKIpsC7bs/hqdefault.jpg",
    description:
      "Full 2019 pre-cruise presentation for Symphony of the Seas passengers (January 15, 2019).",
    featured: false,
    createdAt: "2019-01-15T00:00:00.000Z",
  },
  {
    id: "vid-cmc-11",
    title: "Symphony of the Seas Highlights (2018)",
    category: "Highlights & Recaps",
    url: "https://www.youtube.com/watch?v=0KkOUuzNYcs",
    youtubeId: "0KkOUuzNYcs",
    poster: "https://img.youtube.com/vi/0KkOUuzNYcs/hqdefault.jpg",
    description:
      "Highlight reel from the historic Symphony of the Seas fan cruise (September 1, 2018).",
    featured: false,
    createdAt: "2018-09-01T00:00:00.000Z",
  },
  {
    id: "vid-cmc-12",
    title: "Pre-Cruise Speech 2018 — Liberty of the Seas",
    category: "Pre-Cruise Speeches",
    url: "https://www.youtube.com/watch?v=5nLO1fjBvmU",
    youtubeId: "5nLO1fjBvmU",
    poster: "https://img.youtube.com/vi/5nLO1fjBvmU/hqdefault.jpg",
    description:
      "Official 2018 pre-cruise speech and band lineup announcement.",
    featured: false,
    createdAt: "2018-01-01T00:00:00.000Z",
  },
];

export default function CruiseVideoGallery() {
  const [videos, setVideos] = useState<CruiseVideoItem[]>(FALLBACK_VIDEOS);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeVideo, setActiveVideo] = useState<CruiseVideoItem | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cruise/videos");
      if (res.ok) {
        const data = await res.json();
        if (data.videos && Array.isArray(data.videos)) {
          setVideos(data.videos);
        }
      }
    } catch {
      // Fallback default if fetch fails
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveVideo(null);
      }
    };
    if (activeVideo) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeVideo]);

  const categories = [
    "All",
    ...Array.from(new Set(videos.map((v) => v.category))),
  ];

  const filteredVideos =
    selectedCategory === "All"
      ? videos
      : videos.filter((v) => v.category === selectedCategory);

  return (
    <section
      id="ship-videos"
      className="py-section-fluid site-container relative z-20 border-b border-white/10"
      style={{ contentVisibility: "auto", containIntrinsicSize: "800px" }}
    >
      {/* Header */}
      <div className="mx-auto mb-6 max-w-3xl text-center">
        <h2 className="md:text-6xl">
          Explore <span className="accent-gradient-text">Ship Videos</span>
        </h2>
        <p className="mt-4">
          Watch official walkthroughs, entertainment previews, deck tours, and
          venue spotlights uploaded by our cruise team.
        </p>

        {/* Category Filters */}
        {categories.length > 1 && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <SeventhButton
                key={cat}
                isActive={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-5 py-2"
              >
                {cat}
              </SeventhButton>
            ))}
          </div>
        )}
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg=[#e1e6ff29] aspect-video animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="r rounded-lg border border-white/10 bg-white/5 py-16 text-center text-white/50">
          No videos found in this category.
        </div>
      ) : (
        <div
          key={selectedCategory}
          className="grid animate-[fade-in_0.35s_ease-out_both] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredVideos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => setActiveVideo(vid)}
              className="group flex w-full cursor-pointer flex-col justify-between overflow-hidden text-left transition-colors duration-500"
            >
              {/* Poster Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-black/90">
                <Image
                  width={200}
                  height={200}
                  unoptimized
                  src={vid.poster || "/images/cruise/cruise-hero.png"}
                  alt={vid.title}
                  className="h-full w-full overflow-hidden object-cover opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#0a0a14] via-black/30 to-transparent">
                  <GlassPlayButton size="lg" />
                </div>

                <div className="absolute top-3 left-3 z-10">
                  <SectionBadge
                    label={vid.category}
                    className="!border-white/20 !bg-black/80 shadow-md !backdrop-blur-md"
                  />
                </div>
              </div>

              {/* Title & Info */}
              <div className="flex flex-1 flex-col space-y-3 pt-6">
                <div>
                  <h3 className="group- transition-colors">{vid.title}</h3>
                  {vid.description && (
                    <p className="mt-2 line-clamp-2">{vid.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full-screen Video Player Modal Portaled to Body for Unclipped Viewport Blur */}
      {activeVideo &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            onClick={() => setActiveVideo(null)}
            style={{
              backdropFilter: "blur(45px)",
              WebkitBackdropFilter: "blur(45px)",
            }}
            className="animate-in fade-in fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[45px] transition-opacity duration-300 md:p-8"
          >
            {/* Floating Top-Right Close Button for immediate screen dismiss */}
            <button
              type="button"
              aria-label="Close video modal"
              onClick={() => setActiveVideo(null)}
              className="group absolute top-4 right-4 z-[9999999] flex cursor-pointer items-center justify-center !rounded-full border border-white/10 bg-white/15 p-3 transition-[background-color,border-color,transform] duration-200 sm:top-6 sm:right-6"
            >
              <X className="h-6 w-6" />
            </button>

            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl overflow-hidden rounded-lg bg-[#0c071e] p-4 md:p-6"
            >
              <div className="mb-6 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="min-w-0 flex-1">
                  <span className="mb-1 block text-purple-400">
                    {activeVideo.category}
                  </span>
                  <h3 className="truncate">{activeVideo.title}</h3>
                </div>
              </div>

              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
                {(() => {
                  const ytId =
                    activeVideo.youtubeId ||
                    (activeVideo.url &&
                      activeVideo.url.match(
                        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
                      )?.[1]);
                  if (ytId) {
                    return (
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                        title={activeVideo.title}
                        className="h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    );
                  }
                  return (
                    <video
                      src={activeVideo.url}
                      controls
                      autoPlay
                      muted
                      className="h-full w-full object-contain"
                    >
                      <track kind="captions" />
                    </video>
                  );
                })()}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
