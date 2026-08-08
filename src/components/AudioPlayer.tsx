/* eslint-disable react-doctor/no-giant-component */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import data from "../../public/data/albums.json";
import beHereLyrics from "../../public/data/lyrics/be-here.json";
import colorInMotionLyrics from "../../public/data/lyrics/color-in-motion.json";
import luminousLyrics from "../../public/data/lyrics/luminous.json";

interface LyricSong {
  title: string;
  lyrics?: Record<string, string>;
}
interface LyricData {
  songs: LyricSong[];
}

const lyricsMap: Record<string, LyricData> = {
  "01-be-here": beHereLyrics as unknown as LyricData,
  "07-color-in-motion": colorInMotionLyrics as unknown as LyricData,
  "09-luminous": luminousLyrics as unknown as LyricData,
};

const lerp = (v0: number, v1: number, t: number) => v0 * (1 - t) + v1 * t;

function SoundWaveCanvas({ isPlaying }: { isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ h: 0, amp: 0, rafId: 0, isVisible: true });
  const drawRef = useRef<(time: number) => void>(() => { });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        stateRef.current.isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const draw = useCallback((time: number) => {
    // Skip off-screen rendering or during page transitions — frees frame budget for main thread
    if (!stateRef.current.isVisible || (window as any).__pageTransitionActive) {
      stateRef.current.rafId = requestAnimationFrame((ts) => drawRef.current(ts / 1000));
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
  }, [isPlaying]);

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

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
    />
  );
}

