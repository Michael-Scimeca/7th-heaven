/* eslint-disable react-doctor/no-giant-component */
"use client";
/* eslint-disable react-doctor/prefer-useReducer */

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
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
  storeUrl: string;
  tracks: Track[];
}

const ALBUMS: Album[] = [
  {
    id: "be-here",
    title: "BE HERE",
    subtitle: "POP MUSIC",
    year: "2021",
    coverImage: "/images/album/Be-Here.png",
    centerLabelColor: "#eab308",
    storeUrl: "/merch",
    tracks: [
      { id: "bh1", number: 1, title: "ARE WE THERE YET", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDElMjBBcmUlMjBXZSUyMFRoZXJlJTIwWWV0Lm1wMw==" },
      { id: "bh2", number: 2, title: "COME WHAT MAY", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDIlMjBDb21lJTIwV2hhdCUyME1heS5tcDM=" },
      { id: "bh3", number: 3, title: "FOR NEVER AND EVER", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDMlMjBGb3IlMjBOZXZlciUyMGFuZCUyMEV2ZXIubXAz" },
      { id: "bh4", number: 4, title: "SUNDRESSES", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDQlMjBTdW5kcmVzc2VzLm1wMw==" },
      { id: "bh5", number: 5, title: "AIN'T THAT JUST BEAUTIFUL", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDUlMjBBaW50JTIwVGhhdCUyMEp1c3QlMjBCZWF1dGlmdWwubXAz" },
      { id: "bh6", number: 6, title: "MONSTER", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDYlMjBNb25zdGVyLm1wMw==" },
      { id: "bh7", number: 7, title: "COUNTRY IN THE CITY", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDclMjBDb3VudHJ5JTIwSW4lMjBUaGUlMjBDaXR5Lm1wMw==" },
      { id: "bh8", number: 8, title: "I LOVE THESE DAYS", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDglMjBJJTIwTG92ZSUyMFRoZXNlJTIwRGF5cy5tcDM=" },
      { id: "bh9", number: 9, title: "INFINITY AND A DAY", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMDklMjBJbmZpbml0eSUyMEFuZCUyMEElMjBEYXkubXAz" },
      { id: "bh10", number: 10, title: "LEGENDS", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMTAlMjBMZWdlbmRzLm1wMw==" },
      { id: "bh11", number: 11, title: "GET BACK UP AGAIN", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMTElMjJHZXQlMjBCYWNrJTIwVXAlMjBBZ2Fpbi5tcDM=" },
      { id: "bh12", number: 12, title: "TAKE A RIDE OF LIFE", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMTIlMjJUYWtlJTIwQSUyMFJpZGUlMjBPZiUyMExpZmUubXAz" },
      { id: "bh13", number: 13, title: "SATURDAY NIGHT", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMTMlMjJTYXR1cmRheSUyME5pZ2h0Lm1wMw==" },
      { id: "bh14", number: 14, title: "I WANNA SEE YOU SHINE", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDElMjBCZSUyMEhlcmUvMTQlMjJJJTIwV2FubmElMjBTZWUlMjBZb3UlMjBTaGluZS5tcDM=" },
    ],
  },
  {
    id: "color-in-motion",
    title: "COLOR IN MOTION",
    subtitle: "7TH HEAVEN",
    year: "2018",
    coverImage: "/images/album/colot-in-motion.png",
    centerLabelColor: "#ec4899",
    storeUrl: "/merch",
    tracks: [
      { id: "cim1", number: 1, title: "THIS IS WHERE THE PARTY'S AT", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzAxJTIwVGhpcyUyMElzJTIwV2hlcmUlMjBUaGUlMjBQYXJ0eSUyN3MlMjBBdC5tcDM=" },
      { id: "cim2", number: 2, title: "WONDERFUL WORLD", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzAyJTIwV29uZGVyZnVsJTIwV29ybGQubXAz" },
      { id: "cim3", number: 3, title: "SAY IT ALREADY", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzAzJTIwU2F5JTIwSXQlMjBBbHJlYWR5Lm1wMw==" },
      { id: "cim4", number: 4, title: "TIME AND AGAIN", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzA0JTIwVGltZSUyMEFuZCUyMEFnYWluLm1wMw==" },
      { id: "cim5", number: 5, title: "BETTER LUCK NEXT TIME", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzA1JTIwQmV0dGVyJTIwTHVjayUyME5leHQlMjBUaW1lLm1wMw==" },
      { id: "cim6", number: 6, title: "I SEE YOU SMILE", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzA2JTIwSSUyMFNlZSUyMFlvdSUyMFNtaWxlLm1wMw==" },
      { id: "cim7", number: 7, title: "MAKE YOU LOVE ME", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzA3JTIwTWFrZSUyMFlvdSUyMExvdmUlMjBNZS5tcDM=" },
      { id: "cim8", number: 8, title: "HAPPY NOW", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzA4JTIwSGFwcHklMjJOb3cubXAz" },
      { id: "cim9", number: 9, title: "PICKING UP THE PIECES", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzA5JTIwUGlja2luZyUyMFVwJTIwVGhlJTIwUGllY2VzLm1wMw==" },
      { id: "cim10", number: 10, title: "CLOSEST THING", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDclMjBDb2xvciUyMEluJTIwTW90aW9uLzEwJTIwQ2xvc2VzdCUyMFRoaW5nLm1wMw==" },
    ],
  },
  {
    id: "luminous",
    title: "LUMINOUS",
    subtitle: "7TH HEAVEN",
    year: "2017",
    coverImage: "/images/album/luminous.png",
    centerLabelColor: "#8b5cf6",
    storeUrl: "/merch",
    tracks: [
      { id: "lu1", number: 1, title: "HOME", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wMSUyMEhvbWUubXAz" },
      { id: "lu2", number: 2, title: "BEAUTIFUL LIFE", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wMiUyMEJlYXV0aWZ1bCUyMExpZmUubXAz" },
      { id: "lu3", number: 3, title: "MIDWEST GIRL IN THE SUMMERTIME", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wMyUyME1pZHdlc3QlMjBHaXJsJTIwaW4lMjB0aGUlMjJTdW1tZXJ0aW1lLm1wMw==" },
      { id: "lu4", number: 4, title: "ALWAYS", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wNCUyMEFsd2F5cy5tcDM=" },
      { id: "lu5", number: 5, title: "IF YOU CHANGE YOUR MIND", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wNSUyMklmJTIwWW91JTIwQ2hhbmdlJTIwWW91ciUyME1pbmQubXAz" },
      { id: "lu6", number: 6, title: "CONTACT", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wNiUyMkNvbnRhY3QubXAz" },
      { id: "lu7", number: 7, title: "FORGET ABOUT ME", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wNyUyMkZvcmdldCUyMkFib3V0JTIyTWUubXAz" },
      { id: "lu8", number: 8, title: "EYES WIDE OPEN", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wOCUyMkV5ZXMlMjJXaWRlJTIyT3Blbi5tcDM=" },
      { id: "lu9", number: 9, title: "SO WONDERFUL", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8wOSUyMlNvJTIyV29uZGVyZnVsLm1wMw==" },
      { id: "lu10", number: 10, title: "SOS", duration: "3:30", audioUrl: "/api/audio?t=aHR0cHM6Ly83dGhoZWF2ZW5iYW5kLmNvbS93aW1weTcvMDklMjBMdW1pbm91cy8xMCUyMlNPUy5tcDM=" },
    ],
  },
];

/*--------------------
SoundWaveCanvas
--------------------*/
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
    if (!stateRef.current.isVisible || (typeof window !== "undefined" && (window as unknown as Record<string, boolean>).__pageTransitionActive)) {
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

    // settings: width:150, height:6, amplitude:-0.18, speed:5.7
    const targetH = isPlaying ? 6 : 0.8;
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
    ctx.strokeStyle = "#d946ef";
    ctx.lineWidth = 1.5;
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
      style={{ width: "24px", height: "24px", display: "block" }}
    />
  );
}


export default function VinylHeroPlayer({
  onAlbumChange,
}: {
  onAlbumChange?: (albumId: string) => void;
}) {
  const [activeAlbumIdx, setActiveAlbumIdx] = useState(0);
  const [activeTrackIdx, setActiveTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showTracklist, setShowTracklist] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [isDragging, setIsDragging] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [scale, setScale] = useState(1);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [bufferPercent, setBufferPercent] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const swiperRef = useRef<import("swiper").Swiper | null>(null);

  const updateBufferProgress = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.buffered.length > 0 && audio.duration > 0) {
      const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
      const pct = Math.min(100, Math.round((bufferedEnd / audio.duration) * 100));
      setBufferPercent(pct);
    }
  };

  /* eslint-disable react-doctor/effect-needs-cleanup */
  useEffect(() => {
    // Phase 1: Border box (.fancy) renders FIRST immediately on mount.
    // Phase 2: Albums & MP3 controls smoothly fade in when ready.
    const isPreloading = typeof document !== "undefined" && document.documentElement.classList.contains("is-preloading");
    const fallbackDelay = isPreloading ? 500 : 350;
    let preloaderDoneTimer: ReturnType<typeof setTimeout> | undefined;

    const timer = setTimeout(() => {
      setIsPlayerReady(true);
    }, fallbackDelay);

    const handlePreloaderDone = () => {
      preloaderDoneTimer = setTimeout(() => setIsPlayerReady(true), 150);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("7h-preloader-done", handlePreloaderDone);
    }

    return () => {
      clearTimeout(timer);
      if (preloaderDoneTimer) clearTimeout(preloaderDoneTimer);
      if (typeof window !== "undefined") {
        window.removeEventListener("7h-preloader-done", handlePreloaderDone);
      }
    };
  }, []);

  /* eslint-disable-next-line react-doctor/effect-needs-cleanup */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const update = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth < 768) {
          setScale(Math.max(0.45, (window.innerWidth - 40) / 740));
        } else {
          setScale(1);
        }
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Let the global cursor know when a track is actually playing, so it can
  // shrink into the "now playing" (X) badge — see CursorFollower.tsx's
  // "cursor:song-playing" window event listener.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("cursor:song-playing", { detail: isPlaying }));
    return () => {
      window.dispatchEvent(new CustomEvent("cursor:song-playing", { detail: false }));
    };
  }, [isPlaying]);

  // Auto-pause hero audio track when the viewer scrolls hero completely out of view
  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;

    const getHero = () => document.getElementById("hero") || document.querySelector(".morph-pick");
    const heroEl = getHero();
    if (!heroEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          const audio = audioRef.current;
          if (audio && !audio.paused) {
            audio.pause();
            setIsPlaying(false);
          }
        }
      },
      { threshold: 0 }
    );

    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  // Whenever the active album or track changes, reload the audio source IF actively playing.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const url = ALBUMS[activeAlbumIdx]?.tracks[activeTrackIdx]?.audioUrl;
    if (!url) return;

    if (isPlaying) {
      audio.src = url;
      audio.load();
      audio.play().catch(console.warn);
    }
  }, [activeAlbumIdx, activeTrackIdx, isPlaying]);

  useEffect(() => {
    const handleToggleHeroMusic = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (isPlaying || !audio.paused) {
        audio.pause();
        setIsPlaying(false);
      } else {
        if (!audio.src) {
          const url = ALBUMS[activeAlbumIdx]?.tracks[activeTrackIdx]?.audioUrl;
          if (url) audio.src = url;
        }
        audio.play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn("Hero audio play failed:", err);
            setIsPlaying(false);
          });
      }
    };
    window.addEventListener("7h-play-hero-music", handleToggleHeroMusic);
    window.addEventListener("7h-toggle-hero-music", handleToggleHeroMusic);
    return () => {
      window.removeEventListener("7h-play-hero-music", handleToggleHeroMusic);
      window.removeEventListener("7h-toggle-hero-music", handleToggleHeroMusic);
    };
  }, [activeAlbumIdx, activeTrackIdx, isPlaying]);

  const currentAlbum = ALBUMS[activeAlbumIdx];
  const currentTrack = currentAlbum.tracks[activeTrackIdx] || currentAlbum.tracks[0];

  const loadTrack = (trackIdx: number) => {
    const url = currentAlbum.tracks[trackIdx]?.audioUrl;
    if (!url) return;
    setActiveTrackIdx(trackIdx);
    setProgress(0);
    setCurrentTime("0:00");
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
    }
  };

  const playTrack = (trackIdx: number) => {
    const url = currentAlbum.tracks[trackIdx]?.audioUrl;
    if (!url) return;
    setActiveTrackIdx(trackIdx);
    setIsPlaying(true);
    setProgress(0);
    setCurrentTime("0:00");
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => { setIsPlaying(false); });
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying || !audio.paused) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!audio.src) {
        const url = ALBUMS[activeAlbumIdx]?.tracks[activeTrackIdx]?.audioUrl;
        if (url) audio.src = url;
      }
      audio.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Audio play failed:", err);
          setIsPlaying(false);
        });
    }
  };

  const prevTrack = () => {
    const idx = activeTrackIdx > 0 ? activeTrackIdx - 1 : currentAlbum.tracks.length - 1;
    if (isPlaying) {
      playTrack(idx);
    } else {
      loadTrack(idx);
    }
  };

  const nextTrack = () => {
    const idx = activeTrackIdx < currentAlbum.tracks.length - 1 ? activeTrackIdx + 1 : 0;
    if (isPlaying) {
      playTrack(idx);
    } else {
      loadTrack(idx);
    }
  };

  const handleSlideChange = (swiper: SwiperType) => {
    const newIdx = typeof swiper.activeIndex === 'number' ? swiper.activeIndex : swiper.realIndex;
    if (newIdx !== undefined && newIdx !== activeAlbumIdx) {
      setActiveAlbumIdx(newIdx);
      setActiveTrackIdx(0);
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime("0:00");
      setDuration("0:00");
      const albumId = ALBUMS[newIdx]?.id ?? "";
      onAlbumChange?.(albumId);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("7h-album-change", { detail: { albumId } }));
      }
      if (audioRef.current) {
        audioRef.current.pause();
        const url = ALBUMS[newIdx]?.tracks[0]?.audioUrl;
        if (url) {
          audioRef.current.src = url;
          audioRef.current.load();
        }
      }
    }
    setIsDragging(false);
  };

  const goToAlbum = (idx: number) => {
    const clamped = Math.max(0, Math.min(ALBUMS.length - 1, idx));
    swiperRef.current?.slideTo(clamped);
    setActiveAlbumIdx(clamped);
    setActiveTrackIdx(0);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime("0:00");
    setDuration("0:00");
    const albumId = ALBUMS[clamped]?.id ?? "";
    onAlbumChange?.(albumId);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("7h-album-change", { detail: { albumId } }));
    }
    if (audioRef.current) {
      audioRef.current.pause();
      const url = ALBUMS[clamped]?.tracks[0]?.audioUrl;
      if (url) { audioRef.current.src = url; audioRef.current.load(); }
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    const durKnown = isFinite(dur) && !isNaN(dur) && dur > 0;
    if (durKnown) setProgress((cur / dur) * 100);
    setCurrentTime(fmt(cur));
    setDuration(durKnown ? fmt(dur) : "0:00");
  };

  // Fire as soon as the browser knows the duration — before the user presses play
  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    const dur = audioRef.current.duration;
    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    if (isFinite(dur) && !isNaN(dur) && dur > 0) setDuration(fmt(dur));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const pct = parseFloat(e.target.value);
    const dur = audioRef.current.duration || 0;
    audioRef.current.currentTime = (pct / 100) * dur;
    setProgress(pct);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const unscaledWidth = 740;
  const unscaledHeight = 315; // Height to cover header text + 250px sleeve + margin

  return (
    <div
      className="relative flex justify-end items-end"
      style={{
        width: scale < 1 ? `${unscaledWidth * scale}px` : `${unscaledWidth}px`,
        height: scale < 1 ? `${unscaledHeight * scale}px` : `${unscaledHeight}px`,
      }}
    >
      <div
        className="absolute right-0 bottom-0 select-none"
        style={{
          width: `${unscaledWidth}px`,
          height: `${unscaledHeight}px`,
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: "bottom right",
        }}
      >
        {/* Hidden Audio — src managed imperatively via useEffect/playTrack, NOT via React src= prop */}
        <audio
          ref={audioRef}
          preload="auto"
          onTimeUpdate={() => { handleTimeUpdate(); updateBufferProgress(); }}
          onProgress={updateBufferProgress}
          onLoadedMetadata={() => { handleLoadedMetadata(); updateBufferProgress(); }}
          onEnded={nextTrack}
          onWaiting={() => setIsBuffering(true)}
          onLoadStart={() => setIsBuffering(true)}
          onCanPlay={() => { setIsBuffering(false); updateBufferProgress(); }}
          onPlaying={() => setIsBuffering(false)}
          onPause={() => setIsBuffering(false)}
          onError={() => setIsBuffering(false)}
        >
          <track kind="captions" />
        </audio>

        {/* ── SWIPER VINYL DISC SLIDER ── */}
        <div
          className="vinyl-slider-wrap"
          style={{
            width: '600px',
            height: '250px',
            position: 'relative',
          }}
        >
          <div className="relative" style={{ width: '600px' }}>
            {/* Header Title Above Player Box */}
            <div className="absolute -top-7 left-[calc(50%-125px)] w-[250px] flex items-center justify-between pointer-events-none z-30 px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d946ef] animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/90 drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]">
                  Listen To Our Hits
                </span>
              </div>
              <span className="text-[8px] font-bold tracking-wider text-white/40 uppercase">
                3 Latest Albums
              </span>
            </div>

            {/* LAYER 1: Sleeve card background — sits BEHIND the disc — LOADS IMMEDIATELY ON PAGE LOAD */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[-1]">
              <div className="fancy w-[250px] h-[250px] rounded-2xl shadow-[0_0_40px_rgba(147,51,234,0.25)]">
                <div className="fancy-inner flex items-center justify-center">
                  {!isPlayerReady && (
                    <div className="flex flex-col items-center gap-2 opacity-60 animate-pulse">
                      <div className="w-7 h-7 rounded-full border-2 border-purple-400/40 border-t-purple-400 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* LAYER 2 & 3: Vinyl disc track & Controls overlay — REVEALED SMOOTHLY ONCE READY */}
            <div
              className={`transition-all duration-700 ease-out ${
                isPlayerReady
                  ? "opacity-100 scale-100 blur-0 pointer-events-auto"
                  : "opacity-0 scale-95 blur-xs pointer-events-none"
              }`}
            >
              {/* LAYER 2: Swiper disc track — wrapped in fade mask so side discs dissolve */}
              <div style={{
                WebkitMaskImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.3) 0%, black 10%, black 100%)',
                maskImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.3) 0%, black 10%, black 100%)',
              }}>
                <Swiper
                  slidesPerView="auto"
                  centeredSlides={true}
                  loop={false}
                  initialSlide={activeAlbumIdx}
                  spaceBetween={0}
                  grabCursor={true}
                  onSwiper={(swiper) => { swiperRef.current = swiper; }}
                  onSlideChange={handleSlideChange}
                  onSliderFirstMove={() => setIsDragging(true)}
                  onTouchEnd={() => setIsDragging(false)}
                  style={{ overflow: "visible", position: "relative", zIndex: 20 }}
                  className="vinyl-swiper"
                >
                  {ALBUMS.map((album, idx) => (
                    <SwiperSlide
                      key={album.id}
                      style={{ width: "165px", height: "250px", display: "flex", alignItems: "center" }}
                    >

                      {({ isActive }) => {
                        const vinylSrc = `/vin${(idx % 3) + 1}.png`;
                        return (
                          <button
                            type="button"
                            className={`relative rounded-full flex items-center justify-center mx-auto transition-opacity duration-0 overflow-hidden cursor-pointer border-0 p-0 bg-transparent ${isActive && !isDragging
                              ? "opacity-100 scale-110 z-10 shadow-[0_0_40px_rgba(234,179,8,0.5)]"
                              : "opacity-90 scale-90 z-0"
                              } ${isActive ? "vinyl-spinning" : ""}`}
                            style={{
                              width: "165px",
                              height: "165px",
                              animationPlayState: isActive ? (isPlaying ? "running" : "paused") : undefined,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isActive) {
                                togglePlay();
                              } else {
                                // Switch to this album and auto-play first track
                                goToAlbum(idx);
                                playTrack(0);
                              }
                            }}
                          >
                            {/* Real vinyl disc image */}
                            <Image
                              src={vinylSrc}
                              alt={`${album.title} vinyl`}
                              fill
                              sizes="165px"
                              className="object-cover rounded-full"
                            />
                            {/* Center label with album art — sits on top of the vinyl image */}
                            <div className="relative z-10 flex items-center justify-center">
                              <div
                                className="relative w-[60px] h-[60px] rounded-full overflow-hidden border-2 border-purple-400 shadow-[0_0_12px_rgba(234,179,8,0.6)]"
                                style={{ backgroundColor: album.centerLabelColor }}
                              >
                                <Image src={album.coverImage} alt={album.title} fill sizes="60px" className="object-cover brightness-110 contrast-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col items-center justify-end pb-1.5 text-center">
                                  <span className="text-[var(--font-size-5xs)]  font-bold  text-white uppercase tracking-tighter leading-none">{album.title}</span>
                                  <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.9)] border border-black/60 mt-0.5" />
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      }}
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* LAYER 3: Controls overlay — z-30, floats ABOVE the disc */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                <div className="relative w-[250px] h-[250px] flex flex-col justify-between p-4 pointer-events-none">

                  {/* Top Controls */}
                  <div className="flex items-center justify-center pointer-events-auto ">
                    <div className="flex items-center gap-2 bg-black /60  backdrop-blur-[45px] px-2.5 py-1 rounded-full border border-white/15 shadow w-full">
                      <button aria-label="Previous" onClick={(e) => { e.stopPropagation(); prevTrack(); }} className="text-white/70 hover:text-white transition-colors cursor-pointer" title="Previous Track">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="11 19 2 12 11 5 11 19" /><polygon points="22 19 13 12 22 5 22 19" /></svg>
                      </button>
                      <button aria-label="Action button" onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform cursor-pointer    " title={isBuffering ? "Loading MP3..." : isPlaying ? "Pause" : "Play"}>
                        {isBuffering ? (
                          <span className="w-3.5 h-3.5 border-2 border-[#d946ef] border-t-transparent rounded-full animate-spin" />
                        ) : isPlaying ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        )}
                      </button>
                      <button aria-label="Next" onClick={(e) => { e.stopPropagation(); nextTrack(); }} className="text-white/70 hover:text-white transition-colors cursor-pointer" title="Next Track">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 19 22 13 13 5 13 19" /><polygon points="22 19 13 12 22 5 22 19" /></svg>
                      </button>
                      <div className="w-[1px] h-3 bg-white/20 my-auto" />
                      <button aria-label="Toggle Playlist"
                        onClick={(e) => { e.stopPropagation(); setShowTracklist((prev) => !prev); }}
                        className={`p-1 rounded-full transition-colors cursor-pointer ${showTracklist ? "text-[#d946ef] bg-[var(--color-accent)]/30 scale-110" : "text-white/70 hover:text-white hover:bg-white/10"}`}
                        title="Toggle Playlist"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                          <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                      </button>
                      <div className="w-[1px] h-3 bg-white/20 my-auto" />
                      {/* Volume */}
                      <button
                        type="button"
                        aria-label="Toggle mute"
                        onClick={(e) => {
                          e.stopPropagation();
                          const nv = volume > 0 ? 0 : 1;
                          setVolume(nv);
                          if (audioRef.current) audioRef.current.volume = nv;
                        }}
                        className="bg-transparent border-0 p-0  text-white  hover:text-white transition-colors cursor-pointer shrink-0"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          {volume === 0
                            ? <path d="M11 5L6 9H2v6h4l5 4V5z M23 9l-6 6M17 9l6 6" />
                            : volume < 0.5
                              ? <><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" fill="none" /></>
                              : <><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" fill="none" /></>}
                        </svg>
                      </button>
                      {/* Expanded Volume Slider with Mouse Wheel support */}
                      <div
                        className="relative w-24 h-4 flex items-center cursor-pointer group"
                        onClick={(e) => e.stopPropagation()}
                        onWheel={(e) => {
                          e.stopPropagation();
                          const delta = e.deltaY < 0 ? 0.05 : -0.05;
                          const nv = Math.min(1, Math.max(0, volume + delta));
                          setVolume(nv);
                          if (audioRef.current) audioRef.current.volume = nv;
                        }}
                      >
                        {/* Track Background */}
                        <div className="h-1.5 w-full bg-white/10 group-hover:bg-white/20 rounded-full overflow-hidden border border-white/10  backdrop-blur-[45px] transition-all duration-200">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-[#d946ef] rounded-full shadow-[0_0_8px_rgba(217,70,239,0.8)]"
                            style={{ width: `${Math.min(100, Math.max(0, volume * 100))}%` }}
                          />
                        </div>
                        {/* Glowing Thumb Handle */}
                        <div
                          className="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#d946ef] shadow-[0_0_8px_#d946ef] scale-90 group-hover:scale-125 transition-transform duration-150 pointer-events-none"
                          style={{ left: `${Math.min(100, Math.max(0, volume * 100))}%` }}
                        />
                        {/* Invisible Native Input for 100% accessible volume control */}
                        <input
                          aria-label="Volume slider"
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={volume}
                          onChange={(e) => {
                            const nv = parseFloat(e.target.value);
                            setVolume(nv);
                            if (audioRef.current) audioRef.current.volume = nv;
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Title + Waveform */}
                  <div className="flex items-end justify-between pointer-events-none mt-auto">
                    <div className="flex flex-col gap-1 pointer-events-auto">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowTracklist((prev) => !prev); }}
                        className="text-left border-0 bg-white text-black rounded-lg px-3 py-1 shadow-md min-w-[130px] cursor-pointer"
                      >
                        <div className="text-[9px]  font-bold  uppercase leading-tight flex items-center gap-1">
                          <span className="truncate">{currentAlbum.title}</span>
                          {isBuffering ? (
                            <span className="text-[9px] font-bold text-[#d946ef] bg-[#d946ef]/15 border border-[#d946ef]/30 px-1.5 py-0.5 rounded-full animate-pulse shrink-0 flex items-center gap-1">
                              <span className="w-2 h-2 border border-[#d946ef] border-t-transparent rounded-full animate-spin" />
                              LOADING {bufferPercent > 0 ? `${bufferPercent}%` : "SONG"}
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-0.5 rounded shrink-0">PLAYLIST</span>
                          )}
                        </div>
                        <div className="text-[10px] font-extrabold uppercase tracking-tight text-black/70 leading-none truncate mt-0.5">
                          {currentTrack.title}
                        </div>
                      </button>
                      {/* BUY CD button */}
                      <Link
                        href={currentAlbum.storeUrl}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 bg-[var(--color-accent)] hover:bg-[#851de7] text-white text-[8.5px]  font-bold  uppercase tracking-wider px-4 py-2 rounded-full   transition-colors hover:scale-105 w-fit"
                      >
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" /></svg>
                        Buy CD
                      </Link>
                    </div>
                    <SoundWaveCanvas isPlaying={isPlaying} />
                  </div>

                  {/* Progress Scrubber — pinned to very bottom */}
                  <div className="pointer-events-auto px-1 mt-2">
                    <div className="relative w-full h-4 flex items-center cursor-pointer group">
                      {/* Track Background */}
                      <div className="h-1.5 w-full bg-white/10 group-hover:bg-white/20 rounded-full overflow-hidden border border-white/10  backdrop-blur-[45px] transition-all duration-200">
                        {/* Filled Progress Gradient Bar */}
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-[#d946ef] rounded-full shadow-[0_0_10px_rgba(217,70,239,0.8)]"
                          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        />
                      </div>
                      {/* Glowing Thumb Handle */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 rounded-full bg-white border-2 border-[#d946ef] shadow-[0_0_12px_#d946ef] scale-90 group-hover:scale-125 transition-transform duration-150 pointer-events-none"
                        style={{ left: `${Math.min(100, Math.max(0, progress))}%` }}
                      />
                      {/* Invisible Native Input for 100% accessible dragging/seeking */}
                      <input
                        aria-label="Seek audio position"
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={progress}
                        onChange={handleSeek}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                    </div>
                    <div className="flex justify-between text-[var(--font-size-3xs)] font-mono  text-white  mt-0.5">
                      <span>{currentTime}</span>
                      <span>{duration}</span>
                    </div>
                  </div>

                  {/* Album nav arrows */}
                  <div className="absolute bottom-2 left-0 right-0 flex items-center justify-between px-2 pointer-events-auto">
                    <button aria-label="Previous"
                      onClick={(e) => { e.stopPropagation(); goToAlbum(activeAlbumIdx - 1); }}
                      disabled={activeAlbumIdx === 0}
                      className="flex items-center gap-0.5  text-white  hover:text-white disabled:opacity-20 transition-colors text-[9px]  font-bold  uppercase tracking-wider cursor-pointer bg-black/40 hover:bg-black/60 px-2 py-1 rounded-full"
                      title="Previous Album"
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><polygon points="15 18 9 12 15 6 15 18" /></svg>
                      Album
                    </button>
                    <span className="text-[8px] text-white/40 font-bold">{activeAlbumIdx + 1} / {ALBUMS.length}</span>
                    <button aria-label="Next"
                      onClick={(e) => { e.stopPropagation(); goToAlbum(activeAlbumIdx + 1); }}
                      disabled={activeAlbumIdx === ALBUMS.length - 1}
                      className="flex items-center gap-0.5  text-white  hover:text-white disabled:opacity-20 transition-colors text-[9px]  font-bold  uppercase tracking-wider cursor-pointer bg-black/40 hover:bg-black/60 px-2 py-1 rounded-full"
                      title="Next Album"
                    >
                      Album
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><polygon points="9 18 15 12 9 6 9 18" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* ── TRACKLIST PANEL — anchored right of the 270px center card ── */}
            <div
              className={`absolute top-0 bottom-0 flex flex-col text-left transition-colors duration-500 ease-out origin-left z-40 ${showTracklist
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
                }`}
              style={{ left: 'calc(50% + 195px)', width: showTracklist ? '220px' : '0px', overflow: 'hidden' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pl-3 border-l border-white/15 h-full flex flex-col justify-center">
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-white/10 whitespace-nowrap">
                  <span className="text-[9px]  font-bold  uppercase tracking-wider  text-[var(--color-accent)]">
                    {currentAlbum.title} TRACKLIST
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] font-bold text-white/40">{currentAlbum.tracks.length} SONGS</span>
                    <button aria-label="Action button"
                      onClick={() => setShowTracklist(false)}
                      className="text-white/50 hover:text-white text-[10px] font-bold px-1 rounded transition-colors cursor-pointer"
                    >✕</button>
                  </div>
                </div>
                <ol
                  className="custom-purple-scrollbar space-y-0.5 font-sans text-[10px] font-bold uppercase text-white/80 tracking-tight max-h-[190px] overflow-y-auto pr-1.5 whitespace-nowrap"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  {currentAlbum.tracks.map((track, tIdx) => {
                    const isSelected = tIdx === activeTrackIdx;
                    return (
                      <li key={track.id}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); playTrack(tIdx); }}
                          className={`w-full text-left border-0 bg-transparent flex items-center gap-1.5 px-1 py-0.5 rounded transition-colors duration-200 ${isSelected ? "text-[var(--color-accent)] font-bold bg-[var(--color-accent)]/15 cursor-default" : "hover:text-white hover:bg-[#e1e6ff29] cursor-pointer"
                            }`}
                        >
                          <span className="text-[8px] font-mono opacity-50 w-3.5 text-right">{track.number}.</span>
                          <span className="truncate flex-1 text-[10px]">{track.title}</span>
                          {isSelected && isPlaying && <span className="w-1.5 h-1.5 rounded-full bg-[#d946ef] animate-pulse" />}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>

          </div>
        </div>
      </div >
    </div >
  );
}
