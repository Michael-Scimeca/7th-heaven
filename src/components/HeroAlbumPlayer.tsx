"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface LatestReleaseProps {
  release?: {
    title?: string;
    year?: string;
    duration?: string;
    type?: string;
    description?: string;
    youtubeId?: string;
    audioUrl?: string;
    buyLink?: string;
    spotifyLink?: string;
    appleMusicLink?: string;
  };
}

export default function HeroAlbumPlayer({ release }: LatestReleaseProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("3:45");
  const [audioError, setAudioError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fallback demo audio if no custom track uploaded
  const audioSrc = release?.audioUrl || "/audio/demo-track.mp3";
  const title = release?.title || "Pop Music";
  const year = release?.year || "2025";
  const type = release?.type || "Album";
  const youtubeId = release?.youtubeId || "i7dK9GCZOYo"; // Demo fallback

  const spotifyUrl = release?.spotifyLink || "https://open.spotify.com/artist/7thheaven";
  const appleMusicUrl = release?.appleMusicLink || "https://music.apple.com/us/artist/7th-heaven";
  const buyUrl = release?.buyLink || "/store";

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setAudioError(false);
      }).catch((err) => {
        console.warn("Audio autoplay blocked or file missing:", err);
        setAudioError(true);
        setIsPlaying(false);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 1;
    setProgress((cur / dur) * 100);

    const m = Math.floor(cur / 60);
    const s = Math.floor(cur % 60);
    setCurrentTime(`${m}:${s < 10 ? "0" : ""}${s}`);

    if (!isNaN(dur)) {
      const dm = Math.floor(dur / 60);
      const ds = Math.floor(dur % 60);
      setDuration(`${dm}:${ds < 10 ? "0" : ""}${ds}`);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newPct = parseFloat(e.target.value);
    const newTime = (newPct / 100) * (audioRef.current.duration || 1);
    audioRef.current.currentTime = newTime;
    setProgress(newPct);
  };

  return (
    <div className="w-full max-w-xl bg-black/75 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 md:p-6 shadow-[0_16px_50px_rgba(0,0,0,0.85)] relative overflow-hidden group">

      {/* Background Subtle Accent Glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-[var(--color-accent)]/20 rounded-full blur-3xl pointer-events-none group-hover:bg-[var(--color-accent)]/30 transition-all duration-700" />

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onError={() => setAudioError(true)}
      />

      {/* Header Tag */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
          <span className="text-[var(--font-size-3xs)] font-black uppercase tracking-[0.25em] text-[var(--color-accent)]">
            Latest Album & Track
          </span>
        </div>
        <span className="text-[var(--font-size-3xs)] font-extrabold uppercase tracking-widest text-white/40 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
          {type} · {year}
        </span>
      </div>

      {/* Main Track Row: Art + Title + Play Button */}
      <div className="flex items-center gap-4 mb-4">

        {/* Album Artwork with Play Overlay */}
        <div
          onClick={togglePlay}
          className="relative w-20 h-20 sm:w-24 sm:h-24 overflow-hidden border border-white/20 shrink-0 cursor-pointer group/art"
        >
          <Image
            src={youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : "/images/hero-banner.png"}
            alt={title}
            fill
            sizes="96px"
            className="object-cover group-hover/art:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/40 group-hover/art:bg-black/20 flex items-center justify-center transition-all">
            <div className={`w-10 h-10 rounded-full ${isPlaying ? 'bg-[var(--color-accent)]' : 'bg-white/90 text-black'} flex items-center justify-center shadow-xl transition-all group-hover/art:scale-110`}>
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              )}
            </div>
          </div>
        </div>

        {/* Info & Progress Bar */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-black text-lg sm:text-xl leading-tight truncate uppercase tracking-tight font-[family-name:var(--font-rockstar)]">
            {title}
          </h3>
          <p className="text-xs font-bold text-white/50 uppercase tracking-widest mt-0.5">
            7th Heaven
          </p>

          {/* Audio Progress Scrubber */}
          <div className="mt-3 space-y-1">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)] focus:outline-none"
            />
            <div className="flex justify-between text-[var(--font-size-3xs)] font-mono text-white/40">
              <span>{currentTime}</span>
              <span>{duration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform & Store Action Buttons */}
      <div className="pt-3 border-t border-white/10 grid grid-cols-3 gap-2">

        {/* Spotify Link */}
        <a
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[var(--color-brand-spotify)]/15 hover:bg-[var(--color-brand-spotify)]/30 border border-[#1DB954]/30 text-[#1DB954] hover:text-white text-[var(--font-size-3xs)] font-black uppercase tracking-wider transition-all shadow-[0_4px_12px_rgba(29,185,84,0.15)] group/btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 group-hover/btn:scale-110 transition-transform">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          <span className="truncate">Spotify</span>
        </a>

        {/* Apple Music Link */}
        <a
          href={appleMusicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[var(--color-brand-apple-music)]/15 hover:bg-[var(--color-brand-apple-music)]/30 border border-[#FC3C44]/30 text-[#FC3C44] hover:text-white text-[var(--font-size-3xs)] font-black uppercase tracking-wider transition-all shadow-[0_4px_12px_rgba(252,60,68,0.15)] group/btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 group-hover/btn:scale-110 transition-transform">
            <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043A5.022 5.022 0 0019.7.263C18.96.11 18.21.06 17.46.04a69.69 69.69 0 00-1.4-.03L6.06.01c-.5 0-1 .01-1.5.04C3.82.07 3.08.12 2.35.27a5.1 5.1 0 00-1.89.63A4.89 4.89 0 00.28 2.26a5.1 5.1 0 00-.23.55A9.13 9.13 0 000 5.87v12.26c.05.86.16 1.69.44 2.49.41 1.17 1.18 2.05 2.27 2.63.62.33 1.29.5 1.99.58.79.09 1.58.11 2.38.11h10.2c.67 0 1.34-.02 2-.07a7.54 7.54 0 001.64-.29 4.84 4.84 0 002.53-1.84 4.98 4.98 0 00.75-1.79c.22-.77.3-1.55.33-2.35.04-.68.04-1.36.04-2.04V8.16c0-.69-.01-1.37-.04-2.04zM16.87 17c0 .18-.03.36-.09.53a1.08 1.08 0 01-.83.7c-.32.06-.64.1-.96.14a2.72 2.72 0 01-.67-.01c-.57-.08-1.01-.44-1.13-1-.07-.3-.05-.6.03-.89.15-.54.56-.87 1.08-.99.26-.06.53-.1.79-.16.22-.05.34-.17.37-.4V10.6a.54.54 0 00-.02-.15.27.27 0 00-.22-.2c-.07-.02-.14-.02-.22-.01l-4.6.93c-.09.02-.18.04-.26.08-.12.06-.18.16-.19.29-.01.07-.01.14-.01.22v7.48c0 .26-.04.51-.13.75-.14.4-.43.66-.82.79-.29.1-.59.15-.89.18-.35.03-.69.03-1.03-.04-.59-.12-1-.51-1.12-1.1-.08-.37-.05-.74.08-1.09.18-.48.56-.78 1.04-.91.26-.07.52-.11.78-.17.2-.04.33-.16.36-.36.01-.07.01-.14.01-.21V8.6c0-.22.02-.43.07-.65a1.1 1.1 0 01.78-.83c.18-.06.37-.1.56-.13l5.33-1.08c.26-.05.52-.1.79-.12.36-.03.59.16.65.52.01.1.02.2.02.3V17z" />
          </svg>
          <span className="truncate">Apple Music</span>
        </a>

        {/* Buy / Store Link */}
        {buyUrl.startsWith("/") ? (
          <Link
            href={buyUrl}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[var(--font-size-3xs)] font-black uppercase tracking-wider transition-all shadow-md group/btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 group-hover/btn:scale-110 transition-transform">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="truncate">Buy Album</span>
          </Link>
        ) : (
          <a
            href={buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[var(--font-size-3xs)] font-black uppercase tracking-wider transition-all shadow-md group/btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 group-hover/btn:scale-110 transition-transform">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="truncate">Buy Album</span>
          </a>
        )}

      </div>
    </div>
  );
}
