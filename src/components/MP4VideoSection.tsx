"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Film, Sparkles, RefreshCw } from "lucide-react";
import CosmicRadialButton from "@/components/CosmicRadialButton";
import FoolishShrimpButton from "@/components/FoolishShrimpButton";

export interface MP4VideoItem {
  id: string;
  title: string;
  category: string;
  src: string;
  duration?: string;
  description: string;
  badge?: string;
}

const MP4_VIDEOS: MP4VideoItem[] = [
  {
    id: "color-in-motion",
    title: "Color In Motion (Visualizer)",
    category: "Official Clip",
    src: "/movie/color-in-motion-clip.mp4",
    duration: "1:45",
    description: "Vibrant high-energy motion visualizer from 7th Heaven's headline arena stage setup.",
    badge: "Featured",
  },
  {
    id: "be-here-clip",
    title: "Be Here Now (Live Performance)",
    category: "Live Concert",
    src: "/movie/be-here-clip.mp4",
    duration: "2:10",
    description: "Captivating live footage of 'Be Here Now' featuring crowd singalongs and explosive energy.",
    badge: "Live HD",
  },
  {
    id: "luminous-clip",
    title: "Luminous (Concert Visuals)",
    category: "Stage Visuals",
    src: "/movie/luminous-clip.mp4",
    duration: "1:30",
    description: "Laser and light show graphics synchronized to 7th Heaven's signature hit anthem.",
    badge: "Visuals",
  },
  {
    id: "fest1-clip",
    title: "Summer Festival Headline Reel",
    category: "Festival Live",
    src: "/movie/fest1-clip.mp4",
    duration: "1:15",
    description: "Massive outdoor summer festival highlight reel performing in front of 10,000+ fans.",
    badge: "Outdoor",
  },
  {
    id: "spectrum",
    title: "Spectrum (Audio-Visual Experience)",
    category: "Special Feature",
    src: "/movie/spectrum.mp4",
    duration: "1:55",
    description: "Dynamic color-shifting stage show sequence filmed live on tour.",
    badge: "4K Master",
  },
  {
    id: "rock-cruise",
    title: "Rock The Boat Cruise Highlight",
    category: "Cruise Special",
    src: "/movie/cruise.mp4",
    duration: "1:20",
    description: "Exotic open-ocean deck concert showcase from the annual 7th Heaven Fan Cruise.",
    badge: "Cruise",
  },
  {
    id: "adam-spotlight",
    title: "Adam Spotlight Solo",
    category: "Band Spotlight",
    src: "/movie/Adam.mp4",
    duration: "0:45",
    description: "High-octane guitar shredding and performance moments featuring Adam.",
    badge: "Solo",
  },
  {
    id: "rich-spotlight",
    title: "Rich Spotlight Solo",
    category: "Band Spotlight",
    src: "/movie/Rich.mp4",
    duration: "0:40",
    description: "Unstoppable rhythm and bass spotlight highlights featuring Rich.",
    badge: "Solo",
  },
  {
    id: "nick-spotlight",
    title: "Nick Spotlight Solo",
    category: "Band Spotlight",
    src: "/movie/Nick.mp4",
    duration: "0:42",
    description: "Lead vocal power and stage presence featuring Nick.",
    badge: "Solo",
  },
  {
    id: "mark-spotlight",
    title: "Mark Spotlight Solo",
    category: "Band Spotlight",
    src: "/movie/Mark.mp4",
    duration: "0:38",
    description: "Thunderous drumming and live groove focus featuring Mark.",
    badge: "Solo",
  },
  {
    id: "frankie-spotlight",
    title: "Frankie Spotlight Solo",
    category: "Band Spotlight",
    src: "/movie/Frankie.mp4",
    duration: "0:44",
    description: "Electrifying keyboard melodies and synth work featuring Frankie.",
    badge: "Solo",
  },
];

