"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface Track {
  id: string;
  number: number;
  title: string;
  duration: string;
  audioUrl: string;
}

interface Album {
  id: string;
  title: string;
  subtitle?: string;
  year: string;
  coverImage: string;
  centerLabelColor: string;
  tracks: Track[];
}

const ALBUMS: Album[] = [
  {
    id: "be-here",
    title: "BE HERE",
    subtitle: "POP MUSIC",
    year: "2025",
    coverImage: "/images/hero-banner.png",
    centerLabelColor: "#eab308",
    tracks: [
      { id: "t1", number: 1, title: "ARE WE THERE YET", duration: "3:42", audioUrl: "/audio/demo-track.mp3" },
      { id: "t2", number: 2, title: "COME WHAT MAY", duration: "3:15", audioUrl: "/audio/demo-track.mp3" },
      { id: "t3", number: 3, title: "FOR NEVER AND EVER", duration: "4:01", audioUrl: "/audio/demo-track.mp3" },
      { id: "t4", number: 4, title: "SUNDRESSES", duration: "3:30", audioUrl: "/audio/demo-track.mp3" },
      { id: "t5", number: 5, title: "AIN'T THAT JUST BEAUTIFUL", duration: "3:54", audioUrl: "/audio/demo-track.mp3" },
      { id: "t6", number: 6, title: "MONSTER", duration: "3:22", audioUrl: "/audio/demo-track.mp3" },
      { id: "t7", number: 7, title: "COUNTRY IN THE CITY", duration: "3:48", audioUrl: "/audio/demo-track.mp3" },
      { id: "t8", number: 8, title: "I LOVE THESE DAYS", duration: "3:12", audioUrl: "/audio/demo-track.mp3" },
      { id: "t9", number: 9, title: "INFINITY AND A DAY", duration: "4:15", audioUrl: "/audio/demo-track.mp3" },
      { id: "t10", number: 10, title: "LEGENDS", duration: "3:35", audioUrl: "/audio/demo-track.mp3" },
      { id: "t11", number: 11, title: "GET BACK UP AGAIN", duration: "3:08", audioUrl: "/audio/demo-track.mp3" },
      { id: "t12", number: 12, title: "TAKE A RIDE OF LIFE", duration: "3:50", audioUrl: "/audio/demo-track.mp3" },
      { id: "t13", number: 13, title: "SATURDAY NIGHT", duration: "3:25", audioUrl: "/audio/demo-track.mp3" },
      { id: "t14", number: 14, title: "I WANNA SEE YOU SHINE", duration: "4:05", audioUrl: "/audio/demo-track.mp3" },
    ],
  },
  {
    id: "jukebox",
    title: "JUKEBOX",
    subtitle: "7TH HEAVEN",
    year: "2023",
    coverImage: "/images/band-performance.png",
    centerLabelColor: "#ec4899",
    tracks: [
      { id: "j1", number: 1, title: "SING ALONG", duration: "3:20", audioUrl: "/audio/demo-track.mp3" },
      { id: "j2", number: 2, title: "BETTER DAYS", duration: "3:45", audioUrl: "/audio/demo-track.mp3" },
      { id: "j3", number: 3, title: "CELL PHONE", duration: "3:10", audioUrl: "/audio/demo-track.mp3" },
      { id: "j4", number: 4, title: "STOP TELLING ME", duration: "3:55", audioUrl: "/audio/demo-track.mp3" },
      { id: "j5", number: 5, title: "BEAUTIFUL LIFE", duration: "4:12", audioUrl: "/audio/demo-track.mp3" },
      { id: "j6", number: 6, title: "UNCONDITIONAL", duration: "3:38", audioUrl: "/audio/demo-track.mp3" },
      { id: "j7", number: 7, title: "THIS IS OUR TIME", duration: "4:02", audioUrl: "/audio/demo-track.mp3" },
    ],
  },
  {
    id: "synergy",
    title: "SYNERGY",
    subtitle: "SPECTRUM",
    year: "2021",
    coverImage: "/images/hero-band-bg.png",
    centerLabelColor: "#3b82f6",
    tracks: [
      { id: "s1", number: 1, title: "MIDLIFE CRISIS", duration: "3:40", audioUrl: "/audio/demo-track.mp3" },
      { id: "s2", number: 2, title: "HIGH-OCTANE", duration: "3:15", audioUrl: "/audio/demo-track.mp3" },
      { id: "s3", number: 3, title: "HEARTBEAT", duration: "4:05", audioUrl: "/audio/demo-track.mp3" },
      { id: "s4", number: 4, title: "ROLLERCOASTER", duration: "3:50", audioUrl: "/audio/demo-track.mp3" },
      { id: "s5", number: 5, title: "KEEP ROCKIN'", duration: "4:20", audioUrl: "/audio/demo-track.mp3" },
    ],
  },
];

