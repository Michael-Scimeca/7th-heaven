/* eslint-disable react-doctor/no-giant-component, react-doctor/no-event-handler, react-doctor/no-high-complexity-react-function */
/* oxlint-disable react-doctor/no-giant-component, react-doctor/no-event-handler, react-doctor/no-high-complexity-react-function */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Play, Music, X, ChevronUp } from "lucide-react";
import SeventhButton from "@/components/SeventhButton";
import data from "../../public/data/albums.json";

interface LyricSong {
  title: string;
  lyrics?: Record<string, string>;
}
interface LyricData {
  songs: LyricSong[];
}

const ALBUMS_WITH_LYRICS = new Set([
  "01-be-here",
  "07-color-in-motion",
  "09-luminous",
]);

const lerp = (v0: number, v1: number, t: number) => v0 * (1 - t) + v1 * t;

function SoundWaveCanvas({ isPlaying }: { isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ h: 0, amp: 0, rafId: 0, isVisible: true });
  const drawRef = useRef<(time: number) => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = stateRef.current.isVisible;
        stateRef.current.isVisible = entry.isIntersecting;
        if (entry.isIntersecting && !wasVisible) {
          cancelAnimationFrame(stateRef.current.rafId);
          stateRef.current.rafId = requestAnimationFrame((ts) =>
            drawRef.current(ts / 1000),
          );
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const draw = useCallback(
    (time: number) => {
      // Stop loop when off-screen, tab hidden, or page transitioning
      if (
        !stateRef.current.isVisible ||
        document.hidden ||
        (window as any).__pageTransitionActive
      ) {
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const st = stateRef.current;
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;

      const targetH = isPlaying ? 16 : 1.5;
      const targetAmp = isPlaying ? Math.abs(-0.18) * Math.PI * 2 : 0.05;
      st.h = lerp(st.h, targetH, 0.055);
      st.amp = lerp(st.amp, targetAmp, 0.055);

      ctx.clearRect(0, 0, W, H);

      const steps = 150;
      const speed = 5.7;

      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * W;
        const t = time * speed + (i / steps) * st.amp * Math.PI * 2;
        const y = H / 2 - Math.sin(t) * st.h;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      const gradient = ctx.createLinearGradient(0, 0, W, 0);
      gradient.addColorStop(0, "rgba(133, 29, 239, 0.1)");
      gradient.addColorStop(0.5, "#851DEF");
      gradient.addColorStop(1, "rgba(133, 29, 239, 0.1)");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.stroke();

      st.rafId = requestAnimationFrame((ts) => drawRef.current(ts / 1000));
    },
    [isPlaying],
  );

  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    const st = stateRef.current;
    cancelAnimationFrame(st.rafId);
    st.rafId = requestAnimationFrame((ts) => draw(ts / 1000));
    return () => cancelAnimationFrame(st.rafId);
  }, [draw]);

  return <canvas ref={canvasRef} className="block h-full w-full" />;
}

