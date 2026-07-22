"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";

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
  {
    id: "next-level",
    title: "NEXT LEVEL",
    subtitle: "7TH HEAVEN",
    year: "2019",
    coverImage: "/images/hero-banner.png",
    centerLabelColor: "#8b5cf6",
    tracks: [
      { id: "n1", number: 1, title: "SHINE ON", duration: "3:30", audioUrl: "/audio/demo-track.mp3" },
      { id: "n2", number: 2, title: "ALWAYS THERE", duration: "3:45", audioUrl: "/audio/demo-track.mp3" },
      { id: "n3", number: 3, title: "DREAM BIG", duration: "4:10", audioUrl: "/audio/demo-track.mp3" },
      { id: "n4", number: 4, title: "ELECTRIC NIGHT", duration: "3:55", audioUrl: "/audio/demo-track.mp3" },
    ],
  },
  {
    id: "usa-uk",
    title: "USA-UK",
    subtitle: "7TH HEAVEN",
    year: "2017",
    coverImage: "/images/hero-banner.png",
    centerLabelColor: "#10b981",
    tracks: [
      { id: "u1", number: 1, title: "ATLANTIC", duration: "3:35", audioUrl: "/audio/demo-track.mp3" },
      { id: "u2", number: 2, title: "LONDON NIGHTS", duration: "3:50", audioUrl: "/audio/demo-track.mp3" },
      { id: "u3", number: 3, title: "CHICAGO BOUND", duration: "4:02", audioUrl: "/audio/demo-track.mp3" },
    ],
  },
];