const CATEGORIES = ["ALL", "Official Clip", "Live Concert", "Stage Visuals", "Festival Live", "Special Feature", "Band Spotlight"];

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function MP4VideoSection() {
  const [selectedVideo, setSelectedVideo] = useState<MP4VideoItem>(MP4_VIDEOS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState("0:00");
  const [durationFormatted, setDurationFormatted] = useState("0:00");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  // Handle Play/Pause toggle
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // Handle Mute toggle
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  // Handle Video Selection
  const handleSelectVideo = useCallback((videoItem: MP4VideoItem) => {
    setSelectedVideo(videoItem);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  }, []);

  // Update time and progress line
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const current = video.currentTime;
    const dur = video.duration;
    setProgress((current / dur) * 100);
    setCurrentTimeFormatted(formatTime(current));
    setDurationFormatted(formatTime(dur));
  }, []);

  // Handle progress bar click/seek
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const newPercentage = parseFloat(e.target.value);
    const newTime = (newPercentage / 100) * video.duration;
    video.currentTime = newTime;
    setProgress(newPercentage);
    setCurrentTimeFormatted(formatTime(newTime));
  }, []);

  // Fullscreen trigger
  const handleFullscreen = useCallback(() => {
    if (!playerContainerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      playerContainerRef.current.requestFullscreen().catch(() => {});
    }
  }, []);

  // Sync state when video naturally finishes or pauses
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      video.currentTime = 0;
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  const filteredVideos = MP4_VIDEOS.filter((v) => {
    if (activeCategory === "ALL") return true;
    return v.category.toUpperCase() === activeCategory.toUpperCase();
  });

  return (
    <section className="mt-20 pt-16 pb-12 border-t border-purple-500/20 relative">
      {/* Glow background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-purple-900/15 via-indigo-900/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="site-container">
        {/* Section Heading */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300 font-bold uppercase text-xs tracking-widest mb-3">
            <Film className="w-3.5 h-3.5 text-purple-400" />
            <span>HD MP4 Video Vault</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white drop-shadow-lg">
            HD MP4 PLAYERS & REELS
          </h2>
          <p className="text-purple-200/80 text-sm sm:text-base max-w-2xl mx-auto mt-2 font-medium">
            Stream raw 1080p high-definition stage footage, band spotlights, and visualizers in native MP4 format.
          </p>
        </div>

        {/* Featured MP4 Theater Player */}
        <div
          ref={playerContainerRef}
          className="relative w-full max-w-5xl mx-auto aspect-video bg-black rounded-2xl overflow-hidden border border-purple-500/30 shadow-[0_0_50px_rgba(147,51,234,0.25)] group"
        >
          <video
            ref={videoRef}
            src={selectedVideo.src}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleTimeUpdate}
            playsInline
            muted={isMuted}
            className="w-full h-full object-cover cursor-pointer"
            onClick={togglePlay}
          />

          {/* Top Badge & Info Overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase text-white tracking-wider">
                {selectedVideo.badge || "HD MP4"}
              </span>
            </div>
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-purple-200">
              {selectedVideo.category}
            </div>
          </div>

          {/* Big Center Play Overlay Button */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] z-20 pointer-events-none">
              <CosmicRadialButton
                type="button"
                onClick={togglePlay}
                className="w-16 h-16 sm:w-20 sm:h-20 !rounded-full !p-0 flex items-center justify-center border-2 border-purple-400/50 shadow-2xl hover:scale-110 transition-transform duration-300 pointer-events-auto"
              >
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </CosmicRadialButton>
            </div>
          )}

          {/* Bottom Glass Control Bar */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 sm:p-6 z-20 flex flex-col gap-3 transition-opacity duration-300">
            {/* Title & Description */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold uppercase text-white tracking-tight leading-tight">
                  {selectedVideo.title}
                </h3>
                <p className="text-xs sm:text-sm text-purple-200/70 line-clamp-1">
                  {selectedVideo.description}
                </p>
              </div>
            </div>

            {/* Progress Bar Timeline */}
            <div className="flex items-center gap-3 w-full">
              <span className="text-xs font-mono font-bold text-purple-300 w-10 text-right">
                {currentTimeFormatted}
              </span>
              <div className="relative flex-1 flex items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={progress}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
                />
              </div>
              <span className="text-xs font-mono font-bold text-purple-300/70 w-10">
                {durationFormatted}
              </span>
            </div>

            {/* Play Control Buttons Row */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                {/* Play / Pause Toggle Button */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-2 rounded-full bg-white/10 hover:bg-purple-600 text-white transition-colors cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-white" />
                  ) : (
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  )}
                </button>

                {/* Mute / Unmute Toggle Button */}
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-2 rounded-full bg-white/10 hover:bg-purple-600 text-white transition-colors cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-pink-400" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-emerald-400" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Replay Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                      videoRef.current.play();
                      setIsPlaying(true);
                    }
                  }}
                  className="p-2 rounded-full bg-white/10 hover:bg-purple-600 text-white transition-colors cursor-pointer"
                  title="Replay"
                >
                  <RefreshCw className="w-4 h-4 text-purple-300" />
                </button>

                {/* Fullscreen Button */}
                <button
                  type="button"
                  onClick={handleFullscreen}
                  className="p-2 rounded-full bg-white/10 hover:bg-purple-600 text-white transition-colors cursor-pointer"
                  title="Fullscreen"
                >
                  <Maximize className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto my-8">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory.toUpperCase() === cat.toUpperCase();
            return (
              <FoolishShrimpButton
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                isActive={isActive}
                className="!w-auto px-4 py-2 text-xs font-bold uppercase"
              >
                {cat}
              </FoolishShrimpButton>
            );
          })}
        </div>

        {/* MP4 Video Cards Grid / Gallery Reel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {filteredVideos.map((item) => {
            const isSelected = selectedVideo.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => handleSelectVideo(item)}
                className={`group relative flex flex-col bg-[#0f0921] rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "border-purple-400 ring-2 ring-purple-500/50 shadow-lg shadow-purple-900/40 scale-[1.02]"
                    : "border-white/10 hover:border-purple-500/40 hover:scale-[1.01]"
                }`}
              >
                {/* Video Card Preview Media */}
                <div className="relative aspect-video w-full bg-black overflow-hidden">
                  <video
                    src={item.src}
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                  />

                  {/* Top Badge */}
                  {item.badge && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-purple-600/80 backdrop-blur-md text-[10px] font-bold uppercase text-white tracking-wider">
                      {item.badge}
                    </span>
                  )}

                  {/* Playing State Pill */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-extrabold uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                      <span>Playing</span>
                    </div>
                  )}

                  {/* Play Hover Overlay Button */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CosmicRadialButton
                      type="button"
                      className="w-10 h-10 !rounded-full !p-0 flex items-center justify-center border border-white/40 shadow-xl"
                    >
                      <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                    </CosmicRadialButton>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-purple-400 tracking-wider">
                      {item.category}
                    </span>
                    <h4 className="text-sm font-bold uppercase text-white line-clamp-1 mt-0.5">
                      {item.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-[11px] text-purple-200/60 font-semibold">
                    <span>MP4 HD</span>
                    <span>{item.duration || "HD"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