const formatTime = (time: number) => {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const getDummyDuration = (title: string, idx: number) => {
  const totalSeconds = 180 + ((title.length * 13 + idx * 37) % 140);
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

const cleanTitle = (str: string) =>
  str
    .replace(/^\d+\s*/, "")
    .replace(/\.mp3$/i, "")
    .replace(/&apos;/gi, "'")
    .replace(/&amp;/gi, "&");

export default function AudioPlayerSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [albums, setAlbums] = useState(data);
  const [activeAlbumIndex, setActiveAlbumIndex] = useState(() =>
    Math.max(
      0,
      data.findIndex((a) => a.id.includes("be-here")),
    ),
  );
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.4);
  const prevVolumeRef = useRef(0.4);
  const [showLyrics, setShowLyrics] = useState(false);
  const [loadedLyrics, setLoadedLyrics] = useState<LyricData | null>(null);

  useEffect(() => {
    const activeId = albums[activeAlbumIndex]?.id;
    if (!showLyrics || !activeId || !ALBUMS_WITH_LYRICS.has(activeId)) return;
    let active = true;
    const fetchLyrics = async () => {
      try {
        let lData: LyricData | null = null;
        if (activeId === "01-be-here") {
          lData = (await import("../../public/data/lyrics/be-here.json"))
            .default as unknown as LyricData;
        } else if (activeId === "07-color-in-motion") {
          lData = (
            await import("../../public/data/lyrics/color-in-motion.json")
          ).default as unknown as LyricData;
        } else if (activeId === "09-luminous") {
          lData = (await import("../../public/data/lyrics/luminous.json"))
            .default as unknown as LyricData;
        }
        if (active) setLoadedLyrics(lData);
      } catch (e) {
        console.warn("Failed to load lyrics:", e);
      }
    };
    fetchLyrics();
    return () => {
      active = false;
    };
  }, [showLyrics, activeAlbumIndex, albums]);
  const [eqBarProps] = useState(() =>
    [...Array(24)].map(() => ({
      duration: `${0.8 + Math.random() * 0.8}s`,
      height: `${15 + Math.random() * 50}px`,
    })),
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Search & Category Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    "all" | "original" | "medley" | "cover" | "holiday"
  >("all");

  const sidebarScrollRef = useRef<HTMLDivElement | null>(null);
  const isDraggingSidebarRef = useRef(false);
  const startYRef = useRef(0);
  const startScrollTopRef = useRef(0);

  const [sidebarScrollProgress, setSidebarScrollProgress] = useState(0);
  const [sidebarThumbHeight, setSidebarThumbHeight] = useState(25);

  const handleSidebarScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const maxScroll = target.scrollHeight - target.clientHeight;
    if (maxScroll > 0) {
      setSidebarScrollProgress((target.scrollTop / maxScroll) * 100);
      setSidebarThumbHeight(
        Math.max(15, (target.clientHeight / target.scrollHeight) * 100),
      );
    } else {
      setSidebarScrollProgress(0);
      setSidebarThumbHeight(100);
    }
  };

  const handleSidebarTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = sidebarScrollRef.current;
    if (!container) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const percentage = clickY / rect.height;
    container.scrollTop =
      percentage * (container.scrollHeight - container.clientHeight);
  };

  const handleSidebarThumbMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const container = sidebarScrollRef.current;
    if (!container) return;
    isDraggingSidebarRef.current = true;
    startYRef.current = e.clientY;
    startScrollTopRef.current = container.scrollTop;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingSidebarRef.current || !sidebarScrollRef.current) return;
      const deltaY = moveEvent.clientY - startYRef.current;
      const trackHeight = sidebarScrollRef.current.clientHeight;
      const scrollRatio = sidebarScrollRef.current.scrollHeight / trackHeight;
      sidebarScrollRef.current.scrollTop =
        startScrollTopRef.current + deltaY * scrollRatio;
    };

    const onMouseUp = () => {
      isDraggingSidebarRef.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
  };

  const tracklistScrollRef = useRef<HTMLDivElement | null>(null);
  const isDraggingTracklistRef = useRef(false);
  const tracklistStartYRef = useRef(0);
  const tracklistStartScrollTopRef = useRef(0);

  const [tracklistScrollProgress, setTracklistScrollProgress] = useState(0);
  const [tracklistThumbHeight, setTracklistThumbHeight] = useState(25);

  const handleTracklistScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const maxScroll = target.scrollHeight - target.clientHeight;
    if (maxScroll > 0) {
      setTracklistScrollProgress((target.scrollTop / maxScroll) * 100);
      setTracklistThumbHeight(
        Math.max(15, (target.clientHeight / target.scrollHeight) * 100),
      );
    } else {
      setTracklistScrollProgress(0);
      setTracklistThumbHeight(100);
    }
  };

  // Recalculate tracklist scroll metrics when album or search query changes
  useEffect(() => {
    const el = tracklistScrollRef.current;
    if (!el) return;
    el.scrollTop = 0;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll > 0) {
      setTracklistScrollProgress(0);
      setTracklistThumbHeight(
        Math.max(15, (el.clientHeight / el.scrollHeight) * 100),
      );
    } else {
      setTracklistScrollProgress(0);
      setTracklistThumbHeight(100);
    }
  }, [activeAlbumIndex, searchQuery]);

  // Recalculate scroll metrics on window resize & mount
  useEffect(() => {
    const updateMetrics = () => {
      if (sidebarScrollRef.current) {
        const sEl = sidebarScrollRef.current;
        const sMax = sEl.scrollHeight - sEl.clientHeight;
        if (sMax > 0) {
          setSidebarThumbHeight(
            Math.max(15, (sEl.clientHeight / sEl.scrollHeight) * 100),
          );
        } else {
          setSidebarThumbHeight(100);
        }
      }
      if (tracklistScrollRef.current) {
        const tEl = tracklistScrollRef.current;
        const tMax = tEl.scrollHeight - tEl.clientHeight;
        if (tMax > 0) {
          setTracklistThumbHeight(
            Math.max(15, (tEl.clientHeight / tEl.scrollHeight) * 100),
          );
        } else {
          setTracklistThumbHeight(100);
        }
      }
    };

    updateMetrics();
    const timer = setTimeout(updateMetrics, 100);
    window.addEventListener("resize", updateMetrics);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateMetrics);
    };
  }, [activeAlbumIndex, searchQuery]);

  const handleTracklistTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = tracklistScrollRef.current;
    if (!container) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const percentage = clickY / rect.height;
    container.scrollTop =
      percentage * (container.scrollHeight - container.clientHeight);
  };

  const handleTracklistThumbMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const container = tracklistScrollRef.current;
    if (!container) return;
    isDraggingTracklistRef.current = true;
    tracklistStartYRef.current = e.clientY;
    tracklistStartScrollTopRef.current = container.scrollTop;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingTracklistRef.current || !tracklistScrollRef.current)
        return;
      const deltaY = moveEvent.clientY - tracklistStartYRef.current;
      const trackHeight = tracklistScrollRef.current.clientHeight;
      const scrollRatio = tracklistScrollRef.current.scrollHeight / trackHeight;
      tracklistScrollRef.current.scrollTop =
        tracklistStartScrollTopRef.current + deltaY * scrollRatio;
    };

    const onMouseUp = () => {
      isDraggingTracklistRef.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
  };

  const originalCds = albums
    .filter((a) => {
      const isMedley = a.title.toLowerCase().includes("medley");
      const isCover =
        a.title.toLowerCase().includes("cover") ||
        a.title.toLowerCase() === "unplugged";
      const isHoliday =
        a.title.toLowerCase().includes("christmas") ||
        a.title.toLowerCase().includes("holiday");
      return !isMedley && !isCover && !isHoliday;
    })
    .sort((a, b) => parseInt(b.year) - parseInt(a.year));
  const medleyCds = albums
    .filter((a) => a.title.toLowerCase().includes("medley"))
    .sort((a, b) => parseInt(b.year) - parseInt(a.year));
  const coverCds = albums
    .filter(
      (a) =>
        a.title.toLowerCase().includes("cover") ||
        a.title.toLowerCase() === "unplugged",
    )
    .sort((a, b) => parseInt(b.year) - parseInt(a.year));
  const holidayCds = albums
    .filter(
      (a) =>
        a.title.toLowerCase().includes("christmas") ||
        a.title.toLowerCase().includes("holiday"),
    )
    .sort((a, b) => parseInt(b.year) - parseInt(a.year));

  const renderAlbumList = (categoryAlbums: typeof albums, title: string) => (
    <div className="mb-6">
      <h3
        className="mb-1.5 text-white/40"
        style={{ fontSize: "clamp(1.2rem, 1.9vw, 2.0rem)" }}
      >
        {title}
      </h3>
      <ul className="flex flex-col gap-0.5">
        {categoryAlbums.map((album) => {
          const originalIdx = albums.findIndex((a) => a.id === album.id);
          return (
            <li key={album.id}>
              <button
                aria-label="Search"
                onClick={() => {
                  setActiveAlbumIndex(originalIdx);
                  setActiveTrackIndex(0);
                  setSearchQuery("");
                  setIsPlaying(false);
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(
                      new CustomEvent("7h-album-change", {
                        detail: { albumId: album.id },
                      }),
                    );
                  }
                }}
                className={`group flex w-full items-center justify-between gap-2.5 overflow-hidden !rounded-none py-1 text-left transition-colors ${originalIdx === activeAlbumIndex ? "cursor-default border-0 bg-[var(--color-accent)]/15" : "cursor-pointer hover:bg-white/10"}`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2.5 pr-1">
                  {album.image && (
                    <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded border border-white/10 bg-[#00000029]">
                      <Image
                        src={album.image}
                        alt={album.title}
                        fill
                        sizes="28px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <span
                    className={`truncate text-[11px] ${originalIdx === activeAlbumIndex ? "text-[var(--color-accent)]" : "group-hover:text-white"}`}
                  >
                    {album.title
                      .replace(/&apos;/gi, "'")
                      .replace(/&amp;/gi, "&")}
                  </span>
                </div>
                {album.year && (
                  <span
                    className={`shrink-0 text-[0.9rem] ${originalIdx === activeAlbumIndex ? "text-[var(--color-accent)]" : "text-white/40 group-hover:text-white"} transition-colors`}
                  >
                    {album.year}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  const toggleMute = () => {
    if (volume > 0) {
      prevVolumeRef.current = volume;
      setVolume(0);
    } else {
      setVolume(prevVolumeRef.current > 0 ? prevVolumeRef.current : 0.8);
    }
  };

  const activeAlbum = albums[activeAlbumIndex];
  const activeTrack = activeAlbum?.tracks[activeTrackIndex];

  const handleNext = useCallback(() => {
    if (!activeAlbum) return;
    setActiveTrackIndex((prev) =>
      prev < activeAlbum.tracks.length - 1 ? prev + 1 : 0,
    );
  }, [activeAlbum]);

  const handlePrev = useCallback(() => {
    if (currentTime > 3) {
      if (audioRef.current) audioRef.current.currentTime = 0;
    } else {
      setActiveTrackIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }
  }, [currentTime]);

  // Initialize audio element with lazy preloading (0 bytes transferred on initial page load)
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "none";
      audioRef.current = audio;
    }
    const audio = audioRef.current;

    const setAudioData = () => setDuration(audio.duration);
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const setAudioEnd = () => handleNext();

    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", setAudioEnd);

    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", setAudioEnd);
      audio.pause();
    };
  }, [handleNext]);

  // Update audio source dynamically only when user is actively playing
  useEffect(() => {
    if (!audioRef.current || !activeTrack) return;

    if (isPlaying) {
      const streamUrl = `/api/audio?t=${encodeURIComponent(btoa(activeTrack.file))}`;
      audioRef.current.src = streamUrl;
      audioRef.current.load();
      audioRef.current
        .play()
        .catch((e) => console.log("Autoplay prevented:", e));
    }
  }, [activeTrackIndex, activeAlbumIndex, activeTrack, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current || !activeTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const streamUrl = `/api/audio?t=${encodeURIComponent(btoa(activeTrack.file))}`;
      if (
        !audioRef.current.src ||
        audioRef.current.src === "" ||
        audioRef.current.src === window.location.href
      ) {
        audioRef.current.src = streamUrl;
        audioRef.current.load();
      }
      audioRef.current.play().catch((e) => console.log("Play prevented:", e));
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Memoized search results across 700+ songs
  const q = searchQuery.toLowerCase().trim();
  const searchResults = q
    ? albums.flatMap((album, albumIdx) =>
        album.tracks.flatMap((track, trackIdx) =>
          track.title.toLowerCase().includes(q)
            ? [{ track, trackIdx, album, albumIdx }]
            : [],
        ),
      )
    : [];

  if (!isExpanded) {
    return (
      <section id="music-player-section" className="site-container">
        <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-purple-950/70 p-4 backdrop-blur-xl sm:flex-row sm:p-6">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-purple-400/40 bg-purple-500/20">
              <Music className="h-7 w-7 text-purple-300" />
            </div>
            <div>
              <span className="mb-1 block text-[11px] text-purple-400">
                7th Heaven Music Vault
              </span>
              <h3 className="text-xl sm:text-2xl">
                Official MP3 Discography & Audio Player (700+ Songs)
              </h3>
            </div>
          </div>

          <SeventhButton
            onClick={() => setIsExpanded(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 hover:bg-purple-500"
          >
            <Play className="h-5 w-5 fill-current" />
            <span>Open Audio Player</span>
          </SeventhButton>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative flex h-[780px] min-h-[700px] w-full flex-col justify-between overflow-hidden"
      id="music-player-section"
      style={{
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0px, black 33px, black calc(100% - 10px), transparent 100%)",
        maskImage:
          "linear-gradient(to bottom, transparent 0px, black 33px, black calc(100% - 10px), transparent 100%)",
      }}
    >
      {/* Collapse Player Button in Top Bar */}
      <div className="absolute top-3 right-4 z-40">
        <button
          onClick={() => {
            setIsPlaying(false);
            if (audioRef.current) {
              audioRef.current.pause();
            }
            setIsExpanded(false);
          }}
          className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/60 px-3 py-1.5 text-xs backdrop-blur-md transition-all hover:bg-black/80 hover:text-white"
        >
          <X className="h-4 w-4" />
          <span>Close Player</span>
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row md:items-stretch">
        {/* --- SIDEBAR --- */}
        <div className="relative z-10 flex h-full min-h-full w-full shrink-0 flex-col self-stretch overflow-hidden border-r border-white/10 pt-6 pb-0 pl-4 backdrop-blur-xl md:w-[clamp(200px,24vw,320px)] md:pt-10 md:pl-8">
          {/* Fading Vertical Divider on Right */}
          <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-black/20 to-transparent dark:via-white/20" />
          {/* Fast Search Input */}
          <div className="input-glow-border relative mb-6 rounded-lg pr-3">
            <div className="relative flex w-full items-center">
              <svg
                className="pointer-events-none absolute top-1/2 left-3 z-20 h-4 w-4 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                aria-label="Search"
                type="text"
                placeholder="Search 700+ songs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="placeholder: w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 pl-9 text-white/40 backdrop-blur-xl transition-all outline-none"
              />
              {searchQuery && (
                <button
                  aria-label="Clear search"
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1/2 right-3 z-20 -translate-y-1/2 cursor-pointer text-white/40 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="relative flex h-full min-h-0 flex-1 items-stretch overflow-hidden">
            <div
              ref={sidebarScrollRef}
              onScroll={handleSidebarScroll}
              className="no-scrollbar min-h-0 flex-1 overflow-y-auto pr-3 pb-8"
              style={{ overscrollBehavior: "auto" }}
            >
              {renderAlbumList(originalCds, "Original CD's")}
              {renderAlbumList(medleyCds, "Medley CD's")}
              {renderAlbumList(coverCds, "Cover CD's")}
              {renderAlbumList(holidayCds, "Holiday CD's")}
            </div>

            {/* Permanent Custom Interactive Purple Scrollbar Track & Thumb */}
            <div
              onClick={handleSidebarTrackClick}
              className={`relative mb-6 ml-1 w-2.5 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-purple-500/30 bg-purple-950/50 shadow-[0_0_8px_rgba(147,51,234,0.2)] transition-all duration-300 hover:bg-purple-900/60 ${sidebarThumbHeight >= 99 ? "pointer-events-none hidden opacity-0" : "opacity-100"}`}
            >
              <div
                onMouseDown={handleSidebarThumbMouseDown}
                className="absolute w-full cursor-grab rounded-lg border border-white/40 bg-gradient-to-b from-purple-400 via-purple-500 to-purple-700 shadow-[0_0_12px_#c084fc] transition-transform hover:brightness-125 active:cursor-grabbing"
                style={{
                  height: `${sidebarThumbHeight}%`,
                  top: `${(sidebarScrollProgress * (100 - sidebarThumbHeight)) / 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* --- MAIN AREA (MIDDLE TRACKLIST + CREDITS SIDEBAR + BOTTOM PLAYBAR) --- */}
        <div className="relative flex h-full min-h-full min-w-0 flex-1 flex-col justify-between self-stretch overflow-hidden bg-[#00000029]">
          {/* Top Section: Tracklist + Credits Sidebar */}
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row md:items-stretch">
            {/* Middle Tracklist Column */}
            <div className="relative flex h-full min-h-full min-w-0 flex-1 flex-col justify-between self-stretch overflow-hidden bg-[#00000029]">
              {/* Tablet & Mobile Album Header Bar */}
              <div className="z-20 flex shrink-0 items-center justify-between border-b border-white/10 bg-black/50 px-4 py-3 backdrop-blur-xl lg:hidden">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/10">
                    {activeAlbum?.image ? (
                      <Image
                        src={activeAlbum.image}
                        alt={activeAlbum.title}
                        fill
                        sizes="44px"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div className="h-full w-full bg-purple-900/50" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="r truncate">
                      {activeAlbum?.title
                        ?.replace(/&apos;/gi, "'")
                        .replace(/&amp;/gi, "&") || "7th Heaven"}
                    </p>
                    <p className="truncate">
                      {activeAlbum?.tracks?.length || 0} TRACKS ·{" "}
                      {activeAlbum?.type || "ALBUM"}
                    </p>
                  </div>
                </div>
                <div className="relative w-full max-w-[144px] min-w-[88px] shrink md:hidden">
                  <input
                    aria-label="Search"
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="placeholder: w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-white/40 outline-none"
                  />
                </div>
              </div>

              {/* Tracklist */}
              <div className="relative flex h-full min-h-0 flex-1 items-stretch overflow-hidden">
                <div
                  ref={tracklistScrollRef}
                  onScroll={handleTracklistScroll}
                  className="no-scrollbar h-full min-h-0 flex-1 overflow-y-auto px-0 pt-10 pb-8"
                  style={{
                    overscrollBehavior: "auto",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, black 0%, black calc(100% - 50px), transparent 100%)",
                    maskImage:
                      "linear-gradient(to bottom, black 0%, black calc(100% - 50px), transparent 100%)",
                  }}
                >
                  {searchQuery.trim() ? (
                    searchResults.length > 0 ? (
                      searchResults.map(
                        ({ track, trackIdx, album, albumIdx }) => {
                          const isActive =
                            albumIdx === activeAlbumIndex &&
                            trackIdx === activeTrackIndex;
                          const cleanName = cleanTitle(track.title);
                          return (
                            <button
                              type="button"
                              key={`${albumIdx}-${trackIdx}`}
                              className={`group flex w-full items-center justify-between !rounded-none border-0 px-6 py-2.5 text-left transition-colors select-none ${isActive ? "cursor-default border-0 bg-[var(--color-accent)]/15" : "cursor-pointer border-0"}`}
                              onClick={() => {
                                setActiveAlbumIndex(albumIdx);
                                setActiveTrackIndex(trackIdx);
                                setIsPlaying(true);
                              }}
                            >
                              <div className="flex min-w-0 items-center gap-4">
                                <span className="shrink-0 text-[var(--font-size-2xs)]">
                                  {album.title.split(" ")[0]}
                                </span>
                                <span
                                  className={`truncate ${isActive ? "text-[var(--color-accent)]" : "group-hover:text-white"}`}
                                >
                                  {cleanName}
                                </span>
                              </div>
                              <span className="text-[var(--font-size-2xs)] text-white/40">
                                {getDummyDuration(track.title, trackIdx)}
                              </span>
                            </button>
                          );
                        },
                      )
                    ) : (
                      <div className="p-8 text-center text-white/40">
                        No songs found matching &ldquo;{searchQuery}&rdquo;
                      </div>
                    )
                  ) : (
                    activeAlbum?.tracks &&
                    Array.from(activeAlbum.tracks, (track, idx) => ({
                      track,
                      idx,
                    })).map(({ track, idx }) => {
                      const isActive = idx === activeTrackIndex;
                      const trackNumber = String(idx + 1).padStart(2, "0");
                      const cleanName = cleanTitle(track.title);

                      return (
                        <button
                          type="button"
                          key={track.title}
                          className={`group flex w-full items-center justify-between !rounded-none border-0 px-6 py-2.5 text-left transition-colors select-none ${isActive ? "cursor-default border-0 bg-[var(--color-accent)]/15" : "cursor-pointer border-0"}`}
                          onClick={() => {
                            if (isActive) togglePlay();
                            else {
                              setActiveTrackIndex(idx);
                              setIsPlaying(true);
                            }
                          }}
                        >
                          <div className="flex items-center gap-5">
                            <span
                              className={`w-6 text-left ${isActive ? "text-[var(--color-accent)]" : "text-white/40"}`}
                            >
                              {trackNumber}
                            </span>
                            <span
                              className={`max-w-[200px] truncate sm:max-w-[300px] md:max-w-[400px] ${isActive ? "text-[var(--color-accent)]" : "transition-colors group-hover:text-white"}`}
                            >
                              {cleanName}
                            </span>
                          </div>

                          <span
                            className={`mr-2 ${isActive ? "text-[var(--color-accent)]" : "text-white/40"}`}
                          >
                            {isActive && duration
                              ? formatTime(duration)
                              : getDummyDuration(track.title, idx)}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Permanent Custom Interactive Purple Scrollbar Track & Thumb */}
                <div
                  onClick={handleTracklistTrackClick}
                  className={`relative z-20 my-8 mr-2 w-2.5 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-purple-500/30 bg-purple-950/50 shadow-[0_0_8px_rgba(147,51,234,0.2)] transition-all duration-300 hover:bg-purple-900/60 ${tracklistThumbHeight >= 99 ? "pointer-events-none hidden opacity-0" : "opacity-100"}`}
                >
                  <div
                    onMouseDown={handleTracklistThumbMouseDown}
                    className="absolute w-full cursor-grab rounded-lg border border-white/40 bg-gradient-to-b from-purple-400 via-purple-500 to-purple-700 shadow-[0_0_12px_#c084fc] transition-transform hover:brightness-125 active:cursor-grabbing"
                    style={{
                      height: `${tracklistThumbHeight}%`,
                      top: `${(tracklistScrollProgress * (100 - tracklistThumbHeight)) / 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* --- CREDITS SIDEBAR --- */}
            <div
              data-lenis-prevent="true"
              data-lenis-prevent-wheel="true"
              data-lenis-prevent-touch="true"
              onWheel={(e) => e.stopPropagation()}
              className="custom-scrollbar relative z-10 hidden h-full w-full shrink-0 items-center self-stretch overflow-y-auto overscroll-contain border-l border-white/10 pt-5 pr-4 pb-8 pl-4 backdrop-blur-xl md:flex md:w-[clamp(220px,22vw,350px)] md:flex-col lg:pr-8 lg:pl-6"
              style={{ overscrollBehavior: "contain" }}
            >
              {/* Fading Vertical Divider on Left */}
              <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-px bg-gradient-to-b from-transparent via-black/20 to-transparent dark:via-white/20" />

              {/* Animated gradient orb */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div
                  className="h-[300px] w-[300px] animate-[orbPulse_8s_ease-in-out_infinite] rounded-lg opacity-10 blur-[80px]"
                  style={{
                    background:
                      "radial-gradient(circle, var(--color-accent), #3b82f6, transparent)",
                  }}
                />
              </div>

              {/* Sound Wave Animation */}
              <div className="relative z-[2] mb-3 flex h-[36px] w-[140px] items-center justify-center">
                <SoundWaveCanvas isPlaying={isPlaying} />
              </div>

              {/* Album cover thumbnail container */}
              <div className="relative z-[2] mb-3 flex h-[100px] w-[100px] shrink-0 items-center justify-center overflow-hidden rounded-sm border border-white/10 bg-[#00000029]">
                {activeAlbum?.image ? (
                  <Image
                    src={activeAlbum.image}
                    alt={activeAlbum.title}
                    fill
                    sizes="100px"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white/20"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </div>

              {/* Album Title */}
              <span className="relative z-[2] max-w-full px-4 text-center">
                {activeAlbum ? (
                  <span className="block max-w-[220px] truncate">
                    {activeAlbum.title
                      .replace(/&apos;/gi, "'")
                      .replace(/&amp;/gi, "&")}
                  </span>
                ) : (
                  <span>Select an album</span>
                )}
              </span>

              {/* Dynamic Content: Credits/Lineup OR No Credits Available */}
              {activeAlbum ? (
                activeAlbum?.lineup?.length > 0 ||
                activeAlbum?.credits?.length > 0 ? (
                  <div className="relative z-[2] mt-4 w-full border-t border-white/10 pt-4 text-left">
                    {activeAlbum?.lineup?.length > 0 && (
                      <div className="mb-6">
                        <h3 className="/90 mb-1.5">Line-Up</h3>
                        <ul className="flex flex-col gap-1 text-[12px]">
                          {activeAlbum.lineup.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeAlbum?.credits?.length > 0 && (
                      <div className="mb-6">
                        <h3 className="/90 mb-1.5">Credits</h3>
                        <ul className="flex flex-col gap-1 text-[12px]">
                          {activeAlbum.credits.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Lyrics Button */}
                    {activeAlbum?.id &&
                      ALBUMS_WITH_LYRICS.has(activeAlbum.id) && (
                        <button
                          onClick={() => setShowLyrics(true)}
                          className="mt-2 block cursor-pointer text-left text-[var(--color-accent)] transition-colors"
                        >
                          Lyrics
                        </button>
                      )}

                    {/* Buy / Stream Buttons */}
                    <div className="mt-6 flex w-full flex-col gap-2 border-t border-white/10 pt-4">
                      {(activeAlbum?.paypalButtonId ||
                        activeAlbum?.storeUrl) && (
                        <SeventhButton
                          icon={
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="9" cy="21" r="1" />
                              <circle cx="20" cy="21" r="1" />
                              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                          }
                          onClick={() => {
                            const url = activeAlbum?.paypalButtonId
                              ? `https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=${activeAlbum.paypalButtonId}`
                              : activeAlbum?.storeUrl;
                            if (url)
                              window.open(url, "_blank", "noopener,noreferrer");
                          }}
                          className="! w-full rounded-lg px-4 py-2.5"
                        >
                          Buy CD
                        </SeventhButton>
                      )}
                      <div className="flex w-full flex-col gap-2 xl:flex-row">
                        {activeAlbum?.spotifyUrl && (
                          <a
                            href={activeAlbum.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="! flex w-full flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#1DB954] bg-[#1DB954] px-3 py-2 transition-colors hover:bg-[#179a45]"
                          >
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                            </svg>
                            Spotify
                          </a>
                        )}
                        {activeAlbum?.appleMusicUrl && (
                          <a
                            href={activeAlbum.appleMusicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="! flex w-full flex-1 items-center justify-center gap-1.5 rounded-lg !bg-black px-3 py-2 transition-colors hover:!bg-zinc-900"
                          >
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.802.42.127.856.187 1.297.228.56.053 1.122.07 1.684.077.55.006 1.1.008 1.65.006h7.7c.51 0 1.02-.006 1.53-.022.62-.02 1.24-.05 1.85-.17.93-.18 1.77-.545 2.468-1.188.71-.654 1.18-1.454 1.434-2.38.167-.604.234-1.224.27-1.848.03-.503.04-1.008.047-1.512V6.124zm-6.772 8.89v3.63c0 .27-.04.533-.15.78a1.57 1.57 0 01-.967.876c-.383.14-.78.2-1.18.228-.5.03-1.003.003-1.48-.177a1.6 1.6 0 01-1.028-.975c-.167-.44-.103-.87.098-1.288.26-.545.718-.87 1.272-1.06.44-.15.9-.213 1.36-.287.31-.05.62-.098.92-.183.2-.06.32-.18.37-.39.01-.03.01-.06.01-.09V9.43c0-.09-.023-.16-.1-.21-.06-.04-.13-.03-.2-.02l-4.87 1.06c-.04.01-.07.02-.1.03-.1.04-.15.11-.16.22v6.24c.005.07.003.14 0 .21-.03.56-.07 1.12-.38 1.62-.29.48-.7.79-1.22.96-.37.12-.76.16-1.15.18-.47.02-.94-.02-1.39-.18-.61-.22-1.03-.62-1.19-1.26-.12-.47-.06-.93.16-1.37.27-.54.71-.87 1.27-1.06.44-.15.9-.21 1.36-.29.3-.05.6-.09.9-.18.19-.06.32-.18.37-.39.01-.03.01-.06.01-.09V7.54c0-.2.06-.36.22-.47.09-.06.18-.1.28-.12l6.2-1.35c.17-.04.34-.07.51-.08.26-.01.42.13.45.39.01.06.01.12.01.18v8.94z" />
                            </svg>
                            Apple
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="relative z-[2] mt-3 block text-center font-normal text-black/40">
                    No Credits Available
                  </span>
                )
              ) : (
                <span className="relative z-[2] mt-3 block text-center font-normal text-white/20">
                  Select an album
                </span>
              )}
            </div>
          </div>

          {/* --- PLAY CONTROLS STRIP --- */}
          <div className="relative z-30 flex h-[54px] w-full shrink-0 items-center gap-3 border-t border-white/10 bg-black/50 px-4 backdrop-blur-xl sm:gap-4 md:px-8">
            {/* Album Cover & Play Button Overlay */}
            <button
              type="button"
              aria-label="Toggle play"
              className="group relative z-20 h-[46px] w-[46px] shrink-0 cursor-pointer overflow-hidden rounded-lg border-0 p-0 shadow-[4px_0_15px_rgba(0,0,0,0.5)]"
              onClick={togglePlay}
            >
              {activeAlbum?.image ? (
                <Image
                  src={activeAlbum.image}
                  alt="Cover"
                  fill
                  sizes="46px"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className="h-full w-full bg-[var(--color-bg-card)]" />
              )}
              <div className="overlay-center-hover">
                <div className="flex h-7 w-7 transform items-center justify-center rounded-lg border border-white bg-black/30 backdrop-blur-sm transition-transform group-hover:scale-110">
                  {isPlaying ? (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="ml-[1px]"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </div>
              </div>
            </button>

            {/* Song Title */}
            <div className="hidden max-w-[180px] min-w-0 shrink-0 md:block">
              <p className="truncate pt-0">
                {activeTrack?.title
                  ?.replace(/^\d+\s*/, "")
                  .replace(/&apos;/g, "'")
                  .replace(/&amp;/g, "&")}
              </p>
              <p className="mt-0 truncate">
                {activeAlbum?.title
                  ?.replace(/&apos;/g, "'")
                  .replace(/&amp;/g, "&")}
              </p>
            </div>

            {/* Prev / Next Controls */}
            <div className="ml-1 flex shrink-0 items-center gap-3 sm:ml-2">
              <button
                aria-label="Previous"
                className="cursor-pointer text-white/50 transition-colors hover:text-white"
                onClick={handlePrev}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="19 20 9 12 19 4 19 20"></polygon>
                  <line x1="5" y1="19" x2="5" y2="5"></line>
                </svg>
              </button>

              {/* Play / Pause */}
              <button
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-[1px]"
                  >
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                )}
              </button>

              <button
                aria-label="Next"
                className="cursor-pointer text-white/50 transition-colors hover:text-white"
                onClick={handleNext}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 4 15 12 5 20 5 4"></polygon>
                  <line x1="19" y1="5" x2="19" y2="19"></line>
                </svg>
              </button>
            </div>

            {/* Current Time */}
            <div className="ml-1 shrink-0">{formatTime(currentTime)}</div>

            {/* Progress Bar (Extends across all available space to the right!) */}
            <div className="group relative mx-2 flex h-3 min-w-[100px] flex-1 cursor-pointer items-center sm:mx-3">
              {/* Track Background */}
              <div className="h-1.5 w-full overflow-hidden rounded-lg border border-white/10 bg-white/15 backdrop-blur-[45px] transition-all duration-200 group-hover:bg-white/25">
                <div
                  className="h-full rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-[#d946ef] shadow-[0_0_8px_rgba(217,70,239,0.8)]"
                  style={{
                    width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  }}
                />
              </div>
              {/* Glowing Thumb Indicator Dot */}
              <div
                className="pointer-events-none absolute top-1/2 -ml-1.5 h-3.5 w-3.5 -translate-y-1/2 scale-90 rounded-lg border-2 border-[#d946ef] bg-white shadow-[0_0_10px_#d946ef] transition-transform duration-150 group-hover:scale-125"
                style={{
                  left: `${duration ? (currentTime / duration) * 100 : 0}%`,
                }}
              />
              <input
                aria-label="Seek audio position"
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />
            </div>

            {/* Full Time */}
            <div className="mr-1 shrink-0">
              {duration
                ? formatTime(duration)
                : getDummyDuration(activeTrack?.title || "", activeTrackIndex)}
            </div>

            {/* Right Controls (Volume) */}
            <div className="ml-auto flex shrink-0 items-center gap-4">
              {/* Volume */}
              <div className="flex w-[110px] items-center gap-2.5 sm:w-[140px]">
                <button
                  type="button"
                  aria-label="Toggle mute"
                  onClick={toggleMute}
                  className="flex shrink-0 cursor-pointer items-center justify-center border-0 p-0 text-white/50 transition-colors hover:text-white"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {volume === 0 ? (
                      <>
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <line x1="23" y1="9" x2="17" y2="15"></line>
                        <line x1="17" y1="9" x2="23" y2="15"></line>
                      </>
                    ) : volume < 0.5 ? (
                      <>
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      </>
                    ) : (
                      <>
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      </>
                    )}
                  </svg>
                </button>
                <div
                  className="group relative flex h-3 flex-1 cursor-pointer items-center"
                  onWheel={(e) => {
                    const delta = e.deltaY < 0 ? 0.05 : -0.05;
                    const nv = Math.min(1, Math.max(0, volume + delta));
                    setVolume(nv);
                  }}
                >
                  {/* Track Background */}
                  <div className="h-1.5 w-full overflow-hidden rounded-lg border border-white/10 bg-white/15 backdrop-blur-[45px] transition-all duration-200 group-hover:bg-white/25">
                    <div
                      className="h-full rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-[#d946ef] shadow-[0_0_8px_rgba(217,70,239,0.8)]"
                      style={{
                        width: `${Math.min(100, Math.max(0, volume * 100))}%`,
                      }}
                    />
                  </div>
                  {/* Glowing Thumb Handle */}
                  <div
                    className="pointer-events-none absolute top-1/2 -ml-1.5 h-3.5 w-3.5 -translate-y-1/2 scale-90 rounded-lg border-2 border-[#d946ef] bg-white shadow-[0_0_8px_#d946ef] transition-transform duration-150 group-hover:scale-125"
                    style={{
                      left: `${Math.min(100, Math.max(0, volume * 100))}%`,
                    }}
                  />
                  <input
                    aria-label="Adjust volume"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lyrics Modal */}
      {showLyrics &&
        (() => {
          const lyricsData = loadedLyrics;
          const activeTrack = activeAlbum?.tracks?.[activeTrackIndex];
          const trackTitle = activeTrack?.title?.replace(/^\d+\s*/, "");
          const songLyrics = lyricsData?.songs?.find((s: LyricSong) => {
            const clean = (str: string) =>
              str.toLowerCase().replace(/[^a-z0-9]/g, "");
            return clean(s.title) === clean(trackTitle || "");
          });
          return (
            <div
              className="fixed inset-0 z-[200] flex cursor-default items-center justify-center bg-black/80 backdrop-blur-[45px]"
              onClick={() => setShowLyrics(false)}
            >
              <div
                className="relative mx-4 flex max-h-[85vh] w-full max-w-[600px] cursor-auto flex-col overflow-hidden border border-white/10 bg-[var(--color-bg-surface)]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex shrink-0 items-center justify-between bg-[var(--color-bg-surface)] px-8 py-5">
                  <div className="min-w-0">
                    <h3 className="truncate">{trackTitle}</h3>
                    <p>
                      {activeAlbum?.title
                        ?.replace(/&apos;/gi, "'")
                        .replace(/&amp;/gi, "&")}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowLyrics(false)}
                    className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center text-white/50 transition-colors hover:text-white"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                {/* Modal Body */}
                <div
                  data-lenis-prevent="true"
                  data-lenis-prevent-wheel="true"
                  data-lenis-prevent-touch="true"
                  onWheel={(e) => e.stopPropagation()}
                  className="custom-scrollbar flex-1 overflow-y-auto overscroll-contain px-8 py-6"
                  style={{ overscrollBehavior: "contain" }}
                >
                  {songLyrics?.lyrics &&
                  Object.keys(songLyrics.lyrics).length > 0
                    ? Object.entries(songLyrics.lyrics).map(
                        ([section, text]: [string, string]) => (
                          <div key={section} className="mb-6">
                            <span className="mb-2 block text-[var(--color-accent)]/60">
                              {section.replace(/_/g, " ").replace(/\d+$/, "")}
                            </span>
                            <p className="whitespace-pre-line">{text}</p>
                          </div>
                        ),
                      )
                    : null}
                </div>
              </div>
            </div>
          );
        })()}

      {/* Close Top Flex container */}
    </section>
  );
}