export default function VinylHeroPlayer() {
  const [activeAlbumIdx, setActiveAlbumIdx] = useState(0);
  const [activeTrackIdx, setActiveTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [slideOffset, setSlideOffset] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const currentAlbum = ALBUMS[activeAlbumIdx];
  const prevAlbum = ALBUMS[(activeAlbumIdx - 1 + ALBUMS.length) % ALBUMS.length];
  const nextAlbum = ALBUMS[(activeAlbumIdx + 1) % ALBUMS.length];
  const currentTrack = currentAlbum.tracks[activeTrackIdx] || currentAlbum.tracks[0];

  const playTrack = (trackIdx: number) => {
    setActiveTrackIdx(trackIdx);
    setIsPlaying(true);
    setAudioError(false);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
          setAudioError(true);
        });
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setAudioError(false);
        })
        .catch(() => setIsPlaying(false));
    }
  };

  const prevTrack = () => {
    const nextIdx = activeTrackIdx > 0 ? activeTrackIdx - 1 : currentAlbum.tracks.length - 1;
    playTrack(nextIdx);
  };

  const nextTrack = () => {
    const nextIdx = activeTrackIdx < currentAlbum.tracks.length - 1 ? activeTrackIdx + 1 : 0;
    playTrack(nextIdx);
  };

  const handleNextAlbum = () => {
    if (isSliding) return;
    setIsSliding(true);
    setSlideOffset(-160);

    setTimeout(() => {
      setActiveAlbumIdx((prev) => (prev + 1) % ALBUMS.length);
      setActiveTrackIdx(0);
      setIsPlaying(false);
      setSlideOffset(0);
      setIsSliding(false);
    }, 300);
  };

  const handlePrevAlbum = () => {
    if (isSliding) return;
    setIsSliding(true);
    setSlideOffset(160);

    setTimeout(() => {
      setActiveAlbumIdx((prev) => (prev - 1 + ALBUMS.length) % ALBUMS.length);
      setActiveTrackIdx(0);
      setIsPlaying(false);
      setSlideOffset(0);
      setIsSliding(false);
    }, 300);
  };

  // ── Drag & Touch Swipe Handlers ──
  const handleTouchStart = (clientX: number) => {
    touchStartX.current = clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (clientX: number) => {
    if (!isDragging.current || touchStartX.current === null) return;
    const diff = clientX - touchStartX.current;
    // Bound drag offset for natural spring resistance
    setSlideOffset(Math.max(-120, Math.min(120, diff)));
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (slideOffset < -40) {
      handleNextAlbum();
    } else if (slideOffset > 40) {
      handlePrevAlbum();
    } else {
      setSlideOffset(0);
    }
    touchStartX.current = null;
  };

  return (
    <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-8 select-none">
      
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack.audioUrl}
        onEnded={nextTrack}
        onError={() => setAudioError(true)}
      />

      {/* ── VINYL CAROUSEL SLIDER WRAPPER ── */}
      <div
        className="relative flex items-center justify-center gap-1 sm:gap-3 touch-pan-x cursor-grab active:cursor-grabbing py-2"
        onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleTouchMove(e.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
        onMouseDown={(e) => handleTouchStart(e.clientX)}
        onMouseMove={(e) => handleTouchMove(e.clientX)}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        
        {/* Left Side Faded Vinyl (Previous Album) */}
        <div
          onClick={handlePrevAlbum}
          className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-neutral-950 border-4 border-neutral-900 shadow-2xl opacity-40 hover:opacity-90 transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0 -mr-8 sm:-mr-10 z-0 scale-85 hover:scale-95 group/prev"
          title={`Slide to ${prevAlbum.title}`}
        >
          {/* Previous Album Cover Center Label */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-neutral-800 flex items-center justify-center">
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/40 flex items-center justify-center text-[7px] sm:text-[8px] font-black text-white shadow-md overflow-hidden relative"
              style={{ backgroundColor: prevAlbum.centerLabelColor }}
            >
              <Image src={prevAlbum.coverImage} alt={prevAlbum.title} fill className="object-cover opacity-70" />
              <span className="relative z-10 font-bold uppercase drop-shadow">Prev</span>
            </div>
          </div>
          {/* Navigation Overlay Chevron */}
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover/prev:opacity-100 transition-opacity">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          </div>
        </div>

        {/* ── ACTIVE TURNTABLE VINYL PLAYER CARD ── */}
        <div
          className="relative w-[240px] h-[240px] sm:w-[260px] sm:h-[260px] bg-[#220436]/95 border border-white/20 rounded-2xl p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col justify-between overflow-hidden z-10 group transition-transform duration-300"
          style={{
            transform: `translateX(${slideOffset}px)`,
          }}
        >
          
          {/* Top Controls Header */}
          <div className="flex items-center justify-between z-20">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 font-mono">
              VINYL STEREO
            </span>

            {/* Playback Controls |<< ► >>| */}
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              <button
                onClick={(e) => { e.stopPropagation(); prevTrack(); }}
                className="text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Previous Track"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="11 19 2 12 11 5 11 19"/><polygon points="22 19 13 12 22 5 22 19"/></svg>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-md"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                ) : (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" className="ml-[1px]"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                )}
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); nextTrack(); }}
                className="text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Next Track"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/></svg>
              </button>
            </div>
          </div>

          {/* Center Vinyl Disc with Needle Arm */}
          <div className="relative flex items-center justify-center my-auto">
            {/* Spinning Vinyl Record Disc */}
            <div
              className={`relative w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-neutral-950 border-[6px] border-neutral-900 shadow-2xl flex items-center justify-center transition-all duration-300 ${
                isPlaying ? "animate-[spin_4s_linear_infinite]" : ""
              }`}
            >
              {/* Concentric Record Grooves */}
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border border-neutral-800/80 flex items-center justify-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-neutral-800/60 flex items-center justify-center">
                  
                  {/* Center Album Art Label */}
                  <div
                    className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-amber-400 flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: currentAlbum.centerLabelColor }}
                  >
                    <Image
                      src={currentAlbum.coverImage}
                      alt={currentAlbum.title}
                      fill
                      className="object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-white/90 shadow border border-black/40" />
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Stylus Needle Arm Overlapping Disc */}
            <div
              className={`absolute top-0 right-3 w-16 h-20 pointer-events-none transition-transform duration-500 origin-top-right ${
                isPlaying ? "rotate-[15deg]" : "rotate-0"
              }`}
            >
              <svg width="60" height="70" viewBox="0 0 60 70" fill="none">
                <path d="M50 5 L42 35 L20 55" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                <circle cx="50" cy="5" r="4" fill="#eab308" />
                <circle cx="20" cy="55" r="3" fill="white" />
              </svg>
            </div>
          </div>

          {/* Bottom Title Box + Soundwave Icon */}
          <div className="flex items-end justify-between z-20">
            {/* White Title Overlay Box */}
            <div className="bg-white text-black rounded-lg px-2.5 py-1 shadow-md max-w-[140px] truncate">
              <div className="text-[11px] font-black uppercase leading-tight truncate">
                {currentAlbum.title}
              </div>
              <div className="text-[8px] font-extrabold uppercase tracking-tight text-black/70 leading-none truncate">
                {currentTrack.title}
              </div>
            </div>

            {/* Sound Wave Graphic (~v~) */}
            <div className="flex items-center gap-0.5 text-white/50 pb-0.5 font-mono text-xs">
              <span className={`w-1 h-3 rounded-full bg-purple-400 ${isPlaying ? "animate-bounce" : ""}`} />
              <span className={`w-1 h-4 rounded-full bg-purple-400 ${isPlaying ? "animate-[bounce_0.6s_ease-in-out_infinite]" : ""}`} />
              <span className={`w-1 h-2 rounded-full bg-purple-400 ${isPlaying ? "animate-bounce" : ""}`} />
            </div>
          </div>

        </div>

        {/* Right Side Faded Vinyl (Next Album) */}
        <div
          onClick={handleNextAlbum}
          className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-neutral-950 border-4 border-neutral-900 shadow-2xl opacity-40 hover:opacity-90 transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0 -ml-8 sm:-ml-10 z-0 scale-85 hover:scale-95 group/next"
          title={`Slide to ${nextAlbum.title}`}
        >
          {/* Next Album Cover Center Label */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-neutral-800 flex items-center justify-center">
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/40 flex items-center justify-center text-[7px] sm:text-[8px] font-black text-white shadow-md overflow-hidden relative"
              style={{ backgroundColor: nextAlbum.centerLabelColor }}
            >
              <Image src={nextAlbum.coverImage} alt={nextAlbum.title} fill className="object-cover opacity-70" />
              <span className="relative z-10 font-bold uppercase drop-shadow">Next</span>
            </div>
          </div>
          {/* Navigation Overlay Chevron */}
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover/next:opacity-100 transition-opacity">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
        </div>

      </div>

      {/* ── TRACKLIST PANEL (RIGHT SIDE) ── */}
      <div className="flex flex-col text-left max-w-[240px] sm:max-w-[270px]">
        
        {/* Album Selector Header */}
        <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/10">
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">
            {currentAlbum.title} TRACKLIST
          </span>
          <span className="text-[9px] font-bold text-white/40">
            {currentAlbum.tracks.length} SONGS
          </span>
        </div>

        {/* Scrollable Tracklist */}
        <ol className="space-y-1 font-sans text-[11px] sm:text-[12px] font-bold uppercase text-white/70 tracking-tight max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-500/40">
          {currentAlbum.tracks.map((track, idx) => {
            const isSelected = idx === activeTrackIdx;

            return (
              <li
                key={track.id}
                onClick={() => playTrack(idx)}
                className={`flex items-center gap-2 px-1.5 py-0.5 rounded cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "text-[#d946ef] font-black bg-purple-500/15 text-purple-200 shadow-sm"
                    : "hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-[9px] font-mono opacity-50 w-4 text-right">
                  {track.number}.
                </span>
                <span className="truncate flex-1">
                  {track.title}
                </span>
                {isSelected && isPlaying && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d946ef] animate-pulse" />
                )}
              </li>
            );
          })}
        </ol>

      </div>

    </div>
  );
}