const formatTime = (time: number) => {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const getDummyDuration = (title: string, idx: number) => {
  const totalSeconds = 180 + ((title.length * 13 + idx * 37) % 140);
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const cleanTitle = (str: string) => str.replace(/^\d+\s*/, '').replace(/\.mp3$/i, '').replace(/&apos;/gi, "'").replace(/&amp;/gi, "&");

export default function AudioPlayerSection() {
  const [albums, setAlbums] = useState(data);
  const [activeAlbumIndex, setActiveAlbumIndex] = useState(() => Math.max(0, data.findIndex(a => a.id.includes('be-here'))));
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const prevVolumeRef = useRef(0.8);
  const [showLyrics, setShowLyrics] = useState(false);
  const [eqBarProps] = useState(() =>
    [...Array(24)].map(() => ({
      duration: `${0.8 + Math.random() * 0.8}s`,
      height: `${15 + Math.random() * 50}px`,
    }))
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Search & Category Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "original" | "medley" | "cover" | "holiday">("all");

  const originalCds = albums.filter(a => {
    const isMedley = a.title.toLowerCase().includes('medley');
    const isCover = a.title.toLowerCase().includes('cover') || a.title.toLowerCase() === 'unplugged';
    const isHoliday = a.title.toLowerCase().includes('christmas') || a.title.toLowerCase().includes('holiday');
    return !isMedley && !isCover && !isHoliday;
  }).sort((a, b) => parseInt(b.year) - parseInt(a.year));
  const medleyCds = albums.filter(a => a.title.toLowerCase().includes('medley')).sort((a, b) => parseInt(b.year) - parseInt(a.year));
  const coverCds = albums.filter(a => a.title.toLowerCase().includes('cover') || a.title.toLowerCase() === 'unplugged').sort((a, b) => parseInt(b.year) - parseInt(a.year));
  const holidayCds = albums.filter(a => a.title.toLowerCase().includes('christmas') || a.title.toLowerCase().includes('holiday')).sort((a, b) => parseInt(b.year) - parseInt(a.year));

  const renderAlbumList = (categoryAlbums: typeof albums, title: string) => (
    <div className="mb-4">
      <h3 className="text-[var(--font-size-2xs)] font-bold tracking-[0.2em] uppercase text-white/40 mb-1.5">{title}</h3>
      <ul className="flex flex-col gap-0.5">
        {categoryAlbums.map((album) => {
          const originalIdx = albums.findIndex(a => a.id === album.id);
          return (
            <li key={album.id}>
              <button aria-label="Search"
                onClick={() => {
                  setActiveAlbumIndex(originalIdx);
                  setActiveTrackIndex(0);
                  setSearchQuery("");
                  setIsPlaying(false);
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("7h-album-change", { detail: { albumId: album.id } }));
                  }
                }}
                className={`w-full flex items-center justify-between text-left group transition-colors gap-2.5 overflow-hidden py-1 px-1.5 rounded-md ${originalIdx === activeAlbumIndex ? 'bg-[var(--color-accent)]/15 border-0' : 'hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1">
                  {album.image && (
                    <div className="relative w-7 h-7 shrink-0 bg-white/5 border border-white/10 shadow-sm rounded overflow-hidden">
                      <Image src={album.image} alt={album.title} fill sizes="28px" style={{ objectFit: 'cover' }} />
                    </div>
                  )}
                  <span className={`text-[11px] font-extrabold uppercase tracking-wider leading-tight truncate ${originalIdx === activeAlbumIndex ? ' text-[var(--color-accent)]' : 'text-white/80 group-hover:text-white'}`}>
                    {album.title.replace(/&apos;/gi, "'").replace(/&amp;/gi, "&")}
                  </span>
                </div>
                {album.year && (
                  <span className={`text-[0.6rem] font-bold font-mono tracking-widest shrink-0 ${originalIdx === activeAlbumIndex ? ' text-[var(--color-accent)]' : 'text-white/40 group-hover:text-white'} transition-colors`}>
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
    setActiveTrackIndex((prev) => (prev < activeAlbum.tracks.length - 1 ? prev + 1 : 0));
  }, [activeAlbum]);

  const handlePrev = useCallback(() => {
    if (currentTime > 3) {
      if (audioRef.current) audioRef.current.currentTime = 0;
    } else {
      setActiveTrackIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }
  }, [currentTime]);

  // Initialize audio element with metadata preloading
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "metadata";
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

  // Update audio source using instant HTTP Range Streaming (<30ms start time)
  useEffect(() => {
    if (!audioRef.current || !activeTrack) return;

    const wasPlaying = !audioRef.current.paused || isPlaying;
    const streamUrl = `/api/audio?t=${encodeURIComponent(btoa(activeTrack.file))}`;

    audioRef.current.src = streamUrl;
    audioRef.current.load();

    if (wasPlaying) {
      audioRef.current.play().catch(e => console.log("Autoplay prevented:", e));
      setIsPlaying(true);
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
    } else {
      audioRef.current.play().catch(e => console.log("Play prevented:", e));
    }
    setIsPlaying(!isPlaying);
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
          : []
      )
    )
    : [];

  return (
    <section
      ref={sectionRef}
      className="h-[calc(100dvh-90px)] flex flex-col justify-between relative w-full bg-transparent overflow-hidden"
      id="music-player-section"
      style={{
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 140px, black 100%)",
        maskImage: "linear-gradient(to bottom, transparent 0px, black 140px, black 100%)",
      }}
    >
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:items-stretch bg-transparent overflow-hidden">

        {/* --- SIDEBAR --- */}
        <div className="w-full lg:w-[320px]  backdrop-blur-xl border-r border-white/10 pt-10 pl-8 pr-6 pb-0 flex flex-col shrink-0 relative z-10 hidden lg:flex self-stretch h-full min-h-full overflow-hidden shadow-2xl">
          {/* Fading Vertical Divider on Right */}
          <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-black/20 dark:via-white/20 to-transparent pointer-events-none" />
          {/* Fast Search Input */}
          <div className="relative mb-6">
            <input aria-label="Search"
              type="text"
              placeholder="Search 700+ songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 backdrop-blur-xl border border-white/15 rounded-xl px-4 py-2.5 pl-9 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--color-accent)] transition-all font-bold shadow-lg"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button aria-label="Search"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div data-lenis-prevent="true" data-lenis-prevent-wheel="true" data-lenis-prevent-touch="true" className="flex-1 pr-3 pb-8 overflow-y-auto custom-scrollbar min-h-0">
            {renderAlbumList(originalCds, "Original CD's")}
            {renderAlbumList(medleyCds, "Medley CD's")}
            {renderAlbumList(coverCds, "Cover CD's")}
            {renderAlbumList(holidayCds, "Holiday CD's")}
          </div>
        </div>

        {/* --- MAIN AREA (MIDDLE SECTION) --- */}
        <div className="flex-1 relative flex flex-col justify-between bg-transparent self-stretch h-full min-h-full overflow-hidden min-w-0">

          {/* Tracklist */}
          <div
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            className="flex-1 overflow-y-auto px-0 pt-10 pb-8 custom-scrollbar h-full min-h-0"
            style={{
              WebkitMaskImage: "linear-gradient(to bottom, black 0%, black calc(100% - 50px), transparent 100%)",
              maskImage: "linear-gradient(to bottom, black 0%, black calc(100% - 50px), transparent 100%)",
            }}
          >
            {searchQuery.trim() ? (
              searchResults.length > 0 ? (
                searchResults.map(({ track, trackIdx, album, albumIdx }) => {
                  const isActive = albumIdx === activeAlbumIndex && trackIdx === activeTrackIndex;
                  const cleanName = cleanTitle(track.title);
                  return (
                    <button
                      type="button"
                      key={`${albumIdx}-${trackIdx}`}
                      className={`w-full text-left group flex items-center justify-between px-6 py-2.5 cursor-pointer transition-colors select-none border-0 ${isActive ? 'bg-[var(--color-accent)]/15 border-0' : 'border-0 hover:bg-white/5'}`} onClick={() => {
                        setActiveAlbumIndex(albumIdx);
                        setActiveTrackIndex(trackIdx);
                        setIsPlaying(true);
                      }}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="text-[var(--font-size-2xs)] font-bold uppercase tracking-widest  text-[var(--color-accent)] shrink-0">
                          {album.title.split(' ')[0]}
                        </span>
                        <span className={`text-sm font-bold truncate ${isActive ? ' text-[var(--color-accent)]' : 'text-white/80 group-hover:text-white'}`}>
                          {cleanName}
                        </span>
                      </div>
                      <span className="text-[var(--font-size-2xs)] text-white/40 font-mono font-bold">
                        {getDummyDuration(track.title, trackIdx)}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-white/40 text-xs font-bold uppercase tracking-widest">
                  No songs found matching &ldquo;{searchQuery}&rdquo;
                </div>
              )
            ) : (
              activeAlbum?.tracks && Array.from(activeAlbum.tracks, (track, idx) => ({ track, idx })).map(({ track, idx }) => {
                const isActive = idx === activeTrackIndex;
                const trackNumber = String(idx + 1).padStart(2, '0');
                const cleanName = cleanTitle(track.title);

                return (
                  <button
                    type="button"
                    key={track.title}
                    className={`w-full text-left group flex items-center justify-between px-6 py-2.5 cursor-pointer transition-colors select-none border-0 ${isActive ? 'bg-[var(--color-accent)]/15 border-0' : 'border-0 hover:bg-white/5'}`} onClick={() => {
                      if (isActive) togglePlay();
                      else {
                        setActiveTrackIndex(idx);
                        setIsPlaying(true);
                      }
                    }}
                  >
                    <div className="flex items-center gap-5">
                      <span className={`text-xs font-bold tracking-widest w-6 text-left ${isActive ? ' text-[var(--color-accent)]' : 'text-white/40'}`}>
                        {trackNumber}
                      </span>
                      <span className={`text-sm font-bold tracking-wide truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] ${isActive ? ' text-[var(--color-accent)]' : 'text-white/80 group-hover:text-white transition-colors'}`}>
                        {cleanName}
                      </span>
                    </div>

                    {/* Display duration */}
                    <span className={`text-xs font-bold tracking-widest mr-2 ${isActive ? ' text-[var(--color-accent)]' : 'text-white/40'}`}>
                      {isActive && duration ? formatTime(duration) : getDummyDuration(track.title, idx)}
                    </span>

                  </button>
                );
              })
            )}
          </div>

          {/* --- PLAY CONTROLS STRIP (MIDDLE SECTION ONLY) --- */}
          <div className="bg-transparent border-t border-white/10 h-[50px] flex items-center pr-4 md:pr-8 pl-0 gap-4 relative w-full shrink-0 z-20">

            {/* Album Cover & Play Button Overlay */}
            <button
              type="button"
              aria-label="Toggle play"
              className="relative w-[50px] h-[50px] shrink-0 cursor-pointer group shadow-[4px_0_15px_rgba(0,0,0,0.5)] z-20 border-0 p-0" onClick={togglePlay}
            >
              {activeAlbum?.image ? (
                <Image src={activeAlbum.image} alt="Cover" fill sizes="50px" style={{ objectFit: 'cover' }} className="transition-transform group-hover:scale-105" />
              ) : (
                <div className="w-full h-full bg-[var(--color-bg-card)]" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100">
                <div className="w-7 h-7 rounded-full border border-white flex items-center justify-center bg-black/30 backdrop-blur-sm transform group-hover:scale-110 transition-transform">
                  {isPlaying ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white ml-[1px]"><path d="M8 5v14l11-7z" /></svg>
                  )}
                </div>
              </div>
            </button>

            {/* Song Title */}
            <div className="min-w-0 max-w-[160px] shrink-0 hidden md:block">
              <p className="text-xs font-bold text-white truncate leading-tight">{activeTrack?.title?.replace(/^\d+\s*/, '').replace(/&apos;/g, "'").replace(/&amp;/g, "&")}</p>
              <p className="text-[10px] text-white/40 truncate leading-tight">{activeAlbum?.title?.replace(/&apos;/g, "'").replace(/&amp;/g, "&")}</p>
            </div>

            {/* Prev / Next Controls */}
            <div className="flex items-center gap-3 shrink-0 ml-2">
              <button aria-label="Previous" className="text-white/50 hover:text-white transition-colors" onClick={handlePrev}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
              </button>

              {/* Play / Pause */}
              <button aria-label="Action button" className="text-white hover:scale-110 transition-transform" onClick={togglePlay}>
                {isPlaying ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-[1px]"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                )}
              </button>

              <button aria-label="Next" className="text-white/50 hover:text-white transition-colors" onClick={handleNext}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
              </button>
            </div>

            {/* Current Time */}
            <div className="text-xs font-mono font-bold tracking-wider text-white ml-2 hidden sm:block">
              {formatTime(currentTime)}
            </div>

            {/* Progress Bar */}
            <div className="relative flex-1 h-[3px] bg-white/10 group mx-3 hidden sm:block max-w-[800px]">
              <input aria-label="Input field"
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div
                className="absolute top-0 left-0 h-full bg-[var(--color-accent)] pointer-events-none transition-colors"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              >
                {/* Indicator Dot */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
              </div>
            </div>

            {/* Full Time */}
            <div className="text-xs font-mono font-bold tracking-wider text-white mr-2 hidden sm:block">
              {duration ? formatTime(duration) : getDummyDuration(activeTrack?.title || '', activeTrackIndex)}
            </div>

            {/* Right Controls (Volume) */}
            <div className="flex items-center gap-4 shrink-0 ml-auto">

              {/* Volume */}
              <div className="flex items-center gap-2.5 w-[90px] hidden md:flex">
                <button
                  type="button"
                  aria-label="Toggle mute"
                  onClick={toggleMute}
                  className="bg-transparent border-0 p-0 cursor-pointer text-white/50 shrink-0 hover:text-white transition-colors flex items-center justify-center"
                >
                  <svg
                    width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    {volume === 0 ? (
                      <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></>
                    ) : volume < 0.5 ? (
                      <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></>
                    ) : (
                      <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></>
                    )}
                  </svg>
                </button>
                <div className="relative flex-1 h-[3px] bg-white/20">
                  <input aria-label="Input field"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className="absolute top-0 left-0 h-full bg-[var(--color-accent)] pointer-events-none"
                    style={{ width: `${volume * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- CREDITS SIDEBAR --- */}
        <div data-lenis-prevent="true" data-lenis-prevent-wheel="true" data-lenis-prevent-touch="true" className="w-full lg:w-[350px]  backdrop-blur-xl border-l border-white/10 pt-5 pl-6 pr-8 pb-8 shrink-0 overflow-y-auto custom-scrollbar hidden lg:flex lg:flex-col items-center relative overflow-hidden self-stretch h-full shadow-2xl">
          {/* Fading Vertical Divider on Left */}
          <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-black/20 dark:via-white/20 to-transparent pointer-events-none z-10" />

          {/* Animated gradient orb */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[300px] h-[300px] rounded-full opacity-10 blur-[80px] animate-[orbPulse_8s_ease-in-out_infinite]"
              style={{ background: 'radial-gradient(circle, var(--color-accent), #3b82f6, transparent)' }}
            />
          </div>

          {/* Sound Wave Animation */}
          <div className="relative z-[2] w-[140px] h-[36px] mb-3 flex items-center justify-center">
            <SoundWaveCanvas isPlaying={isPlaying} />
          </div>

          {/* Album cover thumbnail container */}
          <div className="relative z-[2] w-[100px] h-[100px] border border-white/15 rounded-sm mb-3 flex items-center justify-center bg-white/5 overflow-hidden shrink-0 shadow-md">
            {activeAlbum?.image ? (
              <Image
                src={activeAlbum.image}
                alt={activeAlbum.title}
                fill
                sizes="100px"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white/20">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </div>

          {/* Album Title */}
          <span className="relative z-[2] text-xs uppercase tracking-[0.2em] text-white/60 text-center font-black px-4 max-w-full">
            {activeAlbum ? (
              <span className="block text-white font-black text-sm truncate max-w-[220px]">
                {activeAlbum.title.replace(/&apos;/gi, "'").replace(/&amp;/gi, "&")}
              </span>
            ) : (
              <span>Select an album</span>
            )}
          </span>

          {/* Dynamic Content: Credits/Lineup OR No Credits Available */}
          {activeAlbum ? (
            (activeAlbum?.lineup?.length > 0 || activeAlbum?.credits?.length > 0) ? (
              <div className="relative z-[2] w-full text-left mt-4 pt-4 border-t border-white/10">
                {activeAlbum?.lineup?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-[14px] font-black tracking-wider text-white/90 uppercase mb-1.5">Line-Up</h3>
                    <ul className="flex flex-col gap-1 text-[14px] font-medium text-white/80 leading-snug">
                      {activeAlbum.lineup.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeAlbum?.credits?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-[14px] font-black tracking-wider text-white/90 uppercase mb-1.5">Credits</h3>
                    <ul className="flex flex-col gap-1 text-[14px] font-medium text-white/80 leading-snug">
                      {activeAlbum.credits.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Lyrics Button */}
                {lyricsMap[activeAlbum?.id] && (
                  <button aria-label="Action button"
                    onClick={() => setShowLyrics(true)}
                    className=" text-[var(--color-accent)] hover: text-[var(--color-accent)] text-sm font-black transition-colors cursor-pointer text-left mt-2 block"
                  >
                    Lyrics
                  </button>
                )}

                {/* Buy / Stream Buttons */}
                <div className="pt-4 border-t border-white/10 mt-6 flex flex-col gap-2">
                  {(activeAlbum?.paypalButtonId || activeAlbum?.storeUrl) && (
                    <a
                      href={activeAlbum?.paypalButtonId
                        ? `https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=${activeAlbum.paypalButtonId}`
                        : activeAlbum?.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold text-xs uppercase tracking-widest py-2.5 px-4 rounded transition-colors hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                      Buy CD
                    </a>
                  )}
                  <div className="flex gap-2">
                    {activeAlbum?.spotifyUrl && (
                      <a
                        href={activeAlbum.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 bg-[var(--color-brand-spotify)]/10 hover:bg-[var(--color-brand-spotify)]/25 border border-[#1DB954]/20 text-[#1DB954] font-bold text-[var(--font-size-3xs)] uppercase tracking-widest py-2 px-3 rounded transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
                        Spotify
                      </a>
                    )}
                    {activeAlbum?.appleMusicUrl && (
                      <a
                        href={activeAlbum.appleMusicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 bg-[var(--color-brand-apple-music)]/10 hover:bg-[var(--color-brand-apple-music)]/25 border border-[#FC3C44]/20 text-[#FC3C44] font-bold text-[var(--font-size-3xs)] uppercase tracking-widest py-2 px-3 rounded transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.802.42.127.856.187 1.297.228.56.053 1.122.07 1.684.077.55.006 1.1.008 1.65.006h7.7c.51 0 1.02-.006 1.53-.022.62-.02 1.24-.05 1.85-.17.93-.18 1.77-.545 2.468-1.188.71-.654 1.18-1.454 1.434-2.38.167-.604.234-1.224.27-1.848.03-.503.04-1.008.047-1.512V6.124zm-6.772 8.89v3.63c0 .27-.04.533-.15.78a1.57 1.57 0 01-.967.876c-.383.14-.78.2-1.18.228-.5.03-1.003.003-1.48-.177a1.6 1.6 0 01-1.028-.975c-.167-.44-.103-.87.098-1.288.26-.545.718-.87 1.272-1.06.44-.15.9-.213 1.36-.287.31-.05.62-.098.92-.183.2-.06.32-.18.37-.39.01-.03.01-.06.01-.09V9.43c0-.09-.023-.16-.1-.21-.06-.04-.13-.03-.2-.02l-4.87 1.06c-.04.01-.07.02-.1.03-.1.04-.15.11-.16.22v6.24c.005.07.003.14 0 .21-.03.56-.07 1.12-.38 1.62-.29.48-.7.79-1.22.96-.37.12-.76.16-1.15.18-.47.02-.94-.02-1.39-.18-.61-.22-1.03-.62-1.19-1.26-.12-.47-.06-.93.16-1.37.27-.54.71-.87 1.27-1.06.44-.15.9-.21 1.36-.29.3-.05.6-.09.9-.18.19-.06.32-.18.37-.39.01-.03.01-.06.01-.09V7.54c0-.2.06-.36.22-.47.09-.06.18-.1.28-.12l6.2-1.35c.17-.04.34-.07.51-.08.26-.01.42.13.45.39.01.06.01.12.01.18v8.94z" /></svg>
                        Apple
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <span className="relative z-[2] block text-[var(--font-size-3xs)] text-black/40 uppercase tracking-widest font-normal text-center mt-3">
                No Credits Available
              </span>
            )
          ) : (
            <span className="relative z-[2] block text-[var(--font-size-3xs)] text-white/20 uppercase tracking-widest font-normal text-center mt-3">
              Select an album
            </span>
          )}

        </div>
      </div>

      {/* Lyrics Modal */}
      {showLyrics && (() => {
        const lyricsData = lyricsMap[activeAlbum?.id];
        const activeTrack = activeAlbum?.tracks?.[activeTrackIndex];
        const trackTitle = activeTrack?.title?.replace(/^\d+\s*/, '');
        const songLyrics = lyricsData?.songs?.find((s: LyricSong) => {
          const clean = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
          return clean(s.title) === clean(trackTitle || '');
        });
        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md cursor-default" onClick={() => setShowLyrics(false)}>
            <div className="relative w-full max-w-[600px] max-h-[85vh] bg-[var(--color-bg-surface)] border border-white/10 overflow-hidden flex flex-col mx-4 cursor-auto" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-[var(--color-bg-surface)] shrink-0">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">{trackTitle}</h3>
                  <p className="text-xs text-white/40 uppercase tracking-widest mt-1">{activeAlbum?.title?.replace(/&apos;/gi, "'").replace(/&amp;/gi, "&")}</p>
                </div>
                <button aria-label="Action button" onClick={() => setShowLyrics(false)} className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors shrink-0 ml-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
                {songLyrics?.lyrics && Object.keys(songLyrics.lyrics).length > 0 ? (
                  Object.entries(songLyrics.lyrics).map(([section, text]: [string, string]) => (
                    <div key={section} className="mb-6">
                      <span className="text-xs font-bold uppercase tracking-[0.2em]  text-[var(--color-accent)]/60 mb-2 block">{section.replace(/_/g, ' ').replace(/\d+$/, '')}</span>
                      <p className="text-base text-white/70 leading-relaxed whitespace-pre-line">{text}</p>
                    </div>
                  ))
                ) : null}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Close Top Flex container */}
    </section>
  );
}