export default function VinylHeroPlayer() {
  const [activeAlbumIdx, setActiveAlbumIdx] = useState(1);
  const [activeTrackIdx, setActiveTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTracklist, setShowTracklist] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentAlbum = ALBUMS[activeAlbumIdx];
  const currentTrack = currentAlbum.tracks[activeTrackIdx] || currentAlbum.tracks[0];

  const playTrack = (trackIdx: number) => {
    setActiveTrackIdx(trackIdx);
    setIsPlaying(true);
    setAudioError(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => { setIsPlaying(false); setAudioError(true); });
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Set spinning immediately — don't wait for audio promise
      setIsPlaying(true);
      setAudioError(false);
      audioRef.current.play()
        .catch(() => {
          setIsPlaying(false);
          setAudioError(true);
        });
    }
  };

  const prevTrack = () => {
    const idx = activeTrackIdx > 0 ? activeTrackIdx - 1 : currentAlbum.tracks.length - 1;
    playTrack(idx);
  };

  const nextTrack = () => {
    const idx = activeTrackIdx < currentAlbum.tracks.length - 1 ? activeTrackIdx + 1 : 0;
    playTrack(idx);
  };

  const handleSlideChange = (swiper: SwiperType) => {
    const newIdx = swiper.realIndex;
    if (newIdx !== activeAlbumIdx) {
      setActiveAlbumIdx(newIdx);
      setActiveTrackIdx(0);
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  return (
    <div className="relative flex items-center gap-4 select-none py-4">
      {/* Hidden Audio */}
      <audio
        ref={audioRef}
        src={currentTrack.audioUrl}
        onEnded={nextTrack}
        onError={() => setAudioError(true)}
      />

      {/* ── SWIPER VINYL DISC SLIDER ── */}
      <div className="relative" style={{ width: '700px' }}>

        {/* LAYER 1: Sleeve card background — sits BEHIND the disc (z-10) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-[270px] h-[270px] bg-[#220436]/85 border border-white/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)]" />
        </div>


        {/* LAYER 2: Swiper disc track — z-20, centeredSlides so active disc is always centered in container */}
        <Swiper
          slidesPerView="auto"
          centeredSlides={true}
          loop={false}
          initialSlide={activeAlbumIdx}
          spaceBetween={30}
          grabCursor={true}
          onSlideChange={handleSlideChange}
          style={{ overflow: "visible", position: "relative", zIndex: 20 }}
          className="vinyl-swiper"
        >
          {ALBUMS.map((album, idx) => (
            <SwiperSlide
              key={album.id}
              style={{ width: "176px", height: "220px" }}
            >
              {({ isActive }) => (
                <div
                  className={`relative rounded-full flex items-center justify-center mx-auto ${
                    isActive
                      ? "opacity-100 scale-110 z-10 shadow-[0_0_40px_rgba(234,179,8,0.5)]"
                      : "opacity-20 scale-90 z-0 transition-all duration-500"
                  } ${isActive && isPlaying ? "[animation:spin_4s_linear_infinite]" : "transition-all duration-500"}`}
                  style={{
                    width: "176px",
                    height: "176px",
                    background: "#0a0a0c",
                    border: isActive ? "5px solid #3f3f46" : "4px solid #1a1a1a",
                  }}
                >
                  {/* Concentric grooves */}
                  <div className="w-36 h-36 rounded-full border border-neutral-700/80 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full border border-neutral-700/60 flex items-center justify-center">
                      {/* Center label with album art */}
                      <div
                        className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 shadow-[0_0_12px_rgba(234,179,8,0.6)]"
                        style={{ backgroundColor: album.centerLabelColor }}
                      >
                        <Image src={album.coverImage} alt={album.title} fill className="object-cover brightness-110 contrast-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col items-center justify-end pb-1.5 text-center">
                          <span className="text-[7px] font-black text-white uppercase tracking-tighter drop-shadow-[0_1px_2px_rgba(0,0,0,1)] leading-none">{album.title}</span>
                          <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.9)] border border-black/60 mt-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        {/* LAYER 3: Controls overlay — z-30, floats ABOVE the disc */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="relative w-[270px] h-[270px] flex flex-col justify-between p-4 pointer-events-none">

            {/* Top Controls */}
            <div className="flex items-center justify-between pointer-events-auto">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40 font-mono">
                VINYL STEREO
              </span>
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 shadow">
                <button onClick={(e) => { e.stopPropagation(); prevTrack(); }} className="text-white/70 hover:text-white transition-colors cursor-pointer" title="Previous Track">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="11 19 2 12 11 5 11 19"/><polygon points="22 19 13 12 22 5 22 19"/></svg>
                </button>
                <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-md" title={isPlaying ? "Pause" : "Play"}>
                  {isPlaying ? (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  ) : (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" className="ml-[1px]"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  )}
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextTrack(); }} className="text-white/70 hover:text-white transition-colors cursor-pointer" title="Next Track">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 19 22 13 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/></svg>
                </button>
                <div className="w-[1px] h-3 bg-white/20 my-auto" />
                <button
                  onClick={(e) => { e.stopPropagation(); setShowTracklist(!showTracklist); }}
                  className={`p-1 rounded-full transition-all cursor-pointer ${showTracklist ? "text-[#d946ef] bg-purple-500/30 scale-110" : "text-white/70 hover:text-white hover:bg-white/10"}`}
                  title="Toggle Playlist"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Stylus Needle */}
            <div className={`absolute top-0 right-3 w-16 h-20 pointer-events-none transition-transform duration-500 origin-top-right ${isPlaying ? "rotate-[15deg]" : "rotate-0"}`}>
              <svg width="60" height="70" viewBox="0 0 60 70" fill="none">
                <path d="M50 5 L42 35 L20 55" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                <circle cx="50" cy="5" r="4" fill="#eab308" />
                <circle cx="20" cy="55" r="3" fill="white" />
              </svg>
            </div>

            {/* Bottom: Title + Waveform */}
            <div className="flex items-end justify-between pointer-events-auto">
              <div
                onClick={(e) => { e.stopPropagation(); setShowTracklist(!showTracklist); }}
                className="bg-white text-black rounded-lg px-2.5 py-1 shadow-md max-w-[155px] cursor-pointer hover:bg-purple-100 transition-colors"
              >
                <div className="text-[11px] font-black uppercase leading-tight flex items-center gap-1">
                  <span className="truncate">{currentAlbum.title}</span>
                  <span className="text-[8px] font-bold text-purple-600 bg-purple-100 px-1 rounded shrink-0">PLAYLIST ☰</span>
                </div>
                <div className="text-[8px] font-extrabold uppercase tracking-tight text-black/70 leading-none truncate mt-0.5">
                  {currentTrack.title}
                </div>
              </div>
              <div className="flex items-center gap-0.5 pb-0.5">
                <span className={`w-1 h-3 rounded-full bg-purple-400 ${isPlaying ? "animate-bounce" : ""}`} />
                <span className={`w-1 h-4 rounded-full bg-purple-400 ${isPlaying ? "animate-[bounce_0.6s_ease-in-out_infinite]" : ""}`} />
                <span className={`w-1 h-2 rounded-full bg-purple-400 ${isPlaying ? "animate-bounce" : ""}`} />
              </div>
            </div>
          </div>
        </div>

      </div>


      {/* ── TRACKLIST PANEL ── */}
      <div
        className={`flex flex-col text-left transition-all duration-500 ease-out origin-left z-20 self-center ${
          showTracklist
            ? "w-[220px] opacity-100 pointer-events-auto pl-4 border-l border-white/15"
            : "w-0 opacity-0 pointer-events-none overflow-hidden"
        }`}
      >
        <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/10 whitespace-nowrap">
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">
            {currentAlbum.title} TRACKLIST
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-white/40">{currentAlbum.tracks.length} SONGS</span>
            <button
              onClick={() => setShowTracklist(false)}
              className="text-white/50 hover:text-white text-xs font-bold px-1 rounded transition-colors cursor-pointer"
            >✕</button>
          </div>
        </div>
        <ol className="space-y-1 font-sans text-[11px] font-bold uppercase text-white/80 tracking-tight max-h-[200px] overflow-y-auto pr-2 whitespace-nowrap">
          {currentAlbum.tracks.map((track, tIdx) => {
            const isSelected = tIdx === activeTrackIdx;
            return (
              <li
                key={track.id}
                onClick={(e) => { e.stopPropagation(); playTrack(tIdx); }}
                className={`flex items-center gap-2 px-1.5 py-0.5 rounded cursor-pointer transition-all duration-200 ${
                  isSelected ? "text-purple-200 font-black bg-purple-500/15" : "hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-[9px] font-mono opacity-50 w-4 text-right">{track.number}.</span>
                <span className="truncate flex-1">{track.title}</span>
                {isSelected && isPlaying && <span className="w-1.5 h-1.5 rounded-full bg-[#d946ef] animate-pulse" />}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
